import React, { useEffect } from 'react';
import {
  Box, Typography, Grid, Card, Chip, LinearProgress,
  Table, TableBody, TableCell, TableHead, TableRow, Stack, Button
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import {
  PhoneOutlined, AccessTimeOutlined, BusinessOutlined,
  CheckCircleOutlined
} from '@mui/icons-material';
import { useAppDispatch, useSuperAdmin } from '../../../../redux/hooks';
import { fetchTelephonyProviders } from './superadminSlice';

const FONT  = "'Clash Display', 'Outfit', sans-serif";
const BODY  = "'Cabinet Grotesk', 'DM Sans', sans-serif";
const BRAND = '#00d4aa';
const WARN  = '#f59e0b';
const DANGER= '#ff4d6d';

const DS: React.FC<{ h?: number; w?: string | number }> = ({ h = 16, w = '100%' }) => (
  <Box sx={{
    height: h, width: w, borderRadius: 1.5, bgcolor: '#1e2630',
    animation: 'pulse 1.5s ease-in-out infinite',
    '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.35 } }
  }} />
);

const Telephony: React.FC = () => {
  const dispatch = useAppDispatch();
  const { telephonyProviders, loading } = useSuperAdmin();

  useEffect(() => { dispatch(fetchTelephonyProviders()); }, [dispatch]);

  const totalCalls      = telephonyProviders.reduce((s, p) => s + p.callsToday, 0);
  const totalMinutes    = telephonyProviders.reduce((s, p) => s + p.minutesToday, 0);
  const totalTenants    = telephonyProviders.reduce((s, p) => s + p.tenantsCount, 0);
  const activeProviders = telephonyProviders.filter(p => p.status === 'active').length;

  const statusCfg = (s: string) => ({
    active:   { color: BRAND,     bg: BRAND + '14',  dot: BRAND,     label: 'Active' },
    degraded: { color: WARN,      bg: WARN + '14',   dot: WARN,      label: 'Degraded' },
    inactive: { color: '#4b5563', bg: '#1e2630',     dot: '#4b5563', label: 'Inactive' },
  }[s] ?? { color: '#4b5563', bg: '#1e2630', dot: '#4b5563', label: s });

  return (
    <Box sx={{ bgcolor: '#080b10', minHeight: '100vh', pb: 8, fontFamily: BODY }}>

      {/* ── Header ── */}
      <Box sx={{ px: { xs: 3, md: 5 }, pt: 5, pb: 4, borderBottom: '1px solid #1e2630', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -60, right: -60, width: 260, height: 260, borderRadius: '50%', bgcolor: WARN + '08', filter: 'blur(50px)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'relative' }}>
          <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
            <Box sx={{ px: 1.5, py: 0.4, borderRadius: 1.5, bgcolor: WARN + '18', border: `1px solid ${WARN}30` }}>
              <Typography sx={{ fontFamily: BODY, fontSize: 10, fontWeight: 800, color: WARN, textTransform: 'uppercase', letterSpacing: 1.2 }}>
                Call Infrastructure
              </Typography>
            </Box>
          </Stack>
          <Typography sx={{ fontFamily: FONT, fontSize: 36, fontWeight: 700, color: 'white', letterSpacing: -1.8, lineHeight: 1 }}>
            Telephony
          </Typography>
          <Typography sx={{ fontFamily: BODY, fontSize: 13, color: '#4b5563', mt: 0.8 }}>
            Telephony providers and real-time call statistics
          </Typography>
        </Box>
      </Box>

      <Box sx={{ px: { xs: 3, md: 5 }, pt: 4 }}>

        {/* ── Summary KPIs ── */}
        <Grid container spacing={2.5} mb={4}>
          {[
            { label: 'Total Calls Today',   value: totalCalls.toLocaleString(),
              color: BRAND,     icon: <PhoneOutlined sx={{ fontSize: 18 }} /> },
            { label: 'Total Minutes Today', value: new Intl.NumberFormat('en-US', { notation: 'compact' }).format(totalMinutes),
              color: '#34d399', icon: <AccessTimeOutlined sx={{ fontSize: 18 }} /> },
            { label: 'Connected Tenants',   value: totalTenants,
              color: WARN,      icon: <BusinessOutlined sx={{ fontSize: 18 }} /> },
            { label: 'Active Providers',    value: activeProviders,
              color: '#60a5fa', icon: <CheckCircleOutlined sx={{ fontSize: 18 }} /> },
          ].map(c => (
            <Grid item xs={6} md={3} key={c.label}>
              <Card sx={{
                p: 3, borderRadius: 3, bgcolor: '#0d1117', border: `1px solid ${c.color}20`,
                boxShadow: 'none', position: 'relative', overflow: 'hidden',
                transition: 'all 0.2s',
                '&:hover': { borderColor: c.color + '50', transform: 'translateY(-2px)', boxShadow: `0 8px 24px ${c.color}12` }
              }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, bgcolor: c.color }} />
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography sx={{ fontFamily: BODY, fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: 1 }}>
                      {c.label}
                    </Typography>
                    {loading.telephony
                      ? <Box sx={{ mt: 0.8 }}><DS h={26} w={60} /></Box>
                      : <Typography sx={{ fontFamily: FONT, fontSize: 28, fontWeight: 700, color: c.color, letterSpacing: -1.2, lineHeight: 1, mt: 0.6 }}>
                          {c.value}
                        </Typography>
                    }
                  </Box>
                  <Box sx={{ width: 38, height: 38, borderRadius: 2.5, bgcolor: c.color + '14', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color, flexShrink: 0 }}>
                    {c.icon}
                  </Box>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* ── Providers Table ── */}
        <Card sx={{ borderRadius: 3, bgcolor: '#0d1117', border: '1px solid #1e2630', boxShadow: 'none', overflow: 'hidden' }}>
          <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #1e2630' }}>
            <Typography sx={{ fontFamily: BODY, fontWeight: 800, fontSize: 14, color: 'white' }}>Telephony Providers</Typography>
            <Typography sx={{ fontFamily: BODY, fontSize: 11.5, color: '#4b5563', mt: 0.2 }}>
              {telephonyProviders.length} provider{telephonyProviders.length !== 1 ? 's' : ''} configured
            </Typography>
          </Box>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#080b10' }}>
                {['Provider', 'Status', 'Tenants', 'Calls Today', 'Minutes Today', 'Success Rate'].map((h, i) => (
                  <TableCell key={h} align={i >= 2 && i <= 4 ? 'right' : 'left'}
                    sx={{ fontWeight: 800, fontSize: 10.5, color: '#4b5563', textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: BODY, py: 1.8, borderBottom: '1px solid #1e2630' }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading.telephony
                ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i} sx={{ '& td': { borderBottom: '1px solid #1e2630' } }}>
                    {[180, 80, 50, 70, 70, 160].map((w, j) => (
                      <TableCell key={j} sx={{ py: 2 }}><DS h={14} w={w} /></TableCell>
                    ))}
                  </TableRow>
                ))
                : telephonyProviders.map(p => {
                  const sc = statusCfg(p.status);
                  return (
                    <TableRow key={p.id} hover
                      sx={{ '& td': { py: 1.8, borderBottom: '1px solid #1e2630', fontFamily: BODY }, '&:hover': { bgcolor: '#111827' }, transition: 'background 0.12s' }}>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box sx={{ width: 38, height: 38, borderRadius: 2.5, bgcolor: WARN + '14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <PhoneIcon sx={{ fontSize: 17, color: WARN }} />
                          </Box>
                          <Typography sx={{ fontWeight: 800, fontSize: 13.5, color: 'white', fontFamily: BODY }}>{p.name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6, px: 1.2, py: 0.4, borderRadius: 1.5, bgcolor: sc.bg }}>
                          <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: sc.dot }} />
                          <Typography sx={{ fontFamily: BODY, fontSize: 10.5, fontWeight: 800, color: sc.color, textTransform: 'capitalize' }}>{sc.label}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography sx={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: WARN, letterSpacing: -0.3 }}>{p.tenantsCount}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography sx={{ fontFamily: BODY, fontSize: 13, fontWeight: 700, color: '#9ca3af' }}>{p.callsToday.toLocaleString()}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography sx={{ fontFamily: BODY, fontSize: 13, fontWeight: 700, color: '#9ca3af' }}>{p.minutesToday.toLocaleString()}</Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box flex={1} sx={{ height: 7, borderRadius: 3.5, bgcolor: '#1e2630', overflow: 'hidden' }}>
                            <Box sx={{
                              height: '100%', width: `${p.successRate}%`,
                              bgcolor: p.successRate > 97 ? BRAND : p.successRate > 95 ? WARN : DANGER,
                              borderRadius: 3.5, transition: 'width 0.5s ease'
                            }} />
                          </Box>
                          <Typography sx={{
                            fontFamily: BODY, fontSize: 12, fontWeight: 800, minWidth: 44,
                            color: p.successRate > 97 ? BRAND : p.successRate > 95 ? WARN : DANGER
                          }}>
                            {p.successRate}%
                          </Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </Card>
      </Box>
    </Box>
  );
};

export default Telephony;