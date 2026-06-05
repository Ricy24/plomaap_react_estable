import { useState } from 'react'
import '../styles/dashboard.css'

function ClientDashboard({ user, onLogout }) {
  const [selectedService, setSelectedService] = useState(null)
  const [userAddress, setUserAddress] = useState(user?.address || localStorage.getItem('selectedAddress') || 'Calle 85 # 11-53, Chapinero, Bogotá')

  const services = [
    { id: 'fugas', name: 'Fugas de agua', icon: 'fa-droplet', color: 'water' },
    { id: 'destapes', name: 'Destapes', icon: 'fa-toilet', color: 'drain' },
    { id: 'duchas', name: 'Duchas y Baños', icon: 'fa-shower', color: 'shower' },
    { id: 'instalaciones', name: 'Instalaciones', icon: 'fa-wrench', color: 'pipe' }
  ]

  const handleServiceSelect = (service) => {
    setSelectedService(service)
  }

  return (
    <div className="dashboard-layout">
      
      {/* 1. MENÚ LATERAL (SIDEBAR) */}
      <aside className="dash-sidebar">
        <div className="sidebar-brand">
          <div className="logo-dot"></div>
          <span>PlomApp</span>
        </div>
        
        <nav className="sidebar-nav">
          <a href="#" className="active"><i className="fa-solid fa-house"></i> Inicio</a>
          <a href="#"><i className="fa-solid fa-clipboard-list"></i> Mis Servicios</a>
          <a href="#"><i className="fa-regular fa-credit-card"></i> Pagos</a>
          <a href="#"><i className="fa-regular fa-user"></i> Mi Perfil</a>
        </nav>

        <div className="sidebar-bottom">
          <button onClick={onLogout} className="logout-btn" style={{ border: 'none', background: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
            <i className="fa-solid fa-arrow-right-from-bracket"></i> Salir
          </button>
        </div>
      </aside>

      {/* 2. CONTENEDOR PRINCIPAL */}
      <main className="dash-main-content">
        
        {/* HEADER DEL DASHBOARD */}
        <header className="dash-header">
          <div>
            <h1 className="welcome-text">Hola, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="subtitle-text">¿En qué te podemos ayudar hoy?</p>
          </div>
          <div className="header-actions">
            <button className="notification-btn"><i className="fa-regular fa-bell"></i></button>
            <div className="user-avatar">
              <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=100&auto=format&fit=crop" alt="Perfil" />
            </div>
          </div>
        </header>

        {/* 3. GRID DEL CONTENIDO */}
        <div className="dash-grid">
          
          {/* COLUMNA IZQUIERDA: Mapa y Nueva Solicitud */}
          <div className="dash-col-primary">
            
            {/* El Mapa Interactivo */}
            <div className="map-card">
              <div className="map-header">
                <h3><i className="fa-solid fa-location-dot"></i> Tu ubicación actual</h3>
                <button className="btn-edit-location">Cambiar</button>
              </div>
              <div className="map-placeholder">
                {/* Aquí integrarás Google Maps o Mapbox */}
                <div className="map-pin bounce"><i className="fa-solid fa-location-crosshairs"></i></div>
                <div className="map-address-box">
                  <p>{userAddress}</p>
                </div>
              </div>
            </div>

            {/* Selección Rápida de Servicio (Basado en CU03) */}
            <div className="quick-service-section">
              <h3>Selecciona el servicio que necesitas</h3>
              <div className="service-grid-options">
                {services.map((service) => (
                  <div 
                    key={service.id}
                    className={`service-option-card ${selectedService?.id === service.id ? 'active' : ''}`}
                    onClick={() => handleServiceSelect(service)}
                    style={{
                      cursor: 'pointer',
                      opacity: selectedService?.id === service.id ? 1 : 0.8,
                      transform: selectedService?.id === service.id ? 'scale(1.05)' : 'scale(1)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div className={`icon-wrapper ${service.color}`}>
                      <i className={`fa-solid ${service.icon}`}></i>
                    </div>
                    <h4>{service.name}</h4>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* COLUMNA DERECHA: Estado e IA */}
          <div className="dash-col-secondary">
            
            {/* Widget de Información del Usuario */}
            <div className="widget-card user-info-widget">
              <div className="widget-header">
                <i className="fa-solid fa-user-circle"></i>
                <h3>Tu Información</h3>
              </div>
              
              {user?.avatar && (
                <div className="user-avatar-section">
                  <img src={user.avatar} alt={user.name} className="user-avatar" />
                </div>
              )}
              
              <div className="info-list">
                <div className="info-item">
                  <span className="label">Nombre:</span>
                  <span className="value">{user?.name}</span>
                </div>
                <div className="info-item">
                  <span className="label">Email:</span>
                  <span className="value">{user?.email}</span>
                </div>
                <div className="info-item">
                  <span className="label">Teléfono:</span>
                  <span className="value">{user?.phone || 'No proporcionado'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Dirección:</span>
                  <span className="value">{userAddress}</span>
                </div>
              </div>
            </div>

            {/* Widget de Cotización con IA */}
            <div className="widget-card ia-widget">
              <div className="ia-header">
                <i className="fa-solid fa-wand-magic-sparkles"></i>
                <h3>Asistente IA</h3>
              </div>
              <p>Sube una foto del problema y nuestra IA calculará un presupuesto base en segundos.</p>
              <button className="btn-upload">
                <i className="fa-solid fa-camera"></i> Analizar problema
              </button>
            </div>

            {/* Widget de Historial Reciente (Basado en CU11) */}
            <div className="widget-card history-widget">
              <h3>Actividad Reciente</h3>
              <div className="history-list">
                <div className="history-item">
                  <div className="status-dot completed"></div>
                  <div>
                    <p className="history-title">Instalación de lavaplatos</p>
                    <p className="history-date">Hace 2 semanas • Pagado</p>
                  </div>
                </div>
                <div className="history-item">
                  <div className="status-dot completed"></div>
                  <div>
                    <p className="history-title">Reparación de fuga</p>
                    <p className="history-date">12 May 2026 • Pagado</p>
                  </div>
                </div>
              </div>
              <button className="btn-text-only">Ver historial completo</button>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}

export default ClientDashboard