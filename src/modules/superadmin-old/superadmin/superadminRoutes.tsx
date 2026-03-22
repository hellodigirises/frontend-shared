import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

// ─── Lazy imports ─────────────────────────────────────────────────────────────
const SuperAdminDashboard = lazy(() => import('./Dashboard'));
const TenantsPage         = lazy(() => import('./TenantsList'));
const TenantDetail        = lazy(() => import('./TenantDetail'));
const PlansPage           = lazy(() => import('./Plans'));
const ModulesPage         = lazy(() => import('./Settings'));
const AddonsPage          = lazy(() => import('./AIManagement'));
const BillingPage         = lazy(() => import('./Billing'));
const AITelephonyPage     = lazy(() => import('./Telephony'));
const MonitoringPage      = lazy(() => import('./Analytics'));


// ─── Loading fallback ──────────────────────────────────────────────────────────
const PageLoader: React.FC = () => (
  <Box
    sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', bgcolor: '#080b10',
    }}
  >
    <CircularProgress
      size={32}
      thickness={3}
      sx={{ color: '#00d4aa' }}
    />
  </Box>
);

// ─── SuperAdmin Route Guard ───────────────────────────────────────────────────
// Wrap this around the routes in your top-level router to protect SuperAdmin access.
// Replace with your actual auth/role check logic.
const SuperAdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Example: const { user } = useAuth();
  // if (user?.role !== 'SUPER_ADMIN') return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// ─── Route definitions ────────────────────────────────────────────────────────
/**
 * Mount inside your App router:
 *
 *   <Route path="/superadmin/*" element={<SuperAdminRoutes />} />
 *
 * Or with a layout wrapper:
 *
 *   <Route path="/superadmin" element={<SuperAdminLayout />}>
 *     {superAdminRouteChildren}
 *   </Route>
 */
const SuperAdminRoutes: React.FC = () => (
  <SuperAdminGuard>
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Default redirect ── */}
        <Route index element={<Navigate to="dashboard" replace />} />

        {/* ── 1. Global Dashboard ── */}
        <Route path="dashboard" element={<SuperAdminDashboard />} />

        {/* ── 2. Tenant Management ── */}
        <Route path="tenants">
          <Route index  element={<TenantsPage />} />
          <Route path=":id" element={<TenantDetail />} />
        </Route>

        {/* ── 3. Plans ── */}
        <Route path="plans" element={<PlansPage />} />

        {/* ── 4. Module Control ── */}
        <Route path="modules" element={<ModulesPage />} />

        {/* ── 5. Add-on Marketplace ── */}
        <Route path="addons" element={<AddonsPage />} />

        {/* ── 6. AI & Telephony ── */}
        <Route path="ai-telephony" element={<AITelephonyPage />} />

        {/* ── 7. Billing & Revenue ── */}
        <Route path="billing" element={<BillingPage />} />

        {/* ── 8. Platform Monitoring ── */}
        <Route path="monitoring" element={<MonitoringPage />} />

        {/* ── Catch-all ── */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </Suspense>
  </SuperAdminGuard>
);

// ─── Named children array (for use inside a parent <Route>) ───────────────────
// Usage with layout:
//
//   import { superAdminRouteChildren } from './superadminRoutes';
//   <Route path="/superadmin" element={<SuperAdminLayout />}>
//     {superAdminRouteChildren}
//   </Route>
//
export const superAdminRouteChildren = (
  <Route path="/superadmin">
    <Route index element={<Navigate to="/superadmin/dashboard" replace />} />
    <Route path="dashboard"    element={
      <Suspense fallback={<PageLoader />}><SuperAdminDashboard /></Suspense>
    } />
    <Route path="tenants">
      <Route index element={
        <Suspense fallback={<PageLoader />}><TenantsPage /></Suspense>
      } />
      <Route path=":id" element={
        <Suspense fallback={<PageLoader />}><TenantDetail /></Suspense>
      } />
    </Route>
    <Route path="plans" element={
      <Suspense fallback={<PageLoader />}><PlansPage /></Suspense>
    } />
    <Route path="modules" element={
      <Suspense fallback={<PageLoader />}><ModulesPage /></Suspense>
    } />
    <Route path="addons" element={
      <Suspense fallback={<PageLoader />}><AddonsPage /></Suspense>
    } />
    <Route path="ai-telephony" element={
      <Suspense fallback={<PageLoader />}><AITelephonyPage /></Suspense>
    } />
    <Route path="billing" element={
      <Suspense fallback={<PageLoader />}><BillingPage /></Suspense>
    } />
    <Route path="monitoring" element={
      <Suspense fallback={<PageLoader />}><MonitoringPage /></Suspense>
    } />
    <Route path="*" element={<Navigate to="/superadmin/dashboard" replace />} />
  </Route>
);

// ─── Route path constants (avoids magic strings across codebase) ───────────────
export const SUPERADMIN_PATHS = {
  ROOT:          '/superadmin',
  DASHBOARD:     '/superadmin/dashboard',
  TENANTS:       '/superadmin/tenants',
  TENANT_DETAIL: (id: string) => `/superadmin/tenants/${id}`,
  PLANS:         '/superadmin/plans',
  MODULES:       '/superadmin/modules',
  ADDONS:        '/superadmin/addons',
  AI_TELEPHONY:  '/superadmin/ai-telephony',
  BILLING:       '/superadmin/billing',
  MONITORING:    '/superadmin/monitoring',
} as const;

export default SuperAdminRoutes;
