const filterItems = [
  { label: 'Ubicación', value: 'Bogotá', icon: 'fa-location-dot' },
  { label: 'Especialidad', value: 'Plomería', icon: 'fa-helmet-safety' },
  { label: 'Urgencia', value: 'Inmediata', icon: 'fa-bolt' },
]

function TopBar() {
  return (
    <div className="top-bar">
      <div className="brand-logo">
        <i className="fa-solid fa-wrench" style={{ color: 'var(--accent-green)' }}></i>
        tech_connect_pro
      </div>
      <div className="filters">
        {filterItems.map((item) => (
          <div key={item.label} className="filter-item">
            <span className="filter-label">
              <i className={`fa-solid ${item.icon}`}></i> {item.label}
            </span>
            <span className="filter-value">
              {item.value} <i className="fa-solid fa-chevron-down"></i>
            </span>
          </div>
        ))}
      </div>
      <button className="btn-action">
        Solicitar Servicio <i className="fa-solid fa-arrow-right"></i>
      </button>
    </div>
  )
}

export default TopBar
