"""
routers/extract.py — Endpoint POST /extract para análisis de facturas.

Recibe una imagen en base64, la pasa al servicio OCR y devuelve
los datos extraídos como JSON estructurado.
"""

import logging

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from services.ocr_service import OpenAIServiceError, extract_invoice_data

logger = logging.getLogger(__name__)

router = APIRouter()


# ── Modelos de request/response ───────────────────────────────────────────────
class ExtractRequest(BaseModel):
    # La imagen debe enviarse como string base64 (JPEG o PNG recomendado)
    image: str


# ── Endpoint principal ────────────────────────────────────────────────────────
@router.post("/extract")
async def extract(request: ExtractRequest):
    """
    Analiza una factura de internet/telefonía argentina y extrae sus datos.

    Body (JSON):
        image (str): Imagen en base64.

    Returns:
        200 — JSON con los campos extraídos.
        422 — La imagen no es una factura reconocible.
        502 — GPT-4o devolvió una respuesta que no es JSON válido.
        503 — La API de OpenAI no está disponible.
    """
    try:
        result = await extract_invoice_data(request.image)
    except OpenAIServiceError as exc:
        # La API de OpenAI falló — reportamos 503 Service Unavailable
        logger.error("OpenAI no disponible: %s", exc)
        return JSONResponse(
            status_code=503,
            content={
                "error": "openai_unavailable",
                "mensaje": "El servicio de IA no está disponible en este momento. Intentá de nuevo en unos minutos.",
            },
        )
    except ValueError as exc:
        # GPT-4o respondió pero con texto que no es JSON válido
        logger.error("Error de parseo: %s", exc)
        return JSONResponse(
            status_code=502,
            content={
                "error": "parse_error",
                "mensaje": "El servicio de IA devolvió una respuesta inesperada. Intentá con otra imagen.",
            },
        )

    # Si GPT-4o determinó que la imagen no es una factura, lo informamos con 422
    if result.get("error") == "no_es_factura":
        return JSONResponse(status_code=422, content=result)

    # Caso exitoso: devolvemos los datos extraídos con 200
    return result
