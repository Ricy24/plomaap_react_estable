import { useState } from 'react'
import { authApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { validateLogin } from '../../utils/validation'
import ForgotPassword from './ForgotPassword'
import AuthLayout from '../../components/auth/AuthLayout'
import '../../styles/auth.css'

function TechnicianAuth() {
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
      const data = await authApi.login(formData.email.trim(), formData.password, 'technician')
      if (!data.success) { setError(data.message); return }

      if (data.user?.role !== 'technician') {
        const roleName = data.user?.role === 'admin' ? 'Administrador' : 'Cliente'
        setError(`Esta cuenta tiene rol de ${roleName}. Por favor ingresa por el portal correspondiente.`)
        return
      }

      login(data.user, data.technicianProfile, data.token)
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
        badge="Acceso técnico"
        tone="technician"
        backTo="/ingresar"
        title="Panel de técnicos"
        subtitle="Ingresa para ver tus citas, horarios y servicios del día."
        visualIcon="fa-user-gear"
        visualTitle="Gestiona tus servicios."
        visualText="Consulta citas, actualiza estados y organiza tu jornada de trabajo."
        highlights={[
          'Agenda y estados siempre sincronizados',
          'Clientes verificados y direcciones exactas',
          'Define tu disponibilidad semanal',
        ]}
        footer={
          <p className="auth-switch">
            ¿Aún no eres parte de la red? <a href="mailto:tecnicos@plomapp.co">Escríbenos</a>
          </p>
        }
      >
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="input-group">
            <label htmlFor="tech-email">Correo electrónico</label>
            <div className={`input-wrapper ${fieldErrors.email ? 'has-error' : ''}`}>
              <i className="fa-regular fa-envelope" aria-hidden="true" />
              <input
                id="tech-email"
                type="email"
                name="email"
                data-testid="auth-email"
                placeholder="tecnico@mail.com"
                autoComplete="email"
                inputMode="email"
                value={formData.email}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'tech-email-error' : undefined}
                onChange={e => {
                  setFormData({ ...formData, email: e.target.value })
                  setFieldErrors({})
                  setError('')
                }}
              />
            </div>
            {fieldErrors.email && <p id="tech-email-error" className="field-error">{fieldErrors.email}</p>}
          </div>

          <div className="input-group">
            <label htmlFor="tech-password">Contraseña</label>
            <div className={`input-wrapper ${fieldErrors.password ? 'has-error' : ''}`}>
              <i className="fa-solid fa-lock" aria-hidden="true" />
              <input
                id="tech-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                data-testid="auth-password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={formData.password}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'tech-password-error' : undefined}
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
            {fieldErrors.password && <p id="tech-password-error" className="field-error">{fieldErrors.password}</p>}
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

        {import.meta.env.DEV && (
          <div className="tech-demo-hint">
            <p><i className="fa-solid fa-circle-info" aria-hidden="true" /> Datos de prueba (CP07)</p>
            <p>tecnico@mail.com · Contraseña: <strong>T3cnic0_2026</strong></p>
          </div>
        )}
      </AuthLayout>
    </>
  )
}

export default TechnicianAuth
