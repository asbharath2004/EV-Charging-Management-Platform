import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  getAdmin,
  getAdminToken,
  isAdminAuthenticated,
  loginAdmin,
  logoutAdmin,
} from '../services/adminAuthService'

const AdminAuthContext = createContext(null)

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => getAdmin())
  const [adminToken, setAdminToken] = useState(() => getAdminToken())
  const [isAuthenticated, setIsAuthenticated] = useState(() => isAdminAuthenticated())

  useEffect(() => {
    const token = getAdminToken()
    const storedAdmin = getAdmin()

    setAdminToken(token)
    setAdmin(storedAdmin)
    setIsAuthenticated(Boolean(token))
  }, [])

  const login = async (email, password) => {
    const loggedInAdmin = await loginAdmin(email, password)
    const token = getAdminToken()

    setAdmin(loggedInAdmin)
    setAdminToken(token)
    setIsAuthenticated(Boolean(token))

    return loggedInAdmin
  }

  const logout = () => {
    logoutAdmin()
    setAdmin(null)
    setAdminToken(null)
    setIsAuthenticated(false)
  }

  const value = useMemo(
    () => ({
      admin,
      adminToken,
      isAuthenticated,
      login,
      logout,
    }),
    [admin, adminToken, isAuthenticated],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)

  if (!context) {
    throw new Error('useAdminAuth must be used inside AdminAuthProvider')
  }

  return context
}
