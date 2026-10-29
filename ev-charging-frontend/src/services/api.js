import axios from "axios";

const DEFAULT_API_BASE_URL = "https://ev-charging-backend-ozie.onrender.com";
const configuredApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;
const normalizedApiBaseUrl = configuredApiBaseUrl.replace(/\/+$/, "");
const API_BASE_URL = normalizedApiBaseUrl.endsWith("/api")
  ? normalizedApiBaseUrl
  : `${normalizedApiBaseUrl}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Request Interceptor: Attach the JWT token for this browser tab
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      // Dispatch custom event if component listener registered
      window.dispatchEvent(new Event("auth_unauthorized"));
    }
    return Promise.reject(error);
  }
);

// Helper for extracting clean error message from Spring Boot GlobalExceptionHandler
export const getErrorMessage = (error) => {
  if (error.response && error.response.data) {
    if (typeof error.response.data.message === "string") {
      return error.response.data.message;
    }
    if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
      return error.response.data.errors.join(", ");
    }
    if (typeof error.response.data === "string") {
      return error.response.data;
    }
  }
  if (error.code === "ERR_NETWORK" || !error.response) {
    return `Unable to connect to the server at ${API_BASE_URL}. Please verify the backend is running and accessible.`;
  }
  return error.message || "An unexpected error occurred. Please try again.";
};

export default api;
