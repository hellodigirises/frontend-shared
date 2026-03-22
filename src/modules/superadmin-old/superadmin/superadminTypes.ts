// ─── Design Tokens ────────────────────────────────────────────────────────────
export const SA_FONT = "'Clash Display', 'Outfit', sans-serif";
export const SA_BODY = "'Cabinet Grotesk', 'DM Sans', sans-serif";
export const BRAND   = '#00d4aa';
export const BRAND2  = '#6366f1';
export const DANGER  = '#ef4444';
export const WARN    = '#f59e0b';

// ─── Types ────────────────────────────────────────────────────────────────────
export type TenantStatus = 'Active' | 'Suspended' | 'Trial' | 'Cancelled';
export type PlanType = 'Starter' | 'Professional' | 'Enterprise' | 'Custom';

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  status: TenantStatus;
  plan: PlanType;
  mrr: number;
  arr: number;
  usersUsed: number;
  usersLimit: number;
  storageUsed: number;
  storageLimit: number;
  aiCreditsUsed: number;
  aiCreditsLimit: number;
  callMinutes: number;
  callMinutesLimit: number;
  modules: string[];
  createdAt: string;
  lastActive?: string;
}

export interface Invoice {
  id: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  dueDate: string;
  paidDate?: string;
}

export interface Plan {
  id: string;
  name: PlanType;
  price: number;
  features: string[];
  limits: {
    users: number;
    storage: number;
    aiCredits: number;
    callMinutes: number;
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────
export const ALL_MODULES = [
  'CRM', 'Projects', 'Bookings', 'Channel Partners', 'HR', 'Reports', 'Marketing', 'Telephony', 'AI Agents'
];

export const STATUS_CFG: Record<TenantStatus, { color: string; bg: string; label: string }> = {
  Active:    { color: '#10b981', bg: '#ecfdf5', label: 'Active' },
  Suspended: { color: '#ef4444', bg: '#fef2f2', label: 'Suspended' },
  Trial:     { color: '#f59e0b', bg: '#fffbeb', label: 'Trial' },
  Cancelled: { color: '#6b7280', bg: '#f3f4f6', label: 'Cancelled' },
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
export const MOCK_TENANTS: Tenant[] = [
  {
    id: 'T1', name: 'Modern Realty', domain: 'modern-realty', status: 'Active', plan: 'Enterprise',
    mrr: 25000, arr: 300000, usersUsed: 45, usersLimit: 50, storageUsed: 85, storageLimit: 100,
    aiCreditsUsed: 8500, aiCreditsLimit: 10000, callMinutes: 4200, callMinutesLimit: 5000,
    modules: ['CRM', 'Projects', 'Bookings', 'Channel Partners', 'HR', 'Reports', 'Marketing', 'Telephony', 'AI Agents'],
    createdAt: '2024-01-15', lastActive: '2024-03-14'
  },
  {
    id: 'T2', name: 'Elite Properties', domain: 'elite-properties', status: 'Active', plan: 'Professional',
    mrr: 15000, arr: 180000, usersUsed: 28, usersLimit: 30, storageUsed: 62, storageLimit: 75,
    aiCreditsUsed: 4200, aiCreditsLimit: 5000, callMinutes: 2800, callMinutesLimit: 3000,
    modules: ['CRM', 'Projects', 'Bookings', 'Channel Partners', 'Reports'],
    createdAt: '2024-02-01', lastActive: '2024-03-13'
  },
  {
    id: 'T3', name: 'Prime Estates', domain: 'prime-estates', status: 'Trial', plan: 'Professional',
    mrr: 0, arr: 0, usersUsed: 12, usersLimit: 30, storageUsed: 18, storageLimit: 75,
    aiCreditsUsed: 850, aiCreditsLimit: 5000, callMinutes: 420, callMinutesLimit: 3000,
    modules: ['CRM', 'Projects', 'Bookings'],
    createdAt: '2024-03-01', lastActive: '2024-03-14'
  },
  {
    id: 'T4', name: 'Urban Homes', domain: 'urban-homes', status: 'Active', plan: 'Starter',
    mrr: 8000, arr: 96000, usersUsed: 8, usersLimit: 10, storageUsed: 32, storageLimit: 50,
    aiCreditsUsed: 1200, aiCreditsLimit: 2000, callMinutes: 980, callMinutesLimit: 1500,
    modules: ['CRM', 'Projects', 'Bookings'],
    createdAt: '2024-01-20', lastActive: '2024-03-12'
  },
  {
    id: 'T5', name: 'Skyline Developers', domain: 'skyline-dev', status: 'Suspended', plan: 'Professional',
    mrr: 0, arr: 0, usersUsed: 22, usersLimit: 30, storageUsed: 48, storageLimit: 75,
    aiCreditsUsed: 3200, aiCreditsLimit: 5000, callMinutes: 1800, callMinutesLimit: 3000,
    modules: ['CRM', 'Projects', 'Bookings', 'Channel Partners'],
    createdAt: '2023-11-10', lastActive: '2024-02-28'
  },
];

export const MOCK_INVOICES: Invoice[] = [
  { id: 'INV-001', tenantId: 'T1', tenantName: 'Modern Realty', amount: 25000, status: 'Paid', dueDate: '2024-03-01', paidDate: '2024-02-28' },
  { id: 'INV-002', tenantId: 'T2', tenantName: 'Elite Properties', amount: 15000, status: 'Paid', dueDate: '2024-03-01', paidDate: '2024-03-01' },
  { id: 'INV-003', tenantId: 'T4', tenantName: 'Urban Homes', amount: 8000, status: 'Pending', dueDate: '2024-03-15' },
  { id: 'INV-004', tenantId: 'T5', tenantName: 'Skyline Developers', amount: 15000, status: 'Overdue', dueDate: '2024-02-15' },
];

export const MOCK_PLANS: Plan[] = [
  {
    id: 'P1', name: 'Starter', price: 8000,
    features: ['Up to 10 users', '50GB storage', '2K AI credits/mo', '1.5K call minutes/mo', 'Core modules'],
    limits: { users: 10, storage: 50, aiCredits: 2000, callMinutes: 1500 }
  },
  {
    id: 'P2', name: 'Professional', price: 15000,
    features: ['Up to 30 users', '75GB storage', '5K AI credits/mo', '3K call minutes/mo', 'All modules', 'Priority support'],
    limits: { users: 30, storage: 75, aiCredits: 5000, callMinutes: 3000 }
  },
  {
    id: 'P3', name: 'Enterprise', price: 25000,
    features: ['Up to 50 users', '100GB storage', '10K AI credits/mo', '5K call minutes/mo', 'All modules', 'Dedicated support', 'Custom integrations'],
    limits: { users: 50, storage: 100, aiCredits: 10000, callMinutes: 5000 }
  },
  {
    id: 'P4', name: 'Custom', price: 0,
    features: ['Unlimited users', 'Custom storage', 'Custom AI credits', 'Custom call minutes', 'All modules', 'White-label', 'SLA'],
    limits: { users: 999, storage: 999, aiCredits: 999999, callMinutes: 999999 }
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const fmtINR = (n: number) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(0)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
};

export const avatarBg = (s: string) => {
  const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#00d4aa'];
  return colors[(s?.charCodeAt(0) ?? 0) % colors.length];
};

export const initials = (s: string) => 
  (s ?? '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
