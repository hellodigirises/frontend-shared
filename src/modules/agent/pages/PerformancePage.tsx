// src/modules/agent/pages/PerformancePage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Select, MenuItem, FormControl, InputLabel,
  Typography, LinearProgress, Avatar,
} from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, A, INR, selSx, labelSx } from '../hooks';
import { fetchPerformance, fetchLeaderboard } from '../store/agentSlice';
import { PageHeader, Card, StatCard } from '../components/ui';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const GOLD = '#F59E0B', SILVER = '#94A3B8', BRONZE = '#CD7F32';

export default function PerformancePage() {
  const dispatch = useAppDispatch();
  const { performance:p, leaderboard, loading } = useAppSelector(s=>s.agent);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth()+1);
  const [year,  setYear]  = useState(now.getFullYear());

  useEffect(()=>{
    dispatch(fetchPerformance({ month, year }));
    dispatch(fetchLeaderboard({ month, year }));
  },[dispatch,month,year]);

  const myRank = leaderboard.findIndex((l:any)=>{
    const storedId = localStorage.getItem('userId');
    return l.agentId===storedId;
  });

  const rankColors = [GOLD, SILVER, BRONZE];

  return (
    <Box>
      <PageHeader title="Performance" subtitle="Your personal sales metrics"/>
      <Box display="flex" gap={1.5} mb={2.5}>
        <FormControl size="small" sx={{ minWidth:140 }}>
          <InputLabel sx={labelSx}>Month</InputLabel>
          <Select value={month} label="Month" onChange={e=>setMonth(+e.target.value)} sx={selSx}>
            {MONTHS.map((m,i)=><MenuItem key={i} value={i+1} sx={{ fontSize:13 }}>{m}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth:100 }}>
          <InputLabel sx={labelSx}>Year</InputLabel>
          <Select value={year} label="Year" onChange={e=>setYear(+e.target.value)} sx={selSx}>
            {[2024,2025,2026].map(y=><MenuItem key={y} value={y} sx={{ fontSize:13 }}>{y}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {p && (
        <>
          <Grid container spacing={1.5} mb={2.5}>
            {[
              { label:'Leads',    value:p.leadsHandled,       accent:A.blue   },
              { label:'Follow-ups', value:p.followUpsCompleted, accent:A.amber  },
              { label:'Visits',   value:p.siteVisits,          accent:A.primary },
              { label:'Bookings', value:p.bookingsClosed,      accent:A.indigo  },
              { label:'Revenue',  value:INR(p.revenueGenerated), accent:A.green  },
              { label:'Conv. Rate',value:`${p.conversionRate}%`, accent:A.primary },
            ].map(c=>(
              <Grid item xs={6} sm={4} key={c.label}>
                <Box sx={{ bgcolor:A.surfaceHigh, borderRadius:'12px', p:1.75, border:`1px solid ${A.border}` }}>
                  <Typography sx={{ color:A.textSub, fontSize:10.5, textTransform:'uppercase', letterSpacing:0.4, mb:0.5 }}>{c.label}</Typography>
                  <Typography sx={{ color:c.accent, fontSize:22, fontWeight:800, letterSpacing:-0.5 }}>{c.value}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Card title="Target Progress" pad>
            <Box mb={2}>
              <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography sx={{ color:A.textSub, fontSize:13 }}>Revenue Target</Typography>
                <Typography sx={{ color:A.text, fontSize:13 }}>
                  {INR(p.revenueGenerated)} / {p.targetAmount>0?INR(p.targetAmount):'Not set'}
                </Typography>
              </Box>
              <LinearProgress variant="determinate"
                value={p.targetAmount>0?Math.min(100,(p.revenueGenerated/p.targetAmount)*100):0}
                sx={{ height:8, borderRadius:4, bgcolor:'rgba(255,245,236,0.07)',
                  '& .MuiLinearProgress-bar':{ bgcolor:A.green, borderRadius:4 } }}/>
            </Box>
            <Box>
              <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography sx={{ color:A.textSub, fontSize:13 }}>Booking Target</Typography>
                <Typography sx={{ color:A.text, fontSize:13 }}>
                  {p.bookingsClosed} / {p.targetBookings||'Not set'}
                </Typography>
              </Box>
              <LinearProgress variant="determinate"
                value={p.targetBookings>0?Math.min(100,(p.bookingsClosed/p.targetBookings)*100):0}
                sx={{ height:8, borderRadius:4, bgcolor:'rgba(255,245,236,0.07)',
                  '& .MuiLinearProgress-bar':{ bgcolor:A.primary, borderRadius:4 } }}/>
            </Box>
          </Card>
        </>
      )}

      <Box mt={2.5}>
        <Card title={`Team Leaderboard — ${MONTHS[month-1]} ${year}`}>
          <Box p={1.5}>
            {leaderboard.slice(0,10).map((a:any,i:number)=>{
              const rankColor = i<3?rankColors[i]:A.textSub;
              return (
                <Box key={a.agentId} display="flex" alignItems="center" gap={1.5}
                  py={1} sx={{ borderBottom:`1px solid ${A.border}`, bgcolor:myRank===i?`${A.primary}06`:undefined }}>
                  <Box sx={{ minWidth:24, textAlign:'center' }}>
                    {i<3 ? <EmojiEvents sx={{ fontSize:16, color:rankColor }}/>
                          : <Typography sx={{ color:A.muted, fontSize:12 }}>#{i+1}</Typography>}
                  </Box>
                  <Avatar sx={{ width:28, height:28, bgcolor:`hsl(${a.name?.charCodeAt(0)*17%360},55%,35%)`, fontSize:11, fontWeight:700 }}>
                    {(a.name??'?').charAt(0)}
                  </Avatar>
                  <Box flex={1} ml={0.5}>
                    <Typography sx={{ color:myRank===i?A.primary:A.text, fontSize:13, fontWeight:myRank===i?700:400 }}>
                      {a.name}{myRank===i?' (You)':''}
                    </Typography>
                    <Typography sx={{ color:A.textSub, fontSize:11 }}>{a.bookings} bookings · {a.convRate}% conv</Typography>
                  </Box>
                  <Typography sx={{ color:rankColor, fontSize:13, fontWeight:700 }}>{INR(a.revenue)}</Typography>
                </Box>
              );
            })}
            {leaderboard.length===0 && <Typography sx={{ color:A.textSub, fontSize:13, py:3, textAlign:'center' }}>No data</Typography>}
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
