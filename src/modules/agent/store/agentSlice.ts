// src/modules/agent/store/agentSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { agentApi, deleteLead } from '../api/agent.api';
import { uploadAvatar } from '../api/agent.api';

export interface DashboardData {
  stats: {
    myLeads:number; activeLeads:number; followUpsDue:number; visitsToday:number;
    bookingsMonth:number; revenueMonth:number; pendingTasks:number;
    isCheckedIn:boolean; isCheckedOut:boolean; conversionRate:number;
  };
  todayAttendance: any;
  recentActivities: any[];
  upcomingFollowUps: any[];
  salesTrend: { month:string; revenue:number; bookings:number }[];
}

export interface Lead {
  id:string; customerName:string; customerPhone:string; customerEmail?:string;
  status:string; budget?:number; budgetMax?:number; sourceChannel:string; 
  priority?:string; purpose?:string; locationPreference?:string;
  preferredProject?:string; preferredUnitType?:string; notes?:string;
  projectId?:string; unitId?:string; photoUrl?:string; tags?:string[];
  loanRequired?:boolean; buyingTimeline?:string; familySize?:number;
  createdAt:string; updatedAt:string;
  project?:{ name:string; city?:string };
  ownerAgent?:{ id:string; name:string; avatarUrl?:string };
  activities?:any[];
  followUps?:any[];
  siteVisits?:any[];
  _count?:{ followUps:number };
}

export interface FollowUp {
  id:string; leadId:string; activityType:string; notes?:string;
  nextFollowUpDate?:string; followUpAt?:string; isCompleted:boolean; outcome?:string;
  createdAt:string;
  lead?:{ customerName:string; customerPhone:string; status:string };
}

export type VisitType = 'PHYSICAL' | 'VIRTUAL' | 'GUIDED' | 'SELF_GUIDED';
export type VisitStatus = 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED' | 'REQUESTED';
export type VisitOutcome = 'INTERESTED' | 'NOT_INTERESTED' | 'FOLLOW_UP_NEEDED' | 'BOOKING_INITIATED' | 'NEGOTIATION' | 'LOST';
export type VisitPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Visit {
  id:string; 
  leadId:string; 
  agentId:string;
  projectId?:string; 
  unitId?:string;
  visitType: VisitType;
  status: VisitStatus;
  outcome?: VisitOutcome;
  priority: VisitPriority;
  visitDate: string;
  visitTime: string;
  durationMinutes: number;
  checkInLat?: number;
  checkInLng?: number;
  checkInAt?: string;
  checkOutAt?: string;
  notes?: string;
  feedback?: any;
  photoUrls: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lead?: { id: string; customerName: string; customerPhone: string; customerEmail?: string; status: string };
  project?: { id: string; name: string };
  unit?: { id: string; unitNumber: string };
}

export interface Task {
  id:string; title:string; description?:string; priority:string;
  status:string; dueDate?:string; notes?:string;
  lead?:{ customerName:string };
  assignedByUser?:{ name:string };
}

export interface Booking {
  id:string; customerName:string; customerPhone:string; totalAmount:number;
  finalAmount:number; status:string; createdAt:string;
  unit?:any;
  payments?:any[];
}

export interface PerfData {
  month:number; year:number; leadsHandled:number; followUpsCompleted:number;
  siteVisits:number; bookingsClosed:number; revenueGenerated:number;
  conversionRate:number; avgDealSize:number;
  targetAmount?:number; targetBookings?:number;
}

interface AgentState {
  dashboard    : DashboardData | null;
  leads        : { data:Lead[];    total:number };
  followUps    : { data:FollowUp[];total:number };
  visits       : { data:Visit[];   total:number };
  tasks        : { data:Task[];    total:number };
  bookings     : { data:Booking[]; total:number };
  performance  : PerfData | null;
  leaderboard  : any[];
  notifications: any[];
  attendance   : any[];
  leaves       : any[];
  profile      : any;
  loading      : Record<string, boolean>;
  error        : string | null;
}

const init: AgentState = {
  dashboard:null, leads:{data:[],total:0}, followUps:{data:[],total:0},
  visits:{data:[],total:0}, tasks:{data:[],total:0}, bookings:{data:[],total:0},
  performance:null, leaderboard:[], notifications:[], attendance:[], leaves:[], profile:null,
  loading:{}, error:null,
};

const th = <R,A=void>(name:string, fn:(a:A)=>Promise<R>) =>
  createAsyncThunk<R,A>(`agent/${name}`, fn);

export const fetchDashboard    = th('dashboard',    async () => (await agentApi.get('/dashboard')).data.data);
export const fetchProfile      = th('profile',      async () => (await agentApi.get('/profile')).data.data);
export const doUpdateProfile   = th<any,any>('updateProfile', async(b) => (await agentApi.put('/profile',b)).data.data);
export const doCheckIn         = th<any,any>('checkIn',  async(b) => (await agentApi.post('/check-in',b)).data.data);
export const doCheckOut        = th<any,any>('checkOut', async(b) => (await agentApi.post('/check-out',b)).data.data);
export const fetchAttendance   = th<any[],{from?:string;to?:string}>('attendance', async(p) => (await agentApi.get('/attendance',{params:p})).data.data);
export const fetchTasks        = th<{data:Task[];total:number},{status?:string;skip?:number;take?:number}>('tasks', async(p) => (await agentApi.get('/tasks',{params:p})).data.data);
export const doUpdateTask      = th<Task,any>('updateTask', async({id,...b}) => (await agentApi.put(`/tasks/${id}`,b)).data.data);
export const fetchLeads        = th<{data:Lead[];total:number},{status?:string;search?:string;skip?:number;take?:number}>('leads', async(p) => (await agentApi.get('/leads',{params:p})).data.data);
export const fetchLeadById     = th<Lead,string>('fetchLeadById', async(id) => (await agentApi.get(`/leads/${id}`)).data.data);
export const doUpdateLead      = th<Lead,any>('updateLead', async({id,...b}) => (await agentApi.put(`/leads/${id}`,b)).data.data);
export const fetchFollowUps    = th<{data:FollowUp[];total:number},{leadId?:string;completed?:boolean;dueToday?:boolean;skip?:number}>('followUps', async(p) => (await agentApi.get('/followups',{params:p})).data.data);
export const doCreateFollowUp  = th<FollowUp,any>('createFollowUp', async(b) => (await agentApi.post('/followups',b)).data.data);
export const doCompleteFollowUp= th<FollowUp,any>('completeFollowUp', async({id,...b}) => (await agentApi.put(`/followups/${id}/complete`,b)).data.data);
export const fetchVisits       = th<{data:Visit[];total:number},{status?:string;from?:string;to?:string;skip?:number;take?:number}>('visits', async(p) => (await agentApi.get('/site-visits',{params:p})).data.data);
export const doCreateVisit     = th<Visit,any>('createVisit', async(b) => (await agentApi.post('/site-visits',b)).data.data);
export const doUpdateVisit     = th<Visit,any>('updateVisit', async({id,...b}) => (await agentApi.put(`/site-visits/${id}`,b)).data.data);
export const fetchBookings     = th<{data:Booking[];total:number},{status?:string}>('bookings', async(p) => (await agentApi.get('/bookings',{params:p})).data.data);
export const doCreateBooking   = th<Booking,any>('createBooking', async(b) => (await agentApi.post('/bookings',b)).data.data);
export const fetchPerformance  = th<PerfData,{month?:number;year?:number}>('performance', async(p) => (await agentApi.get('/performance',{params:p})).data.data);
export const fetchLeaderboard  = th<any[],{month?:number;year?:number}>('leaderboard', async(p) => (await agentApi.get('/top-performers',{params:p})).data.data);
export const fetchNotifications= th<any[],{unread?:boolean}>('notifications', async(p) => (await agentApi.get('/notifications',{params:p})).data.data);
export const doReadNotif       = th<any,string>('readNotif', async(id) => (await agentApi.put(`/notifications/${id}/read`)).data.data);
export const fetchLeaves       = th<any[],void>('leaves', async() => (await agentApi.get('/leaves')).data.data);
export const doRequestLeave    = th<any,any>('requestLeave', async(b) => (await agentApi.post('/leaves',b)).data.data);
export const doUploadAvatar    = th<any,File>('uploadAvatar', async(f) => (await uploadAvatar(f)).data.data);
export const doLogLocation     = th<any,any>('logLocation', async(b) => (await agentApi.post('/location-log',b)).data.data);
export const doDeleteLead      = th<void,string>('deleteLead', async(id) => (await deleteLead(id)).data.data);

const agentSlice = createSlice({
  name:'agent', initialState:init,
  reducers:{ clearError:s=>{s.error=null;} },
  extraReducers:b=>{
    const p=(k:string)=>(s:AgentState)=>{s.loading[k]=true;s.error=null;};
    const f=(k:string)=>(s:AgentState,a:any)=>{s.loading[k]=false;s.error=a.error.message??'Error';};
    b
      .addCase(fetchDashboard.pending,   p('dashboard'))
      .addCase(fetchDashboard.fulfilled, (s,a)=>{s.loading.dashboard=false;s.dashboard=a.payload as any;})
      .addCase(fetchDashboard.rejected,  f('dashboard'))
      .addCase(fetchProfile.fulfilled,   (s,a)=>{s.profile=a.payload;})
      .addCase(doCheckIn.fulfilled,      (s,a)=>{ if(s.dashboard) s.dashboard.stats.isCheckedIn=true; s.dashboard && (s.dashboard.todayAttendance=a.payload); })
      .addCase(doCheckOut.fulfilled,     (s,a)=>{ if(s.dashboard) s.dashboard.stats.isCheckedOut=true; })
      .addCase(fetchAttendance.fulfilled,(s,a)=>{s.attendance=a.payload as any;})
      .addCase(fetchTasks.pending,       p('tasks'))
      .addCase(fetchTasks.fulfilled,     (s,a)=>{s.loading.tasks=false;s.tasks=a.payload;})
      .addCase(doUpdateTask.fulfilled,   (s,a)=>{ const t=a.payload as any; const i=s.tasks.data.findIndex(x=>x.id===t.id); if(i!==-1) s.tasks.data[i]=t; })
      .addCase(fetchLeads.pending,       p('leads'))
      .addCase(fetchLeads.fulfilled,     (s,a)=>{s.loading.leads=false;s.leads=a.payload;})
      .addCase(fetchLeadById.fulfilled,  (s,a)=>{ const l=a.payload as any; const i=s.leads.data.findIndex(x=>x.id===l.id); if(i!==-1) s.leads.data[i]=l; })
      .addCase(doUpdateLead.fulfilled,   (s,a)=>{ const l=a.payload as any; const i=s.leads.data.findIndex(x=>x.id===l.id); if(i!==-1) s.leads.data[i]=l; })
      .addCase(doDeleteLead.fulfilled,   (s,a)=>{ const id=a.meta.arg; s.leads.data=s.leads.data.filter(x=>x.id!==id); s.leads.total--; })
      .addCase(fetchFollowUps.pending,   p('followUps'))
      .addCase(fetchFollowUps.fulfilled, (s,a)=>{s.loading.followUps=false;s.followUps=a.payload;})
      .addCase(doCreateFollowUp.fulfilled,(s,a)=>{s.followUps.data.unshift(a.payload as any);s.followUps.total++;})
      .addCase(doCompleteFollowUp.fulfilled,(s,a)=>{ const fu=a.payload as any; const i=s.followUps.data.findIndex(x=>x.id===fu.id); if(i!==-1) s.followUps.data[i]=fu; })
      .addCase(fetchVisits.pending,      p('visits'))
      .addCase(fetchVisits.fulfilled,    (s,a)=>{s.loading.visits=false;s.visits=a.payload;})
      .addCase(doCreateVisit.fulfilled,  (s,a)=>{s.visits.data.unshift(a.payload as any);s.visits.total++;})
      .addCase(doUpdateVisit.fulfilled,  (s,a)=>{ const v=a.payload as any; const i=s.visits.data.findIndex(x=>x.id===v.id); if(i!==-1) s.visits.data[i]=v; })
      .addCase(fetchBookings.pending,    p('bookings'))
      .addCase(fetchBookings.fulfilled,  (s,a)=>{s.loading.bookings=false;s.bookings=a.payload;})
      .addCase(doCreateBooking.fulfilled,(s,a)=>{s.bookings.data.unshift(a.payload as any);s.bookings.total++;})
      .addCase(fetchPerformance.fulfilled,(s,a)=>{s.performance=a.payload;})
      .addCase(fetchLeaderboard.fulfilled,(s,a)=>{s.leaderboard=a.payload;})
      .addCase(fetchNotifications.fulfilled,(s,a)=>{s.notifications=a.payload;})
      .addCase(doReadNotif.fulfilled,    (s,a)=>{ const n=a.payload as any; s.notifications=s.notifications.filter(x=>x.id!==n.id); })
      .addCase(fetchLeaves.fulfilled,    (s,a)=>{s.leaves=a.payload;})
      .addCase(doUploadAvatar.fulfilled, (s,a)=>{if(s.profile) s.profile.avatarUrl=a.payload;})
      .addCase(doRequestLeave.fulfilled, (s,a)=>{s.leaves.unshift(a.payload);});
  },
});
export const { clearError } = agentSlice.actions;
export default agentSlice.reducer;
