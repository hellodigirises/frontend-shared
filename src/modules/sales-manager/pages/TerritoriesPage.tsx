// src/modules/sales-manager/pages/TerritoriesPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Grid, TextField, Typography, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip,
} from '@mui/material';
import { Add, PersonAdd, Map } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, S, fieldSx, labelSx } from '../hooks';
import { fetchTerritories, doCreateTerritory, type Territory } from '../store/salesSlice';
import { PageHeader, AgentAvatar } from '../components/ui';
import { salesApi } from '../api/sales.api';

const ZONE_COLOR: Record<string,string> = {
  North:S.blue, South:S.primary, East:S.gold, West:S.purple, Central:S.cyan,
};

function AssignAgentDialog({ open, territoryId, onClose }: { open:boolean; territoryId:string; onClose:()=>void }) {
  const [agentId, setAgentId] = useState('');

  const assign = async () => {
    await salesApi.post(`/territories/${territoryId}/assign`, { agentId });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx:{ bgcolor:S.surface, border:`1px solid ${S.border}`, borderRadius:'14px' } }}>
      <DialogTitle sx={{ color:S.text, fontWeight:700, fontSize:15 }}>Assign Agent to Territory</DialogTitle>
      <DialogContent>
        <Box mt={1.5}>
          <TextField fullWidth size="small" label="Agent ID *" value={agentId}
            onChange={e=>setAgentId(e.target.value)}
            sx={fieldSx} InputLabelProps={{ sx:labelSx }}/>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px:3, pb:2.5, gap:1 }}>
        <Button onClick={onClose} sx={{ color:S.textSub, textTransform:'none', fontSize:13 }}>Cancel</Button>
        <Button variant="contained" disabled={!agentId} onClick={assign}
          sx={{ bgcolor:S.primary, textTransform:'none', fontWeight:600, borderRadius:'8px', fontSize:13 }}>
          Assign
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function TerritoryCard({ territory, onReload }: { territory: Territory; onReload:()=>void }) {
  const [assignOpen, setAssignOpen] = useState(false);
  const zoneColor = ZONE_COLOR[territory.zone??''] ?? S.primary;

  return (
    <Box sx={{
      bgcolor:S.surface, borderRadius:'14px', p:2.5,
      border:`1px solid ${S.border}`,
      borderTop:`3px solid ${zoneColor}`,
    }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
        <Box>
          <Typography sx={{ color:S.text, fontWeight:700, fontSize:14 }}>{territory.name}</Typography>
          <Box display="flex" gap={0.75} mt={0.5} flexWrap="wrap">
            {territory.city && (
              <Chip label={territory.city} size="small"
                sx={{ fontSize:10, height:19, bgcolor:`${zoneColor}12`, color:zoneColor }}/>
            )}
            {territory.zone && (
              <Chip label={`${territory.zone} Zone`} size="small"
                sx={{ fontSize:10, height:19, bgcolor:'rgba(255,255,255,0.06)', color:S.textSub }}/>
            )}
          </Box>
        </Box>
        <Tooltip title="Assign Agent">
          <IconButton size="small" onClick={()=>setAssignOpen(true)}
            sx={{ color:S.primary, bgcolor:`${S.primary}10`, borderRadius:'8px', p:0.6 }}>
            <PersonAdd sx={{ fontSize:15 }}/>
          </IconButton>
        </Tooltip>
      </Box>

      {territory.pincodes.length > 0 && (
        <Box mb={1.5}>
          <Typography sx={{ color:S.textSub, fontSize:11, mb:0.75, textTransform:'uppercase', letterSpacing:0.4 }}>Pincodes</Typography>
          <Box display="flex" flexWrap="wrap" gap={0.5}>
            {territory.pincodes.slice(0,6).map(p=>(
              <Chip key={p} label={p} size="small"
                sx={{ fontSize:9.5, height:18, bgcolor:'rgba(255,255,255,0.05)', color:S.muted }}/>
            ))}
            {territory.pincodes.length > 6 && (
              <Chip label={`+${territory.pincodes.length-6} more`} size="small"
                sx={{ fontSize:9.5, height:18, bgcolor:'rgba(255,255,255,0.05)', color:S.muted }}/>
            )}
          </Box>
        </Box>
      )}

      <Box>
        <Typography sx={{ color:S.textSub, fontSize:11, mb:0.75, textTransform:'uppercase', letterSpacing:0.4 }}>
          Assigned Agents ({territory.assignments.length})
        </Typography>
        {territory.assignments.length === 0 ? (
          <Typography sx={{ color:S.muted, fontSize:12 }}>No agents assigned</Typography>
        ) : (
          <Box display="flex" flexWrap="wrap" gap={0.75}>
            {territory.assignments.map(a=>(
              <Box key={a.agent.id} display="flex" alignItems="center" gap={0.75}
                sx={{ bgcolor:`${S.primary}0A`, borderRadius:'8px', px:1, py:0.4, border:`1px solid ${S.primary}25` }}>
                <AgentAvatar name={a.agent.name} avatarUrl={a.agent.avatarUrl} size={18}/>
                <Typography sx={{ color:S.text, fontSize:11.5 }}>{a.agent.name.split(' ')[0]}</Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <AssignAgentDialog open={assignOpen} territoryId={territory.id}
        onClose={()=>{ setAssignOpen(false); onReload(); }}/>
    </Box>
  );
}

export default function TerritoriesPage() {
  const dispatch = useAppDispatch();
  const { territories, loading } = useAppSelector(s=>s.sales);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name:'', city:'', zone:'', description:'', pincodes:'' });
  const set = (k:string,v:string)=>setForm(p=>({...p,[k]:v}));

  const load = ()=>dispatch(fetchTerritories());
  useEffect(()=>{ load(); },[dispatch]);

  return (
    <Box>
      <PageHeader
        title="Sales Territories"
        subtitle={`${territories.length} territories defined`}
        action={
          <Button variant="contained" startIcon={<Add/>} size="small" onClick={()=>setOpen(true)}
            sx={{ bgcolor:S.primary, textTransform:'none', fontWeight:600, borderRadius:'8px', fontSize:13 }}>
            New Territory
          </Button>
        }
      />

      {territories.length === 0 && !loading.territories ? (
        <Box py={8} textAlign="center">
          <Map sx={{ fontSize:48, color:S.border, mb:2 }}/>
          <Typography sx={{ color:S.textSub, fontSize:14 }}>No territories defined</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {territories.map(t=>(
            <Grid item xs={12} md={6} lg={4} key={t.id}>
              <TerritoryCard territory={t} onReload={load}/>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={open} onClose={()=>setOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx:{ bgcolor:S.surface, border:`1px solid ${S.border}`, borderRadius:'14px' } }}>
        <DialogTitle sx={{ color:S.text, fontWeight:700, fontSize:15, pb:1 }}>Create Territory</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={0.25}>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Territory Name *" value={form.name} onChange={e=>set('name',e.target.value)}
                sx={fieldSx} InputLabelProps={{ sx:labelSx }}/>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="City" value={form.city} onChange={e=>set('city',e.target.value)}
                sx={fieldSx} InputLabelProps={{ sx:labelSx }}/>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="Zone (North/South/East/West)" value={form.zone} onChange={e=>set('zone',e.target.value)}
                sx={fieldSx} InputLabelProps={{ sx:labelSx }}/>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Description" value={form.description} onChange={e=>set('description',e.target.value)}
                sx={fieldSx} InputLabelProps={{ sx:labelSx }}/>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Pincodes (comma separated)" value={form.pincodes}
                onChange={e=>set('pincodes',e.target.value)}
                sx={fieldSx} InputLabelProps={{ sx:labelSx }}
                helperText="e.g. 400001, 400002, 400003"
                FormHelperTextProps={{ sx:{ color:S.textSub, fontSize:11 } }}/>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px:3, pb:2.5, gap:1 }}>
          <Button onClick={()=>setOpen(false)} sx={{ color:S.textSub, textTransform:'none', fontSize:13 }}>Cancel</Button>
          <Button variant="contained" disabled={!form.name} onClick={()=>{
            dispatch(doCreateTerritory({
              name:form.name, city:form.city||undefined, zone:form.zone||undefined,
              description:form.description||undefined,
              pincodes: form.pincodes ? form.pincodes.split(',').map(p=>p.trim()).filter(Boolean) : [],
            }));
            setOpen(false);
            setForm({ name:'', city:'', zone:'', description:'', pincodes:'' });
          }}
            sx={{ bgcolor:S.primary, textTransform:'none', fontWeight:600, borderRadius:'8px', fontSize:13 }}>
            Create Territory
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
