import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Stack, Button, Chip, IconButton,
  Paper, Divider, Avatar, Tooltip, Badge,
  CircularProgress, Alert, Tabs, Tab, TextField,
  InputAdornment, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
  NotificationsOutlined, DoneAllOutlined, DeleteOutlineOutlined,
  FilterListOutlined, SearchOutlined, RefreshOutlined,
  OpenInNewOutlined, PushPinOutlined, MarkEmailReadOutlined,
  PriorityHighOutlined, CheckOutlined, WarningAmberOutlined
} from '@mui/icons-material';
import {
  Notification, NotifType, NotifCategory,
  NOTIF_TYPE_CFG, NOTIF_CATEGORY_CFG,
  timeAgo, avatarColor, initials
} from './notifTypes';
import api from '../../../../api/axios';

// ─── Single Notification Row ──────────────────────────────────────────────────
const NotifRow: React.FC<{
  notif: Notification;
  onRead: () => void;
  onDelete: () => void;
  onPin: () => void;
  compact?: boolean;
}> = ({ notif, onRead, onDelete, onPin, compact = false }) => {
  const navigate = useNavigate();
  const typeCfg = NOTIF_TYPE_CFG[notif.type] || NOTIF_TYPE_CFG.INFO;
  const catCfg = (notif.category && NOTIF_CATEGORY_CFG[notif.category as NotifCategory]) || NOTIF_CATEGORY_CFG.SYSTEM;

  const handleRowClick = () => {
    if (!notif.isRead) onRead();
    if (notif.actionUrl) navigate(notif.actionUrl);
  };

  return (
    <Box sx={{
      px: compact ? 2 : 2.5, py: compact ? 1.5 : 2,
      display: 'flex', gap: 1.5, alignItems: 'flex-start',
      bgcolor: notif.isRead ? 'transparent' : typeCfg.darkBg + '66',
      borderLeft: `3px solid ${notif.isRead ? 'transparent' : typeCfg.color}`,
      transition: 'all .15s', cursor: 'pointer',
      '&:hover': { bgcolor: '#f8fafc' },
      position: 'relative',
    }} onClick={handleRowClick}>
      {/* Icon */}
      <Box sx={{
        width: 36, height: 36, borderRadius: 2.5, flexShrink: 0,
        bgcolor: typeCfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, border: `1px solid ${typeCfg.border}`,
      }}>
        {catCfg.icon}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
            {!notif.isRead && (
              <Box sx={{
                width: 7, height: 7, borderRadius: '50%', bgcolor: typeCfg.color, flexShrink: 0,
                boxShadow: `0 0 6px ${typeCfg.color}80`
              }} />
            )}
            <Typography variant="body2" fontWeight={notif.isRead ? 600 : 800}
              sx={{ color: '#0f172a', lineHeight: 1.3 }} noWrap>
              {notif.title}
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, fontSize: 10 }}>
            {timeAgo(notif.createdAt)}
          </Typography>
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25, lineHeight: 1.4 }}
          className={compact ? 'notif-msg-compact' : ''}>
          {notif.message}
        </Typography>

        {notif.entityLabel && (
          <Typography variant="caption" sx={{ color: typeCfg.color, fontWeight: 700, display: 'block', mt: 0.5, fontSize: 10 }}>
            {catCfg.icon} {notif.entityLabel}
          </Typography>
        )}

        <Stack direction="row" spacing={0.75} mt={0.75} alignItems="center">
          <Chip label={typeCfg.icon + ' ' + typeCfg.label} size="small"
            sx={{ bgcolor: typeCfg.bg, color: typeCfg.color, fontWeight: 800, fontSize: 9, height: 16 }} />
          {notif.priority === 'HIGH' && (
            <Chip label="🔥 High" size="small"
              sx={{ bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 800, fontSize: 9, height: 16 }} />
          )}
          {notif.actionLabel && (
            <Button size="small" variant="text"
              onClick={(e) => { e.stopPropagation(); handleRowClick(); }}
              sx={{
                textTransform: 'none', fontWeight: 800, fontSize: 10, py: 0, px: 0.75, minWidth: 0,
                color: typeCfg.color, '&:hover': { bgcolor: typeCfg.bg }
              }}>
              {notif.actionLabel} →
            </Button>
          )}
        </Stack>
      </Box>

      {/* Actions on hover */}
      <Stack direction="row" spacing={0.25} sx={{ position: 'absolute', right: 8, top: 8, opacity: 0, '.MuiBox-root:hover &': { opacity: 1 } }}>
        <Tooltip title={notif.isPinned ? 'Unpin' : 'Pin'}>
          <IconButton size="small" onClick={e => { e.stopPropagation(); onPin(); }}
            sx={{ bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: '#f3f4f6' } }}>
            <PushPinOutlined sx={{ fontSize: 13, color: notif.isPinned ? '#6366f1' : '#9ca3af' }} />
          </IconButton>
        </Tooltip>
        {!notif.isRead && (
          <Tooltip title="Mark read">
            <IconButton size="small" onClick={e => { e.stopPropagation(); onRead(); }}
              sx={{ bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: '#f3f4f6' } }}>
              <CheckOutlined sx={{ fontSize: 13, color: '#10b981' }} />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Delete">
          <IconButton size="small" onClick={e => { e.stopPropagation(); onDelete(); }}
            sx={{ bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: '#f3f4f6' } }}>
            <DeleteOutlineOutlined sx={{ fontSize: 13, color: '#ef4444' }} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
};

