import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminAuthProvider } from './context/AdminAuthContext'
import AdminLayout from './components/AdminLayout'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import AdminStationRequests from './pages/AdminStationRequests'
import AdminStations from './pages/AdminStations'
import AdminBookings from './pages/AdminBookings'
import AdminSessions from './pages/AdminSessions'
import AdminPayments from './pages/AdminPayments'
import PortRequests from './pages/PortRequests'
import AdminProtectedRoute from './routes/AdminProtectedRoute'

function App() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/station-requests" element={<AdminStationRequests />} />
            <Route path="/admin/stations" element={<AdminStations />} />
            <Route path="/admin/ports/requests" element={<PortRequests />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/sessions" element={<AdminSessions />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </AdminAuthProvider>
  )
}

export default App
