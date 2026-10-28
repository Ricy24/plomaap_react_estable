import { useState } from 'react'
import { authApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { validateLogin } from '../../utils/validation'
import ForgotPassword from './ForgotPassword'
import AuthLayout from '../../components/auth/AuthLayout'
import '../../styles/auth.css'

function AdminAuth() {
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [showForgot, setShowForgot] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const errors = validateLogin(formData)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)
    try {
      const data = await authApi.login(formData.email.trim(), formData.password, 'admin')
      if (!data.success) { setError(data.message); return }

      if (data.user?.role !== 'admin') {
        setError('Acceso denegado. Esta cuenta no tiene permisos de administrador.')
        return
      }

      login(data.user, null, data.token)
    } catch (err) {
      setError(err.message || 'Error de conexión. Verifica que el backend esté disponible.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {showForgot && <ForgotPassword onClose={() => setShowForgot(false)} />}

      <AuthLayout
        badge="Acceso administrador"
        tone="admin"
        backTo="/"
        backLabel="Volver al inicio"
        title="Panel de administración"
        subtitle="Gestiona citas, usuarios y métricas de la plataforma."
        visualIcon="fa-chart-pie"
        visualTitle="Control total."
        visualText="Supervisa citas, técnicos y clientes desde un solo lugar."
        highlights={[
          'Métricas operativas en tiempo real',
          'Gestión completa de cuentas y roles',
          'Trazabilidad de cada servicio',
        ]}
        footer={
          <p className="auth-switch">
            <i className="fa-solid fa-shield-halved" aria-hidden="true" /> Acceso restringido a personal autorizado
          </p>
        }
      >
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="input-group">
            <label htmlFor="admin-email">Correo electrónico</label>
            <div className={`input-wrapper ${fieldErrors.email ? 'has-error' : ''}`}>
              <i className="fa-regular fa-envelope" aria-hidden="true" />
              <input
                id="admin-email"
                type="email"
                name="email"
                data-testid="auth-email"
                placeholder="admin@plomapp.com"
                autoComplete="email"
                inputMode="email"
                value={formData.email}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'admin-email-error' : undefined}
                onChange={e => {
                  setFormData({ ...formData, email: e.target.value })
                  setFieldErrors({})
                  setError('')
                }}
              />
            </div>
            {fieldErrors.email && <p id="admin-email-error" className="field-error">{fieldErrors.email}</p>}
          </div>

          <div className="input-group">
            <label htmlFor="admin-password">Contraseña</label>
            <div className={`input-wrapper ${fieldErrors.password ? 'has-error' : ''}`}>
              <i className="fa-solid fa-lock" aria-hidden="true" />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                data-testid="auth-password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={formData.password}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'admin-password-error' : undefined}
                onChange={e => {
                  setFormData({ ...formData, password: e.target.value })
                  setFieldErrors({})
                  setError('')
                }}
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
            {fieldErrors.password && <p id="admin-password-error" className="field-error">{fieldErrors.password}</p>}
          </div>

          <button type="button" className="forgot-pass-btn" onClick={() => setShowForgot(true)}>
            ¿Olvidaste tu contraseña?
          </button>

          {error && (
            <div className="error-message" role="alert">
              <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="btn-auth-submit" data-testid="auth-submit" disabled={loading}>
            {loading && <span className="spinner" aria-hidden="true" />}
            {loading ? 'Verificando…' : 'Iniciar sesión'}
          </button>
        </form>
      </AuthLayout>
    </>
  )
}

export default AdminAuth
