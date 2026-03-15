"""
main.py — Punto de entrada de la API Billing Sniper.

Arrancá el servidor con:
    uvicorn main:app --reload

La app expone:
    GET  /health   — Verificación de que el servidor está activo
    POST /extract  — Análisis de factura via GPT-4o Vision
"""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.extract import router as extract_router

# ── Logging básico ────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)

# ── Aplicación FastAPI ────────────────────────────────────────────────────────
app = FastAPI(
    title="Billing Sniper API",
    description="Analiza facturas de internet/telefonía argentinas con GPT-4o Vision.",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Por ahora permitimos todos los orígenes para facilitar el desarrollo local.
# Cuando se integre el frontend en producción, restringir a su dominio específico.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(extract_router)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["Sistema"])
async def health():
    """Verifica que el servidor está corriendo correctamente."""
    return {"status": "ok", "version": "1.0.0"}
