import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => sessionStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // Restore authenticated session on page reload via /api/auth/me
  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    const initAuth = async () => {
      const storedToken = sessionStorage.getItem("token");
      if (storedToken) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          sessionStorage.setItem("user", JSON.stringify(currentUser));
        } catch (error) {
          console.error("Token verification failed:", error);
          // Keep cached auth during a backend/network outage. The Axios
          // interceptor clears it when the server explicitly returns 401.
          if (error.response) {
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
            setToken(null);
            setUser(null);
          }
        }
      }
      setLoading(false);
    };

    initAuth();

    // Listen for 401 unauthorized events dispatched by Axios interceptor
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener("auth_unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth_unauthorized", handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setToken(data.token);
    setUser(data.user);
    sessionStorage.setItem("token", data.token);
    sessionStorage.setItem("user", JSON.stringify(data.user));
    return data.user;
  };

  const register = async (registerData) => {
    const data = await authService.register(registerData);
    setToken(data.token);
    setUser(data.user);
    sessionStorage.setItem("token", data.token);
    sessionStorage.setItem("user", JSON.stringify(data.user));
    return data.user;
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUserData) => {
    const newUser = { ...user, ...updatedUserData };
    setUser(newUser);
    sessionStorage.setItem("user", JSON.stringify(newUser));
  };

  const value = {
    user,
    token,
    userId: user?.id || null,
    role: user?.role || "USER",
    isAuthenticated: !!token && !!user,
    loading,
    login,
    register,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
