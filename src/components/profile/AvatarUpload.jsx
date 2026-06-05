import { useState, useEffect } from 'react'
import { uploadImageToCloudinary } from '../../utils/cloudinary'
import { getInitials } from '../../services/api'

function AvatarUpload({ value, name, onChange, disabled = false }) {
  const [preview, setPreview] = useState(value || null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setPreview(value || null)
  }, [value])

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setError('')
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result)
    reader.readAsDataURL(file)

    setUploading(true)
    try {
      const url = await uploadImageToCloudinary(file)
      setPreview(url)
      onChange(url)
    } catch (err) {
      setError(err.message)
      setPreview(value || null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange(null)
    setError('')
  }

  const display = preview || value

  return (
    <div className="avatar-upload">
      <div className="avatar-upload-preview">
        {display
          ? <img src={display} alt="Foto de perfil" />
          : <span className="avatar-upload-initials">{getInitials(name || '?')}</span>
        }
      </div>
      <div className="avatar-upload-actions">
        <label className={`avatar-upload-btn ${disabled || uploading ? 'disabled' : ''}`}>
          <i className="fa-solid fa-camera" />
          {uploading ? 'Subiendo...' : 'Seleccionar imagen'}
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            disabled={disabled || uploading}
            hidden
          />
        </label>
        {display && (
          <button type="button" className="avatar-upload-remove" onClick={handleRemove} disabled={uploading}>
            Quitar foto
          </button>
        )}
      </div>
      {error && <p className="profile-field-error">{error}</p>}
    </div>
  )
}

export default AvatarUpload
