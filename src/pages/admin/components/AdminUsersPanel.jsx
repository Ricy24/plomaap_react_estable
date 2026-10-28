import { useState } from 'react'
import { adminApi, getInitials } from '../../../services/api'
import AdminUserEditModal from './AdminUserEditModal'
import AdminCreateUserModal from './AdminCreateUserModal'
import { useFeedback } from '../../../components/ui/feedbackContext'

const ROLE_LABELS = { customer: 'Cliente', user: 'Cliente', technician: 'Técnico', admin: 'Administrador' }
const STATUS_LABELS = { active: 'Activo', disabled: 'Inhabilitado' }

function AdminUsersPanel({ users, services, currentUserId, onUserUpdated, onUserCreated }) {
  const { toast, confirm } = useFeedback()
  const [editingUser, setEditingUser] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)

  const canEdit = (u) => u.role !== 'admin' || u.id === currentUserId
  const canToggle = (u) => u.role !== 'admin'

  const handleSaveUser = async (payload) => {
    setSaving(true)
    try {
      const data = await adminApi.updateUser(editingUser.id, payload)
      onUserUpdated?.(data?.user || data)
      setEditingUser(null)
      toast.success('Usuario actualizado correctamente.')
    } catch (err) {
      toast.error(err.message, { title: 'No se pudo actualizar' })
      throw err
    } finally {
      setSaving(false)
    }
  }

  const handleQuickToggle = async (user) => {
    const newStatus = user.status === 'disabled' ? 'active' : 'disabled'
    if (newStatus === 'disabled') {
      const accepted = await confirm({
        title: `Inhabilitar a ${user.name}`,
        description: 'La cuenta no podrá iniciar sesión hasta que vuelvas a activarla.',
        confirmLabel: 'Inhabilitar',
        cancelLabel: 'Cancelar',
        tone: 'danger',
      })
      if (!accepted) return
    }

    try {
      const data = await adminApi.updateUser(user.id, { status: newStatus })
      onUserUpdated?.(data?.user || data)
      toast.success(
        newStatus === 'active' ? 'Cuenta activada.' : 'Cuenta inhabilitada.'
      )
    } catch (err) {
      toast.error(err.message, { title: 'No se pudo cambiar el estado' })
    }
  }

  return (
    <>
      {showCreate && (
        <AdminCreateUserModal
          services={services}
          onClose={() => setShowCreate(false)}
          onCreated={(user) => {
            onUserCreated?.(user)
            setShowCreate(false)
          }}
        />
      )}

      {editingUser && (
        <AdminUserEditModal
          user={editingUser}
          services={services}
          onClose={() => setEditingUser(null)}
          onSave={handleSaveUser}
          saving={saving}
        />
      )}

      <div className="adm-card adm-table-card">
        <div className="adm-card-header">
          <h3>Usuarios del sistema</h3>
          <div className="adm-header-actions-row">
            <span className="adm-card-badge">{users?.length || 0} cuentas</span>
            <button className="adm-action-btn complete" onClick={() => setShowCreate(true)}>
              <i className="fa-solid fa-user-plus" /> Crear cuenta
            </button>
          </div>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">Email</th>
                <th scope="col">Rol</th>
                <th scope="col">Estado</th>
                <th scope="col">Teléfono</th>
                <th scope="col">Citas</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users?.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="adm-table-user">
                      <div className="adm-table-avatar">
                        {u.avatar
                          ? <img src={u.avatar} alt="" />
                          : <span>{getInitials(u.name)}</span>
                        }
                      </div>
                      <span>{u.name}</span>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`adm-status-pill ${
                      u.role === 'admin' ? 'cancelled' : u.role === 'technician' ? 'in_progress' : 'scheduled'
                    }`}>
                      {ROLE_LABELS[u.role] || u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`adm-status-pill ${u.status === 'disabled' ? 'cancelled' : 'completed'}`}>
                      {STATUS_LABELS[u.status || 'active']}
                    </span>
                  </td>
                  <td>{u.phone || '—'}</td>
                  <td>{u.appointmentCount ?? '—'}</td>
                  <td>
                    <div className="adm-row-actions">
                      {canEdit(u) && (
                        <button
                          className="adm-action-btn"
                          type="button"
                          onClick={() => setEditingUser(u)}
                          aria-label={`Editar a ${u.name}`}
                        >
                          Editar
                        </button>
                      )}
                      {canToggle(u) && (
                        <button
                          className={`adm-action-btn ${u.status === 'disabled' ? 'complete' : ''}`}
                          type="button"
                          onClick={() => handleQuickToggle(u)}
                        >
                          {u.status === 'disabled' ? 'Activar' : 'Inhabilitar'}
                        </button>
                      )}
                      {!canEdit(u) && !canToggle(u) && <span className="adm-muted-text">Protegido</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default AdminUsersPanel
