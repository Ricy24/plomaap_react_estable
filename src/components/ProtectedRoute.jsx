import { Navigate, useLocation } from 'react-router-dom'
import { useAuth, DASHBOARD_BY_ROLE } from '../context/AuthContext'

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

  if ((user.role === 'customer' || user.role === 'user') && location.pathname === '/ingresar/cliente') {
    return <Navigate to='/cliente' replace />
  }

  if (user.status === 'disabled') {
    localStorage.clear()
    return <Navigate to="/ingresar" replace />
  }

  const normalizedRole = user.role === 'user' ? 'customer' : user.role
  if (allowedRoles && !allowedRoles.includes(user.role) && !allowedRoles.includes(normalizedRole)) {
    return <Navigate to={DASHBOARD_BY_ROLE[user.role] || DASHBOARD_BY_ROLE[normalizedRole] || '/'} replace />
  }

  return children
}

export default ProtectedRoute
