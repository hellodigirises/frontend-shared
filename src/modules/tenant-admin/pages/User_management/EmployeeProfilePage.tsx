import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, Stack, Grid, Avatar, Chip, Button,
  Tab, Tabs, IconButton, Divider, CircularProgress, Paper,
  List, ListItem, ListItemIcon, ListItemText, Breadcrumbs, Link,
  Tooltip, Badge
} from '@mui/material';
import {
  ArrowBackOutlined, EditOutlined, EmailOutlined, PhoneOutlined,
  BusinessCenterOutlined, CalendarTodayOutlined, BadgeOutlined,
  ArticleOutlined, CloudDownloadOutlined, VerifiedUserOutlined,
  FactCheckOutlined, HistoryOutlined, MoreVertOutlined,
  CheckCircleOutlined, ErrorOutline
} from '@mui/icons-material';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import api from '../../../../api/axios';

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444'];
const avatarColor = (name: string) => COLORS[name.charCodeAt(0) % COLORS.length];

interface EmployeeProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  department?: string;
  joiningDate?: string;
  employeeId?: string;
  avatarUrl?: string;
  isActive: boolean;
  companyEmail?: string;
  manager?: { id: string, name: string };
  Employee?: {
    documents: any[];
    status: string;
    designation?: string;
    employmentType?: string;
    salary?: number;
  };
}

const EmployeeProfilePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = window.location.pathname;
  const isHR = location.includes('/hr/');
  const onboardingPath = isHR ? `/hr/employees/onboarding/edit/${id}` : `/admin/users/onboarding/edit/${id}`;
  const listPath = isHR ? '/hr/employees' : '/admin/users';

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

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<EmployeeProfile | null>(null);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const res = await api.get(`/users/${id}`);
      setUser(res.data?.data ?? res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress size={40} />
    </Box>
  );

  if (!user) return (
    <Box textAlign="center" py={10}>
      <ErrorOutline sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
      <Typography variant="h6">User not found</Typography>
      <Button onClick={() => navigate(listPath)}>Go Back</Button>
    </Box>
  );

  const targetRole = typeof user.role === 'string' ? user.role : (user.role as any).id;
  const isTargetAdmin = targetRole === 'TENANT_ADMIN';
  const isRestricted = currentUser.role === 'HR' && isTargetAdmin;
  const isSelf = user.id === currentUser.id;

  let roleLabel = typeof user.role === 'string' ? user.role.replace(/_/g, ' ') : (user.role as any).name || 'Member';
  if (isTargetAdmin) {
    roleLabel = (currentUser.role === 'HR') ? 'Owner / Admin' : 'Admin';
  }

  return (
    <Box maxWidth={1000} mx="auto">
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link component={RouterLink} to={listPath} underline="hover" color="inherit" sx={{ fontSize: 13 }}>
          {isHR ? 'Employees' : 'Users'}
        </Link>
        <Typography color="text.primary" sx={{ fontSize: 13 }}>Profile</Typography>
      </Breadcrumbs>

      {/* Header Card */}
      <Card sx={{ p: 4, borderRadius: 4, boxShadow: 'none', border: '1px solid', borderColor: 'divider', mb: 3 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Box sx={{ bgcolor: user.isActive ? 'success.main' : 'error.main', width: 14, height: 14, borderRadius: '50%', border: '2px solid white' }} />
              }
            >
              <Avatar
                src={user.avatarUrl}
                sx={{ width: 120, height: 120, bgcolor: avatarColor(user.name), fontSize: 48, fontWeight: 800 }}
              >
                {getInitials(user.name)}
              </Avatar>
            </Badge>
          </Grid>
          <Grid item xs>
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="h4" fontWeight={900}>{user.name}</Typography>
                <Chip label={roleLabel} variant="outlined" sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: 11, letterSpacing: 1 }} />
              </Stack>
              <Typography color="text.secondary" variant="body1">{user.department || 'General'}</Typography>
              <Stack direction="row" spacing={3} mt={1}>
                {user.email && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <EmailOutlined sx={{ fontSize: 16, color: 'text.disabled' }} />
                    <Typography variant="body2">{user.email}</Typography>
                  </Stack>
                )}
                {user.phone && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PhoneOutlined sx={{ fontSize: 16, color: 'text.disabled' }} />
                    <Typography variant="body2">{user.phone}</Typography>
                  </Stack>
                )}
                {user.employeeId && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <BadgeOutlined sx={{ fontSize: 16, color: 'text.disabled' }} />
                    <Typography variant="body2" fontWeight={700}>{user.employeeId}</Typography>
                  </Stack>
                )}
              </Stack>
            </Stack>
          </Grid>
          <Grid item>
            <Tooltip title={isRestricted ? "HR cannot edit Tenant Admin" : ""}>
              <span>
                <Button
                  variant="contained"
                  startIcon={<EditOutlined />}
                  onClick={() => navigate(onboardingPath)}
                  disabled={isRestricted}
                  sx={{ borderRadius: 3, px: 3, py: 1, fontWeight: 700, boxShadow: 'none' }}
                >
                  Edit Profile
                </Button>
              </span>
            </Tooltip>
          </Grid>
        </Grid>
      </Card>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Overview" icon={<BusinessCenterOutlined />} iconPosition="start" sx={{ textTransform: 'none', fontWeight: 700 }} />
          <Tab label="Documents" icon={<ArticleOutlined />} iconPosition="start" sx={{ textTransform: 'none', fontWeight: 700 }} />
          <Tab label="Professional" icon={<FactCheckOutlined />} iconPosition="start" sx={{ textTransform: 'none', fontWeight: 700 }} />
          <Tab label="Activity" icon={<HistoryOutlined />} iconPosition="start" sx={{ textTransform: 'none', fontWeight: 700 }} />
        </Tabs>
      </Box>

      {/* Tab Contents */}
      <Box mb={5}>
        {tab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card sx={{ p: 3, borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight={800} mb={2}>Employment Details</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Joined Since</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {user.joiningDate ? new Date(user.joiningDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Employment Status</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                       <CheckCircleOutlined color={user.isActive ? 'success' : 'error'} sx={{ fontSize: 16 }} />
                       <Typography variant="body1" fontWeight={600}>{user.isActive ? 'Active' : 'Inactive'}</Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Reporting Manager</Typography>
                    <Typography variant="body1" fontWeight={600}>{user.manager?.name || 'Self / None'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Company Email</Typography>
                    <Typography variant="body1" fontWeight={600} color="primary">{user.companyEmail || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight={800} mb={2}>Quick Actions</Typography>
                <Stack spacing={1}>
                   <Button variant="outlined" sx={{ borderRadius: 2, justifyContent: 'flex-start' }} startIcon={<EmailOutlined />}>Send Email</Button>
                   <Tooltip title={isRestricted ? "HR cannot reset Admin password" : ""}>
                      <span>
                        <Button fullWidth variant="outlined" disabled={isRestricted} sx={{ borderRadius: 2, justifyContent: 'flex-start' }} startIcon={<VerifiedUserOutlined />}>
                          Reset Password
                        </Button>
                      </span>
                   </Tooltip>
                   <Tooltip title={isSelf ? "Self-deletion blocked" : isRestricted ? "HR cannot deactivate Admin" : ""}>
                      <span>
                        <Button fullWidth variant="outlined" color="error" disabled={isRestricted || isSelf} sx={{ borderRadius: 2, justifyContent: 'flex-start' }} startIcon={<ErrorOutline />}>
                          {isSelf ? 'Self-Locked' : 'Deactivate Account'}
                        </Button>
                      </span>
                   </Tooltip>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        )}

        {tab === 1 && (
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" fontWeight={800} mb={2}>Documents & KYC Records</Typography>
            <List disablePadding>
              {user.Employee?.documents && user.Employee.documents.length > 0 ? (
                user.Employee.documents.map((doc: any, i: number) => (
                  <React.Fragment key={i}>
                    {i > 0 && <Divider variant="inset" component="li" />}
                    <ListItem sx={{ py: 2 }}>
                      <ListItemIcon>
                        <ArticleOutlined sx={{ fontSize: 32, color: 'primary.main' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography fontWeight={700}>{doc.documentType} - {doc.docNumber || 'No Number'}</Typography>}
                        secondary={doc.notes || 'Official Document'}
                      />
                      {doc.fileUrl && (
                        <IconButton component="a" href={doc.fileUrl} target="_blank" download>
                           <CloudDownloadOutlined />
                        </IconButton>
                      )}
                    </ListItem>
                  </React.Fragment>
                ))
              ) : (
                <Typography color="text.disabled" textAlign="center" py={4}>No documents uploaded yet.</Typography>
              )}
            </List>
          </Card>
        )}

        {tab === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Card sx={{ p: 3, borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight={800} mb={2}>Career & Professional Info</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Current Designation</Typography>
                    <Typography variant="body1" fontWeight={600}>{user.Employee?.designation || user.department || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Employment Type</Typography>
                    <Typography variant="body1" fontWeight={600}>{user.Employee?.employmentType || 'FULL_TIME'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Current Salary</Typography>
                    <Typography variant="body1" fontWeight={600}>₹ {user.Employee?.salary?.toLocaleString('en-IN') || '0'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Hiring Status</Typography>
                    <Chip size="small" label={user.Employee?.status || 'ACTIVE'} color="info" sx={{ fontWeight: 700, fontSize: 10 }} />
                  </Grid>
                </Grid>
              </Card>
            </Grid>
            <Grid item xs={12} md={5}>
              <Card sx={{ p: 3, borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight={800} mb={2}>Skills & Competencies</Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {['Teamwork', 'Communication', 'Problem Solving'].map(s => (
                    <Chip key={s} label={s} size="small" variant="outlined" />
                  ))}
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>More skills coming soon...</Typography>
                </Box>
              </Card>
            </Grid>
          </Grid>
        )}

        {tab === 3 && (
          <Typography color="text.secondary" textAlign="center" py={10}>Recent user activity logs will be visible here.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default EmployeeProfilePage;
