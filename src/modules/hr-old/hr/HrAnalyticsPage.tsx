import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Stack, Button, Grid, Card, Avatar,
  LinearProgress, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Divider, Tab, Tabs
} from '@mui/material';
import {
  TrendingUpOutlined, TrendingDownOutlined, PeopleOutlined,
  AttachMoneyOutlined, CalendarMonthOutlined, StarOutlined,
  BarChartOutlined, DownloadOutlined, WorkOutlined,
  CheckCircleOutlined, WarningAmberOutlined, PersonOutlined,
  EmojiEventsOutlined
} from '@mui/icons-material';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const FONT = "'Cormorant Garamond', 'Georgia', serif";
const BODY = "'Mulish', 'system-ui', sans-serif";

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmtCr    = (n: number) => n >= 10000000 ? `₹${(n/10000000).toFixed(1)}Cr` : n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : n > 0 ? `₹${(n/1000).toFixed(0)}K` : '—';
const fmtINR   = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const avatarBg = (n: string) => ['#be185d','#7c3aed','#059669','#d97706','#2563eb','#0891b2'][n.charCodeAt(0) % 6];
const initials  = (n: string) => n.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

// ─── Data ──────────────────────────────────────────────────────────────────────
const MONTHLY_ATT = [
  { month: 'Jan', rate: 91, present: 7, absent: 1 },
  { month: 'Feb', rate: 88, present: 7, absent: 1 },
  { month: 'Mar', rate: 95, present: 8, absent: 0 },
  { month: 'Apr', rate: 87, present: 7, absent: 1 },
  { month: 'May', rate: 90, present: 7, absent: 1 },
  { month: 'Jun', rate: 85, present: 7, absent: 1 },
];

const TOP_AGENTS = [
  { name: 'Priya Mehta',  leads: 340, visits: 89, bookings: 22, revenue: 88000000, score: 98, yoy: 14 },
  { name: 'Rahul Sharma', leads: 120, visits: 35, bookings: 8,  revenue: 42000000, score: 82, yoy: 8 },
  { name: 'Arjun Singh',  leads: 95,  visits: 28, bookings: 6,  revenue: 24000000, score: 74, yoy: 5 },
  { name: 'Vikram Das',   leads: 30,  visits: 10, bookings: 1,  revenue: 4000000,  score: 42, yoy: -2 },
];

const DEPT_DATA = [
  { dept: 'Sales',      color: '#be185d', headcount: 4, attRate: 88, payroll: 285200, topAgent: 'Priya Mehta',  revenue: 154000000, growth: 12 },
  { dept: 'HR',         color: '#d97706', headcount: 1, attRate: 95, payroll: 30600,  topAgent: 'Kavita Joshi', revenue: 0,         growth: 0 },
  { dept: 'Finance',    color: '#059669', headcount: 1, attRate: 92, payroll: 35500,  topAgent: 'Sneha Patel',  revenue: 0,         growth: 0 },
  { dept: 'Marketing',  color: '#2563eb', headcount: 1, attRate: 72, payroll: 25920,  topAgent: 'Rohan Gupta',  revenue: 0,         growth: 0 },
  { dept: 'Operations', color: '#7c3aed', headcount: 1, attRate: 80, payroll: 36900,  topAgent: 'Meera Shah',   revenue: 0,         growth: 0 },
];

