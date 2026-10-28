import { useNavigate } from 'react-router-dom'
import Logo from '../ui/Logo'

const DEFAULT_HIGHLIGHTS = [
  'Técnicos verificados y con reseñas reales',
  'Precios claros antes de confirmar',
  'Pago protegido hasta terminar el trabajo',
]

function AuthLayout({
  backTo = '/ingresar',
  backLabel = 'Volver',
  badge,
  tone = 'client',
  title,
  subtitle,
  visualIcon = 'fa-house-chimney',
  visualTitle,
  visualText,
  highlights = DEFAULT_HIGHLIGHTS,
  footer,
  children,
}) {
  const navigate = useNavigate()

  return (
    <div className={`auth auth--${tone}`}>
      <div className="auth__layout">
        <button type="button" className="btn-back" onClick={() => navigate(backTo)}>
          <i className="fa-solid fa-arrow-left" aria-hidden="true" />
          {backLabel}
        </button>

        <div className="auth__container">
          <section className="auth__form" aria-labelledby="auth-title">
            <div className="auth__form-inner">
              <div className="auth__header">
                <Logo />
                {badge && <span className={`auth__badge auth__badge--${tone}`}>{badge}</span>}
                <h1 id="auth-title" className="auth__title">{title}</h1>
                {subtitle && <p className="auth__subtitle">{subtitle}</p>}
              </div>

              {children}

              {footer}
            </div>
          </section>

          <aside className="auth__visual" aria-hidden="true">
            <div className="auth__visual-glow" />
            <div className="auth__visual-content">
              <span className="auth__visual-icon">
                <i className={`fa-solid ${visualIcon}`} />
              </span>
              <h2>{visualTitle}</h2>
              <p>{visualText}</p>

              <ul className="auth__highlights">
                {highlights.map(item => (
                  <li key={item}>
                    <i className="fa-solid fa-check" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="auth__visual-footer">
                <div className="auth__visual-stars">
                  {[0, 1, 2, 3, 4].map(star => (
                    <i key={star} className="fa-solid fa-star" />
                  ))}
                </div>
                <p>“Agendé en un minuto y llegaron el mismo día.”</p>
                <span>María C. · Chapinero</span>
              </div>
            </div>
          </aside>
        </div>

        <p className="auth__legal">
          Al continuar aceptas nuestros términos de servicio y la política de
          tratamiento de datos.
        </p>
      </div>
    </div>
  )
}

export default AuthLayout
