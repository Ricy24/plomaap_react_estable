import { useEffect, useState } from 'react'
import Logo from './ui/Logo'

const NAV_ITEMS = [
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#servicios', label: 'Servicios' },
  { href: '#cobertura', label: 'Cobertura' },
  { href: '#garantias', label: 'Garantías' },
  { href: '#faq', label: 'Preguntas' },
]

function Header({ onLogin, onTechnician }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = event => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="site-header__inner">
        <a href="#inicio" className="site-header__brand" aria-label="PlomApp, ir al inicio">
          <Logo />
        </a>

        <nav className="site-nav" aria-label="Navegación principal">
          {NAV_ITEMS.map(item => (
            <a key={item.href} href={item.href} className="site-nav__link">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="site-header__actions">
          <button type="button" className="btn btn--ghost btn--sm" onClick={onLogin}>
            Ingresar
          </button>
          <button type="button" className="btn btn--sm" onClick={onLogin}>
            Pedir servicio
            <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          className="site-header__burger"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen(v => !v)}
        >
          <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'}`} aria-hidden="true" />
        </button>
      </div>

      <div
        id="mobile-menu"
        className={`mobile-menu ${menuOpen ? 'is-open' : ''}`}
        hidden={!menuOpen}
      >
        <nav className="mobile-menu__nav" aria-label="Navegación móvil">
          {NAV_ITEMS.map(item => (
            <a key={item.href} href={item.href} onClick={closeMenu}>
              {item.label}
              <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </a>
          ))}
          <button
            type="button"
            className="mobile-menu__link"
            onClick={() => {
              closeMenu()
              onTechnician?.()
            }}
          >
            Soy técnico
            <i className="fa-solid fa-user-gear" aria-hidden="true" />
          </button>
        </nav>
        <div className="mobile-menu__actions">
          <button type="button" className="btn btn--outline btn--block" onClick={() => { closeMenu(); onLogin?.() }}>
            Ingresar
          </button>
          <button type="button" className="btn btn--block" onClick={() => { closeMenu(); onLogin?.() }}>
            Pedir servicio
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
