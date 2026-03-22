import React, { useState } from 'react';
import {
  Box, Typography, Stack, Button, Chip, IconButton,
  Paper, Divider, Avatar, TextField, FormControl,
  InputLabel, Select, MenuItem, Switch, FormControlLabel,
  Grid, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Alert, Tabs, Tab, InputAdornment
} from '@mui/material';
import {
  AddOutlined, CloseOutlined, SendOutlined,
  PushPinOutlined, ArchiveOutlined, MarkEmailReadOutlined,
  AnnouncementOutlined, FeedOutlined, SettingsOutlined,
  HistoryOutlined, NotificationsActiveOutlined, ScheduleOutlined
} from '@mui/icons-material';
import {
  Announcement, ActivityFeedItem, NotificationPreferences,
  CommunicationLog, EscalationRecord,
  AnnouncementAudience, NotifChannel,
  NOTIF_TYPE_CFG, NOTIF_CATEGORY_CFG, AUDIENCE_CFG, CHANNEL_CFG,
  timeAgo, formatDate, avatarColor, initials
} from './notifTypes';
import api from '../../../../api/axios';

// ─── Announcements Page ───────────────────────────────────────────────────────

export const AnnouncementsPage: React.FC<{
  announcements: Announcement[];
  currentRole: string;
  onRefresh: () => void;
}> = ({ announcements, currentRole, onRefresh }) => {
  const [createOpen, setCreateOpen] = useState(false);
  const isAdmin = currentRole === 'ADMIN' || currentRole === 'TENANT_ADMIN';

  const pinned = announcements.filter(a => a.pinned);
  const recent = announcements.filter(a => !a.pinned);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '2rem', letterSpacing: -1.5, color: '#0f172a' }}>
            Announcements
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Company-wide broadcasts and team notices
          </Typography>
        </Box>
        {isAdmin && (
          <Button variant="contained" disableElevation startIcon={<AddOutlined />}
            onClick={() => setCreateOpen(true)}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 3, px: 2.5 }}>
            Create Announcement
          </Button>
        )}
      </Stack>

      {/* Pinned */}
      {pinned.length > 0 && (
        <Box mb={4}>
          <Typography sx={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, color: '#9ca3af', mb: 1.5 }}>
            📌 Pinned
          </Typography>
          <Stack spacing={2}>
            {pinned.map(a => (
              <AnnouncementCard key={a.id} announcement={a} isAdmin={isAdmin} onRefresh={onRefresh} />
            ))}
          </Stack>
        </Box>
      )}

      {/* Recent */}
      <Typography sx={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, color: '#9ca3af', mb: 1.5 }}>
        Recent
      </Typography>
      {recent.length === 0 && pinned.length === 0 ? (
        <Box sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
          <Typography fontSize={48} mb={2}>📢</Typography>
          <Typography variant="h6" fontWeight={700}>No announcements yet</Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {recent.map(a => (
            <AnnouncementCard key={a.id} announcement={a} isAdmin={isAdmin} onRefresh={onRefresh} />
          ))}
        </Stack>
      )}

      {/* Create Dialog */}
      <CreateAnnouncementDialog open={createOpen} onClose={() => setCreateOpen(false)} onSave={onRefresh} />
    </Box>
  );
};

