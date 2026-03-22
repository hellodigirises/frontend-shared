// src/modules/superadmin/api/superadmin.api.ts
import axios from 'axios';
import { applyMockFallback } from '../../../api/axios';

const BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
const cleanBaseUrl = BASE_URL.replace(/\/$/, "");

export const api = axios.create({
  baseURL : `${cleanBaseUrl}/api/v1/superadmin`,
  headers : { 'Content-Type': 'application/json' },
  timeout : 30_000,
});

applyMockFallback(api);

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('sa_token') || localStorage.getItem('token');
  if (token) {
    cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});