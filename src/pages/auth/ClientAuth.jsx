import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { authApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { uploadImageToCloudinary } from '../../utils/cloudinary'
import {
  validateLogin,
  validateRegister,
  normalizePhone,
  MESSAGES
} from '../../utils/validation'
import ForgotPassword from './ForgotPassword'
import '../../styles/auth.css'

const EMPTY_FORM = {
  name: '', email: '', password: '', confirmPassword: '',
  phone: '', address: localStorage.getItem('selectedAddress') || '', avatar: null
}

function ClientAuth() {
  const navigate = useNavigate()
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

  const saveSession = (data) => {
    localStorage.setItem('authToken', data.token)
    login(data.user)
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

  const switchMode = (login) => {
    setIsLogin(login)
    setError('')
    setSuccess('')
    setFieldErrors({})
    setImagePreview(null)
    if (login) {
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
              setError(data.message); 
              return; 
          }
          saveSession(data);
          navigate('/cliente'); 
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
              setError(data.message); 
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
      setError('Error de conexión. Verifica que el servidor Flask esté corriendo.');
  } finally {
      setLoading(false);
  }
}

  const handleGoogleLogin = async (credentialResponse) => {
    setLoading(true)
    setError('')
    setFieldErrors({})
    try {
      // 1. Tomamos el token intacto que nos dio Google
      const token = credentialResponse.credential

      // 2. Lo enviamos a la ruta CORRECTA del backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: token })
      })
      
      const data = await response.json()

      // 3. Verificamos la respuesta
      if (!response.ok) {
        setError(data.error || 'Error al iniciar sesión con Google')
        return
      }
      
      // 4. Éxito: Guardamos la sesión
      saveSession({ token: data.token, user: data.user })
      
    } catch (err) {
      setError('Error de red al procesar Google Login. Verifica que el servidor Flask esté corriendo.')
    } finally {
      setLoading(false)
    }
}

  return (
    <div className="auth-wrapper view-transition">
      {showForgot && <ForgotPassword onClose={() => setShowForgot(false)} />}

      <div className="auth-layout">
        <button className="btn-back" onClick={() => navigate('/ingresar')}>
          <i className="fa-solid fa-arrow-left" /> Volver
        </button>

        <div className="auth-container">
          <div className="auth-form-side">
            <div className="auth-form-content">
              <div className="auth-header">
                <div className="logo-box"><div className="logo-dot" /><span>PlomApp</span></div>
                <span className="auth-role-badge client">Acceso Cliente</span>
                <h2 className="auth-title">{isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}</h2>
                <p className="auth-subtitle">
                  {isLogin
                    ? 'Ingresa para agendar reparaciones en tu hogar.'
                    : 'Completa todos los campos para registrarte como cliente.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="auth-form" noValidate>
                {!isLogin && (
                  <div className="input-group slide-down">
                    <label>Nombre completo</label>
                    <div className={`input-wrapper ${fieldErrors.name ? 'has-error' : ''}`}>
                      <i className="fa-regular fa-user" />
                      <input type="text" name="name" placeholder="Ej. Juan Pérez"
                        value={formData.name} onChange={handleInputChange} />
                    </div>
                    {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}
                  </div>
                )}

                <div className="input-group">
                  <label>Correo electrónico</label>
                  <div className={`input-wrapper ${fieldErrors.email ? 'has-error' : ''}`}>
                    <i className="fa-regular fa-envelope" />
                    <input type="email" name="email" placeholder="cliente@mail.com"
                      value={formData.email} onChange={handleInputChange} />
                  </div>
                  {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
                </div>

                <div className="input-group">
                  <label>Contraseña</label>
                  <div className={`input-wrapper ${fieldErrors.password ? 'has-error' : ''}`}>
                    <i className="fa-solid fa-lock" />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      name="password" 
                      placeholder="Mín. 8 caracteres"
                      value={formData.password} 
                      onChange={handleInputChange} 
                    />
                    <button
                      type="button"
                      className="toggle-password-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? 'Ocultar' : 'Mostrar'}
                    >
                      <i className={`fa-solid fa-eye${showPassword ? '' : '-slash'}`} />
                    </button>
                  </div>
                  {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
                  {!isLogin && !fieldErrors.password && (
                    <p className="field-hint">Mayúscula, minúscula, número y carácter especial (ej. T3cnic0_2026)</p>
                  )}
                </div>

                {!isLogin && (
                  <>
                    <div className="input-group">
                      <label>Confirmar contraseña</label>
                      <div className={`input-wrapper ${fieldErrors.confirmPassword ? 'has-error' : ''} ${validatePasswordMatch() ? 'has-warning' : formData.confirmPassword && formData.password === formData.confirmPassword ? 'has-success' : ''}`}>
                        <i className="fa-solid fa-lock" />
                        <input 
                          type={showConfirmPassword ? 'text' : 'password'} 
                          name="confirmPassword" 
                          placeholder="Repita su contraseña"
                          value={formData.confirmPassword} 
                          onChange={handleInputChange} 
                        />
                        <button
                          type="button"
                          className="toggle-password-btn"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          title={showConfirmPassword ? 'Ocultar' : 'Mostrar'}
                        >
                          <i className={`fa-solid fa-eye${showConfirmPassword ? '' : '-slash'}`} />
                        </button>
                      </div>
                      {fieldErrors.confirmPassword && <p className="field-error">{fieldErrors.confirmPassword}</p>}
                      {validatePasswordMatch() && <p className="field-warning">{validatePasswordMatch()}</p>}
                      {formData.confirmPassword && formData.password === formData.confirmPassword && !validatePasswordMatch() && (
                        <p className="field-success"><i className="fa-solid fa-check" /> Las contraseñas coinciden</p>
                      )}
                    </div>

                    <div className="input-group">
                      <label>Teléfono de contacto</label>
                      <div className={`input-wrapper ${fieldErrors.phone ? 'has-error' : ''}`}>
                        <i className="fa-solid fa-phone" />
                        <input type="tel" name="phone" placeholder="3229874810"
                          value={formData.phone} onChange={handleInputChange} />
                      </div>
                      {fieldErrors.phone && <p className="field-error">{fieldErrors.phone}</p>}
                    </div>

                    <div className="input-group">
                      <label>Dirección de residencia</label>
                      <div className={`input-wrapper ${fieldErrors.address ? 'has-error' : ''}`}>
                        <i className="fa-solid fa-location-dot" />
                        <input type="text" name="address" placeholder="Cra 77A #45d sur..."
                          value={formData.address} onChange={handleInputChange} />
                      </div>
                      {fieldErrors.address && <p className="field-error">{fieldErrors.address}</p>}
                    </div>

                    <div className="input-group">
                      <label>Foto de perfil (opcional)</label>
                      <div className="image-upload-wrapper">
                        <div className="image-preview-box">
                          {imagePreview
                            ? <img src={imagePreview} alt="Preview" className="image-preview" />
                            : <div className="image-placeholder"><i className="fa-solid fa-image" /><p>Selecciona una imagen</p></div>
                          }
                        </div>
                        <input type="file" accept="image/*" onChange={handleImageChange} disabled={uploadingImage} className="file-input" />
                        {uploadingImage && <p className="uploading-text">Subiendo imagen...</p>}
                      </div>
                    </div>
                  </>
                )}

                {isLogin && (
                  <button type="button" className="forgot-pass-btn" onClick={() => setShowForgot(true)}>
                    ¿Olvidaste tu contraseña?
                  </button>
                )}

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <button type="submit" className="btn-auth-submit" disabled={loading}>
                  {loading ? 'Procesando...' : (isLogin ? 'Iniciar sesión' : 'Registrarse')}
                </button>
              </form>

              {isLogin && (
                <>
                  <div className="auth-divider"><span>O continúa con</span></div>
                  <div className="social-auth">
                    <GoogleLogin
                      onSuccess={handleGoogleLogin}
                      onError={() => setError('Error con Google Login')}
                      theme="outline" size="large" text="continue_with"
                    />
                  </div>
                </>
              )}

              <p className="auth-switch">
                {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                <button type="button" onClick={() => switchMode(!isLogin)}>
                  {isLogin ? 'Regístrate' : 'Ingresa'}
                </button>
              </p>

              <div className="tech-demo-hint">
                <p><i className="fa-solid fa-circle-info" /> Casos de prueba (CP06):</p>
                <p>cliente@mail.com · Contraseña: <strong>Cl@ve123*</strong></p>
              </div>
            </div>
          </div>

          <div className="auth-visual-side client-visual">
            <div className="visual-overlay" />
            <div className="visual-content">
              <div className="trust-badge"><i className="fa-solid fa-house-chimney" /></div>
              <h3>Tu hogar, en buenas manos.</h3>
              <p>Agenda plomería, fugas y destapes con técnicos verificados en Bogotá.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientAuth
