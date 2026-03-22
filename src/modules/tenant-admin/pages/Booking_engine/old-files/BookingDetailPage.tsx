import React, { useState } from 'react';
import {
  Box, Typography, Stack, Grid, Card, Chip, Avatar, Button,
  Divider, Tab, Tabs, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, LinearProgress, Tooltip
} from '@mui/material';
import {
  ArrowBackOutlined, EditOutlined, CancelOutlined, SwapHorizOutlined,
  UploadFileOutlined, DownloadOutlined, CheckCircleOutlined,
  AccessTimeOutlined, WarningAmberOutlined, PersonOutlined,
  HomeOutlined, AttachMoneyOutlined, CloseOutlined,
  ReceiptLongOutlined, FolderOutlined, TimelineOutlined,
  PictureAsPdfOutlined, VerifiedOutlined, CommitOutlined
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

// ─── Tokens ────────────────────────────────────────────────────────────────────
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

const fmtINR  = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const fmtCr   = (n: number) => n >= 10000000 ? `₹${(n/10000000).toFixed(2)}Cr` : n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${(n/1000).toFixed(0)}K`;
const avatarBg = (s: string) => [T.gold, T.accent, T.blue, T.purple, '#e06c75'][s.charCodeAt(0) % 5];
const initials  = (s: string) => s.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

// ─── Mock booking data ─────────────────────────────────────────────────────────
const BOOKING = {
  id: 'B1', bookingNo: 'BK-2026-001',
  customerName: 'Rahul Sharma', customerPhone: '9876543210', customerEmail: 'rahul@example.com',
  pan: 'ABCDE1234F', aadhar: 'XXXX-XXXX-4567',
  address: '12, MG Road, Pune, Maharashtra 411001',
  nomineeName: 'Anjali Sharma', nomineeRelation: 'Spouse',
  project: 'Skyline Heights', tower: 'A', floor: '3rd', unit: 'A-302', unitType: '2BHK',
  area: '1,250 sq.ft.', facing: 'East', carpet: '980 sq.ft.',
  agent: 'Priya Mehta', agentPhone: '9876000001',
  channelPartner: 'Elite Realty', channelPartnerId: 'CP-0012',
  bookingAmount: 500000, totalValue: 8500000, paymentPlan: 'Construction Linked Plan',
  bookingDate: '12 Apr 2026', status: 'BOOKED',
  commissionRate: 2, commissionAmount: 170000, commissionStatus: 'Pending',
};

const INSTALLMENTS = [
  { id:'I1', name:'Booking Amount',       amount:500000,  dueDate:'12 Apr 2026', status:'PAID',    paidOn:'12 Apr 2026' },
  { id:'I2', name:'Agreement Amount',     amount:1300000, dueDate:'12 May 2026', status:'PAID',    paidOn:'10 May 2026' },
  { id:'I3', name:'Foundation Stage',     amount:1700000, dueDate:'12 Jul 2026', status:'PENDING', paidOn:'' },
  { id:'I4', name:'Structure Completion', amount:2000000, dueDate:'12 Oct 2026', status:'PENDING', paidOn:'' },
  { id:'I5', name:'Brickwork Stage',      amount:1500000, dueDate:'12 Jan 2027', status:'PENDING', paidOn:'' },
  { id:'I6', name:'Possession',           amount:1500000, dueDate:'12 Apr 2027', status:'PENDING', paidOn:'' },
];

const TIMELINE = [
  { date:'12 Apr 2026', time:'10:32 AM', event:'Booking Created',            desc:'Booking registered by agent Priya Mehta', icon:<HomeOutlined sx={{ fontSize:14 }}/>,          color:T.gold   },
  { date:'12 Apr 2026', time:'11:15 AM', event:'Commission Generated',       desc:'₹1,70,000 @ 2% commission for Elite Realty', icon:<AttachMoneyOutlined sx={{ fontSize:14 }}/>,  color:T.purple },
  { date:'14 Apr 2026', time:'02:00 PM', event:'Agreement Uploaded',         desc:'Booking agreement signed and uploaded', icon:<FolderOutlined sx={{ fontSize:14 }}/>,          color:T.blue   },
  { date:'15 Apr 2026', time:'09:45 AM', event:'KYC Documents Submitted',    desc:'PAN, Aadhar verified and uploaded', icon:<VerifiedOutlined sx={{ fontSize:14 }}/>,            color:T.accent },
  { date:'10 May 2026', time:'04:22 PM', event:'Installment Paid',           desc:'Agreement Amount ₹13,00,000 received via NEFT', icon:<ReceiptLongOutlined sx={{ fontSize:14 }}/>, color:T.accent },
];

const DOCUMENTS = [
  { name:'Booking Agreement', type:'PDF', size:'2.1 MB', uploaded:'14 Apr 2026', verified:true },
  { name:'PAN Card Copy',     type:'PDF', size:'0.4 MB', uploaded:'15 Apr 2026', verified:true },
  { name:'Aadhar Card',       type:'PDF', size:'0.6 MB', uploaded:'15 Apr 2026', verified:true },
  { name:'KYC Form',          type:'PDF', size:'1.2 MB', uploaded:'15 Apr 2026', verified:false },
];

const INST_STATUS: Record<string,{ color: string; bg: string; dot: string }> = {
  PAID:     { color: T.accent, bg: '#1a3d2b', dot: T.accent },
  PENDING:  { color: T.warn,   bg: '#2d2109', dot: T.warn },
  OVERDUE:  { color: T.red,    bg: '#2d1216', dot: T.red },
  PARTIAL:  { color: T.blue,   bg: '#0d2137', dot: T.blue },
};

// ─── Transfer Dialog ──────────────────────────────────────────────────────────
const TransferDialog: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, bgcolor: T.surface, border: `1px solid ${T.purple}40`, backgroundImage: 'none' } }}>
    <Box sx={{ height: 3, bgcolor: T.purple }} />
    <DialogTitle sx={{ fontFamily: T.display, fontSize: 22, fontWeight: 600, color: T.text, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      Transfer Booking <IconButton onClick={onClose} sx={{ color: T.muted }}><CloseOutlined /></IconButton>
    </DialogTitle>
    <DialogContent>
      <Stack spacing={2.5} mt={1}>
        <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: T.card, border: `1px solid ${T.border}` }}>
          <Typography sx={{ fontFamily: T.body, fontSize: 11, color: T.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>Current Customer</Typography>
          <Typography sx={{ fontFamily: T.body, fontWeight: 800, fontSize: 14, color: T.text, mt: 0.3 }}>Rahul Sharma — BK-2026-001</Typography>
        </Box>
        {[
          { label: 'New Customer Name *', key: 'name' },
          { label: 'New Customer Phone *', key: 'phone' },
          { label: 'New Customer Email', key: 'email' },
          { label: 'Transfer Date', key: 'date', type: 'date' },
          { label: 'Transfer Fee (₹)', key: 'fee', type: 'number' },
        ].map(f => (
          <TextField key={f.key} label={f.label} size="small" fullWidth type={f.type || 'text'}
            InputLabelProps={f.type === 'date' ? { shrink: true } : {}}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: T.card, color: T.text, '& fieldset': { borderColor: T.border }, '&:hover fieldset': { borderColor: T.purple + '60' }, '&.Mui-focused fieldset': { borderColor: T.purple } }, '& .MuiInputLabel-root': { color: T.muted }, '& .MuiInputBase-input': { color: T.text } }} />
        ))}
      </Stack>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 3 }}>
      <Button onClick={onClose} sx={{ textTransform: 'none', fontWeight: 700, fontFamily: T.body, color: T.muted }}>Cancel</Button>
      <Button variant="contained" sx={{ textTransform: 'none', fontWeight: 800, fontFamily: T.body, borderRadius: 2.5, bgcolor: T.purple, color: T.dark, '&:hover': { filter: 'brightness(0.9)' }, boxShadow: 'none' }}>
        Confirm Transfer
      </Button>
    </DialogActions>
  </Dialog>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const BookingDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id }   = useParams<{ id: string }>();
  const [tab, setTab]             = useState(0);
  const [installments, setInstallments] = useState(INSTALLMENTS);
  const [transferOpen, setTransferOpen] = useState(false);

  const paidAmt  = installments.filter(i => i.status === 'PAID').reduce((s, i) => s + i.amount, 0);
  const totalAmt = installments.reduce((s, i) => s + i.amount, 0);
  const paidPct  = (paidAmt / totalAmt) * 100;

  const markPaid = (id: string) => {
    setInstallments(p => p.map(i => i.id === id ? {
      ...i, status: 'PAID', paidOn: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    } : i));
  };

  const inputSx = {
    '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: T.dark, color: T.text, '& fieldset': { borderColor: T.border } },
    '& .MuiInputLabel-root': { color: T.muted },
    '& .MuiInputBase-input': { color: T.text },
  };

  return (
    <Box sx={{ bgcolor: T.dark, minHeight: '100vh', pb: 8 }}>

      {/* ── HEADER ── */}
      <Box sx={{ px: { xs: 3, md: 5 }, pt: 4, pb: 4, borderBottom: `1px solid ${T.border}`, bgcolor: T.surface, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -40, right: -40, width: 220, height: 220, borderRadius: '50%', bgcolor: T.gold + '08', filter: 'blur(40px)', pointerEvents: 'none' }} />

        {/* Breadcrumb */}
        <Stack direction="row" spacing={1} alignItems="center" mb={3}>
          <Box onClick={() => navigate('/bookings')} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8, px: 1.5, py: 0.6, borderRadius: 2, border: `1px solid ${T.border}`, cursor: 'pointer', transition: 'all 0.15s', color: T.muted, '&:hover': { borderColor: T.gold, color: T.gold, bgcolor: T.gold + '10' } }}>
            <ArrowBackOutlined sx={{ fontSize: 14 }} />
            <Typography sx={{ fontFamily: T.body, fontSize: 12, fontWeight: 700 }}>All Bookings</Typography>
          </Box>
          <Typography sx={{ color: T.border }}>›</Typography>
          <Typography sx={{ fontFamily: 'monospace', fontSize: 12, color: T.gold }}>{BOOKING.bookingNo}</Typography>
        </Stack>

        {/* Hero row */}
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'flex-start' }} spacing={3}>
          <Stack direction="row" spacing={2.5} alignItems="center">
            <Avatar sx={{ width: 60, height: 60, bgcolor: avatarBg(BOOKING.customerName), fontWeight: 800, fontSize: 20 }}>{initials(BOOKING.customerName)}</Avatar>
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={0.5}>
                <Typography sx={{ fontFamily: T.display, fontSize: 26, fontWeight: 600, color: T.text, letterSpacing: -0.8 }}>{BOOKING.customerName}</Typography>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.2, py: 0.35, borderRadius: 1.5, bgcolor: '#1a3d2b' }}>
                  <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: T.accent }} />
                  <Typography sx={{ fontFamily: T.body, fontSize: 10.5, fontWeight: 800, color: T.accent }}>Booked</Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Typography sx={{ fontFamily: T.body, fontSize: 12.5, color: T.muted }}>{BOOKING.customerPhone}</Typography>
                <Typography sx={{ fontFamily: T.body, fontSize: 12.5, color: T.muted }}>{BOOKING.customerEmail}</Typography>
                <Typography sx={{ fontFamily: T.body, fontSize: 12.5, color: T.gold, fontWeight: 700 }}>{BOOKING.project} · {BOOKING.unit}</Typography>
              </Stack>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1.5} flexShrink={0}>
            <Button startIcon={<SwapHorizOutlined />} onClick={() => setTransferOpen(true)}
              sx={{ textTransform: 'none', fontWeight: 700, fontFamily: T.body, borderRadius: 2.5, border: `1px solid ${T.purple}50`, color: T.purple, '&:hover': { bgcolor: T.purple + '14' } }}>
              Transfer
            </Button>
            <Button startIcon={<CancelOutlined />}
              sx={{ textTransform: 'none', fontWeight: 700, fontFamily: T.body, borderRadius: 2.5, border: `1px solid ${T.red}50`, color: T.red, '&:hover': { bgcolor: T.red + '14' } }}>
              Cancel
            </Button>
            <Button variant="contained" startIcon={<EditOutlined />}
              sx={{ textTransform: 'none', fontWeight: 800, fontFamily: T.body, borderRadius: 2.5, background: `linear-gradient(135deg, ${T.gold}, #a07d2e)`, color: T.dark, boxShadow: `0 4px 14px ${T.gold}30`, '&:hover': { filter: 'brightness(1.1)' } }}>
              Edit
            </Button>
          </Stack>
        </Stack>

        {/* Quick stats strip */}
        <Grid container spacing={2} mt={2.5}>
          {[
            { label: 'Total Value',    value: fmtCr(BOOKING.totalValue),   color: T.gold   },
            { label: 'Collected',      value: fmtCr(paidAmt),              color: T.accent },
            { label: 'Balance Due',    value: fmtCr(totalAmt - paidAmt),   color: T.warn   },
            { label: 'Payment Plan',   value: 'Constr. Linked',             color: T.blue   },
            { label: 'Commission',     value: fmtINR(BOOKING.commissionAmount), color: T.purple },
            { label: 'Booking Date',   value: BOOKING.bookingDate,          color: T.muted  },
          ].map(s => (
            <Grid item xs={6} sm={4} md={2} key={s.label}>
              <Box sx={{ p: 1.8, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}` }}>
                <Typography sx={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: T.sub, textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</Typography>
                <Typography sx={{ fontFamily: T.display, fontSize: 18, fontWeight: 600, color: s.color, letterSpacing: -0.5, lineHeight: 1.2, mt: 0.3 }}>{s.value}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Payment progress bar */}
        <Box mt={2.5}>
          <Stack direction="row" justifyContent="space-between" mb={0.8}>
            <Typography sx={{ fontFamily: T.body, fontSize: 12, color: T.muted }}>Overall Payment Progress</Typography>
            <Typography sx={{ fontFamily: T.body, fontSize: 12, fontWeight: 800, color: paidPct === 100 ? T.accent : T.gold }}>{paidPct.toFixed(0)}% collected · {fmtINR(paidAmt)} of {fmtINR(totalAmt)}</Typography>
          </Stack>
          <LinearProgress variant="determinate" value={paidPct}
            sx={{ height: 8, borderRadius: 4, bgcolor: T.border, '& .MuiLinearProgress-bar': { borderRadius: 4, background: `linear-gradient(90deg, ${T.gold}, ${T.accent})` } }} />
        </Box>
      </Box>

      {/* ── TABS ── */}
      <Box sx={{ bgcolor: T.surface, borderBottom: `1px solid ${T.border}`, px: { xs: 3, md: 5 }, position: 'sticky', top: 0, zIndex: 10 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontFamily: T.body, fontSize: 13, color: T.muted, minHeight: 50 }, '& .MuiTabs-indicator': { bgcolor: T.gold, height: 2.5, borderRadius: 2 }, '& .Mui-selected': { color: `${T.gold} !important` } }}>
          <Tab label="Overview" />
          <Tab label="Payment Schedule" />
          <Tab label="Documents" />
          <Tab label="Timeline" />
        </Tabs>
      </Box>

      <Box sx={{ px: { xs: 3, md: 5 }, pt: 4 }}>

        {/* ── OVERVIEW TAB ── */}
        {tab === 0 && (
          <Grid container spacing={3}>
            {/* Customer details */}
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, borderRadius: 3, bgcolor: T.surface, border: `1px solid ${T.border}`, boxShadow: 'none' }}>
                <Stack direction="row" spacing={1.2} alignItems="center" mb={2.5}>
                  <PersonOutlined sx={{ fontSize: 16, color: T.gold }} />
                  <Typography sx={{ fontFamily: T.body, fontWeight: 800, fontSize: 14, color: T.text }}>Customer Information</Typography>
                </Stack>
                <Grid container spacing={2}>
                  {[
                    { label: 'Full Name', val: BOOKING.customerName },
                    { label: 'Phone', val: BOOKING.customerPhone },
                    { label: 'Email', val: BOOKING.customerEmail },
                    { label: 'PAN Number', val: BOOKING.pan },
                    { label: 'Aadhar', val: BOOKING.aadhar },
                    { label: 'Address', val: BOOKING.address },
                    { label: 'Nominee Name', val: BOOKING.nomineeName },
                    { label: 'Nominee Relation', val: BOOKING.nomineeRelation },
                  ].map(r => (
                    <Grid item xs={6} key={r.label}>
                      <Typography sx={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: T.sub, textTransform: 'uppercase', letterSpacing: 0.8, mb: 0.3 }}>{r.label}</Typography>
                      <Typography sx={{ fontFamily: T.body, fontWeight: 700, fontSize: 13.5, color: T.text }}>{r.val}</Typography>
                    </Grid>
                  ))}
                </Grid>
              </Card>
            </Grid>

            {/* Unit details */}
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, borderRadius: 3, bgcolor: T.surface, border: `1px solid ${T.border}`, boxShadow: 'none' }}>
                <Stack direction="row" spacing={1.2} alignItems="center" mb={2.5}>
                  <HomeOutlined sx={{ fontSize: 16, color: T.gold }} />
                  <Typography sx={{ fontFamily: T.body, fontWeight: 800, fontSize: 14, color: T.text }}>Unit Details</Typography>
                </Stack>
                <Grid container spacing={2}>
                  {[
                    { label: 'Project', val: BOOKING.project },
                    { label: 'Tower', val: `Tower ${BOOKING.tower}` },
                    { label: 'Floor', val: BOOKING.floor },
                    { label: 'Unit No.', val: BOOKING.unit },
                    { label: 'Unit Type', val: BOOKING.unitType },
                    { label: 'Super Area', val: BOOKING.area },
                    { label: 'Carpet Area', val: BOOKING.carpet },
                    { label: 'Facing', val: BOOKING.facing },
                  ].map(r => (
                    <Grid item xs={6} key={r.label}>
                      <Typography sx={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: T.sub, textTransform: 'uppercase', letterSpacing: 0.8, mb: 0.3 }}>{r.label}</Typography>
                      <Typography sx={{ fontFamily: T.body, fontWeight: 700, fontSize: 13.5, color: T.text }}>{r.val}</Typography>
                    </Grid>
                  ))}
                </Grid>
              </Card>
            </Grid>

            {/* Agent + Commission */}
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, borderRadius: 3, bgcolor: T.surface, border: `1px solid ${T.border}`, boxShadow: 'none' }}>
                <Stack direction="row" spacing={1.2} alignItems="center" mb={2.5}>
                  <PersonOutlined sx={{ fontSize: 16, color: T.purple }} />
                  <Typography sx={{ fontFamily: T.body, fontWeight: 800, fontSize: 14, color: T.text }}>Agent & Commission</Typography>
                </Stack>
                <Grid container spacing={2}>
                  {[
                    { label: 'Agent', val: BOOKING.agent },
                    { label: 'Channel Partner', val: BOOKING.channelPartner },
                    { label: 'Partner ID', val: BOOKING.channelPartnerId },
                    { label: 'Commission Rate', val: `${BOOKING.commissionRate}%` },
                    { label: 'Commission Amount', val: fmtINR(BOOKING.commissionAmount) },
                    { label: 'Commission Status', val: BOOKING.commissionStatus },
                  ].map(r => (
                    <Grid item xs={6} key={r.label}>
                      <Typography sx={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: T.sub, textTransform: 'uppercase', letterSpacing: 0.8, mb: 0.3 }}>{r.label}</Typography>
                      <Typography sx={{ fontFamily: T.body, fontWeight: 700, fontSize: 13.5, color: r.label === 'Commission Amount' ? T.purple : r.label === 'Commission Status' ? T.warn : T.text }}>{r.val}</Typography>
                    </Grid>
                  ))}
                </Grid>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* ── PAYMENT SCHEDULE TAB ── */}
        {tab === 1 && (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Box>
                <Typography sx={{ fontFamily: T.display, fontSize: 20, color: T.text, fontWeight: 600 }}>Payment Schedule</Typography>
                <Typography sx={{ fontFamily: T.body, fontSize: 12.5, color: T.muted, mt: 0.3 }}>{BOOKING.paymentPlan} · {installments.filter(i=>i.status==='PAID').length}/{installments.length} paid</Typography>
              </Box>
              <Button startIcon={<DownloadOutlined />} sx={{ textTransform: 'none', fontWeight: 700, fontFamily: T.body, borderRadius: 2.5, border: `1px solid ${T.border}`, color: T.muted, '&:hover': { color: T.gold, borderColor: T.gold } }}>
                Export Schedule
              </Button>
            </Stack>
            <Stack spacing={2}>
              {installments.map((inst, i) => {
                const sc = INST_STATUS[inst.status] || INST_STATUS.PENDING;
                const isPaid = inst.status === 'PAID';
                return (
                  <Card key={inst.id} sx={{ p: 3, borderRadius: 3, bgcolor: isPaid ? '#111d15' : T.surface, border: `1px solid ${isPaid ? T.accent + '30' : T.border}`, boxShadow: 'none', transition: 'all 0.15s', '&:hover': { borderColor: sc.color + '50' } }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
                      {/* Number */}
                      <Box sx={{ width: 40, height: 40, borderRadius: 2.5, bgcolor: isPaid ? T.accent + '20' : T.card, border: `1px solid ${isPaid ? T.accent + '40' : T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Typography sx={{ fontFamily: T.body, fontWeight: 800, fontSize: 14, color: isPaid ? T.accent : T.muted }}>{i + 1}</Typography>
                      </Box>
                      <Box flex={1}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }}>
                          <Box>
                            <Typography sx={{ fontFamily: T.body, fontWeight: 800, fontSize: 14, color: T.text }}>{inst.name}</Typography>
                            <Stack direction="row" spacing={2} mt={0.3}>
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <AccessTimeOutlined sx={{ fontSize: 12, color: T.muted }} />
                                <Typography sx={{ fontFamily: T.body, fontSize: 12, color: T.muted }}>Due: {inst.dueDate}</Typography>
                              </Stack>
                              {inst.paidOn && (
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                  <CheckCircleOutlined sx={{ fontSize: 12, color: T.accent }} />
                                  <Typography sx={{ fontFamily: T.body, fontSize: 12, color: T.accent }}>Paid: {inst.paidOn}</Typography>
                                </Stack>
                              )}
                            </Stack>
                          </Box>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Typography sx={{ fontFamily: T.display, fontSize: 22, fontWeight: 600, color: isPaid ? T.accent : T.gold, letterSpacing: -0.8 }}>{fmtINR(inst.amount)}</Typography>
                            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.3, py: 0.5, borderRadius: 1.5, bgcolor: sc.bg }}>
                              <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: sc.dot }} />
                              <Typography sx={{ fontFamily: T.body, fontSize: 10.5, fontWeight: 800, color: sc.color }}>{inst.status}</Typography>
                            </Box>
                            {!isPaid && (
                              <Button size="small" onClick={() => markPaid(inst.id)}
                                sx={{ textTransform: 'none', fontWeight: 700, fontFamily: T.body, fontSize: 11.5, border: `1px solid ${T.accent}40`, borderRadius: 2, color: T.accent, '&:hover': { bgcolor: T.accent + '14' }, flexShrink: 0 }}>
                                Mark Paid
                              </Button>
                            )}
                          </Stack>
                        </Stack>
                      </Box>
                    </Stack>
                  </Card>
                );
              })}
            </Stack>
          </Box>
        )}

        {/* ── DOCUMENTS TAB ── */}
        {tab === 2 && (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography sx={{ fontFamily: T.display, fontSize: 20, color: T.text, fontWeight: 600 }}>Document Vault</Typography>
              <Button variant="contained" startIcon={<UploadFileOutlined />}
                sx={{ textTransform: 'none', fontWeight: 800, fontFamily: T.body, borderRadius: 2.5, background: `linear-gradient(135deg, ${T.gold}, #a07d2e)`, color: T.dark, boxShadow: `0 4px 14px ${T.gold}30`, '&:hover': { filter: 'brightness(1.1)' } }}>
                Upload Document
              </Button>
            </Stack>
            <Grid container spacing={2.5}>
              {DOCUMENTS.map(doc => (
                <Grid item xs={12} sm={6} md={3} key={doc.name}>
                  <Card sx={{ p: 2.5, borderRadius: 3, bgcolor: T.surface, border: `1px solid ${doc.verified ? T.accent + '30' : T.border}`, boxShadow: 'none', transition: 'all 0.2s', '&:hover': { borderColor: T.gold + '50', transform: 'translateY(-2px)' } }}>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start" mb={2}>
                      <Box sx={{ width: 44, height: 44, borderRadius: 3, bgcolor: T.red + '14', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <PictureAsPdfOutlined sx={{ color: T.red, fontSize: 22 }} />
                      </Box>
                      <Box flex={1}>
                        <Typography sx={{ fontFamily: T.body, fontWeight: 800, fontSize: 13, color: T.text, lineHeight: 1.3 }}>{doc.name}</Typography>
                        <Chip
                          label={doc.verified ? '✓ Verified' : 'Pending'}
                          size="small"
                          sx={{ mt: 0.5, fontSize: 9.5, height: 17, bgcolor: doc.verified ? T.accent + '20' : T.warn + '20', color: doc.verified ? T.accent : T.warn, fontWeight: 800 }}
                        />
                      </Box>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography sx={{ fontFamily: T.body, fontSize: 11, color: T.sub }}>{doc.size}</Typography>
                        <Typography sx={{ fontFamily: T.body, fontSize: 11, color: T.sub }}>{doc.uploaded}</Typography>
                      </Box>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Preview"><IconButton size="small" sx={{ color: T.muted, '&:hover': { color: T.blue } }}><VisibilityOutlined sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                        <Tooltip title="Download"><IconButton size="small" sx={{ color: T.muted, '&:hover': { color: T.gold } }}><DownloadOutlined sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>
              ))}
              {/* Upload placeholder */}
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ p: 2.5, borderRadius: 3, bgcolor: T.card, border: `2px dashed ${T.border}`, boxShadow: 'none', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { borderColor: T.gold, bgcolor: T.gold + '06' } }}>
                  <Stack alignItems="center" justifyContent="center" sx={{ height: 100, gap: 1 }}>
                    <UploadFileOutlined sx={{ color: T.border, fontSize: 32 }} />
                    <Typography sx={{ fontFamily: T.body, fontSize: 12.5, color: T.muted, fontWeight: 600 }}>Upload Document</Typography>
                    <Typography sx={{ fontFamily: T.body, fontSize: 11, color: T.sub }}>PDF, JPG · Max 5MB</Typography>
                  </Stack>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* ── TIMELINE TAB ── */}
        {tab === 3 && (
          <Box>
            <Typography sx={{ fontFamily: T.display, fontSize: 20, color: T.text, fontWeight: 600, mb: 3 }}>Booking Timeline</Typography>
            <Stack spacing={0}>
              {TIMELINE.map((item, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 2.5 }}>
                  {/* Left: icon + line */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <Box sx={{ width: 38, height: 38, borderRadius: '50%', bgcolor: item.color + '20', border: `2px solid ${item.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, zIndex: 1 }}>
                      {item.icon}
                    </Box>
                    {i < TIMELINE.length - 1 && (
                      <Box sx={{ width: 2, flex: 1, bgcolor: T.border, my: 0.5, minHeight: 24 }} />
                    )}
                  </Box>
                  {/* Right: content */}
                  <Box pb={i < TIMELINE.length - 1 ? 3 : 0} flex={1}>
                    <Stack direction="row" spacing={1.5} alignItems="center" mb={0.5}>
                      <Typography sx={{ fontFamily: T.body, fontWeight: 800, fontSize: 14, color: T.text }}>{item.event}</Typography>
                    </Stack>
                    <Typography sx={{ fontFamily: T.body, fontSize: 12.5, color: T.muted, mb: 0.5 }}>{item.desc}</Typography>
                    <Typography sx={{ fontFamily: T.body, fontSize: 11.5, color: T.sub }}>{item.date} · {item.time}</Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </Box>

      <TransferDialog open={transferOpen} onClose={() => setTransferOpen(false)} />
    </Box>
  );
};

// ─── Helper used in tab 2 ──────────────────────────────────────────────────────
const VisibilityOutlined = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 24 24" width="1em" fill="currentColor" {...props}>
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
  </svg>
);

export default BookingDetailPage;