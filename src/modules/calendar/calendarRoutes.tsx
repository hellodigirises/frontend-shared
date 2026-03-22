import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';

const CalendarPage = lazy(() => import('./pages/CalendarPage'));

const Loading = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
    <CircularProgress />
  </Box>
);

const CalendarRoutes: React.FC = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<CalendarPage />} />
      </Routes>
    </Suspense>
  );
};

export default CalendarRoutes;
