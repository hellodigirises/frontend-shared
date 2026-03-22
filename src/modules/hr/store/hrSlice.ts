// src/modules/hr/store/hrSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { hrApi } from '../api/hr.api';

// ── Domain Types ──────────────────────────────────────────────────────────────

export interface Employee {
  id: string; employeeCode: string; name: string; email: string;
  phone?: string; avatarUrl?: string; role: string; department?: string;
  designation?: string; employmentType: string; status: string;
  joiningDate: string; salary: number; managerId?: string;
  manager?: { name: string; designation: string };
  _count?: { attendance: number; leaves: number; payrolls: number };
}

export interface AttendanceRecord {
  id: string; employeeId: string; date: string;
  checkIn?: string; checkOut?: string; checkInType: string;
  hoursWorked?: number; status: string; isLate: boolean; lateMinutes?: number;
  employee?: { name: string; department?: string; avatarUrl?: string };
}

export interface LeaveRequest {
  id: string; employeeId: string; leaveType: string;
  startDate: string; endDate: string; totalDays: number;
  reason: string; status: string; isHalfDay: boolean;
  managerApproval?: string; hrApproval?: string;
  employee?: { name: string; department?: string; avatarUrl?: string };
}

export interface PayrollRecord {
  id: string; employeeId: string; month: number; year: number;
  basicSalary: number; grossSalary: number; netSalary: number;
  totalDeductions: number; isPaid: boolean; workingDays: number;
  presentDays: number; lopDays: number;
  employee?: { name: string; employeeCode: string; department?: string; designation?: string };
}

export interface PerformanceRecord {
  id: string; employeeId: string; month: number; year: number;
  leadsHandled: number; siteVisits: number; bookingsClosed: number;
  revenueGenerated: number; managerRating?: number;
  employee?: { name: string; department?: string; designation?: string; avatarUrl?: string };
}

export interface Training {
  id: string; title: string; description?: string; category?: string;
  date: string; duration?: number; venue?: string; isOnline: boolean;
  trainerName?: string; maxSeats?: number;
  enrollments?: { id: string; status: string; employee: { name: string; avatarUrl?: string } }[];
}

export interface Announcement {
  id: string; title: string; message: string; audience: string;
  isPinned: boolean; createdAt: string; department?: string;
}

export interface DashboardData {
  totalEmployees: number; activeEmployees: number;
  todayAttendance: number; pendingLeaves: number;
  monthlyPayroll: { gross: number; net: number };
  topPerformers: any[];
  deptBreakdown: { dept: string; count: number }[];
  attendanceTrend: { date: string; present: number; absent: number }[];
}

// ── State ─────────────────────────────────────────────────────────────────────

interface HRState {
  dashboard   : DashboardData | null;
  employees   : { data: Employee[]; total: number };
  employee    : Employee | null;
  attendance  : { data: AttendanceRecord[]; total: number };
  leaves      : { data: LeaveRequest[]; total: number };
  payrolls    : { data: PayrollRecord[]; total: number };
  performance : PerformanceRecord[];
  trainings   : Training[];
  announcements: { data: Announcement[]; total: number };
  loading     : Record<string, boolean>;
  error       : string | null;
}

const init: HRState = {
  dashboard   : null,
  employees   : { data: [], total: 0 },
  employee    : null,
  attendance  : { data: [], total: 0 },
  leaves      : { data: [], total: 0 },
  payrolls    : { data: [], total: 0 },
  performance : [],
  trainings   : [],
  announcements: { data: [], total: 0 },
  loading     : {},
  error       : null,
};

// ── Thunk factory ──────────────────────────────────────────────────────────────

const th = <R, A = void>(name: string, fn: (arg: A) => Promise<R>) =>
  createAsyncThunk<R, A>(`hr/${name}`, fn);

// ── Thunks ─────────────────────────────────────────────────────────────────────

export const fetchDashboard     = th('dashboard',    async () => (await hrApi.get('/dashboard')).data.data);
export const fetchEmployees     = th<{ data: Employee[]; total: number }, Record<string, any>>(
  'employees', async (p) => (await hrApi.get('/employees', { params: p })).data.data);
export const fetchEmployee      = th<Employee, string>(
  'employee', async (id) => (await hrApi.get(`/employees/${id}`)).data.data);
export const doCreateEmployee   = th<Employee, any>(
  'createEmployee', async (b) => (await hrApi.post('/employees', b)).data.data);
export const doUpdateEmployee   = th<Employee, any>(
  'updateEmployee', async ({ id, ...b }) => (await hrApi.put(`/employees/${id}`, b)).data.data);
export const doDeactivate       = th<Employee, { id: string; reason?: string }>(
  'deactivate', async ({ id, reason }) => (await hrApi.post(`/employees/${id}/deactivate`, { reason })).data.data);

export const fetchAttendance    = th<{ data: AttendanceRecord[]; total: number }, Record<string, any>>(
  'attendance', async (p) => (await hrApi.get('/attendance', { params: p })).data.data);
export const doCheckIn          = th<AttendanceRecord, any>(
  'checkIn', async (b) => (await hrApi.post('/attendance/check-in', b)).data.data);
export const doCheckOut         = th<AttendanceRecord, any>(
  'checkOut', async (b) => (await hrApi.post('/attendance/check-out', b)).data.data);

export const fetchLeaves        = th<{ data: LeaveRequest[]; total: number }, Record<string, any>>(
  'leaves', async (p) => (await hrApi.get('/leaves', { params: p })).data.data);
export const doRequestLeave     = th<LeaveRequest, any>(
  'requestLeave', async (b) => (await hrApi.post('/leaves', b)).data.data);
export const doApproveLeave     = th<LeaveRequest, { id: string; actorType?: string; note?: string }>(
  'approveLeave', async ({ id, ...b }) => (await hrApi.put(`/leaves/${id}/approve`, b)).data.data);
export const doRejectLeave      = th<LeaveRequest, { id: string; actorType?: string; note?: string }>(
  'rejectLeave', async ({ id, ...b }) => (await hrApi.put(`/leaves/${id}/reject`, b)).data.data);

export const fetchPayrolls      = th<{ data: PayrollRecord[]; total: number }, Record<string, any>>(
  'payrolls', async (p) => (await hrApi.get('/payroll', { params: p })).data.data);
export const doGeneratePayroll  = th<PayrollRecord, any>(
  'generatePayroll', async (b) => (await hrApi.post('/payroll/generate', b)).data.data);

export const fetchPerformance   = th<PerformanceRecord[], Record<string, any>>(
  'performance', async (p) => (await hrApi.get('/performance', { params: p })).data.data);

export const fetchTrainings     = th<Training[], void>(
  'trainings', async () => (await hrApi.get('/training')).data.data);
export const doCreateTraining   = th<Training, any>(
  'createTraining', async (b) => (await hrApi.post('/training', b)).data.data);
export const doEnroll           = th<any, { trainingId: string; employeeId?: string }>(
  'enroll', async ({ trainingId, employeeId }) => (await hrApi.post(`/training/${trainingId}/enroll`, { employeeId })).data.data);

export const fetchAnnouncements = th<{ data: Announcement[]; total: number }, Record<string, any>>(
  'announcements', async (p) => (await hrApi.get('/announcements', { params: p })).data.data);
export const doCreateAnnouncement = th<Announcement, any>(
  'createAnnouncement', async (b) => (await hrApi.post('/announcements', b)).data.data);

// ── Slice ─────────────────────────────────────────────────────────────────────

const patchLeave = (state: HRState, updated: LeaveRequest) => {
  const i = state.leaves.data.findIndex(x => x.id === updated.id);
  if (i !== -1) state.leaves.data[i] = updated;
};

