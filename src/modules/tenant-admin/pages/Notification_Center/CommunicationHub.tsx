import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Stack, Button, Tabs, Tab, Grid,
  Paper, Chip, Avatar, Divider, CircularProgress,
  Badge, IconButton, Tooltip, Snackbar, Alert
} from '@mui/material';
import {
  NotificationsOutlined, ChatOutlined, AnnouncementOutlined,
  FeedOutlined, SettingsOutlined, RefreshOutlined,
  PriorityHighOutlined, DownloadOutlined, BarChartOutlined
} from '@mui/icons-material';
import {
  Notification, Conversation, Announcement, ActivityFeedItem,
  NotificationPreferences, CommunicationLog, EscalationRecord,
  NOTIF_TYPE_CFG, NOTIF_CATEGORY_CFG,
  timeAgo, avatarColor, initials
} from './notifTypes';
import {
  NotificationCenterPage, NotificationBell
} from './NotificationCenter';
import MessagesPage from './MessagesPage';
import {
  AnnouncementsPage, ActivityFeed,
  NotificationPreferencesPage, CommunicationHistoryPanel
} from './CommunicationPages';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import api from '../../../../api/axios';

// ─── Notification Analytics Mini-Dashboard ────────────────────────────────────
const NotifAnalytics: React.FC<{ notifications: Notification[] }> = ({ notifications }) => {
  const stats = useMemo(() => {
    const byType = Object.entries(NOTIF_TYPE_CFG).map(([k, v]) => ({
      type: k, ...v, count: notifications.filter(n => n.type === k).length
    })).filter(s => s.count > 0);
    const byCategory = Object.entries(NOTIF_CATEGORY_CFG).map(([k, v]) => ({
      cat: k, ...v, count: notifications.filter(n => n.category === k).length
    })).filter(s => s.count > 0).sort((a, b) => b.count - a.count);
    return {
      total: notifications.length,
      unread: notifications.filter(n => !n.isRead).length,
      highPrio: notifications.filter(n => n.priority === 'HIGH').length,
      actionReq: notifications.filter(n => n.type === 'ACTION_REQUIRED').length,
      readRate: notifications.length > 0 ? Math.round((notifications.filter(n => n.isRead).length / notifications.length) * 100) : 0,
      byType, byCategory,
    };
  }, [notifications]);

  return (
    <Box>
      <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '2rem', letterSpacing: -1.5, color: '#0f172a', mb: 3 }}>
        Communication Analytics
      </Typography>

      {/* KPI strip */}
      <Grid container spacing={2} mb={4}>
        {[
          { icon: '🔔', label: 'Total Alerts', value: stats.total, color: '#6366f1' },
          { icon: '📬', label: 'Unread', value: stats.unread, color: '#f59e0b' },
          { icon: '🔥', label: 'High Priority', value: stats.highPrio, color: '#ef4444' },
          { icon: '⚡', label: 'Action Required', value: stats.actionReq, color: '#8b5cf6' },
          { icon: '📖', label: 'Read Rate', value: `${stats.readRate}%`, color: '#10b981' },
        ].map(k => (
          <Grid item xs={6} sm={4} md key={k.label}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3.5, textAlign: 'center' }}>
              <Typography fontSize={24} mb={0.5}>{k.icon}</Typography>
              <Typography variant="h5" fontWeight={900} sx={{ color: k.color }}>{k.value}</Typography>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ fontSize: 10 }}>{k.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* By type */}
        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3.5 }}>
            <Typography variant="body1" fontWeight={800} mb={2.5}>By Alert Type</Typography>
            <Stack spacing={1.5}>
              {stats.byType.map(t => {
                const pct = stats.total ? Math.round(t.count / stats.total * 100) : 0;
                return (
                  <Stack key={t.type} direction="row" alignItems="center" spacing={2}>
                    <Typography fontSize={16} sx={{ width: 22 }}>{t.icon}</Typography>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" justifyContent="space-between" mb={0.4}>
                        <Typography variant="caption" fontWeight={700}>{t.label}</Typography>
                        <Typography variant="caption" fontWeight={900} sx={{ color: t.color }}>{t.count} ({pct}%)</Typography>
                      </Stack>
                      <Box sx={{ height: 7, borderRadius: 4, bgcolor: '#f3f4f6', overflow: 'hidden' }}>
                        <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: t.color, borderRadius: 4, transition: 'width .6s ease' }} />
                      </Box>
                    </Box>
                  </Stack>
                );
              })}
            </Stack>
          </Paper>
        </Grid>

        {/* By category */}
        <Grid item xs={12} md={7}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3.5 }}>
            <Typography variant="body1" fontWeight={800} mb={2.5}>By Category (Top triggers)</Typography>
            <Stack spacing={1.25}>
              {stats.byCategory.slice(0, 8).map((c, i) => {
                const pct = stats.total ? Math.round(c.count / stats.total * 100) : 0;
                return (
                  <Stack key={c.cat} direction="row" alignItems="center" spacing={2}>
                    <Typography fontSize={15} sx={{ width: 22 }}>{c.icon}</Typography>
                    <Typography variant="caption" fontWeight={700} sx={{ width: 110, color: '#374151' }}>{c.label}</Typography>
                    <Box sx={{ flex: 1, height: 26, bgcolor: '#f3f4f6', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
                      <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: c.color, borderRadius: 2, transition: 'width .6s ease' }} />
                      {pct > 20 && (
                        <Typography sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 10, fontWeight: 800, color: '#fff' }}>
                          {c.count}
                        </Typography>
                      )}
                    </Box>
                    <Typography variant="caption" fontWeight={900} sx={{ color: c.color, width: 28, textAlign: 'right' }}>{c.count}</Typography>
                  </Stack>
                );
              })}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// ─── Main Communication Hub ───────────────────────────────────────────────────
