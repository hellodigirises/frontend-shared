import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Stack, Button, Grid, Chip, Card, Avatar,
  TextField, FormControl, InputLabel, Select, MenuItem, LinearProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider,
  IconButton, Tab, Tabs, Badge
} from '@mui/material';
import {
  AddOutlined, CheckCircleOutlined, CancelOutlined, CloseOutlined,
  AccessTimeOutlined, CalendarMonthOutlined, EventBusyOutlined,
  MedicalServicesOutlined, BeachAccessOutlined, DownloadOutlined,
} from '@mui/icons-material';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const FONT = "'Cormorant Garamond', 'Georgia', serif";
const BODY = "'Mulish', 'system-ui', sans-serif";

// ─── Types ─────────────────────────────────────────────────────────────────────
type LeaveType   = 'Casual' | 'Sick' | 'Earned' | 'Half Day';
type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

interface LeaveRequest {
  id: string; empId: string; empName: string; dept: string;
  type: LeaveType; startDate: string; endDate: string; days: number;
  reason: string; status: LeaveStatus; appliedOn: string; manager?: string;
}

// ─── Config ────────────────────────────────────────────────────────────────────
const LEAVE_CFG: Record<LeaveType, { color: string; bg: string; icon: React.ReactNode }> = {
  Casual:      { color: '#2563eb', bg: '#eff6ff', icon: <BeachAccessOutlined sx={{ fontSize: 14 }} /> },
  Sick:        { color: '#dc2626', bg: '#fef2f2', icon: <MedicalServicesOutlined sx={{ fontSize: 14 }} /> },
  Earned:      { color: '#059669', bg: '#f0fdf4', icon: <CalendarMonthOutlined sx={{ fontSize: 14 }} /> },
  'Half Day':  { color: '#7c3aed', bg: '#f5f3ff', icon: <AccessTimeOutlined sx={{ fontSize: 14 }} /> },
};

