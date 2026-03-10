# ML Opportunities Dashboard

Dashboard de oportunidades de negocio en Mercado Libre — construido con **Next.js 16**, **Tailwind CSS** y **Lucide React**.

## Pantallas

| Pantalla | Descripción |
|---|---|
| `/dashboard` | Vista general con acceso rápido a módulos |
| `/dashboard/tendencias` | Top 50 palabras clave más buscadas + gráfico |
| `/dashboard/bestsellers` | Top 20 productos por categoría + Índice de Oportunidad |

---

## Cómo obtener tu Access Token de Mercado Libre

### 1. Crear una aplicación en el portal de desarrolladores

1. Ingresá a [https://developers.mercadolibre.com.ar/](https://developers.mercadolibre.com.ar/)
2. Iniciá sesión con tu cuenta de Mercado Libre
3. Hacé clic en **"Crear aplicación"**
4. Completá los datos:
   - **Nombre**: `ML Opportunities Dashboard` (o el que quieras)
   - **Dominio**: `localhost` (para desarrollo local)
   - **Redirect URI**: `http://localhost:3000/callback` (para OAuth)
   - **Scopes**: `read` es suficiente para este dashboard
5. Guardá los datos — vas a obtener `APP_ID` (Client ID) y `SECRET_KEY` (Client Secret)

### 2. Obtener el Access Token (flujo de Client Credentials)

Para uso server-side sin flujo de usuario, podés usar el endpoint de OAuth:

```bash
curl -X POST \
  https://api.mercadolibre.com/oauth/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=client_credentials' \
  -d 'client_id=TU_APP_ID' \
  -d 'client_secret=TU_SECRET_KEY'
```

La respuesta incluirá:
```json
{
  "access_token": "APP_USR-xxxxxxxx...",
  "token_type": "Bearer",
  "expires_in": 21600
}
```

> **Nota**: El Access Token expira en 6 horas. Para producción, implementá un mecanismo de refresh automático usando el `refresh_token`.

### 3. Configurar el archivo `.env.local`

Completá los valores en `.env.local`:

```env
ML_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxx
ML_CLIENT_ID=123456789
ML_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxx
ML_SITE_ID=MLA

NEXT_PUBLIC_ML_SITE_ID=MLA
```

### Sites disponibles

| Site ID | País |
|---|---|
| `MLA` | Argentina |
| `MLB` | Brasil |
| `MLM` | México |
| `MLC` | Chile |
| `MLU` | Uruguay |
| `MCO` | Colombia |
| `MPE` | Perú |

---

## Instalación y ejecución

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
# Editar .env.local con tus credenciales (ver instrucciones arriba)

# Desarrollo
npm run dev

# Build de producción
npm run build
npm start
```

La app estará disponible en [http://localhost:3000](http://localhost:3000)

---

## Arquitectura

```
src/
├── app/
│   ├── api/
│   │   ├── trends/route.ts        # GET /api/trends?site=MLA
│   │   ├── categories/route.ts    # GET /api/categories?site=MLA
│   │   └── highlights/route.ts    # GET /api/highlights?category=MLA1&site=MLA
│   ├── dashboard/
│   │   ├── layout.tsx             # Shell con Sidebar + MobileNav
│   │   ├── page.tsx               # Home del dashboard
│   │   ├── tendencias/
│   │   │   ├── page.tsx           # Server component (SSR inicial)
│   │   │   └── TendenciasClient.tsx # Client component con filtros
│   │   └── bestsellers/
│   │       ├── page.tsx           # Server component (categorías SSR)
│   │       └── BestSellersClient.tsx # Client component con lazy loading
│   ├── layout.tsx
│   └── page.tsx                   # Redirect a /dashboard
├── components/
│   ├── charts/
│   │   └── TrendChart.tsx         # Recharts bar chart horizontal
│   ├── layout/
│   │   ├── Sidebar.tsx            # Nav desktop
│   │   └── MobileNav.tsx          # Nav mobile (fixed bottom)
│   └── ui/
│       ├── ProductCard.tsx        # Card de producto con métricas
│       ├── CategoryBadge.tsx      # Badge clickeable de categoría
│       ├── LoadingGrid.tsx        # Skeleton loader
│       └── ErrorAlert.tsx         # Alert de error con retry
├── lib/
│   ├── mercadolibre.ts            # API client (server-side)
│   └── opportunity.ts             # Lógica del Índice de Oportunidad
└── types/
    └── mercadolibre.ts            # Tipos TypeScript completos
```

---

## Índice de Oportunidad

El score (0-100) se calcula a partir de señales públicas de ML:

| Señal | Peso |
|---|---|
| Cantidad vendida | +8 a +25 pts |
| Envío gratis | +10 pts |
| Condición nueva | +5 pts |
| Reputación del vendedor (baja rep. = ventana de entrada) | -10 a +15 pts |
| Ratio stock/demanda | +10 pts |

> **Alta** >= 70 pts · **Media** 40-69 pts · **Baja** < 40 pts

---

## Endpoints de ML utilizados

| Endpoint | Auth | Descripción |
|---|---|---|
| `GET /trends/{siteId}` | No | Top keywords en tiempo real |
| `GET /sites/{siteId}` | No | Info del sitio + categorías raíz |
| `GET /highlights/{siteId}/category/{catId}` | Sí | IDs de best sellers |
| `GET /items?ids={ids}` | Sí | Detalle completo de productos |

---

## Licencia

MIT
