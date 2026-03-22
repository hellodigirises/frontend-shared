// src/modules/superadmin/pages/TelephonyPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Grid, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material';
import { Save, Phone, AccessTime, CurrencyRupee, CallMade } from '@mui/icons-material';
import { useAppDispatch, C, INR, DATE, inputSx, labelSx } from '../hooks';
import { PageHeader, SectionCard, DataTable, StatCard } from '../components/ui';
import { api } from '../api/superadmin.api';

export default function TelephonyPage() {
  const [rows,    setRows]    = useState<any[]>([]);
  const [agg,     setAgg]     = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dialog,  setDialog]  = useState(false);
  const [sysRate,    setSysRate]    = useState('');
  const [tenantRate, setTenantRate] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/telephony/usage', { params: { take: 50 } })
      .then(r => {
        setRows(r.data.data?.data ?? []);
        setAgg(r.data.data?.aggregate ?? null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openDialog = () => {
    // Pre-fill from platform settings if available
    api.get('/settings', { params: { group: 'TELEPHONY' } }).then(r => {
      const settings: any[] = r.data.data ?? [];
      const sys    = settings.find(s => s.key === 'TELEPHONY_SYSTEM_RATE');
      const tenant = settings.find(s => s.key === 'TELEPHONY_TENANT_RATE');
      setSysRate(sys?.value    ?? '');
      setTenantRate(tenant?.value ?? '');
    });
    setDialog(true);
  };

  const saveRate = () => {
    setSaving(true);
    api.put('/telephony/rate', { systemRate: +sysRate, tenantRate: +tenantRate })
      .then(() => setDialog(false))
      .finally(() => setSaving(false));
  };

  return (
    <Box>
      <PageHeader
        title="Telephony"
        subtitle="Monitor call usage and manage global pricing rates"
        action={
          <Button variant="contained" startIcon={<Save />} size="small"
            onClick={openDialog}
            sx={{ bgcolor: C.primary, textTransform: 'none', fontWeight: 600, borderRadius: '8px', fontSize: 13 }}>
            Update Global Rate
          </Button>
        }
      />

      {/* Stat cards */}
      <Grid container spacing={2} mb={3}>
        {[
          { label: 'Total Minutes',   value: `${Number(agg?._sum?.minutes ?? 0).toFixed(0)} min`,   accent: C.cyan,    icon: <AccessTime /> },
          { label: 'Total Cost',      value: INR(agg?._sum?.cost ?? 0),                              accent: C.danger,  icon: <CurrencyRupee /> },
          { label: 'Avg Rate / min',  value: INR(agg?._avg?.ratePerMin ?? 0),                        accent: C.warning, icon: <Phone /> },
          { label: 'Total Calls',     value: agg?._count?._all ?? 0,                                 accent: C.primary, icon: <CallMade /> },
        ].map(c => (
          <Grid item xs={12} sm={6} md={3} key={c.label}>
            <StatCard {...c} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* Records table */}
      <SectionCard title="Call Records">
        <DataTable
          loading={loading}
          columns={[
            { label: 'Tenant',    render: r => <Typography sx={{ color: C.text,    fontSize: 12 }}>{r.tenant?.name ?? '—'}</Typography> },
            { label: 'Duration',  render: r => <Typography sx={{ color: C.text,    fontSize: 12 }}>{Number(r.minutes).toFixed(2)} min</Typography> },
            { label: 'Direction', render: r => <Typography sx={{ color: C.textSub, fontSize: 12 }}>{r.direction}</Typography> },
            { label: 'Rate / min',render: r => <Typography sx={{ color: C.textSub, fontSize: 12 }}>{INR(r.ratePerMin)}</Typography> },
            { label: 'Cost',      render: r => <Typography sx={{ color: C.text,    fontSize: 12, fontWeight: 600 }}>{INR(r.cost)}</Typography> },
            { label: 'Provider',  render: r => <Typography sx={{ color: C.textSub, fontSize: 11 }}>{r.provider ?? '—'}</Typography> },
            { label: 'Date',      render: r => <Typography sx={{ color: C.textSub, fontSize: 12 }}>{DATE(r.createdAt)}</Typography> },
          ]}
          rows={rows}
          emptyMsg="No telephony records"
        />
      </SectionCard>

      {/* Rate dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { bgcolor: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px' } }}>
        <DialogTitle sx={{ color: C.text, fontWeight: 700, fontSize: 15 }}>Update Global Rate</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField size="small" label="System Cost / min (₹)" type="number" inputProps={{ step: '0.01' }}
              value={sysRate} onChange={e => setSysRate(e.target.value)}
              sx={inputSx} InputLabelProps={{ sx: labelSx }} />
            <TextField size="small" label="Tenant Price / min (₹)" type="number" inputProps={{ step: '0.01' }}
              value={tenantRate} onChange={e => setTenantRate(e.target.value)}
              sx={inputSx} InputLabelProps={{ sx: labelSx }} />
            {sysRate && tenantRate && (
              <Box sx={{ bgcolor: C.surfaceHigh, borderRadius: '8px', p: 1.25 }}>
                <Typography sx={{ color: C.textSub, fontSize: 12 }}>
                  Margin: <span style={{ color: C.success, fontWeight: 700 }}>
                    {INR(Math.max(0, +tenantRate - +sysRate))} / min
                    ({((+tenantRate - +sysRate) / Math.max(+sysRate, 0.0001) * 100).toFixed(1)}%)
                  </span>
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDialog(false)} sx={{ color: C.textSub, textTransform: 'none', fontSize: 13 }}>Cancel</Button>
          <Button variant="contained" disabled={!sysRate || !tenantRate || saving} onClick={saveRate}
            sx={{ bgcolor: C.primary, textTransform: 'none', fontWeight: 600, borderRadius: '8px', fontSize: 13 }}>
            Save Rate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}