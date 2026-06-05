import '../styles/landing.css'
import Header from '../components/Header'
import HeroSection from '../components/HeroSection'

function Home({ onLogin, onTechnicianLogin }) {
  return (
    <div className="landing-elegant">
      
      {/* HEADER SOFISTICADO Y FIJO */}
      <Header onLogin={onLogin} />

      {/* 1. HERO: LA UBICACIÓN Y SERVICIOS (El punto de entrada) */}
      <HeroSection onLogin={onLogin} />

      {/* 2. SECCIÓN: CÓMO FUNCIONA (Animaciones y claridad) */}
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

      {/* 3. SECCIÓN: GARANTÍAS Y SEGURIDAD */}
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

      {/* 4. SECCIÓN: RECLUTAMIENTO DE TÉCNICOS */}
      <section id="tecnicos" className="tech-section">
        <div className="tech-box">
          <h2>¿Eres un profesional de excelencia?</h2>
          <p>Buscamos expertos en mantenimiento que quieran multiplicar sus ingresos, manejar su propio tiempo y pertenecer a la red más exclusiva de servicios a domicilio.</p>
          <button className="btn-solid-white" onClick={onTechnicianLogin}>Acceso para Técnicos</button>
        </div>
      </section>

      {/* FOOTER SIMPLE */}
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