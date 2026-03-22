// src/modules/sales-manager/store/salesSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { salesApi } from '../api/sales.api';

export interface DashboardData {
  stats: {
    totalLeads: number; newLeadsMonth: number;
    siteVisitsScheduled: number; siteVisitsCompleted: number;
    dealsThisMonth: number; pipelineValue: number;
    revenueThisMonth: number; revenuePrevMonth: number;
    revenueGrowthPct: number|string; staleLeads: number; pendingVisits: number;
  };
  charts: {
    conversionFunnel : { stage: string; count: number }[];
    pipelineByStage  : { stage: string; count: number; value: number }[];
    revenueGrowth    : { month: string; revenue: number; bookings: number }[];
    topAgents        : { agentId: string; name: string; revenue: number; bookings: number; visits: number }[];
  };
  recentActivities: any[];
}

export interface PipelineItem {
  id: string; leadId: string; stage: string; dealValue?: number;
  probability?: number; updatedAt: string;
  lead: {
    id: string; customerName: string; customerPhone: string;
    status: string; budget?: number; sourceChannel: string; createdAt: string;
    assignedTo?: { id: string; name: string; avatarUrl?: string };
    project?: { name: string; city?: string };
  };
}

export interface SiteVisit {
  id: string; leadId: string; agentId: string; projectId: string;
  visitDate: string; visitStatus: string; notes?: string; feedback?: string;
  lead?: { customerName: string; customerPhone: string };
  agent?: { name: string; avatarUrl?: string };
  project?: { name: string; city?: string };
}

export interface Deal {
  id: string; leadId: string; agentId: string; dealValue: number;
  dealStage: string; probability?: number; expectedCloseDate?: string;
  lead?: { customerName: string; customerPhone: string };
  agent?: { name: string };
  unit?: { unitNumber: string; unitType: string; price: number };
}

export interface Target {
  id: string; agentId: string; period: string; periodLabel: string;
  targetAmount: number; targetBookings: number; targetVisits: number;
  achievedAmount: number; achievedBookings: number; achievedVisits: number;
  agent?: { name: string; avatarUrl?: string };
  manager?: { name: string };
}

export interface AgentPerf {
  agentId: string; name: string; avatarUrl?: string;
  leads: number; visits: number; bookings: number;
  revenue: number; convRate: number; rank?: number;
}

export interface Territory {
  id: string; name: string; city?: string; zone?: string;
  pincodes: string[];
  assignments: { agent: { id: string; name: string; avatarUrl?: string } }[];
}

export interface Team {
  id: string; name: string; managerId: string;
  manager?: { name: string };
  assignments: { agent: { id: string; name: string; role: string; avatarUrl?: string } }[];
}

interface SalesState {
  dashboard     : DashboardData | null;
  pipeline      : PipelineItem[];
  siteVisits    : { data: SiteVisit[]; total: number };
  deals         : { data: Deal[];  total: number };
  targets       : Target[];
  forecast      : any[];
  performance   : AgentPerf[];
  leaderboard   : AgentPerf[];
  territories   : Territory[];
  teams         : Team[];
  activities    : { data: any[]; total: number };
  alerts        : any[];
  loading       : Record<string, boolean>;
  error         : string | null;
}

const init: SalesState = {
  dashboard  : null,
  pipeline   : [],
  siteVisits : { data: [], total: 0 },
  deals      : { data: [], total: 0 },
  targets    : [],
  forecast   : [],
  performance: [],
  leaderboard: [],
  territories: [],
  teams      : [],
  activities : { data: [], total: 0 },
  alerts     : [],
  loading    : {},
  error      : null,
};

const th = <R, A=void>(name: string, fn: (a:A)=>Promise<R>) =>
  createAsyncThunk<R,A>(`sales/${name}`, fn);

export const fetchDashboard   = th('dashboard',   async () => (await salesApi.get('/dashboard')).data.data);
export const fetchPipeline    = th<PipelineItem[], {stage?:string}>('pipeline', async(p) => (await salesApi.get('/pipeline',{params:p})).data.data);
export const doUpdatePipeline = th<PipelineItem, any>('updatePipeline', async({leadId,...b}) => (await salesApi.put(`/pipeline/${leadId}`,b)).data.data);
export const doAssignLead     = th<any,any>('assignLead', async(b) => (await salesApi.post('/leads/assign',b)).data.data);
export const doRoundRobin     = th<any,string>('roundRobin', async(leadId) => (await salesApi.post('/leads/assign/round-robin',{leadId})).data.data);
export const fetchSiteVisits  = th<{data:SiteVisit[];total:number},{status?:string;agentId?:string;from?:string;to?:string}>('siteVisits', async(p) => (await salesApi.get('/site-visits',{params:p})).data.data);
export const doCreateVisit    = th<SiteVisit,any>('createVisit', async(b) => (await salesApi.post('/site-visits',b)).data.data);
export const doUpdateVisit    = th<SiteVisit,any>('updateVisit', async({id,...b}) => (await salesApi.put(`/site-visits/${id}`,b)).data.data);
export const fetchDeals       = th<{data:Deal[];total:number},{stage?:string;agentId?:string}>('deals', async(p) => (await salesApi.get('/deals',{params:p})).data.data);
export const doCreateDeal     = th<Deal,any>('createDeal', async(b) => (await salesApi.post('/deals',b)).data.data);
export const doUpdateDeal     = th<Deal,any>('updateDeal', async({id,...b}) => (await salesApi.put(`/deals/${id}`,b)).data.data);
export const fetchTargets     = th<Target[],{agentId?:string;period?:string}>('targets', async(p) => (await salesApi.get('/targets',{params:p})).data.data);
export const doCreateTarget   = th<Target,any>('createTarget', async(b) => (await salesApi.post('/targets',b)).data.data);
export const fetchForecast    = th<any[],void>('forecast', async() => (await salesApi.get('/forecast')).data.data);
export const doGenForecast    = th<any,void>('genForecast', async() => (await salesApi.post('/forecast/generate')).data.data);
export const fetchPerformance = th<AgentPerf[],{from?:string;to?:string}>('performance', async(p) => (await salesApi.get('/agents/performance',{params:p})).data.data);
export const fetchLeaderboard = th<AgentPerf[],{month?:number;year?:number}>('leaderboard', async(p) => (await salesApi.get('/leaderboard',{params:p})).data.data);
export const fetchTerritories = th<Territory[],void>('territories', async() => (await salesApi.get('/territories')).data.data);
export const doCreateTerritory= th<Territory,any>('createTerritory', async(b) => (await salesApi.post('/territories',b)).data.data);
export const fetchTeams       = th<Team[],void>('teams', async() => (await salesApi.get('/team')).data.data);
export const doCreateTeam     = th<Team,{name:string}>('createTeam', async(b) => (await salesApi.post('/team',b)).data.data);
export const fetchAlerts      = th<any[],void>('alerts', async() => (await salesApi.get('/alerts')).data.data);
export const doReadAlert      = th<any,string>('readAlert', async(id) => (await salesApi.put(`/alerts/${id}/read`)).data.data);

