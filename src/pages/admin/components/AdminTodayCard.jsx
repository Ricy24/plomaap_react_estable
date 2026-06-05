function AdminTodayCard({ stats }) {
  const dots = Array.from({ length: 28 }, (_, i) => {
    if (i < (stats?.todayCompleted || 0)) return 'filled'
    if (i < (stats?.todayCompleted || 0) + (stats?.todayScheduled || 0)) return 'pending'
    return 'empty'
  })

  return (
    <div className="adm-card adm-dark-card">
      <h3>Reporte del día</h3>
      <div className="adm-dark-stats">
        <div className="adm-dark-stat">
          <span className="adm-dark-num up">
            <i className="fa-solid fa-arrow-trend-up" />
            {stats?.todayScheduled || 0}
          </span>
          <span>Programadas</span>
        </div>
        <div className="adm-dark-stat">
          <span className="adm-dark-num down">
            <i className="fa-solid fa-arrow-trend-down" />
            {stats?.todayInProgress || 0}
          </span>
          <span>En curso</span>
        </div>
      </div>
      <div className="adm-dot-grid">
        {dots.map((type, i) => (
          <span key={i} className={`adm-dot ${type}`} />
        ))}
      </div>
      <p className="adm-dark-footer">
        {stats?.todayCompleted || 0} completadas hoy · Ingresos est. ${(stats?.revenueEstimate || 0).toLocaleString('es-CO')}
      </p>
    </div>
  )
}

export default AdminTodayCard
