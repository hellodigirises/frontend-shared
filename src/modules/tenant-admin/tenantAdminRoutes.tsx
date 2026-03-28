import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import TenantAdminLayout from './layout/TenantAdminLayout';

// ── Existing pages ────────────────────────────────────────────────────────────
const DashboardPage       = lazy(() => import('./pages/Dashboard'));
const UsersPage           = lazy(() => import('./pages/User_management/UsersPage'));
const LeadsPage           = lazy(() => import('./pages/Lead_CRM/LeadsPage'));
const CustomersPage       = lazy(() => import('./pages/Customers/CustomersPage'));
const MarketingPage       = lazy(() => import('./pages/Marketing/MarketingPage'));
const ProjectsPage        = lazy(() => import('./pages/Projects/ProjectsPage'));
const UnitsPage           = lazy(() => import('./pages/Projects/UnitsPage'));
const BookingsPage        = lazy(() => import('./pages/Booking_engine/Bookingengine'));
const SiteVisitsPage      = lazy(() => import('./pages/Site_visits/SiteVisitsPage'));
const PartnersPage        = lazy(() => import('./pages/PartnersPage'));
const CommissionsPage     = lazy(() => import('./pages/Commisions_page/CommissionsPage'));
const PaymentsPage        = lazy(() => import('./pages/Payment_page/PaymentsPage'));
const TasksPage           = lazy(() => import('./pages/Task_management/TasksPage'));
const HRPage              = lazy(() => import('./pages/HR/HRPage'));
const TicketsPage         = lazy(() => import('./pages/tickets/TicketsPage'));
const ReportsPage         = lazy(() => import('./pages/Analytics/AnalyticsDashboardPage'));
const DocumentsPage       = lazy(() => import('./pages/Documents/DocumentsPage'));
const NotificationsPage   = lazy(() => import('./pages/Notification_Center/CommunicationHub'));
const AIInsightsPage      = lazy(() => import('./pages/Ai_Insight/AIInsightsDashboard'));
const StaffOnboardingPage = lazy(() => import('./pages/User_management/StaffOnboardingPage'));

// ── Settings pages (each is its own standalone page) ─────────────────────────
const SettingsLayout      = lazy(() => import('./pages/Settings/SettingsLayout'));
const CompanyProfilePage  = lazy(() => import('./pages/Settings/CompanyProfilePage'));
const BrandingPage        = lazy(() => import('./pages/Settings/BrandingPage'));
const DomainPage          = lazy(() => import('./pages/Settings/DomainPage'));
const EmailConfigPage     = lazy(() => import('./pages/Settings/EmailConfigPage'));
const ModulesPage         = lazy(() => import('./pages/Settings/ModulesPage'));
const CustomFieldsPage    = lazy(() => import('./pages/Settings/CustomFieldsPage'));
const WorkflowsPage       = lazy(() => import('./pages/Settings/WorkflowsPage'));
const SettingsNotificationsPage = lazy(() => import('./pages/Settings/NotificationsPage'));
const PaymentConfigPage   = lazy(() => import('./pages/Settings/PaymentConfigPage'));
const SecurityPage        = lazy(() => import('./pages/Settings/SecurityPage'));
const IntegrationsPage    = lazy(() => import('./pages/Settings/IntegrationsPage'));
const AuditLogPage        = lazy(() => import('./pages/Settings/AuditLogPage'));
const EmployeeProfilePage = lazy(() => import('./pages/User_management/EmployeeProfilePage'));
const EmployeeIdSettings  = lazy(() => import('./pages/Settings/EmployeeIdSettings'));

// ── Page loader ───────────────────────────────────────────────────────────────
const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
    <CircularProgress thickness={5} sx={{ color: '#6366f1' }} />
  </Box>
);

// ── Role check (read from localStorage or Redux — adjust to your auth setup) ──
const isSuperAdmin = localStorage.getItem('role') === 'TENANT_ADMIN';

const TenantAdminRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>

        {/* ── Main tenant admin layout (sidebar + topbar) ── */}
        <Route element={<TenantAdminLayout />}>

          {/* Default redirect */}
          <Route index element={<Navigate to="dashboard" replace />} />

          {/* ── Core pages ── */}
          <Route path="dashboard"    element={<DashboardPage />} />
          <Route path="users"        element={<UsersPage />} />

          {/* Staff onboarding — separate full page (replaces the Add Member dialog) */}
          <Route path="users/onboarding/new"      element={<StaffOnboardingPage />} />
          <Route path="users/onboarding/edit/:id" element={<StaffOnboardingPage />} />
          <Route path="users/:id/profile"         element={<EmployeeProfilePage />} />

          {/* CRM & Sales */}
          <Route path="leads/*"       element={<LeadsPage />} />
          <Route path="customers"    element={<CustomersPage />} />
          <Route path="marketing"    element={<MarketingPage />} />
          <Route path="projects"     element={<ProjectsPage />} />
          <Route path="units"        element={<UnitsPage />} />
          <Route path="bookings/*"   element={<BookingsPage />} />
          <Route path="visits"       element={<SiteVisitsPage />} />

          {/* Finance */}
          <Route path="partners"     element={<PartnersPage />} />
          <Route path="commissions"  element={<CommissionsPage />} />
          <Route path="payments"     element={<PaymentsPage />} />

          {/* Operations */}
          <Route path="tasks"        element={<TasksPage />} />
          <Route path="hr"           element={<HRPage />} />
          <Route path="tickets"      element={<TicketsPage />} />
          <Route path="reports"      element={<ReportsPage />} />
          <Route path="documents"    element={<DocumentsPage />} />
          <Route path="notifications"element={<NotificationsPage />} />
          <Route path="ai-insights"  element={<AIInsightsPage />} />

          {/* ── Settings — nested under their own SettingsLayout sidebar ── */}
          <Route path="settings" element={<SettingsLayout />}>
            <Route index                element={<Navigate to="company" replace />} />
            <Route path="company"       element={<CompanyProfilePage />} />
            <Route path="branding"      element={<BrandingPage />} />
            <Route path="domain"        element={<DomainPage />} />
            <Route path="email-config"  element={<EmailConfigPage />} />
            <Route path="modules"       element={<ModulesPage isSuperAdmin={isSuperAdmin} />} />
            <Route path="custom-fields" element={<CustomFieldsPage />} />
            <Route path="workflows"     element={<WorkflowsPage />} />
            <Route path="notifications" element={<SettingsNotificationsPage />} />
    
            <Route path="payment"       element={<PaymentConfigPage />} />
            <Route path="security"      element={<SecurityPage />} />
            <Route path="integrations"  element={<IntegrationsPage />} />
            <Route path="audit"         element={<AuditLogPage />} />
            <Route path="employee-id"   element={<EmployeeIdSettings />} />
           
          </Route>

          {/* Catch-all — redirect unknown paths back to dashboard */}
          <Route path="*" element={<Navigate to="dashboard" replace />} />

        </Route>
      </Routes>
    </Suspense>
  );
};

export default TenantAdminRoutes;