import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../redux/store';
import api from '../../api/axios';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type TenantStatus = 'active' | 'suspended' | 'trial' | 'cancelled';
export type PlanType = 'starter' | 'professional' | 'enterprise' | 'custom';

export interface Tenant {
    id: string;
    name: string;
    slug: string;
    email: string;
    status: TenantStatus;
    plan: PlanType;
    mrr: number;
    seats: number;
    usedSeats: number;
    createdAt: string;
    renewalDate: string;
    country: string;
    industry: string;
    aiAgentsEnabled: boolean;
    telephonyEnabled: boolean;
    logo?: string;
}

export interface TenantOverview {
    totalRevenue: number;
    activeUsers: number;
    apiCalls: number;
    storageUsedGB: number;
    storageCapacityGB: number;
    lastLogin: string;
    supportTickets: number;
}

export interface TenantSubscription {
    planId: string;
    planName: PlanType;
    price: number;
    billingCycle: 'monthly' | 'annual';
    startDate: string;
    endDate: string;
    autoRenew: boolean;
    addOns: SubscriptionAddOn[];
    discount: number;
}

export interface SubscriptionAddOn {
    id: string;
    name: string;
    price: number;
    enabled: boolean;
}

export interface TenantModule {
    id: string;
    name: string;
    enabled: boolean;
    usageCount: number;
    lastUsed: string;
}

export interface AIAgent {
    id: string;
    name: string;
    type: string;
    status: 'active' | 'inactive' | 'training';
    conversationsToday: number;
    totalConversations: number;
    avgResponseTime: number;
    accuracy: number;
    tenantId?: string;
    tenantName?: string;
    createdAt: string;
}

export interface TelephonyConfig {
    provider: string;
    phoneNumbers: string[];
    minutesUsed: number;
    minutesLimit: number;
    callsToday: number;
    totalCalls: number;
    status: 'active' | 'inactive';
}

export interface TelephonyProvider {
    id: string;
    name: string;
    status: 'active' | 'inactive' | 'degraded';
    tenantsCount: number;
    callsToday: number;
    minutesToday: number;
    successRate: number;
}

export interface TenantUser {
    id: string;
    name: string;
    email: string;
    role: string;
    status: 'active' | 'inactive' | 'pending';
    lastLogin: string;
    createdAt: string;
}

export interface BillingRecord {
    id: string;
    date: string;
    description: string;
    amount: number;
    status: 'paid' | 'pending' | 'failed' | 'refunded';
    invoiceUrl?: string;
}

export interface BillingStatement {
    id: string;
    period: string;
    tenants: number;
    revenue: number;
    status: string;
}

export interface AuditLog {
    id: string;
    action: string;
    actor: string;
    target: string;
    timestamp: string;
    ip: string;
    details?: string;
}

export interface TenantDetail extends Tenant {
    overview: TenantOverview;
    subscription: TenantSubscription;
    modules: TenantModule[];
    aiAgents: AIAgent[];
    telephony: TelephonyConfig;
    users: TenantUser[];
    billing: BillingRecord[];
    auditLogs: AuditLog[];
}

export interface Plan {
    id: string;
    name: PlanType;
    displayName: string;
    price: number;
    annualPrice: number;
    seats: number;
    features: string[];
    aiAgents: number;
    telephonyMinutes: number;
    storageGB: number;
    tenantsCount: number;
    mrr: number;
    color: string;
    popular: boolean;
}

export interface RevenueOverview {
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    totalInvoices: number;
    profitMargin: string;
}

export interface RevenueTrend {
    month: string;
    mrr: number;
    arr: number;
    newMRR: number;
    churnMRR: number;
    expansionMRR: number;
}

export interface RevenueByPlan {
    plan: string;
    revenue: number;
    tenants: number;
    percentage: number;
}

export interface TopTenant {
    id: string;
    name: string;
    mrr: number;
    plan: PlanType;
    growth: number;
    seats: number;
    status: TenantStatus;
}

export interface UsageMetric {
    date: string;
    apiCalls: number;
    activeUsers: number;
    aiConversations: number;
    telephonyCalls: number;
}

export interface AnalyticsData {
    revenueTrend: RevenueTrend[];
    revenueByPlan: RevenueByPlan[];
    topTenants: TopTenant[];
    usageMetrics: UsageMetric[];
}

export interface TenantFilters {
    search: string;
    status: TenantStatus | 'all';
    plan: PlanType | 'all';
    country: string;
    dateRange: { from: string; to: string } | null;
}

