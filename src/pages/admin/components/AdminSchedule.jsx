const STATUS_LABELS = {
  scheduled: 'Programada',
  in_progress: 'En curso',
  completed: 'Completada',
  cancelled: 'Cancelada'
}

function AdminSchedule({ weekCalendar, todaySchedule }) {
  const activeDay = weekCalendar?.find(d => d.isToday)
  const scheduleItems = Array.isArray(todaySchedule) ? todaySchedule : []

  return (
    <div className="adm-card adm-schedule-card">
      <div className="adm-card-header">
        <h3>Agenda de hoy</h3>
        <span className="adm-card-badge">{todaySchedule?.length || 0} citas</span>
      </div>

      <div className="adm-week-strip">
        {weekCalendar?.map(day => (
          <button key={day.date} className={`adm-day-pill ${day.isToday ? 'active' : ''}`}>
            <span className="adm-day-label">{day.label}</span>
            <span className="adm-day-num">{day.dayNum}</span>
            {day.count > 0 && <span className="adm-day-dot" />}
          </button>
        ))}
      </div>

      <div className="adm-timeline">
        {scheduleItems.length === 0 ? (
          <p className="adm-empty">Sin citas para {activeDay?.label || 'hoy'}</p>
        ) : (
          scheduleItems.map(event => (
            <div key={event.id} className={`adm-timeline-item ${event.isPrimary ? 'primary' : ''}`}>
              <div className="adm-timeline-time">
                <span>{event.time}</span>
                <span className="adm-timeline-end">{event.endTime}</span>
              </div>
              <div className={`adm-timeline-card ${event.isPrimary ? 'dark' : ''}`}>
                <div className="adm-timeline-top">
                  <strong>{event.title}</strong>
                  <span className={`adm-status-pill sm ${event.status}`}>{STATUS_LABELS[event.status]}</span>
                </div>
                <p>{event.clientName} · {event.technicianName}</p>
                {event.clientAvatar && (
                  <div className="adm-timeline-avatars">
                    <img src={event.clientAvatar} alt="" />
                    {event.technicianAvatar && <img src={event.technicianAvatar} alt="" />}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default AdminSchedule
