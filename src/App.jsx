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
import './styles/theme-global.css'

function GuestOnly({ children, role }) {
  const { user, ready, dashboardPath } = useAuth()
  if (!ready) return null
  if (user && (!role || user.role === role)) {
    return <Navigate to={dashboardPath} replace />
  }
  return children
}

function AppRoutes() {
  const { user, technicianProfile, logout, updateUser } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/ingresar" element={
        <GuestOnly>
          <LoginSelector />
        </GuestOnly>
      } />
      <Route path="/ingresar/cliente" element={
        <GuestOnly role="customer">
          <ClientAuth />
        </GuestOnly>
      } />
      <Route path="/ingresar/tecnico" element={
        <GuestOnly role="technician">
          <TechnicianAuth />
        </GuestOnly>
      } />

      <Route path="/admin" element={
        <GuestOnly role="admin">
          <AdminAuth />
        </GuestOnly>
      } />

      <Route path="/cliente" element={
        <ProtectedRoute allowedRoles={['customer']}>
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
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  )
}

export default App
