import api from './api'

export const loginAdmin = async (email, password) => {
  const response = await api.post('/admin/auth/login', {
    email,
    password,
  })

  const { token, admin } = response.data || {}

  if (token) {
    localStorage.setItem('adminToken', token)
  }

  if (admin) {
    localStorage.setItem('admin', JSON.stringify(admin))
  }

  return admin
}

export const logoutAdmin = () => {
  localStorage.removeItem('adminToken')
  localStorage.removeItem('admin')
  window.location.href = '/admin/login'
}

export const getAdminToken = () => localStorage.getItem('adminToken')

export const getAdmin = () => {
  const storedAdmin = localStorage.getItem('admin')

  if (!storedAdmin) {
    return null
  }

  try {
    return JSON.parse(storedAdmin)
  } catch (error) {
    return null
  }
}

export const isAdminAuthenticated = () => Boolean(getAdminToken())
