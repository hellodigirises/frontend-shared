// src/modules/superadmin/pages/AddonsPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Grid, Typography, Chip, IconButton, Tooltip, Switch,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import { Add, Edit } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, C, INR, inputSx, labelSx, selectSx } from '../hooks';
import { fetchAddons, doCreateAddon, doUpdateAddon, type Addon } from '../store/superadminSlice';
import { PageHeader } from '../components/ui';

const ADDON_TYPES   = ['AI', 'TELEPHONY', 'STORAGE', 'INTEGRATION', 'FEATURE'];
const BILLING_TYPES = ['MONTHLY', 'ANNUAL', 'USAGE_BASED', 'ONE_TIME'];

const TYPE_COLOR: Record<string, string> = {
  AI         : '#a855f7',
  TELEPHONY  : '#06b6d4',
  STORAGE    : '#f59e0b',
  INTEGRATION: '#22c55e',
  FEATURE    : '#4F7FFF',
};

const EMPTY = {
  name: '', slug: '', description: '',
  type: 'FEATURE', price: '', billingType: 'MONTHLY', active: true,
};
type Form = typeof EMPTY & { id?: string };

function AddonDialog({ open, initial, onClose, onSave }: {
  open: boolean; initial?: Partial<Form>; onClose: () => void; onSave: (f: Form) => void;
}) {
  const [f, setF] = useState<Form>(EMPTY);
  useEffect(() => { setF(initial ? { ...EMPTY, ...initial } : EMPTY); }, [open]);
  const set = (k: keyof Form, v: any) => setF(p => ({ ...p, [k]: v }));
  const valid = !!(f.name && f.slug && f.price && +f.price >= 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { bgcolor: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px' } }}>
      <DialogTitle sx={{ color: C.text, fontWeight: 700, fontSize: 15, pb: 1 }}>
        {f.id ? 'Edit Add-on' : 'New Add-on'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} mt={0.25}>
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="Name *"
              value={f.name} onChange={e => set('name', e.target.value)}
              sx={inputSx} InputLabelProps={{ sx: labelSx }} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="Slug *"
              value={f.slug} onChange={e => set('slug', e.target.value.toLowerCase().replace(/\s/g, '-'))}
              sx={inputSx} InputLabelProps={{ sx: labelSx }} />
          </Grid>
          <Grid item xs={4}>
            <TextField fullWidth size="small" label="Price (₹) *" type="number"
              value={f.price} onChange={e => set('price', e.target.value)}
              sx={inputSx} InputLabelProps={{ sx: labelSx }} />
          </Grid>
          <Grid item xs={4}>
            <FormControl fullWidth size="small">
              <InputLabel sx={labelSx}>Type</InputLabel>
              <Select value={f.type} label="Type" onChange={e => set('type', e.target.value)} sx={selectSx}>
                {ADDON_TYPES.map(t => <MenuItem key={t} value={t} sx={{ fontSize: 13 }}>{t}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <FormControl fullWidth size="small">
              <InputLabel sx={labelSx}>Billing Type</InputLabel>
              <Select value={f.billingType} label="Billing Type" onChange={e => set('billingType', e.target.value)} sx={selectSx}>
                {BILLING_TYPES.map(t => <MenuItem key={t} value={t} sx={{ fontSize: 13 }}>{t}</MenuItem>)}
              </Select>
            </FormControl>
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
          {f.id ? 'Save' : 'Create Add-on'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function AddonsPage() {
  const dispatch = useAppDispatch();
  const { addons } = useAppSelector(s => s.superadmin);
  const [dialog, setDialog] = useState<{ open: boolean; addon?: Addon }>({ open: false });

  useEffect(() => { dispatch(fetchAddons()); }, [dispatch]);

  const save = (f: Form) => {
    if (f.id) {
      dispatch(doUpdateAddon({ id: f.id, name: f.name, description: f.description, price: +f.price, active: f.active }));
    } else {
      dispatch(doCreateAddon({ name: f.name, slug: f.slug, description: f.description, type: f.type, price: +f.price, billingType: f.billingType }));
    }
    setDialog({ open: false });
  };

  return (
    <Box>
      <PageHeader
        title="Add-on Marketplace"
        subtitle={`${addons.length} add-ons available to tenants`}
        action={
          <Button variant="contained" startIcon={<Add />} size="small"
            onClick={() => setDialog({ open: true })}
            sx={{ bgcolor: C.primary, textTransform: 'none', fontWeight: 600, borderRadius: '8px', fontSize: 13 }}>
            New Add-on
          </Button>
        }
      />

      <Grid container spacing={2}>
        {addons.map(addon => {
          const ac = TYPE_COLOR[addon.type] ?? C.primary;
          return (
            <Grid item xs={12} sm={6} md={4} key={addon.id}>
              <Box sx={{
                bgcolor: C.surface, borderRadius: '14px', p: 2.5,
                border: `1px solid ${C.border}`, height: '100%',
                borderLeft: `3px solid ${ac}`,
              }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                  <Box>
                    <Typography sx={{ color: C.text, fontWeight: 600, fontSize: 14 }}>{addon.name}</Typography>
                    <Typography sx={{ color: C.textSub, fontSize: 11 }}>{addon.slug}</Typography>
                  </Box>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => setDialog({ open: true, addon })}
                      sx={{ color: C.muted, '&:hover': { color: C.primary } }}>
                      <Edit sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                </Box>

                {addon.description && (
                  <Typography sx={{ color: C.textSub, fontSize: 12.5, mb: 2, lineHeight: 1.55 }}>
                    {addon.description}
                  </Typography>
                )}

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                  <Typography sx={{ color: ac, fontWeight: 800, fontSize: 22, letterSpacing: -0.5 }}>
                    {INR(addon.price)}
                  </Typography>
                  <Box display="flex" gap={0.5}>
                    <Chip label={addon.type} size="small"
                      sx={{ fontSize: 10, height: 20, bgcolor: `${ac}18`, color: ac }} />
                    <Chip label={addon.billingType} size="small"
                      sx={{ fontSize: 10, height: 20, bgcolor: `rgba(255,255,255,0.06)`, color: C.textSub }} />
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={0.75}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: addon.active ? C.success : C.danger }} />
                  <Typography sx={{ color: C.textSub, fontSize: 11 }}>{addon.active ? 'Active' : 'Inactive'}</Typography>
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      <AddonDialog
        open={dialog.open}
        initial={dialog.addon ? { ...dialog.addon, price: String(dialog.addon.price) } : undefined}
        onClose={() => setDialog({ open: false })}
        onSave={save}
      />
    </Box>
  );
}