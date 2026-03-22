/**
 * REALESSO BOOKING ENGINE
 * Light theme · Professional · Production-ready
 * 
 * Exports:
 *   BookingsPage        — Main listing with KPIs
 *   BookingDetailPage   — Full detail + tabs
 *   PaymentSchedulePage — Installment tracker
 *   BookingAnalyticsPage— Revenue intelligence
 *   BookingRoutes       — React Router integration
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box, Typography, Stack, Grid, Card, Chip, Avatar, Button,
  TextField, InputAdornment, FormControl, InputLabel, Select,
  MenuItem, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Divider, LinearProgress, Tab, Tabs,
  Badge, Snackbar, Alert, Menu, ListItemIcon, ListItemText,
  MenuList, MenuItem as MuiMenuItem, Paper, Skeleton, Drawer,
  ToggleButton, ToggleButtonGroup, TableSortLabel, Pagination,
  Switch, FormControlLabel, Fade, Zoom,
} from '@mui/material';
import {
  SearchOutlined, AddOutlined, DownloadOutlined, VisibilityOutlined,
  EditOutlined, CancelOutlined, SwapHorizOutlined, CloseOutlined,
  HomeOutlined, PersonOutlined, CalendarMonthOutlined, AttachMoneyOutlined,
  CheckCircleOutlined, WarningAmberOutlined, AccessTimeOutlined,
  TrendingUpOutlined, BarChartOutlined, RefreshOutlined, FilterListOutlined,
  PrintOutlined, ReceiptLongOutlined, FolderOutlined, HistoryOutlined,
  UploadFileOutlined, MoreVertOutlined, KeyboardArrowDownOutlined,
  PictureAsPdfOutlined, VerifiedOutlined, ArrowBackOutlined,
  TimelineOutlined, NotificationsOutlined, StarOutlined, LockOutlined,
  BusinessOutlined, PhoneOutlined, EmailOutlined, LocationOnOutlined,
  ContentCopyOutlined, ShareOutlined, BookmarkOutlined, CurrencyRupeeOutlined,
  AssignmentOutlined, AccountBalanceOutlined, PeopleOutlined,
  CheckBoxOutlined, IndeterminateCheckBoxOutlined, TuneOutlined,
  NavigateNextOutlined, SignalCellularAltOutlined,
} from '@mui/icons-material';
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────

const T = {
  // Fonts — editorial serif headline + refined geometric sans
  display: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
  body:    "'Plus Jakarta Sans', 'Nunito', 'Helvetica Neue', sans-serif",
  mono:    "'JetBrains Mono', 'Fira Code', monospace",

  // Light theme palette — warm white with slate tones
  bg:       '#f7f6f3',        // warm off-white canvas
  surface:  '#ffffff',        // card surfaces
  raised:   '#fdfcfa',        // slightly elevated
  border:   '#e8e4dd',        // warm border
  borderSt: '#d4cfc7',        // stronger border

  // Text hierarchy
  ink:      '#1a1714',        // primary text
  inkMd:    '#4a453e',        // secondary text
  inkLt:    '#8c857b',        // tertiary / placeholder
  inkXl:    '#b5ada3',        // disabled

  // Brand accent — deep amber/bronze (real estate luxury)
  brand:    '#b5822a',        // primary brand
  brandDk:  '#8c6420',        // hover / active
  brandLt:  '#f5ecd9',        // brand tint bg
  brandBdr: '#dfc18a',        // brand border

  // Semantic colors
  green:    '#1e7e4a',
  greenBg:  '#edf7f1',
  greenBdr: '#a8d9bb',

  blue:     '#1a5fa8',
  blueBg:   '#edf4fc',
  blueBdr:  '#93c0e8',

  amber:    '#c47c0a',
  amberBg:  '#fff8ec',
  amberBdr: '#f0c97a',

  red:      '#c0302a',
  redBg:    '#fdf0ef',
  redBdr:   '#e8a5a2',

  purple:   '#6b3fa0',
  purpleBg: '#f4effa',
  purpleBdr:'#c4a8e0',

  slate:    '#4e5a6a',
  slateBg:  '#f1f3f5',
  slateBdr: '#c2cad4',
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const fmtINR  = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const fmtCr   = (n: number) =>
  n >= 10_000_000 ? `₹${(n / 10_000_000).toFixed(2)} Cr`
  : n >= 100_000  ? `₹${(n / 100_000).toFixed(1)} L`
  : n >= 1_000    ? `₹${(n / 1_000).toFixed(0)} K`
  : `₹${n}`;

const avatarColor = (s: string) => {
  const colors = [T.brand, T.green, T.blue, T.purple, '#c0302a'];
  return colors[s.charCodeAt(0) % colors.length];
};
const initials = (s: string) =>
  s.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

const timeAgo = (dateStr: string) => {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86_400_000);
  return days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days}d ago`;
};

// ─── SHARED: STATUS CONFIG ────────────────────────────────────────────────────

type BStatus = 'BOOKED' | 'HOLD' | 'CANCELLED' | 'RELEASED' | 'TRANSFERRED' | 'AGREEMENT_PENDING';

const STATUS_CFG: Record<BStatus, {
  color: string; bg: string; border: string; dot: string; label: string; icon: React.ReactNode;
}> = {
  BOOKED:             { color: T.green,  bg: T.greenBg,  border: T.greenBdr,  dot: T.green,  label: 'Booked',            icon: <CheckCircleOutlined sx={{ fontSize: 12 }} /> },
  HOLD:               { color: T.amber,  bg: T.amberBg,  border: T.amberBdr,  dot: T.amber,  label: 'On Hold',           icon: <AccessTimeOutlined  sx={{ fontSize: 12 }} /> },
  CANCELLED:          { color: T.red,    bg: T.redBg,    border: T.redBdr,    dot: T.red,    label: 'Cancelled',         icon: <CancelOutlined      sx={{ fontSize: 12 }} /> },
  RELEASED:           { color: T.slate,  bg: T.slateBg,  border: T.slateBdr,  dot: T.slate,  label: 'Released',          icon: <RefreshOutlined     sx={{ fontSize: 12 }} /> },
  TRANSFERRED:        { color: T.purple, bg: T.purpleBg, border: T.purpleBdr, dot: T.purple, label: 'Transferred',       icon: <SwapHorizOutlined   sx={{ fontSize: 12 }} /> },
  AGREEMENT_PENDING:  { color: T.blue,   bg: T.blueBg,   border: T.blueBdr,   dot: T.blue,   label: 'Agmt. Pending',     icon: <AssignmentOutlined  sx={{ fontSize: 12 }} /> },
};

const INST_STATUS: Record<string, { color: string; bg: string; border: string; dot: string }> = {
  PAID:    { color: T.green,  bg: T.greenBg,  border: T.greenBdr,  dot: T.green  },
  PENDING: { color: T.amber,  bg: T.amberBg,  border: T.amberBdr,  dot: T.amber  },
  OVERDUE: { color: T.red,    bg: T.redBg,    border: T.redBdr,    dot: T.red    },
  PARTIAL: { color: T.blue,   bg: T.blueBg,   border: T.blueBdr,   dot: T.blue   },
};

// ─── SHARED: STATUS BADGE ─────────────────────────────────────────────────────

const StatusBadge = ({
  status, size = 'sm',
}: { status: string; size?: 'xs' | 'sm' | 'md' }) => {
  const cfg = STATUS_CFG[status as BStatus] ??
    { color: T.slate, bg: T.slateBg, border: T.slateBdr, dot: T.slate, label: status, icon: null };
  const px = size === 'xs' ? 0.75 : size === 'md' ? 1.5 : 1;
  const py = size === 'xs' ? 0.3  : size === 'md' ? 0.6  : 0.4;
  const fs = size === 'xs' ? 10   : size === 'md' ? 12   : 11;
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.5,
      px, py, borderRadius: '20px',
      bgcolor: cfg.bg, color: cfg.color,
      border: `1.5px solid ${cfg.border}`,
      fontSize: fs, fontWeight: 800, fontFamily: T.body,
      letterSpacing: '0.01em', whiteSpace: 'nowrap',
    }}>
      <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </Box>
  );
};

// ─── SHARED: KPI CARD ─────────────────────────────────────────────────────────

interface KpiProps {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  onClick?: () => void;
}

const KpiCard = ({ label, value, sub, color, bg, border, icon, trend, onClick }: KpiProps) => (
  <Card onClick={onClick} sx={{
    p: 2.5, borderRadius: '16px', bgcolor: T.surface, boxShadow: 'none',
    border: `1.5px solid ${T.border}`,
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all .2s cubic-bezier(0.4,0,0.2,1)',
    position: 'relative', overflow: 'hidden',
    '&:hover': onClick ? {
      borderColor: color, transform: 'translateY(-2px)',
      boxShadow: `0 8px 24px ${color}18`,
    } : {},
  }}>
    {/* Top accent line */}
    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, bgcolor: color, borderRadius: '16px 16px 0 0' }} />

    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
      <Box sx={{
        width: 38, height: 38, borderRadius: '10px',
        bgcolor: bg, border: `1px solid ${border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color,
      }}>
        {icon}
      </Box>
      {trend && (
        <Box sx={{
          px: 0.75, py: 0.25, borderRadius: '8px',
          bgcolor: trend.value >= 0 ? T.greenBg : T.redBg,
          color: trend.value >= 0 ? T.green : T.red,
          fontSize: 10, fontWeight: 800, fontFamily: T.body,
        }}>
          {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
        </Box>
      )}
    </Stack>

    <Typography sx={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: T.inkLt, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.5 }}>
      {label}
    </Typography>
    <Typography sx={{ fontFamily: T.display, fontSize: 28, fontWeight: 700, color: T.ink, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
      {value}
    </Typography>
    {sub && (
      <Typography sx={{ fontFamily: T.body, fontSize: 11.5, color: T.inkLt, mt: 0.5 }}>{sub}</Typography>
    )}
  </Card>
);

// ─── SHARED: SECTION HEADER ───────────────────────────────────────────────────

const PageHeader = ({
  title, subtitle, tag, tagColor = T.brand, actions, breadcrumb,
}: {
  title: string; subtitle?: string; tag?: string;
  tagColor?: string; actions?: React.ReactNode; breadcrumb?: React.ReactNode;
}) => (
  <Box sx={{
    px: { xs: 3, lg: 5 }, pt: 4, pb: 3.5,
    bgcolor: T.surface, borderBottom: `1px solid ${T.border}`,
    backgroundImage: `radial-gradient(ellipse at top right, ${T.brandLt}60, transparent 60%)`,
  }}>
    {breadcrumb && <Box sx={{ mb: 2 }}>{breadcrumb}</Box>}
    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'flex-end' }} spacing={2.5}>
      <Box>
        {tag && (
          <Box sx={{
            display: 'inline-flex', mb: 1.5, px: 1.25, py: 0.35,
            borderRadius: '8px', bgcolor: `${tagColor}18`, border: `1px solid ${tagColor}40`,
          }}>
            <Typography sx={{ fontFamily: T.body, fontSize: 10, fontWeight: 800, color: tagColor, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              {tag}
            </Typography>
          </Box>
        )}
        <Typography sx={{ fontFamily: T.display, fontSize: { xs: 28, md: 36 }, fontWeight: 700, color: T.ink, letterSpacing: '-0.03em', lineHeight: 1 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ fontFamily: T.body, fontSize: 13, color: T.inkMd, mt: 0.75 }}>{subtitle}</Typography>
        )}
      </Box>
      {actions && <Box>{actions}</Box>}
    </Stack>
  </Box>
);

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

type BookingStatus = 'BOOKED' | 'HOLD' | 'CANCELLED' | 'RELEASED' | 'TRANSFERRED' | 'AGREEMENT_PENDING';

interface Booking {
  id: string; bookingNo: string;
  customerName: string; customerPhone: string; customerEmail: string;
  project: string; tower: string; floor: string; unit: string; unitType: string;
  agent: string; agentId: string; channelPartner?: string;
  bookingAmount: number; totalValue: number; paidAmount: number;
  paymentPlan: string; bookingDate: string; status: BookingStatus;
  paidInstallments: number; totalInstallments: number;
  commissionGenerated: boolean; commissionAmount: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  lastActivity: string; agreementSigned: boolean;
  posessionDate: string;
}

const MOCK_BOOKINGS: Booking[] = [
  { id:'B1', bookingNo:'BK-2026-001', customerName:'Rahul Sharma',   customerPhone:'9876543210', customerEmail:'rahul@email.com',   project:'Skyline Heights',  tower:'A', floor:'3',  unit:'A-302', unitType:'2 BHK', agent:'Priya Mehta',   agentId:'A1', channelPartner:'Elite Realty',    bookingAmount:500000,  totalValue:8500000,  paidAmount:1800000, paymentPlan:'Construction Linked', bookingDate:'2026-04-12', status:'BOOKED',           paidInstallments:2, totalInstallments:6, commissionGenerated:true,  commissionAmount:170000, priority:'HIGH',   lastActivity:'2026-05-10', agreementSigned:true,  posessionDate:'Dec 2027' },
  { id:'B2', bookingNo:'BK-2026-002', customerName:'Sunita Verma',   customerPhone:'9876543211', customerEmail:'sunita@email.com',  project:'Orchid Residency', tower:'B', floor:'5',  unit:'B-504', unitType:'3 BHK', agent:'Arjun Singh',   agentId:'A2', channelPartner:undefined,         bookingAmount:800000,  totalValue:12000000, paidAmount:800000,  paymentPlan:'Down Payment',        bookingDate:'2026-04-10', status:'AGREEMENT_PENDING',paidInstallments:1, totalInstallments:4, commissionGenerated:false, commissionAmount:0,      priority:'HIGH',   lastActivity:'2026-04-10', agreementSigned:false, posessionDate:'Mar 2028' },
  { id:'B3', bookingNo:'BK-2026-003', customerName:'Vikram Joshi',   customerPhone:'9876543212', customerEmail:'vikram@email.com',  project:'Skyline Heights',  tower:'C', floor:'7',  unit:'C-701', unitType:'2 BHK', agent:'Priya Mehta',   agentId:'A1', channelPartner:'Metro Brokers',   bookingAmount:450000,  totalValue:7200000,  paidAmount:0,       paymentPlan:'Time Linked',         bookingDate:'2026-04-08', status:'HOLD',             paidInstallments:0, totalInstallments:5, commissionGenerated:false, commissionAmount:144000, priority:'MEDIUM', lastActivity:'2026-04-08', agreementSigned:false, posessionDate:'Sep 2027' },
  { id:'B4', bookingNo:'BK-2026-004', customerName:'Meena Shah',     customerPhone:'9876543213', customerEmail:'meena@email.com',   project:'Green Valley',     tower:'A', floor:'2',  unit:'A-201', unitType:'1 BHK', agent:'Kavita Joshi',  agentId:'A3', channelPartner:undefined,         bookingAmount:350000,  totalValue:4800000,  paidAmount:2100000, paymentPlan:'Construction Linked', bookingDate:'2026-04-05', status:'BOOKED',           paidInstallments:3, totalInstallments:6, commissionGenerated:true,  commissionAmount:96000,  priority:'MEDIUM', lastActivity:'2026-04-05', agreementSigned:true,  posessionDate:'Jun 2027' },
  { id:'B5', bookingNo:'BK-2026-005', customerName:'Karan Malhotra', customerPhone:'9876543214', customerEmail:'karan@email.com',   project:'Metro Towers',     tower:'D', floor:'10', unit:'D-1002',unitType:'3 BHK', agent:'Arjun Singh',   agentId:'A2', channelPartner:'Prestige Agents', bookingAmount:900000,  totalValue:15000000, paidAmount:900000,  paymentPlan:'Down Payment',        bookingDate:'2026-04-02', status:'CANCELLED',        paidInstallments:1, totalInstallments:5, commissionGenerated:false, commissionAmount:0,      priority:'LOW',    lastActivity:'2026-04-02', agreementSigned:false, posessionDate:'Dec 2028' },
  { id:'B6', bookingNo:'BK-2026-006', customerName:'Priya Kapoor',   customerPhone:'9876543215', customerEmail:'priya@email.com',   project:'Orchid Residency', tower:'C', floor:'4',  unit:'C-404', unitType:'2 BHK', agent:'Kavita Joshi',  agentId:'A3', channelPartner:undefined,         bookingAmount:600000,  totalValue:9500000,  paidAmount:6000000, paymentPlan:'Construction Linked', bookingDate:'2026-03-28', status:'TRANSFERRED',      paidInstallments:4, totalInstallments:6, commissionGenerated:true,  commissionAmount:190000, priority:'LOW',    lastActivity:'2026-04-20', agreementSigned:true,  posessionDate:'Sep 2027' },
  { id:'B7', bookingNo:'BK-2026-007', customerName:'Amit Tiwari',    customerPhone:'9876543216', customerEmail:'amit@email.com',    project:'Skyline Heights',  tower:'B', floor:'8',  unit:'B-801', unitType:'4 BHK', agent:'Priya Mehta',   agentId:'A1', channelPartner:'Elite Realty',    bookingAmount:1200000, totalValue:22000000, paidAmount:18000000,paymentPlan:'Time Linked',         bookingDate:'2026-03-25', status:'BOOKED',           paidInstallments:5, totalInstallments:7, commissionGenerated:true,  commissionAmount:440000, priority:'HIGH',   lastActivity:'2026-05-01', agreementSigned:true,  posessionDate:'Mar 2028' },
];

const INSTALLMENTS_TEMPLATE = [
  { id:'I1', name:'Booking Amount',       pct:0.06, dueOffset:0  },
  { id:'I2', name:'Agreement Amount',     pct:0.15, dueOffset:30 },
  { id:'I3', name:'Foundation Stage',     pct:0.20, dueOffset:90 },
  { id:'I4', name:'Structure Completion', pct:0.24, dueOffset:180},
  { id:'I5', name:'Brickwork Stage',      pct:0.18, dueOffset:270},
  { id:'I6', name:'Possession Amount',    pct:0.17, dueOffset:360},
];

// ─── SHARED: PROGRESS BAR ─────────────────────────────────────────────────────

const PayProgress = ({ paid, total, size = 'sm' }: { paid: number; total: number; size?: 'sm' | 'md' }) => {
  const pct = total > 0 ? Math.min(100, (paid / total) * 100) : 0;
  const barColor = pct === 100 ? T.green : pct > 60 ? T.brand : pct > 30 ? T.amber : T.red;
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" mb={0.5}>
        <Typography sx={{ fontFamily: T.body, fontSize: 10.5, color: T.inkLt }}>{paid}/{total} installments</Typography>
        <Typography sx={{ fontFamily: T.body, fontSize: 10.5, fontWeight: 800, color: barColor }}>{pct.toFixed(0)}%</Typography>
      </Stack>
      <Box sx={{ height: size === 'md' ? 7 : 5, bgcolor: T.border, borderRadius: 10, overflow: 'hidden' }}>
        <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: barColor, borderRadius: 10, transition: 'width .8s ease' }} />
      </Box>
    </Box>
  );
};

// ─── NEW BOOKING DIALOG ───────────────────────────────────────────────────────

const NewBookingDialog = ({
  open, onClose, onSave,
}: { open: boolean; onClose: () => void; onSave: (b: Partial<Booking>) => void }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Partial<Booking>>({
    paymentPlan: 'Construction Linked', status: 'BOOKED', priority: 'MEDIUM',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof Booking, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.customerName) e.customerName = 'Required';
    if (!form.customerPhone) e.customerPhone = 'Required';
    if (!form.unit) e.unit = 'Required';
    if (!form.totalValue) e.totalValue = 'Required';
    if (!form.bookingAmount) e.bookingAmount = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = () => {
    if (!validate()) return;
    onSave({
      ...form,
      id: `B${Date.now()}`,
      bookingNo: `BK-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
      bookingDate: new Date().toISOString().slice(0, 10),
      paidInstallments: 0, totalInstallments: 6,
      paidAmount: form.bookingAmount || 0,
      commissionGenerated: !!form.channelPartner,
      commissionAmount: form.channelPartner ? (form.totalValue || 0) * 0.02 : 0,
      lastActivity: new Date().toISOString().slice(0, 10),
      agreementSigned: false,
    });
    onClose();
    setForm({ paymentPlan: 'Construction Linked', status: 'BOOKED', priority: 'MEDIUM' });
    setStep(0);
  };

  const STEPS = ['Customer', 'Property', 'Financials', 'Review'];

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px', bgcolor: T.bg,
      '& fieldset': { borderColor: T.border },
      '&:hover fieldset': { borderColor: T.brandBdr },
      '&.Mui-focused fieldset': { borderColor: T.brand },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: T.brand },
  };
  const selectSx = { borderRadius: '10px', bgcolor: T.bg };

  const StepIndicator = () => (
    <Stack direction="row" spacing={0} sx={{ mb: 3 }}>
      {STEPS.map((s, i) => (
        <Box key={s} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{
            width: 28, height: 28, borderRadius: '50%',
            bgcolor: i <= step ? T.brand : T.border,
            color: i <= step ? '#fff' : T.inkLt,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800, fontFamily: T.body,
            border: i === step ? `2px solid ${T.brandDk}` : 'none',
            transition: 'all .2s',
          }}>
            {i < step ? '✓' : i + 1}
          </Box>
          <Typography sx={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: i <= step ? T.brand : T.inkXl }}>
            {s}
          </Typography>
          {i < STEPS.length - 1 && (
            <Box sx={{
              position: 'absolute',
              // connector line handled below
            }} />
          )}
        </Box>
      ))}
    </Stack>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{
      sx: { borderRadius: '20px', bgcolor: T.bg, overflow: 'hidden' }
    }}>
      {/* Accent header */}
      <Box sx={{ height: 4, background: `linear-gradient(90deg, ${T.brand}, ${T.brandBdr})` }} />
      <DialogTitle sx={{ bgcolor: T.surface, borderBottom: `1px solid ${T.border}`, p: '20px 24px' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography sx={{ fontFamily: T.display, fontSize: 22, fontWeight: 700, color: T.ink, letterSpacing: '-0.02em' }}>
              New Booking
            </Typography>
            <Typography sx={{ fontFamily: T.body, fontSize: 12, color: T.inkLt, mt: 0.25 }}>
              Step {step + 1} of {STEPS.length} — {STEPS[step]}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: T.inkLt }}>
            <CloseOutlined />
          </IconButton>
        </Stack>

        {/* Step progress bar */}
        <Box sx={{ mt: 2 }}>
          <Box sx={{ height: 3, bgcolor: T.border, borderRadius: 10, overflow: 'hidden' }}>
            <Box sx={{ height: '100%', width: `${((step + 1) / STEPS.length) * 100}%`, bgcolor: T.brand, borderRadius: 10, transition: 'width .3s ease' }} />
          </Box>
          <Stack direction="row" justifyContent="space-between" mt={0.75}>
            {STEPS.map((s, i) => (
              <Typography key={s} sx={{ fontFamily: T.body, fontSize: 10, fontWeight: i <= step ? 800 : 600, color: i <= step ? T.brand : T.inkXl }}>
                {s}
              </Typography>
            ))}
          </Stack>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, bgcolor: T.bg }}>
        {/* STEP 0: Customer */}
        {step === 0 && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography sx={{ fontFamily: T.body, fontSize: 11, fontWeight: 800, color: T.inkLt, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1.5 }}>
                Customer Information
              </Typography>
            </Grid>
            {[
              { label: 'Full Name *', key: 'customerName', xs: 6 },
              { label: 'Phone *', key: 'customerPhone', xs: 6 },
              { label: 'Email Address', key: 'customerEmail', xs: 6 },
              { label: 'PAN Number', key: 'customerPan', xs: 6 },
              { label: 'Aadhar Number', key: 'aadhar', xs: 6 },
              { label: 'Current Address', key: 'address', xs: 6 },
              { label: 'Nominee Name', key: 'nomineeName', xs: 6 },
              { label: 'Nominee Relation', key: 'nomineeRel', xs: 6 },
            ].map(f => (
              <Grid item xs={f.xs} key={f.key}>
                <TextField label={f.label} size="small" fullWidth sx={fieldSx}
                  error={!!errors[f.key]} helperText={errors[f.key]}
                  onChange={e => set(f.key as keyof Booking, e.target.value)} />
              </Grid>
            ))}
          </Grid>
        )}

        {/* STEP 1: Property */}
        {step === 1 && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography sx={{ fontFamily: T.body, fontSize: 11, fontWeight: 800, color: T.inkLt, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1.5 }}>
                Property Details
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small" sx={fieldSx}>
                <InputLabel>Project *</InputLabel>
                <Select label="Project *" value={form.project || ''} onChange={e => set('project', e.target.value)} sx={selectSx}>
                  {['Skyline Heights', 'Orchid Residency', 'Green Valley', 'Metro Towers'].map(p => (
                    <MenuItem key={p} value={p}>{p}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {[
              { label: 'Tower', key: 'tower', xs: 3 },
              { label: 'Floor', key: 'floor', xs: 3 },
              { label: 'Unit Number *', key: 'unit', xs: 6 },
            ].map(f => (
              <Grid item xs={f.xs} key={f.key}>
                <TextField label={f.label} size="small" fullWidth sx={fieldSx}
                  error={!!errors[f.key]} helperText={errors[f.key]}
                  onChange={e => set(f.key as keyof Booking, e.target.value)} />
              </Grid>
            ))}
            <Grid item xs={6}>
              <FormControl fullWidth size="small" sx={fieldSx}>
                <InputLabel>Unit Type</InputLabel>
                <Select label="Unit Type" value={form.unitType || ''} onChange={e => set('unitType', e.target.value)} sx={selectSx}>
                  {['Studio', '1 BHK', '2 BHK', '3 BHK', '4 BHK', 'Penthouse', 'Villa'].map(t => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField label="Possession Date" size="small" fullWidth sx={fieldSx}
                placeholder="e.g. Dec 2027" onChange={e => set('posessionDate', e.target.value)} />
            </Grid>
          </Grid>
        )}

        {/* STEP 2: Financials */}
        {step === 2 && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography sx={{ fontFamily: T.body, fontSize: 11, fontWeight: 800, color: T.inkLt, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1.5 }}>
                Financial Details
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField label="Total Unit Value (₹) *" size="small" fullWidth type="number" sx={fieldSx}
                error={!!errors.totalValue} helperText={errors.totalValue}
                onChange={e => set('totalValue', +e.target.value)} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Booking Amount (₹) *" size="small" fullWidth type="number" sx={fieldSx}
                error={!!errors.bookingAmount} helperText={errors.bookingAmount}
                onChange={e => set('bookingAmount', +e.target.value)} />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small" sx={fieldSx}>
                <InputLabel>Payment Plan</InputLabel>
                <Select label="Payment Plan" value={form.paymentPlan || ''} onChange={e => set('paymentPlan', e.target.value)} sx={selectSx}>
                  {['Construction Linked', 'Down Payment', 'Time Linked', 'Subvention'].map(p => (
                    <MenuItem key={p} value={p}>{p}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small" sx={fieldSx}>
                <InputLabel>Sales Agent</InputLabel>
                <Select label="Sales Agent" value={form.agent || ''} onChange={e => set('agent', e.target.value)} sx={selectSx}>
                  {['Priya Mehta', 'Arjun Singh', 'Kavita Joshi'].map(a => (
                    <MenuItem key={a} value={a}>{a}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField label="Channel Partner (optional)" size="small" fullWidth sx={fieldSx}
                onChange={e => set('channelPartner', e.target.value)} />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small" sx={fieldSx}>
                <InputLabel>Priority</InputLabel>
                <Select label="Priority" value={form.priority || 'MEDIUM'} onChange={e => set('priority', e.target.value)} sx={selectSx}>
                  {['HIGH', 'MEDIUM', 'LOW'].map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            {/* Calculated commission preview */}
            {form.channelPartner && form.totalValue && (
              <Grid item xs={12}>
                <Box sx={{ p: 2, borderRadius: '12px', bgcolor: T.purpleBg, border: `1px solid ${T.purpleBdr}`, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <PeopleOutlined sx={{ color: T.purple, fontSize: 18 }} />
                  <Box>
                    <Typography sx={{ fontFamily: T.body, fontSize: 12, fontWeight: 800, color: T.purple }}>
                      Commission Auto-Calculated
                    </Typography>
                    <Typography sx={{ fontFamily: T.body, fontSize: 12, color: T.inkMd }}>
                      {form.channelPartner} → 2% = {fmtINR(form.totalValue * 0.02)} to be paid after agreement
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        )}

        {/* STEP 3: Review */}
        {step === 3 && (
          <Box>
            <Typography sx={{ fontFamily: T.body, fontSize: 11, fontWeight: 800, color: T.inkLt, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 2 }}>
              Review & Confirm
            </Typography>
            <Grid container spacing={2}>
              {[
                { label: 'Customer',    value: form.customerName },
                { label: 'Phone',       value: form.customerPhone },
                { label: 'Project',     value: form.project },
                { label: 'Unit',        value: form.unit },
                { label: 'Unit Type',   value: form.unitType },
                { label: 'Total Value', value: form.totalValue ? fmtINR(form.totalValue) : '—' },
                { label: 'Booking Amt', value: form.bookingAmount ? fmtINR(form.bookingAmount) : '—' },
                { label: 'Payment Plan',value: form.paymentPlan },
                { label: 'Agent',       value: form.agent },
                { label: 'Channel Partner', value: form.channelPartner || 'None' },
              ].map(r => (
                <Grid item xs={6} key={r.label}>
                  <Box sx={{ p: 1.5, bgcolor: T.surface, borderRadius: '10px', border: `1px solid ${T.border}` }}>
                    <Typography sx={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: T.inkLt, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{r.label}</Typography>
                    <Typography sx={{ fontFamily: T.body, fontSize: 13.5, fontWeight: 700, color: T.ink, mt: 0.25 }}>{r.value || '—'}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ mt: 2.5, p: 2, bgcolor: T.greenBg, border: `1px solid ${T.greenBdr}`, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CheckCircleOutlined sx={{ color: T.green, fontSize: 18 }} />
              <Typography sx={{ fontFamily: T.body, fontSize: 12.5, color: T.green, fontWeight: 700 }}>
                Unit will be locked and payment schedule auto-generated upon confirmation
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>

      <Divider sx={{ borderColor: T.border }} />
      <DialogActions sx={{ px: 3, py: 2, bgcolor: T.surface, gap: 1 }}>
        {step > 0 && (
          <Button onClick={() => setStep(s => s - 1)} sx={{ textTransform: 'none', fontWeight: 700, fontFamily: T.body, borderRadius: '10px', color: T.inkMd }}>
            Back
          </Button>
        )}
        <Box flex={1} />
        <Button onClick={onClose} sx={{ textTransform: 'none', fontWeight: 700, fontFamily: T.body, borderRadius: '10px', color: T.inkLt }}>
          Cancel
        </Button>
        {step < STEPS.length - 1 ? (
          <Button variant="contained" disableElevation onClick={() => setStep(s => s + 1)}
            sx={{ textTransform: 'none', fontWeight: 800, fontFamily: T.body, borderRadius: '10px', bgcolor: T.brand, '&:hover': { bgcolor: T.brandDk }, px: 3 }}>
            Next →
          </Button>
        ) : (
          <Button variant="contained" disableElevation onClick={save}
            sx={{ textTransform: 'none', fontWeight: 800, fontFamily: T.body, borderRadius: '10px', bgcolor: T.brand, '&:hover': { bgcolor: T.brandDk }, px: 3 }}>
            Confirm Booking
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

// ─── CANCEL DIALOG ────────────────────────────────────────────────────────────

const CancelDialog = ({
  booking, onClose, onConfirm,
}: { booking: Booking | null; onClose: () => void; onConfirm: (id: string, r: string) => void }) => {
  const [reason, setReason] = useState('');
  const [refund, setRefund] = useState<'FULL' | 'PARTIAL' | 'NONE'>('FULL');
  const open = !!booking;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px', bgcolor: T.bg } }}>
      <Box sx={{ height: 3, bgcolor: T.red }} />
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: T.surface, borderBottom: `1px solid ${T.border}` }}>
        <Box>
          <Typography sx={{ fontFamily: T.display, fontSize: 20, fontWeight: 700, color: T.ink }}>Cancel Booking</Typography>
          <Typography sx={{ fontFamily: T.body, fontSize: 12, color: T.inkLt }}>This action will release the unit back to inventory</Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: T.inkLt }}><CloseOutlined /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        {booking && (
          <Box sx={{ mb: 2.5, p: 2, bgcolor: T.redBg, border: `1px solid ${T.redBdr}`, borderRadius: '12px' }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar sx={{ width: 38, height: 38, bgcolor: avatarColor(booking.customerName), fontSize: 14, fontWeight: 800 }}>
                {initials(booking.customerName)}
              </Avatar>
              <Box>
                <Typography sx={{ fontFamily: T.body, fontWeight: 800, fontSize: 14, color: T.ink }}>{booking.customerName}</Typography>
                <Typography sx={{ fontFamily: T.body, fontSize: 12, color: T.inkMd }}>{booking.project} · {booking.unit} · {booking.bookingNo}</Typography>
                <Typography sx={{ fontFamily: T.body, fontSize: 12, color: T.red, fontWeight: 700 }}>
                  Collected: {fmtINR(booking.paidAmount)} — will need refund processing
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}

        <Typography sx={{ fontFamily: T.body, fontSize: 11, fontWeight: 800, color: T.inkLt, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1 }}>
          Refund Policy
        </Typography>
        <Stack direction="row" spacing={1} mb={2.5}>
          {(['FULL', 'PARTIAL', 'NONE'] as const).map(r => (
            <Box key={r} onClick={() => setRefund(r)} sx={{
              flex: 1, p: 1.5, borderRadius: '10px', cursor: 'pointer', textAlign: 'center',
              border: `2px solid ${refund === r ? T.red : T.border}`,
              bgcolor: refund === r ? T.redBg : T.surface,
              transition: 'all .15s',
            }}>
              <Typography sx={{ fontFamily: T.body, fontSize: 12, fontWeight: 800, color: refund === r ? T.red : T.inkMd }}>
                {r}
              </Typography>
              <Typography sx={{ fontFamily: T.body, fontSize: 10, color: T.inkLt }}>
                {r === 'FULL' ? '100% returned' : r === 'PARTIAL' ? 'After deductions' : 'No refund'}
              </Typography>
            </Box>
          ))}
        </Stack>

        <TextField label="Cancellation Reason *" multiline rows={3} fullWidth size="small"
          value={reason} onChange={e => setReason(e.target.value)}
          placeholder="State the reason for cancellation..."
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: '10px', '& fieldset': { borderColor: T.border }, '&.Mui-focused fieldset': { borderColor: T.red } },
          }} />
      </DialogContent>
      <Divider sx={{ borderColor: T.border }} />
      <DialogActions sx={{ px: 3, py: 2, bgcolor: T.surface, gap: 1 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', fontWeight: 700, fontFamily: T.body, borderRadius: '10px', color: T.inkLt }}>
          Keep Booking
        </Button>
        <Box flex={1} />
        <Button variant="contained" disableElevation disabled={!reason}
          onClick={() => { booking && onConfirm(booking.id, reason); setReason(''); }}
          sx={{ textTransform: 'none', fontWeight: 800, fontFamily: T.body, borderRadius: '10px', bgcolor: T.red, '&:hover': { bgcolor: '#a52824' }, boxShadow: 'none', px: 3 }}>
          Confirm Cancellation
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── TRANSFER DIALOG ──────────────────────────────────────────────────────────

const TransferDialog = ({
  booking, onClose,
}: { booking: Booking | null; onClose: () => void }) => {
  const [form, setForm] = useState({ name: '', phone: '', email: '', date: '', fee: '' });
  const open = !!booking;

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
      '& fieldset': { borderColor: T.border },
      '&.Mui-focused fieldset': { borderColor: T.purple },
    },
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px', bgcolor: T.bg } }}>
      <Box sx={{ height: 3, bgcolor: T.purple }} />
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: T.surface, borderBottom: `1px solid ${T.border}` }}>
        <Box>
          <Typography sx={{ fontFamily: T.display, fontSize: 20, fontWeight: 700, color: T.ink }}>Transfer Booking</Typography>
          <Typography sx={{ fontFamily: T.body, fontSize: 12, color: T.inkLt }}>Transfer ownership to a new customer</Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: T.inkLt }}><CloseOutlined /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        {booking && (
          <Box sx={{ mb: 2.5, p: 2, bgcolor: T.purpleBg, border: `1px solid ${T.purpleBdr}`, borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography sx={{ fontFamily: T.body, fontSize: 10.5, fontWeight: 700, color: T.inkLt, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Current Owner</Typography>
              <Typography sx={{ fontFamily: T.body, fontWeight: 800, fontSize: 14, color: T.ink }}>{booking.customerName}</Typography>
              <Typography sx={{ fontFamily: T.body, fontSize: 12, color: T.inkMd }}>{booking.project} · {booking.unit}</Typography>
            </Box>
            <SwapHorizOutlined sx={{ color: T.purple, fontSize: 28 }} />
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontFamily: T.body, fontSize: 10.5, fontWeight: 700, color: T.inkLt, textTransform: 'uppercase', letterSpacing: '0.08em' }}>New Owner</Typography>
              <Typography sx={{ fontFamily: T.body, fontWeight: 800, fontSize: 14, color: form.name || T.inkXl }}>{form.name || '—'}</Typography>
              <Typography sx={{ fontFamily: T.body, fontSize: 12, color: T.inkMd }}>{form.phone || 'Not entered'}</Typography>
            </Box>
          </Box>
        )}

        <Grid container spacing={2}>
          {[
            { label: 'New Customer Name *', key: 'name', xs: 6 },
            { label: 'Phone Number *', key: 'phone', xs: 6 },
            { label: 'Email Address', key: 'email', xs: 6 },
            { label: 'Transfer Fee (₹)', key: 'fee', xs: 6, type: 'number' },
            { label: 'Transfer Date', key: 'date', xs: 6, type: 'date' },
          ].map(f => (
            <Grid item xs={f.xs} key={f.key}>
              <TextField label={f.label} size="small" fullWidth type={f.type || 'text'}
                InputLabelProps={f.type === 'date' ? { shrink: true } : {}}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                sx={fieldSx} />
            </Grid>
          ))}
          <Grid item xs={12}>
            <TextField label="Transfer Reason / Notes" size="small" fullWidth multiline rows={2} sx={fieldSx} />
          </Grid>
        </Grid>
      </DialogContent>
      <Divider sx={{ borderColor: T.border }} />
      <DialogActions sx={{ px: 3, py: 2, bgcolor: T.surface, gap: 1 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', fontFamily: T.body, color: T.inkLt, borderRadius: '10px' }}>Cancel</Button>
        <Box flex={1} />
        <Button variant="contained" disableElevation disabled={!form.name || !form.phone}
          sx={{ textTransform: 'none', fontWeight: 800, fontFamily: T.body, borderRadius: '10px', bgcolor: T.purple, '&:hover': { bgcolor: '#5a359a' }, boxShadow: 'none', px: 3 }}>
          Confirm Transfer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// BOOKINGS LIST PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export const BookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [agentFilter, setAgentFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sortField, setSortField] = useState<keyof Booking>('bookingDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [newOpen, setNewOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [transferTarget, setTransferTarget] = useState<Booking | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [page, setPage] = useState(1);
  const [bulkAnchor, setBulkAnchor] = useState<HTMLElement | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({ open: false, msg: '', severity: 'success' });
  const PAGE_SIZE = 10;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let f = bookings.filter(b =>
      (!q || b.customerName.toLowerCase().includes(q) || b.bookingNo.toLowerCase().includes(q) || b.unit.toLowerCase().includes(q) || b.project.toLowerCase().includes(q)) &&
      (statusFilter  === 'ALL' || b.status  === statusFilter) &&
      (projectFilter === 'ALL' || b.project === projectFilter) &&
      (agentFilter   === 'ALL' || b.agent   === agentFilter) &&
      (priorityFilter === 'ALL' || b.priority === priorityFilter)
    );
    f.sort((a, b) => {
      const av = a[sortField] as string, bv = b[sortField] as string;
      return sortDir === 'asc' ? av < bv ? -1 : 1 : av > bv ? -1 : 1;
    });
    return f;
  }, [bookings, search, statusFilter, projectFilter, agentFilter, priorityFilter, sortField, sortDir]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => {
    const active = bookings.filter(b => b.status === 'BOOKED' || b.status === 'AGREEMENT_PENDING');
    return {
      total: bookings.length,
      active: active.length,
      hold: bookings.filter(b => b.status === 'HOLD').length,
      cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
      pendingAgreement: bookings.filter(b => b.status === 'AGREEMENT_PENDING').length,
      revenue: active.reduce((s, b) => s + b.totalValue, 0),
      collected: active.reduce((s, b) => s + b.paidAmount, 0),
      commissions: bookings.filter(b => b.commissionGenerated).reduce((s, b) => s + b.commissionAmount, 0),
    };
  }, [bookings]);

  const projects = [...new Set(bookings.map(b => b.project))];
  const agents   = [...new Set(bookings.map(b => b.agent))];

  const handleSort = (field: keyof Booking) => {
    setSortField(f => { if (f === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); return field; });
  };

  const toggleSelect = (id: string) => setSelected(s => { const ns = new Set(s); ns.has(id) ? ns.delete(id) : ns.add(id); return ns; });
  const selectAll = () => setSelected(s => s.size === paginated.length ? new Set() : new Set(paginated.map(b => b.id)));

  const handleBulkStatus = (status: BookingStatus) => {
    setBookings(p => p.map(b => selected.has(b.id) ? { ...b, status } : b));
    setSnack({ open: true, msg: `${selected.size} bookings updated to ${status}`, severity: 'success' });
    setSelected(new Set()); setBulkAnchor(null);
  };

  const handleCancel = (id: string, reason: string) => {
    setBookings(p => p.map(b => b.id === id ? { ...b, status: 'CANCELLED' as BookingStatus } : b));
    setCancelTarget(null);
    setSnack({ open: true, msg: 'Booking cancelled successfully', severity: 'success' });
  };

  const addBooking = (data: Partial<Booking>) => {
    setBookings(p => [data as Booking, ...p]);
    setSnack({ open: true, msg: `Booking ${data.bookingNo} created successfully`, severity: 'success' });
  };

  const exportCSV = () => {
    const rows = [
      ['Booking No', 'Customer', 'Phone', 'Project', 'Unit', 'Type', 'Agent', 'Total Value', 'Paid', 'Status', 'Date'],
      ...filtered.map(b => [b.bookingNo, b.customerName, b.customerPhone, b.project, b.unit, b.unitType, b.agent, b.totalValue, b.paidAmount, b.status, b.bookingDate]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = 'bookings.csv'; a.click();
  };

  const PriorityDot = ({ p }: { p: string }) => (
    <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: p === 'HIGH' ? T.red : p === 'MEDIUM' ? T.amber : T.green, display: 'inline-block', mr: 0.5 }} />
  );

  return (
    <Box sx={{ bgcolor: T.bg, minHeight: '100vh', pb: 8 }}>
      <PageHeader
        title="Bookings"
        tag="Booking Engine"
        subtitle={`${stats.active} active · ${stats.hold} on hold · ${fmtCr(stats.revenue)} portfolio value`}
        actions={
          <Stack direction="row" spacing={1.5}>
            <Button startIcon={<DownloadOutlined />} onClick={exportCSV} variant="outlined" size="small"
              sx={{ textTransform: 'none', fontWeight: 700, fontFamily: T.body, borderRadius: '10px', borderColor: T.border, color: T.inkMd }}>
              Export
            </Button>
            <Button startIcon={<PrintOutlined />} variant="outlined" size="small" onClick={() => window.print()}
              sx={{ textTransform: 'none', fontWeight: 700, fontFamily: T.body, borderRadius: '10px', borderColor: T.border, color: T.inkMd }}>
              Print
            </Button>
            <Button variant="contained" startIcon={<AddOutlined />} disableElevation onClick={() => setNewOpen(true)}
              sx={{ textTransform: 'none', fontWeight: 800, fontFamily: T.body, borderRadius: '10px', bgcolor: T.brand, '&:hover': { bgcolor: T.brandDk }, boxShadow: `0 4px 14px ${T.brand}35` }}>
              New Booking
            </Button>
          </Stack>
        }
      />

      {/* KPI Strip */}
      <Box sx={{ px: { xs: 3, lg: 5 }, py: 3, borderBottom: `1px solid ${T.border}`, bgcolor: T.surface }}>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={4} md={2}>
            <KpiCard label="Total Bookings"   value={stats.total}              sub="All time"
              color={T.brand} bg={T.brandLt} border={T.brandBdr} icon={<HomeOutlined />}
              trend={{ value: 12, label: 'vs last month' }} />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <KpiCard label="Active"           value={stats.active}             sub={`${stats.pendingAgreement} agmt. pending`}
              color={T.green} bg={T.greenBg} border={T.greenBdr} icon={<CheckCircleOutlined />} />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <KpiCard label="On Hold"          value={stats.hold}               sub="Awaiting decision"
              color={T.amber} bg={T.amberBg} border={T.amberBdr} icon={<AccessTimeOutlined />}
              onClick={() => setStatusFilter('HOLD')} />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <KpiCard label="Portfolio"        value={fmtCr(stats.revenue)}     sub="Active bookings value"
              color={T.blue} bg={T.blueBg} border={T.blueBdr} icon={<TrendingUpOutlined />} />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <KpiCard label="Collected"        value={fmtCr(stats.collected)}   sub="Payments received"
              color={T.green} bg={T.greenBg} border={T.greenBdr} icon={<AccountBalanceOutlined />} />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <KpiCard label="Commissions"      value={fmtCr(stats.commissions)} sub="Broker payouts"
              color={T.purple} bg={T.purpleBg} border={T.purpleBdr} icon={<PeopleOutlined />} />
          </Grid>
        </Grid>
      </Box>

      {/* Agreement pending banner */}
      {stats.pendingAgreement > 0 && (
        <Box sx={{ mx: { xs: 3, lg: 5 }, mt: 3, p: 1.75, borderRadius: '12px', bgcolor: T.amberBg, border: `1px solid ${T.amberBdr}`, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <WarningAmberOutlined sx={{ color: T.amber, fontSize: 18, flexShrink: 0 }} />
          <Typography sx={{ fontFamily: T.body, fontSize: 13, color: T.amber, fontWeight: 700, flex: 1 }}>
            {stats.pendingAgreement} booking{stats.pendingAgreement > 1 ? 's' : ''} awaiting agreement signature — collect and upload immediately
          </Typography>
          <Button size="small" onClick={() => setStatusFilter('AGREEMENT_PENDING')}
            sx={{ textTransform: 'none', fontWeight: 800, fontFamily: T.body, color: T.amber, border: `1px solid ${T.amberBdr}`, borderRadius: '8px', fontSize: 12, py: 0.5 }}>
            View
          </Button>
        </Box>
      )}

      {/* Toolbar */}
      <Box sx={{ px: { xs: 3, lg: 5 }, pt: 3, pb: 2, position: 'sticky', top: 0, zIndex: 20, bgcolor: T.bg, borderBottom: `1px solid ${T.border}` }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
          <TextField placeholder="Search name, booking no, unit, project..." size="small" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchOutlined sx={{ fontSize: 17, color: T.inkLt }} /></InputAdornment>,
              sx: { borderRadius: '10px', bgcolor: T.surface, '& fieldset': { borderColor: T.border }, '&:hover fieldset': { borderColor: T.brandBdr } },
              endAdornment: search && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearch('')}><CloseOutlined sx={{ fontSize: 14 }} /></IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, maxWidth: 340 }} />

          <Stack direction="row" spacing={1} flexWrap="wrap">
            {[
              { label: 'Status', val: statusFilter, set: setStatusFilter, opts: Object.keys(STATUS_CFG) },
              { label: 'Project', val: projectFilter, set: setProjectFilter, opts: projects },
              { label: 'Agent', val: agentFilter, set: setAgentFilter, opts: agents },
              { label: 'Priority', val: priorityFilter, set: setPriorityFilter, opts: ['HIGH', 'MEDIUM', 'LOW'] },
            ].map(f => (
              <FormControl key={f.label} size="small" sx={{ minWidth: 120 }}>
                <Select value={f.val} displayEmpty renderValue={v => v === 'ALL' ? <span style={{ color: T.inkLt }}>{f.label}</span> : v}
                  onChange={e => { f.set(e.target.value); setPage(1); }}
                  sx={{ borderRadius: '10px', bgcolor: T.surface, '& .MuiOutlinedInput-notchedOutline': { borderColor: T.border }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: T.brandBdr }, fontSize: 13 }}>
                  <MenuItem value="ALL">All {f.label}s</MenuItem>
                  {f.opts.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </Select>
              </FormControl>
            ))}
          </Stack>

          <Box flex={1} />

          {selected.size > 0 && (
            <>
              <Button variant="outlined" endIcon={<KeyboardArrowDownOutlined />}
                onClick={e => setBulkAnchor(e.currentTarget)}
                sx={{ textTransform: 'none', fontWeight: 800, fontFamily: T.body, borderRadius: '10px', borderColor: T.brand, color: T.brand, whiteSpace: 'nowrap' }}>
                {selected.size} selected
              </Button>
              <Menu anchorEl={bulkAnchor} open={!!bulkAnchor} onClose={() => setBulkAnchor(null)}
                PaperProps={{ sx: { borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,.12)', border: `1px solid ${T.border}`, minWidth: 200 } }}>
                {(['BOOKED', 'HOLD', 'RELEASED'] as BookingStatus[]).map(s => {
                  const cfg = STATUS_CFG[s];
                  return (
                    <MuiMenuItem key={s} onClick={() => handleBulkStatus(s)} sx={{ fontSize: 13, fontFamily: T.body, fontWeight: 700 }}>
                      <ListItemIcon sx={{ color: cfg.color }}>{cfg.icon}</ListItemIcon>
                      <ListItemText>Mark as {cfg.label}</ListItemText>
                    </MuiMenuItem>
                  );
                })}
                <Divider sx={{ borderColor: T.border }} />
                <MuiMenuItem onClick={() => exportCSV()} sx={{ fontSize: 13, fontFamily: T.body, fontWeight: 700 }}>
                  <ListItemIcon><DownloadOutlined /></ListItemIcon>
                  <ListItemText>Export Selected</ListItemText>
                </MuiMenuItem>
              </Menu>
            </>
          )}

          <ToggleButtonGroup value={viewMode} exclusive onChange={(_, v) => v && setViewMode(v)} size="small"
            sx={{ '& .MuiToggleButton-root': { borderColor: T.border, borderRadius: '10px', px: 1.5 } }}>
            <ToggleButton value="table"><Tooltip title="Table"><TableRowsOutlined sx={{ fontSize: 18 }} /></Tooltip></ToggleButton>
            <ToggleButton value="cards"><Tooltip title="Cards"><GridViewOutlined sx={{ fontSize: 18 }} /></Tooltip></ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {/* Active filters + result count */}
        <Stack direction="row" alignItems="center" spacing={1.5} mt={1.5} flexWrap="wrap">
          <Typography sx={{ fontFamily: T.body, fontSize: 12.5, color: T.inkLt, fontWeight: 600 }}>
            {filtered.length} booking{filtered.length !== 1 ? 's' : ''}
            {(statusFilter !== 'ALL' || projectFilter !== 'ALL' || agentFilter !== 'ALL' || search) ? ` (filtered from ${bookings.length})` : ''}
          </Typography>
          {[
            statusFilter !== 'ALL' && { label: `Status: ${statusFilter}`, clear: () => setStatusFilter('ALL') },
            projectFilter !== 'ALL' && { label: `Project: ${projectFilter}`, clear: () => setProjectFilter('ALL') },
            agentFilter !== 'ALL' && { label: `Agent: ${agentFilter}`, clear: () => setAgentFilter('ALL') },
            priorityFilter !== 'ALL' && { label: `Priority: ${priorityFilter}`, clear: () => setPriorityFilter('ALL') },
          ].filter(Boolean).map((f: any) => (
            <Chip key={f.label} label={f.label} size="small" onDelete={f.clear}
              sx={{ fontFamily: T.body, fontWeight: 700, fontSize: 11, bgcolor: T.brandLt, color: T.brand, border: `1px solid ${T.brandBdr}`, '& .MuiChip-deleteIcon': { color: T.brand } }} />
          ))}
        </Stack>
      </Box>

      <Box sx={{ px: { xs: 3, lg: 5 }, pt: 3 }}>

        {/* ── TABLE VIEW ── */}
        {viewMode === 'table' && (
          <Card sx={{ borderRadius: '16px', boxShadow: 'none', border: `1.5px solid ${T.border}`, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: T.raised }}>
                    <TableCell padding="checkbox" sx={{ pl: 2 }}>
                      <input type="checkbox"
                        checked={selected.size === paginated.length && paginated.length > 0}
                        onChange={selectAll} style={{ cursor: 'pointer', accentColor: T.brand }} />
                    </TableCell>
                    {[
                      { label: 'Booking',  field: 'bookingNo' as keyof Booking },
                      { label: 'Customer', field: 'customerName' as keyof Booking },
                      { label: 'Property', field: 'project' as keyof Booking },
                      { label: 'Progress', field: 'paidInstallments' as keyof Booking },
                      { label: 'Value',    field: 'totalValue' as keyof Booking },
                      { label: 'Agent',    field: 'agent' as keyof Booking },
                      { label: 'Status',   field: 'status' as keyof Booking },
                      { label: 'Actions',  field: null },
                    ].map(col => (
                      <TableCell key={col.label} sx={{ fontFamily: T.body, fontWeight: 800, fontSize: 10.5, color: T.inkLt, textTransform: 'uppercase', letterSpacing: '0.08em', py: 1.5, borderBottom: `1.5px solid ${T.border}` }}>
                        {col.field ? (
                          <TableSortLabel
                            active={sortField === col.field}
                            direction={sortField === col.field ? sortDir : 'asc'}
                            onClick={() => col.field && handleSort(col.field)}>
                            {col.label}
                          </TableSortLabel>
                        ) : col.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                        <HomeOutlined sx={{ fontSize: 48, color: T.border, display: 'block', mx: 'auto', mb: 1.5 }} />
                        <Typography sx={{ fontFamily: T.body, color: T.inkLt, fontWeight: 600 }}>No bookings match your filters</Typography>
                      </TableCell>
                    </TableRow>
                  ) : paginated.map(b => {
                    const cfg = STATUS_CFG[b.status];
                    const isSel = selected.has(b.id);
                    return (
                      <TableRow key={b.id} hover selected={isSel}
                        sx={{ cursor: 'pointer', '& td': { py: 1.4, borderBottom: `1px solid ${T.border}` }, bgcolor: isSel ? T.brandLt : 'inherit', '&:hover': { bgcolor: isSel ? T.brandLt : T.raised }, transition: 'background .1s' }}
                        onClick={() => navigate(`/bookings/${b.id}`)}>
                        <TableCell padding="checkbox" sx={{ pl: 2 }} onClick={e => { e.stopPropagation(); toggleSelect(b.id); }}>
                          <input type="checkbox" checked={isSel} onChange={() => toggleSelect(b.id)} style={{ cursor: 'pointer', accentColor: T.brand }} />
                        </TableCell>

                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box sx={{ width: 4, height: 28, borderRadius: 4, bgcolor: b.priority === 'HIGH' ? T.red : b.priority === 'MEDIUM' ? T.amber : T.green }} />
                            <Box>
                              <Typography sx={{ fontFamily: T.mono, fontSize: 12.5, fontWeight: 700, color: T.brand }}>{b.bookingNo}</Typography>
                              <Typography sx={{ fontFamily: T.body, fontSize: 10.5, color: T.inkLt }}>
                                {new Date(b.bookingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Stack direction="row" spacing={1.25} alignItems="center">
                            <Avatar sx={{ width: 32, height: 32, bgcolor: avatarColor(b.customerName), fontSize: 12, fontWeight: 800 }}>
                              {initials(b.customerName)}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontFamily: T.body, fontWeight: 800, fontSize: 13.5, color: T.ink }}>{b.customerName}</Typography>
                              <Typography sx={{ fontFamily: T.body, fontSize: 11, color: T.inkLt }}>{b.customerPhone}</Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Typography sx={{ fontFamily: T.body, fontWeight: 700, fontSize: 13, color: T.ink }}>{b.project}</Typography>
                          <Stack direction="row" spacing={0.5} mt={0.4}>
                            <Chip label={b.unit} size="small" sx={{ fontSize: 10, height: 18, fontWeight: 800, bgcolor: T.brandLt, color: T.brand, border: `1px solid ${T.brandBdr}` }} />
                            <Chip label={b.unitType} size="small" sx={{ fontSize: 10, height: 18, fontWeight: 700, bgcolor: T.slateBg, color: T.slate }} />
                          </Stack>
                        </TableCell>

                        <TableCell sx={{ minWidth: 160 }}>
                          <PayProgress paid={b.paidInstallments} total={b.totalInstallments} />
                          <Typography sx={{ fontFamily: T.body, fontSize: 10.5, color: T.inkLt, mt: 0.3 }}>{fmtCr(b.paidAmount)} of {fmtCr(b.totalValue)}</Typography>
                        </TableCell>

                        <TableCell>
                          <Typography sx={{ fontFamily: T.display, fontSize: 18, fontWeight: 700, color: T.ink, letterSpacing: '-0.02em' }}>{fmtCr(b.totalValue)}</Typography>
                          {b.channelPartner && (
                            <Typography sx={{ fontFamily: T.body, fontSize: 11, color: T.purple }}>{b.channelPartner}</Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar sx={{ width: 24, height: 24, bgcolor: avatarColor(b.agent), fontSize: 9, fontWeight: 800 }}>
                              {initials(b.agent)}
                            </Avatar>
                            <Typography sx={{ fontFamily: T.body, fontSize: 12, color: T.inkMd }}>{b.agent.split(' ')[0]}</Typography>
                          </Stack>
                        </TableCell>

                        <TableCell><StatusBadge status={b.status} /></TableCell>

                        <TableCell onClick={e => e.stopPropagation()}>
                          <Stack direction="row" spacing={0.25}>
                            <Tooltip title="View Detail">
                              <IconButton size="small" onClick={() => navigate(`/bookings/${b.id}`)}
                                sx={{ color: T.inkLt, '&:hover': { color: T.brand, bgcolor: T.brandLt } }}>
                                <VisibilityOutlined sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            {b.status === 'BOOKED' && (
                              <Tooltip title="Cancel Booking">
                                <IconButton size="small" onClick={() => setCancelTarget(b)}
                                  sx={{ color: T.inkLt, '&:hover': { color: T.red, bgcolor: T.redBg } }}>
                                  <CancelOutlined sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Transfer Ownership">
                              <IconButton size="small" onClick={() => setTransferTarget(b)}
                                sx={{ color: T.inkLt, '&:hover': { color: T.purple, bgcolor: T.purpleBg } }}>
                                <SwapHorizOutlined sx={{ fontSize: 16 }} />
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

            {/* Table Footer */}
            <Box sx={{ px: 3, py: 1.75, bgcolor: T.raised, borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontFamily: T.body, fontSize: 12, color: T.inkLt }}>
                {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </Typography>
              <Pagination count={Math.ceil(filtered.length / PAGE_SIZE)} page={page} onChange={(_, v) => setPage(v)} size="small"
                sx={{ '& .MuiPaginationItem-root': { fontFamily: T.body, fontWeight: 700 }, '& .Mui-selected': { bgcolor: T.brandLt, color: T.brand } }} />
              <Typography sx={{ fontFamily: T.display, fontSize: 14, fontWeight: 700, color: T.ink, letterSpacing: '-0.02em' }}>
                Total: {fmtCr(filtered.reduce((s, b) => s + b.totalValue, 0))}
              </Typography>
            </Box>
          </Card>
        )}

        {/* ── CARDS VIEW ── */}
        {viewMode === 'cards' && (
          <>
            <Grid container spacing={2}>
              {paginated.map(b => {
                const cfg = STATUS_CFG[b.status];
                return (
                  <Grid item xs={12} sm={6} lg={4} key={b.id}>
                    <Card onClick={() => navigate(`/bookings/${b.id}`)} sx={{
                      borderRadius: '20px', border: `1.5px solid ${T.border}`, boxShadow: 'none',
                      cursor: 'pointer', overflow: 'hidden', bgcolor: T.surface,
                      transition: 'all .2s cubic-bezier(0.4,0,0.2,1)',
                      '&:hover': { borderColor: cfg.border, transform: 'translateY(-3px)', boxShadow: `0 12px 32px ${cfg.color}15` },
                    }}>
                      <Box sx={{ height: 3, bgcolor: cfg.color }} />
                      <Box sx={{ p: 2.5 }}>
                        <Stack direction="row" justifyContent="space-between" mb={2}>
                          <Stack direction="row" spacing={1.25} alignItems="center">
                            <Avatar sx={{ width: 38, height: 38, bgcolor: avatarColor(b.customerName), fontSize: 14, fontWeight: 800 }}>
                              {initials(b.customerName)}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontFamily: T.body, fontWeight: 800, fontSize: 14, color: T.ink }}>{b.customerName}</Typography>
                              <Typography sx={{ fontFamily: T.mono, fontSize: 11, color: T.brand }}>{b.bookingNo}</Typography>
                            </Box>
                          </Stack>
                          <StatusBadge status={b.status} />
                        </Stack>

                        <Box sx={{ p: 1.5, bgcolor: T.bg, borderRadius: '10px', mb: 2 }}>
                          <Typography sx={{ fontFamily: T.body, fontWeight: 700, fontSize: 13, color: T.ink }}>{b.project}</Typography>
                          <Stack direction="row" spacing={0.75} mt={0.5}>
                            <Chip label={b.unit} size="small" sx={{ fontSize: 10, height: 18, fontWeight: 800, bgcolor: T.brandLt, color: T.brand }} />
                            <Chip label={b.unitType} size="small" sx={{ fontSize: 10, height: 18 }} />
                            <Chip label={`F-${b.floor}`} size="small" sx={{ fontSize: 10, height: 18 }} />
                          </Stack>
                        </Box>

                        <Stack direction="row" justifyContent="space-between" alignItems="flex-end" mb={2}>
                          <Box>
                            <Typography sx={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: T.inkLt, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Value</Typography>
                            <Typography sx={{ fontFamily: T.display, fontSize: 22, fontWeight: 700, color: T.ink, letterSpacing: '-0.03em' }}>{fmtCr(b.totalValue)}</Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography sx={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: T.inkLt, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Collected</Typography>
                            <Typography sx={{ fontFamily: T.body, fontSize: 14, fontWeight: 800, color: T.green }}>{fmtCr(b.paidAmount)}</Typography>
                          </Box>
                        </Stack>

                        <PayProgress paid={b.paidInstallments} total={b.totalInstallments} size="md" />

                        <Divider sx={{ my: 2, borderColor: T.border }} />

                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar sx={{ width: 22, height: 22, bgcolor: avatarColor(b.agent), fontSize: 8, fontWeight: 800 }}>{initials(b.agent)}</Avatar>
                            <Typography sx={{ fontFamily: T.body, fontSize: 12, color: T.inkMd }}>{b.agent}</Typography>
                          </Stack>
                          <Typography sx={{ fontFamily: T.body, fontSize: 11, color: T.inkLt }}>{timeAgo(b.bookingDate)}</Typography>
                        </Stack>
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
            {filtered.length > PAGE_SIZE && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination count={Math.ceil(filtered.length / PAGE_SIZE)} page={page} onChange={(_, v) => setPage(v)}
                  sx={{ '& .Mui-selected': { bgcolor: T.brandLt, color: T.brand } }} />
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Dialogs */}
      <NewBookingDialog open={newOpen} onClose={() => setNewOpen(false)} onSave={addBooking} />
      <CancelDialog   booking={cancelTarget}   onClose={() => setCancelTarget(null)}   onConfirm={handleCancel} />
      <TransferDialog booking={transferTarget}  onClose={() => setTransferTarget(null)} />

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} sx={{ borderRadius: '12px', fontFamily: T.body, fontWeight: 700 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// BOOKING DETAIL PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export const BookingDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState(0);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({ open: false, msg: '', severity: 'success' });
  const booking = MOCK_BOOKINGS.find(b => b.id === id) ?? MOCK_BOOKINGS[0];
  const [transferOpen, setTransferOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const [installments, setInstallments] = useState(() =>
    INSTALLMENTS_TEMPLATE.map((t, i) => ({
      id: t.id, name: t.name,
      amount: Math.round(booking.totalValue * t.pct),
      dueDate: new Date(Date.now() + t.dueOffset * 86_400_000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: i < booking.paidInstallments ? 'PAID' : 'PENDING' as 'PAID' | 'PENDING' | 'OVERDUE',
      paidOn: i < booking.paidInstallments ? new Date(Date.now() - (booking.paidInstallments - i) * 30 * 86_400_000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
    }))
  );

  const TIMELINE = [
    { date: booking.bookingDate, time: '10:32 AM', event: 'Booking Created', desc: `Registered by ${booking.agent}`, color: T.brand, icon: <HomeOutlined sx={{ fontSize: 14 }} /> },
    { date: booking.bookingDate, time: '11:00 AM', event: 'Unit Locked', desc: `${booking.unit} status set to BOOKED`, color: T.green, icon: <LockOutlined sx={{ fontSize: 14 }} /> },
    booking.commissionGenerated && { date: booking.bookingDate, time: '11:15 AM', event: 'Commission Generated', desc: `${fmtINR(booking.commissionAmount)} for ${booking.channelPartner}`, color: T.purple, icon: <PeopleOutlined sx={{ fontSize: 14 }} /> },
    booking.agreementSigned && { date: booking.bookingDate, time: '2:00 PM', event: 'Agreement Signed', desc: 'Booking agreement executed and uploaded', color: T.blue, icon: <AssignmentOutlined sx={{ fontSize: 14 }} /> },
    ...installments.filter(i => i.status === 'PAID').map(i => ({
      date: i.paidOn, time: '04:00 PM', event: 'Payment Received', desc: `${i.name} — ${fmtINR(i.amount)}`, color: T.green, icon: <AccountBalanceOutlined sx={{ fontSize: 14 }} />,
    })),
  ].filter(Boolean) as { date: string; time: string; event: string; desc: string; color: string; icon: React.ReactNode }[];

  const DOCUMENTS = [
    { name: 'Booking Agreement', type: 'PDF', size: '2.1 MB', uploaded: booking.bookingDate, verified: booking.agreementSigned },
    { name: 'PAN Card Copy',     type: 'PDF', size: '0.4 MB', uploaded: booking.bookingDate, verified: true },
    { name: 'Aadhar Card',       type: 'PDF', size: '0.6 MB', uploaded: booking.bookingDate, verified: true },
    { name: 'KYC Form',          type: 'PDF', size: '1.2 MB', uploaded: booking.bookingDate, verified: false },
  ];

  const paidAmt  = installments.filter(i => i.status === 'PAID').reduce((s, i) => s + i.amount, 0);
  const totalAmt = installments.reduce((s, i) => s + i.amount, 0);
  const paidPct  = totalAmt > 0 ? (paidAmt / totalAmt) * 100 : 0;

  const markPaid = (instId: string) => {
    setInstallments(p => p.map(i => i.id === instId ? {
      ...i, status: 'PAID' as const,
      paidOn: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    } : i));
    setSnack({ open: true, msg: 'Installment marked as paid', severity: 'success' });
  };

  const cfg = STATUS_CFG[booking.status as BStatus] ?? STATUS_CFG.BOOKED;

  return (
    <Box sx={{ bgcolor: T.bg, minHeight: '100vh', pb: 8 }}>
      <PageHeader
        title={booking.customerName}
        subtitle={`${booking.bookingNo} · ${booking.project} · ${booking.unit}`}
        breadcrumb={
          <Box onClick={() => navigate('/bookings')} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 0.5, borderRadius: '8px', border: `1px solid ${T.border}`, cursor: 'pointer', color: T.inkMd, fontFamily: T.body, fontSize: 12.5, fontWeight: 700, transition: 'all .15s', '&:hover': { borderColor: T.brand, color: T.brand, bgcolor: T.brandLt } }}>
            <ArrowBackOutlined sx={{ fontSize: 14 }} /> All Bookings
          </Box>
        }
        actions={
          <Stack direction="row" spacing={1.25}>
            <StatusBadge status={booking.status} size="md" />
            <Button startIcon={<SwapHorizOutlined />} onClick={() => setTransferOpen(true)} variant="outlined" size="small"
              sx={{ textTransform: 'none', fontWeight: 700, fontFamily: T.body, borderRadius: '10px', borderColor: T.purpleBdr, color: T.purple, '&:hover': { bgcolor: T.purpleBg } }}>
              Transfer
            </Button>
            <Button startIcon={<CancelOutlined />} onClick={() => setCancelOpen(true)} variant="outlined" size="small"
              sx={{ textTransform: 'none', fontWeight: 700, fontFamily: T.body, borderRadius: '10px', borderColor: T.redBdr, color: T.red, '&:hover': { bgcolor: T.redBg } }}>
              Cancel
            </Button>
            <Button startIcon={<EditOutlined />} variant="contained" disableElevation size="small"
              sx={{ textTransform: 'none', fontWeight: 800, fontFamily: T.body, borderRadius: '10px', bgcolor: T.brand, '&:hover': { bgcolor: T.brandDk } }}>
              Edit
            </Button>
          </Stack>
        }
      />

      {/* Stats Strip */}
      <Box sx={{ bgcolor: T.surface, borderBottom: `1px solid ${T.border}`, px: { xs: 3, lg: 5 }, py: 2.5 }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {[
            { label: 'Total Value',    value: fmtCr(booking.totalValue), color: T.ink },
            { label: 'Collected',      value: fmtCr(paidAmt),            color: T.green },
            { label: 'Balance Due',    value: fmtCr(totalAmt - paidAmt), color: T.red },
            { label: 'Payment Plan',   value: booking.paymentPlan,        color: T.blue },
            { label: 'Commission',     value: booking.commissionGenerated ? fmtINR(booking.commissionAmount) : 'None', color: T.purple },
            { label: 'Possession',     value: booking.posessionDate,       color: T.ink },
          ].map(s => (
            <Grid item xs={6} sm={4} md={2} key={s.label}>
              <Box sx={{ p: 1.5, bgcolor: T.bg, borderRadius: '12px', border: `1px solid ${T.border}` }}>
                <Typography sx={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: T.inkLt, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</Typography>
                <Typography sx={{ fontFamily: T.display, fontSize: 18, fontWeight: 700, color: s.color, letterSpacing: '-0.02em', lineHeight: 1.3, mt: 0.25 }}>{s.value}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
        {/* Overall progress */}
        <Box>
          <Stack direction="row" justifyContent="space-between" mb={0.75}>
            <Typography sx={{ fontFamily: T.body, fontSize: 12, color: T.inkLt }}>Overall Payment Progress</Typography>
            <Typography sx={{ fontFamily: T.body, fontSize: 12, fontWeight: 800, color: paidPct === 100 ? T.green : T.brand }}>
              {paidPct.toFixed(0)}% · {fmtINR(paidAmt)} of {fmtINR(totalAmt)}
            </Typography>
          </Stack>
          <Box sx={{ height: 8, bgcolor: T.border, borderRadius: 10, overflow: 'hidden' }}>
            <Box sx={{
              height: '100%', width: `${paidPct}%`, borderRadius: 10,
              background: `linear-gradient(90deg, ${T.brand}, ${T.green})`,
              transition: 'width 1s ease',
            }} />
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ bgcolor: T.surface, borderBottom: `1px solid ${T.border}`, px: { xs: 3, lg: 5 }, position: 'sticky', top: 0, zIndex: 20 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontFamily: T.body, fontSize: 13, color: T.inkLt, minHeight: 48 }, '& .MuiTabs-indicator': { bgcolor: T.brand, height: 2.5, borderRadius: 2 }, '& .Mui-selected': { color: `${T.brand} !important` } }}>
          <Tab label="Overview" />
          <Tab label="Payment Schedule" />
          <Tab label="Documents" />
          <Tab label="Timeline" />
        </Tabs>
      </Box>

      <Box sx={{ px: { xs: 3, lg: 5 }, pt: 3 }}>

        {/* ── OVERVIEW TAB ── */}
        {tab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, borderRadius: '16px', boxShadow: 'none', border: `1.5px solid ${T.border}`, bgcolor: T.surface }}>
                <Stack direction="row" spacing={1} alignItems="center" mb={2.5}>
                  <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: T.blueBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PersonOutlined sx={{ fontSize: 16, color: T.blue }} />
                  </Box>
                  <Typography sx={{ fontFamily: T.body, fontWeight: 800, fontSize: 14, color: T.ink }}>Customer Information</Typography>
                </Stack>
                <Grid container spacing={2}>
                  {[
                    ['Full Name',   booking.customerName],
                    ['Phone',       booking.customerPhone],
                    ['Email',       booking.customerEmail],
                    ['PAN Number',  'ABCDE1234F'],
                    ['Aadhar',      'XXXX-XXXX-4567'],
                    ['Address',     '12 MG Road, Pune'],
                    ['Nominee',     'Anjali Sharma'],
                    ['Relation',    'Spouse'],
                  ].map(([label, val]) => (
                    <Grid item xs={6} key={label}>
                      <Typography sx={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: T.inkLt, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.25 }}>{label}</Typography>
                      <Typography sx={{ fontFamily: T.body, fontWeight: 700, fontSize: 13.5, color: T.ink }}>{val}</Typography>
                    </Grid>
                  ))}
                </Grid>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, borderRadius: '16px', boxShadow: 'none', border: `1.5px solid ${T.border}`, bgcolor: T.surface, mb: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center" mb={2.5}>
                  <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: T.brandLt, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <HomeOutlined sx={{ fontSize: 16, color: T.brand }} />
                  </Box>
                  <Typography sx={{ fontFamily: T.body, fontWeight: 800, fontSize: 14, color: T.ink }}>Unit Details</Typography>
                </Stack>
                <Grid container spacing={2}>
                  {[
                    ['Project',    booking.project],
                    ['Tower',      `Tower ${booking.tower}`],
                    ['Floor',      `${booking.floor}th Floor`],
                    ['Unit No.',   booking.unit],
                    ['Type',       booking.unitType],
                    ['Facing',     'East'],
                    ['Super Area', '1,250 sq.ft'],
                    ['Carpet',     '980 sq.ft'],
                  ].map(([label, val]) => (
                    <Grid item xs={6} key={label}>
                      <Typography sx={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: T.inkLt, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.25 }}>{label}</Typography>
                      <Typography sx={{ fontFamily: T.body, fontWeight: 700, fontSize: 13.5, color: T.ink }}>{val}</Typography>
                    </Grid>
                  ))}
                </Grid>
              </Card>

              <Card sx={{ p: 3, borderRadius: '16px', boxShadow: 'none', border: `1.5px solid ${T.border}`, bgcolor: T.surface }}>
                <Stack direction="row" spacing={1} alignItems="center" mb={2.5}>
                  <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: T.purpleBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PeopleOutlined sx={{ fontSize: 16, color: T.purple }} />
                  </Box>
                  <Typography sx={{ fontFamily: T.body, fontWeight: 800, fontSize: 14, color: T.ink }}>Agent & Commission</Typography>
                </Stack>
                <Grid container spacing={2}>
                  {[
                    ['Agent',           booking.agent],
                    ['Channel Partner', booking.channelPartner || 'Direct'],
                    ['Commission Rate', booking.commissionGenerated ? '2%' : 'None'],
                    ['Commission Amt',  booking.commissionGenerated ? fmtINR(booking.commissionAmount) : '—'],
                    ['Status',          booking.commissionGenerated ? 'Pending Payment' : 'N/A'],
                    ['Payment Plan',    booking.paymentPlan],
                  ].map(([label, val]) => (
                    <Grid item xs={6} key={label}>
                      <Typography sx={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: T.inkLt, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.25 }}>{label}</Typography>
                      <Typography sx={{ fontFamily: T.body, fontWeight: 700, fontSize: 13.5, color: label === 'Commission Amt' ? T.purple : T.ink }}>{val}</Typography>
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
                <Typography sx={{ fontFamily: T.display, fontSize: 22, fontWeight: 700, color: T.ink }}>Payment Schedule</Typography>
                <Typography sx={{ fontFamily: T.body, fontSize: 13, color: T.inkLt }}>
                  {booking.paymentPlan} · {installments.filter(i => i.status === 'PAID').length}/{installments.length} installments paid
                </Typography>
              </Box>
              <Button startIcon={<DownloadOutlined />} variant="outlined" size="small"
                sx={{ textTransform: 'none', fontWeight: 700, fontFamily: T.body, borderRadius: '10px', borderColor: T.border, color: T.inkMd }}>
                Export Schedule
              </Button>
            </Stack>

            <Stack spacing={2}>
              {installments.map((inst, i) => {
                const sc = INST_STATUS[inst.status] ?? INST_STATUS.PENDING;
                const isPaid = inst.status === 'PAID';
                const isOverdue = !isPaid && new Date(inst.dueDate) < new Date();
                return (
                  <Card key={inst.id} sx={{
                    p: 2.5, borderRadius: '14px', boxShadow: 'none',
                    border: `1.5px solid ${isPaid ? T.greenBdr : isOverdue ? T.redBdr : T.border}`,
                    bgcolor: isPaid ? T.greenBg : isOverdue ? T.redBg : T.surface,
                    transition: 'all .2s',
                  }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
                      {/* Step number */}
                      <Box sx={{
                        width: 40, height: 40, borderRadius: '10px', flexShrink: 0,
                        bgcolor: isPaid ? T.green : T.surface, border: `2px solid ${isPaid ? T.green : T.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: isPaid ? '#fff' : T.inkMd,
                      }}>
                        {isPaid ? <CheckCircleOutlined sx={{ fontSize: 20 }} /> : (
                          <Typography sx={{ fontFamily: T.body, fontWeight: 800, fontSize: 14 }}>{i + 1}</Typography>
                        )}
                      </Box>

                      <Box flex={1}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1}>
                          <Box>
                            <Typography sx={{ fontFamily: T.body, fontWeight: 800, fontSize: 14, color: T.ink }}>{inst.name}</Typography>
                            <Stack direction="row" spacing={2} mt={0.4} flexWrap="wrap">
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <CalendarMonthOutlined sx={{ fontSize: 12, color: T.inkLt }} />
                                <Typography sx={{ fontFamily: T.body, fontSize: 12, color: isOverdue ? T.red : T.inkLt, fontWeight: isOverdue ? 700 : 500 }}>
                                  Due: {inst.dueDate}
                                </Typography>
                              </Stack>
                              {inst.paidOn && (
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                  <CheckCircleOutlined sx={{ fontSize: 12, color: T.green }} />
                                  <Typography sx={{ fontFamily: T.body, fontSize: 12, color: T.green, fontWeight: 700 }}>
                                    Paid: {inst.paidOn}
                                  </Typography>
                                </Stack>
                              )}
                            </Stack>
                          </Box>

                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Typography sx={{ fontFamily: T.display, fontSize: 22, fontWeight: 700, color: isPaid ? T.green : T.ink, letterSpacing: '-0.02em' }}>
                              {fmtINR(inst.amount)}
                            </Typography>
                            <StatusBadge status={inst.status} />
                            {!isPaid && (
                              <Button size="small" onClick={() => markPaid(inst.id)} disableElevation
                                sx={{ textTransform: 'none', fontWeight: 800, fontFamily: T.body, fontSize: 12, borderRadius: '8px', bgcolor: T.green, color: '#fff', '&:hover': { bgcolor: '#15653b' }, flexShrink: 0, px: 2 }}>
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

            {/* Summary footer */}
            <Card sx={{ mt: 3, p: 2.5, borderRadius: '14px', boxShadow: 'none', border: `1.5px solid ${T.border}`, bgcolor: T.raised }}>
              <Grid container spacing={2}>
                {[
                  { label: 'Total Amount', value: fmtINR(totalAmt), color: T.ink },
                  { label: 'Amount Paid', value: fmtINR(paidAmt), color: T.green },
                  { label: 'Balance Due', value: fmtINR(totalAmt - paidAmt), color: T.red },
                  { label: 'Collection %', value: `${paidPct.toFixed(1)}%`, color: T.brand },
                ].map(s => (
                  <Grid item xs={6} sm={3} key={s.label}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography sx={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: T.inkLt, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</Typography>
                      <Typography sx={{ fontFamily: T.display, fontSize: 20, fontWeight: 700, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Card>
          </Box>
        )}

        {/* ── DOCUMENTS TAB ── */}
        {tab === 2 && (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Box>
                <Typography sx={{ fontFamily: T.display, fontSize: 22, fontWeight: 700, color: T.ink }}>Document Vault</Typography>
                <Typography sx={{ fontFamily: T.body, fontSize: 13, color: T.inkLt }}>
                  {DOCUMENTS.filter(d => d.verified).length}/{DOCUMENTS.length} documents verified
                </Typography>
              </Box>
              <Button variant="contained" startIcon={<UploadFileOutlined />} disableElevation
                sx={{ textTransform: 'none', fontWeight: 800, fontFamily: T.body, borderRadius: '10px', bgcolor: T.brand, '&:hover': { bgcolor: T.brandDk } }}>
                Upload Document
              </Button>
            </Stack>
            <Grid container spacing={2}>
              {DOCUMENTS.map(doc => (
                <Grid item xs={12} sm={6} lg={3} key={doc.name}>
                  <Card sx={{ p: 2.5, borderRadius: '16px', boxShadow: 'none', border: `1.5px solid ${doc.verified ? T.greenBdr : T.border}`, bgcolor: T.surface, transition: 'all .2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,.06)' } }}>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start" mb={2}>
                      <Box sx={{ width: 42, height: 42, borderRadius: '10px', bgcolor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <PictureAsPdfOutlined sx={{ color: '#e53935', fontSize: 22 }} />
                      </Box>
                      <Box flex={1}>
                        <Typography sx={{ fontFamily: T.body, fontWeight: 800, fontSize: 13, color: T.ink, lineHeight: 1.3 }}>{doc.name}</Typography>
                        <Chip label={doc.verified ? '✓ Verified' : 'Pending'} size="small"
                          sx={{ mt: 0.5, fontSize: 9.5, height: 18, fontWeight: 800, bgcolor: doc.verified ? T.greenBg : T.amberBg, color: doc.verified ? T.green : T.amber, border: `1px solid ${doc.verified ? T.greenBdr : T.amberBdr}` }} />
                      </Box>
                    </Stack>
                    <Box sx={{ p: 1.5, bgcolor: T.bg, borderRadius: '8px', mb: 1.5 }}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography sx={{ fontFamily: T.body, fontSize: 11, color: T.inkLt }}>{doc.type} · {doc.size}</Typography>
                        <Typography sx={{ fontFamily: T.body, fontSize: 11, color: T.inkLt }}>{doc.uploaded}</Typography>
                      </Stack>
                    </Box>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Preview">
                        <IconButton size="small" sx={{ color: T.inkLt, '&:hover': { color: T.blue, bgcolor: T.blueBg }, borderRadius: '8px', flex: 1 }}>
                          <VisibilityOutlined sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download">
                        <IconButton size="small" sx={{ color: T.inkLt, '&:hover': { color: T.brand, bgcolor: T.brandLt }, borderRadius: '8px', flex: 1 }}>
                          <DownloadOutlined sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Share">
                        <IconButton size="small" sx={{ color: T.inkLt, '&:hover': { color: T.green, bgcolor: T.greenBg }, borderRadius: '8px', flex: 1 }}>
                          <ShareOutlined sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Card>
                </Grid>
              ))}

              {/* Upload placeholder */}
              <Grid item xs={12} sm={6} lg={3}>
                <Card sx={{ p: 2.5, borderRadius: '16px', boxShadow: 'none', border: `2px dashed ${T.border}`, bgcolor: T.raised, cursor: 'pointer', transition: 'all .15s', '&:hover': { borderColor: T.brand, bgcolor: T.brandLt } }}>
                  <Stack alignItems="center" justifyContent="center" sx={{ height: 140, gap: 1.5 }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: T.border, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <UploadFileOutlined sx={{ color: T.inkLt, fontSize: 22 }} />
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography sx={{ fontFamily: T.body, fontSize: 13, color: T.inkMd, fontWeight: 700 }}>Upload Document</Typography>
                      <Typography sx={{ fontFamily: T.body, fontSize: 11, color: T.inkLt }}>PDF, JPG, PNG · Max 10MB</Typography>
                    </Box>
                  </Stack>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* ── TIMELINE TAB ── */}
        {tab === 3 && (
          <Box>
            <Typography sx={{ fontFamily: T.display, fontSize: 22, fontWeight: 700, color: T.ink, mb: 3 }}>Activity Timeline</Typography>
            <Stack spacing={0}>
              {TIMELINE.map((item, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 2.5 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: `${item.color}18`, border: `2px solid ${item.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}>
                      {item.icon}
                    </Box>
                    {i < TIMELINE.length - 1 && (
                      <Box sx={{ width: 1.5, flex: 1, bgcolor: T.border, my: 0.75, minHeight: 24 }} />
                    )}
                  </Box>
                  <Box pb={i < TIMELINE.length - 1 ? 3 : 0} flex={1}>
                    <Box sx={{ p: 2, bgcolor: T.surface, borderRadius: '12px', border: `1px solid ${T.border}` }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Typography sx={{ fontFamily: T.body, fontWeight: 800, fontSize: 14, color: T.ink }}>{item.event}</Typography>
                        <Typography sx={{ fontFamily: T.body, fontSize: 11, color: T.inkLt }}>{item.time}</Typography>
                      </Stack>
                      <Typography sx={{ fontFamily: T.body, fontSize: 12.5, color: T.inkMd }}>{item.desc}</Typography>
                      <Typography sx={{ fontFamily: T.body, fontSize: 11, color: T.inkLt, mt: 0.5 }}>{item.date}</Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </Box>

      <TransferDialog booking={transferOpen ? booking : null} onClose={() => setTransferOpen(false)} />
      <CancelDialog booking={cancelOpen ? booking : null} onClose={() => setCancelOpen(false)} onConfirm={() => { setCancelOpen(false); navigate('/bookings'); }} />

      <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} sx={{ borderRadius: '12px', fontFamily: T.body, fontWeight: 700 }}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// PAYMENT SCHEDULE PAGE (Standalone)
// ═══════════════════════════════════════════════════════════════════════════════

export const PaymentSchedulePage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' as const });

  const allInstallments = useMemo(() => MOCK_BOOKINGS.flatMap(b =>
    INSTALLMENTS_TEMPLATE.map((t, i) => ({
      id: `${b.id}-${t.id}`, bookingNo: b.bookingNo, bookingId: b.id,
      customerName: b.customerName, project: b.project, unit: b.unit,
      installmentName: t.name,
      amount: Math.round(b.totalValue * t.pct),
      dueDate: new Date(Date.now() + t.dueOffset * 86_400_000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: i < b.paidInstallments ? 'PAID' : i === b.paidInstallments && Math.random() > 0.7 ? 'OVERDUE' : 'PENDING' as 'PAID' | 'PENDING' | 'OVERDUE',
      paidOn: i < b.paidInstallments ? new Date(Date.now() - (b.paidInstallments - i) * 30 * 86_400_000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
    }))
  ), []);

  const [installments, setInstallments] = useState(allInstallments);

  const filtered = useMemo(() => installments.filter(i =>
    (!search || i.customerName.toLowerCase().includes(search.toLowerCase()) || i.bookingNo.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === 'ALL' || i.status === statusFilter) &&
    (projectFilter === 'ALL' || i.project === projectFilter)
  ), [installments, search, statusFilter, projectFilter]);

  const stats = useMemo(() => ({
    total: installments.reduce((s, i) => s + i.amount, 0),
    collected: installments.filter(i => i.status === 'PAID').reduce((s, i) => s + i.amount, 0),
    pending: installments.filter(i => i.status === 'PENDING').reduce((s, i) => s + i.amount, 0),
    overdue: installments.filter(i => i.status === 'OVERDUE').reduce((s, i) => s + i.amount, 0),
    overdueCount: installments.filter(i => i.status === 'OVERDUE').length,
  }), [installments]);

  const projects = [...new Set(installments.map(i => i.project))];

  const markPaid = (id: string) => {
    setInstallments(p => p.map(i => i.id === id ? {
      ...i, status: 'PAID' as const,
      paidOn: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    } : i));
    setSnack({ open: true, msg: 'Installment marked as paid', severity: 'success' });
  };

  return (
    <Box sx={{ bgcolor: T.bg, minHeight: '100vh', pb: 8 }}>
      <PageHeader
        title="Payment Schedule"
        tag="Installment Tracker"
        subtitle={`${installments.length} installments · ${stats.overdueCount} overdue · auto-tracking enabled`}
        actions={
          <Button startIcon={<DownloadOutlined />} variant="outlined" size="small"
            sx={{ textTransform: 'none', fontWeight: 700, fontFamily: T.body, borderRadius: '10px', borderColor: T.border, color: T.inkMd }}>
            Export Schedule
          </Button>
        }
      />

      {/* KPIs */}
      <Box sx={{ px: { xs: 3, lg: 5 }, py: 3, bgcolor: T.surface, borderBottom: `1px solid ${T.border}` }}>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <KpiCard label="Total Scheduled" value={fmtCr(stats.total)} sub={`${installments.length} installments`}
              color={T.brand} bg={T.brandLt} border={T.brandBdr} icon={<CalendarMonthOutlined />} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <KpiCard label="Collected" value={fmtCr(stats.collected)} sub={`${installments.filter(i => i.status === 'PAID').length} paid`}
              color={T.green} bg={T.greenBg} border={T.greenBdr} icon={<CheckCircleOutlined />} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <KpiCard label="Pending" value={fmtCr(stats.pending)} sub={`${installments.filter(i => i.status === 'PENDING').length} upcoming`}
              color={T.amber} bg={T.amberBg} border={T.amberBdr} icon={<AccessTimeOutlined />} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <KpiCard label="Overdue" value={fmtCr(stats.overdue)} sub={`${stats.overdueCount} need action`}
              color={T.red} bg={T.redBg} border={T.redBdr} icon={<WarningAmberOutlined />}
              onClick={() => setStatusFilter('OVERDUE')} />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ px: { xs: 3, lg: 5 }, pt: 3 }}>
        {/* Overdue banner */}
        {stats.overdueCount > 0 && (
          <Box sx={{ mb: 3, p: 2, borderRadius: '12px', bgcolor: T.redBg, border: `1.5px solid ${T.redBdr}`, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <WarningAmberOutlined sx={{ color: T.red, fontSize: 20, flexShrink: 0 }} />
            <Box flex={1}>
              <Typography sx={{ fontFamily: T.body, fontSize: 13, fontWeight: 800, color: T.red }}>
                {stats.overdueCount} installments overdue — {fmtCr(stats.overdue)} pending
              </Typography>
              <Typography sx={{ fontFamily: T.body, fontSize: 12, color: T.red }}>
                Immediate follow-up required to avoid booking disputes
              </Typography>
            </Box>
            <Button size="small" onClick={() => setStatusFilter('OVERDUE')}
              sx={{ textTransform: 'none', fontWeight: 800, fontFamily: T.body, color: T.red, border: `1px solid ${T.redBdr}`, borderRadius: '8px', flexShrink: 0 }}>
              Show Overdue
            </Button>
          </Box>
        )}

        {/* Filters */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} mb={2.5} alignItems={{ sm: 'center' }}>
          <TextField placeholder="Search customer, booking..." size="small" value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchOutlined sx={{ fontSize: 17, color: T.inkLt }} /></InputAdornment>,
              sx: { borderRadius: '10px', bgcolor: T.surface, '& fieldset': { borderColor: T.border } },
            }}
            sx={{ flex: 1, maxWidth: 300 }} />

          {[
            { label: 'Status', val: statusFilter, set: setStatusFilter, opts: ['PAID', 'PENDING', 'OVERDUE', 'PARTIAL'] },
            { label: 'Project', val: projectFilter, set: setProjectFilter, opts: projects },
          ].map(f => (
            <FormControl key={f.label} size="small">
              <Select value={f.val} displayEmpty renderValue={v => v === 'ALL' ? <span style={{ color: T.inkLt }}>{f.label}</span> : v}
                onChange={e => f.set(e.target.value)}
                sx={{ borderRadius: '10px', bgcolor: T.surface, minWidth: 140, '& .MuiOutlinedInput-notchedOutline': { borderColor: T.border } }}>
                <MenuItem value="ALL">All {f.label}s</MenuItem>
                {f.opts.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </Select>
            </FormControl>
          ))}

          <Typography sx={{ fontFamily: T.body, fontSize: 12, color: T.inkLt, fontWeight: 600 }}>{filtered.length} records</Typography>
        </Stack>

        <Card sx={{ borderRadius: '16px', boxShadow: 'none', border: `1.5px solid ${T.border}`, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: T.raised }}>
                  {['Booking No.', 'Customer', 'Installment', 'Amount', 'Due Date', 'Paid On', 'Status', 'Action'].map(h => (
                    <TableCell key={h} sx={{ fontFamily: T.body, fontWeight: 800, fontSize: 10.5, color: T.inkLt, textTransform: 'uppercase', letterSpacing: '0.08em', py: 1.5, borderBottom: `1.5px solid ${T.border}` }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map(inst => {
                  const sc = INST_STATUS[inst.status] ?? INST_STATUS.PENDING;
                  return (
                    <TableRow key={inst.id} hover sx={{ '& td': { py: 1.5, borderBottom: `1px solid ${T.border}` }, '&:hover': { bgcolor: T.raised } }}>
                      <TableCell>
                        <Typography sx={{ fontFamily: T.mono, fontSize: 12.5, color: T.brand, fontWeight: 700 }}>{inst.bookingNo}</Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1.25} alignItems="center">
                          <Avatar sx={{ width: 30, height: 30, bgcolor: avatarColor(inst.customerName), fontSize: 11, fontWeight: 800 }}>
                            {initials(inst.customerName)}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontFamily: T.body, fontWeight: 800, fontSize: 13, color: T.ink }}>{inst.customerName}</Typography>
                            <Typography sx={{ fontFamily: T.body, fontSize: 11, color: T.inkLt }}>{inst.project} · {inst.unit}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontFamily: T.body, fontWeight: 700, fontSize: 13, color: T.ink }}>{inst.installmentName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontFamily: T.display, fontSize: 16, fontWeight: 700, color: T.ink, letterSpacing: '-0.02em' }}>
                          {fmtINR(inst.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontFamily: T.body, fontSize: 12.5, color: inst.status === 'OVERDUE' ? T.red : T.inkMd, fontWeight: inst.status === 'OVERDUE' ? 700 : 500 }}>
                          {inst.dueDate}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontFamily: T.body, fontSize: 12.5, color: T.green, fontWeight: 600 }}>
                          {inst.paidOn || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.2, py: 0.4, borderRadius: '20px', bgcolor: sc.bg, border: `1px solid ${sc.border}` }}>
                          <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: sc.dot }} />
                          <Typography sx={{ fontFamily: T.body, fontSize: 11, fontWeight: 800, color: sc.color }}>{inst.status}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {inst.status !== 'PAID' && (
                          <Button size="small" onClick={() => markPaid(inst.id)} disableElevation
                            sx={{ textTransform: 'none', fontWeight: 800, fontFamily: T.body, fontSize: 11.5, borderRadius: '8px', bgcolor: T.green, color: '#fff', '&:hover': { bgcolor: '#15653b' } }}>
                            Mark Paid
                          </Button>
                        )}
                        {inst.status === 'PAID' && (
                          <CheckCircleOutlined sx={{ color: T.green, fontSize: 18 }} />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ px: 3, py: 1.75, bgcolor: T.raised, borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontFamily: T.body, fontSize: 12, color: T.inkLt }}>{filtered.length} installments</Typography>
            <Typography sx={{ fontFamily: T.display, fontSize: 15, fontWeight: 700, color: T.ink, letterSpacing: '-0.02em' }}>
              Total: {fmtINR(filtered.reduce((s, i) => s + i.amount, 0))}
            </Typography>
          </Box>
        </Card>
      </Box>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} sx={{ borderRadius: '12px', fontFamily: T.body, fontWeight: 700 }}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// BOOKING ANALYTICS PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export const BookingAnalyticsPage: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [period, setPeriod] = useState('FY 2025-26');

  const MONTHLY = [
    { month: 'Nov', bookings: 4, revenue: 28_000_000, cancelled: 0 },
    { month: 'Dec', bookings: 6, revenue: 42_000_000, cancelled: 1 },
    { month: 'Jan', bookings: 5, revenue: 35_000_000, cancelled: 0 },
    { month: 'Feb', bookings: 3, revenue: 21_000_000, cancelled: 1 },
    { month: 'Mar', bookings: 7, revenue: 48_000_000, cancelled: 0 },
    { month: 'Apr', bookings: 7, revenue: 79_500_000, cancelled: 1 },
  ];

  const PROJECTS = [
    { name: 'Skyline Heights',   bookings: 3, revenue: 38_200_000, target: 50_000_000, colour: T.brand },
    { name: 'Orchid Residency',  bookings: 2, revenue: 21_500_000, target: 35_000_000, colour: T.green },
    { name: 'Green Valley',      bookings: 1, revenue:  4_800_000, target: 20_000_000, colour: T.blue  },
    { name: 'Metro Towers',      bookings: 1, revenue: 15_000_000, target: 40_000_000, colour: T.purple},
  ];

  const AGENTS = [
    { name: 'Priya Mehta',  bookings: 3, revenue: 38_700_000, commission: 774_000, conv: 72, colour: T.brand  },
    { name: 'Arjun Singh',  bookings: 2, revenue: 27_000_000, commission: 540_000, conv: 58, colour: T.green  },
    { name: 'Kavita Joshi', bookings: 2, revenue: 14_300_000, commission: 286_000, conv: 64, colour: T.blue   },
  ];

  const SOURCES = [
    { label: 'Channel Partner', count: 4, revenue: 58_500_000, colour: T.purple },
    { label: 'Direct Agent',    count: 3, revenue: 21_000_000, colour: T.brand  },
  ];

  const totalBookings = MONTHLY.reduce((s, m) => s + m.bookings, 0);
  const totalRevenue  = MONTHLY.reduce((s, m) => s + m.revenue,  0);
  const totalCancelled = MONTHLY.reduce((s, m) => s + m.cancelled, 0);
  const maxRevenue = Math.max(...MONTHLY.map(m => m.revenue));
  const maxBookings = Math.max(...MONTHLY.map(m => m.bookings));

  return (
    <Box sx={{ bgcolor: T.bg, minHeight: '100vh', pb: 8 }}>
      <PageHeader
        title="Booking Analytics"
        tag="Revenue Intelligence"
        subtitle="Trend analysis · agent performance · project-wise demand tracking"
        actions={
          <Stack direction="row" spacing={1.5}>
            <FormControl size="small">
              <Select value={period} onChange={e => setPeriod(e.target.value)}
                sx={{ borderRadius: '10px', bgcolor: T.surface, minWidth: 140, '& .MuiOutlinedInput-notchedOutline': { borderColor: T.border }, fontFamily: T.body, fontSize: 13 }}>
                {['Apr 2026', 'Mar 2026', 'Q1 2026', 'FY 2025-26'].map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </Select>
            </FormControl>
            <Button startIcon={<DownloadOutlined />} variant="outlined" size="small"
              sx={{ textTransform: 'none', fontWeight: 700, fontFamily: T.body, borderRadius: '10px', borderColor: T.border, color: T.inkMd }}>
              Export Report
            </Button>
          </Stack>
        }
      />

      {/* KPIs */}
      <Box sx={{ px: { xs: 3, lg: 5 }, py: 3, bgcolor: T.surface, borderBottom: `1px solid ${T.border}` }}>
        <Grid container spacing={2}>
          {[
            { label: 'Total Bookings',     value: totalBookings,               sub: 'All projects',        color: T.brand,  bg: T.brandLt,  border: T.brandBdr,  icon: <HomeOutlined /> },
            { label: 'Total Revenue',      value: fmtCr(totalRevenue),         sub: 'Booked value',        color: T.green,  bg: T.greenBg,  border: T.greenBdr,  icon: <AttachMoneyOutlined /> },
            { label: 'Avg. Booking Value', value: fmtCr(totalRevenue / totalBookings), sub: 'Per unit',   color: T.blue,   bg: T.blueBg,   border: T.blueBdr,   icon: <TrendingUpOutlined /> },
            { label: 'Cancellation Rate',  value: `${((totalCancelled / totalBookings) * 100).toFixed(0)}%`, sub: `${totalCancelled} cancelled`, color: T.red, bg: T.redBg, border: T.redBdr, icon: <CancelOutlined /> },
            { label: 'Commissions',        value: fmtCr(1_600_000),            sub: 'Broker payouts',      color: T.purple, bg: T.purpleBg, border: T.purpleBdr, icon: <PeopleOutlined /> },
            { label: 'Via Partners',       value: `${SOURCES[0].count}/${totalBookings}`, sub: 'Channel deals', color: T.brand, bg: T.brandLt, border: T.brandBdr, icon: <SignalCellularAltOutlined /> },
          ].map(k => (
            <Grid item xs={6} sm={4} md={2} key={k.label}>
              <KpiCard {...k} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Tabs */}
      <Box sx={{ bgcolor: T.surface, borderBottom: `1px solid ${T.border}`, px: { xs: 3, lg: 5 } }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontFamily: T.body, fontSize: 13, color: T.inkLt, minHeight: 48 }, '& .MuiTabs-indicator': { bgcolor: T.brand, height: 2.5, borderRadius: 2 }, '& .Mui-selected': { color: `${T.brand} !important` } }}>
          <Tab label="Booking Trend" />
          <Tab label="Project Performance" />
          <Tab label="Agent Leaderboard" />
          <Tab label="Lead Sources" />
        </Tabs>
      </Box>

      <Box sx={{ px: { xs: 3, lg: 5 }, pt: 3 }}>

        {/* ── TREND ── */}
        {tab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card sx={{ p: 3, borderRadius: '16px', boxShadow: 'none', border: `1.5px solid ${T.border}`, bgcolor: T.surface }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                  <Box>
                    <Typography sx={{ fontFamily: T.body, fontWeight: 800, fontSize: 15, color: T.ink }}>Monthly Booking Trend</Typography>
                    <Typography sx={{ fontFamily: T.body, fontSize: 12, color: T.inkLt }}>Nov 2025 – Apr 2026</Typography>
                  </Box>
                  <Stack direction="row" spacing={2}>
                    {[{ label: 'Bookings', color: T.brand }, { label: 'Revenue', color: T.blue }].map(l => (
                      <Stack key={l.label} direction="row" spacing={0.75} alignItems="center">
                        <Box sx={{ width: 12, height: 4, borderRadius: 2, bgcolor: l.color }} />
                        <Typography sx={{ fontFamily: T.body, fontSize: 11, color: T.inkLt }}>{l.label}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>

                {/* Custom bar chart */}
                <Stack direction="row" spacing={2} alignItems="flex-end" sx={{ height: 200, px: 1 }}>
                  {MONTHLY.map((m, i) => {
                    const bh = Math.round((m.bookings / maxBookings) * 150);
                    const rh = Math.round((m.revenue  / maxRevenue)  * 150);
                    const isLast = i === MONTHLY.length - 1;
                    return (
                      <Box key={m.month} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                        <Tooltip title={`${m.bookings} bookings · ${fmtCr(m.revenue)}`} placement="top">
                          <Stack direction="row" spacing={0.5} alignItems="flex-end" sx={{ height: 160, cursor: 'pointer' }}>
                            <Box sx={{ width: 20, height: bh, borderRadius: '4px 4px 0 0', bgcolor: isLast ? T.brand : `${T.brand}50`, transition: 'all .2s', '&:hover': { bgcolor: T.brand } }} />
                            <Box sx={{ width: 14, height: rh, borderRadius: '4px 4px 0 0', bgcolor: isLast ? T.blue : `${T.blue}40`, transition: 'all .2s', '&:hover': { bgcolor: T.blue } }} />
                          </Stack>
                        </Tooltip>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography sx={{ fontFamily: T.body, fontSize: 11, color: isLast ? T.brand : T.inkLt, fontWeight: isLast ? 800 : 500 }}>{m.month}</Typography>
                          <Typography sx={{ fontFamily: T.body, fontSize: 10, color: T.inkXl }}>{m.bookings}</Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, borderRadius: '16px', boxShadow: 'none', border: `1.5px solid ${T.border}`, bgcolor: T.surface }}>
                <Typography sx={{ fontFamily: T.body, fontWeight: 800, fontSize: 15, color: T.ink, mb: 2.5 }}>Revenue by Source</Typography>
                <Stack spacing={2.5}>
                  {SOURCES.map(s => {
                    const pct = (s.revenue / totalRevenue) * 100;
                    return (
                      <Box key={s.label}>
                        <Stack direction="row" justifyContent="space-between" mb={1}>
                          <Stack direction="row" spacing={0.75} alignItems="center">
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.colour }} />
                            <Typography sx={{ fontFamily: T.body, fontSize: 13, color: T.ink, fontWeight: 700 }}>{s.label}</Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography sx={{ fontFamily: T.display, fontSize: 17, color: s.colour, fontWeight: 700, letterSpacing: '-0.02em' }}>{fmtCr(s.revenue)}</Typography>
                            <Typography sx={{ fontFamily: T.body, fontSize: 11, color: T.inkLt }}>{pct.toFixed(0)}%</Typography>
                          </Stack>
                        </Stack>
                        <Box sx={{ height: 8, borderRadius: 10, bgcolor: T.border, overflow: 'hidden' }}>
                          <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: s.colour, borderRadius: 10, transition: 'width .6s ease' }} />
                        </Box>
                        <Typography sx={{ fontFamily: T.body, fontSize: 11, color: T.inkLt, mt: 0.4 }}>{s.count} bookings</Typography>
                      </Box>
                    );
                  })}
                </Stack>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* ── PROJECT PERFORMANCE ── */}
        {tab === 1 && (
          <Stack spacing={2}>
            {PROJECTS.map(p => {
              const pct = (p.revenue / p.target) * 100;
              return (
                <Card key={p.name} sx={{ p: 3, borderRadius: '16px', boxShadow: 'none', border: `1.5px solid ${T.border}`, bgcolor: T.surface, transition: 'all .2s', '&:hover': { borderColor: p.colour, boxShadow: `0 8px 24px ${p.colour}10` } }}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ md: 'center' }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: `${p.colour}15`, border: `1.5px solid ${p.colour}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <HomeOutlined sx={{ color: p.colour, fontSize: 22 }} />
                    </Box>
                    <Box flex={1}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                        <Box>
                          <Typography sx={{ fontFamily: T.body, fontWeight: 800, fontSize: 15, color: T.ink }}>{p.name}</Typography>
                          <Typography sx={{ fontFamily: T.body, fontSize: 12, color: T.inkLt }}>{p.bookings} bookings</Typography>
                        </Box>
                        <Stack direction="row" spacing={3} textAlign="right">
                          <Box>
                            <Typography sx={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: T.inkLt, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Revenue</Typography>
                            <Typography sx={{ fontFamily: T.display, fontSize: 22, color: p.colour, fontWeight: 700, letterSpacing: '-0.02em' }}>{fmtCr(p.revenue)}</Typography>
                          </Box>
                          <Box>
                            <Typography sx={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: T.inkLt, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Target</Typography>
                            <Typography sx={{ fontFamily: T.display, fontSize: 22, color: T.inkLt, fontWeight: 700, letterSpacing: '-0.02em' }}>{fmtCr(p.target)}</Typography>
                          </Box>
                          <Box>
                            <Typography sx={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: T.inkLt, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Achievement</Typography>
                            <Typography sx={{ fontFamily: T.display, fontSize: 22, color: pct >= 80 ? T.green : pct >= 50 ? T.amber : T.red, fontWeight: 700, letterSpacing: '-0.02em' }}>
                              {pct.toFixed(0)}%
                            </Typography>
                          </Box>
                        </Stack>
                      </Stack>
                      <Box sx={{ height: 8, borderRadius: 10, bgcolor: T.border, overflow: 'hidden' }}>
                        <Box sx={{ height: '100%', width: `${Math.min(pct, 100)}%`, bgcolor: p.colour, borderRadius: 10, transition: 'width .6s ease' }} />
                      </Box>
                    </Box>
                  </Stack>
                </Card>
              );
            })}
          </Stack>
        )}

        {/* ── AGENT LEADERBOARD ── */}
        {tab === 2 && (
          <Card sx={{ borderRadius: '16px', boxShadow: 'none', border: `1.5px solid ${T.border}`, overflow: 'hidden' }}>
            <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${T.border}`, bgcolor: T.raised }}>
              <Typography sx={{ fontFamily: T.body, fontWeight: 800, fontSize: 15, color: T.ink }}>Agent Leaderboard</Typography>
              <Typography sx={{ fontFamily: T.body, fontSize: 12, color: T.inkLt }}>Ranked by revenue generated this period</Typography>
            </Box>
            <Stack>
              {AGENTS.sort((a, b) => b.revenue - a.revenue).map((agent, i) => (
                <Box key={agent.name} sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${T.border}`, '&:last-child': { borderBottom: 'none' }, '&:hover': { bgcolor: T.raised }, transition: 'background .1s' }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                    {/* Rank badge */}
                    <Box sx={{
                      width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                      bgcolor: i === 0 ? T.brandLt : T.raised,
                      border: `1.5px solid ${i === 0 ? T.brandBdr : T.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Typography sx={{ fontFamily: T.body, fontWeight: 900, fontSize: 15, color: i === 0 ? T.brand : T.inkLt }}>
                        #{i + 1}
                      </Typography>
                    </Box>

                    <Avatar sx={{ width: 40, height: 40, bgcolor: avatarColor(agent.name), fontSize: 14, fontWeight: 800, flexShrink: 0 }}>
                      {initials(agent.name)}
                    </Avatar>

                    <Box flex={1}>
                      <Typography sx={{ fontFamily: T.body, fontWeight: 800, fontSize: 14, color: T.ink }}>{agent.name}</Typography>
                      <Stack direction="row" spacing={2} mt={0.3} flexWrap="wrap">
                        <Typography sx={{ fontFamily: T.body, fontSize: 12, color: T.inkLt }}>{agent.bookings} bookings</Typography>
                        <Typography sx={{ fontFamily: T.body, fontSize: 12, color: T.purple }}>Commission: {fmtCr(agent.commission)}</Typography>
                      </Stack>
                    </Box>

                    <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                      <Typography sx={{ fontFamily: T.display, fontSize: 24, fontWeight: 700, color: T.ink, letterSpacing: '-0.03em' }}>
                        {fmtCr(agent.revenue)}
                      </Typography>
                      <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center" mt={0.5}>
                        <Box sx={{ height: 6, width: 60, borderRadius: 3, bgcolor: T.border, overflow: 'hidden' }}>
                          <Box sx={{ height: '100%', width: `${agent.conv}%`, bgcolor: agent.conv > 65 ? T.green : T.amber, borderRadius: 3 }} />
                        </Box>
                        <Typography sx={{ fontFamily: T.body, fontSize: 12, fontWeight: 800, color: agent.conv > 65 ? T.green : T.amber }}>
                          {agent.conv}% conv.
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Card>
        )}

        {/* ── LEAD SOURCES ── */}
        {tab === 3 && (
          <Grid container spacing={3}>
            {[
              { title: 'Bookings by Source',  data: SOURCES.map(s => ({ label: s.label, value: `${s.count}`, pct: (s.count  / totalBookings)  * 100, colour: s.colour })) },
              { title: 'Revenue by Source',   data: SOURCES.map(s => ({ label: s.label, value: fmtCr(s.revenue), pct: (s.revenue / totalRevenue) * 100, colour: s.colour })) },
            ].map(section => (
              <Grid item xs={12} md={6} key={section.title}>
                <Card sx={{ p: 3, borderRadius: '16px', boxShadow: 'none', border: `1.5px solid ${T.border}`, bgcolor: T.surface }}>
                  <Typography sx={{ fontFamily: T.body, fontWeight: 800, fontSize: 15, color: T.ink, mb: 3 }}>{section.title}</Typography>
                  <Stack spacing={2.5}>
                    {section.data.map(d => (
                      <Box key={d.label}>
                        <Stack direction="row" justifyContent="space-between" mb={1}>
                          <Stack direction="row" spacing={0.75} alignItems="center">
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: d.colour }} />
                            <Typography sx={{ fontFamily: T.body, fontSize: 13, color: T.ink, fontWeight: 700 }}>{d.label}</Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography sx={{ fontFamily: T.display, fontSize: 19, color: d.colour, fontWeight: 700, letterSpacing: '-0.02em' }}>{d.value}</Typography>
                            <Typography sx={{ fontFamily: T.body, fontSize: 11, color: T.inkLt }}>{d.pct.toFixed(0)}%</Typography>
                          </Stack>
                        </Stack>
                        <Box sx={{ height: 8, borderRadius: 10, bgcolor: T.border, overflow: 'hidden' }}>
                          <Box sx={{ height: '100%', width: `${d.pct}%`, bgcolor: d.colour, borderRadius: 10, transition: 'width .6s ease' }} />
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTING
// ═══════════════════════════════════════════════════════════════════════════════

const PageLoader: React.FC = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', bgcolor: T.bg }}>
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Box sx={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${T.border}`, borderTopColor: T.brand, animation: 'spin .8s linear infinite', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />
      <Typography sx={{ fontFamily: T.body, fontSize: 13, color: T.inkLt, fontWeight: 600 }}>Loading...</Typography>
    </Box>
  </Box>
);

// Mount as: <Route path="/bookings/*" element={<BookingRoutes />} />
export const BookingRoutes: React.FC = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route index element={<Navigate to="list" replace />} />
      <Route path="list"      element={<BookingsPage />} />
      <Route path=":id"       element={<BookingDetailPage />} />
      <Route path="schedule"  element={<PaymentSchedulePage />} />
      <Route path="analytics" element={<BookingAnalyticsPage />} />
      <Route path="*"         element={<Navigate to="list" replace />} />
    </Routes>
  </Suspense>
);

export const BOOKING_PATHS = {
  ROOT:      '/bookings',
  LIST:      '/bookings/list',
  DETAIL:    (id: string) => `/bookings/${id}`,
  SCHEDULE:  '/bookings/schedule',
  ANALYTICS: '/bookings/analytics',
} as const;

export const BOOKING_NAV_ITEMS = [
  { label: 'All Bookings',     path: BOOKING_PATHS.LIST,      icon: '🏠', description: 'View and manage all bookings' },
  { label: 'Payment Schedule', path: BOOKING_PATHS.SCHEDULE,  icon: '📅', description: 'Installment tracking & collection' },
  { label: 'Analytics',        path: BOOKING_PATHS.ANALYTICS, icon: '📊', description: 'Revenue & performance reports' },
] as const;

export default BookingRoutes;

/* ─── FONT IMPORT (add to index.html or global CSS) ────────────────────────────
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
─────────────────────────────────────────────────────────────────────────────── */