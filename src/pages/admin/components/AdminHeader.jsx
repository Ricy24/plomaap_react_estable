import Logo from '../../../components/ui/Logo'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'citas', label: 'Citas' },
  { id: 'usuarios', label: 'Usuarios' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'reportes', label: 'Reportes' },
  { id: 'perfil', label: 'Mi perfil' },
]

function AdminHeader({ user, activeTab, onTabChange, onLogout }) {
  return (
    <header className="adm-header">
      <div className="adm-header-top">
        <div className="adm-brand">
          <Logo />
        </div>

        <nav className="adm-nav" aria-label="Secciones de administración">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              type="button"
              className={`adm-nav-pill ${activeTab === item.id ? 'active' : ''}`}
              aria-current={activeTab === item.id ? 'page' : undefined}
              onClick={() => onTabChange(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="adm-header-actions">
          <button
            className="adm-icon-btn"
            type="button"
            title="Mi perfil"
            onClick={() => onTabChange('perfil')}
          >
            <i className="fa-solid fa-gear" aria-hidden="true" />
            <span>Perfil</span>
          </button>
          <button className="adm-icon-btn" type="button" title="Notificaciones" aria-label="Notificaciones">
            <i className="fa-regular fa-bell" aria-hidden="true" />
          </button>
          <button className="adm-avatar-btn" type="button" onClick={onLogout} title="Cerrar sesión" aria-label="Cerrar sesión">
            {user?.avatar
              ? <img src={user.avatar} alt="" />
              : <span aria-hidden="true">{user?.name?.[0] || 'A'}</span>
            }
          </button>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