const STATUS_CFG: Record<LeaveStatus, { color: string; bg: string; dot: string }> = {
  Pending:  { color: '#d97706', bg: '#fffbeb', dot: '#f59e0b' },
  Approved: { color: '#16a34a', bg: '#f0fdf4', dot: '#22c55e' },
  Rejected: { color: '#dc2626', bg: '#fef2f2', dot: '#ef4444' },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const avatarBg = (n: string) => ['#be185d','#7c3aed','#059669','#d97706','#2563eb'][n.charCodeAt(0) % 5];
const initials  = (n: string) => n.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const LEAVE_REQUESTS: LeaveRequest[] = [
  { id: 'L1', empId: 'EMP-001', empName: 'Rahul Sharma',  dept: 'Sales',     type: 'Casual',   startDate: '2025-06-16', endDate: '2025-06-17', days: 2,   reason: 'Personal work',     status: 'Pending',  appliedOn: '2025-06-12', manager: 'Priya Mehta' },
  { id: 'L2', empId: 'EMP-003', empName: 'Arjun Singh',   dept: 'Sales',     type: 'Sick',     startDate: '2025-06-10', endDate: '2025-06-10', days: 1,   reason: 'Fever',             status: 'Approved', appliedOn: '2025-06-10', manager: 'Priya Mehta' },
  { id: 'L3', empId: 'EMP-005', empName: 'Rohan Gupta',   dept: 'Marketing', type: 'Earned',   startDate: '2025-06-08', endDate: '2025-06-12', days: 5,   reason: 'Family vacation',   status: 'Approved', appliedOn: '2025-06-03' },
  { id: 'L4', empId: 'EMP-007', empName: 'Vikram Das',    dept: 'Sales',     type: 'Half Day', startDate: '2025-06-14', endDate: '2025-06-14', days: 0.5, reason: 'Doctor appointment',status: 'Pending',  appliedOn: '2025-06-13', manager: 'Priya Mehta' },
  { id: 'L5', empId: 'EMP-006', empName: 'Sneha Patel',   dept: 'Finance',   type: 'Casual',   startDate: '2025-06-20', endDate: '2025-06-21', days: 2,   reason: 'Personal',          status: 'Rejected', appliedOn: '2025-06-11' },
  { id: 'L6', empId: 'EMP-002', empName: 'Priya Mehta',   dept: 'Sales',     type: 'Sick',     startDate: '2025-06-05', endDate: '2025-06-06', days: 2,   reason: 'Medical leave',     status: 'Approved', appliedOn: '2025-06-04' },
  { id: 'L7', empId: 'EMP-004', empName: 'Kavita Joshi',  dept: 'HR',        type: 'Earned',   startDate: '2025-07-01', endDate: '2025-07-03', days: 3,   reason: 'Annual leave',      status: 'Pending',  appliedOn: '2025-06-14' },
];

// ─── Leave Balance Strip ───────────────────────────────────────────────────────
const BalanceCard: React.FC<{ label: string; used: number; total: number; color: string }> = ({ label, used, total, color }) => (
  <Card sx={{ p: 2.5, borderRadius: 3.5, border: '1px solid', borderColor: `${color}20`, boxShadow: 'none', bgcolor: `${color}06` }}>
    <Typography sx={{ fontSize: 10, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, fontFamily: BODY }}>{label}</Typography>
    <Stack direction="row" alignItems="flex-end" spacing={0.5} mt={0.5} mb={1.2}>
      <Typography sx={{ fontFamily: FONT, fontSize: 28, fontWeight: 700, color, letterSpacing: -1, lineHeight: 1 }}>{total - used}</Typography>
      <Typography sx={{ fontFamily: BODY, fontSize: 11, color: '#9ca3af', mb: 0.3 }}>/ {total} remaining</Typography>
    </Stack>
    <LinearProgress variant="determinate" value={((total - used) / total) * 100}
      sx={{ height: 5, borderRadius: 3, bgcolor: `${color}18`, '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 } }} />
  </Card>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
const LeavePage: React.FC = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>(LEAVE_REQUESTS);
  const [tab, setTab]           = useState(0);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [applyOpen, setApplyOpen]   = useState(false);
  const [form, setForm]             = useState<Partial<LeaveRequest>>({ type: 'Casual' });

  const filtered = useMemo(() => requests.filter(r =>
    (tab === 0 ? true : tab === 1 ? r.status === 'Pending' : tab === 2 ? r.status === 'Approved' : r.status === 'Rejected') &&
    (typeFilter === 'ALL' || r.type === typeFilter)
  ), [requests, tab, typeFilter]);

  const stats = {
    pending:   requests.filter(r => r.status === 'Pending').length,
    approved:  requests.filter(r => r.status === 'Approved').length,
    rejected:  requests.filter(r => r.status === 'Rejected').length,
    totalDays: requests.filter(r => r.status === 'Approved').reduce((s, r) => s + r.days, 0),
  };

  const approve = (id: string) => setRequests(p => p.map(r => r.id === id ? { ...r, status: 'Approved' as LeaveStatus } : r));
  const reject  = (id: string) => setRequests(p => p.map(r => r.id === id ? { ...r, status: 'Rejected' as LeaveStatus } : r));

  const applyLeave = () => {
    if (!form.empName || !form.startDate) return;
    const newReq: LeaveRequest = {
      ...(form as LeaveRequest),
      id: `L${Date.now()}`,
      appliedOn: new Date().toISOString().split('T')[0],
      status: 'Pending',
      days: form.endDate ? Math.max(1, Math.round((new Date(form.endDate).getTime() - new Date(form.startDate!).getTime()) / 86400000) + 1) : 1,
    };
    setRequests(p => [...p, newReq]);
    setApplyOpen(false);
    setForm({ type: 'Casual' });
  };

  return (
    <Box sx={{ bgcolor: '#faf8ff', minHeight: '100vh', pb: 8, fontFamily: BODY }}>

      {/* ── HEADER ── */}
      <Box sx={{
        px: { xs: 3, md: 5 }, pt: 5, pb: 4,
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1240 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', top: -60, right: -60, width: 260, height: 260, borderRadius: '50%', bgcolor: '#818cf820', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -40, left: '40%', width: 180, height: 180, borderRadius: '50%', bgcolor: '#c4b5fd10', pointerEvents: 'none' }} />
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'flex-end' }} spacing={3}>
          <Box>
            <Typography sx={{ fontFamily: FONT, fontSize: 42, fontWeight: 700, color: 'white', letterSpacing: -1.5, lineHeight: 0.9 }}>Leave</Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: 42, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1, color: '#a5b4fc' }}>Management</Typography>
            <Typography sx={{ fontFamily: BODY, fontSize: 13, color: '#818cf860', mt: 1.5 }}>
              Approval workflow · Balance tracking · Multi-type support
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button startIcon={<DownloadOutlined />}
              sx={{ textTransform: 'none', fontWeight: 700, fontFamily: BODY, borderRadius: 2.5, color: '#a5b4fc80', border: '1px solid #312e81', '&:hover': { bgcolor: '#312e81', color: '#a5b4fc' } }}>
              Export
            </Button>
            <Button variant="contained" startIcon={<AddOutlined />} onClick={() => setApplyOpen(true)}
              sx={{ textTransform: 'none', fontWeight: 800, fontFamily: BODY, borderRadius: 2.5, bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, boxShadow: '0 4px 14px #6366f140' }}>
              Apply Leave
            </Button>
          </Stack>
        </Stack>

        {/* Stats tiles */}
        <Grid container spacing={2} mt={3}>
          {[
            { label: 'Pending Approval', value: stats.pending,   color: '#fde68a' },
            { label: 'Approved',         value: stats.approved,  color: '#86efac' },
            { label: 'Rejected',         value: stats.rejected,  color: '#fca5a5' },
            { label: 'Total Days Off',   value: `${stats.totalDays}d`, color: '#c4b5fd' },
          ].map(s => (
            <Grid item xs={6} sm={3} key={s.label}>
              <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Typography sx={{ fontSize: 9.5, fontWeight: 800, color: '#6366f160', textTransform: 'uppercase', letterSpacing: 1, fontFamily: BODY }}>{s.label}</Typography>
                <Typography sx={{ fontFamily: FONT, fontSize: 30, fontWeight: 700, color: s.color, letterSpacing: -1, lineHeight: 1.1, mt: 0.3 }}>{s.value}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ── LEAVE BALANCE ── */}
      <Box sx={{ px: { xs: 3, md: 5 }, pt: 3, pb: 1 }}>
        <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, fontFamily: BODY, mb: 1.5 }}>
          Your Leave Balance — FY 2025
        </Typography>
        <Grid container spacing={2} mb={1}>
          {[
            { label: 'Casual Leave',  used: 2,  total: 12, color: '#2563eb' },
            { label: 'Sick Leave',    used: 1,  total: 6,  color: '#dc2626' },
            { label: 'Earned Leave',  used: 5,  total: 24, color: '#059669' },
            { label: 'Half Days',     used: 0.5,total: 4,  color: '#7c3aed' },
          ].map(b => (
            <Grid item xs={6} sm={3} key={b.label}>
              <BalanceCard {...b} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ── STICKY TOOLBAR ── */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e5e7eb', px: { xs: 3, md: 5 }, position: 'sticky', top: 0, zIndex: 10 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}
            sx={{
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontFamily: BODY, minHeight: 48, fontSize: 13 },
              '& .MuiTabs-indicator': { bgcolor: '#6366f1', height: 2.5, borderRadius: 2 },
              '& .Mui-selected': { color: '#6366f1 !important' },
            }}>
            <Tab label={`All (${requests.length})`} />
            <Tab label={
              <Badge badgeContent={stats.pending} color="warning" sx={{ '& .MuiBadge-badge': { fontSize: 9 } }}>
                <Box pr={stats.pending > 0 ? 1.5 : 0}>Pending</Box>
              </Badge>
            } />
            <Tab label={`Approved (${stats.approved})`} />
            <Tab label={`Rejected (${stats.rejected})`} />
          </Tabs>
          <FormControl size="small" sx={{ minWidth: 130, my: 1 }}>
            <InputLabel sx={{ fontFamily: BODY }}>Leave Type</InputLabel>
            <Select value={typeFilter} label="Leave Type" onChange={e => setTypeFilter(e.target.value)} sx={{ borderRadius: 2.5, fontFamily: BODY }}>
              <MenuItem value="ALL" sx={{ fontFamily: BODY }}>All Types</MenuItem>
              {(['Casual', 'Sick', 'Earned', 'Half Day'] as LeaveType[]).map(t => (
                <MenuItem key={t} value={t} sx={{ fontFamily: BODY }}>{t}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>

      {/* ── LEAVE REQUEST CARDS ── */}
      <Box sx={{ px: { xs: 3, md: 5 }, pt: 3 }}>
        <Stack spacing={2}>
          {filtered.map(r => {
            const lc = LEAVE_CFG[r.type];
            const sc = STATUS_CFG[r.status];
            return (
              <Card key={r.id} sx={{
                p: 3, borderRadius: 4, border: '1px solid', borderColor: `${lc.color}20`,
                boxShadow: 'none', transition: 'all 0.2s',
                '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.06)', transform: 'translateX(3px)' }
              }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} alignItems={{ md: 'center' }}>
                  {/* Employee + leave info */}
                  <Stack direction="row" spacing={2} alignItems="center" flex={1}>
                    <Avatar sx={{ width: 46, height: 46, bgcolor: avatarBg(r.empName), fontWeight: 800, fontFamily: BODY, fontSize: 15, flexShrink: 0 }}>
                      {initials(r.empName)}
                    </Avatar>
                    <Box flex={1}>
                      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" mb={0.4}>
                        <Typography sx={{ fontFamily: BODY, fontWeight: 800, fontSize: 14, color: '#111827' }}>{r.empName}</Typography>
                        <Chip label={r.dept} size="small" sx={{ fontSize: 9.5, height: 18, bgcolor: '#f3f4f6', color: '#6b7280', fontWeight: 700, fontFamily: BODY }} />
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.2, py: 0.3, borderRadius: 1.5, bgcolor: lc.bg, color: lc.color }}>
                          {lc.icon}
                          <Typography sx={{ fontSize: 10.5, fontWeight: 800, fontFamily: BODY }}>{r.type} Leave</Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={2.5} flexWrap="wrap">
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <CalendarMonthOutlined sx={{ fontSize: 12, color: '#9ca3af' }} />
                          <Typography sx={{ fontSize: 12, color: '#6b7280', fontFamily: BODY }}>
                            {new Date(r.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            {r.startDate !== r.endDate && ` – ${new Date(r.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                            &nbsp;·&nbsp;<Box component="span" sx={{ fontWeight: 800, color: '#374151' }}>{r.days} day{r.days > 1 ? 's' : ''}</Box>
                          </Typography>
                        </Stack>
                        <Typography sx={{ fontSize: 12, color: '#9ca3af', fontFamily: BODY, fontStyle: 'italic' }}>{r.reason}</Typography>
                        {r.manager && (
                          <Typography sx={{ fontSize: 11.5, color: '#9ca3af', fontFamily: BODY }}>Manager: {r.manager}</Typography>
                        )}
                      </Stack>
                    </Box>
                  </Stack>

                  {/* Status + actions */}
                  <Stack direction="row" spacing={1.5} alignItems="center" flexShrink={0}>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6, px: 1.5, py: 0.6, borderRadius: 2, bgcolor: sc.bg }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: sc.dot }} />
                      <Typography sx={{ fontSize: 11, fontWeight: 800, color: sc.color, fontFamily: BODY }}>{r.status}</Typography>
                    </Box>
                    {r.status === 'Pending' && (
                      <>
                        <Button size="small" variant="contained" color="success" onClick={() => approve(r.id)}
                          sx={{ textTransform: 'none', fontWeight: 700, fontFamily: BODY, fontSize: 11.5, borderRadius: 2, boxShadow: 'none', minWidth: 80 }}>
                          ✓ Approve
                        </Button>
                        <Button size="small" variant="outlined" color="error" onClick={() => reject(r.id)}
                          sx={{ textTransform: 'none', fontWeight: 700, fontFamily: BODY, fontSize: 11.5, borderRadius: 2, minWidth: 72 }}>
                          ✕ Reject
                        </Button>
                      </>
                    )}
                  </Stack>
                </Stack>
              </Card>
            );
          })}
          {filtered.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <EventBusyOutlined sx={{ fontSize: 60, color: '#e5e7eb' }} />
              <Typography sx={{ fontFamily: BODY, color: '#9ca3af', fontWeight: 700, mt: 1.5 }}>No leave requests found</Typography>
            </Box>
          )}
        </Stack>
      </Box>

      {/* ── APPLY LEAVE DIALOG ── */}
      <Dialog open={applyOpen} onClose={() => setApplyOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}>
        <Box sx={{ height: 5, background: 'linear-gradient(90deg, #6366f1, #a78bfa)' }} />
        <DialogTitle sx={{ fontFamily: FONT, fontSize: 24, fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Apply for Leave
          <IconButton onClick={() => setApplyOpen(false)}><CloseOutlined /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={0.5}>
            <Grid item xs={12}>
              <TextField label="Employee Name" size="small" fullWidth value={form.empName || ''}
                onChange={e => setForm(p => ({ ...p, empName: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, fontFamily: BODY } }} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Department" size="small" fullWidth value={form.dept || ''}
                onChange={e => setForm(p => ({ ...p, dept: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, fontFamily: BODY } }} />
            </Grid>
            <Grid item xs={12}>
              <FormControl size="small" fullWidth>
                <InputLabel sx={{ fontFamily: BODY }}>Leave Type</InputLabel>
                <Select value={form.type || 'Casual'} label="Leave Type"
                  onChange={e => setForm(p => ({ ...p, type: e.target.value as LeaveType }))}
                  sx={{ borderRadius: 2.5, fontFamily: BODY }}>
                  {(['Casual', 'Sick', 'Earned', 'Half Day'] as LeaveType[]).map(t => (
                    <MenuItem key={t} value={t} sx={{ fontFamily: BODY }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ color: LEAVE_CFG[t].color }}>{LEAVE_CFG[t].icon}</Box>
                        {t} Leave
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField label="From Date" size="small" fullWidth type="date" InputLabelProps={{ shrink: true }}
                value={form.startDate || ''} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, fontFamily: BODY } }} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="To Date" size="small" fullWidth type="date" InputLabelProps={{ shrink: true }}
                value={form.endDate || ''} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, fontFamily: BODY } }} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Reason for Leave" size="small" fullWidth multiline rows={3}
                value={form.reason || ''} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, fontFamily: BODY } }} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setApplyOpen(false)} sx={{ textTransform: 'none', fontWeight: 700, fontFamily: BODY, color: '#6b7280' }}>Cancel</Button>
          <Button variant="contained" onClick={applyLeave} disabled={!form.empName || !form.startDate}
            sx={{ textTransform: 'none', fontWeight: 800, fontFamily: BODY, borderRadius: 2.5, bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, boxShadow: 'none' }}>
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeavePage;