import api from './api'

export const getUsers = async () => {
  const response = await api.get('/admin/users')
  return response.data
}

export const getPendingStations = async () => {
  const response = await api.get('/admin/stations/pending')
  return response.data
}

export const getAllStations = async () => {
  const response = await api.get('/admin/stations')
  return response.data
}

export const approveStation = async (id) => {
  const response = await api.put(`/admin/stations/${id}/approval`, {
    approvalStatus: 'APPROVED',
  })
  return response.data
}

export const rejectStation = async (id, rejectionReason) => {
  const response = await api.put(`/admin/stations/${id}/approval`, {
    approvalStatus: 'REJECTED',
    rejectionReason,
  })
  return response.data
}

export const getPendingPorts = async () => {
  const response = await api.get('/admin/ports/pending')
  return response.data
}

export const getAllPorts = async () => {
  const response = await api.get('/admin/ports')
  return response.data
}

export const approvePort = async (id) => {
  const response = await api.put(`/admin/ports/${id}/approval`, {
    approvalStatus: 'APPROVED',
  })
  return response.data
}

export const rejectPort = async (id, rejectionReason) => {
  const response = await api.put(`/admin/ports/${id}/approval`, {
    approvalStatus: 'REJECTED',
    rejectionReason,
  })
  return response.data
}

export const getBookings = async () => {
  const response = await api.get('/admin/bookings')
  return response.data
}

export const getSessions = async () => {
  const response = await api.get('/admin/sessions')
  return response.data
}

export const getPayments = async () => {
  const response = await api.get('/admin/payments')
  return response.data
}
