// src/modules/sales-manager/pages/SalesReportsPage.tsx
import React, { useState } from 'react';
import {
  Box, Grid, Button, TextField, Tabs, Tab,
  Typography, LinearProgress,
} from '@mui/material';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Assessment } from '@mui/icons-material';
import { S, INR, DATE, fieldSx, labelSx } from '../hooks';
import { PageHeader, Card, DataTable, StatCard } from '../components/ui';
import { salesApi } from '../api/sales.api';

const GRID = { stroke:'rgba(255,255,255,0.05)', strokeDasharray:'4 3' };
const AXIS = { fill:S.textSub, fontSize:11 };
const TIP  = { background:S.surfaceHigh, border:`1px solid ${S.border}`, borderRadius:8, fontSize:12 };

const SOURCE_COLORS: Record<string,string> = {
  WEBSITE:S.blue, REFERRAL:S.primary, SOCIAL_MEDIA:S.purple,
  WALK_IN:S.gold, COLD_CALL:S.cyan, PORTAL:S.coral, OTHER:S.textSub,
};

export default function SalesReportsPage() {
  const [tab,    setTab]    = useState(0);
  const [from,   setFrom]   = useState(() => { const d=new Date(); d.setDate(1); return d.toISOString().split('T')[0]; });
  const [to,     setTo]     = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [leadData,    setLeadData]    = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [funnelData,  setFunnelData]  = useState<any[]>([]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [l,r,f] = await Promise.all([
        salesApi.get('/reports/leads',      { params:{ from, to } }),
        salesApi.get('/reports/revenue',    { params:{ from, to } }),
        salesApi.get('/reports/conversion', { params:{ from, to } }),
      ]);
      setLeadData(l.data.data ?? []);
      setRevenueData(r.data.data ?? []);
      setFunnelData(f.data.data ?? []);
    } finally { setLoading(false); }
  };

  const totalLeads   = leadData.reduce((s:number,l:any)=>s+l._count.id,0);
  const totalRevenue = revenueData.reduce((s:number,r:any)=>s+r.revenue,0);
  const pieData = leadData.map((l:any)=>({ name:l.sourceChannel, value:l._count.id }));

  return (
    <Box>
      <PageHeader title="Sales Reports" subtitle="Lead source analysis, revenue breakdown, and conversion data"/>

      {/* Date filter */}
      <Box display="flex" gap={1.5} mb={3} flexWrap="wrap">
        <TextField size="small" label="From" type="date" value={from} onChange={e=>setFrom(e.target.value)}
          sx={{ width:160, ...fieldSx }} InputLabelProps={{ shrink:true, sx:labelSx }}/>
        <TextField size="small" label="To" type="date" value={to} onChange={e=>setTo(e.target.value)}
          sx={{ width:160, ...fieldSx }} InputLabelProps={{ shrink:true, sx:labelSx }}/>
        <Button variant="contained" onClick={fetchReports} disabled={loading}
          sx={{ bgcolor:S.primary, textTransform:'none', fontWeight:600, borderRadius:'8px', fontSize:13 }}>
          {loading ? 'Loading…' : 'Generate Report'}
        </Button>
      </Box>

      {/* Summary stats */}
      {(leadData.length>0 || revenueData.length>0) && (
        <Grid container spacing={2} mb={3}>
          {[
            { label:'Total Leads',   value:totalLeads,      accent:S.blue,   icon:<Assessment/> },
            { label:'Total Revenue', value:INR(totalRevenue), accent:S.gold, icon:<Assessment/> },
            { label:'Projects',      value:revenueData.length, accent:S.primary, icon:<Assessment/> },
            { label:'Sources',       value:leadData.length,  accent:S.purple, icon:<Assessment/> },
          ].map(c=><Grid item xs={12} sm={6} md={3} key={c.label}><StatCard {...c} loading={loading} sub={undefined}/></Grid>)}
        </Grid>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom:`1px solid ${S.border}`, mb:2.5 }}>
        <Tabs value={tab} onChange={(_,v)=>setTab(v)} sx={{
          '& .MuiTab-root':{ color:S.textSub, fontSize:13, textTransform:'none', minHeight:40, px:2 },
          '& .Mui-selected':{ color:`${S.primary} !important` },
          '& .MuiTabs-indicator':{ bgcolor:S.primary },
        }}>
          <Tab label="Lead Sources"/>
          <Tab label="Revenue by Project"/>
          <Tab label="Conversion Funnel"/>
        </Tabs>
      </Box>

      {/* Lead sources tab */}
      {tab===0 && (
        leadData.length===0 ? (
          <Box py={6} textAlign="center"><Typography sx={{ color:S.textSub, fontSize:14 }}>Click "Generate Report" to load data</Typography></Box>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12} md={7}>
              <Card title="Leads by Source">
                <Box p={2.5}>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={leadData.map((l:any)=>({ source:l.sourceChannel, count:l._count.id }))} margin={{ left:-16, right:4 }}>
                      <CartesianGrid {...GRID}/>
                      <XAxis dataKey="source" tick={AXIS} axisLine={false} tickLine={false}
                        tickFormatter={s=>s.replace(/_/g,' ')}/>
                      <YAxis tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false}/>
                      <Tooltip contentStyle={TIP} labelStyle={{ color:S.text }} formatter={(v:any)=>[`${v} leads`,'Count']}/>
                      <Bar dataKey="count" name="Leads" radius={[4,4,0,0]} maxBarSize={36}>
                        {leadData.map((l:any)=>(
                          <Cell key={l.sourceChannel} fill={SOURCE_COLORS[l.sourceChannel]??S.primary}/>
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Card>
            </Grid>
            <Grid item xs={12} md={5}>
              <Card title="Source Distribution">
                <Box p={2.5}>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                        paddingAngle={3} dataKey="value">
                        {pieData.map((entry:any)=>(
                          <Cell key={entry.name} fill={SOURCE_COLORS[entry.name]??S.primary}/>
                        ))}
                      </Pie>
                      <Tooltip contentStyle={TIP} formatter={(v:any,n:string)=>[`${v} leads`,n]}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <Box mt={1}>
                    {leadData.map((l:any)=>{
                      const pct = totalLeads>0 ? ((l._count.id/totalLeads)*100).toFixed(1) : '0';
                      const color = SOURCE_COLORS[l.sourceChannel]??S.primary;
                      return (
                        <Box key={l.sourceChannel} display="flex" justifyContent="space-between" py={0.6}
                          sx={{ borderBottom:`1px solid ${S.border}` }}>
                          <Box display="flex" alignItems="center" gap={0.75}>
                            <Box sx={{ width:8, height:8, borderRadius:'50%', bgcolor:color, flexShrink:0 }}/>
                            <Typography sx={{ color:S.textSub, fontSize:12 }}>
                              {l.sourceChannel.replace(/_/g,' ')}
                            </Typography>
                          </Box>
                          <Typography sx={{ color:S.text, fontSize:12, fontWeight:500 }}>
                            {l._count.id} ({pct}%)
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
        )
      )}

      {/* Revenue by project tab */}
      {tab===1 && (
        revenueData.length===0 ? (
          <Box py={6} textAlign="center"><Typography sx={{ color:S.textSub, fontSize:14 }}>Click "Generate Report" to load data</Typography></Box>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Card title="Revenue by Project">
                <Box p={2.5}>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={revenueData} margin={{ left:-16, right:4 }}>
                      <CartesianGrid {...GRID}/>
                      <XAxis dataKey="project" tick={AXIS} axisLine={false} tickLine={false}/>
                      <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={v=>`₹${(v/100000).toFixed(0)}L`}/>
                      <Tooltip contentStyle={TIP} labelStyle={{ color:S.text }}
                        formatter={(v:any,n:any)=>[n==='revenue'?INR(v):`${v} units`,n==='revenue'?'Revenue':'Units']}/>
                      <Bar dataKey="revenue" name="revenue" fill={S.gold} radius={[4,4,0,0]} maxBarSize={40}/>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card title="Project Leaderboard">
                <Box p={2}>
                  {revenueData.map((r:any,i:number)=>(
                    <Box key={r.project} display="flex" justifyContent="space-between" alignItems="center"
                      py={0.9} sx={{ borderBottom:`1px solid ${S.border}` }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography sx={{ color:S.muted, fontSize:12, minWidth:20 }}>#{i+1}</Typography>
                        <Typography sx={{ color:S.text, fontSize:12.5 }}>{r.project}</Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography sx={{ color:S.gold, fontSize:12, fontWeight:700 }}>{INR(r.revenue)}</Typography>
                        <Typography sx={{ color:S.textSub, fontSize:11 }}>{r.units} units</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Card>
            </Grid>
          </Grid>
        )
      )}

      {/* Conversion funnel tab */}
      {tab===2 && (
        funnelData.length===0 ? (
          <Box py={6} textAlign="center"><Typography sx={{ color:S.textSub, fontSize:14 }}>Click "Generate Report" to load data</Typography></Box>
        ) : (
          <Card title="Pipeline Conversion Funnel">
            <Box p={2.5}>
              {funnelData.map((f:any,i:number,arr:any[])=>{
                const pct = arr[0]?._count.id>0 ? Math.round((f._count.id/arr[0]._count.id)*100) : 0;
                const value = f._sum?.dealValue??0;
                const colors = [S.blue,S.cyan,S.gold,S.purple,S.primary,S.coral];
                const color = colors[i%colors.length];
                return (
                  <Box key={f.stage} mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={0.5} flexWrap="wrap" gap={0.5}>
                      <Typography sx={{ color:S.text, fontSize:13, fontWeight:500 }}>
                        {f.stage.replace(/_/g,' ')}
                      </Typography>
                      <Box display="flex" gap={2}>
                        <Typography sx={{ color:S.textSub, fontSize:12 }}>{f._count.id} leads</Typography>
                        {value>0 && <Typography sx={{ color:S.gold, fontSize:12, fontWeight:600 }}>{INR(value)}</Typography>}
                        <Typography sx={{ color:color, fontSize:12, fontWeight:600 }}>{pct}%</Typography>
                      </Box>
                    </Box>
                    <LinearProgress variant="determinate" value={pct}
                      sx={{ height:8, borderRadius:4, bgcolor:'rgba(255,255,255,0.06)',
                        '& .MuiLinearProgress-bar':{ bgcolor:color, borderRadius:4 } }}/>
                  </Box>
                );
              })}
            </Box>
          </Card>
        )
      )}
    </Box>
  );
}