const hrSlice = createSlice({
  name: 'hr',
  initialState: init,
  reducers: {
    clearError : s => { s.error = null; },
    clearEmployee: s => { s.employee = null; },
  },
  extraReducers: b => {
    const pend = (k: string) => (s: HRState) => { s.loading[k] = true;  s.error = null; };
    const done = (k: string) => (s: HRState) => { s.loading[k] = false; };
    const fail = (k: string) => (s: HRState, a: any) => {
      s.loading[k] = false; s.error = a.error.message ?? 'Error';
    };

    b
      .addCase(fetchDashboard.pending,   pend('dashboard'))
      .addCase(fetchDashboard.fulfilled, (s, a) => { s.loading.dashboard = false; s.dashboard = a.payload as any; })
      .addCase(fetchDashboard.rejected,  fail('dashboard'))

      .addCase(fetchEmployees.pending,   pend('employees'))
      .addCase(fetchEmployees.fulfilled, (s, a) => { s.loading.employees = false; s.employees = a.payload; })
      .addCase(fetchEmployees.rejected,  fail('employees'))

      .addCase(fetchEmployee.fulfilled,  (s, a) => { s.employee = a.payload; })

      .addCase(doCreateEmployee.fulfilled, (s, a) => {
        s.employees.data.unshift(a.payload); s.employees.total++;
      })
      .addCase(doUpdateEmployee.fulfilled, (s, a) => {
        const i = s.employees.data.findIndex(x => x.id === a.payload.id);
        if (i !== -1) s.employees.data[i] = a.payload;
        if (s.employee?.id === a.payload.id) s.employee = a.payload;
      })

      .addCase(fetchAttendance.pending,   pend('attendance'))
      .addCase(fetchAttendance.fulfilled, (s, a) => { s.loading.attendance = false; s.attendance = a.payload; })
      .addCase(fetchAttendance.rejected,  fail('attendance'))
      .addCase(doCheckIn.fulfilled,  (s, a) => { s.attendance.data.unshift(a.payload as any); })
      .addCase(doCheckOut.fulfilled, (s, a) => {
        const r = a.payload as any;
        const i = s.attendance.data.findIndex(x => x.id === r.id);
        if (i !== -1) s.attendance.data[i] = r;
      })

      .addCase(fetchLeaves.pending,   pend('leaves'))
      .addCase(fetchLeaves.fulfilled, (s, a) => { s.loading.leaves = false; s.leaves = a.payload; })
      .addCase(fetchLeaves.rejected,  fail('leaves'))
      .addCase(doRequestLeave.fulfilled, (s, a) => { s.leaves.data.unshift(a.payload as any); s.leaves.total++; })
      .addCase(doApproveLeave.fulfilled, (s, a) => patchLeave(s, a.payload as any))
      .addCase(doRejectLeave.fulfilled,  (s, a) => patchLeave(s, a.payload as any))

      .addCase(fetchPayrolls.pending,   pend('payrolls'))
      .addCase(fetchPayrolls.fulfilled, (s, a) => { s.loading.payrolls = false; s.payrolls = a.payload; })
      .addCase(fetchPayrolls.rejected,  fail('payrolls'))
      .addCase(doGeneratePayroll.fulfilled, (s, a) => {
        const p = a.payload as any;
        const i = s.payrolls.data.findIndex(x => x.id === p.id);
        if (i !== -1) s.payrolls.data[i] = p; else s.payrolls.data.unshift(p);
      })

      .addCase(fetchPerformance.fulfilled, (s, a) => { s.performance = a.payload; })

      .addCase(fetchTrainings.pending,   pend('trainings'))
      .addCase(fetchTrainings.fulfilled, (s, a) => { s.loading.trainings = false; s.trainings = a.payload; })
      .addCase(fetchTrainings.rejected,  fail('trainings'))
      .addCase(doCreateTraining.fulfilled, (s, a) => { s.trainings.unshift(a.payload as any); })

      .addCase(fetchAnnouncements.pending,   pend('announcements'))
      .addCase(fetchAnnouncements.fulfilled, (s, a) => { s.loading.announcements = false; s.announcements = a.payload; })
      .addCase(fetchAnnouncements.rejected,  fail('announcements'))
      .addCase(doCreateAnnouncement.fulfilled, (s, a) => { s.announcements.data.unshift(a.payload as any); s.announcements.total++; });
  },
});

export const { clearError, clearEmployee } = hrSlice.actions;
export default hrSlice.reducer;
