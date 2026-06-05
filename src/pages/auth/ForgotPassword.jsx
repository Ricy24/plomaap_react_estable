import { useState } from 'react'
import { authApi } from '../../services/api'
import { validateEmail, MESSAGES } from '../../utils/validation'

function ForgotPassword({ onClose }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const emailError = validateEmail(email)
    if (emailError) {
      setError(emailError)
      setSuccess('')
      return
    }

    setLoading(true)
    setError('')
    try {
      const data = await authApi.forgotPassword(email.trim())
      if (!data.success) {
        setError(data.message)
        return
      }
      setSuccess(MESSAGES.recoverySent)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose} type="button">
          <i className="fa-solid fa-xmark" />
        </button>
        <h3>Recuperar contraseña</h3>
        <p>Ingresa tu correo registrado y te enviaremos un enlace de restablecimiento.</p>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Correo electrónico</label>
            <div className="input-wrapper">
              <i className="fa-regular fa-envelope" />
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); setSuccess('') }}
                placeholder="tu@correo.com"
              />
            </div>
            {error && <p className="field-error">{error}</p>}
            {success && <p className="field-success">{success}</p>}
          </div>
          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar enlace'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ForgotPassword
