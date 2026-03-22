import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Card, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, Grid,
  CircularProgress, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Select, FormControl, InputLabel,
  Tabs, Tab, Tooltip, Badge, Divider, Avatar, LinearProgress,
  InputAdornment, Menu, ListItemIcon, ListItemText, Snackbar, Alert,
  Paper, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import {
  ReceiptLongOutlined, CheckCircleOutlined, CancelOutlined,
  FileDownloadOutlined, FilterListOutlined, SearchOutlined,
  MoreVertOutlined, AccountBalanceOutlined, PaymentsOutlined,
  TrendingUpOutlined, PendingActionsOutlined, BarChartOutlined,
  VisibilityOutlined, CloseOutlined, InfoOutlined,
  ArrowUpwardOutlined, ArrowDownwardOutlined, RefreshOutlined,
  MonetizationOnOutlined, AssignmentTurnedInOutlined
} from '@mui/icons-material';

// ─── Types ───────────────────────────────────────────────────────────────────

type CommissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
type PaymentMode = 'Bank Transfer' | 'Cheque' | 'UPI';
type CommissionType = 'PERCENTAGE' | 'FIXED' | 'SLAB' | 'MILESTONE';

interface Commission {
  id: string;
  partnerName: string;
  partnerAvatar?: string;
  project: string;
  unitNumber: string;
  bookingAmount: number;
  commissionType: CommissionType;
  commissionRate?: number;
  amount: number;
  status: CommissionStatus;
  triggerEvent: string;
  createdDate: string;
  processedDate?: string;
  paymentMode?: PaymentMode;
  transactionRef?: string;
  notes?: string;
  approvedBy?: string;
}

