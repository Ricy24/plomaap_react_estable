const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('authToken')
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_URL}${path}`, { ...options, headers })
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Error en la solicitud')
  }

  return data
}

export const authApi = {
  login: (email, password, role) =>
    apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password, role }) }),

  register: (payload) =>
    apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),

  forgotPassword: (email) =>
    apiFetch('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  updateProfile: (payload) =>
    apiFetch('/api/auth/profile', { method: 'PATCH', body: JSON.stringify(payload) }),
}

export const servicesApi = {
  getAll: () => apiFetch('/api/services'),
}

export const appointmentsApi = {
  getAll: () => apiFetch('/api/appointments'),
  getById: (id) => apiFetch(`/api/appointments/${id}`),
  create: (payload) =>
    apiFetch('/api/appointments', { method: 'POST', body: JSON.stringify(payload) }),
  updateStatus: (id, status) =>
    apiFetch(`/api/appointments/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  cancel: (id) =>
    apiFetch(`/api/appointments/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'cancelled' }) }),
  reschedule: (id, date, time) =>
    apiFetch(`/api/appointments/${id}`, { method: 'PATCH', body: JSON.stringify({ date, time, status: 'scheduled' }) }),
  assignTechnician: (id, technicianId) =>
    apiFetch(`/api/appointments/${id}`, { method: 'PATCH', body: JSON.stringify({ technicianId }) }),
  getTechnicianOptions: (date, serviceId) =>
    apiFetch(`/api/technicians/available?date=${date}&serviceId=${serviceId}`),
}

export const techniciansApi = {
  getSlots: (date, serviceId) =>
    apiFetch(`/api/technicians/slots?date=${date}&serviceId=${serviceId}`),
  getMyAppointments: () =>
    apiFetch('/api/technicians/appointments'),
  getProfile: () =>
    apiFetch('/api/technicians/profile'),
  updateAppointmentStatus: (id, status) =>
    apiFetch(`/api/technicians/appointments/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
}

export const adminApi = {
  getDashboard: () => apiFetch('/api/admin/dashboard'),
  getUsers: () => apiFetch('/api/admin/users'),
  updateAppointmentStatus: (id, status) =>
    apiFetch(`/api/admin/appointments/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  updateUser: (id, payload) =>
    apiFetch(`/api/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),

  createUser: (payload) =>
    apiFetch('/api/admin/users', { method: 'POST', body: JSON.stringify(payload) }),
}

export function formatPrice(amount) {
  return `Desde $${amount.toLocaleString('es-CO')}`
}

export function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}
