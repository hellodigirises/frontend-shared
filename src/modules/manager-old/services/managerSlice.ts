import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../../api/axios';

interface TeamStats {
  totalLeads: number;
  totalBookings: number;
  totalSiteVisits: number;
  agentsCount: number;
  conversionRate: number;
  pipelineStats: { stage: string; count: number }[];
}

interface Agent {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
  _count: { ownedLeads: number; bookings: number };
}

interface ManagerState {
  teamStats: TeamStats | null;
  agents: Agent[];
  topAgents: any[];
  teamLeads: {
    data: any[];
    total: number;
    page: number;
    limit: number;
  };
  teamPipeline: any[];
  loading: {
    stats: boolean;
    agents: boolean;
    topAgents: boolean;
    leads: boolean;
    pipeline: boolean;
  };
  error: string | null;
}

const initialState: ManagerState = {
  teamStats: null,
  agents: [],
  topAgents: [],
  teamLeads: {
    data: [],
    total: 0,
    page: 1,
    limit: 10,
  },
  teamPipeline: [],
  loading: {
    stats: false,
    agents: false,
    topAgents: false,
    leads: false,
    pipeline: false,
  },
  error: null,
};

export const fetchTeamStats = createAsyncThunk(
  'manager/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/manager/stats');
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch team stats');
    }
  }
);

export const fetchAgentsList = createAsyncThunk(
  'manager/fetchAgents',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/manager/agents');
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch agents');
    }
  }
);

export const fetchTopAgents = createAsyncThunk(
  'manager/fetchTopAgents',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/manager/top-agents');
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch top agents');
    }
  }
);

export const fetchTeamLeads = createAsyncThunk(
  'manager/fetchLeads',
  async (params: { page: number; limit: number; search?: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/leads', { params });
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch team leads');
    }
  }
);

export const fetchTeamPipeline = createAsyncThunk(
  'manager/fetchPipeline',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/leads/pipeline');
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch team pipeline');
    }
  }
);

const managerSlice = createSlice({
  name: 'manager',
  initialState,
  reducers: {
    clearManagerError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Stats
      .addCase(fetchTeamStats.pending, (state) => {
        state.loading.stats = true;
      })
      .addCase(fetchTeamStats.fulfilled, (state, action) => {
        state.loading.stats = false;
        state.teamStats = action.payload;
      })
      .addCase(fetchTeamStats.rejected, (state, action) => {
        state.loading.stats = false;
        state.error = action.payload as string;
      })
      // Agents
      .addCase(fetchAgentsList.pending, (state) => {
        state.loading.agents = true;
      })
      .addCase(fetchAgentsList.fulfilled, (state, action) => {
        state.loading.agents = false;
        state.agents = action.payload;
      })
      .addCase(fetchAgentsList.rejected, (state, action) => {
        state.loading.agents = false;
        state.error = action.payload as string;
      })
      // Top Agents
      .addCase(fetchTopAgents.pending, (state) => {
        state.loading.topAgents = true;
      })
      .addCase(fetchTopAgents.fulfilled, (state, action) => {
        state.loading.topAgents = false;
        state.topAgents = action.payload;
      })
      .addCase(fetchTopAgents.rejected, (state, action) => {
        state.loading.topAgents = false;
        state.error = action.payload as string;
      })
      // Team Leads
      .addCase(fetchTeamLeads.pending, (state) => {
        state.loading.leads = true;
      })
      .addCase(fetchTeamLeads.fulfilled, (state, action) => {
        state.loading.leads = false;
        state.teamLeads = action.payload;
      })
      .addCase(fetchTeamLeads.rejected, (state, action) => {
        state.loading.leads = false;
        state.error = action.payload as string;
      })
      // Team Pipeline
      .addCase(fetchTeamPipeline.pending, (state) => {
        state.loading.pipeline = true;
      })
      .addCase(fetchTeamPipeline.fulfilled, (state, action) => {
        state.loading.pipeline = false;
        state.teamPipeline = action.payload;
      })
      .addCase(fetchTeamPipeline.rejected, (state, action) => {
        state.loading.pipeline = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearManagerError } = managerSlice.actions;
export default managerSlice.reducer;
