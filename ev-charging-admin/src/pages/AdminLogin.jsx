import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'

const AdminLogin = () => {
  const navigate = useNavigate()
  const { login } = useAdminAuth()
  const [email, setEmail] = useState('admin@evcharging.com')
  const [password, setPassword] = useState('Admin@123')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      setIsSubmitting(true)
      await login(email, password)
      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Unable to sign in. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-card__brand">
          <div className="brand-icon">⚡</div>
          <div>
            <h1>EV Charging</h1>
            <p>Admin Portal</p>
          </div>
        </div>

        <h2>Administrator Login</h2>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <label>
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@evcharging.com"
              required
            />
          </label>

          <label>
            <span>Password</span>
            <div className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'SIGN IN'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin
