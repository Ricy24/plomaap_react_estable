const cleanUrl = (value = '') => String(value).trim().replace(/\/+$/, '')

export const env = {
  apiUrl: cleanUrl(import.meta.env.VITE_API_URL || ''),
  geocodingApi:
    import.meta.env.VITE_GEOCODING_API ||
    'https://nominatim.openstreetmap.org/search',
  cloudinaryCloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
  cloudinaryUploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
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
