import { describe, expect, it } from 'vitest'

import {
  MESSAGES,
  normalizePhone,
  validateEmail,
  validateLogin,
  validateName,
  validatePassword,
  validatePhone,
  validateRegister,
} from '../../src/utils/validation.js'

describe('UNIT-05 validaciones de formularios del frontend', () => {
  it('acepta correos válidos y rechaza correos inválidos', () => {
    expect(validateEmail('cliente@plomaap.com')).toBe('')
    expect(validateEmail('  cliente@plomaap.com  ')).toBe('')
    expect(validateEmail('cliente@')).toBe(MESSAGES.emailInvalid)
    expect(validateEmail('')).toBe(MESSAGES.required)
  })

  it('exige nombre y apellido, incluyendo tildes y ñ', () => {
    expect(validateName('Andrés Pérez')).toBe('')
    expect(validateName('Andrés')).toBe(MESSAGES.nameInvalid)
    expect(validateName('  ')).toBe(MESSAGES.required)
  })

  it('valida teléfonos colombianos y permite omitirlos cuando no son obligatorios', () => {
    expect(validatePhone('3229874810')).toBe('')
    expect(validatePhone('322 987 4810')).toBe('')
    expect(validatePhone('+57 322 987 4810')).toBe(MESSAGES.phoneInvalid)
    expect(validatePhone('123')).toBe(MESSAGES.phoneInvalid)
    expect(validatePhone('', false)).toBe('')
    expect(normalizePhone('+57 322-987-4810')).toBe('573229874810')
  })

  it('aplica la política de contraseña y acepta el prefijo OAuth cuando se permite', () => {
    expect(validatePassword('PlomApp2026*')).toBe('')
    expect(validatePassword('plomapp2026*')).toBe(MESSAGES.passwordPolicy)
    expect(validatePassword('PlomApp2026')).toBe(MESSAGES.passwordPolicy)
    expect(validatePassword('google_oauth_token', { allowOAuth: true })).toBe('')
  })

  it('valida el formulario de registro completo y detecta contraseñas distintas', () => {
    const data = {
      name: 'Andrés Pérez',
      email: 'andres@plomaap.com',
      phone: '3229874810',
      address: 'Calle 1 #2-3',
      password: 'PlomApp2026*',
      confirmPassword: 'PlomApp2026*',
    }

    expect(validateRegister(data)).toEqual({})

    expect(
      validateRegister({ ...data, password: 'PlomApp2026*', confirmPassword: 'OtraClave2026*' })
    ).toMatchObject({
      confirmPassword: MESSAGES.passwordMismatch,
    })
  })

  it('detecta campos vacíos en el login', () => {
    expect(validateLogin({ email: '', password: '' })).toEqual({
      email: MESSAGES.loginEmpty,
      password: MESSAGES.loginEmpty,
    })
  })
})
