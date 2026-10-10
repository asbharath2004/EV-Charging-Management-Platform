import { useEffect, useState } from 'react'
import AdminHeader from '../components/AdminHeader'
import ErrorMessage from '../components/ErrorMessage'
import LoadingSpinner from '../components/LoadingSpinner'
import { getBookings } from '../services/adminService'

const AdminBookings = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await getBookings()
        const list = Array.isArray(response) ? response : response?.content || []
        setData(list)
      } catch (err) {
        const message = err?.message || 'Bookings API is not available yet.'
        if (message.includes('404') || message.includes('not available') || message.includes('not found')) {
          setError('Bookings API is not available yet.')
        } else {
          setError(message)
        }
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="page-shell">
        <AdminHeader title="Bookings" subtitle="Monitor reservation activity" />
        <LoadingSpinner message="Loading bookings..." />
      </div>
    )
  }

  return (
    <div className="page-shell">
      <AdminHeader title="Bookings" subtitle="Monitor reservation activity" />

      {error ? (
        <ErrorMessage message={error} />
      ) : data.length === 0 ? (
        <div className="empty-state">No bookings found.</div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={`${item.id || 'booking'}-${index}`}>
                  {Object.values(item).map((value, valueIndex) => (
                    <td key={`${index}-${valueIndex}`}>{String(value ?? '—')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminBookings
