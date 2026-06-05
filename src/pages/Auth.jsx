import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import '../styles/auth.css'

function Auth({ onBack, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: localStorage.getItem('selectedAddress') || '',
    avatar: null
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      // Mostrar preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)

      // Subir a Cloudinary
      await uploadToCloudinary(file)
    }
  }

  const uploadToCloudinary = async (file) => {
    setUploadingImage(true)
    try {
      const formDataCloud = new FormData()
      formDataCloud.append('file', file)
      formDataCloud.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formDataCloud
        }
      )

      const data = await response.json()
      
      if (data.secure_url) {
        setFormData(prev => ({
          ...prev,
          avatar: data.secure_url
        }))
      } else {
        setError('Error al subir la imagen')
      }
    } catch (err) {
      setError('Error al conectar con Cloudinary')
      console.error('Error:', err)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const endpoint = isLogin ? 'login' : 'register'
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { 
            name: formData.name, 
            email: formData.email, 
            password: formData.password,
            phone: formData.phone,
            address: formData.address,
            avatar: formData.avatar
          }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.message || 'Error en la autenticación')
        setLoading(false)
        return
      }

      // Guardar token y usuario en localStorage
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      // Limpiar formulario
      setFormData({ name: '', email: '', password: '', phone: '', address: '', avatar: null })
      setImagePreview(null)
      
      // Notificar al padre que el login fue exitoso
      onLoginSuccess(data.user)
    } catch (err) {
      setError('Error de conexión con el servidor. ¿Está ejecutándose en puerto 5000?')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setLoading(true)
      setError('')

      // Decodificar el JWT (simple)
      const base64Url = credentialResponse.credential.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      
      const googleUser = JSON.parse(jsonPayload)

      // Intentar login con google, si no existe, crear cuenta
      let endpoint = 'login'
      const payload = {
        email: googleUser.email,
        password: 'google_' + googleUser.sub // ID de Google como contraseña
      }

      let response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      let data = await response.json()

      // Si no existe, crear nuevo usuario
      if (!data.success) {
        endpoint = 'register'
        const registerPayload = {
          name: googleUser.name,
          email: googleUser.email,
          password: 'google_' + googleUser.sub,
          phone: '',
          address: localStorage.getItem('selectedAddress') || '',
          avatar: googleUser.picture
        }

        response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registerPayload)
        })

        data = await response.json()
      }

      if (!data.success) {
        setError(data.message || 'Error con Google Login')
        return
      }

      // Guardar token y usuario
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      onLoginSuccess(data.user)

    } catch (err) {
      setError('Error al procesar Google Login')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper view-transition">
      
      {/* NUEVO CONTENEDOR: Mantiene el botón y la tarjeta en su lugar */}
      <div className="auth-layout">
        
        <button className="btn-back" onClick={onBack}>
          <i className="fa-solid fa-arrow-left"></i> Volver al inicio
        </button>

        <div className="auth-container">
          
          {/* LADO IZQUIERDO: EL FORMULARIO */}
          <div className="auth-form-side">
            <div className="auth-form-content">
              
              <div className="auth-header">
                <div className="logo-box">
                  <div className="logo-dot"></div>
                  <span>PlomApp</span>
                </div>
                <h2 className="auth-title">
                  {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
                </h2>
                <p className="auth-subtitle">
                  {isLogin 
                    ? 'Ingresa tus datos para continuar con tu solicitud.' 
                    : 'Únete a la red de mantenimiento más confiable de Bogotá.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                {!isLogin && (
                  <div className="input-group slide-down">
                    <label>Nombre completo</label>
                    <div className="input-wrapper">
                      <i className="fa-regular fa-user"></i>
                      <input 
                        type="text" 
                        name="name"
                        placeholder="Ej. Andrés Pérez" 
                        value={formData.name}
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                  </div>
                )}

                <div className="input-group">
                  <label>Correo electrónico</label>
                  <div className="input-wrapper">
                    <i className="fa-regular fa-envelope"></i>
                    <input 
                      type="email" 
                      name="email"
                      placeholder="tu@correo.com" 
                      value={formData.email}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Contraseña</label>
                  <div className="input-wrapper">
                    <i className="fa-solid fa-lock"></i>
                    <input 
                      type="password" 
                      name="password"
                      placeholder="••••••••" 
                      value={formData.password}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  {isLogin && <a href="#" className="forgot-pass">¿Olvidaste tu contraseña?</a>}
                </div>

                {!isLogin && (
                  <div className="input-group">
                    <label>Teléfono (opcional)</label>
                    <div className="input-wrapper">
                      <i className="fa-solid fa-phone"></i>
                      <input 
                        type="tel" 
                        name="phone"
                        placeholder="3001234567" 
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                )}

                {!isLogin && (
                  <div className="input-group">
                    <label>Dirección</label>
                    <div className="input-wrapper">
                      <i className="fa-solid fa-location-dot"></i>
                      <input 
                        type="text" 
                        name="address"
                        placeholder="Ej. Calle 85 # 11-53, Chapinero..." 
                        value={formData.address}
                        onChange={handleInputChange}
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                {!isLogin && (
                  <div className="input-group">
                    <label>Foto de perfil (opcional)</label>
                    <div className="image-upload-wrapper">
                      <div className="image-preview-box">
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="image-preview" />
                        ) : (
                          <div className="image-placeholder">
                            <i className="fa-solid fa-image"></i>
                            <p>Selecciona una imagen</p>
                          </div>
                        )}
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange}
                        disabled={uploadingImage}
                        className="file-input"
                      />
                      {uploadingImage && <p className="uploading-text">Subiendo imagen...</p>}
                    </div>
                  </div>
                )}

                {error && <div className="error-message">{error}</div>}

                <button type="submit" className="btn-auth-submit" disabled={loading}>
                  {loading ? 'Procesando...' : (isLogin ? 'Ingresar a mi cuenta' : 'Registrarme')}
                </button>
              </form>

              <div className="auth-divider">
                <span>O continúa con</span>
              </div>

              <div className="social-auth">
                <div className="google-login-wrapper">
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => setError('Error al iniciar sesión con Google')}
                    theme="outline"
                    size="large"
                    text={isLogin ? "signin_with" : "signup_with"}
                  />
                </div>
              </div>

              <p className="auth-switch">
                {isLogin ? '¿No tienes una cuenta? ' : '¿Ya tienes una cuenta? '}
                <button onClick={() => {
                  setIsLogin(!isLogin)
                  setError('')
                  setImagePreview(null)
                  setFormData({ name: '', email: '', password: '', phone: '', address: localStorage.getItem('selectedAddress') || '', avatar: null })
                }}>
                  {isLogin ? 'Regístrate aquí' : 'Ingresa aquí'}
                </button>
              </p>

            </div>
          </div>

          {/* LADO DERECHO: VISUAL DE CONFIANZA */}
          <div className="auth-visual-side">
            <div className="visual-overlay"></div>
            <div className="visual-content">
              <div className="trust-badge">
                <i className="fa-solid fa-shield-check"></i>
              </div>
              <h3>Tu tranquilidad es nuestra prioridad.</h3>
              <p>Conectamos hogares con soluciones rápidas, seguras y garantizadas.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Auth