import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { mockEndpoints } from "./mockData";

// Priority: Env variable > ngrok URL > local backend
let API_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:5000/api/v1";

// Robustness: Ensure API_URL ends with /api/v1 if not already present
if (API_URL && !API_URL.includes('/api/v1')) {
  // Remove trailing slash if present
  API_URL = API_URL.replace(/\/$/, "");
  API_URL = `${API_URL}/api/v1`;
}

let isBackendOffline = false;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, 
});

// Function to check if we should use mock data
const shouldFallbackToMock = (error: any) => {
  return !error.response || error.code === 'ECONNABORTED' || error.message === 'Network Error';
};

// Add token and tenant ID to headers if logged in
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (user && config.headers) {
    try {
      const userData = JSON.parse(user);
      if (userData.tenantId && userData.role !== 'SUPERADMIN') {
        config.headers['X-Tenant-ID'] = userData.tenantId;
      }
    } catch (e) {
      // Ignore
    }
  }
  
  return config;
});

// Response interceptor for 401s and Mock Fallback
api.interceptors.response.use(
  (response: AxiosResponse) => {
    isBackendOffline = false;
    return response;
  },

  async (error: AxiosError) => {
    // Check if it's a 401
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    // Check if we should fallback to mock
    if (shouldFallbackToMock(error) || isBackendOffline) {
      isBackendOffline = true;
      console.warn("Backend appears to be offline. Switching to Mock API...");
      
      const { url, method } = error.config || {};
      const lowerMethod = method?.toLowerCase();
      
      if (url) {
        const cleanUrl = url.split('?')[0];
        const mockResponse = mockEndpoints[cleanUrl] || mockEndpoints[Object.keys(mockEndpoints).find(k => cleanUrl.includes(k)) || ''];
        
        if (mockResponse) {
          // Special case: If it's a login/profile request, we always return the mock data regardless of method
          if (cleanUrl.includes('/auth/') || lowerMethod === 'get') {
            console.log(`[Mock API] Returning specific data for: ${url}`);
            return {
              data: { success: true, data: mockResponse },
              status: 200,
              statusText: "OK",
              headers: {},
              config: error.config,
            };
          }
        }
      }
      
      // For other non-GET requests, return generic success
      if (lowerMethod && ['post', 'put', 'delete'].includes(lowerMethod)) {
          return {
            data: { success: true, message: "Action performed (Mock)" },
            status: 200,
            statusText: "OK",
            headers: {},
            config: error.config,
          };
      }

    }

    return Promise.reject(error);
  }
);

export default api;