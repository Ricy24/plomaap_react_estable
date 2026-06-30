import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  MESSAGES,
  validateRegisterPayload,
  validateLoginPayload,
  validateProfileFields,
  validatePassword,
  normalizePhone,
  isOAuthPassword,
  NAME_REGEX
} from './validation.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 5000
const dbPath = path.join(__dirname, 'db.json')

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

app.use(cors())
app.use(express.json())

function readDatabase() {
  try {
    const data = fs.readFileSync(dbPath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error leyendo la base de datos:', error)
    return { users: [], services: [], technicians: [], appointments: [] }
  }
}

function writeDatabase(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
}

function stripPassword(user) {
  const { password, ...rest } = user
  return rest
}

function getUserFromToken(token) {
  if (!token) return null
  const userId = parseInt(token.split('_')[1])
  const db = readDatabase()
  return db.users.find(u => u.id === userId) || null
}

function getTechnicianProfile(db, userId) {
  const profile = db.technicians.find(t => t.userId === userId)
  if (!profile) return null
  const user = db.users.find(u => u.id === userId)
  return { ...profile, name: user?.name, email: user?.email, avatar: user?.avatar, phone: user?.phone }
}

function getDayKey(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return DAY_KEYS[d.getDay()]
}

function enrichAppointment(db, appt) {
  const client = db.users.find(u => u.id === appt.userId)
  const techUser = db.users.find(u => u.id === appt.technicianId)
  const techProfile = db.technicians.find(t => t.userId === appt.technicianId)
  const service = db.services.find(s => s.id === appt.serviceId)
  return {
    ...appt,
    clientName: client?.name || 'Cliente',
    clientPhone: client?.phone || '',
    clientAvatar: client?.avatar || null,
    technicianName: techUser?.name || 'Por asignar',
    technicianAvatar: techUser?.avatar || null,
    technicianPhone: techUser?.phone || '',
    technicianRating: techProfile?.rating ?? null,
    technicianSpecialties: techProfile?.specialties ?? [],
    technicianZones: techProfile?.zones ?? [],
    technicianCompletedJobs: techProfile?.completedJobs ?? 0,
    serviceIcon: service?.icon || 'fa-wrench',
    serviceColor: service?.color || 'pipe',
    dateFormatted: new Date(appt.date + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
  }
}

function createNotification(db, { userId, type, title, message, appointmentId = null }) {
  if (!db.notifications) db.notifications = []
  const notification = {
    id: Math.max(0, ...db.notifications.map(n => n.id)) + 1,
    userId,
    type,
    title,
    message,
    appointmentId,
    read: false,
    createdAt: new Date().toISOString()
  }
  db.notifications.push(notification)
  return notification
}

function notifyAppointmentEvent(db, appt, event) {
  const enriched = enrichAppointment(db, appt)
  const events = {
    created: {
      client: { title: 'Cita confirmada', message: `Tu cita de ${enriched.serviceName} fue agendada para el ${enriched.dateFormatted} a las ${enriched.time}. Técnico: ${enriched.technicianName}.` },
      technician: { title: 'Nueva cita asignada', message: `${enriched.clientName} agendó ${enriched.serviceName} para el ${enriched.dateFormatted} a las ${enriched.time}.` }
    },
    in_progress: {
      client: { title: 'Técnico en camino', message: `${enriched.technicianName} inició el servicio de ${enriched.serviceName}.` }
    },
    completed: {
      client: { title: 'Servicio completado', message: `Tu servicio de ${enriched.serviceName} fue completado por ${enriched.technicianName}.` },
      technician: { title: 'Servicio completado', message: `Completaste ${enriched.serviceName} para ${enriched.clientName}.` }
    },
    cancelled: {
      client: { title: 'Cita cancelada', message: `Tu cita de ${enriched.serviceName} del ${enriched.dateFormatted} fue cancelada.` },
      technician: { title: 'Cita cancelada', message: `La cita de ${enriched.clientName} (${enriched.serviceName}) fue cancelada.` }
    },
    rescheduled: {
      client: { title: 'Cita reprogramada', message: `Tu cita de ${enriched.serviceName} fue reprogramada para el ${enriched.dateFormatted} a las ${enriched.time}.` },
      technician: { title: 'Cita reprogramada', message: `${enriched.clientName} reprogramó ${enriched.serviceName} para el ${enriched.dateFormatted} a las ${enriched.time}.` }
    }
  }

  const cfg = events[event]
  if (!cfg) return

  if (cfg.client) createNotification(db, { userId: appt.userId, type: event, appointmentId: appt.id, ...cfg.client })
  if (cfg.technician) createNotification(db, { userId: appt.technicianId, type: event, appointmentId: appt.id, ...cfg.technician })
}

function findAvailableTechnician(db, serviceId, date, time) {
  const dayKey = getDayKey(date)
  const candidates = db.technicians.filter(t =>
    t.specialties.includes(serviceId) &&
    t.schedule[dayKey]?.includes(time)
  )

  const available = candidates.filter(t => {
    const busy = db.appointments.some(a =>
      a.technicianId === t.userId &&
      a.date === date &&
      a.time === time &&
      a.status !== 'cancelled'
    )
    return !busy
  })

  if (available.length === 0) return null

  available.sort((a, b) => b.rating - a.rating)
  return available[0]
}

// ── AUTH ──────────────────────────────────────────

function registerDevice(db, userId, userAgent) {
  if (!userAgent) return
  if (!db.devices) db.devices = []
  const existing = db.devices.find(d => d.userId === userId && d.userAgent === userAgent)
  if (existing) {
    existing.lastAccess = new Date().toISOString()
    return
  }
  db.devices.push({
    id: Math.max(0, ...db.devices.map(d => d.id)) + 1,
    userId,
    userAgent,
    registeredAt: new Date().toISOString(),
    lastAccess: new Date().toISOString()
  })
}

app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body
  const loginCheck = validateLoginPayload({ email, password })

  if (!loginCheck.success) {
    return res.status(400).json({ success: false, message: loginCheck.message })
  }

  const db = readDatabase()
  const normalizedEmail = email.trim().toLowerCase()
  const user = db.users.find(u => u.email.toLowerCase() === normalizedEmail)

  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: MESSAGES.credentials })
  }

  if (user.status === 'disabled') {
    return res.status(403).json({ success: false, message: MESSAGES.accountDisabled })
  }

  if (role === 'user' && user.role !== 'user') {
    return res.status(403).json({ success: false, message: 'Esta cuenta es de técnico. Usa el acceso de técnicos.' })
  }

  if (role === 'technician' && user.role !== 'technician') {
    return res.status(403).json({ success: false, message: 'Esta cuenta no es de técnico. Usa el acceso de clientes.' })
  }

  if (role === 'admin' && user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'No tienes permisos de administrador.' })
  }

  registerDevice(db, user.id, req.headers['user-agent'])
  writeDatabase(db)

  const response = { success: true, message: 'Login exitoso', user: stripPassword(user), token: `token_${user.id}_${Date.now()}` }

  if (user.role === 'technician') {
    response.technicianProfile = getTechnicianProfile(db, user.id)
  }

  res.json(response)
})

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, phone, address, avatar } = req.body
  const isOAuth = isOAuthPassword(password)

  let validation
  if (isOAuth) {
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ success: false, message: 'Complete todos los campos obligatorios' })
    }
    validation = { success: true, phone: normalizePhone(phone) || '' }
  } else {
    validation = validateRegisterPayload({ name, email, password, phone, address })
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.message,
        errors: validation.errors || {}
      })
    }
  }

  const db = readDatabase()
  const normalizedEmail = email.trim().toLowerCase()

  if (db.users.find(u => u.email.toLowerCase() === normalizedEmail)) {
    return res.status(409).json({ success: false, message: MESSAGES.emailDuplicate })
  }

  const newUser = {
    id: Math.max(0, ...db.users.map(u => u.id)) + 1,
    name: name.trim(),
    email: normalizedEmail,
    password,
    phone: validation.phone,
    address: isOAuth ? (address?.trim() || 'Bogotá') : address.trim(),
    avatar: avatar || null,
    role: 'user',
    status: 'active',
    createdAt: new Date().toISOString().split('T')[0]
  }

  db.users.push(newUser)
  writeDatabase(db)

  res.status(201).json({
    success: true,
    message: 'Registro exitoso. Ahora puede iniciar sesión con sus credenciales.',
    user: stripPassword(newUser)
  })
})

