// src/modules/finance/api/finance.api.ts
import api from '../../../api/axios';

export const getProfile     = () => api.get('/finance/profile');
export const updateProfile  = (data: any) => api.put('/finance/profile', data);
export const uploadAvatar   = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/finance/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
