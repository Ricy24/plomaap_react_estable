import { useState, useEffect } from 'react'
import { appointmentsApi, authApi, getInitials } from '../../services/api'
import ProfileEditForm from '../../components/profile/ProfileEditForm'
import '../../styles/dashboard.css'
import '../../styles/technician-dashboard.css'
import '../../styles/profile-edit.css'

const DAY_NAMES = { mon: 'Lun', tue: 'Mar', wed: 'Mié', thu: 'Jue', fri: 'Vie', sat: 'Sáb', sun: 'Dom' }
const STATUS_LABELS = { scheduled: 'Programada', in_progress: 'En curso', completed: 'Completada', cancelled: 'Cancelada' }

function TechnicianDashboard({ user, technicianProfile, onLogout, onUserUpdate }) {
  const [activeTab, setActiveTab] = useState('inicio')
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [savingProfile, setSavingProfile] = useState(false)

  const profile = technicianProfile || JSON.parse(localStorage.getItem('technicianProfile') || 'null')
  const firstName = user?.name?.split(' ')[0] || 'Técnico'
  const today = new Date().toISOString().split('T')[0]

  const todayAppts = appointments.filter(a => a.date === today && a.status !== 'completed' && a.status !== 'cancelled')
  const upcoming = appointments.filter(a => a.status === 'scheduled' || a.status === 'in_progress')
  const completed = appointments.filter(a => a.status === 'completed')

  useEffect(() => { loadAppointments() }, [])

  const loadAppointments = async () => {
    setLoading(true)
    try {
      const data = await appointmentsApi.getAll()
      setAppointments(data.appointments || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (payload) => {
    setSavingProfile(true)
    try {
      const data = await authApi.updateProfile(payload)
      onUserUpdate?.(data.user, data.technicianProfile)
    } catch (err) {
      setSavingProfile(false)
      throw err
    }
    setSavingProfile(false)
  }

  const handleStatusChange = async (id, status) => {
    setUpdating(id)
    try {
      const data = await appointmentsApi.updateStatus(id, status)
      setAppointments(prev => prev.map(a => a.id === id ? data.appointment : a))
    } catch (err) {
      alert(err.message)
    } finally {
      setUpdating(null)
    }
  }

  const navItems = [
    { id: 'inicio', icon: 'fa-house', label: 'Inicio' },
    { id: 'citas', icon: 'fa-clipboard-list', label: 'Mis citas' },
    { id: 'horario', icon: 'fa-calendar-week', label: 'Horario' },
    { id: 'perfil', icon: 'fa-user-gear', label: 'Perfil' },
  ]

  if (loading) {
    return (
      <div className="dash-loading">
        <i className="fa-solid fa-spinner fa-spin" />
        <p>Cargando panel técnico...</p>
      </div>
    )
  }

  return (
    <div className="dash-layout tech-theme">
      <aside className="dash-sidebar tech-sidebar">
        <div className="dash-brand tech-brand">
          <div className="logo-dot tech-dot" /><span>PlomApp</span>
        </div>
        <nav className="dash-nav">
          {navItems.map(item => (
            <button key={item.id} className={`dash-nav-item tech-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}>
              <i className={`fa-solid ${item.icon}`} /><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="dash-sidebar-user">
          <div className="dash-avatar-sm">
            {user?.avatar
              ? <img src={user.avatar} alt={user.name} />
              : <span className="dash-avatar-initials tech-initials">{getInitials(user?.name)}</span>
            }
          </div>
          <div className="dash-sidebar-user-info">
            <p className="dash-sidebar-name">{firstName}</p>
            <p className="dash-sidebar-role">Técnico · ⭐ {profile?.rating || '—'}</p>
          </div>
        </div>
        <button className="dash-logout" onClick={onLogout}>
          <i className="fa-solid fa-arrow-right-from-bracket" /><span>Salir</span>
        </button>
      </aside>

      <main className="dash-main">
        <header className="dash-topbar">
          <div>
            <p className="dash-greeting-label">Panel de técnico</p>
            <h1 className="dash-greeting">Hola, {firstName} 🔧</h1>
          </div>
          <div className="dash-topbar-actions">
            <div className="tech-rating-badge">
              <i className="fa-solid fa-star" /> {profile?.rating || '4.8'}
            </div>
            <div className="dash-avatar-header">
              {user?.avatar
                ? <img src={user.avatar} alt={user.name} />
                : <span className="dash-avatar-initials tech-initials">{getInitials(user?.name)}</span>
              }
            </div>
          </div>
        </header>

        <div className="dash-stats">
          <div className="dash-stat-card">
            <div className="dash-stat-icon scheduled tech-stat"><i className="fa-solid fa-calendar-day" /></div>
            <div><p className="dash-stat-num">{todayAppts.length}</p><p className="dash-stat-label">Citas hoy</p></div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-icon completed tech-stat"><i className="fa-solid fa-circle-check" /></div>
            <div><p className="dash-stat-num">{profile?.completedJobs || completed.length}</p><p className="dash-stat-label">Servicios realizados</p></div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-icon location tech-stat"><i className="fa-solid fa-map-location-dot" /></div>
            <div>
              <p className="dash-stat-label">Zonas de cobertura</p>
              <p className="dash-stat-address">{profile?.zones?.join(' · ') || 'Bogotá'}</p>
            </div>
          </div>
        </div>

        {activeTab === 'inicio' && (
          <div className="dash-content-grid">
            <div className="dash-col-main">
              {todayAppts.length > 0 ? (
                <div className="dash-highlight-card tech-highlight">
                  <div className="dash-highlight-badge">Siguiente cita de hoy</div>
                  <h3>{todayAppts[0].serviceName}</h3>
                  <div className="dash-highlight-meta">
                    <span><i className="fa-regular fa-clock" /> {todayAppts[0].time}</span>
                    <span><i className="fa-solid fa-user" /> {todayAppts[0].clientName}</span>
                    <span><i className="fa-solid fa-phone" /> {todayAppts[0].clientPhone || 'Sin teléfono'}</span>
                  </div>
                  <p className="dash-highlight-address"><i className="fa-solid fa-location-dot" /> {todayAppts[0].address}</p>
                  <div className="tech-action-row">
                    {todayAppts[0].status === 'scheduled' && (
                      <button className="dash-btn-primary tech-btn"
                        disabled={updating === todayAppts[0].id}
                        onClick={() => handleStatusChange(todayAppts[0].id, 'in_progress')}>
                        <i className="fa-solid fa-play" /> Iniciar servicio
                      </button>
                    )}
                    {todayAppts[0].status === 'in_progress' && (
                      <button className="dash-btn-primary tech-btn"
                        disabled={updating === todayAppts[0].id}
                        onClick={() => handleStatusChange(todayAppts[0].id, 'completed')}>
                        <i className="fa-solid fa-check" /> Marcar completado
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="dash-highlight-card tech-highlight dash-highlight-empty">
                  <i className="fa-solid fa-mug-hot" />
                  <h3>Sin citas pendientes hoy</h3>
                  <p>Disfruta tu día o revisa las próximas citas programadas.</p>
                </div>
              )}

              <section className="dash-section">
                <div className="dash-section-header">
                  <h2>Próximas citas</h2>
                  <button className="dash-btn-text tech-text" onClick={() => setActiveTab('citas')}>Ver todas</button>
                </div>
                {upcoming.length === 0
                  ? <p className="dash-empty-text">No tienes citas programadas.</p>
                  : (
                    <div className="tech-appt-list">
                      {upcoming.slice(0, 4).map(a => (
                        <TechAppointmentRow key={a.id} appointment={a}
                          updating={updating} onStatusChange={handleStatusChange} />
                      ))}
                    </div>
                  )
                }
              </section>
            </div>

            <aside className="dash-col-side">
              <div className="dash-profile-card">
                <div className="dash-profile-avatar">
                  {user?.avatar
                    ? <img src={user.avatar} alt={user.name} />
                    : <span className="dash-avatar-initials tech-initials lg">{getInitials(user?.name)}</span>
                  }
                </div>
                <h3>{user?.name}</h3>
                <p className="dash-profile-email">{user?.email}</p>
                <div className="tech-specialties">
                  {profile?.specialties?.map(s => (
                    <span key={s} className="tech-specialty-tag">{s}</span>
                  ))}
                </div>
              </div>

              <div className="dash-ia-card tech-schedule-preview">
                <h3><i className="fa-regular fa-calendar" /> Horario de hoy</h3>
                <div className="tech-today-slots">
                  {(profile?.schedule?.[['sun','mon','tue','wed','thu','fri','sat'][new Date().getDay()]] || []).map(slot => (
                    <span key={slot} className="tech-slot-tag">{slot}</span>
                  ))}
                  {!(profile?.schedule?.[['sun','mon','tue','wed','thu','fri','sat'][new Date().getDay()]]?.length) && (
                    <p className="dash-empty-text">Día libre</p>
                  )}
                </div>
              </div>
            </aside>
          </div>
        )}

        {activeTab === 'citas' && (
          <section className="dash-section">
            <h2>Mis citas asignadas</h2>
            <p className="dash-section-sub">Gestiona el estado de cada servicio.</p>
            {appointments.length === 0
              ? <p className="dash-empty-text">No tienes citas asignadas.</p>
              : (
                <div className="tech-appt-list full">
                  {appointments.map(a => (
                    <TechAppointmentRow key={a.id} appointment={a} full
                      updating={updating} onStatusChange={handleStatusChange} />
                  ))}
                </div>
              )
            }
          </section>
        )}

        {activeTab === 'horario' && profile?.schedule && (
          <section className="dash-section">
            <h2>Mi horario semanal</h2>
            <p className="dash-section-sub">Franjas horarias en las que estás disponible.</p>
            <div className="tech-weekly-schedule">
              {Object.entries(profile.schedule).map(([day, slots]) => (
                <div key={day} className={`tech-day-card ${slots.length === 0 ? 'off' : ''}`}>
                  <h4>{DAY_NAMES[day]}</h4>
                  {slots.length > 0
                    ? <div className="tech-day-slots">{slots.map(s => <span key={s} className="tech-slot-tag">{s}</span>)}</div>
                    : <p className="tech-day-off">Libre</p>
                  }
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'perfil' && (
          <div className="dash-profile-page">
            <div className="dash-profile-details full-width">
              <ProfileEditForm
                user={user}
                role="technician"
                mode="self"
                technicianProfile={profile}
                onSave={handleSaveProfile}
                saving={savingProfile}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function TechAppointmentRow({ appointment: a, full = false, updating, onStatusChange }) {
  return (
    <div className={`tech-appt-row ${a.status} ${full ? 'full' : ''}`}>
      <div className="tech-appt-client">
        {a.clientAvatar
          ? <img src={a.clientAvatar} alt={a.clientName} className="tech-client-avatar" />
          : <span className="tech-client-avatar initials">{getInitials(a.clientName)}</span>
        }
        <div>
          <p className="tech-appt-service">{a.serviceName}</p>
          <p className="tech-appt-client-name">{a.clientName}</p>
        </div>
      </div>
      <div className="tech-appt-details">
        <span><i className="fa-regular fa-calendar" /> {a.dateFormatted}</span>
        <span><i className="fa-regular fa-clock" /> {a.time}</span>
        <span><i className="fa-solid fa-location-dot" /> {a.address}</span>
      </div>
      <div className="tech-appt-actions">
        <span className={`dash-badge ${a.status}`}>{STATUS_LABELS[a.status]}</span>
        {a.status === 'scheduled' && (
          <button className="tech-status-btn start" disabled={updating === a.id}
            onClick={() => onStatusChange(a.id, 'in_progress')}>
            <i className="fa-solid fa-play" /> Iniciar
          </button>
        )}
        {a.status === 'in_progress' && (
          <button className="tech-status-btn complete" disabled={updating === a.id}
            onClick={() => onStatusChange(a.id, 'completed')}>
            <i className="fa-solid fa-check" /> Completar
          </button>
        )}
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="dash-info-row">
      <div className="dash-info-row-icon tech-icon"><i className={`fa-solid ${icon}`} /></div>
      <div>
        <p className="dash-info-label">{label}</p>
        <p className="dash-info-value">{value}</p>
      </div>
    </div>
  )
}

export default TechnicianDashboard
