import { useState } from 'react'
import { adminApi } from '../../../services/api'
import AvatarUpload from '../../../components/profile/AvatarUpload'
import {
  validateName,
  validateEmail,
  validatePhone,
  validatePassword,
  validateAddress,
  normalizePhone,
  MESSAGES
} from '../../../utils/validation'
import '../../../styles/profile-edit.css'

const DEFAULT_SCHEDULE = {
  mon: ['8:00 am', '10:00 am', '12:00 pm', '2:00 pm', '4:00 pm'],
  tue: ['8:00 am', '10:00 am', '12:00 pm', '2:00 pm', '4:00 pm'],
  wed: ['8:00 am', '10:00 am', '12:00 pm', '2:00 pm', '4:00 pm'],
  thu: ['10:00 am', '12:00 pm', '2:00 pm', '4:00 pm'],
  fri: ['8:00 am', '10:00 am', '12:00 pm', '2:00 pm'],
  sat: ['8:00 am', '10:00 am'],
  sun: []
}

function AdminCreateUserModal({ services, onClose, onCreated }) {
  const [form, setForm] = useState({
    role: 'user',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    avatar: null,
    zones: 'Chapinero, Suba',
    specialties: [],
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const setField = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }))
    setErrors(prev => { const n = { ...prev }; delete n[name]; return n })
  }

  const toggleSpecialty = (id) => {
    setForm(prev => ({
      ...prev,
      specialties: prev.specialties.includes(id)
        ? prev.specialties.filter(s => s !== id)
        : [...prev.specialties, id]
    }))
  }

  const validate = () => {
    const e = {}
    const nameErr = validateName(form.name)
    if (nameErr) e.name = nameErr
    const emailErr = validateEmail(form.email)
    if (emailErr) e.email = emailErr
    const phoneErr = validatePhone(form.phone, form.role !== 'admin')
    if (phoneErr) e.phone = phoneErr
    if (form.role !== 'admin') {
      const addrErr = validateAddress(form.address)
      if (addrErr) e.address = addrErr
    }
    const passErr = validatePassword(form.password)
    if (passErr) e.password = passErr
    if (!form.confirmPassword) e.confirmPassword = MESSAGES.required
    else if (form.password !== form.confirmPassword) e.confirmPassword = MESSAGES.passwordMismatch
    if (form.role === 'technician' && form.specialties.length === 0) {
      e.specialties = 'Seleccione al menos una especialidad'
    }
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fieldErrors = validate()
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }

    setSaving(true)
    try {
      const payload = {
        role: form.role,
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: normalizePhone(form.phone),
        address: form.address.trim(),
        avatar: form.avatar,
      }
      if (form.role === 'technician') {
        payload.zones = form.zones
        payload.specialties = form.specialties
        payload.schedule = DEFAULT_SCHEDULE
      }

      const data = await adminApi.createUser(payload)
      onCreated?.(data?.user || data)
      onClose()
    } catch (err) {
      setErrors({ form: err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal adm-modal-lg" onClick={ev => ev.stopPropagation()}>
        <button className="adm-modal-close" type="button" onClick={onClose}>
          <i className="fa-solid fa-xmark" />
        </button>
        <h3>Crear cuenta</h3>
        <p className="adm-modal-sub">El administrador puede crear clientes, técnicos y otros administradores.</p>

        <form className="profile-edit-form" onSubmit={handleSubmit} noValidate>
          <div className="profile-field">
            <label>Tipo de cuenta</label>
            <select value={form.role} onChange={e => setField('role', e.target.value)}>
              <option value="user">Cliente</option>
              <option value="technician">Técnico</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="profile-edit-fields">
            <div className="profile-field">
              <label>Nombre completo</label>
              <input value={form.name} onChange={e => setField('name', e.target.value)} placeholder="Ej. Juan Pérez" />
              {errors.name && <p className="profile-field-error">{errors.name}</p>}
            </div>

            <div className="profile-field">
              <label>Correo electrónico</label>
              <input type="email" value={form.email} onChange={e => setField('email', e.target.value)} placeholder="correo@mail.com" />
              {errors.email && <p className="profile-field-error">{errors.email}</p>}
            </div>

            <div className="profile-field">
              <label>Teléfono</label>
              <input type="tel" value={form.phone} onChange={e => setField('phone', e.target.value)} placeholder="3229874810" />
              {errors.phone && <p className="profile-field-error">{errors.phone}</p>}
            </div>

            {form.role !== 'admin' && (
              <div className="profile-field">
                <label>Dirección</label>
                <input value={form.address} onChange={e => setField('address', e.target.value)} placeholder="Cra 77A #45d sur" />
                {errors.address && <p className="profile-field-error">{errors.address}</p>}
              </div>
            )}

            <div className="profile-field">
              <label>Contraseña</label>
              <input type="password" value={form.password} onChange={e => setField('password', e.target.value)} />
              {errors.password && <p className="profile-field-error">{errors.password}</p>}
            </div>

            <div className="profile-field">
              <label>Confirmar contraseña</label>
              <input type="password" value={form.confirmPassword} onChange={e => setField('confirmPassword', e.target.value)} />
              {errors.confirmPassword && <p className="profile-field-error">{errors.confirmPassword}</p>}
            </div>
          </div>

          <div className="profile-field">
            <label>Foto de perfil (opcional)</label>
            <AvatarUpload
              value={form.avatar}
              name={form.name}
              onChange={url => setField('avatar', url)}
            />
          </div>

          {form.role === 'technician' && (
            <>
              <div className="profile-field">
                <label>Zonas de cobertura</label>
                <input value={form.zones} onChange={e => setField('zones', e.target.value)} placeholder="Chapinero, Suba, Usaquén" />
              </div>
              <div className="profile-field">
                <label>Especialidades</label>
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
                {errors.specialties && <p className="profile-field-error">{errors.specialties}</p>}
              </div>
            </>
          )}

          {errors.form && <p className="profile-field-error">{errors.form}</p>}

          <button type="submit" className="dash-btn-primary" disabled={saving}>
            {saving ? 'Creando...' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminCreateUserModal
