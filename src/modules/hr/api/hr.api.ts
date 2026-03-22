// src/modules/hr/api/hr.api.ts
import axios from 'axios';
import { applyMockFallback } from '../../../api/axios';

const BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
const cleanBaseUrl = BASE_URL.replace(/\/$/, "");

export const hrApi = axios.create({
  baseURL: `${cleanBaseUrl}/api/v1/hr`,
  headers: { 
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
  timeout: 30_000,
});


applyMockFallback(hrApi);

hrApi.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

