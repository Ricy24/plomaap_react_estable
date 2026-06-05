import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

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
  const service = db.services.find(s => s.id === appt.serviceId)
  return {
    ...appt,
    clientName: client?.name || 'Cliente',
    clientPhone: client?.phone || '',
    clientAvatar: client?.avatar || null,
    technicianName: techUser?.name || 'Por asignar',
    technicianAvatar: techUser?.avatar || null,
    technicianPhone: techUser?.phone || '',
    serviceIcon: service?.icon || 'fa-wrench',
    serviceColor: service?.color || 'pipe',
    dateFormatted: new Date(appt.date + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
  }
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

app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email y contraseña son requeridos' })
  }

  const db = readDatabase()
  const user = db.users.find(u => u.email === email && u.password === password)

  if (!user) {
    return res.status(401).json({ success: false, message: 'Email o contraseña incorrectos' })
  }

  if (role === 'user' && user.role !== 'user') {
    return res.status(403).json({ success: false, message: 'Esta cuenta es de técnico. Usa el acceso de técnicos.' })
  }

  if (role === 'technician' && user.role !== 'technician') {
    return res.status(403).json({ success: false, message: 'Esta cuenta no es de técnico. Usa el acceso de clientes.' })
  }

  const response = { success: true, message: 'Login exitoso', user: stripPassword(user), token: `token_${user.id}_${Date.now()}` }

  if (user.role === 'technician') {
    response.technicianProfile = getTechnicianProfile(db, user.id)
  }

  res.json(response)
})

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, phone, address, avatar } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Nombre, email y contraseña son requeridos' })
  }

  const db = readDatabase()

  if (db.users.find(u => u.email === email)) {
    return res.status(409).json({ success: false, message: 'El email ya está registrado' })
  }

  const newUser = {
    id: Math.max(0, ...db.users.map(u => u.id)) + 1,
    name, email, password,
    phone: phone || '',
    address: address || '',
    avatar: avatar || null,
    role: 'user',
    createdAt: new Date().toISOString().split('T')[0]
  }

  db.users.push(newUser)
  writeDatabase(db)

  res.status(201).json({
    success: true,
    message: 'Registro exitoso',
    user: stripPassword(newUser),
    token: `token_${newUser.id}_${Date.now()}`
  })
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

app.post('/api/appointments', (req, res) => {
  const user = getUserFromToken(req.headers.authorization?.replace('Bearer ', ''))
  if (!user) return res.status(401).json({ success: false, message: 'Token inválido' })
  if (user.role !== 'user') return res.status(403).json({ success: false, message: 'Solo clientes pueden agendar citas' })

  const { serviceId, date, time, address, notes } = req.body
  if (!serviceId || !date || !time) {
    return res.status(400).json({ success: false, message: 'serviceId, date y time son requeridos' })
  }

  const db = readDatabase()
  const service = db.services.find(s => s.id === serviceId)
  if (!service) return res.status(404).json({ success: false, message: 'Servicio no encontrado' })

  const tech = findAvailableTechnician(db, serviceId, date, time)
  if (!tech) {
    return res.status(409).json({ success: false, message: 'No hay técnicos disponibles en ese horario. Prueba otra fecha u hora.' })
  }

  const newAppt = {
    id: Math.max(0, ...db.appointments.map(a => a.id)) + 1,
    userId: user.id,
    technicianId: tech.userId,
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
  if (user.role !== 'technician') return res.status(403).json({ success: false, message: 'Solo técnicos pueden actualizar citas' })

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
  writeDatabase(db)

  if (status === 'completed') {
    const profile = db.technicians.find(t => t.userId === user.id)
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
})
