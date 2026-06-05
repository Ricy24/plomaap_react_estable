import { useState } from 'react'

function HeroSection({ onLogin, onAddress }) {
  const [address, setAddress] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (address.trim()) {
      // Guardar dirección en localStorage
      localStorage.setItem('selectedAddress', address)
      // Notificar al padre
      if (onAddress) {
        onAddress(address)
      }
      // Ir al login
      onLogin()
    }
  }

  return (
    <section id="inicio" className="hero-elegant">
      <div className="hero-content">
        <h1 className="hero-title-soft">
          Tranquilidad para tu hogar,<br />
          <span>a un clic de distancia.</span>
        </h1>
        
        {/* EL BUSCADOR GIGANTE PERO MINIMALISTA */}
        <div className="search-card-elegant slide-up-anim">
          <label>¿A dónde enviamos al experto?</label>
          <div className="search-input-elegant">
            <i className="fa-solid fa-location-dot"></i>
            <input 
              type="text" 
              placeholder="Ingresa tu dirección en Bogotá..." 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
            />
            <button className="btn-search-dark" onClick={handleSearch}>
              Buscar <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>

          {/* ÍCONOS DE SERVICIOS TRANQUILOS */}
          <div className="services-row">
            <div className="service-pill">
              <i className="fa-solid fa-droplet"></i> Fugas
            </div>
            <div className="service-pill">
              <i className="fa-solid fa-toilet"></i> Destapes
            </div>
            <div className="service-pill">
              <i className="fa-solid fa-shower"></i> Instalaciones
            </div>
            <div className="service-pill">
              <i className="fa-solid fa-wrench"></i> Mantenimiento
            </div>
          </div>
        </div>
      </div>
      <div className="hero-bg-image"></div>
    </section>
  )
}

export default HeroSection
