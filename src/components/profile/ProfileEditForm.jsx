import { useState, useEffect } from 'react'
import { getInitials } from '../../services/api'
import AvatarUpload from './AvatarUpload'
import { SELF_EDITABLE, READ_ONLY, ADMIN_EDITABLE } from '../../utils/profileFields'
import {
  validateProfileSelf,
  validatePasswordChange,
  normalizePhone
} from '../../utils/validation'

const ROLE_LABELS = { user: 'Cliente', technician: 'Técnico', admin: 'Administrador' }

function ProfileEditForm({
  user,
  role,
  mode = 'self',
  technicianProfile = null,
  services = [],
  onSave,
  saving = false,
}) {
  const isAdminEdit = mode === 'admin-edit'
  const editable = isAdminEdit ? (ADMIN_EDITABLE[role] || []) : (SELF_EDITABLE[role] || [])
  const readOnly = READ_ONLY[role] || []

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    avatar: user?.avatar || '',
    status: user?.status || 'active',
    zones: technicianProfile?.zones?.join(', ') || '',
    specialties: technicianProfile?.specialties || [],
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    setForm({
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || '',
      avatar: user?.avatar || '',
      status: user?.status || 'active',
      zones: technicianProfile?.zones?.join(', ') || '',
      specialties: technicianProfile?.specialties || [],
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    })
    setErrors({})
    setSuccess('')
  }, [user, technicianProfile])

  const setField = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }))
    setErrors(prev => { const n = { ...prev }; delete n[name]; return n })
    setSuccess('')
  }

  const toggleSpecialty = (id) => {
    setForm(prev => ({
      ...prev,
      specialties: prev.specialties.includes(id)
        ? prev.specialties.filter(s => s !== id)
        : [...prev.specialties, id]
    }))
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccess('')
    const fieldErrors = {}

    if (editable.includes('name') || editable.includes('phone') || editable.includes('address')) {
      const needsAddress = isAdminEdit ? role === 'user' : role !== 'admin'
      Object.assign(fieldErrors, validateProfileSelf(
        { name: form.name, phone: form.phone, address: form.address },
        { requireAddress: needsAddress }
      ))
    }

    const wantsPassword = editable.includes('password') &&
      (form.currentPassword || form.newPassword || form.confirmPassword)
    if (wantsPassword) {
      Object.assign(fieldErrors, validatePasswordChange(form))
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }

    const payload = {}
    if (editable.includes('name')) payload.name = form.name.trim()
    if (editable.includes('phone')) payload.phone = normalizePhone(form.phone)
    if (editable.includes('address')) payload.address = form.address.trim()
    if (editable.includes('avatar')) payload.avatar = form.avatar.trim() || null
    if (editable.includes('status')) payload.status = form.status
    if (editable.includes('zones')) payload.zones = form.zones
    if (editable.includes('specialties')) payload.specialties = form.specialties
    if (wantsPassword) {
      payload.currentPassword = form.currentPassword
      payload.newPassword = form.newPassword
    }

    try {
      await onSave(payload)
      setSuccess('Cambios guardados correctamente.')
      if (wantsPassword) {
        setForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }))
        setShowPassword(false)
      }
    } catch (err) {
      setErrors({ form: err.message })
    }
  }

  const readOnlyValue = (key) => {
    if (key === 'email') return user?.email
    if (key === 'createdAt') return user?.createdAt || '—'
    if (key === 'rating') return technicianProfile?.rating ?? '—'
    if (key === 'completedJobs') return technicianProfile?.completedJobs ?? '—'
    if (key === 'specialties') return technicianProfile?.specialties?.join(', ') || '—'
    if (key === 'zones') return technicianProfile?.zones?.join(', ') || '—'
    return '—'
  }

  const readOnlyLabels = {
    email: 'Correo electrónico',
    createdAt: 'Miembro desde',
    rating: 'Calificación',
    completedJobs: 'Trabajos completados',
    specialties: 'Especialidades',
    zones: 'Zonas de cobertura',
  }

  return (
    <form className="profile-edit-form" onSubmit={handleSubmit} noValidate>
      <div className="profile-edit-header">
        <div className="profile-edit-avatar">
          {form.avatar || user?.avatar
            ? <img src={form.avatar || user.avatar} alt="" />
            : <span>{getInitials(form.name || user?.name)}</span>
          }
        </div>
        <div>
          <h3>{user?.name}</h3>
          <p className="profile-edit-role">{ROLE_LABELS[role] || role}</p>
          {!isAdminEdit && (
            <p className="profile-edit-hint">
              <i className="fa-solid fa-lock" /> El correo no se puede cambiar por seguridad.
            </p>
          )}
          {isAdminEdit && (
            <p className="profile-edit-hint">ID #{user?.id} · {user?.email}</p>
          )}
        </div>
      </div>

      {readOnly.length > 0 && (
        <div className="profile-readonly-grid">
          {readOnly.map(key => (
            <div key={key} className="profile-readonly-item">
              <span>{readOnlyLabels[key]}</span>
              <strong>{readOnlyValue(key)}</strong>
            </div>
          ))}
        </div>
      )}

      <div className="profile-edit-fields">
        {editable.includes('name') && (
          <div className="profile-field">
            <label>Nombre completo</label>
            <input value={form.name} onChange={e => setField('name', e.target.value)} placeholder="Ej. Juan Pérez" />
            {errors.name && <p className="profile-field-error">{errors.name}</p>}
          </div>
        )}

        {editable.includes('phone') && (
          <div className="profile-field">
            <label>Teléfono de contacto</label>
            <input type="tel" value={form.phone} onChange={e => setField('phone', e.target.value)} placeholder="3229874810" />
            {errors.phone && <p className="profile-field-error">{errors.phone}</p>}
          </div>
        )}

        {editable.includes('address') && (
          <div className="profile-field">
            <label>{role === 'technician' ? 'Dirección base / taller' : 'Dirección'}</label>
            <input value={form.address} onChange={e => setField('address', e.target.value)} placeholder="Cra 77A #45d sur" />
            {errors.address && <p className="profile-field-error">{errors.address}</p>}
          </div>
        )}

        {editable.includes('avatar') && (
          <div className="profile-field profile-field-full">
            <label>Foto de perfil</label>
            <AvatarUpload
              value={form.avatar}
              name={form.name}
              onChange={url => setField('avatar', url)}
            />
            <p className="profile-field-hint">Selecciona una imagen desde tu dispositivo.</p>
          </div>
        )}

        {editable.includes('status') && (
          <div className="profile-field">
            <label>Estado de la cuenta</label>
            <select value={form.status} onChange={e => setField('status', e.target.value)}>
              <option value="active">Activa</option>
              <option value="disabled">Inhabilitada</option>
            </select>
            <p className="profile-field-hint">Las cuentas inhabilitadas no pueden iniciar sesión.</p>
          </div>
        )}

        {editable.includes('zones') && (
          <div className="profile-field">
            <label>Zonas de cobertura (admin)</label>
            <input value={form.zones} onChange={e => setField('zones', e.target.value)} placeholder="Chapinero, Suba, Usaquén" />
            <p className="profile-field-hint">Separa las zonas con comas. Solo el administrador asigna cobertura.</p>
          </div>
        )}

        {editable.includes('specialties') && services.length > 0 && (
          <div className="profile-field">
            <label>Especialidades (admin)</label>
            <div className="profile-specialties">
              {services.map(s => (
                <label key={s.id} className="profile-specialty-chip">
                  <input
                    type="checkbox"
                    checked={form.specialties.includes(s.id)}
                    onChange={() => toggleSpecialty(s.id)}
                  />
                  <i className={`fa-solid ${s.icon}`} /> {s.name}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {editable.includes('password') && !isAdminEdit && (
        <div className="profile-password-section">
          <button type="button" className="profile-password-toggle" onClick={() => setShowPassword(!showPassword)}>
            <i className={`fa-solid fa-chevron-${showPassword ? 'up' : 'down'}`} />
            Cambiar contraseña
          </button>
          {showPassword && (
            <div className="profile-password-fields">
              <div className="profile-field">
                <label>Contraseña actual</label>
                <input type="password" value={form.currentPassword} onChange={e => setField('currentPassword', e.target.value)} />
                {errors.currentPassword && <p className="profile-field-error">{errors.currentPassword}</p>}
              </div>
              <div className="profile-field">
                <label>Nueva contraseña</label>
                <input type="password" value={form.newPassword} onChange={e => setField('newPassword', e.target.value)} />
                {errors.newPassword && <p className="profile-field-error">{errors.newPassword}</p>}
              </div>
              <div className="profile-field">
                <label>Confirmar nueva contraseña</label>
                <input type="password" value={form.confirmPassword} onChange={e => setField('confirmPassword', e.target.value)} />
                {errors.confirmPassword && <p className="profile-field-error">{errors.confirmPassword}</p>}
              </div>
            </div>
          )}
        </div>
      )}

      {errors.form && <p className="profile-field-error">{errors.form}</p>}
      {success && <p className="profile-field-success">{success}</p>}

      <button type="submit" className="dash-btn-primary" disabled={saving}>
        {saving ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}

export default ProfileEditForm
