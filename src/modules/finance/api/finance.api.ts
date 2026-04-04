// src/modules/finance/api/finance.api.ts
import api from '../../../api/axios';

// Scoped axios instance — used directly by pages and the slice
export const financeApi = {
  get:    (url: string, config?: any) => api.get(`/finance${url}`, config),
  post:   (url: string, data?: any, config?: any) => api.post(`/finance${url}`, data, config),
  put:    (url: string, data?: any, config?: any) => api.put(`/finance${url}`, data, config),
  delete: (url: string, config?: any) => api.delete(`/finance${url}`, config),
};

export const getProfile     = () => api.get('/finance/profile');
export const updateProfile  = (data: any) => api.put('/finance/profile', data);
export const uploadAvatar   = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/finance/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
