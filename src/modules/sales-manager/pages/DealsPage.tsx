// src/modules/sales-manager/pages/DealsPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Grid, Select, MenuItem, FormControl,
  InputLabel, Typography, Chip, LinearProgress, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material';
import { Add, Handshake } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, S, INR, DATE, STAGE_COLOR, fieldSx, labelSx, selSx } from '../hooks';
import { fetchDeals, doCreateDeal, doUpdateDeal, type Deal } from '../store/salesSlice';
import { PageHeader, Card, DataTable, StatCard, StageChip } from '../components/ui';

const DEAL_STAGES = ['PROPOSAL','NEGOTIATION','FINALIZATION','CLOSED_WON','CLOSED_LOST'];

export default function DealsPage() {
  const dispatch = useAppDispatch();
  const { deals, loading } = useAppSelector(s=>s.sales);
  const [stage, setStage] = useState('');
  const [open,  setOpen]  = useState(false);
  const [form,  setForm]  = useState({ leadId:'', unitId:'', dealValue:'', expectedCloseDate:'', notes:'' });
  const busy = !!loading.deals;

  useEffect(()=>{ dispatch(fetchDeals({ stage:stage as any||undefined })); },[dispatch,stage]);

  const totalValue = deals.data.reduce((s,d)=>s+d.dealValue,0);
  const won        = deals.data.filter(d=>d.dealStage==='CLOSED_WON').length;
  const active     = deals.data.filter(d=>!['CLOSED_WON','CLOSED_LOST'].includes(d.dealStage)).length;

  const set=(k:string,v:string)=>setForm(p=>({...p,[k]:v}));

  const cols = [
    { label:'Customer',    render:(r:Deal)=><Typography sx={{ color:S.text, fontSize:13 }}>{r.lead?.customerName??'—'}</Typography> },
    { label:'Unit',        render:(r:Deal)=>r.unit?<Typography sx={{ color:S.textSub, fontSize:12 }}>{r.unit.unitNumber} · {r.unit.unitType}</Typography>:<Typography sx={{ color:S.muted, fontSize:12 }}>—</Typography> },
    { label:'Value',       render:(r:Deal)=><Typography sx={{ color:S.gold, fontSize:13, fontWeight:700 }}>{INR(r.dealValue)}</Typography> },
    { label:'Stage',       render:(r:Deal)=><StageChip stage={r.dealStage}/> },
    { label:'Probability', render:(r:Deal)=>r.probability?(
      <Box sx={{ width:80 }}>
        <Typography sx={{ color:S.textSub, fontSize:10.5, mb:0.25 }}>{r.probability}%</Typography>
        <LinearProgress variant="determinate" value={r.probability}
          sx={{ height:4, borderRadius:2, bgcolor:'rgba(255,255,255,0.06)',
            '& .MuiLinearProgress-bar':{bgcolor:STAGE_COLOR[r.dealStage]??S.primary,borderRadius:2} }}/>
      </Box>
    ):null},
    { label:'Agent',       render:(r:Deal)=><Typography sx={{ color:S.textSub, fontSize:12 }}>{r.agent?.name??'—'}</Typography> },
    { label:'Close Date',  render:(r:Deal)=><Typography sx={{ color:S.textSub, fontSize:12 }}>{DATE(r.expectedCloseDate)}</Typography> },
    { label:'',            render:(r:Deal)=>r.dealStage==='NEGOTIATION'?(
      <Button size="small" onClick={()=>dispatch(doUpdateDeal({ id:r.id, dealStage:'CLOSED_WON' }))}
        sx={{ color:S.primary, fontSize:11, textTransform:'none', p:0.5 }}>Mark Won</Button>
    ):null},
  ];

  return (
    <Box>
      <PageHeader title="Deals" subtitle={`${deals.total} total deals`}
        action={
          <Button variant="contained" startIcon={<Add/>} size="small" onClick={()=>setOpen(true)}
            sx={{ bgcolor:S.primary, textTransform:'none', fontWeight:600, borderRadius:'8px', fontSize:13 }}>
            New Deal
          </Button>
        }
      />
      <Grid container spacing={2} mb={3}>
        {[
          { label:'Total Value', value:INR(totalValue), accent:S.gold,   icon:<Handshake/> },
          { label:'Active',      value:active,           accent:S.blue,   icon:<Handshake/> },
          { label:'Won',         value:won,              accent:S.primary,icon:<Handshake/> },
          { label:'Total',       value:deals.total,      accent:S.purple, icon:<Handshake/> },
        ].map(c=><Grid item xs={12} sm={6} md={3} key={c.label}><StatCard {...c} loading={busy} sub={undefined}/></Grid>)}
      </Grid>
      <Box display="flex" gap={1.5} mb={2}>
        <FormControl size="small" sx={{ minWidth:160 }}>
          <InputLabel sx={labelSx}>Deal Stage</InputLabel>
          <Select value={stage} label="Deal Stage" onChange={e=>setStage(e.target.value)} sx={selSx}>
            <MenuItem value="" sx={{ fontSize:13 }}>All Stages</MenuItem>
            {DEAL_STAGES.map(s=><MenuItem key={s} value={s} sx={{ fontSize:13 }}>{s.replace(/_/g,' ')}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>
      <Card><DataTable columns={cols as any} rows={deals.data} loading={busy} emptyMsg="No deals found"/></Card>

      <Dialog open={open} onClose={()=>setOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx:{ bgcolor:S.surface, border:`1px solid ${S.border}`, borderRadius:'14px' } }}>
        <DialogTitle sx={{ color:S.text, fontWeight:700, fontSize:15, pb:1 }}>New Deal</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={0.25}>
            <Grid item xs={6}><TextField fullWidth size="small" label="Lead ID *" value={form.leadId} onChange={e=>set('leadId',e.target.value)} sx={fieldSx} InputLabelProps={{ sx:labelSx }}/></Grid>
            <Grid item xs={6}><TextField fullWidth size="small" label="Unit ID (optional)" value={form.unitId} onChange={e=>set('unitId',e.target.value)} sx={fieldSx} InputLabelProps={{ sx:labelSx }}/></Grid>
            <Grid item xs={6}><TextField fullWidth size="small" label="Deal Value (₹) *" type="number" value={form.dealValue} onChange={e=>set('dealValue',e.target.value)} sx={fieldSx} InputLabelProps={{ sx:labelSx }}/></Grid>
            <Grid item xs={6}><TextField fullWidth size="small" label="Expected Close" type="date" value={form.expectedCloseDate} onChange={e=>set('expectedCloseDate',e.target.value)} sx={fieldSx} InputLabelProps={{ sx:{...labelSx,shrink:true} }}/></Grid>
            <Grid item xs={12}><TextField fullWidth size="small" label="Notes" multiline rows={2} value={form.notes} onChange={e=>set('notes',e.target.value)} sx={fieldSx} InputLabelProps={{ sx:labelSx }}/></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px:3, pb:2.5, gap:1 }}>
          <Button onClick={()=>setOpen(false)} sx={{ color:S.textSub, textTransform:'none', fontSize:13 }}>Cancel</Button>
          <Button variant="contained" disabled={!form.leadId||!form.dealValue} onClick={()=>{ dispatch(doCreateDeal({ ...form, dealValue:+form.dealValue })); setOpen(false); }}
            sx={{ bgcolor:S.primary, textTransform:'none', fontWeight:600, borderRadius:'8px', fontSize:13 }}>
            Create Deal
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