const CommunicationHub: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const currentUserId = user?.id || '';
  const currentUserName = user?.name || 'User';
  const currentRole = user?.role || 'USER';

  const [activeTab, setActiveTab] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [commLogs, setCommLogs] = useState<CommunicationLog[]>([]);
  const [escalations, setEscalations] = useState<EscalationRecord[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [sb, setSb] = useState<{ open: boolean; msg: string; sev: 'success' | 'error' }>({ open: false, msg: '', sev: 'success' });

  const showMsg = (msg: string, sev: 'success' | 'error' = 'success') => setSb({ open: true, msg, sev });

  const unreadNotifs = (notifications || []).filter(n => !n.isRead).length;
  const unreadMsgs = (conversations || []).reduce((s, c) => s + (c?.unreadCount || 0), 0);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [nRes, cRes, aRes, actRes, logRes, escRes, pRes] = await Promise.all([
        api.get('/communications/notifications'),
        api.get('/communications/conversations'),
        api.get('/communications/announcements'),
        api.get('/communications/activity-feed'),
        api.get('/communications/communication-logs'),
        api.get('/communications/escalations'),
        api.get('/communications/users/notification-settings'),
      ]);
      setNotifications(nRes.data?.data || nRes.data || []);
      setConversations(cRes.data?.data || cRes.data || []);
      setAnnouncements(aRes.data?.data || aRes.data || []);
      setActivities(actRes.data?.data || actRes.data || []);
      setCommLogs(logRes.data?.data || logRes.data || []);
      setEscalations(escRes.data?.data || escRes.data || []);
      setPreferences(pRes.data?.data || pRes.data || null);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await api.put(`/communications/notifications/${id}/read`);
      setNotifications(n => n.map(x => x.id === id ? { ...x, isRead: true } : x));
    } catch (e) { console.error(e); }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/communications/notifications/mark-all-read');
      setNotifications(n => n.map(x => ({ ...x, isRead: true })));
    } catch (e) { console.error(e); }
  };

  const handleDeleteNotif = async (id: string) => {
    try {
      await api.delete(`/communications/notifications/${id}`);
      setNotifications(n => n.filter(x => x.id !== id));
    } catch (e) { console.error(e); }
  };

  const handlePinNotif = async (id: string) => {
    try {
      const notif = notifications.find(x => x.id === id);
      await api.patch(`/communications/notifications/${id}/pin`);
      setNotifications(n => n.map(x => x.id === id ? { ...x, isPinned: !x.isPinned } : x));
      showMsg(`Notification ${!notif?.isPinned ? 'pinned' : 'unpinned'}`);
    } catch (e) { console.error(e); showMsg('Failed to update notification', 'error'); }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await api.delete(`/communications/announcements/${id}`);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      showMsg('Announcement deleted successfully');
    } catch (e) { console.error(e); showMsg('Failed to delete announcement', 'error'); }
  };

  const handleTogglePinAnnouncement = async (id: string) => {
    try {
      await api.patch(`/communications/announcements/${id}/pin`);
      setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, pinned: !a.pinned } : a));
      showMsg('Announcement pin status updated');
    } catch (e) { console.error(e); showMsg('Failed to toggle pin', 'error'); }
  };

  const handleSaveSettings = async (newPrefs: NotificationPreferences) => {
    try {
      await api.put('/communications/users/notification-settings', newPrefs);
      setPreferences(newPrefs);
      showMsg('Notification preferences saved');
    } catch (e) {
      console.error(e);
      showMsg('Failed to save preferences', 'error');
    }
  };

  const TABS = [
    { id: 'notifications', icon: <NotificationsOutlined sx={{ fontSize: 17 }} />, label: 'Notifications', badge: unreadNotifs },
    { id: 'messages', icon: <ChatOutlined sx={{ fontSize: 17 }} />, label: 'Messages', badge: unreadMsgs },
    { id: 'announcements', icon: <AnnouncementOutlined sx={{ fontSize: 17 }} />, label: 'Announcements', badge: 0 },
    { id: 'activity', icon: <FeedOutlined sx={{ fontSize: 17 }} />, label: 'Activity Feed', badge: 0 },
    { id: 'analytics', icon: <BarChartOutlined sx={{ fontSize: 17 }} />, label: 'Analytics', badge: 0 },
    { id: 'settings', icon: <SettingsOutlined sx={{ fontSize: 17 }} />, label: 'Settings', badge: 0 },
  ];

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#fafafa', minHeight: '100vh' }}>
      {/* Page header */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-start' }} mb={3.5} spacing={2}>
        <Box>
          <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '2.25rem', letterSpacing: -1.5, lineHeight: 1.1, color: '#0f172a' }}>
            Communication Center
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={0.75}>
            Notifications · Messages · Announcements · Activity
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} alignItems="center">
          {/* Quick stats */}
          {unreadNotifs > 0 && (
            <Chip label={`${unreadNotifs} unread alerts`}
              sx={{ bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 800, fontSize: 11, height: 28 }} />
          )}
          {unreadMsgs > 0 && (
            <Chip label={`${unreadMsgs} unread messages`}
              sx={{ bgcolor: '#eef2ff', color: '#4338ca', fontWeight: 800, fontSize: 11, height: 28 }} />
          )}
          <IconButton onClick={fetchAll} size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <RefreshOutlined fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>

      {/* Tabs */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto"
          TabIndicatorProps={{ sx: { height: 3, borderRadius: 2 } }}>
          {TABS.map((t, i) => (
            <Tab key={t.id}
              icon={t.badge > 0 ? (
                <Badge badgeContent={t.badge} color="error"
                  sx={{ '& .MuiBadge-badge': { fontSize: 9, height: 16, minWidth: 16, fontWeight: 800 } }}>
                  {t.icon}
                </Badge>
              ) : t.icon}
              iconPosition="start" label={t.label}
              sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.8rem', minHeight: 46, px: 2 }} />
          ))}
        </Tabs>
      </Stack>

      {/* Tab content */}
      {TABS[activeTab]?.id === 'notifications' && (
        <NotificationCenterPage
          notifications={notifications}
          onMarkRead={handleMarkRead}
          onMarkAllRead={handleMarkAllRead}
          onDelete={handleDeleteNotif}
          onPin={handlePinNotif}
          onRefresh={fetchAll}
          loading={false}
        />
      )}

      {TABS[activeTab]?.id === 'messages' && (
        <MessagesPage
          conversations={conversations}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          onRefresh={fetchAll}
        />
      )}

      {TABS[activeTab]?.id === 'announcements' && (
        <AnnouncementsPage
          announcements={announcements}
          currentRole={currentRole}
          onRefresh={fetchAll}
          onDelete={handleDeleteAnnouncement}
          onPin={handleTogglePinAnnouncement}
        />
      )}

      {TABS[activeTab]?.id === 'activity' && (
        <Box>
          <Stack direction="row" justifyContent="space-between" mb={3}>
            <Box>
              <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '2rem', letterSpacing: -1.5, color: '#0f172a' }}>
                Activity Feed
              </Typography>
              <Typography variant="body2" color="text.secondary">Full audit trail of team actions</Typography>
            </Box>
          </Stack>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3.5 }}>
            <ActivityFeed activities={activities} />
          </Paper>
        </Box>
      )}

      {TABS[activeTab]?.id === 'analytics' && (
        <NotifAnalytics notifications={notifications} />
      )}

      {TABS[activeTab]?.id === 'settings' && (
        <NotificationPreferencesPage
          preferences={preferences || {
            userId: currentUserId,
            email: {},
            inApp: {},
            push: { enabled: false, quietHoursFrom: '22:00', quietHoursTo: '08:00' },
            digest: 'REALTIME'
          } as any}
          onSave={handleSaveSettings}
        />
      )}

      <Snackbar open={sb.open} autoHideDuration={4000} onClose={() => setSb(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSb(s => ({ ...s, open: false }))} severity={sb.sev} variant="filled" sx={{ width: '100%', borderRadius: 2 }}>
          {sb.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// ─── Exports ──────────────────────────────────────────────────────────────────
export { NotificationBell } from './NotificationCenter';
export default CommunicationHub;