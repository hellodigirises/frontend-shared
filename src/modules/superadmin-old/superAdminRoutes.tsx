import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import SuperAdminLayout from './pages/SuperAdminLayout';

// Lazy-load all pages for code splitting
const DashboardPage    = lazy(() => import('./pages/Dashboard'));
const TenantsPage      = lazy(() => import('./pages/TenantsList'));
const TenantDetailPage = lazy(() => import('./pages/TenantDetail'));
const PlansPage        = lazy(() => import('./pages/Plans'));
const AIAgentsPage     = lazy(() => import('./pages/AIManagement'));
const TelephonyPage    = lazy(() => import('./pages/Telephony'));
const BillingPage      = lazy(() => import('./pages/Billing'));
const AnalyticsPage    = lazy(() => import('./pages/Analytics'));
const DomainsPage      = lazy(() => import('./pages/Domains'));
const Settings         = lazy(() => import('./pages/Settings'));

const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
    <CircularProgress sx={{ color: '#6366F1' }} />
  </Box>
);

/**
 * Mount in your root router:
 * <Route path="/superadmin/*" element={<SuperAdminRoutes />} />
 */
const SuperAdminRoutes: React.FC = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route element={<SuperAdminLayout />}>
        <Route index                   element={<DashboardPage />} />
        <Route path="tenants"          element={<TenantsPage />} />
        <Route path="tenants/:id"      element={<TenantDetailPage />} />
        <Route path="plans"            element={<PlansPage />} />
        <Route path="ai-agents"        element={<AIAgentsPage />} />
        <Route path="telephony"        element={<TelephonyPage />} />
        <Route path="billing"          element={<BillingPage />} />
        <Route path="analytics"        element={<AnalyticsPage />} />
        <Route path="domains"          element={<DomainsPage />} />
        <Route path="settings"         element={<Settings />} />
      </Route>
    </Routes>
  </Suspense>
);

export default SuperAdminRoutes;