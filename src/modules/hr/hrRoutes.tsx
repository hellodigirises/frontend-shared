// src/modules/hr/hrRoutes.tsx
/**
 * HR Module Routes
 *
 * Drop into your main App router:
 *   import HRRoutes from './modules/hr/hrRoutes';
 *   <Route path="/hr/*" element={<HRRoutes />} />
 */
import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { H } from './hooks';

// Lazy-load all pages — zero cost for non-HR users
const HRDashboardPage    = lazy(() => import('./pages/HRDashboardPage'));
const EmployeesPage      = lazy(() => import('./pages/EmployeesPage'));
const StaffOnboardingPage = lazy(() => import('../tenant-admin/pages/User_management/StaffOnboardingPage'));
const EmployeeProfilePage = lazy(() => import('../tenant-admin/pages/User_management/EmployeeProfilePage'));
const AttendancePage     = lazy(() => import('./pages/AttendancePage'));
const LeaveRequestsPage  = lazy(() => import('./pages/LeaveRequestsPage'));
const PayrollPage        = lazy(() => import('./pages/PayrollPage'));
const PerformancePage    = lazy(() => import('./pages/PerformancePage'));
const DocumentsPage      = lazy(() => import('./pages/DocumentsPage'));
const TrainingPage       = lazy(() => import('./pages/TrainingPage'));
const AnnouncementsPage  = lazy(() => import('./pages/AnnouncementsPage'));

function Spinner() {
  return (
    <Box display="flex" alignItems="center" justifyContent="center" minHeight="60vh">
      <CircularProgress size={26} sx={{ color: H.primary }} />
    </Box>
  );
}

export default function HRRoutes() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"        element={<HRDashboardPage    />} />
        <Route path="employees"        element={<EmployeesPage      />} />
        <Route path="employees/onboarding/new" element={<StaffOnboardingPage />} />
        <Route path="employees/onboarding/edit/:id" element={<StaffOnboardingPage />} />
        <Route path="employees/:id/profile"    element={<EmployeeProfilePage />} />
        <Route path="attendance"       element={<AttendancePage     />} />
        <Route path="leaves"           element={<LeaveRequestsPage  />} />
        <Route path="payroll"          element={<PayrollPage        />} />
        <Route path="performance"      element={<PerformancePage    />} />
        <Route path="documents"        element={<DocumentsPage      />} />
        <Route path="training"         element={<TrainingPage       />} />
        <Route path="announcements"    element={<AnnouncementsPage  />} />
        <Route path="*"                element={<Navigate to="dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
