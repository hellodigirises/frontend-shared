// src/modules/superadmin/pages/AnalyticsPage.tsx
import React, { useEffect, useState } from 'react';
import { Box, Grid, Tabs, Tab, Typography } from '@mui/material';
import { C, INR } from '../hooks';
import { PageHeader, SectionCard, DataTable } from '../components/ui';
import { RevenueChart } from '../components/Charts';
import { api } from '../api/superadmin.api';

export default function AnalyticsPage() {
  const [tab,     setTab]     = useState(0);
  const [loading, setLoading] = useState(false);
  const [revenue, setRevenue] = useState<{ byTenant: any[]; byMonth: any[] }>({ byTenant: [], byMonth: [] });
  const [modules, setModules] = useState<any[]>([]);
  const [tenants, setTenants] = useState<{ perTenant: any[]; aiByTenant: any[]; usageSummary: any[] }>({
    perTenant: [], aiByTenant: [], usageSummary: [],
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/analytics/revenue'),
      api.get('/analytics/modules'),
      api.get('/analytics/tenants'),
    ]).then(([r1, r2, r3]) => {
      setRevenue(r1.data.data ?? { byTenant: [], byMonth: [] });
      setModules(r2.data.data ?? []);
      setTenants(r3.data.data ?? { perTenant: [], aiByTenant: [], usageSummary: [] });
    }).finally(() => setLoading(false));
  }, []);

  // Shape byMonth into RevenueChart format
  const revenueChartData = revenue.byMonth.map((r: any) => ({
    month: r.month, plan: r.total, addon: 0, ai: 0, telephony: 0,
  }));

  // Max count for module bar scaling
  const maxCount = Math.max(...modules.map((m: any) => m.count), 1);

  return (
    <Box>
      <PageHeader title="Analytics" subtitle="Cross-tenant platform insights and revenue breakdown" />

      <Box sx={{ borderBottom: `1px solid ${C.border}`, mb: 2.5 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{
          '& .MuiTab-root'      : { color: C.textSub, fontSize: 13, textTransform: 'none', minHeight: 40, px: 2 },
          '& .Mui-selected'     : { color: `${C.primary} !important` },
          '& .MuiTabs-indicator': { bgcolor: C.primary },
        }}>
          <Tab label="Revenue" />
          <Tab label="Modules" />
          <Tab label="Tenants" />
        </Tabs>
      </Box>

      {/* ── Revenue ── */}
      {tab === 0 && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <RevenueChart data={revenueChartData} />
          </Grid>
          <Grid item xs={12}>
            <SectionCard title="Revenue by Tenant (All Time)">
              <DataTable
                loading={loading}
                columns={[
                  { label: '#',        render: (_, i: any) => <Typography sx={{ color: C.textSub, fontSize: 12 }}>{i + 1}</Typography> },
                  { label: 'Tenant',   render: r => <Typography sx={{ color: C.text,    fontSize: 13 }}>{r.name}</Typography> },
                  { label: 'Invoices', render: r => <Typography sx={{ color: C.textSub, fontSize: 13 }}>{Number(r.invoiceCount)}</Typography> },
                  { label: 'Revenue',  render: r => <Typography sx={{ color: C.success, fontSize: 13, fontWeight: 700 }}>{INR(r.total)}</Typography> },
                  { label: 'Share',    render: (r, _i: any, rows: any[]) => {
                    const totalRev = rows.reduce((s: number, x: any) => s + x.total, 0);
                    const pct = totalRev > 0 ? ((r.total / totalRev) * 100).toFixed(1) : '0';
                    return (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box sx={{ width: 80, height: 5, bgcolor: C.surfaceHigh, borderRadius: 2, overflow: 'hidden' }}>
                          <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: C.primary, borderRadius: 2 }} />
                        </Box>
                        <Typography sx={{ color: C.textSub, fontSize: 11 }}>{pct}%</Typography>
                      </Box>
                    );
                  }},
                ]}
                rows={revenue.byTenant.map((r: any, i: number) => ({ ...r, id: String(i) }))}
                emptyMsg="No revenue data"
              />
            </SectionCard>
          </Grid>
        </Grid>
      )}

      {/* ── Modules ── */}
      {tab === 1 && (
        <SectionCard title="Module Adoption by Active Tenant Count">
          <DataTable
            loading={loading}
            columns={[
              { label: 'Module',  render: r => (
                <Typography sx={{ color: C.text, fontSize: 13, fontWeight: 500 }}>{r.module}</Typography>
              )},
              { label: 'Tenants', render: r => (
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Typography sx={{ color: C.primary, fontWeight: 700, fontSize: 13, minWidth: 28 }}>{r.count}</Typography>
                  <Box sx={{ flex: 1, maxWidth: 240, height: 6, bgcolor: C.surfaceHigh, borderRadius: 3, overflow: 'hidden' }}>
                    <Box sx={{
                      height: '100%', borderRadius: 3, bgcolor: C.primary,
                      width: `${Math.min(100, (r.count / maxCount) * 100)}%`,
                      transition: 'width .3s ease',
                    }} />
                  </Box>
                </Box>
              )},
              { label: 'Adoption %', render: r => (
                <Typography sx={{ color: C.textSub, fontSize: 12 }}>
                  {((r.count / maxCount) * 100).toFixed(0)}%
                </Typography>
              )},
            ]}
            rows={modules.map((r: any, i: number) => ({ ...r, id: String(i) }))}
            emptyMsg="No module data"
          />
        </SectionCard>
      )}

      {/* ── Tenants ── */}
      {tab === 2 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
            <SectionCard title="Revenue Leaderboard">
              <DataTable
                loading={loading}
                columns={[
                  { label: 'Tenant',  render: r => <Typography sx={{ color: C.text,    fontSize: 13 }}>{r.name}</Typography> },
                  { label: 'Revenue', render: r => <Typography sx={{ color: C.success, fontSize: 13, fontWeight: 700 }}>{INR(r.total)}</Typography> },
                ]}
                rows={(tenants.perTenant ?? []).map((r: any, i: number) => ({ ...r, id: String(i) }))}
                emptyMsg="No data"
              />
            </SectionCard>
          </Grid>
          <Grid item xs={12} md={5}>
            <SectionCard title="Usage by Service">
              <DataTable
                loading={loading}
                columns={[
                  { label: 'Service',  render: r => <Typography sx={{ color: C.text,    fontSize: 13 }}>{r.service}</Typography> },
                  { label: 'Quantity', render: r => <Typography sx={{ color: C.textSub, fontSize: 13 }}>{Number(r._sum?.quantity ?? 0).toFixed(0)}</Typography> },
                  { label: 'Cost',     render: r => <Typography sx={{ color: C.warning, fontSize: 13, fontWeight: 600 }}>{INR(r._sum?.cost ?? 0)}</Typography> },
                ]}
                rows={(tenants.usageSummary ?? []).map((r: any, i: number) => ({ ...r, id: String(i) }))}
                emptyMsg="No usage data"
              />
            </SectionCard>
            <Box mt={2}>
              <SectionCard title="AI Usage by Tenant">
                <DataTable
                  loading={loading}
                  columns={[
                    { label: 'Tenant ID', render: r => (
                      <Typography sx={{ color: C.textSub, fontSize: 11, fontFamily: 'monospace' }}>
                        {r.tenantId?.slice(-8)}
                      </Typography>
                    )},
                    { label: 'Sessions', render: r => <Typography sx={{ color: C.textSub, fontSize: 12 }}>{r._count?._all ?? 0}</Typography> },
                    { label: 'Minutes',  render: r => <Typography sx={{ color: C.text,    fontSize: 12 }}>{Number(r._sum?.minutes ?? 0).toFixed(0)}</Typography> },
                    { label: 'Cost',     render: r => <Typography sx={{ color: C.purple,  fontSize: 12, fontWeight: 600 }}>{INR(r._sum?.cost ?? 0)}</Typography> },
                  ]}
                  rows={(tenants.aiByTenant ?? []).map((r: any, i: number) => ({ ...r, id: String(i) }))}
                  emptyMsg="No AI data"
                />
              </SectionCard>
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}