export interface PageDefinition {
  id: string; // Machine identifier (e.g. 'FINANCE_BANK_ACCOUNTS')
  label: string;
  path: string;
}

export interface ModuleDefinition {
  id: string; // Module identifier (e.g. 'FINANCE')
  label: string;
  basePath: string;
  pages: PageDefinition[];
}

export const MODULE_REGISTRY: ModuleDefinition[] = [
  {
    id: 'FINANCE',
    label: 'Finance',
    basePath: '/finance',
    pages: [
      { id: 'FINANCE_DASHBOARD', label: 'Dashboard', path: '/finance/dashboard' },
      { id: 'FINANCE_COLLECTIONS', label: 'Collections', path: '/finance/collections' },
      { id: 'FINANCE_INSTALLMENTS', label: 'Installments', path: '/finance/installments' },
      { id: 'FINANCE_INVOICES', label: 'Invoices', path: '/finance/invoices' },
      { id: 'FINANCE_RECEIPTS', label: 'Receipts', path: '/finance/receipts' },
      { id: 'FINANCE_COMMISSIONS', label: 'Commissions', path: '/finance/commissions' },
      { id: 'FINANCE_EXPENSES', label: 'Expenses', path: '/finance/expenses' },
      { id: 'FINANCE_VENDOR_PAYMENTS', label: 'Vendor Payments', path: '/finance/vendor-payments' },
      { id: 'FINANCE_BANK_ACCOUNTS', label: 'Bank Accounts', path: '/finance/bank-accounts' },
      { id: 'FINANCE_RECONCILIATION', label: 'Bank Reconciliation', path: '/finance/reconciliation' },
      { id: 'FINANCE_REPORTS', label: 'Reports', path: '/finance/reports' },
    ],
  },
  {
    id: 'CRM',
    label: 'CRM',
    basePath: '/admin',
    pages: [
      { id: 'CRM_LEADS', label: 'Leads', path: '/admin/leads' },
      { id: 'CRM_UNITS', label: 'Units', path: '/admin/units' },
      { id: 'CRM_PARTNERS', label: 'Channel Partners', path: '/admin/partners' },
      { id: 'CRM_TASKS', label: 'Tasks', path: '/admin/tasks' },
    ],
  },
  {
    id: 'HR',
    label: 'Human Resources',
    basePath: '/hr',
    pages: [
      { id: 'HR_DASHBOARD', label: 'HR Dashboard', path: '/hr' },
      { id: 'HR_EMPLOYEES', label: 'Employees', path: '/hr/employees' },
      { id: 'HR_ATTENDANCE', label: 'Attendance', path: '/hr/attendance' },
      { id: 'HR_PAYROLL', label: 'Payroll', path: '/hr/payroll' },
    ],
  },
  {
    id: 'CONSTRUCTION',
    label: 'Construction',
    basePath: '/admin/projects',
    pages: [
      { id: 'CONST_PROJECTS', label: 'Projects', path: '/admin/projects' },
      { id: 'CONST_UNITS', label: 'Inventory (Units)', path: '/admin/units' },
    ],
  },
  {
    id: 'BOOKINGS',
    label: 'Bookings',
    basePath: '/admin/bookings',
    pages: [
      { id: 'BOOK_LIST', label: 'Bookings List', path: '/admin/bookings' },
      { id: 'BOOK_VISITS', label: 'Site Visits', path: '/admin/visits' },
    ],
  },
  {
    id: 'MARKETING',
    label: 'Marketing',
    basePath: '/admin/marketing',
    pages: [
      { id: 'MARK_DASHBOARD', label: 'Marketing Hub', path: '/admin/marketing' },
    ],
  },
  {
    id: 'DOCUMENTS',
    label: 'Documents',
    basePath: '/admin/documents',
    pages: [
      { id: 'DOCS_CENTER', label: 'Document Center', path: '/admin/documents' },
    ],
  },
  {
    id: 'AI_INSIGHTS',
    label: 'AI Insights',
    basePath: '/admin/ai-insights',
    pages: [
      { id: 'AI_DASHBOARD', label: 'AI Analytics', path: '/admin/ai-insights' },
    ],
  },
  {
    id: 'NOTIFICATIONS',
    label: 'Communication',
    basePath: '/admin/notifications',
    pages: [
      { id: 'COMM_HUB', label: 'Notification Center', path: '/admin/notifications' },
    ],
  },
  {
    id: 'AGENT',
    label: 'Agent Module',
    basePath: '/agent',
    pages: [
      { id: 'AGENT_DASHBOARD', label: 'Dashboard', path: '/agent/dashboard' },
      { id: 'AGENT_LEADS', label: 'My Leads', path: '/agent/leads' },
      { id: 'AGENT_FOLLOWUPS', label: 'Follow Ups', path: '/agent/followups' },
      { id: 'AGENT_VISITS', label: 'Site Visits', path: '/agent/visits' },
      { id: 'AGENT_BOOKINGS', label: 'My Bookings', path: '/agent/bookings' },
      { id: 'AGENT_TASKS', label: 'My Tasks', path: '/agent/tasks' },
      { id: 'AGENT_ATTENDANCE', label: 'Attendance', path: '/agent/attendance' },
      { id: 'AGENT_PERFORMANCE', label: 'Performance', path: '/agent/performance' },
      { id: 'AGENT_HEATMAP', label: 'Lead Heatmap', path: '/agent/heatmap' },
    ],
  },
  {
    id: 'SALES_MANAGER',
    label: 'Sales Manager',
    basePath: '/manager',
    pages: [
      { id: 'SALES_DASHBOARD', label: 'Sales Dashboard', path: '/manager/dashboard' },
      { id: 'SALES_LEADS', label: 'Lead Assignments', path: '/manager/leads' },
      { id: 'SALES_PIPELINE', label: 'Deals Pipeline', path: '/manager/pipeline' },
      { id: 'SALES_DEALS', label: 'Closed Deals', path: '/manager/deals' },
      { id: 'SALES_VISITS', label: 'Team Visits', path: '/manager/site-visits' },
      { id: 'SALES_TARGETS', label: 'Sales Targets', path: '/manager/targets' },
      { id: 'SALES_FORECAST', label: 'Sales Forecast', path: '/manager/forecast' },
      { id: 'SALES_TERRITORIES', label: 'Territories', path: '/manager/territories' },
      { id: 'SALES_TEAM', label: 'Team Management', path: '/manager/team' },
      { id: 'SALES_LEADERBOARD', label: 'Leaderboard', path: '/manager/leaderboard' },
      { id: 'SALES_REPORTS', label: 'Sales Reports', path: '/manager/reports' },
    ],
  },
];
