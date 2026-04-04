// src/modules/sales-manager/api/sales.api.ts
import api from '../../../api/axios';

// Scoped axios instance — used directly by pages and the slice
export const salesApi = {
  get:    (url: string, config?: any) => api.get(`/sales${url}`, config),
  post:   (url: string, data?: any, config?: any) => api.post(`/sales${url}`, data, config),
  put:    (url: string, data?: any, config?: any) => api.put(`/sales${url}`, data, config),
  delete: (url: string, config?: any) => api.delete(`/sales${url}`, config),
};

export const getProfile     = () => api.get('/sales/profile');
export const updateProfile  = (data: any) => api.put('/sales/profile', data);
export const uploadAvatar   = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/sales/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
