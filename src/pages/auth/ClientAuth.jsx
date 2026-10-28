import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { authApi, translateApiMessage } from '../../services/api'
import { env } from '../../config/env'
import { useAuth } from '../../context/AuthContext'
import { uploadImageToCloudinary } from '../../utils/cloudinary'
import {
  validateLogin,
  validateRegister,
  normalizePhone,
  MESSAGES
} from '../../utils/validation'
import ForgotPassword from './ForgotPassword'
import AuthLayout from '../../components/auth/AuthLayout'
import '../../styles/auth.css'

const EMPTY_FORM = {
  name: '', email: '', password: '', confirmPassword: '',
  phone: '', address: localStorage.getItem('selectedAddress') || '', avatar: null
}

const PASSWORD_RULES = [
  value => value.length >= 8,
  value => /[A-Z]/.test(value),
  value => /[a-z]/.test(value),
  value => /[0-9]/.test(value),
  value => /[^A-Za-z0-9]/.test(value),
]

function passwordStrength(value) {
  const score = PASSWORD_RULES.filter(rule => rule(value)).length
  if (!value) return { score: 0, level: 0 }
  return { score, level: score <= 2 ? 1 : score <= 4 ? 2 : 3 }
}

function ClientAuth() {
  const { login } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [showForgot, setShowForgot] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({ ...EMPTY_FORM })

  const strength = passwordStrength(formData.password)

  const saveSession = (data) => {
    login(data.user, null, data.token)
  }

  const clearFieldError = (name) => {
    setFieldErrors(prev => {
      const next = { ...prev }
      delete next[name]
      return next
    })
    setError('')
  }

  const validatePasswordMatch = () => {
    if (!isLogin && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      return 'Las contraseñas no coinciden'
    }
    return ''
  }

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    clearFieldError(e.target.name)
    setSuccess('')
  }

  const uploadToCloudinary = async (file) => {
    setUploadingImage(true)
    try {
      const url = await uploadImageToCloudinary(file)
      setFormData(prev => ({ ...prev, avatar: url }))
    } catch (err) {
      setError(err.message || 'Error al conectar con Cloudinary')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
    await uploadToCloudinary(file)
  }

  const removeImage = () => {
    setImagePreview(null)
    setFormData(prev => ({ ...prev, avatar: null }))
  }

  const switchMode = (loginMode) => {
    setIsLogin(loginMode)
    setError('')
    setSuccess('')
    setFieldErrors({})
    setImagePreview(null)
    if (loginMode) {
      setFormData(prev => ({
        ...EMPTY_FORM,
        email: prev.email,
        address: prev.address
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isLogin) {
      const errors = validateLogin(formData);
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }
    } else {
      const errors = validateRegister(formData);
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }
    }

    setLoading(true)
    try {
      if (isLogin) {
        const data = await authApi.login(formData.email.trim(), formData.password, 'customer');
        if (!data.success) {
          setError(translateApiMessage(data.message));
          return;
        }
        if (data.user?.role !== 'customer' && data.user?.role !== 'user') {
          const roleName = data.user?.role === 'admin' ? 'Administrador' : 'Técnico';
          setError(`Esta cuenta tiene rol de ${roleName}. Por favor ingresa por el acceso correspondiente.`);
          return;
        }
        saveSession(data);
      } else {
        const data = await authApi.register({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          phone: normalizePhone(formData.phone),
          address: formData.address.trim(),
          avatar: formData.avatar
        });
        if (!data.success) {
          setError(translateApiMessage(data.message));
          return;
        }
        setSuccess(data.message || MESSAGES.registerSuccess);
        switchMode(true);
        setFormData(prev => ({
          ...EMPTY_FORM,
          email: prev.email,
          address: prev.address
        }));
      }
    } catch (err) {
      if (err?.status === 409) {
        setFieldErrors({ email: 'Ya existe una cuenta con este correo. Inicia sesión o usa otro correo.' });
        setError('Ya existe una cuenta con este correo electrónico.');
      } else {
        setError(err?.message || 'No se pudo completar la solicitud. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleLogin = async (credentialResponse) => {
    setLoading(true)
    setError('')
    setFieldErrors({})
    try {
      const token = credentialResponse.credential
      const response = await fetch(`${env.apiUrl}/api/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: token })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al iniciar sesión con Google')
        return
      }

      saveSession({ token: data.token, user: data.user })
    } catch {
      setError('Error de red al procesar Google Login. Verifica que el backend esté corriendo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {showForgot && <ForgotPassword onClose={() => setShowForgot(false)} />}

      <AuthLayout
        badge="Acceso cliente"
        tone="client"
        backTo="/ingresar"
        title={isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
        subtitle={
          isLogin
            ? 'Ingresa para agendar reparaciones en tu hogar.'
            : 'Completa tus datos y agenda tu primer servicio en minutos.'
        }
        visualIcon="fa-house-chimney"
        visualTitle="Tu hogar, en buenas manos."
        visualText="Agenda plomería, fugas y destapes con técnicos verificados en Bogotá."
        footer={
          <p className="auth-switch">
            {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <button type="button" onClick={() => switchMode(!isLogin)}>
              {isLogin ? 'Regístrate' : 'Ingresa'}
            </button>
          </p>
        }
      >
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {!isLogin && (
            <div className="input-group slide-down">
              <label htmlFor="client-name">Nombre completo</label>
              <div className={`input-wrapper ${fieldErrors.name ? 'has-error' : ''}`}>
                <i className="fa-regular fa-user" aria-hidden="true" />
                <input
                  id="client-name"
                  type="text"
                  name="name"
                  data-testid="auth-name"
                  placeholder="Ej. Juan Pérez"
                  autoComplete="name"
                  value={formData.name}
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={fieldErrors.name ? 'client-name-error' : undefined}
                  onChange={handleInputChange}
                />
              </div>
              {fieldErrors.name && <p id="client-name-error" className="field-error">{fieldErrors.name}</p>}
            </div>
          )}

          <div className="input-group">
            <label htmlFor="client-email">Correo electrónico</label>
            <div className={`input-wrapper ${fieldErrors.email ? 'has-error' : ''}`}>
              <i className="fa-regular fa-envelope" aria-hidden="true" />
              <input
                id="client-email"
                type="email"
                name="email"
                data-testid="auth-email"
                placeholder="cliente@mail.com"
                autoComplete="email"
                inputMode="email"
                value={formData.email}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'client-email-error' : undefined}
                onChange={handleInputChange}
              />
            </div>
            {fieldErrors.email && <p id="client-email-error" className="field-error">{fieldErrors.email}</p>}
          </div>

          <div className="input-group">
            <label htmlFor="client-password">Contraseña</label>
            <div className={`input-wrapper ${fieldErrors.password ? 'has-error' : ''}`}>
              <i className="fa-solid fa-lock" aria-hidden="true" />
              <input
                id="client-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                data-testid="auth-password"
                placeholder={isLogin ? 'Tu contraseña' : 'Mín. 8 caracteres'}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                value={formData.password}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={
                  fieldErrors.password
                    ? 'client-password-error'
                    : !isLogin
                      ? 'client-password-hint'
                      : undefined
                }
                onChange={handleInputChange}
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                <i className={`fa-solid fa-eye${showPassword ? '' : '-slash'}`} aria-hidden="true" />
              </button>
            </div>
            {fieldErrors.password && <p id="client-password-error" className="field-error">{fieldErrors.password}</p>}
            {!isLogin && (
              <>
                <div
                  className="password-strength"
                  data-level={strength.level}
                  aria-hidden="true"
                >
                  {[0, 1, 2, 3, 4].map(i => (
                    <span key={i} className={i < strength.score ? 'is-on' : ''} />
                  ))}
                </div>
                {!fieldErrors.password && (
                  <p id="client-password-hint" className="field-hint">
                    Usa mayúscula, minúscula, número y un carácter especial.
                  </p>
                )}
              </>
            )}
          </div>

          {!isLogin && (
            <>
              <div className="input-group">
                <label htmlFor="client-confirm">Confirmar contraseña</label>
                <div className={`input-wrapper ${fieldErrors.confirmPassword ? 'has-error' : ''} ${validatePasswordMatch() ? 'has-warning' : formData.confirmPassword && formData.password === formData.confirmPassword ? 'has-success' : ''}`}>
                  <i className="fa-solid fa-lock" aria-hidden="true" />
                  <input
                    id="client-confirm"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    data-testid="auth-confirm-password"
                    placeholder="Repite tu contraseña"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    aria-invalid={Boolean(fieldErrors.confirmPassword || validatePasswordMatch())}
                    aria-describedby="client-confirm-feedback"
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    <i className={`fa-solid fa-eye${showConfirmPassword ? '' : '-slash'}`} aria-hidden="true" />
                  </button>
                </div>
                <div id="client-confirm-feedback">
                  {fieldErrors.confirmPassword && <p className="field-error">{fieldErrors.confirmPassword}</p>}
                  {validatePasswordMatch() && <p className="field-warning">{validatePasswordMatch()}</p>}
                  {formData.confirmPassword && formData.password === formData.confirmPassword && !validatePasswordMatch() && (
                    <p className="field-success"><i className="fa-solid fa-check" aria-hidden="true" /> Las contraseñas coinciden</p>
                  )}
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="client-phone">Teléfono de contacto</label>
                <div className={`input-wrapper ${fieldErrors.phone ? 'has-error' : ''}`}>
                  <i className="fa-solid fa-phone" aria-hidden="true" />
                  <input
                    id="client-phone"
                    type="tel"
                    name="phone"
                    data-testid="auth-phone"
                    placeholder="3229874810"
                    autoComplete="tel-national"
                    inputMode="numeric"
                    value={formData.phone}
                    aria-invalid={Boolean(fieldErrors.phone)}
                    aria-describedby={fieldErrors.phone ? 'client-phone-error' : undefined}
                    onChange={handleInputChange}
                  />
                </div>
                {fieldErrors.phone && <p id="client-phone-error" className="field-error">{fieldErrors.phone}</p>}
              </div>

              <div className="input-group">
                <label htmlFor="client-address">Dirección de residencia</label>
                <div className={`input-wrapper ${fieldErrors.address ? 'has-error' : ''}`}>
                  <i className="fa-solid fa-location-dot" aria-hidden="true" />
                  <input
                    id="client-address"
                    type="text"
                    name="address"
                    data-testid="auth-address"
                    placeholder="Cra 77A #45d sur..."
                    autoComplete="street-address"
                    value={formData.address}
                    aria-invalid={Boolean(fieldErrors.address)}
                    aria-describedby={fieldErrors.address ? 'client-address-error' : undefined}
                    onChange={handleInputChange}
                  />
                </div>
                {fieldErrors.address && <p id="client-address-error" className="field-error">{fieldErrors.address}</p>}
              </div>

              <div className="input-group">
                <label htmlFor="client-avatar">Foto de perfil (opcional)</label>
                <div className="image-upload-wrapper">
                  <div className="image-preview-box">
                    {imagePreview
                      ? <img src={imagePreview} alt="Vista previa de tu foto" className="image-preview" />
                      : <div className="image-placeholder"><i className="fa-solid fa-image" aria-hidden="true" /><p>Sin foto</p></div>
                    }
                  </div>
                  <input
                    id="client-avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={uploadingImage}
                    className="file-input"
                  />
                  {imagePreview && (
                    <button type="button" className="btn btn--ghost btn--sm" onClick={removeImage}>
                      Quitar
                    </button>
                  )}
                </div>
                {uploadingImage && <p className="uploading-text">Subiendo imagen…</p>}
              </div>
            </>
          )}

          {isLogin && (
            <button type="button" className="forgot-pass-btn" onClick={() => setShowForgot(true)}>
              ¿Olvidaste tu contraseña?
            </button>
          )}

          {error && (
            <div className="error-message" role="alert">
              <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="success-message" role="status">
              <i className="fa-solid fa-circle-check" aria-hidden="true" />
              <span>{success}</span>
            </div>
          )}

          <button type="submit" className="btn-auth-submit" data-testid="auth-submit" disabled={loading}>
            {loading && <span className="spinner" aria-hidden="true" />}
            {loading ? 'Procesando…' : (isLogin ? 'Iniciar sesión' : 'Crear mi cuenta')}
          </button>
        </form>

        {isLogin && env.googleClientId && (
          <>
            <div className="auth-divider"><span>o continúa con</span></div>
            <div className="social-auth">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => setError('No pudimos completar el acceso con Google. Intenta de nuevo.')}
                theme="outline"
                size="large"
                text="continue_with"
                width="360"
              />
            </div>
          </>
        )}

        {import.meta.env.DEV && (
          <div className="tech-demo-hint">
            <p><i className="fa-solid fa-circle-info" aria-hidden="true" /> Datos de prueba (CP06)</p>
            <p>cliente@mail.com · Contraseña: <strong>Cl@ve123*</strong></p>
          </div>
        )}
      </AuthLayout>
    </>
  )
}

export default ClientAuth
