// src/modules/sales-manager/pages/TeamManagementPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Grid, TextField, Typography, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip, Avatar, AvatarGroup,
} from '@mui/material';
import { Add, Groups, PersonAdd } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, S, fieldSx, labelSx } from '../hooks';
import { fetchTeams, doCreateTeam, type Team } from '../store/salesSlice';
import { PageHeader, Card, AgentAvatar } from '../components/ui';
import { salesApi } from '../api/sales.api';

function AddAgentDialog({ open, teamId, onClose }: { open:boolean; teamId:string; onClose:()=>void }) {
  const [agentId, setAgentId] = useState('');
  const [agents,  setAgents]  = useState<any[]>([]);

  useEffect(()=>{
    if (open) {
      salesApi.get('/agents/performance', { params:{ from:'2024-01-01', to:new Date().toISOString() } })
        .then(r=>setAgents(r.data.data??[]));
    }
  },[open]);

  const add = () => {
    salesApi.post(`/team/${teamId}/agents`, { agentId });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx:{ bgcolor:S.surface, border:`1px solid ${S.border}`, borderRadius:'14px' } }}>
      <DialogTitle sx={{ color:S.text, fontWeight:700, fontSize:15 }}>Add Agent to Team</DialogTitle>
      <DialogContent>
        <Box mt={1.5}>
          {agents.length > 0 ? agents.map((a:any)=>(
            <Box key={a.agentId} display="flex" alignItems="center" gap={1.5}
              px={1.5} py={1} sx={{ borderRadius:'8px', cursor:'pointer',
                bgcolor:agentId===a.agentId?`${S.primary}15`:'transparent',
                '&:hover':{ bgcolor:`${S.primary}0A` },
                border:`1px solid ${agentId===a.agentId?`${S.primary}40`:S.border}` }}
              mb={0.75}
              onClick={()=>setAgentId(a.agentId)}>
              <AgentAvatar name={a.name} avatarUrl={a.avatarUrl} size={28}/>
              <Box ml={1.25}>
                <Typography sx={{ color:S.text, fontSize:13 }}>{a.name}</Typography>
                <Typography sx={{ color:S.textSub, fontSize:11 }}>
                  {a.bookings} bookings · {a.revenue > 0 ? `₹${(a.revenue/100000).toFixed(1)}L` : '—'}
                </Typography>
              </Box>
            </Box>
          )) : (
            <TextField fullWidth size="small" label="Agent ID" value={agentId}
              onChange={e=>setAgentId(e.target.value)}
              sx={fieldSx} InputLabelProps={{ sx:labelSx }}/>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px:3, pb:2.5, gap:1 }}>
        <Button onClick={onClose} sx={{ color:S.textSub, textTransform:'none', fontSize:13 }}>Cancel</Button>
        <Button variant="contained" disabled={!agentId} onClick={add}
          sx={{ bgcolor:S.primary, textTransform:'none', fontWeight:600, borderRadius:'8px', fontSize:13 }}>
          Add to Team
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function TeamCard({ team }: { team: Team }) {
  const [addOpen,  setAddOpen]  = useState(false);

  return (
    <Box sx={{ bgcolor:S.surface, borderRadius:'14px', p:2.5, border:`1px solid ${S.border}` }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box>
          <Typography sx={{ color:S.text, fontWeight:700, fontSize:15 }}>{team.name}</Typography>
          <Typography sx={{ color:S.textSub, fontSize:12, mt:0.25 }}>
            Manager: {team.manager?.name ?? '—'}
          </Typography>
        </Box>
        <Tooltip title="Add Agent">
          <IconButton size="small" onClick={()=>setAddOpen(true)}
            sx={{ color:S.primary, bgcolor:`${S.primary}10`, borderRadius:'8px', p:0.6 }}>
            <PersonAdd sx={{ fontSize:16 }}/>
          </IconButton>
        </Tooltip>
      </Box>

      {/* Agent count */}
      <Box display="flex" alignItems="center" gap={1} mb={1.5}>
        <AvatarGroup max={6} sx={{ '& .MuiAvatar-root':{ width:28, height:28, fontSize:11, border:`2px solid ${S.surface}` } }}>
          {(team.assignments??[]).map(a=>(
            <Tooltip key={a.agent.id} title={a.agent.name}>
              <Avatar sx={{ bgcolor:`hsl(${a.agent.name.charCodeAt(0)*17%360},55%,35%)`, fontSize:11, fontWeight:700 }}>
                {a.agent.name.charAt(0)}
              </Avatar>
            </Tooltip>
          ))}
        </AvatarGroup>
        <Typography sx={{ color:S.textSub, fontSize:12 }}>
          {team.assignments?.length ?? 0} agent{(team.assignments?.length??0)!==1?'s':''}
        </Typography>
      </Box>

      {/* Agent list */}
      <Box sx={{ maxHeight:160, overflowY:'auto' }}>
        {(team.assignments??[]).map(a=>(
          <Box key={a.agent.id} display="flex" alignItems="center" gap={1.25}
            py={0.85} sx={{ borderBottom:`1px solid ${S.border}` }}>
            <AgentAvatar name={a.agent.name} avatarUrl={a.agent.avatarUrl} size={24}/>
            <Box ml={1}>
              <Typography sx={{ color:S.text, fontSize:12.5 }}>{a.agent.name}</Typography>
              <Chip label={a.agent.role} size="small"
                sx={{ fontSize:9.5, height:16, bgcolor:`${S.primary}10`, color:S.primary }}/>
            </Box>
          </Box>
        ))}
      </Box>

      <AddAgentDialog open={addOpen} teamId={team.id} onClose={()=>setAddOpen(false)}/>
    </Box>
  );
}

export default function TeamManagementPage() {
  const dispatch = useAppDispatch();
  const { teams, loading } = useAppSelector(s=>s.sales);
  const [open,  setOpen]  = useState(false);
  const [name,  setName]  = useState('');

  useEffect(()=>{ dispatch(fetchTeams()); },[dispatch]);

  const totalAgents = teams.reduce((s,t)=>s+(t.assignments?.length??0),0);

  return (
    <Box>
      <PageHeader
        title="Sales Team"
        subtitle={`${teams.length} team${teams.length!==1?'s':''} · ${totalAgents} agents`}
        action={
          <Button variant="contained" startIcon={<Add/>} size="small" onClick={()=>setOpen(true)}
            sx={{ bgcolor:S.primary, textTransform:'none', fontWeight:600, borderRadius:'8px', fontSize:13 }}>
            Create Team
          </Button>
        }
      />

      {teams.length === 0 && !loading.teams ? (
        <Box py={8} textAlign="center">
          <Groups sx={{ fontSize:48, color:S.border, mb:2 }}/>
          <Typography sx={{ color:S.textSub, fontSize:14 }}>No teams created yet</Typography>
          <Button variant="outlined" startIcon={<Add/>} onClick={()=>setOpen(true)} sx={{ mt:2, color:S.primary, borderColor:`${S.primary}50`, textTransform:'none' }}>
            Create Your First Team
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {teams.map(team=>(
            <Grid item xs={12} md={6} lg={4} key={team.id}>
              <TeamCard team={team}/>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={open} onClose={()=>setOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx:{ bgcolor:S.surface, border:`1px solid ${S.border}`, borderRadius:'14px' } }}>
        <DialogTitle sx={{ color:S.text, fontWeight:700, fontSize:15, pb:1 }}>Create Sales Team</DialogTitle>
        <DialogContent>
          <Box mt={1.5}>
            <TextField fullWidth size="small" label="Team Name *" value={name} onChange={e=>setName(e.target.value)}
              sx={fieldSx} InputLabelProps={{ sx:labelSx }}/>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px:3, pb:2.5, gap:1 }}>
          <Button onClick={()=>setOpen(false)} sx={{ color:S.textSub, textTransform:'none', fontSize:13 }}>Cancel</Button>
          <Button variant="contained" disabled={!name.trim()} onClick={()=>{ dispatch(doCreateTeam({ name })); setOpen(false); setName(''); }}
            sx={{ bgcolor:S.primary, textTransform:'none', fontWeight:600, borderRadius:'8px', fontSize:13 }}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
