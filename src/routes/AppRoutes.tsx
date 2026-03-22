/**
 * AppRoutes.tsx
 * Your root router — add SuperAdminRoutes here.
 * Place this file at: src/routes/AppRoutes.tsx
 */
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SuperAdminRoutes from '../modules/superadmin/superadminRoutes';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import ProtectedRoute from '../components/ProtectedRoute';
import Login from '../pages/auth/LoginPage';
import AgentRoutes from '../modules/agent/agentRoutes';
import ManagerRoutes from '../modules/sales-manager/salesRoutes';
import HRRoutes from '../modules/hr/hrRoutes';
import TenantAdminRoutes from '../modules/tenant-admin/tenantAdminRoutes';
import CalendarRoutes from '../modules/calendar/calendarRoutes';
import FinanceRoutes from '../modules/finance/financeRoutes';
import HRLayout from '../modules/hr/layout/HRLayout';
import AgentLayout from '../modules/agent/layout/AgentLayout';
import FinanceLayout from '../modules/finance/layout/FinanceLayout';
import ManagerLayout from '../modules/sales-manager/layout/SalesManagerLayout';

const RootRedirect: React.FC = () => {
  const { user, token } = useSelector((state: RootState) => state.auth);
  if (!token || !user) return <Navigate to="/login" replace />;
  const role = user.role?.toUpperCase();
  if (role === 'SUPERADMIN') return <Navigate to="/superadmin" replace />;
  if (role === 'TENANT_ADMIN') return <Navigate to="/admin" replace />;
  if (role === 'SALES_MANAGER') return <Navigate to="/manager" replace />;
  if (role === 'AGENT') return <Navigate to="/agent" replace />;
  if (role === 'HR') return <Navigate to="/hr" replace />;
  if (role === 'FINANCE') return <Navigate to="/finance" replace />;
  return <Navigate to="/login" replace />;
};

const AppRoutes: React.FC = () => (
  <Routes>
    {/* Public Routes */}
    <Route path="/login" element={<Login />} />

    {/* Redirect root → appropriate dashboard */}
    <Route path="/" element={<RootRedirect />} />

    {/* SuperAdmin Routes */}
    <Route element={<ProtectedRoute allowedRoles={['SUPERADMIN']} />}>
      <Route path="/superadmin/*" element={<SuperAdminRoutes />} />
    </Route>

    {/* Tenant Admin Routes */}
    <Route element={<ProtectedRoute allowedRoles={['TENANT_ADMIN']} />}>
      <Route path="/admin/*" element={<TenantAdminRoutes />} />
    </Route>

    {/* HR Routes */}
    <Route element={<ProtectedRoute allowedRoles={['HR', 'TENANT_ADMIN', 'SUPERADMIN']} />}>
      <Route path="/hr" element={<HRLayout />}>
        <Route path="*" element={<HRRoutes />} />
      </Route>
    </Route>

    {/* Agent Routes */}
    <Route element={<ProtectedRoute allowedRoles={['AGENT', 'TENANT_ADMIN', 'SUPERADMIN']} />}>
      <Route path="/agent" element={<AgentLayout />}>
        <Route path="*" element={<AgentRoutes />} />
      </Route>
    </Route>

    {/* Manager Routes */}
    <Route element={<ProtectedRoute allowedRoles={['SALES_MANAGER', 'TENANT_ADMIN', 'SUPERADMIN']} />}>
      <Route path="/manager" element={<ManagerLayout />}>
        <Route path="*" element={<ManagerRoutes />} />
      </Route>
    </Route>

    {/* Finance Routes */}
    <Route element={<ProtectedRoute allowedRoles={['FINANCE', 'TENANT_ADMIN', 'SUPERADMIN']} />}>
      <Route path="/finance" element={<FinanceLayout />}>
        <Route path="*" element={<FinanceRoutes />} />
      </Route>
    </Route>

    {/* Other Protected Routes */}
    <Route element={<ProtectedRoute />}>
      <Route path="/calendar/*" element={<CalendarRoutes />} />
    </Route>
  </Routes>
);

export default AppRoutes;