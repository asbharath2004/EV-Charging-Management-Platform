import { NavLink, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard' },
  { label: 'Users', path: '/admin/users' },
  { label: 'Station Requests', path: '/admin/station-requests' },
  { label: 'Stations', path: '/admin/stations' },
  { label: 'Port Requests', path: '/admin/ports/requests' },
  { label: 'Bookings', path: '/admin/bookings' },
  { label: 'Sessions', path: '/admin/sessions' },
  { label: 'Payments', path: '/admin/payments' },
]

const Sidebar = () => {
  const { logout } = useAdminAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__brand-icon">⚡</div>
        <div>
          <h2>EV Charging</h2>
          <span>Admin</span>
        </div>
      </div>

      <nav className="sidebar__nav" aria-label="Admin navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button type="button" className="sidebar__logout" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  )
}

export default Sidebar
