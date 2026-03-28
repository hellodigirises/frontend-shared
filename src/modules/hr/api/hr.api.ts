// src/modules/hr/api/hr.api.ts
import api from '../../../api/axios';

export const getProfile     = () => api.get('/hr/profile');
export const updateProfile  = (data: any) => api.put('/hr/profile', data);
export const uploadAvatar   = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/hr/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
