// src/modules/agent/pages/FollowUpsPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Grid, TextField, Select, MenuItem, FormControl,
  InputLabel, Typography, Chip, Switch,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip,
} from '@mui/material';
import { Add, CheckCircle } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, A, DATE, TIME, fieldSx, labelSx, selSx } from '../hooks';
import { fetchFollowUps, doCreateFollowUp, doCompleteFollowUp, type FollowUp } from '../store/agentSlice';
import { PageHeader, Card, StatCard } from '../components/ui';

const TYPES    = ['CALL','WHATSAPP','MEETING','SITE_VISIT','EMAIL','VIDEO_CALL'];
const OUTCOMES = ['INTERESTED','NOT_INTERESTED','CALLBACK','SITE_VISIT_SCHEDULED','BOOKING_INITIATED','NO_RESPONSE'];

const TYPE_COLOR:Record<string,string> = {
  CALL:A.green, WHATSAPP:A.primary, MEETING:A.indigo,
  SITE_VISIT:A.amber, EMAIL:A.blue, VIDEO_CALL:A.indigo,
};
const TYPE_ICON:Record<string,string> = { CALL:'📞', WHATSAPP:'💬', MEETING:'🤝', SITE_VISIT:'📍', EMAIL:'📧', VIDEO_CALL:'📹' };

