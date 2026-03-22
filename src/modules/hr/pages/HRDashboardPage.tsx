// src/modules/hr/pages/HRDashboardPage.tsx
import React, { useEffect } from 'react';
import { Grid, Box, Typography, LinearProgress } from '@mui/material';
import { People, AccessTime, BeachAccess, AccountBalance, TrendingUp } from '@mui/icons-material';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { useAppDispatch, useAppSelector, H, INR, DEPT_COLOR } from '../hooks';
import { fetchDashboard } from '../store/hrSlice';
import { StatCard, PageHeader, Card, EmployeeAvatar } from '../components/ui';

const GRID  = { stroke: 'rgba(255,255,255,0.05)', strokeDasharray: '4 3' };
const AXIS  = { fill: H.textSub, fontSize: 11 };
const TIP   = { background: H.surfaceHigh, border: `1px solid ${H.border}`, borderRadius: 8, fontSize: 12 };

export default function HRDashboardPage() {
  const dispatch = useAppDispatch();
  const { dashboard: d, loading } = useAppSelector(s => s.hr);
  const busy = !!loading.dashboard;

  useEffect(() => { dispatch(fetchDashboard()); }, [dispatch]);

  const stats = [
    { label: 'Total Employees',    value: d?.totalEmployees ?? 0,      sub: `${d?.activeEmployees ?? 0} active`,           accent: H.primary,  icon: <People />       },
    { label: 'Present Today',      value: d?.todayAttendance ?? 0,     sub: `of ${d?.activeEmployees ?? 0} active`,         accent: H.teal,     icon: <AccessTime />   },
    { label: 'Pending Leaves',     value: d?.pendingLeaves ?? 0,       sub: 'awaiting approval',                            accent: H.amber,    icon: <BeachAccess />  },
    { label: 'Monthly Payroll',    value: INR(d?.monthlyPayroll.gross ?? 0), sub: `Net: ${INR(d?.monthlyPayroll.net ?? 0)}`, accent: H.purple,   icon: <AccountBalance />},
  ];

  return (
    <Box>
      <PageHeader title="HR Dashboard" subtitle={`Last updated ${new Date().toLocaleTimeString('en-IN')}`} />

      {/* Stat cards */}
      <Grid container spacing={2} mb={3}>
        {stats.map(s => (
          <Grid item xs={12} sm={6} md={3} key={s.label}>
            <StatCard {...s} loading={busy} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} mb={2}>
        {/* Attendance trend */}
        <Grid item xs={12} md={8}>
          <Card title="Attendance Trend (14 days)">
            <Box p={2.5}>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={d?.attendanceTrend ?? []} margin={{ right: 4, left: -16 }}>
                  <defs>
                    <linearGradient id="gPresent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={H.teal}  stopOpacity={0.3} />
                      <stop offset="95%" stopColor={H.teal}  stopOpacity={0}   />
                    </linearGradient>
                    <linearGradient id="gAbsent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={H.coral} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={H.coral} stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...GRID} />
                  <XAxis dataKey="date" tick={AXIS} axisLine={false} tickLine={false} />
                  <YAxis tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={TIP} labelStyle={{ color: H.text }} />
                  <Area type="monotone" dataKey="present" name="Present"
                    stroke={H.teal}  fill="url(#gPresent)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="absent"  name="Absent"
                    stroke={H.coral} fill="url(#gAbsent)"  strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Department breakdown */}
        <Grid item xs={12} md={4}>
          <Card title="By Department">
            <Box p={2.5}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={d?.deptBreakdown ?? []} layout="vertical" margin={{ left: 8, right: 8 }}>
                  <CartesianGrid {...GRID} horizontal={false} />
                  <XAxis type="number" tick={AXIS} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="dept" width={80} tick={{ ...AXIS, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TIP} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                  <Bar dataKey="count" name="Employees" radius={[0, 5, 5, 0]} maxBarSize={16}>
                    {(d?.deptBreakdown ?? []).map(dep => (
                      <Cell key={dep.dept} fill={DEPT_COLOR[dep.dept] ?? H.primary} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Top performers */}
      <Card title="Top Performers This Month">
        <Box p={2}>
          {(d?.topPerformers ?? []).length === 0
            ? <Typography sx={{ color: H.textSub, fontSize: 13, py: 2, textAlign: 'center' }}>No performance data for this month</Typography>
            : (d?.topPerformers ?? []).map((p: any, i: number) => (
              <Box key={p.id} display="flex" alignItems="center" gap={1.5}
                py={1.1} sx={{ borderBottom: `1px solid ${H.border}` }}>
                <Typography sx={{ color: H.muted, fontSize: 12, minWidth: 20 }}>#{i + 1}</Typography>
                <EmployeeAvatar name={p.employee?.name ?? '—'} avatarUrl={p.employee?.avatarUrl} size={30} />
                <Box flex={1}>
                  <Typography sx={{ color: H.text, fontSize: 13, fontWeight: 500 }}>{p.employee?.name}</Typography>
                  <Typography sx={{ color: H.textSub, fontSize: 11 }}>{p.employee?.department}</Typography>
                </Box>
                <Box textAlign="right">
                  <Typography sx={{ color: H.teal, fontSize: 13, fontWeight: 700 }}>{INR(p.revenueGenerated)}</Typography>
                  <Typography sx={{ color: H.textSub, fontSize: 11 }}>{p.bookingsClosed} bookings</Typography>
                </Box>
                <Box sx={{ width: 60, mx: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, (p.revenueGenerated / Math.max(...(d?.topPerformers ?? []).map((x: any) => x.revenueGenerated), 1)) * 100)}
                    sx={{
                      height: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.06)',
                      '& .MuiLinearProgress-bar': { bgcolor: H.teal, borderRadius: 2 },
                    }}
                  />
                </Box>
              </Box>
            ))
          }
        </Box>
      </Card>
    </Box>
  );
}
