import { useState, useEffect } from 'react'
import { appointmentsApi, servicesApi, techniciansApi, authApi, formatPrice, getInitials } from '../../services/api'
import ProfileEditForm from '../../components/profile/ProfileEditForm'
import AddressMap from '../../components/AddressMap'
import Logo from '../../components/ui/Logo'
import { DashboardSkeleton } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import { useFeedback } from '../../components/ui/feedbackContext'
import '../../styles/dashboard.css'
import '../../styles/profile-edit.css'
import '../../styles/address-map.css'

const STATUS_LABELS = {
  pending: 'Pendiente',
  scheduled: 'Programado',
  in_progress: 'En curso',
  completed: 'Completado',
  cancelled: 'Cancelado',
}

function ClientDashboard({ user, onLogout, onUserUpdate }) {
  const { toast, confirm } = useFeedback()
  const [activeTab, setActiveTab] = useState('inicio')
  const [services, setServices] = useState([])
  const [appointments, setAppointments] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [error, setError] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState(user?.address || localStorage.getItem('selectedAddress') || 'Calle 85 # 11-53, Chapinero, Bogotá')
  const [availableTechnicians, setAvailableTechnicians] = useState([])
  const [selectedTechnician, setSelectedTechnician] = useState(null)
  const [rescheduleAppointment, setRescheduleAppointment] = useState(null)

  const userAddress = selectedAddress
  const firstName = user?.name?.split(' ')[0] || 'Usuario'
  const upcoming = appointments.filter(a => a.status === 'scheduled' || a.status === 'in_progress')
  const completed = appointments.filter(a => a.status === 'completed')

  const loadData = async () => {
    setLoading(true)
    try {
      const [svcData, apptData] = await Promise.all([
        servicesApi.getAll(),
        appointmentsApi.getAll()
      ])
      setServices(svcData.services || [])
      setAppointments(apptData.appointments || [])
    } catch (err) {
      toast.error(err.message, { title: 'No pudimos cargar tu panel' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (selectedService && selectedDate) {
      techniciansApi.getSlots(selectedDate, selectedService.id)
        .then(data => setAvailableSlots(data.slots || []))
        .catch(() => setAvailableSlots([]))

      appointmentsApi.getTechnicianOptions(selectedDate, selectedService.id)
        .then(data => setAvailableTechnicians(data.technicians || []))
        .catch(() => setAvailableTechnicians([]))

      if (!rescheduleAppointment) {
        setSelectedTime(null)
        setSelectedTechnician(null)
      }
    }
  }, [selectedService, selectedDate, rescheduleAppointment])

  const handleSaveProfile = async (payload) => {
    setSavingProfile(true)
    try {
      const data = await authApi.updateProfile(payload)
      onUserUpdate?.(data.user)
      toast.success('Tus datos se actualizaron correctamente.')
    } catch (err) {
      setSavingProfile(false)
      throw err
    }
    setSavingProfile(false)
  }

  const resetBooking = () => {
    setSelectedService(null)
    setSelectedDate('')
    setSelectedTime(null)
    setSelectedTechnician(null)
    setRescheduleAppointment(null)
  }

  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return
    setBooking(true)
    setError('')
    try {
      if (rescheduleAppointment) {
        const data = await appointmentsApi.reschedule(
          rescheduleAppointment.id,
          selectedDate,
          selectedTime
        )
        setAppointments(prev =>
          prev.map(a => (a.id === rescheduleAppointment.id ? data.appointment : a))
        )
        toast.success('Cita reprogramada exitosamente.')
        resetBooking()
        setActiveTab('citas')
        return
      }

      const payload = {
        serviceId: selectedService.id,
        date: selectedDate,
        time: selectedTime,
        address: userAddress,
        notes: `Dirección de servicio: ${userAddress}`
      }
      if (selectedTechnician) {
        payload.technicianId = selectedTechnician.id
      }
      const data = await appointmentsApi.create(payload)
      setAppointments(prev => [data.appointment, ...prev])
      toast.success(
        `¡Cita confirmada! Tu técnico será ${data.appointment.technicianName}.`,
        { title: 'Reserva creada' }
      )
      resetBooking()
      setActiveTab('citas')
    } catch (err) {
      setError(err.message)
      toast.error(err.message, { title: 'No se pudo agendar' })
    } finally {
      setBooking(false)
    }
  }

  const handleCancelAppointment = async (appointmentId) => {
    const accepted = await confirm({
      title: 'Cancelar esta cita',
      description: 'El técnico asignado será notificado y el espacio quedará libre. Esta acción no se puede deshacer.',
      confirmLabel: 'Sí, cancelar',
      cancelLabel: 'Mantener cita',
      tone: 'danger',
    })
    if (!accepted) return

    try {
      await appointmentsApi.cancel(appointmentId)
      setAppointments(prev => prev.map(a =>
        a.id === appointmentId ? { ...a, status: 'cancelled' } : a
      ))
      toast.success('Cita cancelada exitosamente.')
    } catch (err) {
      toast.error(err.message, { title: 'No se pudo cancelar' })
    }
  }

  const handleRescheduleAppointment = (appointment) => {
    const service =
      services.find(s => s.id === appointment.serviceId) || appointment.service
    if (service) setSelectedService(service)
    setRescheduleAppointment(appointment)
    setSelectedDate(appointment.date)
    setSelectedTime(appointment.time)
    setActiveTab('agendar')
    setError('')
  }

  const navItems = [
    { id: 'inicio', icon: 'fa-house', label: 'Inicio' },
    { id: 'agendar', icon: 'fa-calendar-plus', label: 'Agendar' },
    { id: 'citas', icon: 'fa-clipboard-list', label: 'Mis citas' },
    { id: 'perfil', icon: 'fa-user', label: 'Perfil' },
  ]

  if (loading) {
    return (
      <div data-testid="client-dashboard">
        <DashboardSkeleton label="Cargando tu panel..." />
      </div>
    )
  }

  return (
    <div className="dash-layout" data-testid="client-dashboard">
      <aside className="dash-sidebar">
        <div className="dash-brand">
          <Logo tone="inverse" />
        </div>
        <nav className="dash-nav" aria-label="Navegación del panel">
          {navItems.map(item => (
            <button
              key={item.id}
              type="button"
              className={`dash-nav-item ${activeTab === item.id ? 'active' : ''}`}
              aria-current={activeTab === item.id ? 'page' : undefined}
              onClick={() => { setActiveTab(item.id); setError('') }}
            >
              <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <SidebarUser user={user} firstName={firstName} role="Cliente" />
        <button className="dash-logout" type="button" onClick={onLogout}>
          <i className="fa-solid fa-arrow-right-from-bracket" aria-hidden="true" />
          <span>Salir</span>
        </button>
      </aside>

      <main className="dash-main" id="contenido">
        <header className="dash-topbar">
          <div>
            <p className="dash-greeting-label">Tu espacio de servicios</p>
            <h1 className="dash-greeting">Hola, {firstName} 👋</h1>
          </div>
          <div className="dash-topbar-actions">
            <button
              className="dash-notif-btn"
              type="button"
              aria-label={upcoming.length > 0 ? `${upcoming.length} citas próximas` : 'Sin notificaciones'}
            >
              <i className="fa-regular fa-bell" aria-hidden="true" />
              {upcoming.length > 0 && <span className="dash-notif-dot" />}
            </button>
            <Avatar user={user} size="header" />
          </div>
        </header>

        <div className="dash-stats">
          <div className="dash-stat-card">
            <div className="dash-stat-icon scheduled"><i className="fa-solid fa-calendar-check" aria-hidden="true" /></div>
            <div>
              <p className="dash-stat-num">{upcoming.length}</p>
              <p className="dash-stat-label">Citas programadas</p>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-icon completed"><i className="fa-solid fa-circle-check" aria-hidden="true" /></div>
            <div>
              <p className="dash-stat-num">{completed.length}</p>
              <p className="dash-stat-label">Servicios completados</p>
            </div>
          </div>
          <div className="dash-stat-card dash-stat-location">
            <div className="dash-stat-icon location"><i className="fa-solid fa-location-dot" aria-hidden="true" /></div>
            <div>
              <p className="dash-stat-label">Tu dirección</p>
              <p className="dash-stat-address">{userAddress}</p>
            </div>
          </div>
        </div>

        {activeTab === 'inicio' && (
          <div className="dash-content-grid">
            <div className="dash-col-main">
              {upcoming.length > 0 ? (
                <div className="dash-highlight-card">
                  <div className="dash-highlight-badge">Próxima visita</div>
                  <h3>{upcoming[0].serviceName || upcoming[0].service?.name}</h3>
                  <div className="dash-highlight-meta">
                    <span><i className="fa-regular fa-calendar" aria-hidden="true" /> {upcoming[0].dateFormatted || upcoming[0].date}</span>
                    <span><i className="fa-regular fa-clock" aria-hidden="true" /> {upcoming[0].time}</span>
                    <span><i className="fa-solid fa-user-gear" aria-hidden="true" /> {upcoming[0].technicianName || upcoming[0].technician?.name || 'Por asignar'}</span>
                  </div>
                  <p className="dash-highlight-address">
                    <i className="fa-solid fa-location-dot" aria-hidden="true" /> {upcoming[0].address}
                  </p>
                </div>
              ) : (
                <div className="dash-highlight-card dash-highlight-empty">
                  <i className="fa-solid fa-calendar-plus" aria-hidden="true" />
                  <h3>¿Necesitas un técnico en casa?</h3>
                  <p>Agenda tu cita de plomería en menos de un minuto.</p>
                  <button className="dash-btn-primary" type="button" onClick={() => setActiveTab('agendar')}>
                    <i className="fa-solid fa-calendar-plus" aria-hidden="true" /> Reservar ahora
                  </button>
                </div>
              )}

              <section className="dash-section" aria-labelledby="servicios-title">
                <div className="dash-section-header">
                  <h2 id="servicios-title">Servicios disponibles</h2>
                  <button className="dash-btn-text" type="button" onClick={() => setActiveTab('agendar')}>Ver todos</button>
                </div>
                {services.length === 0 ? (
                  <EmptyState
                    icon="fa-screwdriver-wrench"
                    title="Sin servicios por ahora"
                    description="Estamos actualizando el catálogo. Vuelve en unos minutos."
                  />
                ) : (
                  <div className="dash-services-row">
                    {services.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        className="dash-service-pill"
                        onClick={() => { setSelectedService(s); setActiveTab('agendar') }}
                      >
                        <div className={`dash-service-icon ${s.color}`}><i className={`fa-solid ${s.icon}`} aria-hidden="true" /></div>
                        <span>{s.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </section>

              <section className="dash-section" aria-labelledby="actividad-title">
                <div className="dash-section-header">
                  <h2 id="actividad-title">Actividad reciente</h2>
                  <button className="dash-btn-text" type="button" onClick={() => setActiveTab('citas')}>Ver historial</button>
                </div>
                {appointments.length === 0 ? (
                  <EmptyState
                    icon="fa-clipboard-list"
                    title="Aún no tienes citas"
                    description="Cuando agendes tu primer servicio aparecerá aquí con su estado."
                  />
                ) : (
                  <div className="dash-activity-list">
                    {appointments.slice(0, 3).map(a => <ActivityItem key={a.id} appointment={a} />)}
                  </div>
                )}
              </section>
            </div>

            <aside className="dash-col-side" aria-label="Resumen de tu cuenta">
              <ProfileCard user={user} userAddress={userAddress} />
              <div className="dash-ia-card">
                <div className="dash-ia-icon"><i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true" /></div>
                <h3>Diagnóstico con IA</h3>
                <p>Sube una foto del problema y obtén un presupuesto estimado al instante.</p>
                <button
                  className="dash-btn-secondary"
                  type="button"
                  onClick={() => toast.info('El diagnóstico con IA estará disponible muy pronto.', { title: 'Próximamente' })}
                >
                  <i className="fa-solid fa-camera" aria-hidden="true" /> Analizar problema
                </button>
              </div>
            </aside>
          </div>
        )}

        {activeTab === 'agendar' && (
          <div className="dash-booking">
            <section className="dash-section" aria-labelledby="agendar-title">
              <h2 id="agendar-title">{rescheduleAppointment ? 'Reprogramar visita' : '¿Qué necesitas reparar?'}</h2>
              <p className="dash-section-sub">
                {rescheduleAppointment
                  ? 'Elige una nueva fecha y hora para tu cita.'
                  : 'Selecciona el servicio y elige cuándo quieres que visitemos tu hogar.'}
              </p>
              {services.length === 0 ? (
                <EmptyState
                  icon="fa-screwdriver-wrench"
                  title="Catálogo no disponible"
                  description="No pudimos cargar los servicios. Recarga la página para intentarlo de nuevo."
                />
              ) : (
                <div className="dash-services-grid" role="group" aria-label="Servicios disponibles">
                  {services.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      className={`dash-service-card ${selectedService?.id === s.id ? 'selected' : ''}`}
                      aria-pressed={selectedService?.id === s.id}
                      onClick={() => setSelectedService(s)}
                    >
                      <div className={`dash-service-icon lg ${s.color}`}><i className={`fa-solid ${s.icon}`} aria-hidden="true" /></div>
                      <h4>{s.name}</h4>
                      <p>{s.description}</p>
                      <span className="dash-service-price">{formatPrice(s.base_price || 0)}</span>
                    </button>
                  ))}
                </div>
              )}
            </section>

            {selectedService && (
              <section className="dash-schedule-panel" aria-labelledby="programar-title">
                <h3 id="programar-title">Programar visita — {selectedService.name}</h3>
                {error && (
                  <div className="dash-alert error inline" role="alert">
                    <i className="fa-solid fa-circle-exclamation" aria-hidden="true" /> {error}
                  </div>
                )}

                <div className="dash-location-section">
                  <h4 className="dash-section-subtitle">
                    <i className="fa-solid fa-location-dot" aria-hidden="true" /> Tu ubicación de servicio
                  </h4>
                  <AddressMap
                    address={userAddress}
                    editable={true}
                    onAddressChange={(newAddress) => {
                      setSelectedAddress(newAddress)
                    }}
                  />
                </div>

                <div className="dash-schedule-grid">
                  <div className="dash-schedule-field">
                    <label htmlFor="booking-date">
                      <i className="fa-regular fa-calendar" aria-hidden="true" /> Fecha
                    </label>
                    <input
                      id="booking-date"
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setSelectedDate(e.target.value)}
                    />
                  </div>
                </div>

                {selectedDate && (
                  <>
                    <div className="dash-time-slots">
                      <label id="slots-label">
                        <i className="fa-regular fa-clock" aria-hidden="true" /> Horarios disponibles
                      </label>
                      {availableSlots.length === 0 ? (
                        <p className="dash-empty-text">No hay horarios disponibles este día. Prueba otra fecha.</p>
                      ) : (
                        <div className="dash-slots-row" role="group" aria-labelledby="slots-label">
                          {availableSlots.map(slot => {
                            const slotTime = typeof slot === 'string' ? slot : (slot.time || slot.start)
                            const isAvail = typeof slot === 'string' ? true : (slot.available !== false)
                            return (
                              <button
                                key={slotTime}
                                type="button"
                                disabled={!isAvail}
                                aria-pressed={selectedTime === slotTime}
                                className={`dash-slot ${selectedTime === slotTime ? 'selected' : ''} ${!isAvail ? 'disabled' : ''}`}
                                onClick={() => isAvail && setSelectedTime(slotTime)}
                              >
                                {slotTime}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {selectedTime && availableTechnicians.length > 0 && (
                      <div className="dash-technician-selection">
                        <label id="tech-label">
                          <i className="fa-solid fa-user-gear" aria-hidden="true" /> Selecciona tu técnico (opcional)
                        </label>
                        <p className="dash-section-sub">Elige el técnico que prefieras o uno será asignado automáticamente</p>
                        <div className="dash-technicians-grid" role="group" aria-labelledby="tech-label">
                          {availableTechnicians.map(tech => (
                            <button
                              key={tech.id}
                              type="button"
                              aria-pressed={selectedTechnician?.id === tech.id}
                              className={`dash-technician-card ${selectedTechnician?.id === tech.id ? 'selected' : ''}`}
                              onClick={() => setSelectedTechnician(tech)}
                            >
                              <div className="tech-avatar">
                                {tech.avatar ? <img src={tech.avatar} alt="" /> : <i className="fa-solid fa-user" aria-hidden="true" />}
                              </div>
                              <h5>{tech.name}</h5>
                              <div className="tech-stats">
                                <span><i className="fa-solid fa-star" aria-hidden="true" /> {tech.rating}</span>
                                <span><i className="fa-solid fa-check" aria-hidden="true" /> {tech.completedJobs} trabajos</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                <button
                  className="dash-btn-primary dash-btn-confirm"
                  type="button"
                  disabled={!selectedDate || !selectedTime || booking}
                  onClick={handleConfirmBooking}
                >
                  <i className={`fa-solid ${booking ? 'fa-spinner fa-spin' : 'fa-calendar-check'}`} aria-hidden="true" />
                  {booking ? 'Agendando...' : rescheduleAppointment ? 'Confirmar reprogramación' : 'Confirmar cita'}
                </button>
              </section>
            )}
          </div>
        )}

        {activeTab === 'citas' && (
          <section className="dash-section" aria-labelledby="citas-title">
            <h2 id="citas-title">Mis citas</h2>
            <p className="dash-section-sub">Todas tus visitas programadas y servicios anteriores.</p>
            {appointments.length === 0 ? (
              <EmptyState
                icon="fa-calendar-plus"
                title="Todavía no tienes citas"
                description="Agenda tu primer servicio y un técnico verificado llegará a tu puerta."
                action={
                  <button className="dash-btn-primary" type="button" onClick={() => setActiveTab('agendar')}>
                    Reservar servicio
                  </button>
                }
              />
            ) : (
              <>
                {upcoming.length > 0 && (
                  <>
                    <h3 className="dash-subsection-title">Programadas</h3>
                    <div className="dash-appointments-grid">
                      {upcoming.map(a => (
                        <AppointmentCard
                          key={a.id}
                          appointment={a}
                          onCancel={handleCancelAppointment}
                          onReschedule={handleRescheduleAppointment}
                          isUpcoming={true}
                        />
                      ))}
                    </div>
                  </>
                )}
                {completed.length > 0 && (
                  <>
                    <h3 className="dash-subsection-title">Historial</h3>
                    <div className="dash-appointments-grid">
                      {completed.map(a => <AppointmentCard key={a.id} appointment={a} />)}
                    </div>
                  </>
                )}
              </>
            )}
          </section>
        )}

        {activeTab === 'perfil' && (
          <div className="dash-profile-page">
            <div className="dash-profile-details full-width">
              <ProfileEditForm
                user={user}
                role="user"
                mode="self"
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

function Avatar({ user, size = 'sm' }) {
  const cls = size === 'header' ? 'dash-avatar-header' : 'dash-avatar-sm'
  return (
    <div className={cls}>
      {user?.avatar
        ? <img src={user.avatar} alt="" />
        : <span className="dash-avatar-initials" aria-hidden="true">{getInitials(user?.name)}</span>
      }
    </div>
  )
}

function SidebarUser({ user, firstName, role }) {
  return (
    <div className="dash-sidebar-user">
      <Avatar user={user} />
      <div className="dash-sidebar-user-info">
        <p className="dash-sidebar-name">{firstName}</p>
        <p className="dash-sidebar-role">{role}</p>
      </div>
    </div>
  )
}

function ProfileCard({ user, userAddress, large = false }) {
  return (
    <div className={`dash-profile-card ${large ? 'large' : ''}`}>
      <div className={`dash-profile-avatar ${large ? 'lg' : ''}`}>
        {user?.avatar
          ? <img src={user.avatar} alt="" />
          : <span className="dash-avatar-initials lg" aria-hidden="true">{getInitials(user?.name)}</span>
        }
      </div>
      <h3>{user?.name}</h3>
      <p className="dash-profile-email">{user?.email}</p>
      {user?.phone && <p className="dash-profile-phone"><i className="fa-solid fa-phone" aria-hidden="true" /> {user.phone}</p>}
      <div className="dash-profile-address">
        <i className="fa-solid fa-location-dot" aria-hidden="true" /><span>{userAddress}</span>
      </div>
    </div>
  )
}

function ActivityItem({ appointment: a }) {
  return (
    <div className="dash-activity-item">
      <div className={`dash-activity-dot ${a.status}`} aria-hidden="true" />
      <div className="dash-activity-info">
        <p className="dash-activity-title">{a.service?.name || a.serviceName || 'Servicio'}</p>
        <p className="dash-activity-date">
          {a.dateFormatted || a.date} · {a.time} · {a.technician?.name || a.technicianName || 'Técnico por asignar'}
        </p>
      </div>
      <span className={`dash-badge ${a.status}`}>{STATUS_LABELS[a.status] || a.status}</span>
    </div>
  )
}

function AppointmentCard({ appointment: a, onCancel, onReschedule, isUpcoming }) {
  const canModify = isUpcoming && (a.status === 'scheduled' || a.status === 'pending')

  return (
    <article className={`dash-appt-card ${a.status}`}>
      <div className="dash-appt-header">
        <h4>{a.service?.name || a.serviceName || 'Servicio'}</h4>
        <span className={`dash-badge ${a.status}`}>{STATUS_LABELS[a.status] || a.status}</span>
      </div>
      <div className="dash-appt-meta">
        <span><i className="fa-regular fa-calendar" aria-hidden="true" /> {a.dateFormatted || a.date}</span>
        <span><i className="fa-regular fa-clock" aria-hidden="true" /> {a.time}</span>
        <span><i className="fa-solid fa-user-gear" aria-hidden="true" /> {a.technician?.name || a.technicianName || 'Por asignar'}</span>
      </div>
      <p className="dash-appt-address">
        <i className="fa-solid fa-location-dot" aria-hidden="true" /> {a.address || a.notes || a.customer?.address || 'Dirección por confirmar'}
      </p>

      {canModify && (
        <div className="dash-appt-actions">
          <button
            className="dash-appt-btn reschedule"
            type="button"
            onClick={() => onReschedule?.(a)}
          >
            <i className="fa-solid fa-calendar-days" aria-hidden="true" /> Reprogramar
          </button>
          <button
            className="dash-appt-btn cancel"
            type="button"
            onClick={() => onCancel?.(a.id)}
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" /> Cancelar
          </button>
        </div>
      )}
    </article>
  )
}

export default ClientDashboard
