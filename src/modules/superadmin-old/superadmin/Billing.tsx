import React, { useEffect } from 'react';
import {
  Box, Typography, Grid, Card, Table, TableBody, TableCell,
  TableHead, TableRow, Chip, Button, Skeleton, Stack, Divider
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import {
  AttachMoneyOutlined, ReceiptOutlined, TrendingUpOutlined,
  MoneyOffOutlined, FileDownloadOutlined
} from '@mui/icons-material';
import { useAppDispatch, useSuperAdmin } from '../../../redux/hooks';
import { fetchBillingStatements, fetchRevenueOverview } from './superadminSlice';

// ─── Tokens ────────────────────────────────────────────────────────────────────
const FONT = "'Clash Display', 'Outfit', sans-serif";
const BODY = "'Cabinet Grotesk', 'DM Sans', sans-serif";
const BRAND = '#00d4aa';
const WARN = '#f59e0b';
const DANGER = '#ff4d6d';
const BRAND2 = '#7c6ff7';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR', notation: 'compact', maximumFractionDigits: 0 }).format(n);

// ─── Dark skeleton ─────────────────────────────────────────────────────────────
const DS: React.FC<{ h?: number; w?: string | number }> = ({ h = 20, w = '100%' }) => (
  <Box sx={{
    height: h, width: w, borderRadius: 1.5, bgcolor: '#1e2630',
    animation: 'pulse 1.5s ease-in-out infinite',
    '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.35 } }
  }} />
);

// ─── Stat tile ─────────────────────────────────────────────────────────────────
interface StatTileProps { label: string; value: React.ReactNode; sub?: string; color: string; icon: React.ReactNode; loading?: boolean }
const StatTile: React.FC<StatTileProps> = ({ label, value, sub, color, icon, loading }) => (
  <Card sx={{
    p: 3, borderRadius: 3, bgcolor: '#0d1117', boxShadow: 'none',
    border: `1px solid ${color}20`, position: 'relative', overflow: 'hidden',
    transition: 'all 0.2s',
    '&:hover': { borderColor: color + '50', transform: 'translateY(-2px)', boxShadow: `0 8px 28px ${color}14` }
  }}>
    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, bgcolor: color }} />
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
      <Box flex={1}>
        <Typography sx={{ fontFamily: BODY, fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: 1, mb: 0.8 }}>
          {label}
        </Typography>
        {loading ? <DS h={28} w={90} /> : (
          <Typography sx={{ fontFamily: FONT, fontSize: 28, fontWeight: 700, color, letterSpacing: -1.2, lineHeight: 1 }}>
            {value}
          </Typography>
        )}
        {sub && !loading && <Typography sx={{ fontFamily: BODY, fontSize: 11, color: '#4b5563', mt: 0.5 }}>{sub}</Typography>}
      </Box>
      <Box sx={{ width: 40, height: 40, borderRadius: 2.5, bgcolor: color + '14', display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
        {icon}
      </Box>
    </Stack>
  </Card>
);

// ─── Main ──────────────────────────────────────────────────────────────────────
const Billing: React.FC = () => {
  const dispatch = useAppDispatch();
  const { billingStatements, revenueOverview, loading } = useSuperAdmin();

  useEffect(() => {
    dispatch(fetchBillingStatements());
    dispatch(fetchRevenueOverview());
  }, [dispatch]);

  const stats = [
    { label: 'Current Month Revenue', value: fmt(Number(revenueOverview?.totalRevenue || 0)), sub: `${revenueOverview?.profitMargin ?? '—'} margin`, color: BRAND, icon: <AttachMoneyOutlined sx={{ fontSize: 18 }} /> },
    { label: 'Total Invoices', value: revenueOverview?.totalInvoices ?? 0, sub: 'In system', color: WARN, icon: <ReceiptOutlined sx={{ fontSize: 18 }} /> },
    { label: 'Total Profit', value: fmt(Number(revenueOverview?.totalProfit || 0)), sub: 'Net profit', color: '#34d399', icon: <TrendingUpOutlined sx={{ fontSize: 18 }} /> },
    { label: 'Total Cost', value: fmt(Number(revenueOverview?.totalCost || 0)), sub: 'System usage', color: DANGER, icon: <MoneyOffOutlined sx={{ fontSize: 18 }} /> },
  ];

  // Status config
  const stCfg = (s: string) => ({
    finalized: { color: BRAND, bg: BRAND + '14', dot: BRAND },
    pending: { color: WARN, bg: WARN + '14', dot: WARN },
    draft: { color: '#4b5563', bg: '#1e2630', dot: '#4b5563' },
  }[s] ?? { color: '#4b5563', bg: '#1e2630', dot: '#4b5563' });

  return (
    <Box sx={{ bgcolor: '#080b10', minHeight: '100vh', pb: 8, fontFamily: BODY }}>

      {/* ── Header ── */}
      <Box sx={{ px: { xs: 3, md: 5 }, pt: 5, pb: 4, borderBottom: '1px solid #1e2630', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: '50%', bgcolor: BRAND + '08', filter: 'blur(50px)', pointerEvents: 'none' }} />
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'flex-end' }} spacing={3} sx={{ position: 'relative' }}>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
              <Box sx={{ px: 1.5, py: 0.4, borderRadius: 1.5, bgcolor: BRAND + '18', border: `1px solid ${BRAND}30` }}>
                <Typography sx={{ fontFamily: BODY, fontSize: 10, fontWeight: 800, color: BRAND, textTransform: 'uppercase', letterSpacing: 1.2 }}>
                  Revenue Engine
                </Typography>
              </Box>
            </Stack>
            <Typography sx={{ fontFamily: FONT, fontSize: 36, fontWeight: 700, color: 'white', letterSpacing: -1.8, lineHeight: 1 }}>
              Billing
            </Typography>
            <Typography sx={{ fontFamily: BODY, fontSize: 13, color: '#4b5563', mt: 0.8 }}>
              Platform revenue and invoicing overview
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<FileDownloadOutlined />}
            sx={{ textTransform: 'none', fontWeight: 700, fontFamily: BODY, borderRadius: 2.5, border: '1px solid #1e2630', color: '#9ca3af', '&:hover': { bgcolor: '#1e2630', borderColor: BRAND, color: BRAND } }}
          >
            Export All
          </Button>
        </Stack>
      </Box>

      <Box sx={{ px: { xs: 3, md: 5 }, pt: 4 }}>

        {/* ── Stat tiles ── */}
        <Grid container spacing={2.5} mb={4}>
          {stats.map(s => (
            <Grid item xs={6} md={3} key={s.label}>
              <StatTile {...s} loading={loading.revenueOverview} />
            </Grid>
          ))}
        </Grid>

        {/* ── Revenue composition bar ── */}
        {revenueOverview && (
          <Card sx={{ p: 3, borderRadius: 3, bgcolor: '#0d1117', border: '1px solid #1e2630', boxShadow: 'none', mb: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography sx={{ fontFamily: BODY, fontWeight: 800, fontSize: 14, color: 'white' }}>Revenue Composition</Typography>
              <Typography sx={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: BRAND, letterSpacing: -0.5 }}>
                {fmt(Number(revenueOverview.totalRevenue || 0))} total
              </Typography>
            </Stack>
            <Stack direction="row" sx={{ height: 10, borderRadius: 5, overflow: 'hidden', gap: '2px' }}>
              {[
                { val: 78, color: BRAND },
                { val: 12, color: BRAND2 },
                { val: 6, color: '#60a5fa' },
                { val: 4, color: WARN },
              ].map((s, i) => (
                <Box key={i} sx={{ flex: s.val, bgcolor: s.color, transition: 'flex 0.5s ease', '&:hover': { opacity: 0.8 } }} />
              ))}
            </Stack>
            <Stack direction="row" spacing={3} mt={1.5} flexWrap="wrap">
              {[
                { label: 'Plans', color: BRAND },
                { label: 'Add-ons', color: BRAND2 },
                { label: 'AI Usage', color: '#60a5fa' },
                { label: 'Telephony', color: WARN },
              ].map(l => (
                <Stack key={l.label} direction="row" spacing={0.8} alignItems="center">
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: l.color }} />
                  <Typography sx={{ fontFamily: BODY, fontSize: 11.5, color: '#4b5563' }}>{l.label}</Typography>
                </Stack>
              ))}
            </Stack>
          </Card>
        )}

        {/* ── Statements Table ── */}
        <Card sx={{ borderRadius: 3, bgcolor: '#0d1117', border: '1px solid #1e2630', boxShadow: 'none', overflow: 'hidden' }}>

          {/* Table header */}
          <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #1e2630', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography sx={{ fontFamily: BODY, fontWeight: 800, fontSize: 14, color: 'white' }}>Monthly Statements</Typography>
              <Typography sx={{ fontFamily: BODY, fontSize: 11.5, color: '#4b5563', mt: 0.2 }}>
                {billingStatements.length} statement{billingStatements.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon sx={{ fontSize: 15 }} />}
              size="small"
              sx={{ textTransform: 'none', fontWeight: 700, fontFamily: BODY, borderRadius: 2, border: '1px solid #1e2630', color: '#9ca3af', fontSize: 12, '&:hover': { bgcolor: '#1e2630', borderColor: BRAND, color: BRAND } }}
            >
              Export All
            </Button>
          </Box>

          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#080b10' }}>
                {['Statement ID', 'Period', 'Active Tenants', 'Total Revenue', 'Status', 'Download'].map((h, i) => (
                  <TableCell
                    key={h}
                    align={i >= 2 && i <= 3 ? 'right' : i === 5 ? 'center' : 'left'}
                    sx={{ fontWeight: 800, fontSize: 10.5, color: '#4b5563', textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: BODY, py: 1.8, borderBottom: '1px solid #1e2630' }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading.billing
                ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} sx={{ '& td': { borderBottom: '1px solid #1e2630' } }}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j} sx={{ py: 2 }}><DS h={14} w={j === 0 ? 100 : j === 3 ? 70 : 60} /></TableCell>
                    ))}
                  </TableRow>
                ))
                : billingStatements.length === 0
                  ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ borderBottom: 'none' }}>
                        <Box py={8} textAlign="center">
                          <Typography sx={{ fontFamily: BODY, color: '#4b5563', fontWeight: 600 }}>No statements found</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )
                  : billingStatements.map(stmt => {
                    const sc = stCfg(stmt.status);
                    return (
                      <TableRow
                        key={stmt.id}
                        hover
                        sx={{ '& td': { py: 1.6, borderBottom: '1px solid #1e2630', fontFamily: BODY }, '&:hover': { bgcolor: '#111827' }, transition: 'background 0.12s' }}
                      >
                        <TableCell>
                          <Typography sx={{ fontFamily: 'monospace', fontSize: 12.5, color: BRAND, fontWeight: 600 }}>
                            {stmt.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontFamily: BODY, fontSize: 13, color: '#9ca3af' }}>{stmt.period}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography sx={{ fontFamily: BODY, fontSize: 13, fontWeight: 700, color: 'white' }}>{stmt.tenants}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography sx={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: BRAND, letterSpacing: -0.5 }}>
                            {fmt(stmt.revenue)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6, px: 1.2, py: 0.4, borderRadius: 1.5, bgcolor: sc.bg }}>
                            <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: sc.dot }} />
                            <Typography sx={{ fontFamily: BODY, fontSize: 10.5, fontWeight: 800, color: sc.color, textTransform: 'capitalize' }}>
                              {stmt.status}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            startIcon={<DownloadIcon sx={{ fontSize: 13 }} />}
                            sx={{ textTransform: 'none', fontWeight: 700, fontFamily: BODY, fontSize: 11.5, border: '1px solid #1e2630', borderRadius: 2, color: '#4b5563', '&:hover': { borderColor: BRAND, color: BRAND, bgcolor: BRAND + '10' } }}
                          >
                            PDF
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
            </TableBody>
          </Table>

          {/* Footer total */}
          {billingStatements.length > 0 && !loading.billing && (
            <Box sx={{ px: 3, py: 1.8, borderTop: '1px solid #1e2630', bgcolor: '#080b10', display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontFamily: BODY, fontSize: 11.5, color: '#4b5563' }}>
                {billingStatements.length} statements
              </Typography>
              <Typography sx={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: BRAND, letterSpacing: -0.3 }}>
                Total: {fmt(billingStatements.reduce((s, st) => s + st.revenue, 0))}
              </Typography>
            </Box>
          )}
        </Card>
      </Box>
    </Box>
  );
};

export default Billing;