import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ManagerLayout from './layout/ManagerLayout';
import { Box, CircularProgress } from '@mui/material';

const LoadingPage = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '400px' }}>
    <CircularProgress />
  </Box>
);

const ManagerDashboard = lazy(() => import('./pages/ManagerDashboard'));
const AgentsPage = lazy(() => import('./pages/AgentsPage'));
const LeadsOverview = lazy(() => import('./pages/LeadsOverview'));
const PipelineOverview = lazy(() => import('./pages/PipelineOverview'));
const SiteVisitsPage = lazy(() => import('./pages/SiteVisitsPage'));
const BookingsPage = lazy(() => import('./pages/BookingsPage'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const TicketsPage = lazy(() => import('./pages/TicketsPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));

const ManagerRoutes: React.FC = () => (
  <Suspense fallback={<LoadingPage />}>
    <Routes>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<ManagerDashboard />} />
      <Route path="agents" element={<AgentsPage />} />
      <Route path="leads" element={<LeadsOverview />} />
      <Route path="pipeline" element={<PipelineOverview />} />
      <Route path="visits" element={<SiteVisitsPage />} />
      <Route path="bookings" element={<BookingsPage />} />
      <Route path="tasks" element={<TasksPage />} />
      <Route path="reports" element={<ReportsPage />} />
      <Route path="tickets" element={<TicketsPage />} />
      <Route path="notifications" element={<NotificationsPage />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  </Suspense>
);

export default ManagerRoutes;
