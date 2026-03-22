// src/modules/hr/pages/PerformancePage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Select, MenuItem, FormControl, InputLabel,
  Typography, LinearProgress,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAppDispatch, useAppSelector, H, INR, DEPT_COLOR, selectFieldSx, labelSx } from '../hooks';
import { fetchPerformance, type PerformanceRecord } from '../store/hrSlice';
import { PageHeader, Card, DataTable, EmployeeAvatar } from '../components/ui';

const now = new Date();
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const TIP = { background: H.surfaceHigh, border: `1px solid ${H.border}`, borderRadius: 8, fontSize: 12 };
const GRID = { stroke: 'rgba(255,255,255,0.05)', strokeDasharray: '4 3' };
const AXIS = { fill: H.textSub, fontSize: 11 };

export default function PerformancePage() {
  const dispatch = useAppDispatch();
  const { performance, loading } = useAppSelector(s => s.hr);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year,  setYear]  = useState(now.getFullYear());

  useEffect(() => { dispatch(fetchPerformance({ month, year })); }, [dispatch, month, year]);

  const maxRev = Math.max(...performance.map(p => p.revenueGenerated), 1);

  const chartData = performance.slice(0, 10).map(p => ({
    name    : (p.employee?.name ?? '').split(' ')[0],
    revenue : p.revenueGenerated,
    bookings: p.bookingsClosed,
  }));

  const cols = [
    { label:'Employee', render:(r:PerformanceRecord) => (
      <Box display="flex" alignItems="center" gap={1.5}>
        <EmployeeAvatar name={r.employee?.name ?? '?'} avatarUrl={r.employee?.avatarUrl} size={28} />
        <Box>
          <Typography sx={{ color:H.text, fontSize:12.5, fontWeight:500 }}>{r.employee?.name}</Typography>
          <Typography sx={{ color:H.textSub, fontSize:11 }}>{r.employee?.department}</Typography>
        </Box>
      </Box>
    )},
    { label:'Leads',    render:(r:PerformanceRecord) => <Typography sx={{ color:H.text, fontSize:12 }}>{r.leadsHandled}</Typography> },
    { label:'Visits',   render:(r:PerformanceRecord) => <Typography sx={{ color:H.text, fontSize:12 }}>{r.siteVisits}</Typography> },
    { label:'Bookings', render:(r:PerformanceRecord) => <Typography sx={{ color:H.text, fontSize:12, fontWeight:600 }}>{r.bookingsClosed}</Typography> },
    { label:'Revenue',  render:(r:PerformanceRecord) => <Typography sx={{ color:H.teal, fontSize:12, fontWeight:700 }}>{INR(r.revenueGenerated)}</Typography> },
    { label:'Progress', render:(r:PerformanceRecord) => (
      <Box sx={{ width:120 }}>
        <LinearProgress variant="determinate" value={(r.revenueGenerated / maxRev) * 100}
          sx={{ height:5, borderRadius:2, bgcolor:'rgba(255,255,255,0.06)',
            '& .MuiLinearProgress-bar': { bgcolor:H.teal, borderRadius:2 } }} />
      </Box>
    )},
    { label:'Rating',   render:(r:PerformanceRecord) => r.managerRating ? (
      <Box display="flex" gap={0.25}>
        {Array.from({length:5}).map((_,i) => (
          <Box key={i} sx={{ width:8, height:8, borderRadius:'50%', bgcolor: i < r.managerRating! ? H.amber : H.border }} />
        ))}
      </Box>
    ) : <Typography sx={{ color:H.textSub, fontSize:12 }}>—</Typography> },
  ];

  return (
    <Box>
      <PageHeader title="Performance" subtitle="Sales agent KPIs and rankings" />

      <Box display="flex" gap={1.5} mb={3}>
        <FormControl size="small" sx={{ minWidth:140 }}>
          <InputLabel sx={labelSx}>Month</InputLabel>
          <Select value={month} label="Month" onChange={e => setMonth(+e.target.value)} sx={selectFieldSx}>
            {MONTHS.map((m,i) => <MenuItem key={i} value={i+1} sx={{ fontSize:13 }}>{m}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth:100 }}>
          <InputLabel sx={labelSx}>Year</InputLabel>
          <Select value={year} label="Year" onChange={e => setYear(+e.target.value)} sx={selectFieldSx}>
            {[2024,2025,2026].map(y => <MenuItem key={y} value={y} sx={{ fontSize:13 }}>{y}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={7}>
          <Card title="Revenue by Agent (Top 10)">
            <Box p={2.5}>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={chartData} margin={{ left:-16, right:4 }}>
                  <CartesianGrid {...GRID} />
                  <XAxis dataKey="name" tick={AXIS} axisLine={false} tickLine={false} />
                  <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={TIP} labelStyle={{ color:H.text }} formatter={(v:number) => [INR(v), 'Revenue']} />
                  <Bar dataKey="revenue" radius={[4,4,0,0]} maxBarSize={28}>
                    {chartData.map((d, i) => <Cell key={i} fill={`hsl(${195 + i*12}, 70%, 50%)`} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card title={`Summary — ${MONTHS[month-1]} ${year}`}>
            <Box p={2.5}>
              {[
                { l:'Total Agents',   v: performance.length },
                { l:'Total Leads',    v: performance.reduce((s,p) => s+p.leadsHandled,    0) },
                { l:'Site Visits',    v: performance.reduce((s,p) => s+p.siteVisits,      0) },
                { l:'Bookings Closed',v: performance.reduce((s,p) => s+p.bookingsClosed,  0) },
                { l:'Total Revenue',  v: INR(performance.reduce((s,p) => s+p.revenueGenerated, 0)) },
              ].map(row => (
                <Box key={row.l} display="flex" justifyContent="space-between" py={0.85}
                  sx={{ borderBottom:`1px solid ${H.border}` }}>
                  <Typography sx={{ color:H.textSub, fontSize:12.5 }}>{row.l}</Typography>
                  <Typography sx={{ color:H.text, fontSize:12.5, fontWeight:600 }}>{row.v}</Typography>
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Card title="All Agent Performance">
        <DataTable columns={cols as any} rows={performance} loading={!!loading.performance} emptyMsg="No performance data for selected period" />
      </Card>
    </Box>
  );
}
