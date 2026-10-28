import { describe, expect, it } from 'vitest'
import { translateApiMessage } from '../../src/services/api'
import { uploadImageToCloudinary } from '../../src/utils/cloudinary'

describe('traducción de mensajes del API', () => {
  it('traduce los mensajes heredados en inglés del backend', () => {
    expect(translateApiMessage('Email already registered')).toBe('Este correo ya está registrado.')
    expect(translateApiMessage('Invalid credentials')).toBe('Correo o contraseña incorrectos.')
    expect(translateApiMessage('Unauthorized')).toBe('Tu sesión expiró. Inicia sesión de nuevo.')
  })

  it('deja intactos los mensajes que ya vienen en español', () => {
    expect(translateApiMessage('Registro exitoso')).toBe('Registro exitoso')
  })

  it('no falla cuando no hay mensaje', () => {
    expect(translateApiMessage(undefined)).toBeUndefined()
    expect(translateApiMessage('')).toBe('')
  })
})

describe('validación de imágenes antes de subirlas', () => {
  it('rechaza archivos que no son imágenes', async () => {
    const file = new File(['texto'], 'nota.txt', { type: 'text/plain' })
    await expect(uploadImageToCloudinary(file)).rejects.toThrow(/no es una imagen/i)
  })

  it('rechaza imágenes de más de 10 MB', async () => {
    const file = new File(['x'], 'grande.png', { type: 'image/png' })
    Object.defineProperty(file, 'size', { value: 10 * 1024 * 1024 + 1 })
    await expect(uploadImageToCloudinary(file)).rejects.toThrow(/demasiado grande/i)
  })

  it('exige un archivo', async () => {
    await expect(uploadImageToCloudinary(null)).rejects.toThrow(/Selecciona una imagen/i)
  })
})
