/**
 * Proxy de la API de PlomApp sobre Cloudflare Workers.
 *
 * Objetivo: poner una capa gratuita delante de Django (Oracle) que:
 *  - frene el abuso (login/registro) con el binding de rate limiting,
 *  - limite el tamano de las peticiones,
 *  - bloquee sondeos tipicos de bots,
 *  - oculte la IP del servidor de origen.
 *
 * No cachea respuestas a proposito: las respuestas de Django llevan CORS
 * dinamico (Access-Control-Allow-Origin eco del Origin) y cachearlas serviria
 * cabeceras incorrectas a otros origenes.
 */

const ORIGIN = 'https://lifeosandres.duckdns.org/plomaap-api'
const MAX_BODY_BYTES = 12 * 1024 * 1024

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

    const response = await proxy(request, url)
    const out = new Response(response.body, response)
    out.headers.set('X-Content-Type-Options', 'nosniff')
    out.headers.set('Referrer-Policy', 'no-referrer')
    return out
  },
}
