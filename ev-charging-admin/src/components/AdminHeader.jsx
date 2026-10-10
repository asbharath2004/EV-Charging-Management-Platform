import { useAdminAuth } from '../context/AdminAuthContext'

const AdminHeader = ({ title, subtitle }) => {
  const { admin } = useAdminAuth()

  return (
    <header className="admin-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      <div className="admin-header__user">
        <span className="admin-header__label">Admin</span>
        <strong>{admin?.name || 'EV Charging Administrator'}</strong>
      </div>
    </header>
  )
}

export default AdminHeader