// ─── Bell Dropdown ────────────────────────────────────────────────────────────
export const NotificationBell: React.FC<{
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDelete: (id: string) => void;
  onPin: (id: string) => void;
  onViewAll: () => void;
}> = ({ notifications, onMarkRead, onMarkAllRead, onDelete, onPin, onViewAll }) => {
  const [open, setOpen] = useState(false);
  const unread = notifications.filter(n => !n.isRead).length;
  const highPriority = notifications.filter(n => n.priority === 'HIGH' && !n.isRead);
  const recent = notifications.slice(0, 8);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('[data-notif-panel]')) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <Box sx={{ position: 'relative' }} data-notif-panel>
      <Tooltip title="Notifications">
        <IconButton onClick={() => setOpen(o => !o)} size="small"
          sx={{ position: 'relative', border: '1px solid', borderColor: open ? '#6366f1' : 'divider', borderRadius: 2 }}>
          <Badge badgeContent={unread > 0 ? unread : null} color="error"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: 10, height: 18, minWidth: 18, fontWeight: 800,
                animation: unread > 0 ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': { '0%,100%': { boxShadow: '0 0 0 0 rgba(239,68,68,.5)' }, '50%': { boxShadow: '0 0 0 4px rgba(239,68,68,0)' } }
              }
            }}>
            <NotificationsOutlined fontSize="small" sx={{ color: open ? '#6366f1' : 'inherit' }} />
          </Badge>
        </IconButton>
      </Tooltip>

      {open && (
        <Paper elevation={8} sx={{
          position: 'absolute', right: 0, top: '110%', width: 400, maxHeight: 560,
          borderRadius: 3.5, overflow: 'hidden', zIndex: 1400,
          border: '1px solid #e5e7eb',
          boxShadow: '0 20px 60px rgba(0,0,0,.15)',
        }}>
          {/* Header */}
          <Box sx={{ px: 2.5, py: 2, bgcolor: '#0f172a', borderRadius: '14px 14px 0 0' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <NotificationsOutlined sx={{ color: '#94a3b8', fontSize: 18 }} />
                <Typography variant="body1" fontWeight={900} sx={{ color: '#f1f5f9', fontFamily: '"Syne", sans-serif' }}>
                  Notifications
                </Typography>
                {unread > 0 && (
                  <Chip label={unread} size="small"
                    sx={{ bgcolor: '#ef4444', color: '#fff', fontWeight: 900, height: 20, fontSize: 11 }} />
                )}
              </Stack>
              <Stack direction="row" spacing={0.75}>
                {unread > 0 && (
                  <Tooltip title="Mark all read">
                    <IconButton size="small" onClick={onMarkAllRead} sx={{ color: '#94a3b8', '&:hover': { color: '#10b981' } }}>
                      <DoneAllOutlined sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </Stack>
          </Box>

          {/* High priority alerts */}
          {highPriority.length > 0 && (
            <Box sx={{ px: 2, py: 1.5, bgcolor: '#450a0a', borderBottom: '1px solid #7f1d1d' }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <PriorityHighOutlined sx={{ color: '#fca5a5', fontSize: 16 }} />
                <Typography sx={{ color: '#fca5a5', fontSize: 12, fontWeight: 800 }}>
                  {highPriority.length} high-priority alert{highPriority.length > 1 ? 's' : ''} — needs attention
                </Typography>
              </Stack>
            </Box>
          )}

          {/* Notifications */}
          <Box sx={{ overflowY: 'auto', maxHeight: 420 }}>
            {recent.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                <Typography fontSize={40} mb={1}>🔔</Typography>
                <Typography variant="body2">You're all caught up!</Typography>
              </Box>
            ) : (
              <Stack divider={<Divider />}>
                {recent.map(n => (
                  <NotifRow key={n.id} notif={n} compact
                    onRead={() => onMarkRead(n.id)}
                    onDelete={() => onDelete(n.id)}
                    onPin={() => onPin(n.id)} />
                ))}
              </Stack>
            )}
          </Box>

          <Divider />
          <Box sx={{ px: 2.5, py: 1.5 }}>
            <Button fullWidth size="small" onClick={() => { setOpen(false); onViewAll(); }}
              sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2.5, color: '#6366f1', fontSize: 13 }}>
              View all notifications →
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

// ─── Full Notification Center Page ────────────────────────────────────────────
export const NotificationCenterPage: React.FC<{
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDelete: (id: string) => void;
  onPin: (id: string) => void;
  onRefresh: () => void;
  loading: boolean;
}> = ({ notifications, onMarkRead, onMarkAllRead, onDelete, onPin, onRefresh, loading }) => {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [catFilter, setCatFilter] = useState('ALL');

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const pinnedCount = notifications.filter(n => n.isPinned).length;
  const highPriCount = notifications.filter(n => n.priority === 'HIGH' && !n.isRead).length;

  const filtered = useMemo(() => {
    let list = [...notifications];
    // Tab filter
    if (tab === 1) list = list.filter(n => !n.isRead);
    if (tab === 2) list = list.filter(n => n.isPinned);
    if (tab === 3) list = list.filter(n => n.priority === 'HIGH');
    // Search
    if (search) { const q = search.toLowerCase(); list = list.filter(n => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q)); }
    // Type
    if (typeFilter !== 'ALL') list = list.filter(n => n.type === typeFilter);
    // Category
    if (catFilter !== 'ALL') list = list.filter(n => n.category === catFilter);
    // Sort: pinned first, then by date
    return list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [notifications, tab, search, typeFilter, catFilter]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, Notification[]> = {};
    filtered.forEach(n => {
      const d = new Date(n.createdAt);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
      const nd = new Date(d); nd.setHours(0, 0, 0, 0);
      const key = nd.getTime() === today.getTime() ? 'Today'
        : nd.getTime() === yesterday.getTime() ? 'Yesterday'
          : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });
      (groups[key] ??= []).push(n);
    });
    return groups;
  }, [filtered]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#fafafa', minHeight: '100vh' }}>
      {/* Header */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-start' }} mb={3.5} spacing={2}>
        <Box>
          <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '2.25rem', letterSpacing: -1.5, lineHeight: 1.1, color: '#0f172a' }}>
            Notifications
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={0.75}>
            {notifications.length} total · {unreadCount} unread · {pinnedCount} pinned
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          {unreadCount > 0 && (
            <Button variant="outlined" startIcon={<DoneAllOutlined />} onClick={onMarkAllRead}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 3 }}>
              Mark All Read
            </Button>
          )}
          <IconButton onClick={onRefresh} size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <RefreshOutlined fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>

      {/* High priority alert banner */}
      {highPriCount > 0 && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3, fontWeight: 700 }}
          icon={<PriorityHighOutlined />}>
          🚨 <strong>{highPriCount} high-priority alert{highPriCount > 1 ? 's' : ''}</strong> require your immediate attention
        </Alert>
      )}

      {/* Tabs */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          TabIndicatorProps={{ sx: { height: 3, borderRadius: 2 } }}>
          {[
            { label: 'All', count: notifications.length },
            { label: 'Unread', count: unreadCount },
            { label: 'Pinned', count: pinnedCount },
            { label: '🔥 High Priority', count: highPriCount },
          ].map((t, i) => (
            <Tab key={i}
              label={<Stack direction="row" alignItems="center" spacing={0.75}>
                <span>{t.label}</span>
                {t.count > 0 && (
                  <Box sx={{
                    width: 20, height: 20, borderRadius: 10, bgcolor: i === 1 ? '#ef4444' : '#f3f4f6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Typography sx={{ fontSize: 10, fontWeight: 800, color: i === 1 ? '#fff' : '#374151' }}>{t.count}</Typography>
                  </Box>
                )}
              </Stack>}
              sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.8rem', minHeight: 44 }} />
          ))}
        </Tabs>
      </Stack>

      {/* Filters */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField fullWidth placeholder="Search notifications..." size="small"
            value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small" sx={{ color: '#9ca3af' }} /></InputAdornment>, sx: { borderRadius: 2.5 } }} />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Type</InputLabel>
            <Select value={typeFilter} label="Type" onChange={e => setTypeFilter(e.target.value)} sx={{ borderRadius: 2.5 }}>
              <MenuItem value="ALL">All Types</MenuItem>
              {Object.entries(NOTIF_TYPE_CFG).map(([k, v]) => <MenuItem key={k} value={k}>{v.icon} {v.label}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Category</InputLabel>
            <Select value={catFilter} label="Category" onChange={e => setCatFilter(e.target.value)} sx={{ borderRadius: 2.5 }}>
              <MenuItem value="ALL">All Categories</MenuItem>
              {Object.entries(NOTIF_CATEGORY_CFG).map(([k, v]) => <MenuItem key={k} value={k}>{v.icon} {v.label}</MenuItem>)}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Notification list */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ py: 10, textAlign: 'center', color: 'text.secondary' }}>
          <Typography fontSize={52} mb={2}>🔔</Typography>
          <Typography variant="h6" fontWeight={700}>No notifications found</Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {Object.entries(grouped).map(([date, items]) => (
            <Box key={date}>
              <Typography sx={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, color: '#9ca3af', mb: 1.5 }}>
                {date}
              </Typography>
              <Paper variant="outlined" sx={{ borderRadius: 3.5, overflow: 'hidden' }}>
                <Stack divider={<Divider />}>
                  {items.map(n => (
                    <NotifRow key={n.id} notif={n}
                      onRead={() => onMarkRead(n.id)}
                      onDelete={() => onDelete(n.id)}
                      onPin={() => onPin(n.id)} />
                  ))}
                </Stack>
              </Paper>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default NotificationCenterPage;