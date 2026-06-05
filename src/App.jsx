import { useState, useEffect } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import Home from './pages/Home.jsx'
import LoginSelector from './pages/auth/LoginSelector.jsx'
import ClientAuth from './pages/auth/ClientAuth.jsx'
import TechnicianAuth from './pages/auth/TechnicianAuth.jsx'
import ClientDashboard from './pages/client/ClientDashboard.jsx'
import TechnicianDashboard from './pages/technician/TechnicianDashboard.jsx'
import './styles/theme-global.css'

function AppContent() {
  const [currentPage, setCurrentPage] = useState('Inicio')
  const [user, setUser] = useState(null)
  const [technicianProfile, setTechnicianProfile] = useState(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser)
        setUser(parsed)
        if (parsed.role === 'technician') {
          const profile = localStorage.getItem('technicianProfile')
          if (profile) setTechnicianProfile(JSON.parse(profile))
          setCurrentPage('TechnicianDashboard')
        } else {
          setCurrentPage('ClientDashboard')
        }
      } catch (err) {
        console.error('Error al cargar sesión:', err)
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    localStorage.removeItem('technicianProfile')
    localStorage.removeItem('selectedAddress')
    setUser(null)
    setTechnicianProfile(null)
    setCurrentPage('Inicio')
  }

  if (currentPage === 'Inicio') {
    return (
      <Home
        onLogin={() => setCurrentPage('LoginSelector')}
        onTechnicianLogin={() => setCurrentPage('TechnicianAuth')}
      />
    )
  }

  if (currentPage === 'LoginSelector') {
    return (
      <LoginSelector
        onBack={() => setCurrentPage('Inicio')}
        onSelectClient={() => setCurrentPage('ClientAuth')}
        onSelectTechnician={() => setCurrentPage('TechnicianAuth')}
      />
    )
  }

  if (currentPage === 'ClientAuth') {
    return (
      <ClientAuth
        onBack={() => setCurrentPage('LoginSelector')}
        onLoginSuccess={(userData) => {
          setUser(userData)
          setCurrentPage('ClientDashboard')
        }}
      />
    )
  }

  if (currentPage === 'TechnicianAuth') {
    return (
      <TechnicianAuth
        onBack={() => setCurrentPage('LoginSelector')}
        onLoginSuccess={(userData, profile) => {
          setUser(userData)
          setTechnicianProfile(profile)
          setCurrentPage('TechnicianDashboard')
        }}
      />
    )
  }

  if (currentPage === 'ClientDashboard' && user) {
    return <ClientDashboard user={user} onLogout={handleLogout} />
  }

  if (currentPage === 'TechnicianDashboard' && user) {
    return (
      <TechnicianDashboard
        user={user}
        technicianProfile={technicianProfile}
        onLogout={handleLogout}
      />
    )
  }
}

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AppContent />
    </GoogleOAuthProvider>
  )
}

export default App
