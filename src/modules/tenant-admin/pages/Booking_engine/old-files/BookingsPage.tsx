import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Stack, Grid, Card, Chip, Avatar, Button,
  TextField, InputAdornment, FormControl, InputLabel, Select,
  MenuItem, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Divider, Badge, LinearProgress
} from '@mui/material';
import {
  SearchOutlined, AddOutlined, FilterListOutlined, DownloadOutlined,
  VisibilityOutlined, EditOutlined, CancelOutlined, SwapHorizOutlined,
  CloseOutlined, HomeOutlined, PersonOutlined, CalendarMonthOutlined,
  AttachMoneyOutlined, KeyboardArrowRightOutlined, WarningAmberOutlined,
  CheckCircleOutlined, LockOutlined, TrendingUpOutlined
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  display: "'Fraunces', 'Georgia', serif",
  body:    "'Satoshi', 'DM Sans', sans-serif",
  gold:    '#c9a84c',
  dark:    '#0f1117',
  surface: '#161b22',
  card:    '#1c2128',
  border:  '#21262d',
  text:    '#f0f6fc',
  muted:   '#8b949e',
  sub:     '#6e7681',
  accent:  '#2ea043',
  blue:    '#388bfd',
  red:     '#f85149',
  warn:    '#d29922',
  purple:  '#bc8cff',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtCr    = (n: number) => n >= 10000000 ? `₹${(n/10000000).toFixed(2)}Cr` : n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${(n/1000).toFixed(0)}K`;
const fmtINR   = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const avatarBg = (s: string) => [T.gold, T.accent, T.blue, T.purple, '#e06c75'][s.charCodeAt(0) % 5];
const initials = (s: string) => s.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

// ─── Types ────────────────────────────────────────────────────────────────────
type BookingStatus = 'BOOKED' | 'HOLD' | 'CANCELLED' | 'RELEASED' | 'TRANSFERRED';
type UnitStatus    = 'AVAILABLE' | 'HOLD' | 'BOOKED' | 'BLOCKED';

interface Booking {
  id: string; bookingNo: string; customerName: string; customerPhone: string;
  project: string; tower: string; floor: string; unit: string; unitType: string;
  agent: string; channelPartner?: string; bookingAmount: number; totalValue: number;
  paymentPlan: string; bookingDate: string; status: BookingStatus;
  paidInstallments: number; totalInstallments: number; paidAmount: number;
  commissionGenerated: boolean;
}

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS_CFG: Record<BookingStatus, { color: string; bg: string; dot: string; label: string }> = {
  BOOKED:      { color: T.accent,  bg: '#1a3d2b', dot: T.accent,  label: 'Booked' },
  HOLD:        { color: T.warn,    bg: '#2d2109', dot: T.warn,    label: 'On Hold' },
  CANCELLED:   { color: T.red,     bg: '#2d1216', dot: T.red,     label: 'Cancelled' },
  RELEASED:    { color: T.muted,   bg: '#21262d', dot: T.sub,     label: 'Released' },
  TRANSFERRED: { color: T.purple,  bg: '#251d36', dot: T.purple,  label: 'Transferred' },
};

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_BOOKINGS: Booking[] = [
  { id:'B1', bookingNo:'BK-2026-001', customerName:'Rahul Sharma', customerPhone:'9876543210', project:'Skyline Heights', tower:'A', floor:'3', unit:'A-302', unitType:'2BHK', agent:'Priya Mehta', channelPartner:'Elite Realty', bookingAmount:500000, totalValue:8500000, paymentPlan:'Construction Linked', bookingDate:'12 Apr 2026', status:'BOOKED', paidInstallments:2, totalInstallments:6, paidAmount:1800000, commissionGenerated:true },
  { id:'B2', bookingNo:'BK-2026-002', customerName:'Sunita Verma', customerPhone:'9876543211', project:'Orchid Residency', tower:'B', floor:'5', unit:'B-504', unitType:'3BHK', agent:'Arjun Singh', bookingAmount:800000, totalValue:12000000, paymentPlan:'Down Payment Plan', bookingDate:'10 Apr 2026', status:'BOOKED', paidInstallments:1, totalInstallments:4, paidAmount:800000, commissionGenerated:false },
  { id:'B3', bookingNo:'BK-2026-003', customerName:'Vikram Joshi', customerPhone:'9876543212', project:'Skyline Heights', tower:'C', floor:'7', unit:'C-701', unitType:'2BHK', agent:'Priya Mehta', channelPartner:'Metro Brokers', bookingAmount:450000, totalValue:7200000, paymentPlan:'Time Linked', bookingDate:'08 Apr 2026', status:'HOLD', paidInstallments:0, totalInstallments:5, paidAmount:0, commissionGenerated:false },
  { id:'B4', bookingNo:'BK-2026-004', customerName:'Meena Shah', customerPhone:'9876543213', project:'Green Valley', tower:'A', floor:'2', unit:'A-201', unitType:'1BHK', agent:'Kavita Joshi', bookingAmount:350000, totalValue:4800000, paymentPlan:'Construction Linked', bookingDate:'05 Apr 2026', status:'BOOKED', paidInstallments:3, totalInstallments:6, paidAmount:2100000, commissionGenerated:true },
  { id:'B5', bookingNo:'BK-2026-005', customerName:'Karan Malhotra', customerPhone:'9876543214', project:'Metro Towers', tower:'D', floor:'10', unit:'D-1002', unitType:'3BHK', agent:'Arjun Singh', channelPartner:'Prestige Agents', bookingAmount:900000, totalValue:15000000, paymentPlan:'Down Payment Plan', bookingDate:'02 Apr 2026', status:'CANCELLED', paidInstallments:1, totalInstallments:5, paidAmount:900000, commissionGenerated:false },
  { id:'B6', bookingNo:'BK-2026-006', customerName:'Priya Kapoor', customerPhone:'9876543215', project:'Orchid Residency', tower:'C', floor:'4', unit:'C-404', unitType:'2BHK', agent:'Kavita Joshi', bookingAmount:600000, totalValue:9500000, paymentPlan:'Construction Linked', bookingDate:'28 Mar 2026', status:'TRANSFERRED', paidInstallments:4, totalInstallments:6, paidAmount:6000000, commissionGenerated:true },
  { id:'B7', bookingNo:'BK-2026-007', customerName:'Amit Tiwari', customerPhone:'9876543216', project:'Skyline Heights', tower:'B', floor:'8', unit:'B-801', unitType:'4BHK', agent:'Priya Mehta', bookingAmount:1200000, totalValue:22000000, paymentPlan:'Time Linked', bookingDate:'25 Mar 2026', status:'BOOKED', paidInstallments:5, totalInstallments:7, paidAmount:18000000, commissionGenerated:true },
];

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const BKpiCard: React.FC<{ label: string; value: string | number; sub?: string; color: string; icon: React.ReactNode }> = ({ label, value, sub, color, icon }) => (
  <Card sx={{
    p: 3, borderRadius: 3, bgcolor: T.card, border: `1px solid ${T.border}`,
    boxShadow: 'none', position: 'relative', overflow: 'hidden',
    transition: 'all 0.2s',
    '&:hover': { borderColor: color + '60', transform: 'translateY(-2px)', boxShadow: `0 8px 32px ${color}12` }
  }}>
    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${color}, ${color}80)` }} />
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
      <Box>
        <Typography sx={{ fontFamily: T.body, fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: 1.2 }}>{label}</Typography>
        <Typography sx={{ fontFamily: T.display, fontSize: 30, fontWeight: 600, color, letterSpacing: -1.2, lineHeight: 1.1, mt: 0.5 }}>{value}</Typography>
        {sub && <Typography sx={{ fontFamily: T.body, fontSize: 11.5, color: T.sub, mt: 0.5 }}>{sub}</Typography>}
      </Box>
      <Box sx={{ width: 42, height: 42, borderRadius: 2.5, bgcolor: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>{icon}</Box>
    </Stack>
  </Card>
);

// ─── New Booking Dialog ────────────────────────────────────────────────────────
const NewBookingDialog: React.FC<{ open: boolean; onClose: () => void; onSave: (b: Partial<Booking>) => void }> = ({ open, onClose, onSave }) => {
  const [form, setForm] = useState<Partial<Booking>>({ paymentPlan: 'Construction Linked', status: 'BOOKED' });
  const set = (k: keyof Booking, v: any) => setForm(p => ({ ...p, [k]: v }));

  const save = () => {
    if (!form.customerName || !form.unit) return;
    onSave({
      ...form,
      id: `B${Date.now()}`,
      bookingNo: `BK-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
      bookingDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      paidInstallments: 0, totalInstallments: 5, paidAmount: form.bookingAmount || 0,
      commissionGenerated: !!form.channelPartner,
    });
    onClose();
    setForm({ paymentPlan: 'Construction Linked', status: 'BOOKED' });
  };

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2.5, bgcolor: T.dark, color: T.text,
      '& fieldset': { borderColor: T.border },
      '&:hover fieldset': { borderColor: T.gold + '60' },
      '&.Mui-focused fieldset': { borderColor: T.gold },
    },
    '& .MuiInputLabel-root': { color: T.muted },
    '& .MuiInputLabel-root.Mui-focused': { color: T.gold },
    '& .MuiInputBase-input': { color: T.text },
  };

  const selectSx = {
    borderRadius: 2.5, bgcolor: T.dark, color: T.text,
    '& .MuiOutlinedInput-notchedOutline': { borderColor: T.border },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: T.gold + '60' },
    '& .MuiSvgIcon-root': { color: T.muted },
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { borderRadius: 4, bgcolor: T.surface, border: `1px solid ${T.border}`, backgroundImage: 'none' } }}>
      <Box sx={{ height: 4, background: `linear-gradient(90deg, ${T.gold}, ${T.gold}80)` }} />
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography sx={{ fontFamily: T.display, fontSize: 24, fontWeight: 600, color: T.text, letterSpacing: -0.5 }}>New Booking</Typography>
            <Typography sx={{ fontFamily: T.body, fontSize: 12.5, color: T.muted, mt: 0.3 }}>Create a new unit booking · Lock unit inventory</Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: T.muted, '&:hover': { color: T.text } }}><CloseOutlined /></IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} mt={1}>
          {/* Customer Info */}
          <Box>
            <Typography sx={{ fontFamily: T.body, fontSize: 11, fontWeight: 700, color: T.gold, textTransform: 'uppercase', letterSpacing: 1.2, mb: 1.5 }}>
              Customer Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}><TextField label="Customer Name *" size="small" fullWidth value={form.customerName || ''} onChange={e => set('customerName', e.target.value)} sx={inputSx} /></Grid>
              <Grid item xs={12} sm={4}><TextField label="Phone Number" size="small" fullWidth value={form.customerPhone || ''} onChange={e => set('customerPhone', e.target.value)} sx={inputSx} /></Grid>
              <Grid item xs={12} sm={4}><TextField label="Email" size="small" fullWidth sx={inputSx} /></Grid>
              <Grid item xs={6}><TextField label="PAN Number" size="small" fullWidth sx={inputSx} /></Grid>
              <Grid item xs={6}><TextField label="Aadhar Number" size="small" fullWidth sx={inputSx} /></Grid>
            </Grid>
          </Box>

          <Divider sx={{ borderColor: T.border }} />

          {/* Unit Info */}
          <Box>
            <Typography sx={{ fontFamily: T.body, fontSize: 11, fontWeight: 700, color: T.gold, textTransform: 'uppercase', letterSpacing: 1.2, mb: 1.5 }}>
              Unit Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <FormControl size="small" fullWidth>
                  <InputLabel sx={{ color: T.muted }}>Project</InputLabel>
                  <Select value={form.project || ''} label="Project" onChange={e => set('project', e.target.value)} sx={selectSx}>
                    {['Skyline Heights', 'Orchid Residency', 'Green Valley', 'Metro Towers'].map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={3}><TextField label="Tower" size="small" fullWidth value={form.tower || ''} onChange={e => set('tower', e.target.value)} sx={inputSx} /></Grid>
              <Grid item xs={6} sm={3}><TextField label="Floor" size="small" fullWidth value={form.floor || ''} onChange={e => set('floor', e.target.value)} sx={inputSx} /></Grid>
              <Grid item xs={6} sm={3}><TextField label="Unit No. *" size="small" fullWidth value={form.unit || ''} onChange={e => set('unit', e.target.value)} sx={inputSx} /></Grid>
            </Grid>
          </Box>

          <Divider sx={{ borderColor: T.border }} />

          {/* Financial Info */}
          <Box>
            <Typography sx={{ fontFamily: T.body, fontSize: 11, fontWeight: 700, color: T.gold, textTransform: 'uppercase', letterSpacing: 1.2, mb: 1.5 }}>
              Financial Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}><TextField label="Booking Amount (₹)" size="small" fullWidth type="number" value={form.bookingAmount || ''} onChange={e => set('bookingAmount', +e.target.value)} sx={inputSx} /></Grid>
              <Grid item xs={6} sm={3}><TextField label="Total Unit Value (₹)" size="small" fullWidth type="number" value={form.totalValue || ''} onChange={e => set('totalValue', +e.target.value)} sx={inputSx} /></Grid>
              <Grid item xs={6} sm={3}>
                <FormControl size="small" fullWidth>
                  <InputLabel sx={{ color: T.muted }}>Payment Plan</InputLabel>
                  <Select value={form.paymentPlan || ''} label="Payment Plan" onChange={e => set('paymentPlan', e.target.value)} sx={selectSx}>
                    {['Construction Linked Plan', 'Time Linked Plan', 'Down Payment Plan'].map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={3}><TextField label="Channel Partner (Optional)" size="small" fullWidth value={form.channelPartner || ''} onChange={e => set('channelPartner', e.target.value)} sx={inputSx} /></Grid>
            </Grid>
          </Box>
        </Stack>
      </DialogContent>
      <Divider sx={{ borderColor: T.border }} />
      <DialogActions sx={{ px: 3, py: 2.5 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', fontWeight: 700, fontFamily: T.body, color: T.muted }}>Cancel</Button>
        <Button variant="contained" onClick={save} disabled={!form.customerName || !form.unit}
          sx={{ textTransform: 'none', fontWeight: 800, fontFamily: T.body, borderRadius: 2.5, background: `linear-gradient(135deg, ${T.gold}, #a07d2e)`, color: T.dark, boxShadow: `0 4px 14px ${T.gold}40`, '&:hover': { filter: 'brightness(1.1)' } }}>
          Create Booking
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Cancel Dialog ─────────────────────────────────────────────────────────────
const CancelDialog: React.FC<{ booking: Booking | null; open: boolean; onClose: () => void; onConfirm: (id: string, reason: string) => void }> = ({ booking, open, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, bgcolor: T.surface, border: `1px solid ${T.red}40`, backgroundImage: 'none' } }}>
      <Box sx={{ height: 3, bgcolor: T.red }} />
      <DialogTitle sx={{ fontFamily: T.display, fontSize: 20, fontWeight: 600, color: T.text, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Cancel Booking <IconButton onClick={onClose} sx={{ color: T.muted }}><CloseOutlined /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2.5, p: 2, borderRadius: 2.5, bgcolor: T.dark, border: `1px solid ${T.border}` }}>
          <Typography sx={{ fontFamily: T.body, fontWeight: 700, fontSize: 13, color: T.text }}>{booking?.customerName}</Typography>
          <Typography sx={{ fontFamily: T.body, fontSize: 12, color: T.muted }}>{booking?.project} · {booking?.unit} · {booking?.bookingNo}</Typography>
        </Box>
        <TextField label="Cancellation Reason" multiline rows={3} fullWidth size="small" value={reason} onChange={e => setReason(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: T.dark, color: T.text, '& fieldset': { borderColor: T.border } }, '& .MuiInputLabel-root': { color: T.muted }, '& .MuiInputBase-input': { color: T.text } }} />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', fontWeight: 700, fontFamily: T.body, color: T.muted }}>Keep Booking</Button>
        <Button variant="contained" onClick={() => { booking && onConfirm(booking.id, reason); onClose(); }} disabled={!reason}
          sx={{ textTransform: 'none', fontWeight: 800, fontFamily: T.body, borderRadius: 2.5, bgcolor: T.red, '&:hover': { bgcolor: '#c9312a' }, boxShadow: 'none' }}>
          Confirm Cancellation
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const BookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [agentFilter, setAgentFilter]   = useState('ALL');
  const [newOpen, setNewOpen]   = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);

  const filtered = useMemo(() => bookings.filter(b =>
    (!search || b.customerName.toLowerCase().includes(search.toLowerCase()) || b.bookingNo.toLowerCase().includes(search.toLowerCase()) || b.unit.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter  === 'ALL' || b.status  === statusFilter) &&
    (projectFilter === 'ALL' || b.project === projectFilter) &&
    (agentFilter   === 'ALL' || b.agent   === agentFilter)
  ), [bookings, search, statusFilter, projectFilter, agentFilter]);

  const stats = useMemo(() => ({
    total:     bookings.length,
    active:    bookings.filter(b => b.status === 'BOOKED').length,
    hold:      bookings.filter(b => b.status === 'HOLD').length,
    cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
    revenue:   bookings.filter(b => b.status === 'BOOKED' || b.status === 'TRANSFERRED').reduce((s, b) => s + b.totalValue, 0),
    collected: bookings.filter(b => b.status === 'BOOKED' || b.status === 'TRANSFERRED').reduce((s, b) => s + b.paidAmount, 0),
  }), [bookings]);

  const projects = [...new Set(bookings.map(b => b.project))];
  const agents   = [...new Set(bookings.map(b => b.agent))];

  const cancelBooking = (id: string, reason: string) => {
    setBookings(p => p.map(b => b.id === id ? { ...b, status: 'CANCELLED' as BookingStatus } : b));
  };

  const addBooking = (data: Partial<Booking>) => {
    setBookings(p => [...p, data as Booking]);
  };

  const selectSx = {
    borderRadius: 2.5, bgcolor: T.card, color: T.text, minWidth: 140,
    '& .MuiOutlinedInput-notchedOutline': { borderColor: T.border },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: T.gold + '50' },
    '& .MuiSvgIcon-root': { color: T.muted },
    '& .MuiSelect-select': { color: T.text },
  };

  return (
    <Box sx={{ bgcolor: T.dark, minHeight: '100vh', pb: 8 }}>

      {/* ── HERO HEADER ── */}
      <Box sx={{
        px: { xs: 3, md: 5 }, pt: 5, pb: 4,
        background: `linear-gradient(135deg, #0f1117 0%, #161b22 50%, #0f1117 100%)`,
        borderBottom: `1px solid ${T.border}`,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Gold shimmer blob */}
        <Box sx={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: '50%', bgcolor: T.gold + '10', filter: 'blur(50px)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -40, left: '30%', width: 200, height: 200, borderRadius: '50%', bgcolor: T.blue + '08', filter: 'blur(40px)', pointerEvents: 'none' }} />

        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'flex-end' }} spacing={3} sx={{ position: 'relative' }}>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
              <Box sx={{ px: 1.5, py: 0.4, borderRadius: 1.5, bgcolor: T.gold + '20', border: `1px solid ${T.gold}40` }}>
                <Typography sx={{ fontFamily: T.body, fontSize: 10, fontWeight: 800, color: T.gold, textTransform: 'uppercase', letterSpacing: 1.5 }}>Booking Engine</Typography>
              </Box>
            </Stack>
            <Typography sx={{ fontFamily: T.display, fontSize: 40, fontWeight: 600, color: T.text, letterSpacing: -2, lineHeight: 0.95 }}>
              Bookings
            </Typography>
            <Typography sx={{ fontFamily: T.body, fontSize: 13, color: T.muted, mt: 1 }}>
              {stats.active} active · {stats.hold} on hold · {fmtCr(stats.revenue)} total portfolio
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button startIcon={<DownloadOutlined />}
              sx={{ textTransform: 'none', fontWeight: 700, fontFamily: T.body, borderRadius: 2.5, border: `1px solid ${T.border}`, color: T.muted, '&:hover': { bgcolor: T.card, color: T.text } }}>
              Export
            </Button>
            <Button variant="contained" startIcon={<AddOutlined />} onClick={() => setNewOpen(true)}
              sx={{ textTransform: 'none', fontWeight: 800, fontFamily: T.body, borderRadius: 2.5, background: `linear-gradient(135deg, ${T.gold}, #a07d2e)`, color: T.dark, boxShadow: `0 4px 20px ${T.gold}40`, '&:hover': { filter: 'brightness(1.1)' } }}>
              New Booking
            </Button>
          </Stack>
        </Stack>

        {/* KPIs */}
        <Grid container spacing={2} mt={3}>
          {[
            { label: 'Total Bookings', value: stats.total,                  sub: 'All time',           color: T.gold,   icon: <HomeOutlined /> },
            { label: 'Active',         value: stats.active,                 sub: `${stats.hold} on hold`, color: T.accent, icon: <CheckCircleOutlined /> },
            { label: 'Cancelled',      value: stats.cancelled,              sub: 'This year',          color: T.red,    icon: <CancelOutlined /> },
            { label: 'Portfolio Value',value: fmtCr(stats.revenue),         sub: 'Active bookings',    color: T.gold,   icon: <TrendingUpOutlined /> },
            { label: 'Collected',      value: fmtCr(stats.collected),       sub: 'Payments received',  color: T.accent, icon: <AttachMoneyOutlined /> },
            { label: 'With Commission',value: bookings.filter(b => b.commissionGenerated).length, sub: 'Broker deals', color: T.purple, icon: <PersonOutlined /> },
          ].map(k => (
            <Grid item xs={6} sm={4} md={2} key={k.label}>
              <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography sx={{ fontFamily: T.body, fontSize: 9.5, fontWeight: 700, color: T.sub, textTransform: 'uppercase', letterSpacing: 1 }}>{k.label}</Typography>
                    <Typography sx={{ fontFamily: T.display, fontSize: 26, fontWeight: 600, color: k.color, letterSpacing: -1, lineHeight: 1.1, mt: 0.3 }}>{k.value}</Typography>
                    {k.sub && <Typography sx={{ fontFamily: T.body, fontSize: 10.5, color: T.sub, mt: 0.2 }}>{k.sub}</Typography>}
                  </Box>
                  <Box sx={{ color: k.color, opacity: 0.5 }}>{k.icon}</Box>
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ── TOOLBAR ── */}
      <Box sx={{ px: { xs: 3, md: 5 }, py: 2.5, bgcolor: T.surface, borderBottom: `1px solid ${T.border}`, position: 'sticky', top: 0, zIndex: 10 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
          <TextField
            placeholder="Search booking no, customer, unit…"
            size="small" value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchOutlined sx={{ fontSize: 16, color: T.muted }} /></InputAdornment>,
              sx: { borderRadius: 2.5, bgcolor: T.card, color: T.text, '& fieldset': { borderColor: T.border }, '&:hover fieldset': { borderColor: T.gold + '40' } }
            }}
            sx={{ flex: 1, maxWidth: 320, '& .MuiInputBase-input': { color: T.text }, '& .MuiInputBase-input::placeholder': { color: T.sub } }}
          />
          {[
            { label: 'Status', value: statusFilter, set: setStatusFilter, opts: ['BOOKED', 'HOLD', 'CANCELLED', 'RELEASED', 'TRANSFERRED'] },
            { label: 'Project', value: projectFilter, set: setProjectFilter, opts: projects },
            { label: 'Agent', value: agentFilter, set: setAgentFilter, opts: agents },
          ].map(f => (
            <FormControl key={f.label} size="small">
              <InputLabel sx={{ color: `${T.muted} !important` }}>{f.label}</InputLabel>
              <Select value={f.value} label={f.label} onChange={e => f.set(e.target.value)} sx={selectSx}>
                <MenuItem value="ALL">All {f.label}s</MenuItem>
                {f.opts.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </Select>
            </FormControl>
          ))}
          <Box flex={1} />
          <Typography sx={{ fontFamily: T.body, fontSize: 12, color: T.muted, fontWeight: 600, flexShrink: 0 }}>{filtered.length} bookings</Typography>
        </Stack>
      </Box>

      {/* ── TABLE ── */}
      <Box sx={{ px: { xs: 3, md: 5 }, pt: 3 }}>
        <Card sx={{ borderRadius: 3, bgcolor: T.surface, border: `1px solid ${T.border}`, boxShadow: 'none', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#0d1117' }}>
                  {['Booking No.', 'Customer', 'Project / Unit', 'Payment Progress', 'Value', 'Agent', 'Status', 'Actions'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 800, fontSize: 10.5, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: T.body, py: 1.8, borderBottom: `1px solid ${T.border}` }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 10, borderBottom: 'none' }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <HomeOutlined sx={{ fontSize: 48, color: T.border, mb: 1.5 }} />
                        <Typography sx={{ fontFamily: T.body, color: T.muted, fontWeight: 600 }}>No bookings found</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : filtered.map(b => {
                  const sc = STATUS_CFG[b.status];
                  const paidPct = b.totalInstallments > 0 ? (b.paidInstallments / b.totalInstallments) * 100 : 0;
                  return (
                    <TableRow key={b.id} hover sx={{ '& td': { py: 1.6, borderBottom: `1px solid ${T.border}`, fontFamily: T.body }, '&:hover': { bgcolor: T.card }, transition: 'background 0.12s', cursor: 'pointer' }}>
                      <TableCell onClick={() => navigate(`/bookings/${b.id}`)}>
                        <Typography sx={{ fontFamily: 'monospace', fontSize: 12.5, color: T.gold, fontWeight: 600 }}>{b.bookingNo}</Typography>
                        <Typography sx={{ fontFamily: T.body, fontSize: 10.5, color: T.sub, mt: 0.2 }}>{b.bookingDate}</Typography>
                      </TableCell>
                      <TableCell onClick={() => navigate(`/bookings/${b.id}`)}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar sx={{ width: 34, height: 34, bgcolor: avatarBg(b.customerName), fontSize: 12, fontWeight: 800 }}>{initials(b.customerName)}</Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 800, fontSize: 13.5, color: T.text }}>{b.customerName}</Typography>
                            <Typography sx={{ fontSize: 11, color: T.muted }}>{b.customerPhone}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell onClick={() => navigate(`/bookings/${b.id}`)}>
                        <Typography sx={{ fontWeight: 700, fontSize: 13, color: T.text }}>{b.project}</Typography>
                        <Stack direction="row" spacing={0.8} mt={0.3}>
                          <Chip label={`T-${b.tower}`} size="small" sx={{ fontSize: 9.5, height: 17, bgcolor: T.border, color: T.muted, fontWeight: 700 }} />
                          <Chip label={b.unit} size="small" sx={{ fontSize: 9.5, height: 17, bgcolor: T.gold + '20', color: T.gold, fontWeight: 800 }} />
                          <Chip label={b.unitType} size="small" sx={{ fontSize: 9.5, height: 17, bgcolor: T.card, color: T.muted, fontWeight: 600 }} />
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ minWidth: 160 }}>
                        <Box>
                          <Stack direction="row" justifyContent="space-between" mb={0.5}>
                            <Typography sx={{ fontFamily: T.body, fontSize: 10.5, color: T.muted }}>{b.paidInstallments}/{b.totalInstallments} installments</Typography>
                            <Typography sx={{ fontFamily: T.body, fontSize: 10.5, fontWeight: 800, color: paidPct === 100 ? T.accent : paidPct > 50 ? T.gold : T.muted }}>{paidPct.toFixed(0)}%</Typography>
                          </Stack>
                          <LinearProgress variant="determinate" value={paidPct}
                            sx={{ height: 5, borderRadius: 2.5, bgcolor: T.border, '& .MuiLinearProgress-bar': { borderRadius: 2.5, background: paidPct === 100 ? `linear-gradient(90deg, ${T.accent}, #2ea043cc)` : `linear-gradient(90deg, ${T.gold}, ${T.gold}cc)` } }} />
                        </Box>
                      </TableCell>
                      <TableCell onClick={() => navigate(`/bookings/${b.id}`)}>
                        <Typography sx={{ fontFamily: T.display, fontSize: 16, fontWeight: 600, color: T.gold, letterSpacing: -0.5 }}>{fmtCr(b.totalValue)}</Typography>
                        {b.channelPartner && <Typography sx={{ fontSize: 10.5, color: T.purple, fontFamily: T.body }}>{b.channelPartner}</Typography>}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar sx={{ width: 24, height: 24, bgcolor: avatarBg(b.agent), fontSize: 9, fontWeight: 800 }}>{initials(b.agent)}</Avatar>
                          <Typography sx={{ fontSize: 12, fontFamily: T.body, color: T.muted }}>{b.agent.split(' ')[0]}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6, px: 1.2, py: 0.4, borderRadius: 1.5, bgcolor: sc.bg }}>
                          <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: sc.dot }} />
                          <Typography sx={{ fontFamily: T.body, fontSize: 10.5, fontWeight: 800, color: sc.color }}>{sc.label}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.3}>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => navigate(`/bookings/${b.id}`)} sx={{ color: T.muted, '&:hover': { color: T.gold } }}>
                              <VisibilityOutlined sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                          {b.status === 'BOOKED' && (
                            <Tooltip title="Cancel">
                              <IconButton size="small" onClick={() => setCancelTarget(b)} sx={{ color: T.muted, '&:hover': { color: T.red } }}>
                                <CancelOutlined sx={{ fontSize: 15 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Transfer">
                            <IconButton size="small" sx={{ color: T.muted, '&:hover': { color: T.purple } }}>
                              <SwapHorizOutlined sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          {filtered.length > 0 && (
            <Box sx={{ px: 3, py: 1.8, borderTop: `1px solid ${T.border}`, bgcolor: '#0d1117', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontFamily: T.body, fontSize: 11.5, color: T.sub }}>{filtered.length} bookings shown</Typography>
              <Typography sx={{ fontFamily: T.display, fontSize: 14, fontWeight: 600, color: T.gold, letterSpacing: -0.3 }}>
                Total: {fmtCr(filtered.reduce((s, b) => s + b.totalValue, 0))}
              </Typography>
            </Box>
          )}
        </Card>
      </Box>

      {/* Dialogs */}
      <NewBookingDialog open={newOpen} onClose={() => setNewOpen(false)} onSave={addBooking} />
      <CancelDialog booking={cancelTarget} open={!!cancelTarget} onClose={() => setCancelTarget(null)} onConfirm={cancelBooking} />
    </Box>
  );
};

export default BookingsPage;