export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const NAME_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+(\s+[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+)+$/
const PHONE_REGEX = /^3\d{9}$/

export const MESSAGES = {
  loginEmpty: 'Por favor, complete todos los campos',
  credentials: 'Credenciales incorrectas',
  emailInvalid: 'Ingrese un correo electrónico válido',
  emailDuplicate: 'El correo electrónico ya se encuentra registrado',
  nameInvalid: 'Ingrese su nombre completo (nombre y apellido, solo letras)',
  phoneInvalid: 'Ingrese un teléfono válido de 10 dígitos (ej. 3229874810)',
  phoneRequired: 'El número de teléfono es requerido',
  passwordPolicy:
    'La contraseña no cumple con las políticas de seguridad (mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial)',
  addressRequired: 'La dirección de residencia es requerida',
  accountDisabled: 'Su cuenta se encuentra inhabilitada. Contacte al administrador.',
}

export function isOAuthPassword(password) {
  return typeof password === 'string' && password.startsWith('google_')
}

export function validatePassword(password) {
  if (!password) return MESSAGES.passwordPolicy
  if (isOAuthPassword(password)) return null

  if (password.length < 8) return MESSAGES.passwordPolicy
  if (!/[A-Z]/.test(password)) return MESSAGES.passwordPolicy
  if (!/[a-z]/.test(password)) return MESSAGES.passwordPolicy
  if (!/[0-9]/.test(password)) return MESSAGES.passwordPolicy
  if (!/[^A-Za-z0-9]/.test(password)) return MESSAGES.passwordPolicy

  return null
}

export function validateRegisterPayload({ name, email, password, phone, address }) {
  if (!name?.trim() || !email?.trim() || !password || !phone?.trim() || !address?.trim()) {
    return { success: false, message: 'Complete todos los campos obligatorios', errors: {} }
  }

  const errors = {}

  if (!NAME_REGEX.test(name.trim())) errors.name = MESSAGES.nameInvalid
  if (!EMAIL_REGEX.test(email.trim())) errors.email = MESSAGES.emailInvalid

  const digits = phone.replace(/\D/g, '')
  if (!PHONE_REGEX.test(digits)) errors.phone = MESSAGES.phoneInvalid
  if (!address.trim()) errors.address = MESSAGES.addressRequired

  const passErr = validatePassword(password)
  if (passErr) errors.password = passErr

  if (Object.keys(errors).length > 0) {
    return { success: false, message: Object.values(errors)[0], errors }
  }

  return { success: true, phone: digits }
}

export function validateLoginPayload({ email, password }) {
  if (!email?.trim() || !password) {
    return { success: false, message: MESSAGES.loginEmpty }
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return { success: false, message: MESSAGES.emailInvalid }
  }
  return { success: true }
}

export function normalizePhone(phone) {
  return phone?.replace(/\D/g, '') || ''
}

export function validateProfileFields({ name, phone, address }, { requireAddress = true } = {}) {
  const errors = {}
  if (name !== undefined && name !== null) {
    if (!name.trim()) errors.name = 'El nombre es requerido'
    else if (!NAME_REGEX.test(name.trim())) errors.name = MESSAGES.nameInvalid
  }
  if (phone !== undefined && phone !== null) {
    const digits = normalizePhone(phone)
    if (!digits) errors.phone = MESSAGES.phoneRequired
    else if (!PHONE_REGEX.test(digits)) errors.phone = MESSAGES.phoneInvalid
  }
  if (requireAddress && address !== undefined && address !== null && !address.trim()) {
    errors.address = MESSAGES.addressRequired
  }
  return errors
}
