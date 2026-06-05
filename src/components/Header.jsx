function Header({ onLogin }) {
  return (
    <header className="elegant-header">
      <div className="header-logo">
        <div className="logo-dot"></div>
        <span>PlomApp</span>
      </div>
      
      <nav className="header-nav">
        <a href="#inicio">Inicio</a>
        <a href="#como-funciona">El Proceso</a>
        <a href="#garantias">Seguridad</a>
        <a href="#tecnicos">Para Técnicos</a>
      </nav>

      <div className="header-auth">
        <button className="btn-text-elegant" onClick={onLogin}>Ingresar</button>
        <button className="btn-solid-elegant" onClick={onLogin}>Pedir Servicio</button>
      </div>
    </header>
  )
}

export default Header
