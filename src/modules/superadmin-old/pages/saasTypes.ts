// ─── Core Enums ──────────────────────────────────────────────────────────────

export type TenantStatus     = 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'PENDING';
export type PlanTier         = 'STARTER' | 'GROWTH' | 'ENTERPRISE' | 'CUSTOM';
export type BillingCycle     = 'MONTHLY' | 'YEARLY';
export type InvoiceStatus    = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type AddOnType        = 'RECURRING' | 'USAGE_BASED' | 'ONE_TIME';
export type PaymentStatus    = 'PENDING' | 'CAPTURED' | 'FAILED' | 'REFUNDED';
export type DomainStatus     = 'PENDING' | 'VERIFYING' | 'ACTIVE' | 'REJECTED';
export type OnboardingStep   = 'COMPANY' | 'BUSINESS' | 'PLAN' | 'DOMAIN' | 'REVIEW';

// ─── Onboarding ───────────────────────────────────────────────────────────────

export interface OnboardingFormData {
  // Company
  companyName: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  country: string;
  // Business
  industryType: string;
  companySize: string;
  expectedUsers: string;
  primaryBusinessType: string;
  // Plan
  selectedPlan: PlanTier;
  billingCycle: BillingCycle;
  // Domain
  subdomain: string;
  customDomain?: string;
  // Terms
  acceptedTerms: boolean;
}

// ─── Subscription / Billing ───────────────────────────────────────────────────

export interface SubscriptionPlan {
  id: string;
  tier: PlanTier;
  name: string;
  tagline: string;
  description: string;
  monthlyPrice: number;       // INR
  yearlyPrice: number;
  isPopular?: boolean;
  isCustom?: boolean;
  maxUsers: number | 'UNLIMITED';
  maxProjects: number | 'UNLIMITED';
  maxLeads: number | 'UNLIMITED';
  features: PlanFeature[];
  includedModules: string[];
  color: string;
  icon: string;
}

export interface PlanFeature {
  label: string;
  included: boolean;
  note?: string;
}

export interface AddOn {
  id: string;
  name: string;
  description: string;
  category: string;
  type: AddOnType;
  icon: string;
  monthlyPrice?: number;
  usageUnit?: string;         // 'credits', 'minutes', 'seats'
  usagePricePerUnit?: number;
  isActivated?: boolean;
  usageThisMonth?: number;
  isPopular?: boolean;
  tags?: string[];
}

export interface TenantSubscription {
  planId: string;
  planTier: PlanTier;
  planName: string;
  billingCycle: BillingCycle;
  monthlyPrice: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingDate: string;
  activeAddOns: string[];
  status: TenantStatus;
}

export interface Invoice {
  id: string;
  tenantId: string;
  tenantName: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  planName: string;
  addOns: { name: string; amount: number }[];
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  total: number;
  currency: string;
  billingPeriod: string;
  dueDate: string;
  paidAt?: string;
  razorpayOrderId?: string;
  createdAt: string;
}

// ─── SuperAdmin ───────────────────────────────────────────────────────────────

