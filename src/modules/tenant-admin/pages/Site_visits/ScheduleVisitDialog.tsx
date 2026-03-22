import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Stack, Button, TextField, Chip, Grid,
  IconButton, Divider, FormControl, InputLabel, Select,
  MenuItem, Switch, FormControlLabel, InputAdornment,
  CircularProgress, Alert, Tabs, Tab, Avatar, Paper, Collapse
} from '@mui/material';
import {
  CloseOutlined, PersonOutlined, ApartmentOutlined,
  LocationOnOutlined, VideoCallOutlined, GroupAddOutlined,
  NotificationsOutlined, MyLocationOutlined, WarningAmberOutlined,
  CheckCircleOutlined, ErrorOutlined
} from '@mui/icons-material';
import {
  SiteVisit, VisitType, VisitStatus, VisitPriority, VisitLead, VisitAgent,
  VISIT_TYPE_CFG, VISIT_STATUS_CFG, PRIORITY_CFG, HOURS, DURATION_OPTIONS,
  VISIT_TAGS, avatarColor, initials, todayStr
} from './visitTypes';
import api from '../../../../api/axios';

// ─── Shared styles ────────────────────────────────────────────────────────────
const S = {
  label: { fontWeight: 700 as const, fontSize: '0.65rem', textTransform: 'uppercase' as const, letterSpacing: 1, color: '#6b7280', display: 'block', mb: 1 },
  sectionTitle: { fontWeight: 800 as const, fontSize: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: 1.2, color: '#374151', display: 'block', mb: 1.5 },
  card: (selected: boolean, color: string) => ({
    p: 2, borderRadius: 3, textAlign: 'center' as const, cursor: 'pointer',
    border: '2px solid', transition: 'all .15s',
    borderColor: selected ? color : '#e5e7eb',
    bgcolor: selected ? color + '15' : '#fff',
    '&:hover': { borderColor: color, bgcolor: color + '08' }
  }),
};

interface Props {
  open: boolean;
  onClose: () => void;
  initial: SiteVisit | null;
  leads: VisitLead[];
  agents: VisitAgent[];
  prefillLeadId?: string;
  prefillDate?: string;
  onSave: () => void;
}

const BLANK = {
  visitType: 'ONSITE' as VisitType,
  status: 'SCHEDULED' as VisitStatus,
  priority: 'NORMAL' as VisitPriority,
  leadId: '', agentId: '',
  project: '', tower: '', floor: '', unitNumber: '',
  meetingLocation: '', meetingLink: '',
  visitDate: '', visitTime: '10:00',
  durationMinutes: 60, notes: '',
  isGroupVisit: false, groupLeadIds: [] as string[],
  coAgentIds: [] as string[],
  tags: [] as string[],
  sendReminderDay: true, sendReminderHour: true,
  reminderChannels: ['APP', 'EMAIL'] as string[],
  isReschedule: false, rescheduleReason: '',
};

