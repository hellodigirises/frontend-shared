import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, Stack, Tab, Tabs, Grid, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Avatar, CircularProgress, IconButton, Tooltip, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import {
  AddOutlined, DashboardOutlined, PeopleOutlined, EventNoteOutlined,
  PaymentsOutlined, CampaignOutlined, MoreVertOutlined, CheckCircleOutline, CancelOutlined,
  PersonOffOutlined, VisibilityOutlined
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../hr/hooks';
import {
  fetchDashboard, fetchEmployees, fetchLeaves, fetchPayrolls, fetchAnnouncements,
  doCreateEmployee, doDeactivate, doApproveLeave, doRejectLeave,
  type Employee, type LeaveRequest, type PayrollRecord, type Announcement
} from '../../../hr/store/hrSlice';

// ── Components ────────────────────────────────────────────────────────────────

const StatCard = ({ title, value, subtitle, icon, color }: any) => (
  <Card variant="outlined" sx={{ p: 3, borderRadius: 4, height: '100%', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
    <Stack direction="row" spacing={2} alignItems="center">
      <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: `${color}.50`, color: `${color}.main` }}>{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>{title}</Typography>
        <Typography variant="h5" fontWeight={800}>{value}</Typography>
        {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
      </Box>
    </Stack>
  </Card>
);

const SectionHeader = ({ title, subtitle, action }: any) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
    <Box>
      <Typography variant="h6" fontWeight={700}>{title}</Typography>
      {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
    </Box>
    {action}
  </Stack>
);

// ── Tabs ──────────────────────────────────────────────────────────────────────

const OverviewTab = ({ data }: { data: any }) => (
  <Box>
    <Grid container spacing={3} mb={4}>
      <Grid item xs={12} md={3}>
        <StatCard title="Total Staff" value={data?.totalEmployees || 0} icon={<PeopleOutlined />} color="primary" />
      </Grid>
      <Grid item xs={12} md={3}>
        <StatCard title="Present Today" value={data?.todayAttendance || 0} subtitle={`of ${data?.activeEmployees || 0} active`} icon={<CheckCircleOutline />} color="success" />
      </Grid>
      <Grid item xs={12} md={3}>
        <StatCard title="Pending Leaves" value={data?.pendingLeaves || 0} icon={<EventNoteOutlined />} color="warning" />
      </Grid>
      <Grid item xs={12} md={3}>
        <StatCard title="Gross Payroll" value={`₹${((data?.monthlyPayroll?.gross || 0) / 100000).toFixed(2)}L`} icon={<PaymentsOutlined />} color="indigo" />
      </Grid>
    </Grid>

    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card variant="outlined" sx={{ p: 3, borderRadius: 4, border: '1px solid #e2e8f0', minHeight: 400 }}>
          <Typography variant="subtitle1" fontWeight={700} mb={2}>Staff Status</Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">Trend visualization would go here</Typography>
          </Box>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card variant="outlined" sx={{ p: 3, borderRadius: 4, border: '1px solid #e2e8f0', height: '100%' }}>
          <Typography variant="subtitle1" fontWeight={700} mb={2}>Top Performers</Typography>
          <Stack spacing={2}>
            {data?.topPerformers?.length > 0 ? data.topPerformers.map((p: any) => (
              <Stack key={p.id} direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ width: 32, height: 32, fontSize: 13, fontWeight: 700 }}>{p.name[0]}</Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" fontWeight={600}>{p.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{p.designation}</Typography>
                </Box>
                <Chip label={p.bookingsClosed} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
              </Stack>
            )) : <Typography variant="body2" color="text.secondary">No data available</Typography>}
          </Stack>
        </Card>
      </Grid>
    </Grid>
  </Box>
);

const HRPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dashboard, employees, leaves, payrolls, announcements, loading } = useAppSelector(s => s.hr);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    dispatch(fetchDashboard());
    dispatch(fetchEmployees({ take: 20 }));
    dispatch(fetchLeaves({ take: 20 }));
    dispatch(fetchPayrolls({ take: 20 }));
    dispatch(fetchAnnouncements({ take: 10 }));
  }, [dispatch]);

  const handleTabChange = (_: any, n: number) => setTab(n);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={800} letterSpacing={-1}>HR Management</Typography>
          <Typography variant="body1" color="text.secondary">Central control for workforce, leaves, and payroll.</Typography>
        </Box>
        <Box sx={{ bgcolor: 'white', borderRadius: 2, p: 0.5, border: '1px solid #e2e8f0' }}>
          <Tabs value={tab} onChange={handleTabChange} sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, py: 1, textTransform: 'none', fontWeight: 600, fontSize: 13 } }}>
            <Tab icon={<DashboardOutlined sx={{ fontSize: 18 }} />} iconPosition="start" label="Overview" />
            <Tab icon={<PeopleOutlined sx={{ fontSize: 18 }} />} iconPosition="start" label="Staff" />
            <Tab icon={<EventNoteOutlined sx={{ fontSize: 18 }} />} iconPosition="start" label="Leaves" />
            <Tab icon={<PaymentsOutlined sx={{ fontSize: 18 }} />} iconPosition="start" label="Payroll" />
            <Tab icon={<CampaignOutlined sx={{ fontSize: 18 }} />} iconPosition="start" label="Notice" />
          </Tabs>
        </Box>
      </Stack>

      {tab === 0 && <OverviewTab data={dashboard} />}

      {tab === 1 && (
        <Card variant="outlined" sx={{ borderRadius: 4, border: '1px solid #e2e8f0' }}>
          <Box p={3} borderBottom="1px solid #f1f5f9">
            <SectionHeader title="Employee Directory" subtitle={`${employees.total} registered staff members`}
              action={<Button variant="contained" size="small" startIcon={<AddOutlined />} sx={{ borderRadius: 2, textTransform: 'none' }}>Onboard</Button>} />
          </Box>
          <TableContainer>
            <Table>
              <TableHead><TableRow sx={{ bgcolor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 700 }}>Employee</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Dept/Role</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow></TableHead>
              <TableBody>
                {employees.data.map(emp => (
                  <TableRow key={emp.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.50', color: 'primary.main', fontWeight: 700 }}>{emp.name[0]}</Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={700}>{emp.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{emp.employeeCode}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{emp.designation}</Typography>
                      <Typography variant="caption" color="text.secondary">{emp.department}</Typography>
                    </TableCell>
                    <TableCell><Chip label={emp.employmentType} size="small" variant="outlined" sx={{ fontWeight: 700, fontSize: 10 }} /></TableCell>
                    <TableCell>
                      <Chip label={emp.status} size="small" color={emp.status === 'ACTIVE' ? 'success' : 'default'} sx={{ fontWeight: 700, fontSize: 10 }} />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small"><VisibilityOutlined sx={{ fontSize: 18 }} /></IconButton>
                      <IconButton size="small" color="error" disabled={emp.status !== 'ACTIVE'} onClick={() => dispatch(doDeactivate({ id: emp.id }))}><PersonOffOutlined sx={{ fontSize: 18 }} /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {tab === 2 && (
        <Card variant="outlined" sx={{ borderRadius: 4, border: '1px solid #e2e8f0' }}>
          <Box p={3} borderBottom="1px solid #f1f5f9">
            <SectionHeader title="Leave Requests" subtitle="Review and approve employee time-off" />
          </Box>
          <TableContainer>
            <Table>
              <TableHead><TableRow sx={{ bgcolor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 700 }}>Employee</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Duration</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Decision</TableCell>
              </TableRow></TableHead>
              <TableBody>
                {leaves.data.map(lv => (
                  <TableRow key={lv.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32, fontSize: 13 }}>{lv.employee?.name?.[0]}</Avatar>
                        <Typography variant="body2" fontWeight={600}>{lv.employee?.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell><Typography variant="body2">{lv.leaveType}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{lv.totalDays} days</Typography><Typography variant="caption" color="text.secondary">{new Date(lv.startDate).toLocaleDateString()} to {new Date(lv.endDate).toLocaleDateString()}</Typography></TableCell>
                    <TableCell><Chip label={lv.status} size="small" color={lv.status === 'PENDING' ? 'warning' : lv.status === 'APPROVED' ? 'success' : 'error'} sx={{ fontWeight: 700, fontSize: 10 }} /></TableCell>
                    <TableCell align="right">
                      {lv.status === 'PENDING' ? (
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button size="small" variant="contained" color="success" onClick={() => dispatch(doApproveLeave({ id: lv.id, actorType: 'TENANT_ADMIN' }))} sx={{ borderRadius: 1.5, px: 1, minWidth: 0 }}><CheckCircleOutline sx={{ fontSize: 18 }} /></Button>
                          <Button size="small" variant="contained" color="error" onClick={() => dispatch(doRejectLeave({ id: lv.id, actorType: 'TENANT_ADMIN' }))} sx={{ borderRadius: 1.5, px: 1, minWidth: 0 }}><CancelOutlined sx={{ fontSize: 18 }} /></Button>
                        </Stack>
                      ) : <Typography variant="caption" color="text.secondary">Processed</Typography>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {tab === 3 && (
        <Card variant="outlined" sx={{ borderRadius: 4, border: '1px solid #e2e8f0' }}>
          <Box p={3} borderBottom="1px solid #f1f5f9">
            <SectionHeader title="Payroll Oversight" subtitle="Monthly salary disbursement and deductions" />
          </Box>
          <TableContainer>
            <Table>
              <TableHead><TableRow sx={{ bgcolor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 700 }}>Employee</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Period</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Net Pay</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow></TableHead>
              <TableBody>
                {payrolls.data.map(p => (
                  <TableRow key={p.id}>
                    <TableCell><Typography variant="body2" fontWeight={600}>{p.employee?.name}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][p.month]} {p.year}</Typography></TableCell>
                    <TableCell><Typography variant="body2" fontWeight={700}>₹{p.netSalary.toLocaleString()}</Typography></TableCell>
                    <TableCell><Chip label={p.isPaid ? 'PAID' : 'PENDING'} size="small" color={p.isPaid ? 'success' : 'warning'} sx={{ fontWeight: 700, fontSize: 10 }} /></TableCell>
                    <TableCell align="right"><Button size="small">Details</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {tab === 4 && (
        <Box>
          <SectionHeader title="Announcements" subtitle="Manage tenant-wide communications"
            action={<Button variant="contained" size="small" startIcon={<AddOutlined />} sx={{ borderRadius: 2, textTransform: 'none' }}>Create Post</Button>} />
          <Grid container spacing={2}>
            {announcements.data.map(a => (
              <Grid item xs={12} md={6} key={a.id}>
                <Card variant="outlined" sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0' }}>
                  <Stack direction="row" justifyContent="space-between" mb={1.5}>
                    <Chip label={a.audience} size="small" sx={{ fontWeight: 700, fontSize: 9, height: 20 }} />
                    <Typography variant="caption" color="text.secondary">{new Date(a.createdAt).toLocaleDateString()}</Typography>
                  </Stack>
                  <Typography variant="subtitle2" fontWeight={700} mb={1}>{a.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {a.message}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default HRPage;
