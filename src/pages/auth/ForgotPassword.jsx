import { useEffect, useId, useRef, useState } from 'react'
import { authApi } from '../../services/api'
import { validateEmail, MESSAGES } from '../../utils/validation'

function ForgotPassword({ onClose }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const titleId = useId()
  const errorId = useId()

  useEffect(() => {
    inputRef.current?.focus()

    const onKeyDown = event => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose?.()
      }
    }

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

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
    <div
      className="auth-modal-overlay"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose?.()
      }}
    >
      <div
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          className="auth-modal-close"
          onClick={onClose}
          type="button"
          aria-label="Cerrar"
        >
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>
        <h3 id={titleId}>Recuperar contraseña</h3>
        <p>Ingresa tu correo registrado y te enviaremos un enlace de restablecimiento.</p>
        <form onSubmit={handleSubmit} noValidate>
          <div className="input-group">
            <label htmlFor="recovery-email">Correo electrónico</label>
            <div className={`input-wrapper ${error ? 'has-error' : ''}`}>
              <i className="fa-regular fa-envelope" aria-hidden="true" />
              <input
                id="recovery-email"
                ref={inputRef}
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={error ? errorId : undefined}
                onChange={e => { setEmail(e.target.value); setError(''); setSuccess('') }}
                placeholder="tu@correo.com"
              />
            </div>
            <div aria-live="polite">
              {error && <p className="field-error" id={errorId}>{error}</p>}
              {success && <p className="field-success">{success}</p>}
            </div>
          </div>
          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading && <span className="spinner" aria-hidden="true" />}
            {loading ? 'Enviando...' : 'Enviar enlace'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ForgotPassword