app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body
  if (!email?.trim()) {
    return res.status(400).json({ success: false, message: MESSAGES.loginEmpty })
  }
  const emailCheck = validateLoginPayload({ email, password: 'x' })
  if (emailCheck.message === MESSAGES.emailInvalid) {
    return res.status(400).json({ success: false, message: MESSAGES.emailInvalid })
  }

  const db = readDatabase()
  const user = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase())
  if (!user) {
    return res.status(404).json({ success: false, message: 'No existe una cuenta asociada a este correo.' })
  }

  if (!db.passwordResets) db.passwordResets = []
  const token = `reset_${user.id}_${Date.now()}`
  db.passwordResets.push({ userId: user.id, token, createdAt: new Date().toISOString() })
  writeDatabase(db)

  res.json({
    success: true,
    message: 'Se envió un enlace de recuperación al correo electrónico registrado.',
    resetToken: token
  })
})

app.patch('/api/auth/profile', (req, res) => {
  const user = getUserFromToken(req.headers.authorization?.replace('Bearer ', ''))
  if (!user) return res.status(401).json({ success: false, message: 'Token inválido' })

  const { phone, address, name, avatar, currentPassword, newPassword } = req.body
  const db = readDatabase()
  const record = db.users.find(u => u.id === user.id)
  if (!record) return res.status(404).json({ success: false, message: 'Usuario no encontrado' })

  const requireAddress = record.role !== 'admin'
  const fieldErrors = validateProfileFields(
    { name, phone, address },
    { requireAddress: address !== undefined && requireAddress }
  )
  if (Object.keys(fieldErrors).length > 0) {
    return res.status(400).json({ success: false, message: Object.values(fieldErrors)[0], errors: fieldErrors })
  }

  if (name?.trim()) record.name = name.trim()
  if (phone !== undefined) record.phone = normalizePhone(phone)
  if (address?.trim()) record.address = address.trim()
  if (avatar !== undefined) record.avatar = avatar || null

  if (newPassword) {
    if (!currentPassword) {
      return res.status(400).json({ success: false, message: 'Ingrese su contraseña actual' })
    }
    if (record.password !== currentPassword) {
      return res.status(400).json({ success: false, message: 'La contraseña actual es incorrecta' })
    }
    const passErr = validatePassword(newPassword)
    if (passErr) return res.status(400).json({ success: false, message: passErr })
    if (isOAuthPassword(record.password)) {
      return res.status(400).json({ success: false, message: 'Las cuentas de Google deben cambiar la contraseña desde Google.' })
    }
    record.password = newPassword
  }

  writeDatabase(db)
  const response = { success: true, user: stripPassword(record) }
  if (record.role === 'technician') {
    response.technicianProfile = getTechnicianProfile(db, record.id)
  }
  res.json(response)
})

