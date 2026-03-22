// src/modules/sales-manager/pages/LeadAssignmentsPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Grid, TextField, Select, MenuItem, FormControl,
  InputLabel, Typography, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions,
} from '@mui/material';
import { PersonAdd, AutoMode } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, S, DATE, fieldSx, labelSx, selSx } from '../hooks';
import { fetchPipeline, doAssignLead, doRoundRobin } from '../store/salesSlice';
import { PageHeader, Card, DataTable, StageChip } from '../components/ui';
import { salesApi } from '../api/sales.api';

function AssignDialog({ open, onClose }: { open:boolean; onClose:()=>void }) {
  const dispatch = useAppDispatch();
  const [leadId, setLeadId] = useState('');
  const [agentId, setAgentId] = useState('');
  const [method, setMethod] = useState('MANUAL');
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    if (open) salesApi.get('/team').then(r => {
      const all = (r.data.data??[]).flatMap((t:any)=>t.assignments?.map((a:any)=>a.agent)??[]);
      setAgents(all);
    });
  }, [open]);

  const assign = () => {
    if (method === 'ROUND_ROBIN') dispatch(doRoundRobin(leadId));
    else dispatch(doAssignLead({ leadId, agentId, method }));
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx:{ bgcolor:S.surface, border:`1px solid ${S.border}`, borderRadius:'14px' } }}>
      <DialogTitle sx={{ color:S.text, fontWeight:700, fontSize:15, pb:1 }}>Assign Lead</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} mt={0.25}>
          <Grid item xs={12}>
            <TextField fullWidth size="small" label="Lead ID *" value={leadId} onChange={e=>setLeadId(e.target.value)}
              sx={fieldSx} InputLabelProps={{ sx:labelSx }}/>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel sx={labelSx}>Assignment Method</InputLabel>
              <Select value={method} label="Assignment Method" onChange={e=>setMethod(e.target.value)} sx={selSx}>
                {['MANUAL','ROUND_ROBIN','PERFORMANCE_BASED','TERRITORY_BASED'].map(m=>(
                  <MenuItem key={m} value={m} sx={{ fontSize:13 }}>{m.replace(/_/g,' ')}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {method === 'MANUAL' && (
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel sx={labelSx}>Select Agent</InputLabel>
                <Select value={agentId} label="Select Agent" onChange={e=>setAgentId(e.target.value)} sx={selSx}>
                  {agents.map((a:any)=><MenuItem key={a.id} value={a.id} sx={{ fontSize:13 }}>{a.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px:3, pb:2.5, gap:1 }}>
        <Button onClick={onClose} sx={{ color:S.textSub, textTransform:'none', fontSize:13 }}>Cancel</Button>
        <Button variant="contained" disabled={!leadId||(method==='MANUAL'&&!agentId)} onClick={assign}
          sx={{ bgcolor:S.primary, textTransform:'none', fontWeight:600, borderRadius:'8px', fontSize:13 }}>
          Assign
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function LeadAssignmentsPage() {
  const dispatch = useAppDispatch();
  const { pipeline, loading } = useAppSelector(s=>s.sales);
  const [open, setOpen] = useState(false);

  useEffect(()=>{ dispatch(fetchPipeline({})); },[dispatch]);

  const unassigned = pipeline.filter(p=>!p.lead?.assignedTo);
  const assigned   = pipeline.filter(p=> p.lead?.assignedTo);

  const cols = [
    { label:'Customer', render:(r:any)=><Typography sx={{ color:S.text, fontSize:13 }}>{r.lead?.customerName??'—'}</Typography> },
    { label:'Stage',    render:(r:any)=><StageChip stage={r.stage}/> },
    { label:'Value',    render:(r:any)=><Typography sx={{ color:S.gold, fontSize:12, fontWeight:600 }}>{r.dealValue?`₹${(r.dealValue/100000).toFixed(1)}L`:'—'}</Typography> },
    { label:'Agent',    render:(r:any)=>r.lead?.assignedTo
      ? <Chip label={r.lead.assignedTo.name} size="small" sx={{ fontSize:10, height:20, bgcolor:`${S.primary}15`, color:S.primary }}/>
      : <Chip label="Unassigned" size="small" sx={{ fontSize:10, height:20, bgcolor:`${S.coral}15`, color:S.coral }}/>
    },
    { label:'Source',   render:(r:any)=><Typography sx={{ color:S.textSub, fontSize:11 }}>{r.lead?.sourceChannel??'—'}</Typography> },
    { label:'Added',    render:(r:any)=><Typography sx={{ color:S.textSub, fontSize:12 }}>{DATE(r.lead?.createdAt)}</Typography> },
  ];

  return (
    <Box>
      <PageHeader
        title="Lead Distribution"
        subtitle={`${unassigned.length} unassigned · ${assigned.length} assigned`}
        action={
          <Box display="flex" gap={1}>
            <Button variant="outlined" startIcon={<AutoMode/>} size="small"
              onClick={()=>dispatch(doRoundRobin(unassigned[0]?.leadId??''))}
              disabled={!unassigned.length}
              sx={{ color:S.cyan, borderColor:`${S.cyan}50`, textTransform:'none', fontSize:13, borderRadius:'8px' }}>
              Auto-Assign All
            </Button>
            <Button variant="contained" startIcon={<PersonAdd/>} size="small" onClick={()=>setOpen(true)}
              sx={{ bgcolor:S.primary, textTransform:'none', fontWeight:600, borderRadius:'8px', fontSize:13 }}>
              Assign Lead
            </Button>
          </Box>
        }
      />
      {unassigned.length > 0 && (
        <Box sx={{ bgcolor:`${S.coral}08`, border:`1px solid ${S.coral}25`, borderRadius:'10px', px:2, py:1.25, mb:2 }}>
          <Typography sx={{ color:S.coral, fontSize:13 }}>
            ⚠️  {unassigned.length} lead{unassigned.length>1?'s':''} are unassigned
          </Typography>
        </Box>
      )}
      <Card title="All Leads">
        <DataTable columns={cols as any} rows={pipeline} loading={!!loading.pipeline} emptyMsg="No leads in pipeline"/>
      </Card>
      <AssignDialog open={open} onClose={()=>setOpen(false)}/>
    </Box>
  );
}
