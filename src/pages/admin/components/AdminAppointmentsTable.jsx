import { useState } from 'react'
import { getInitials } from '../../../services/api'

const STATUS_LABELS = {
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
          <i className="fa-solid fa-magnifying-glass" />
          <input
            type="text"
            placeholder="Buscar cita..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Servicio</th>
              <th>Técnico</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
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
                  {appt.status === 'scheduled' && (
                    <button
                      className="adm-action-btn"
                      disabled={updating === appt.id}
                      onClick={() => onStatusChange(appt.id, 'in_progress')}
                    >
                      {updating === appt.id ? '...' : 'Iniciar'}
                    </button>
                  )}
                  {appt.status === 'in_progress' && (
                    <button
                      className="adm-action-btn complete"
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
