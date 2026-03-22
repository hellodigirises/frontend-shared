import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, Button, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Avatar, Chip, IconButton,
  TextField, CircularProgress, Grid, Tooltip, InputAdornment,
  Badge, Menu, MenuItem, ListItemIcon, ListItemText, Divider,
  FormControl, InputLabel, Select
} from '@mui/material';
import {
  AddOutlined, EditOutlined, SearchOutlined, GroupOutlined,
  MoreVertOutlined, CheckCircleOutlined, BlockOutlined,
  TrendingUpOutlined, RefreshOutlined, FilterListOutlined,
  VisibilityOutlined, DeleteOutline, ShieldOutlined
} from '@mui/icons-material';
import api from '../../../api/axios';
import { H } from '../hooks';
import DeleteMemberDialog from '../../tenant-admin/components/DeleteMemberDialog';

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
  isActive: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  role: string | { id: string; name: string };
  manager?: { id: string; name: string };
  avatarUrl?: string;
  createdAt: string;
}

interface Role { id: string; name: string }

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
};

const roleStyle = (role: string) => ROLE_COLORS[role] ?? { bg: '#f3f4f6', color: '#374151' };
const initials  = (n: string) => n.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
const AVATAR_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444'];
const avatarColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

/* ─────────────────────────────────────────
   Row Action Menu
 ───────────────────────────────────────── */
const RowMenu = ({
  user, onEdit, onViewProfile, onDelete, onToggleStatus, currentUser
}: {
  user: User;
  currentUser: { id: string, role: string };
  onEdit: () => void; onViewProfile: () => void;
  onDelete: () => void; onToggleStatus: () => void;
}) => {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const close = () => setAnchor(null);

  const isSelf = user.id === currentUser.id;
  const isTargetAdmin = typeof user.role === 'string' ? user.role === 'TENANT_ADMIN' : (user.role as any).id === 'TENANT_ADMIN';
  const isHrRestricted = currentUser.role === 'HR' && isTargetAdmin;
  const canDelete = !isSelf && !isHrRestricted;
  const canEdit = !isHrRestricted;
  const canToggle = !isHrRestricted;

  return (
    <>
      <IconButton size="small" onClick={e => setAnchor(e.currentTarget)}>
        <MoreVertOutlined fontSize="small" />
      </IconButton>
      <Menu anchorEl={anchor} open={!!anchor} onClose={close}
        PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,.12)', minWidth: 180 } }}>
        <MenuItem onClick={() => { onViewProfile(); close(); }} sx={{ py: 1.25 }}>
          <ListItemIcon><VisibilityOutlined fontSize="small" /></ListItemIcon>
          <ListItemText primary="View Profile" primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }} />
        </MenuItem>
        <MenuItem onClick={() => { onEdit(); close(); }} sx={{ py: 1.25 }} disabled={!canEdit}>
          <ListItemIcon><EditOutlined fontSize="small" /></ListItemIcon>
          <ListItemText primary="Edit" primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }} />
        </MenuItem>
        <MenuItem onClick={() => { onToggleStatus(); close(); }} sx={{ py: 1.25 }} disabled={!canToggle}>
          <ListItemIcon>
            {user.isActive !== false
              ? <BlockOutlined fontSize="small" color="warning" />
              : <CheckCircleOutlined fontSize="small" color="success" />}
          </ListItemIcon>
          <ListItemText
            primary={user.isActive !== false ? 'Deactivate' : 'Activate'}
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
export default function EmployeesPage() {
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
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [uRes, rRes] = await Promise.all([
        api.get('/users'), api.get('/users/available-roles'),
      ]);
      const userData = uRes.data?.data ?? uRes.data;
      const rolesData = rRes.data?.data ?? rRes.data;
      setUsers(Array.isArray(userData) ? userData : []);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
    } catch (e) { console.error(e); }
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
    } catch (e) { console.error(e); }
    finally { setDeleteLoading(false); }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await api.put(`/users/${user.id}`, {
        status: user.isActive !== false ? 'INACTIVE' : 'ACTIVE',
      });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const filtered = useMemo(() => users.filter(u => {
    const q = search.toLowerCase();
    const roleId = typeof u.role === 'string' ? u.role : (u.role as any).id;
    const matchQ = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = roleFilter === 'ALL' || roleId === roleFilter;
    const matchStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' ? u.isActive !== false : u.isActive === false);
    return matchQ && matchRole && matchStatus;
  }), [users, search, roleFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.isActive !== false).length,
    inactive: users.filter(u => u.isActive === false).length,
    newJoiners: users.filter(u => {
      const created = new Date(u.createdAt);
      const monthAgo = new Date(); monthAgo.setMonth(monthAgo.getMonth() - 1);
      return created > monthAgo;
    }).length
  }), [users]);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress sx={{ color: H.primary }} />
    </Box>
  );

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={900} letterSpacing={-1} color="text.primary">
            Team Members
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your organization's workforce and access
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddOutlined />}
          onClick={() => navigate('/hr/employees/onboarding/new')}
          sx={{ bgcolor: H.primary, borderRadius: 3, px: 3, textTransform: 'none', fontWeight: 700 }}>
          Add Member
        </Button>
      </Stack>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, borderRadius: 4, bgcolor: H.primary, color: 'white' }}>
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
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>ACTIVE</Typography>
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
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>OFF-BOARDED</Typography>
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
                <Typography variant="caption" color="success.dark" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>NEW JOINEES</Typography>
                <Typography variant="h4" fontWeight={800} color="success.dark">+{stats.newJoiners}</Typography>
              </Box>
              <TrendingUpOutlined sx={{ fontSize: 40, color: 'success.main', opacity: 0.5 }} />
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider', p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField fullWidth placeholder="Search by name or email…"
            size="small" value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small" /></InputAdornment>,
              sx: { borderRadius: 2 }
            }} />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Role</InputLabel>
            <Select value={roleFilter} label="Role" onChange={e => setRoleFilter(e.target.value)} sx={{ borderRadius: 2 }}>
              <MenuItem value="ALL">All Roles</MenuItem>
              {roles.map(r => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)} sx={{ borderRadius: 2 }}>
              <MenuItem value="ALL">All Status</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Card>

      {/* Table */}
      <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'hsl(215, 60%, 98%)' }}>
                <TableCell sx={{ fontWeight: 700, color: 'hsl(215, 30%, 40%)', fontSize: 12 }}>Member</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'hsl(215, 30%, 40%)', fontSize: 12 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'hsl(215, 30%, 40%)', fontSize: 12 }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'hsl(215, 30%, 40%)', fontSize: 12 }}>Joining Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'hsl(215, 30%, 40%)', fontSize: 12 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'hsl(215, 30%, 40%)', fontSize: 12 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                    <GroupOutlined sx={{ fontSize: 48, opacity: 0.2, display: 'block', mx: 'auto', mb: 1 }} />
                    No members found
                  </TableCell>
                </TableRow>
              ) : filtered.map(user => {
                const roleKey = typeof user.role === 'string' ? user.role : (user.role as any).id;
                let roleName = typeof user.role === 'string' ? user.role.replace(/_/g,' ') : (user.role as any).name;
                
                // Label TENANT_ADMIN as Owner/Admin for HR
                if (roleKey === 'TENANT_ADMIN') {
                   roleName = (currentUser.role === 'HR') ? 'Owner / Admin' : 'Admin';
                }

                const style = roleStyle(roleKey);
                const active = user.isActive !== false;

                return (
                  <TableRow key={user.id} hover sx={{ '& td': { py: 1.5 } }}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar src={user.avatarUrl} sx={{ width: 36, height: 36, bgcolor: avatarColor(user.name), fontSize: 13, fontWeight: 800 }}>
                          {initials(user.name)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600} 
                            sx={{ cursor: 'pointer', '&:hover': { color: H.primary, textDecoration: 'underline' } }}
                            onClick={() => navigate(`/hr/employees/${user.id}/profile`)}>
                            {user.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip label={roleName} size="small" sx={{ bgcolor: style.bg, color: style.color, fontWeight: 700, fontSize: 10, height: 22 }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">{user.department ?? '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {user.joiningDate ? new Date(user.joiningDate).toLocaleDateString('en-IN') : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={active ? 'Active' : 'Inactive'} size="small"
                        sx={{ bgcolor: active ? 'hsl(142,70%,95%)' : '#f3f4f6', color: active ? 'hsl(142,70%,30%)' : '#6b7280', fontWeight: 700, fontSize: 10, height: 22 }} />
                    </TableCell>
                    <TableCell align="right">
                      <RowMenu
                        user={user}
                        currentUser={currentUser}
                        onViewProfile={() => navigate(`/hr/employees/${user.id}/profile`)}
                        onEdit={() => navigate(`/hr/employees/onboarding/edit/${user.id}`)}
                        onDelete={() => setDeletingUser(user)}
                        onToggleStatus={() => handleToggleStatus(user)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <DeleteMemberDialog
        open={!!deletingUser}
        userName={deletingUser?.name || ''}
        loading={deleteLoading}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
}
