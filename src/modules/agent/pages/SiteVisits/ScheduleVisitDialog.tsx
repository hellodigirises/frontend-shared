// src/modules/agent/pages/SiteVisits/ScheduleVisitDialog.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Stack, Button, TextField, Chip, Grid,
  IconButton, Divider, FormControl, InputLabel, Select,
  MenuItem, Switch, FormControlLabel, InputAdornment,
  CircularProgress, Alert, Tabs, Tab, Avatar, Paper, Collapse
} from '@mui/material';
import {
  CloseOutlined, ApartmentOutlined,
  LocationOnOutlined, VideoCallOutlined,
  CheckCircleOutlined, InfoOutlined
} from '@mui/icons-material';
import {
  VisitType, VisitStatus, VisitPriority, VisitLead,
  VISIT_TYPE_CFG, PRIORITY_CFG, DURATION_OPTIONS,
  VISIT_TAGS, avatarColor, initials, todayStr
} from './visitTypes';
import { agentApi } from '../../api/agent.api';

interface Props {
  open: boolean;
  onClose: () => void;
  initial?: any;
  prefillLead?: any;
  onSave: () => void;
}

const BLANK = {
  visitType: 'PHYSICAL' as VisitType,
  priority: 'MEDIUM' as VisitPriority,
  leadId: '', projectId: '', unitId: '',
  visitDate: todayStr(), visitTime: '10:00',
  durationMinutes: 60, notes: '',
  tags: [] as string[],
};