const salesSlice = createSlice({
  name: 'sales', initialState: init,
  reducers: { clearError: s => { s.error=null; } },
  extraReducers: b => {
    const p=(k:string)=>(s:SalesState)=>{s.loading[k]=true;s.error=null;};
    const f=(k:string)=>(s:SalesState,a:any)=>{s.loading[k]=false;s.error=a.error.message??'Error';};
    b
      .addCase(fetchDashboard.pending,   p('dashboard'))
      .addCase(fetchDashboard.fulfilled, (s,a)=>{s.loading.dashboard=false;s.dashboard=a.payload as any;})
      .addCase(fetchDashboard.rejected,  f('dashboard'))
      .addCase(fetchPipeline.pending,    p('pipeline'))
      .addCase(fetchPipeline.fulfilled,  (s,a)=>{s.loading.pipeline=false;s.pipeline=a.payload;})
      .addCase(fetchPipeline.rejected,   f('pipeline'))
      .addCase(doUpdatePipeline.fulfilled,(s,a)=>{ const item=a.payload as any; const i=s.pipeline.findIndex(x=>x.leadId===item.leadId); if(i!==-1) s.pipeline[i]=item; })
      .addCase(fetchSiteVisits.pending,  p('siteVisits'))
      .addCase(fetchSiteVisits.fulfilled,(s,a)=>{s.loading.siteVisits=false;s.siteVisits=a.payload;})
      .addCase(fetchSiteVisits.rejected, f('siteVisits'))
      .addCase(doCreateVisit.fulfilled,  (s,a)=>{s.siteVisits.data.unshift(a.payload as any);s.siteVisits.total++;})
      .addCase(doUpdateVisit.fulfilled,  (s,a)=>{ const v=a.payload as any; const i=s.siteVisits.data.findIndex(x=>x.id===v.id); if(i!==-1) s.siteVisits.data[i]=v; })
      .addCase(fetchDeals.pending,       p('deals'))
      .addCase(fetchDeals.fulfilled,     (s,a)=>{s.loading.deals=false;s.deals=a.payload;})
      .addCase(fetchDeals.rejected,      f('deals'))
      .addCase(doCreateDeal.fulfilled,   (s,a)=>{s.deals.data.unshift(a.payload as any);s.deals.total++;})
      .addCase(fetchTargets.fulfilled,   (s,a)=>{s.targets=a.payload;})
      .addCase(doCreateTarget.fulfilled, (s,a)=>{s.targets.unshift(a.payload as any);})
      .addCase(fetchForecast.fulfilled,  (s,a)=>{s.forecast=a.payload;})
      .addCase(doGenForecast.fulfilled,  (s,a)=>{ const f=a.payload as any; if(f) s.forecast.unshift(f); })
      .addCase(fetchPerformance.pending, p('performance'))
      .addCase(fetchPerformance.fulfilled,(s,a)=>{s.loading.performance=false;s.performance=a.payload;})
      .addCase(fetchPerformance.rejected, f('performance'))
      .addCase(fetchLeaderboard.fulfilled,(s,a)=>{s.leaderboard=a.payload;})
      .addCase(fetchTerritories.fulfilled,(s,a)=>{s.territories=a.payload;})
      .addCase(doCreateTerritory.fulfilled,(s,a)=>{s.territories.push(a.payload as any);})
      .addCase(fetchTeams.fulfilled,     (s,a)=>{s.teams=a.payload;})
      .addCase(doCreateTeam.fulfilled,   (s,a)=>{s.teams.unshift(a.payload as any);})
      .addCase(fetchAlerts.fulfilled,    (s,a)=>{s.alerts=a.payload;})
      .addCase(doReadAlert.fulfilled,    (s,a)=>{ const r=a.payload as any; s.alerts=s.alerts.filter(x=>x.id!==r.id); });
  },
});

export const { clearError } = salesSlice.actions;
export default salesSlice.reducer;
