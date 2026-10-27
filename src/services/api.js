const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function parseJwtPayload(token) {
  if (typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(atob(base64).split('').map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`).join(''))
    return JSON.parse(json)
  } catch {
    return null
  }
}

function isValidAuthToken(token) {
  const payload = parseJwtPayload(token)
  if (!payload) return false
  if (typeof payload.sub !== 'string' && typeof payload.sub !== 'number') return false
  if (payload.exp && Date.now() >= payload.exp * 1000) return false
  return true
}

export async function apiFetch(path, options = {}) {
  let token = localStorage.getItem('authToken')
  const headers = { 'Content-Type': 'application/json', ...options.headers }

  if (token && !isValidAuthToken(token)) {
    localStorage.removeItem('authToken')
    token = null
  }

  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_URL}${path}`, { ...options, headers })
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    if (response.status === 401 || response.status === 422) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      localStorage.removeItem('userRole')
    }
    throw new Error(data.message || data.error || 'Error en la solicitud')
  }

  return data
}

/**
 * Normaliza un técnico para que siempre tenga rating, completedJobs, avatar, profile, etc.
 */
export function normalizeTechnician(tech) {
  if (!tech) return tech
  const profile = tech.profile || tech.technician_profile || tech.technicianProfile || {}
  return {
    ...tech,
    profile,
    rating: profile.rating ?? tech.rating ?? 5.0,
    completedJobs: profile.completed_jobs ?? profile.completedJobs ?? tech.completedJobs ?? 0,
    specialties: profile.specialties ?? tech.specialties ?? [],
    schedule: profile.schedule ?? tech.schedule ?? {},
    zones: profile.zones ?? tech.zones ?? ['Bogotá'],
  }
}

/**
 * Normaliza una cita desde el formato enriquecido de Flask para que funcione
 * tanto con campos planos (serviceName, clientName...) como anidados (service.name, customer...).
 */
export function normalizeAppointment(a) {
  if (!a) return a

  const service = a.service || null
  const customer = a.customer || null
  const technician = a.technician ? normalizeTechnician(a.technician) : null

  let dateFormatted = a.dateFormatted || null
  if (!dateFormatted && a.date) {
    try {
      const parts = String(a.date).split('T')[0].split('-')
      if (parts.length === 3) {
        dateFormatted = `${parts[2]}/${parts[1]}/${parts[0]}`
      }
    } catch {
      dateFormatted = a.date
    }
  }

  const rawPrice = a.price || a.base_price || service?.base_price || 0

  return {
    ...a,
    service,
    customer,
    technician,
    serviceName: a.serviceName || a.service_name || service?.name || 'Servicio',
    serviceId: a.serviceId || a.service_id || service?.id || null,
    clientName: a.clientName || customer?.name || 'Cliente',
    clientAvatar: a.clientAvatar || customer?.avatar || null,
    clientPhone: a.clientPhone || customer?.phone || null,
    technicianName: a.technicianName || a.technician_name || technician?.name || 'Por asignar',
    technicianId: a.technicianId || a.technician_id || technician?.id || null,
    technicianAvatar: a.technicianAvatar || technician?.avatar || null,
    dateFormatted,
    price: typeof rawPrice === 'number' ? rawPrice : parseFloat(rawPrice) || 0,
    address: a.address || customer?.address || a.notes || '',
  }
}

/**
 * Normaliza los slots devueltos por el backend
 */
export function normalizeSlots(slots) {
  if (!Array.isArray(slots)) return []
  return slots.map(slot => {
    if (typeof slot === 'string') {
      return { time: slot, start: slot, available: true }
    }
    return {
      ...slot,
      time: slot.time || slot.start,
      available: slot.available !== false,
    }
  })
}

export const authApi = {
  login: async (email, password, role) => {
    const backendRole = role === 'user' ? 'customer' : role
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role: backendRole })
    })
    if (data.user && data.user.role === 'customer') {
      data.user.role = 'customer'
    }
    return data
  },

  register: (payload) => {
    const cleanPayload = {
      ...payload,
      role: payload.role === 'user' ? 'customer' : (payload.role || 'customer')
    }
    return apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(cleanPayload) })
  },

  forgotPassword: (email) =>
    apiFetch('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  getProfile: () => apiFetch('/api/auth/profile'),

  updateProfile: (payload) =>
    apiFetch('/api/auth/profile', { method: 'PATCH', body: JSON.stringify(payload) }),
}

export const servicesApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams()
    if (params.search) query.append('search', params.search)
    if (params.category) query.append('category', params.category)
    if (params.limit) query.append('limit', params.limit)
    if (params.offset) query.append('offset', params.offset)
    const qs = query.toString() ? `?${query.toString()}` : ''
    return apiFetch(`/api/services${qs}`)
  },

  getCategories: () => apiFetch('/api/services/categories'),

  getById: (id) => apiFetch(`/api/services/${id}`),

  searchHybrid: (query, category = null, topK = 5) =>
    apiFetch('/api/search/hybrid', {
      method: 'POST',
      body: JSON.stringify({ query, category, top_k: topK })
    }),
}

