function AdminChart({ monthlyAppointments }) {
  const data = monthlyAppointments?.length ? monthlyAppointments : []
  const maxVal = Math.max(...data.map(d => d.total), 1)

  const points = data.map((d, i) => {
    const x = data.length > 1 ? (i / (data.length - 1)) * 100 : 50
    const y = 100 - (d.total / maxVal) * 80
    return `${x},${y}`
  }).join(' ')

  const pointsSecondary = data.map((d, i) => {
    const x = data.length > 1 ? (i / (data.length - 1)) * 100 : 50
    const y = 100 - (d.completed / maxVal) * 80
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="adm-card adm-chart-card">
      <div className="adm-card-header">
        <h3>Estadísticas de citas</h3>
        <div className="adm-chart-legend">
          <span><i className="dot yellow" /> Total</span>
          <span><i className="dot gray" /> Completadas</span>
        </div>
      </div>

      <div className="adm-chart-area">
        {data.length === 0 ? (
          <p className="adm-empty">Sin datos mensuales</p>
        ) : (
          <>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="adm-line-chart">
              <polyline points={pointsSecondary} className="adm-line secondary" />
              <polyline points={points} className="adm-line primary" />
            </svg>
            <div className="adm-chart-labels">
              {data.map(d => (
                <span key={`${d.month}-${d.year}`}>{d.month}</span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminChart
