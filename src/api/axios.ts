import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token and tenant ID to headers if logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add tenant ID if user is not SUPERADMIN
  if (user && config.headers) {
    try {
      const userData = JSON.parse(user);
      if (userData.tenantId && userData.role !== 'SUPERADMIN') {
        config.headers['X-Tenant-ID'] = userData.tenantId;
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }
  
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;