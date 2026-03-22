// src/components/RoleRouter.tsx

import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../redux/store';

const ROLE_HOME: Record<string, string> = {
  TENANT_ADMIN : '/superadmin/dashboard',
  SALES_MANAGER: '/sales/dashboard',
  AGENT        : '/agent/dashboard',
  HR           : '/hr/dashboard',
  FINANCE      : '/finance/dashboard',
  MANAGER      : '/sales/dashboard',   // Managers see sales dashboard
  EMPLOYEE     : '/hr/dashboard',      // General employees see HR self-service
};

// After login, redirect to the correct dashboard
export function RoleRedirect() {
  const role = useAppSelector(s => s.auth.user?.role)
             ?? localStorage.getItem('role');

  const home = ROLE_HOME[role ?? ''] ?? '/login';
  return <Navigate to={home} replace />;
}

// Protect a route — only allow certain roles
export function RoleGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const role = useAppSelector(s => s.auth.user?.role)
             ?? localStorage.getItem('role');

  if (!role) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(role)) return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
}