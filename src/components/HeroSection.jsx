import { useState } from 'react'

const QUICK_SERVICES = [
  { id: 'fugas', icon: 'fa-droplet', label: 'Fugas' },
  { id: 'destapes', icon: 'fa-toilet', label: 'Destapes' },
  { id: 'instalaciones', icon: 'fa-shower', label: 'Instalaciones' },
  { id: 'mantenimiento', icon: 'fa-wrench', label: 'Mantenimiento' },
]

function HeroSection({ onLogin, onAddress }) {
  const [address, setAddress] = useState('')
  const [service, setService] = useState(null)
  const [touched, setTouched] = useState(false)

  const handleSearch = event => {
    event.preventDefault()
    setTouched(true)
    if (!address.trim()) return

    localStorage.setItem('selectedAddress', address.trim())
    if (service) localStorage.setItem('selectedService', service)
    onAddress?.(address.trim())
    onLogin?.()
  }

  const addressInvalid = touched && !address.trim()

  return (
    <section id="inicio" className="hero">
      <div className="hero__glow" aria-hidden="true" />
      <div className="hero__grid-pattern" aria-hidden="true" />

      <div className="hero__inner">
        <div className="hero__copy">
          <span className="hero__badge">
            <span className="hero__badge-dot" aria-hidden="true" />
            Técnicos verificados en Bogotá
          </span>

          <h1 className="hero__title">
            Tu hogar, arreglado.
            <br />
            <span>Sin estrés ni sorpresas.</span>
          </h1>

          <p className="hero__subtitle">
            Encuentra al plomero ideal, agenda en menos de un minuto y paga
            cuando el trabajo esté resuelto. Todo desde un solo lugar.
          </p>

          <form className="hero__search" onSubmit={handleSearch} noValidate>
            <label className="sr-only" htmlFor="hero-address">
              Dirección del servicio
            </label>
            <div className={`hero__search-field ${addressInvalid ? 'has-error' : ''}`}>
              <i className="fa-solid fa-location-dot" aria-hidden="true" />
              <input
                id="hero-address"
                type="text"
                autoComplete="street-address"
                placeholder="¿Dónde necesitas el servicio? Ej. Calle 85 #11-53"
                value={address}
                aria-invalid={addressInvalid}
                aria-describedby={addressInvalid ? 'hero-address-error' : undefined}
                onChange={event => {
                  setAddress(event.target.value)
                  if (touched) setTouched(false)
                }}
              />
            </div>
            <button type="submit" className="btn btn--lg hero__search-btn">
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
              Buscar técnico
            </button>
            {addressInvalid && (
              <p id="hero-address-error" className="hero__search-error" role="alert">
                Escribe tu dirección para continuar.
              </p>
            )}
          </form>

          <div className="hero__services" aria-label="Servicios más solicitados">
            <span className="hero__services-label">Más pedidos:</span>
            {QUICK_SERVICES.map(item => (
              <button
                key={item.id}
                type="button"
                className={`chip ${service === item.id ? 'is-selected' : ''}`}
                aria-pressed={service === item.id}
                onClick={() => setService(prev => (prev === item.id ? null : item.id))}
              >
                <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
                {item.label}
              </button>
            ))}
          </div>

          <dl className="hero__proof">
            <div>
              <dt>4.9/5</dt>
              <dd>Calificación promedio</dd>
            </div>
            <div>
              <dt>+2.400</dt>
              <dd>Servicios completados</dd>
            </div>
            <div>
              <dt>45 min</dt>
              <dd>Llegada promedio</dd>
            </div>
          </dl>
        </div>

        <div className="hero__visual">
          <div className="hero__photo">
            <img
              src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1000&auto=format&fit=crop"
              alt="Técnico de plomería trabajando en una instalación"
              loading="eager"
            />
          </div>

          <div className="hero__card hero__card--rating">
            <div className="hero__card-avatars" aria-hidden="true">
              <span>JP</span>
              <span>MC</span>
              <span>AL</span>
            </div>
            <div>
              <p className="hero__card-title">+2.400 hogares felices</p>
              <p className="hero__card-meta">
                <i className="fa-solid fa-star" aria-hidden="true" /> 4.9 de 5 estrellas
              </p>
            </div>
          </div>

          <div className="hero__card hero__card--verified">
            <span className="hero__card-icon" aria-hidden="true">
              <i className="fa-solid fa-shield-halved" />
            </span>
            <div>
              <p className="hero__card-title">Técnico verificado</p>
              <p className="hero__card-meta">Antecedentes y experiencia revisados</p>
            </div>
          </div>

          <div className="hero__card hero__card--eta">
            <span className="hero__eta-dot" aria-hidden="true" />
            <div>
              <p className="hero__card-title">En camino</p>
              <p className="hero__card-meta">Llega en 12 min</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
