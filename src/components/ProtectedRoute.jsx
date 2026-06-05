import { Navigate, useLocation } from 'react-router-dom'
import { useAuth, DASHBOARD_BY_ROLE } from '../context/AuthContext'

const LOGIN_BY_ROLE = {
  user: '/ingresar/cliente',
  technician: '/ingresar/tecnico',
  admin: '/admin',
}

function ProtectedRoute({ children, allowedRoles }) {
  const { user, ready } = useAuth()
  const location = useLocation()
  const token = localStorage.getItem('authToken')

  if (!ready) {
    return (
      <div className="dash-loading">
        <i className="fa-solid fa-spinner fa-spin" />
        <p>Verificando sesión...</p>
      </div>
    )
  }

  if (!user || !token) {
    const loginPath = allowedRoles?.includes('admin')
      ? '/admin'
      : allowedRoles?.includes('technician')
        ? '/ingresar/tecnico'
        : '/ingresar/cliente'
    return <Navigate to={loginPath} state={{ from: location }} replace />
  }

  if (user.status === 'disabled') {
    localStorage.clear()
    return <Navigate to="/ingresar" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={DASHBOARD_BY_ROLE[user.role] || '/'} replace />
  }

  return children
}

export { LOGIN_BY_ROLE }
export default ProtectedRoute
