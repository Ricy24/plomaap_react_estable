import { useState, useEffect } from 'react'
import { techniciansApi, authApi, getInitials } from '../../services/api'
import ProfileEditForm from '../../components/profile/ProfileEditForm'
import Logo from '../../components/ui/Logo'
import { DashboardSkeleton } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import { useFeedback } from '../../components/ui/feedbackContext'
import '../../styles/dashboard.css'
import '../../styles/technician-dashboard.css'
import '../../styles/profile-edit.css'

const DAY_NAMES = { mon: 'Lun', tue: 'Mar', wed: 'Mié', thu: 'Jue', fri: 'Vie', sat: 'Sáb', sun: 'Dom' }
const STATUS_LABELS = { scheduled: 'Programada', in_progress: 'En curso', completed: 'Completada', cancelled: 'Cancelada' }

function formatScheduleSlot(slot) {
  if (Array.isArray(slot)) {
    const start = String(slot[0]).padStart(2, '0')
    const end = String(slot[1]).padStart(2, '0')
    return `${start}:00 - ${end}:00`
  }
  return String(slot)
}

function TechnicianDashboard({ user, technicianProfile, onLogout, onUserUpdate }) {
  const { toast } = useFeedback()
  const [activeTab, setActiveTab] = useState('inicio')
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profile, setProfile] = useState(
    technicianProfile || JSON.parse(localStorage.getItem('technicianProfile') || 'null')
  )

  const firstName = user?.name?.split(' ')[0] || 'Técnico'
  const today = new Date().toISOString().split('T')[0]

  const todayAppts = appointments.filter(a => a.date === today && a.status !== 'completed' && a.status !== 'cancelled')
  const upcoming = appointments.filter(a => a.status === 'scheduled' || a.status === 'in_progress')
  const completed = appointments.filter(a => a.status === 'completed')

  const loadData = async () => {
    setLoading(true)
    try {
      const [apptData, profData] = await Promise.all([
        techniciansApi.getMyAppointments().catch(() => ({ appointments: [] })),
        profile ? Promise.resolve(profile) : techniciansApi.getProfile().catch(() => null)
      ])
      setAppointments(apptData.appointments || [])
      if (profData) {
        setProfile(profData)
        localStorage.setItem('technicianProfile', JSON.stringify(profData))
      }
    } catch (err) {
      console.error(err)
      toast.error('No pudimos cargar tus citas asignadas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSaveProfile = async (payload) => {
    setSavingProfile(true)
    try {
      const data = await authApi.updateProfile(payload)
      onUserUpdate?.(data.user, data.technicianProfile)
      toast.success('Tus datos se actualizaron correctamente.')
    } catch (err) {
      setSavingProfile(false)
      throw err
    }
    setSavingProfile(false)
  }

  const handleStatusChange = async (id, status) => {
    setUpdating(id)
    try {
      const data = await techniciansApi.updateAppointmentStatus(id, status)
      setAppointments(prev => prev.map(a => a.id === id ? data.appointment : a))
      toast.success(
        status === 'in_progress'
          ? 'Servicio iniciado. ¡Buen trabajo!'
          : 'Servicio marcado como completado.'
      )
    } catch (err) {
      toast.error(err.message, { title: 'No se pudo actualizar la cita' })
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
      <div data-testid="technician-dashboard">
        <DashboardSkeleton label="Cargando panel técnico..." />
      </div>
    )
  }

  return (
    <div className="dash-layout tech-theme" data-testid="technician-dashboard">
      <aside className="dash-sidebar tech-sidebar">
        <div className="dash-brand tech-brand">
          <Logo tone="tech" />
        </div>
        <nav className="dash-nav" aria-label="Navegación del panel técnico">
          {navItems.map(item => (
            <button
              key={item.id}
              type="button"
              className={`dash-nav-item tech-nav-item ${activeTab === item.id ? 'active' : ''}`}
              aria-current={activeTab === item.id ? 'page' : undefined}
              onClick={() => setActiveTab(item.id)}
            >
              <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="dash-sidebar-user">
          <div className="dash-avatar-sm">
            {user?.avatar
              ? <img src={user.avatar} alt="" />
              : <span className="dash-avatar-initials tech-initials" aria-hidden="true">{getInitials(user?.name)}</span>
            }
          </div>
          <div className="dash-sidebar-user-info">
            <p className="dash-sidebar-name">{firstName}</p>
            <p className="dash-sidebar-role">Técnico · ⭐ {profile?.rating || '—'}</p>
          </div>
        </div>
        <button className="dash-logout" type="button" onClick={onLogout}>
          <i className="fa-solid fa-arrow-right-from-bracket" aria-hidden="true" />
          <span>Salir</span>
        </button>
      </aside>

      <main className="dash-main" id="contenido">
        <header className="dash-topbar">
          <div>
            <p className="dash-greeting-label">Panel de técnico</p>
            <h1 className="dash-greeting">Hola, {firstName} 🔧</h1>
          </div>
          <div className="dash-topbar-actions">
            <div className="tech-rating-badge" title="Calificación promedio">
              <i className="fa-solid fa-star" aria-hidden="true" />
              <span>{profile?.rating || '4.8'}</span>
            </div>
            <div className="dash-avatar-header">
              {user?.avatar
                ? <img src={user.avatar} alt="" />
                : <span className="dash-avatar-initials tech-initials" aria-hidden="true">{getInitials(user?.name)}</span>
              }
            </div>
          </div>
        </header>

        <div className="dash-stats">
          <div className="dash-stat-card">
            <div className="dash-stat-icon scheduled tech-stat"><i className="fa-solid fa-calendar-day" aria-hidden="true" /></div>
            <div>
              <p className="dash-stat-num">{todayAppts.length}</p>
              <p className="dash-stat-label">Citas hoy</p>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-icon completed tech-stat"><i className="fa-solid fa-circle-check" aria-hidden="true" /></div>
            <div>
              <p className="dash-stat-num">{profile?.completedJobs || completed.length}</p>
              <p className="dash-stat-label">Servicios realizados</p>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-icon location tech-stat"><i className="fa-solid fa-map-location-dot" aria-hidden="true" /></div>
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
                    <span><i className="fa-regular fa-clock" aria-hidden="true" /> {todayAppts[0].time}</span>
                    <span><i className="fa-solid fa-user" aria-hidden="true" /> {todayAppts[0].clientName}</span>
                    <span><i className="fa-solid fa-phone" aria-hidden="true" /> {todayAppts[0].clientPhone || 'Sin teléfono'}</span>
                  </div>
                  <p className="dash-highlight-address">
                    <i className="fa-solid fa-location-dot" aria-hidden="true" /> {todayAppts[0].address}
                  </p>
                  <div className="tech-action-row">
                    {todayAppts[0].status === 'scheduled' && (
                      <button
                        className="dash-btn-primary tech-btn"
                        type="button"
                        disabled={updating === todayAppts[0].id}
                        onClick={() => handleStatusChange(todayAppts[0].id, 'in_progress')}
                      >
                        <i className={`fa-solid ${updating === todayAppts[0].id ? 'fa-spinner fa-spin' : 'fa-play'}`} aria-hidden="true" />
                        {updating === todayAppts[0].id ? 'Iniciando...' : 'Iniciar servicio'}
                      </button>
                    )}
                    {todayAppts[0].status === 'in_progress' && (
                      <button
                        className="dash-btn-primary tech-btn"
                        type="button"
                        disabled={updating === todayAppts[0].id}
                        onClick={() => handleStatusChange(todayAppts[0].id, 'completed')}
                      >
                        <i className={`fa-solid ${updating === todayAppts[0].id ? 'fa-spinner fa-spin' : 'fa-check'}`} aria-hidden="true" />
                        {updating === todayAppts[0].id ? 'Guardando...' : 'Marcar completado'}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="dash-highlight-card tech-highlight dash-highlight-empty">
                  <i className="fa-solid fa-mug-hot" aria-hidden="true" />
                  <h3>Sin citas pendientes hoy</h3>
                  <p>Disfruta tu día o revisa las próximas citas programadas.</p>
                </div>
              )}

              <section className="dash-section" aria-labelledby="proximas-title">
                <div className="dash-section-header">
                  <h2 id="proximas-title">Próximas citas</h2>
                  <button className="dash-btn-text tech-text" type="button" onClick={() => setActiveTab('citas')}>Ver todas</button>
                </div>
                {upcoming.length === 0 ? (
                  <EmptyState
                    icon="fa-calendar-check"
                    title="No tienes citas programadas"
                    description="Cuando un cliente reserve tus servicios aparecerán aquí."
                  />
                ) : (
                  <div className="tech-appt-list">
                    {upcoming.slice(0, 4).map(a => (
                      <TechAppointmentRow
                        key={a.id}
                        appointment={a}
                        updating={updating}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>

            <aside className="dash-col-side" aria-label="Tu perfil profesional">
              <div className="dash-profile-card">
                <div className="dash-profile-avatar">
                  {user?.avatar
                    ? <img src={user.avatar} alt="" />
                    : <span className="dash-avatar-initials tech-initials lg" aria-hidden="true">{getInitials(user?.name)}</span>
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
                <h3><i className="fa-regular fa-calendar" aria-hidden="true" /> Horario de hoy</h3>
                <div className="tech-today-slots">
                  {(profile?.schedule?.[['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][new Date().getDay()]] || []).map((slot, idx) => (
                    <span key={idx} className="tech-slot-tag">{formatScheduleSlot(slot)}</span>
                  ))}
                  {!(profile?.schedule?.[['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][new Date().getDay()]]?.length) && (
                    <p className="dash-empty-text">Día libre</p>
                  )}
                </div>
              </div>
            </aside>
          </div>
        )}

        {activeTab === 'citas' && (
          <section className="dash-section" aria-labelledby="asignadas-title">
            <h2 id="asignadas-title">Mis citas asignadas</h2>
            <p className="dash-section-sub">Gestiona el estado de cada servicio.</p>
            {appointments.length === 0 ? (
              <EmptyState
                icon="fa-clipboard-list"
                title="Sin citas asignadas"
                description="Las reservas de clientes se asignarán a tu agenda automáticamente."
              />
            ) : (
              <div className="tech-appt-list full">
                {appointments.map(a => (
                  <TechAppointmentRow
                    key={a.id}
                    appointment={a}
                    full
                    updating={updating}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'horario' && profile?.schedule && (
          <section className="dash-section" aria-labelledby="horario-title">
            <h2 id="horario-title">Mi horario semanal</h2>
            <p className="dash-section-sub">Franjas horarias en las que estás disponible.</p>
            <div className="tech-weekly-schedule">
              {Object.entries(profile.schedule).map(([day, slots]) => (
                <div key={day} className={`tech-day-card ${slots.length === 0 ? 'off' : ''}`}>
                  <h4>{DAY_NAMES[day]}</h4>
                  {slots.length > 0
                    ? <div className="tech-day-slots">{slots.map((s, i) => <span key={i} className="tech-slot-tag">{formatScheduleSlot(s)}</span>)}</div>
                    : <p className="tech-day-off">Libre</p>
                  }
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'horario' && !profile?.schedule && (
          <section className="dash-section">
            <EmptyState
              icon="fa-calendar-week"
              title="Horario no configurado"
              description="Pide a un administrador que asigne tus franjas de disponibilidad."
            />
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
  const busy = updating === a.id
  return (
    <article className={`tech-appt-row ${a.status} ${full ? 'full' : ''}`}>
      <div className="tech-appt-client">
        {a.clientAvatar
          ? <img src={a.clientAvatar} alt="" className="tech-client-avatar" />
          : <span className="tech-client-avatar initials" aria-hidden="true">{getInitials(a.clientName)}</span>
        }
        <div>
          <p className="tech-appt-service">{a.serviceName}</p>
          <p className="tech-appt-client-name">{a.clientName}</p>
        </div>
      </div>
      <div className="tech-appt-details">
        <span><i className="fa-regular fa-calendar" aria-hidden="true" /> {a.dateFormatted || a.date}</span>
        <span><i className="fa-regular fa-clock" aria-hidden="true" /> {a.time}</span>
        <span><i className="fa-solid fa-location-dot" aria-hidden="true" /> {a.address}</span>
      </div>
      <div className="tech-appt-actions">
        <span className={`dash-badge ${a.status}`}>{STATUS_LABELS[a.status]}</span>
        {a.status === 'scheduled' && (
          <button
            className="tech-status-btn start"
            type="button"
            disabled={busy}
            onClick={() => onStatusChange(a.id, 'in_progress')}
          >
            <i className={`fa-solid ${busy ? 'fa-spinner fa-spin' : 'fa-play'}`} aria-hidden="true" /> Iniciar
          </button>
        )}
        {a.status === 'in_progress' && (
          <button
            className="tech-status-btn complete"
            type="button"
            disabled={busy}
            onClick={() => onStatusChange(a.id, 'completed')}
          >
            <i className={`fa-solid ${busy ? 'fa-spinner fa-spin' : 'fa-check'}`} aria-hidden="true" /> Completar
          </button>
        )}
      </div>
    </article>
  )
}

export default TechnicianDashboard
