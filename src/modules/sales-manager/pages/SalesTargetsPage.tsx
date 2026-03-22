// src/modules/sales-manager/pages/SalesTargetsPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Grid, TextField, Select, MenuItem, FormControl,
  InputLabel, Typography, LinearProgress, Dialog, DialogTitle,
  DialogContent, DialogActions,
} from '@mui/material';
import { Add, TrackChanges, Refresh } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, S, INR, DATE, fieldSx, labelSx, selSx } from '../hooks';
import { fetchTargets, doCreateTarget, type Target } from '../store/salesSlice';
import { PageHeader, Card, AgentAvatar } from '../components/ui';
import { salesApi } from '../api/sales.api';

const PERIODS = ['MONTHLY','QUARTERLY','YEARLY'];

export default function SalesTargetsPage() {
  const dispatch = useAppDispatch();
  const { targets, loading } = useAppSelector(s=>s.sales);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ agentId:'', period:'MONTHLY', periodLabel:'', targetAmount:'', targetBookings:'', startDate:'', endDate:'' });
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(()=>{ dispatch(fetchTargets({})); },[dispatch]);
  useEffect(()=>{
    if (open) salesApi.get('/team').then(r=>{
      const all=(r.data.data??[]).flatMap((t:any)=>t.assignments?.map((a:any)=>a.agent)??[]);
      setAgents(all);
    });
  },[open]);

  const set=(k:string,v:string)=>setForm(p=>({...p,[k]:v}));

  const pct = (achieved:number, target:number) => target>0 ? Math.min(100, Math.round((achieved/target)*100)) : 0;

  return (
    <Box>
      <PageHeader title="Sales Targets" subtitle={`${targets.length} active targets`}
        action={
          <Box display="flex" gap={1}>
            <Button variant="outlined" startIcon={<Refresh/>} size="small"
              onClick={()=>salesApi.post('/targets/refresh')}
              sx={{ color:S.cyan, borderColor:`${S.cyan}50`, textTransform:'none', fontSize:13, borderRadius:'8px' }}>
              Refresh Progress
            </Button>
            <Button variant="contained" startIcon={<Add/>} size="small" onClick={()=>setOpen(true)}
              sx={{ bgcolor:S.primary, textTransform:'none', fontWeight:600, borderRadius:'8px', fontSize:13 }}>
              Set Target
            </Button>
          </Box>
        }
      />

      <Grid container spacing={2}>
        {targets.map(t=>{
          const revPct  = pct(t.achievedAmount,   t.targetAmount);
          const bookPct = pct(t.achievedBookings, t.targetBookings);
          const visPct  = pct(t.achievedVisits,   t.targetVisits);
          return (
            <Grid item xs={12} md={6} lg={4} key={t.id}>
              <Box sx={{ bgcolor:S.surface, borderRadius:'14px', p:2.5, border:`1px solid ${S.border}` }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box display="flex" gap={1.25} alignItems="center">
                    <AgentAvatar name={t.agent?.name??'?'} avatarUrl={t.agent?.avatarUrl} size={32}/>
                    <Box>
                      <Typography sx={{ color:S.text, fontSize:13, fontWeight:600 }}>{t.agent?.name??'—'}</Typography>
                      <Typography sx={{ color:S.textSub, fontSize:11 }}>{t.period} · {t.periodLabel}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ bgcolor: revPct>=100?`${S.primary}15`:`${S.gold}12`, borderRadius:'8px', px:1, py:0.5 }}>
                    <Typography sx={{ color:revPct>=100?S.primary:S.gold, fontSize:12, fontWeight:700 }}>{revPct}%</Typography>
                  </Box>
                </Box>

                {[
                  { label:'Revenue', achieved:INR(t.achievedAmount), target:INR(t.targetAmount), pct:revPct, color:S.gold },
                  { label:'Bookings', achieved:t.achievedBookings, target:t.targetBookings, pct:bookPct, color:S.primary },
                  { label:'Visits',  achieved:t.achievedVisits,  target:t.targetVisits,  pct:visPct,  color:S.cyan },
                ].map(row=>(
                  <Box key={row.label} mb={1.5}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography sx={{ color:S.textSub, fontSize:11.5 }}>{row.label}</Typography>
                      <Typography sx={{ color:S.text, fontSize:11.5 }}>{row.achieved} / {row.target}</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={row.pct}
                      sx={{ height:5, borderRadius:3, bgcolor:'rgba(255,255,255,0.06)',
                        '& .MuiLinearProgress-bar':{ bgcolor:row.color, borderRadius:3 } }}/>
                  </Box>
                ))}
              </Box>
            </Grid>
          );
        })}
      </Grid>

      <Dialog open={open} onClose={()=>setOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx:{ bgcolor:S.surface, border:`1px solid ${S.border}`, borderRadius:'14px' } }}>
        <DialogTitle sx={{ color:S.text, fontWeight:700, fontSize:15, pb:1 }}>Set Sales Target</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={0.25}>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel sx={labelSx}>Agent *</InputLabel>
                <Select value={form.agentId} label="Agent *" onChange={e=>set('agentId',e.target.value)} sx={selSx}>
                  {agents.map((a:any)=><MenuItem key={a.id} value={a.id} sx={{ fontSize:13 }}>{a.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={3}>
              <FormControl fullWidth size="small">
                <InputLabel sx={labelSx}>Period</InputLabel>
                <Select value={form.period} label="Period" onChange={e=>set('period',e.target.value)} sx={selSx}>
                  {PERIODS.map(p=><MenuItem key={p} value={p} sx={{ fontSize:13 }}>{p}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={3}>
              <TextField fullWidth size="small" label="Label (e.g. Mar 2026)" value={form.periodLabel} onChange={e=>set('periodLabel',e.target.value)} sx={fieldSx} InputLabelProps={{ sx:labelSx }}/>
            </Grid>
            <Grid item xs={6}><TextField fullWidth size="small" label="Target Revenue (₹)" type="number" value={form.targetAmount} onChange={e=>set('targetAmount',e.target.value)} sx={fieldSx} InputLabelProps={{ sx:labelSx }}/></Grid>
            <Grid item xs={6}><TextField fullWidth size="small" label="Target Bookings" type="number" value={form.targetBookings} onChange={e=>set('targetBookings',e.target.value)} sx={fieldSx} InputLabelProps={{ sx:labelSx }}/></Grid>
            <Grid item xs={6}><TextField fullWidth size="small" label="Start Date" type="date" value={form.startDate} onChange={e=>set('startDate',e.target.value)} sx={fieldSx} InputLabelProps={{ sx:{...labelSx,shrink:true} }}/></Grid>
            <Grid item xs={6}><TextField fullWidth size="small" label="End Date" type="date" value={form.endDate} onChange={e=>set('endDate',e.target.value)} sx={fieldSx} InputLabelProps={{ sx:{...labelSx,shrink:true} }}/></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px:3, pb:2.5, gap:1 }}>
          <Button onClick={()=>setOpen(false)} sx={{ color:S.textSub, textTransform:'none', fontSize:13 }}>Cancel</Button>
          <Button variant="contained" disabled={!form.agentId||!form.targetAmount||!form.startDate}
            onClick={()=>{ dispatch(doCreateTarget({ ...form, targetAmount:+form.targetAmount, targetBookings:+form.targetBookings })); setOpen(false); }}
            sx={{ bgcolor:S.primary, textTransform:'none', fontWeight:600, borderRadius:'8px', fontSize:13 }}>
            Set Target
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