const LEAVE_TRENDS = [
  { month: 'Jan', casual: 3, sick: 2, earned: 1 },
  { month: 'Feb', casual: 2, sick: 4, earned: 0 },
  { month: 'Mar', casual: 4, sick: 1, earned: 2 },
  { month: 'Apr', casual: 1, sick: 3, earned: 3 },
  { month: 'May', casual: 5, sick: 2, earned: 1 },
  { month: 'Jun', casual: 3, sick: 1, earned: 5 },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

const KpiCard: React.FC<{ label: string; value: string | number; sub?: string; color: string; icon: React.ReactNode; trend?: number }> = ({ label, value, sub, color, icon, trend }) => (
  <Card sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: `${color}20`, boxShadow: 'none', bgcolor: `${color}05`, height: '100%', transition: 'all 0.2s', '&:hover': { boxShadow: `0 6px 24px ${color}14`, transform: 'translateY(-2px)' } }}>
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
      <Box>
        <Typography sx={{ fontSize: 10, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, fontFamily: BODY }}>{label}</Typography>
        <Typography sx={{ fontFamily: FONT, fontSize: 30, fontWeight: 700, color, letterSpacing: -1.2, lineHeight: 1, mt: 0.5 }}>{value}</Typography>
        {sub && <Typography sx={{ fontSize: 11.5, color: '#9ca3af', fontFamily: BODY, mt: 0.5 }}>{sub}</Typography>}
        {trend !== undefined && (
          <Stack direction="row" spacing={0.4} alignItems="center" mt={0.8}>
            {trend >= 0
              ? <TrendingUpOutlined sx={{ fontSize: 13, color: '#16a34a' }} />
              : <TrendingDownOutlined sx={{ fontSize: 13, color: '#dc2626' }} />}
            <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: trend >= 0 ? '#16a34a' : '#dc2626', fontFamily: BODY }}>
              {Math.abs(trend)}% vs last month
            </Typography>
          </Stack>
        )}
      </Box>
      <Box sx={{ width: 44, height: 44, borderRadius: 3, bgcolor: `${color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
        {icon}
      </Box>
    </Stack>
  </Card>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
const HRAnalyticsPage: React.FC = () => {
  const [period, setPeriod] = useState('Jun 2025');
  const [tab, setTab]       = useState(0);

  const totalPayroll = DEPT_DATA.reduce((s, d) => s + d.payroll, 0);
  const totalRevenue = DEPT_DATA.reduce((s, d) => s + d.revenue, 0);
  const avgAtt       = Math.round(MONTHLY_ATT.reduce((s, m) => s + m.rate, 0) / MONTHLY_ATT.length);

  return (
    <Box sx={{ bgcolor: '#f5f4f7', minHeight: '100vh', pb: 8, fontFamily: BODY }}>

      {/* ── HEADER ── */}
      <Box sx={{
        px: { xs: 3, md: 5 }, pt: 5, pb: 4,
        background: 'linear-gradient(135deg, #0e0e1a 0%, #1c1a2e 55%, #0e0e1a 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', bgcolor: '#60a5fa12', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -50, left: '25%', width: 240, height: 240, borderRadius: '50%', bgcolor: '#a78bfa08', pointerEvents: 'none' }} />
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'flex-end' }} spacing={3}>
          <Box>
            <Typography sx={{ fontFamily: FONT, fontSize: 42, fontWeight: 700, color: 'white', letterSpacing: -1.5, lineHeight: 0.9 }}>HR</Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: 42, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1, color: '#93c5fd' }}>Analytics</Typography>
            <Typography sx={{ fontFamily: BODY, fontSize: 13, color: '#3b82f640', mt: 1.5 }}>
              Workforce insights · Performance · Payroll · Attendance
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            {['Jun 2025', 'May 2025', 'Q2 2025'].map(p => (
              <Button key={p} onClick={() => setPeriod(p)}
                sx={{ textTransform: 'none', fontWeight: 700, fontFamily: BODY, borderRadius: 2.5, fontSize: 12, px: 2,
                  bgcolor: period === p ? '#3b82f6' : 'rgba(255,255,255,0.07)',
                  color: period === p ? 'white' : '#64748b',
                  border: '1px solid', borderColor: period === p ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: '#3b82f620' } }}>
                {p}
              </Button>
            ))}
            <Button startIcon={<DownloadOutlined />}
              sx={{ textTransform: 'none', fontWeight: 700, fontFamily: BODY, borderRadius: 2.5, color: '#64748b', border: '1px solid rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.07)' } }}>
              Export
            </Button>
          </Stack>
        </Stack>

        {/* Summary KPIs */}
        <Grid container spacing={2} mt={3}>
          {[
            { label: 'Total Headcount', value: 8,              color: '#93c5fd' },
            { label: 'Avg Attendance',  value: `${avgAtt}%`,   color: '#86efac' },
            { label: 'Total Payroll',   value: fmtCr(totalPayroll), color: '#fde68a' },
            { label: 'Sales Revenue',   value: fmtCr(totalRevenue), color: '#f9a8d4' },
          ].map(s => (
            <Grid item xs={6} sm={3} key={s.label}>
              <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Typography sx={{ fontSize: 9.5, fontWeight: 800, color: '#3b82f640', textTransform: 'uppercase', letterSpacing: 1, fontFamily: BODY }}>{s.label}</Typography>
                <Typography sx={{ fontFamily: FONT, fontSize: 28, fontWeight: 700, color: s.color, letterSpacing: -1, lineHeight: 1.1, mt: 0.3 }}>{s.value}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ── TABS ── */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e5e7eb', px: { xs: 3, md: 5 }, position: 'sticky', top: 0, zIndex: 10 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontFamily: BODY, minHeight: 48, fontSize: 13, color: '#9ca3af' }, '& .MuiTabs-indicator': { bgcolor: '#3b82f6', height: 2.5, borderRadius: 2 }, '& .Mui-selected': { color: '#3b82f6 !important' } }}>
          <Tab label="Overview" />
          <Tab label="Sales Performance" />
          <Tab label="Attendance Trends" />
          <Tab label="Leave Analysis" />
        </Tabs>
      </Box>

      <Box sx={{ px: { xs: 3, md: 5 }, pt: 4 }}>

        {/* ── OVERVIEW TAB ── */}
        {tab === 0 && (
          <Grid container spacing={3}>
            {/* KPI Cards row */}
            <Grid item xs={12}>
              <Grid container spacing={2.5}>
                {[
                  { label: 'Active Employees',   value: 7,   sub: '1 inactive',        color: '#2563eb', icon: <PeopleOutlined />,      trend: 0 },
                  { label: 'Attendance Rate',    value: `${avgAtt}%`, sub: 'Monthly avg', color: '#059669', icon: <CheckCircleOutlined />, trend: 3 },
                  { label: 'Payroll This Month', value: fmtCr(totalPayroll), sub: 'Net payout', color: '#d97706', icon: <AttachMoneyOutlined />, trend: 8 },
                  { label: 'Open Leaves',        value: 2,   sub: 'Pending approval',  color: '#7c3aed', icon: <CalendarMonthOutlined />, trend: -1 },
                  { label: 'Top Agent Revenue',  value: fmtCr(88000000), sub: 'Priya Mehta', color: '#be185d', icon: <StarOutlined />,     trend: 14 },
                ].map(k => (
                  <Grid item xs={6} sm={4} md key={k.label}>
                    <KpiCard {...k} />
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Department overview table */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 4, border: '1px solid #e5e7eb', boxShadow: 'none', overflow: 'hidden' }}>
                <Box sx={{ px: 3, py: 2.5, bgcolor: '#fafafa', borderBottom: '1px solid #f3f4f6' }}>
                  <Typography sx={{ fontFamily: BODY, fontWeight: 800, fontSize: 14, color: '#374151' }}>Department Overview</Typography>
                  <Typography sx={{ fontFamily: BODY, fontSize: 11.5, color: '#9ca3af', mt: 0.3 }}>Headcount · Attendance · Payroll · Revenue — {period}</Typography>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        {['Department', 'Headcount', 'Attendance Rate', 'Monthly Payroll', 'Top Performer', 'Revenue', 'Growth'].map(h => (
                          <TableCell key={h} sx={{ fontWeight: 800, fontSize: 10.5, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: BODY, py: 1.5, borderBottom: '1px solid #f3f4f6' }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {DEPT_DATA.map(d => (
                        <TableRow key={d.dept} hover sx={{ '& td': { py: 1.8, borderBottom: '1px solid #f9fafb', fontFamily: BODY }, '&:hover': { bgcolor: '#fafafa' } }}>
                          <TableCell>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Box sx={{ width: 10, height: 32, borderRadius: 2, bgcolor: d.color, flexShrink: 0 }} />
                              <Typography sx={{ fontWeight: 800, fontSize: 13.5, fontFamily: BODY, color: '#111827' }}>{d.dept}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontFamily: FONT, fontSize: 22, fontWeight: 700, color: '#374151', letterSpacing: -0.5 }}>{d.headcount}</Typography>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Stack direction="row" spacing={1.5} alignItems="center" mb={0.5}>
                                <LinearProgress variant="determinate" value={d.attRate}
                                  sx={{ height: 6, borderRadius: 3, flex: 1, maxWidth: 80, bgcolor: '#f3f4f6', '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: d.attRate >= 90 ? '#16a34a' : d.attRate >= 80 ? '#2563eb' : '#f59e0b' } }} />
                                <Typography sx={{ fontSize: 12.5, fontWeight: 900, fontFamily: BODY, color: d.attRate >= 90 ? '#16a34a' : d.attRate >= 80 ? '#2563eb' : '#f59e0b', width: 36 }}>{d.attRate}%</Typography>
                              </Stack>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: 13.5, fontWeight: 800, fontFamily: BODY, color: '#d97706' }}>{fmtINR(d.payroll)}</Typography>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Avatar sx={{ width: 26, height: 26, bgcolor: avatarBg(d.topAgent), fontSize: 10, fontWeight: 800 }}>{initials(d.topAgent)}</Avatar>
                              <Typography sx={{ fontSize: 12.5, fontFamily: BODY, fontWeight: 700, color: '#374151' }}>{d.topAgent}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#059669', fontFamily: BODY }}>{fmtCr(d.revenue)}</Typography>
                          </TableCell>
                          <TableCell>
                            {d.growth > 0
                              ? <Chip label={`↑ ${d.growth}%`} size="small" sx={{ fontSize: 10.5, bgcolor: '#dcfce7', color: '#16a34a', fontWeight: 800, fontFamily: BODY }} />
                              : <Chip label="—" size="small" sx={{ fontSize: 10.5, bgcolor: '#f3f4f6', color: '#9ca3af', fontWeight: 700, fontFamily: BODY }} />}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* ── SALES PERFORMANCE TAB ── */}
        {tab === 1 && (
          <Grid container spacing={3}>
            {/* Leaderboard */}
            <Grid item xs={12} md={7}>
              <Card sx={{ p: 3, borderRadius: 4, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
                <Stack direction="row" spacing={1.5} alignItems="center" mb={0.5}>
                  <EmojiEventsOutlined sx={{ color: '#d97706' }} />
                  <Typography sx={{ fontFamily: BODY, fontWeight: 800, fontSize: 15, color: '#111827' }}>Sales Leaderboard</Typography>
                </Stack>
                <Typography sx={{ fontFamily: BODY, fontSize: 11.5, color: '#9ca3af', mb: 3 }}>Ranked by performance score · {period}</Typography>
                <Stack spacing={2.5}>
                  {TOP_AGENTS.map((a, i) => (
                    <Box key={a.name}>
                      <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                        {/* Rank badge */}
                        <Box sx={{
                          width: 32, height: 32, borderRadius: 2.5, flexShrink: 0,
                          bgcolor: i === 0 ? '#fef9c3' : i === 1 ? '#f3f4f6' : i === 2 ? '#fff7ed' : '#fafafa',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: '1px solid', borderColor: i === 0 ? '#fde68a' : i === 1 ? '#e5e7eb' : i === 2 ? '#fed7aa' : '#f3f4f6'
                        }}>
                          <Typography sx={{ fontFamily: BODY, fontWeight: 900, fontSize: 13, color: i === 0 ? '#92400e' : i === 1 ? '#374151' : i === 2 ? '#9a3412' : '#9ca3af' }}>
                            #{i+1}
                          </Typography>
                        </Box>
                        <Avatar sx={{ width: 38, height: 38, bgcolor: avatarBg(a.name), fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{initials(a.name)}</Avatar>
                        <Box flex={1}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography sx={{ fontFamily: BODY, fontWeight: 800, fontSize: 14, color: '#111827' }}>{a.name}</Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography sx={{ fontFamily: FONT, fontSize: 22, fontWeight: 700, color: '#2563eb', letterSpacing: -0.5 }}>{a.score}</Typography>
                              <Typography sx={{ fontFamily: BODY, fontSize: 10, color: '#9ca3af' }}>/ 100</Typography>
                              {a.yoy > 0
                                ? <Chip label={`↑ ${a.yoy}%`} size="small" sx={{ fontSize: 9.5, bgcolor: '#dcfce7', color: '#16a34a', fontWeight: 800, height: 18 }} />
                                : <Chip label={`↓ ${Math.abs(a.yoy)}%`} size="small" sx={{ fontSize: 9.5, bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 800, height: 18 }} />}
                            </Stack>
                          </Stack>
                          <Stack direction="row" spacing={2.5} mt={0.3}>
                            {[
                              { label: 'Leads', val: a.leads, color: '#7c3aed' },
                              { label: 'Visits', val: a.visits, color: '#2563eb' },
                              { label: 'Bookings', val: a.bookings, color: '#059669' },
                            ].map(m => (
                              <Stack key={m.label} direction="row" spacing={0.4} alignItems="center">
                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: m.color }} />
                                <Typography sx={{ fontSize: 11, fontFamily: BODY, color: '#6b7280' }}>
                                  <Box component="span" sx={{ fontWeight: 800, color: m.color }}>{m.val}</Box> {m.label}
                                </Typography>
                              </Stack>
                            ))}
                            <Typography sx={{ fontSize: 11, fontFamily: BODY, color: '#059669', fontWeight: 800 }}>{fmtCr(a.revenue)}</Typography>
                          </Stack>
                        </Box>
                      </Stack>
                      <Box sx={{ pl: 9 }}>
                        <LinearProgress variant="determinate" value={a.score}
                          sx={{ height: 5, borderRadius: 3, bgcolor: '#f3f4f6', '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: i === 0 ? '#d97706' : i === 1 ? '#9ca3af' : '#cd7c5a' } }} />
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Card>
            </Grid>

            {/* Revenue breakdown */}
            <Grid item xs={12} md={5}>
              <Stack spacing={2.5}>
                <Card sx={{ p: 3, borderRadius: 4, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
                  <Typography sx={{ fontFamily: BODY, fontWeight: 800, fontSize: 14, color: '#374151', mb: 2.5 }}>Revenue Share by Agent</Typography>
                  <Stack spacing={1.8}>
                    {TOP_AGENTS.map(a => {
                      const pct = totalRevenue > 0 ? (a.revenue / totalRevenue) * 100 : 0;
                      return (
                        <Box key={a.name}>
                          <Stack direction="row" justifyContent="space-between" mb={0.5}>
                            <Typography sx={{ fontSize: 12.5, fontWeight: 700, fontFamily: BODY }}>{a.name}</Typography>
                            <Stack direction="row" spacing={1}>
                              <Typography sx={{ fontSize: 12, fontWeight: 800, color: '#059669', fontFamily: BODY }}>{fmtCr(a.revenue)}</Typography>
                              <Typography sx={{ fontSize: 11, color: '#9ca3af', fontFamily: BODY }}>{pct.toFixed(0)}%</Typography>
                            </Stack>
                          </Stack>
                          <LinearProgress variant="determinate" value={pct}
                            sx={{ height: 7, borderRadius: 3.5, bgcolor: '#f3f4f6', '& .MuiLinearProgress-bar': { borderRadius: 3.5, bgcolor: avatarBg(a.name) } }} />
                        </Box>
                      );
                    })}
                  </Stack>
                </Card>

                {/* Conversion funnel */}
                <Card sx={{ p: 3, borderRadius: 4, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
                  <Typography sx={{ fontFamily: BODY, fontWeight: 800, fontSize: 14, color: '#374151', mb: 2.5 }}>Team Conversion Funnel</Typography>
                  {[
                    { label: 'Total Leads', value: TOP_AGENTS.reduce((s,a)=>s+a.leads,0), color: '#7c3aed', pct: 100 },
                    { label: 'Site Visits',  value: TOP_AGENTS.reduce((s,a)=>s+a.visits,0), color: '#2563eb', pct: 65 },
                    { label: 'Bookings',    value: TOP_AGENTS.reduce((s,a)=>s+a.bookings,0), color: '#059669', pct: 15 },
                  ].map(f => (
                    <Box key={f.label} mb={2}>
                      <Stack direction="row" justifyContent="space-between" mb={0.5}>
                        <Typography sx={{ fontSize: 12.5, fontWeight: 700, fontFamily: BODY, color: '#374151' }}>{f.label}</Typography>
                        <Stack direction="row" spacing={1}>
                          <Typography sx={{ fontFamily: FONT, fontSize: 18, fontWeight: 700, color: f.color, letterSpacing: -0.5 }}>{f.value}</Typography>
                          <Typography sx={{ fontSize: 11, color: '#9ca3af', fontFamily: BODY, alignSelf: 'flex-end', mb: 0.3 }}>{f.pct}%</Typography>
                        </Stack>
                      </Stack>
                      <LinearProgress variant="determinate" value={f.pct}
                        sx={{ height: 8, borderRadius: 4, bgcolor: '#f3f4f6', '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: f.color } }} />
                    </Box>
                  ))}
                </Card>
              </Stack>
            </Grid>
          </Grid>
        )}

        {/* ── ATTENDANCE TRENDS TAB ── */}
        {tab === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, borderRadius: 4, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
                <Typography sx={{ fontFamily: BODY, fontWeight: 800, fontSize: 15, color: '#374151', mb: 0.5 }}>Monthly Attendance Rate</Typography>
                <Typography sx={{ fontFamily: BODY, fontSize: 11.5, color: '#9ca3af', mb: 3 }}>Jan – Jun 2025 · Organisation-wide</Typography>
                <Stack spacing={2.5}>
                  {MONTHLY_ATT.map((m, i) => (
                    <Stack key={m.month} direction="row" spacing={2} alignItems="center">
                      <Typography sx={{ fontSize: 12, fontWeight: 700, fontFamily: BODY, width: 30, color: '#6b7280' }}>{m.month}</Typography>
                      <Box flex={1} sx={{ height: 12, borderRadius: 6, bgcolor: '#f3f4f6', overflow: 'hidden', position: 'relative' }}>
                        <Box sx={{
                          height: '100%', width: `${m.rate}%`, borderRadius: 6,
                          bgcolor: m.rate >= 90 ? '#16a34a' : m.rate >= 80 ? '#2563eb' : '#f59e0b',
                          transition: 'width 0.6s ease',
                          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pr: 1
                        }}>
                          {m.rate >= 85 && <Typography sx={{ fontSize: 9.5, fontWeight: 900, color: 'white', fontFamily: BODY }}>{m.rate}%</Typography>}
                        </Box>
                      </Box>
                      <Typography sx={{ fontSize: 12, fontWeight: 900, fontFamily: BODY, width: 40, textAlign: 'right', color: m.rate >= 90 ? '#16a34a' : m.rate >= 80 ? '#2563eb' : '#f59e0b' }}>{m.rate}%</Typography>
                    </Stack>
                  ))}
                </Stack>
                <Divider sx={{ my: 2.5 }} />
                <Stack direction="row" spacing={3} justifyContent="center">
                  {[{ label: 'Avg Rate', val: `${avgAtt}%`, color: '#2563eb' }, { label: 'Best Month', val: 'Mar (95%)', color: '#16a34a' }, { label: 'Lowest', val: 'Jun (85%)', color: '#f59e0b' }].map(s => (
                    <Box key={s.label} sx={{ textAlign: 'center' }}>
                      <Typography sx={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, color: s.color, letterSpacing: -0.5 }}>{s.val}</Typography>
                      <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', fontFamily: BODY, textTransform: 'uppercase', letterSpacing: 0.8 }}>{s.label}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, borderRadius: 4, border: '1px solid #e5e7eb', boxShadow: 'none', height: '100%' }}>
                <Typography sx={{ fontFamily: BODY, fontWeight: 800, fontSize: 15, color: '#374151', mb: 0.5 }}>Department Attendance</Typography>
                <Typography sx={{ fontFamily: BODY, fontSize: 11.5, color: '#9ca3af', mb: 3 }}>Average rate by department</Typography>
                <Stack spacing={2.5}>
                  {DEPT_DATA.map(d => (
                    <Box key={d.dept}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.8}>
                        <Stack direction="row" spacing={1.2} alignItems="center">
                          <Box sx={{ width: 10, height: 10, borderRadius: 2, bgcolor: d.color }} />
                          <Typography sx={{ fontFamily: BODY, fontWeight: 700, fontSize: 13, color: '#374151' }}>{d.dept}</Typography>
                          <Typography sx={{ fontFamily: BODY, fontSize: 11, color: '#9ca3af' }}>{d.headcount} emp</Typography>
                        </Stack>
                        <Typography sx={{ fontFamily: BODY, fontWeight: 900, fontSize: 14, color: d.attRate >= 90 ? '#16a34a' : d.attRate >= 80 ? '#2563eb' : '#f59e0b' }}>{d.attRate}%</Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={d.attRate}
                        sx={{ height: 8, borderRadius: 4, bgcolor: '#f3f4f6', '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: d.color } }} />
                    </Box>
                  ))}
                </Stack>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* ── LEAVE ANALYSIS TAB ── */}
        {tab === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Card sx={{ p: 3, borderRadius: 4, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
                <Typography sx={{ fontFamily: BODY, fontWeight: 800, fontSize: 15, color: '#374151', mb: 0.5 }}>Leave Trends by Month</Typography>
                <Typography sx={{ fontFamily: BODY, fontSize: 11.5, color: '#9ca3af', mb: 3 }}>Jan – Jun 2025 · All leave types</Typography>
                <Stack direction="row" spacing={3} mb={2.5}>
                  {[{ label: 'Casual', color: '#2563eb' }, { label: 'Sick', color: '#dc2626' }, { label: 'Earned', color: '#059669' }].map(l => (
                    <Stack key={l.label} direction="row" spacing={0.7} alignItems="center">
                      <Box sx={{ width: 12, height: 6, borderRadius: 3, bgcolor: l.color }} />
                      <Typography sx={{ fontSize: 12, fontFamily: BODY, fontWeight: 600, color: '#6b7280' }}>{l.label}</Typography>
                    </Stack>
                  ))}
                </Stack>
                <Stack spacing={2}>
                  {LEAVE_TRENDS.map(m => {
                    const total = m.casual + m.sick + m.earned;
                    const maxTotal = Math.max(...LEAVE_TRENDS.map(x => x.casual + x.sick + x.earned));
                    return (
                      <Stack key={m.month} direction="row" spacing={2} alignItems="center">
                        <Typography sx={{ fontSize: 12, fontWeight: 700, fontFamily: BODY, width: 30, color: '#6b7280' }}>{m.month}</Typography>
                        <Box flex={1} sx={{ height: 14, borderRadius: 7, overflow: 'hidden', display: 'flex', bgcolor: '#f3f4f6' }}>
                          <Box sx={{ width: `${(m.casual/maxTotal)*100}%`, bgcolor: '#2563eb', transition: 'width 0.5s' }} />
                          <Box sx={{ width: `${(m.sick/maxTotal)*100}%`, bgcolor: '#dc2626', transition: 'width 0.5s' }} />
                          <Box sx={{ width: `${(m.earned/maxTotal)*100}%`, bgcolor: '#059669', transition: 'width 0.5s' }} />
                        </Box>
                        <Typography sx={{ fontSize: 12, fontWeight: 800, fontFamily: BODY, width: 24, textAlign: 'right', color: '#374151' }}>{total}</Typography>
                      </Stack>
                    );
                  })}
                </Stack>
              </Card>
            </Grid>

            <Grid item xs={12} md={5}>
              <Stack spacing={2.5}>
                <Card sx={{ p: 3, borderRadius: 4, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
                  <Typography sx={{ fontFamily: BODY, fontWeight: 800, fontSize: 14, color: '#374151', mb: 2.5 }}>Leave Type Breakdown</Typography>
                  {[
                    { label: 'Casual Leave', total: LEAVE_TRENDS.reduce((s,m)=>s+m.casual,0), color: '#2563eb', bg: '#eff6ff' },
                    { label: 'Sick Leave',   total: LEAVE_TRENDS.reduce((s,m)=>s+m.sick,0),   color: '#dc2626', bg: '#fef2f2' },
                    { label: 'Earned Leave', total: LEAVE_TRENDS.reduce((s,m)=>s+m.earned,0), color: '#059669', bg: '#f0fdf4' },
                  ].map(l => {
                    const grandTotal = LEAVE_TRENDS.reduce((s,m)=>s+m.casual+m.sick+m.earned,0);
                    const pct = grandTotal > 0 ? (l.total / grandTotal) * 100 : 0;
                    return (
                      <Box key={l.label} mb={2}>
                        <Stack direction="row" justifyContent="space-between" mb={0.6}>
                          <Typography sx={{ fontSize: 13, fontWeight: 700, fontFamily: BODY }}>{l.label}</Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography sx={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, color: l.color, letterSpacing: -0.5 }}>{l.total}</Typography>
                            <Typography sx={{ fontSize: 10.5, color: '#9ca3af', fontFamily: BODY }}>days</Typography>
                          </Stack>
                        </Stack>
                        <LinearProgress variant="determinate" value={pct}
                          sx={{ height: 7, borderRadius: 3.5, bgcolor: '#f3f4f6', '& .MuiLinearProgress-bar': { borderRadius: 3.5, bgcolor: l.color } }} />
                      </Box>
                    );
                  })}
                </Card>

                <Card sx={{ p: 3, borderRadius: 4, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
                  <Typography sx={{ fontFamily: BODY, fontWeight: 800, fontSize: 14, color: '#374151', mb: 2 }}>Quick Numbers</Typography>
                  <Grid container spacing={1.5}>
                    {[
                      { label: 'Avg leaves/emp', val: '3.5/mo', color: '#6b7280' },
                      { label: 'Sick leave spike', val: 'Feb', color: '#dc2626' },
                      { label: 'Highest usage', val: 'Sales', color: '#be185d' },
                      { label: 'Pending requests', val: '3', color: '#d97706' },
                    ].map(s => (
                      <Grid item xs={6} key={s.label}>
                        <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: '#f9fafb', textAlign: 'center' }}>
                          <Typography sx={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, color: s.color, letterSpacing: -0.5 }}>{s.val}</Typography>
                          <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: '#9ca3af', fontFamily: BODY, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default HRAnalyticsPage;