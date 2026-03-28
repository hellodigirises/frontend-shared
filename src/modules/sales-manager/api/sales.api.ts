// src/modules/sales-manager/api/sales.api.ts
import api from '../../../api/axios';

export const getProfile     = () => api.get('/sales/profile');
export const updateProfile  = (data: any) => api.put('/sales/profile', data);
export const uploadAvatar   = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/sales/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
