const StatusBadge = ({ status, variant = 'default' }) => {
  const normalized = String(status || '').toUpperCase()

  const colorMap = {
    PENDING: 'badge-pending',
    APPROVED: 'badge-approved',
    REJECTED: 'badge-rejected',
    AVAILABLE: 'badge-available',
    UNAVAILABLE: 'badge-unavailable',
    ACTIVE: 'badge-approved',
    INACTIVE: 'badge-rejected',
    USER: 'badge-neutral',
    STATION_HOST: 'badge-neutral',
    FLEET_OPERATOR: 'badge-neutral',
  }

  return (
    <span className={`status-badge ${colorMap[normalized] || `badge-${variant}`}`}>
      {normalized || 'UNKNOWN'}
    </span>
  )
}

export default StatusBadge
