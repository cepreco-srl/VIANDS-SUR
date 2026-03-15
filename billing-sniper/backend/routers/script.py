"""
routers/script.py — Endpoint POST /generate-script.

Recibe los datos de la factura del usuario y la mejor alternativa del mercado,
y devuelve el script de negociación personalizado listo para copiar y pegar.
"""

import logging

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from services.ocr_service import OpenAIServiceError
from services import script_service

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Scripts"])

CANALES_VALIDOS = {"whatsapp", "chat"}


# ── Modelos ───────────────────────────────────────────────────────────────────

class DatosFactura(BaseModel):
    proveedor: str
    plan: str | None = None
    total_con_impuestos: int
    descuento_vencido: bool | None = None
    # Campos de confianza del OCR (opcionales, vienen de /extract)
    confianza: str | None = None
    campos_dudosos: list[str] = []


class MejorAlternativa(BaseModel):
    proveedor: str
    plan: str
    precio_oferta: int


class GenerateScriptRequest(BaseModel):
    datos_factura: DatosFactura
    mejor_alternativa: MejorAlternativa
    canal: str  # "whatsapp" o "chat"


# ── Endpoint ──────────────────────────────────────────────────────────────────

@router.post("/generate-script")
async def generate_script(request: GenerateScriptRequest):
    """
    Genera el script de negociación personalizado para el canal indicado.

    Body (JSON):
        datos_factura: Datos de la factura del usuario.
        mejor_alternativa: La oferta más barata de la competencia.
        canal: "whatsapp" (párrafos cortos, coloquial) o "chat" (formal).

    Returns:
        200 — Script listo para copiar, con ahorro calculado y tip.
        400 — Canal inválido.
        503 — La API de OpenAI no está disponible.
    """
    canal = request.canal.lower()
    if canal not in CANALES_VALIDOS:
        raise HTTPException(
            status_code=400,
            detail=f"Canal '{request.canal}' inválido. Valores aceptados: whatsapp, chat.",
        )

    try:
        resultado = await script_service.generate_script(
            datos_factura=request.datos_factura.model_dump(),
            mejor_alternativa=request.mejor_alternativa.model_dump(),
            canal=canal,
            confianza=request.datos_factura.confianza,
            campos_dudosos=request.datos_factura.campos_dudosos,
        )
    except OpenAIServiceError as exc:
        logger.error("OpenAI no disponible al generar script: %s", exc)
        return JSONResponse(
            status_code=503,
            content={
                "error": "openai_unavailable",
                "mensaje": "El servicio de IA no está disponible en este momento. Intentá de nuevo en unos minutos.",
            },
        )

    return resultado
