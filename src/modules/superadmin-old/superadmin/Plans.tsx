import React, { useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Chip, Button,
  Table, TableBody, TableCell, TableHead, TableRow, LinearProgress,
  Skeleton, Stack, Divider
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { useAppDispatch, useSuperAdmin } from '../../../redux/hooks';
import { fetchPlans } from './superadminSlice';

// ─── Tokens ────────────────────────────────────────────────────────────────────
const FONT = "'Clash Display', 'Outfit', sans-serif";
const BODY = "'Cabinet Grotesk', 'DM Sans', sans-serif";
const BRAND = '#00d4aa';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 0 }).format(n);

// ─── Dark Skeleton ─────────────────────────────────────────────────────────────
const DS: React.FC<{ h?: number; w?: string | number; br?: number }> = ({ h = 20, w = '100%', br = 1.5 }) => (
  <Box sx={{
    height: h, width: w, borderRadius: br, bgcolor: '#1e2630',
    animation: 'pulse 1.5s ease-in-out infinite',
    '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.35 } }
  }} />
);

// ─── Limit row ─────────────────────────────────────────────────────────────────
const LimitRow: React.FC<{ label: string; value: React.ReactNode; color: string }> = ({ label, value, color }) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center" py={0.7} sx={{ borderBottom: '1px solid #1e2630' }}>
    <Typography sx={{ fontFamily: BODY, fontSize: 11.5, color: '#4b5563' }}>{label}</Typography>
    <Typography sx={{ fontFamily: BODY, fontSize: 12, fontWeight: 800, color }}>{value}</Typography>
  </Stack>
);

// ─── Plan Card ─────────────────────────────────────────────────────────────────
const PlanCard: React.FC<{ plan: any }> = ({ plan }) => (
  <Card sx={{
    borderRadius: 4, bgcolor: '#0d1117', overflow: 'hidden',
    border: `1px solid ${plan.popular ? plan.color : '#1e2630'}`,
    boxShadow: plan.popular ? `0 0 0 1px ${plan.color}30, 0 12px 40px ${plan.color}14` : 'none',
    position: 'relative', transition: 'all 0.2s',
    '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 16px 48px ${plan.color}18`, borderColor: plan.color + '60' }
  }}>
    {/* Top accent bar */}
    <Box sx={{ height: 3, bgcolor: plan.color }} />
    {plan.popular && (
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <Box sx={{ px: 1.2, py: 0.3, borderRadius: 1.5, bgcolor: plan.color + '25', border: `1px solid ${plan.color}50` }}>
          <Typography sx={{ fontFamily: BODY, fontSize: 9, fontWeight: 800, color: plan.color, textTransform: 'uppercase', letterSpacing: 1 }}>Popular</Typography>
        </Box>
      </Box>
    )}
    <CardContent sx={{ p: 3 }}>
      {/* Plan name + edit */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography sx={{ fontFamily: BODY, fontSize: 10, fontWeight: 800, color: '#4b5563', textTransform: 'uppercase', letterSpacing: 1 }}>
            Plan
          </Typography>
          <Typography sx={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, color: 'white', letterSpacing: -0.8, mt: 0.2 }}>
            {plan.displayName}
          </Typography>
        </Box>
        <Button
          size="small"
          startIcon={<EditIcon sx={{ fontSize: 13 }} />}
          sx={{ textTransform: 'none', fontWeight: 700, fontFamily: BODY, fontSize: 11.5, border: `1px solid ${plan.color}40`, borderRadius: 2, color: plan.color, '&:hover': { bgcolor: plan.color + '14' } }}
        >
          Edit
        </Button>
      </Stack>

      {/* Price */}
      <Stack direction="row" alignItems="flex-end" spacing={0.5} mb={0.5}>
        <Typography sx={{ fontFamily: FONT, fontSize: 36, fontWeight: 700, color: plan.color, letterSpacing: -2, lineHeight: 1 }}>
          {plan.price === 0 ? 'Custom' : `$${plan.price}`}
        </Typography>
        {plan.price > 0 && (
          <Typography sx={{ fontFamily: BODY, fontSize: 12, color: '#4b5563', fontWeight: 500, mb: 0.5 }}>/mo</Typography>
        )}
      </Stack>

      {/* Tenant count */}
      <Stack direction="row" spacing={0.8} alignItems="center" mb={2.5}>
        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: plan.color }} />
        <Typography sx={{ fontFamily: BODY, fontSize: 11.5, color: '#4b5563' }}>
          <Box component="span" sx={{ color: plan.color, fontWeight: 800 }}>{plan.tenantsCount}</Box> tenants active
        </Typography>
      </Stack>

      <Divider sx={{ borderColor: '#1e2630', mb: 2.5 }} />

      {/* Features */}
      <Stack spacing={1} mb={2.5}>
        {plan.features?.map((f: string) => (
          <Stack key={f} direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: plan.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckIcon sx={{ fontSize: 11, color: plan.color }} />
            </Box>
            <Typography sx={{ fontFamily: BODY, fontSize: 12.5, color: '#9ca3af' }}>{f}</Typography>
          </Stack>
        ))}
      </Stack>

      {/* Limits */}
      <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: '#080b10', border: '1px solid #1e2630' }}>
        <Typography sx={{ fontFamily: BODY, fontSize: 10, fontWeight: 800, color: '#4b5563', textTransform: 'uppercase', letterSpacing: 0.8, mb: 1 }}>
          Limits
        </Typography>
        {[
          { k: 'Seats', v: plan.seats === -1 ? 'Unlimited' : plan.seats },
          { k: 'AI Agents', v: plan.aiAgents === -1 ? 'Unlimited' : plan.aiAgents },
          { k: 'Telephony', v: plan.telephonyMinutes === -1 ? 'Unlimited' : `${plan.telephonyMinutes?.toLocaleString()} min` },
          { k: 'Storage', v: plan.storageGB === -1 ? 'Unlimited' : `${plan.storageGB} GB` },
        ].map(row => (
          <LimitRow key={row.k} label={row.k} value={row.v} color={row.v === 'Unlimited' ? plan.color : '#9ca3af'} />
        ))}
      </Box>
    </CardContent>
  </Card>
);