app.get('/api/auth/profile', (req, res) => {
  const user = getUserFromToken(req.headers.authorization?.replace('Bearer ', ''))
  if (!user) return res.status(401).json({ success: false, message: 'Token inválido' })

  const db = readDatabase()
  const response = { success: true, user: stripPassword(user) }

  if (user.role === 'technician') {
    response.technicianProfile = getTechnicianProfile(db, user.id)
  }

  res.json(response)
})

app.post('/api/auth/logout', (_req, res) => {
  res.json({ success: true, message: 'Logout exitoso' })
})

// ── SERVICES ──────────────────────────────────────

app.get('/api/services', (_req, res) => {
  const db = readDatabase()
  res.json({ success: true, services: db.services })
})

// ── TECHNICIANS ───────────────────────────────────

app.get('/api/technicians', (_req, res) => {
  const db = readDatabase()
  const list = db.technicians.map(t => {
    const user = db.users.find(u => u.id === t.userId)
    return { ...t, name: user?.name, avatar: user?.avatar, phone: user?.phone }
  })
  res.json({ success: true, technicians: list })
})

app.get('/api/technicians/slots', (req, res) => {
  const { date, serviceId } = req.query
  if (!date || !serviceId) {
    return res.status(400).json({ success: false, message: 'date y serviceId son requeridos' })
  }

  const db = readDatabase()
  const dayKey = getDayKey(date)
  const allSlots = new Set()

  db.technicians
    .filter(t => t.specialties.includes(serviceId))
    .forEach(t => t.schedule[dayKey]?.forEach(s => allSlots.add(s)))

  const available = [...allSlots].filter(time => {
    const hasTech = db.technicians.some(t => {
      if (!t.specialties.includes(serviceId)) return false
      if (!t.schedule[dayKey]?.includes(time)) return false
      const busy = db.appointments.some(a =>
        a.technicianId === t.userId && a.date === date && a.time === time && a.status !== 'cancelled'
      )
      return !busy
    })
    return hasTech
  })

  const order = ['8:00 am', '10:00 am', '12:00 pm', '2:00 pm', '4:00 pm', '6:00 pm']
  available.sort((a, b) => order.indexOf(a) - order.indexOf(b))

  res.json({ success: true, slots: available })
})

