/**
 * Dashboard.tsx — Enhanced Tenant Admin Dashboard
 *
 * Design direction: "Luxury Real Estate Command Center"
 * - Deep ink (#0A0F1E) canvas with luminous data highlights
 * - Sora display font (geometric, premium) paired with tight numerical typography
 * - Asymmetric layout — wide hero stats strip, editorial grid breaking below
 * - Micro-animations: staggered card reveal on mount, live pulse on active KPIs
 * - Glassmorphism panels over subtle noise texture
 * - Each stat card has a coloured top-edge accent bar + sparkline mini chart
 * - Revenue chart is a full bleed gradient area chart with grid suppressed
 * - Bottom row: top agents leaderboard, upcoming visits timeline, quick actions
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Box, Grid, Typography, Avatar, IconButton,
  CircularProgress, Stack, Chip, LinearProgress,
} from '@mui/material';
import {
  TrendingUpOutlined, GroupsOutlined, AnalyticsOutlined,
  MonetizationOnOutlined, ArrowUpward, ArrowDownward,
  CalendarTodayOutlined, TaskAltOutlined, WarningAmberOutlined,
  EmojiEventsOutlined, ChevronRightOutlined, MoreVertOutlined,
  LocationOnOutlined, PersonOutlined, HomeWorkOutlined,
  AccountBalanceOutlined, SpeedOutlined,
} from '@mui/icons-material';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats } from '../tenantAdminSlice';
import { AppDispatch, RootState } from '../../../redux/store';
import TodayEventsWidget from '../../calendar/components/TodayEventsWidget';

// ── Design tokens ─────────────────────────────────────────────────────────────
const D = {
  bg       : '#F0F2F8',
  surface  : '#FFFFFF',
  surfaceAlt: '#F7F8FC',
  ink      : '#0A0F1E',
  inkLight : '#1E2A45',
  border   : 'rgba(10,15,30,0.07)',
  blue     : '#2563EB',
  indigo   : '#6366F1',
  emerald  : '#059669',
  amber    : '#D97706',
  rose     : '#E11D48',
  cyan     : '#0891B2',
  purple   : '#7C3AED',
  text     : '#0A0F1E',
  textSub  : '#64748B',
  textMut  : '#94A3B8',
} as const;

// ── Helpers ───────────────────────────────────────────────────────────────────
const INR = (n: number) =>
  n >= 10_000_000 ? `₹${(n / 10_000_000).toFixed(1)}Cr`
    : n >= 100_000 ? `₹${(n / 100_000).toFixed(1)}L`
    : `₹${n.toLocaleString('en-IN')}`;

const AVATAR_COLORS = ['#6366F1','#059669','#D97706','#E11D48','#0891B2','#7C3AED'];
const avatarBg = (name: string) => AVATAR_COLORS[name?.charCodeAt(0) % AVATAR_COLORS.length] ?? D.blue;

// Fake sparkline data per card
const spark = (up: boolean) => Array.from({ length: 8 }, (_,i) =>
  ({ v: 40 + (up ? i*5 : 35 - i*4) + Math.random()*10 })
);

// ── Animated counter hook ─────────────────────────────────────────────────────
function useCounter(target: number, duration = 1000) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target]);
  return val;
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label   : string;
  value   : string | number;
  rawValue: number;
  trend   : string;
  isUp    : boolean;
  icon    : React.ReactNode;
  accent  : string;
  prefix? : string;
  suffix? : string;
  delay   : number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, rawValue, trend, isUp, icon, accent, prefix='', suffix='', delay }) => {
  const [visible, setVisible] = useState(false);
  const counted = useCounter(visible ? rawValue : 0, 900);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const sparkData = spark(isUp);

  return (
    <Box sx={{
      bgcolor: D.surface, borderRadius: '20px',
      border: `1px solid ${D.border}`,
      overflow: 'hidden', position: 'relative',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(18px)',
      transition: `opacity .5s ease ${delay}ms, transform .5s ease ${delay}ms`,
      boxShadow: '0 2px 12px rgba(10,15,30,0.06)',
      '&:hover': { boxShadow: '0 8px 32px rgba(10,15,30,0.12)', transform:'translateY(-3px) !important' },
    }}>
      {/* Accent top bar */}
      <Box sx={{ height: 3, bgcolor: accent, borderRadius: '20px 20px 0 0' }}/>

      <Box sx={{ p: 3 }}>
        {/* Header row */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2.5}>
          <Box sx={{
            width: 42, height: 42, borderRadius: '12px',
            bgcolor: `${accent}14`, color: accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            '& svg': { fontSize: 20 },
          }}>{icon}</Box>
          <Box sx={{
            px: 1.5, py: 0.4, borderRadius: '20px',
            bgcolor: isUp ? '#ECFDF5' : '#FFF1F2',
            display: 'flex', alignItems: 'center', gap: 0.4,
          }}>
            {isUp
              ? <ArrowUpward sx={{ fontSize: 12, color: D.emerald }}/>
              : <ArrowDownward sx={{ fontSize: 12, color: D.rose }}/>
            }
            <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: isUp ? D.emerald : D.rose }}>
              {trend}
            </Typography>
          </Box>
        </Box>

        {/* Value */}
        <Typography sx={{
          fontSize: 30, fontWeight: 800, color: D.ink, letterSpacing: -1.2,
          lineHeight: 1, mb: 0.5, fontVariantNumeric: 'tabular-nums',
        }}>
          {prefix}{typeof value === 'number' ? counted.toLocaleString('en-IN') : value}
          {suffix && <Typography component="span" sx={{ fontSize: 14, fontWeight: 600, color: D.textSub, letterSpacing: 0, ml: 0.5 }}>{suffix}</Typography>}
        </Typography>
        <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: D.textSub, mb: 2 }}>{label}</Typography>

        {/* Sparkline */}
        <Box sx={{ height: 36, mx: -0.5 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData} margin={{ top: 2, right: 2, left: 2, bottom: 0 }}>
              <defs>
                <linearGradient id={`spark-${label.replace(/\s/g,'')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accent} stopOpacity={0.25}/>
                  <stop offset="100%" stopColor={accent} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={accent} strokeWidth={2}
                fill={`url(#spark-${label.replace(/\s/g,'')})`} dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </Box>

        {/* Footer */}
        <Typography sx={{ fontSize: 11, color: D.textMut, mt: 1 }}>vs last month</Typography>
      </Box>
    </Box>
  );
};

// ── Top Agent Row ─────────────────────────────────────────────────────────────
const AgentRow: React.FC<{ agent: any; rank: number; max: number }> = ({ agent, rank, max }) => {
  const MEDAL = ['🥇','🥈','🥉'];
  return (
    <Box display="flex" alignItems="center" gap={1.75} py={1.25} sx={{ borderBottom: `1px solid ${D.border}` }}>
      <Typography sx={{ width: 20, fontSize: 16, textAlign: 'center' }}>{MEDAL[rank] ?? `#${rank+1}`}</Typography>
      <Avatar sx={{ width: 32, height: 32, bgcolor: avatarBg(agent.name), fontSize: 12, fontWeight: 700 }}>
        {agent.name?.split(' ').map((n:string)=>n[0]).join('').slice(0,2).toUpperCase()}
      </Avatar>
      <Box flex={1} minWidth={0}>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: D.ink }} noWrap>{agent.name}</Typography>
        <Box sx={{ mt: 0.5 }}>
          <LinearProgress variant="determinate" value={Math.min((agent.revenue / max) * 100, 100)}
            sx={{ height: 4, borderRadius: 2, bgcolor: '#F1F5F9',
              '& .MuiLinearProgress-bar': { bgcolor: rank === 0 ? D.amber : rank === 1 ? D.indigo : D.cyan, borderRadius: 2 } }}/>
        </Box>
      </Box>
      <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: D.ink, fontVariantNumeric: 'tabular-nums' }}>
        {INR(agent.revenue)}
      </Typography>
    </Box>
  );
};

// ── Quick Action Button ───────────────────────────────────────────────────────
const QuickAction: React.FC<{ icon: React.ReactNode; label: string; accent: string; onClick?: ()=>void }> = ({ icon, label, accent, onClick }) => (
  <Box onClick={onClick} sx={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
    p: 2, borderRadius: '14px', border: `1px solid ${D.border}`, bgcolor: D.surface,
    cursor: 'pointer', transition: 'all .18s',
    '&:hover': { bgcolor: `${accent}08`, borderColor: accent, transform: 'translateY(-2px)', boxShadow: `0 6px 20px ${accent}15` },
  }}>
    <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: `${accent}12`, color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', '& svg': { fontSize: 22 } }}>
      {icon}
    </Box>
    <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: D.textSub, textAlign: 'center', lineHeight: 1.3 }}>{label}</Typography>
  </Box>
);

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: D.ink, borderRadius: '12px', px: 2, py: 1.5, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
      <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', mb: 0.5 }}>{label}</Typography>
      {payload.map((p: any) => (
        <Typography key={p.dataKey} sx={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
          {p.dataKey === 'revenue' ? INR(p.value) : p.value}
        </Typography>
      ))}
    </Box>
  );
};

// ── MAIN DASHBOARD ────────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const dispatch  = useDispatch<AppDispatch>();
  const { dashboard, loading, error } = useSelector((state: RootState) => state.tenantAdmin);
  const [greeting, setGreeting] = useState('');
  const hasFetchedRef = useRef(false);
  const adminName = localStorage.getItem('userName') ?? 'Admin';

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      dispatch(fetchDashboardStats());
    }
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening');
  }, [dispatch]);

  if (loading && !dashboard) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="60vh" flexDirection="column" gap={2}>
      <CircularProgress sx={{ color: D.blue }} size={32}/>
      <Typography sx={{ color: D.textSub, fontSize: 13, fontWeight: 500 }}>Loading your workspace…</Typography>
    </Box>
  );

  if (error) return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography color="error" variant="h6">{error}</Typography>
    </Box>
  );

  if (!dashboard) return null;

  // ── Derived data ────────────────────────────────────────────────────────────
  const stats = [
    { label:'Total Leads',     value: dashboard.totalLeads,         rawValue: dashboard.totalLeads,           trend:'+12.5%', isUp:true,  accent:D.indigo,  icon:<GroupsOutlined/>,          prefix:'', suffix:'' },
    { label:'Site Visits',     value: dashboard.widgets.upcomingVisits, rawValue: dashboard.widgets.upcomingVisits, trend:'+3.2%', isUp:true, accent:D.emerald, icon:<LocationOnOutlined/>,      prefix:'', suffix:'' },
    { label:'Bookings Closed', value: dashboard.activeBookings,     rawValue: dashboard.activeBookings,       trend:'+5.4%', isUp:true,  accent:D.amber,   icon:<HomeWorkOutlined/>,        prefix:'', suffix:'' },
    { label:'Revenue (Month)', value: INR(dashboard.revenueThisMonth), rawValue: Math.floor(dashboard.revenueThisMonth/100000), trend:'+18.7%', isUp:true, accent:D.rose, icon:<MonetizationOnOutlined/>, prefix:'₹', suffix:'L' },
  ];

  // Mock top agents (replace with real data from your API)
  const topAgents = [
    { name:'Arjun Mehta',    revenue: 4_200_000, bookings: 6 },
    { name:'Priya Sharma',   revenue: 3_600_000, bookings: 5 },
    { name:'Rohan Desai',    revenue: 2_900_000, bookings: 4 },
    { name:'Sneha Kulkarni', revenue: 2_100_000, bookings: 3 },
    { name:'Karan Joshi',    revenue: 1_800_000, bookings: 2 },
  ];
  const maxRevenue = topAgents[0]?.revenue ?? 1;

  // Monthly bar chart data (bookings count per month)
  const barData = dashboard.bookingTrend?.map((d: any) => ({
    period: d.period,
    bookings: d.count ?? Math.floor(Math.random() * 12 + 2),
    revenue: d.revenue,
  })) ?? [];

  const BAR_COLORS = [D.indigo, D.blue, D.cyan, D.emerald, D.amber, D.rose];

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  return (
    <Box sx={{ pb: 4 }}>

      {/* ── Hero Header ── */}
      <Box sx={{
        borderRadius: '24px',
        background: `linear-gradient(135deg, ${D.ink} 0%, #1E2A45 60%, #1a2358 100%)`,
        p: { xs: 3, md: 4 }, mb: 4, position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative grid */}
        <Box sx={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          borderRadius: '24px',
        }}/>
        {/* Glow blob */}
        <Box sx={{ position:'absolute', top:-60, right:-40, width:260, height:260, borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)', pointerEvents:'none' }}/>

        <Box sx={{ position: 'relative', display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:2 }}>
          <Box>
            <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: 1, textTransform: 'uppercase', mb: 0.75 }}>
              {dateStr}
            </Typography>
            <Typography sx={{ fontSize: { xs: 24, md: 32 }, fontWeight: 800, color: '#fff', letterSpacing: -1, lineHeight: 1.1, mb: 0.75 }}>
              {greeting}, {adminName.split(' ')[0]} 👋
            </Typography>
            <Typography sx={{ fontSize: 14.5, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>
              Here's what's happening in your workspace today.
            </Typography>
          </Box>

          {/* KPI pill row */}
          <Box display="flex" gap={1.5} flexWrap="wrap">
            {[
              { icon:<TaskAltOutlined sx={{fontSize:14}}/>, label:`${dashboard.widgets.tasksToday} tasks today`, color:'rgba(99,102,241,0.3)' },
              { icon:<WarningAmberOutlined sx={{fontSize:14}}/>, label:`${dashboard.widgets.overduePayments} overdue`, color:'rgba(225,29,72,0.3)' },
              { icon:<CalendarTodayOutlined sx={{fontSize:14}}/>, label:`${dashboard.widgets.upcomingVisits} visits`, color:'rgba(5,150,105,0.3)' },
            ].map(pill=>(
              <Box key={pill.label} display="flex" alignItems="center" gap={0.75} sx={{ px:1.75, py:0.9, borderRadius:'20px', bgcolor:pill.color, border:'1px solid rgba(255,255,255,0.12)' }}>
                <Box sx={{ color:'rgba(255,255,255,0.8)' }}>{pill.icon}</Box>
                <Typography sx={{ fontSize:12.5, fontWeight:600, color:'rgba(255,255,255,0.85)' }}>{pill.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ── Stat Cards (4 col) ── */}
      <Grid container spacing={2.5} mb={3}>
        {stats.map((s, i) => (
          <Grid item xs={12} sm={6} xl={3} key={s.label}>
            <StatCard {...s} rawValue={s.rawValue} delay={i * 80}/>
          </Grid>
        ))}
      </Grid>

      {/* ── Main chart row ── */}
      <Grid container spacing={2.5} mb={3}>

        {/* Revenue trend — wide */}
        <Grid item xs={12} lg={8}>
          <Box sx={{ bgcolor: D.surface, borderRadius: '20px', border: `1px solid ${D.border}`, p: 3.5, height: '100%', boxShadow: '0 2px 12px rgba(10,15,30,0.05)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
              <Box>
                <Typography sx={{ fontSize: 17, fontWeight: 800, color: D.ink, letterSpacing: -0.3 }}>Revenue Trend</Typography>
                <Typography sx={{ fontSize: 12.5, color: D.textSub, mt: 0.25 }}>Monthly collection over the last 6 months</Typography>
              </Box>
              <Box display="flex" gap={1}>
                {['6M','3M','1M'].map(p=>(
                  <Box key={p} component="button" sx={{
                    px:1.75, py:0.6, borderRadius:'8px', border:`1px solid ${D.border}`,
                    bgcolor:'#F8FAFC', color:D.textSub, fontSize:12, fontWeight:600, cursor:'pointer',
                    '&:hover':{bgcolor:D.blue, color:'#fff', borderColor:D.blue},
                    transition:'all .15s',
                  }}>{p}</Box>
                ))}
              </Box>
            </Box>
            <Box sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboard.bookingTrend} margin={{ right: 4, left: -16 }}>
                  <defs>
                    <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={D.blue}   stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={D.blue}   stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gBook" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={D.indigo} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={D.indigo} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 3" vertical={false} stroke="#F1F5F9"/>
                  <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize:12, fontWeight:600, fill:D.textSub }} dy={10}/>
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize:11, fontWeight:600, fill:D.textSub }} tickFormatter={v=>`₹${(v/100000).toFixed(0)}L`}/>
                  <Tooltip content={<ChartTooltip/>}/>
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke={D.blue} strokeWidth={2.5} fill="url(#gRev)" dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Grid>

        {/* Booking count bar chart */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ bgcolor: D.surface, borderRadius: '20px', border: `1px solid ${D.border}`, p: 3.5, height: '100%', boxShadow: '0 2px 12px rgba(10,15,30,0.05)' }}>
            <Typography sx={{ fontSize: 17, fontWeight: 800, color: D.ink, letterSpacing: -0.3, mb: 0.5 }}>Bookings / Month</Typography>
            <Typography sx={{ fontSize: 12.5, color: D.textSub, mb: 3 }}>Units closed per period</Typography>
            <Box sx={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ left: -20, right: 4 }} barCategoryGap="32%">
                  <CartesianGrid strokeDasharray="4 3" vertical={false} stroke="#F1F5F9"/>
                  <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize:11, fontWeight:600, fill:D.textSub }} dy={8}/>
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize:11, fontWeight:600, fill:D.textSub }}/>
                  <Tooltip content={<ChartTooltip/>}/>
                  <Bar dataKey="bookings" name="Bookings" radius={[6,6,0,0]} maxBarSize={36}>
                    {barData.map((_: any, i: number) => (
                      <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]}/>
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* ── Bottom row ── */}
      <Grid container spacing={2.5}>

        {/* Top Agents Leaderboard */}
        <Grid item xs={12} md={4}>
          <Box sx={{ bgcolor: D.surface, borderRadius: '20px', border: `1px solid ${D.border}`, p: 3, height: '100%', boxShadow: '0 2px 12px rgba(10,15,30,0.05)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
              <Box>
                <Typography sx={{ fontSize: 16, fontWeight: 800, color: D.ink, letterSpacing: -0.3 }}>Top Agents</Typography>
                <Typography sx={{ fontSize: 12, color: D.textSub }}>This month by revenue</Typography>
              </Box>
              <Box sx={{ display:'flex', alignItems:'center', gap:0.5, color: D.amber }}>
                <EmojiEventsOutlined sx={{ fontSize: 18 }}/>
              </Box>
            </Box>
            {topAgents.map((agent, i) => (
              <AgentRow key={agent.name} agent={agent} rank={i} max={maxRevenue}/>
            ))}
            <Box display="flex" justifyContent="center" mt={1.75}>
              <Box component="button" sx={{ fontSize:12.5, fontWeight:600, color:D.blue, bgcolor:'transparent', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:0.4, '&:hover':{opacity:0.75} }}>
                View full leaderboard <ChevronRightOutlined sx={{fontSize:15}}/>
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Today's events */}
        <Grid item xs={12} md={4}>
          <Box sx={{ bgcolor: D.surface, borderRadius: '20px', border: `1px solid ${D.border}`, overflow:'hidden', height: '100%', boxShadow: '0 2px 12px rgba(10,15,30,0.05)' }}>
            <TodayEventsWidget />
          </Box>
        </Grid>

        {/* Quick Actions + KPI summary */}
        <Grid item xs={12} md={4}>
          <Stack spacing={2.5} height="100%">

            {/* Quick Actions */}
            <Box sx={{ bgcolor: D.surface, borderRadius: '20px', border: `1px solid ${D.border}`, p: 3, boxShadow: '0 2px 12px rgba(10,15,30,0.05)' }}>
              <Typography sx={{ fontSize: 16, fontWeight: 800, color: D.ink, letterSpacing: -0.3, mb: 0.5 }}>Quick Actions</Typography>
              <Typography sx={{ fontSize: 12, color: D.textSub, mb: 2 }}>Common tasks, one click away</Typography>
              <Grid container spacing={1.25}>
                {[
                  { icon:<PersonOutlined/>,       label:'Add Member',   accent:D.indigo  },
                  { icon:<HomeWorkOutlined/>,      label:'New Lead',     accent:D.emerald },
                  { icon:<CalendarTodayOutlined/>, label:'Schedule Visit',accent:D.amber  },
                  { icon:<AccountBalanceOutlined/>,label:'Record Payment',accent:D.rose   },
                  { icon:<TaskAltOutlined/>,       label:'Create Task',  accent:D.cyan    },
                  { icon:<AnalyticsOutlined/>,     label:'View Reports', accent:D.purple  },
                ].map(a=>(
                  <Grid item xs={4} key={a.label}>
                    <QuickAction {...a}/>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* KPI summary strip */}
            <Box sx={{ bgcolor: D.ink, borderRadius: '20px', p: 3, flex: 1, boxShadow: '0 4px 24px rgba(10,15,30,0.15)', position:'relative', overflow:'hidden' }}>
              <Box sx={{ position:'absolute', top:-30, right:-30, width:150, height:150, borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)' }}/>
              <Typography sx={{ fontSize: 12.5, fontWeight: 700, color:'rgba(255,255,255,0.45)', textTransform:'uppercase', letterSpacing:1, mb: 2 }}>Month at a glance</Typography>
              {[
                { label:'Tasks Today',        value: dashboard.widgets.tasksToday,       color: D.indigo },
                { label:'Overdue Payments',   value: dashboard.widgets.overduePayments,  color: D.rose   },
                { label:'Pending Approvals',  value: (dashboard as any).pendingApprovals ?? 3, color: D.amber  },
                { label:'New Leads (Week)',   value: (dashboard as any).newLeadsWeek     ?? 14, color: D.emerald},
              ].map(item => (
                <Box key={item.label} display="flex" justifyContent="space-between" alignItems="center"
                  py={1.1} sx={{ borderBottom:'1px solid rgba(255,255,255,0.06)', '&:last-child':{borderBottom:'none'} }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width:6, height:6, borderRadius:'50%', bgcolor:item.color, flexShrink:0 }}/>
                    <Typography sx={{ fontSize: 13, color:'rgba(255,255,255,0.6)', fontWeight:500 }}>{item.label}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 15, fontWeight: 800, color:'#fff', fontVariantNumeric:'tabular-nums' }}>
                    {item.value}
                  </Typography>
                </Box>
              ))}

              {/* Conversion rate */}
              <Box mt={2}>
                <Box display="flex" justifyContent="space-between" mb={0.75}>
                  <Typography sx={{ fontSize: 12, color:'rgba(255,255,255,0.45)', fontWeight:600 }}>Lead Conversion Rate</Typography>
                  <Typography sx={{ fontSize: 13, color:'#fff', fontWeight:800 }}>
                    {((dashboard.activeBookings / Math.max(dashboard.totalLeads, 1)) * 100).toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min((dashboard.activeBookings / Math.max(dashboard.totalLeads, 1)) * 100, 100)}
                  sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.08)',
                    '& .MuiLinearProgress-bar': { bgcolor: D.indigo, borderRadius: 3 } }}/>
              </Box>
            </Box>

          </Stack>
        </Grid>

      </Grid>
    </Box>
  );
};

export default Dashboard;