import axios, { AxiosError } from "axios";
import { mockEndpoints } from "./mockData";

// Priority: Env variable > ngrok URL > local backend
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
let isBackendOffline = false;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000, // Short timeout to trigger mock quickly if server is slow
});

// Function to check if we should use mock data
const shouldFallbackToMock = (error: any) => {
  // If no response, it's a network error (server down, ngrok off)
  return !error.response || error.code === 'ECONNABORTED' || error.message === 'Network Error';
};

// Add token and tenant ID to headers if logged in
api.interceptors.request.use((config) => {
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
  (response) => {
    isBackendOffline = false; // Reset if we get a success
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
      if (url && (method === 'get' || method === 'GET')) {
        // Find best matching mock endpoint
        const cleanUrl = url.split('?')[0]; // Remove query params
        const mockResponse = mockEndpoints[cleanUrl] || mockEndpoints[Object.keys(mockEndpoints).find(k => cleanUrl.includes(k)) || ''];
        
        if (mockResponse) {
          console.log(`[Mock API] Returning data for: ${url}`);
          return {
            data: { success: true, data: mockResponse },
            status: 200,
            statusText: "OK",
            headers: {},
            config: error.config,
          };
        }
      }
      
      // For non-GET requests, we just return a generic success for mock
      if (method && ['post', 'put', 'delete'].includes(method.toLowerCase())) {
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