export interface PaginationState {
    page: number;
    pageSize: number;
    total: number;
}

export interface SuperAdminState {
    revenueOverview: RevenueOverview | null;
    analyticsData: AnalyticsData | null;
    tenants: Tenant[];
    tenantDetail: TenantDetail | null;
    plans: Plan[];
    aiAgents: AIAgent[];
    telephonyProviders: TelephonyProvider[];
    billingStatements: BillingStatement[];
    loading: {
        revenueOverview: boolean;
        tenants: boolean;
        tenantDetail: boolean;
        analytics: boolean;
        plans: boolean;
        aiAgents: boolean;
        telephony: boolean;
        billing: boolean;
    };
    errors: {
        revenueOverview: string | null;
        tenants: string | null;
        tenantDetail: string | null;
        analytics: string | null;
        plans: string | null;
        aiAgents: string | null;
        telephony: string | null;
    };
    filters: TenantFilters;
    pagination: PaginationState;
}

// ─── Async Thunks ──────────────────────────────────────────────────────────────
export const fetchRevenueOverview = createAsyncThunk<RevenueOverview>(
    'superadmin/fetchRevenueOverview',
    async () => {
        const res = await api.get('/superadmin/analytics/overview');
        return res.data;
    }
);

export const fetchAnalytics = createAsyncThunk<AnalyticsData>(
    'superadmin/fetchAnalytics',
    async () => {
        const [trendRes, planRes, topRes] = await Promise.all([
            api.get('/superadmin/analytics/trend'),
            api.get('/superadmin/analytics/by-plan'),
            api.get('/superadmin/analytics/top-tenants')
        ]);

        // Transform trend data to match frontend expectation (month instead of period)
        const revenueTrend = trendRes.data.map((t: any) => ({
            month: t.period,
            mrr: Number(t.revenue),
            arr: Number(t.revenue) * 12,
            newMRR: 0,
            churnMRR: 0,
            expansionMRR: 0
        }));

        return {
            revenueTrend,
            revenueByPlan: planRes.data.map((p: any) => ({
                plan: p.plan,
                revenue: Number(p.revenue),
                tenants: 0,
                percentage: 0
            })),
            topTenants: topRes.data.map((t: any) => ({
                id: Math.random().toString(),
                name: t.tenantName,
                mrr: Number(t.revenue),
                plan: t.plan.toLowerCase() as PlanType,
                growth: 0,
                seats: 0,
                status: 'active'
            })),
            usageMetrics: []
        };
    }
);

export const fetchTenants = createAsyncThunk<
    { tenants: Tenant[]; total: number },
    { page?: number; pageSize?: number; filters?: Partial<TenantFilters> }
>(
    'superadmin/fetchTenants',
    async ({ page = 1, pageSize = 10, filters = {} }) => {
        const params: any = { page, limit: pageSize };
        if (filters.search) params.search = filters.search;
        if (filters.status && filters.status !== 'all') params.status = filters.status;

        const res = await api.get('/superadmin/tenants', { params });

        return {
            tenants: res.data.tenants.map((t: any) => ({
                id: t.id,
                name: t.name,
                slug: t.clientId,
                email: '',
                status: t.lifecycle.toLowerCase(),
                plan: t.plan.toLowerCase(),
                mrr: Number(t.latestInvoice.amount),
                seats: t.userCount,
                usedSeats: t.userCount,
                createdAt: t.latestInvoice.date,
                renewalDate: '',
                country: '',
                industry: '',
                aiAgentsEnabled: false,
                telephonyEnabled: false
            })),
            total: res.data.pagination.total
        };
    }
);

