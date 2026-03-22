import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export interface DashboardStats {
  totalLeads: number;
  activeBookings: number;
  revenueThisMonth: number;
  conversionRate: number;
  pipelineStats: { stage: string; count: number }[];
  bookingTrend: { period: string; bookings: number; revenue: number }[];
  widgets: {
    tasksToday: number;
    upcomingVisits: number;
    pendingFollowUps: number;
    overduePayments: number;
  };
  agentPerformance: any[];
}

interface TenantAdminState {
  dashboard: DashboardStats | null;
  loading: boolean;
  error: string | null;
}

const normalizeDashboardStats = (raw: any): DashboardStats => {
  // If API already returns the expected shape, keep it.
  if (raw && typeof raw === 'object' && 'widgets' in raw && 'totalLeads' in raw) {
    return {
      totalLeads: Number(raw.totalLeads ?? 0),
      activeBookings: Number(raw.activeBookings ?? 0),
      revenueThisMonth: Number(raw.revenueThisMonth ?? 0),
      conversionRate: Number(raw.conversionRate ?? 0),
      pipelineStats: Array.isArray(raw.pipelineStats) ? raw.pipelineStats : [],
      bookingTrend: Array.isArray(raw.bookingTrend) ? raw.bookingTrend : [],
      widgets: {
        tasksToday: Number(raw.widgets?.tasksToday ?? 0),
        upcomingVisits: Number(raw.widgets?.upcomingVisits ?? 0),
        pendingFollowUps: Number(raw.widgets?.pendingFollowUps ?? 0),
        overduePayments: Number(raw.widgets?.overduePayments ?? 0),
      },
      agentPerformance: Array.isArray(raw.agentPerformance) ? raw.agentPerformance : [],
    };
  }

  // Map analytics summary response to the UI contract.
  const pipelineStats = Array.isArray(raw?.leads?.byStatus)
    ? raw.leads.byStatus.map((x: any) => ({ stage: String(x.status ?? 'UNKNOWN'), count: Number(x.count ?? 0) }))
    : [];

  const bookingTrend = Array.isArray(raw?.bookings?.trend)
    ? raw.bookings.trend.map((x: any) => ({
        period: String(x.period ?? ''),
        bookings: Number(x.count ?? x.bookings ?? 0),
        revenue: Number(x.revenue ?? 0),
      }))
    : [];

  return {
    totalLeads: Number(raw?.leads?.total ?? raw?.totalLeads ?? 0),
    activeBookings: Number(raw?.bookings?.total ?? raw?.activeBookings ?? 0),
    revenueThisMonth: Number(raw?.finance?.revenueThisMonth ?? raw?.revenueThisMonth ?? 0),
    conversionRate: Number(raw?.leads?.conversionRate ?? raw?.conversionRate ?? 0),
    pipelineStats,
    bookingTrend,
    widgets: {
      tasksToday: Number(raw?.widgets?.tasksToday ?? 0),
      upcomingVisits: Number(raw?.widgets?.upcomingVisits ?? 0),
      pendingFollowUps: Number(raw?.widgets?.pendingFollowUps ?? 0),
      overduePayments: Number(raw?.finance?.pendingPayments ?? raw?.widgets?.overduePayments ?? 0),
    },
    agentPerformance: Array.isArray(raw?.agentPerformance) ? raw.agentPerformance : [],
  };
};

const initialState: TenantAdminState = {
  dashboard: null,
  loading: false,
  error: null,
};

export const fetchDashboardStats = createAsyncThunk(
  'tenantAdmin/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/reports/dashboard');
      return normalizeDashboardStats(response.data?.data ?? response.data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to fetch dashboard stats'
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as any;
      return !state?.tenantAdmin?.loading;
    },
  }
);

const tenantAdminSlice = createSlice({
  name: 'tenantAdmin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default tenantAdminSlice.reducer;
