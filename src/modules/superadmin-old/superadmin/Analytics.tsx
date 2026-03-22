import React, { useEffect } from 'react';
import { Box, Typography, Grid, Skeleton, Stack, Card, Chip } from '@mui/material';
import { TrendingUpOutlined, AutoAwesomeOutlined, AttachMoneyOutlined, BarChartOutlined } from '@mui/icons-material';
import { useAppDispatch, useSuperAdmin } from '../../../redux/hooks';
import { fetchAnalytics, fetchRevenueOverview } from './superadminSlice';
import RevenueCards from '../components/RevenueCards';
import RevenueChart from '../components/RevenueChart';
import ProfitChart from '../components/ProfitChart';
import UsageChart from '../components/UsageChart';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const FONT = "'Clash Display', 'Outfit', sans-serif";
const BODY = "'Cabinet Grotesk', 'DM Sans', sans-serif";
const BRAND = '#00d4aa';
const BRAND2 = '#7c6ff7';

// ─── Skeleton placeholder ──────────────────────────────────────────────────────
const DarkSkeleton: React.FC<{ height?: number; width?: string | number; borderRadius?: number }> = ({
  height = 40, width = '100%', borderRadius = 2
}) => (
  <Box sx={{
    height, width, borderRadius, bgcolor: '#1e2630', animation: 'pulse 1.5s ease-in-out infinite',
    '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } }
  }} />
);

