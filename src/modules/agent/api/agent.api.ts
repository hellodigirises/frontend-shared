// src/modules/agent/api/agent.api.ts
import api from '../../../api/axios';

export const uploadAvatar = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/agent/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const deleteLead = (id: string) => api.delete(`/agent/leads/${id}`);
