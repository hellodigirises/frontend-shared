// src/modules/superadmin/store/superadminSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api/superadmin.api';

// ── Domain types (match Prisma schema field names) ─────────────────────────────

export interface DashboardData {
  totalTenants    : number;
  activeTenants   : number;
  suspendedTenants: number;
  trialTenants    : number;
  monthlyRevenue  : number;
  yearlyRevenue   : number;
  aiUsage         : { sessions: number; minutes: number; revenue: number };
  telephonyUsage  : { minutes: number; revenue: number };
  charts: {
    tenantGrowth  : { month: string; count: number }[];
    revenueGrowth : { month: string; plan: number; addon: number; ai: number; telephony: number }[];
    moduleUsage   : { module: string; count: number }[];
  };
}

export interface Tenant {
  id: string; name: string; clientId: string; email: string;
  phone?: string; address?: string; logoUrl?: string; domain?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL' | 'CANCELLED';
  subscriptionPlan: string; billingCycle: string;
  maxUsers: number; trialEndsAt?: string; subscriptionEndsAt?: string;
  modules?: any;
  createdAt: string;
  // relations
  subscriptions?: {
    id: string; status: string; billingCycle: string;
    currentPeriodStart?: string; currentPeriodEnd?: string;
    plan: { name: string; price: number; slug: string; modules?: { module: string }[] };
  }[];
  domains?     : { id: string; domain: string; type: string; primary: boolean; verified: boolean; sslActive: boolean }[];
  tenantAddons?: { addon: { name: string; slug: string; type: string } }[];
  billingInvoices?: { id: string; invoiceNumber: string; status: string; totalAmount: number; dueDate: string; paidAt?: string }[];
  _count?      : { users: number; leads: number; bookings: number; billingInvoices: number };
}

export interface Plan {
  id: string; name: string; slug: string; description?: string;
  price: number; billingType: string; userLimit?: number;
  storageLimit?: number; active: boolean; sortOrder: number;
  modules: { id: string; module: string }[];
}

export interface Addon {
  id: string; name: string; slug: string; description?: string;
  type: string; price: number; billingType: string; active: boolean;
}

export interface AIAgent {
  id: string; name: string; slug: string; description?: string;
  type: string; costPerMin: number; tenantPrice: number; active: boolean;
}

export interface Invoice {
  id: string; invoiceNumber: string; status: string;
  amount: number; taxAmount: number; totalAmount: number;
  dueDate: string; paidAt?: string; createdAt: string;
  tenant?: { name: string; clientId: string; email: string };
  transactions?: { id: string; amount: number; method: string; status: string }[];
}

export interface AuditLogEntry {
  id: string; action: string; entity: string; entityId?: string;
  createdAt: string; ipAddress?: string;
  user?  : { name: string; email: string; role: string };
  tenant?: { name: string };
  oldValues?: object; newValues?: object;
}

export interface PlatformSetting {
  id: string; key: string; value: string; type: string;
  description?: string; group?: string;
}

// ── State ─────────────────────────────────────────────────────────────────────
interface SAState {
  dashboard  : DashboardData | null;
  tenants    : { data: Tenant[]; total: number };
  tenant     : Tenant | null;
  plans      : Plan[];
  addons     : Addon[];
  aiAgents   : AIAgent[];
  invoices   : { data: Invoice[]; total: number };
  auditLogs  : { data: AuditLogEntry[]; total: number };
  settings   : PlatformSetting[];
  loading    : Record<string, boolean>;
  error      : string | null;
}

const init: SAState = {
  dashboard : null,
  tenants   : { data: [], total: 0 },
  tenant    : null,
  plans     : [],
  addons    : [],
  aiAgents  : [],
  invoices  : { data: [], total: 0 },
  auditLogs : { data: [], total: 0 },
  settings  : [],
  loading   : {},
  error     : null,
};

// ── Thunk factory ─────────────────────────────────────────────────────────────
const th = <R, A = void>(name: string, fn: (arg: A) => Promise<R>) =>
  createAsyncThunk<R, A>(`sa/${name}`, fn);

// ── Thunks ────────────────────────────────────────────────────────────────────
export const fetchDashboard    = th('dashboard',    async () => (await api.get('/dashboard')).data.data);

export const fetchTenants      = th<{ data: Tenant[]; total: number }, Record<string, any>>(
  'tenants', async (p) => (await api.get('/tenants', { params: p })).data.data);

