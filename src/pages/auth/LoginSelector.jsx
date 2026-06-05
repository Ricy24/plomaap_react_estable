import '../../styles/login-selector.css'

function LoginSelector({ onBack, onSelectClient, onSelectTechnician }) {
  return (
    <div className="login-selector-wrapper">
      <div className="login-selector-layout">
        <button className="btn-back" onClick={onBack}>
          <i className="fa-solid fa-arrow-left" /> Volver al inicio
        </button>

        <div className="login-selector-content">
          <div className="login-selector-header">
            <div className="logo-box">
              <div className="logo-dot" />
              <span>PlomApp</span>
            </div>
            <h1>¿Cómo quieres ingresar?</h1>
            <p>Selecciona tu tipo de cuenta para continuar</p>
          </div>

          <div className="login-selector-cards">
            <button className="login-type-card client" onClick={onSelectClient}>
              <div className="login-type-icon">
                <i className="fa-solid fa-house-user" />
              </div>
              <h3>Soy cliente</h3>
              <p>Agenda reparaciones, fugas, destapes y más en tu hogar.</p>
              <span className="login-type-cta">Ingresar como cliente <i className="fa-solid fa-arrow-right" /></span>
            </button>

            <button className="login-type-card technician" onClick={onSelectTechnician}>
              <div className="login-type-icon">
                <i className="fa-solid fa-user-gear" />
              </div>
              <h3>Soy técnico</h3>
              <p>Accede a tus citas programadas, horarios y servicios del día.</p>
              <span className="login-type-cta">Ingresar como técnico <i className="fa-solid fa-arrow-right" /></span>
            </button>
          </div>

          <div className="login-selector-hint">
            <p><strong>Demo clientes:</strong> andres@example.com / 123456</p>
            <p><strong>Demo técnicos:</strong> tecnico@example.com / 123456</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginSelector
