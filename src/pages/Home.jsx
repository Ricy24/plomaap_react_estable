import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import '../styles/landing.css'
import '../styles/address-map.css'
import Header from '../components/Header'
import HeroSection from '../components/HeroSection'
import AddressMap from '../components/AddressMap'

function Home() {
  const navigate = useNavigate()
  const [demoAddress, setDemoAddress] = useState('Bogotá')

  return (
    <div className="landing-elegant">
      <Header onLogin={() => navigate('/ingresar')} />
      <HeroSection onLogin={() => navigate('/ingresar')} />

      <section id="como-funciona" className="info-section bg-light">
        <div className="section-header">
          <span className="section-subtitle">NUESTRO PROCESO</span>
          <h2>Diseñado para no hacerte pensar.</h2>
        </div>

        <div className="process-grid">
          <div className="process-card hover-anim">
            <h3 className="step-number">01</h3>
            <h4>Describe e identifica</h4>
            <p>Usa nuestra inteligencia artificial para diagnosticar el problema con una foto y obtener un presupuesto base al instante.</p>
          </div>
          <div className="process-card hover-anim">
            <h3 className="step-number">02</h3>
            <h4>Conexión inmediata</h4>
            <p>El sistema ubica al técnico más cercano y cualificado en Bogotá, mostrándote su perfil y tiempo de llegada.</p>
          </div>
          <div className="process-card hover-anim">
            <h3 className="step-number">03</h3>
            <h4>Solución y pago</h4>
            <p>El trabajo se realiza bajo nuestros estándares. Solo pagas a través de la app cuando el problema esté resuelto.</p>
          </div>
        </div>
      </section>

      <section id="ubicacion-demo" className="location-demo-section">
        <div className="section-header">
          <span className="section-subtitle">ENCUENTRA TU UBICACIÓN</span>
          <h2>Busca tu dirección en Bogotá en segundos</h2>
          <p>Prueba nuestro sistema de localización inteligente. Escribe tu dirección y ve exactamente dónde recibirás el servicio.</p>
        </div>

        <div className="demo-map-container">
          <AddressMap 
            address={demoAddress}
            editable={true}
            onLocationChange={(coords) => {
              console.log('Ubicación encontrada:', coords)
            }}
            onAddressChange={setDemoAddress}
          />
        </div>

        <div className="demo-benefits">
          <div className="benefit-item">
            <i className="fa-solid fa-check-circle"></i>
            <h4>Ubicación precisa</h4>
            <p>Sabe exactamente dónde llegará el técnico</p>
          </div>
          <div className="benefit-item">
            <i className="fa-solid fa-bolt"></i>
            <h4>Búsqueda rápida</h4>
            <p>Resultados en tiempo real mientras escribes</p>
          </div>
          <div className="benefit-item">
            <i className="fa-solid fa-map-location-dot"></i>
            <h4>Solo en Bogotá</h4>
            <p>Servicio disponible en toda la ciudad</p>
          </div>
        </div>

        <div className="demo-cta">
          <p>¿Listo para agendar? Únete a miles de clientes satisfechos</p>
          <button className="btn-solid-primary" onClick={() => navigate('/ingresar')}>
            <i className="fa-solid fa-arrow-right"></i> Agendar ahora
          </button>
        </div>
      </section>

      <section id="garantias" className="info-section">
        <div className="trust-layout">
          <div className="trust-text">
            <span className="section-subtitle">SEGURIDAD ANTE TODO</span>
            <h2>No metes a cualquiera a tu casa. Nosotros tampoco.</h2>
            <p>Hemos construido un ecosistema cerrado donde la confianza es el pilar fundamental. Cada profesional y cada transacción están respaldados.</p>

            <ul className="trust-list">
              <li>
                <i className="fa-solid fa-shield-check"></i>
                <div>
                  <strong>Identidad Verificada</strong>
                  <span>Revisamos antecedentes judiciales y experiencia comprobable de cada profesional.</span>
                </div>
              </li>
              <li>
                <i className="fa-solid fa-lock"></i>
                <div>
                  <strong>Pagos 100% Seguros</strong>
                  <span>Tu dinero está protegido. Retenemos el pago hasta que apruebes el trabajo finalizado.</span>
                </div>
              </li>
              <li>
                <i className="fa-solid fa-certificate"></i>
                <div>
                  <strong>Garantía PlomApp</strong>
                  <span>Si algo sale mal con la reparación, nos hacemos cargo de enviar a alguien a solucionarlo sin costo extra.</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="trust-image-wrapper image-reveal">
            <img
              src="https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?q=80&w=800&auto=format&fit=crop"
              alt="Confianza y seguridad"
            />
          </div>
        </div>
      </section>

      <section id="tecnicos" className="tech-section">
        <div className="tech-box">
          <h2>¿Eres un profesional de excelencia?</h2>
          <p>Buscamos expertos en mantenimiento que quieran multiplicar sus ingresos, manejar su propio tiempo y pertenecer a la red más exclusiva de servicios a domicilio.</p>
          <button className="btn-solid-white" onClick={() => navigate('/ingresar/tecnico')}>Acceso para Técnicos</button>
        </div>
      </section>

      <footer className="elegant-footer">
        <div className="footer-content">
          <div className="header-logo"><div className="logo-dot"></div><span>PlomApp</span></div>
          <p>© 2026 PlomApp Colombia. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

export default Home
