// src/modules/finance/api/finance.api.ts
import axios from 'axios';
export const financeApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? 'http://localhost:5000'}/api/v1/finance`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});
financeApi.interceptors.request.use(c => {
  const t = localStorage.getItem('token');
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});
financeApi.interceptors.response.use(r => r, e => {
  if (e.response?.status === 401) { localStorage.removeItem('token'); window.location.href = '/login'; }
  return Promise.reject(e);
});

export const getProfile     = () => financeApi.get('/profile');
export const updateProfile  = (data: any) => financeApi.put('/profile', data);
export const uploadAvatar   = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return financeApi.post('/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
