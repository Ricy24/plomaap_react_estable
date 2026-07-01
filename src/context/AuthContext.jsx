import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionTimeout } from '../hooks/useSessionTimeout'

const AuthContext = createContext(null)

const DASHBOARD_BY_ROLE = {
  customer: '/cliente',
  user: '/cliente',
  technician: '/tecnico',
  admin: '/admin/panel',
}

function parseJwtPayload(token) {
  if (typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(atob(base64).split('').map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`).join(''))
    return JSON.parse(json)
  } catch {
    return null
  }
}

function isValidAuthToken(token) {
  const payload = parseJwtPayload(token)
  if (!payload) return false
  if (typeof payload.sub !== 'string') return false
  if (payload.exp && Date.now() >= payload.exp * 1000) return false
  return true
}

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [technicianProfile, setTechnicianProfile] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const token = localStorage.getItem('authToken')

    if (savedUser && token && isValidAuthToken(token)) {
      try {
        const parsed = JSON.parse(savedUser)
        setUser(parsed)
        if (parsed.role === 'technician') {
          const profile = localStorage.getItem('technicianProfile')
          if (profile) setTechnicianProfile(JSON.parse(profile))
        }
      } catch (err) {
        console.error('Error al cargar sesión:', err)
      }
    } else if (token) {
      localStorage.removeItem('authToken')
    }
    setReady(true)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    localStorage.removeItem('technicianProfile')
    localStorage.removeItem('selectedAddress')
    setUser(null)
    setTechnicianProfile(null)
    navigate('/')
  }, [navigate])

  useSessionTimeout(!!user, () => {
    alert('Su sesión expiró por inactividad (10 minutos). Por seguridad debe iniciar sesión nuevamente.')
    logout()
  })

  const login = useCallback((userData, profile = null, token = null) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('userRole', userData.role)

    if (token) {
      localStorage.setItem('authToken', token)
    } else {
      localStorage.removeItem('authToken')
    }

    if (userData.role === 'technician' && profile) {
      setTechnicianProfile(profile)
      localStorage.setItem('technicianProfile', JSON.stringify(profile))
    }

    navigate(DASHBOARD_BY_ROLE[userData.role] || DASHBOARD_BY_ROLE.customer || '/')
  }, [navigate])

  const updateUser = useCallback((updated, profile = null) => {
    setUser(updated)
    localStorage.setItem('user', JSON.stringify(updated))
    if (profile) {
      setTechnicianProfile(profile)
      localStorage.setItem('technicianProfile', JSON.stringify(profile))
    }
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      technicianProfile,
      ready,
      login,
      logout,
      updateUser,
      setTechnicianProfile,
      dashboardPath: user ? DASHBOARD_BY_ROLE[user.role] : '/',
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}

export { DASHBOARD_BY_ROLE }
