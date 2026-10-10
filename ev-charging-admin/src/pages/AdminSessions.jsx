import { useEffect, useState } from 'react'
import AdminHeader from '../components/AdminHeader'
import ErrorMessage from '../components/ErrorMessage'
import LoadingSpinner from '../components/LoadingSpinner'
import { getSessions } from '../services/adminService'

const AdminSessions = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await getSessions()
        const list = Array.isArray(response) ? response : response?.content || []
        setData(list)
      } catch (err) {
        const message = err?.message || 'Charging sessions API is not available yet.'
        if (message.includes('404') || message.includes('not available') || message.includes('not found')) {
          setError('Charging sessions API is not available yet.')
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
        <AdminHeader title="Sessions" subtitle="Review charging activity" />
        <LoadingSpinner message="Loading sessions..." />
      </div>
    )
  }

  return (
    <div className="page-shell">
      <AdminHeader title="Sessions" subtitle="Review charging activity" />

      {error ? (
        <ErrorMessage message={error} />
      ) : data.length === 0 ? (
        <div className="empty-state">No charging sessions found.</div>
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
                <tr key={`${item.id || 'session'}-${index}`}>
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

export default AdminSessions
