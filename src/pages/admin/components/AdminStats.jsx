function StatRing({ label, value, percent, variant = 'default' }) {
  const circumference = 2 * Math.PI * 36
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className={`adm-stat-ring ${variant}`}>
      <div className="adm-ring-wrap">
        {variant === 'bar' ? (
          <div className="adm-stat-bar">
            <div className="adm-stat-bar-fill" style={{ width: `${percent}%` }} />
          </div>
        ) : (
          <svg viewBox="0 0 80 80" className="adm-ring-svg">
            <circle cx="40" cy="40" r="36" className="adm-ring-bg" />
            <circle
              cx="40" cy="40" r="36"
              className="adm-ring-progress"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
        )}
        <span className="adm-ring-value">{value}%</span>
      </div>
      <p className="adm-stat-label">{label}</p>
    </div>
  )
}

function AdminStats({ stats, userName }) {
  const firstName = userName?.split(' ')[0] || 'Admin'
  const techActiveRate = stats?.totalTechnicians
    ? Math.min(100, Math.round((stats.inProgressAppointments + stats.scheduledAppointments) / stats.totalTechnicians * 10))
    : 0

  return (
    <section className="adm-hero">
      <div className="adm-hero-left">
        <h1 className="adm-greeting">Hola, {firstName}</h1>
        <div className="adm-stat-rings">
          <StatRing label="Completadas" value={stats?.completionRate || 0} percent={stats?.completionRate || 0} variant="bar" />
          <StatRing label="Técnicos activos" value={techActiveRate} percent={techActiveRate} variant="yellow" />
          <StatRing label="Citas hoy" value={stats?.todayTotal ? Math.round((stats.todayCompleted / Math.max(stats.todayTotal, 1)) * 100) : 0} percent={stats?.todayTotal ? Math.round((stats.todayCompleted / stats.todayTotal) * 100) : 0} />
          <StatRing label="Canceladas" value={stats?.totalAppointments ? Math.round((stats.cancelledAppointments / stats.totalAppointments) * 100) : 0} percent={stats?.totalAppointments ? Math.round((stats.cancelledAppointments / stats.totalAppointments) * 100) : 0} variant="muted" />
        </div>
      </div>

      <div className="adm-hero-right">
        <div className="adm-summary-card">
          <div className="adm-summary-icon"><i className="fa-solid fa-users" /></div>
          <div>
            <strong>{stats?.totalClients || 0}</strong>
            <span>Clientes</span>
          </div>
        </div>
        <div className="adm-summary-card">
          <div className="adm-summary-icon yellow"><i className="fa-solid fa-user-gear" /></div>
          <div>
            <strong>{stats?.totalTechnicians || 0}</strong>
            <span>Técnicos</span>
          </div>
        </div>
        <div className="adm-summary-card">
          <div className="adm-summary-icon dark"><i className="fa-solid fa-calendar-check" /></div>
          <div>
            <strong>{stats?.totalAppointments || 0}</strong>
            <span>Citas</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AdminStats