export const appointmentsApi = {
  getAll: () =>
    apiFetch('/api/appointments').then(data => ({
      ...data,
      appointments: (data.appointments || []).map(normalizeAppointment)
    })),

  getById: (id) =>
    apiFetch(`/api/appointments/${id}`).then(data => normalizeAppointment(data.appointment || data)),

  create: (payload) => {
    const cleanPayload = {
      service_id: payload.service_id || payload.serviceId,
      date: payload.date,
      time: payload.time,
      address: payload.address,
      address_reference: payload.address_reference || payload.addressReference,
      user_address_id: payload.user_address_id || payload.userAddressId,
      technician_id: payload.technician_id || payload.technicianId || null,
      notes: payload.notes || ''
    }
    return apiFetch('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(cleanPayload)
    }).then(data => ({
      ...data,
      appointment: normalizeAppointment(data.appointment || data)
    }))
  },

  updateStatus: (id, status) =>
    apiFetch(`/api/appointments/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }).then(data => {
      const apt = data.appointment || data
      return { appointment: normalizeAppointment(apt) }
    }),

  cancel: (id) =>
    apiFetch(`/api/appointments/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'cancelled' }) }).then(data => {
      const apt = data.appointment || data
      return { appointment: normalizeAppointment(apt) }
    }),

  reschedule: (id, date, time) =>
    apiFetch(`/api/appointments/${id}`, { method: 'PATCH', body: JSON.stringify({ date, time, status: 'scheduled' }) }).then(data => {
      const apt = data.appointment || data
      return { appointment: normalizeAppointment(apt) }
    }),

  assignTechnician: (id, technicianId) =>
    apiFetch(`/api/appointments/${id}`, { method: 'PATCH', body: JSON.stringify({ technicianId }) }),

  getTechnicianOptions: (date, serviceId) =>
    apiFetch(`/api/technicians/available?date=${date}&serviceId=${serviceId}`).then(data => ({
      ...data,
      technicians: (data.technicians || []).map(normalizeTechnician)
    })),
}

export const techniciansApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams()
    if (params.limit) query.append('limit', params.limit)
    if (params.offset) query.append('offset', params.offset)
    const qs = query.toString() ? `?${query.toString()}` : ''
    return apiFetch(`/api/technicians${qs}`).then(data => ({
      ...data,
      technicians: (data.technicians || []).map(normalizeTechnician)
    }))
  },

  getSlots: (date, serviceId, technicianId = null) => {
    const query = new URLSearchParams({ date, serviceId })
    if (technicianId) query.append('technicianId', technicianId)
    return apiFetch(`/api/technicians/slots?${query.toString()}`).then(data => ({
      ...data,
      slots: normalizeSlots(data.slots || [])
    }))
  },

  getMyAppointments: () =>
    apiFetch('/api/technicians/appointments').then(data => ({
      ...data,
      appointments: (data.appointments || []).map(normalizeAppointment)
    })),

  getProfile: () =>
    apiFetch('/api/technicians/profile').then(normalizeTechnician),

  updateAppointmentStatus: (id, status) =>
    apiFetch(`/api/technicians/appointments/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }).then(data => {
      const apt = data.appointment || data
      return { appointment: normalizeAppointment(apt) }
    }),
}

export const adminApi = {
  getDashboard: () =>
    apiFetch('/api/admin/dashboard').then(data => ({
      ...data,
      recentAppointments: (data.recentAppointments || []).map(normalizeAppointment),
      allAppointments: (data.allAppointments || []).map(normalizeAppointment),
      todaySchedule: (data.todaySchedule || []).map(normalizeAppointment),
    })),

  getUsers: (params = {}) => {
    const query = new URLSearchParams()
    query.append('limit', params.limit || '100')
    if (params.role) query.append('role', params.role === 'user' ? 'customer' : params.role)
    if (params.status) query.append('status', params.status)
    if (params.search) query.append('search', params.search)
    return apiFetch(`/api/admin/users?${query.toString()}`)
  },

  createUser: (payload) => {
    const cleanPayload = {
      ...payload,
      role: payload.role === 'user' ? 'customer' : payload.role
    }
    return apiFetch('/api/admin/users', { method: 'POST', body: JSON.stringify(cleanPayload) })
  },

  updateUser: (id, payload) => {
    const cleanPayload = { ...payload }
    if (cleanPayload.role === 'user') cleanPayload.role = 'customer'
    return apiFetch(`/api/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(cleanPayload) })
  },

  updateAppointmentStatus: (id, status) =>
    apiFetch(`/api/admin/appointments/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }).then(data => {
      const apt = data.appointment || data
      return { appointment: normalizeAppointment(apt) }
    }),

  updateAppointment: (id, payload) =>
    apiFetch(`/api/admin/appointments/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }).then(data => {
      const apt = data.appointment || data
      return { appointment: normalizeAppointment(apt) }
    }),
}

export const addressesApi = {
  getAll: () => apiFetch('/api/user/addresses'),
  create: (payload) => apiFetch('/api/user/addresses', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => apiFetch(`/api/user/addresses/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  delete: (id) => apiFetch(`/api/user/addresses/${id}`, { method: 'DELETE' }),
}

export const favoritesApi = {
  getAll: () => apiFetch('/api/user/favorites'),
  toggle: (serviceId) => apiFetch(`/api/user/favorites/${serviceId}`, { method: 'POST' }),
  remove: (serviceId) => apiFetch(`/api/user/favorites/${serviceId}`, { method: 'DELETE' }),
}

export const recommendationsApi = {
  getRecommendations: (limit = 5) => apiFetch(`/api/recommendations/?limit=${limit}`),
  trackClick: (recId) => apiFetch(`/api/recommendations/${recId}/click`, { method: 'POST' }),
  trackConversion: (recId) => apiFetch(`/api/recommendations/${recId}/convert`, { method: 'POST' }),
}

export function formatPrice(amount) {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0
  return `Desde $${num.toLocaleString('es-CO')}`
}

export function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase()
}