export interface Tenant {
  id: string;
  companyName: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  subdomain: string;
  customDomain?: string;
  domainStatus?: DomainStatus;
  status: TenantStatus;
  planTier: PlanTier;
  billingCycle: BillingCycle;
  monthlyRevenue: number;
  totalRevenue: number;
  usersCount: number;
  activeModules: string[];
  lastLoginAt?: string;
  trialEndsAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PlatformStats {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  suspendedTenants: number;
  mrr: number;               // Monthly Recurring Revenue
  arr: number;               // Annual Recurring Revenue
  mrrGrowth: number;         // % vs last month
  totalUsers: number;
  pendingDomains: number;
  openInvoices: number;
  recentSignups: number;     // last 30 days
  churnRate: number;
}

// ─── Config Maps ──────────────────────────────────────────────────────────────

export const TENANT_STATUS_CFG: Record<TenantStatus, {
  label: string; color: string; bg: string; icon: string;
}> = {
  TRIAL:     { label: 'Trial',     color: '#f59e0b', bg: '#fef3c7', icon: '⏰' },
  ACTIVE:    { label: 'Active',    color: '#10b981', bg: '#d1fae5', icon: '🟢' },
  SUSPENDED: { label: 'Suspended', color: '#ef4444', bg: '#fee2e2', icon: '⏸'  },
  CANCELLED: { label: 'Cancelled', color: '#9ca3af', bg: '#f3f4f6', icon: '🚫' },
  PENDING:   { label: 'Pending',   color: '#6366f1', bg: '#eef2ff', icon: '⏳' },
};

export const PLAN_CFG: Record<PlanTier, { color: string; bg: string; darkBg: string; glow: string }> = {
  STARTER:    { color: '#10b981', bg: '#d1fae5', darkBg: '#064e3b', glow: 'rgba(16,185,129,.3)'  },
  GROWTH:     { color: '#6366f1', bg: '#eef2ff', darkBg: '#312e81', glow: 'rgba(99,102,241,.3)'  },
  ENTERPRISE: { color: '#f59e0b', bg: '#fef3c7', darkBg: '#451a03', glow: 'rgba(245,158,11,.3)'  },
  CUSTOM:     { color: '#ec4899', bg: '#fce7f3', darkBg: '#500724', glow: 'rgba(236,72,153,.3)'  },
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter', tier: 'STARTER', name: 'Starter', tagline: 'Perfect for small builders',
    description: 'Everything you need to start managing leads and bookings',
    monthlyPrice: 4999, yearlyPrice: 49990, maxUsers: 10, maxProjects: 3, maxLeads: 500,
    color: '#10b981', icon: '🌱',
    includedModules: ['PROJECT_MANAGEMENT','LEAD_CRM','SITE_VISITS','BOOKING_SYSTEM','NOTIFICATION_CENTER'],
    features: [
      { label: '10 team members', included: true },
      { label: '3 projects', included: true },
      { label: '500 leads/month', included: true },
      { label: 'Lead CRM & Pipeline', included: true },
      { label: 'Site Visit Management', included: true },
      { label: 'Booking System', included: true },
      { label: 'Basic Analytics', included: true },
      { label: 'Email Support', included: true },
      { label: 'Payment Management', included: false },
      { label: 'Channel Partners', included: false },
      { label: 'AI Insights', included: false },
      { label: 'Custom Domain', included: false },
    ],
  },
  {
    id: 'growth', tier: 'GROWTH', name: 'Growth', tagline: 'For growing real estate teams',
    description: 'Advanced tools to scale your sales operations',
    monthlyPrice: 14999, yearlyPrice: 149990, isPopular: true, maxUsers: 25, maxProjects: 10, maxLeads: 2000,
    color: '#6366f1', icon: '🚀',
    includedModules: ['PROJECT_MANAGEMENT','LEAD_CRM','SITE_VISITS','BOOKING_SYSTEM','PAYMENT_MANAGEMENT','CHANNEL_PARTNER','DOCUMENT_MANAGEMENT','ANALYTICS_ENGINE','NOTIFICATION_CENTER'],
    features: [
      { label: '25 team members', included: true },
      { label: '10 projects', included: true },
      { label: '2,000 leads/month', included: true },
      { label: 'All Starter features', included: true },
      { label: 'Payment Management', included: true },
      { label: 'Channel Partner Portal', included: true },
      { label: 'Document Vault & KYC', included: true },
      { label: 'Advanced Analytics', included: true },
      { label: 'Custom Domain', included: true },
      { label: 'Priority Support', included: true },
      { label: 'AI Insights', included: false },
      { label: 'White-label', included: false },
    ],
  },
  {
    id: 'enterprise', tier: 'ENTERPRISE', name: 'Enterprise', tagline: 'For large builders & groups',
    description: 'Full platform access with AI, automation and white-labeling',
    monthlyPrice: 39999, yearlyPrice: 399990, maxUsers: 'UNLIMITED', maxProjects: 'UNLIMITED', maxLeads: 'UNLIMITED',
    color: '#f59e0b', icon: '🏆',
    includedModules: ['PROJECT_MANAGEMENT','LEAD_CRM','SITE_VISITS','BOOKING_SYSTEM','PAYMENT_MANAGEMENT','CHANNEL_PARTNER','HR_MODULE','DOCUMENT_MANAGEMENT','ANALYTICS_ENGINE','AI_INSIGHTS','NOTIFICATION_CENTER','MARKETING_AUTOMATION'],
    features: [
      { label: 'Unlimited users', included: true },
      { label: 'Unlimited projects', included: true },
      { label: 'Unlimited leads', included: true },
      { label: 'All Growth features', included: true },
      { label: 'AI Lead Scoring & Insights', included: true },
      { label: 'Marketing Automation', included: true },
      { label: 'HR Module', included: true },
      { label: 'White-label branding', included: true },
      { label: 'Dedicated account manager', included: true },
      { label: 'SLA guarantee', included: true },
      { label: 'Custom integrations', included: true },
      { label: '24/7 phone support', included: true },
    ],
  },
];

