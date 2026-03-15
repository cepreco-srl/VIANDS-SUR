"""
scripts/validar_precios.py — Validador del archivo de precios de referencia.

Correr antes de deployar una actualización de precios:
    python scripts/validar_precios.py

Verifica que el JSON tiene la estructura correcta y no le faltan campos.
No depende de FastAPI — se puede ejecutar standalone.
"""

import json
import sys
from pathlib import Path

# ── Ruta al JSON ──────────────────────────────────────────────────────────────
# scripts/ → backend/ → billing-sniper/ → data/
_JSON_PATH = Path(__file__).parent.parent.parent / "data" / "precios_referencia.json"

# Campos requeridos en cada proveedor y plan
CAMPOS_PROVEEDOR = {"nombre_display", "region", "planes"}
CAMPOS_PLAN = {
    "id",
    "nombre",
    "velocidad_mbps",
    "precio_lista",
    "precio_oferta_bienvenida",
    "duracion_oferta_meses",
    "url_referencia",
}


def validar() -> bool:
    """Carga y valida el JSON. Retorna True si todo está bien, False si hay errores."""
    errores = []

    # ── 1. Cargar el archivo ──────────────────────────────────────────────────
    if not _JSON_PATH.exists():
        print(f"ERROR: No se encontró el archivo en {_JSON_PATH}")
        return False

    try:
        with _JSON_PATH.open(encoding="utf-8") as f:
            datos = json.load(f)
        print(f"✓ JSON cargado correctamente desde {_JSON_PATH}")
    except json.JSONDecodeError as exc:
        print(f"ERROR: JSON inválido — {exc}")
        return False

    # ── 2. Metadata del archivo ───────────────────────────────────────────────
    ultima_actualizacion = datos.get("ultima_actualizacion", "N/A")
    print(f"  Última actualización: {ultima_actualizacion}")

    proveedores = datos.get("proveedores", {})
    total_planes = 0

    # ── 3. Validar cada proveedor ─────────────────────────────────────────────
    for clave_prov, datos_prov in proveedores.items():
        # Verificar campos del proveedor
        campos_faltantes_prov = CAMPOS_PROVEEDOR - set(datos_prov.keys())
        if campos_faltantes_prov:
            errores.append(
                f"Proveedor '{clave_prov}': faltan campos {campos_faltantes_prov}"
            )

        planes = datos_prov.get("planes", [])
        if not planes:
            errores.append(f"Proveedor '{clave_prov}': no tiene planes definidos")

        # Verificar cada plan del proveedor
        for plan in planes:
            plan_id = plan.get("id", "sin_id")
            campos_faltantes_plan = CAMPOS_PLAN - set(plan.keys())
            if campos_faltantes_plan:
                errores.append(
                    f"Plan '{plan_id}' ({clave_prov}): faltan campos {campos_faltantes_plan}"
                )

            # Verificar que los precios sean enteros positivos
            for campo_precio in ("precio_lista", "precio_oferta_bienvenida"):
                valor = plan.get(campo_precio)
                if valor is None:
                    continue  # Ya reportado como campo faltante
                if not isinstance(valor, int) or valor <= 0:
                    errores.append(
                        f"Plan '{plan_id}' ({clave_prov}): "
                        f"'{campo_precio}' debe ser un entero positivo (actual: {valor!r})"
                    )

        total_planes += len(planes)

    print(f"  Proveedores: {len(proveedores)}")
    print(f"  Planes totales: {total_planes}")

    # ── 4. Resultado ──────────────────────────────────────────────────────────
    if errores:
        print(f"\nSe encontraron {len(errores)} error(es):")
        for err in errores:
            print(f"  ✗ {err}")
        return False

    print("✓ Todos los campos requeridos presentes")
    print("✓ Todos los precios son enteros válidos")
    return True


if __name__ == "__main__":
    ok = validar()
    sys.exit(0 if ok else 1)