app.get('/api/technicians/available', (req, res) => {
  const { date, serviceId } = req.query
  if (!date || !serviceId) {
    return res.status(400).json({ success: false, message: 'date y serviceId son requeridos' })
  }

  const db = readDatabase()
  const dayKey = getDayKey(date)

  const available = db.technicians
    .filter(t => t.specialties.includes(serviceId) && t.schedule[dayKey])
    .map(t => {
      const user = db.users.find(u => u.id === t.userId)
      const availableSlots = t.schedule[dayKey].filter(time => {
        const busy = db.appointments.some(a =>
          a.technicianId === t.userId && a.date === date && a.time === time && a.status !== 'cancelled'
        )
        return !busy
      })
      return {
        id: t.userId,
        name: user?.name,
        avatar: user?.avatar,
        phone: user?.phone,
        rating: t.rating,
        completedJobs: t.completedJobs,
        availableSlots
      }
    })
    .filter(t => t.availableSlots.length > 0)
    .sort((a, b) => b.rating - a.rating)

  res.json({ success: true, technicians: available })
})

app.get('/api/technicians/profile', (req, res) => {
  const user = getUserFromToken(req.headers.authorization?.replace('Bearer ', ''))
  if (!user) return res.status(401).json({ success: false, message: 'Token inválido' })
  if (user.role !== 'technician') return res.status(403).json({ success: false, message: 'Solo técnicos' })

  const db = readDatabase()
  const profile = getTechnicianProfile(db, user.id)
  if (!profile) return res.status(404).json({ success: false, message: 'Perfil no encontrado' })

  res.json({ success: true, profile })
})

app.get('/api/technicians/appointments', (req, res) => {
  const user = getUserFromToken(req.headers.authorization?.replace('Bearer ', ''))
  if (!user) return res.status(401).json({ success: false, message: 'Token inválido' })
  if (user.role !== 'technician') return res.status(403).json({ success: false, message: 'Solo técnicos' })

  const db = readDatabase()
  const appointments = db.appointments
    .filter(a => a.technicianId === user.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(a => enrichAppointment(db, a))

  res.json({ success: true, appointments })
})

app.patch('/api/technicians/appointments/:id', (req, res) => {
  const user = getUserFromToken(req.headers.authorization?.replace('Bearer ', ''))
  if (!user) return res.status(401).json({ success: false, message: 'Token inválido' })
  if (user.role !== 'technician') return res.status(403).json({ success: false, message: 'Solo técnicos' })

  const { status } = req.body
  const validStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled']
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Estado inválido' })
  }

  const db = readDatabase()
  const appt = db.appointments.find(a => a.id === parseInt(req.params.id))
  if (!appt) return res.status(404).json({ success: false, message: 'Cita no encontrada' })
  if (appt.technicianId !== user.id) return res.status(403).json({ success: false, message: 'No tienes acceso a esta cita' })

  appt.status = status

  if (status === 'completed') {
    const profile = db.technicians.find(t => t.userId === user.id)
    if (profile) {
      profile.completedJobs = (profile.completedJobs || 0) + 1
    }
  }

  notifyAppointmentEvent(db, appt, status)
  writeDatabase(db)
  res.json({ success: true, appointment: enrichAppointment(db, appt) })
})

// ── APPOINTMENTS ──────────────────────────────────

app.get('/api/appointments', (req, res) => {
  const user = getUserFromToken(req.headers.authorization?.replace('Bearer ', ''))
  if (!user) return res.status(401).json({ success: false, message: 'Token inválido' })

  const db = readDatabase()
  let list

  if (user.role === 'technician') {
    list = db.appointments.filter(a => a.technicianId === user.id)
  } else {
    list = db.appointments.filter(a => a.userId === user.id)
  }

  list.sort((a, b) => new Date(b.date) - new Date(a.date))
  res.json({ success: true, appointments: list.map(a => enrichAppointment(db, a)) })
})

app.get('/api/appointments/:id', (req, res) => {
  const user = getUserFromToken(req.headers.authorization?.replace('Bearer ', ''))
  if (!user) return res.status(401).json({ success: false, message: 'Token inválido' })

  const db = readDatabase()
  const appt = db.appointments.find(a => a.id === parseInt(req.params.id))
  if (!appt) return res.status(404).json({ success: false, message: 'Cita no encontrada' })

  if (user.role === 'technician' && appt.technicianId !== user.id) {
    return res.status(403).json({ success: false, message: 'No tienes acceso a esta cita' })
  }
  if (user.role === 'user' && appt.userId !== user.id) {
    return res.status(403).json({ success: false, message: 'No tienes acceso a esta cita' })
  }

  res.json({ success: true, appointment: enrichAppointment(db, appt) })
})