interface PayoutFormData {
  paymentMode: PaymentMode;
  transactionRef: string;
  paymentDate: string;
  notes: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_COMMISSIONS: Commission[] = [
  {
    id: 'CMR-001', partnerName: 'Elite Realty', project: 'Orchid Heights', unitNumber: 'A-1204',
    bookingAmount: 8500000, commissionType: 'PERCENTAGE', commissionRate: 2.5, amount: 212500,
    status: 'PAID', triggerEvent: 'Booking Confirmed', createdDate: '2025-06-01',
    processedDate: '2025-06-10', paymentMode: 'Bank Transfer', transactionRef: 'TXN-00871',
    approvedBy: 'Rahul Sharma'
  },
  {
    id: 'CMR-002', partnerName: 'John Doe Partners', project: 'Skyline Residency', unitNumber: 'B-304',
    bookingAmount: 4200000, commissionType: 'FIXED', amount: 50000,
    status: 'APPROVED', triggerEvent: 'First Payment', createdDate: '2025-06-08',
    approvedBy: 'Priya Mehta'
  },
  {
    id: 'CMR-003', partnerName: 'Horizon Homes', project: 'Orchid Heights', unitNumber: 'C-901',
    bookingAmount: 12000000, commissionType: 'SLAB', commissionRate: 2.0, amount: 240000,
    status: 'PENDING', triggerEvent: 'Booking Confirmed', createdDate: '2025-06-12'
  },
  {
    id: 'CMR-004', partnerName: 'Prime Properties', project: 'Green Valley', unitNumber: 'D-102',
    bookingAmount: 6800000, commissionType: 'MILESTONE', amount: 85000,
    status: 'REJECTED', triggerEvent: 'Milestone 1', createdDate: '2025-06-05',
    notes: 'Documentation mismatch'
  },
  {
    id: 'CMR-005', partnerName: 'City Brokers', project: 'Skyline Residency', unitNumber: 'A-501',
    bookingAmount: 9500000, commissionType: 'PERCENTAGE', commissionRate: 2.0, amount: 190000,
    status: 'PAID', triggerEvent: 'Booking Confirmed', createdDate: '2025-05-20',
    processedDate: '2025-05-30', paymentMode: 'UPI', transactionRef: 'UPI-44392',
    approvedBy: 'Rahul Sharma'
  },
  {
    id: 'CMR-006', partnerName: 'Elite Realty', project: 'Green Valley', unitNumber: 'B-210',
    bookingAmount: 5500000, commissionType: 'PERCENTAGE', commissionRate: 2.5, amount: 137500,
    status: 'APPROVED', triggerEvent: 'Booking Confirmed', createdDate: '2025-06-14',
    approvedBy: 'Priya Mehta'
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusConfig: Record<CommissionStatus, { color: 'success' | 'warning' | 'error' | 'info'; label: string }> = {
  PAID:     { color: 'success', label: 'Paid' },
  APPROVED: { color: 'info',    label: 'Approved' },
  PENDING:  { color: 'warning', label: 'Pending' },
  REJECTED: { color: 'error',   label: 'Rejected' },
};

const fmt = (n: number) =>
  n >= 10_00_000 ? `₹${(n / 10_00_000).toFixed(2)}L`
  : n >= 1_000   ? `₹${(n / 1_000).toFixed(1)}K`
  : `₹${n}`;

const initials = (name: string) =>
  name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

const avatarColor = (name: string) => {
  const colors = ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#8b5cf6'];
  return colors[name.charCodeAt(0) % colors.length];
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard: React.FC<{
  label: string; value: string; sub?: string;
  color: string; icon: React.ReactNode; trend?: number;
}> = ({ label, value, sub, color, icon, trend }) => (
  <Card sx={{
    p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)', height: '100%',
    background: `linear-gradient(135deg, ${color}08 0%, white 100%)`
  }}>
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
      <Box>
        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.8 }}>
          {label}
        </Typography>
        <Typography variant="h4" fontWeight={900} sx={{ mt: 0.5, color: color, letterSpacing: -1 }}>
          {value}
        </Typography>
        {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
        {trend !== undefined && (
          <Stack direction="row" alignItems="center" spacing={0.5} mt={0.5}>
            {trend >= 0 ? <ArrowUpwardOutlined sx={{ fontSize: 12, color: 'success.main' }} /> : <ArrowDownwardOutlined sx={{ fontSize: 12, color: 'error.main' }} />}
            <Typography variant="caption" fontWeight={700} color={trend >= 0 ? 'success.main' : 'error.main'}>
              {Math.abs(trend)}% vs last month
            </Typography>
          </Stack>
        )}
      </Box>
      <Box sx={{
        width: 48, height: 48, borderRadius: 3,
        bgcolor: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color
      }}>
        {icon}
      </Box>
    </Stack>
  </Card>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const CommissionsPage: React.FC = () => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<CommissionStatus | 'ALL'>('ALL');
  const [filterProject, setFilterProject] = useState('ALL');
  const [sortField, setSortField] = useState<'amount' | 'createdDate' | 'bookingAmount'>('createdDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedComm, setSelectedComm] = useState<Commission | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [payoutForm, setPayoutForm] = useState<PayoutFormData>({ paymentMode: 'Bank Transfer', transactionRef: '', paymentDate: new Date().toISOString().split('T')[0], notes: '' });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuComm, setMenuComm] = useState<Commission | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; sev: 'success' | 'error' }>({ open: false, msg: '', sev: 'success' });
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  useEffect(() => {
    setTimeout(() => {
      setCommissions(MOCK_COMMISSIONS);
      setLoading(false);
    }, 600);
  }, []);

  // ── Derived stats ────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const paid = commissions.filter(c => c.status === 'PAID').reduce((s, c) => s + c.amount, 0);
    const pending = commissions.filter(c => c.status === 'PENDING').reduce((s, c) => s + c.amount, 0);
    const approved = commissions.filter(c => c.status === 'APPROVED').reduce((s, c) => s + c.amount, 0);
    const total = commissions.reduce((s, c) => s + c.amount, 0);
    return { paid, pending, approved, total };
  }, [commissions]);

  const projects = useMemo(() => ['ALL', ...Array.from(new Set(commissions.map(c => c.project)))], [commissions]);

  // ── Filtered & sorted list ───────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...commissions];
    if (filterStatus !== 'ALL') list = list.filter(c => c.status === filterStatus);
    if (filterProject !== 'ALL') list = list.filter(c => c.project === filterProject);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.partnerName.toLowerCase().includes(q) ||
        c.project.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
      );
    }
    // Tab filter
    if (activeTab === 1) list = list.filter(c => c.status === 'PENDING');
    if (activeTab === 2) list = list.filter(c => c.status === 'APPROVED');
    if (activeTab === 3) list = list.filter(c => c.status === 'PAID');

    list.sort((a, b) => {
      const v = sortDir === 'asc' ? 1 : -1;
      return a[sortField] > b[sortField] ? v : -v;
    });
    return list;
  }, [commissions, filterStatus, filterProject, search, activeTab, sortField, sortDir]);

  // ── Actions ──────────────────────────────────────────────────────────────────
  const handleApprove = (comm: Commission) => {
    setCommissions(prev => prev.map(c => c.id === comm.id ? { ...c, status: 'APPROVED', approvedBy: 'Current User' } : c));
    setApproveOpen(false);
    setSnack({ open: true, msg: `Commission ${comm.id} approved successfully`, sev: 'success' });
  };

  const handleReject = (comm: Commission) => {
    setCommissions(prev => prev.map(c => c.id === comm.id ? { ...c, status: 'REJECTED' } : c));
    setAnchorEl(null);
    setSnack({ open: true, msg: `Commission ${comm.id} rejected`, sev: 'error' });
  };

  const handlePayout = () => {
    if (!selectedComm) return;
    setCommissions(prev => prev.map(c =>
      c.id === selectedComm.id ? {
        ...c, status: 'PAID',
        paymentMode: payoutForm.paymentMode,
        transactionRef: payoutForm.transactionRef,
        processedDate: payoutForm.paymentDate,
        notes: payoutForm.notes
      } : c
    ));
    setPayoutOpen(false);
    setSnack({ open: true, msg: `Payout recorded for ${selectedComm.partnerName}`, sev: 'success' });
  };

  const exportCSV = () => {
    const rows = [
      ['ID','Partner','Project','Unit','Booking Amt','Type','Comm Amt','Status','Date'],
      ...filtered.map(c => [c.id, c.partnerName, c.project, c.unitNumber, c.bookingAmount, c.commissionType, c.amount, c.status, c.createdDate])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a'); a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = 'commissions.csv'; a.click();
  };

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) =>
    sortField === field
      ? (sortDir === 'desc' ? <ArrowDownwardOutlined sx={{ fontSize: 13, ml: 0.3 }} /> : <ArrowUpwardOutlined sx={{ fontSize: 13, ml: 0.3 }} />)
      : null;

  if (loading) return (
    <Box display="flex" alignItems="center" justifyContent="center" minHeight={300}>
      <Stack alignItems="center" spacing={2}>
        <CircularProgress size={40} thickness={4} />
        <Typography variant="body2" color="text.secondary" fontWeight={600}>Loading commissions…</Typography>
      </Stack>
    </Box>
  );

  return (
    <Box sx={{ pb: 6 }}>

      {/* ── Header ── */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" mb={4} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={900} letterSpacing={-1.2}>
            Commission Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track, approve, and process channel partner payouts
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" startIcon={<FileDownloadOutlined />} onClick={exportCSV}
            sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700 }}>
            Export CSV
          </Button>
          <Button variant="contained" startIcon={<MonetizationOnOutlined />}
            onClick={() => { setSelectedComm(commissions.find(c => c.status === 'APPROVED') || null); setPayoutOpen(true); }}
            sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, bgcolor: '#111', '&:hover': { bgcolor: '#333' } }}>
            Record Payout
          </Button>
        </Stack>
      </Stack>

      {/* ── Stats ── */}
      <Grid container spacing={3} mb={4}>
        {[
          { label: 'Total Commissions', value: fmt(stats.total), sub: `${commissions.length} records`, color: '#6366f1', icon: <MonetizationOnOutlined />, trend: 12 },
          { label: 'Paid Out', value: fmt(stats.paid), sub: `${commissions.filter(c=>c.status==='PAID').length} paid`, color: '#10b981', icon: <AssignmentTurnedInOutlined />, trend: 8 },
          { label: 'Awaiting Payout', value: fmt(stats.approved), sub: 'Approved, unpaid', color: '#3b82f6', icon: <AccountBalanceOutlined /> },
          { label: 'Pending Approval', value: fmt(stats.pending), sub: `${commissions.filter(c=>c.status==='PENDING').length} requests`, color: '#f59e0b', icon: <PendingActionsOutlined /> },
        ].map(s => (
          <Grid item xs={12} sm={6} md={3} key={s.label}>
            <StatCard {...s} />
          </Grid>
        ))}
      </Grid>

      {/* ── Conversion bar ── */}
      <Card sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Typography variant="body2" fontWeight={800}>Commission Pipeline</Typography>
          <Typography variant="caption" color="text.secondary">{fmt(stats.total)} total value</Typography>
        </Stack>
        <Stack spacing={1}>
          {(['PAID','APPROVED','PENDING','REJECTED'] as CommissionStatus[]).map(s => {
            const val = commissions.filter(c => c.status === s).reduce((acc, c) => acc + c.amount, 0);
            const pct = stats.total ? (val / stats.total) * 100 : 0;
            return (
              <Stack key={s} direction="row" alignItems="center" spacing={2}>
                <Typography variant="caption" fontWeight={700} sx={{ width: 70, color: 'text.secondary' }}>{s}</Typography>
                <Box flex={1}>
                  <LinearProgress variant="determinate" value={pct}
                    sx={{ height: 8, borderRadius: 4,
                      bgcolor: 'grey.100',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: s==='PAID'?'#10b981':s==='APPROVED'?'#3b82f6':s==='PENDING'?'#f59e0b':'#ef4444',
                        borderRadius: 4
                      }
                    }} />
                </Box>
                <Typography variant="caption" fontWeight={800} sx={{ width: 60, textAlign: 'right' }}>{fmt(val)}</Typography>
              </Stack>
            );
          })}
        </Stack>
      </Card>

      {/* ── Filters & Controls ── */}
      <Card sx={{ p: 2.5, borderRadius: 4, border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
          <TextField
            size="small" placeholder="Search partner, project, ID…"
            value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> }}
            sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select value={filterStatus} label="Status" onChange={e => setFilterStatus(e.target.value as any)}
              sx={{ borderRadius: 2.5 }}>
              <MenuItem value="ALL">All Statuses</MenuItem>
              {(['PENDING','APPROVED','PAID','REJECTED'] as CommissionStatus[]).map(s => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Project</InputLabel>
            <Select value={filterProject} label="Project" onChange={e => setFilterProject(e.target.value)}
              sx={{ borderRadius: 2.5 }}>
              {projects.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </Select>
          </FormControl>
          <ToggleButtonGroup value={viewMode} exclusive onChange={(_, v) => v && setViewMode(v)} size="small">
            <ToggleButton value="table" sx={{ px: 1.5, borderRadius: '8px 0 0 8px' }}>
              <Tooltip title="Table view"><BarChartOutlined fontSize="small" /></Tooltip>
            </ToggleButton>
            <ToggleButton value="cards" sx={{ px: 1.5, borderRadius: '0 8px 8px 0' }}>
              <Tooltip title="Card view"><PaymentsOutlined fontSize="small" /></Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 500); }}>
              <RefreshOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Card>

      {/* ── Tabs ── */}
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}
        sx={{ mb: 2, '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: 13 }, '& .MuiTabs-indicator': { height: 3, borderRadius: 2 } }}>
        <Tab label={`All (${commissions.length})`} />
        <Tab label={
          <Badge badgeContent={commissions.filter(c=>c.status==='PENDING').length} color="warning" sx={{ '& .MuiBadge-badge': { fontSize: 10 } }}>
            <Box pr={1.5}>Pending</Box>
          </Badge>
        } />
        <Tab label={`Approved (${commissions.filter(c=>c.status==='APPROVED').length})`} />
        <Tab label={`Paid (${commissions.filter(c=>c.status==='PAID').length})`} />
      </Tabs>

      {/* ── Table ── */}
      {viewMode === 'table' && (
        <Card sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6 }}>Partner</TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6 }}>Project / Unit</TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, cursor: 'pointer' }} onClick={() => toggleSort('bookingAmount')}>
                    <Stack direction="row" alignItems="center">Booking Amt <SortIcon field="bookingAmount" /></Stack>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6 }}>Type / Rate</TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, cursor: 'pointer' }} onClick={() => toggleSort('amount')}>
                    <Stack direction="row" alignItems="center">Commission <SortIcon field="amount" /></Stack>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6 }}>Trigger</TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, cursor: 'pointer' }} onClick={() => toggleSort('createdDate')}>
                    <Stack direction="row" alignItems="center">Date <SortIcon field="createdDate" /></Stack>
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary" fontWeight={600}>No commissions found</Typography>
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map(comm => (
                  <TableRow key={comm.id} hover sx={{ cursor: 'pointer' }} onClick={() => { setSelectedComm(comm); setDetailOpen(true); }}>
                    <TableCell onClick={e => e.stopPropagation()}>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar sx={{ width: 34, height: 34, fontSize: 12, fontWeight: 800, bgcolor: avatarColor(comm.partnerName) }}>
                          {initials(comm.partnerName)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={800} sx={{ lineHeight: 1.2 }}>{comm.partnerName}</Typography>
                          <Typography variant="caption" color="text.secondary">{comm.id}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>{comm.project}</Typography>
                      <Typography variant="caption" color="text.secondary">{comm.unitNumber}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{fmt(comm.bookingAmount)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.3}>
                        <Chip label={comm.commissionType} size="small" variant="outlined" sx={{ fontSize: 10, fontWeight: 700, height: 20 }} />
                        {comm.commissionRate && <Typography variant="caption" color="text.secondary">{comm.commissionRate}%</Typography>}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={900} color="primary.main">{fmt(comm.amount)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusConfig[comm.status].label}
                        size="small"
                        color={statusConfig[comm.status].color}
                        sx={{ fontWeight: 800, fontSize: 10, minWidth: 70 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">{comm.triggerEvent}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{new Date(comm.createdDate).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</Typography>
                    </TableCell>
                    <TableCell align="right" onClick={e => e.stopPropagation()}>
                      <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                        {comm.status === 'PENDING' && (
                          <Tooltip title="Approve">
                            <IconButton size="small" color="success"
                              onClick={() => { setSelectedComm(comm); setApproveOpen(true); }}>
                              <CheckCircleOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {comm.status === 'APPROVED' && (
                          <Tooltip title="Pay Now">
                            <IconButton size="small" color="primary"
                              onClick={() => { setSelectedComm(comm); setPayoutOpen(true); }}>
                              <AccountBalanceOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <IconButton size="small"
                          onClick={e => { setMenuComm(comm); setAnchorEl(e.currentTarget); }}>
                          <MoreVertOutlined fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {filtered.length > 0 && (
            <Box sx={{ px: 3, py: 1.5, bgcolor: 'grey.50', borderTop: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">{filtered.length} records</Typography>
                <Typography variant="caption" fontWeight={800}>
                  Total: {fmt(filtered.reduce((s, c) => s + c.amount, 0))}
                </Typography>
              </Stack>
            </Box>
          )}
        </Card>
      )}

      {/* ── Card View ── */}
      {viewMode === 'cards' && (
        <Grid container spacing={2.5}>
          {filtered.map(comm => (
            <Grid item xs={12} sm={6} md={4} key={comm.id}>
              <Card sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 8px 30px rgba(0,0,0,0.1)' } }}
                onClick={() => { setSelectedComm(comm); setDetailOpen(true); }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ width: 40, height: 40, fontSize: 13, fontWeight: 800, bgcolor: avatarColor(comm.partnerName) }}>
                      {initials(comm.partnerName)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={800}>{comm.partnerName}</Typography>
                      <Typography variant="caption" color="text.secondary">{comm.id}</Typography>
                    </Box>
                  </Stack>
                  <Chip label={statusConfig[comm.status].label} size="small" color={statusConfig[comm.status].color} sx={{ fontWeight: 800, fontSize: 10 }} />
                </Stack>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={1.5}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Project</Typography>
                    <Typography variant="body2" fontWeight={700}>{comm.project}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Unit</Typography>
                    <Typography variant="body2" fontWeight={700}>{comm.unitNumber}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Booking</Typography>
                    <Typography variant="body2" fontWeight={700}>{fmt(comm.bookingAmount)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Commission</Typography>
                    <Typography variant="body2" fontWeight={900} color="primary.main">{fmt(comm.amount)}</Typography>
                  </Grid>
                </Grid>
                {(comm.status === 'PENDING' || comm.status === 'APPROVED') && (
                  <Stack direction="row" spacing={1} mt={2.5} onClick={e => e.stopPropagation()}>
                    {comm.status === 'PENDING' && (
                      <Button size="small" variant="contained" color="success" fullWidth
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: 12 }}
                        onClick={() => { setSelectedComm(comm); setApproveOpen(true); }}>
                        Approve
                      </Button>
                    )}
                    {comm.status === 'APPROVED' && (
                      <Button size="small" variant="contained" fullWidth
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: 12, bgcolor: '#111', '&:hover': { bgcolor: '#333' } }}
                        onClick={() => { setSelectedComm(comm); setPayoutOpen(true); }}>
                        Pay Now
                      </Button>
                    )}
                  </Stack>
                )}
              </Card>
            </Grid>
          ))}
          {filtered.length === 0 && (
            <Grid item xs={12}>
              <Box py={6} textAlign="center">
                <Typography color="text.secondary" fontWeight={600}>No commissions found</Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      )}

      {/* ── Context Menu ── */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', minWidth: 180 } }}>
        <MenuItem onClick={() => { setDetailOpen(true); setSelectedComm(menuComm); setAnchorEl(null); }}>
          <ListItemIcon><VisibilityOutlined fontSize="small" /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: 13, fontWeight: 700 }}>View Details</ListItemText>
        </MenuItem>
        {menuComm?.status === 'PENDING' && (
          <MenuItem onClick={() => { handleReject(menuComm!); }}>
            <ListItemIcon><CancelOutlined fontSize="small" color="error" /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: 13, fontWeight: 700, color: 'error.main' }}>Reject</ListItemText>
          </MenuItem>
        )}
        {menuComm?.status === 'APPROVED' && (
          <MenuItem onClick={() => { setSelectedComm(menuComm); setPayoutOpen(true); setAnchorEl(null); }}>
            <ListItemIcon><AccountBalanceOutlined fontSize="small" color="primary" /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: 13, fontWeight: 700 }}>Record Payout</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => { exportCSV(); setAnchorEl(null); }}>
          <ListItemIcon><FileDownloadOutlined fontSize="small" /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: 13, fontWeight: 700 }}>Export Row</ListItemText>
        </MenuItem>
      </Menu>

      {/* ── Detail Dialog ── */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography fontWeight={900}>Commission Details</Typography>
            <IconButton size="small" onClick={() => setDetailOpen(false)}><CloseOutlined /></IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedComm && (
            <Box>
              <Stack direction="row" spacing={2} alignItems="center" mb={3} mt={1}>
                <Avatar sx={{ width: 52, height: 52, fontSize: 16, fontWeight: 800, bgcolor: avatarColor(selectedComm.partnerName) }}>
                  {initials(selectedComm.partnerName)}
                </Avatar>
                <Box>
                  <Typography fontWeight={900} fontSize={18}>{selectedComm.partnerName}</Typography>
                  <Typography variant="caption" color="text.secondary">{selectedComm.id}</Typography>
                </Box>
                <Box flex={1} />
                <Chip label={statusConfig[selectedComm.status].label} color={statusConfig[selectedComm.status].color} sx={{ fontWeight: 800 }} />
              </Stack>
              <Divider sx={{ mb: 2.5 }} />
              <Grid container spacing={2.5}>
                {[
                  { label: 'Project', value: selectedComm.project },
                  { label: 'Unit', value: selectedComm.unitNumber },
                  { label: 'Booking Amount', value: fmt(selectedComm.bookingAmount) },
                  { label: 'Commission Type', value: selectedComm.commissionType },
                  { label: 'Commission Rate', value: selectedComm.commissionRate ? `${selectedComm.commissionRate}%` : 'Fixed' },
                  { label: 'Commission Amount', value: fmt(selectedComm.amount), highlight: true },
                  { label: 'Trigger Event', value: selectedComm.triggerEvent },
                  { label: 'Created Date', value: new Date(selectedComm.createdDate).toLocaleDateString('en-IN') },
                  ...(selectedComm.approvedBy ? [{ label: 'Approved By', value: selectedComm.approvedBy }] : []),
                  ...(selectedComm.processedDate ? [{ label: 'Paid On', value: new Date(selectedComm.processedDate).toLocaleDateString('en-IN') }] : []),
                  ...(selectedComm.paymentMode ? [{ label: 'Payment Mode', value: selectedComm.paymentMode }] : []),
                  ...(selectedComm.transactionRef ? [{ label: 'Transaction Ref', value: selectedComm.transactionRef }] : []),
                  ...(selectedComm.notes ? [{ label: 'Notes', value: selectedComm.notes }] : []),
                ].map(row => (
                  <Grid item xs={6} key={row.label}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>{row.label}</Typography>
                    <Typography fontWeight={(row as any).highlight ? 900 : 700} color={(row as any).highlight ? 'primary.main' : 'text.primary'}>
                      {row.value}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          {selectedComm?.status === 'PENDING' && (
            <>
              <Button onClick={() => handleReject(selectedComm!)} color="error" sx={{ textTransform: 'none', fontWeight: 700 }}>Reject</Button>
              <Button variant="contained" color="success" onClick={() => { handleApprove(selectedComm!); setDetailOpen(false); }} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>Approve</Button>
            </>
          )}
          {selectedComm?.status === 'APPROVED' && (
            <Button variant="contained" onClick={() => { setPayoutOpen(true); setDetailOpen(false); }}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, bgcolor: '#111', '&:hover': { bgcolor: '#333' } }}>
              Record Payout
            </Button>
          )}
          <Button onClick={() => setDetailOpen(false)} sx={{ textTransform: 'none', fontWeight: 700 }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ── Approve Dialog ── */}
      <Dialog open={approveOpen} onClose={() => setApproveOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between">
            <Typography fontWeight={900}>Approve Commission</Typography>
            <IconButton size="small" onClick={() => setApproveOpen(false)}><CloseOutlined /></IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedComm && (
            <Box>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 2 }}>
                <Typography variant="body2" fontWeight={700}>{selectedComm.partnerName}</Typography>
                <Typography variant="h6" fontWeight={900} color="success.main">{fmt(selectedComm.amount)}</Typography>
                <Typography variant="caption" color="text.secondary">{selectedComm.project} · {selectedComm.unitNumber}</Typography>
              </Paper>
              <Stack direction="row" spacing={1} alignItems="center">
                <InfoOutlined sx={{ fontSize: 16, color: 'info.main' }} />
                <Typography variant="caption" color="text.secondary">Approving this will mark the commission as ready for payout.</Typography>
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setApproveOpen(false)} sx={{ textTransform: 'none', fontWeight: 700 }}>Cancel</Button>
          <Button variant="contained" color="success" onClick={() => selectedComm && handleApprove(selectedComm)}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
            Confirm Approval
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Payout Dialog ── */}
      <Dialog open={payoutOpen} onClose={() => setPayoutOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between">
            <Typography fontWeight={900}>Record Payout</Typography>
            <IconButton size="small" onClick={() => setPayoutOpen(false)}><CloseOutlined /></IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedComm && (
            <Stack spacing={2.5} mt={1}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: 'success.50' }}>
                <Typography variant="caption" color="success.main" fontWeight={700}>Payout Amount</Typography>
                <Typography variant="h5" fontWeight={900} color="success.main">{fmt(selectedComm.amount)}</Typography>
                <Typography variant="caption" color="text.secondary">{selectedComm.partnerName} · {selectedComm.id}</Typography>
              </Paper>
              <FormControl fullWidth size="small">
                <InputLabel>Payment Mode</InputLabel>
                <Select value={payoutForm.paymentMode} label="Payment Mode"
                  onChange={e => setPayoutForm(p => ({ ...p, paymentMode: e.target.value as PaymentMode }))}
                  sx={{ borderRadius: 2.5 }}>
                  {(['Bank Transfer','Cheque','UPI'] as PaymentMode[]).map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField size="small" label="Transaction Reference" fullWidth
                value={payoutForm.transactionRef}
                onChange={e => setPayoutForm(p => ({ ...p, transactionRef: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
              <TextField size="small" label="Payment Date" type="date" fullWidth
                value={payoutForm.paymentDate}
                onChange={e => setPayoutForm(p => ({ ...p, paymentDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
              <TextField size="small" label="Notes (optional)" fullWidth multiline rows={2}
                value={payoutForm.notes}
                onChange={e => setPayoutForm(p => ({ ...p, notes: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setPayoutOpen(false)} sx={{ textTransform: 'none', fontWeight: 700 }}>Cancel</Button>
          <Button variant="contained" onClick={handlePayout}
            disabled={!payoutForm.transactionRef}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, bgcolor: '#111', '&:hover': { bgcolor: '#333' } }}>
            Confirm Payout
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.sev} sx={{ borderRadius: 3, fontWeight: 700 }} onClose={() => setSnack(s => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CommissionsPage;