"""
ocr_service.py — Lógica de llamada a GPT-4o Vision para extracción de datos de facturas.

Flujo:
  1. Cargamos el prompt desde el archivo .txt al importar el módulo (una sola vez).
  2. extract_invoice_data() recibe la imagen en base64, la envía a GPT-4o
     como data URI y parsea el JSON de respuesta.
  3. Si GPT-4o responde con JSON inválido o la API falla, se lanzan excepciones
     específicas para que el router pueda devolver el código HTTP adecuado.
"""

import json
import logging
import os
from pathlib import Path

import openai
from dotenv import load_dotenv

# ── Configuración de logging ─────────────────────────────────────────────────
logger = logging.getLogger(__name__)

# ── Variables de entorno ──────────────────────────────────────────────────────
# Cargamos el .env solo si existe (en producción las vars vienen del entorno)
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    logger.warning("OPENAI_API_KEY no está configurada. Las llamadas a la API fallarán.")

# ── Prompt de extracción ──────────────────────────────────────────────────────
# Resolvemos la ruta relativa al directorio de este archivo, no al CWD,
# para que funcione sin importar desde dónde se lanza uvicorn.
_PROMPT_PATH = Path(__file__).parent.parent / "prompts" / "extraction_prompt.txt"

try:
    EXTRACTION_PROMPT = _PROMPT_PATH.read_text(encoding="utf-8")
    logger.info("Prompt de extracción cargado desde %s", _PROMPT_PATH)
except FileNotFoundError:
    # Si el archivo no existe, el servidor arranca igual pero loguea el error.
    EXTRACTION_PROMPT = ""
    logger.error("No se encontró el archivo de prompt en %s", _PROMPT_PATH)


# ── Excepción personalizada ───────────────────────────────────────────────────
class OpenAIServiceError(Exception):
    """Se lanza cuando la API de OpenAI devuelve un error o no está disponible."""

    def __init__(self, message: str, original: Exception | None = None):
        super().__init__(message)
        self.original = original


# ── Función principal ─────────────────────────────────────────────────────────
async def extract_invoice_data(image_b64: str) -> dict:
    """
    Envía la imagen a GPT-4o Vision y retorna los datos estructurados de la factura.

    Args:
        image_b64: String en base64 de la imagen (JPEG o PNG).

    Returns:
        dict con los campos extraídos, o {"error": "no_es_factura", ...}
        si la imagen no es una factura.

    Raises:
        OpenAIServiceError: Si la API de OpenAI falla o no responde.
        ValueError: Si la respuesta de GPT-4o no es JSON válido.
    """

    # Construimos el cliente asíncrono en cada llamada para evitar problemas
    # de event loop cuando se usa con uvicorn en producción.
    client = openai.AsyncOpenAI(api_key=OPENAI_API_KEY)

    # La imagen se envía como data URI; aceptamos JPEG y PNG.
    # GPT-4o puede inferir el formato, pero declaramos jpeg para mayor claridad.
    image_data_uri = f"data:image/jpeg;base64,{image_b64}"

    try:
        logger.info("Enviando imagen a GPT-4o Vision para extracción de factura...")
        response = await client.chat.completions.create(
            model="gpt-4o",
            # temperature=0 para respuestas más deterministas y consistentes
            temperature=0,
            max_tokens=512,
            messages=[
                {
                    "role": "system",
                    "content": EXTRACTION_PROMPT,
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {"url": image_data_uri},
                        },
                        {
                            "type": "text",
                            # Recordatorio extra para reforzar el formato de salida
                            "text": "Analizá esta factura y devolvé solo el JSON solicitado.",
                        },
                    ],
                },
            ],
        )
    except openai.APIError as exc:
        # Logueamos el detalle completo para facilitar el debug
        logger.error(
            "Error en la API de OpenAI: %s — status=%s body=%s",
            exc.message,
            getattr(exc, "status_code", "N/A"),
            getattr(exc, "body", "N/A"),
        )
        raise OpenAIServiceError(
            "La API de OpenAI no está disponible en este momento.", original=exc
        ) from exc

    # ── Parseo de la respuesta ────────────────────────────────────────────────
    raw_content = response.choices[0].message.content or ""
    logger.debug("Respuesta cruda de GPT-4o: %s", raw_content)

    # GPT-4o a veces incluye backticks o "```json" a pesar de las instrucciones;
    # limpiamos por si acaso antes de parsear.
    cleaned = raw_content.strip()
    if cleaned.startswith("```"):
        # Removemos la primera y última línea de backticks
        lines = cleaned.splitlines()
        cleaned = "\n".join(lines[1:-1] if lines[-1] == "```" else lines[1:])

    try:
        result = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        logger.error(
            "GPT-4o devolvió JSON inválido. Respuesta cruda: %r", raw_content
        )
        raise ValueError(
            f"La respuesta de GPT-4o no es JSON válido: {raw_content!r}"
        ) from exc

    logger.info(
        "Extracción completada — proveedor=%s confianza=%s",
        result.get("proveedor"),
        result.get("confianza"),
    )
    return result
