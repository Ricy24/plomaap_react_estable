function Skeleton({ width, height = 14, radius = 8, className = '', style }) {
  return (
    <span
      className={`skeleton ${className}`.trim()}
      style={{
        display: 'block',
        width: width || '100%',
        height,
        borderRadius: radius,
        ...style,
      }}
      aria-hidden="true"
    />
  )
}

export function DashboardSkeleton({ label = 'Cargando panel...' }) {
  return (
    <div className="dash-skeleton" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="dash-skeleton__topbar">
        <div style={{ display: 'grid', gap: 10 }}>
          <Skeleton width={140} height={12} />
          <Skeleton width={240} height={28} />
        </div>
        <Skeleton width={48} height={48} radius={24} />
      </div>
      <div className="dash-skeleton__stats">
        {[0, 1, 2].map(i => (
          <div key={i} className="dash-skeleton__card">
            <Skeleton width={44} height={44} radius={14} />
            <div style={{ display: 'grid', gap: 8, flex: 1 }}>
              <Skeleton width="55%" height={18} />
              <Skeleton width="80%" height={11} />
            </div>
          </div>
        ))}
      </div>
      <div className="dash-skeleton__body">
        <Skeleton height={220} radius={20} />
        <Skeleton height={140} radius={20} />
      </div>
    </div>
  )
}

export default Skeleton
