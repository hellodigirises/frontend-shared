// src/modules/sales-manager/pages/LeaderboardPage.tsx
import React, { useEffect, useState } from 'react';
import { Box, Grid, Select, MenuItem, FormControl, InputLabel, Typography, LinearProgress } from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, S, INR, selSx, labelSx } from '../hooks';
import { fetchLeaderboard } from '../store/salesSlice';
import { PageHeader, Card, AgentAvatar } from '../components/ui';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const RANK_COLOR = ['#F59E0B','#94A3B8','#CD7F32'];

export default function LeaderboardPage() {
  const dispatch = useAppDispatch();
  const { leaderboard } = useAppSelector(s=>s.sales);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth()+1);
  const [year,  setYear]  = useState(now.getFullYear());

  useEffect(()=>{ dispatch(fetchLeaderboard({ month, year })); },[dispatch,month,year]);

  const maxRev = Math.max(...leaderboard.map(a=>a.revenue), 1);

  return (
    <Box>
      <PageHeader title="Leaderboard" subtitle="Agent performance rankings"/>

      <Box display="flex" gap={1.5} mb={3}>
        <FormControl size="small" sx={{ minWidth:150 }}>
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

      {/* Top 3 podium */}
      {leaderboard.length >= 3 && (
        <Box display="flex" justifyContent="center" gap={2} mb={4}>
          {[leaderboard[1], leaderboard[0], leaderboard[2]].map((a,i)=>{
            const podiumPos = [2,1,3][i];
            const h = [80,110,70][i];
            const color = RANK_COLOR[podiumPos-1]??S.primary;
            return (
              <Box key={a.agentId} display="flex" flexDirection="column" alignItems="center" gap={1} sx={{ minWidth:140 }}>
                <AgentAvatar name={a.name} avatarUrl={a.avatarUrl} size={podiumPos===1?52:44}/>
                <Typography sx={{ color:S.text, fontSize:13, fontWeight:600 }}>{a.name.split(' ')[0]}</Typography>
                <Typography sx={{ color:S.gold, fontSize:12, fontWeight:700 }}>{INR(a.revenue)}</Typography>
                <Box sx={{
                  width:100, height:h, bgcolor:`${color}20`, border:`2px solid ${color}`,
                  borderRadius:'8px 8px 0 0', display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  <Typography sx={{ color, fontSize:20, fontWeight:800 }}>#{podiumPos}</Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Full table */}
      <Card title="Full Rankings">
        <Box p={2}>
          {leaderboard.map((a,i)=>(
            <Box key={a.agentId} display="flex" alignItems="center" gap={2}
              py={1.25} sx={{ borderBottom:`1px solid ${S.border}` }}>
              <Box sx={{ minWidth:28, textAlign:'center' }}>
                {i<3
                  ? <EmojiEvents sx={{ fontSize:18, color:RANK_COLOR[i]??S.muted }}/>
                  : <Typography sx={{ color:S.muted, fontSize:13 }}>#{i+1}</Typography>
                }
              </Box>
              <AgentAvatar name={a.name} avatarUrl={a.avatarUrl} size={32}/>
              <Box flex={1} ml={1.5}>
                <Typography sx={{ color:S.text, fontSize:13, fontWeight:500 }}>{a.name}</Typography>
                <Typography sx={{ color:S.textSub, fontSize:11 }}>
                  {a.bookings} bookings · {a.visits} visits · {a.convRate.toFixed(1)}% conv
                </Typography>
              </Box>
              <Box textAlign="right" mr={1.5}>
                <Typography sx={{ color:S.gold, fontSize:13, fontWeight:700 }}>{INR(a.revenue)}</Typography>
                <Typography sx={{ color:S.textSub, fontSize:11 }}>{a.leads} leads</Typography>
              </Box>
              <Box sx={{ width:80 }}>
                <LinearProgress variant="determinate" value={(a.revenue/maxRev)*100}
                  sx={{ height:4, borderRadius:2, bgcolor:'rgba(255,255,255,0.06)',
                    '& .MuiLinearProgress-bar':{ bgcolor:i<3?RANK_COLOR[i]:S.primary, borderRadius:2 } }}/>
              </Box>
            </Box>
          ))}
          {leaderboard.length===0 && (
            <Typography sx={{ color:S.textSub, fontSize:13, py:3, textAlign:'center' }}>No performance data for this period</Typography>
          )}
        </Box>
      </Card>
    </Box>
  );
}
