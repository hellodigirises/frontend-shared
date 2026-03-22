import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Stack, Button, TextField, Grid,
  FormControl, InputLabel, Select, MenuItem, Avatar
} from '@mui/material';
import {
  CloseOutlined, PersonOutlined, PhoneOutlined, EmailOutlined,
  HomeOutlined, CalendarTodayOutlined
} from '@mui/icons-material';
import api from '../../../../api/axios';
import { Agent, avatarColor, initials } from '../Lead_CRM/crmTypes';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

const BLANK = {
  name: '', phone: '', email: '',
  address: '', source: 'MANUAL',
  userId: '', projectId: '', unitId: '',
  bookingDate: '', possessionDate: '',
  handoverDate: '', transferDate: '',
  notes: ''
};

const CustomerFormDialog: React.FC<Props> = ({ open, onClose, onSave }) => {
  const [form, setForm] = useState(BLANK);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(BLANK);
      fetchAgents();
    }
  }, [open]);

  const fetchAgents = async () => {
    try {
      const res = await api.get('/users', { params: { role: 'AGENT' } });
      setAgents(res.data.data ?? res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/customers', form);
      onSave();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: 5 } }}>
      <DialogTitle sx={{ fontWeight: 900, px: 3, pt: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight={900}>Manual Customer Entry</Typography>
          <Button onClick={onClose} startIcon={<CloseOutlined />} sx={{ color: 'text.secondary' }}>Cancel</Button>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: 3 }}>
        <Grid container spacing={3} sx={{ mt: 0.5 }}>
          <Grid item xs={12}><Typography variant="subtitle2" fontWeight={800} color="primary">Basic Information</Typography></Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} 
              InputProps={{ startAdornment: <PersonOutlined sx={{ mr: 1, color: 'text.secondary' }} /> }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Phone Number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
              InputProps={{ startAdornment: <PhoneOutlined sx={{ mr: 1, color: 'text.secondary' }} /> }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Email Address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              InputProps={{ startAdornment: <EmailOutlined sx={{ mr: 1, color: 'text.secondary' }} /> }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Assigned Agent</InputLabel>
              <Select value={form.userId} label="Assigned Agent" onChange={e => setForm({ ...form, userId: e.target.value })}>
                {agents.map(a => (
                  <MenuItem key={a.id} value={a.id}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar src={a.avatarUrl} sx={{ width: 24, height: 24, fontSize: 10 }}>{initials(a.name)}</Avatar>
                      <Typography variant="body2">{a.name}</Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sx={{ mt: 1 }}><Typography variant="subtitle2" fontWeight={800} color="primary">Property & Timeline</Typography></Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Project / Property" value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })}
              placeholder="e.g. Skyline Residency" InputProps={{ startAdornment: <HomeOutlined sx={{ mr: 1, color: 'text.secondary' }} /> }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Unit Number" value={form.unitId} onChange={e => setForm({ ...form, unitId: e.target.value })}
              placeholder="e.g. A-1204" />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField fullWidth type="date" label="Booking Date" InputLabelProps={{ shrink: true }}
              value={form.bookingDate} onChange={e => setForm({ ...form, bookingDate: e.target.value })} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth type="date" label="Possession Date" InputLabelProps={{ shrink: true }} 
              value={form.possessionDate} onChange={e => setForm({ ...form, possessionDate: e.target.value })} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth type="date" label="Handover Date" InputLabelProps={{ shrink: true }}
              value={form.handoverDate} onChange={e => setForm({ ...form, handoverDate: e.target.value })} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth type="date" label="Transfer Date" InputLabelProps={{ shrink: true }}
              value={form.transferDate} onChange={e => setForm({ ...form, transferDate: e.target.value })} />
          </Grid>

          <Grid item xs={12} sx={{ mt: 1 }}><Typography variant="subtitle2" fontWeight={800} color="primary">Additional Details</Typography></Grid>
          <Grid item xs={12}>
            <TextField fullWidth multiline rows={3} label="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth multiline rows={3} label="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 4 }}>
        <Button onClick={onClose} sx={{ color: 'text.secondary', fontWeight: 700 }}>Discard</Button>
        <Button variant="contained" disableElevation onClick={handleSave} disabled={saving} sx={{ borderRadius: 3, px: 4, fontWeight: 800 }}>
          {saving ? 'Creating...' : 'Create Customer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerFormDialog;
