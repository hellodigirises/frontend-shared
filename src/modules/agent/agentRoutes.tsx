// src/modules/agent/agentRoutes.tsx
/**
 * Drop into App router:
 *   import AgentRoutes from './modules/agent/agentRoutes';
 *   <Route path="/agent/*" element={<AgentRoutes />} />
 */
import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import AgentLayout from './layout/AgentLayout';
import { A } from './hooks';

const AgentDashboardPage = lazy(() => import('./pages/AgentDashboardPage'));
const MyLeadsPage        = lazy(() => import('./pages/MyLeadsPage'));
const FollowUpsPage      = lazy(() => import('./pages/FollowUpsPage'));
const SiteVisitsPage     = lazy(() => import('./pages/SiteVisitsPage'));
const BookingsPage       = lazy(() => import('./pages/BookingsPage'));
const TasksPage          = lazy(() => import('./pages/TasksPage'));
const AttendancePage     = lazy(() => import('./pages/AttendancePage'));
const PerformancePage    = lazy(() => import('./pages/PerformancePage'));
const HeatmapPage        = lazy(() => import('./pages/HeatmapPage'));
const ProfilePage        = lazy(() => import('./pages/ProfilePage'));
const InventoryPage      = lazy(() => import('./pages/InventoryPage'));

const Spin = () => (
  <Box display="flex" alignItems="center" justifyContent="center" minHeight="60vh">
    <CircularProgress size={26} sx={{ color: A.primary }} />
  </Box>
);

export default function AgentRoutes() {
  return (
    <Suspense fallback={<Spin />}>
      <Routes>
        <Route index                element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"     element={<AgentDashboardPage />} />
        <Route path="leads"         element={<MyLeadsPage        />} />
        <Route path="followups"     element={<FollowUpsPage      />} />
        <Route path="visits"        element={<SiteVisitsPage     />} />
        <Route path="bookings"      element={<BookingsPage       />} />
        <Route path="tasks"         element={<TasksPage          />} />
        <Route path="attendance"    element={<AttendancePage     />} />
        <Route path="performance"   element={<PerformancePage    />} />
        <Route path="heatmap"       element={<HeatmapPage        />} />
        <Route path="inventory"     element={<InventoryPage      />} />
        <Route path="profile"       element={<ProfilePage        />} />
        <Route path="*"             element={<Navigate to="dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
