import {
  LayoutDashboard, Users, Building2, FileText, Wallet, Truck,
  Settings, BarChart3, Bell, Calendar, ClipboardList, Banknote,
  UserCheck, UserCog, Home, Map, ShoppingCart, Package,
  ChevronDown, Layers, Zap, Globe, CreditCard, Activity,
  HardHat, Wrench, Receipt, PiggyBank, Scale, BookOpen,
  MessageSquare, Target, Phone, Bot, Shield, Database
} from 'lucide-react';

export type NavItem = {
  label: string;
  path: string;
  icon: React.ElementType;
  children?: NavItem[];
  badge?: string;
};

export type RoleConfig = {
  role: string;
  label: string;
  color: string;
  accent: string;
  nav: NavItem[];
};

export const ROLE_CONFIGS: Record<string, RoleConfig> = {

  SUPERADMIN: {
    role: 'SUPERADMIN',
    label: 'Super Admin',
    color: '#0A0A0F',
    accent: '#6366F1',
    nav: [
      { label: 'Dashboard',          path: '/sa/dashboard',  icon: LayoutDashboard },
      { label: 'Tenants',            path: '/sa/tenants',    icon: Building2 },
      { label: 'Plans',              path: '/sa/plans',      icon: Layers },
      { label: 'Addons',             path: '/sa/addons',     icon: Zap },
      { label: 'AI Agents',          path: '/sa/ai-agents',  icon: Bot },
      { label: 'Telephony',          path: '/sa/telephony',  icon: Phone },
      { label: 'Billing',            path: '/sa/billing',    icon: CreditCard },
      { label: 'Usage & Analytics',  path: '/sa/usage',      icon: Activity },
      { label: 'Domains',            path: '/sa/domains',    icon: Globe },
      { label: 'Platform Settings',  path: '/sa/settings',   icon: Settings },
      { label: 'Audit Logs',         path: '/sa/audit',      icon: Shield },
    ],
  },

  TENANT_ADMIN: {
    role: 'TENANT_ADMIN',
    label: 'Tenant Admin',
    color: '#0D1117',
    accent: '#10B981',
    nav: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      {
        label: 'CRM', path: '/crm', icon: Users,
        children: [
          { label: 'Leads',      path: '/crm/leads',     icon: Target },
          { label: 'Pipeline',   path: '/crm/pipeline',  icon: Activity },
          { label: 'Follow Ups', path: '/crm/followups', icon: MessageSquare },
        ],
      },
      {
        label: 'Projects', path: '/inventory', icon: Building2,
        children: [
          { label: 'Projects', path: '/inventory/projects', icon: Building2 },
          { label: 'Towers',   path: '/inventory/towers',   icon: Layers },
          { label: 'Units',    path: '/inventory/units',    icon: Home },
        ],
      },
      { label: 'Bookings', path: '/bookings', icon: FileText },
      { label: 'Payments', path: '/finance/payments', icon: Banknote },
      { label: 'Channel Partners', path: '/partners', icon: UserCheck },
      {
        label: 'Construction', path: '/construction', icon: HardHat,
        children: [
          { label: 'Progress',    path: '/construction/progress',    icon: Activity },
          { label: 'Contractors', path: '/construction/contractors', icon: Wrench },
        ],
      },
      {
        label: 'Procurement', path: '/procurement', icon: Truck,
        children: [
          { label: 'Vendors',           path: '/procurement/vendors',   icon: Package },
          { label: 'Purchase Requests', path: '/procurement/requests',  icon: ClipboardList },
          { label: 'Purchase Orders',   path: '/procurement/orders',    icon: ShoppingCart },
        ],
      },
      {
        label: 'HR', path: '/hr', icon: UserCog,
        children: [
          { label: 'Employees',  path: '/hr/employees',  icon: Users },
          { label: 'Attendance', path: '/hr/attendance', icon: UserCheck },
          { label: 'Leave',      path: '/hr/leaves',     icon: Calendar },
        ],
      },
      {
        label: 'Finance', path: '/finance', icon: Wallet,
        children: [
          { label: 'Collections', path: '/finance/collections', icon: PiggyBank },
          { label: 'Expenses',    path: '/finance/expenses',    icon: Receipt },
          { label: 'Invoices',    path: '/finance/invoices',    icon: FileText },
        ],
      },
      { label: 'Reports',   path: '/reports',  icon: BarChart3 },
      { label: 'Settings',  path: '/settings', icon: Settings },
    ],
  },

  SALES_MANAGER: {
    role: 'SALES_MANAGER',
    label: 'Sales Manager',
    color: '#0C0F1A',
    accent: '#F59E0B',
    nav: [
      { label: 'Dashboard',   path: '/dashboard',      icon: LayoutDashboard },
      { label: 'Leads',       path: '/crm/leads',      icon: Target },
      { label: 'Pipeline',    path: '/crm/pipeline',   icon: Activity },
      { label: 'Site Visits', path: '/crm/visits',     icon: Map },
      { label: 'Bookings',    path: '/bookings',        icon: FileText },
      { label: 'Agents',      path: '/team/agents',    icon: Users },
      { label: 'Inventory',   path: '/inventory/units', icon: Building2 },
      { label: 'Calendar',    path: '/calendar',       icon: Calendar },
      { label: 'Reports',     path: '/reports',         icon: BarChart3 },
    ],
  },

  AGENT: {
    role: 'AGENT',
    label: 'Sales Agent',
    color: '#080D18',
    accent: '#3B82F6',
    nav: [
      { label: 'Dashboard',    path: '/dashboard',       icon: LayoutDashboard },
      { label: 'My Leads',     path: '/crm/leads',       icon: Target },
      { label: 'Follow Ups',   path: '/crm/followups',   icon: MessageSquare },
      { label: 'Site Visits',  path: '/crm/visits',      icon: Map },
      { label: 'Inventory',    path: '/inventory/units', icon: Building2 },
      { label: 'Bookings',     path: '/bookings',         icon: FileText },
      { label: 'Tasks',        path: '/tasks',           icon: ClipboardList },
      { label: 'Notifications', path: '/notifications',  icon: Bell, badge: '3' },
    ],
  },

  HR: {
    role: 'HR',
    label: 'HR Manager',
    color: '#0A0F15',
    accent: '#8B5CF6',
    nav: [
      { label: 'Dashboard',     path: '/dashboard',      icon: LayoutDashboard },
      { label: 'Employees',     path: '/hr/employees',   icon: Users },
      { label: 'Attendance',    path: '/hr/attendance',  icon: UserCheck },
      { label: 'Leave Requests', path: '/hr/leaves',     icon: Calendar },
      { label: 'Payroll',       path: '/hr/payroll',     icon: Banknote },
      { label: 'Performance',   path: '/hr/performance', icon: BarChart3 },
      { label: 'Announcements', path: '/hr/announcements', icon: Bell },
    ],
  },

  FINANCE: {
    role: 'FINANCE',
    label: 'Finance',
    color: '#060E0A',
    accent: '#22C55E',
    nav: [
      { label: 'Dashboard',          path: '/dashboard',               icon: LayoutDashboard },
      { label: 'Collections',        path: '/finance/collections',     icon: PiggyBank },
      { label: 'Installments',       path: '/bookings',                icon: Database },
      { label: 'Invoices',           path: '/finance/invoices',        icon: FileText },
      { label: 'Commissions',        path: '/finance/commissions',     icon: Banknote },
      { label: 'Expenses',           path: '/finance/expenses',        icon: Receipt },
      { label: 'Vendor Payments',    path: '/procurement/invoices',    icon: Truck },
      { label: 'Bank Reconciliation', path: '/finance/reconciliation', icon: Scale },
      { label: 'Reports',            path: '/reports',                 icon: BarChart3 },
    ],
  },

  PROCUREMENT: {
    role: 'PROCUREMENT',
    label: 'Procurement',
    color: '#0E0A06',
    accent: '#F97316',
    nav: [
      { label: 'Dashboard',       path: '/dashboard',              icon: LayoutDashboard },
      { label: 'Vendors',         path: '/procurement/vendors',    icon: Package },
      { label: 'Materials',       path: '/procurement/materials',  icon: Database },
      { label: 'Purchase Requests', path: '/procurement/requests', icon: ClipboardList },
      { label: 'Purchase Orders', path: '/procurement/orders',     icon: ShoppingCart },
      { label: 'Goods Receipt',   path: '/procurement/receipts',   icon: BookOpen },
      { label: 'Vendor Invoices', path: '/procurement/invoices',   icon: Receipt },
      { label: 'Reports',         path: '/reports',                icon: BarChart3 },
    ],
  },
};
