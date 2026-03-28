// src/modules/superadmin/api/superadmin.api.ts
import baseApi from '../../../api/axios';

/**
 * SuperAdmin API wrapper that reuses the central axios instance 
 * while maintaining the /superadmin mount point.
 */
export const api = {
  get: (url: string, config?: any) => baseApi.get(`/superadmin${url}`, config),
  post: (url: string, data?: any, config?: any) => baseApi.post(`/superadmin${url}`, data, config),
  put: (url: string, data?: any, config?: any) => baseApi.put(`/superadmin${url}`, data, config),
  delete: (url: string, config?: any) => baseApi.delete(`/superadmin${url}`, config),
  patch: (url: string, data?: any, config?: any) => baseApi.patch(`/superadmin${url}`, data, config),
};

export default api;