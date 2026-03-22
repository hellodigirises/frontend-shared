// ─────────────────────────────────────────────────────────────────────────────
// src/modules/superadmin/pages/DashboardPage.tsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect } from 'react';
import { Grid, Box, Typography } from '@mui/material';
import { People, CurrencyRupee, TrendingUp, SmartToy, Phone, Block } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, C, INR } from '../hooks';
import { fetchDashboard } from '../store/superadminSlice';
import { StatCard, PageHeader } from '../components/ui';
import { RevenueChart, ModuleChart, TenantGrowthChart } from '../components/Charts';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { dashboard: d, loading } = useAppSelector(s => s.superadmin);
  const busy = !!loading.dashboard;
  useEffect(() => { dispatch(fetchDashboard()); }, [dispatch]);

  const stats = [
    { label: 'Total Tenants',    accent: C.primary, icon: <People />,       value: d?.totalTenants ?? 0,        sub: `${d?.activeTenants ?? 0} active · ${d?.trialTenants ?? 0} trial` },
    { label: 'Monthly Revenue',  accent: C.success, icon: <CurrencyRupee />, value: INR(d?.monthlyRevenue ?? 0),  sub: 'Paid invoices this month' },
    { label: 'Annual Revenue',   accent: C.purple,  icon: <TrendingUp />,    value: INR(d?.yearlyRevenue ?? 0),   sub: 'Calendar year to date' },
    { label: 'AI Usage',         accent: C.warning, icon: <SmartToy />,      value: `${Number(d?.aiUsage.minutes ?? 0).toFixed(0)} min`, sub: `${d?.aiUsage.sessions ?? 0} sessions · ${INR(d?.aiUsage.revenue ?? 0)}` },
    { label: 'Telephony',        accent: C.cyan,    icon: <Phone />,         value: `${Number(d?.telephonyUsage.minutes ?? 0).toFixed(0)} min`, sub: `Revenue: ${INR(d?.telephonyUsage.revenue ?? 0)}` },
    { label: 'Suspended',        accent: C.danger,  icon: <Block />,         value: d?.suspendedTenants ?? 0,     sub: 'Requires attention' },
  ];

  return (
    <Box>
      <PageHeader title="Platform Dashboard" subtitle={`Updated ${new Date().toLocaleTimeString('en-IN')}`} />
      <Grid container spacing={2} mb={3}>
        {stats.map(s => <Grid item xs={12} sm={6} md={4} key={s.label}><StatCard {...s} loading={busy} /></Grid>)}
      </Grid>
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={8}><RevenueChart data={d?.charts.revenueGrowth ?? []} /></Grid>
        <Grid item xs={12} md={4}><TenantGrowthChart data={d?.charts.tenantGrowth ?? []} /></Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}><ModuleChart data={d?.charts.moduleUsage ?? []} /></Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ bgcolor: C.surface, borderRadius: '14px', p: 2.5, border: `1px solid ${C.border}`, height: '100%' }}>
            <Typography sx={{ color: C.text, fontWeight: 600, fontSize: 13, mb: 2 }}>Platform Summary</Typography>
            {[
              { label: 'Active Subscriptions',  value: d?.activeTenants ?? 0 },
              { label: 'Trial Tenants',          value: d?.trialTenants   ?? 0 },
              { label: 'Suspended Accounts',     value: d?.suspendedTenants ?? 0 },
              { label: 'AI Sessions (month)',    value: d?.aiUsage.sessions ?? 0 },
              { label: 'AI Revenue (month)',     value: INR(d?.aiUsage.revenue ?? 0) },
              { label: 'Telephony Revenue',      value: INR(d?.telephonyUsage.revenue ?? 0) },
            ].map(row => (
              <Box key={row.label} display="flex" justifyContent="space-between"
                py={0.85} sx={{ borderBottom: `1px solid ${C.border}` }}>
                <Typography sx={{ color: C.textSub, fontSize: 12.5 }}>{row.label}</Typography>
                <Typography sx={{ color: C.text, fontSize: 12.5, fontWeight: 600 }}>{row.value}</Typography>
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}