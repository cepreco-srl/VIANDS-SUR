"""
services/script_service.py — Generación del "Script de Poder" de negociación.

Usa GPT-4o (texto, no Vision) para producir un mensaje personalizado y
psicológicamente optimizado que el usuario puede copiar y pegar en WhatsApp
o en el chat de soporte de su proveedor para pedir una rebaja.

Flujo:
  1. Se selecciona el prompt (whatsapp o chat) según el canal solicitado.
  2. Los datos de la factura y la mejor alternativa se pasan como texto
     plano en el mensaje de usuario, para que GPT-4o los integre de forma
     natural en el script sin que queden placeholders visibles.
  3. GPT-4o responde con texto libre (no JSON): el script listo para copiar.
  4. Se calculan ahorro y tip, y se arma el dict de respuesta.
"""

import logging
import os
from pathlib import Path

import openai
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# ── Carga de prompts al importar el módulo ────────────────────────────────────
_PROMPTS_DIR = Path(__file__).parent.parent / "prompts"

def _cargar_prompt(nombre: str) -> str:
    path = _PROMPTS_DIR / nombre
    try:
        return path.read_text(encoding="utf-8")
    except FileNotFoundError:
        logger.error("Prompt no encontrado: %s", path)
        return ""

PROMPT_WHATSAPP = _cargar_prompt("script_whatsapp.txt")
PROMPT_CHAT = _cargar_prompt("script_chat.txt")

# ── Tips estáticos por canal ──────────────────────────────────────────────────
# No requieren IA: son consejos operativos fijos que siempre aplican.
_TIPS = {
    "whatsapp": (
        "Enviá el mensaje entre las 10hs y las 16hs de un día hábil: "
        "es cuando el área de Retención tiene más operadores disponibles."
    ),
    "chat": (
        "Si el primer agente dice que no puede hacer nada, pedí expresamente "
        "que te transfieran al área de Retención antes de cerrar el chat."
    ),
}


# ── Función principal ─────────────────────────────────────────────────────────
async def generate_script(
    datos_factura: dict,
    mejor_alternativa: dict,
    canal: str,
    confianza: str | None = None,
    campos_dudosos: list[str] | None = None,
) -> dict:
    """
    Genera el script de negociación personalizado para el canal indicado.

    Args:
        datos_factura: Datos extraídos de la factura (proveedor, plan, precio, etc.)
        mejor_alternativa: La mejor oferta de la competencia (proveedor, plan, precio).
        canal: "whatsapp" o "chat".
        confianza: Nivel de confianza del OCR ("alta", "media", "baja").
        campos_dudosos: Lista de campos con baja certeza del OCR.

    Returns:
        dict con: script, ahorro_mensual, porcentaje_ahorro, tip, canal,
        y opcionalmente "advertencia" si la confianza fue baja.
    """
    # Seleccionamos el system prompt según el canal
    system_prompt = PROMPT_WHATSAPP if canal == "whatsapp" else PROMPT_CHAT

    # ── Construcción del mensaje de usuario ───────────────────────────────────
    # Pasamos los datos como texto plano para que GPT-4o los integre
    # de forma natural en el script sin que queden marcas visibles.
    proveedor_actual = datos_factura.get("proveedor", "el proveedor actual")
    plan_actual = datos_factura.get("plan") or "el plan contratado"
    precio_actual = datos_factura.get("total_con_impuestos", 0)
    descuento_vencido = datos_factura.get("descuento_vencido", False)

    competidor = mejor_alternativa.get("proveedor", "un competidor")
    plan_competidor = mejor_alternativa.get("plan", "plan similar")
    precio_competidor = mejor_alternativa.get("precio_oferta", 0)

    ahorro_mensual = precio_actual - precio_competidor
    porcentaje_ahorro = round((ahorro_mensual / precio_actual) * 100) if precio_actual > 0 else 0

    descuento_linea = (
        "Descuento o promoción vencida: Sí, la bonificación que tenía ya venció y el precio subió."
        if descuento_vencido
        else "Descuento o promoción vencida: No."
    )

    user_message = f"""Generá el script de negociación con exactamente estos datos:

SITUACIÓN ACTUAL DEL CLIENTE:
Proveedor actual: {proveedor_actual}
Plan actual: {plan_actual}
Lo que paga por mes (con impuestos): ${precio_actual:,}
{descuento_linea}

MEJOR ALTERNATIVA DISPONIBLE EN EL MERCADO:
Competidor: {competidor}
Plan: {plan_competidor}
Precio de oferta: ${precio_competidor:,}/mes
Ahorro mensual potencial: ${ahorro_mensual:,} ({porcentaje_ahorro}% menos que lo que paga ahora)

INSTRUCCIÓN: Usá exactamente estos valores en el script. No redondees ni cambies los precios."""

    # ── Llamada a GPT-4o (texto, no Vision) ──────────────────────────────────
    client = openai.AsyncOpenAI(api_key=OPENAI_API_KEY)

    try:
        logger.info(
            "Generando script canal=%s proveedor=%s competidor=%s ahorro=%d%%",
            canal, proveedor_actual, competidor, porcentaje_ahorro,
        )
        response = await client.chat.completions.create(
            model="gpt-4o",
            # temperature más alta que el OCR: queremos variación natural,
            # no la respuesta más determinista
            temperature=0.7,
            max_tokens=800,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
        )
    except openai.APIError as exc:
        logger.error(
            "Error de OpenAI al generar script: %s — status=%s",
            exc.message,
            getattr(exc, "status_code", "N/A"),
        )
        # Re-usamos la misma excepción que ocr_service para consistencia
        from services.ocr_service import OpenAIServiceError
        raise OpenAIServiceError(
            "La API de OpenAI no está disponible en este momento.", original=exc
        ) from exc

    script_texto = (response.choices[0].message.content or "").strip()
    logger.info("Script generado — canal=%s longitud=%d chars", canal, len(script_texto))

    # ── Armado de la respuesta ────────────────────────────────────────────────
    resultado = {
        "script": script_texto,
        "ahorro_mensual": ahorro_mensual,
        "porcentaje_ahorro": porcentaje_ahorro,
        "tip": _TIPS.get(canal, _TIPS["whatsapp"]),
        "canal": canal,
    }

    # Si el OCR tuvo baja confianza, advertimos al usuario que revise los datos
    # antes de enviar el script (los precios podrían estar mal extraídos)
    if confianza == "baja" and campos_dudosos:
        campos_str = ", ".join(campos_dudosos)
        resultado["advertencia"] = (
            f"Revisá los datos antes de enviar: detectamos incertidumbre en {campos_str}. "
            f"Corroborá los montos mirando tu factura original."
        )

    return resultado
