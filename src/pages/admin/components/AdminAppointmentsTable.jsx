import { useState } from 'react'
import { getInitials } from '../../../services/api'

const STATUS_LABELS = {
  pending: 'Pendiente',
  scheduled: 'Programada',
  in_progress: 'En curso',
  completed: 'Completada',
  cancelled: 'Cancelada'
}

function AdminAppointmentsTable({ appointments, onStatusChange, updating }) {
  const [search, setSearch] = useState('')

  const filtered = appointments?.filter(a =>
    a.clientName?.toLowerCase().includes(search.toLowerCase()) ||
    a.technicianName?.toLowerCase().includes(search.toLowerCase()) ||
    a.serviceName?.toLowerCase().includes(search.toLowerCase())
  ) || []

  return (
    <div className="adm-card adm-table-card">
      <div className="adm-card-header">
        <h3>Citas recientes</h3>
        <div className="adm-search">
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
          <input
            type="search"
            placeholder="Buscar cita..."
            aria-label="Buscar cita por cliente, técnico o servicio"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th scope="col">Cliente</th>
              <th scope="col">Servicio</th>
              <th scope="col">Técnico</th>
              <th scope="col">Fecha</th>
              <th scope="col">Estado</th>
              <th scope="col">Acción</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <p className="adm-empty">
                    {search ? 'No encontramos citas con ese criterio.' : 'Sin citas registradas.'}
                  </p>
                </td>
              </tr>
            )}
            {filtered.map(appt => (
              <tr key={appt.id}>
                <td>
                  <div className="adm-table-user">
                    <div className="adm-table-avatar">
                      {appt.clientAvatar
                        ? <img src={appt.clientAvatar} alt="" />
                        : <span>{getInitials(appt.clientName)}</span>
                      }
                    </div>
                    <span>{appt.clientName}</span>
                  </div>
                </td>
                <td>{appt.serviceName}</td>
                <td>{appt.technicianName}</td>
                <td>{appt.dateFormatted || appt.date}</td>
                <td>
                  <span className={`adm-status-pill ${appt.status}`}>
                    {STATUS_LABELS[appt.status]}
                  </span>
                </td>
                <td>
                  {appt.status === 'pending' && (
                    <button
                      className="adm-action-btn"
                      type="button"
                      disabled={updating === appt.id}
                      onClick={() => onStatusChange(appt.id, 'scheduled')}
                    >
                      {updating === appt.id ? '...' : 'Programar'}
                    </button>
                  )}
                  {appt.status === 'scheduled' && (
                    <button
                      className="adm-action-btn"
                      type="button"
                      disabled={updating === appt.id}
                      onClick={() => onStatusChange(appt.id, 'in_progress')}
                    >
                      {updating === appt.id ? '...' : 'Iniciar'}
                    </button>
                  )}
                  {appt.status === 'in_progress' && (
                    <button
                      className="adm-action-btn complete"
                      type="button"
                      disabled={updating === appt.id}
                      onClick={() => onStatusChange(appt.id, 'completed')}
                    >
                      {updating === appt.id ? '...' : 'Completar'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminAppointmentsTable
