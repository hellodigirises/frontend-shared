import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, Button, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Avatar, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, CircularProgress, Grid, Divider, Tooltip, InputAdornment,
  FormControl, InputLabel, Select, Paper, Badge, Menu, ListItemIcon,
  ListItemText, Switch, FormControlLabel, Alert, Collapse, Tab, Tabs
} from '@mui/material';
import {
  AddOutlined, EditOutlined, DeleteOutline, SearchOutlined,
  LockResetOutlined, EmailOutlined, PhoneOutlined, PersonOutlined,
  MoreVertOutlined, CheckCircleOutlined, BlockOutlined,
  BusinessCenterOutlined, CalendarTodayOutlined, SupervisorAccountOutlined,
  ContentCopyOutlined, CloseOutlined, VisibilityOutlined,
  VisibilityOffOutlined, GroupOutlined, TrendingUpOutlined,
  SendOutlined, RefreshOutlined, FilterListOutlined, InfoOutlined,
  ContentPasteOutlined, KeyOutlined, ShieldOutlined
} from '@mui/icons-material';
import api from '../../../../api/axios';
import DeleteMemberDialog from '../../components/DeleteMemberDialog';

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  joiningDate?: string;
  status: 'ACTIVE' | 'INACTIVE';
  role: string | { id: string; name: string };
  manager?: { id: string; name: string };
  tempPassword?: string;
  mustChangePassword?: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

interface Role { id: string; name: string }

const BLANK_FORM = {
  name: '', email: '', phone: '', password: '',
  roleId: '', department: '', status: 'ACTIVE',
  joiningDate: '', managerId: '',
};

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  'SALES_MANAGER': { bg: 'hsl(215, 100%, 95%)', color: 'hsl(215, 100%, 40%)' },
  'AGENT': { bg: 'hsl(142, 70%, 95%)', color: 'hsl(142, 70%, 30%)' },
  'HR': { bg: 'hsl(330, 80%, 95%)', color: 'hsl(330, 80%, 40%)' },
  'TENANT_ADMIN': { bg: 'hsl(260, 80%, 95%)', color: 'hsl(260, 80%, 40%)' },
  'FINANCE': { bg: 'hsl(35, 90%, 95%)', color: 'hsl(35, 90%, 35%)' },
  'MANAGER': { bg: 'hsl(190, 80%, 95%)', color: 'hsl(190, 80%, 40%)' },
  'EMPLOYEE': { bg: 'hsl(210, 20%, 95%)', color: 'hsl(210, 20%, 30%)' },
  'SUPERADMIN': { bg: 'hsl(0, 100%, 95%)', color: 'hsl(0, 100%, 40%)' },
  'PROCUREMENT': { bg: 'hsl(160, 80%, 95%)', color: 'hsl(160, 80%, 40%)' },
};
const getRoleStyle = (role: string) =>
  ROLE_COLORS[role] ?? { bg: '#f3f4f6', color: '#374151' };

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const AVATAR_COLORS = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444',
];
const avatarColor = (name: string) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const generatePassword = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!';
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

/* ─────────────────────────────────────────
   Password Reset Dialog
───────────────────────────────────────── */
const PasswordResetDialog = ({
  user, open, onClose,
}: { user: User | null; open: boolean; onClose: () => void }) => {
  const [newPass, setNewPass] = useState('');
  const [show, setShow] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) { setNewPass(generatePassword()); setSent(false); setCopied(false); }
  }, [open]);

  const handleSendEmail = async () => {
    setSending(true);
    try {
      await api.post(`/users/${user?.id}/reset-password`, {
        password: newPass, sendEmail: true,
      });
      setSent(true);
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(newPass);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <LockResetOutlined color="primary" />
          <span>Reset Password</span>
        </Stack>
        <IconButton size="small" onClick={onClose}><CloseOutlined /></IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: 'grey.50' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>Resetting password for</Typography>
            <Stack direction="row" alignItems="center" spacing={1.5} mt={0.75}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: avatarColor(user?.name ?? ''), fontSize: 13, fontWeight: 800 }}>
                {getInitials(user?.name ?? '')}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight={800}>{user?.name}</Typography>
                <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
              </Box>
            </Stack>
          </Paper>

          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.8 }}>
              New Temporary Password
            </Typography>
            <Stack direction="row" spacing={1} mt={0.75}>
              <TextField
                fullWidth size="small"
                type={show ? 'text' : 'password'}
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                InputProps={{
                  sx: { fontFamily: 'monospace', fontWeight: 700, letterSpacing: 2, fontSize: 15 },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShow(v => !v)}>
                        {show ? <VisibilityOffOutlined fontSize="small" /> : <VisibilityOutlined fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <Tooltip title={copied ? 'Copied!' : 'Copy'}>
                <IconButton onClick={handleCopy} sx={{ bgcolor: copied ? 'success.light' : 'grey.100', borderRadius: 2 }}>
                  <ContentCopyOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Generate New">
                <IconButton onClick={() => setNewPass(generatePassword())} sx={{ bgcolor: 'grey.100', borderRadius: 2 }}>
                  <RefreshOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          <Collapse in={sent}>
            <Alert severity="success" sx={{ borderRadius: 2 }}>
              Password reset email sent to <strong>{user?.email}</strong>
            </Alert>
          </Collapse>
        </Stack>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none' }}>Cancel</Button>
        <Button
          variant="outlined" startIcon={<ContentCopyOutlined />}
          onClick={handleCopy} sx={{ textTransform: 'none', borderRadius: 2 }}>
          {copied ? 'Copied!' : 'Copy Password'}
        </Button>
        <Button
          variant="contained" disableElevation
          startIcon={sending ? <CircularProgress size={14} color="inherit" /> : <SendOutlined />}
          onClick={handleSendEmail} disabled={sending || sent}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
          {sent ? 'Email Sent ✓' : 'Send via Email'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/* ─────────────────────────────────────────
   Row Action Menu
───────────────────────────────────────── */
const RowMenu = ({
  user, onEdit, onDelete, onResetPassword, onToggleStatus, currentUser
}: {
  user: User;
  currentUser: { id: string, role: string };
  onEdit: () => void; onDelete: () => void;
  onResetPassword: () => void; onToggleStatus: () => void;
}) => {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const close = () => setAnchor(null);

  const isSelf = user.id === currentUser.id;
  const targetRole = typeof user.role === 'string' ? user.role : (user.role as any).id;
  const isTargetAdmin = targetRole === 'TENANT_ADMIN';
  const isHrRestricted = currentUser.role === 'HR' && isTargetAdmin;
  
  const canDelete = !isSelf && !isHrRestricted;
  const canEdit = !isHrRestricted;
  const canReset = !isHrRestricted;
  const canToggle = !isHrRestricted;

  return (
    <>
      <IconButton size="small" onClick={e => setAnchor(e.currentTarget)}>
        <MoreVertOutlined fontSize="small" />
      </IconButton>
      <Menu anchorEl={anchor} open={!!anchor} onClose={close}
        PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,.12)', minWidth: 180 } }}>
        <MenuItem onClick={() => { onEdit(); close(); }} sx={{ py: 1.25 }} disabled={!canEdit}>
          <ListItemIcon><EditOutlined fontSize="small" /></ListItemIcon>
          <ListItemText primary="Edit" primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }} />
        </MenuItem>
        <MenuItem onClick={() => { onResetPassword(); close(); }} sx={{ py: 1.25 }} disabled={!canReset}>
          <ListItemIcon><LockResetOutlined fontSize="small" /></ListItemIcon>
          <ListItemText primary="Reset Password" primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }} />
        </MenuItem>
        <MenuItem onClick={() => { onToggleStatus(); close(); }} sx={{ py: 1.25 }} disabled={!canToggle}>
          <ListItemIcon>
            {user.status === 'ACTIVE'
              ? <BlockOutlined fontSize="small" color="warning" />
              : <CheckCircleOutlined fontSize="small" color="success" />}
          </ListItemIcon>
          <ListItemText
            primary={user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }} />
        </MenuItem>
        <Divider />
        <Tooltip title={isSelf ? "You cannot delete your own account" : isHrRestricted ? "HR cannot delete Tenant Admin" : ""}>
          <span>
            <MenuItem onClick={() => { onDelete(); close(); }} sx={{ py: 1.25, color: canDelete ? 'error.main' : 'text.disabled' }} disabled={!canDelete}>
              <ListItemIcon><DeleteOutline fontSize="small" color={canDelete ? 'error' : 'disabled'} /></ListItemIcon>
              <ListItemText primary="Delete" primaryTypographyProps={{ fontSize: 13, fontWeight: 600, color: 'inherit' }} />
            </MenuItem>
          </span>
        </Tooltip>
      </Menu>
    </>
  );
};

/* ─────────────────────────────────────────
   Main Page
───────────────────────────────────────── */
const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser: { id: string, role: string } = (() => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return { id: payload.id ?? '', role: (payload.role ?? '').toUpperCase() };
      }
    } catch { /* noop */ }
    return { id: '', role: '' };
  })();

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [resetUser, setResetUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // HR cannot edit/deactivate TENANT_ADMIN users
  const canModifyUser = (user: User) => {
    const userRoleKey = typeof user.role === 'string' ? user.role : (user.role as any)?.id ?? '';
    if (currentUser.role === 'HR' && userRoleKey === 'TENANT_ADMIN') return false;
    return true;
  };

  const fetchData = async () => {
    const FALLBACK_ROLES = [
      { id: 'AGENT', name: 'Agent' },
      { id: 'SALES_MANAGER', name: 'Sales Manager' },
      { id: 'HR', name: 'HR' },
      { id: 'FINANCE', name: 'Finance' },
      { id: 'PROCUREMENT', name: 'Procurement' },
    ];

    try {
      const fetchUsers = api.get('/users').then(r => {
        const d = r.data?.data ?? r.data;
        setUsers(Array.isArray(d) ? d : []);
      }).catch(err => console.error('Failed to fetch users:', err));

      const fetchRoles = api.get('/users/available-roles').then(r => {
        const d = r.data?.data ?? r.data;
        if (Array.isArray(d) && d.length > 0) setRoles(d);
        else if (roles.length === 0) setRoles(FALLBACK_ROLES);
      }).catch(err => {
        console.error('Failed to fetch roles:', err);
        if (roles.length === 0) setRoles(FALLBACK_ROLES);
      });

      await Promise.allSettled([fetchUsers, fetchRoles]);
    } catch (e) { 
      console.error('Data fetch error:', e); 
      if (roles.length === 0) setRoles(FALLBACK_ROLES);
    }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (fullDelete: boolean) => {
    if (!deletingUser) return;
    setDeleteLoading(true);
    try { 
      await api.delete(`/users/${deletingUser.id}?fullDelete=${fullDelete}`); 
      setDeletingUser(null);
      fetchData(); 
    }
    catch (e) { console.error(e); }
    finally { setDeleteLoading(false); }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await api.put(`/users/${user.id}`, {
        status: user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
      });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const filtered = useMemo(() => (users || []).filter(u => {
    const q = search.toLowerCase();
    const roleId = typeof u.role === 'string' ? u.role : (u.role as any).id;
    const matchQ = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.phone ?? '').includes(q);
    const matchRole = roleFilter === 'ALL' || roleId === roleFilter;
    const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchQ && matchRole && matchStatus;
  }), [users, search, roleFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.status === 'ACTIVE').length,
    inactive: users.filter(u => u.status === 'INACTIVE').length,
    byRole: roles.map(r => ({ name: r.name, count: users.filter(u => {
      const userRoleName = typeof u.role === 'string' ? u.role : (u.role as any).name;
      return userRoleName === r.name;
    }).length })),
  }), [users, roles]);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} mb={4} spacing={2}>
        <Box>
          <Typography variant="h3" fontWeight={900} letterSpacing={-1.5} sx={{ fontFamily: '"Playfair Display", serif' }}>
            Team Management
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={0.5}>
            Manage users, roles, access and credentials
          </Typography>
        </Box>
        <Button variant="contained" disableElevation startIcon={<AddOutlined />}
          onClick={() => navigate('onboarding/new')}
          sx={{ borderRadius: 3, px: 3, py: 1.5, textTransform: 'none', fontWeight: 700, fontSize: 14 }}>
          Add Member
        </Button>
      </Stack>
      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, borderRadius: 4, bgcolor: 'primary.main', color: 'white' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 600, letterSpacing: 0.5 }}>TOTAL TEAM</Typography>
                <Typography variant="h4" fontWeight={800}>{stats.total}</Typography>
              </Box>
              <GroupOutlined sx={{ fontSize: 40, opacity: 0.3 }} />
            </Stack>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>ACTIVE MEMBERS</Typography>
                <Typography variant="h4" fontWeight={800} color="success.main">{stats.active}</Typography>
              </Box>
              <CheckCircleOutlined sx={{ fontSize: 40, color: 'success.light', opacity: 0.5 }} />
            </Stack>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>INACTIVE</Typography>
                <Typography variant="h4" fontWeight={800} color="error.main">{stats.inactive}</Typography>
              </Box>
              <BlockOutlined sx={{ fontSize: 40, color: 'error.light', opacity: 0.5 }} />
            </Stack>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'hsl(142, 70%, 98%)' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="success.dark" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>NEW JOINERS</Typography>
                <Typography variant="h4" fontWeight={800} color="success.dark">+{users.filter(u => {
                  const created = new Date(u.createdAt);
                  const monthAgo = new Date(); monthAgo.setMonth(monthAgo.getMonth() - 1);
                  return created > monthAgo;
                }).length}</Typography>
              </Box>
              <TrendingUpOutlined sx={{ fontSize: 40, color: 'success.main', opacity: 0.5 }} />
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider', p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField fullWidth placeholder="Search by name, email or phone..."
            size="small" value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small" /></InputAdornment>,
              sx: { borderRadius: 2 }
            }} />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Role</InputLabel>
            <Select value={roleFilter} label="Role"
              onChange={e => setRoleFilter(e.target.value)} sx={{ borderRadius: 2 }}>
              <MenuItem value="ALL">All Roles</MenuItem>
              {roles.map(r => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status"
              onChange={e => setStatusFilter(e.target.value)} sx={{ borderRadius: 2 }}>
              <MenuItem value="ALL">All Status</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Card>

      {/* Table Summary */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing <strong>{filtered.length}</strong> of {users.length} members
        </Typography>
      </Box>

      {/* Table */}
      <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'hsl(215, 60%, 98%)' }}>
                <TableCell sx={{ fontWeight: 700, color: 'hsl(215, 30%, 40%)' }}>Member</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'hsl(215, 30%, 40%)' }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'hsl(215, 30%, 40%)' }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'hsl(215, 30%, 40%)' }}>Reporting To</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'hsl(215, 30%, 40%)' }}>Joined</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'hsl(215, 30%, 40%)' }}>Last Login</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'hsl(215, 30%, 40%)' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'hsl(215, 30%, 40%)' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                    <GroupOutlined sx={{ fontSize: 48, opacity: 0.2, display: 'block', mx: 'auto', mb: 1 }} />
                    No members found
                  </TableCell>
                </TableRow>
              ) : filtered.map(user => {
                const userRole = user.role;
                let roleDisplayName = '—';
                let roleKey = '';

                if (typeof userRole === 'string') {
                  roleKey = userRole;
                  roleDisplayName = userRole.replace(/_/g, ' ');
                } else if (userRole && typeof userRole === 'object') {
                  roleKey = (userRole as any).id || (userRole as any).name || '';
                  roleDisplayName = (userRole as any).name || (userRole as any).id || '—';
                }

                const roleStyle = getRoleStyle(roleKey);
                return (
                  <TableRow key={user.id} hover sx={{ '& td': { py: 1.5 } }}>
                    {/* Member */}
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Badge
                          overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          badgeContent={
                            <Box sx={{
                              width: 10, height: 10, borderRadius: '50%',
                              bgcolor: user.status === 'ACTIVE' ? '#10b981' : '#d1d5db',
                              border: '2px solid white'
                            }} />
                          }>
                          <Avatar src={(user as any).avatarUrl || ''} sx={{ width: 38, height: 38, bgcolor: avatarColor(user.name), fontSize: 13, fontWeight: 800 }}>
                            {getInitials(user.name)}
                          </Avatar>
                        </Badge>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 0.5, cursor: 'pointer', '&:hover': { color: 'primary.main', textDecoration: 'underline' } }} onClick={() => navigate(`${window.location.pathname.includes('/hr/') ? '/hr/employees' : '/admin/users'}/${user.id}/profile`)}>
                            {user.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                          {user.phone && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {user.phone}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </TableCell>

                    {/* Role */}
                    <TableCell>
                      <Chip label={roleDisplayName} size="small"
                        sx={{ fontWeight: 700, fontSize: 11, bgcolor: roleStyle.bg, color: roleStyle.color, border: 'none' }} />
                    </TableCell>

                    {/* Department */}
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {user.department || '—'}
                      </Typography>
                    </TableCell>

                    {/* Reporting To */}
                    <TableCell>
                      {user.manager ? (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar sx={{ width: 24, height: 24, fontSize: 10, bgcolor: avatarColor(user.manager.name) }}>
                            {getInitials(user.manager.name)}
                          </Avatar>
                          <Typography variant="body2">{user.manager.name}</Typography>
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.disabled">—</Typography>
                      )}
                    </TableCell>

                    {/* Joined */}
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.joiningDate
                          ? new Date(user.joiningDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '—'}
                      </Typography>
                    </TableCell>

                    {/* Last Login */}
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.lastLoginAt
                          ? new Date(user.lastLoginAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '—'}
                      </Typography>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Chip
                        label={user.status}
                        size="small"
                        icon={user.status === 'ACTIVE' ? <CheckCircleOutlined sx={{ fontSize: '14px !important' }} /> : <BlockOutlined sx={{ fontSize: '14px !important' }} />}
                        sx={{
                          fontWeight: 600,
                          fontSize: 10,
                          borderRadius: '8px',
                          bgcolor: user.status === 'ACTIVE' ? 'hsl(142, 70%, 95%)' : 'hsl(0, 70%, 95%)',
                          color: user.status === 'ACTIVE' ? 'hsl(142, 70%, 30%)' : 'hsl(0, 70%, 30%)',
                          '& .MuiChip-icon': { color: 'inherit' }
                        }}
                      />
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {user.tempPassword && (
                           <Tooltip title={`Temp Password: ${user.tempPassword}`}>
                             <IconButton size="small" color="warning" onClick={() => { navigator.clipboard.writeText(user.tempPassword!) }}>
                               <KeyOutlined fontSize="small" />
                             </IconButton>
                           </Tooltip>
                        )}
                        {canModifyUser(user) ? (
                          <RowMenu
                            user={user}
                            currentUser={currentUser}
                            onEdit={() => navigate(`onboarding/edit/${user.id}`)}
                            onDelete={() => setDeletingUser(user)}
                            onResetPassword={() => setResetUser(user)}
                            onToggleStatus={() => handleToggleStatus(user)}
                          />
                        ) : (
                          <Tooltip title="Only Tenant Admin can manage this user">
                            <span>
                              <IconButton size="small" disabled>
                                <ShieldOutlined fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Dialogs */}
      <PasswordResetDialog
        open={!!resetUser} user={resetUser}
        onClose={() => setResetUser(null)}
      />

      <DeleteMemberDialog
        open={!!deletingUser}
        userName={deletingUser?.name || ''}
        loading={deleteLoading}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
};

export default UsersPage;