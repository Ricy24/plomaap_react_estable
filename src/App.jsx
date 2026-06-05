import { useState, useEffect } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import Home from './pages/Home.jsx'
import Auth from './pages/Auth.jsx'
import ClientDashboard from './pages/ClientDashboard.jsx'

import './styles/theme-global.css'

function AppContent() {
  const [currentPage, setCurrentPage] = useState('Inicio')
  const [user, setUser] = useState(null)

  // Verificar si hay usuario guardado al cargar
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
        setCurrentPage('ClientDashboard')
      } catch (err) {
        console.error('Error al cargar usuario guardado:', err)
      }
    }
  }, [])

  // ==========================================
  // 1. VISTA PÚBLICA: Landing Page
  // ==========================================
  if (currentPage === 'Inicio') {
    return (
      <Home onLogin={() => setCurrentPage('Auth')} />
    )
  }

  // ==========================================
  // 2. VISTA DE AUTENTICACIÓN: Login / Registro
  // ==========================================
  if (currentPage === 'Auth') {
    return (
      <Auth 
        onBack={() => setCurrentPage('Inicio')} 
        onLoginSuccess={(userData) => {
          setUser(userData)
          setCurrentPage('ClientDashboard')
        }} 
      />
    )
  }

  // ==========================================
  // 3. VISTA PRIVADA: Dashboard del Cliente
  // ==========================================
  if (currentPage === 'ClientDashboard' && user) {
    return (
      <ClientDashboard 
        user={user}
        onLogout={() => {
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
          localStorage.removeItem('selectedAddress')
          setUser(null)
          setCurrentPage('Inicio')
        }}
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