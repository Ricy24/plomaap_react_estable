import { useState } from 'react'
import AddressMap from './AddressMap'
import '../styles/address-map.css'

function AppointmentMapModal({ appointment, onClose }) {
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <button 
        className="btn-map-view"
        title="Ver ubicación en mapa"
        onClick={() => setIsOpen(true)}
      >
        <i className="fa-solid fa-map"></i>
      </button>
    )
  }

  return (
    <div className="modal-overlay" onClick={() => { setIsOpen(false); onClose?.() }}>
      <div className="modal-map-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📍 Ubicación de la cita</h2>
          <button className="modal-close" onClick={() => { setIsOpen(false); onClose?.() }}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="appointment-info">
            <p><strong>Servicio:</strong> {appointment.serviceName}</p>
            <p><strong>Cliente:</strong> {appointment.clientName}</p>
            <p><strong>Fecha:</strong> {appointment.dateFormatted}</p>
            <p><strong>Hora:</strong> {appointment.time}</p>
          </div>

          <AddressMap address={appointment.address} />
        </div>
      </div>
    </div>
  )
}

export default AppointmentMapModal