const ScheduleVisitDialog: React.FC<Props> = ({ open, onClose, initial, prefillLead, onSave }) => {
  const [form, setForm] = useState({ ...BLANK });
  const [saving, setSaving] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [slots, setSlots] = useState<{time: string, available: boolean}[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const isEdit = !!initial?.id;

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSuccess(false);
    if (initial) {
      setForm({
        ...BLANK,
        visitType: initial.visitType || 'PHYSICAL',
        priority: initial.priority || 'MEDIUM',
        leadId: initial.leadId || initial.lead?.id || '',
        projectId: initial.projectId || initial.project?.id || '',
        unitId: initial.unitId || initial.unit?.id || '',
        visitDate: initial.visitDate ? initial.visitDate.split('T')[0] : todayStr(),
        visitTime: initial.visitTime || '10:00',
        durationMinutes: initial.durationMinutes || 60,
        notes: initial.notes || '',
        tags: initial.tags || [],
      });
    } else if (prefillLead) {
      setForm({ 
        ...BLANK, 
        leadId: prefillLead.id, 
        projectId: prefillLead.projectId || prefillLead.project?.id || prefillLead.preferredProject || '',
        unitId: prefillLead.unitId || prefillLead.unit?.id || '',
      });
    } else {
      setForm({ ...BLANK });
    }
    
    // Fetch projects for dropdown
    agentApi.get('/projects').then(r => {
      const res = r.data.data;
      setProjects(Array.isArray(res) ? res : res?.data || []);
    }).catch(console.error);
  }, [open, initial, prefillLead]);

  useEffect(() => {
    if (form.projectId) {
      agentApi.get('/units', { params: { projectId: form.projectId, allStatus: 'true' } })
        .then(r => {
          const res = r.data.data;
          setUnits(Array.isArray(res) ? res : res?.data || []);
        })
        .catch(console.error);
    } else {
      setUnits([]);
    }
  }, [form.projectId]);

  useEffect(() => {
    if (form.visitDate) {
      agentApi.get('/site-visits/slots', { params: { date: form.visitDate } })
        .then(r => setSlots(r.data.data || []))
        .catch(console.error);
    }
  }, [form.visitDate]);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const toggleTag = (t: string) => 
    setForm(f => ({ ...f, tags: f.tags.includes(t) ? f.tags.filter(x => x !== t) : [...f.tags, t] }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isEdit) await agentApi.put(`/site-visits/${initial.id}`, form);
      else await agentApi.post('/site-visits', form);
      setSuccess(true);
      setTimeout(() => {
        onSave();
        onClose();
      }, 1500);
    } catch (e: any) {
      console.error('VISIT SAVE ERROR:', e.response?.data);
      const msg = e.response?.data?.error || e.message;
      setError(msg);
      window.alert('ERROR: ' + msg);
    } finally { setSaving(false); }
  };

  const canSave = form.leadId && form.projectId && form.visitDate && form.visitTime;

  const S = {
    label: { fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.5)', display: 'block', mb: 1 },
    card: (sel: boolean, col: string) => ({
      p: 1.5, borderRadius: 2, textAlign: 'center', cursor: 'pointer', border: '1px solid',
      borderColor: sel ? col : 'rgba(255,255,255,0.1)',
      bgcolor: sel ? col + '15' : 'rgba(255,255,255,0.05)',
      transition: 'all .15s', '&:hover': { borderColor: col, bgcolor: col + '10' }
    }),
    input: {
      '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2, color: '#fff', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"
      PaperProps={{ sx: { bgcolor: '#1A0F0A', borderRadius: 4, backgroundImage: 'none', border: '1px solid rgba(255,220,180,0.1)' } }}>
      
      <DialogTitle sx={{ color: '#fff', fontWeight: 900, fontSize: '1.25rem', fontFamily: '"Playfair Display", serif', pb: 1, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        {isEdit ? 'Edit Site Visit' : 'Schedule Site Visit'}
        <IconButton size="small" onClick={onClose} sx={{ color: 'rgba(255,255,255,0.5)' }}><CloseOutlined/></IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 2 }}>
        <Stack spacing={3}>
          <Collapse in={!!error}>
            <Alert severity="error" onClose={() => setError(null)} sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          </Collapse>

          <Collapse in={success}>
            <Alert severity="success" sx={{ borderRadius: 2, bgcolor: 'rgba(34,197,94,0.1)', color: '#4ADE80' }}>
              Site visit {isEdit ? 'updated' : 'scheduled'} successfully!
            </Alert>
          </Collapse>

          {/* Visit Type */}
          <Box>
            <Typography sx={S.label}>Visit Mode</Typography>
            <Grid container spacing={1.5}>
              {Object.entries(VISIT_TYPE_CFG).map(([k, v]) => (
                <Grid item xs={3} key={k}>
                  <Box onClick={() => set('visitType', k)} sx={S.card(form.visitType === k, v.color)}>
                    <Typography sx={{ fontSize: 20, mb: 0.5 }}>{v.icon}</Typography>
                    <Typography sx={{ fontSize: 10, fontWeight: 800, color: form.visitType===k?v.color:'rgba(255,255,255,0.4)' }}>{v.label.split(' ')[0]}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Lead Info (Display only if prefilled) */}
          {prefillLead && (
            <Paper sx={{ p: 1.5, bgcolor: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 3 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ width: 32, height: 32, bgcolor: avatarColor(prefillLead.customerName), fontSize: 13, fontWeight: 800 }}>{initials(prefillLead.customerName)}</Avatar>
                <Box>
                  <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{prefillLead.customerName}</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{prefillLead.customerPhone}</Typography>
                </Box>
              </Stack>
            </Paper>
          )}

          {/* Project & Unit */}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography sx={S.label}>Project *</Typography>
              <FormControl fullWidth size="small" sx={S.input}>
                <Select value={form.projectId} onChange={e => set('projectId', e.target.value)} displayEmpty renderValue={v => projects.find(p=>p.id===v)?.name || <span style={{color:'rgba(255,255,255,0.3)'}}>Select Project</span>}>
                  {projects.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography sx={S.label}>Unit</Typography>
              <FormControl fullWidth size="small" sx={S.input}>
                <Select 
                  value={form.unitId} 
                  onChange={e => set('unitId', e.target.value)} 
                  displayEmpty 
                  renderValue={v => units.find(u=>u.id===v)?.unitNumber || <span style={{color:'rgba(255,255,255,0.3)'}}>Select Unit</span>}
                  disabled={!form.projectId}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {units.map(u => <MenuItem key={u.id} value={u.id}>{u.unitNumber} - {u.unitType}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Visit Date"
                type="date"
                size="small"
                value={form.visitDate}
                onChange={(e) => set('visitDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={S.input}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" sx={S.input}>
                <InputLabel sx={{ color: 'rgba(255,255,255,0.5)' }}>Visit Time</InputLabel>
                <Select
                  value={form.visitTime}
                  label="Visit Time"
                  onChange={(e) => set('visitTime', e.target.value)}
                >
                  {slots.map((s) => (
                    <MenuItem key={s.time} value={s.time} disabled={!s.available}>
                      {s.time} {!s.available && '(Busy)'}
                    </MenuItem>
                  ))}
                  {slots.length === 0 && <MenuItem disabled>Select date first</MenuItem>}
                </Select>
                {slots.some(s => !s.available) && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1 }}>
                    Red slots are already booked.
                  </Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>

          {/* Priority & Tags */}
          <Box>
             <Typography sx={S.label}>Priority</Typography>
             <Stack direction="row" spacing={1}>
                {Object.entries(PRIORITY_CFG).map(([k,v]) => (
                  <Box key={k} onClick={() => set('priority', k)} sx={{ ...S.card(form.priority===k, v.color), flex:1, py:1 }}>
                    <Typography sx={{ color: form.priority===k?v.color:'rgba(255,255,255,0.4)', fontWeight:800, fontSize:11 }}>{v.label}</Typography>
                  </Box>
                ))}
             </Stack>
          </Box>

          <Box>
            <Typography sx={S.label}>Notes</Typography>
            <TextField fullWidth multiline rows={2} placeholder="Any specific instructions..." value={form.notes} onChange={e => set('notes', e.target.value)} sx={S.input}/>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={onClose} sx={{ color: 'rgba(255,255,255,0.5)', textTransform:'none' }}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={!canSave || saving} 
          sx={{ bgcolor: '#F97316', borderRadius: 2, fontWeight: 700, textTransform:'none', px: 4, '&:hover': { bgcolor: '#EA580C' } }}>
          {saving ? <CircularProgress size={20} color="inherit"/> : isEdit ? 'Update Visit' : 'Schedule Visit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScheduleVisitDialog;
