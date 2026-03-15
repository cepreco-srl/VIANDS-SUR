"""
services/precios_service.py — Lógica de precios de referencia y comparación.

El source of truth es data/precios_referencia.json, un archivo actualizado
manualmente por el equipo cada semana. No hay base de datos involucrada.

Flujo de comparación:
  1. Se recibe el proveedor actual, la velocidad contratada y el precio que paga.
  2. Se buscan planes de velocidad similar (±20%) en TODOS los demás proveedores.
  3. Se ordenan los candidatos por precio_oferta_bienvenida (el más barato primero).
  4. Se calcula el ahorro mensual y porcentual respecto al precio actual.
"""

import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# ── Carga del JSON al importar el módulo (una sola vez) ───────────────────────
# La ruta se resuelve relativa a este archivo, independientemente del CWD.
# Estructura: backend/services/ → backend/ → billing-sniper/ → data/
_JSON_PATH = Path(__file__).parent.parent.parent / "data" / "precios_referencia.json"

try:
    with _JSON_PATH.open(encoding="utf-8") as f:
        _DATOS: dict = json.load(f)
    logger.info("precios_referencia.json cargado desde %s", _JSON_PATH)
except FileNotFoundError:
    _DATOS = {}
    logger.error("No se encontró precios_referencia.json en %s", _JSON_PATH)
except json.JSONDecodeError as exc:
    _DATOS = {}
    logger.error("precios_referencia.json tiene JSON inválido: %s", exc)


# ── Funciones públicas ────────────────────────────────────────────────────────

def get_todos() -> dict:
    """
    Devuelve todos los proveedores con sus planes más la metadata del archivo.
    """
    return {
        "ultima_actualizacion": _DATOS.get("ultima_actualizacion"),
        "moneda": _DATOS.get("moneda"),
        "nota": _DATOS.get("nota"),
        "proveedores": _DATOS.get("proveedores", {}),
    }


def get_por_proveedor(proveedor: str) -> dict:
    """
    Devuelve los datos de un proveedor específico.

    Args:
        proveedor: Clave del proveedor en minúsculas (ej: "fibertel").

    Returns:
        dict con nombre_display, region y planes.

    Raises:
        KeyError: Si el proveedor no existe en el JSON.
    """
    proveedores = _DATOS.get("proveedores", {})
    clave = proveedor.lower()
    if clave not in proveedores:
        raise KeyError(f"Proveedor '{proveedor}' no encontrado")
    return proveedores[clave]


def comparar(proveedor_actual: str, velocidad_mbps: int, precio_actual: int) -> dict:
    """
    Encuentra la mejor alternativa al plan actual del usuario.

    Busca planes de velocidad similar (±20%) en todos los proveedores excepto
    el actual, los ordena por precio de oferta y calcula el ahorro.

    Args:
        proveedor_actual: Clave del proveedor que tiene el usuario (ej: "fibertel").
        velocidad_mbps: Velocidad del plan actual en Mbps.
        precio_actual: Lo que paga el usuario actualmente en ARS.

    Returns:
        dict con mejor_alternativa, ahorro_mensual, porcentaje_ahorro y
        todas_las_alternativas ordenadas por precio, o un dict con "mensaje"
        si no hay alternativas.
    """
    proveedores = _DATOS.get("proveedores", {})
    clave_actual = proveedor_actual.lower()

    # Rango de velocidad aceptable: ±20% del plan actual
    vel_min = velocidad_mbps * 0.8
    vel_max = velocidad_mbps * 1.2

    candidatos = []

    for clave_prov, datos_prov in proveedores.items():
        # Excluimos el proveedor actual del usuario
        if clave_prov == clave_actual:
            continue

        for plan in datos_prov.get("planes", []):
            vel_plan = plan.get("velocidad_mbps", 0)
            if vel_min <= vel_plan <= vel_max:
                candidatos.append({
                    "proveedor": datos_prov["nombre_display"],
                    "proveedor_id": clave_prov,
                    "plan": plan["nombre"],
                    "velocidad_mbps": vel_plan,
                    "precio_oferta": plan["precio_oferta_bienvenida"],
                    "precio_lista": plan["precio_lista"],
                    "duracion_oferta_meses": plan["duracion_oferta_meses"],
                    "url": plan["url_referencia"],
                })

    if not candidatos:
        return {
            "mensaje": (
                f"No se encontraron alternativas con velocidad similar "
                f"({velocidad_mbps}MB ±20%) en otros proveedores."
            )
        }

    # Ordenamos por precio de oferta de menor a mayor
    candidatos.sort(key=lambda x: x["precio_oferta"])

    mejor = candidatos[0]
    ahorro_mensual = precio_actual - mejor["precio_oferta"]
    porcentaje_ahorro = round((ahorro_mensual / precio_actual) * 100)

    return {
        "mejor_alternativa": {
            "proveedor": mejor["proveedor"],
            "plan": mejor["plan"],
            "precio_oferta": mejor["precio_oferta"],
            "duracion_oferta_meses": mejor["duracion_oferta_meses"],
            "url": mejor["url"],
        },
        "ahorro_mensual": ahorro_mensual,
        "porcentaje_ahorro": porcentaje_ahorro,
        "todas_las_alternativas": candidatos,
    }
