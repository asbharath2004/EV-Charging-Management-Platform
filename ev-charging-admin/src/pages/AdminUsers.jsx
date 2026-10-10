import { useEffect, useMemo, useState } from 'react'
import AdminHeader from '../components/AdminHeader'
import ErrorMessage from '../components/ErrorMessage'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'
import { getUsers } from '../services/adminService'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await getUsers()
        const userList = Array.isArray(response) ? response : response?.content || []
        setUsers(userList)
      } catch (err) {
        setError(err.message || 'Unable to load users.')
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        !search ||
        [user.name, user.email, user.phone].some((value) =>
          String(value || '').toLowerCase().includes(search.toLowerCase()),
        )

      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter

      return matchesSearch && matchesRole
    })
  }, [roleFilter, search, users])

  return (
    <div className="page-shell">
      <AdminHeader title="Users" subtitle="Manage platform users" />

      <div className="toolbar">
        <input
          type="search"
          className="search-input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search users"
        />

        <select
          className="filter-select"
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
        >
          <option value="ALL">All roles</option>
          <option value="USER">USER</option>
          <option value="STATION_HOST">STATION_HOST</option>
          <option value="FLEET_OPERATOR">FLEET_OPERATOR</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading users..." />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state">No users found.</div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id || `${user.email}-${user.name}`}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone || '—'}</td>
                  <td>
                    <StatusBadge status={user.role} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminUsers
