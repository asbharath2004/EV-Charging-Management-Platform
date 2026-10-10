import { useEffect, useState } from 'react'
import AdminHeader from '../components/AdminHeader'
import ErrorMessage from '../components/ErrorMessage'
import LoadingSpinner from '../components/LoadingSpinner'
import RejectStationModal from '../components/RejectStationModal'
import { approveStation, getPendingStations, rejectStation } from '../services/adminService'

const AdminStationRequests = () => {
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submittingId, setSubmittingId] = useState(null)
  const [selectedStation, setSelectedStation] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [notice, setNotice] = useState('')

  const loadStations = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await getPendingStations()
      const list = Array.isArray(response) ? response : response?.content || []
      setStations(list)
    } catch (err) {
      setError(err.message || 'Unable to load pending station requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStations()
  }, [])

  const handleApprove = async (stationId) => {
    try {
      setSubmittingId(stationId)
      await approveStation(stationId)
      setNotice('Station approved successfully.')
      await loadStations()
    } catch (err) {
      setError(err.message || 'Unable to approve station.')
    } finally {
      setSubmittingId(null)
    }
  }

  const handleReject = async (stationId, rejectionReason) => {
    try {
      setSubmittingId(stationId)
      await rejectStation(stationId, rejectionReason)
      setNotice('Station rejected successfully.')
      setModalOpen(false)
      setSelectedStation(null)
      await loadStations()
    } catch (err) {
      setError(err.message || 'Unable to reject station.')
    } finally {
      setSubmittingId(null)
    }
  }

  return (
    <div className="page-shell">
      <AdminHeader title="Station Requests" subtitle="Review incoming station submissions" />

      {notice && <div className="success-message">{notice}</div>}
      {error && <ErrorMessage message={error} />}

      {loading ? (
        <LoadingSpinner message="Loading station requests..." />
      ) : stations.length === 0 ? (
        <div className="empty-state">No pending station requests.</div>
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stations.map((station) => (
                <tr key={station.id}>
                  <td>{station.id}</td>
                  <td>{station.name}</td>
                  <td>{station.address}</td>
                  <td>{station.latitude}</td>
                  <td>{station.longitude}</td>
                  <td>{station.status}</td>
                  <td>{station.approvalStatus}</td>
                  <td>{station.ownerId}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => handleApprove(station.id)}
                        disabled={submittingId === station.id}
                      >
                        {submittingId === station.id ? 'Approving...' : 'APPROVE'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setSelectedStation(station)
                          setModalOpen(true)
                        }}
                        disabled={submittingId === station.id}
                      >
                        REJECT
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <RejectStationModal
        isOpen={modalOpen}
        station={selectedStation}
        isSubmitting={submittingId !== null}
        onClose={() => {
          setModalOpen(false)
          setSelectedStation(null)
        }}
        onReject={handleReject}
      />
    </div>
  )
}

export default AdminStationRequests
