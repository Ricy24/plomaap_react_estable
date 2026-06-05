import ProfileEditForm from '../../../components/profile/ProfileEditForm'
import '../../../styles/profile-edit.css'

function AdminUserEditModal({ user, services, onClose, onSave, saving }) {
  if (!user) return null

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal" onClick={e => e.stopPropagation()}>
        <button className="adm-modal-close" type="button" onClick={onClose}>
          <i className="fa-solid fa-xmark" />
        </button>
        <h3>Editar usuario — {user.name}</h3>
        <ProfileEditForm
          user={user}
          role={user.role}
          mode="admin-edit"
          technicianProfile={user.technicianProfile}
          services={services}
          onSave={onSave}
          saving={saving}
        />
      </div>
    </div>
  )
}

export default AdminUserEditModal