app.post('/api/appointments', (req, res) => {
  const user = getUserFromToken(req.headers.authorization?.replace('Bearer ', ''))
  if (!user) return res.status(401).json({ success: false, message: 'Token inválido' })
  if (user.role !== 'user') return res.status(403).json({ success: false, message: 'Solo clientes pueden agendar citas' })

  const { serviceId, date, time, address, notes, technicianId } = req.body
  if (!serviceId || !date || !time) {
    return res.status(400).json({ success: false, message: 'serviceId, date y time son requeridos' })
  }

  const db = readDatabase()
  const service = db.services.find(s => s.id === serviceId)
  if (!service) return res.status(404).json({ success: false, message: 'Servicio no encontrado' })

  let assignedTechId = technicianId
  if (!assignedTechId) {
    const tech = findAvailableTechnician(db, serviceId, date, time)
    if (!tech) {
      return res.status(409).json({ success: false, message: 'No hay técnicos disponibles en ese horario. Prueba otra fecha u hora.' })
    }
    assignedTechId = tech.userId
  }

  const newAppt = {
    id: Math.max(0, ...db.appointments.map(a => a.id)) + 1,
    userId: user.id,
    technicianId: assignedTechId,
    serviceId,
    serviceName: service.name,
    date,
    time,
    address: address || user.address,
    status: 'scheduled',
    notes: notes || '',
    createdAt: new Date().toISOString().split('T')[0]
  }

  db.appointments.push(newAppt)
  notifyAppointmentEvent(db, newAppt, 'created')
  writeDatabase(db)

  res.status(201).json({
    success: true,
    message: 'Cita agendada exitosamente',
    appointment: enrichAppointment(db, newAppt)
  })
})

app.patch('/api/appointments/:id', (req, res) => {
  const user = getUserFromToken(req.headers.authorization?.replace('Bearer ', ''))
  if (!user) return res.status(401).json({ success: false, message: 'Token inválido' })

  const { status, date, time, technicianId } = req.body
  const db = readDatabase()
  const appt = db.appointments.find(a => a.id === parseInt(req.params.id))
  if (!appt) return res.status(404).json({ success: false, message: 'Cita no encontrada' })

  // Validar permisos
  if (user.role === 'technician' && appt.technicianId !== user.id) {
    return res.status(403).json({ success: false, message: 'No tienes acceso a esta cita' })
  }
  if (user.role === 'user' && appt.userId !== user.id) {
    return res.status(403).json({ success: false, message: 'No tienes acceso a esta cita' })
  }

  // Actualizar estado
  if (status) {
    const validStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Estado inválido' })
    }

    if (user.role === 'user') {
      if (status !== 'cancelled') {
        return res.status(403).json({ success: false, message: 'Solo puedes cancelar tu cita' })
      }
      appt.status = status
      notifyAppointmentEvent(db, appt, 'cancelled')
    } else if (user.role === 'technician') {
      appt.status = status
      if (status === 'completed') {
        const profile = db.technicians.find(t => t.userId === user.id)
        if (profile) profile.completedJobs = (profile.completedJobs || 0) + 1
      }
      notifyAppointmentEvent(db, appt, status)
    }
  }

  // Reprogramar (cliente)
  if (date && time && user.role === 'user') {
    appt.date = date
    appt.time = time
    appt.status = 'scheduled'
    notifyAppointmentEvent(db, appt, 'rescheduled')
  }

  // Asignar técnico (cliente o admin)
  if (technicianId && user.role === 'user') {
    appt.technicianId = technicianId
  }

  writeDatabase(db)
  res.json({ success: true, appointment: enrichAppointment(db, appt) })
})

// ── NOTIFICACIONES ────────────────────────────────

