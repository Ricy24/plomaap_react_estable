import { useState } from 'react'
import { authApi } from '../../services/api'
import '../../styles/auth.css'

function TechnicianAuth({ onBack, onLoginSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await authApi.login(formData.email, formData.password, 'technician')
      if (!data.success) { setError(data.message); return }

      localStorage.setItem('authToken', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('userRole', 'technician')
      if (data.technicianProfile) {
        localStorage.setItem('technicianProfile', JSON.stringify(data.technicianProfile))
      }
      onLoginSuccess(data.user, data.technicianProfile)
    } catch (err) {
      setError(err.message || 'Error de conexión. ¿Está el backend en puerto 5000?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper view-transition">
      <div className="auth-layout">
        <button className="btn-back" onClick={onBack}>
          <i className="fa-solid fa-arrow-left" /> Volver
        </button>

        <div className="auth-container">
          <div className="auth-form-side">
            <div className="auth-form-content">
              <div className="auth-header">
                <div className="logo-box"><div className="logo-dot" /><span>PlomApp</span></div>
                <span className="auth-role-badge technician">Acceso Técnico</span>
                <h2 className="auth-title">Panel de técnicos</h2>
                <p className="auth-subtitle">Ingresa para ver tus citas, horarios y servicios del día.</p>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="input-group">
                  <label>Correo electrónico</label>
                  <div className="input-wrapper">
                    <i className="fa-regular fa-envelope" />
                    <input type="email" name="email" placeholder="tecnico@example.com"
                      value={formData.email}
                      onChange={e => { setFormData({ ...formData, email: e.target.value }); setError('') }}
                      required />
                  </div>
                </div>
                <div className="input-group">
                  <label>Contraseña</label>
                  <div className="input-wrapper">
                    <i className="fa-solid fa-lock" />
                    <input type="password" name="password" placeholder="••••••••"
                      value={formData.password}
                      onChange={e => { setFormData({ ...formData, password: e.target.value }); setError('') }}
                      required />
                  </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                <button type="submit" className="btn-auth-submit technician-submit" disabled={loading}>
                  {loading ? 'Verificando...' : 'Ingresar al panel'}
                </button>
              </form>

              <div className="tech-demo-hint">
                <p><i className="fa-solid fa-circle-info" /> Cuentas demo:</p>
                <p>tecnico@example.com · carlos.tecnico@example.com · luis.tecnico@example.com</p>
                <p>Contraseña: <strong>123456</strong></p>
              </div>
            </div>
          </div>

          <div className="auth-visual-side tech-visual">
            <div className="visual-overlay" />
            <div className="visual-content">
              <div className="trust-badge"><i className="fa-solid fa-user-gear" /></div>
              <h3>Gestiona tus servicios.</h3>
              <p>Consulta citas, actualiza estados y organiza tu jornada de trabajo.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TechnicianAuth
