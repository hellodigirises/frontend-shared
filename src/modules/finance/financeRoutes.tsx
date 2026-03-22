// src/modules/finance/financeRoutes.tsx
/**
 * Drop into App router:
 *   import FinanceRoutes from './modules/finance/financeRoutes';
 *   <Route path="/finance/*" element={<FinanceRoutes />} />
 */
import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import FinanceLayout from './layout/FinanceLayout';
import { F } from './hooks';

const FinanceDashboardPage    = lazy(() => import('./pages/FinanceDashboardPage'));
const CollectionsPage         = lazy(() => import('./pages/CollectionsPage'));
const InstallmentsPage        = lazy(() => import('./pages/InstallmentsPage'));
const InvoicesPage            = lazy(() => import('./pages/InvoicesPage'));
const ReceiptsPage            = lazy(() => import('./pages/ReceiptsPage'));
const CommissionsPage         = lazy(() => import('./pages/CommissionsPage'));
const ExpensesPage            = lazy(() => import('./pages/ExpensesPage'));
const VendorPaymentsPage      = lazy(() => import('./pages/VendorPaymentsPage'));
const BankAccountsPage        = lazy(() => import('./pages/BankAccountsPage'));
const BankReconciliationPage  = lazy(() => import('./pages/BankReconciliationPage'));
const ReportsPage             = lazy(() => import('./pages/ReportsPage'));

const Spin = () => (
  <Box display="flex" alignItems="center" justifyContent="center" minHeight="60vh">
    <CircularProgress size={26} sx={{ color: F.primary }} />
  </Box>
);

export default function FinanceRoutes() {
  return (
    <Suspense fallback={<Spin />}>
      <Routes>
        <Route index                   element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"        element={<FinanceDashboardPage   />} />
        <Route path="collections"      element={<CollectionsPage        />} />
        <Route path="installments"     element={<InstallmentsPage       />} />
        <Route path="invoices"         element={<InvoicesPage           />} />
        <Route path="receipts"         element={<ReceiptsPage           />} />
        <Route path="commissions"      element={<CommissionsPage        />} />
        <Route path="expenses"         element={<ExpensesPage           />} />
        <Route path="vendor-payments"  element={<VendorPaymentsPage     />} />
        <Route path="bank-accounts"    element={<BankAccountsPage       />} />
        <Route path="reconciliation"   element={<BankReconciliationPage />} />
        <Route path="reports"          element={<ReportsPage            />} />
        <Route path="*"                element={<Navigate to="dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
