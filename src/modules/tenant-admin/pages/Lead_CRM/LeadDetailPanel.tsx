import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Stack, Button, Chip, Paper, Grid, Divider,
  IconButton, Avatar, CircularProgress, TextField, Select,
  MenuItem, FormControl, InputLabel, Dialog, DialogTitle,
  DialogContent, DialogActions, Tab, Tabs, Tooltip, Badge,
  LinearProgress, Alert
} from '@mui/material';
import {
  CloseOutlined, PhoneOutlined, EmailOutlined, WhatsApp,
  EditOutlined, AddOutlined, SendOutlined, AttachFileOutlined,
  CheckCircleOutlined, AccessTimeOutlined, PersonAddOutlined,
  NotesOutlined, TimelineOutlined, CalendarTodayOutlined,
  FolderOutlined, SwapHorizOutlined, LocalFireDepartmentOutlined,
  LocationOnOutlined, TrendingUpOutlined, AssignmentOutlined, SpeedOutlined, EmojiEventsOutlined,
  TimelineOutlined as TimelineIcon
} from '@mui/icons-material';
import {
  Timeline, TimelineItem, TimelineSeparator, TimelineConnector,
  TimelineContent, TimelineDot
} from '@mui/lab';
import {
  Lead, FollowUp, FollowUpType, ActivityLog, LeadStatus, Agent,
  PIPELINE_STAGES, STAGE_MAP, PRIORITY_CFG, SOURCE_CFG, AgentStats,
  FOLLOWUP_CFG, ACTIVITY_ICONS, avatarColor, initials,
  fmtBudget, timeAgo, scoreColor
} from './crmTypes';
import api from '../../../../api/axios';

