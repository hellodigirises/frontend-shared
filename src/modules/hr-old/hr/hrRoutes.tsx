import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

// ─── Lazy imports ─────────────────────────────────────────────────────────────
const EmployeesPage     = lazy(() => import('./EmployeesPage'));
const DashboardPage     = lazy(() => import('./DashboardPage'));
const AttendancePage    = lazy(() => import('./AttendancePage'));
const LeavePage         = lazy(() => import('./LeavesPage'));
const PayrollPage       = lazy(() => import('./PayrollPage'));
const DocumentsPage     = lazy(() => import('./DocumentsPage'));
const HRAnalyticsPage   = lazy(() => import('./HrAnalyticsPage'));
const ContractsPage     = lazy(() => import('./ContractsPage'));
const TicketsPage       = lazy(() => import('./TicketsPage'));
const ReportsPage       = lazy(() => import('./ReportsPage'));

// ─── Loading fallback ──────────────────────────────────────────────────────────
const PageLoader: React.FC = () => (
  <Box
    sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', bgcolor: '#fdfaf7',
    }}
  >
    <CircularProgress
      size={32}
      thickness={3}
      sx={{ color: '#be185d' }}
    />
  </Box>
);

// ─── HR Role Guard ─────────────────────────────────────────────────────────────
// Protects HR routes — only HR team, Managers and Admins can access.
// Replace the comment with your actual role check.
const HRGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // const { user } = useAuth();
  // const allowed = ['ADMIN', 'HR_MANAGER', 'HR_EXECUTIVE', 'TENANT_ADMIN'];
  // if (!allowed.includes(user?.role)) return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
};

// ─── HR Routes ────────────────────────────────────────────────────────────────
/**
 * Mount inside your App router:
 *
 *   <Route path="/hr/*" element={<HRRoutes />} />
 *
 * Or with a layout:
 *
 *   <Route path="/hr" element={<HRLayout />}>
 *     {hrRouteChildren}
 *   </Route>
 */
const HRRoutes: React.FC = () => (
  <HRGuard>
    <Suspense fallback={<PageLoader />}>
      <Routes>
    
        {/* ── Default redirect ── */}
        <Route index element={<Navigate to="dashboard" replace />} />
        
        <Route path="dashboard" element={<DashboardPage />} />

        {/* ── 1. Employee Management ── */}
        <Route path="employees"  element={<EmployeesPage />} />

        {/* ── 2. Attendance System ── */}
        <Route path="attendance" element={<AttendancePage />} />

        {/* ── 3. Leave Management ── */}
        <Route path="leaves"     element={<LeavePage />} />

        {/* ── 4. Payroll & Incentives ── */}
        <Route path="payroll"    element={<PayrollPage />} />

        {/* ── 5. Employee Document Vault ── */}
        <Route path="documents"  element={<DocumentsPage />} />

        {/* ── 6. HR Analytics ── */}
        <Route path="analytics"  element={<HRAnalyticsPage />} />
        
        <Route path="contracts"  element={<ContractsPage />} />
        <Route path="tickets"    element={<TicketsPage />} />
        <Route path="reports"    element={<ReportsPage />} />

        {/* ── Catch-all ── */}
        <Route path="*" element={<Navigate to="employees" replace />} />
      </Routes>
    </Suspense>
  </HRGuard>
);

// ─── Named children array (for use inside a parent <Route> with layout) ────────
export const hrRouteChildren = (
  <Route path="/hr">
    <Route index element={<Navigate to="/hr/employees" replace />} />
    <Route path="employees" element={
      <Suspense fallback={<PageLoader />}><EmployeesPage /></Suspense>
    } />
    <Route path="attendance" element={
      <Suspense fallback={<PageLoader />}><AttendancePage /></Suspense>
    } />
    <Route path="leaves" element={
      <Suspense fallback={<PageLoader />}><LeavePage /></Suspense>
    } />
    <Route path="payroll" element={
      <Suspense fallback={<PageLoader />}><PayrollPage /></Suspense>
    } />
    <Route path="documents" element={
      <Suspense fallback={<PageLoader />}><DocumentsPage /></Suspense>
    } />
    <Route path="analytics" element={
      <Suspense fallback={<PageLoader />}><HRAnalyticsPage /></Suspense>
    } />
    <Route path="*" element={<Navigate to="/hr/employees" replace />} />
  </Route>
);

// ─── Route path constants ──────────────────────────────────────────────────────
export const HR_PATHS = {
  ROOT:       '/hr',
  EMPLOYEES:  '/hr/employees',
  ATTENDANCE: '/hr/attendance',
  LEAVES:     '/hr/leaves',
  PAYROLL:    '/hr/payroll',
  DOCUMENTS:  '/hr/documents',
  ANALYTICS:  '/hr/analytics',
} as const;

// ─── HR Sidebar Nav config (matches route paths exactly) ──────────────────────
// Import this into your HRLayout sidebar component.
export const HR_NAV_ITEMS = [
  { label: 'Employees',   path: HR_PATHS.EMPLOYEES,  icon: '👥', description: 'Manage team members' },
  { label: 'Attendance',  path: HR_PATHS.ATTENDANCE, icon: '📍', description: 'GPS check-in & tracking' },
  { label: 'Leaves',      path: HR_PATHS.LEAVES,     icon: '🏖️', description: 'Leave requests & approvals' },
  { label: 'Payroll',     path: HR_PATHS.PAYROLL,    icon: '💰', description: 'Salary & commissions' },
  { label: 'Documents',   path: HR_PATHS.DOCUMENTS,  icon: '📁', description: 'Employee document vault' },
  { label: 'Analytics',   path: HR_PATHS.ANALYTICS,  icon: '📊', description: 'HR metrics & reports' },
] as const;

export default HRRoutes;
