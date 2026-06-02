import FloatingNav from '../components/FloatingNav'
import TopBar from '../components/TopBar'
import '../App.css'

function Home({ onNavSelect }) {
  return (
    <div className="app-shell view-transition">
      <FloatingNav activeLabel="Inicio" onSelect={onNavSelect} theme="dark" />
      <main className="main-content">
        <TopBar />
        <div className="hero-text">
          <h1>Mantenimiento<br />Inteligente</h1>
          <p>
            Conectamos expertos en mantenimiento con clientes en tiempo real.
            Obtén estimaciones automáticas mediante IA y seguimiento exacto gracias
            a nuestra arquitectura de geolocalización.
          </p>
        </div>

        <div className="cards-container">
          <div className="solid-card">
            <h3>Nuestra Red</h3>
            <p>
              Soluciona cualquier avería con profesionales verificados. Desde
              instalaciones hasta emergencias, listos para atenderte.
            </p>
            <div className="stats-row">
              <div>
                <h2>500+</h2>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#777' }}>
                  Técnicos Activos
                </span>
              </div>
              <div className="avatars">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=100&auto=format&fit=crop"
                  alt="Técnico"
                />
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=100&auto=format&fit=crop"
                  alt="Técnico"
                />
                <img
                  src="https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?q=80&w=100&auto=format&fit=crop"
                  alt="Técnico"
                />
                <button className="btn-arrow-up">
                  <i className="fa-solid fa-arrow-right" style={{ transform: 'rotate(-45deg)' }}></i>
                </button>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <div className="brand-btn">
              <i className="fa-solid fa-microchip"></i>
            </div>
            <div className="glass-header">
              <div>
                <h3>Cotización Asistida</h3>
                <div className="location">
                  <i className="fa-solid fa-robot"></i> Motor de IA Integrado
                </div>
              </div>
            </div>
            <p className="desc">
              Describe tu problema y nuestro sistema estructurará un presupuesto base
              instantáneo para materiales y mano de obra antes de confirmar el servicio.
            </p>
            <div className="property-features">
              <span>
                <i className="fa-solid fa-map-pin"></i> Radar de Técnicos
              </span>
              <span>
                <i className="fa-solid fa-calculator"></i> Cálculo DDL
              </span>
            </div>
            <div className="action-buttons">
              <button className="icon-btn">
                <i className="fa-solid fa-shield-halved"></i>
              </button>
              <button className="icon-btn">
                <i className="fa-solid fa-share-nodes"></i>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Home
