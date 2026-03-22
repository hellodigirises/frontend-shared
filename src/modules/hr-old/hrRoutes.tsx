import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HRLayout from './layout/HRLayout';
import DashboardPage from './pages/DashboardPage';
import EmployeesPage from './pages/EmployeesPage';
import AttendancePage from './pages/AttendancePage';
import LeavesPage from './pages/LeavesPage';
import PayrollPage from './pages/PayrollPage';
import ContractsPage from './pages/ContractsPage';
import DocumentsPage from './pages/DocumentsPage';
import TicketsPage from './pages/TicketsPage';
import ReportsPage from './pages/ReportsPage';

const HRRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<HRLayout><Outlet /></HRLayout>}>
        <Route index element={<DashboardPage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="leaves" element={<LeavesPage />} />
        <Route path="payroll" element={<PayrollPage />} />
        <Route path="contracts" element={<ContractsPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="tickets" element={<TicketsPage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>
    </Routes>
  );
};

import { Outlet } from 'react-router-dom';
export default HRRoutes;
