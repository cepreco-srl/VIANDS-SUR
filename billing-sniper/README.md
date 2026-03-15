# Billing Sniper — Backend

API que analiza facturas de internet/telefonía argentinas mediante OCR con GPT-4o Vision y devuelve los datos de facturación estructurados en JSON.

## Requisitos

- Python 3.11+
- Una API key de OpenAI con acceso a `gpt-4o`

## Setup local

```bash
# 1. Ir al directorio del backend
cd billing-sniper/backend

# 2. Crear y activar entorno virtual
python3.11 -m venv .venv
source .venv/bin/activate        # Linux/macOS
# .venv\Scripts\activate         # Windows

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Configurar variables de entorno
cp .env.example .env
# Editá .env y reemplazá sk-... con tu API key real de OpenAI
```

## Correr el servidor

```bash
# Desde billing-sniper/backend/
uvicorn main:app --reload
```

El servidor queda disponible en `http://localhost:8000`.
La documentación interactiva (Swagger UI) está en `http://localhost:8000/docs`.

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/health` | Verifica que el servidor está activo |
| `POST` | `/extract` | Analiza una factura y extrae sus datos |

---

### GET /health

```bash
curl http://localhost:8000/health
```

Respuesta:
```json
{"status": "ok", "version": "1.0.0"}
```

---

### POST /extract

**Body (JSON):**
```json
{
  "image": "<string base64 de la imagen>"
}
```

**Ejemplo con curl:**
```bash
# Convertir imagen a base64 y enviar
IMAGE_B64=$(base64 -w 0 factura.jpg)

curl -X POST http://localhost:8000/extract \
  -H "Content-Type: application/json" \
  -d "{\"image\": \"$IMAGE_B64\"}"
```

**Respuesta exitosa (200):**
```json
{
  "proveedor": "Fibertel",
  "plan": "100MB Fibra",
  "precio_sin_impuestos": 28000,
  "total_con_impuestos": 45000,
  "descuento_vencido": true,
  "confianza": "alta",
  "campos_dudosos": []
}
```

**Si la imagen no es una factura (422):**
```json
{
  "error": "no_es_factura",
  "mensaje": "No detectamos una factura de servicios de internet o telefonía en la imagen"
}
```

**Si OpenAI no está disponible (503):**
```json
{
  "error": "openai_unavailable",
  "mensaje": "El servicio de IA no está disponible en este momento. Intentá de nuevo en unos minutos."
}
```

## Estructura del proyecto

```
backend/
├── main.py                  # FastAPI app con CORS y health check
├── requirements.txt         # Dependencias Python
├── .env.example             # Plantilla de variables de entorno
├── routers/
│   └── extract.py           # Endpoint POST /extract
├── services/
│   └── ocr_service.py       # Lógica de llamada a GPT-4o Vision
└── prompts/
    └── extraction_prompt.txt # Prompt de extracción (separado del código)
```

## Variables de entorno

| Variable | Descripción | Obligatoria |
|----------|-------------|-------------|
| `OPENAI_API_KEY` | API key de OpenAI | Sí |