app.get('/api/notifications', (req, res) => {
  const user = getUserFromToken(req.headers.authorization?.replace('Bearer ', ''))
  if (!user) return res.status(401).json({ success: false, message: 'Token inválido' })

  const db = readDatabase()
  const list = (db.notifications || [])
    .filter(n => n.userId === user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  res.json({
    success: true,
    notifications: list,
    unreadCount: list.filter(n => !n.read).length
  })
})

app.patch('/api/notifications/read-all', (req, res) => {
  const user = getUserFromToken(req.headers.authorization?.replace('Bearer ', ''))
  if (!user) return res.status(401).json({ success: false, message: 'Token inválido' })

  const db = readDatabase()
  ;(db.notifications || []).forEach(n => {
    if (n.userId === user.id) n.read = true
  })
  writeDatabase(db)
  res.json({ success: true, message: 'Notificaciones marcadas como leídas' })
})

app.patch('/api/notifications/:id', (req, res) => {
  const user = getUserFromToken(req.headers.authorization?.replace('Bearer ', ''))
  if (!user) return res.status(401).json({ success: false, message: 'Token inválido' })

  const db = readDatabase()
  const notif = (db.notifications || []).find(n => n.id === parseInt(req.params.id))
  if (!notif) return res.status(404).json({ success: false, message: 'Notificación no encontrada' })
  if (notif.userId !== user.id) return res.status(403).json({ success: false, message: 'Sin acceso' })

  notif.read = true
  writeDatabase(db)
  res.json({ success: true, notification: notif })
})

// ── ADMIN ─────────────────────────────────────────

function requireAdmin(req, res) {
  const user = getUserFromToken(req.headers.authorization?.replace('Bearer ', ''))
  if (!user) {
    res.status(401).json({ success: false, message: 'Token inválido' })
    return null
  }
  if (user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Acceso solo para administradores' })
    return null
  }
  return user
}

function getMonthKey(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function getWeekDays(baseDate = new Date()) {
  const day = baseDate.getDay()
  const monday = new Date(baseDate)
  monday.setDate(baseDate.getDate() - ((day + 6) % 7))
  const labels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const iso = d.toISOString().split('T')[0]
    return { date: iso, label: labels[d.getDay()], dayNum: d.getDate(), isToday: iso === new Date().toISOString().split('T')[0] }
  })
}

app.get('/api/admin/dashboard', (req, res) => {
  if (!requireAdmin(req, res)) return

  const db = readDatabase()
  const today = new Date().toISOString().split('T')[0]
  const clients = db.users.filter(u => u.role === 'user')
  const technicians = db.users.filter(u => u.role === 'technician')
  const allAppts = db.appointments.map(a => enrichAppointment(db, a))

  const completed = allAppts.filter(a => a.status === 'completed')
  const scheduled = allAppts.filter(a => a.status === 'scheduled')
  const inProgress = allAppts.filter(a => a.status === 'in_progress')
  const cancelled = allAppts.filter(a => a.status === 'cancelled')
  const total = allAppts.length

  const todayAppts = allAppts.filter(a => a.date === today)
  const weekDays = getWeekDays()
  const weekCalendar = weekDays.map(day => ({
    ...day,
    count: allAppts.filter(a => a.date === day.date && a.status !== 'cancelled').length
  }))

  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const monthlyMap = {}
  allAppts.forEach(a => {
    const key = getMonthKey(a.date)
    if (!monthlyMap[key]) monthlyMap[key] = { completed: 0, scheduled: 0, total: 0 }
    monthlyMap[key].total++
    if (a.status === 'completed') monthlyMap[key].completed++
    if (a.status === 'scheduled' || a.status === 'in_progress') monthlyMap[key].scheduled++
  })

  const sortedMonths = Object.keys(monthlyMap).sort().slice(-8)
  const monthlyAppointments = sortedMonths.map(key => {
    const [year, month] = key.split('-')
    return { month: monthNames[parseInt(month, 10) - 1], year, ...monthlyMap[key] }
  })

  const servicePrices = Object.fromEntries(db.services.map(s => [s.id, s.priceFrom]))
  const revenueEstimate = completed.reduce((sum, a) => sum + (servicePrices[a.serviceId] || 0), 0)

  const timeOrder = ['8:00 am', '10:00 am', '12:00 pm', '2:00 pm', '4:00 pm', '6:00 pm']
  const todaySchedule = [...todayAppts]
    .sort((a, b) => timeOrder.indexOf(a.time) - timeOrder.indexOf(b.time))
    .map(a => ({
      id: a.id,
      time: a.time,
      endTime: timeOrder[timeOrder.indexOf(a.time) + 1] || '7:00 pm',
      title: a.serviceName,
      clientName: a.clientName,
      technicianName: a.technicianName,
      status: a.status,
      clientAvatar: a.clientAvatar,
      technicianAvatar: a.technicianAvatar,
      isPrimary: a.status === 'in_progress'
    }))

  const serviceBreakdown = db.services.map(s => ({
    id: s.id,
    name: s.name,
    icon: s.icon,
    count: allAppts.filter(a => a.serviceId === s.id).length
  }))

  res.json({
    success: true,
    stats: {
      totalClients: clients.length,
      totalTechnicians: technicians.length,
      totalAppointments: total,
      completedAppointments: completed.length,
      scheduledAppointments: scheduled.length,
      inProgressAppointments: inProgress.length,
      cancelledAppointments: cancelled.length,
      completionRate: total ? Math.round((completed.length / total) * 100) : 0,
      todayTotal: todayAppts.length,
      todayScheduled: todayAppts.filter(a => a.status === 'scheduled').length,
      todayInProgress: todayAppts.filter(a => a.status === 'in_progress').length,
      todayCompleted: todayAppts.filter(a => a.status === 'completed').length,
      revenueEstimate
    },
    composition: {
      clients: clients.length,
      technicians: technicians.length,
      total: clients.length + technicians.length
    },
    monthlyAppointments,
    weekCalendar,
    todaySchedule,
    recentAppointments: [...allAppts].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8),
    allAppointments: [...allAppts].sort((a, b) => new Date(b.date) - new Date(a.date)),
    serviceBreakdown,
    users: db.users.filter(u => u.role !== 'admin').map(u => stripPassword(u))
  })
})