export const fetchTenant       = th<Tenant, string>(
  'tenant', async (id) => (await api.get(`/tenants/${id}`)).data.data);

export const doCreateTenant    = th<Tenant, any>(
  'createTenant', async (b) => (await api.post('/tenants', b)).data.data);

export const doUpdateTenant    = th<Tenant, any>(
  'updateTenant', async ({ id, ...b }) => (await api.put(`/tenants/${id}`, b)).data.data);

export const doSuspendTenant   = th<Tenant, string>(
  'suspend', async (id) => (await api.post(`/tenants/${id}/suspend`)).data.data);

export const doActivateTenant  = th<Tenant, string>(
  'activate', async (id) => (await api.post(`/tenants/${id}/activate`)).data.data);

export const doChangePlan      = th<any, { id: string; planId: string }>(
  'changePlan', async ({ id, planId }) => (await api.post(`/tenants/${id}/plan`, { planId })).data.data);

export const doAssignAddon     = th<any, { tenantId: string; addonId: string }>(
  'assignAddon', async ({ tenantId, addonId }) => (await api.post(`/tenants/${tenantId}/addons/${addonId}`)).data.data);

export const fetchPlans        = th<Plan[], void>(
  'plans', async () => (await api.get('/plans')).data.data);

export const doUpdateTenantModules = th<Tenant, { id: string; modules: any }>(
  'updateTenantModules', async ({ id, modules }) => (await api.patch(`/tenants/${id}/modules`, { modules })).data.data);

export const doCreatePlan      = th<Plan, any>(
  'createPlan', async (b) => (await api.post('/plans', b)).data.data);

export const doUpdatePlan      = th<Plan, any>(
  'updatePlan', async ({ id, ...b }) => (await api.put(`/plans/${id}`, b)).data.data);

export const doDeletePlan      = th<string, string>(
  'deletePlan', async (id) => { await api.delete(`/plans/${id}`); return id; });

export const fetchAddons       = th<Addon[], void>(
  'addons', async () => (await api.get('/addons')).data.data);

export const doCreateAddon     = th<Addon, any>(
  'createAddon', async (b) => (await api.post('/addons', b)).data.data);

export const doUpdateAddon     = th<Addon, any>(
  'updateAddon', async ({ id, ...b }) => (await api.put(`/addons/${id}`, b)).data.data);

export const fetchAIAgents     = th<AIAgent[], void>(
  'aiAgents', async () => (await api.get('/ai-agents')).data.data);

export const doCreateAIAgent   = th<AIAgent, any>(
  'createAIAgent', async (b) => (await api.post('/ai-agents', b)).data.data);

export const doUpdateAIAgent   = th<AIAgent, any>(
  'updateAIAgent', async ({ id, ...b }) => (await api.put(`/ai-agents/${id}`, b)).data.data);

export const fetchInvoices     = th<{ data: Invoice[]; total: number }, Record<string, any>>(
  'invoices', async (p) => (await api.get('/invoices', { params: p })).data.data);

export const doGenInvoice      = th<Invoice, any>(
  'genInvoice', async (b) => (await api.post('/invoices', b)).data.data);

export const doMarkPaid        = th<Invoice, string>(
  'markPaid', async (id) => (await api.post(`/invoices/${id}/paid`)).data.data);

export const fetchAuditLogs    = th<{ data: AuditLogEntry[]; total: number }, Record<string, any>>(
  'auditLogs', async (p) => (await api.get('/audit-logs', { params: p })).data.data);

export const fetchSettings     = th<PlatformSetting[], void>(
  'settings', async () => (await api.get('/settings')).data.data);

export const doSaveSetting     = th<PlatformSetting, any>(
  'saveSetting', async (b) => (await api.put('/settings', b)).data.data);

// ── Slice ─────────────────────────────────────────────────────────────────────

const patchTenant = (state: SAState, t: Tenant) => {
  const i = state.tenants.data.findIndex(x => x.id === t.id);
  if (i !== -1) state.tenants.data[i] = t;
  if (state.tenant?.id === t.id) state.tenant = t;
};

