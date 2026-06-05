import { useState } from 'react'
import { authApi } from '../../../services/api'
import ProfileEditForm from '../../../components/profile/ProfileEditForm'
import '../../../styles/profile-edit.css'

function AdminProfilePanel({ user, onUserUpdate }) {
  const [saving, setSaving] = useState(false)

  const handleSave = async (payload) => {
    setSaving(true)
    try {
      const data = await authApi.updateProfile(payload)
      onUserUpdate?.(data.user)
    } catch (err) {
      setSaving(false)
      throw err
    }
    setSaving(false)
  }

  return (
    <div className="adm-card adm-profile-card">
      <div className="adm-card-header">
        <h3>Mi perfil de administrador</h3>
      </div>
      <ProfileEditForm
        user={user}
        role="admin"
        mode="self"
        onSave={handleSave}
        saving={saving}
      />
    </div>
  )
}

export default AdminProfilePanel
