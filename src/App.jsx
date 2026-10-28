import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { FeedbackProvider } from './components/ui/FeedbackProvider.jsx'
import Home from './pages/Home.jsx'
import LoginSelector from './pages/auth/LoginSelector.jsx'
import { env } from './config/env.js'

const ClientAuth = lazy(() => import('./pages/auth/ClientAuth.jsx'))
const TechnicianAuth = lazy(() => import('./pages/auth/TechnicianAuth.jsx'))
const AdminAuth = lazy(() => import('./pages/auth/AdminAuth.jsx'))
const ClientDashboard = lazy(() => import('./pages/client/ClientDashboard.jsx'))
const TechnicianDashboard = lazy(() => import('./pages/technician/TechnicianDashboard.jsx'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'))

function RouteFallback() {
  return (
    <div className="route-fallback" role="status" aria-live="polite">
      <span className="route-fallback__spinner" aria-hidden="true" />
      <p>Cargando…</p>
    </div>
  )
}

function GuestOnly({ children }) {
  const { user, ready, dashboardPath } = useAuth()
  if (!ready) return <RouteFallback />
  if (user) {
    return <Navigate to={dashboardPath} replace />
  }
  return children
}

function PublicHome() {
  const { user, ready, dashboardPath } = useAuth()
  if (!ready) return <RouteFallback />
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
  const app = (
    <BrowserRouter>
      <FeedbackProvider>
        <AuthProvider>
          <a className="skip-link" href="#contenido">
            Saltar al contenido
          </a>
          <Suspense fallback={<RouteFallback />}>
            <AppRoutes />
          </Suspense>
        </AuthProvider>
      </FeedbackProvider>
    </BrowserRouter>
  )

  if (!env.googleClientId) return app

  return (
    <GoogleOAuthProvider clientId={env.googleClientId}>
      {app}
    </GoogleOAuthProvider>
  )
}

export default App
