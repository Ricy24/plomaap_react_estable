# Cloudflare (sin dominio propio)

La app no tiene dominio propio: la API vive en `lifeosandres.duckdns.org` y los
nameservers de `duckdns.org` no se controlan, así que **no se puede usar el proxy
naranja, ni el WAF de zona, ni las reglas de firewall**. Tampoco hace falta
comprar nada: Cloudflare ofrece productos que funcionan con subdominios suyos.

## Arquitectura desplegada

| Pieza | URL | Producto | Límite real |
|---|---|---|---|
| Frontend (SPA) | `https://plomaap-web.plomaap-frontend.workers.dev` | Workers static assets | requests a estáticos **gratis e ilimitados** |
| API (proxy) | `https://plomaap-api.plomaap-frontend.workers.dev` | Workers Free | 100.000 req/día |
| Backend Django | `https://lifeosandres.duckdns.org/plomaap-api` | Oracle Always Free | 10 TB/mes de salida |

El frontend **no** pasa por el Worker de la API: Cloudflare ya sirve los assets
desde su edge, y meter un Worker delante solo gastaría cuota de Workers sin
aportar nada.

`plomaap-react.vercel.app` sigue vivo como respaldo, apuntando **directo** a
Oracle (sin Worker). Son dos caminos independientes: si el Worker falla, el
front de Vercel sigue funcionando.

## Por qué Workers y no Pages

`wrangler` 4.155 ya no crea proyectos Pages clásicos: `pages project create`
crea un Worker con assets estáticos. En ese modo la regla de SPA
`/*  /index.html  200` se rechaza por "bucle infinito", así que el fallback se
resuelve con `not_found_handling = "single-page-application"` en
`wrangler.jsonc`. El resultado es equivalente: los estáticos son ilimitados.

## Qué aporta el Worker de la API (`api-proxy/`)

- **Rate limiting** por IP con el binding nativo (incluido en Free):
  - `RL_AUTH` 10 req/60 s → `/api/auth/*` (frena fuerza bruta en login/registro)
  - `RL_WRITE` 40 req/60 s → POST/PUT/PATCH/DELETE
  - `RL_READ` 240 req/60 s → GET/HEAD
- **Caché de edge** para `GET /api/services` (TTL 300 s, `X-Cache: HIT/MISS`).
  Solo se cachea el cuerpo y el `Content-Type`; el CORS se reconstruye por
  petición, porque Django responde con `Access-Control-Allow-Origin` eco del
  origen y una caché compartida serviría el de otro cliente. Las respuestas
  autenticadas **no** se cachean.
- **HSTS** (`max-age=31536000`), `nosniff` y `Referrer-Policy` en todas las
  respuestas del Worker y del front.
- **Límite de cuerpo** 12 MB (413 antes de tocar Django).
- **Bloqueo de sondeos**: `/.env`, `/.git`, `*.php`, `/wp-*` → 404.
- **Oculta la IP de Oracle** y añade `X-Real-Client-IP`.
- Los `OPTIONS` (preflight CORS) no consumen rate limit.

El límite del binding es **aproximado y por ubicación de Cloudflare**, no un
contador global exacto: sirve como protección anti-abuso, no como cuota de
negocio. Una ráfaga muy rápida puede pasar de largo antes de que el contador se
sincronice.

## Despliegue

```powershell
# Requiere `npx wrangler login` una vez (scopes workers_scripts:write y pages:write)

# Frontend: build + deploy del Worker con assets
# VITE_API_URL debe apuntar al Worker de la API en el momento del build
$env:VITE_API_URL="https://plomaap-api.plomaap-frontend.workers.dev"
npm run deploy

# API
npx wrangler deploy -c cloudflare/api-proxy/wrangler.toml
```

`public/_headers` fija el cache inmutable de `/assets/*` y las cabeceras de
seguridad del front. Vercel ignora ese fichero, así que su despliegue no cambia.

## Revertir

- Front: usar `https://plomaap-react.vercel.app`.
- API: apuntar `VITE_API_URL` a `https://lifeosandres.duckdns.org/plomaap-api`
  y reconstruir.
- El backend no se toca en ningún momento: el Worker solo proxya.
