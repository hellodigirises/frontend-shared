// src/modules/superadmin/pages/BillingPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Grid, Tabs, Tab, Typography, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Tooltip, IconButton,
} from '@mui/material';
import { Add, Receipt, CheckCircle } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, C, INR, DATE, inputSx, labelSx } from '../hooks';
import { fetchInvoices, doGenInvoice, doMarkPaid } from '../store/superadminSlice';
import { PageHeader, SectionCard, DataTable, StatusChip, StatCard } from '../components/ui';
import { api } from '../api/superadmin.api';

const EMPTY_FORM = {
  tenantId: '', periodStart: '', periodEnd: '',
  plan: '', addons: '', ai: '', telephony: '', notes: '',
};

export default function BillingPage() {
  const dispatch = useAppDispatch();
  const { invoices, loading } = useAppSelector(s => s.superadmin);
  const [tab,          setTab]          = useState(0);
  const [dialog,       setDialog]       = useState(false);
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [txLoading,    setTxLoading]    = useState(false);
  const busy = !!loading.invoices;

  useEffect(() => { dispatch(fetchInvoices({ take: 50 })); }, [dispatch]);

  useEffect(() => {
    setTxLoading(true);
    api.get('/transactions', { params: { take: 50 } })
      .then(r => setTransactions(r.data.data?.data ?? []))
      .finally(() => setTxLoading(false));
  }, []);

  const set = (k: keyof typeof EMPTY_FORM, v: string) =>
    setForm(p => ({ ...p, [k]: v }));

  const generate = () => {
    dispatch(doGenInvoice({
      tenantId   : form.tenantId,
      periodStart: form.periodStart,
      periodEnd  : form.periodEnd,
      lineItems  : {
        plan     : +form.plan,
        addons   : +form.addons,
        ai       : +form.ai,
        telephony: +form.telephony,
      },
      notes: form.notes || undefined,
    }));
    setDialog(false);
    setForm(EMPTY_FORM);
  };

  // Aggregate stats from loaded invoices
  const paid    = invoices.data.filter(i => i.status === 'PAID');
  const pending = invoices.data.filter(i => i.status === 'PENDING');
  const overdue = invoices.data.filter(i => i.status === 'OVERDUE');
  const sum = (arr: typeof paid) => arr.reduce((s, i) => s + i.totalAmount, 0);

  return (
    <Box>
      <PageHeader
        title="Billing"
        subtitle="Invoices, transactions and revenue tracking"
        action={
          <Button variant="contained" startIcon={<Add />} size="small"
            onClick={() => setDialog(true)}
            sx={{ bgcolor: C.primary, textTransform: 'none', fontWeight: 600, borderRadius: '8px', fontSize: 13 }}>
            Generate Invoice
          </Button>
        }
      />

      {/* Summary cards */}
      <Grid container spacing={2} mb={3}>
        {[
          { label: 'Paid',    value: INR(sum(paid)),    accent: C.success, icon: <Receipt />,        sub: `${paid.length} invoices`    },
          { label: 'Pending', value: INR(sum(pending)), accent: C.warning, icon: <Receipt />,        sub: `${pending.length} invoices` },
          { label: 'Overdue', value: INR(sum(overdue)), accent: C.danger,  icon: <Receipt />,        sub: `${overdue.length} invoices` },
          { label: 'Total',   value: invoices.total,    accent: C.primary, icon: <Receipt />,        sub: 'All time'                   },
        ].map(c => (
          <Grid item xs={12} sm={6} md={3} key={c.label}>
            <StatCard {...c} loading={busy} />
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: `1px solid ${C.border}`, mb: 2.5 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{
          '& .MuiTab-root'      : { color: C.textSub, fontSize: 13, textTransform: 'none', minHeight: 40, px: 2 },
          '& .Mui-selected'     : { color: `${C.primary} !important` },
          '& .MuiTabs-indicator': { bgcolor: C.primary },
        }}>
          <Tab label={`Invoices (${invoices.total})`} />
          <Tab label={`Transactions (${transactions.length})`} />
        </Tabs>
      </Box>

      {/* Invoices */}
      {tab === 0 && (
        <SectionCard>
          <DataTable
            loading={busy}
            columns={[
              { label: 'Invoice #',  render: r => (
                <Typography sx={{ fontFamily: 'monospace', color: C.text, fontSize: 12 }}>{r.invoiceNumber}</Typography>
              )},
              { label: 'Tenant',     render: r => <Typography sx={{ color: C.text,    fontSize: 12 }}>{r.tenant?.name ?? '—'}</Typography> },
              { label: 'Amount',     render: r => <Typography sx={{ color: C.text,    fontSize: 12 }}>{INR(r.amount)}</Typography> },
              { label: 'Tax',        render: r => <Typography sx={{ color: C.textSub, fontSize: 12 }}>{INR(r.taxAmount)}</Typography> },
              { label: 'Total',      render: r => <Typography sx={{ color: C.text,    fontSize: 12, fontWeight: 700 }}>{INR(r.totalAmount)}</Typography> },
              { label: 'Status',     render: r => <StatusChip status={r.status} /> },
              { label: 'Due',        render: r => <Typography sx={{ color: C.textSub, fontSize: 12 }}>{DATE(r.dueDate)}</Typography> },
              { label: 'Paid At',    render: r => <Typography sx={{ color: C.textSub, fontSize: 12 }}>{DATE(r.paidAt)}</Typography> },
              { label: '',           render: r => r.status === 'PENDING' ? (
                <Tooltip title="Mark as Paid">
                  <IconButton size="small" sx={{ color: C.success }}
                    onClick={() => dispatch(doMarkPaid(r.id))}>
                    <CheckCircle sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>
              ) : null },
            ]}
            rows={invoices.data}
            emptyMsg="No invoices found"
          />
        </SectionCard>
      )}

      {/* Transactions */}
      {tab === 1 && (
        <SectionCard>
          <DataTable
            loading={txLoading}
            columns={[
              { label: 'Invoice #',  render: r => (
                <Typography sx={{ fontFamily: 'monospace', color: C.textSub, fontSize: 11 }}>
                  {r.invoice?.invoiceNumber ?? '—'}
                </Typography>
              )},
              { label: 'Tenant',     render: r => <Typography sx={{ color: C.text,    fontSize: 12 }}>{r.invoice?.tenant?.name ?? '—'}</Typography> },
              { label: 'Amount',     render: r => <Typography sx={{ color: C.text,    fontSize: 12, fontWeight: 700 }}>{INR(r.amount)}</Typography> },
              { label: 'Method',     render: r => (
                <Chip label={r.method} size="small"
                  sx={{ fontSize: 10, height: 20, bgcolor: `${C.primary}15`, color: C.primary }} />
              )},
              { label: 'Status',     render: r => <StatusChip status={r.status} /> },
              { label: 'Reference',  render: r => (
                <Typography sx={{ color: C.textSub, fontSize: 11, fontFamily: 'monospace' }}>{r.reference ?? '—'}</Typography>
              )},
              { label: 'Date',       render: r => <Typography sx={{ color: C.textSub, fontSize: 12 }}>{DATE(r.createdAt)}</Typography> },
            ]}
            rows={transactions}
            emptyMsg="No transactions found"
          />
        </SectionCard>
      )}

      {/* Generate Invoice Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px' } }}>
        <DialogTitle sx={{ color: C.text, fontWeight: 700, fontSize: 15, pb: 1 }}>Generate Invoice</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={0.25}>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Tenant ID *"
                value={form.tenantId} onChange={e => set('tenantId', e.target.value)}
                sx={inputSx} InputLabelProps={{ sx: labelSx }} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="Period Start *" type="date"
                value={form.periodStart} onChange={e => set('periodStart', e.target.value)}
                sx={inputSx} InputLabelProps={{ shrink: true, sx: labelSx }} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="Period End *" type="date"
                value={form.periodEnd} onChange={e => set('periodEnd', e.target.value)}
                sx={inputSx} InputLabelProps={{ shrink: true, sx: labelSx }} />
            </Grid>
            {[
              ['plan',      'Plan Revenue (₹)'],
              ['addons',    'Add-on Revenue (₹)'],
              ['ai',        'AI Usage Revenue (₹)'],
              ['telephony', 'Telephony Revenue (₹)'],
            ].map(([k, l]) => (
              <Grid item xs={6} key={k}>
                <TextField fullWidth size="small" label={l} type="number"
                  value={(form as any)[k]} onChange={e => set(k as any, e.target.value)}
                  sx={inputSx} InputLabelProps={{ sx: labelSx }} />
              </Grid>
            ))}
            {/* Live subtotal */}
            <Grid item xs={12}>
              <Box sx={{ bgcolor: C.surfaceHigh, borderRadius: '8px', p: 1.25 }}>
                {(() => {
                  const sub = [+form.plan, +form.addons, +form.ai, +form.telephony].reduce((a, b) => a + (b || 0), 0);
                  const tax = sub * 0.18;
                  return (
                    <Box display="flex" gap={3}>
                      <Box>
                        <Typography sx={{ color: C.textSub, fontSize: 11 }}>Subtotal</Typography>
                        <Typography sx={{ color: C.text, fontWeight: 600, fontSize: 13 }}>{INR(sub)}</Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ color: C.textSub, fontSize: 11 }}>GST (18%)</Typography>
                        <Typography sx={{ color: C.text, fontWeight: 600, fontSize: 13 }}>{INR(tax)}</Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ color: C.textSub, fontSize: 11 }}>Total</Typography>
                        <Typography sx={{ color: C.success, fontWeight: 700, fontSize: 13 }}>{INR(sub + tax)}</Typography>
                      </Box>
                    </Box>
                  );
                })()}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Notes (optional)" multiline rows={2}
                value={form.notes} onChange={e => set('notes', e.target.value)}
                sx={inputSx} InputLabelProps={{ sx: labelSx }} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDialog(false)} sx={{ color: C.textSub, textTransform: 'none', fontSize: 13 }}>Cancel</Button>
          <Button variant="contained"
            disabled={!form.tenantId || !form.periodStart || !form.periodEnd}
            onClick={generate}
            sx={{ bgcolor: C.primary, textTransform: 'none', fontWeight: 600, borderRadius: '8px', fontSize: 13 }}>
            Generate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}