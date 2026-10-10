import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

const AdminLayout = () => (
  <div className="admin-layout">
    <Sidebar />
    <div className="admin-layout__main">
      <Outlet />
    </div>
  </div>
)

export default AdminLayout
