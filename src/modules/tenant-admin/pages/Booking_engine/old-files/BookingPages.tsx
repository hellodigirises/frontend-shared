import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Stack, Grid, Card, Button, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  FormControl, InputLabel, Select, MenuItem, TextField,
  InputAdornment, IconButton, Tooltip, Chip, LinearProgress, Tab, Tabs, Avatar
} from '@mui/material';
import {
  DownloadOutlined, SearchOutlined, CheckCircleOutlined, WarningAmberOutlined,
  AccessTimeOutlined, AttachMoneyOutlined, BarChartOutlined, TrendingUpOutlined,
  PersonOutlined, HomeOutlined, PieChartOutlined, RefreshOutlined,
  CalendarMonthOutlined, AccountBalanceOutlined, CancelOutlined
} from '@mui/icons-material';

// ─── Tokens ────────────────────────────────────────────────────────────────────
const T = {
  display: "'Fraunces', 'Georgia', serif",
  body:    "'Satoshi', 'DM Sans', sans-serif",
  gold:    '#c9a84c',
  dark:    '#0f1117',
  surface: '#161b22',
  card:    '#1c2128',
  border:  '#21262d',
  text:    '#f0f6fc',
  muted:   '#8b949e',
  sub:     '#6e7681',
  accent:  '#2ea043',
  blue:    '#388bfd',
  red:     '#f85149',
  warn:    '#d29922',
  purple:  '#bc8cff',
};
const fmtINR   = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const fmtCr    = (n: number) => n >= 10000000 ? `₹${(n/10000000).toFixed(2)}Cr` : n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${(n/1000).toFixed(0)}K`;
const avatarBg = (s: string) => [T.gold, T.accent, T.blue, T.purple, '#e06c75'][s.charCodeAt(0) % 5];
const initials  = (s: string) => s.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

const INST_STATUS: Record<string, { color: string; bg: string; dot: string }> = {
  PAID:     { color: T.accent, bg: '#1a3d2b', dot: T.accent },
  PENDING:  { color: T.warn,   bg: '#2d2109', dot: T.warn },
  OVERDUE:  { color: T.red,    bg: '#2d1216', dot: T.red },
  PARTIAL:  { color: T.blue,   bg: '#0d2137', dot: T.blue },
};

// ─── Shared KPI ────────────────────────────────────────────────────────────────
const BKpi: React.FC<{ label: string; value: string | number; sub?: string; color: string; icon: React.ReactNode }> = ({ label, value, sub, color, icon }) => (
  <Card sx={{ p: 3, borderRadius: 3, bgcolor: T.card, border: `1px solid ${T.border}`, boxShadow: 'none', position: 'relative', overflow: 'hidden', transition: 'all 0.2s', '&:hover': { borderColor: color + '60', transform: 'translateY(-2px)' } }}>
    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${color}, ${color}80)` }} />
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
      <Box>
        <Typography sx={{ fontFamily: T.body, fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: 1.2 }}>{label}</Typography>
        <Typography sx={{ fontFamily: T.display, fontSize: 28, fontWeight: 600, color, letterSpacing: -1.2, lineHeight: 1.1, mt: 0.5 }}>{value}</Typography>
        {sub && <Typography sx={{ fontFamily: T.body, fontSize: 11.5, color: T.sub, mt: 0.5 }}>{sub}</Typography>}
      </Box>
      <Box sx={{ width: 40, height: 40, borderRadius: 2.5, bgcolor: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>{icon}</Box>
    </Stack>
  </Card>
);

// ─── Shared Header ─────────────────────────────────────────────────────────────
const BHeader: React.FC<{ title: string; tag: string; subtitle: string; accent?: string; actions?: React.ReactNode }> = ({ title, tag, subtitle, accent = T.gold, actions }) => (
  <Box sx={{ px: { xs: 3, md: 5 }, pt: 5, pb: 4, borderBottom: `1px solid ${T.border}`, bgcolor: T.surface, position: 'relative', overflow: 'hidden' }}>
    <Box sx={{ position: 'absolute', top: -60, right: -60, width: 260, height: 260, borderRadius: '50%', bgcolor: accent + '0a', filter: 'blur(50px)', pointerEvents: 'none' }} />
    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'flex-end' }} spacing={3} sx={{ position: 'relative' }}>
      <Box>
        <Box sx={{ mb: 1.5, display: 'inline-flex', px: 1.5, py: 0.4, borderRadius: 1.5, bgcolor: accent + '20', border: `1px solid ${accent}40` }}>
          <Typography sx={{ fontFamily: T.body, fontSize: 10, fontWeight: 800, color: accent, textTransform: 'uppercase', letterSpacing: 1.5 }}>{tag}</Typography>
        </Box>
        <Typography sx={{ fontFamily: T.display, fontSize: 36, fontWeight: 600, color: T.text, letterSpacing: -1.5, lineHeight: 1 }}>{title}</Typography>
        <Typography sx={{ fontFamily: T.body, fontSize: 13, color: T.muted, mt: 0.8 }}>{subtitle}</Typography>
      </Box>
      {actions}
    </Stack>
  </Box>
);

