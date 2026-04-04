// src/modules/hr/api/hr.api.ts
import api from '../../../api/axios';

// Scoped axios instance — used directly by pages and the slice
export const hrApi = {
  get:    (url: string, config?: any) => api.get(`/hr${url}`, config),
  post:   (url: string, data?: any, config?: any) => api.post(`/hr${url}`, data, config),
  put:    (url: string, data?: any, config?: any) => api.put(`/hr${url}`, data, config),
  delete: (url: string, config?: any) => api.delete(`/hr${url}`, config),
};

export const getProfile     = () => api.get('/hr/profile');
export const updateProfile  = (data: any) => api.put('/hr/profile', data);
export const uploadAvatar   = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/hr/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
