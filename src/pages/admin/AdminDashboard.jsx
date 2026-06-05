import { useState, useEffect } from 'react'
import { adminApi, servicesApi } from '../../services/api'
import AdminProfilePanel from './components/AdminProfilePanel'
import AdminHeader from './components/AdminHeader'
import AdminStats from './components/AdminStats'
import AdminSchedule from './components/AdminSchedule'
import AdminAppointmentsTable from './components/AdminAppointmentsTable'
import AdminTodayCard from './components/AdminTodayCard'
import AdminChart from './components/AdminChart'
import AdminComposition from './components/AdminComposition'
import AdminUsersPanel from './components/AdminUsersPanel'
import AddressMap from '../../components/AddressMap'
import '../../styles/admin-dashboard.css'
import '../../styles/address-map.css'

function AdminDashboard({ user, onLogout, onUserUpdate }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [data, setData] = useState(null)
  const [users, setUsers] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [error, setError] = useState('')

  const loadDashboard = async () => {
    setLoading(true)
    setError('')
    try {
      const [dashData, usersData, svcData] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getUsers(),
        servicesApi.getAll()
      ])
      setData(dashData)
      setUsers(usersData.users || [])
      setServices(svcData.services || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadDashboard() }, [])

  const handleStatusChange = async (id, status) => {
    setUpdating(id)
    try {
      const result = await adminApi.updateAppointmentStatus(id, status)
      setData(prev => ({
        ...prev,
        recentAppointments: prev.recentAppointments.map(a =>
          a.id === id ? result.appointment : a
        ),
        todaySchedule: prev.todaySchedule.map(a =>
          a.id === id ? { ...a, status, isPrimary: status === 'in_progress' } : a
        )
      }))
      await loadDashboard()
    } catch (err) {
      alert(err.message)
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <div className="adm-loading">
        <i className="fa-solid fa-spinner fa-spin" />
        <p>Cargando panel de administración...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="adm-loading">
        <i className="fa-solid fa-triangle-exclamation" />
        <p>{error}</p>
        <button onClick={loadDashboard}>Reintentar</button>
      </div>
    )
  }

  return (
    <div className="adm-layout">
      <AdminHeader
        user={user}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={onLogout}
      />

      <main className="adm-main">
        {(activeTab === 'dashboard' || activeTab === 'reportes') && (
          <>
            <AdminStats stats={data?.stats} userName={user?.name} />

            <div className="adm-grid">
              <div className="adm-grid-left">
                <AdminSchedule
                  weekCalendar={data?.weekCalendar}
                  todaySchedule={data?.todaySchedule}
                />
              </div>

              <div className="adm-grid-center">
                <AdminAppointmentsTable
                  appointments={data?.recentAppointments}
                  onStatusChange={handleStatusChange}
                  updating={updating}
                />
                <AdminChart monthlyAppointments={data?.monthlyAppointments} />
              </div>

              <div className="adm-grid-right">
                <AdminTodayCard stats={data?.stats} />
                <AdminComposition
                  composition={data?.composition}
                  serviceBreakdown={data?.serviceBreakdown}
                />
              </div>
            </div>
          </>
        )}

        {activeTab === 'citas' && (
          <div className="adm-single-panel">
            <AdminAppointmentsTable
              appointments={data?.allAppointments}
              onStatusChange={handleStatusChange}
              updating={updating}
            />
          </div>
        )}

        {activeTab === 'usuarios' && (
          <div className="adm-single-panel">
            <AdminUsersPanel
              users={users}
              services={services}
              currentUserId={user?.id}
              onUserUpdated={(updated) => {
                setUsers(prev => prev.map(u =>
                  u.id === updated.id ? { ...u, ...updated, technicianProfile: updated.technicianProfile ?? u.technicianProfile } : u
                ))
              }}
              onUserCreated={(created) => {
                setUsers(prev => [created, ...prev])
              }}
            />
          </div>
        )}

        {activeTab === 'perfil' && (
          <div className="adm-single-panel">
            <AdminProfilePanel user={user} onUserUpdate={onUserUpdate} />
          </div>
        )}

        {activeTab === 'servicios' && (
          <div className="adm-single-panel">
            <AdminComposition
              composition={data?.composition}
              serviceBreakdown={data?.serviceBreakdown}
            />
            <AdminChart monthlyAppointments={data?.monthlyAppointments} />
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminDashboard
