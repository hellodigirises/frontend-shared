// src/modules/superadmin/api/superadmin.api.ts
import axios from 'axios';

export const api = axios.create({
  // Matches your app.ts mount: /api/v1/superadmin
  baseURL : `${import.meta.env.VITE_API_URL ?? 'http://localhost:5000'}/api/v1/superadmin`,
  headers : { 'Content-Type': 'application/json' },
  timeout : 30_000,
});

// Attach JWT on every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('sa_token') || localStorage.getItem('token');
  if (token) {
    cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

// Redirect to login on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sa_token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);