import { useNavigate } from 'react-router-dom'
import Logo from '../../components/ui/Logo'
import '../../styles/login-selector.css'

const OPTIONS = [
  {
    id: 'client',
    path: '/ingresar/cliente',
    icon: 'fa-house-user',
    title: 'Soy cliente',
    description: 'Agenda reparaciones, fugas, destapes y más en tu hogar.',
    cta: 'Ingresar como cliente',
  },
  {
    id: 'technician',
    path: '/ingresar/tecnico',
    icon: 'fa-user-gear',
    title: 'Soy técnico',
    description: 'Accede a tus citas programadas, horarios y servicios del día.',
    cta: 'Ingresar como técnico',
  },
]

function LoginSelector() {
  const navigate = useNavigate()

  return (
    <div className="login-selector-wrapper">
      <div className="login-selector-layout">
        <button className="btn-back" type="button" onClick={() => navigate('/')}>
          <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Volver al inicio
        </button>

        <div className="login-selector-content">
          <div className="login-selector-header">
            <Logo className="logo-box" />
            <h1>¿Cómo quieres ingresar?</h1>
            <p>Selecciona tu tipo de cuenta para continuar</p>
          </div>

          <div className="login-selector-cards">
            {OPTIONS.map(option => (
              <button
                key={option.id}
                className={`login-type-card ${option.id}`}
                type="button"
                onClick={() => navigate(option.path)}
              >
                <div className="login-type-icon">
                  <i className={`fa-solid ${option.icon}`} aria-hidden="true" />
                </div>
                <h3>{option.title}</h3>
                <p>{option.description}</p>
                <span className="login-type-cta">
                  {option.cta} <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                </span>
              </button>
            ))}
          </div>

          <p className="login-selector-admin-link">
            ¿Eres administrador?{' '}
            <button type="button" onClick={() => navigate('/admin')}>
              Acceso administrativo
            </button>
          </p>

          {import.meta.env.DEV && (
            <div className="login-selector-hint">
              <p><strong>CP06 Cliente:</strong> cliente@mail.com / Cl@ve123*</p>
              <p><strong>CP07 Técnico:</strong> tecnico@mail.com / T3cnic0_2026</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginSelector
