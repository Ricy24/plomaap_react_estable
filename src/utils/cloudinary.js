import { env } from '../config/env'

export async function uploadImageToCloudinary(file) {
  const { cloudinaryCloudName: cloudName, cloudinaryUploadPreset: preset } = env

  if (!cloudName || !preset) {
    throw new Error('Cloudinary no está configurado. Revisa VITE_CLOUDINARY_* en .env.')
  }

  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', preset)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: fd }
  )
  const data = await res.json().catch(() => ({}))

  if (!res.ok || !data.secure_url) {
    throw new Error(data.error?.message || 'Error al subir la imagen')
  }

  return data.secure_url
}
