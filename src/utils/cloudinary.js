import { env } from '../config/env'

const MAX_IMAGE_BYTES = 10 * 1024 * 1024 // límite del plan gratuito de Cloudinary

function translateCloudinaryError(message) {
  if (!message) return 'No se pudo subir la imagen. Intenta de nuevo.'
  if (/file size too large|maximum is/i.test(message)) {
    return 'La imagen es demasiado grande (máximo 10 MB). Elige una más ligera.'
  }
  if (/upload preset/i.test(message)) {
    return 'La configuración de subida de imágenes no es válida (preset).'
  }
  if (/unsupported|invalid image|not an image|invalid file/i.test(message)) {
    return 'El archivo no es una imagen válida. Usa JPG, PNG o WEBP.'
  }
  if (/cloud_name|unknown api key/i.test(message)) {
    return 'El servicio de imágenes no está configurado correctamente.'
  }
  return message
}

export async function uploadImageToCloudinary(file) {
  const { cloudinaryCloudName: cloudName, cloudinaryUploadPreset: preset } = env

  if (!file) {
    throw new Error('Selecciona una imagen para subir.')
  }

  if (file.type && !file.type.startsWith('image/')) {
    throw new Error('El archivo no es una imagen. Usa JPG, PNG o WEBP.')
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('La imagen es demasiado grande (máximo 10 MB). Elige una más ligera.')
  }

  if (!cloudName || !preset) {
    throw new Error('Cloudinary no está configurado. Revisa VITE_CLOUDINARY_* en .env.')
  }

  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', preset)

  let res
  try {
    res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: fd }
    )
  } catch (error) {
    throw new Error('No se pudo conectar con el servicio de imágenes. Revisa tu conexión.', { cause: error })
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok || !data.secure_url) {
    throw new Error(translateCloudinaryError(data.error?.message))
  }

  return data.secure_url
}