export const fetchTenantDetail = createAsyncThunk<TenantDetail, string>(
    'superadmin/fetchTenantDetail',
    async (id) => {
        const res = await api.get(`/superadmin/tenants/${id}`);
        const t = res.data;

        return {
            id: t.id,
            name: t.name,
            slug: t.clientId,
            email: '',
            status: t.lifecycle.toLowerCase(),
            plan: (t.subscriptions[0]?.plan.name || 'starter').toLowerCase(),
            mrr: Number(t.lifetimeStats.revenue),
            seats: t.userCount,
            usedSeats: t.userCount,
            createdAt: t.createdAt,
            renewalDate: t.subscriptions[0]?.endDate || '',
            country: '',
            industry: '',
            aiAgentsEnabled: false,
            telephonyEnabled: false,
            overview: {
                totalRevenue: Number(t.lifetimeStats.revenue),
                activeUsers: t.userCount,
                apiCalls: 0,
                storageUsedGB: 0,
                storageCapacityGB: 0,
                lastLogin: '',
                supportTickets: 0
            },
            subscription: {
                planId: t.subscriptions[0]?.planId || '',
                planName: (t.subscriptions[0]?.plan.name || 'starter').toLowerCase() as PlanType,
                price: Number(t.subscriptions[0]?.plan.price || 0),
                billingCycle: (t.subscriptions[0]?.billingCycle || 'MONTHLY').toLowerCase() as any,
                startDate: t.subscriptions[0]?.startDate || '',
                endDate: t.subscriptions[0]?.endDate || '',
                autoRenew: true,
                addOns: [],
                discount: 0
            },
            modules: t.tenantModules.map((m: any) => ({
                id: m.id,
                name: m.moduleKey,
                enabled: m.isEnabled,
                usageCount: 0,
                lastUsed: ''
            })),
            aiAgents: [],
            telephony: {
                provider: '',
                phoneNumbers: [],
                minutesUsed: 0,
                minutesLimit: 0,
                callsToday: 0,
                totalCalls: 0,
                status: 'active'
            },
            users: [],
            billing: t.invoices.map((inv: any) => ({
                id: inv.id,
                date: inv.createdAt,
                description: `Billing for ${inv.billingMonth}/${inv.billingYear}`,
                amount: Number(inv.totalAmount),
                status: 'paid'
            })),
            auditLogs: []
        } as TenantDetail;
    }
);

export const fetchPlans = createAsyncThunk<Plan[]>(
    'superadmin/fetchPlans',
    async () => {
        const res = await api.get('/superadmin/plans');
        return res.data.map((p: any) => ({
            id: p.id,
            name: p.name.toLowerCase(),
            displayName: p.name,
            price: Number(p.monthlyPrice),
            annualPrice: Number(p.yearlyPrice),
            seats: p.userLimit,
            features: p.defaultModules || ["Core CRM", "Lead Management"],
            aiAgents: p.name === 'ENTERPRISE' ? -1 : 5,
            telephonyMinutes: p.name === 'ENTERPRISE' ? -1 : 1000,
            storageGB: p.name === 'ENTERPRISE' ? -1 : 50,
            tenantsCount: p._count?.subscriptions || 0,
            mrr: p._count?.subscriptions * Number(p.monthlyPrice) || 0,
            color: p.name === 'ENTERPRISE' ? '#6366F1' : p.name === 'GROWTH' ? '#10B981' : '#64748B',
            popular: p.name === 'GROWTH'
        }));
    }
);

export const fetchAIAgents = createAsyncThunk<AIAgent[]>(
    'superadmin/fetchAIAgents',
    async () => {
        const res = await api.get('/superadmin/ai-agents');
        // Data already transformed in backend management.service.ts
        return res.data;
    }
);

export const fetchTelephonyProviders = createAsyncThunk<TelephonyProvider[]>(
    'superadmin/fetchTelephonyProviders',
    async () => {
        const res = await api.get('/superadmin/telephony/providers');
        return res.data;
    }
);

export const fetchBillingStatements = createAsyncThunk<BillingStatement[]>(
    'superadmin/fetchBillingStatements',
    async () => {
        // We'll use the analytics trend for now as a source for statements
        const res = await api.get('/superadmin/analytics/trend');
        return res.data.map((t: any) => ({
            id: `STMT-${t.period.replace('-', '')}`,
            period: t.period,
            tenants: 0, // In a real app, we'd fetch this from the backend
            revenue: Number(t.revenue),
            status: 'finalized'
        }));
    }
);

// ─── Initial State ─────────────────────────────────────────────────────────────
const initialState: SuperAdminState = {
    revenueOverview: null,
    analyticsData: null,
    tenants: [],
    tenantDetail: null,
    plans: [],
    aiAgents: [],
    telephonyProviders: [],
    billingStatements: [],
    loading: {
        revenueOverview: false, tenants: false, tenantDetail: false,
        analytics: false, plans: false, aiAgents: false, telephony: false,
        billing: false,
    },
    errors: {
        revenueOverview: null, tenants: null, tenantDetail: null,
        analytics: null, plans: null, aiAgents: null, telephony: null,
    },
    filters: { search: '', status: 'all', plan: 'all', country: '', dateRange: null },
    pagination: { page: 1, pageSize: 10, total: 0 },
};

