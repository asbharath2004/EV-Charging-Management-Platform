import { useEffect, useMemo, useState } from 'react'
import AdminHeader from '../components/AdminHeader'
import ErrorMessage from '../components/ErrorMessage'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'
import { getAllStations } from '../services/adminService'

const AdminStations = () => {
  const [stations, setStations] = useState([])
  const [search, setSearch] = useState('')
  const [approvalFilter, setApprovalFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadStations = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await getAllStations()
        const list = Array.isArray(response) ? response : response?.content || []
        setStations(list)
      } catch (err) {
        setError(err.message || 'Unable to load stations.')
      } finally {
        setLoading(false)
      }
    }

    loadStations()
  }, [])

  const filteredStations = useMemo(() => {
    return stations.filter((station) => {
      const matchesSearch =
        !search ||
        [station.name, station.address, station.ownerId].some((value) =>
          String(value || '').toLowerCase().includes(search.toLowerCase()),
        )

      const matchesApproval =
        approvalFilter === 'ALL' ||
        String(station.approvalStatus || '').toUpperCase() === approvalFilter

      const matchesStatus =
        statusFilter === 'ALL' || String(station.status || '').toUpperCase() === statusFilter

      return matchesSearch && matchesApproval && matchesStatus
    })
  }, [approvalFilter, search, stations, statusFilter])

  return (
    <div className="page-shell">
      <AdminHeader title="Stations" subtitle="Monitor charging station network" />

      <div className="toolbar toolbar--two">
        <input
          type="search"
          className="search-input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search stations"
        />

        <select
          className="filter-select"
          value={approvalFilter}
          onChange={(event) => setApprovalFilter(event.target.value)}
        >
          <option value="ALL">All approval statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
        </select>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="ALL">All statuses</option>
          <option value="AVAILABLE">AVAILABLE</option>
          <option value="UNAVAILABLE">UNAVAILABLE</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading stations..." />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : filteredStations.length === 0 ? (
        <div className="empty-state">No stations found.</div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Address</th>
                <th>Latitude</th>
                <th>Longitude</th>
                <th>Status</th>
                <th>Approval Status</th>
                <th>Owner ID</th>
              </tr>
            </thead>
            <tbody>
              {filteredStations.map((station) => (
                <tr key={station.id}>
                  <td>{station.id}</td>
                  <td>{station.name}</td>
                  <td>{station.address}</td>
                  <td>{station.latitude}</td>
                  <td>{station.longitude}</td>
                  <td>
                    <StatusBadge status={station.status} />
                  </td>
                  <td>
                    <StatusBadge status={station.approvalStatus} />
                  </td>
                  <td>{station.ownerId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminStations
