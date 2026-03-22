// src/modules/agent/api/agent.api.ts
import axios from 'axios';
export const agentApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? 'http://localhost:5000'}/api/v1/agent`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});
agentApi.interceptors.request.use(c => {
  const t = localStorage.getItem('token');
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});
agentApi.interceptors.response.use(r => r, e => {
  if (e.response?.status === 401) { localStorage.removeItem('token'); window.location.href = '/login'; }
  return Promise.reject(e);
});