export const ADD_ONS: AddOn[] = [
  { id: 'ai-scoring',    name: 'AI Lead Scoring',        description: 'Dynamic lead scores + smart recommendations', category: 'AI Tools',          type: 'RECURRING',   icon: '🧠', monthlyPrice: 1999, isPopular: true },
  { id: 'ai-forecasting',name: 'Revenue Forecasting AI', description: 'ML-powered sales predictions',                category: 'AI Tools',          type: 'RECURRING',   icon: '🔮', monthlyPrice: 2999  },
  { id: 'whatsapp',      name: 'WhatsApp Automation',    description: 'Automated WhatsApp messaging',                category: 'Communication',     type: 'USAGE_BASED', icon: '💬', usagePricePerUnit: 0.25, usageUnit: 'messages', monthlyPrice: 999 },
  { id: 'telephony',     name: 'Telephony Integration',  description: 'Click-to-call + call recording',             category: 'Telephony',         type: 'USAGE_BASED', icon: '📞', usagePricePerUnit: 0.5, usageUnit: 'minutes',  monthlyPrice: 1499 },
  { id: 'extra-seats',   name: 'Extra User Seats',       description: 'Add more team members to your plan',         category: 'Platform',          type: 'RECURRING',   icon: '👥', monthlyPrice: 299, usageUnit: 'seat' },
  { id: 'adv-reports',   name: 'Advanced Reports',       description: 'Custom report builder + scheduled exports',   category: 'Analytics',         type: 'RECURRING',   icon: '📊', monthlyPrice: 1499 },
  { id: 'extra-storage', name: 'Extra Storage',          description: 'Additional document vault storage',           category: 'Platform',          type: 'RECURRING',   icon: '💾', monthlyPrice: 499, usageUnit: 'GB' },
  { id: 'premium-support',name:'Premium Support',        description: 'Dedicated CSM + priority SLA',                category: 'Support',           type: 'RECURRING',   icon: '🎯', monthlyPrice: 2499, isPopular: true },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const fmtINR = (n: number) => {
  if (n >= 10000000) return `₹${(n/10000000).toFixed(2)}Cr`;
  if (n >= 100000)   return `₹${(n/100000).toFixed(1)}L`;
  if (n >= 1000)     return `₹${(n/1000).toFixed(0)}K`;
  return `₹${n.toLocaleString('en-IN')}`;
};
export const fmtINRFull = (n: number) => `₹${n.toLocaleString('en-IN')}`;
export const fmtGrowth  = (n: number) => ({ label: `${n>=0?'+':''}${n.toFixed(1)}%`, color: n>=0?'#10b981':'#ef4444' });
export const timeAgo    = (s: string) => { const d = Date.now()-new Date(s).getTime(), m=Math.floor(d/60000); if(m<60) return `${m}m ago`; const h=Math.floor(m/60); if(h<24) return `${h}h ago`; return `${Math.floor(h/24)}d ago`; };
export const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
export const toSubdomain = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,30);
export const AVATAR_COLORS = ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#8b5cf6'];
export const avatarColor = (s='') => AVATAR_COLORS[s.charCodeAt(0)%AVATAR_COLORS.length];
export const initials    = (s='?') => s.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);