// ─── Slice ─────────────────────────────────────────────────────────────────────
const superadminSlice = createSlice({
    name: 'superadmin',
    initialState,
    reducers: {
        setFilters(state, action: PayloadAction<Partial<TenantFilters>>) {
            state.filters = { ...state.filters, ...action.payload };
            state.pagination.page = 1;
        },
        setPage(state, action: PayloadAction<number>) {
            state.pagination.page = action.payload;
        },
        setPageSize(state, action: PayloadAction<number>) {
            state.pagination.pageSize = action.payload;
            state.pagination.page = 1;
        },
        clearTenantDetail(state) {
            state.tenantDetail = null;
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchRevenueOverview.pending, s => { s.loading.revenueOverview = true; s.errors.revenueOverview = null; })
            .addCase(fetchRevenueOverview.fulfilled, (s, a) => { s.loading.revenueOverview = false; s.revenueOverview = a.payload; })
            .addCase(fetchRevenueOverview.rejected, (s, a) => { s.loading.revenueOverview = false; s.errors.revenueOverview = a.error.message ?? 'Error'; })

            .addCase(fetchAnalytics.pending, s => { s.loading.analytics = true; s.errors.analytics = null; })
            .addCase(fetchAnalytics.fulfilled, (s, a) => { s.loading.analytics = false; s.analyticsData = a.payload; })
            .addCase(fetchAnalytics.rejected, (s, a) => { s.loading.analytics = false; s.errors.analytics = a.error.message ?? 'Error'; })

            .addCase(fetchTenants.pending, s => { s.loading.tenants = true; s.errors.tenants = null; })
            .addCase(fetchTenants.fulfilled, (s, a) => {
                s.loading.tenants = false;
                s.tenants = a.payload.tenants;
                s.pagination.total = a.payload.total;
            })
            .addCase(fetchTenants.rejected, (s, a) => { s.loading.tenants = false; s.errors.tenants = a.error.message ?? 'Error'; })

            .addCase(fetchTenantDetail.pending, s => { s.loading.tenantDetail = true; s.errors.tenantDetail = null; })
            .addCase(fetchTenantDetail.fulfilled, (s, a) => { s.loading.tenantDetail = false; s.tenantDetail = a.payload; })
            .addCase(fetchTenantDetail.rejected, (s, a) => { s.loading.tenantDetail = false; s.errors.tenantDetail = a.error.message ?? 'Error'; })

            .addCase(fetchPlans.pending, s => { s.loading.plans = true; })
            .addCase(fetchPlans.fulfilled, (s, a) => { s.loading.plans = false; s.plans = a.payload; })
            .addCase(fetchPlans.rejected, s => { s.loading.plans = false; })

            .addCase(fetchAIAgents.pending, s => { s.loading.aiAgents = true; })
            .addCase(fetchAIAgents.fulfilled, (s, a) => { s.loading.aiAgents = false; s.aiAgents = a.payload; })
            .addCase(fetchAIAgents.rejected, s => { s.loading.aiAgents = false; })

            .addCase(fetchTelephonyProviders.pending, s => { s.loading.telephony = true; })
            .addCase(fetchTelephonyProviders.fulfilled, (s, a) => { s.loading.telephony = false; s.telephonyProviders = a.payload; })
            .addCase(fetchTelephonyProviders.rejected, s => { s.loading.telephony = false; })

            .addCase(fetchBillingStatements.pending, s => { s.loading.billing = true; })
            .addCase(fetchBillingStatements.fulfilled, (s, a) => { s.loading.billing = false; s.billingStatements = a.payload; })
            .addCase(fetchBillingStatements.rejected, s => { s.loading.billing = false; });
    },
});

export const { setFilters, setPage, setPageSize, clearTenantDetail } = superadminSlice.actions;
export default superadminSlice.reducer;

// ─── Selectors ─────────────────────────────────────────────────────────────────
export const selectSuperAdmin = (state: RootState) => state.superadmin;
export const selectRevenueOverview = (state: RootState) => state.superadmin.revenueOverview;
export const selectAnalyticsData = (state: RootState) => state.superadmin.analyticsData;
export const selectTenants = (state: RootState) => state.superadmin.tenants;
export const selectTenantDetail = (state: RootState) => state.superadmin.tenantDetail;
export const selectPlans = (state: RootState) => state.superadmin.plans;
export const selectAIAgents = (state: RootState) => state.superadmin.aiAgents;
export const selectTelephonyProviders = (state: RootState) => state.superadmin.telephonyProviders;
export const selectFilters = (state: RootState) => state.superadmin.filters;
export const selectPagination = (state: RootState) => state.superadmin.pagination;