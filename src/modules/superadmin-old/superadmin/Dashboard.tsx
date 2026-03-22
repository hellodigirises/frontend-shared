import React, { useState } from 'react';
import {
  Box, Typography, Stack, Grid, Card, Chip, Avatar,
  LinearProgress, Divider, Button, Tab, Tabs, IconButton, Tooltip
} from '@mui/material';
import {
  TrendingUpOutlined, TrendingDownOutlined, PeopleOutlined,
  AttachMoneyOutlined, StorageOutlined, PhoneOutlined,
  AutoAwesomeOutlined, RefreshOutlined, DownloadOutlined,
  CircleOutlined, ArrowForwardOutlined, WarningAmberOutlined
} from '@mui/icons-material';
import {
  MOCK_TENANTS, MOCK_INVOICES, MOCK_PLANS, ALL_MODULES,
  fmtINR, avatarBg, initials, SA_FONT, SA_BODY,
  BRAND, BRAND2, DANGER, WARN, STATUS_CFG, Tenant
} from './superadminTypes';

// ─── Sub-components ────────────────────────────────────────────────────────────

const KpiCard: React.FC<{
  label: string; value: string; sub?: string; color: string;
  icon: React.ReactNode; trend?: number; alert?: boolean;
}> = ({ label, value, sub, color, icon, trend, alert }) => (
  <Card sx={{
    p: 3, borderRadius: 3, bgcolor: '#0d1117',
    border: `1px solid ${alert ? DANGER + '40' : '#1e2630'}`,
    boxShadow: 'none', height: '100%', position: 'relative', overflow: 'hidden',
    transition: 'all 0.2s',
    '&:hover': { borderColor: color + '50', transform: 'translateY(-2px)', boxShadow: `0 8px 32px ${color}14` }
  }}>
    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, bgcolor: color }} />
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
      <Box>
        <Typography sx={{ fontFamily: SA_BODY, fontSize: 10.5, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: 1 }}>
          {label}
        </Typography>
        <Typography sx={{ fontFamily: SA_FONT, fontSize: 32, fontWeight: 700, color, letterSpacing: -1.5, lineHeight: 1, mt: 0.6 }}>
          {value}
        </Typography>
        {sub && <Typography sx={{ fontFamily: SA_BODY, fontSize: 11, color: '#4b5563', mt: 0.5 }}>{sub}</Typography>}
        {trend !== undefined && (
          <Stack direction="row" spacing={0.4} alignItems="center" mt={0.8}>
            {trend >= 0 ? <TrendingUpOutlined sx={{ fontSize: 12, color: BRAND }} /> : <TrendingDownOutlined sx={{ fontSize: 12, color: DANGER }} />}
            <Typography sx={{ fontFamily: SA_BODY, fontSize: 10.5, fontWeight: 700, color: trend >= 0 ? BRAND : DANGER }}>
              {Math.abs(trend)}% vs last month
            </Typography>
          </Stack>
        )}
      </Box>
      <Box sx={{ width: 40, height: 40, borderRadius: 2.5, bgcolor: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
        {icon}
      </Box>
    </Stack>
  </Card>
);

const MiniBar: React.FC<{ label: string; value: number; max: number; color: string }> = ({ label, value, max, color }) => (
  <Box mb={1.8}>
    <Stack direction="row" justifyContent="space-between" mb={0.5}>
      <Typography sx={{ fontFamily: SA_BODY, fontSize: 12, color: '#9ca3af' }}>{label}</Typography>
      <Typography sx={{ fontFamily: SA_FONT, fontSize: 14, fontWeight: 700, color, letterSpacing: -0.3 }}>{value}%</Typography>
    </Stack>
    <Box sx={{ height: 5, borderRadius: 3, bgcolor: '#1e2630', overflow: 'hidden' }}>
      <Box sx={{ height: '100%', width: `${value}%`, borderRadius: 3, bgcolor: color, transition: 'width 0.6s ease' }} />
    </Box>
  </Box>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
const SuperAdminDashboard: React.FC = () => {
  const [tab, setTab] = useState(0);

  const activeTenants    = MOCK_TENANTS.filter((t: Tenant) => t.status === 'Active').length;
  const suspendedTenants = MOCK_TENANTS.filter((t: Tenant) => t.status === 'Suspended').length;
  const trialTenants     = MOCK_TENANTS.filter((t: Tenant) => t.status === 'Trial').length;
  const totalMRR         = MOCK_TENANTS.reduce((s: number, t: Tenant) => s + t.mrr, 0);
  const totalARR         = MOCK_TENANTS.reduce((s: number, t: Tenant) => s + t.arr, 0);
  const totalAICredits   = MOCK_TENANTS.reduce((s: number, t: Tenant) => s + t.aiCreditsUsed, 0);
  const totalCallMins    = MOCK_TENANTS.reduce((s: number, t: Tenant) => s + t.callMinutes, 0);
  const totalUsers       = MOCK_TENANTS.reduce((s: number, t: Tenant) => s + t.usersUsed, 0);

  const topTenants = [...MOCK_TENANTS].sort((a: Tenant, b: Tenant) => b.mrr - a.mrr).slice(0, 5);

  const moduleAdoption = ALL_MODULES.map((m: string) => ({
    module: m,
    pct: Math.round((MOCK_TENANTS.filter((t: Tenant) => t.modules.includes(m)).length / MOCK_TENANTS.length) * 100),
  })).sort((a: any, b: any) => b.pct - a.pct);

  const revenueMonths = [
    { month: 'Jan', mrr: 98000 }, { month: 'Feb', mrr: 112000 }, { month: 'Mar', mrr: 128000 },
    { month: 'Apr', mrr: 135000 }, { month: 'May', mrr: 148000 }, { month: 'Jun', mrr: totalMRR },
  ];
  const maxMRR = Math.max(...revenueMonths.map(m => m.mrr));

  return (
    <Box sx={{ bgcolor: '#080b10', minHeight: '100vh', pb: 8, fontFamily: SA_BODY }}>

      {/* ── HEADER ── */}
      <Box sx={{ px: { xs: 3, md: 5 }, pt: 5, pb: 4, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', bgcolor: BRAND + '08', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', top: -60, left: '40%', width: 300, height: 300, borderRadius: '50%', bgcolor: BRAND2 + '06', filter: 'blur(50px)', pointerEvents: 'none' }} />
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'flex-end' }} spacing={3} sx={{ position: 'relative' }}>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
              <Box sx={{ px: 1.5, py: 0.4, borderRadius: 1.5, bgcolor: BRAND + '18', border: `1px solid ${BRAND}30` }}>
                <Typography sx={{ fontFamily: SA_BODY, fontSize: 10, fontWeight: 800, color: BRAND, textTransform: 'uppercase', letterSpacing: 1.2 }}>
                  SuperAdmin · Platform Control
                </Typography>
              </Box>
            </Stack>
            <Typography sx={{ fontFamily: SA_FONT, fontSize: 38, fontWeight: 700, color: 'white', letterSpacing: -2, lineHeight: 0.95 }}>
              Global Dashboard
            </Typography>
            <Typography sx={{ fontFamily: SA_BODY, fontSize: 13, color: '#4b5563', mt: 1.2 }}>
              {MOCK_TENANTS.length} tenants · {totalUsers} active users · Platform health: <Box component="span" sx={{ color: BRAND, fontWeight: 700 }}>Operational</Box>
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Tooltip title="Refresh"><IconButton sx={{ border: '1px solid #1e2630', borderRadius: 2, color: '#4b5563', '&:hover': { color: BRAND, borderColor: BRAND } }}><RefreshOutlined fontSize="small" /></IconButton></Tooltip>
            <Button startIcon={<DownloadOutlined />}
              sx={{ textTransform: 'none', fontWeight: 700, fontFamily: SA_BODY, borderRadius: 2.5, border: '1px solid #1e2630', color: '#9ca3af', '&:hover': { bgcolor: '#1e2630', color: 'white' } }}>
              Export Report
            </Button>
          </Stack>
        </Stack>

        {/* KPI Grid */}
        <Grid container spacing={2} mt={2}>
          {[
            { label: 'Total Tenants',   value: MOCK_TENANTS.length.toString(), sub: `${activeTenants} active · ${trialTenants} trial`, color: BRAND, icon: <PeopleOutlined />, trend: 8 },
            { label: 'Monthly Revenue', value: fmtINR(totalMRR), sub: 'MRR across all plans', color: '#34d399', icon: <AttachMoneyOutlined />, trend: 12 },
            { label: 'ARR',             value: fmtINR(totalARR), sub: 'Annualised run rate', color: BRAND2, icon: <TrendingUpOutlined />, trend: 15 },
            { label: 'Suspended',       value: suspendedTenants.toString(), sub: `${MOCK_TENANTS.length - activeTenants - trialTenants} need attention`, color: DANGER, icon: <WarningAmberOutlined />, alert: true },
            { label: 'Active Users',    value: totalUsers.toString(), sub: 'Across all tenants', color: '#60a5fa', icon: <PeopleOutlined />, trend: 5 },
            { label: 'AI Credits Used', value: totalAICredits.toLocaleString(), sub: 'Total this month', color: BRAND2, icon: <AutoAwesomeOutlined /> },
            { label: 'Call Minutes',    value: totalCallMins.toLocaleString(), sub: 'Telephony usage', color: WARN, icon: <PhoneOutlined /> },
            { label: 'Storage',         value: '48.2 GB', sub: '62% of capacity', color: '#94a3b8', icon: <StorageOutlined /> },
          ].map(k => (
            <Grid item xs={6} sm={4} md={3} key={k.label}>
              <KpiCard {...k} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ── CONTENT TABS ── */}
      <Box sx={{ px: { xs: 3, md: 5 } }}>
        <Box sx={{ borderBottom: '1px solid #1e2630', mb: 3 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}
            sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontFamily: SA_BODY, fontSize: 13, color: '#4b5563', minHeight: 44 }, '& .MuiTabs-indicator': { bgcolor: BRAND, height: 2.5, borderRadius: 2 }, '& .Mui-selected': { color: `${BRAND} !important` } }}>
            <Tab label="Revenue" />
            <Tab label="Top Tenants" />
            <Tab label="Module Adoption" />
          </Tabs>
        </Box>

        {/* Revenue chart */}
        {tab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card sx={{ p: 3, borderRadius: 3, bgcolor: '#0d1117', border: '1px solid #1e2630', boxShadow: 'none' }}>
                <Stack direction="row" justifyContent="space-between" mb={3}>
                  <Box>
                    <Typography sx={{ fontFamily: SA_BODY, fontWeight: 800, fontSize: 14, color: 'white' }}>MRR Growth</Typography>
                    <Typography sx={{ fontFamily: SA_BODY, fontSize: 11.5, color: '#4b5563' }}>Jan – Jun 2025</Typography>
                  </Box>
                  <Chip label={`↑ 12% this month`} size="small" sx={{ bgcolor: BRAND + '18', color: BRAND, fontWeight: 800, fontSize: 10.5, fontFamily: SA_BODY }} />
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="flex-end" sx={{ height: 160 }}>
                  {revenueMonths.map((m, i) => {
                    const h = Math.round((m.mrr / maxMRR) * 140);
                    const isLast = i === revenueMonths.length - 1;
                    return (
                      <Box key={m.month} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.8 }}>
                        <Typography sx={{ fontFamily: SA_FONT, fontSize: 11, color: isLast ? BRAND : '#4b5563', fontWeight: isLast ? 900 : 500 }}>
                          {fmtINR(m.mrr)}
                        </Typography>
                        <Box sx={{
                          width: '100%', height: h, borderRadius: '4px 4px 0 0',
                          bgcolor: isLast ? BRAND : '#1e2630',
                          border: `1px solid ${isLast ? BRAND : '#2d3748'}`,
                          transition: 'all 0.3s ease',
                          '&:hover': { bgcolor: BRAND + '80' }
                        }} />
                        <Typography sx={{ fontFamily: SA_BODY, fontSize: 11, color: '#4b5563', fontWeight: 600 }}>{m.month}</Typography>
                      </Box>
                    );
                  })}
                </Stack>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, borderRadius: 3, bgcolor: '#0d1117', border: '1px solid #1e2630', boxShadow: 'none', height: '100%' }}>
                <Typography sx={{ fontFamily: SA_BODY, fontWeight: 800, fontSize: 14, color: 'white', mb: 2.5 }}>Revenue Breakdown</Typography>
                {[
                  { label: 'Plan Revenue',      value: fmtINR(totalMRR * 0.78), color: BRAND },
                  { label: 'Add-on Revenue',    value: fmtINR(totalMRR * 0.12), color: BRAND2 },
                  { label: 'AI Usage Revenue',  value: fmtINR(totalMRR * 0.06), color: '#60a5fa' },
                  { label: 'Telephony Revenue', value: fmtINR(totalMRR * 0.04), color: WARN },
                ].map(r => (
                  <Stack key={r.label} direction="row" justifyContent="space-between" py={1.2} sx={{ borderBottom: '1px solid #1e2630' }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: r.color }} />
                      <Typography sx={{ fontFamily: SA_BODY, fontSize: 12.5, color: '#9ca3af' }}>{r.label}</Typography>
                    </Stack>
                    <Typography sx={{ fontFamily: SA_FONT, fontSize: 15, fontWeight: 700, color: r.color, letterSpacing: -0.5 }}>{r.value}</Typography>
                  </Stack>
                ))}
                <Stack direction="row" justifyContent="space-between" pt={1.5} mt={0.5}>
                  <Typography sx={{ fontFamily: SA_BODY, fontWeight: 800, fontSize: 13, color: 'white' }}>Total MRR</Typography>
                  <Typography sx={{ fontFamily: SA_FONT, fontSize: 20, fontWeight: 700, color: BRAND, letterSpacing: -0.8 }}>{fmtINR(totalMRR)}</Typography>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Top Tenants */}
        {tab === 1 && (
          <Card sx={{ borderRadius: 3, bgcolor: '#0d1117', border: '1px solid #1e2630', boxShadow: 'none', overflow: 'hidden' }}>
            <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #1e2630' }}>
              <Typography sx={{ fontFamily: SA_BODY, fontWeight: 800, fontSize: 14, color: 'white' }}>Top Tenants by Revenue</Typography>
            </Box>
            <Stack>
              {topTenants.map((t, i) => {
                const sc = STATUS_CFG[t.status];
                return (
                  <Stack key={t.id} direction="row" spacing={2} alignItems="center" sx={{ px: 3, py: 2, borderBottom: '1px solid #0d1117', bgcolor: '#0d1117', '&:hover': { bgcolor: '#111827' }, transition: 'all 0.15s' }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: 2, bgcolor: i === 0 ? BRAND + '20' : '#1e2630', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Typography sx={{ fontFamily: SA_BODY, fontWeight: 900, fontSize: 12, color: i === 0 ? BRAND : '#4b5563' }}>#{i + 1}</Typography>
                    </Box>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: avatarBg(t.name), fontWeight: 800, fontSize: 12, flexShrink: 0 }}>{initials(t.name)}</Avatar>
                    <Box flex={1}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography sx={{ fontFamily: SA_BODY, fontWeight: 800, fontSize: 13, color: 'white' }}>{t.name}</Typography>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.2, borderRadius: 1, bgcolor: sc.bg }}>
                          <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: sc.dot }} />
                          <Typography sx={{ fontFamily: SA_BODY, fontSize: 9.5, fontWeight: 800, color: sc.color }}>{t.status}</Typography>
                        </Box>
                      </Stack>
                      <Typography sx={{ fontFamily: SA_BODY, fontSize: 11.5, color: '#4b5563' }}>{t.plan} · {t.city} · {t.usersUsed} users</Typography>
                    </Box>
                    <Typography sx={{ fontFamily: SA_FONT, fontSize: 18, fontWeight: 700, color: BRAND, letterSpacing: -0.5 }}>{fmtINR(t.mrr)}<Typography component="span" sx={{ fontFamily: SA_BODY, fontSize: 10, color: '#4b5563', fontWeight: 500 }}>/mo</Typography></Typography>
                  </Stack>
                );
              })}
            </Stack>
          </Card>
        )}

        {/* Module Adoption */}
        {tab === 2 && (
          <Card sx={{ p: 3, borderRadius: 3, bgcolor: '#0d1117', border: '1px solid #1e2630', boxShadow: 'none' }}>
            <Typography sx={{ fontFamily: SA_BODY, fontWeight: 800, fontSize: 14, color: 'white', mb: 3 }}>Module Adoption Across Tenants</Typography>
            <Grid container spacing={3}>
              {moduleAdoption.map((m: any, i: number) => (
                <Grid item xs={12} sm={6} md={4} key={m.module}>
                  <MiniBar label={m.module} value={m.pct} max={100} color={i < 3 ? BRAND : i < 6 ? BRAND2 : '#4b5563'} />
                </Grid>
              ))}
            </Grid>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default SuperAdminDashboard;