// src/modules/superadmin/superadminRoutes.tsx
/**
 * Drop this into your main App router:
 *
 *   import SuperAdminRoutes from './modules/superadmin/superadminRoutes';
 *   ...
 *   <Route path="/superadmin/*" element={<SuperAdminRoutes />} />
 */

import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import SuperAdminLayout from './components/SuperAdminLayout';
import { C } from './hooks';

// Lazy-loaded pages — zero impact on non-superadmin users
const DashboardPage    = lazy(() => import('./pages/DashboardPage'));
const TenantsPage      = lazy(() => import('./pages/TenantsPage'));
const TenantDetailPage = lazy(() => import('./pages/TenantDetailPage'));
const PlansPage        = lazy(() => import('./pages/PlansPage'));
const AddonsPage       = lazy(() => import('./pages/AddonsPage'));
const AIAgentsPage     = lazy(() => import('./pages/AIAgentsPage'));
const TelephonyPage    = lazy(() => import('./pages/TelephonyPage'));
const BillingPage      = lazy(() => import('./pages/BillingPage'));
const AnalyticsPage    = lazy(() => import('./pages/AnalyticsPage'));
const SettingsPage     = lazy(() => import('./pages/SettingsPage'));
const AuditLogsPage    = lazy(() => import('./pages/AuditLogsPage'));

function PageLoader() {
  return (
    <Box display="flex" alignItems="center" justifyContent="center" minHeight="60vh">
      <CircularProgress size={26} sx={{ color: C.primary }} />
    </Box>
  );
}

export default function SuperAdminRoutes() {
  return (
    <SuperAdminLayout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Default redirect */}
          <Route index element={<Navigate to="dashboard" replace />} />

          {/* Pages */}
          <Route path="dashboard"   element={<DashboardPage    />} />
          <Route path="tenants"     element={<TenantsPage      />} />
          <Route path="tenants/:id" element={<TenantDetailPage />} />
          <Route path="plans"       element={<PlansPage        />} />
          <Route path="addons"      element={<AddonsPage       />} />
          <Route path="ai-agents"   element={<AIAgentsPage     />} />
          <Route path="telephony"   element={<TelephonyPage    />} />
          <Route path="billing"     element={<BillingPage      />} />
          <Route path="analytics"   element={<AnalyticsPage    />} />
          <Route path="settings"    element={<SettingsPage     />} />
          <Route path="audit-logs"  element={<AuditLogsPage    />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </Suspense>
    </SuperAdminLayout>
  );
}