function AdminHeader({ user, activeTab, onTabChange, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'citas', label: 'Citas' },
    { id: 'usuarios', label: 'Usuarios' },
    { id: 'servicios', label: 'Servicios' },
    { id: 'reportes', label: 'Reportes' },
    { id: 'perfil', label: 'Mi perfil' },
  ]

  return (
    <header className="adm-header">
      <div className="adm-header-top">
        <div className="adm-brand">
          <div className="logo-dot" />
          <span>PlomApp</span>
        </div>

        <nav className="adm-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`adm-nav-pill ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => onTabChange(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="adm-header-actions">
          <button className="adm-icon-btn" title="Mi perfil" onClick={() => onTabChange('perfil')}>
            <i className="fa-solid fa-gear" />
            <span>Perfil</span>
          </button>
          <button className="adm-icon-btn" title="Notificaciones">
            <i className="fa-regular fa-bell" />
          </button>
          <button className="adm-avatar-btn" onClick={onLogout} title="Cerrar sesión">
            {user?.avatar
              ? <img src={user.avatar} alt={user.name} />
              : <span>{user?.name?.[0] || 'A'}</span>
            }
          </button>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
