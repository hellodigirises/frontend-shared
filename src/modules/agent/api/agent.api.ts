// src/modules/agent/api/agent.api.ts
import axios from 'axios';
import { applyMockFallback } from '../../../api/axios';

const BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
const cleanBaseUrl = BASE_URL.replace(/\/$/, "");

export const agentApi = axios.create({
  baseURL: `${cleanBaseUrl}/api/v1/agent`,
  headers: { 
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
  timeout: 30_000,
});


applyMockFallback(agentApi);

agentApi.interceptors.request.use(c => {
  const t = localStorage.getItem('token');
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

