import { useState } from 'react'
import FloatingNav from '../components/FloatingNav'
import Header from '../components/Header'
import '../styles/contacto.css'

function Contacto({ onNavSelect }) {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: ''
  })

  const [enviado, setEnviado] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setEnviado(true)
    setTimeout(() => setEnviado(false), 3000)
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      asunto: '',
      mensaje: ''
    })
  }

  return (
    <div className="page-wrapper view-transition">
      <FloatingNav activeLabel="Contacto" onSelect={onNavSelect} theme="light" />
      <Header variant="light" showAuthButtons={true} />
      <div className="page-content">
        <div className="contacto-page">
        {/* HERO SECTION */}
        <section className="hero-contacto">
          <div className="hero-content">
            <h1>Estamos para Ayudarte</h1>
            <p>¿Preguntas o sugerencias? Nos encantaría escucharte</p>
          </div>
        </section>

        {/* CONTENEDOR PRINCIPAL */}
        <section className="contacto-main">
          {/* COLUMNA IZQUIERDA - INFORMACIÓN */}
          <div className="info-column">
            <h2>¿Cómo Contactarnos?</h2>
            
            <div className="contact-method">
              <div className="method-icon">
                <i className="fa-solid fa-envelope"></i>
              </div>
              <div className="method-content">
                <h4>Email</h4>
                <p>soporte@techconnectpro.com</p>
                <small>Respuestas en menos de 24 horas</small>
              </div>
            </div>

            <div className="contact-method">
              <div className="method-icon">
                <i className="fa-solid fa-phone"></i>
              </div>
              <div className="method-content">
                <h4>Teléfono</h4>
                <p>+57 (1) 234 5678</p>
                <small>Disponible de lunes a viernes, 8am-6pm</small>
              </div>
            </div>

            <div className="contact-method">
              <div className="method-icon">
                <i className="fa-solid fa-map-location-dot"></i>
              </div>
              <div className="method-content">
                <h4>Ubicación</h4>
                <p>Bogotá, Colombia</p>
                <small>Oficinas en principales ciudades</small>
              </div>
            </div>

            <div className="contact-method">
              <div className="method-icon">
                <i className="fa-solid fa-comments"></i>
              </div>
              <div className="method-content">
                <h4>Chat en Vivo</h4>
                <p>Disponible en la app</p>
                <small>Soporte instantáneo cuando lo necesites</small>
              </div>
            </div>

            {/* REDES SOCIALES */}
            <div className="social-section">
              <h4>Síguenos</h4>
              <div className="social-links">
                <a href="#" className="social-icon">
                  <i className="fa-brands fa-facebook"></i>
                </a>
                <a href="#" className="social-icon">
                  <i className="fa-brands fa-twitter"></i>
                </a>
                <a href="#" className="social-icon">
                  <i className="fa-brands fa-instagram"></i>
                </a>
                <a href="#" className="social-icon">
                  <i className="fa-brands fa-linkedin"></i>
                </a>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA - FORMULARIO */}
          <div className="form-column">
            <h2>Envíanos un Mensaje</h2>
            
            {enviado && (
              <div className="success-message">
                <i className="fa-solid fa-check-circle"></i>
                <p>¡Mensaje enviado exitosamente! Nos pondremos en contacto pronto.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="nombre">Nombre Completo</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="telefono">Teléfono</label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="+57 123456789"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="asunto">Asunto</label>
                <select
                  id="asunto"
                  name="asunto"
                  value={formData.asunto}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona un asunto</option>
                  <option value="soporte">Soporte Técnico</option>
                  <option value="facturacion">Facturación</option>
                  <option value="sugerencia">Sugerencia</option>
                  <option value="reportar">Reportar Problema</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="mensaje">Mensaje</label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleChange}
                  placeholder="Cuéntanos cómo podemos ayudarte..."
                  rows="6"
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn-submit">
                Enviar Mensaje <i className="fa-solid fa-paper-plane"></i>
              </button>
            </form>
          </div>
        </section>

        {/* FAQ */}
        <section className="faq-section">
          <h2>Preguntas Frecuentes</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h4>¿Cuál es el horario de atención?</h4>
              <p>Disponibles 24/7 a través de la plataforma. Soporte por teléfono de lunes a viernes 8am-6pm</p>
            </div>
            <div className="faq-item">
              <h4>¿Qué tan rápido responden?</h4>
              <p>Respuestas vía email en menos de 24 horas. Chat en vivo en minutos</p>
            </div>
            <div className="faq-item">
              <h4>¿Hablan otros idiomas?</h4>
              <p>Sí, soporte disponible en español e inglés</p>
            </div>
            <div className="faq-item">
              <h4>¿Cómo reporto un problema?</h4>
              <p>Puedes reportar directamente en la app o usar el formulario de contacto</p>
            </div>
          </div>
        </section>
        </div>
      </div>
    </div>
  )
}

export default Contacto
