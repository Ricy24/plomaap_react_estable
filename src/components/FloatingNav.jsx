const navItems = [
  { label: 'Inicio', icon: 'fa-house', tooltip: 'Inicio' },
  { label: 'Nosotros', icon: 'fa-user-group', tooltip: 'Nosotros' },
  { label: 'Servicios', icon: 'fa-screwdriver-wrench', tooltip: 'Servicios' },
  { label: 'La Plataforma', icon: 'fa-mobile-screen-button', tooltip: 'La Plataforma' },
  { label: 'Contacto', icon: 'fa-paper-plane', tooltip: 'Contacto' },
]

function FloatingNav({ activeLabel = 'Inicio', onSelect }) {
  return (
    <nav className="floating-nav">
      {navItems.map((item) => {
        const isActive = item.label === activeLabel
        return (
          <div
            key={item.label}
            className={`nav-item${isActive ? ' active' : ''}`}
            data-tooltip={item.tooltip}
            onClick={() => onSelect?.(item.label)}
          >
            <i className={`fa-solid ${item.icon}`}></i>
          </div>
        )
      })}
    </nav>
  )
}

export default FloatingNav
