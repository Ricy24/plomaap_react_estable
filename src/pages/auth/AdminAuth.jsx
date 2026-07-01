import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { validateLogin } from '../../utils/validation'
import ForgotPassword from './ForgotPassword'
import '../../styles/auth.css'

function AdminAuth() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [showForgot, setShowForgot] = useState(false)
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

      login(data.user, null, data.token)
    } catch (err) {
      setError(err.message || 'Error de conexión. ¿Está el backend en puerto 5000?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper view-transition">
      {showForgot && <ForgotPassword onClose={() => setShowForgot(false)} />}

      <div className="auth-layout">
        <button className="btn-back" onClick={() => navigate('/')}>
          <i className="fa-solid fa-arrow-left" /> Volver al inicio
        </button>

        <div className="auth-container">
          <div className="auth-form-side">
            <div className="auth-form-content">
              <div className="auth-header">
                <div className="logo-box"><div className="logo-dot" /><span>PlomApp</span></div>
                <span className="auth-role-badge admin">Acceso Admin</span>
                <h2 className="auth-title">Panel de administración</h2>
                <p className="auth-subtitle">Gestiona citas, usuarios y métricas de la plataforma.</p>
              </div>

              <form onSubmit={handleSubmit} className="auth-form" noValidate>
                <div className="input-group">
                  <label>Correo electrónico</label>
                  <div className={`input-wrapper ${fieldErrors.email ? 'has-error' : ''}`}>
                    <i className="fa-regular fa-envelope" />
                    <input type="email" name="email" placeholder="admin@plomapp.com"
                      value={formData.email}
                      onChange={e => { setFormData({ ...formData, email: e.target.value }); setFieldErrors({}); setError('') }}
                    />
                  </div>
                  {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
                </div>

                <div className="input-group">
                  <label>Contraseña</label>
                  <div className={`input-wrapper ${fieldErrors.password ? 'has-error' : ''}`}>
                    <i className="fa-solid fa-lock" />
                    <input type="password" name="password" placeholder="••••••••"
                      value={formData.password}
                      onChange={e => { setFormData({ ...formData, password: e.target.value }); setFieldErrors({}); setError('') }}
                    />
                  </div>
                  {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
                </div>

                <button type="button" className="forgot-pass-btn" onClick={() => setShowForgot(true)}>
                  ¿Olvidaste tu contraseña?
                </button>

                {error && <div className="error-message">{error}</div>}

                <button type="submit" className="btn-auth-submit admin-submit" disabled={loading}>
                  {loading ? 'Verificando...' : 'Iniciar sesión'}
                </button>
              </form>

              <div className="tech-demo-hint admin-access-hint">
                <p><i className="fa-solid fa-shield-halved" /> Acceso restringido de administración</p>
              </div>
            </div>
          </div>

          <div className="auth-visual-side admin-visual">
            <div className="visual-overlay" />
            <div className="visual-content">
              <div className="trust-badge"><i className="fa-solid fa-chart-pie" /></div>
              <h3>Control total.</h3>
              <p>Supervisa citas, técnicos y clientes desde un solo lugar.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminAuth
