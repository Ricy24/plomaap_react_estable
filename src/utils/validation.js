const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NAME_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+(\s+[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+)+$/
const PHONE_REGEX = /^3\d{9}$/
const OAUTH_PASSWORD_PREFIX = 'google_'

export const MESSAGES = {
  required: 'Este campo es obligatorio',
  loginEmpty: 'Por favor, complete todos los campos',
  credentials: 'Credenciales incorrectas',
  emailInvalid: 'Ingrese un correo electrónico válido',
  emailDuplicate: 'El correo electrónico ya se encuentra registrado',
  nameInvalid: 'Ingrese su nombre completo (nombre y apellido, solo letras)',
  phoneInvalid: 'Ingrese un teléfono válido de 10 dígitos (ej. 3229874810)',
  phoneRequired: 'El número de teléfono es requerido',
  passwordPolicy:
    'La contraseña no cumple con las políticas de seguridad (mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial)',
  passwordMismatch: 'Las contraseñas no coinciden',
  addressRequired: 'La dirección de residencia es requerida',
  accountDisabled: 'Su cuenta se encuentra inhabilitada. Contacte al administrador.',
  registerSuccess: 'Registro exitoso. Ahora puede iniciar sesión con sus credenciales.',
  recoverySent: 'Se envió un enlace de recuperación al correo electrónico registrado.',
}

export function isOAuthPassword(password) {
  return typeof password === 'string' && password.startsWith(OAUTH_PASSWORD_PREFIX)
}

export function validateEmail(email) {
  if (!email?.trim()) return MESSAGES.required
  if (!EMAIL_REGEX.test(email.trim())) return MESSAGES.emailInvalid
  return ''
}

export function validateName(name) {
  if (!name?.trim()) return MESSAGES.required
  if (!NAME_REGEX.test(name.trim())) return MESSAGES.nameInvalid
  return ''
}

export function validatePhone(phone, required = true) {
  if (!phone?.trim()) return required ? MESSAGES.phoneRequired : ''
  const digits = phone.replace(/\D/g, '')
  if (!PHONE_REGEX.test(digits)) return MESSAGES.phoneInvalid
  return ''
}

export function validatePassword(password, { allowOAuth = false } = {}) {
  if (!password) return MESSAGES.required
  if (allowOAuth && isOAuthPassword(password)) return ''

  if (password.length < 8) return MESSAGES.passwordPolicy
  if (!/[A-Z]/.test(password)) return MESSAGES.passwordPolicy
  if (!/[a-z]/.test(password)) return MESSAGES.passwordPolicy
  if (!/[0-9]/.test(password)) return MESSAGES.passwordPolicy
  if (!/[^A-Za-z0-9]/.test(password)) return MESSAGES.passwordPolicy

  return ''
}

export function validateAddress(address) {
  if (!address?.trim()) return MESSAGES.addressRequired
  return ''
}

export function validateLogin({ email, password }) {
  const errors = {}
  if (!email?.trim() || !password) {
    const msg = MESSAGES.loginEmpty
    if (!email?.trim()) errors.email = msg
    if (!password) errors.password = msg
    return errors
  }
  const emailError = validateEmail(email)
  if (emailError) errors.email = emailError
  return errors
}

export function validateRegister(data) {
  const errors = {}
  const nameErr = validateName(data.name)
  if (nameErr) errors.name = nameErr

  const emailErr = validateEmail(data.email)
  if (emailErr) errors.email = emailErr

  const phoneErr = validatePhone(data.phone, true)
  if (phoneErr) errors.phone = phoneErr

  const addressErr = validateAddress(data.address)
  if (addressErr) errors.address = addressErr

  const passErr = validatePassword(data.password)
  if (passErr) errors.password = passErr

  if (!data.confirmPassword) {
    errors.confirmPassword = MESSAGES.required
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = MESSAGES.passwordMismatch
  }

  return errors
}

export function normalizePhone(phone) {
  return phone?.replace(/\D/g, '') || ''
}

export function validateProfileSelf(data, { requireAddress = true } = {}) {
  const errors = {}
  if (data.name !== undefined) {
    const err = validateName(data.name)
    if (err) errors.name = err
  }
  if (data.phone !== undefined) {
    const err = validatePhone(data.phone, true)
    if (err) errors.phone = err
  }
  if (requireAddress && data.address !== undefined) {
    const err = validateAddress(data.address)
    if (err) errors.address = err
  }
  return errors
}

export function validatePasswordChange({ currentPassword, newPassword, confirmPassword }) {
  const errors = {}
  if (!currentPassword) errors.currentPassword = MESSAGES.required
  if (!newPassword) {
    errors.newPassword = MESSAGES.required
  } else {
    const policy = validatePassword(newPassword)
    if (policy) errors.newPassword = policy
  }
  if (!confirmPassword) {
    errors.confirmPassword = MESSAGES.required
  } else if (newPassword !== confirmPassword) {
    errors.confirmPassword = MESSAGES.passwordMismatch
  }
  return errors
}
