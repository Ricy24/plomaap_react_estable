import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { authApi } from '../../services/api'
import '../../styles/auth.css'

function ClientAuth({ onBack, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '',
    address: localStorage.getItem('selectedAddress') || '', avatar: null
  })

  const saveSession = (data) => {
    localStorage.setItem('authToken', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    localStorage.setItem('userRole', 'user')
    onLoginSuccess(data.user)
  }

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const uploadToCloudinary = async (file) => {
    setUploadingImage(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: fd }
      )
      const data = await res.json()
      if (data.secure_url) {
        setFormData(prev => ({ ...prev, avatar: data.secure_url }))
      } else {
        setError(data.error?.message || 'Error al subir la imagen')
      }
    } catch {
      setError('Error al conectar con Cloudinary')
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      let data
      if (isLogin) {
        data = await authApi.login(formData.email, formData.password, 'user')
      } else {
        data = await authApi.register(formData)
      }
      if (!data.success) { setError(data.message); return }
      saveSession(data)
    } catch (err) {
      setError(err.message || 'Error de conexión. ¿Está el backend en puerto 5000?')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async (credentialResponse) => {
    setLoading(true)
    setError('')
    try {
      const base64 = credentialResponse.credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
      const googleUser = JSON.parse(decodeURIComponent(
        atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      ))

      let data = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: googleUser.email, password: 'google_' + googleUser.sub, role: 'user' })
      }).then(r => r.json())

      if (!data.success) {
        data = await authApi.register({
          name: googleUser.name, email: googleUser.email,
          password: 'google_' + googleUser.sub, phone: '',
          address: localStorage.getItem('selectedAddress') || '',
          avatar: googleUser.picture
        })
      }

      if (!data.success) { setError(data.message); return }
      saveSession(data)
    } catch {
      setError('Error al procesar Google Login')
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
                <span className="auth-role-badge client">Acceso Cliente</span>
                <h2 className="auth-title">{isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}</h2>
                <p className="auth-subtitle">
                  {isLogin ? 'Ingresa para agendar reparaciones en tu hogar.' : 'Únete a la red de mantenimiento más confiable de Bogotá.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                {!isLogin && (
                  <div className="input-group slide-down">
                    <label>Nombre completo</label>
                    <div className="input-wrapper">
                      <i className="fa-regular fa-user" />
                      <input type="text" name="name" placeholder="Ej. Andrés Pérez" value={formData.name} onChange={handleInputChange} required />
                    </div>
                  </div>
                )}
                <div className="input-group">
                  <label>Correo electrónico</label>
                  <div className="input-wrapper">
                    <i className="fa-regular fa-envelope" />
                    <input type="email" name="email" placeholder="tu@correo.com" value={formData.email} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="input-group">
                  <label>Contraseña</label>
                  <div className="input-wrapper">
                    <i className="fa-solid fa-lock" />
                    <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleInputChange} required />
                  </div>
                </div>
                {!isLogin && (
                  <>
                    <div className="input-group">
                      <label>Teléfono (opcional)</label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-phone" />
                        <input type="tel" name="phone" placeholder="3001234567" value={formData.phone} onChange={handleInputChange} />
                      </div>
                    </div>
                    <div className="input-group">
                      <label>Dirección</label>
                      <div className="input-wrapper">
                        <i className="fa-solid fa-location-dot" />
                        <input type="text" name="address" placeholder="Ej. Calle 85 # 11-53..." value={formData.address} onChange={handleInputChange} required />
                      </div>
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
                {error && <div className="error-message">{error}</div>}
                <button type="submit" className="btn-auth-submit" disabled={loading}>
                  {loading ? 'Procesando...' : (isLogin ? 'Ingresar a mi cuenta' : 'Registrarme')}
                </button>
              </form>

              <div className="auth-divider"><span>O continúa con</span></div>
              <div className="social-auth">
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={() => setError('Error con Google Login')}
                  theme="outline" size="large" text="continue_with"
                />
              </div>

              <p className="auth-switch">
                {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                <button onClick={() => { setIsLogin(!isLogin); setError(''); setImagePreview(null) }}>
                  {isLogin ? 'Regístrate' : 'Ingresa'}
                </button>
              </p>
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
