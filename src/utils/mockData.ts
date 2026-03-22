type RevenueOverview = any;
type AnalyticsData = any;
type Tenant = any;
type TenantDetail = any;
type Plan = any;
type AIAgent = any;
type TelephonyProvider = any;

// ─── Revenue Overview ──────────────────────────────────────────────────────────
export const mockRevenueOverview: RevenueOverview = {
  totalMRR: 284_750, totalARR: 3_417_000,
  mrrGrowth: 12.4, arrGrowth: 14.8,
  newMRR: 32_400, churnedMRR: 8_900,
  expansionMRR: 11_200, netRevenueRetention: 118,
  activeTenants: 342, newTenantsThisMonth: 28,
  churnedTenantsThisMonth: 7, trialTenants: 45,
  avgRevenuePerTenant: 832,
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const mockAnalyticsData: AnalyticsData = {
  revenueTrend: [
    { month: 'Jan', mrr: 210000, arr: 2520000, newMRR: 22000, churnMRR: 7000, expansionMRR: 8000 },
    { month: 'Feb', mrr: 220000, arr: 2640000, newMRR: 24000, churnMRR: 6500, expansionMRR: 9000 },
    { month: 'Mar', mrr: 233000, arr: 2796000, newMRR: 26000, churnMRR: 7200, expansionMRR: 9500 },
    { month: 'Apr', mrr: 245000, arr: 2940000, newMRR: 27000, churnMRR: 8000, expansionMRR: 10000 },
    { month: 'May', mrr: 258000, arr: 3096000, newMRR: 29000, churnMRR: 8500, expansionMRR: 10500 },
    { month: 'Jun', mrr: 272000, arr: 3264000, newMRR: 31000, churnMRR: 8700, expansionMRR: 11000 },
    { month: 'Jul', mrr: 284750, arr: 3417000, newMRR: 32400, churnMRR: 8900, expansionMRR: 11200 },
  ],
  revenueByPlan: [
    { plan: 'Enterprise', revenue: 142375, tenants: 68, percentage: 50 },
    { plan: 'Professional', revenue: 85425, tenants: 142, percentage: 30 },
    { plan: 'Starter', revenue: 42713, tenants: 98, percentage: 15 },
    { plan: 'Custom', revenue: 14238, tenants: 34, percentage: 5 },
  ],
  topTenants: [
    { id: '1', name: 'Acme Corp', mrr: 12500, plan: 'enterprise', growth: 18.4, seats: 250, status: 'active' },
    { id: '2', name: 'TechVenture Inc', mrr: 9800, plan: 'enterprise', growth: 12.1, seats: 180, status: 'active' },
    { id: '3', name: 'GlobalSoft Ltd', mrr: 8200, plan: 'enterprise', growth: 9.7, seats: 150, status: 'active' },
    { id: '4', name: 'InnovateCo', mrr: 6400, plan: 'professional', growth: 22.3, seats: 85, status: 'active' },
    { id: '5', name: 'DataDriven LLC', mrr: 5900, plan: 'professional', growth: -3.2, seats: 70, status: 'active' },
    { id: '6', name: 'CloudFirst Systems', mrr: 5200, plan: 'professional', growth: 7.8, seats: 65, status: 'active' },
    { id: '7', name: 'Nexus Analytics', mrr: 4800, plan: 'professional', growth: 14.5, seats: 58, status: 'trial' },
    { id: '8', name: 'Apex Solutions', mrr: 3400, plan: 'starter', growth: 31.0, seats: 35, status: 'active' },
  ],
  usageMetrics: [
    { date: 'Jan', apiCalls: 1200000, activeUsers: 8400, aiConversations: 45000, telephonyCalls: 12000 },
    { date: 'Feb', apiCalls: 1350000, activeUsers: 9100, aiConversations: 52000, telephonyCalls: 14000 },
    { date: 'Mar', apiCalls: 1480000, activeUsers: 10200, aiConversations: 58000, telephonyCalls: 16500 },
    { date: 'Apr', apiCalls: 1620000, activeUsers: 11400, aiConversations: 65000, telephonyCalls: 18200 },
    { date: 'May', apiCalls: 1750000, activeUsers: 12800, aiConversations: 72000, telephonyCalls: 20100 },
    { date: 'Jun', apiCalls: 1890000, activeUsers: 14200, aiConversations: 78000, telephonyCalls: 22400 },
    { date: 'Jul', apiCalls: 2050000, activeUsers: 15600, aiConversations: 85000, telephonyCalls: 24800 },
  ],
};

// ─── Tenants ──────────────────────────────────────────────────────────────────
const NAMES = ['Acme Corp', 'TechVenture Inc', 'GlobalSoft Ltd', 'InnovateCo', 'DataDriven LLC', 'CloudFirst Systems', 'Nexus Analytics', 'Apex Solutions', 'Vertex Labs', 'Prism AI'];
const STATUSES: Tenant['status'][] = ['active', 'active', 'active', 'trial', 'suspended', 'active', 'active', 'cancelled', 'active', 'active'];
const PLANS: Tenant['plan'][] = ['enterprise', 'professional', 'starter', 'professional', 'starter', 'enterprise', 'professional', 'starter', 'custom', 'professional'];
const MRRS = [12500, 4200, 1800, 3800, 1200, 9800, 4600, 950, 7200, 3200];
const SEATS = [250, 85, 30, 75, 25, 180, 90, 20, 140, 65];
const USED = [220, 72, 22, 68, 18, 156, 74, 14, 120, 52];
const COUNTRIES = ['US', 'UK', 'CA', 'AU', 'DE', 'FR', 'JP', 'SG', 'IN', 'BR'];
const INDUSTRIES = ['SaaS', 'Finance', 'Healthcare', 'Retail', 'Education', 'Manufacturing', 'Media', 'Legal', 'Real Estate', 'Logistics'];

export const mockTenants: Tenant[] = Array.from({ length: 50 }, (_, i) => ({
  id: `tenant-${i + 1}`,
  name: NAMES[i % 10] + (i >= 10 ? ` ${Math.floor(i / 10) + 1}` : ''),
  slug: `tenant-${i + 1}`,
  email: `admin@tenant${i + 1}.com`,
  status: STATUSES[i % 10],
  plan: PLANS[i % 10],
  mrr: MRRS[i % 10],
  seats: SEATS[i % 10],
  usedSeats: USED[i % 10],
  createdAt: new Date(2024, i % 12, (i % 28) + 1).toISOString(),
  renewalDate: new Date(2025, i % 12, (i % 28) + 1).toISOString(),
  country: COUNTRIES[i % 10],
  industry: INDUSTRIES[i % 10],
  aiAgentsEnabled: i % 3 !== 0,
  telephonyEnabled: i % 4 !== 0,
}));

// ─── Tenant Detail ────────────────────────────────────────────────────────────
export const mockTenantDetail: TenantDetail = {
  ...mockTenants[0],
  overview: {
    totalRevenue: 142500, activeUsers: 220, apiCalls: 2450000,
    storageUsedGB: 124, storageCapacityGB: 500,
    lastLogin: new Date().toISOString(), supportTickets: 3,
  },
  subscription: {
    planId: 'plan-enterprise', planName: 'enterprise',
    price: 12500, billingCycle: 'monthly',
    startDate: '2023-01-15', endDate: '2026-01-15',
    autoRenew: true, discount: 10,
    addOns: [
      { id: '1', name: 'Extra AI Agents', price: 500, enabled: true },
      { id: '2', name: 'Premium Support', price: 1000, enabled: true },
      { id: '3', name: 'Custom Domain', price: 200, enabled: false },
    ],
  },
  modules: [
    { id: 'm1', name: 'CRM', enabled: true, usageCount: 12400, lastUsed: new Date().toISOString() },
    { id: 'm2', name: 'Help Desk', enabled: true, usageCount: 8200, lastUsed: new Date().toISOString() },
    { id: 'm3', name: 'Analytics', enabled: true, usageCount: 5400, lastUsed: new Date().toISOString() },
    { id: 'm4', name: 'Marketing Automation', enabled: false, usageCount: 0, lastUsed: '' },
    { id: 'm5', name: 'E-Commerce', enabled: false, usageCount: 0, lastUsed: '' },
  ],
  aiAgents: [
    { id: 'a1', name: 'Sales Assistant', type: 'sales', status: 'active', conversationsToday: 142, totalConversations: 48000, avgResponseTime: 1.2, accuracy: 94.2, createdAt: '2024-01-10' },
    { id: 'a2', name: 'Support Bot', type: 'support', status: 'active', conversationsToday: 89, totalConversations: 32000, avgResponseTime: 0.8, accuracy: 97.1, createdAt: '2024-02-15' },
    { id: 'a3', name: 'Lead Qualifier', type: 'lead', status: 'training', conversationsToday: 0, totalConversations: 5200, avgResponseTime: 1.5, accuracy: 88.4, createdAt: '2024-06-01' },
  ],
  telephony: {
    provider: 'Twilio', phoneNumbers: ['+1-800-555-0100', '+1-800-555-0101'],
    minutesUsed: 4820, minutesLimit: 10000, callsToday: 48, totalCalls: 12400, status: 'active',
  },
  users: Array.from({ length: 10 }, (_, i) => ({
    id: `u${i}`,
    name: ['Alice Johnson', 'Bob Smith', 'Carol White', 'David Lee', 'Eva Martinez', 'Frank Brown', 'Grace Kim', 'Henry Davis', 'Iris Wilson', 'Jack Thompson'][i],
    email: `user${i + 1}@acme.com`,
    role: ['Admin', 'Manager', 'Agent', 'Analyst', 'Developer'][i % 5],
    status: (i < 8 ? 'active' : 'inactive') as 'active' | 'inactive',
    lastLogin: new Date(Date.now() - i * 86400000).toISOString(),
    createdAt: new Date(2024, i % 12, 1).toISOString(),
  })),
  billing: Array.from({ length: 8 }, (_, i) => ({
    id: `bill-${i}`,
    date: new Date(2025, 6 - i, 1).toISOString(),
    description: `Monthly subscription — ${['Enterprise', 'Enterprise', 'Professional'][i % 3]} Plan`,
    amount: [12500, 12500, 4200][i % 3],
    status: (i === 0 ? 'pending' : 'paid') as 'paid' | 'pending',
    invoiceUrl: `#invoice-${i}`,
  })),
  auditLogs: Array.from({ length: 15 }, (_, i) => ({
    id: `log-${i}`,
    action: ['User Login', 'Settings Updated', 'Agent Created', 'Subscription Changed', 'Module Enabled'][i % 5],
    actor: ['Alice Johnson', 'Bob Smith', 'System', 'Carol White'][i % 4],
    target: ['System', 'AI Agent', 'Subscription', 'Module Config'][i % 4],
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    ip: `192.168.1.${100 + i}`,
    details: 'Action completed successfully',
  })),
};

// ─── Plans ────────────────────────────────────────────────────────────────────
export const mockPlans: Plan[] = [
  {
    id: 'plan-starter', name: 'starter', displayName: 'Starter',
    price: 299, annualPrice: 2868, seats: 25,
    features: ['CRM Module', 'Help Desk', 'Basic Analytics', 'Email Support', '5GB Storage'],
    aiAgents: 2, telephonyMinutes: 500, storageGB: 5,
    tenantsCount: 98, mrr: 29302, color: '#10B981', popular: false,
  },
  {
    id: 'plan-professional', name: 'professional', displayName: 'Professional',
    price: 799, annualPrice: 7668, seats: 100,
    features: ['All Starter Features', 'Advanced Analytics', 'Marketing Automation', 'Priority Support', '50GB Storage', 'Custom Integrations'],
    aiAgents: 10, telephonyMinutes: 2000, storageGB: 50,
    tenantsCount: 142, mrr: 113358, color: '#6366F1', popular: true,
  },
  {
    id: 'plan-enterprise', name: 'enterprise', displayName: 'Enterprise',
    price: 2499, annualPrice: 23988, seats: 500,
    features: ['All Professional Features', 'Dedicated Success Manager', 'SLA 99.99%', 'Custom AI Training', '500GB Storage', 'On-Premise Option', 'SSO & SAML'],
    aiAgents: 50, telephonyMinutes: 10000, storageGB: 500,
    tenantsCount: 68, mrr: 169932, color: '#F59E0B', popular: false,
  },
  {
    id: 'plan-custom', name: 'custom', displayName: 'Custom',
    price: 0, annualPrice: 0, seats: -1,
    features: ['Fully Custom', 'Unlimited Everything', 'White-Label', 'Dedicated Infrastructure'],
    aiAgents: -1, telephonyMinutes: -1, storageGB: -1,
    tenantsCount: 34, mrr: 142000, color: '#EC4899', popular: false,
  },
];

// ─── AI Agents ────────────────────────────────────────────────────────────────
const AGENT_NAMES = ['Sales Assistant', 'Support Bot', 'Lead Qualifier', 'FAQ Agent', 'Onboarding Guide'];
const AGENT_TYPES = ['sales', 'support', 'lead', 'faq', 'onboarding'];
const AGENT_STATUS: AIAgent['status'][] = ['active', 'active', 'active', 'inactive', 'training'];
const TENANT_NAMES = ['Acme Corp', 'TechVenture Inc', 'GlobalSoft Ltd', 'InnovateCo', 'DataDriven LLC', 'CloudFirst Systems', 'Nexus Analytics', 'Apex Solutions', 'Vertex Labs', 'Prism AI'];

export const mockAIAgents: AIAgent[] = Array.from({ length: 20 }, (_, i) => ({
  id: `agent-${i + 1}`,
  name: AGENT_NAMES[i % 5] + ` ${Math.floor(i / 5) + 1}`,
  type: AGENT_TYPES[i % 5],
  status: AGENT_STATUS[i % 5],
  conversationsToday: Math.floor(Math.random() * 200),
  totalConversations: Math.floor(Math.random() * 50000) + 1000,
  avgResponseTime: parseFloat((Math.random() * 2 + 0.5).toFixed(1)),
  accuracy: parseFloat((85 + Math.random() * 14).toFixed(1)),
  tenantId: `tenant-${(i % 10) + 1}`,
  tenantName: TENANT_NAMES[i % 10],
  createdAt: new Date(2024, i % 12, 1).toISOString(),
}));

// ─── Telephony Providers ──────────────────────────────────────────────────────
export const mockTelephonyProviders: TelephonyProvider[] = [
  { id: 'twilio', name: 'Twilio', status: 'active', tenantsCount: 185, callsToday: 4280, minutesToday: 18400, successRate: 99.2 },
  { id: 'vonage', name: 'Vonage', status: 'active', tenantsCount: 98, callsToday: 2140, minutesToday: 9800, successRate: 98.7 },
  { id: 'bandwidth', name: 'Bandwidth', status: 'degraded', tenantsCount: 42, callsToday: 820, minutesToday: 3600, successRate: 94.1 },
  { id: 'plivo', name: 'Plivo', status: 'inactive', tenantsCount: 17, callsToday: 0, minutesToday: 0, successRate: 97.8 },
];