const AnnouncementCard: React.FC<{ announcement: Announcement; isAdmin: boolean; onRefresh: () => void }> = ({ announcement: a, isAdmin, onRefresh }) => {
  const audienceCfg = AUDIENCE_CFG[a.audience];
  const isUrgent = a.priority === 'URGENT';
  const readPct = a.totalRecipients > 0 ? Math.round(a.readCount / a.totalRecipients * 100) : 0;

  return (
    <Paper variant="outlined" sx={{
      borderRadius: 3.5, overflow: 'hidden',
      border: `1.5px solid ${isUrgent ? '#fca5a5' : a.pinned ? '#c7d2fe' : '#e5e7eb'}`,
      transition: 'all .2s',
      '&:hover': { boxShadow: `0 8px 24px ${isUrgent ? '#ef444415' : '#6366f115'}` }
    }}>
      {isUrgent && (
        <Box sx={{ px: 3, py: 1, bgcolor: '#ef4444', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ color: '#fff', fontSize: 12, fontWeight: 800 }}>🚨 URGENT ANNOUNCEMENT</Typography>
        </Box>
      )}
      <Box sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
          <Box sx={{ flex: 1, pr: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1.5} mb={0.75}>
              {a.pinned && <PushPinOutlined sx={{ fontSize: 14, color: '#6366f1' }} />}
              <Typography variant="h6" fontWeight={800} sx={{ color: '#0f172a' }}>{a.title}</Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
              <Chip label={`${audienceCfg.icon} ${audienceCfg.label}`} size="small"
                sx={{ bgcolor: audienceCfg.color + '15', color: audienceCfg.color, fontWeight: 800, fontSize: 10, height: 20 }} />
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Avatar sx={{ width: 18, height: 18, fontSize: 8, bgcolor: avatarColor(a.createdBy.name), fontWeight: 800 }}>
                  {initials(a.createdBy.name)}
                </Avatar>
                <Typography variant="caption" color="text.secondary">{a.createdBy.name}</Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">{timeAgo(a.createdAt)}</Typography>
            </Stack>
          </Box>
          {isAdmin && (
            <Stack direction="row" spacing={0.5}>
              <IconButton size="small"><ArchiveOutlined sx={{ fontSize: 16 }} /></IconButton>
            </Stack>
          )}
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 2 }}>
          {a.body}
        </Typography>

        {a.attachments && a.attachments.length > 0 && (
          <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
            {a.attachments.map(att => (
              <Chip key={att.name} label={`📎 ${att.name}`} size="small" clickable
                sx={{ fontWeight: 700, fontSize: 10 }} />
            ))}
          </Stack>
        )}

        {isAdmin && a.totalRecipients > 0 && (
          <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" mb={0.75}>
              <Typography variant="caption" fontWeight={700} color="text.secondary">Read by {a.readCount} of {a.totalRecipients} recipients</Typography>
              <Typography variant="caption" fontWeight={900} sx={{ color: readPct >= 70 ? '#10b981' : '#f59e0b' }}>{readPct}%</Typography>
            </Stack>
            <Box sx={{ height: 4, bgcolor: '#e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ height: '100%', width: `${readPct}%`, bgcolor: readPct >= 70 ? '#10b981' : '#f59e0b', borderRadius: 2, transition: 'width .6s ease' }} />
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

const CreateAnnouncementDialog: React.FC<{ open: boolean; onClose: () => void; onSave: () => void }> = ({ open, onClose, onSave }) => {
  const [form, setForm] = useState({ title: '', body: '', audience: 'ALL' as AnnouncementAudience, priority: 'NORMAL', pinned: false, scheduleAt: '' });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try { await api.post('/announcements', form); onSave(); onClose(); }
    catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4 } }}>
      <Box sx={{ px: 3.5, pt: 3, pb: 2.5 }}>
        <Stack direction="row" justifyContent="space-between">
          <Box>
            <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.3rem' }}>📢 Create Announcement</Typography>
            <Typography variant="caption" color="text.secondary">Broadcast to your team</Typography>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CloseOutlined fontSize="small" />
          </IconButton>
        </Stack>
      </Box>
      <Divider />
      <DialogContent>
        <Stack spacing={2.5}>
          <TextField fullWidth label="Title *" size="small" value={form.title} onChange={e => set('title', e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
          <TextField fullWidth label="Message *" multiline rows={5} size="small" value={form.body} onChange={e => set('body', e.target.value)}
            placeholder="Write your announcement here..."
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />

          <Stack direction="row" spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Audience</InputLabel>
              <Select value={form.audience} label="Audience" onChange={e => set('audience', e.target.value)} sx={{ borderRadius: 2.5 }}>
                {Object.entries(AUDIENCE_CFG).map(([k, v]) => <MenuItem key={k} value={k}>{v.icon} {v.label}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select value={form.priority} label="Priority" onChange={e => set('priority', e.target.value)} sx={{ borderRadius: 2.5 }}>
                {[['URGENT', '🚨 Urgent'], ['NORMAL', '📢 Normal'], ['LOW', '📌 Low']].map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            <FormControlLabel control={<Switch checked={form.pinned} onChange={e => set('pinned', e.target.checked)} size="small" />}
              label={<Typography variant="body2" fontWeight={700}>📌 Pin to top</Typography>} />
            <TextField label="Schedule for (Optional)" size="small" type="datetime-local" value={form.scheduleAt}
              onChange={e => set('scheduleAt', e.target.value)} InputLabelProps={{ shrink: true }}
              InputProps={{ startAdornment: <InputAdornment position="start"><ScheduleOutlined sx={{ fontSize: 16 }} /></InputAdornment> }}
              sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
          </Stack>
        </Stack>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
        <Button variant="contained" disableElevation onClick={handleSave}
          disabled={saving || !form.title || !form.body}
          sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2.5, px: 4 }}>
          {saving ? <CircularProgress size={18} color="inherit" /> : form.scheduleAt ? '⏰ Schedule' : '🚀 Send Now'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Activity Feed ────────────────────────────────────────────────────────────

export const ActivityFeed: React.FC<{ activities: ActivityFeedItem[]; compact?: boolean }> = ({ activities, compact = false }) => {
  const grouped = activities.reduce((m, a) => {
    const d = new Date(a.timestamp);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const nd = new Date(d); nd.setHours(0, 0, 0, 0);
    const key = nd.getTime() === today.getTime() ? 'Today'
      : nd.getTime() === (today.getTime() - 86400000) ? 'Yesterday'
        : formatDate(a.timestamp);
    (m[key] ??= []).push(a);
    return m;
  }, {} as Record<string, ActivityFeedItem[]>);

  return (
    <Box>
      {activities.length === 0 ? (
        <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
          <Typography fontSize={36} mb={1}>📋</Typography>
          <Typography variant="body2">No recent activity</Typography>
        </Box>
      ) : Object.entries(grouped).map(([date, items]) => (
        <Box key={date} mb={2.5}>
          {!compact && (
            <Typography sx={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, color: '#9ca3af', mb: 1.5 }}>
              {date}
            </Typography>
          )}
          <Stack spacing={0}>
            {items.map((item, i) => (
              <Stack key={item.id} direction="row" spacing={1.5} sx={{ position: 'relative' }}>
                {/* Connector */}
                {i < items.length - 1 && (
                  <Box sx={{ position: 'absolute', left: 17, top: 36, bottom: 0, width: 2, bgcolor: '#f1f5f9', zIndex: 0 }} />
                )}
                {/* Icon */}
                <Box sx={{
                  width: 34, height: 34, borderRadius: '50%', flexShrink: 0, zIndex: 1,
                  bgcolor: item.color + '18', border: `2px solid ${item.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
                }}>
                  {item.icon}
                </Box>
                {/* Content */}
                <Box sx={{ pb: 2.5, flex: 1 }}>
                  <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                        <Typography component="span" fontWeight={800}>{item.actorName}</Typography>
                        {' '}
                        <Typography component="span" color="text.secondary">{item.action}</Typography>
                        {' '}
                        <Typography component="span" fontWeight={700} sx={{ color: item.color }}>{item.entityLabel}</Typography>
                      </Typography>
                      {item.details && (
                        <Typography variant="caption" color="text.secondary">{item.details}</Typography>
                      )}
                    </Box>
                    <Typography variant="caption" sx={{ color: '#9ca3af', flexShrink: 0, fontSize: 10, mt: 0.25 }}>
                      {timeAgo(item.timestamp)}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Box>
      ))}
    </Box>
  );
};

// ─── Notification Preferences ─────────────────────────────────────────────────

export const NotificationPreferencesPage: React.FC<{
  preferences: NotificationPreferences;
  onSave: (prefs: NotificationPreferences) => void;
}> = ({ preferences, onSave }) => {
  const safePrefs = {
    ...preferences,
    email: preferences?.email || {},
    inApp: preferences?.inApp || {},
    push: {
      enabled: preferences?.push?.enabled || false,
      quietHoursFrom: preferences?.push?.quietHoursFrom || '22:00',
      quietHoursTo: preferences?.push?.quietHoursTo || '08:00'
    }
  };
  const [prefs, setPrefs] = useState<any>(safePrefs);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const setEmail = (k: keyof NotificationPreferences['email'], v: boolean) =>
    setPrefs(p => ({ ...p, email: { ...p.email, [k]: v } }));
  const setInApp = (k: keyof NotificationPreferences['inApp'], v: any) =>
    setPrefs(p => ({ ...p, inApp: { ...p.inApp, [k]: v } }));
  const setPush = (k: keyof NotificationPreferences['push'], v: any) =>
    setPrefs(p => ({ ...p, push: { ...p.push, [k]: v } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/users/notification-settings', prefs);
      onSave(prefs); setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <Box sx={{ maxWidth: 720 }}>
      <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '2rem', letterSpacing: -1.5, color: '#0f172a', mb: 0.5 }}>
        Notification Preferences
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={4}>
        Control exactly how and when you receive notifications
      </Typography>

      {saved && <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }}>Preferences saved successfully</Alert>}

      <Stack spacing={3}>
        {/* Digest frequency */}
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3.5 }}>
          <Typography variant="body1" fontWeight={800} mb={2}>⏰ Notification Frequency</Typography>
          <Stack direction="row" spacing={1.25} flexWrap="wrap">
            {[
              { v: 'REALTIME', l: '⚡ Real-time', sub: 'Instant alerts' },
              { v: 'HOURLY', l: '🕐 Hourly', sub: 'Batched hourly' },
              { v: 'DAILY', l: '📅 Daily', sub: 'Morning digest' },
              { v: 'WEEKLY', l: '📆 Weekly', sub: 'Weekly summary' },
            ].map(d => (
              <Box key={d.v} onClick={() => setPrefs(p => ({ ...p, digest: d.v as any }))}
                sx={{
                  flex: '1 1 100px', p: 2, borderRadius: 3, textAlign: 'center', cursor: 'pointer', border: '2px solid',
                  borderColor: prefs.digest === d.v ? '#6366f1' : '#e5e7eb',
                  bgcolor: prefs.digest === d.v ? '#eef2ff' : '#fff', transition: 'all .15s'
                }}>
                <Typography fontWeight={700} sx={{ fontSize: 20, mb: 0.5 }}>{d.l.split(' ')[0]}</Typography>
                <Typography variant="caption" fontWeight={800} sx={{ color: prefs.digest === d.v ? '#6366f1' : '#9ca3af', display: 'block' }}>
                  {d.l.slice(2)}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: 10, color: '#9ca3af' }}>{d.sub}</Typography>
              </Box>
            ))}
          </Stack>
        </Paper>

        {/* Email preferences */}
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3.5 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
            <Typography fontSize={22}>📧</Typography>
            <Typography variant="body1" fontWeight={800}>Email Notifications</Typography>
          </Stack>
          <Grid container spacing={1.5}>
            {Object.entries({
              leadAssigned: { label: 'New lead assigned', icon: '🎯' },
              followUpReminder: { label: 'Follow-up reminders', icon: '📞' },
              visitReminder: { label: 'Site visit reminders', icon: '🏠' },
              bookingConfirmed: { label: 'Booking confirmations', icon: '📝' },
              paymentAlert: { label: 'Payment received', icon: '💰' },
              overdueAlert: { label: 'Overdue payment alerts', icon: '🔴' },
              documentRequest: { label: 'Document requests', icon: '📄' },
              taskAssigned: { label: 'Task assigned', icon: '✅' },
              announcements: { label: 'Announcements', icon: '📢' },
            }).map(([key, cfg]) => (
              <Grid item xs={12} sm={6} key={key}>
                <Stack direction="row" alignItems="center" justifyContent="space-between"
                  sx={{ p: 1.75, borderRadius: 2.5, bgcolor: '#fafafa', border: '1px solid #f1f5f9' }}>
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Typography fontSize={16}>{cfg.icon}</Typography>
                    <Typography variant="body2" fontWeight={600}>{cfg.label}</Typography>
                  </Stack>
                  <Switch size="small" checked={!!(prefs.email as any)?.[key]}
                    onChange={e => setEmail(key as any, e.target.checked)} color="primary" />
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* In-App preferences */}
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3.5 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
            <Typography fontSize={22}>🔔</Typography>
            <Typography variant="body1" fontWeight={800}>In-App Notifications</Typography>
          </Stack>
          <Stack spacing={1.5}>
            {[
              { k: 'all', label: 'All in-app notifications', icon: '🔔' },
              { k: 'mentions', label: 'Mentions only', icon: '💬' },
              { k: 'reminders', label: 'Reminders', icon: '⏰' },
              { k: 'criticalOnly', label: 'Critical alerts only', icon: '🚨' },
            ].map(item => (
              <Stack key={item.k} direction="row" alignItems="center" justifyContent="space-between"
                sx={{ p: 2, borderRadius: 2.5, bgcolor: '#fafafa', border: '1px solid #f1f5f9' }}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <Typography fontSize={16}>{item.icon}</Typography>
                  <Typography variant="body2" fontWeight={600}>{item.label}</Typography>
                </Stack>
                <Switch size="small" checked={!!(prefs.inApp as any)?.[item.k]}
                  onChange={e => setInApp(item.k as any, e.target.checked)} color="primary" />
              </Stack>
            ))}
          </Stack>
        </Paper>

        {/* Push preferences */}
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Typography fontSize={22}>📲</Typography>
              <Typography variant="body1" fontWeight={800}>Push Notifications</Typography>
            </Stack>
            <Switch checked={prefs.push.enabled} onChange={e => setPush('enabled', e.target.checked)} />
          </Stack>
          {prefs.push.enabled && (
            <Stack direction="row" spacing={2}>
              {[
                { k: 'quietHoursFrom', label: 'Quiet Hours From' },
                { k: 'quietHoursTo', label: 'Quiet Hours To' },
              ].map(qh => (
                <TextField key={qh.k} label={qh.label} size="small" type="time"
                  value={(prefs.push as any)?.[qh.k] || ''} onChange={e => setPush(qh.k as any, e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
              ))}
            </Stack>
          )}
        </Paper>

        <Button variant="contained" disableElevation onClick={handleSave} disabled={saving}
          sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2.5, py: 1.5, alignSelf: 'flex-start', px: 5 }}>
          {saving ? <CircularProgress size={18} color="inherit" /> : 'Save Preferences'}
        </Button>
      </Stack>
    </Box>
  );
};

// ─── Communication History ────────────────────────────────────────────────────

export const CommunicationHistoryPanel: React.FC<{
  logs: CommunicationLog[];
  escalations?: EscalationRecord[];
}> = ({ logs, escalations = [] }) => {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2.5, borderBottom: 1, borderColor: 'divider' }}
        TabIndicatorProps={{ sx: { height: 3, borderRadius: 2 } }}>
        {[{ label: `📞 Communication (${logs.length})` }, { label: `⚠ Escalations (${escalations.length})` }].map((t, i) => (
          <Tab key={i} label={t.label} sx={{ textTransform: 'none', fontWeight: 700, minHeight: 44, fontSize: '0.8rem' }} />
        ))}
      </Tabs>

      {tab === 0 && (
        <Stack spacing={1.25}>
          {logs.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
              <Typography fontSize={36} mb={1}>📞</Typography>
              <Typography variant="body2">No communication history</Typography>
            </Box>
          ) : logs.map(log => {
            const chCfg = CHANNEL_CFG[log.channel];
            const isOut = log.direction === 'OUTBOUND';
            return (
              <Box key={log.id} sx={{ p: 2, borderRadius: 2.5, bgcolor: '#fafafa', border: '1px solid #f1f5f9' }}>
                <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                  <Box sx={{
                    width: 32, height: 32, borderRadius: 2, bgcolor: chCfg.color + '18',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0
                  }}>
                    {chCfg.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip label={isOut ? '→ Outbound' : '← Inbound'} size="small"
                            sx={{ bgcolor: isOut ? '#dbeafe' : '#d1fae5', color: isOut ? '#1d4ed8' : '#065f46', fontWeight: 800, fontSize: 9, height: 16 }} />
                          <Chip label={chCfg.label} size="small"
                            sx={{ bgcolor: chCfg.color + '15', color: chCfg.color, fontWeight: 700, fontSize: 9, height: 16 }} />
                          {log.status === 'FAILED' && (
                            <Chip label="Failed" size="small" sx={{ bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 800, fontSize: 9, height: 16 }} />
                          )}
                        </Stack>
                        {log.subject && <Typography variant="body2" fontWeight={700} mt={0.5}>{log.subject}</Typography>}
                        <Typography variant="caption" color="text.secondary">{log.summary}</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#9ca3af', flexShrink: 0, fontSize: 10 }}>
                        {timeAgo(log.createdAt)}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      )}

      {tab === 1 && (
        <Stack spacing={1.5}>
          {escalations.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
              <Typography fontSize={36} mb={1}>⚠</Typography>
              <Typography variant="body2">No escalations on record</Typography>
            </Box>
          ) : escalations.map(esc => (
            <Box key={esc.id} sx={{ p: 2.5, borderRadius: 3, bgcolor: '#fafafa', border: `1.5px solid ${esc.status === 'RESOLVED' ? '#6ee7b7' : '#fde68a'}` }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="body2" fontWeight={800}>{esc.entityLabel}</Typography>
                  <Typography variant="caption" color="text.secondary">{esc.reason}</Typography>
                  <Stack direction="row" spacing={1.5} mt={0.75}>
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>
                      From: <strong>{esc.originalAssignee.name}</strong>
                    </Typography>
                    {esc.escalatedTo && (
                      <Typography variant="caption" sx={{ color: '#6366f1' }}>
                        → Escalated to: <strong>{esc.escalatedTo.name}</strong>
                      </Typography>
                    )}
                    <Chip label={`${esc.attempts} attempt${esc.attempts !== 1 ? 's' : ''}`} size="small"
                      sx={{ fontSize: 9, height: 16, bgcolor: '#f3f4f6', fontWeight: 700 }} />
                  </Stack>
                </Box>
                <Stack alignItems="flex-end" spacing={0.75}>
                  <Chip label={esc.status} size="small"
                    sx={{
                      bgcolor: esc.status === 'RESOLVED' ? '#d1fae5' : esc.status === 'ESCALATED' ? '#fef3c7' : '#eef2ff',
                      color: esc.status === 'RESOLVED' ? '#065f46' : esc.status === 'ESCALATED' ? '#92400e' : '#4338ca',
                      fontWeight: 800, fontSize: 10
                    }} />
                  <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: 10 }}>{timeAgo(esc.createdAt)}</Typography>
                </Stack>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default AnnouncementsPage;