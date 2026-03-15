"""
routers/precios.py — Endpoints del sistema de precios de referencia.

Rutas:
    GET  /precios/todos        — Todos los proveedores y planes
    GET  /precios/{proveedor}  — Planes de un proveedor específico
    POST /precios/comparar     — Comparación con el mercado actual

IMPORTANTE: el endpoint /todos debe estar registrado antes de /{proveedor}
para que FastAPI no interprete la palabra "todos" como un parámetro de path.
"""

import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services import precios_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/precios", tags=["Precios"])


# ── Modelos ───────────────────────────────────────────────────────────────────

class CompararRequest(BaseModel):
    proveedor_actual: str   # ej: "fibertel"
    velocidad_mbps: int     # velocidad del plan actual en Mbps
    precio_actual: int      # lo que paga actualmente en ARS


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/todos")
def get_todos():
    """Devuelve todos los proveedores con sus planes y la fecha de actualización."""
    return precios_service.get_todos()


@router.get("/{proveedor}")
def get_proveedor(proveedor: str):
    """
    Devuelve los planes de un proveedor específico.

    Path params:
        proveedor: Nombre del proveedor en minúsculas (ej: fibertel, telecentro).
    """
    try:
        datos = precios_service.get_por_proveedor(proveedor)
    except KeyError:
        raise HTTPException(
            status_code=404,
            detail=f"Proveedor '{proveedor}' no encontrado. "
                   f"Proveedores disponibles: fibertel, telecentro, claro, movistar.",
        )
    return datos


@router.post("/comparar")
def comparar(request: CompararRequest):
    """
    Compara el plan actual del usuario con las alternativas del mercado.

    Busca planes de velocidad similar (±20%) en todos los demás proveedores
    y devuelve la mejor alternativa ordenada por precio de oferta.
    """
    logger.info(
        "Comparando: proveedor=%s vel=%dMB precio=$%d",
        request.proveedor_actual,
        request.velocidad_mbps,
        request.precio_actual,
    )
    resultado = precios_service.comparar(
        proveedor_actual=request.proveedor_actual,
        velocidad_mbps=request.velocidad_mbps,
        precio_actual=request.precio_actual,
    )
    return resultado
