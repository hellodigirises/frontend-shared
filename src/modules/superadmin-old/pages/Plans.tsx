import React, { useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CardHeader, Chip, Button,
  Table, TableBody, TableCell, TableHead, TableRow, LinearProgress,
  Skeleton, Stack, Divider
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import { useAppDispatch, useSuperAdmin } from '../../../redux/hooks';
import { fetchPlans } from './superadminSlice';

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 0 }).format(n);

const Plans: React.FC = () => {
  const dispatch = useAppDispatch();
  const { plans, loading } = useSuperAdmin();

  useEffect(() => { dispatch(fetchPlans()); }, [dispatch]);

  const totalMRR = plans.reduce((sum, p) => sum + p.mrr, 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Plans</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>Manage subscription plans and pricing</Typography>
        </Box>
        <Button variant="contained" sx={{ bgcolor: '#6366F1', '&:hover': { bgcolor: '#4F46E5' } }}>
          + New Plan
        </Button>
      </Box>

      {/* Plan Cards */}
      <Grid container spacing={2.5} mb={4}>
        {loading.plans
          ? Array.from({ length: 4 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
            </Grid>
          ))
          : plans.map(plan => (
            <Grid item xs={12} sm={6} md={3} key={plan.id}>
              <Card sx={{
                border: `2px solid ${plan.popular ? plan.color : 'transparent'}`,
                borderRadius: 2,
                position: 'relative',
                boxShadow: plan.popular ? `0 0 0 1px ${plan.color}30` : '0 1px 3px rgba(0,0,0,0.06)',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-2px)' },
              }}>
                {plan.popular && (
                  <Box sx={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)' }}>
                    <Chip label="Most Popular" size="small" sx={{ bgcolor: plan.color, color: '#fff', fontWeight: 600, fontSize: 10 }} />
                  </Box>
                )}
                <CardContent sx={{ pt: plan.popular ? 3 : 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700}>{plan.displayName}</Typography>
                    <Button size="small" startIcon={<EditIcon sx={{ fontSize: 14 }} />} sx={{ fontSize: 11 }}>Edit</Button>
                  </Box>
                  <Typography variant="h4" fontWeight={800} color={plan.color} mb={0.5}>
                    {plan.price === 0 ? 'Custom' : `$${plan.price}`}
                    {plan.price > 0 && <Typography component="span" variant="caption" color="text.secondary" fontWeight={400}>/mo</Typography>}
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Stack spacing={0.5} mb={2}>
                    {plan.features.map(f => (
                      <Box key={f} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <CheckIcon sx={{ fontSize: 14, color: plan.color }} />
                        <Typography variant="body2" fontSize={12}>{f}</Typography>
                      </Box>
                    ))}
                  </Stack>
                  <Divider sx={{ my: 1.5 }} />
                  <Box sx={{ bgcolor: '#F8FAFC', borderRadius: 1, p: 1.5 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>LIMITS</Typography>
                    {[
                      ['Seats', plan.seats === -1 ? 'Unlimited' : plan.seats],
                      ['AI Agents', plan.aiAgents === -1 ? 'Unlimited' : plan.aiAgents],
                      ['Telephony', plan.telephonyMinutes === -1 ? 'Unlimited' : `${plan.telephonyMinutes.toLocaleString()} min`],
                      ['Storage', plan.storageGB === -1 ? 'Unlimited' : `${plan.storageGB} GB`],
                    ].map(([k, v]) => (
                      <Box key={String(k)} sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.75 }}>
                        <Typography variant="caption" color="text.secondary">{k}</Typography>
                        <Typography variant="caption" fontWeight={600}>{v}</Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
      </Grid>

      {/* Revenue by Plan Table */}
      <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <CardHeader title="Plan Revenue Breakdown" titleTypographyProps={{ variant: 'h6', fontWeight: 600 }} />
        <Table>
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 600, fontSize: 12, color: 'text.secondary', textTransform: 'uppercase', bgcolor: '#F9FAFB' } }}>
              <TableCell>Plan</TableCell>
              <TableCell align="right">Tenants</TableCell>
              <TableCell align="right">MRR</TableCell>
              <TableCell>Share</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.map(plan => {
              const pct = totalMRR > 0 ? (plan.mrr / totalMRR) * 100 : 0;
              return (
                <TableRow key={plan.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: plan.color }} />
                      <Typography variant="body2" fontWeight={500}>{plan.displayName}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right"><Typography variant="body2">{plan.tenantsCount}</Typography></TableCell>
                  <TableCell align="right"><Typography variant="body2" fontWeight={600}>{fmt(plan.mrr)}</Typography></TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress variant="determinate" value={pct} sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { bgcolor: plan.color } }} />
                      <Typography variant="caption" color="text.secondary" minWidth={36}>{pct.toFixed(0)}%</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
};

export default Plans;