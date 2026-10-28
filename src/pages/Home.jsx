import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import '../styles/landing.css'
import '../styles/address-map.css'
import Header from '../components/Header'
import HeroSection from '../components/HeroSection'
import AddressMap from '../components/AddressMap'
import Reveal from '../components/ui/Reveal'
import Logo from '../components/ui/Logo'

const STEPS = [
  {
    icon: 'fa-camera',
    title: 'Cuéntanos qué pasa',
    text: 'Describe el problema o sube una foto. Nuestro diagnóstico te da un presupuesto base al instante.',
  },
  {
    icon: 'fa-user-check',
    title: 'Elige a tu técnico',
    text: 'Compara perfiles verificados, calificaciones y tiempos de llegada. Tú decides quién entra a tu casa.',
  },
  {
    icon: 'fa-circle-check',
    title: 'Paga cuando esté listo',
    text: 'El trabajo se hace bajo nuestros estándares y solo liberas el pago cuando queda resuelto.',
  },
]

const SERVICES = [
  {
    icon: 'fa-droplet',
    tone: 'water',
    title: 'Fugas y filtraciones',
    text: 'Detección y reparación de fugas en baños, cocinas y tuberías.',
    price: 'Desde $65.000',
  },
  {
    icon: 'fa-toilet',
    tone: 'drain',
    title: 'Destapes',
    text: 'Desagües, sifones e inodoros tapados resueltos el mismo día.',
    price: 'Desde $55.000',
  },
  {
    icon: 'fa-shower',
    tone: 'shower',
    title: 'Instalaciones',
    text: 'Grifería, sanitarios, calentadores y puntos hidráulicos nuevos.',
    price: 'Desde $90.000',
  },
  {
    icon: 'fa-screwdriver-wrench',
    tone: 'pipe',
    title: 'Mantenimiento',
    text: 'Revisión preventiva para evitar daños costosos a futuro.',
    price: 'Desde $45.000',
  },
]

const GUARANTEES = [
  {
    icon: 'fa-id-card',
    title: 'Identidad verificada',
    text: 'Revisamos antecedentes y experiencia comprobable de cada profesional antes de activar su perfil.',
  },
  {
    icon: 'fa-lock',
    title: 'Pagos protegidos',
    text: 'Retenemos el pago hasta que apruebes el trabajo finalizado. Sin efectivo, sin sorpresas.',
  },
  {
    icon: 'fa-certificate',
    title: 'Garantía PlomApp',
    text: 'Si algo sale mal con la reparación, enviamos a alguien a solucionarlo sin costo extra.',
  },
]

const TESTIMONIALS = [
  {
    quote:
      'Agendé a las 8 a.m. y a las 10 ya tenía el técnico en casa. Me explicó todo y el precio fue exactamente el de la app.',
    name: 'María Camila R.',
    role: 'Chapinero',
    initials: 'MC',
  },
  {
    quote:
      'Se reventó una tubería un domingo. En menos de una hora tenía a alguien verificado y el pago quedó protegido hasta terminar.',
    name: 'Julián P.',
    role: 'Suba',
    initials: 'JP',
  },
  {
    quote:
      'Lo que más valoro es saber quién va a entrar a mi casa. El perfil, la calificación y la garantía me dieron tranquilidad.',
    name: 'Andrea L.',
    role: 'Usaquén',
    initials: 'AL',
  },
]

const FAQS = [
  {
    q: '¿Cuánto cuesta un servicio?',
    a: 'Cada servicio muestra un precio base desde el inicio. El técnico confirma el valor final antes de empezar y nunca se cobra algo que no hayas aprobado en la app.',
  },
  {
    q: '¿Cómo sé que el técnico es confiable?',
    a: 'Todos los técnicos pasan por verificación de identidad, antecedentes y prueba de habilidades. Además ves su calificación, trabajos completados y reseñas de otros clientes.',
  },
  {
    q: '¿Qué pasa si el trabajo no queda bien?',
    a: 'Tienes 30 días de garantía. Si el problema reaparece, enviamos a otro técnico sin costo adicional para revisarlo y corregirlo.',
  },
  {
    q: '¿En qué zonas de Bogotá operan?',
    a: 'Cubrimos toda Bogotá urbana: Chapinero, Suba, Usaquén, Kennedy, Engativá, Teusaquillo, Puente Aranda y más. Escribe tu dirección para confirmar cobertura.',
  },
  {
    q: '¿Puedo reprogramar o cancelar mi cita?',
    a: 'Sí. Desde “Mis citas” puedes reprogramar o cancelar sin costo hasta 2 horas antes de la visita programada.',
  },
]

