export const mockUsers = [
  {
    id: 'u1',
    name: 'John Doe (Mock)',
    email: 'john@example.com',
    phone: '1234567890',
    department: 'Engineering',
    joiningDate: '2023-01-01',
    status: 'ACTIVE',
    role: { id: 'r1', name: 'ADMIN' },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u2',
    name: 'Jane Smith (Mock)',
    email: 'jane@example.com',
    phone: '0987654321',
    department: 'HR',
    joiningDate: '2023-02-15',
    status: 'ACTIVE',
    role: { id: 'r2', name: 'USER' },
    createdAt: new Date().toISOString(),
  }
];

export const mockRoles = [
  { id: 'r1', name: 'ADMIN' },
  { id: 'r2', name: 'USER' },
  { id: 'r3', name: 'MANAGER' }
];

export const mockTenants = [
  {
    id: 't1',
    name: 'Main Tenant (Mock)',
    email: 'tenant@example.com',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  }
];

export const mockDashboardData = {
  totalUsers: 150,
  activeTenants: 12,
  pendingLeads: 45,
  recentActivities: [
    { id: '1', type: 'USER_CREATED', description: 'New user John Doe added', timestamp: new Date().toISOString() },
    { id: '2', type: 'TENANT_CREATED', description: 'Realesso Corp tenant added', timestamp: new Date().toISOString() },
  ]
};

export const mockLoginResponse = {
  accessToken: 'mock-jwt-token',
  user: {
    id: 'u1',
    name: 'John Doe (Mock)',
    email: 'john@example.com',
    role: 'ADMIN',
    tenantId: 't1'
  }
};

export const mockProfileResponse = mockLoginResponse.user;

// Map of common API endpoints to their mock responses
export const mockEndpoints: Record<string, any> = {
  '/auth/login': mockLoginResponse,
  '/auth/profile': mockProfileResponse,
  '/users': { data: mockUsers, total: mockUsers.length },
  '/users/available-roles': mockRoles,
  '/tenants': mockTenants,
  '/dashboard/stats': mockDashboardData,
};