// ═══════════════════════════════════════════════════════════════════════════════
// PAYMENT SCHEDULE PAGE
// ═══════════════════════════════════════════════════════════════════════════════
interface Installment {
  id: string; bookingNo: string; customerName: string; project: string;
  unit: string; installmentName: string; amount: number; dueDate: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'PARTIAL'; paidOn?: string; paidAmount?: number;
}

const ALL_INSTALLMENTS: Installment[] = [
  { id:'I1', bookingNo:'BK-2026-001', customerName:'Rahul Sharma',  project:'Skyline Heights', unit:'A-302', installmentName:'Booking Amount',       amount:500000,  dueDate:'12 Apr 2026', status:'PAID',    paidOn:'12 Apr 2026', paidAmount:500000 },
  { id:'I2', bookingNo:'BK-2026-001', customerName:'Rahul Sharma',  project:'Skyline Heights', unit:'A-302', installmentName:'Agreement Amount',     amount:1300000, dueDate:'12 May 2026', status:'PAID',    paidOn:'10 May 2026', paidAmount:1300000 },
  { id:'I3', bookingNo:'BK-2026-001', customerName:'Rahul Sharma',  project:'Skyline Heights', unit:'A-302', installmentName:'Foundation Stage',     amount:1700000, dueDate:'12 Jul 2026', status:'PENDING' },
  { id:'I4', bookingNo:'BK-2026-002', customerName:'Sunita Verma',  project:'Orchid Residency',unit:'B-504', installmentName:'Booking Amount',       amount:800000,  dueDate:'10 Apr 2026', status:'PAID',    paidOn:'10 Apr 2026', paidAmount:800000 },
  { id:'I5', bookingNo:'BK-2026-002', customerName:'Sunita Verma',  project:'Orchid Residency',unit:'B-504', installmentName:'Down Payment',         amount:3000000, dueDate:'25 Apr 2026', status:'PENDING' },
  { id:'I6', bookingNo:'BK-2026-004', customerName:'Meena Shah',    project:'Green Valley',    unit:'A-201', installmentName:'Foundation Stage',     amount:960000,  dueDate:'05 Mar 2026', status:'OVERDUE' },
  { id:'I7', bookingNo:'BK-2026-004', customerName:'Meena Shah',    project:'Green Valley',    unit:'A-201', installmentName:'Structure Completion', amount:1200000, dueDate:'05 Jun 2026', status:'PENDING' },
  { id:'I8', bookingNo:'BK-2026-007', customerName:'Amit Tiwari',   project:'Skyline Heights', unit:'B-801', installmentName:'Brickwork Stage',      amount:2200000, dueDate:'01 Apr 2026', status:'OVERDUE' },
  { id:'I9', bookingNo:'BK-2026-007', customerName:'Amit Tiwari',   project:'Skyline Heights', unit:'B-801', installmentName:'Possession Amount',    amount:3300000, dueDate:'01 Apr 2027', status:'PENDING' },
];

