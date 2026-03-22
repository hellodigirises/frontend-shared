import React, { useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Chip, LinearProgress,
  Table, TableBody, TableCell, TableHead, TableRow, Skeleton
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import { useAppDispatch, useSuperAdmin } from '../../../redux/hooks';
import { fetchTelephonyProviders } from './superadminSlice';

const Telephony: React.FC = () => {
  const dispatch = useAppDispatch();
  const { telephonyProviders, loading } = useSuperAdmin();

  useEffect(() => { dispatch(fetchTelephonyProviders()); }, [dispatch]);

  const totalCalls = telephonyProviders.reduce((s, p) => s + p.callsToday, 0);
  const totalMinutes = telephonyProviders.reduce((s, p) => s + p.minutesToday, 0);
  const totalTenants = telephonyProviders.reduce((s, p) => s + p.tenantsCount, 0);

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700}>Telephony</Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>Telephony providers and call statistics</Typography>
      </Box>

      {/* Summary */}
      <Grid container spacing={2.5} mb={3}>
        {[
          { label: 'Total Calls Today', value: totalCalls.toLocaleString(), icon: '📞', color: '#6366F1' },
          { label: 'Total Minutes Today', value: new Intl.NumberFormat('en-US', { notation: 'compact' }).format(totalMinutes), icon: '⏱️', color: '#10B981' },
          { label: 'Connected Tenants', value: totalTenants, icon: '🏢', color: '#F59E0B' },
          { label: 'Active Providers', value: telephonyProviders.filter(p => p.status === 'active').length, icon: '✅', color: '#14B8A6' },
        ].map(c => (
          <Grid item xs={6} md={3} key={c.label}>
            <Card variant="outlined">
              <CardContent>
                <Typography fontSize={22}>{c.icon}</Typography>
                <Typography variant="h4" fontWeight={700} color={c.color} mt={0.5}>{c.value}</Typography>
                <Typography variant="caption" color="text.secondary">{c.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Providers */}
      <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight={600}>Telephony Providers</Typography>
        </Box>
        <Table>
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 600, fontSize: 12, color: 'text.secondary', textTransform: 'uppercase', bgcolor: '#F9FAFB', letterSpacing: 0.5 } }}>
              <TableCell>Provider</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Tenants</TableCell>
              <TableCell align="right">Calls Today</TableCell>
              <TableCell align="right">Minutes Today</TableCell>
              <TableCell>Success Rate</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading.telephony
              ? Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>{Array.from({ length: 6 }).map((_, j) => (<TableCell key={j}><Skeleton height={20} /></TableCell>))}</TableRow>
              ))
              : telephonyProviders.map(p => (
                <TableRow key={p.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 34, height: 34, borderRadius: 1.5, bgcolor: '#6366F118', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <PhoneIcon sx={{ fontSize: 16, color: '#6366F1' }} />
                      </Box>
                      <Typography variant="body2" fontWeight={500}>{p.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={p.status} size="small" sx={{
                      bgcolor: p.status === 'active' ? '#DCFCE7' : p.status === 'degraded' ? '#FEF9C3' : '#F3F4F6',
                      color: p.status === 'active' ? '#16A34A' : p.status === 'degraded' ? '#CA8A04' : '#6B7280',
                      fontWeight: 600, fontSize: 11, textTransform: 'capitalize',
                    }} />
                  </TableCell>
                  <TableCell align="right"><Typography variant="body2">{p.tenantsCount}</Typography></TableCell>
                  <TableCell align="right"><Typography variant="body2">{p.callsToday.toLocaleString()}</Typography></TableCell>
                  <TableCell align="right"><Typography variant="body2">{p.minutesToday.toLocaleString()}</Typography></TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress variant="determinate" value={p.successRate} sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { bgcolor: p.successRate > 97 ? '#10B981' : p.successRate > 95 ? '#F59E0B' : '#EF4444' } }} />
                      <Typography variant="caption" minWidth={40}>{p.successRate}%</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
};

export default Telephony;