// StageChanger is defined locally in this file and LeadsPage.tsx
const StageChanger = ({ lead, onUpdate }: { lead: Lead; onUpdate: () => void }) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const stageCfg = STAGE_MAP[lead.status] ?? STAGE_MAP.NEW;

  const changeStage = async (newStatus: LeadStatus) => {
    setSaving(true);
    try {
      await api.put(`/leads/${lead.id}`, { status: newStatus });
      onUpdate();
    } catch (e) { console.error(e); }
    finally { setSaving(false); setOpen(false); }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Chip
        label={`${stageCfg.icon} ${stageCfg.label}`}
        onClick={() => setOpen(v => !v)}
        deleteIcon={<SwapHorizOutlined sx={{ fontSize: '16px !important' }} />}
        onDelete={() => setOpen(v => !v)}
        sx={{
          fontWeight: 800, bgcolor: stageCfg.bg, color: stageCfg.color, cursor: 'pointer',
          '& .MuiChip-deleteIcon': { color: stageCfg.color }
        }}
      />
      {open && (
        <Paper sx={{ position: 'absolute', top: '110%', left: 0, zIndex: 100, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,.18)', minWidth: 200, p: 0.75 }}>
          {PIPELINE_STAGES.map(s => (
            <Box key={s.key}
              onClick={() => changeStage(s.key as LeadStatus)}
              sx={{
                px: 2, py: 1.25, borderRadius: 2, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1.5,
                bgcolor: lead.status === s.key ? s.bg : 'transparent',
                '&:hover': { bgcolor: s.bg },
              }}>
              <span>{s.icon}</span>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color }} />
              <Typography variant="body2" fontWeight={700} sx={{ color: s.color }}>{s.label}</Typography>
              {lead.status === s.key && <CheckCircleOutlined sx={{ fontSize: 14, color: s.color, ml: 'auto' }} />}
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  );
};

// ─── Add Follow-up Dialog ─────────────────────────────────────────────────────
const AddFollowUpDialog = ({
  leadId, open, onClose, onSave,
}: { leadId: string; open: boolean; onClose: () => void; onSave: () => void }) => {
  const [form, setForm] = useState({ type: 'CALL' as FollowUpType, notes: '', scheduledAt: '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post(`/leads/${leadId}/followups`, form);
      onSave(); onClose();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between' }}>
        Schedule Follow-up <IconButton size="small" onClick={onClose}><CloseOutlined /></IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {/* Type selector */}
          <Box>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Follow-up Type
            </Typography>
            <Grid container spacing={1}>
              {Object.entries(FOLLOWUP_CFG).map(([k, v]) => (
                <Grid item xs={4} key={k}>
                  <Box onClick={() => setForm(f => ({ ...f, type: k as FollowUpType }))}
                    sx={{
                      p: 1.25, borderRadius: 3, textAlign: 'center', cursor: 'pointer',
                      border: '2px solid', transition: 'all .12s',
                      borderColor: form.type === k ? v.color : 'divider',
                      bgcolor: form.type === k ? v.color + '18' : 'background.paper',
                    }}>
                    <Typography fontSize={18}>{v.icon}</Typography>
                    <Typography variant="caption" fontWeight={700} sx={{ color: form.type === k ? v.color : 'text.secondary', fontSize: 10 }}>
                      {v.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
          <TextField fullWidth label="Scheduled Date & Time" size="small" type="datetime-local"
            InputLabelProps={{ shrink: true }} value={form.scheduledAt}
            onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))} />
          <TextField fullWidth label="Notes" size="small" multiline rows={3}
            placeholder="What to discuss, customer status..."
            value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </Stack>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none' }}>Cancel</Button>
        <Button variant="contained" disableElevation onClick={handleSave} disabled={saving || !form.scheduledAt}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
          {saving ? <CircularProgress size={18} color="inherit" /> : 'Schedule'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};// ─── Agent Profile Dialog ─────────────────────────────────────────────────────
const AgentProfileDialog = ({
  agent, open, onClose
}: { agent: Agent | null; open: boolean; onClose: () => void }) => {
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && agent) {
      setLoading(true);
      api.get(`/leads/agent-stats/${agent.id}`)
        .then(r => setStats(r.data.data ?? r.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [open, agent]);

  if (!agent) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Agent Performance <IconButton size="small" onClick={onClose}><CloseOutlined /></IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Stack spacing={3} sx={{ py: 1 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={agent.avatarUrl} sx={{ width: 64, height: 64, bgcolor: avatarColor(agent.name), fontSize: 24, fontWeight: 900 }}>
              {initials(agent.name)}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={900}>{agent.name}</Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                {typeof agent.role === 'string' ? agent.role : agent.role?.name || 'Agent'}
              </Typography>
            </Box>
          </Stack>

          {loading ? (
            <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress size={24} /></Box>
          ) : stats ? (
            <Grid container spacing={2}>
              {[
                { label: 'Total Leads', value: stats.totalLeads, icon: <AssignmentOutlined />, color: '#6366f1' },
                { label: 'Conversion', value: `${stats.conversionRate}%`, icon: <TrendingUpOutlined />, color: '#10b981' },
                { label: 'Hot Leads', value: stats.hotLeads, icon: <LocalFireDepartmentOutlined />, color: '#ef4444' },
                { label: 'Completed', value: stats.completedFollowUps, icon: <CheckCircleOutlined />, color: '#8b5cf6' },
              ].map(item => (
                <Grid item xs={6} key={item.label}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, textAlign: 'center', height: '100%', borderColor: item.color + '33', bgcolor: item.color + '08' }}>
                    <Box sx={{ color: item.color, mb: 1, display: 'flex', justifyContent: 'center' }}>{item.icon}</Box>
                    <Typography variant="h5" fontWeight={900}>{item.value}</Typography>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">{item.label}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : <Alert severity="error">Failed to load stats</Alert>}

          <Box>
            <Typography variant="subtitle2" fontWeight={800} gutterBottom>Agent Quick Stats</Typography>
            <Box sx={{ mt: 1 }}>
              <Stack direction="row" justifyContent="space-between" mb={0.5}>
                <Typography variant="caption" fontWeight={700}>Target Achievement</Typography>
                <Typography variant="caption" fontWeight={700}>75%</Typography>
              </Stack>
              <LinearProgress variant="determinate" value={75} sx={{ height: 6, borderRadius: 3, bgcolor: 'grey.100' }} />
            </Box>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button fullWidth variant="contained" disableElevation onClick={onClose} sx={{ borderRadius: 2, py: 1, fontWeight: 700 }}>Close View</Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Add Note ─────────────────────────────────────────────────────────────────
const AddNoteBox = ({ leadId, onSave }: { leadId: string; onSave: () => void }) => {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!note.trim()) return;
    setSaving(true);
    try {
      await api.post(`/leads/${leadId}/activities`, { type: 'NOTE_ADDED', description: note });
      setNote(''); onSave();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <Stack direction="row" spacing={1} alignItems="flex-end">
      <TextField fullWidth multiline maxRows={4} size="small"
        placeholder="Add a note, update, or interaction log..."
        value={note} onChange={e => setNote(e.target.value)}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
      <IconButton onClick={handleSave} disabled={saving || !note.trim()}
        sx={{
          bgcolor: 'primary.main', color: '#fff', borderRadius: 2, p: 1.25,
          '&:hover': { bgcolor: 'primary.dark' }, '&:disabled': { bgcolor: 'grey.200' }
        }}>
        {saving ? <CircularProgress size={18} color="inherit" /> : <SendOutlined fontSize="small" />}
      </IconButton>
    </Stack>
  );
};

// ─── Lead Detail Panel ────────────────────────────────────────────────────────
interface Props {
  leadId: string | null;
  onClose: () => void;
  onUpdate: () => void;
  onEdit: (l: Lead) => void;
}

const LeadDetailPanel: React.FC<Props> = ({ leadId, onClose, onUpdate, onEdit }) => {
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [agentStatsOpen, setAgentStatsOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const handleAgentClick = (agent: Agent) => {
    setSelectedAgent(agent);
    setAgentStatsOpen(true);
  };

  const fetchLead = async () => {
    if (!leadId) return;
    setLoading(true);
    try {
      const r = await api.get(`/leads/${leadId}`);
      setLead(r.data.data ?? r.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (leadId) { setLoading(true); fetchLead(); setTab(0); } }, [leadId]);

  const handleStageUpdate = () => { fetchLead(); onUpdate(); };

  if (!leadId) return null;

  if (loading || !lead) return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <CircularProgress />
    </Box>
  );

  const priority = PRIORITY_CFG[lead.priority] ?? PRIORITY_CFG.WARM;
  const pendingFollowUps = (lead.followUps ?? []).filter(f => f.status === 'PENDING').length;
  const stageIdx = PIPELINE_STAGES.findIndex(s => s.key === lead.status);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* ── Header ── */}
      <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
        <Stack direction="row" alignItems="flex-start" spacing={2}>
          <Avatar src={lead.photoUrl} sx={{ width: 52, height: 52, bgcolor: avatarColor(lead.customerName), fontSize: 18, fontWeight: 900 }}>
            {initials(lead.customerName)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
              <Typography variant="h6" fontWeight={900}>{lead.customerName}</Typography>
              <Chip label={`${priority.icon} ${priority.label}`} size="small"
                sx={{ bgcolor: priority.bg, color: priority.color, fontWeight: 800, fontSize: 10 }} />
              {lead.score !== undefined && (
                <Chip label={`Score: ${lead.score}`} size="small"
                  sx={{ bgcolor: scoreColor(lead.score) + '22', color: scoreColor(lead.score), fontWeight: 800, fontSize: 10 }} />
              )}
            </Stack>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: 'text.secondary' }}>
                <PhoneOutlined sx={{ fontSize: 14 }} />
                <Typography variant="caption">{lead.customerPhone}</Typography>
              </Stack>
              {lead.customerEmail && (
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: 'text.secondary' }}>
                  <EmailOutlined sx={{ fontSize: 14 }} />
                  <Typography variant="caption">{lead.customerEmail}</Typography>
                </Stack>
              )}
              {lead.locationPreference && (
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: 'text.secondary' }}>
                  <LocationOnOutlined sx={{ fontSize: 14 }} />
                  <Typography variant="caption">{lead.locationPreference}</Typography>
                </Stack>
              )}
            </Stack>
            <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
              <StageChanger lead={lead} onUpdate={handleStageUpdate} />
              {(lead.tags ?? []).map(tag => (
                <Chip key={tag} label={tag} size="small"
                  sx={{ fontWeight: 700, fontSize: 10, height: 20 }} />
              ))}
            </Stack>
          </Box>
          <Stack spacing={0.75}>
            <IconButton size="small" onClick={() => onEdit(lead)} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <EditOutlined fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={onClose} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <CloseOutlined fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>

        {/* Quick action buttons */}
        <Stack direction="row" spacing={1} mt={2}>
          <Button size="small" variant="outlined" startIcon={<PhoneOutlined sx={{ fontSize: 14 }} />}
            component="a" href={`tel:${lead.customerPhone}`}
            sx={{ textTransform: 'none', borderRadius: 2, fontSize: 12, fontWeight: 700 }}>Call</Button>
          <Button size="small" variant="outlined" startIcon={<span style={{ fontSize: 14 }}>💬</span>}
            component="a" href={`https://wa.me/${lead.customerPhone?.replace(/[^0-9]/g, '')}`} target="_blank"
            sx={{ textTransform: 'none', borderRadius: 2, fontSize: 12, fontWeight: 700 }}>WhatsApp</Button>
          <Button size="small" variant="outlined" startIcon={<CalendarTodayOutlined sx={{ fontSize: 14 }} />}
            onClick={() => setFollowUpOpen(true)}
            sx={{ textTransform: 'none', borderRadius: 2, fontSize: 12, fontWeight: 700 }}>
            Follow-up {pendingFollowUps > 0 && `(${pendingFollowUps})`}
          </Button>
          {lead.customerEmail && (
            <Button size="small" variant="outlined" startIcon={<EmailOutlined sx={{ fontSize: 14 }} />}
              component="a" href={`mailto:${lead.customerEmail}`}
              sx={{ textTransform: 'none', borderRadius: 2, fontSize: 12, fontWeight: 700 }}>Email</Button>
          )}
        </Stack>

        {/* Pipeline progress */}
        <Box mt={2.5}>
          <Stack direction="row" spacing={0.4}>
            {PIPELINE_STAGES.filter(s => s.key !== 'LOST').map((s, i) => {
              const isCurrent = s.key === lead.status;
              const isPast = i <= stageIdx && lead.status !== 'LOST';
              return (
                <Tooltip key={s.key} title={s.label}>
                  <Box sx={{
                    flex: 1, height: 6, borderRadius: 2,
                    bgcolor: isPast ? s.color : 'grey.200',
                    outline: isCurrent ? `2px solid ${s.color}` : 'none',
                    outlineOffset: 1, transition: 'all .25s'
                  }} />
                </Tooltip>
              );
            })}
          </Stack>
        </Box>
      </Box>

      {/* ── Quick Info Strip ── */}
      <Box sx={{ px: 3, py: 1.5, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
        <Stack direction="row" spacing={3} flexWrap="wrap">
          {[
            { label: 'Budget', value: lead.budget ? `${fmtBudget(lead.budget)}${lead.budgetMax ? ` – ${fmtBudget(lead.budgetMax)}` : ''}` : '—' },
            { label: 'Project', value: lead.preferredProject || '—' },
            { label: 'Unit Type', value: lead.preferredUnitType || '—' },
            { label: 'Timeline', value: lead.buyingTimeline || '—' },
            { label: 'Source', value: SOURCE_CFG[lead.sourceChannel]?.label ?? lead.sourceChannel },
            { 
              label: 'Assigned Agent', 
              value: (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ cursor: 'pointer' }} onClick={() => lead.ownerAgent && handleAgentClick(lead.ownerAgent)}>
                  <Avatar src={lead.ownerAgent?.avatarUrl} sx={{ width: 18, height: 18, bgcolor: avatarColor(lead.ownerAgent?.name ?? ''), fontSize: 8 }}>
                    {initials(lead.ownerAgent?.name ?? '?')}
                  </Avatar>
                  <Typography variant="body2" fontWeight={800} sx={{ textDecoration: 'underline', color: 'primary.main' }}>
                    {lead.ownerAgent?.name ?? 'Unassigned'}
                  </Typography>
                </Stack>
              )
            },
          ].map(item => (
            <Box key={item.label}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}
                sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 9 }}>{item.label}</Typography>
              {typeof item.value === 'string' ? (
                <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.2 }}>{item.value}</Typography>
              ) : (
                item.value
              )}
            </Box>
          ))}
        </Stack>
      </Box>

      {/* ── Detailed Lead Profile ── */}
      <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={4}>
            <Typography variant="caption" color="text.secondary">Requirement Purpose</Typography>
            <Typography variant="body2" fontWeight={700}>
              {lead.purpose === 'INVESTMENT' ? '💰 Investment' : lead.purpose === 'SELF_USE' ? '🏠 Self-Use' : lead.purpose === 'RENTAL' ? '🔑 Rental Income' : '—'}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={4}>
            <Typography variant="caption" color="text.secondary">Family Size</Typography>
            <Typography variant="body2" fontWeight={700}>{lead.familySize || '—'}</Typography>
          </Grid>
          <Grid item xs={6} sm={4}>
            <Typography variant="caption" color="text.secondary">Loan Requirement</Typography>
            <Typography variant="body2" fontWeight={700}>{lead.loanRequired ? '✅ Required' : '❌ Not Required'}</Typography>
          </Grid>
        </Grid>
      </Box>

      {/* ── Tabs ── */}
      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          {[
            { label: 'Timeline', badge: 0 },
            { label: 'Follow-ups', badge: pendingFollowUps },
            { label: 'Notes', badge: 0 },
            { label: 'Documents', badge: lead.documents?.length ?? 0 },
          ].map((t, i) => (
            <Tab key={i}
              label={
                t.badge > 0
                  ? <Badge badgeContent={t.badge} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: 9 } }}>{t.label}</Badge>
                  : t.label
              }
              sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12, minHeight: 42 }}
            />
          ))}
        </Tabs>
      </Box>

      {/* ── Tab Content ── */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>
        {/* ── Timeline ── */}
        {tab === 0 && (
          <Stack spacing={0}>
            <AddNoteBox leadId={lead.id} onSave={fetchLead} />
            <Box sx={{ mt: 3 }}>
              {(lead.activities ?? []).length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  <TimelineIcon sx={{ fontSize: 40, opacity: 0.2, mb: 1 }} />
                  <Typography variant="body2">No activity yet</Typography>
                </Box>
              ) : (
                <Timeline sx={{ p: 0, m: 0 }}>
                  {(lead.activities ?? []).slice().reverse().map((act, i) => (
                    <TimelineItem key={act.id} sx={{ '&:before': { display: 'none' }, minHeight: 70 }}>
                      <TimelineSeparator>
                        <TimelineDot sx={{ bgcolor: 'grey.100', p: 1, m: 0 }}>
                          <Typography fontSize={14}>{ACTIVITY_ICONS[act.type] ?? '📌'}</Typography>
                        </TimelineDot>
                        {i < (lead.activities ?? []).length && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent sx={{ py: 0, px: 2 }}>
                        <Typography variant="body2" fontWeight={600}>{act.activity}</Typography>
                        {act.content && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {act.content}
                          </Typography>
                        )}
                        <Stack direction="row" spacing={1} mt={0.25}>
                          <Typography variant="caption" color="text.secondary">{timeAgo(act.performedAt)}</Typography>
                          {act.user && (
                            <Typography variant="caption" color="text.secondary">· {act.user.name}</Typography>
                          )}
                        </Stack>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                  <TimelineItem sx={{ '&:before': { display: 'none' } }}>
                    <TimelineSeparator>
                      <TimelineDot sx={{ bgcolor: '#eef2ff', p: 1, m: 0 }}>
                        <Typography fontSize={14}>✨</Typography>
                      </TimelineDot>
                    </TimelineSeparator>
                    <TimelineContent sx={{ py: 0, px: 2 }}>
                      <Typography variant="body2" fontWeight={600}>Lead created</Typography>
                      <Typography variant="caption" color="text.secondary">{timeAgo(lead.createdAt)}</Typography>
                    </TimelineContent>
                  </TimelineItem>
                </Timeline>
              )}
            </Box>
          </Stack>
        )}

        {/* ── Follow-ups ── */}
        {tab === 1 && (
          <Stack spacing={2}>
            <Button variant="outlined" startIcon={<AddOutlined />}
              onClick={() => setFollowUpOpen(true)}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 3 }}>
              Schedule Follow-up
            </Button>
            {(lead.followUps ?? []).length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                <CalendarTodayOutlined sx={{ fontSize: 40, opacity: 0.2, mb: 1 }} />
                <Typography variant="body2">No follow-ups scheduled</Typography>
              </Box>
            ) : (
              (lead.followUps ?? []).map(fu => {
                const fuCfg = FOLLOWUP_CFG[fu.type];
                const isPending = fu.status === 'PENDING';
                const isOverdue = isPending && new Date(fu.scheduledAt) < new Date();
                return (
                  <Paper key={fu.id} variant="outlined" sx={{
                    p: 2, borderRadius: 3,
                    borderColor: isOverdue ? '#ef4444' : fuCfg.color + '44',
                    bgcolor: isOverdue ? '#fef2f2' : fuCfg.color + '08'
                  }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Typography fontSize={20}>{fuCfg.icon}</Typography>
                        <Box>
                          <Typography variant="body2" fontWeight={800}>{fuCfg.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(fu.scheduledAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </Box>
                      </Stack>
                      <Chip
                        label={isOverdue ? '⚠ Overdue' : fu.status}
                        size="small"
                        sx={{
                          fontWeight: 800, fontSize: 9,
                          bgcolor: isOverdue ? '#fee2e2' : isPending ? '#fef3c7' : '#d1fae5',
                          color: isOverdue ? '#ef4444' : isPending ? '#f59e0b' : '#10b981',
                        }}
                      />
                    </Stack>
                    {fu.notes && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {fu.notes}
                      </Typography>
                    )}
                    {isPending && (
                      <Button size="small" variant="outlined" sx={{ mt: 1.5, textTransform: 'none', borderRadius: 2, fontSize: 11 }}
                        onClick={async () => {
                          try {
                            await api.put(`/leads/${lead.id}/followups/${fu.id}`, { status: 'COMPLETED' });
                            fetchLead();
                          } catch (e) { console.error(e); }
                        }}>
                        Mark Done
                      </Button>
                    )}
                  </Paper>
                );
              })
            )}
          </Stack>
        )}

        {/* ── Notes ── */}
        {tab === 2 && (
          <Stack spacing={2}>
            <AddNoteBox leadId={lead.id} onSave={fetchLead} />
            {(lead.activities ?? []).filter(a => a.type === 'NOTE_ADDED').map(note => (
              <Paper key={note.id} variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: '#fefce8', borderColor: '#fde047' }}>
                <Typography variant="body2">{note.description}</Typography>
                <Stack direction="row" spacing={1} mt={0.75}>
                  <Typography variant="caption" color="text.secondary">{timeAgo(note.createdAt)}</Typography>
                  {note.createdBy && <Typography variant="caption" color="text.secondary">· {note.createdBy.name}</Typography>}
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}

        {/* ── Documents ── */}
        {tab === 3 && (
          <Stack spacing={2}>
            <Button variant="outlined" startIcon={<AttachFileOutlined />}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 3 }}>
              Upload Document
            </Button>
            {(lead.documents ?? []).length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                <FolderOutlined sx={{ fontSize: 40, opacity: 0.2, mb: 1 }} />
                <Typography variant="body2">No documents uploaded</Typography>
              </Box>
            ) : (
              (lead.documents ?? []).map(doc => (
                <Paper key={doc.id} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Box sx={{
                        width: 36, height: 36, borderRadius: 2, bgcolor: '#eef2ff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
                      }}>📄</Box>
                      <Box>
                        <Typography variant="body2" fontWeight={700}>{doc.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{doc.type} · {timeAgo(doc.uploadedAt)}</Typography>
                      </Box>
                    </Stack>
                    <Button size="small" component="a" href={doc.url} target="_blank"
                      sx={{ textTransform: 'none', borderRadius: 2, fontSize: 11 }}>View</Button>
                  </Stack>
                </Paper>
              ))
            )}
          </Stack>
        )}
      </Box>

      <AddFollowUpDialog
        leadId={lead.id} open={followUpOpen}
        onClose={() => setFollowUpOpen(false)} onSave={fetchLead}
      />

      <AgentProfileDialog
        agent={selectedAgent} open={agentStatsOpen}
        onClose={() => setAgentStatsOpen(false)}
      />
    </Box>
  );
};

export default LeadDetailPanel;