function Home() {
  const navigate = useNavigate()
  const [demoAddress, setDemoAddress] = useState('Bogotá')

  const goToLogin = () => navigate('/ingresar')
  const goToTechnician = () => navigate('/ingresar/tecnico')

  return (
    <div className="landing">
      <Header onLogin={goToLogin} onTechnician={goToTechnician} />

      <main id="contenido">
        <HeroSection onLogin={goToLogin} />

        <section className="trust-strip" aria-label="Indicadores de confianza">
          <div className="trust-strip__inner">
            {[
              { icon: 'fa-user-shield', label: 'Técnicos verificados', value: '100%' },
              { icon: 'fa-clock', label: 'Respuesta promedio', value: '< 15 min' },
              { icon: 'fa-calendar-check', label: 'Disponibilidad', value: 'Lun a sáb' },
              { icon: 'fa-shield-halved', label: 'Garantía en cada trabajo', value: '30 días' },
            ].map(item => (
              <div key={item.label} className="trust-strip__item">
                <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
                <div>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="como-funciona" className="section">
          <div className="section__head">
            <span className="eyebrow">Cómo funciona</span>
            <h2 className="section__title">Diseñado para no hacerte pensar</h2>
            <p className="section__lead">
              Tres pasos simples entre el problema y la solución. Sin llamadas,
              sin regateos y sin esperas eternas.
            </p>
          </div>

          <div className="steps">
            {STEPS.map((step, index) => (
              <Reveal key={step.title} delay={index * 90} className="step-card">
                <div className="step-card__top">
                  <span className="step-card__number">0{index + 1}</span>
                  <span className="step-card__icon" aria-hidden="true">
                    <i className={`fa-solid ${step.icon}`} />
                  </span>
                </div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="servicios" className="section section--tint">
          <div className="section__head">
            <span className="eyebrow">Servicios</span>
            <h2 className="section__title">Lo que resolvemos por ti</h2>
            <p className="section__lead">
              Precios claros desde el inicio y técnicos especializados en cada tipo
              de trabajo.
            </p>
          </div>

          <div className="services">
            {SERVICES.map((service, index) => (
              <Reveal key={service.title} delay={index * 70} className="service-card">
                <span className={`service-card__icon service-card__icon--${service.tone}`} aria-hidden="true">
                  <i className={`fa-solid ${service.icon}`} />
                </span>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                <div className="service-card__footer">
                  <span className="service-card__price">{service.price}</span>
                  <button
                    type="button"
                    className="service-card__link"
                    onClick={goToLogin}
                  >
                    Agendar
                    <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="cobertura" className="section">
          <div className="coverage">
            <div className="coverage__copy">
              <span className="eyebrow">Cobertura</span>
              <h2 className="section__title">Confirma tu dirección en segundos</h2>
              <p className="section__lead">
                Escribe tu dirección y verás exactamente desde dónde llegará el
                técnico. Operamos en toda Bogotá urbana.
              </p>

              <ul className="coverage__list">
                <li>
                  <span className="coverage__check" aria-hidden="true">
                    <i className="fa-solid fa-check" />
                  </span>
                  Ubicación precisa sobre el mapa
                </li>
                <li>
                  <span className="coverage__check" aria-hidden="true">
                    <i className="fa-solid fa-check" />
                  </span>
                  Búsqueda en tiempo real mientras escribes
                </li>
                <li>
                  <span className="coverage__check" aria-hidden="true">
                    <i className="fa-solid fa-check" />
                  </span>
                  Cobertura en todas las localidades urbanas
                </li>
              </ul>

              <button type="button" className="btn" onClick={goToLogin}>
                Agendar ahora
                <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            </div>

            <div className="coverage__map">
              <AddressMap
                address={demoAddress}
                editable={true}
                onAddressChange={setDemoAddress}
              />
            </div>
          </div>
        </section>

        <section id="garantias" className="section section--dark">
          <div className="guarantees">
            <div className="guarantees__copy">
              <span className="eyebrow eyebrow--light">Seguridad ante todo</span>
              <h2 className="section__title section__title--light">
                No dejas entrar a cualquiera a tu casa. Nosotros tampoco.
              </h2>
              <p className="section__lead section__lead--light">
                Construimos un ecosistema cerrado donde la confianza es el pilar
                fundamental. Cada profesional y cada transacción están respaldados.
              </p>

              <div className="guarantees__list">
                {GUARANTEES.map(item => (
                  <div key={item.title} className="guarantee">
                    <span className="guarantee__icon" aria-hidden="true">
                      <i className={`fa-solid ${item.icon}`} />
                    </span>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="guarantees__visual">
              <img
                src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=900&auto=format&fit=crop"
                alt="Profesional de servicios verificados atendiendo un hogar"
                loading="lazy"
              />
              <div className="guarantees__badge">
                <i className="fa-solid fa-shield-halved" aria-hidden="true" />
                <div>
                  <strong>Garantía 30 días</strong>
                  <span>En todos los trabajos</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="testimonios" className="section">
          <div className="section__head">
            <span className="eyebrow">Testimonios</span>
            <h2 className="section__title">Hogares que ya duermen tranquilos</h2>
          </div>

          <div className="testimonials">
            {TESTIMONIALS.map((item, index) => (
              <Reveal key={item.name} delay={index * 80} className="testimonial">
                <div className="testimonial__stars" aria-label="5 de 5 estrellas">
                  {[0, 1, 2, 3, 4].map(star => (
                    <i key={star} className="fa-solid fa-star" aria-hidden="true" />
                  ))}
                </div>
                <blockquote>{item.quote}</blockquote>
                <div className="testimonial__author">
                  <span className="testimonial__avatar" aria-hidden="true">
                    {item.initials}
                  </span>
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.role}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="faq" className="section section--tint">
          <div className="faq">
            <div className="faq__head">
              <span className="eyebrow">Preguntas frecuentes</span>
              <h2 className="section__title">Resolvemos tus dudas</h2>
              <p className="section__lead">
                ¿No encuentras lo que buscas? Escríbenos y te respondemos el mismo día.
              </p>
              <a className="faq__contact" href="mailto:hola@plomapp.co">
                <i className="fa-regular fa-envelope" aria-hidden="true" />
                hola@plomapp.co
              </a>
            </div>

            <div className="faq__list">
              {FAQS.map(item => (
                <details key={item.q} className="faq__item">
                  <summary>
                    <span>{item.q}</span>
                    <i className="fa-solid fa-plus" aria-hidden="true" />
                  </summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="tecnicos" className="section section--cta">
          <div className="tech-cta">
            <div className="tech-cta__copy">
              <span className="eyebrow eyebrow--light">Para técnicos</span>
              <h2>¿Eres un profesional de excelencia?</h2>
              <p>
                Multiplica tus ingresos, maneja tu propio tiempo y pertenece a la red
                de servicios a domicilio más confiable de Bogotá.
              </p>
              <div className="tech-cta__actions">
                <button type="button" className="btn tech-cta__btn" onClick={goToTechnician}>
                  Quiero ser técnico
                  <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                </button>
                <button type="button" className="btn btn--ghost tech-cta__ghost" onClick={goToTechnician}>
                  Ya tengo cuenta
                </button>
              </div>
            </div>

            <ul className="tech-cta__benefits">
              <li>
                <i className="fa-solid fa-coins" aria-hidden="true" />
                <div>
                  <strong>Ingresos competitivos</strong>
                  <span>Pagos puntuales y transparentes</span>
                </div>
              </li>
              <li>
                <i className="fa-solid fa-calendar-week" aria-hidden="true" />
                <div>
                  <strong>Tu horario, tus reglas</strong>
                  <span>Define tu disponibilidad semanal</span>
                </div>
              </li>
              <li>
                <i className="fa-solid fa-chart-line" aria-hidden="true" />
                <div>
                  <strong>Más clientes</strong>
                  <span>Recibe solicitudes cerca de ti</span>
                </div>
              </li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-footer__inner">
          <div className="site-footer__brand">
            <Logo />
            <p>
              Servicios de plomería con técnicos verificados, precios claros y
              garantía real en Bogotá.
            </p>
            <div className="site-footer__social" aria-label="Redes sociales">
              <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noreferrer">
                <i className="fa-brands fa-instagram" aria-hidden="true" />
              </a>
              <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noreferrer">
                <i className="fa-brands fa-facebook-f" aria-hidden="true" />
              </a>
              <a href="https://wa.me/573000000000" aria-label="WhatsApp" target="_blank" rel="noreferrer">
                <i className="fa-brands fa-whatsapp" aria-hidden="true" />
              </a>
            </div>
          </div>

          <nav className="site-footer__col" aria-label="Producto">
            <h4>Producto</h4>
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#servicios">Servicios</a>
            <a href="#cobertura">Cobertura</a>
            <a href="#garantias">Garantías</a>
          </nav>

          <nav className="site-footer__col" aria-label="Cuenta">
            <h4>Cuenta</h4>
            <button type="button" onClick={goToLogin}>Ingresar</button>
            <button type="button" onClick={() => navigate('/ingresar/cliente')}>Crear cuenta</button>
            <button type="button" onClick={goToTechnician}>Soy técnico</button>
          </nav>

          <div className="site-footer__col">
            <h4>Contacto</h4>
            <a href="mailto:hola@plomapp.co">hola@plomapp.co</a>
            <a href="tel:+573000000000">+57 300 000 0000</a>
            <span>Bogotá, Colombia</span>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>© 2026 PlomApp Colombia. Todos los derechos reservados.</p>
          <div>
            <a href="#garantias">Términos</a>
            <a href="#garantias">Privacidad</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
