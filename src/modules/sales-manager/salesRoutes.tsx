// src/modules/sales-manager/salesRoutes.tsx
/**
 * Drop into App router:
 *   import SalesRoutes from './modules/sales-manager/salesRoutes';
 *   <Route path="/manager/*" element={<SalesRoutes />} />
 */
import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import SalesManagerLayout from './layout/SalesManagerLayout';
import { S } from './hooks';

const SalesDashboardPage  = lazy(()=>import('./pages/SalesDashboardPage'));
const LeadAssignmentsPage = lazy(()=>import('./pages/LeadAssignmentsPage'));
const PipelinePage        = lazy(()=>import('./pages/PipelinePage'));
const DealsPage           = lazy(()=>import('./pages/DealsPage'));
const SiteVisitsPage      = lazy(()=>import('./pages/SiteVisitsPage'));
const SalesTargetsPage    = lazy(()=>import('./pages/SalesTargetsPage'));
const SalesForecastPage   = lazy(()=>import('./pages/SalesForecastPage'));
const TerritoriesPage     = lazy(()=>import('./pages/TerritoriesPage'));
const TeamManagementPage  = lazy(()=>import('./pages/TeamManagementPage'));
const LeaderboardPage     = lazy(()=>import('./pages/LeaderboardPage'));
const SalesReportsPage    = lazy(()=>import('./pages/SalesReportsPage'));
const ProfilePage         = lazy(()=>import('./pages/ProfilePage'));

const Spin = ()=>(
  <Box display="flex" alignItems="center" justifyContent="center" minHeight="60vh">
    <CircularProgress size={26} sx={{ color:S.primary }}/>
  </Box>
);

export default function SalesRoutes() {
  return (
    <Suspense fallback={<Spin/>}>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace/>}/>
        <Route path="dashboard"   element={<SalesDashboardPage/>}/>
        <Route path="leads"       element={<LeadAssignmentsPage/>}/>
        <Route path="pipeline"    element={<PipelinePage/>}/>
        <Route path="deals"       element={<DealsPage/>}/>
        <Route path="site-visits" element={<SiteVisitsPage/>}/>
        <Route path="targets"     element={<SalesTargetsPage/>}/>
        <Route path="forecast"    element={<SalesForecastPage/>}/>
        <Route path="territories" element={<TerritoriesPage/>}/>
        <Route path="team"        element={<TeamManagementPage/>}/>
        <Route path="leaderboard" element={<LeaderboardPage/>}/>
        <Route path="reports"     element={<SalesReportsPage/>}/>
        <Route path="profile"     element={<ProfilePage/>}/>
        <Route path="*"           element={<Navigate to="dashboard" replace/>}/>
      </Routes>
    </Suspense>
  );
}
