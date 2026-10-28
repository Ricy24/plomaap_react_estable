# Cloudflare (sin dominio propio)

La app no tiene dominio propio: la API vive en `lifeosandres.duckdns.org` y los
nameservers de `duckdns.org` no se controlan, así que **no se puede usar el proxy
naranja, WAF ni las reglas de firewall de zona**. Tampoco hay que comprar nada:
Cloudflare ofrece dos productos que funcionan con subdominios suyos.

## Arquitectura

| Pieza | URL | Plan | Límite real |
|---|---|---|---|
| Frontend (SPA) | `https://<proyecto>.pages.dev` | Pages Free | requests estáticos y **bandwidth ilimitados** |
| API (proxy) | `https://plomaap-api.<sub>.workers.dev` | Workers Free | 100.000 req/día |
| Backend Django | `https://lifeosandres.duckdns.org/plomaap-api` | Oracle Always Free | 10 TB/mes de salida |

El frontend **no** pasa por el Worker: Pages ya sirve desde el edge y añadir un
Worker delante solo consumiría cuota de Workers sin aportar nada.

## Qué aporta el Worker (`api-proxy/`)

- **Rate limiting** por IP con el binding nativo (incluido en Free):
  - `RL_AUTH` 10 req/60 s → `/api/auth/*` (frena fuerza bruta en login/registro)
  - `RL_WRITE` 40 req/60 s → POST/PUT/PATCH/DELETE
  - `RL_READ` 240 req/60 s → GET/HEAD
- **Límite de cuerpo** 12 MB (413 antes de tocar Django).
- **Bloqueo de sondeos**: `/.env`, `/.git`, `*.php`, `/wp-*` → 404.
- **Oculta la IP de Oracle** y añade `X-Real-Client-IP`.
- Los `OPTIONS` (preflight CORS) no consumen rate limit.

El límite del binding es **aproximado y por ubicación de Cloudflare**, no un
contador global exacto: sirve como protección anti-abuso, no como cuota de negocio.

## Despliegue

```powershell
# 1. Login (una vez)
npx wrangler login

# 2. Worker de la API
npx wrangler deploy --config cloudflare/api-proxy/wrangler.toml

# 3. Probar el Worker antes de cambiar el front
curl.exe -s -o NUL -w "%{http_code}" https://plomaap-api.<sub>.workers.dev/api/services

# 4. Frontend a Pages (se construye en local, con la URL del Worker)
$env:VITE_API_URL="https://plomaap-api.<sub>.workers.dev"
npm run build
npx wrangler pages project create plomaap --production-branch=production
npx wrangler pages deploy dist --project-name=plomaap --branch=production
```

`public/_redirects` resuelve el fallback de la SPA y `public/_headers` fija el
cache inmutable de `/assets/*`. Vercel ignora ambos ficheros, así que el
despliegue en Vercel sigue funcionando igual como respaldo.

## Revertir

- Front: basta con volver a usar `https://plomaap-react.vercel.app`.
- API: cambiar `VITE_API_URL` de vuelta a
  `https://lifeosandres.duckdns.org/plomaap-api` y reconstruir.
- El backend no se toca en ningún momento: el Worker solo proxya.
