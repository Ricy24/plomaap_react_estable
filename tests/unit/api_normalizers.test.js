import { describe, expect, it } from 'vitest'
import {
  normalizeAppointment,
  normalizeSlots,
  normalizeTechnician,
} from '../../src/services/api'

describe('normalización de respuestas del API', () => {
  it('normaliza un técnico con perfil anidado', () => {
    const technician = normalizeTechnician({
      id: 7,
      name: 'Ana',
      profile: {
        rating: 4.8,
        completed_jobs: 32,
        specialties: ['fugas'],
        schedule: { mon: [8, 17] },
        zones: ['Chapinero'],
      },
    })

    expect(technician.rating).toBe(4.8)
    expect(technician.completedJobs).toBe(32)
    expect(technician.specialties).toEqual(['fugas'])
    expect(technician.schedule).toEqual({ mon: [8, 17] })
    expect(technician.zones).toEqual(['Chapinero'])
  })

  it('normaliza una cita con servicio, cliente y técnico anidados', () => {
    const appointment = normalizeAppointment({
      id: 10,
      date: '2026-11-05T10:00:00',
      price: '120000',
      service: { id: 3, name: 'Destape', base_price: 90000 },
      customer: { name: 'Juan', phone: '3001234567', address: 'Calle 1' },
      technician: { id: 7, name: 'Ana', profile: { rating: 4.9 } },
    })

    expect(appointment.serviceName).toBe('Destape')
    expect(appointment.serviceId).toBe(3)
    expect(appointment.clientName).toBe('Juan')
    expect(appointment.technicianName).toBe('Ana')
    expect(appointment.technician.rating).toBe(4.9)
    expect(appointment.dateFormatted).toBe('05/11/2026')
    expect(appointment.price).toBe(120000)
    expect(appointment.address).toBe('Calle 1')
  })

  it('mantiene campos planos y usa valores por defecto', () => {
    const appointment = normalizeAppointment({
      id: 11,
      service_name: 'Revisión',
      clientName: 'Cliente directo',
    })

    expect(appointment.serviceName).toBe('Revisión')
    expect(appointment.clientName).toBe('Cliente directo')
    expect(appointment.technicianName).toBe('Por asignar')
    expect(appointment.price).toBe(0)
    expect(normalizeAppointment(null)).toBeNull()
  })

  it('normaliza slots en texto y en objeto', () => {
    expect(normalizeSlots(['08:00', '09:00'])).toEqual([
      { time: '08:00', start: '08:00', available: true },
      { time: '09:00', start: '09:00', available: true },
    ])

    expect(normalizeSlots([{ start: '10:00', available: false }])).toEqual([
      { start: '10:00', time: '10:00', available: false },
    ])
    expect(normalizeSlots(null)).toEqual([])
  })
})
