const cleanUrl = (value = '') => String(value).trim().replace(/\/+$/, '')

/**
 * Un client ID de OAuth nunca contiene espacios ni barras invertidas. Algunos
 * gestores de secretos (Vercel incluido) guardan un salto de linea pegado al
 * pegar el valor, y Google responde "The given client ID is not found" porque
 * el ID llega con `\r\n` al final. Se limpia tanto el salto real como su
 * version escapada.
 */
export function cleanGoogleClientId(value) {
  return String(value ?? '')
    .replace(/\\[rn]/g, '')
    .replace(/\s+/g, '')
}

export const env = {
  apiUrl: cleanUrl(import.meta.env.VITE_API_URL || ''),
  geocodingApi:
    import.meta.env.VITE_GEOCODING_API ||
    'https://nominatim.openstreetmap.org/search',
  cloudinaryCloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
  cloudinaryUploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
  googleClientId: cleanGoogleClientId(import.meta.env.VITE_GOOGLE_CLIENT_ID || ''),
  isProduction: Boolean(import.meta.env.PROD),
}

export function validateEnv() {
  const missing = []

  if (!env.cloudinaryCloudName) missing.push('VITE_CLOUDINARY_CLOUD_NAME')
  if (!env.cloudinaryUploadPreset) missing.push('VITE_CLOUDINARY_UPLOAD_PRESET')
  if (!env.googleClientId) missing.push('VITE_GOOGLE_CLIENT_ID')

  if (missing.length > 0) {
    const message = `Variables de entorno faltantes: ${missing.join(', ')}`
    if (env.isProduction) {
      console.error(`[PlomApp] ${message}. Revisa .env.example.`)
    }
  }

  return missing
}