function NewFollowUpDialog({ open, onClose }: { open:boolean; onClose:()=>void }) {
  const dispatch = useAppDispatch();
  const [f, setF] = useState({ leadId:'', activityType:'CALL', notes:'', nextFollowUpDate:'', outcome:'' });
  const set=(k:string,v:string)=>setF(p=>({...p,[k]:v}));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx:{ bgcolor:A.surface, border:`1px solid ${A.border}`, borderRadius:'14px' } }}>
      <DialogTitle sx={{ color:A.text, fontWeight:700, fontSize:15, pb:1 }}>Log Follow-up</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} mt={0.25}>
          <Grid item xs={12}>
            <TextField fullWidth size="small" label="Lead ID *" value={f.leadId} onChange={e=>set('leadId',e.target.value)}
              sx={fieldSx} InputLabelProps={{ sx:labelSx }}/>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel sx={labelSx}>Activity Type</InputLabel>
              <Select value={f.activityType} label="Activity Type" onChange={e=>set('activityType',e.target.value)} sx={selSx}>
                {TYPES.map(t=><MenuItem key={t} value={t} sx={{ fontSize:13 }}>{TYPE_ICON[t]} {t.replace(/_/g,' ')}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="Next Follow-up" type="datetime-local" value={f.nextFollowUpDate}
              onChange={e=>set('nextFollowUpDate',e.target.value)} sx={fieldSx} InputLabelProps={{ sx:{...labelSx,shrink:true} }}/>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth size="small" label="Notes" multiline rows={3} value={f.notes}
              onChange={e=>set('notes',e.target.value)} sx={fieldSx} InputLabelProps={{ sx:labelSx }}/>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel sx={labelSx}>Outcome</InputLabel>
              <Select value={f.outcome} label="Outcome" onChange={e=>set('outcome',e.target.value)} sx={selSx}>
                <MenuItem value="" sx={{ fontSize:13 }}>Select outcome</MenuItem>
                {OUTCOMES.map(o=><MenuItem key={o} value={o} sx={{ fontSize:13 }}>{o.replace(/_/g,' ')}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px:3, pb:2.5, gap:1 }}>
        <Button onClick={onClose} sx={{ color:A.textSub, textTransform:'none', fontSize:13 }}>Cancel</Button>
        <Button variant="contained" disabled={!f.leadId} onClick={()=>{ dispatch(doCreateFollowUp(f)); onClose(); }}
          sx={{ bgcolor:A.primary, textTransform:'none', fontWeight:600, borderRadius:'8px', fontSize:13 }}>
          Log Activity
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function FollowUpsPage() {
  const dispatch = useAppDispatch();
  const { followUps, loading } = useAppSelector(s=>s.agent);
  const [open,       setOpen]      = useState(false);
  const [todayOnly,  setTodayOnly] = useState(false);
  const [showDone,   setShowDone]  = useState(true);
  const busy = !!loading.followUps;

  useEffect(()=>{
    dispatch(fetchFollowUps({ dueToday:todayOnly||undefined, completed:showDone }));
  },[dispatch,todayOnly,showDone]);

  const pending   = followUps.data.filter(f=>!f.isCompleted).length;
  const completed = followUps.data.filter(f=> f.isCompleted).length;

  return (
    <Box>
      <PageHeader title="Follow-ups" subtitle={`${followUps.total} total`}
        action={
          <Button variant="contained" startIcon={<Add/>} size="small" onClick={()=>setOpen(true)}
            sx={{ bgcolor:A.primary, textTransform:'none', fontWeight:600, borderRadius:'8px', fontSize:13 }}>
            Log Activity
          </Button>
        }
      />

      <Grid container spacing={1.5} mb={2.5}>
        {[
          { label:'Pending',  value:pending,   accent:A.amber, icon:<CheckCircle/> },
          { label:'Completed',value:completed, accent:A.green, icon:<CheckCircle/> },
        ].map(c=><Grid item xs={6} key={c.label}><StatCard {...c} loading={busy} compact sub={undefined}/></Grid>)}
      </Grid>

      <Box display="flex" gap={1.5} mb={2} flexWrap="wrap" alignItems="center">
        <Box display="flex" alignItems="center" gap={1}>
          <Switch checked={todayOnly} onChange={e=>setTodayOnly(e.target.checked)}
            sx={{ '& .Mui-checked + .MuiSwitch-track':{bgcolor:`${A.primary} !important`} }}/>
          <Typography sx={{ color:A.textSub, fontSize:13 }}>Due today only</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Switch checked={showDone} onChange={e=>setShowDone(e.target.checked)}
            sx={{ '& .Mui-checked + .MuiSwitch-track':{bgcolor:`${A.green} !important`} }}/>
          <Typography sx={{ color:A.textSub, fontSize:13 }}>Show completed</Typography>
        </Box>
      </Box>

      {busy ? Array.from({length:4}).map((_,i)=>(
        <Box key={i} sx={{ bgcolor:A.surfaceHigh, borderRadius:'12px', height:80, mb:1.25, opacity:0.5 }}/>
      )) : followUps.data.map((fu:FollowUp)=>{
        const color = TYPE_COLOR[fu.activityType]??A.primary;
        return (
          <Box key={fu.id} sx={{
            bgcolor:A.surfaceHigh, borderRadius:'12px', p:1.75, mb:1.25,
            border:`1px solid ${fu.isCompleted?A.border:`${color}30`}`,
            opacity:fu.isCompleted?0.6:1,
          }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={0.75}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography sx={{ fontSize:16 }}>{TYPE_ICON[fu.activityType]}</Typography>
                <Box ml={0.75}>
                  <Typography sx={{ color:A.text, fontSize:13, fontWeight:500 }}>{fu.lead?.customerName??'—'}</Typography>
                  <Typography sx={{ color:A.textSub, fontSize:11.5 }}>{fu.lead?.customerPhone}</Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center" gap={0.75}>
                <Chip label={fu.activityType.replace(/_/g,' ')} size="small"
                  sx={{ fontSize:10, height:20, bgcolor:`${color}15`, color }}/>
                {!fu.isCompleted && (
                  <Tooltip title="Mark Complete">
                    <IconButton size="small" onClick={()=>dispatch(doCompleteFollowUp({ id:fu.id, outcome:'INTERESTED' }))}
                      sx={{ color:A.green, p:0.3 }}>
                      <CheckCircle sx={{ fontSize:16 }}/>
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
            {fu.notes && <Typography sx={{ color:A.textSub, fontSize:12, mb:0.5, lineHeight:1.5 }}>{fu.notes}</Typography>}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              {fu.nextFollowUpDate && (
                <Typography sx={{ color:A.amber, fontSize:11.5 }}>
                  📅 Next: {new Date(fu.nextFollowUpDate).toLocaleDateString('en-IN',{ day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                </Typography>
              )}
              {fu.outcome && (
                <Chip label={fu.outcome.replace(/_/g,' ')} size="small"
                  sx={{ fontSize:9.5, height:18, bgcolor:`${A.green}12`, color:A.green }}/>
              )}
            </Box>
          </Box>
        );
      })}

      {followUps.data.length===0 && !busy && (
        <Box py={6} textAlign="center">
          <Typography sx={{ color:A.textSub, fontSize:14 }}>No follow-ups found</Typography>
        </Box>
      )}

      <NewFollowUpDialog open={open} onClose={()=>setOpen(false)}/>
    </Box>
  );
}
