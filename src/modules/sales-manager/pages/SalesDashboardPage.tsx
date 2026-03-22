// src/modules/sales-manager/pages/SalesDashboardPage.tsx
import React, { useEffect } from 'react';
import { Grid, Box, Typography, LinearProgress, Chip } from '@mui/material';
import {
  TrendingUp, PersonAdd, Map, Handshake, AccountBalance, Warning,
} from '@mui/icons-material';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts';
import { useAppDispatch, useAppSelector, S, INR } from '../hooks';
import { fetchDashboard, fetchAlerts } from '../store/salesSlice';
import { StatCard, PageHeader, Card, AgentAvatar } from '../components/ui';

const GRID = { stroke:'rgba(255,255,255,0.05)', strokeDasharray:'4 3' };
const AXIS = { fill:S.textSub, fontSize:11 };
const TIP  = { background:S.surfaceHigh, border:`1px solid ${S.border}`, borderRadius:8, fontSize:12 };
const STAGE_COLORS: Record<string,string> = {
  NEW_LEAD:'#64748B',CONTACTED:S.blue,QUALIFIED:S.cyan,
  SITE_VISIT:S.gold,NEGOTIATION:S.purple,CLOSED_WON:S.primary,CLOSED_LOST:S.coral,
};

export default function SalesDashboardPage() {
  const dispatch = useAppDispatch();
  const { dashboard:d, alerts, loading } = useAppSelector(s=>s.sales);
  const busy = !!loading.dashboard;

  useEffect(() => {
    dispatch(fetchDashboard());
    dispatch(fetchAlerts());
  }, [dispatch]);

  const stats = [
    { label:'Pipeline Value',      value:INR(d?.stats.pipelineValue??0),      accent:S.blue,   icon:<TrendingUp/>,   sub:'Active deals',                     trend: undefined },
    { label:'Revenue This Month',  value:INR(d?.stats.revenueThisMonth??0),    accent:S.gold,   icon:<AccountBalance/>, sub:`Prev: ${INR(d?.stats.revenuePrevMonth??0)}`, trend:+(d?.stats.revenueGrowthPct??0) },
    { label:'New Leads',           value:d?.stats.newLeadsMonth??0,            accent:S.primary,icon:<PersonAdd/>,    sub:'This month' },
    { label:'Site Visits Today',   value:d?.stats.pendingVisits??0,            accent:S.cyan,   icon:<Map/>,          sub:`${d?.stats.siteVisitsCompleted??0} completed this month` },
    { label:'Deals Closed',        value:d?.stats.dealsThisMonth??0,           accent:S.primary,icon:<Handshake/>,    sub:'This month' },
    { label:'Stale Leads',         value:d?.stats.staleLeads??0,               accent:S.coral,  icon:<Warning/>,      sub:'7+ days no activity' },
  ];

  return (
    <Box>
      <PageHeader title="Sales Command Center" subtitle={`Live overview — ${new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}`} />

      {/* Alerts banner */}
      {alerts.length > 0 && (
        <Box sx={{ bgcolor:`${S.coral}10`, border:`1px solid ${S.coral}30`, borderRadius:'10px', px:2, py:1.25, mb:2.5, display:'flex', alignItems:'center', gap:1.5 }}>
          <Warning sx={{ color:S.coral, fontSize:16 }}/>
          <Typography sx={{ color:S.coral, fontSize:13 }}>
            {alerts.length} alert{alerts.length>1?'s':''} require your attention
          </Typography>
          <Box sx={{ ml:'auto', display:'flex', gap:0.75 }}>
            {alerts.slice(0,3).map(a=>(
              <Chip key={a.id} label={a.alertType.replace(/_/g,' ')} size="small"
                sx={{ fontSize:10, height:20, bgcolor:`${S.coral}15`, color:S.coral }}/>
            ))}
          </Box>
        </Box>
      )}

      {/* Stat cards */}
      <Grid container spacing={2} mb={3}>
        {stats.map(s=><Grid item xs={12} sm={6} md={4} lg={2} key={s.label}><StatCard {...s} loading={busy} sub={s.sub}/></Grid>)}
      </Grid>

      <Grid container spacing={2} mb={2}>
        {/* Revenue growth */}
        <Grid item xs={12} md={8}>
          <Card title="Revenue Growth (6 months)">
            <Box p={2.5}>
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart data={d?.charts.revenueGrowth??[]} margin={{right:4,left:-16}}>
                  <defs>
                    <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="10%" stopColor={S.gold} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={S.gold} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...GRID}/>
                  <XAxis dataKey="month" tick={AXIS} axisLine={false} tickLine={false}/>
                  <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={v=>`₹${(v/100000).toFixed(0)}L`}/>
                  <Tooltip contentStyle={TIP} labelStyle={{color:S.text}} formatter={(v:number,n)=>[INR(v),n]}/>
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke={S.gold} fill="url(#gRev)" strokeWidth={2.5} dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Pipeline by stage */}
        <Grid item xs={12} md={4}>
          <Card title="Pipeline Funnel">
            <Box p={2.5}>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={d?.charts.pipelineByStage??[]} layout="vertical" margin={{left:8,right:8}}>
                  <CartesianGrid {...GRID} horizontal={false}/>
                  <XAxis type="number" tick={AXIS} axisLine={false} tickLine={false}/>
                  <YAxis type="category" dataKey="stage" width={100} tick={{...AXIS,fontSize:10}} axisLine={false} tickLine={false}
                    tickFormatter={s=>s.replace(/_/g,' ')}/>
                  <Tooltip contentStyle={TIP} cursor={{fill:'rgba(255,255,255,0.02)'}}
                    formatter={(v:number,n)=>[n==='count'?`${v} leads`:INR(v),n==='count'?'Leads':'Value']}/>
                  <Bar dataKey="count" name="count" radius={[0,5,5,0]} maxBarSize={14}>
                    {(d?.charts.pipelineByStage??[]).map(p=>(
                      <Cell key={p.stage} fill={STAGE_COLORS[p.stage]??S.primary}/>
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* Top agents */}
        <Grid item xs={12} md={6}>
          <Card title="Top Performers This Month">
            <Box p={2}>
              {(d?.charts.topAgents??[]).length===0
                ? <Typography sx={{ color:S.textSub, fontSize:13, py:2, textAlign:'center' }}>No data</Typography>
                : (d?.charts.topAgents??[]).map((a,i)=>(
                  <Box key={a.agentId} display="flex" alignItems="center" gap={1.5}
                    py={1} sx={{ borderBottom:`1px solid ${S.border}` }}>
                    <Typography sx={{ color:S.muted, fontSize:12, minWidth:20 }}>#{i+1}</Typography>
                    <AgentAvatar name={a.name} size={30}/>
                    <Box flex={1}>
                      <Typography sx={{ color:S.text, fontSize:13, fontWeight:500 }}>{a.name}</Typography>
                      <Typography sx={{ color:S.textSub, fontSize:11 }}>{a.bookings} bookings · {a.visits} visits</Typography>
                    </Box>
                    <Box textAlign="right">
                      <Typography sx={{ color:S.gold, fontSize:13, fontWeight:700 }}>{INR(a.revenue)}</Typography>
                    </Box>
                    <Box sx={{ width:50 }}>
                      <LinearProgress variant="determinate"
                        value={Math.min(100,(a.revenue/Math.max(...(d?.charts.topAgents??[]).map((x:any)=>x.revenue),1))*100)}
                        sx={{ height:4, borderRadius:2, bgcolor:'rgba(255,255,255,0.06)', '& .MuiLinearProgress-bar':{bgcolor:S.gold,borderRadius:2} }}/>
                    </Box>
                  </Box>
                ))
              }
            </Box>
          </Card>
        </Grid>

        {/* Conversion funnel */}
        <Grid item xs={12} md={6}>
          <Card title="Conversion Funnel">
            <Box p={2}>
              {(d?.charts.conversionFunnel??[]).map((f,i,arr)=>{
                const pct = arr[0]?.count>0 ? Math.round((f.count/arr[0].count)*100) : 0;
                const color = STAGE_COLORS[f.stage]??S.primary;
                return (
                  <Box key={f.stage} mb={1.5}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography sx={{ color:S.textSub, fontSize:12 }}>{f.stage.replace(/_/g,' ')}</Typography>
                      <Typography sx={{ color:S.text, fontSize:12, fontWeight:600 }}>{f.count} ({pct}%)</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={pct}
                      sx={{ height:6, borderRadius:3, bgcolor:'rgba(255,255,255,0.06)',
                        '& .MuiLinearProgress-bar':{bgcolor:color,borderRadius:3} }}/>
                  </Box>
                );
              })}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
