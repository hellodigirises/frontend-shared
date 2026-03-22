// src/modules/agent/pages/SiteVisitsPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Grid, TextField, Select, MenuItem, FormControl,
  InputLabel, Typography, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, A, fieldSx, labelSx, selSx } from '../hooks';
import { fetchVisits, doCreateVisit, doUpdateVisit } from '../store/agentSlice';
import { PageHeader, VisitCard, StatCard } from '../components/ui';
import { Map } from '@mui/icons-material';

export default function SiteVisitsPage() {
  const dispatch = useAppDispatch();
  const { visits, loading } = useAppSelector(s=>s.agent);
  const [open,   setOpen]   = useState(false);
  const [status, setStatus] = useState('');
  const [form,   setForm]   = useState({ leadId:'', projectId:'', visitDate:'', notes:'' });
  const set=(k:string,v:string)=>setForm(p=>({...p,[k]:v}));
  const busy = !!loading.visits;

  useEffect(()=>{ dispatch(fetchVisits({ status:status||undefined })); },[dispatch,status]);

  const handleUpdate=(id:string,visitStatus:string)=>dispatch(doUpdateVisit({ id, visitStatus }));

  const scheduled  = visits.data.filter(v=>v.visitStatus==='SCHEDULED').length;
  const completed  = visits.data.filter(v=>v.visitStatus==='COMPLETED').length;

  return (
    <Box>
      <PageHeader title="Site Visits" subtitle={`${visits.total} total`}
        action={
          <Button variant="contained" startIcon={<Add/>} size="small" onClick={()=>setOpen(true)}
            sx={{ bgcolor:A.primary, textTransform:'none', fontWeight:600, borderRadius:'8px', fontSize:13 }}>
            Schedule Visit
          </Button>
        }
      />
      <Grid container spacing={1.5} mb={2.5}>
        {[
          { label:'Scheduled', value:scheduled, accent:A.amber,  icon:<Map/> },
          { label:'Completed', value:completed, accent:A.green,  icon:<Map/> },
          { label:'Total',     value:visits.total, accent:A.primary, icon:<Map/> },
        ].map(c=><Grid item xs={4} key={c.label}><StatCard {...c} loading={busy} compact sub={undefined}/></Grid>)}
      </Grid>
      <Box display="flex" gap={1} mb={2} flexWrap="wrap">
        {['','SCHEDULED','COMPLETED','CANCELLED'].map(s=>(
          <Button key={s} size="small" onClick={()=>setStatus(s)}
            sx={{ textTransform:'none', fontSize:12, borderRadius:'8px',
              bgcolor:status===s?`${A.primary}18`:'transparent',
              color:status===s?A.primary:A.textSub,
              border:`1px solid ${status===s?`${A.primary}40`:A.border}` }}>
            {s||'All'}
          </Button>
        ))}
      </Box>
      {visits.data.map(v=><VisitCard key={v.id} visit={v} onUpdate={handleUpdate}/>)}
      {visits.data.length===0 && !busy && (
        <Box py={6} textAlign="center"><Typography sx={{ color:A.textSub, fontSize:14 }}>No site visits</Typography></Box>
      )}
      <Dialog open={open} onClose={()=>setOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx:{ bgcolor:A.surface, border:`1px solid ${A.border}`, borderRadius:'14px' } }}>
        <DialogTitle sx={{ color:A.text, fontWeight:700, fontSize:15, pb:1 }}>Schedule Site Visit</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={0.25}>
            <Grid item xs={12}><TextField fullWidth size="small" label="Lead ID *" value={form.leadId} onChange={e=>set('leadId',e.target.value)} sx={fieldSx} InputLabelProps={{ sx:labelSx }}/></Grid>
            <Grid item xs={12}><TextField fullWidth size="small" label="Project ID *" value={form.projectId} onChange={e=>set('projectId',e.target.value)} sx={fieldSx} InputLabelProps={{ sx:labelSx }}/></Grid>
            <Grid item xs={12}><TextField fullWidth size="small" label="Visit Date & Time *" type="datetime-local" value={form.visitDate} onChange={e=>set('visitDate',e.target.value)} sx={fieldSx} InputLabelProps={{ sx:{...labelSx,shrink:true} }}/></Grid>
            <Grid item xs={12}><TextField fullWidth size="small" label="Notes" multiline rows={2} value={form.notes} onChange={e=>set('notes',e.target.value)} sx={fieldSx} InputLabelProps={{ sx:labelSx }}/></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px:3, pb:2.5, gap:1 }}>
          <Button onClick={()=>setOpen(false)} sx={{ color:A.textSub, textTransform:'none', fontSize:13 }}>Cancel</Button>
          <Button variant="contained" disabled={!form.leadId||!form.projectId||!form.visitDate}
            onClick={()=>{ dispatch(doCreateVisit(form)); setOpen(false); }}
            sx={{ bgcolor:A.primary, textTransform:'none', fontWeight:600, borderRadius:'8px', fontSize:13 }}>
            Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
