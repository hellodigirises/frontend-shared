// src/modules/sales-manager/pages/SiteVisitsPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Grid, TextField, Select, MenuItem, FormControl,
  InputLabel, Typography, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Tooltip,
} from '@mui/material';
import { Add, CheckCircle, Cancel, Schedule } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, S, DATE, fieldSx, labelSx, selSx } from '../hooks';
import { fetchSiteVisits, doCreateVisit, doUpdateVisit, type SiteVisit } from '../store/salesSlice';
import { PageHeader, Card, DataTable, StatCard } from '../components/ui';

const STATUS_COLOR: Record<string,string> = {
  SCHEDULED:S.gold, COMPLETED:S.primary, CANCELLED:S.coral,
  NO_SHOW:S.coral, RESCHEDULED:S.blue,
};

export default function SiteVisitsPage() {
  const dispatch = useAppDispatch();
  const { siteVisits, loading } = useAppSelector(s=>s.sales);
  const [filter, setFilter] = useState('');
  const [open, setOpen]     = useState(false);
  const [form, setForm]     = useState({ leadId:'', agentId:'', projectId:'', visitDate:'', notes:'' });
  const busy = !!loading.siteVisits;

  useEffect(()=>{ dispatch(fetchSiteVisits({ status:filter||undefined })); },[dispatch,filter]);

  const scheduled  = siteVisits.data.filter(v=>v.visitStatus==='SCHEDULED').length;
  const completed  = siteVisits.data.filter(v=>v.visitStatus==='COMPLETED').length;
  const cancelled  = siteVisits.data.filter(v=>v.visitStatus==='CANCELLED').length;

  const set = (k:string,v:string)=>setForm(p=>({...p,[k]:v}));

  const cols = [
    { label:'Customer',   render:(r:SiteVisit)=><Typography sx={{ color:S.text, fontSize:13 }}>{r.lead?.customerName??'—'}</Typography> },
    { label:'Phone',      render:(r:SiteVisit)=><Typography sx={{ color:S.textSub, fontSize:12 }}>{r.lead?.customerPhone??'—'}</Typography> },
    { label:'Project',    render:(r:SiteVisit)=><Typography sx={{ color:S.text, fontSize:12 }}>{r.project?.name??'—'}</Typography> },
    { label:'Agent',      render:(r:SiteVisit)=><Typography sx={{ color:S.textSub, fontSize:12 }}>{r.agent?.name??'—'}</Typography> },
    { label:'Visit Date', render:(r:SiteVisit)=><Typography sx={{ color:S.text, fontSize:12 }}>{DATE(r.visitDate)}</Typography> },
    { label:'Status',     render:(r:SiteVisit)=>{
      const c=STATUS_COLOR[r.visitStatus]??S.textSub;
      return <Chip label={r.visitStatus} size="small" sx={{ fontSize:10, height:20, bgcolor:`${c}15`, color:c, fontWeight:600 }}/>;
    }},
    { label:'',           render:(r:SiteVisit)=>r.visitStatus==='SCHEDULED'?(
      <Box display="flex" gap={0.25}>
        <Tooltip title="Mark Completed">
          <IconButton size="small" sx={{ color:S.primary }}
            onClick={()=>dispatch(doUpdateVisit({ id:r.id, visitStatus:'COMPLETED' }))}>
            <CheckCircle sx={{fontSize:14}}/>
          </IconButton>
        </Tooltip>
        <Tooltip title="Cancel">
          <IconButton size="small" sx={{ color:S.coral }}
            onClick={()=>dispatch(doUpdateVisit({ id:r.id, visitStatus:'CANCELLED' }))}>
            <Cancel sx={{fontSize:14}}/>
          </IconButton>
        </Tooltip>
      </Box>
    ):null},
  ];

  return (
    <Box>
      <PageHeader title="Site Visits" subtitle={`${siteVisits.total} total records`}
        action={
          <Button variant="contained" startIcon={<Add/>} size="small" onClick={()=>setOpen(true)}
            sx={{ bgcolor:S.primary, textTransform:'none', fontWeight:600, borderRadius:'8px', fontSize:13 }}>
            Schedule Visit
          </Button>
        }
      />
      <Grid container spacing={2} mb={3}>
        {[
          { label:'Scheduled', value:scheduled, accent:S.gold,   icon:<Schedule/> },
          { label:'Completed', value:completed, accent:S.primary,icon:<CheckCircle/> },
          { label:'Cancelled', value:cancelled, accent:S.coral,  icon:<Cancel/> },
          { label:'Total',     value:siteVisits.total, accent:S.blue, icon:<Schedule/> },
        ].map(c=><Grid item xs={12} sm={6} md={3} key={c.label}><StatCard {...c} loading={busy} sub={undefined}/></Grid>)}
      </Grid>
      <Box display="flex" gap={1.5} mb={2}>
        <FormControl size="small" sx={{ minWidth:140 }}>
          <InputLabel sx={labelSx}>Status</InputLabel>
          <Select value={filter} label="Status" onChange={e=>setFilter(e.target.value)} sx={selSx}>
            <MenuItem value="" sx={{ fontSize:13 }}>All</MenuItem>
            {['SCHEDULED','COMPLETED','CANCELLED','NO_SHOW'].map(s=>(
              <MenuItem key={s} value={s} sx={{ fontSize:13 }}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Card><DataTable columns={cols as any} rows={siteVisits.data} loading={busy} emptyMsg="No site visits"/></Card>

      <Dialog open={open} onClose={()=>setOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx:{ bgcolor:S.surface, border:`1px solid ${S.border}`, borderRadius:'14px' } }}>
        <DialogTitle sx={{ color:S.text, fontWeight:700, fontSize:15, pb:1 }}>Schedule Site Visit</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={0.25}>
            {[['leadId','Lead ID *'],['agentId','Agent ID *'],['projectId','Project ID *']].map(([k,l])=>(
              <Grid item xs={12} key={k}>
                <TextField fullWidth size="small" label={l} value={(form as any)[k]} onChange={e=>set(k,e.target.value)}
                  sx={fieldSx} InputLabelProps={{ sx:labelSx }}/>
              </Grid>
            ))}
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Visit Date & Time *" type="datetime-local"
                value={form.visitDate} onChange={e=>set('visitDate',e.target.value)}
                sx={fieldSx} InputLabelProps={{ sx:{...labelSx,shrink:true} }}/>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Notes" multiline rows={2}
                value={form.notes} onChange={e=>set('notes',e.target.value)}
                sx={fieldSx} InputLabelProps={{ sx:labelSx }}/>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px:3, pb:2.5, gap:1 }}>
          <Button onClick={()=>setOpen(false)} sx={{ color:S.textSub, textTransform:'none', fontSize:13 }}>Cancel</Button>
          <Button variant="contained" disabled={!form.leadId||!form.agentId||!form.projectId||!form.visitDate}
            onClick={()=>{ dispatch(doCreateVisit(form)); setOpen(false); }}
            sx={{ bgcolor:S.primary, textTransform:'none', fontWeight:600, borderRadius:'8px', fontSize:13 }}>
            Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