const superadminSlice = createSlice({
  name: 'superadmin',
  initialState: init,
  reducers: {
    clearError   : s => { s.error = null; },
    clearTenant  : s => { s.tenant = null; },
  },
  extraReducers: b => {
    const pend = (k: string) => (s: SAState) => { s.loading[k] = true; s.error = null; };
    const done = (k: string) => (s: SAState) => { s.loading[k] = false; };
    const fail = (k: string) => (s: SAState, a: any) => {
      s.loading[k] = false;
      s.error = a.error.message ?? 'Request failed';
    };

    b
      .addCase(fetchDashboard.pending,   pend('dashboard'))
      .addCase(fetchDashboard.fulfilled, (s, a) => { s.loading.dashboard = false; s.dashboard = a.payload as any; })
      .addCase(fetchDashboard.rejected,  fail('dashboard'))

      .addCase(fetchTenants.pending,   pend('tenants'))
      .addCase(fetchTenants.fulfilled, (s, a) => { s.loading.tenants = false; s.tenants = a.payload; })
      .addCase(fetchTenants.rejected,  fail('tenants'))

      .addCase(fetchTenant.fulfilled, (s, a) => { s.tenant = a.payload; })

      .addCase(doCreateTenant.fulfilled, (s, a) => {
        if (a.payload) { s.tenants.data.unshift(a.payload); s.tenants.total++; }
      })
      .addCase(doSuspendTenant.fulfilled,  (s, a) => { if (a.payload) patchTenant(s, a.payload); })
      .addCase(doActivateTenant.fulfilled, (s, a) => { if (a.payload) patchTenant(s, a.payload); })
      .addCase(doUpdateTenantModules.fulfilled, (s, a) => { if (a.payload) patchTenant(s, a.payload); })

      .addCase(fetchPlans.pending,   pend('plans'))
      .addCase(fetchPlans.fulfilled, (s, a) => { s.loading.plans = false; s.plans = a.payload; })
      .addCase(fetchPlans.rejected,  fail('plans'))
      .addCase(doCreatePlan.fulfilled, (s, a) => { if (a.payload) s.plans.push(a.payload); })
      .addCase(doUpdatePlan.fulfilled, (s, a) => {
        const p = a.payload; if (!p) return;
        const i = s.plans.findIndex(x => x.id === p.id);
        if (i !== -1) s.plans[i] = p;
      })
      .addCase(doDeletePlan.fulfilled, (s, a) => { s.plans = s.plans.filter(p => p.id !== a.payload); })

      .addCase(fetchAddons.pending,   pend('addons'))
      .addCase(fetchAddons.fulfilled, (s, a) => { s.loading.addons = false; s.addons = a.payload; })
      .addCase(fetchAddons.rejected,  fail('addons'))
      .addCase(doCreateAddon.fulfilled, (s, a) => { if (a.payload) s.addons.push(a.payload); })
      .addCase(doUpdateAddon.fulfilled, (s, a) => {
        const ad = a.payload; if (!ad) return;
        const i  = s.addons.findIndex(x => x.id === ad.id);
        if (i !== -1) s.addons[i] = ad;
      })

      .addCase(fetchAIAgents.pending,   pend('aiAgents'))
      .addCase(fetchAIAgents.fulfilled, (s, a) => { s.loading.aiAgents = false; s.aiAgents = a.payload; })
      .addCase(fetchAIAgents.rejected,  fail('aiAgents'))
      .addCase(doCreateAIAgent.fulfilled, (s, a) => { if (a.payload) s.aiAgents.push(a.payload); })
      .addCase(doUpdateAIAgent.fulfilled, (s, a) => {
        const ag = a.payload; if (!ag) return;
        const i  = s.aiAgents.findIndex(x => x.id === ag.id);
        if (i !== -1) s.aiAgents[i] = ag;
      })

      .addCase(fetchInvoices.pending,   pend('invoices'))
      .addCase(fetchInvoices.fulfilled, (s, a) => { s.loading.invoices = false; s.invoices = a.payload; })
      .addCase(fetchInvoices.rejected,  fail('invoices'))
      .addCase(doMarkPaid.fulfilled, (s, a) => {
        const inv = a.payload; if (!inv) return;
        const i   = s.invoices.data.findIndex(x => x.id === inv.id);
        if (i !== -1) s.invoices.data[i] = inv;
      })

      .addCase(fetchAuditLogs.fulfilled, (s, a) => { s.auditLogs = a.payload; })
      .addCase(fetchSettings.fulfilled,  (s, a) => { s.settings  = a.payload; })
      .addCase(doSaveSetting.fulfilled,  (s, a) => {
        const u = a.payload; if (!u) return;
        const i = s.settings.findIndex(x => x.key === u.key);
        if (i !== -1) s.settings[i] = u; else s.settings.push(u);
      });
  },
});

export const { clearError, clearTenant } = superadminSlice.actions;
export default superadminSlice.reducer;