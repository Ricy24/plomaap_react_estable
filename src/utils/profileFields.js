/** Campos que cada rol puede editar sobre su propia cuenta */
export const SELF_EDITABLE = {
  user: ['name', 'phone', 'address', 'avatar', 'password'],
  technician: ['name', 'phone', 'address', 'avatar', 'password'],
  admin: ['name', 'phone', 'address', 'avatar', 'password'],
}

/** Campos de solo lectura mostrados en el perfil */
export const READ_ONLY = {
  user: ['email', 'createdAt'],
  technician: ['email', 'rating', 'completedJobs', 'specialties', 'zones', 'createdAt'],
  admin: ['email', 'createdAt'],
}

/** Lo que un administrador puede modificar en otras cuentas (no email ni contraseña) */
export const ADMIN_EDITABLE = {
  user: ['name', 'phone', 'address', 'avatar', 'status'],
  technician: ['name', 'phone', 'address', 'avatar', 'status', 'zones', 'specialties'],
  admin: ['name', 'phone', 'address', 'avatar'],
}
