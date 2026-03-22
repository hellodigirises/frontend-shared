// src/modules/agent/pages/AgentDashboardPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Typography, Button, Chip, LinearProgress,
} from '@mui/material';
import {
  ContactPhone, EventNote, Map, Receipt, Assignment,
  LoginOutlined, LogoutOutlined, CheckCircle,
} from '@mui/icons-material';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAppDispatch, useAppSelector, A, INR, TIME, RELATIVE } from '../hooks';
import { fetchDashboard, doCheckIn, doCheckOut, fetchNotifications } from '../store/agentSlice';
import { StatCard, PageHeader, Card, LeadStatusChip } from '../components/ui';

const GRID = { stroke:'rgba(255,245,236,0.05)', strokeDasharray:'4 3' };
const AXIS = { fill:A.textSub, fontSize:11 };
const TIP  = { background:A.surfaceHigh, border:`1px solid ${A.border}`, borderRadius:8, fontSize:12 };

export default function AgentDashboardPage() {
  const dispatch = useAppDispatch();
  const { dashboard:d, loading } = useAppSelector(s => s.agent);
  const busy = !!loading.dashboard;
  const [locLoading, setLocLoading] = useState(false);

  useEffect(()=>{
    dispatch(fetchDashboard());
    dispatch(fetchNotifications({ unread:true }));
  },[dispatch]);

  const handleCheckIn = () => {
    setLocLoading(true);
    navigator.geolocation?.getCurrentPosition(
      pos => {
        dispatch(doCheckIn({ latitude:pos.coords.latitude, longitude:pos.coords.longitude, checkInType:'FIELD' }));
        setLocLoading(false);
      },
      () => {
        // Fallback without GPS
        dispatch(doCheckIn({ latitude:0, longitude:0, checkInType:'OFFICE' }));
        setLocLoading(false);
      },
      { enableHighAccuracy:true, timeout:10_000 },
    );
  };

  const handleCheckOut = () => {
    navigator.geolocation?.getCurrentPosition(
      pos => dispatch(doCheckOut({ latitude:pos.coords.latitude, longitude:pos.coords.longitude })),
      () => dispatch(doCheckOut({ latitude:0, longitude:0 })),
    );
  };

  const stats = [
    { label:'Active Leads',   value:d?.stats.activeLeads??0,       accent:A.blue,   icon:<ContactPhone/> },
    { label:'Follow-ups Due', value:d?.stats.followUpsDue??0,       accent:A.amber,  icon:<EventNote/>    },
    { label:'Visits Today',   value:d?.stats.visitsToday??0,        accent:A.primary,icon:<Map/>          },
    { label:'Bookings',       value:d?.stats.bookingsMonth??0,       accent:A.indigo, icon:<Receipt/>      },
    { label:'Revenue',        value:INR(d?.stats.revenueMonth??0),  accent:A.green,  icon:<Receipt/>      },
    { label:'Pending Tasks',  value:d?.stats.pendingTasks??0,        accent:A.red,    icon:<Assignment/>   },
  ];

  return (
    <Box>
      <PageHeader
        title="Good morning 👋"
        subtitle="Your daily sales command center"
      />

      {/* Attendance CTA — prominent on mobile */}
      <Box sx={{
        bgcolor: d?.stats.isCheckedIn && !d?.stats.isCheckedOut
          ? `${A.green}12` : `${A.primary}12`,
        border:`1px solid ${d?.stats.isCheckedIn && !d?.stats.isCheckedOut ? `${A.green}30` : `${A.primary}30`}`,
        borderRadius:'14px', p:2, mb:2.5,
        display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:1,
      }}>
        <Box>
          {d?.stats.isCheckedIn && !d?.stats.isCheckedOut ? (
            <>
              <Typography sx={{ color:A.green, fontWeight:700, fontSize:14 }}>✓ Checked In</Typography>
              <Typography sx={{ color:A.textSub, fontSize:12 }}>
                Since {TIME(d?.todayAttendance?.checkInTime)}
              </Typography>
            </>
          ) : d?.stats.isCheckedOut ? (
            <>
              <Typography sx={{ color:A.textSub, fontWeight:600, fontSize:14 }}>Day Complete</Typography>
              <Typography sx={{ color:A.textSub, fontSize:12 }}>{d?.todayAttendance?.totalHours?.toFixed(1)}h worked</Typography>
            </>
          ) : (
            <>
              <Typography sx={{ color:A.primary, fontWeight:700, fontSize:14 }}>Mark Attendance</Typography>
              <Typography sx={{ color:A.textSub, fontSize:12 }}>GPS check-in required</Typography>
            </>
          )}
        </Box>
        <Box display="flex" gap={1}>
          {!d?.stats.isCheckedIn && (
            <Button variant="contained" startIcon={<LoginOutlined/>} size="small"
              disabled={locLoading} onClick={handleCheckIn}
              sx={{ bgcolor:A.primary, textTransform:'none', fontWeight:600, borderRadius:'8px', fontSize:13 }}>
              {locLoading ? 'Getting GPS…' : 'Check In'}
            </Button>
          )}
          {d?.stats.isCheckedIn && !d?.stats.isCheckedOut && (
            <Button variant="outlined" startIcon={<LogoutOutlined/>} size="small"
              onClick={handleCheckOut}
              sx={{ color:A.green, borderColor:`${A.green}50`, textTransform:'none', fontSize:13, borderRadius:'8px' }}>
              Check Out
            </Button>
          )}
        </Box>
      </Box>

      {/* Conversion rate banner */}
      {d?.stats.conversionRate !== undefined && (
        <Box sx={{ bgcolor:A.surfaceHigh, borderRadius:'12px', p:1.75, mb:2.5, display:'flex', alignItems:'center', gap:2 }}>
          <Box flex={1}>
            <Typography sx={{ color:A.textSub, fontSize:11, textTransform:'uppercase', letterSpacing:0.4 }}>Your Conversion Rate</Typography>
            <Typography sx={{ color:A.primary, fontSize:22, fontWeight:800, letterSpacing:-0.5 }}>
              {d.stats.conversionRate}%
            </Typography>
          </Box>
          <Box sx={{ width:120 }}>
            <LinearProgress variant="determinate" value={d.stats.conversionRate}
              sx={{ height:8, borderRadius:4, bgcolor:'rgba(255,245,236,0.07)',
                '& .MuiLinearProgress-bar':{ bgcolor:d.stats.conversionRate>50?A.green:d.stats.conversionRate>25?A.amber:A.red, borderRadius:4 } }}/>
          </Box>
        </Box>
      )}

      {/* Stat grid */}
      <Grid container spacing={1.5} mb={2.5}>
        {stats.map(s=>(
          <Grid item xs={6} sm={4} md={2} key={s.label}>
            <StatCard {...s} loading={busy} compact/>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        {/* Sales trend */}
        <Grid item xs={12} md={7}>
          <Card title="Sales Trend (6 months)">
            <Box p={2}>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={d?.salesTrend??[]} margin={{ right:4, left:-16 }}>
                  <defs>
                    <linearGradient id="gAgent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="8%"  stopColor={A.primary} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={A.primary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...GRID}/>
                  <XAxis dataKey="month" tick={AXIS} axisLine={false} tickLine={false}/>
                  <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={v=>`₹${(v/100000).toFixed(0)}L`}/>
                  <Tooltip contentStyle={TIP} labelStyle={{ color:A.text }} formatter={(v:number,n)=>[INR(v),n]}/>
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke={A.primary} fill="url(#gAgent)" strokeWidth={2.5} dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Upcoming follow-ups */}
        <Grid item xs={12} md={5}>
          <Card title={`Upcoming Follow-ups (${d?.upcomingFollowUps?.length??0})`}>
            <Box p={1.5}>
              {(d?.upcomingFollowUps??[]).length===0
                ? <Typography sx={{ color:A.textSub, fontSize:13, py:2, textAlign:'center' }}>No upcoming follow-ups</Typography>
                : (d?.upcomingFollowUps??[]).map((f:any)=>(
                  <Box key={f.id} sx={{
                    bgcolor:A.surfaceHigh, borderRadius:'10px', p:1.5, mb:1,
                    borderLeft:`3px solid ${A.amber}`,
                  }}>
                    <Typography sx={{ color:A.text, fontSize:13, fontWeight:500 }}>{f.lead?.customerName}</Typography>
                    <Typography sx={{ color:A.textSub, fontSize:11.5 }}>{f.lead?.customerPhone}</Typography>
                    <Box display="flex" justifyContent="space-between" mt={0.5}>
                      <Chip label={f.activityType} size="small" sx={{ fontSize:9.5, height:18, bgcolor:`${A.amber}15`, color:A.amber }}/>
                      <Typography sx={{ color:A.amber, fontSize:11.5 }}>
                        {new Date(f.nextFollowUpDate).toLocaleDateString('en-IN',{ day:'2-digit', month:'short' })}
                      </Typography>
                    </Box>
                  </Box>
                ))
              }
            </Box>
          </Card>
        </Grid>

        {/* Recent activities */}
        <Grid item xs={12}>
          <Card title="Recent Activity">
            <Box p={1.5}>
              {(d?.recentActivities??[]).length===0
                ? <Typography sx={{ color:A.textSub, fontSize:13, py:2, textAlign:'center' }}>No recent activity</Typography>
                : (d?.recentActivities??[]).map((a:any)=>(
                  <Box key={a.id} display="flex" alignItems="center" gap={1.5}
                    py={0.9} sx={{ borderBottom:`1px solid ${A.border}` }}>
                    <Box sx={{ width:8, height:8, borderRadius:'50%', bgcolor:A.primary, flexShrink:0 }}/>
                    <Box flex={1}>
                      <Typography sx={{ color:A.text, fontSize:13 }}>{a.lead?.customerName??'—'}</Typography>
                      <Typography sx={{ color:A.textSub, fontSize:11.5 }}>{a.activityType?.replace(/_/g,' ')}</Typography>
                    </Box>
                    <Box textAlign="right">
                      <LeadStatusChip status={a.lead?.status??'NEW'}/>
                      <Typography sx={{ color:A.muted, fontSize:10.5, mt:0.25 }}>{RELATIVE(a.createdAt)}</Typography>
                    </Box>
                  </Box>
                ))
              }
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
