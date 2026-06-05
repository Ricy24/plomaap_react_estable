import { useState, useEffect } from 'react'
import { appointmentsApi, servicesApi, techniciansApi, authApi, formatPrice, getInitials } from '../../services/api'
import ProfileEditForm from '../../components/profile/ProfileEditForm'
import AddressMap from '../../components/AddressMap'
import '../../styles/dashboard.css'
import '../../styles/profile-edit.css'
import '../../styles/address-map.css'

function ClientDashboard({ user, onLogout, onUserUpdate }) {
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
  const [success, setSuccess] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState(user?.address || localStorage.getItem('selectedAddress') || 'Calle 85 # 11-53, Chapinero, Bogotá')
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [availableTechnicians, setAvailableTechnicians] = useState([])
  const [selectedTechnician, setSelectedTechnician] = useState(null)
  const [showTechnicianModal, setShowTechnicianModal] = useState(false)
  const [rescheduleMode, setRescheduleMode] = useState(null)
  const [selectedAppointment, setSelectedAppointment] = useState(null)

  const userAddress = selectedAddress
  const firstName = user?.name?.split(' ')[0] || 'Usuario'
  const upcoming = appointments.filter(a => a.status === 'scheduled' || a.status === 'in_progress')
  const completed = appointments.filter(a => a.status === 'completed')

  useEffect(() => { loadData() }, [])

  useEffect(() => {
    if (selectedService && selectedDate) {
      techniciansApi.getSlots(selectedDate, selectedService.id)
        .then(data => setAvailableSlots(data.slots || []))
        .catch(() => setAvailableSlots([]))
      
      techniciansApi.getMyAppointments = appointmentsApi.getTechnicianOptions
      appointmentsApi.getTechnicianOptions(selectedDate, selectedService.id)
        .then(data => setAvailableTechnicians(data.technicians || []))
        .catch(() => setAvailableTechnicians([]))
      
      setSelectedTime(null)
      setSelectedTechnician(null)
    }
  }, [selectedService, selectedDate])

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
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (payload) => {
    setSavingProfile(true)
    try {
      const data = await authApi.updateProfile(payload)
      onUserUpdate?.(data.user)
    } catch (err) {
      setSavingProfile(false)
      throw err
    }
    setSavingProfile(false)
  }

  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return
    setBooking(true)
    setError('')
    setSuccess('')
    try {
      const payload = {
        serviceId: selectedService.id,
        date: selectedDate,
        time: selectedTime,
        address: userAddress
      }
      if (selectedTechnician) {
        payload.technicianId = selectedTechnician.id
      }
      const data = await appointmentsApi.create(payload)
      setAppointments(prev => [data.appointment, ...prev])
      setSuccess(`¡Cita confirmada! Tu técnico será ${data.appointment.technicianName}.`)
      setSelectedService(null)
      setSelectedDate('')
      setSelectedTime(null)
      setSelectedTechnician(null)
      setActiveTab('citas')
    } catch (err) {
      setError(err.message)
    } finally {
      setBooking(false)
    }
  }

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta cita?')) return
    
    setError('')
    setSuccess('')
    try {
      await appointmentsApi.cancel(appointmentId)
      setAppointments(prev => prev.map(a => 
        a.id === appointmentId ? { ...a, status: 'cancelled' } : a
      ))
      setSuccess('Cita cancelada exitosamente')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleRescheduleAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setRescheduleMode(appointment.id)
    setSelectedDate(appointment.date)
    setSelectedTime(appointment.time)
  }

  const handleConfirmReschedule = async () => {
    if (!selectedAppointment || !selectedDate || !selectedTime) return
    
    setBooking(true)
    setError('')
    setSuccess('')
    try {
      const data = await appointmentsApi.reschedule(selectedAppointment.id, selectedDate, selectedTime)
      setAppointments(prev => prev.map(a => a.id === selectedAppointment.id ? data.appointment : a))
      setSuccess('Cita reprogramada exitosamente')
      setRescheduleMode(null)
      setSelectedAppointment(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setBooking(false)
    }
  }

  const navItems = [
    { id: 'inicio', icon: 'fa-house', label: 'Inicio' },
    { id: 'agendar', icon: 'fa-calendar-plus', label: 'Agendar' },
    { id: 'citas', icon: 'fa-clipboard-list', label: 'Mis citas' },
    { id: 'perfil', icon: 'fa-user', label: 'Perfil' },
  ]

  if (loading) {
    return (
      <div className="dash-loading">
        <i className="fa-solid fa-spinner fa-spin" />
        <p>Cargando tu panel...</p>
      </div>
    )
  }

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar">
        <div className="dash-brand"><div className="logo-dot" /><span>PlomApp</span></div>
        <nav className="dash-nav">
          {navItems.map(item => (
            <button key={item.id} className={`dash-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(item.id); setError(''); setSuccess('') }}>
              <i className={`fa-solid ${item.icon}`} /><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <SidebarUser user={user} firstName={firstName} role="Cliente" />
        <button className="dash-logout" onClick={onLogout}>
          <i className="fa-solid fa-arrow-right-from-bracket" /><span>Salir</span>
        </button>
      </aside>

      <main className="dash-main">
        <header className="dash-topbar">
          <div>
            <p className="dash-greeting-label">Tu espacio de servicios</p>
            <h1 className="dash-greeting">Hola, {firstName} 👋</h1>
          </div>
          <div className="dash-topbar-actions">
            <button className="dash-notif-btn" aria-label="Notificaciones">
              <i className="fa-regular fa-bell" />
              {upcoming.length > 0 && <span className="dash-notif-dot" />}
            </button>
            <Avatar user={user} size="header" />
          </div>
        </header>

        {success && <div className="dash-alert success"><i className="fa-solid fa-circle-check" /> {success}</div>}
        {error && activeTab !== 'agendar' && <div className="dash-alert error"><i className="fa-solid fa-circle-exclamation" /> {error}</div>}

        <div className="dash-stats">
          <div className="dash-stat-card">
            <div className="dash-stat-icon scheduled"><i className="fa-solid fa-calendar-check" /></div>
            <div><p className="dash-stat-num">{upcoming.length}</p><p className="dash-stat-label">Citas programadas</p></div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-icon completed"><i className="fa-solid fa-circle-check" /></div>
            <div><p className="dash-stat-num">{completed.length}</p><p className="dash-stat-label">Servicios completados</p></div>
          </div>
          <div className="dash-stat-card dash-stat-location">
            <div className="dash-stat-icon location"><i className="fa-solid fa-location-dot" /></div>
            <div><p className="dash-stat-label">Tu dirección</p><p className="dash-stat-address">{userAddress}</p></div>
          </div>
        </div>

        {activeTab === 'inicio' && (
          <div className="dash-content-grid">
            <div className="dash-col-main">
              {upcoming.length > 0 ? (
                <div className="dash-highlight-card">
                  <div className="dash-highlight-badge">Próxima visita</div>
                  <h3>{upcoming[0].serviceName}</h3>
                  <div className="dash-highlight-meta">
                    <span><i className="fa-regular fa-calendar" /> {upcoming[0].dateFormatted}</span>
                    <span><i className="fa-regular fa-clock" /> {upcoming[0].time}</span>
                    <span><i className="fa-solid fa-user-gear" /> {upcoming[0].technicianName}</span>
                  </div>
                  <p className="dash-highlight-address"><i className="fa-solid fa-location-dot" /> {upcoming[0].address}</p>
                </div>
              ) : (
                <div className="dash-highlight-card dash-highlight-empty">
                  <i className="fa-solid fa-calendar-plus" />
                  <h3>¿Necesitas un técnico en casa?</h3>
                  <p>Agenda tu cita de plomería en menos de un minuto.</p>
                  <button className="dash-btn-primary" onClick={() => setActiveTab('agendar')}>Agendar ahora</button>
                </div>
              )}

              <section className="dash-section">
                <div className="dash-section-header">
                  <h2>Servicios disponibles</h2>
                  <button className="dash-btn-text" onClick={() => setActiveTab('agendar')}>Ver todos</button>
                </div>
                <div className="dash-services-row">
                  {services.map(s => (
                    <button key={s.id} className="dash-service-pill"
                      onClick={() => { setSelectedService(s); setActiveTab('agendar') }}>
                      <div className={`dash-service-icon ${s.color}`}><i className={`fa-solid ${s.icon}`} /></div>
                      <span>{s.name}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="dash-section">
                <div className="dash-section-header">
                  <h2>Actividad reciente</h2>
                  <button className="dash-btn-text" onClick={() => setActiveTab('citas')}>Ver historial</button>
                </div>
                <div className="dash-activity-list">
                  {appointments.length === 0
                    ? <p className="dash-empty-text">Aún no tienes citas. ¡Agenda tu primer servicio!</p>
                    : appointments.slice(0, 3).map(a => <ActivityItem key={a.id} appointment={a} />)
                  }
                </div>
              </section>
            </div>

            <aside className="dash-col-side">
              <ProfileCard user={user} userAddress={userAddress} />
              <div className="dash-ia-card">
                <div className="dash-ia-icon"><i className="fa-solid fa-wand-magic-sparkles" /></div>
                <h3>Diagnóstico con IA</h3>
                <p>Sube una foto del problema y obtén un presupuesto estimado al instante.</p>
                <button className="dash-btn-secondary"><i className="fa-solid fa-camera" /> Analizar problema</button>
              </div>
            </aside>
          </div>
        )}

        {activeTab === 'agendar' && (
          <div className="dash-booking">
            <section className="dash-section">
              <h2>¿Qué necesitas reparar?</h2>
              <p className="dash-section-sub">Selecciona el servicio y elige cuándo quieres que visitemos tu hogar.</p>
              <div className="dash-services-grid">
                {services.map(s => (
                  <button key={s.id}
                    className={`dash-service-card ${selectedService?.id === s.id ? 'selected' : ''}`}
                    onClick={() => setSelectedService(s)}>
                    <div className={`dash-service-icon lg ${s.color}`}><i className={`fa-solid ${s.icon}`} /></div>
                    <h4>{s.name}</h4>
                    <p>{s.desc}</p>
                    <span className="dash-service-price">{formatPrice(s.priceFrom)}</span>
                  </button>
                ))}
              </div>
            </section>

            {selectedService && (
              <section className="dash-schedule-panel">
                <h3>Programar visita — {selectedService.name}</h3>
                {error && <div className="dash-alert error inline"><i className="fa-solid fa-circle-exclamation" /> {error}</div>}
                
                <div className="dash-location-section">
                  <h4 className="dash-section-subtitle">
                    <i className="fa-solid fa-location-dot"></i> Tu ubicación de servicio
                  </h4>
                  <AddressMap 
                    address={userAddress} 
                    editable={true}
                    onLocationChange={(coords) => {
                      setSelectedLocation(coords)
                      console.log('Ubicación confirmada:', coords)
                    }}
                    onAddressChange={(newAddress) => {
                      setSelectedAddress(newAddress)
                    }}
                  />
                </div>

                <div className="dash-schedule-grid">
                  <div className="dash-schedule-field">
                    <label><i className="fa-regular fa-calendar" /> Fecha</label>
                    <input type="date" value={selectedDate} min={new Date().toISOString().split('T')[0]}
                      onChange={e => setSelectedDate(e.target.value)} />
                  </div>
                </div>

                {selectedDate && (
                  <>
                    <div className="dash-time-slots">
                      <label><i className="fa-regular fa-clock" /> Horarios disponibles</label>
                      {availableSlots.length === 0
                        ? <p className="dash-empty-text">No hay horarios disponibles este día. Prueba otra fecha.</p>
                        : (
                          <div className="dash-slots-row">
                            {availableSlots.map(slot => (
                              <button key={slot} className={`dash-slot ${selectedTime === slot ? 'selected' : ''}`}
                                onClick={() => setSelectedTime(slot)}>{slot}</button>
                            ))}
                          </div>
                        )
                      }
                    </div>

                    {selectedTime && availableTechnicians.length > 0 && (
                      <div className="dash-technician-selection">
                        <label><i className="fa-solid fa-user-gear" /> Selecciona tu técnico (opcional)</label>
                        <p className="dash-section-sub">Elige el técnico que prefieras o uno será asignado automáticamente</p>
                        <div className="dash-technicians-grid">
                          {availableTechnicians.map(tech => (
                            <button 
                              key={tech.id}
                              className={`dash-technician-card ${selectedTechnician?.id === tech.id ? 'selected' : ''}`}
                              onClick={() => setSelectedTechnician(tech)}
                            >
                              <div className="tech-avatar">
                                {tech.avatar ? <img src={tech.avatar} alt={tech.name} /> : <i className="fa-solid fa-user"></i>}
                              </div>
                              <h5>{tech.name}</h5>
                              <div className="tech-stats">
                                <span><i className="fa-solid fa-star"></i> {tech.rating}</span>
                                <span><i className="fa-solid fa-check"></i> {tech.completedJobs} trabajos</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
                <button className="dash-btn-primary dash-btn-confirm"
                  disabled={!selectedDate || !selectedTime || booking}
                  onClick={handleConfirmBooking}>
                  <i className={`fa-solid ${booking ? 'fa-spinner fa-spin' : 'fa-calendar-check'}`} />
                  {booking ? 'Agendando...' : 'Confirmar cita'}
                </button>
              </section>
            )}
          </div>
        )}

        {activeTab === 'citas' && (
          <section className="dash-section">
            <h2>Mis citas</h2>
            <p className="dash-section-sub">Todas tus visitas programadas y servicios anteriores.</p>
            {appointments.length === 0
              ? <p className="dash-empty-text">No tienes citas aún.</p>
              : (
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
              )
            }
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
        ? <img src={user.avatar} alt={user.name} />
        : <span className="dash-avatar-initials">{getInitials(user?.name)}</span>
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
          ? <img src={user.avatar} alt={user.name} />
          : <span className="dash-avatar-initials lg">{getInitials(user?.name)}</span>
        }
      </div>
      <h3>{user?.name}</h3>
      <p className="dash-profile-email">{user?.email}</p>
      {user?.phone && <p className="dash-profile-phone"><i className="fa-solid fa-phone" /> {user.phone}</p>}
      <div className="dash-profile-address">
        <i className="fa-solid fa-location-dot" /><span>{userAddress}</span>
      </div>
    </div>
  )
}

function ActivityItem({ appointment: a }) {
  const statusLabel = { scheduled: 'Programado', in_progress: 'En curso', completed: 'Completado', cancelled: 'Cancelado' }
  return (
    <div className="dash-activity-item">
      <div className={`dash-activity-dot ${a.status}`} />
      <div className="dash-activity-info">
        <p className="dash-activity-title">{a.serviceName}</p>
        <p className="dash-activity-date">{a.dateFormatted} · {a.time} · {a.technicianName}</p>
      </div>
      <span className={`dash-badge ${a.status}`}>{statusLabel[a.status] || a.status}</span>
    </div>
  )
}

function AppointmentCard({ appointment: a, onCancel, onReschedule, isUpcoming }) {
  const statusLabel = { scheduled: 'Programado', in_progress: 'En curso', completed: 'Completado', cancelled: 'Cancelado' }
  const canModify = isUpcoming && (a.status === 'scheduled' || a.status === 'in_progress')
  
  return (
    <div className={`dash-appt-card ${a.status}`}>
      <div className="dash-appt-header">
        <h4>{a.serviceName}</h4>
        <span className={`dash-badge ${a.status}`}>{statusLabel[a.status] || a.status}</span>
      </div>
      <div className="dash-appt-meta">
        <span><i className="fa-regular fa-calendar" /> {a.dateFormatted}</span>
        <span><i className="fa-regular fa-clock" /> {a.time}</span>
        <span><i className="fa-solid fa-user-gear" /> {a.technicianName}</span>
      </div>
      <p className="dash-appt-address"><i className="fa-solid fa-location-dot" /> {a.address}</p>
      
      {canModify && (
        <div className="dash-appt-actions">
          <button 
            className="dash-appt-btn reschedule"
            onClick={() => onReschedule?.(a)}
            title="Reprogramar cita"
          >
            <i className="fa-solid fa-calendar-days" /> Reprogramar
          </button>
          <button 
            className="dash-appt-btn cancel"
            onClick={() => onCancel?.(a.id)}
            title="Cancelar cita"
          >
            <i className="fa-solid fa-times" /> Cancelar
          </button>
        </div>
      )}
    </div>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="dash-info-row">
      <div className="dash-info-row-icon"><i className={`fa-solid ${icon}`} /></div>
      <div>
        <p className="dash-info-label">{label}</p>
        <p className="dash-info-value">{value}</p>
      </div>
    </div>
  )
}

export default ClientDashboard
