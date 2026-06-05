function AdminComposition({ composition, serviceBreakdown }) {
  const total = composition?.total || 1
  const clientPct = Math.round((composition?.clients / total) * 100)
  const techPct = 100 - clientPct

  return (
    <div className="adm-card adm-composition-card">
      <h3>Composición</h3>

      <div className="adm-donut-wrap">
        <div
          className="adm-donut"
          style={{ background: `conic-gradient(#FFC107 0% ${clientPct}%, #E2E8F0 ${clientPct}% 100%)` }}
        >
          <div className="adm-donut-hole">
            <strong>{composition?.total || 0}</strong>
            <span>Total</span>
          </div>
        </div>
      </div>

      <div className="adm-composition-legend">
        <div className="adm-legend-item">
          <span className="dot yellow" />
          <i className="fa-solid fa-user" />
          <span>{clientPct}% Clientes</span>
        </div>
        <div className="adm-legend-item">
          <span className="dot gray" />
          <i className="fa-solid fa-user-gear" />
          <span>{techPct}% Técnicos</span>
        </div>
      </div>

      {serviceBreakdown?.length > 0 && (
        <div className="adm-service-breakdown">
          <p className="adm-breakdown-title">Por servicio</p>
          {serviceBreakdown.map(s => (
            <div key={s.id} className="adm-breakdown-row">
              <i className={`fa-solid ${s.icon}`} />
              <span>{s.name}</span>
              <strong>{s.count}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminComposition
