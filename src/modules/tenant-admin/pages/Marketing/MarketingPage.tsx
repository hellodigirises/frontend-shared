import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Stack, Button, Grid, Chip, IconButton,
  Card, Tab, Tabs, TextField, InputAdornment, FormControl,
  InputLabel, Select, MenuItem, Avatar, Dialog, DialogTitle,
  DialogContent, DialogActions, LinearProgress, Divider,
  Switch, FormControlLabel, Tooltip, Paper, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import {
  AddOutlined, SearchOutlined, CampaignOutlined, TrendingUpOutlined,
  AutoAwesomeOutlined, RocketLaunchOutlined, BarChartOutlined,
  CloseOutlined, EditOutlined, DeleteOutlineOutlined,
  FacebookOutlined, Google as GoogleIcon, ChatOutlined,
  PhoneCallbackOutlined, QrCode2Outlined, EmailOutlined,
  PersonAddAltOutlined, SmsOutlined, LinkOutlined, ShareOutlined,
  FlashOnOutlined, PlayArrowOutlined, PauseOutlined, StopOutlined,
  CheckCircleOutlined, ArrowForwardOutlined, SettingsOutlined,
  LanguageOutlined, FiberManualRecordOutlined, TimelineOutlined,
  LeaderboardOutlined, AttachMoneyOutlined, VisibilityOutlined,
  NotificationsOutlined, CalendarMonthOutlined, FilterAltOutlined,
  AccountTreeOutlined, RepeatOutlined, SendOutlined
} from '@mui/icons-material';
import api from '../../../../api/axios';

// ─── Design tokens ────────────────────────────────────────────────────────────
const FONT = "'Syne', 'Georgia', sans-serif";
const BODY = "'Plus Jakarta Sans', 'system-ui', sans-serif";

// ─── Types ────────────────────────────────────────────────────────────────────
type CampaignStatus = 'ACTIVE' | 'PAUSED' | 'DRAFT' | 'ENDED';
type CampaignChannel = 'FACEBOOK' | 'GOOGLE' | 'WHATSAPP' | 'EMAIL' | 'SMS' | 'ORGANIC';
type DripStatus = 'ACTIVE' | 'PAUSED' | 'DRAFT';
type AutomationTrigger = 'LEAD_CREATED' | 'VISIT_COMPLETED' | 'BOOKING_CONFIRMED' | 'PAYMENT_OVERDUE' | 'LEAD_INACTIVE';

interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  channel: CampaignChannel;
  project: string;
  startDate: string;
  endDate?: string;
  budget: number;
  spent: number;
  leads: number;
  bookings: number;
  revenue: number;
  cpl?: number;
}

interface DripCampaign {
  id: string;
  name: string;
  status: DripStatus;
  trigger: string;
  steps: number;
  enrolled: number;
  completed: number;
  channel: string;
}

interface AutomationRule {
  id: string;
  trigger: AutomationTrigger;
  action: string;
  assignTo: string;
  enabled: boolean;
  runs: number;
  channel: CampaignChannel | 'ALL';
}

interface LeadSource {
  source: string;
  icon: React.ReactNode;
  color: string;
  leads: number;
  bookings: number;
  revenue: number;
  cpl: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CHANNEL_META: Record<CampaignChannel, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  FACEBOOK: { label: 'Facebook',  icon: <FacebookOutlined sx={{ fontSize: 14 }} />,     color: '#1877f2', bg: '#eff6ff' },
  GOOGLE:   { label: 'Google',    icon: <LanguageOutlined sx={{ fontSize: 14 }} />,      color: '#ea4335', bg: '#fef2f2' },
  WHATSAPP: { label: 'WhatsApp',  icon: <ChatOutlined sx={{ fontSize: 14 }} />,      color: '#25d366', bg: '#f0fdf4' },
  EMAIL:    { label: 'Email',     icon: <EmailOutlined sx={{ fontSize: 14 }} />,          color: '#8b5cf6', bg: '#f5f3ff' },
  SMS:      { label: 'SMS',       icon: <SmsOutlined sx={{ fontSize: 14 }} />,            color: '#f59e0b', bg: '#fffbeb' },
  ORGANIC:  { label: 'Organic',   icon: <LanguageOutlined sx={{ fontSize: 14 }} />,      color: '#10b981', bg: '#ecfdf5' },
};

const STATUS_META: Record<CampaignStatus, { color: string; bg: string; dot: string }> = {
  ACTIVE:  { color: '#16a34a', bg: '#f0fdf4', dot: '#22c55e' },
  PAUSED:  { color: '#d97706', bg: '#fffbeb', dot: '#f59e0b' },
  DRAFT:   { color: '#6b7280', bg: '#f3f4f6', dot: '#9ca3af' },
  ENDED:   { color: '#9ca3af', bg: '#f9fafb', dot: '#d1d5db' },
};

const TRIGGER_LABELS: Record<AutomationTrigger, string> = {
  LEAD_CREATED:      'Lead Created',
  VISIT_COMPLETED:   'Site Visit Completed',
  BOOKING_CONFIRMED: 'Booking Confirmed',
  PAYMENT_OVERDUE:   'Payment Overdue',
  LEAD_INACTIVE:     'Lead Inactive (7 days)',
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_CAMPAIGNS: Campaign[] = [
  { id:'C1', name:'Diwali Launch – Orchid Heights', status:'ACTIVE', channel:'FACEBOOK', project:'Orchid Heights', startDate:'2025-10-15', endDate:'2025-11-15', budget:500000, spent:312000, leads:448, bookings:32, revenue:120000000, cpl:696 },
  { id:'C2', name:'Google Search – Green Valley', status:'ACTIVE', channel:'GOOGLE', project:'Green Valley', startDate:'2025-09-01', budget:300000, spent:218000, leads:213, bookings:18, revenue:72000000, cpl:1023 },
  { id:'C3', name:'WhatsApp Broadcast – New Launch', status:'PAUSED', channel:'WHATSAPP', project:'Skyline Residency', startDate:'2025-10-01', budget:80000, spent:45000, leads:87, bookings:6, revenue:24000000, cpl:517 },
  { id:'C4', name:'Email Drip – Investment Buyers', status:'ACTIVE', channel:'EMAIL', project:'All Projects', startDate:'2025-08-01', budget:50000, spent:28000, leads:342, bookings:24, revenue:96000000, cpl:82 },
  { id:'C5', name:'Referral Program – Q4', status:'DRAFT', channel:'ORGANIC', project:'All Projects', startDate:'2025-11-01', budget:200000, spent:0, leads:0, bookings:0, revenue:0 },
  { id:'C6', name:'Instagram Stories – 2BHK', status:'ENDED', channel:'FACEBOOK', project:'Orchid Heights', startDate:'2025-07-01', endDate:'2025-09-30', budget:150000, spent:148000, leads:176, bookings:11, revenue:44000000, cpl:841 },
];

const MOCK_DRIP: DripCampaign[] = [
  { id:'D1', name:'New Lead Welcome Sequence', status:'ACTIVE', trigger:'Lead Created', steps:5, enrolled:348, completed:124, channel:'Email + WhatsApp' },
  { id:'D2', name:'Post-Visit Follow-up', status:'ACTIVE', trigger:'Site Visit Done', steps:3, enrolled:89, completed:67, channel:'WhatsApp + SMS' },
  { id:'D3', name:'Re-engagement – Inactive Leads', status:'ACTIVE', trigger:'Inactive 7 days', steps:4, enrolled:214, completed:88, channel:'Email + WhatsApp' },
  { id:'D4', name:'Investment Buyer Nurture', status:'PAUSED', trigger:'Lead Tagged: Investor', steps:7, enrolled:56, completed:12, channel:'Email' },
];

const MOCK_AUTOMATION: AutomationRule[] = [
  { id:'A1', trigger:'LEAD_CREATED',      action:'Create follow-up task (Due: same day) + Welcome WhatsApp', assignTo:'Assigned Agent', enabled:true,  runs:448, channel:'ALL' },
  { id:'A2', trigger:'VISIT_COMPLETED',   action:'Create feedback task (Due: +1 day) + Thank you message', assignTo:'Assigned Agent', enabled:true,  runs:134, channel:'ALL' },
  { id:'A3', trigger:'BOOKING_CONFIRMED', action:'Upload agreement task + Congratulations email',           assignTo:'Sales Manager',  enabled:true,  runs:86,  channel:'ALL' },
  { id:'A4', trigger:'PAYMENT_OVERDUE',   action:'Payment reminder task + WhatsApp nudge + Agent alert',   assignTo:'Finance Team',   enabled:true,  runs:31,  channel:'ALL' },
  { id:'A5', trigger:'LEAD_INACTIVE',     action:'Enroll in re-engagement drip campaign',                   assignTo:'System',         enabled:false, runs:0,   channel:'ALL' },
];

const LEAD_SOURCES: LeadSource[] = [
  { source:'Facebook Ads',     icon:<FacebookOutlined/>, color:'#1877f2', leads:448, bookings:32, revenue:120000000, cpl:696 },
  { source:'Channel Partners', icon:<ShareOutlined/>,    color:'#8b5cf6', leads:280, bookings:35, revenue:140000000, cpl:0 },
  { source:'Google Ads',       icon:<LanguageOutlined/>, color:'#ea4335', leads:213, bookings:18, revenue:72000000,  cpl:1023 },
  { source:'WhatsApp',         icon:<ChatOutlined/>, color:'#25d366', leads:124, bookings:9,  revenue:36000000,  cpl:362 },
  { source:'Website Organic',  icon:<LanguageOutlined/>, color:'#10b981', leads:98,  bookings:7,  revenue:28000000,  cpl:0 },
  { source:'Referral',         icon:<PersonAddAltOutlined/>, color:'#f59e0b', leads:67, bookings:8, revenue:32000000, cpl:0 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtCr  = (n: number) => n >= 10000000 ? `₹${(n/10000000).toFixed(1)}Cr` : n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${(n/1000).toFixed(0)}K`;
const fmtPct = (n: number, d: number) => d > 0 ? `${((n/d)*100).toFixed(1)}%` : '—';
const avatarBg = (n: string) => ['#6366f1','#ec4899','#10b981','#f59e0b','#3b82f6'][n.charCodeAt(0) % 5];

// ─── Sub-components ───────────────────────────────────────────────────────────

const KpiCard: React.FC<{ label: string; value: string; sub?: string; color: string; icon: React.ReactNode; trend?: number }> = ({ label, value, sub, color, icon, trend }) => (
  <Card sx={{
    p: 3, borderRadius: 4, border: '1px solid #f1f5f9', boxShadow: 'none',
    bgcolor: 'white', transition: 'all 0.2s',
    '&:hover': { boxShadow: `0 8px 32px ${color}18`, transform: 'translateY(-2px)' }
  }}>
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
      <Box>
        <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, fontFamily: BODY }}>{label}</Typography>
        <Typography sx={{ fontFamily: FONT, fontSize: 28, fontWeight: 900, color, letterSpacing: -1.2, mt: 0.5, lineHeight: 1 }}>{value}</Typography>
        {sub && <Typography sx={{ fontSize: 11, color: '#9ca3af', mt: 0.5, fontFamily: BODY }}>{sub}</Typography>}
        {trend !== undefined && (
          <Stack direction="row" spacing={0.5} alignItems="center" mt={0.8}>
            <TrendingUpOutlined sx={{ fontSize: 12, color: '#10b981' }} />
            <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: '#10b981', fontFamily: BODY }}>{trend}% this month</Typography>
          </Stack>
        )}
      </Box>
      <Box sx={{ width: 44, height: 44, borderRadius: 3, bgcolor: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
        {icon}
      </Box>
    </Stack>
  </Card>
);

const CampaignCard: React.FC<{ c: Campaign; onEdit: () => void; onDelete: () => void }> = ({ c, onEdit, onDelete }) => {
  const sm = STATUS_META[c.status];
  const cm = CHANNEL_META[c.channel];
  const pct = c.budget > 0 ? (c.spent / c.budget) * 100 : 0;
  const roi = c.budget > 0 ? (((c.revenue - c.spent) / c.spent) * 100).toFixed(0) : '—';

  return (
    <Card sx={{
      borderRadius: 4, border: '1px solid #f1f5f9', boxShadow: 'none',
      overflow: 'hidden', transition: 'all 0.2s',
      '&:hover': { boxShadow: '0 8px 32px rgba(0,0,0,0.08)', transform: 'translateY(-2px)' }
    }}>
      <Box sx={{ height: 4, bgcolor: cm.color }} />
      <Box sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
          <Box flex={1} pr={1}>
            <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
              <Box sx={{ width: 30, height: 30, borderRadius: 2, bgcolor: cm.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cm.color, flexShrink: 0 }}>
                {cm.icon}
              </Box>
              <Box>
                <Typography sx={{ fontFamily: BODY, fontWeight: 800, fontSize: 13.5, color: '#111827', lineHeight: 1.2 }}>{c.name}</Typography>
                <Typography sx={{ fontFamily: BODY, fontSize: 11, color: '#9ca3af' }}>{c.project}</Typography>
              </Box>
            </Stack>
          </Box>
          <Stack direction="row" spacing={0.5} alignItems="center" flexShrink={0}>
            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: sm.dot }} />
            <Typography sx={{ fontSize: 11, fontWeight: 800, color: sm.color, fontFamily: BODY }}>{c.status}</Typography>
          </Stack>
        </Stack>

        {/* Budget bar */}
        <Box mb={2}>
          <Stack direction="row" justifyContent="space-between" mb={0.6}>
            <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#9ca3af', fontFamily: BODY }}>Budget spent</Typography>
            <Typography sx={{ fontSize: 10.5, fontWeight: 800, fontFamily: BODY, color: pct > 90 ? '#ef4444' : '#374151' }}>{fmtCr(c.spent)} / {fmtCr(c.budget)}</Typography>
          </Stack>
          <LinearProgress variant="determinate" value={Math.min(pct, 100)}
            sx={{ height: 5, borderRadius: 3, bgcolor: '#f3f4f6',
              '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : cm.color }
            }} />
        </Box>

        {/* Metrics */}
        <Grid container spacing={1.5}>
          {[
            { label: 'Leads', value: c.leads, color: '#6366f1' },
            { label: 'Bookings', value: c.bookings, color: '#059669' },
            { label: 'Revenue', value: c.revenue > 0 ? fmtCr(c.revenue) : '—', color: '#0ea5e9' },
            { label: 'Conv. Rate', value: fmtPct(c.bookings, c.leads), color: '#8b5cf6' },
          ].map(m => (
            <Grid item xs={3} key={m.label}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#fafafa', textAlign: 'center' }}>
                <Typography sx={{ fontFamily: FONT, fontSize: 16, fontWeight: 900, color: m.color, letterSpacing: -0.5 }}>{m.value}</Typography>
                <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: '#9ca3af', fontFamily: BODY, textTransform: 'uppercase', letterSpacing: 0.5 }}>{m.label}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {c.cpl && (
          <Stack direction="row" justifyContent="space-between" mt={1.5} pt={1.5} sx={{ borderTop: '1px solid #f9fafb' }}>
            <Typography sx={{ fontSize: 11, color: '#9ca3af', fontFamily: BODY }}>Cost Per Lead: <Box component="span" sx={{ fontWeight: 800, color: '#374151' }}>₹{c.cpl}</Box></Typography>
            {c.revenue > 0 && <Typography sx={{ fontSize: 11, fontFamily: BODY }}>ROI: <Box component="span" sx={{ fontWeight: 800, color: '#059669' }}>{roi}%</Box></Typography>}
          </Stack>
        )}

        <Stack direction="row" spacing={1} mt={2} justifyContent="flex-end">
          {c.status === 'ACTIVE' && <IconButton size="small" sx={{ color: '#f59e0b', '&:hover': { bgcolor: '#fffbeb' } }}><PauseOutlined sx={{ fontSize: 16 }} /></IconButton>}
          {c.status === 'PAUSED' && <IconButton size="small" sx={{ color: '#059669', '&:hover': { bgcolor: '#ecfdf5' } }}><PlayArrowOutlined sx={{ fontSize: 16 }} /></IconButton>}
          <IconButton size="small" onClick={onEdit} sx={{ color: '#9ca3af', '&:hover': { color: '#6366f1', bgcolor: '#eef2ff' } }}><EditOutlined sx={{ fontSize: 16 }} /></IconButton>
          <IconButton size="small" onClick={onDelete} sx={{ color: '#9ca3af', '&:hover': { color: '#ef4444', bgcolor: '#fef2f2' } }}><DeleteOutlineOutlined sx={{ fontSize: 16 }} /></IconButton>
        </Stack>
      </Box>
    </Card>
  );
};

// ─── New Campaign Dialog ──────────────────────────────────────────────────────
const CampaignFormDialog: React.FC<{ open: boolean; onClose: () => void; onSave: (c: Partial<Campaign>) => void }> = ({ open, onClose, onSave }) => {
  const [form, setForm] = useState<Partial<Campaign>>({ channel: 'FACEBOOK', status: 'DRAFT' });
  const set = (k: keyof Campaign, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <Box sx={{ height: 5, background: 'linear-gradient(90deg, #6366f1, #ec4899)' }} />
      <DialogTitle sx={{ fontWeight: 900, fontFamily: FONT, fontSize: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        New Campaign
        <IconButton size="small" onClick={onClose}><CloseOutlined /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} mt={1}>
          <TextField label="Campaign Name" size="small" fullWidth value={form.name || ''}
            onChange={e => set('name', e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, fontFamily: BODY } }} />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl size="small" fullWidth>
                <InputLabel sx={{ fontFamily: BODY }}>Channel</InputLabel>
                <Select value={form.channel} label="Channel" onChange={e => set('channel', e.target.value)} sx={{ borderRadius: 2.5 }}>
                  {Object.entries(CHANNEL_META).map(([k, v]) => (
                    <MenuItem key={k} value={k} sx={{ fontFamily: BODY }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ color: v.color }}>{v.icon}</Box>
                        {v.label}
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl size="small" fullWidth>
                <InputLabel sx={{ fontFamily: BODY }}>Status</InputLabel>
                <Select value={form.status} label="Status" onChange={e => set('status', e.target.value)} sx={{ borderRadius: 2.5 }}>
                  {(['DRAFT','ACTIVE','PAUSED'] as CampaignStatus[]).map(s => (
                    <MenuItem key={s} value={s} sx={{ fontFamily: BODY }}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField label="Start Date" size="small" fullWidth type="date" InputLabelProps={{ shrink: true }}
                value={form.startDate || ''} onChange={e => set('startDate', e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, fontFamily: BODY } }} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="End Date (optional)" size="small" fullWidth type="date" InputLabelProps={{ shrink: true }}
                value={form.endDate || ''} onChange={e => set('endDate', e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, fontFamily: BODY } }} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Budget (₹)" size="small" fullWidth type="number"
                value={form.budget || ''} onChange={e => set('budget', +e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, fontFamily: BODY } }} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Project" size="small" fullWidth
                value={form.project || ''} onChange={e => set('project', e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, fontFamily: BODY } }} />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', fontFamily: BODY, fontWeight: 700, color: '#6b7280' }}>Cancel</Button>
        <Button variant="contained" onClick={() => { onSave(form); onClose(); }} disabled={!form.name}
          sx={{ textTransform: 'none', fontWeight: 800, fontFamily: BODY, borderRadius: 2.5, bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, boxShadow: 'none' }}>
          Create Campaign
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const MarketingPage: React.FC = () => {
  const [tab, setTab]                   = useState(0);
  const [campaigns, setCampaigns]       = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [drips, setDrips]               = useState<DripCampaign[]>(MOCK_DRIP);
  const [automations, setAutomations]   = useState<AutomationRule[]>(MOCK_AUTOMATION);
  const [search, setSearch]             = useState('');
  const [channelFilter, setChannelFilter] = useState<CampaignChannel | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'ALL'>('ALL');
  const [campaignFormOpen, setCampaignFormOpen] = useState(false);
  const [captureTab, setCaptureTab]     = useState(0);

  const kpis = useMemo(() => ({
    totalLeads:   campaigns.reduce((s, c) => s + c.leads, 0),
    totalBookings: campaigns.reduce((s, c) => s + c.bookings, 0),
    totalRevenue: campaigns.reduce((s, c) => s + c.revenue, 0),
    totalSpent:   campaigns.reduce((s, c) => s + c.spent, 0),
    activeCampaigns: campaigns.filter(c => c.status === 'ACTIVE').length,
    avgCpl: Math.round(campaigns.filter(c => c.cpl).reduce((s, c) => s + (c.cpl ?? 0), 0) / campaigns.filter(c => c.cpl).length),
  }), [campaigns]);

  const filteredCampaigns = useMemo(() => campaigns.filter(c => {
    const q = search.toLowerCase();
    return (
      (!q || c.name.toLowerCase().includes(q) || c.project.toLowerCase().includes(q)) &&
      (channelFilter === 'ALL' || c.channel === channelFilter) &&
      (statusFilter === 'ALL' || c.status === statusFilter)
    );
  }), [campaigns, search, channelFilter, statusFilter]);

  const addCampaign = (form: Partial<Campaign>) => {
    setCampaigns(p => [...p, {
      id: `C${Date.now()}`, name: form.name!, status: form.status as CampaignStatus,
      channel: form.channel as CampaignChannel, project: form.project ?? '', startDate: form.startDate ?? '',
      endDate: form.endDate, budget: form.budget ?? 0, spent: 0, leads: 0, bookings: 0, revenue: 0
    }]);
  };

  const toggleAutomation = (id: string) => {
    setAutomations(p => p.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  return (
    <Box sx={{ bgcolor: '#f9fafb', minHeight: '100vh', pb: 8, fontFamily: BODY }}>

      {/* ══ HERO HEADER ════════════════════════════════════════════════════ */}
      <Box sx={{
        background: 'linear-gradient(135deg, #0d0d1a 0%, #1a0533 50%, #0a1628 100%)',
        px: { xs: 3, md: 5 }, pt: 5, pb: 5,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Mesh blobs */}
        {[
          { top: -60, left: '20%', size: 280, color: '#ec489920' },
          { top: 20, right: -60, size: 220, color: '#6366f130' },
          { bottom: -40, left: '60%', size: 180, color: '#f59e0b18' },
        ].map((b, i) => (
          <Box key={i} sx={{
            position: 'absolute', width: b.size, height: b.size, borderRadius: '50%',
            bgcolor: b.color, filter: 'blur(50px)', pointerEvents: 'none',
            top: (b as any).top, bottom: (b as any).bottom, left: (b as any).left, right: (b as any).right,
          }} />
        ))}

        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'flex-end' }} spacing={3} sx={{ position: 'relative' }}>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
              <Box sx={{ px: 1.5, py: 0.5, borderRadius: 2, bgcolor: '#ec489920', border: '1px solid #ec489940' }}>
                <Typography sx={{ fontSize: 10, fontWeight: 800, color: '#f9a8d4', fontFamily: BODY, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Marketing Engine
                </Typography>
              </Box>
            </Stack>
            <Typography sx={{ fontFamily: FONT, fontSize: 36, fontWeight: 900, color: 'white', letterSpacing: -1.5, lineHeight: 0.95 }}>
              Marketing &
            </Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: 36, fontWeight: 900, letterSpacing: -1.5, lineHeight: 1, background: 'linear-gradient(90deg, #a78bfa, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Automation
            </Typography>
            <Typography sx={{ fontFamily: BODY, fontSize: 13.5, color: '#64748b', mt: 1.5 }}>
              {kpis.activeCampaigns} active campaigns · {kpis.totalLeads.toLocaleString()} leads captured · {fmtCr(kpis.totalRevenue)} revenue tracked
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddOutlined />} onClick={() => setCampaignFormOpen(true)}
            sx={{
              textTransform: 'none', fontWeight: 800, fontFamily: BODY, borderRadius: 3,
              background: 'linear-gradient(135deg, #6366f1, #ec4899)',
              boxShadow: '0 8px 24px #6366f140', px: 3, py: 1.5,
              '&:hover': { filter: 'brightness(1.1)' }
            }}>
            New Campaign
          </Button>
        </Stack>

        {/* KPIs */}
        <Grid container spacing={2} mt={3} sx={{ position: 'relative' }}>
          {[
            { label: 'Total Leads', value: kpis.totalLeads.toLocaleString(), color: '#a78bfa', icon: <PersonAddAltOutlined />, trend: 18 },
            { label: 'Bookings', value: kpis.totalBookings.toString(), color: '#34d399', icon: <CheckCircleOutlined />, trend: 12 },
            { label: 'Revenue', value: fmtCr(kpis.totalRevenue), color: '#fbbf24', icon: <AttachMoneyOutlined />, trend: 9 },
            { label: 'Budget Spent', value: fmtCr(kpis.totalSpent), color: '#fb923c', icon: <BarChartOutlined /> },
            { label: 'Avg. CPL', value: `₹${kpis.avgCpl}`, color: '#60a5fa', icon: <TrendingUpOutlined /> },
          ].map(k => (
            <Grid item xs={6} sm={4} md key={k.label}>
              <Box sx={{ p: 2.5, borderRadius: 3.5, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography sx={{ fontSize: 10, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, fontFamily: BODY }}>{k.label}</Typography>
                    <Typography sx={{ fontFamily: FONT, fontSize: 26, fontWeight: 900, color: k.color, letterSpacing: -1, mt: 0.4, lineHeight: 1 }}>{k.value}</Typography>
                    {k.trend && (
                      <Stack direction="row" spacing={0.3} alignItems="center" mt={0.6}>
                        <TrendingUpOutlined sx={{ fontSize: 11, color: '#34d399' }} />
                        <Typography sx={{ fontSize: 10, fontWeight: 800, color: '#34d399', fontFamily: BODY }}>{k.trend}%</Typography>
                      </Stack>
                    )}
                  </Box>
                  <Box sx={{ color: k.color, opacity: 0.6 }}>{k.icon}</Box>
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ══ TABS ═══════════════════════════════════════════════════════════ */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #f1f5f9', px: { xs: 3, md: 5 }, position: 'sticky', top: 0, zIndex: 10 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          sx={{
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontFamily: BODY, fontSize: 13, minHeight: 52, color: '#9ca3af' },
            '& .MuiTabs-indicator': { height: 3, borderRadius: 2, background: 'linear-gradient(90deg, #6366f1, #ec4899)' },
            '& .Mui-selected': { color: '#6366f1 !important' },
          }}>
          <Tab icon={<CampaignOutlined sx={{ fontSize: 17 }} />} iconPosition="start" label="Campaigns" />
          <Tab icon={<RepeatOutlined sx={{ fontSize: 17 }} />} iconPosition="start" label="Drip Campaigns" />
          <Tab icon={<FlashOnOutlined sx={{ fontSize: 17 }} />} iconPosition="start" label="Automation" />
          <Tab icon={<AccountTreeOutlined sx={{ fontSize: 17 }} />} iconPosition="start" label="Lead Capture" />
          <Tab icon={<LeaderboardOutlined sx={{ fontSize: 17 }} />} iconPosition="start" label="Attribution" />
        </Tabs>
      </Box>

      {/* ══ TAB CONTENT ════════════════════════════════════════════════════ */}
      <Box sx={{ px: { xs: 3, md: 5 }, py: 4 }}>

        {/* ── CAMPAIGNS ── */}
        {tab === 0 && (
          <Box>
            {/* Filters */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} mb={3} alignItems={{ sm: 'center' }}>
              <TextField placeholder="Search campaigns…" size="small" value={search} onChange={e => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchOutlined sx={{ fontSize: 16, color: '#9ca3af' }} /></InputAdornment>,
                  sx: { borderRadius: 2.5, fontFamily: BODY, bgcolor: 'white' }
                }}
                sx={{ flex: 1, maxWidth: 320 }} />
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel sx={{ fontFamily: BODY }}>Channel</InputLabel>
                <Select value={channelFilter} label="Channel" onChange={e => setChannelFilter(e.target.value as any)}
                  sx={{ borderRadius: 2.5, fontFamily: BODY, bgcolor: 'white' }}>
                  <MenuItem value="ALL" sx={{ fontFamily: BODY }}>All Channels</MenuItem>
                  {Object.entries(CHANNEL_META).map(([k, v]) => (
                    <MenuItem key={k} value={k} sx={{ fontFamily: BODY }}>
                      <Stack direction="row" spacing={1} alignItems="center"><Box sx={{ color: v.color }}>{v.icon}</Box>{v.label}</Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel sx={{ fontFamily: BODY }}>Status</InputLabel>
                <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value as any)}
                  sx={{ borderRadius: 2.5, fontFamily: BODY, bgcolor: 'white' }}>
                  <MenuItem value="ALL" sx={{ fontFamily: BODY }}>All Statuses</MenuItem>
                  {(['ACTIVE','PAUSED','DRAFT','ENDED'] as CampaignStatus[]).map(s => (
                    <MenuItem key={s} value={s} sx={{ fontFamily: BODY }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: STATUS_META[s].dot }} />
                        {s}
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography sx={{ fontSize: 12, color: '#9ca3af', fontFamily: BODY, fontWeight: 600, flexShrink: 0 }}>
                {filteredCampaigns.length} campaigns
              </Typography>
            </Stack>

            <Grid container spacing={2.5}>
              {filteredCampaigns.map(c => (
                <Grid item xs={12} sm={6} lg={4} key={c.id}>
                  <CampaignCard c={c}
                    onEdit={() => {}}
                    onDelete={() => setCampaigns(p => p.filter(x => x.id !== c.id))} />
                </Grid>
              ))}
              {filteredCampaigns.length === 0 && (
                <Grid item xs={12}>
                  <Box sx={{ py: 10, textAlign: 'center' }}>
                    <CampaignOutlined sx={{ fontSize: 56, color: '#e5e7eb' }} />
                    <Typography sx={{ fontFamily: BODY, color: '#9ca3af', fontWeight: 700, mt: 1 }}>No campaigns found</Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {/* ── DRIP CAMPAIGNS ── */}
        {tab === 1 && (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Box>
                <Typography sx={{ fontFamily: FONT, fontSize: 22, fontWeight: 900, color: '#0f172a' }}>Drip Campaigns</Typography>
                <Typography sx={{ fontFamily: BODY, fontSize: 13, color: '#9ca3af' }}>Automated multi-step sequences to nurture leads</Typography>
              </Box>
              <Button variant="contained" startIcon={<AddOutlined />}
                sx={{ textTransform: 'none', fontWeight: 800, fontFamily: BODY, borderRadius: 2.5, bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, boxShadow: 'none' }}>
                New Sequence
              </Button>
            </Stack>
            <Stack spacing={2}>
              {drips.map(d => {
                const pct = d.enrolled > 0 ? (d.completed / d.enrolled) * 100 : 0;
                const sm = d.status === 'ACTIVE' ? { color: '#16a34a', dot: '#22c55e' } : d.status === 'PAUSED' ? { color: '#d97706', dot: '#f59e0b' } : { color: '#6b7280', dot: '#9ca3af' };
                return (
                  <Card key={d.id} sx={{ p: 3, borderRadius: 4, border: '1px solid #f1f5f9', boxShadow: 'none', '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }, transition: 'all 0.2s' }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ md: 'center' }}>
                      <Box sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', flexShrink: 0 }}>
                        <RepeatOutlined />
                      </Box>
                      <Box flex={1}>
                        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" mb={0.5}>
                          <Typography sx={{ fontFamily: BODY, fontWeight: 800, fontSize: 14.5, color: '#111827' }}>{d.name}</Typography>
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: sm.dot }} />
                          <Typography sx={{ fontSize: 11, fontWeight: 800, color: sm.color, fontFamily: BODY }}>{d.status}</Typography>
                        </Stack>
                        <Stack direction="row" spacing={2.5} flexWrap="wrap">
                          <Typography sx={{ fontSize: 12, color: '#9ca3af', fontFamily: BODY }}>
                            Trigger: <Box component="span" sx={{ fontWeight: 700, color: '#374151' }}>{d.trigger}</Box>
                          </Typography>
                          <Typography sx={{ fontSize: 12, color: '#9ca3af', fontFamily: BODY }}>
                            {d.steps} steps · <Box component="span" sx={{ fontWeight: 700, color: '#374151' }}>{d.channel}</Box>
                          </Typography>
                        </Stack>
                        <Box mt={1.5}>
                          <Stack direction="row" justifyContent="space-between" mb={0.5}>
                            <Typography sx={{ fontSize: 11, fontFamily: BODY, color: '#9ca3af' }}>
                              {d.enrolled} enrolled · {d.completed} completed
                            </Typography>
                            <Typography sx={{ fontSize: 11, fontWeight: 800, fontFamily: BODY, color: '#6366f1' }}>{pct.toFixed(0)}%</Typography>
                          </Stack>
                          <LinearProgress variant="determinate" value={pct}
                            sx={{ height: 5, borderRadius: 3, bgcolor: '#f3f4f6', '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: '#6366f1' } }} />
                        </Box>
                      </Box>
                      <Stack direction="row" spacing={0.5} flexShrink={0}>
                        {d.status === 'ACTIVE' ? (
                          <Tooltip title="Pause"><IconButton size="small" sx={{ color: '#f59e0b', '&:hover': { bgcolor: '#fffbeb' } }}><PauseOutlined fontSize="small" /></IconButton></Tooltip>
                        ) : (
                          <Tooltip title="Resume"><IconButton size="small" sx={{ color: '#059669', '&:hover': { bgcolor: '#ecfdf5' } }}><PlayArrowOutlined fontSize="small" /></IconButton></Tooltip>
                        )}
                        <Tooltip title="Edit"><IconButton size="small" sx={{ color: '#9ca3af', '&:hover': { color: '#6366f1', bgcolor: '#eef2ff' } }}><EditOutlined fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Delete"><IconButton size="small" sx={{ color: '#9ca3af', '&:hover': { color: '#ef4444', bgcolor: '#fef2f2' } }} onClick={() => setDrips(p => p.filter(x => x.id !== d.id))}><DeleteOutlineOutlined fontSize="small" /></IconButton></Tooltip>
                      </Stack>
                    </Stack>
                  </Card>
                );
              })}
            </Stack>
          </Box>
        )}

        {/* ── AUTOMATION RULES ── */}
        {tab === 2 && (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Box>
                <Typography sx={{ fontFamily: FONT, fontSize: 22, fontWeight: 900, color: '#0f172a' }}>Automation Rules</Typography>
                <Typography sx={{ fontFamily: BODY, fontSize: 13, color: '#9ca3af' }}>Auto-create tasks, send messages, and route leads based on CRM events</Typography>
              </Box>
              <Chip label={`${automations.filter(a => a.enabled).length} Active`} sx={{ bgcolor: '#f0fdf4', color: '#16a34a', fontWeight: 800, fontFamily: BODY }} />
            </Stack>

            <Stack spacing={2.5}>
              {automations.map(rule => (
                <Card key={rule.id} sx={{
                  p: 3, borderRadius: 4, border: '1px solid',
                  borderColor: rule.enabled ? '#e0e7ff' : '#f1f5f9',
                  boxShadow: 'none', opacity: rule.enabled ? 1 : 0.65,
                  bgcolor: rule.enabled ? '#fafbff' : 'white',
                  transition: 'all 0.2s'
                }}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} alignItems={{ md: 'center' }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: rule.enabled ? '#eef2ff' : '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: rule.enabled ? '#6366f1' : '#9ca3af', flexShrink: 0 }}>
                      <FlashOnOutlined />
                    </Box>
                    <Box flex={1}>
                      {/* WHEN → THEN */}
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" mb={0.8}>
                        <Box sx={{ px: 1.2, py: 0.3, borderRadius: 1.5, bgcolor: '#f3f4f6' }}>
                          <Typography sx={{ fontSize: 9.5, fontWeight: 800, color: '#6b7280', fontFamily: BODY, textTransform: 'uppercase', letterSpacing: 0.8 }}>WHEN</Typography>
                        </Box>
                        <Typography sx={{ fontFamily: BODY, fontWeight: 800, fontSize: 13.5, color: '#111827' }}>
                          {TRIGGER_LABELS[rule.trigger]}
                        </Typography>
                        <ArrowForwardOutlined sx={{ fontSize: 15, color: '#9ca3af' }} />
                        <Box sx={{ px: 1.2, py: 0.3, borderRadius: 1.5, bgcolor: '#eef2ff' }}>
                          <Typography sx={{ fontSize: 9.5, fontWeight: 800, color: '#6366f1', fontFamily: BODY, textTransform: 'uppercase', letterSpacing: 0.8 }}>THEN</Typography>
                        </Box>
                        <Typography sx={{ fontFamily: BODY, fontSize: 12.5, color: '#374151' }}>{rule.action}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={3} flexWrap="wrap">
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <PersonAddAltOutlined sx={{ fontSize: 13, color: '#9ca3af' }} />
                          <Typography sx={{ fontSize: 11.5, color: '#6b7280', fontFamily: BODY }}>{rule.assignTo}</Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <TrendingUpOutlined sx={{ fontSize: 13, color: '#9ca3af' }} />
                          <Typography sx={{ fontSize: 11.5, color: '#6b7280', fontFamily: BODY }}>{rule.runs} times triggered</Typography>
                        </Stack>
                      </Stack>
                    </Box>
                    <Stack alignItems="center" spacing={0.5} flexShrink={0}>
                      <Switch checked={rule.enabled} size="small" onChange={() => toggleAutomation(rule.id)}
                        sx={{ '& .MuiSwitch-thumb': { bgcolor: rule.enabled ? '#6366f1' : '#d1d5db' }, '& .MuiSwitch-track': { bgcolor: rule.enabled ? '#c7d2fe' : '#e5e7eb !important' } }} />
                      <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: rule.enabled ? '#6366f1' : '#9ca3af', fontFamily: BODY }}>
                        {rule.enabled ? 'Active' : 'Off'}
                      </Typography>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Box>
        )}

        {/* ── LEAD CAPTURE ── */}
        {tab === 3 && (
          <Box>
            <Typography sx={{ fontFamily: FONT, fontSize: 22, fontWeight: 900, color: '#0f172a', mb: 0.5 }}>Lead Capture Sources</Typography>
            <Typography sx={{ fontFamily: BODY, fontSize: 13, color: '#9ca3af', mb: 3 }}>Configure and monitor all lead capture channels</Typography>

            <Tabs value={captureTab} onChange={(_, v) => setCaptureTab(v)} sx={{ mb: 3, '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontFamily: BODY, minHeight: 42 }, '& .MuiTabs-indicator': { bgcolor: '#6366f1' } }}>
              <Tab label="All Channels" />
              <Tab label="Website Form" />
              <Tab label="Facebook / Meta" />
              <Tab label="Google Ads" />
              <Tab label="WhatsApp" />
            </Tabs>

            <Grid container spacing={2.5}>
              {[
                { label: 'Website Form', icon: <LanguageOutlined />, color: '#6366f1', status: 'ACTIVE', leads: 98, desc: 'Embeddable form for project landing pages', hasCode: true },
                { label: 'Facebook Lead Ads', icon: <FacebookOutlined />, color: '#1877f2', status: 'ACTIVE', leads: 448, desc: 'Auto-capture from Facebook & Instagram ads via webhook' },
                { label: 'Google Ads', icon: <LanguageOutlined />, color: '#ea4335', status: 'ACTIVE', leads: 213, desc: 'UTM tracking for Google Search & Display campaigns' },
                { label: 'WhatsApp', icon: <ChatOutlined />, color: '#25d366', status: 'ACTIVE', leads: 124, desc: 'Incoming WhatsApp messages auto-create leads' },
                { label: 'Missed Calls', icon: <PhoneCallbackOutlined />, color: '#f59e0b', status: 'PAUSED', leads: 67, desc: 'Missed call campaigns via telephony webhook' },
                { label: 'QR Codes', icon: <QrCode2Outlined />, color: '#8b5cf6', status: 'ACTIVE', leads: 34, desc: 'Site-visit QR codes capture interested walkins' },
                { label: 'CSV Import', icon: <PersonAddAltOutlined />, color: '#64748b', status: 'ACTIVE', leads: 280, desc: 'Bulk import from broker lists and external sources' },
                { label: 'Channel Partners', icon: <ShareOutlined />, color: '#ec4899', status: 'ACTIVE', leads: 280, desc: 'Partner portal deal registrations auto-create leads' },
              ].map(src => (
                <Grid item xs={12} sm={6} md={4} key={src.label}>
                  <Card sx={{ p: 2.5, borderRadius: 4, border: '1px solid #f1f5f9', boxShadow: 'none', height: '100%', '&:hover': { boxShadow: '0 6px 24px rgba(0,0,0,0.07)' }, transition: 'all 0.2s' }}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Box sx={{ width: 44, height: 44, borderRadius: 3, bgcolor: `${src.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: src.color, flexShrink: 0 }}>
                        {src.icon}
                      </Box>
                      <Box flex={1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Typography sx={{ fontFamily: BODY, fontWeight: 800, fontSize: 13.5, color: '#111827' }}>{src.label}</Typography>
                          <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: src.status === 'ACTIVE' ? '#22c55e' : '#f59e0b', flexShrink: 0, mt: 0.5 }} />
                        </Stack>
                        <Typography sx={{ fontFamily: BODY, fontSize: 11.5, color: '#9ca3af', mt: 0.3, mb: 1.5, lineHeight: 1.5 }}>{src.desc}</Typography>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <PersonAddAltOutlined sx={{ fontSize: 13, color: src.color }} />
                            <Typography sx={{ fontFamily: FONT, fontSize: 20, fontWeight: 900, color: src.color, letterSpacing: -0.5 }}>{src.leads}</Typography>
                            <Typography sx={{ fontFamily: BODY, fontSize: 10, color: '#9ca3af' }}>leads</Typography>
                          </Stack>
                          {src.hasCode && (
                            <Chip label="Get Code" size="small"
                              sx={{ fontSize: 10, bgcolor: `${src.color}14`, color: src.color, fontWeight: 800, fontFamily: BODY, cursor: 'pointer' }} />
                          )}
                        </Stack>
                      </Box>
                    </Stack>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Embed code snippet */}
            {captureTab === 1 && (
              <Box mt={4}>
                <Typography sx={{ fontFamily: BODY, fontWeight: 800, fontSize: 14, color: '#374151', mb: 1.5 }}>
                  Embed Code — Copy & paste into your website
                </Typography>
                <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: '#0f172a', border: '1px solid #1e293b' }}>
                  <Typography sx={{ fontFamily: 'monospace', fontSize: 12.5, color: '#e2e8f0', lineHeight: 1.8 }}>
                    {'<script src="https://crm.realesso.com/form.js"></script>'}<br />
                    {'<div data-form="project-lead-form"'}  <br />
                    {'     data-project="orchid-heights"'}<br />
                    {'     data-tenant="your-tenant-id"></div>'}
                  </Typography>
                </Box>
                <Typography sx={{ fontFamily: BODY, fontSize: 11.5, color: '#9ca3af', mt: 1 }}>
                  Leads submitted via this form are automatically created in your CRM and assigned based on routing rules.
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* ── ATTRIBUTION ── */}
        {tab === 4 && (
          <Box>
            <Typography sx={{ fontFamily: FONT, fontSize: 22, fontWeight: 900, color: '#0f172a', mb: 0.5 }}>Lead Attribution</Typography>
            <Typography sx={{ fontFamily: BODY, fontSize: 13, color: '#9ca3af', mb: 4 }}>Track exactly where your bookings and revenue come from</Typography>

            <Grid container spacing={3}>
              {/* Attribution table */}
              <Grid item xs={12} lg={8}>
                <Card sx={{ borderRadius: 4, border: '1px solid #f1f5f9', boxShadow: 'none', overflow: 'hidden' }}>
                  <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #f9fafb', bgcolor: '#fafafa' }}>
                    <Typography sx={{ fontFamily: BODY, fontWeight: 800, fontSize: 14, color: '#374151' }}>Source Performance</Typography>
                  </Box>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {['Source', 'Leads', 'Bookings', 'Conv. Rate', 'Revenue', 'CPL'].map(h => (
                            <TableCell key={h} sx={{ fontWeight: 800, fontSize: 10.5, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: BODY, py: 1.5, borderBottom: '1px solid #f3f4f6' }}>{h}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {LEAD_SOURCES.map((s, i) => (
                          <TableRow key={i} hover sx={{ '& td': { py: 1.5, borderBottom: '1px solid #f9fafb', fontFamily: BODY } }}>
                            <TableCell>
                              <Stack direction="row" spacing={1.5} alignItems="center">
                                <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: `${s.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                                  {s.icon}
                                </Box>
                                <Typography sx={{ fontWeight: 700, fontSize: 13, fontFamily: BODY }}>{s.source}</Typography>
                              </Stack>
                            </TableCell>
                            <TableCell><Typography sx={{ fontFamily: FONT, fontWeight: 900, fontSize: 16, color: s.color }}>{s.leads}</Typography></TableCell>
                            <TableCell><Typography sx={{ fontFamily: FONT, fontWeight: 900, fontSize: 16, color: '#059669' }}>{s.bookings}</Typography></TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ flex: 1, height: 5, borderRadius: 3, bgcolor: '#f3f4f6', overflow: 'hidden', maxWidth: 60 }}>
                                  <Box sx={{ height: '100%', width: `${(s.bookings/s.leads*100).toFixed(0)}%`, bgcolor: s.color, borderRadius: 3 }} />
                                </Box>
                                <Typography sx={{ fontSize: 12, fontWeight: 800, fontFamily: BODY }}>{fmtPct(s.bookings, s.leads)}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell><Typography sx={{ fontWeight: 800, fontSize: 12.5, color: '#0ea5e9', fontFamily: BODY }}>{fmtCr(s.revenue)}</Typography></TableCell>
                            <TableCell><Typography sx={{ fontWeight: 700, fontSize: 12, color: '#6b7280', fontFamily: BODY }}>{s.cpl > 0 ? `₹${s.cpl}` : 'Organic'}</Typography></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </Grid>

              {/* Source breakdown donut-style */}
              <Grid item xs={12} lg={4}>
                <Card sx={{ p: 3, borderRadius: 4, border: '1px solid #f1f5f9', boxShadow: 'none', height: '100%' }}>
                  <Typography sx={{ fontFamily: BODY, fontWeight: 800, fontSize: 14, color: '#374151', mb: 2.5 }}>Lead Source Mix</Typography>
                  <Stack spacing={1.8}>
                    {LEAD_SOURCES.map(s => {
                      const totalLeads = LEAD_SOURCES.reduce((acc, x) => acc + x.leads, 0);
                      const pct = (s.leads / totalLeads) * 100;
                      return (
                        <Box key={s.source}>
                          <Stack direction="row" justifyContent="space-between" mb={0.5}>
                            <Stack direction="row" spacing={0.8} alignItems="center">
                              <Box sx={{ color: s.color, display: 'flex', alignItems: 'center' }}>{s.icon}</Box>
                              <Typography sx={{ fontSize: 12, fontWeight: 700, fontFamily: BODY }}>{s.source}</Typography>
                            </Stack>
                            <Typography sx={{ fontSize: 11.5, fontWeight: 800, fontFamily: BODY, color: s.color }}>{pct.toFixed(0)}%</Typography>
                          </Stack>
                          <LinearProgress variant="determinate" value={pct}
                            sx={{ height: 6, borderRadius: 3, bgcolor: '#f3f4f6', '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: s.color } }} />
                        </Box>
                      );
                    })}
                  </Stack>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>

      {/* New Campaign Dialog */}
      <CampaignFormDialog open={campaignFormOpen} onClose={() => setCampaignFormOpen(false)} onSave={addCampaign} />
    </Box>
  );
};

export default MarketingPage;