// ─── Stat accent card ─────────────────────────────────────────────────────────
const AccentCard: React.FC<{ label: string; value?: string; color: string; icon: React.ReactNode; loading?: boolean }> = ({
  label, value, color, icon, loading
}) => (
  <Card sx={{
    p: 2.5, borderRadius: 3, bgcolor: '#0d1117', border: `1px solid ${color}20`, boxShadow: 'none',
    position: 'relative', overflow: 'hidden', transition: 'all 0.2s',
    '&:hover': { borderColor: color + '50', transform: 'translateY(-2px)', boxShadow: `0 8px 24px ${color}12` }
  }}>
    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, bgcolor: color }} />
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
      <Box>
        <Typography sx={{ fontFamily: BODY, fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: 1 }}>
          {label}
        </Typography>
        {loading ? (
          <Box sx={{ mt: 0.8 }}><DarkSkeleton height={28} width={80} /></Box>
        ) : (
          <Typography sx={{ fontFamily: FONT, fontSize: 26, fontWeight: 700, color, letterSpacing: -1.2, lineHeight: 1, mt: 0.5 }}>
            {value ?? '—'}
          </Typography>
        )}
      </Box>
      <Box sx={{ width: 38, height: 38, borderRadius: 2.5, bgcolor: color + '14', display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
        {icon}
      </Box>
    </Stack>
  </Card>
);

// ─── Chart wrapper with dark frame ────────────────────────────────────────────
const ChartFrame: React.FC<{ title: string; subtitle?: string; children: React.ReactNode; loading?: boolean }> = ({
  title, subtitle, children, loading
}) => (
  <Card sx={{ borderRadius: 3, bgcolor: '#0d1117', border: '1px solid #1e2630', boxShadow: 'none', overflow: 'hidden' }}>
    <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #1e2630', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Box>
        <Typography sx={{ fontFamily: BODY, fontWeight: 800, fontSize: 14, color: 'white' }}>{title}</Typography>
        {subtitle && <Typography sx={{ fontFamily: BODY, fontSize: 11.5, color: '#4b5563', mt: 0.2 }}>{subtitle}</Typography>}
      </Box>
      <Chip
        label="Live"
        size="small"
        sx={{
          bgcolor: BRAND + '18', color: BRAND, fontWeight: 800, fontSize: 10, fontFamily: BODY,
          '&::before': { content: '"●"', mr: 0.5 }
        }}
      />
    </Box>
    <Box sx={{ p: 3 }}>
      {loading ? (
        <Stack spacing={1.5}>
          <DarkSkeleton height={180} />
          <Stack direction="row" spacing={1.5}>
            <DarkSkeleton height={12} width="20%" />
            <DarkSkeleton height={12} width="15%" />
            <DarkSkeleton height={12} width="18%" />
          </Stack>
        </Stack>
      ) : children}
    </Box>
  </Card>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const Analytics: React.FC = () => {
  const dispatch = useAppDispatch();
  const { revenueOverview, analyticsData, loading } = useSuperAdmin();

  useEffect(() => {
    dispatch(fetchRevenueOverview());
    dispatch(fetchAnalytics());
  }, [dispatch]);

  return (
    <Box sx={{ bgcolor: '#080b10', minHeight: '100vh', pb: 8, fontFamily: BODY }}>

      {/* ── Header ── */}
      <Box sx={{ px: { xs: 3, md: 5 }, pt: 5, pb: 4, borderBottom: '1px solid #1e2630', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', bgcolor: BRAND + '07', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -40, left: '30%', width: 240, height: 240, borderRadius: '50%', bgcolor: BRAND2 + '05', filter: 'blur(50px)', pointerEvents: 'none' }} />

        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'flex-end' }} spacing={2} sx={{ position: 'relative' }}>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
              <Box sx={{ px: 1.5, py: 0.4, borderRadius: 1.5, bgcolor: BRAND2 + '18', border: `1px solid ${BRAND2}30` }}>
                <Typography sx={{ fontFamily: BODY, fontSize: 10, fontWeight: 800, color: BRAND2, textTransform: 'uppercase', letterSpacing: 1.2 }}>
                  Platform Analytics
                </Typography>
              </Box>
            </Stack>
            <Typography sx={{ fontFamily: FONT, fontSize: 36, fontWeight: 700, color: 'white', letterSpacing: -1.8, lineHeight: 1 }}>
              Analytics
            </Typography>
            <Typography sx={{ fontFamily: BODY, fontSize: 13, color: '#4b5563', mt: 0.8 }}>
              Platform-wide metrics, revenue trends and usage insights
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            {['7D', '30D', '90D', 'YTD'].map(p => (
              <Box key={p} sx={{ px: 2, py: 0.8, borderRadius: 2, border: '1px solid #1e2630', cursor: 'pointer', bgcolor: p === '30D' ? BRAND + '18' : 'transparent', transition: 'all 0.15s', '&:hover': { borderColor: BRAND + '40' } }}>
                <Typography sx={{ fontFamily: BODY, fontSize: 12, fontWeight: 800, color: p === '30D' ? BRAND : '#4b5563' }}>{p}</Typography>
              </Box>
            ))}
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ px: { xs: 3, md: 5 }, pt: 4 }}>

        {/* ── Quick accent tiles ── */}
        <Grid container spacing={2} mb={4}>
          {[
            { label: 'Total Revenue', color: BRAND, icon: <AttachMoneyOutlined sx={{ fontSize: 18 }} />, value: revenueOverview?.totalRevenue ? `₹${Number(revenueOverview.totalRevenue).toLocaleString('en-IN')}` : undefined },
            { label: 'Total Profit', color: '#34d399', icon: <TrendingUpOutlined sx={{ fontSize: 18 }} />, value: revenueOverview?.totalProfit ? `₹${Number(revenueOverview.totalProfit).toLocaleString('en-IN')}` : undefined },
            { label: 'Profit Margin', color: BRAND2, icon: <BarChartOutlined sx={{ fontSize: 18 }} />, value: revenueOverview?.profitMargin },
            { label: 'Total Invoices', color: '#f59e0b', icon: <AutoAwesomeOutlined sx={{ fontSize: 18 }} />, value: revenueOverview?.totalInvoices?.toString() },
          ].map(c => (
            <Grid item xs={6} sm={3} key={c.label}>
              <AccentCard {...c} loading={loading.revenueOverview} />
            </Grid>
          ))}
        </Grid>

        {/* ── RevenueCards component (your existing) ── */}
        <Box sx={{
          '& .MuiCard-root, & [class*="MuiCard"]': { bgcolor: '#0d1117 !important', border: '1px solid #1e2630 !important', boxShadow: 'none !important', borderRadius: '12px !important' },
          '& .MuiTypography-root': { color: 'inherit' },
          mb: 3
        }}>
          <RevenueCards data={revenueOverview} loading={loading.revenueOverview} />
        </Box>

        {/* ── Charts ── */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ChartFrame title="Revenue Trend" subtitle="Monthly platform revenue breakdown" loading={loading.analytics}>
              <RevenueChart data={analyticsData?.revenueTrend} loading={loading.analytics} />
            </ChartFrame>
          </Grid>
          <Grid item xs={12} md={8}>
            <ChartFrame title="Usage Metrics" subtitle="API calls, AI credits, telephony minutes" loading={loading.analytics}>
              <UsageChart data={analyticsData?.usageMetrics} loading={loading.analytics} />
            </ChartFrame>
          </Grid>
          <Grid item xs={12} md={4}>
            <ChartFrame title="Revenue by Plan" subtitle="Plan contribution breakdown" loading={loading.analytics}>
              <ProfitChart data={analyticsData?.revenueByPlan} loading={loading.analytics} />
            </ChartFrame>
          </Grid>
        </Grid>

      </Box>
    </Box>
  );
};

export default Analytics;