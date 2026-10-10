import { useEffect, useMemo, useState } from 'react'
import AdminHeader from '../components/AdminHeader'
import LoadingSpinner from '../components/LoadingSpinner'
import StatCard from '../components/StatCard'
import { getAllStations, getPendingPorts, getPendingStations, getUsers } from '../services/adminService'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingStationRequests: 0,
    totalStations: 0,
    approvedStations: 0,
    totalBookings: 0,
    chargingSessions: 0,
    totalPayments: 0,
    pendingPortRequests: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        setError('')

        const [usersResponse, pendingResponse, stationsResponse, portsResponse] = await Promise.all([
          getUsers().catch(() => []),
          getPendingStations().catch(() => []),
          getAllStations().catch(() => []),
          getPendingPorts().catch(() => []),
        ])

        const userList = Array.isArray(usersResponse) ? usersResponse : usersResponse?.content || []
        const pendingList = Array.isArray(pendingResponse) ? pendingResponse : pendingResponse?.content || []
        const stationList = Array.isArray(stationsResponse) ? stationsResponse : stationsResponse?.content || []
        const portList = Array.isArray(portsResponse) ? portsResponse : portsResponse?.content || []

        const approvedCount = stationList.filter((station) =>
          String(station.approvalStatus || '').toUpperCase() === 'APPROVED',
        ).length

        setStats({
          totalUsers: userList.length,
          pendingStationRequests: pendingList.length,
          totalStations: stationList.length,
          approvedStations: approvedCount,
          totalBookings: 0,
          chargingSessions: 0,
          totalPayments: 0,
          pendingPortRequests: portList.length,
        })
      } catch (err) {
        setError(err.message || 'Unable to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const cards = useMemo(
    () => [
      { title: 'Total Users', value: stats.totalUsers, icon: '👥', accent: 'rgba(255,193,7,0.15)' },
      {
        title: 'Pending Station Requests',
        value: stats.pendingStationRequests,
        icon: '📌',
        accent: 'rgba(255,193,7,0.18)',
      },
      { title: 'Total Stations', value: stats.totalStations, icon: '🔌', accent: 'rgba(255,193,7,0.17)' },
      { title: 'Approved Stations', value: stats.approvedStations, icon: '✅', accent: 'rgba(255,193,7,0.15)' },
      { title: 'Total Bookings', value: stats.totalBookings, icon: '📅', accent: 'rgba(255,193,7,0.18)' },
      { title: 'Charging Sessions', value: stats.chargingSessions, icon: '⚡', accent: 'rgba(255,193,7,0.15)' },
      { title: 'Total Payments', value: stats.totalPayments, icon: '💰', accent: 'rgba(255,193,7,0.15)' },
      { title: 'Pending Port Requests', value: stats.pendingPortRequests, icon: '⚡', accent: 'rgba(255,193,7,0.18)' },
    ],
    [stats],
  )

  return (
    <div className="page-shell">
      <AdminHeader title="Admin Dashboard" subtitle="Overview of EV Charging Platform" />

      {loading ? (
        <LoadingSpinner message="Loading dashboard..." />
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="stats-grid">
          {cards.map((card) => (
            <StatCard
              key={card.title}
              title={card.title}
              value={card.value}
              icon={card.icon}
              accent={card.accent}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
