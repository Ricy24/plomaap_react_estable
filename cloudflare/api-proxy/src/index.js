/**
 * Proxy de la API de PlomApp sobre Cloudflare Workers.
 *
 * Objetivo: poner una capa gratuita delante de Django (Oracle) que:
 *  - frene el abuso (login/registro) con el binding de rate limiting,
 *  - limite el tamano de las peticiones,
 *  - bloquee sondeos tipicos de bots,
 *  - cachee en el edge los GET publicos,
 *  - oculte la IP del servidor de origen.
 *
 * No se cachean las respuestas autenticadas ni las personalizadas: llevan datos
 * por usuario y CORS dinamico, y una cache compartida serviria la respuesta de
 * un usuario a otro.
 */

const ORIGIN = 'https://lifeosandres.duckdns.org/plomaap-api'
const MAX_BODY_BYTES = 12 * 1024 * 1024
const CACHE_TTL_SECONDS = 300

// Solo rutas publicas, sin token y sin datos personales.
const CACHEABLE_GET = new Set(['/api/services'])

const AUTH_PATH = /^\/api\/auth\/(login|register|google|forgot|reset|verify|refresh)/i
const PROBE_PATH = /(^\/\.(env|git|aws|svn|htaccess))|(\.php$)|(^\/wp-)/i

function jsonResponse(status, payload, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  })
}

/** Devuelve cabeceras CORS equivalentes a las que emitiria Django. */
function corsHeaders(request) {
  const origin = request.headers.get('Origin')
  if (!origin) return {}
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    Vary: 'Origin',
  }
}

/** Cabeceras de seguridad + CORS por peticion (nunca se cachean). */
function decorate(response, request, cacheState) {
  const out = new Response(response.body, response)
  out.headers.set('X-Content-Type-Options', 'nosniff')
  out.headers.set('Referrer-Policy', 'no-referrer')
  out.headers.set('Strict-Transport-Security', 'max-age=31536000')
  if (cacheState) out.headers.set('X-Cache', cacheState)
  for (const [key, value] of Object.entries(corsHeaders(request))) {
    out.headers.set(key, value)
  }
  return out
}

function proxy(request, url) {
  const target = new URL(ORIGIN + url.pathname + url.search)
  const headers = new Headers(request.headers)
  headers.delete('host')

  const clientIp = request.headers.get('cf-connecting-ip')
  if (clientIp) headers.set('X-Real-Client-IP', clientIp)

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD'

  return fetch(target, {
    method: request.method,
    headers,
    body: hasBody ? request.body : undefined,
    redirect: 'manual',
  })
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const path = url.pathname

    if (PROBE_PATH.test(path)) {
      return new Response('Not Found', { status: 404 })
    }

    // El preflight lo responde Django (CORS_ALLOW_ALL_ORIGINS) y no consume cuota.
    if (request.method === 'OPTIONS') {
      return proxy(request, url)
    }

    const declared = Number(request.headers.get('content-length') || 0)
    if (declared > MAX_BODY_BYTES) {
      return jsonResponse(
        413,
        { success: false, message: 'La solicitud es demasiado grande.' },
        corsHeaders(request)
      )
    }

    const ip = request.headers.get('cf-connecting-ip') || 'unknown'
    const isAuth = AUTH_PATH.test(path)
    const bucket = isAuth ? 'auth' : request.method === 'GET' || request.method === 'HEAD' ? 'read' : 'write'
    const limiter = isAuth ? env.RL_AUTH : bucket === 'read' ? env.RL_READ : env.RL_WRITE

    if (limiter && typeof limiter.limit === 'function') {
      const { success } = await limiter.limit({ key: `${ip}:${bucket}` })
      if (!success) {
        return jsonResponse(
          429,
          { success: false, message: 'Demasiadas solicitudes. Espera un minuto e intenta de nuevo.' },
          { ...corsHeaders(request), 'Retry-After': '60' }
        )
      }
    }

    const cacheable = request.method === 'GET' && CACHEABLE_GET.has(path)
    const cache = caches.default
    const cacheKey = new Request(url.toString(), { method: 'GET' })

    if (cacheable) {
      const hit = await cache.match(cacheKey)
      if (hit) return decorate(hit, request, 'HIT')
    }

    const response = await proxy(request, url)

    if (!cacheable || response.status !== 200) {
      return decorate(response, request, null)
    }

    // Se guarda solo el cuerpo y el tipo; las cabeceras por origen se
    // reconstruyen en cada peticion para no servir el CORS de otro cliente.
    const body = await response.arrayBuffer()
    const stored = new Response(body, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json; charset=utf-8',
        'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`,
      },
    })
    await cache.put(cacheKey, stored.clone())
    return decorate(stored, request, 'MISS')
  },
}
