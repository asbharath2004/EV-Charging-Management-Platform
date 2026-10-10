import { useState } from 'react'

const RejectStationModal = ({ isOpen, station, onClose, onReject, isSubmitting }) => {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  if (!isOpen || !station) {
    return null
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!reason.trim()) {
      setError('Rejection reason is required.')
      return
    }

    setError('')
    onReject(station.id, reason.trim())
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <h3>Reject Station</h3>
        <p className="modal__station-name">{station.name}</p>

        <form onSubmit={handleSubmit} className="modal__form">
          <label htmlFor="rejectionReason">Rejection Reason</label>
          <textarea
            id="rejectionReason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows="5"
            placeholder="Enter rejection reason"
          />

          {error && <div className="error-message">{error}</div>}

          <div className="modal__actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Rejecting...' : 'Reject Station'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RejectStationModal