// ─── Main ──────────────────────────────────────────────────────────────────────
const Plans: React.FC = () => {
  const dispatch = useAppDispatch();
  const { plans, loading } = useSuperAdmin();

  useEffect(() => { dispatch(fetchPlans()); }, [dispatch]);

  const totalMRR = plans.reduce((sum, p) => sum + p.mrr, 0);

  return (
    <Box sx={{ bgcolor: '#080b10', minHeight: '100vh', pb: 8, fontFamily: BODY }}>

      {/* ── Header ── */}
      <Box sx={{ px: { xs: 3, md: 5 }, pt: 5, pb: 4, borderBottom: '1px solid #1e2630', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', bgcolor: '#7c6ff708', filter: 'blur(50px)', pointerEvents: 'none' }} />
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'flex-end' }} spacing={3} sx={{ position: 'relative' }}>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
              <Box sx={{ px: 1.5, py: 0.4, borderRadius: 1.5, bgcolor: '#7c6ff718', border: '1px solid #7c6ff730' }}>
                <Typography sx={{ fontFamily: BODY, fontSize: 10, fontWeight: 800, color: '#7c6ff7', textTransform: 'uppercase', letterSpacing: 1.2 }}>
                  Subscription Tiers
                </Typography>
              </Box>
            </Stack>
            <Typography sx={{ fontFamily: FONT, fontSize: 36, fontWeight: 700, color: 'white', letterSpacing: -1.8, lineHeight: 1 }}>
              Plans
            </Typography>
            <Typography sx={{ fontFamily: BODY, fontSize: 13, color: '#4b5563', mt: 0.8 }}>
              Manage subscription plans and pricing tiers
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ textTransform: 'none', fontWeight: 800, fontFamily: BODY, borderRadius: 2.5, bgcolor: BRAND, color: '#080b10', '&:hover': { filter: 'brightness(0.9)' }, boxShadow: `0 4px 14px ${BRAND}30` }}
          >
            New Plan
          </Button>
        </Stack>
      </Box>

      <Box sx={{ px: { xs: 3, md: 5 }, pt: 4 }}>

        {/* ── Plan Cards ── */}
        <Grid container spacing={2.5} mb={5}>
          {loading.plans
            ? Array.from({ length: 4 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Card sx={{ borderRadius: 4, bgcolor: '#0d1117', border: '1px solid #1e2630', boxShadow: 'none', p: 3 }}>
                  <Stack spacing={1.5}>
                    <DS h={12} w="40%" /><DS h={32} w="70%" /><DS h={10} w="50%" />
                    <Divider sx={{ borderColor: '#1e2630' }} />
                    {Array.from({ length: 4 }).map((_, j) => <DS key={j} h={12} />)}
                    <DS h={80} br={2} />
                  </Stack>
                </Card>
              </Grid>
            ))
            : plans.map(plan => (
              <Grid item xs={12} sm={6} md={3} key={plan.id}>
                <PlanCard plan={plan} />
              </Grid>
            ))}
        </Grid>

        {/* ── Revenue Breakdown Table ── */}
        <Typography sx={{ fontFamily: BODY, fontWeight: 800, fontSize: 14, color: 'white', mb: 2 }}>
          Revenue by Plan
        </Typography>
        <Card sx={{ borderRadius: 3, bgcolor: '#0d1117', border: '1px solid #1e2630', boxShadow: 'none', overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#080b10' }}>
                {['Plan', 'Tenants', 'MRR', 'Share of Total'].map((h, i) => (
                  <TableCell key={h} align={i >= 1 && i <= 2 ? 'right' : 'left'}
                    sx={{ fontWeight: 800, fontSize: 10.5, color: '#4b5563', textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: BODY, py: 1.8, borderBottom: '1px solid #1e2630' }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading.plans
                ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i} sx={{ '& td': { borderBottom: '1px solid #1e2630' } }}>
                    {[140, 40, 60, 200].map((w, j) => (
                      <TableCell key={j} sx={{ py: 2 }}><DS h={14} w={w} /></TableCell>
                    ))}
                  </TableRow>
                ))
                : plans.map(plan => {
                  const pct = totalMRR > 0 ? (plan.mrr / totalMRR) * 100 : 0;
                  return (
                    <TableRow key={plan.id} hover sx={{ '& td': { py: 1.8, borderBottom: '1px solid #1e2630', fontFamily: BODY }, '&:hover': { bgcolor: '#111827' }, transition: 'background 0.12s' }}>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: plan.color, flexShrink: 0 }} />
                          <Typography sx={{ fontWeight: 800, fontSize: 13.5, color: 'white', fontFamily: BODY }}>{plan.displayName}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Typography sx={{ fontFamily: FONT, fontSize: 18, fontWeight: 700, color: plan.color, letterSpacing: -0.5 }}>{plan.tenantsCount}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography sx={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: BRAND, letterSpacing: -0.5 }}>{fmt(plan.mrr)}</Typography>
                      </TableCell>
                      <TableCell sx={{ minWidth: 200 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box flex={1} sx={{ height: 7, borderRadius: 3.5, bgcolor: '#1e2630', overflow: 'hidden' }}>
                            <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: plan.color, borderRadius: 3.5, transition: 'width 0.5s ease' }} />
                          </Box>
                          <Typography sx={{ fontFamily: BODY, fontSize: 12, fontWeight: 800, color: plan.color, minWidth: 36 }}>
                            {pct.toFixed(0)}%
                          </Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
          {!loading.plans && plans.length > 0 && (
            <Box sx={{ px: 3, py: 1.8, bgcolor: '#080b10', borderTop: '1px solid #1e2630', display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontFamily: BODY, fontSize: 11.5, color: '#4b5563' }}>{plans.length} plans</Typography>
              <Typography sx={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: BRAND, letterSpacing: -0.3 }}>
                Total MRR: {fmt(totalMRR)}
              </Typography>
            </Box>
          )}
        </Card>
      </Box>
    </Box>
  );
};

export default Plans;