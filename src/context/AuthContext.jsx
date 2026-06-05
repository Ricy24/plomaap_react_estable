import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionTimeout } from '../hooks/useSessionTimeout'

const AuthContext = createContext(null)

const DASHBOARD_BY_ROLE = {
  user: '/cliente',
  technician: '/tecnico',
  admin: '/admin/panel',
}

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [technicianProfile, setTechnicianProfile] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const token = localStorage.getItem('authToken')
    if (savedUser && token) {
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

  const login = useCallback((userData, profile = null) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('userRole', userData.role)
    if (!localStorage.getItem('authToken')) {
      localStorage.setItem('authToken', `token_${userData.id}_${Date.now()}`)
    }

    if (userData.role === 'technician' && profile) {
      setTechnicianProfile(profile)
      localStorage.setItem('technicianProfile', JSON.stringify(profile))
    }

    navigate(DASHBOARD_BY_ROLE[userData.role] || '/')
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
