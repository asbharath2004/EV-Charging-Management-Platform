import axios from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error || !error.response) {
      const networkError = new Error('Unable to connect to the server.')
      networkError.code = 'NETWORK_ERROR'
      return Promise.reject(networkError)
    }

    const { status } = error.response

    if (status === 401) {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('admin')

      if (!window.location.pathname.startsWith('/admin/login')) {
        window.location.href = '/admin/login'
      }

      return Promise.reject(new Error('Your session has expired. Please log in again.'))
    }

    if (status === 403) {
      return Promise.reject(new Error('You do not have permission to access this resource.'))
    }

    if (status === 404) {
      return Promise.reject(
        new Error(error.response?.data?.message || 'The requested resource was not found.'),
      )
    }

    if (status === 500) {
      return Promise.reject(new Error('Something went wrong on the server.'))
    }

    return Promise.reject(error)
  },
)

export default api