export const PaymentSchedulePage: React.FC = () => {
  const [installments, setInstallments] = useState<Installment[]>(ALL_INSTALLMENTS);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [projectFilter, setProjectFilter] = useState('ALL');

  const filtered = useMemo(() => installments.filter(i =>
    (!search || i.customerName.toLowerCase().includes(search.toLowerCase()) || i.bookingNo.toLowerCase().includes(search.toLowerCase()) || i.unit.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter  === 'ALL' || i.status  === statusFilter) &&
    (projectFilter === 'ALL' || i.project === projectFilter)
  ), [installments, search, statusFilter, projectFilter]);

  const stats = useMemo(() => ({
    totalDue:  installments.reduce((s, i) => s + i.amount, 0),
    collected: installments.filter(i => i.status === 'PAID').reduce((s, i) => s + i.amount, 0),
    pending:   installments.filter(i => i.status === 'PENDING').reduce((s, i) => s + i.amount, 0),
    overdue:   installments.filter(i => i.status === 'OVERDUE').reduce((s, i) => s + i.amount, 0),
    overdueCount: installments.filter(i => i.status === 'OVERDUE').length,
  }), [installments]);

  const projects = [...new Set(installments.map(i => i.project))];
  const markPaid = (id: string) => setInstallments(p => p.map(i => i.id === id ? { ...i, status: 'PAID' as const, paidOn: new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }), paidAmount: i.amount } : i));

  const selectSx = { borderRadius: 2.5, bgcolor: T.card, color: T.text, minWidth: 140, '& .MuiOutlinedInput-notchedOutline': { borderColor: T.border }, '& .MuiSvgIcon-root': { color: T.muted }, '& .MuiSelect-select': { color: T.text } };

  return (
    <Box sx={{ bgcolor: T.dark, minHeight: '100vh', pb: 8 }}>
      <BHeader title="Payment Schedule" tag="Installment Tracker" subtitle={`${installments.length} installments · ${stats.overdueCount} overdue · auto-detection active`} accent={T.warn}
        actions={<Button startIcon={<DownloadOutlined />} sx={{ textTransform: 'none', fontWeight: 700, fontFamily: T.body, borderRadius: 2.5, border: `1px solid ${T.border}`, color: T.muted, '&:hover': { color: T.gold, borderColor: T.gold } }}>Export Schedule</Button>}
      />

      <Box sx={{ px: { xs: 3, md: 5 }, pt: 4 }}>
        <Grid container spacing={2.5} mb={4}>
          {[
            { label: 'Total Scheduled', value: fmtCr(stats.totalDue),  sub: `${installments.length} installments`, color: T.gold,   icon: <CalendarMonthOutlined /> },
            { label: 'Collected',        value: fmtCr(stats.collected), sub: `${installments.filter(i=>i.status==='PAID').length} paid`, color: T.accent, icon: <CheckCircleOutlined /> },
            { label: 'Pending',          value: fmtCr(stats.pending),   sub: `${installments.filter(i=>i.status==='PENDING').length} upcoming`, color: T.warn, icon: <AccessTimeOutlined /> },
            { label: 'Overdue',          value: fmtCr(stats.overdue),   sub: `${stats.overdueCount} need action`, color: T.red, icon: <WarningAmberOutlined /> },
          ].map(k => <Grid item xs={6} sm={3} key={k.label}><BKpi {...k} /></Grid>)}
        </Grid>

        {/* Overdue banner */}
        {stats.overdueCount > 0 && (
          <Box sx={{ p: 2, mb: 3, borderRadius: 2.5, bgcolor: T.red + '10', border: `1px solid ${T.red}30`, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <WarningAmberOutlined sx={{ color: T.red, fontSize: 18 }} />
            <Typography sx={{ fontFamily: T.body, fontSize: 13, color: T.red, fontWeight: 700 }}>
              {stats.overdueCount} installments are overdue totalling {fmtCr(stats.overdue)} — immediate follow-up required
            </Typography>
          </Box>
        )}

        {/* Filters */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} mb={2.5} alignItems={{ sm: 'center' }}>
          <TextField placeholder="Search customer, booking, unit…" size="small" value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined sx={{ fontSize: 16, color: T.muted }} /></InputAdornment>, sx: { borderRadius: 2.5, bgcolor: T.card, '& fieldset': { borderColor: T.border }, '&:hover fieldset': { borderColor: T.gold + '40' } } }}
            sx={{ flex: 1, maxWidth: 300, '& .MuiInputBase-input': { color: T.text }, '& .MuiInputBase-input::placeholder': { color: T.sub } }} />
          <FormControl size="small"><InputLabel sx={{ color: `${T.muted} !important` }}>Status</InputLabel><Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)} sx={selectSx}><MenuItem value="ALL">All</MenuItem>{['PAID','PENDING','OVERDUE','PARTIAL'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}</Select></FormControl>
          <FormControl size="small"><InputLabel sx={{ color: `${T.muted} !important` }}>Project</InputLabel><Select value={projectFilter} label="Project" onChange={e => setProjectFilter(e.target.value)} sx={selectSx}><MenuItem value="ALL">All Projects</MenuItem>{projects.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}</Select></FormControl>
          <Typography sx={{ fontFamily: T.body, fontSize: 12, color: T.muted, flexShrink: 0 }}>{filtered.length} records</Typography>
        </Stack>

        <Card sx={{ borderRadius: 3, bgcolor: T.surface, border: `1px solid ${T.border}`, boxShadow: 'none', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#0d1117' }}>
                  {['Booking No.','Customer','Installment','Amount','Due Date','Paid On','Status','Action'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 800, fontSize: 10.5, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: T.body, py: 1.8, borderBottom: `1px solid ${T.border}` }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map(inst => {
                  const sc = INST_STATUS[inst.status] || INST_STATUS.PENDING;
                  return (
                    <TableRow key={inst.id} hover sx={{ '& td': { py: 1.6, borderBottom: `1px solid ${T.border}`, fontFamily: T.body }, '&:hover': { bgcolor: T.card } }}>
                      <TableCell><Typography sx={{ fontFamily: 'monospace', fontSize: 12, color: T.gold }}>{inst.bookingNo}</Typography></TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1.2} alignItems="center">
                          <Avatar sx={{ width: 28, height: 28, bgcolor: avatarBg(inst.customerName), fontSize: 10, fontWeight: 800, ml: 0 }}>{initials(inst.customerName)}</Avatar>
                          <Box sx={{ ml: 1.2 }}>
                            <Typography sx={{ fontWeight: 800, fontSize: 13, color: T.text }}>{inst.customerName}</Typography>
                            <Typography sx={{ fontSize: 11, color: T.muted }}>{inst.project} · {inst.unit}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell><Typography sx={{ fontWeight: 700, fontSize: 13, color: T.text }}>{inst.installmentName}</Typography></TableCell>
                      <TableCell><Typography sx={{ fontFamily: T.display, fontSize: 16, fontWeight: 600, color: T.gold, letterSpacing: -0.5 }}>{fmtINR(inst.amount)}</Typography></TableCell>
                      <TableCell><Typography sx={{ fontSize: 12.5, color: inst.status === 'OVERDUE' ? T.red : T.muted }}>{inst.dueDate}</Typography></TableCell>
                      <TableCell><Typography sx={{ fontSize: 12.5, color: T.accent }}>{inst.paidOn || '—'}</Typography></TableCell>
                      <TableCell>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.2, py: 0.4, borderRadius: 1.5, bgcolor: sc.bg }}>
                          <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: sc.dot }} />
                          <Typography sx={{ fontFamily: T.body, fontSize: 10.5, fontWeight: 800, color: sc.color }}>{inst.status}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {inst.status !== 'PAID' && (
                          <Button size="small" onClick={() => markPaid(inst.id)}
                            sx={{ textTransform: 'none', fontWeight: 700, fontFamily: T.body, fontSize: 11.5, border: `1px solid ${T.accent}40`, borderRadius: 2, color: T.accent, '&:hover': { bgcolor: T.accent + '14' } }}>
                            Mark Paid
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ px: 3, py: 1.8, bgcolor: '#0d1117', borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontFamily: T.body, fontSize: 11.5, color: T.sub }}>{filtered.length} installments</Typography>
            <Typography sx={{ fontFamily: T.display, fontSize: 14, fontWeight: 600, color: T.gold, letterSpacing: -0.3 }}>
              Total: {fmtINR(filtered.reduce((s, i) => s + i.amount, 0))}
            </Typography>
          </Box>
        </Card>
      </Box>
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// BOOKING ANALYTICS PAGE
// ═══════════════════════════════════════════════════════════════════════════════
const PROJECTS = [
  { name: 'Skyline Heights',  bookings: 3, revenue: 38200000, target: 50000000, cancelled: 0, color: T.gold },
  { name: 'Orchid Residency', bookings: 2, revenue: 21500000, target: 35000000, cancelled: 1, color: T.accent },
  { name: 'Green Valley',     bookings: 1, revenue: 4800000,  target: 20000000, cancelled: 0, color: T.blue },
  { name: 'Metro Towers',     bookings: 1, revenue: 15000000, target: 40000000, cancelled: 1, color: T.purple },
];
const AGENTS = [
  { name: 'Priya Mehta',  bookings: 3, revenue: 38700000, commission: 774000, convRate: 72 },
  { name: 'Arjun Singh',  bookings: 2, revenue: 27000000, commission: 540000, convRate: 58 },
  { name: 'Kavita Joshi', bookings: 2, revenue: 14300000, commission: 286000, convRate: 64 },
];
const MONTHLY_BOOKING = [
  { month: 'Nov', bookings: 4, revenue: 28000000 },
  { month: 'Dec', bookings: 6, revenue: 42000000 },
  { month: 'Jan', bookings: 5, revenue: 35000000 },
  { month: 'Feb', bookings: 3, revenue: 21000000 },
  { month: 'Mar', bookings: 7, revenue: 48000000 },
  { month: 'Apr', bookings: 7, revenue: 79500000 },
];
const SOURCES = [
  { source: 'Channel Partner', count: 4, revenue: 58500000, color: T.purple },
  { source: 'Direct Agent',    count: 3, revenue: 21000000, color: T.gold },
];

export const BookingAnalyticsPage: React.FC = () => {
  const [tab, setTab]     = useState(0);
  const [period, setPeriod] = useState('Apr 2026');
  const maxBookings = Math.max(...MONTHLY_BOOKING.map(m => m.bookings));
  const maxRevenue  = Math.max(...MONTHLY_BOOKING.map(m => m.revenue));

  const TOTAL = {
    bookings:  MONTHLY_BOOKING.reduce((s, m) => s + m.bookings, 0),
    revenue:   MONTHLY_BOOKING.reduce((s, m) => s + m.revenue, 0),
    cancelled: 2,
    avgValue:  Math.round(MONTHLY_BOOKING.reduce((s, m) => s + m.revenue, 0) / MONTHLY_BOOKING.reduce((s, m) => s + m.bookings, 0)),
  };

  return (
    <Box sx={{ bgcolor: T.dark, minHeight: '100vh', pb: 8 }}>
      <BHeader title="Booking Analytics" tag="Intelligence" subtitle="Revenue tracking · agent performance · project demand analysis" accent={T.blue}
        actions={
          <Stack direction="row" spacing={1.5}>
            <FormControl size="small">
              <InputLabel sx={{ color: `${T.muted} !important` }}>Period</InputLabel>
              <Select value={period} label="Period" onChange={e => setPeriod(e.target.value)} sx={{ borderRadius: 2.5, bgcolor: T.card, color: T.text, minWidth: 130, '& .MuiOutlinedInput-notchedOutline': { borderColor: T.border }, '& .MuiSvgIcon-root': { color: T.muted } }}>
                {['Apr 2026','Mar 2026','Q1 2026','FY 2025-26'].map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </Select>
            </FormControl>
            <Button startIcon={<DownloadOutlined />} sx={{ textTransform: 'none', fontWeight: 700, fontFamily: T.body, borderRadius: 2.5, border: `1px solid ${T.border}`, color: T.muted }}>Export</Button>
          </Stack>
        }
      />

      <Box sx={{ px: { xs: 3, md: 5 }, pt: 4 }}>
        {/* Summary KPIs */}
        <Grid container spacing={2.5} mb={4}>
          {[
            { label: 'Total Bookings',      value: TOTAL.bookings,         sub: 'All projects',     color: T.gold,   icon: <HomeOutlined /> },
            { label: 'Total Revenue',       value: fmtCr(TOTAL.revenue),   sub: 'Booked value',     color: T.accent, icon: <AttachMoneyOutlined /> },
            { label: 'Avg. Booking Value',  value: fmtCr(TOTAL.avgValue),  sub: 'Per unit',         color: T.blue,   icon: <TrendingUpOutlined /> },
            { label: 'Cancellation Rate',   value: `${((TOTAL.cancelled/TOTAL.bookings)*100).toFixed(0)}%`, sub: `${TOTAL.cancelled} cancelled`, color: T.red, icon: <CancelOutlined /> },
            { label: 'Commission Generated',value: fmtCr(1600000),         sub: 'Broker payouts',   color: T.purple, icon: <PersonOutlined /> },
            { label: 'With Partners',       value: `${SOURCES[0].count}/${TOTAL.bookings}`, sub: 'Channel partner deals', color: T.gold, icon: <BarChartOutlined /> },
          ].map(k => <Grid item xs={6} sm={4} md={2} key={k.label}><BKpi {...k} /></Grid>)}
        </Grid>

        {/* Tabs */}
        <Box sx={{ borderBottom: `1px solid ${T.border}`, mb: 4 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}
            sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontFamily: T.body, fontSize: 13, color: T.muted, minHeight: 44 }, '& .MuiTabs-indicator': { bgcolor: T.blue, height: 2.5, borderRadius: 2 }, '& .Mui-selected': { color: `${T.blue} !important` } }}>
            <Tab label="Booking Trend" />
            <Tab label="Project Performance" />
            <Tab label="Agent Leaderboard" />
            <Tab label="Lead Sources" />
          </Tabs>
        </Box>

        {/* Booking Trend */}
        {tab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card sx={{ p: 3, borderRadius: 3, bgcolor: T.surface, border: `1px solid ${T.border}`, boxShadow: 'none' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                  <Box>
                    <Typography sx={{ fontFamily: T.body, fontWeight: 800, fontSize: 14, color: T.text }}>Monthly Booking Trend</Typography>
                    <Typography sx={{ fontFamily: T.body, fontSize: 11.5, color: T.muted }}>Nov 2025 – Apr 2026</Typography>
                  </Box>
                  <Stack direction="row" spacing={2}>
                    {[{ label: 'Bookings', color: T.gold }, { label: 'Revenue', color: T.blue + '80' }].map(l => (
                      <Stack key={l.label} direction="row" spacing={0.8} alignItems="center">
                        <Box sx={{ width: 12, height: 4, borderRadius: 2, bgcolor: l.color }} />
                        <Typography sx={{ fontFamily: T.body, fontSize: 11, color: T.muted }}>{l.label}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="flex-end" sx={{ height: 180 }}>
                  {MONTHLY_BOOKING.map((m, i) => {
                    const bh = Math.round((m.bookings / maxBookings) * 140);
                    const rh = Math.round((m.revenue / maxRevenue) * 140);
                    const isLast = i === MONTHLY_BOOKING.length - 1;
                    return (
                      <Box key={m.month} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                        <Tooltip title={`${m.bookings} bookings · ${fmtCr(m.revenue)}`}>
                          <Stack direction="row" spacing={0.4} alignItems="flex-end" sx={{ height: 150, cursor: 'pointer' }}>
                            <Box sx={{ width: 18, height: bh, borderRadius: '3px 3px 0 0', bgcolor: isLast ? T.gold : T.gold + '40', transition: 'all 0.2s', '&:hover': { bgcolor: T.gold } }} />
                            <Box sx={{ width: 14, height: rh, borderRadius: '3px 3px 0 0', bgcolor: isLast ? T.blue + '90' : T.blue + '30', transition: 'all 0.2s', '&:hover': { bgcolor: T.blue + '80' } }} />
                          </Stack>
                        </Tooltip>
                        <Typography sx={{ fontFamily: T.body, fontSize: 10.5, color: isLast ? T.gold : T.muted, fontWeight: isLast ? 800 : 500 }}>{m.month}</Typography>
                      </Box>
                    );
                  })}
                </Stack>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, borderRadius: 3, bgcolor: T.surface, border: `1px solid ${T.border}`, boxShadow: 'none', height: '100%' }}>
                <Typography sx={{ fontFamily: T.body, fontWeight: 800, fontSize: 14, color: T.text, mb: 2.5 }}>Revenue by Source</Typography>
                <Stack spacing={2.5}>
                  {SOURCES.map(s => {
                    const pct = (s.revenue / TOTAL.revenue) * 100;
                    return (
                      <Box key={s.source}>
                        <Stack direction="row" justifyContent="space-between" mb={0.8}>
                          <Stack direction="row" spacing={0.8} alignItems="center">
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color }} />
                            <Typography sx={{ fontFamily: T.body, fontSize: 13, color: T.text }}>{s.source}</Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography sx={{ fontFamily: T.display, fontSize: 16, color: s.color, letterSpacing: -0.3 }}>{fmtCr(s.revenue)}</Typography>
                            <Typography sx={{ fontFamily: T.body, fontSize: 11, color: T.muted }}>{pct.toFixed(0)}%</Typography>
                          </Stack>
                        </Stack>
                        <Box sx={{ height: 8, borderRadius: 4, bgcolor: T.border, overflow: 'hidden' }}>
                          <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: s.color, borderRadius: 4, transition: 'width 0.6s ease' }} />
                        </Box>
                        <Typography sx={{ fontFamily: T.body, fontSize: 11, color: T.muted, mt: 0.5 }}>{s.count} bookings</Typography>
                      </Box>
                    );
                  })}
                </Stack>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Project Performance */}
        {tab === 1 && (
          <Stack spacing={2.5}>
            {PROJECTS.map(p => {
              const pct = (p.revenue / p.target) * 100;
              return (
                <Card key={p.name} sx={{ p: 3, borderRadius: 3, bgcolor: T.surface, border: `1px solid ${p.color}25`, boxShadow: 'none', transition: 'all 0.2s', '&:hover': { borderColor: p.color + '50' } }}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ md: 'center' }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: p.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <HomeOutlined sx={{ color: p.color }} />
                    </Box>
                    <Box flex={1}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                        <Box>
                          <Typography sx={{ fontFamily: T.body, fontWeight: 800, fontSize: 15, color: T.text }}>{p.name}</Typography>
                          <Stack direction="row" spacing={1.5} mt={0.3}>
                            <Typography sx={{ fontFamily: T.body, fontSize: 12, color: T.muted }}>{p.bookings} bookings</Typography>
                            {p.cancelled > 0 && <Typography sx={{ fontFamily: T.body, fontSize: 12, color: T.red }}>{p.cancelled} cancelled</Typography>}
                          </Stack>
                        </Box>
                        <Stack direction="row" spacing={3} textAlign="right">
                          <Box>
                            <Typography sx={{ fontFamily: T.body, fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.8 }}>Revenue</Typography>
                            <Typography sx={{ fontFamily: T.display, fontSize: 20, color: p.color, letterSpacing: -0.5 }}>{fmtCr(p.revenue)}</Typography>
                          </Box>
                          <Box>
                            <Typography sx={{ fontFamily: T.body, fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.8 }}>Target</Typography>
                            <Typography sx={{ fontFamily: T.display, fontSize: 20, color: T.muted, letterSpacing: -0.5 }}>{fmtCr(p.target)}</Typography>
                          </Box>
                        </Stack>
                      </Stack>
                      <Box sx={{ height: 8, borderRadius: 4, bgcolor: T.border, overflow: 'hidden' }}>
                        <Box sx={{ height: '100%', width: `${Math.min(pct, 100)}%`, bgcolor: p.color, borderRadius: 4, transition: 'width 0.6s ease' }} />
                      </Box>
                      <Typography sx={{ fontFamily: T.body, fontSize: 11, color: T.muted, mt: 0.6 }}>{pct.toFixed(0)}% of target achieved</Typography>
                    </Box>
                  </Stack>
                </Card>
              );
            })}
          </Stack>
        )}

        {/* Agent Leaderboard */}
        {tab === 2 && (
          <Card sx={{ borderRadius: 3, bgcolor: T.surface, border: `1px solid ${T.border}`, boxShadow: 'none', overflow: 'hidden' }}>
            <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${T.border}` }}>
              <Typography sx={{ fontFamily: T.body, fontWeight: 800, fontSize: 14, color: T.text }}>Agent Leaderboard</Typography>
              <Typography sx={{ fontFamily: T.body, fontSize: 12, color: T.muted, mt: 0.2 }}>Ranked by revenue generated</Typography>
            </Box>
            <Stack>
              {AGENTS.sort((a, b) => b.revenue - a.revenue).map((agent, i) => (
                <Stack key={agent.name} direction={{ xs: 'column', md: 'row' }} spacing={2.5} alignItems={{ md: 'center' }} sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${T.border}`, '&:last-child': { borderBottom: 'none' }, '&:hover': { bgcolor: T.card }, transition: 'all 0.12s' }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: 2.5, bgcolor: i === 0 ? T.gold + '20' : T.card, border: `1px solid ${i === 0 ? T.gold + '40' : T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Typography sx={{ fontFamily: T.body, fontWeight: 900, fontSize: 13, color: i === 0 ? T.gold : T.muted }}>#{i + 1}</Typography>
                  </Box>
                  <Avatar sx={{ width: 38, height: 38, bgcolor: avatarBg(agent.name), fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{initials(agent.name)}</Avatar>
                  <Box flex={1}>
                    <Typography sx={{ fontFamily: T.body, fontWeight: 800, fontSize: 14, color: T.text }}>{agent.name}</Typography>
                    <Stack direction="row" spacing={2} mt={0.3}>
                      <Typography sx={{ fontFamily: T.body, fontSize: 12, color: T.muted }}>{agent.bookings} bookings</Typography>
                      <Typography sx={{ fontFamily: T.body, fontSize: 12, color: T.purple }}>Commission: {fmtCr(agent.commission)}</Typography>
                    </Stack>
                  </Box>
                  <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                    <Typography sx={{ fontFamily: T.display, fontSize: 22, fontWeight: 600, color: T.gold, letterSpacing: -0.8 }}>{fmtCr(agent.revenue)}</Typography>
                    <Stack direction="row" spacing={1} justifyContent="flex-end" mt={0.5}>
                      <Box sx={{ height: 6, width: 60, borderRadius: 3, bgcolor: T.border, overflow: 'hidden' }}>
                        <Box sx={{ height: '100%', width: `${agent.convRate}%`, bgcolor: agent.convRate > 65 ? T.accent : T.warn, borderRadius: 3 }} />
                      </Box>
                      <Typography sx={{ fontFamily: T.body, fontSize: 11.5, fontWeight: 700, color: agent.convRate > 65 ? T.accent : T.warn }}>{agent.convRate}% conv.</Typography>
                    </Stack>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Card>
        )}

        {/* Lead Sources */}
        {tab === 3 && (
          <Grid container spacing={3}>
            {[
              { title: 'Bookings by Source', data: SOURCES.map(s => ({ label: s.source, value: s.count, pct: (s.count / TOTAL.bookings) * 100, color: s.color })) },
              { title: 'Revenue by Source',  data: SOURCES.map(s => ({ label: s.source, value: fmtCr(s.revenue), pct: (s.revenue / TOTAL.revenue) * 100, color: s.color })) },
            ].map(section => (
              <Grid item xs={12} md={6} key={section.title}>
                <Card sx={{ p: 3, borderRadius: 3, bgcolor: T.surface, border: `1px solid ${T.border}`, boxShadow: 'none' }}>
                  <Typography sx={{ fontFamily: T.body, fontWeight: 800, fontSize: 14, color: T.text, mb: 3 }}>{section.title}</Typography>
                  <Stack spacing={2.5}>
                    {section.data.map(d => (
                      <Box key={d.label}>
                        <Stack direction="row" justifyContent="space-between" mb={0.8}>
                          <Stack direction="row" spacing={0.8} alignItems="center">
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: d.color }} />
                            <Typography sx={{ fontFamily: T.body, fontSize: 13, color: T.text }}>{d.label}</Typography>
                          </Stack>
                          <Stack direction="row" spacing={1}>
                            <Typography sx={{ fontFamily: T.display, fontSize: 18, color: d.color, letterSpacing: -0.5 }}>{d.value}</Typography>
                            <Typography sx={{ fontFamily: T.body, fontSize: 11, color: T.muted, alignSelf: 'flex-end', mb: 0.3 }}>{d.pct.toFixed(0)}%</Typography>
                          </Stack>
                        </Stack>
                        <Box sx={{ height: 8, borderRadius: 4, bgcolor: T.border, overflow: 'hidden' }}>
                          <Box sx={{ height: '100%', width: `${d.pct}%`, bgcolor: d.color, borderRadius: 4, transition: 'width 0.6s ease' }} />
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// BOOKING ROUTES
// ═══════════════════════════════════════════════════════════════════════════════
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

const BookingsPageLazy    = lazy(() => import('./BookingsPage'));
const BookingDetailLazy   = lazy(() => import('./BookingDetailPage'));

const PageLoader: React.FC = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', bgcolor: T.dark }}>
    <Box sx={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid ${T.border}`, borderTopColor: T.gold, animation: 'spin 0.8s linear infinite', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />
  </Box>
);

/**
 * Mount inside your App router:
 *   <Route path="/bookings/*" element={<BookingRoutes />} />
 *
 * Or with layout:
 *   <Route path="/bookings" element={<BookingLayout />}>
 *     {bookingRouteChildren}
 *   </Route>
 */
export const BookingRoutes: React.FC = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route index element={<Navigate to="list" replace />} />
      <Route path="list"          element={<BookingsPageLazy />} />
      <Route path=":id"           element={<BookingDetailLazy />} />
      <Route path="schedule"      element={<PaymentSchedulePage />} />
      <Route path="analytics"     element={<BookingAnalyticsPage />} />
      <Route path="*"             element={<Navigate to="list" replace />} />
    </Routes>
  </Suspense>
);

