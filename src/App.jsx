import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Home from './pages/Home.jsx'
import LoginSelector from './pages/auth/LoginSelector.jsx'
import ClientAuth from './pages/auth/ClientAuth.jsx'
import TechnicianAuth from './pages/auth/TechnicianAuth.jsx'
import AdminAuth from './pages/auth/AdminAuth.jsx'
import ClientDashboard from './pages/client/ClientDashboard.jsx'
import TechnicianDashboard from './pages/technician/TechnicianDashboard.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import { env } from './config/env.js'

function GuestOnly({ children }) {
  const { user, ready, dashboardPath } = useAuth()
  if (!ready) return null
  if (user) {
    return <Navigate to={dashboardPath} replace />
  }
  return children
}

function PublicHome() {
  const { user, ready, dashboardPath } = useAuth()
  if (!ready) return null
  if (user) {
    return <Navigate to={dashboardPath} replace />
  }
  return <Home />
}

function AppRoutes() {
  const { user, technicianProfile, logout, updateUser } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<PublicHome />} />

      <Route path="/ingresar" element={
        <GuestOnly>
          <LoginSelector />
        </GuestOnly>
      } />
      <Route path="/ingresar/cliente" element={
        <GuestOnly>
          <ClientAuth />
        </GuestOnly>
      } />
      <Route path="/ingresar/tecnico" element={
        <GuestOnly>
          <TechnicianAuth />
        </GuestOnly>
      } />

      <Route path="/admin" element={
        <GuestOnly>
          <AdminAuth />
        </GuestOnly>
      } />

      <Route path="/cliente" element={
        <ProtectedRoute allowedRoles={['customer', 'user']}>
          <ClientDashboard
            user={user}
            onLogout={logout}
            onUserUpdate={(updated) => updateUser(updated)}
          />
        </ProtectedRoute>
      } />

      <Route path="/tecnico" element={
        <ProtectedRoute allowedRoles={['technician']}>
          <TechnicianDashboard
            user={user}
            technicianProfile={technicianProfile}
            onLogout={logout}
            onUserUpdate={(updated, profile) => updateUser(updated, profile)}
          />
        </ProtectedRoute>
      } />

      <Route path="/admin/panel" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard
            user={user}
            onLogout={logout}
            onUserUpdate={(updated) => updateUser(updated)}
          />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <GoogleOAuthProvider clientId={env.googleClientId}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  )
}

export default App