app.get('/api/admin/users', (req, res) => {
  if (!requireAdmin(req, res)) return
  const db = readDatabase()
  const users = db.users.map(u => {
      const profile = u.role === 'technician' ? getTechnicianProfile(db, u.id) : null
      const apptCount = db.appointments.filter(a =>
        a.userId === u.id || a.technicianId === u.id
      ).length
      return { ...stripPassword(u), technicianProfile: profile, appointmentCount: apptCount }
    })
  res.json({ success: true, users })
})

app.patch('/api/admin/users/:id', (req, res) => {
  const adminUser = requireAdmin(req, res)
  if (!adminUser) return

  const { status, name, phone, address, avatar, zones, specialties } = req.body

  const db = readDatabase()
  const record = db.users.find(u => u.id === parseInt(req.params.id))
  if (!record) return res.status(404).json({ success: false, message: 'Usuario no encontrado' })
  if (record.role === 'admin' && record.id !== adminUser.id) {
    return res.status(403).json({ success: false, message: 'No se puede modificar otra cuenta de administrador' })
  }

  const hasProfileFields = name !== undefined || phone !== undefined || address !== undefined
  if (hasProfileFields) {
    const fieldErrors = validateProfileFields({ name, phone, address }, { requireAddress: record.role === 'user' })
    if (Object.keys(fieldErrors).length > 0) {
      return res.status(400).json({ success: false, message: Object.values(fieldErrors)[0], errors: fieldErrors })
    }
    if (name?.trim()) record.name = name.trim()
    if (phone !== undefined) record.phone = normalizePhone(phone)
    if (address !== undefined) record.address = address.trim()
  }

  if (avatar !== undefined) record.avatar = avatar || null

  if (status !== undefined && record.role !== 'admin') {
    if (!['active', 'disabled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Estado inválido. Use active o disabled.' })
    }
    record.status = status
  }

  if (record.role === 'technician' && (zones !== undefined || specialties !== undefined)) {
    const tech = db.technicians.find(t => t.userId === record.id)
    if (tech) {
      if (zones !== undefined) {
        tech.zones = Array.isArray(zones)
          ? zones.filter(Boolean)
          : zones.split(',').map(z => z.trim()).filter(Boolean)
      }
      if (specialties !== undefined) {
        const validIds = db.services.map(s => s.id)
        tech.specialties = Array.isArray(specialties)
          ? specialties.filter(id => validIds.includes(id))
          : []
      }
    }
  }

  writeDatabase(db)
  const profile = record.role === 'technician' ? getTechnicianProfile(db, record.id) : null
  res.json({ success: true, user: { ...stripPassword(record), technicianProfile: profile } })
})

const DEFAULT_TECH_SCHEDULE = {
  mon: ['8:00 am', '10:00 am', '12:00 pm', '2:00 pm', '4:00 pm'],
  tue: ['8:00 am', '10:00 am', '12:00 pm', '2:00 pm', '4:00 pm'],
  wed: ['8:00 am', '10:00 am', '12:00 pm', '2:00 pm', '4:00 pm'],
  thu: ['10:00 am', '12:00 pm', '2:00 pm', '4:00 pm'],
  fri: ['8:00 am', '10:00 am', '12:00 pm', '2:00 pm'],
  sat: ['8:00 am', '10:00 am'],
  sun: []
}

