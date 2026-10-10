import { useEffect, useMemo, useState } from 'react'
import AdminHeader from '../components/AdminHeader'
import ErrorMessage from '../components/ErrorMessage'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'
import {
  approvePort,
  getAllPorts,
  getPendingPorts,
  rejectPort,
} from '../services/adminService'

const toList = (response) => (Array.isArray(response) ? response : response?.content || [])

const PortRequests = () => {
  const [ports, setPorts] = useState([])
  const [tab, setTab] = useState('PENDING')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submittingId, setSubmittingId] = useState(null)
  const [rejectingPort, setRejectingPort] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const loadPorts = async () => {
    try {
      setLoading(true)
      setError('')
      const response = tab === 'PENDING' ? await getPendingPorts() : await getAllPorts()
      setPorts(toList(response))
    } catch (err) {
      setError(err.message || 'Unable to load port requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPorts()
  }, [tab])

  const visiblePorts = useMemo(() => {
    if (tab === 'ALL') return ports
    return ports.filter((port) => String(port.approvalStatus).toUpperCase() === tab)
  }, [ports, tab])

  const handleApprove = async (port) => {
    try {
      setSubmittingId(port.id)
      setError('')
      setNotice('')
      await approvePort(port.id)
      setNotice('Port approved successfully.')
      await loadPorts()
    } catch (err) {
      setError(err.message || 'Unable to approve port.')
    } finally {
      setSubmittingId(null)
    }
  }

  const handleReject = async (event) => {
    event.preventDefault()
    if (!rejectingPort || !rejectionReason.trim()) {
      setError('Rejection reason is required.')
      return
    }

    try {
      setSubmittingId(rejectingPort.id)
      setError('')
      setNotice('')
      await rejectPort(rejectingPort.id, rejectionReason.trim())
      setNotice('Port rejected successfully.')
      setRejectingPort(null)
      setRejectionReason('')
      await loadPorts()
    } catch (err) {
      setError(err.message || 'Unable to reject port.')
    } finally {
      setSubmittingId(null)
    }
  }

  return (
    <div className="page-shell">
      <AdminHeader title="Port Requests" subtitle="Review and approve charging ports submitted by Station Hosts." />

      {notice && <div className="success-message">{notice}</div>}
      {error && <ErrorMessage message={error} />}

      <div className="filter-tabs" role="tablist" aria-label="Port approval status">
        {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((status) => (
          <button
            key={status}
            type="button"
            className={tab === status ? 'filter-tab filter-tab--active' : 'filter-tab'}
            onClick={() => setTab(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner message="Loading port requests..." />
      ) : visiblePorts.length === 0 ? (
        <div className="empty-state">
          {tab === 'PENDING' ? 'No Pending Port Requests' : 'No ports found for this filter.'}
          {tab === 'PENDING' && <span>All charging port requests have been reviewed.</span>}
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Port</th>
                <th>Station</th>
                <th>Owner</th>
                <th>Connector</th>
                <th>Power</th>
                <th>Tariff</th>
                <th>Status</th>
                <th>Approval</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visiblePorts.map((port) => {
                const pending = String(port.approvalStatus).toUpperCase() === 'PENDING'
                const busy = submittingId === port.id
                return (
                  <tr key={port.id}>
                    <td>
                      <strong>#{port.portNumber}</strong>
                      <small>{port.id}</small>
                    </td>
                    <td>
                      <strong>{port.stationName || 'Station unavailable'}</strong>
                      <small>{port.stationAddress || port.stationId}</small>
                    </td>
                    <td>
                      <strong>{port.ownerName || 'Owner unavailable'}</strong>
                      <small>{port.ownerEmail || port.ownerId || 'N/A'}</small>
                    </td>
                    <td>{port.connectorType}</td>
                    <td>{port.powerKw} kW</td>
                    <td>₹{port.pricePerKwh} / kWh</td>
                    <td><StatusBadge status={port.status} /></td>
                    <td>
                      <StatusBadge status={port.approvalStatus || 'PENDING'} />
                      {port.rejectionReason && <small>{port.rejectionReason}</small>}
                    </td>
                    <td>
                      {pending ? (
                        <div className="action-buttons">
                          <button type="button" className="btn btn-primary" onClick={() => handleApprove(port)} disabled={busy}>
                            {busy ? 'Saving...' : 'APPROVE'}
                          </button>
                          <button type="button" className="btn btn-secondary" onClick={() => { setRejectingPort(port); setRejectionReason(''); setError('') }} disabled={busy}>
                            REJECT
                          </button>
                        </div>
                      ) : <span className="muted-text">Reviewed</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {rejectingPort && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="reject-port-title">
            <h2 id="reject-port-title">Reject Charging Port</h2>
            <p>Please provide a reason for rejecting this charging port.</p>
            <form onSubmit={handleReject}>
              <label className="form-label" htmlFor="rejection-reason">Rejection Reason</label>
              <textarea
                id="rejection-reason"
                className="form-input"
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                rows="4"
                required
              />
              <div className="action-buttons modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setRejectingPort(null)} disabled={submittingId !== null}>Cancel</button>
                <button type="submit" className="btn btn-danger" disabled={submittingId !== null || !rejectionReason.trim()}>
                  {submittingId ? 'Rejecting...' : 'Reject Port'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PortRequests
