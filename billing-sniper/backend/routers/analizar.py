"""
routers/analizar.py — Endpoint POST /analizar-y-generar.

El endpoint "todo en uno" que simplifica el frontend al máximo:
recibe una imagen de factura en base64 y devuelve en una sola
respuesta los datos extraídos, la comparación de precios y los
dos scripts de negociación (WhatsApp y Chat).

Flujo interno:
  1. OCR via GPT-4o Vision → extrae datos de la factura
  2. Normalización → convierte nombre de proveedor a clave del JSON
  3. Comparación → busca la mejor alternativa en precios_referencia.json
  4. Generación en paralelo → ambos scripts usando asyncio.gather
"""

import asyncio
import logging
import re

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from services.ocr_service import OpenAIServiceError, extract_invoice_data
from services import precios_service, script_service

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Análisis"])

# ── Normalización de nombres de proveedor ─────────────────────────────────────
# El OCR devuelve el nombre como aparece en la factura (display name).
# precios_service necesita la clave interna del JSON (minúsculas, sin espacios).
_PROVEEDOR_MAP: dict[str, str] = {
    "fibertel": "fibertel",
    "personal": "fibertel",          # Fibertel y Personal comparten key
    "fibertel / personal": "fibertel",
    "telecentro": "telecentro",
    "claro": "claro",
    "movistar": "movistar",
    "cablevision": "cablevision",
    "directv": "directv",
}


def _normalizar_proveedor(nombre: str) -> str | None:
    """
    Convierte el nombre de proveedor del OCR a la clave interna del JSON.
    Retorna None si no se reconoce el proveedor.
    """
    return _PROVEEDOR_MAP.get(nombre.lower().strip())


def _extraer_velocidad(plan: str | None) -> int | None:
    """
    Extrae la velocidad en Mbps desde el nombre del plan.
    Ejemplos: "100MB Fibra" → 100, "Plan 300 MB" → 300, "50Mbps" → 50.
    Retorna None si no se puede parsear.
    """
    if not plan:
        return None
    match = re.search(r'(\d+)\s*[Mm][Bb]', plan)
    return int(match.group(1)) if match else None


# ── Modelos ───────────────────────────────────────────────────────────────────

class AnalizarRequest(BaseModel):
    image: str  # Base64 de la imagen de la factura


# ── Endpoint ──────────────────────────────────────────────────────────────────

@router.post("/analizar-y-generar")
async def analizar_y_generar(request: AnalizarRequest):
    """
    Analiza una factura y genera los scripts de negociación en una sola llamada.

    Body (JSON):
        image (str): Imagen de la factura en base64.

    Returns:
        200 — Datos completos: factura, mejor alternativa, ahorro y ambos scripts.
        422 — La imagen no es una factura reconocible.
        503 — La API de OpenAI no está disponible.
    """

    # ── Paso 1: OCR ───────────────────────────────────────────────────────────
    try:
        datos_factura = await extract_invoice_data(request.image)
    except OpenAIServiceError as exc:
        logger.error("OCR falló en analizar-y-generar: %s", exc)
        return JSONResponse(
            status_code=503,
            content={
                "error": "openai_unavailable",
                "mensaje": "El servicio de IA no está disponible en este momento. Intentá de nuevo en unos minutos.",
            },
        )
    except ValueError as exc:
        logger.error("Parse error en OCR: %s", exc)
        return JSONResponse(
            status_code=502,
            content={
                "error": "parse_error",
                "mensaje": "El servicio de IA devolvió una respuesta inesperada. Intentá con otra imagen.",
            },
        )

    if datos_factura.get("error") == "no_es_factura":
        return JSONResponse(status_code=422, content=datos_factura)

    # ── Paso 2: Normalización ─────────────────────────────────────────────────
    proveedor_display = datos_factura.get("proveedor", "")
    proveedor_key = _normalizar_proveedor(proveedor_display)

    precio_actual = datos_factura.get("total_con_impuestos") or 0
    velocidad = _extraer_velocidad(datos_factura.get("plan"))

    # Si no podemos mapear el proveedor o extraer la velocidad,
    # devolvemos los datos del OCR con una advertencia pero sin romper
    advertencias = []
    if not proveedor_key:
        logger.warning("Proveedor no reconocido: '%s'", proveedor_display)
        advertencias.append(f"Proveedor '{proveedor_display}' no está en nuestra base de comparación.")

    if velocidad is None:
        logger.warning("No se pudo extraer velocidad del plan: '%s'", datos_factura.get("plan"))
        velocidad = 100  # Fallback razonable: 100MB es el plan más común
        advertencias.append("No pudimos detectar la velocidad del plan; asumimos 100MB para la comparación.")

    # ── Paso 3: Comparación de precios ────────────────────────────────────────
    comparacion = {}
    if proveedor_key and precio_actual > 0:
        comparacion = precios_service.comparar(
            proveedor_actual=proveedor_key,
            velocidad_mbps=velocidad,
            precio_actual=precio_actual,
        )

    # Si no hay alternativas disponibles, devolvemos lo que tenemos sin script
    if not comparacion or "mensaje" in comparacion or "mejor_alternativa" not in comparacion:
        respuesta_parcial = {
            "datos_factura": datos_factura,
            "comparacion": comparacion,
            "mensaje": "No encontramos alternativas para comparar en este momento.",
        }
        if advertencias:
            respuesta_parcial["advertencias"] = advertencias
        return respuesta_parcial

    mejor_alternativa = comparacion["mejor_alternativa"]

    # ── Paso 4: Generación de ambos scripts en paralelo ───────────────────────
    # Usamos asyncio.gather para no duplicar la latencia de dos llamadas a GPT-4o
    confianza = datos_factura.get("confianza")
    campos_dudosos = datos_factura.get("campos_dudosos", [])

    try:
        whatsapp_result, chat_result = await asyncio.gather(
            script_service.generate_script(
                datos_factura=datos_factura,
                mejor_alternativa=mejor_alternativa,
                canal="whatsapp",
                confianza=confianza,
                campos_dudosos=campos_dudosos,
            ),
            script_service.generate_script(
                datos_factura=datos_factura,
                mejor_alternativa=mejor_alternativa,
                canal="chat",
                confianza=confianza,
                campos_dudosos=campos_dudosos,
            ),
        )
    except OpenAIServiceError as exc:
        logger.error("OpenAI falló al generar scripts: %s", exc)
        return JSONResponse(
            status_code=503,
            content={
                "error": "openai_unavailable",
                "mensaje": "El servicio de IA no está disponible en este momento. Intentá de nuevo en unos minutos.",
            },
        )

    # ── Armado de la respuesta final ──────────────────────────────────────────
    respuesta = {
        "datos_factura": datos_factura,
        "mejor_alternativa": mejor_alternativa,
        "ahorro_mensual": comparacion["ahorro_mensual"],
        "porcentaje_ahorro": comparacion["porcentaje_ahorro"],
        "scripts": {
            "whatsapp": whatsapp_result["script"],
            "chat": chat_result["script"],
        },
        # Usamos el tip del canal WhatsApp como tip principal del análisis completo
        "tip": whatsapp_result["tip"],
    }

    # Incluir advertencia si el OCR tuvo baja confianza
    if confianza == "baja" and campos_dudosos:
        campos_str = ", ".join(campos_dudosos)
        respuesta["advertencia"] = (
            f"Revisá los datos antes de enviar: detectamos incertidumbre en {campos_str}. "
            f"Corroborá los montos mirando tu factura original."
        )

    if advertencias:
        respuesta["advertencias_proceso"] = advertencias

    return respuesta