app.post('/api/admin/users', (req, res) => {
  if (!requireAdmin(req, res)) return

  const { name, email, password, phone, address, role, avatar, zones, specialties, schedule } = req.body

  if (!['user', 'technician', 'admin'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Rol inválido' })
  }

  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ success: false, message: 'Nombre, email y contraseña son requeridos' })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ success: false, message: MESSAGES.emailInvalid })
  }
  const passErr = validatePassword(password)
  if (passErr) return res.status(400).json({ success: false, message: passErr })

  if (!NAME_REGEX.test(name.trim())) {
    return res.status(400).json({ success: false, message: MESSAGES.nameInvalid })
  }

  if (role !== 'admin') {
    const fieldErrors = validateProfileFields({ name, phone, address }, { requireAddress: true })
    if (Object.keys(fieldErrors).length > 0) {
      return res.status(400).json({ success: false, message: Object.values(fieldErrors)[0], errors: fieldErrors })
    }
  }

  const db = readDatabase()
  const normalizedEmail = email.trim().toLowerCase()
  if (db.users.find(u => u.email.toLowerCase() === normalizedEmail)) {
    return res.status(409).json({ success: false, message: MESSAGES.emailDuplicate })
  }

  const newUser = {
    id: Math.max(0, ...db.users.map(u => u.id)) + 1,
    name: name.trim(),
    email: normalizedEmail,
    password,
    phone: normalizePhone(phone) || '',
    address: (address || 'Oficina central, Bogotá').trim(),
    avatar: avatar || null,
    role,
    status: 'active',
    createdAt: new Date().toISOString().split('T')[0]
  }

  db.users.push(newUser)

  if (role === 'technician') {
    const validIds = db.services.map(s => s.id)
    const specList = Array.isArray(specialties)
      ? specialties.filter(id => validIds.includes(id))
      : []
    if (specList.length === 0) {
      return res.status(400).json({ success: false, message: 'El técnico debe tener al menos una especialidad' })
    }
    const zoneList = Array.isArray(zones)
      ? zones.filter(Boolean)
      : (zones || '').split(',').map(z => z.trim()).filter(Boolean)

    db.technicians.push({
      id: Math.max(0, ...db.technicians.map(t => t.id)) + 1,
      userId: newUser.id,
      specialties: specList,
      zones: zoneList.length ? zoneList : ['Bogotá'],
      rating: 4.5,
      completedJobs: 0,
      schedule: schedule || DEFAULT_TECH_SCHEDULE
    })
  }

  writeDatabase(db)
  const profile = role === 'technician' ? getTechnicianProfile(db, newUser.id) : null
  res.status(201).json({
    success: true,
    message: 'Cuenta creada exitosamente',
    user: { ...stripPassword(newUser), technicianProfile: profile, appointmentCount: 0 }
  })
})

app.patch('/api/admin/appointments/:id', (req, res) => {
  if (!requireAdmin(req, res)) return

  const { status } = req.body
  const validStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled']
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Estado inválido' })
  }

  const db = readDatabase()
  const appt = db.appointments.find(a => a.id === parseInt(req.params.id))
  if (!appt) return res.status(404).json({ success: false, message: 'Cita no encontrada' })

  appt.status = status
  writeDatabase(db)

  if (status === 'completed') {
    const profile = db.technicians.find(t => t.userId === appt.technicianId)
    if (profile) {
      profile.completedJobs = (profile.completedJobs || 0) + 1
      writeDatabase(db)
    }
  }

  res.json({ success: true, appointment: enrichAppointment(db, appt) })
})

// ── HEALTH ────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ status: 'Backend de PlomApp funcionando correctamente' })
})

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' })
})

app.listen(PORT, () => {
  console.log(`🚀 Backend de PlomApp en http://localhost:${PORT}`)
  console.log(`\nClientes: andres@example.com / 123456`)
  console.log(`Técnicos: tecnico@example.com / 123456`)
  console.log(`          carlos.tecnico@example.com / 123456`)
  console.log(`          luis.tecnico@example.com / 123456`)
  console.log(`Admin:    admin@plomapp.com / Admin789*`)
  console.log(`CP06:     cliente@mail.com / Cl@ve123*`)
  console.log(`CP07:     tecnico@mail.com / T3cnic0_2026`)
})