const ScheduleVisitDialog: React.FC<Props> = ({
  open, onClose, initial, leads, agents, prefillLeadId, prefillDate, onSave
}) => {
  const [form, setForm] = useState({ ...BLANK });
  const [tab, setTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial?.id;

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        ...BLANK,
        visitType: initial.visitType, status: initial.status,
        priority: initial.priority ?? 'NORMAL',
        leadId: initial.lead.id, agentId: initial.agent.id,
        project: initial.project ?? '', tower: initial.tower ?? '',
        floor: initial.floor ?? '', unitNumber: initial.unitNumber ?? '',
        meetingLocation: initial.meetingLocation ?? '',
        meetingLink: initial.meetingLink ?? '',
        visitDate: initial.visitDate, visitTime: initial.visitTime,
        durationMinutes: initial.durationMinutes ?? 60,
        notes: initial.notes ?? '',
        isGroupVisit: (initial.groupLeads?.length ?? 0) > 0,
        groupLeadIds: (initial.groupLeads ?? []).map(l => l.id),
        coAgentIds: (initial.coAgents ?? []).map(a => a.id),
        tags: initial.tags ?? [],
        sendReminderDay: true, sendReminderHour: true,
        reminderChannels: ['APP', 'EMAIL'],
        isReschedule: false, rescheduleReason: '',
      });
    } else {
      setForm({ ...BLANK, leadId: prefillLeadId ?? '', visitDate: prefillDate ?? '' });
    }
    setTab(0);
  }, [open, initial, prefillLeadId, prefillDate]);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const toggleArr = (k: string, v: string) =>
    setForm(f => {
      const arr: string[] = (f as any)[k];
      return { ...f, [k]: arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v] };
    });

  const selectedLead = leads.find(l => l.id === form.leadId);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        visitType: form.visitType, status: form.isReschedule ? 'RESCHEDULED' : form.status,
        priority: form.priority,
        leadId: form.leadId, agentId: form.agentId,
        coAgentIds: form.coAgentIds,
        groupLeadIds: form.isGroupVisit ? form.groupLeadIds : [],
        project: form.project, tower: form.tower, floor: form.floor,
        unitNumber: form.unitNumber, meetingLocation: form.meetingLocation,
        meetingLink: form.meetingLink,
        visitDate: form.visitDate, visitTime: form.visitTime,
        durationMinutes: form.durationMinutes, notes: form.notes,
        tags: form.tags,
        rescheduleReason: form.isReschedule ? form.rescheduleReason : undefined,
        reminders: [
          form.sendReminderDay ? { minutesBefore: 1440, channels: form.reminderChannels } : null,
          form.sendReminderHour ? { minutesBefore: 60, channels: form.reminderChannels } : null,
        ].filter(Boolean),
      };
      if (isEdit) await api.put(`/site-visits/${initial!.id}`, payload);
      else await api.post('/site-visits', payload);
      onSave(); onClose();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const canSave = form.leadId && form.agentId && form.visitDate && form.visitTime &&
    (!form.isReschedule || form.rescheduleReason.trim().length > 0);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md"
      PaperProps={{ sx: { borderRadius: 4, maxHeight: '94vh', display: 'flex', flexDirection: 'column' } }}>

      {/* Header */}
      <Box sx={{ px: 3.5, pt: 3, pb: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 900, fontSize: '1.4rem' }}>
              {isEdit ? '✏️ Edit Site Visit' : '📅 Schedule Site Visit'}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {isEdit ? `Editing visit for ${initial?.lead.customerName}` : 'Create a new visit booking'}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ mt: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CloseOutlined fontSize="small" />
          </IconButton>
        </Stack>

        {/* Visit Type picker */}
        <Stack direction="row" spacing={1.5} mt={2.5} mb={0}>
          {Object.entries(VISIT_TYPE_CFG).map(([k, v]) => (
            <Box key={k} onClick={() => set('visitType', k)} sx={{ ...S.card(form.visitType === k, v.color), flex: 1 }}>
              <Typography fontSize={22} mb={0.5}>{v.icon}</Typography>
              <Typography variant="caption" fontWeight={800} sx={{ color: form.visitType === k ? v.color : 'text.secondary', display: 'block' }}>
                {v.label}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary' }}>{v.desc}</Typography>
            </Box>
          ))}
        </Stack>

        {/* Reschedule toggle */}
        {isEdit && (
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={<Switch checked={form.isReschedule} onChange={e => set('isReschedule', e.target.checked)} color="warning" size="small" />}
              label={<Typography variant="body2" fontWeight={700} color={form.isReschedule ? 'warning.main' : 'text.secondary'}>
                🔄 Mark as Rescheduled
              </Typography>}
            />
            <Collapse in={form.isReschedule}>
              <TextField fullWidth size="small" sx={{ mt: 1 }} label="Reschedule Reason *"
                value={form.rescheduleReason} onChange={e => set('rescheduleReason', e.target.value)}
                placeholder="e.g. Customer requested new date, Site maintenance..." />
            </Collapse>
          </Box>
        )}
      </Box>

      <Divider sx={{ mt: 2.5 }} />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 3.5, bgcolor: '#fafafa' }}
        TabIndicatorProps={{ sx: { height: 3, borderRadius: 2 } }}>
        {['📋 Details', '🏗 Property', '👥 Team & Group', '🔔 Reminders'].map((t, i) => (
          <Tab key={i} label={t} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.78rem', minHeight: 44 }} />
        ))}
      </Tabs>
      <Divider />

      <DialogContent sx={{ overflowY: 'auto', px: 3.5, py: 3 }}>

        {/* ── Tab 0: Visit Details ───────────────────────────────────────── */}
        {tab === 0 && (
          <Stack spacing={3}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography sx={S.label}>Lead / Customer *</Typography>
                <FormControl fullWidth size="small">
                  <Select value={form.leadId} displayEmpty onChange={e => set('leadId', e.target.value)}
                    sx={{ borderRadius: 2.5 }}
                    renderValue={v => v ? (leads.find(l => l.id === v)?.customerName ?? v) : <span style={{ color: '#9ca3af' }}>Select customer</span>}>
                    {leads.map(l => (
                      <MenuItem key={l.id} value={l.id}>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar sx={{ width: 28, height: 28, fontSize: 11, bgcolor: avatarColor(l.customerName), fontWeight: 800 }}>
                            {initials(l.customerName)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={700}>{l.customerName}</Typography>
                            <Typography variant="caption" color="text.secondary">{l.customerPhone}</Typography>
                          </Box>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {selectedLead && (
                  <Paper sx={{ mt: 1, p: 1.5, borderRadius: 2.5, bgcolor: '#f0fdf4', border: '1px solid #86efac' }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box>
                        {selectedLead.preferredProject && <Chip label={selectedLead.preferredProject} size="small" sx={{ fontSize: 10, height: 18, mr: 0.5 }} />}
                        {selectedLead.budget && <Chip label={`Budget: ₹${(selectedLead.budget / 100000).toFixed(0)}L`} size="small" sx={{ fontSize: 10, height: 18 }} />}
                      </Box>
                    </Stack>
                  </Paper>
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography sx={S.label}>Assigned Agent *</Typography>
                <FormControl fullWidth size="small">
                  <Select value={form.agentId} displayEmpty onChange={e => set('agentId', e.target.value)} sx={{ borderRadius: 2.5 }}
                    renderValue={v => v ? (agents.find(a => a.id === v)?.name ?? v) : <span style={{ color: '#9ca3af' }}>Select agent</span>}>
                    {agents.map(a => (
                      <MenuItem key={a.id} value={a.id}>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar sx={{ width: 28, height: 28, fontSize: 11, bgcolor: avatarColor(a.name), fontWeight: 800 }}>{initials(a.name)}</Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={700}>{a.name}</Typography>
                            {a.role && <Typography variant="caption" color="text.secondary">{a.role.name}</Typography>}
                          </Box>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={5}>
                <Typography sx={S.label}>Visit Date *</Typography>
                <TextField fullWidth size="small" type="date"
                  inputProps={{ min: todayStr() }} InputLabelProps={{ shrink: true }}
                  value={form.visitDate} onChange={e => set('visitDate', e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography sx={S.label}>Visit Time *</Typography>
                <FormControl fullWidth size="small">
                  <Select value={form.visitTime} onChange={e => set('visitTime', e.target.value)} sx={{ borderRadius: 2.5 }}>
                    {HOURS.map(h => <MenuItem key={h.value} value={h.value}>{h.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography sx={S.label}>Duration</Typography>
                <FormControl fullWidth size="small">
                  <Select value={form.durationMinutes} onChange={e => set('durationMinutes', e.target.value)} sx={{ borderRadius: 2.5 }}>
                    {DURATION_OPTIONS.map(d => <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography sx={S.label}>Priority</Typography>
                <Stack direction="row" spacing={1}>
                  {Object.entries(PRIORITY_CFG).map(([k, v]) => (
                    <Box key={k} onClick={() => set('priority', k)}
                      sx={{ ...S.card(form.priority === k, v.color), flex: 1, py: 1.5 }}>
                      <Typography fontSize={16}>{v.icon}</Typography>
                      <Typography variant="caption" fontWeight={800} sx={{ color: form.priority === k ? v.color : 'text.secondary' }}>
                        {v.label}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography sx={S.label}>Tags</Typography>
                <Stack direction="row" flexWrap="wrap" spacing={0.75}>
                  {VISIT_TAGS.map(t => (
                    <Chip key={t} label={t} size="small" clickable
                      variant={form.tags.includes(t) ? 'filled' : 'outlined'}
                      color={form.tags.includes(t) ? 'primary' : 'default'}
                      onClick={() => toggleArr('tags', t)}
                      sx={{ fontWeight: 700, fontSize: 10, my: 0.25 }} />
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        )}

        {/* ── Tab 1: Property & Location ─────────────────────────────────── */}
        {tab === 1 && (
          <Stack spacing={2.5}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography sx={S.label}>Project Name</Typography>
                <TextField fullWidth size="small" placeholder="e.g. Prestige Sunrise" value={form.project}
                  onChange={e => set('project', e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><ApartmentOutlined sx={{ fontSize: 16, color: '#9ca3af' }} /></InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography sx={S.label}>Tower / Block</Typography>
                <TextField fullWidth size="small" value={form.tower} onChange={e => set('tower', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography sx={S.label}>Floor</Typography>
                <TextField fullWidth size="small" value={form.floor} onChange={e => set('floor', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography sx={S.label}>Unit Number (Optional)</Typography>
                <TextField fullWidth size="small" value={form.unitNumber} placeholder="e.g. 402"
                  onChange={e => set('unitNumber', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
              </Grid>
              <Grid item xs={12} sm={8}>
                <Typography sx={S.label}>
                  {form.visitType === 'VIRTUAL' ? 'Meeting Link (Zoom / Google Meet)' : 'Meeting Location / Address'}
                </Typography>
                <TextField fullWidth size="small" multiline
                  value={form.visitType === 'VIRTUAL' ? form.meetingLink : form.meetingLocation}
                  onChange={e => set(form.visitType === 'VIRTUAL' ? 'meetingLink' : 'meetingLocation', e.target.value)}
                  placeholder={form.visitType === 'VIRTUAL' ? 'https://meet.google.com/...' : form.visitType === 'OFFICE' ? 'Office address...' : 'Site address or landmark...'}
                  InputProps={{ startAdornment: <InputAdornment position="start">{form.visitType === 'VIRTUAL' ? <VideoCallOutlined sx={{ fontSize: 16, color: '#9ca3af' }} /> : <LocationOnOutlined sx={{ fontSize: 16, color: '#9ca3af' }} />}</InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
              </Grid>
            </Grid>

            {form.visitType === 'ONSITE' && (
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: '#f8fafc' }}>
                <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
                  <MyLocationOutlined sx={{ color: '#10b981', fontSize: 20 }} />
                  <Typography variant="body2" fontWeight={800}>GPS Auto Check-in</Typography>
                  <Chip label="Recommended" size="small" sx={{ bgcolor: '#d1fae5', color: '#065f46', fontWeight: 700, fontSize: 10, height: 18 }} />
                </Stack>
                <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
                  When GPS is enabled, the agent's location will be auto-verified when they tap "Start Visit".
                  This confirms the agent actually reached the site and logs precise arrival time.
                </Typography>
                <Stack direction="row" spacing={1.5} flexWrap="wrap">
                  {['Auto verify on arrival', 'Log exact arrival time', 'Timestamp in visit report'].map(f => (
                    <Stack key={f} direction="row" alignItems="center" spacing={0.5}>
                      <CheckCircleOutlined sx={{ fontSize: 13, color: '#10b981' }} />
                      <Typography variant="caption" fontWeight={600}>{f}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Paper>
            )}

            <Box>
              <Typography sx={S.label}>Pre-visit Notes for Agent</Typography>
              <TextField fullWidth multiline rows={3} size="small"
                value={form.notes} onChange={e => set('notes', e.target.value)}
                placeholder="What to highlight, customer's specific interest, special instructions..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
            </Box>
          </Stack>
        )}

        {/* ── Tab 2: Group & Co-Agents ───────────────────────────────────── */}
        {tab === 2 && (
          <Stack spacing={3}>
            {/* Co-agents */}
            <Box>
              <Typography sx={S.sectionTitle}>Co-Agents / Support Staff</Typography>
              <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                Add additional agents who will accompany or assist during this visit
              </Typography>
              <Grid container spacing={1.25}>
                {agents.filter(a => a.id !== form.agentId).map(a => {
                  const sel = form.coAgentIds.includes(a.id);
                  return (
                    <Grid item xs={12} sm={6} key={a.id}>
                      <Box onClick={() => toggleArr('coAgentIds', a.id)}
                        sx={{
                          p: 1.75, borderRadius: 3, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1.5,
                          border: '1.5px solid', transition: 'all .12s',
                          borderColor: sel ? '#10b981' : '#e5e7eb', bgcolor: sel ? '#f0fdf4' : '#fff',
                        }}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: 12, bgcolor: sel ? '#10b981' : avatarColor(a.name), fontWeight: 800 }}>
                          {initials(a.name)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight={700}>{a.name}</Typography>
                          {a.role && <Typography variant="caption" color="text.secondary">{a.role.name}</Typography>}
                        </Box>
                        {sel && <CheckCircleOutlined sx={{ color: '#10b981', fontSize: 18 }} />}
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>

            <Divider />

            {/* Group Visit */}
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
                <Box>
                  <Typography sx={S.sectionTitle}>Group Visit</Typography>
                  <Typography variant="caption" color="text.secondary">Bring multiple customers to the same visit</Typography>
                </Box>
                <Switch checked={form.isGroupVisit} onChange={e => set('isGroupVisit', e.target.checked)} color="primary" />
              </Stack>

              {form.isGroupVisit && (
                <>
                  {form.groupLeadIds.length > 0 && (
                    <Alert severity="info" sx={{ mb: 2, borderRadius: 3 }}>
                      <strong>{form.groupLeadIds.length + 1} customers</strong> in this group visit
                    </Alert>
                  )}
                  <Grid container spacing={1.25}>
                    {leads.filter(l => l.id !== form.leadId).map(l => {
                      const sel = form.groupLeadIds.includes(l.id);
                      return (
                        <Grid item xs={12} sm={6} key={l.id}>
                          <Box onClick={() => toggleArr('groupLeadIds', l.id)}
                            sx={{
                              p: 1.75, borderRadius: 3, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1.5,
                              border: '1.5px solid', transition: 'all .12s',
                              borderColor: sel ? '#6366f1' : '#e5e7eb', bgcolor: sel ? '#eef2ff' : '#fff',
                            }}>
                            <Avatar sx={{ width: 32, height: 32, fontSize: 12, bgcolor: sel ? '#6366f1' : avatarColor(l.customerName), fontWeight: 800 }}>
                              {initials(l.customerName)}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" fontWeight={700}>{l.customerName}</Typography>
                              <Typography variant="caption" color="text.secondary">{l.customerPhone}</Typography>
                            </Box>
                            {sel && <CheckCircleOutlined sx={{ color: '#6366f1', fontSize: 18 }} />}
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </>
              )}
            </Box>
          </Stack>
        )}

        {/* ── Tab 3: Reminders ──────────────────────────────────────────── */}
        {tab === 3 && (
          <Stack spacing={3}>
            <Box>
              <Typography sx={S.sectionTitle}>Reminder Schedule</Typography>
              <Stack spacing={2}>
                {[
                  { k: 'sendReminderDay', label: '24 hours before', sub: 'Day-before reminder sent to agent & customer', icon: '📅' },
                  { k: 'sendReminderHour', label: '1 hour before', sub: 'Last-minute reminder with visit details', icon: '⏰' },
                ].map(r => (
                  <Paper key={r.k} variant="outlined" sx={{
                    p: 2.5, borderRadius: 3,
                    bgcolor: (form as any)[r.k] ? '#fafff7' : '#fafafa',
                    borderColor: (form as any)[r.k] ? '#86efac' : '#e5e7eb',
                  }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Typography fontSize={22}>{r.icon}</Typography>
                        <Box>
                          <Typography variant="body2" fontWeight={800}>{r.label}</Typography>
                          <Typography variant="caption" color="text.secondary">{r.sub}</Typography>
                        </Box>
                      </Stack>
                      <Switch checked={(form as any)[r.k]} onChange={e => set(r.k, e.target.checked)} color="success" />
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography sx={S.sectionTitle}>Notification Channels</Typography>
              <Grid container spacing={1.25}>
                {[
                  { k: 'APP', label: 'In-App', icon: '🔔', color: '#6366f1' },
                  { k: 'EMAIL', label: 'Email', icon: '📧', color: '#0ea5e9' },
                  { k: 'SMS', label: 'SMS', icon: '📱', color: '#10b981' },
                  { k: 'WHATSAPP', label: 'WhatsApp', icon: '💬', color: '#25d366' },
                ].map(c => {
                  const sel = form.reminderChannels.includes(c.k);
                  return (
                    <Grid item xs={6} sm={3} key={c.k}>
                      <Box onClick={() => toggleArr('reminderChannels', c.k)}
                        sx={{ ...S.card(sel, c.color), py: 2 }}>
                        <Typography fontSize={24} mb={0.5}>{c.icon}</Typography>
                        <Typography variant="caption" fontWeight={800} sx={{ color: sel ? c.color : 'text.secondary' }}>
                          {c.label}
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>

            {/* Summary */}
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: '#f8fafc' }}>
              <Typography variant="body2" fontWeight={800} mb={1.5}>📋 Reminder Summary</Typography>
              <Stack spacing={0.75}>
                {form.sendReminderDay && (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CheckCircleOutlined sx={{ fontSize: 14, color: '#10b981' }} />
                    <Typography variant="caption">24h before — {form.reminderChannels.join(', ')}</Typography>
                  </Stack>
                )}
                {form.sendReminderHour && (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CheckCircleOutlined sx={{ fontSize: 14, color: '#10b981' }} />
                    <Typography variant="caption">1h before — {form.reminderChannels.join(', ')}</Typography>
                  </Stack>
                )}
                {!form.sendReminderDay && !form.sendReminderHour && (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <ErrorOutlined sx={{ fontSize: 14, color: '#f59e0b' }} />
                    <Typography variant="caption" color="text.secondary">No reminders scheduled</Typography>
                  </Stack>
                )}
              </Stack>
            </Paper>
          </Stack>
        )}
      </DialogContent>

      <Divider />
      <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1}>
          <Button disabled={tab === 0} onClick={() => setTab(t => t - 1)} sx={{ textTransform: 'none', borderRadius: 2 }}>← Back</Button>
          <Button disabled={tab === 3} onClick={() => setTab(t => t + 1)} sx={{ textTransform: 'none', borderRadius: 2 }}>Next →</Button>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" disableElevation onClick={handleSave} disabled={saving || !canSave}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2.5, px: 3.5 }}>
            {saving ? <CircularProgress size={18} color="inherit" />
              : form.isReschedule ? '🔄 Reschedule Visit'
                : isEdit ? 'Save Changes' : '📅 Schedule Visit'}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default ScheduleVisitDialog;