function Header({ showAuthButtons = true, variant = 'light' }) {
  return (
    <header className={`app-header header-${variant}`}>
      <div className="header-content">
        <div className="header-logo">
          <i className="fa-solid fa-wrench"></i>
          <span>tech_connect_pro</span>
        </div>

        {showAuthButtons && (
          <div className="header-auth">
            <button className="btn-auth btn-login">
              <i className="fa-solid fa-sign-in-alt"></i> Ingresar
            </button>
            <button className="btn-auth btn-register">
              <i className="fa-solid fa-user-plus"></i> Registrarse
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
