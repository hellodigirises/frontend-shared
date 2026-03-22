// src/modules/superadmin/pages/PlansPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Grid, Typography, Chip, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, Switch,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, C, INR, inputSx, labelSx, selectSx } from '../hooks';
import {
  fetchPlans, doCreatePlan, doUpdatePlan, doDeletePlan, type Plan,
} from '../store/superadminSlice';
import { PageHeader } from '../components/ui';

const ALL_MODULES = [
  'CRM', 'INVENTORY', 'BOOKINGS', 'FINANCE', 'HR',
  'PROCUREMENT', 'CONSTRUCTION', 'ANALYTICS', 'AI_INSIGHTS', 'MARKETING', 'DOCUMENTS',
];
const BILLING_TYPES = ['MONTHLY', 'QUARTERLY', 'ANNUAL'];
const ACCENT = ['#4F7FFF', '#22c55e', '#a855f7', '#f59e0b', '#06b6d4', '#ef4444'];

const EMPTY = {
  name: '', slug: '', description: '', price: '',
  billingType: 'MONTHLY', userLimit: '10', storageLimit: '5',
  sortOrder: '0', modules: [] as string[], active: true,
};

type Form = typeof EMPTY & { id?: string };

function PlanDialog({ open, initial, onClose, onSave }: {
  open: boolean;
  initial?: Partial<Form>;
  onClose: () => void;
  onSave: (f: Form) => void;
}) {
  const [f, setF] = useState<Form>(EMPTY);

  useEffect(() => {
    setF(initial ? { ...EMPTY, ...initial, modules: (initial.modules as string[]) ?? [] } : EMPTY);
  }, [open]);

  const set = (k: keyof Form, v: any) => setF(p => ({ ...p, [k]: v }));

  const toggleMod = (m: string) =>
    set('modules', f.modules.includes(m) ? f.modules.filter(x => x !== m) : [...f.modules, m]);

  const valid = !!(f.name && f.slug && f.price && +f.price > 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { bgcolor: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px' } }}>
      <DialogTitle sx={{ color: C.text, fontWeight: 700, fontSize: 15, pb: 1 }}>
        {f.id ? 'Edit Plan' : 'Create Plan'}
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={2} mt={0.25}>
          {/* Name */}
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="Plan Name *"
              value={f.name} onChange={e => set('name', e.target.value)}
              sx={inputSx} InputLabelProps={{ sx: labelSx }} />
          </Grid>
          {/* Slug */}
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="Slug *"
              value={f.slug} onChange={e => set('slug', e.target.value.toLowerCase().replace(/\s/g, '-'))}
              sx={inputSx} InputLabelProps={{ sx: labelSx }} />
          </Grid>
          {/* Price */}
          <Grid item xs={4}>
            <TextField fullWidth size="small" label="Price (₹) *" type="number"
              value={f.price} onChange={e => set('price', e.target.value)}
              sx={inputSx} InputLabelProps={{ sx: labelSx }} />
          </Grid>
          {/* Billing Type */}
          <Grid item xs={4}>
            <FormControl fullWidth size="small">
              <InputLabel sx={labelSx}>Billing Type</InputLabel>
              <Select value={f.billingType} label="Billing Type"
                onChange={e => set('billingType', e.target.value)} sx={selectSx}>
                {BILLING_TYPES.map(t => <MenuItem key={t} value={t} sx={{ fontSize: 13 }}>{t}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          {/* User Limit */}
          <Grid item xs={4}>
            <TextField fullWidth size="small" label="User Limit" type="number"
              value={f.userLimit} onChange={e => set('userLimit', e.target.value)}
              sx={inputSx} InputLabelProps={{ sx: labelSx }} />
          </Grid>
          {/* Storage */}
          <Grid item xs={4}>
            <TextField fullWidth size="small" label="Storage (GB)" type="number"
              value={f.storageLimit} onChange={e => set('storageLimit', e.target.value)}
              sx={inputSx} InputLabelProps={{ sx: labelSx }} />
          </Grid>
          {/* Sort */}
          <Grid item xs={4}>
            <TextField fullWidth size="small" label="Sort Order" type="number"
              value={f.sortOrder} onChange={e => set('sortOrder', e.target.value)}
              sx={inputSx} InputLabelProps={{ sx: labelSx }} />
          </Grid>
          {/* Active */}
          <Grid item xs={4}>
            <Box display="flex" alignItems="center" height="100%" gap={1}>
              <Switch checked={f.active} onChange={e => set('active', e.target.checked)}
                sx={{ '& .Mui-checked + .MuiSwitch-track': { bgcolor: `${C.primary} !important` } }} />
              <Typography sx={{ color: C.textSub, fontSize: 13 }}>Active</Typography>
            </Box>
          </Grid>
          {/* Description */}
          <Grid item xs={12}>
            <TextField fullWidth size="small" label="Description" multiline rows={2}
              value={f.description} onChange={e => set('description', e.target.value)}
              sx={inputSx} InputLabelProps={{ sx: labelSx }} />
          </Grid>
          {/* Modules */}
          <Grid item xs={12}>
            <Typography sx={{ color: C.textSub, fontSize: 11, mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Included Modules
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={0.75}>
              {ALL_MODULES.map(m => {
                const on = f.modules.includes(m);
                return (
                  <Chip key={m} label={m} size="small" clickable onClick={() => toggleMod(m)}
                    sx={{
                      fontSize: 11, height: 24, cursor: 'pointer',
                      bgcolor: on ? `${C.primary}20` : 'transparent',
                      color: on ? C.primary : C.textSub,
                      border: `1px solid ${on ? C.primary : C.border}`,
                      '&:hover': { bgcolor: on ? `${C.primary}30` : `${C.border}` },
                    }} />
                );
              })}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} sx={{ color: C.textSub, textTransform: 'none', fontSize: 13 }}>Cancel</Button>
        <Button variant="contained" disabled={!valid} onClick={() => onSave(f)}
          sx={{ bgcolor: C.primary, textTransform: 'none', fontWeight: 600, borderRadius: '8px', fontSize: 13 }}>
          {f.id ? 'Save Changes' : 'Create Plan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function PlansPage() {
  const dispatch = useAppDispatch();
  const { plans, loading } = useAppSelector(s => s.superadmin);
  const [dialog, setDialog] = useState<{ open: boolean; plan?: Plan }>({ open: false });

  useEffect(() => { dispatch(fetchPlans()); }, [dispatch]);

  const handleSave = (f: Form) => {
    if (f.id) {
      dispatch(doUpdatePlan({
        id: f.id,
        name: f.name, description: f.description,
        price: +f.price, userLimit: +f.userLimit,
        storageLimit: +f.storageLimit, active: f.active, sortOrder: +f.sortOrder,
      }));
    } else {
      dispatch(doCreatePlan({
        name: f.name, slug: f.slug, description: f.description,
        price: +f.price, billingType: f.billingType,
        userLimit: +f.userLimit, storageLimit: +f.storageLimit,
        sortOrder: +f.sortOrder, modules: f.modules, active: f.active,
      }));
    }
    setDialog({ open: false });
  };

  return (
    <Box>
      <PageHeader
        title="Plans"
        subtitle={`${plans.length} subscription plans`}
        action={
          <Button variant="contained" startIcon={<Add />} size="small"
            onClick={() => setDialog({ open: true })}
            sx={{ bgcolor: C.primary, textTransform: 'none', fontWeight: 600, borderRadius: '8px', fontSize: 13 }}>
            New Plan
          </Button>
        }
      />

      <Grid container spacing={2}>
        {plans.map((plan, idx) => {
          const accent = ACCENT[idx % ACCENT.length];
          return (
            <Grid item xs={12} md={6} lg={4} key={plan.id}>
              <Box sx={{
                bgcolor: C.surface, borderRadius: '16px', p: 3,
                border: `1px solid ${C.border}`, height: '100%',
                position: 'relative', overflow: 'hidden',
                '&::before': {
                  content: '""', position: 'absolute',
                  top: 0, left: 0, right: 0, height: 4,
                  background: accent, borderRadius: '16px 16px 0 0',
                },
              }}>
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Typography sx={{ color: C.text, fontWeight: 700, fontSize: 16, letterSpacing: -0.3 }}>
                      {plan.name}
                    </Typography>
                    <Typography sx={{ color: C.textSub, fontSize: 11 }}>{plan.slug}</Typography>
                  </Box>
                  <Box display="flex" gap={0.25}>
                    <Tooltip title="Edit">
                      <IconButton size="small"
                        onClick={() => setDialog({ open: true, plan })}
                        sx={{ color: C.muted, '&:hover': { color: C.primary } }}>
                        <Edit sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small"
                        onClick={() => dispatch(doDeletePlan(plan.id))}
                        sx={{ color: C.muted, '&:hover': { color: C.danger } }}>
                        <Delete sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Price */}
                <Typography sx={{ color: accent, fontSize: 30, fontWeight: 800, letterSpacing: -1, lineHeight: 1 }}>
                  {INR(plan.price)}
                </Typography>
                <Typography sx={{ color: C.textSub, fontSize: 11.5, mb: 2 }}>/ {plan.billingType}</Typography>

                {/* Description */}
                {plan.description && (
                  <Typography sx={{ color: C.textSub, fontSize: 12.5, mb: 2, lineHeight: 1.55 }}>
                    {plan.description}
                  </Typography>
                )}

                {/* Meta */}
                <Box display="flex" gap={3} mb={2}>
                  <Box>
                    <Typography sx={{ color: C.textSub, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Users
                    </Typography>
                    <Typography sx={{ color: C.text, fontSize: 14, fontWeight: 600 }}>
                      {plan.userLimit ?? '∞'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ color: C.textSub, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Storage
                    </Typography>
                    <Typography sx={{ color: C.text, fontSize: 14, fontWeight: 600 }}>
                      {plan.storageLimit ?? '—'} GB
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ color: C.textSub, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Sort
                    </Typography>
                    <Typography sx={{ color: C.text, fontSize: 14, fontWeight: 600 }}>{plan.sortOrder}</Typography>
                  </Box>
                </Box>

                {/* Modules */}
                {plan.modules.length > 0 && (
                  <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
                    {plan.modules.map(m => (
                      <Chip key={m.id} label={m.module} size="small"
                        sx={{ fontSize: 10, height: 20, bgcolor: `${accent}12`, color: accent }} />
                    ))}
                  </Box>
                )}

                {/* Status */}
                <Box display="flex" alignItems="center" gap={0.75}>
                  <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: plan.active ? C.success : C.danger }} />
                  <Typography sx={{ color: C.textSub, fontSize: 11 }}>{plan.active ? 'Active' : 'Inactive'}</Typography>
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      <PlanDialog
        open={dialog.open}
        initial={dialog.plan ? {
          id          : dialog.plan.id,
          name        : dialog.plan.name,
          slug        : dialog.plan.slug,
          description : dialog.plan.description ?? '',
          price       : String(dialog.plan.price),
          billingType : dialog.plan.billingType,
          userLimit   : String(dialog.plan.userLimit ?? 10),
          storageLimit: String(dialog.plan.storageLimit ?? 5),
          sortOrder   : String(dialog.plan.sortOrder),
          modules     : dialog.plan.modules.map(m => m.module),
          active      : dialog.plan.active,
        } : undefined}
        onClose={() => setDialog({ open: false })}
        onSave={handleSave}
      />
    </Box>
  );
}