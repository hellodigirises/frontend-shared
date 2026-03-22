// src/modules/finance/pages/BankReconciliationPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Button, Typography, Chip, Select, MenuItem,
  FormControl, InputLabel, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Tooltip,
} from '@mui/material';
import { CompareArrows, CheckCircle, Cancel, Refresh } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, F, INR, DATE, fieldSx, labelSx, selSx } from '../hooks';
import { fetchBankAccounts, fetchBankTxs } from '../store/financeSlice';
import { PageHeader, Card, DataTable, StatCard, StatusBadge } from '../components/ui';
import { financeApi } from '../api/finance.api';

export default function BankReconciliationPage() {
  const dispatch = useAppDispatch();
  const { bankAccounts, bankTransactions, loading } = useAppSelector(s => s.finance);

  const [selBank,    setSelBank]    = useState('');
  const [reconStatus,setReconStatus]= useState<any>(null);
  const [matchDialog,setMatchDialog]= useState<any>(null);
  const [paymentId,  setPaymentId]  = useState('');
  const [notes,      setNotes]      = useState('');
  const [busy,       setBusy]       = useState(false);

  useEffect(() => { dispatch(fetchBankAccounts()); }, [dispatch]);

  useEffect(() => {
    if (!selBank) return;
    dispatch(fetchBankTxs({ bankAccountId: selBank, isReconciled: false, take: 100 }));
    financeApi.get(`/reconcile/${selBank}/status`).then(r => setReconStatus(r.data.data));
  }, [dispatch, selBank]);

  const totalBalance = bankAccounts.reduce((s: number, b: any) => s + b.balance, 0);

  const doReconcile = async (txId: string, matchedPaymentId: string, status: string) => {
    setBusy(true);
    try {
      await financeApi.post('/reconcile', {
        bankAccountId    : selBank,
        bankTransactionId: txId,
        matchedPaymentId : matchedPaymentId || undefined,
        status,
        notes            : notes || undefined,
      });
      dispatch(fetchBankTxs({ bankAccountId: selBank, isReconciled: false, take: 100 }));
      financeApi.get(`/reconcile/${selBank}/status`).then(r => setReconStatus(r.data.data));
      setMatchDialog(null);
      setPaymentId('');
      setNotes('');
    } finally { setBusy(false); }
  };

  const txCols = [
    { label: 'Date',        render: (r: any) => <Typography sx={{ color: F.text, fontSize: 12 }}>{DATE(r.transactionDate)}</Typography> },
    { label: 'Description', render: (r: any) => <Typography sx={{ color: F.text, fontSize: 12.5 }}>{r.description}</Typography> },
    { label: 'Ref',         render: (r: any) => <Typography sx={{ color: F.textSub, fontSize: 11, fontFamily: 'monospace' }}>{r.referenceNumber ?? '—'}</Typography> },
    { label: 'Type',        render: (r: any) => (
      <Chip label={r.type} size="small"
        sx={{ fontSize: 10, height: 19,
          bgcolor: r.type === 'CREDIT' ? `${F.green}12` : `${F.red}12`,
          color  : r.type === 'CREDIT' ? F.green : F.red }} />
    )},
    { label: 'Amount', align: 'right' as const, render: (r: any) => (
      <Typography sx={{ color: r.type === 'CREDIT' ? F.green : F.red, fontSize: 13, fontWeight: 600 }}>
        {r.type === 'DEBIT' ? '−' : '+'}{INR(r.amount)}
      </Typography>
    )},
    { label: 'Status', render: (r: any) => (
      <Chip label={r.isReconciled ? 'Reconciled' : 'Pending'}
        size="small"
        sx={{ fontSize: 10, height: 19,
          bgcolor: r.isReconciled ? `${F.green}12` : `${F.amber}12`,
          color  : r.isReconciled ? F.green : F.amber }} />
    )},
    { label: '', render: (r: any) => !r.isReconciled ? (
      <Box display="flex" gap={0.25}>
        <Tooltip title="Match with Payment">
          <IconButton size="small" sx={{ color: F.green, p: 0.4 }}
            onClick={() => setMatchDialog(r)}>
            <CheckCircle sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Mark as Unmatched">
          <IconButton size="small" sx={{ color: F.coral, p: 0.4 }}
            onClick={() => doReconcile(r.id, '', 'UNMATCHED')}>
            <Cancel sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
      </Box>
    ) : null },
  ];

  return (
    <Box>
      <PageHeader
        title="Bank Reconciliation"
        subtitle="Match bank transactions with recorded payments"
        action={
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={() => selBank && dispatch(fetchBankTxs({ bankAccountId: selBank, isReconciled: false, take: 100 }))}
              sx={{ color: F.muted, border: `1px solid ${F.border}`, borderRadius: '8px', p: 0.75 }}>
              <Refresh sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        }
      />

      {/* Bank selector */}
      <Grid container spacing={2} mb={3}>
        {bankAccounts.map((b: any) => (
          <Grid item xs={12} sm={6} md={4} key={b.id}>
            <Box onClick={() => setSelBank(b.id)} sx={{
              bgcolor: selBank === b.id ? `${F.primary}12` : F.surface,
              borderRadius: '12px', p: 2, cursor: 'pointer',
              border: `1px solid ${selBank === b.id ? `${F.primary}40` : F.border}`,
              '&:hover': { bgcolor: `${F.primary}08` },
            }}>
              <Typography sx={{ color: F.text, fontWeight: 600, fontSize: 13.5 }}>{b.bankName}</Typography>
              <Typography sx={{ color: F.textSub, fontSize: 12 }}>{b.accountName}</Typography>
              <Typography sx={{ color: F.gold, fontWeight: 700, fontSize: 18, mt: 0.5 }}>{INR(b.balance)}</Typography>
              <Typography sx={{ color: F.textSub, fontSize: 11, fontFamily: 'monospace', mt: 0.25 }}>
                •••• {String(b.accountNumber).slice(-4)}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Reconciliation stats */}
      {selBank && reconStatus && (
        <Grid container spacing={1.5} mb={2.5}>
          {[
            { label: 'Matched',   value: reconStatus.matched,   accent: F.green,   icon: <CheckCircle /> },
            { label: 'Unmatched', value: reconStatus.unmatched, accent: F.red,     icon: <Cancel /> },
            { label: 'Partial',   value: reconStatus.partial,   accent: F.amber,   icon: <CompareArrows /> },
            { label: 'Pending',   value: bankTransactions.data.filter((t: any) => !t.isReconciled).length, accent: F.primary, icon: <CompareArrows /> },
          ].map(c => (
            <Grid item xs={6} sm={3} key={c.label}>
              <StatCard {...c} loading={!!loading.bankTxs} sub={undefined} />
            </Grid>
          ))}
        </Grid>
      )}

      {selBank ? (
        <Card title={`Transactions — ${bankAccounts.find((b: any) => b.id === selBank)?.bankName ?? ''}`}>
          <DataTable
            columns={txCols}
            rows={bankTransactions.data}
            loading={!!loading.bankTxs}
            emptyMsg="All transactions reconciled 🎉"
            compact
          />
        </Card>
      ) : (
        <Box py={6} textAlign="center">
          <CompareArrows sx={{ fontSize: 48, color: F.border, mb: 2 }} />
          <Typography sx={{ color: F.textSub, fontSize: 14 }}>
            Select a bank account above to start reconciliation
          </Typography>
        </Box>
      )}

      {/* Match dialog */}
      <Dialog open={!!matchDialog} onClose={() => { setMatchDialog(null); setPaymentId(''); setNotes(''); }}
        maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: F.surface, border: `1px solid ${F.border}`, borderRadius: '14px' } }}>
        <DialogTitle sx={{ color: F.text, fontWeight: 700, fontSize: 15, pb: 1 }}>
          Match Transaction
        </DialogTitle>
        <DialogContent>
          {matchDialog && (
            <Box sx={{ bgcolor: F.surfaceHigh, borderRadius: '10px', p: 2, mb: 2 }}>
              <Typography sx={{ color: F.textSub, fontSize: 12, mb: 0.5 }}>Bank Transaction</Typography>
              <Typography sx={{ color: F.text, fontSize: 13, fontWeight: 500 }}>{matchDialog.description}</Typography>
              <Box display="flex" gap={2} mt={0.75}>
                <Typography sx={{ color: matchDialog.type === 'CREDIT' ? F.green : F.red, fontSize: 14, fontWeight: 700 }}>
                  {matchDialog.type === 'DEBIT' ? '−' : '+'}{INR(matchDialog.amount)}
                </Typography>
                <Typography sx={{ color: F.textSub, fontSize: 12 }}>{DATE(matchDialog.transactionDate)}</Typography>
                <Typography sx={{ color: F.textSub, fontSize: 11, fontFamily: 'monospace' }}>{matchDialog.referenceNumber ?? '—'}</Typography>
              </Box>
            </Box>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Payment ID to Match (optional)"
                value={paymentId} onChange={e => setPaymentId(e.target.value)}
                sx={fieldSx} InputLabelProps={{ sx: labelSx }}
                helperText="Leave blank if no matching payment record"
                FormHelperTextProps={{ sx: { color: F.textSub, fontSize: 11 } }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Notes (optional)" multiline rows={2}
                value={notes} onChange={e => setNotes(e.target.value)}
                sx={fieldSx} InputLabelProps={{ sx: labelSx }} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setMatchDialog(null)} sx={{ color: F.textSub, textTransform: 'none', fontSize: 13 }}>Cancel</Button>
          <Button variant="outlined" disabled={busy}
            onClick={() => doReconcile(matchDialog?.id, paymentId, 'PARTIAL')}
            sx={{ color: F.amber, borderColor: `${F.amber}50`, textTransform: 'none', fontSize: 13, borderRadius: '8px' }}>
            Partial Match
          </Button>
          <Button variant="contained" disabled={busy}
            onClick={() => doReconcile(matchDialog?.id, paymentId, 'MATCHED')}
            sx={{ bgcolor: F.green, textTransform: 'none', fontWeight: 600, fontSize: 13, borderRadius: '8px' }}>
            ✓ Match
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
