// src/modules/hr/api/hr.api.ts
import axios from 'axios';

export const hrApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? 'http://localhost:5000'}/api/v1/hr`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

hrApi.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

hrApi.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export const getProfile     = () => hrApi.get('/profile');
export const updateProfile  = (data: any) => hrApi.put('/profile', data);
export const uploadAvatar   = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return hrApi.post('/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
