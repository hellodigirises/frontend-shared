// src/modules/superadmin/components/CreateTenantDialog.tsx
import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Grid, FormControl, InputLabel, Select, MenuItem, Typography,
} from '@mui/material';
import { useAppDispatch, useAppSelector, C, inputSx, labelSx, selectSx } from '../hooks';
import { fetchPlans, doCreateTenant } from '../store/superadminSlice';

const EMPTY = { name:'', email:'', phone:'', address:'', planId:'', billingCycle:'MONTHLY', maxUsers:'10' };

export default function CreateTenantDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dispatch = useAppDispatch();
  const { plans } = useAppSelector(s => s.superadmin);
  const [f, setF] = useState(EMPTY);

  useEffect(() => { if (plans.length === 0) dispatch(fetchPlans()); }, []);
  useEffect(() => { if (open) setF(EMPTY); }, [open]);

  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));
  const valid = !!(f.name && f.email && f.planId);

  const submit = () => {
    dispatch(doCreateTenant({ ...f, maxUsers: +f.maxUsers }));
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { bgcolor: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px' } }}>
      <DialogTitle sx={{ color: C.text, fontWeight: 700, fontSize: 15, pb: 1 }}>
        Create New Tenant
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} mt={0.25}>
          <Grid item xs={12}>
            <TextField fullWidth size="small" label="Company Name *"
              value={f.name} onChange={e => set('name', e.target.value)}
              sx={inputSx} InputLabelProps={{ sx: labelSx }} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="Email *" type="email"
              value={f.email} onChange={e => set('email', e.target.value)}
              sx={inputSx} InputLabelProps={{ sx: labelSx }} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="Phone"
              value={f.phone} onChange={e => set('phone', e.target.value)}
              sx={inputSx} InputLabelProps={{ sx: labelSx }} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth size="small" label="Address"
              value={f.address} onChange={e => set('address', e.target.value)}
              sx={inputSx} InputLabelProps={{ sx: labelSx }} />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel sx={labelSx}>Plan *</InputLabel>
              <Select value={f.planId} label="Plan *" onChange={e => set('planId', e.target.value)} sx={selectSx}>
                {plans.map(p => (
                  <MenuItem key={p.id} value={p.id} sx={{ fontSize: 13 }}>
                    {p.name} — ₹{p.price} / {p.billingType}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={3}>
            <FormControl fullWidth size="small">
              <InputLabel sx={labelSx}>Billing</InputLabel>
              <Select value={f.billingCycle} label="Billing" onChange={e => set('billingCycle', e.target.value)} sx={selectSx}>
                {['MONTHLY','QUARTERLY','ANNUAL'].map(c => (
                  <MenuItem key={c} value={c} sx={{ fontSize: 13 }}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={3}>
            <TextField fullWidth size="small" label="Max Users" type="number"
              value={f.maxUsers} onChange={e => set('maxUsers', e.target.value)}
              sx={inputSx} InputLabelProps={{ sx: labelSx }} />
          </Grid>
          <Grid item xs={12}>
            <Typography sx={{
              color: C.warning, fontSize: 11.5,
              bgcolor: 'rgba(245,158,11,0.08)', border: `1px solid rgba(245,158,11,0.2)`,
              borderRadius: '8px', p: 1.25,
            }}>
              ℹ️  A 14-day trial starts automatically. Client ID is auto-generated.
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} sx={{ color: C.textSub, textTransform: 'none', fontSize: 13 }}>Cancel</Button>
        <Button variant="contained" disabled={!valid} onClick={submit}
          sx={{ bgcolor: C.primary, textTransform: 'none', fontWeight: 600, borderRadius: '8px', fontSize: 13, px: 2.5 }}>
          Create Tenant
        </Button>
      </DialogActions>
    </Dialog>
  );
}