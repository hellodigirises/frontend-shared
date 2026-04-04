// src/modules/agent/api/agent.api.ts
import api from '../../../api/axios';

// Scoped axios instance — used directly by pages and the slice
export const agentApi = {
  get:    (url: string, config?: any) => api.get(`/agent${url}`, config),
  post:   (url: string, data?: any, config?: any) => api.post(`/agent${url}`, data, config),
  put:    (url: string, data?: any, config?: any) => api.put(`/agent${url}`, data, config),
  delete: (url: string, config?: any) => api.delete(`/agent${url}`, config),
};

export const uploadAvatar = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/agent/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const deleteLead = (id: string) => api.delete(`/agent/leads/${id}`);