export const bookingRouteChildren = (
  <Route path="/bookings">
    <Route index element={<Navigate to="/bookings/list" replace />} />
    <Route path="list"      element={<Suspense fallback={<PageLoader />}><BookingsPageLazy /></Suspense>} />
    <Route path=":id"       element={<Suspense fallback={<PageLoader />}><BookingDetailLazy /></Suspense>} />
    <Route path="schedule"  element={<Suspense fallback={<PageLoader />}><PaymentSchedulePage /></Suspense>} />
    <Route path="analytics" element={<Suspense fallback={<PageLoader />}><BookingAnalyticsPage /></Suspense>} />
    <Route path="*"         element={<Navigate to="/bookings/list" replace />} />
  </Route>
);

export const BOOKING_PATHS = {
  ROOT:       '/bookings',
  LIST:       '/bookings/list',
  DETAIL:     (id: string) => `/bookings/${id}`,
  SCHEDULE:   '/bookings/schedule',
  ANALYTICS:  '/bookings/analytics',
} as const;

export const BOOKING_NAV_ITEMS = [
  { label: 'All Bookings',      path: BOOKING_PATHS.LIST,      icon: '🏠', description: 'View and manage bookings' },
  { label: 'Payment Schedule',  path: BOOKING_PATHS.SCHEDULE,  icon: '📅', description: 'Installment tracking' },
  { label: 'Analytics',         path: BOOKING_PATHS.ANALYTICS, icon: '📊', description: 'Revenue & performance' },
] as const;

export default BookingRoutes;