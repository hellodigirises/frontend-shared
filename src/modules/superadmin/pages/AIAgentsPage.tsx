// src/modules/superadmin/pages/AIAgentsPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Grid, Typography, Chip, IconButton, Tooltip, Switch,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import { Add, Edit, SmartToy } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, C, INR, inputSx, labelSx, selectSx } from '../hooks';
import { fetchAIAgents, doCreateAIAgent, doUpdateAIAgent, type AIAgent } from '../store/superadminSlice';
import { PageHeader, SectionCard, DataTable } from '../components/ui';
import { api } from '../api/superadmin.api';

const AGENT_TYPES = ['VOICE', 'CHAT', 'LEAD_SCORING', 'ANALYTICS', 'CUSTOM'];

const EMPTY = {
  name: '', slug: '', description: '',
  type: 'CHAT', costPerMin: '0', tenantPrice: '0', active: true,
};
type Form = typeof EMPTY & { id?: string };

function AgentDialog({ open, initial, onClose, onSave }: {
  open: boolean; initial?: Partial<Form>; onClose: () => void; onSave: (f: Form) => void;
}) {
  const [f, setF] = useState<Form>(EMPTY);
  useEffect(() => { setF(initial ? { ...EMPTY, ...initial } : EMPTY); }, [open]);
  const set = (k: keyof Form, v: any) => setF(p => ({ ...p, [k]: v }));
  const valid = !!(f.name && f.slug);

  const margin = f.tenantPrice && f.costPerMin
    ? ((+f.tenantPrice - +f.costPerMin) / Math.max(+f.costPerMin, 0.0001) * 100).toFixed(1)
    : '0';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { bgcolor: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px' } }}>
      <DialogTitle sx={{ color: C.text, fontWeight: 700, fontSize: 15, pb: 1 }}>
        {f.id ? 'Edit AI Agent' : 'New AI Agent'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} mt={0.25}>
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="Agent Name *"
              value={f.name} onChange={e => set('name', e.target.value)}
              sx={inputSx} InputLabelProps={{ sx: labelSx }} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="Slug *"
              value={f.slug} onChange={e => set('slug', e.target.value.toLowerCase().replace(/\s/g, '-'))}
              sx={inputSx} InputLabelProps={{ sx: labelSx }} />
          </Grid>
          <Grid item xs={4}>
            <FormControl fullWidth size="small">
              <InputLabel sx={labelSx}>Type</InputLabel>
              <Select value={f.type} label="Type" onChange={e => set('type', e.target.value)} sx={selectSx}>
                {AGENT_TYPES.map(t => <MenuItem key={t} value={t} sx={{ fontSize: 13 }}>{t}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <TextField fullWidth size="small" label="System Cost / min (₹)" type="number"
              inputProps={{ step: '0.01' }}
              value={f.costPerMin} onChange={e => set('costPerMin', e.target.value)}
              sx={inputSx} InputLabelProps={{ sx: { ...labelSx, fontSize: 11.5 } }} />
          </Grid>
          <Grid item xs={4}>
            <TextField fullWidth size="small" label="Tenant Price / min (₹)" type="number"
              inputProps={{ step: '0.01' }}
              value={f.tenantPrice} onChange={e => set('tenantPrice', e.target.value)}
              sx={inputSx} InputLabelProps={{ sx: { ...labelSx, fontSize: 11.5 } }} />
          </Grid>

          {/* Live margin preview */}
          <Grid item xs={12}>
            <Box sx={{ bgcolor: C.surfaceHigh, borderRadius: '10px', p: 1.5, display: 'flex', gap: 3 }}>
              <Box>
                <Typography sx={{ color: C.textSub, fontSize: 11, mb: 0.25 }}>Margin / min</Typography>
                <Typography sx={{ color: C.success, fontWeight: 700, fontSize: 14 }}>
                  {INR(Math.max(0, +f.tenantPrice - +f.costPerMin))}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ color: C.textSub, fontSize: 11, mb: 0.25 }}>Margin %</Typography>
                <Typography sx={{ color: C.success, fontWeight: 700, fontSize: 14 }}>{margin}%</Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <TextField fullWidth size="small" label="Description" multiline rows={2}
              value={f.description} onChange={e => set('description', e.target.value)}
              sx={inputSx} InputLabelProps={{ sx: labelSx }} />
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={1}>
              <Switch checked={f.active} onChange={e => set('active', e.target.checked)}
                sx={{ '& .Mui-checked + .MuiSwitch-track': { bgcolor: `${C.primary} !important` } }} />
              <Typography sx={{ color: C.textSub, fontSize: 13 }}>Active</Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} sx={{ color: C.textSub, textTransform: 'none', fontSize: 13 }}>Cancel</Button>
        <Button variant="contained" disabled={!valid} onClick={() => onSave(f)}
          sx={{ bgcolor: C.primary, textTransform: 'none', fontWeight: 600, borderRadius: '8px', fontSize: 13 }}>
          {f.id ? 'Save' : 'Create Agent'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function AIAgentsPage() {
  const dispatch = useAppDispatch();
  const { aiAgents } = useAppSelector(s => s.superadmin);
  const [dialog, setDialog] = useState<{ open: boolean; agent?: AIAgent }>({ open: false });
  const [usage, setUsage]   = useState<any[]>([]);
  const [usageLoading, setUsageLoading] = useState(false);

  useEffect(() => { dispatch(fetchAIAgents()); }, [dispatch]);

  useEffect(() => {
    setUsageLoading(true);
    api.get('/ai-usage', { params: { take: 30 } })
      .then(r => setUsage(r.data.data?.data ?? []))
      .finally(() => setUsageLoading(false));
  }, []);

  const save = (f: Form) => {
    if (f.id) {
      dispatch(doUpdateAIAgent({ id: f.id, name: f.name, description: f.description, costPerMin: +f.costPerMin, tenantPrice: +f.tenantPrice, active: f.active }));
    } else {
      dispatch(doCreateAIAgent({ name: f.name, slug: f.slug, description: f.description, type: f.type, costPerMin: +f.costPerMin, tenantPrice: +f.tenantPrice }));
    }
    setDialog({ open: false });
  };

  return (
    <Box>
      <PageHeader
        title="AI Agents"
        subtitle="Configure AI agents, pricing, and monitor usage"
        action={
          <Button variant="contained" startIcon={<Add />} size="small"
            onClick={() => setDialog({ open: true })}
            sx={{ bgcolor: C.primary, textTransform: 'none', fontWeight: 600, borderRadius: '8px', fontSize: 13 }}>
            New Agent
          </Button>
        }
      />

      {/* Agent cards */}
      <Grid container spacing={2} mb={3}>
        {aiAgents.map(agent => {
          const diff = agent.tenantPrice - agent.costPerMin;
          const pct  = agent.costPerMin > 0 ? ((diff / agent.costPerMin) * 100).toFixed(0) : '—';
          return (
            <Grid item xs={12} sm={6} md={4} key={agent.id}>
              <Box sx={{
                bgcolor: C.surface, borderRadius: '14px', p: 2.5,
                border: `1px solid ${C.border}`, height: '100%',
              }}>
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box display="flex" gap={1.25} alignItems="center">
                    <Box sx={{
                      width: 34, height: 34, borderRadius: '9px',
                      bgcolor: `${C.purple}18`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <SmartToy sx={{ fontSize: 17, color: C.purple }} />
                    </Box>
                    <Box>
                      <Typography sx={{ color: C.text, fontWeight: 600, fontSize: 13.5 }}>{agent.name}</Typography>
                      <Chip label={agent.type} size="small"
                        sx={{ fontSize: 10, height: 18, bgcolor: `${C.purple}15`, color: C.purple, mt: 0.25 }} />
                    </Box>
                  </Box>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => setDialog({ open: true, agent })}
                      sx={{ color: C.muted, '&:hover': { color: C.primary } }}>
                      <Edit sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                </Box>

                {agent.description && (
                  <Typography sx={{ color: C.textSub, fontSize: 12.5, mb: 2, lineHeight: 1.55 }}>
                    {agent.description}
                  </Typography>
                )}

                {/* Pricing breakdown */}
                <Box sx={{ bgcolor: C.surfaceHigh, borderRadius: '10px', p: 1.5 }}>
                  {[
                    { l: 'System Cost / min', v: INR(agent.costPerMin), c: C.textSub },
                    { l: 'Tenant Price / min', v: INR(agent.tenantPrice), c: C.text },
                    { l: 'Margin',             v: `${INR(diff)} (${pct}%)`, c: C.success },
                  ].map(row => (
                    <Box key={row.l} display="flex" justifyContent="space-between" mb={0.6}>
                      <Typography sx={{ color: C.textSub, fontSize: 12 }}>{row.l}</Typography>
                      <Typography sx={{ color: row.c, fontSize: 12, fontWeight: 600 }}>{row.v}</Typography>
                    </Box>
                  ))}
                </Box>

                <Box display="flex" alignItems="center" gap={0.75} mt={1.5}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: agent.active ? C.success : C.danger }} />
                  <Typography sx={{ color: C.textSub, fontSize: 11 }}>{agent.active ? 'Active' : 'Inactive'}</Typography>
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {/* Usage table */}
      <SectionCard title="Recent AI Usage">
        <DataTable
          loading={usageLoading}
          columns={[
            { label: 'Tenant',     render: r => <Typography sx={{ color: C.text,    fontSize: 12 }}>{r.tenant?.name ?? '—'}</Typography> },
            { label: 'Agent',      render: r => <Typography sx={{ color: C.text,    fontSize: 12 }}>{r.agent?.name  ?? '—'}</Typography> },
            { label: 'Minutes',    render: r => <Typography sx={{ color: C.text,    fontSize: 12 }}>{Number(r.minutes).toFixed(2)}</Typography> },
            { label: 'Tokens In',  render: r => <Typography sx={{ color: C.textSub, fontSize: 12 }}>{r.inputTokens}</Typography> },
            { label: 'Tokens Out', render: r => <Typography sx={{ color: C.textSub, fontSize: 12 }}>{r.outputTokens}</Typography> },
            { label: 'Cost',       render: r => <Typography sx={{ color: C.text,    fontSize: 12, fontWeight: 600 }}>{INR(r.cost)}</Typography> },
            { label: 'Status',     render: r => (
              <Chip label={r.status} size="small"
                sx={{ fontSize: 10, height: 20,
                  bgcolor: r.status === 'COMPLETED' ? `${C.success}15` : `${C.danger}15`,
                  color  : r.status === 'COMPLETED' ? C.success : C.danger }} />
            )},
          ]}
          rows={usage}
          emptyMsg="No AI usage records"
        />
      </SectionCard>

      <AgentDialog
        open={dialog.open}
        initial={dialog.agent ? {
          ...dialog.agent,
          costPerMin  : String(dialog.agent.costPerMin),
          tenantPrice : String(dialog.agent.tenantPrice),
        } : undefined}
        onClose={() => setDialog({ open: false })}
        onSave={save}
      />
    </Box>
  );
}