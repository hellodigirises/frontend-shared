import api from '../../../api/axios';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  joiningDate?: string;
  status: 'ACTIVE' | 'INACTIVE';
  role: { id: string; name: string };
  manager?: { id: string; name: string };
  tempPassword?: string;
  mustChangePassword?: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  roleId: string;
  department?: string;
  joiningDate?: string;
  managerId?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateUserPayload {
  name?: string;
  phone?: string;
  department?: string;
  joiningDate?: string;
  managerId?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

// Users API endpoints
export const usersApi = {
  // Get all users for current tenant
  getAll: async (skip = 0, take = 15, search?: string, role?: string, status?: string) => {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('take', take.toString());
    if (search) params.append('search', search);
    if (role) params.append('role', role);
    if (status) params.append('status', status);
    
    const response = await api.get(`/users?${params.toString()}`);
    return response.data.data;
  },

  // Get single user by ID
  getById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  },

  // Create new user
  create: async (payload: CreateUserPayload) => {
    const response = await api.post('/users', payload);
    return response.data.data;
  },

  // Update user
  update: async (id: string, payload: UpdateUserPayload) => {
    const response = await api.put(`/users/${id}`, payload);
    return response.data.data;
  },

  // Delete/Deactivate user
  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Reset password
  resetPassword: async (id: string, password: string) => {
    const response = await api.post(`/users/${id}/reset-password`, { password });
    return response.data.data;
  },

  // Get available roles for current tenant
  getAvailableRoles: async () => {
    const response = await api.get('/users/available-roles');
    return response.data.data;
  },
};
