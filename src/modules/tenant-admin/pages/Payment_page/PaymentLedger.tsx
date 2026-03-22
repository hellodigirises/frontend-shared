import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Stack, Button, TextField, Chip,
  IconButton, Divider, Grid, Paper, FormControl,
  InputLabel, Select, MenuItem, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert
} from '@mui/material';
import {
  CloseOutlined, DownloadOutlined, PrintOutlined, FilterListOutlined
} from '@mui/icons-material';
import {
  BookingFinancialSummary, LedgerEntry, Installment, Payment, Refund,
  LedgerEntryType, RefundStatus, PaymentMode,
  LEDGER_ENTRY_CFG, REFUND_STATUS_CFG, INSTALLMENT_STATUS_CFG,
  PAYMENT_MODE_CFG, fmtINRFull, fmtINR, formatDate, timeAgo
} from './paymentTypes';
import api from '../../../../api/axios';

// ─── Payment Ledger ───────────────────────────────────────────────────────────

export const PaymentLedger: React.FC<{
  summary: BookingFinancialSummary;
  onRefresh: () => void;
}> = ({ summary, onRefresh }) => {
  const { ledger, totalAmount, paidAmount, pendingAmount, overdueAmount } = summary;
  const balance = totalAmount - paidAmount;

  return (
    <Box>
      {/* Financial summary header */}
      <Box sx={{ p: 3, background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: 4, mb: 3, color: '#fff' }}>
        <Typography sx={{ fontFamily: '"Playfair Display", serif', fontSize: '1.25rem', fontWeight: 900, mb: 2.5 }}>
          📒 Financial Ledger
        </Typography>
        <Grid container spacing={3}>
          {[
            { label: 'Total Booking Value', value: totalAmount, color: '#e2e8f0', sub: '' },
            { label: 'Total Collected', value: paidAmount, color: '#10b981', sub: `${Math.round(paidAmount / totalAmount * 100)}% of total` },
            { label: 'Outstanding Balance', value: balance, color: '#f59e0b', sub: `${Math.round(balance / totalAmount * 100)}% remaining` },
            { label: 'Overdue Amount', value: overdueAmount, color: overdueAmount > 0 ? '#ef4444' : '#64748b', sub: overdueAmount > 0 ? '⚠ Needs attention' : 'All clear' },
          ].map(k => (
            <Grid item xs={6} sm={3} key={k.label}>
              <Typography sx={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>{k.label}</Typography>
              <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, color: k.color, mt: 0.25 }}>{fmtINRFull(k.value)}</Typography>
              <Typography sx={{ fontSize: 10, color: '#475569', mt: 0.25 }}>{k.sub}</Typography>
            </Grid>
          ))}
        </Grid>
        {/* Progress bar */}
        <Box sx={{ mt: 2.5, height: 8, borderRadius: 4, bgcolor: '#1e293b', overflow: 'hidden' }}>
          <Stack direction="row" sx={{ height: '100%' }}>
            <Box sx={{ width: `${Math.round(paidAmount / totalAmount * 100)}%`, bgcolor: '#10b981', transition: 'width .6s ease' }} />
            {overdueAmount > 0 && (
              <Box sx={{ width: `${Math.round(overdueAmount / totalAmount * 100)}%`, bgcolor: '#ef4444', transition: 'width .6s ease' }} />
            )}
          </Stack>
        </Box>
        <Stack direction="row" spacing={3} mt={1}>
          <Typography sx={{ fontSize: 10, color: '#94a3b8' }}>🟢 Paid {Math.round(paidAmount / totalAmount * 100)}%</Typography>
          {overdueAmount > 0 && <Typography sx={{ fontSize: 10, color: '#94a3b8' }}>🔴 Overdue {Math.round(overdueAmount / totalAmount * 100)}%</Typography>}
          <Typography sx={{ fontSize: 10, color: '#94a3b8' }}>⬜ Pending {Math.round(balance / totalAmount * 100)}%</Typography>
        </Stack>
      </Box>

      {/* Ledger table */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="body2" fontWeight={800}>Transaction History ({ledger.length} entries)</Typography>
        <Button size="small" startIcon={<DownloadOutlined />} variant="outlined"
          sx={{ textTransform: 'none', borderRadius: 2.5, fontWeight: 700 }}>Export</Button>
      </Stack>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                {['Date', 'Description', 'Entry Type', 'Debit (Due)', 'Credit (Paid)', 'Balance', 'By'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 800, fontSize: 11, py: 1.5 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {ledger.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                    <Typography fontSize={32} mb={1}>📒</Typography>
                    <Typography variant="body2">No ledger entries yet</Typography>
                  </TableCell>
                </TableRow>
              ) : ledger.map((entry, i) => {
                const cfg = LEDGER_ENTRY_CFG[entry.type];
                return (
                  <TableRow key={entry.id} hover sx={{ '& td': { py: 1.25 } }}>
                    <TableCell>
                      <Typography variant="caption" fontWeight={700}>{formatDate(entry.createdAt)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>{entry.description}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={`${cfg.icon} ${cfg.label}`} size="small"
                        sx={{ bgcolor: cfg.color + '18', color: cfg.color, fontWeight: 800, fontSize: 10, height: 22 }} />
                    </TableCell>
                    <TableCell>
                      {entry.debit ? (
                        <Typography variant="body2" fontWeight={800} sx={{ color: '#ef4444' }}>
                          {fmtINRFull(entry.debit)}
                        </Typography>
                      ) : <Typography color="text.secondary">—</Typography>}
                    </TableCell>
                    <TableCell>
                      {entry.credit ? (
                        <Typography variant="body2" fontWeight={800} sx={{ color: '#10b981' }}>
                          {fmtINRFull(entry.credit)}
                        </Typography>
                      ) : <Typography color="text.secondary">—</Typography>}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={900}
                        sx={{ color: entry.balance < 0 ? '#ef4444' : entry.balance === 0 ? '#10b981' : '#374151' }}>
                        {fmtINRFull(Math.abs(entry.balance))}
                        {entry.balance < 0 ? ' CR' : ' DR'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">{entry.createdBy?.name ?? 'System'}</Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

// ─── Refund Dialog ────────────────────────────────────────────────────────────

interface RefundProps {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  paymentId?: string;
  maxAmount?: number;
  onSave: () => void;
}

export const RefundDialog: React.FC<RefundProps> = ({ open, onClose, bookingId, paymentId, maxAmount, onSave }) => {
  const [form, setForm] = useState({
    amount: '',
    reason: '',
    refundMode: 'BANK_TRANSFER' as PaymentMode,
    referenceNumber: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const REFUND_REASONS = [
    'Booking Cancelled by Customer', 'Booking Cancelled by Builder',
    'Unit Not Available', 'Duplicate Payment', 'Excess Payment',
    'Agreement Not Executed', 'Other',
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/refunds', { bookingId, paymentId, ...form });
      onSave(); onClose();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs"
      PaperProps={{ sx: { borderRadius: 4 } }}>
      <Box sx={{ px: 3, pt: 3, pb: 2 }}>
        <Stack direction="row" justifyContent="space-between">
          <Box>
            <Typography sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 900 }}>↩️ Issue Refund</Typography>
            {maxAmount && <Typography variant="caption" color="text.secondary">Max refundable: {fmtINRFull(maxAmount)}</Typography>}
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}><CloseOutlined fontSize="small" /></IconButton>
        </Stack>
      </Box>
      <Divider />
      <DialogContent>
        <Stack spacing={2.5}>
          <TextField fullWidth label="Refund Amount *" size="small" value={form.amount}
            onChange={e => set('amount', e.target.value.replace(/[^0-9.]/g, ''))}
            InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />

          <FormControl fullWidth size="small">
            <InputLabel>Refund Reason *</InputLabel>
            <Select value={form.reason} label="Refund Reason *" onChange={e => set('reason', e.target.value)} sx={{ borderRadius: 2.5 }}>
              {REFUND_REASONS.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </Select>
          </FormControl>

          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 1, color: '#6b7280', display: 'block', mb: 1 }}>
              Refund Mode
            </Typography>
            <Grid container spacing={1}>
              {Object.entries(PAYMENT_MODE_CFG).filter(([k]) => k !== 'CASH').map(([k, v]) => (
                <Grid item xs={6} key={k}>
                  <Box onClick={() => set('refundMode', k)}
                    sx={{
                      p: 1.5, borderRadius: 2.5, textAlign: 'center', cursor: 'pointer', border: '1.5px solid',
                      borderColor: form.refundMode === k ? v.color : '#e5e7eb', bgcolor: form.refundMode === k ? v.bg : '#fff'
                    }}>
                    <Typography fontSize={16} mb={0.25}>{v.icon}</Typography>
                    <Typography variant="caption" fontWeight={800} sx={{ color: form.refundMode === k ? v.color : '#9ca3af', fontSize: 10 }}>{v.label}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          <TextField fullWidth label="Reference Number" size="small" value={form.referenceNumber}
            onChange={e => set('referenceNumber', e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
          <TextField fullWidth label="Notes" size="small" multiline rows={2}
            value={form.notes} onChange={e => set('notes', e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />

          <Alert severity="warning" sx={{ borderRadius: 3 }}>
            Refund will be queued for Finance approval before processing.
          </Alert>
        </Stack>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
        <Button variant="contained" disableElevation onClick={handleSave} disabled={saving || !form.amount || !form.reason}
          sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2.5, bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }}>
          {saving ? <CircularProgress size={18} color="inherit" /> : 'Submit Refund Request'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Adjustment Dialog ────────────────────────────────────────────────────────

interface AdjustmentProps {
  open: boolean;
  onClose: () => void;
  installment: Installment;
  onSave: () => void;
}

export const AdjustmentDialog: React.FC<AdjustmentProps> = ({ open, onClose, installment, onSave }) => {
  const [adjType, setAdjType] = useState<'PENALTY' | 'WAIVER' | 'DISCOUNT' | 'EXTRA'>('PENALTY');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const ADJ_TYPES = [
    { k: 'PENALTY', label: 'Late Penalty', icon: '⚠️', color: '#ef4444', desc: 'Add late payment charge' },
    { k: 'WAIVER', label: 'Waive Penalty', icon: '🎁', color: '#10b981', desc: 'Remove penalty charges' },
    { k: 'DISCOUNT', label: 'Apply Discount', icon: '🏷', color: '#0ea5e9', desc: 'Reduce installment amount' },
    { k: 'EXTRA', label: 'Extra Charge', icon: '➕', color: '#8b5cf6', desc: 'Add additional charges' },
  ] as const;

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post(`/installments/${installment.id}/adjustment`, { type: adjType, amount: parseFloat(amount), reason });
      onSave(); onClose();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 4 } }}>
      <Box sx={{ px: 3, pt: 3, pb: 2 }}>
        <Stack direction="row" justifyContent="space-between">
          <Box>
            <Typography sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 900 }}>🔧 Payment Adjustment</Typography>
            <Typography variant="caption" color="text.secondary">{installment.installmentName}</Typography>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}><CloseOutlined fontSize="small" /></IconButton>
        </Stack>
      </Box>
      <Divider />
      <DialogContent>
        <Stack spacing={2.5}>
          <Grid container spacing={1.25}>
            {ADJ_TYPES.map(({ k, label, icon, color, desc }) => (
              <Grid item xs={6} key={k}>
                <Box onClick={() => setAdjType(k as any)}
                  sx={{
                    p: 2, borderRadius: 3, textAlign: 'center', cursor: 'pointer', border: '2px solid',
                    borderColor: adjType === k ? color : '#e5e7eb', bgcolor: adjType === k ? color + '15' : '#fff'
                  }}>
                  <Typography fontSize={20} mb={0.25}>{icon}</Typography>
                  <Typography variant="caption" fontWeight={800} sx={{ color: adjType === k ? color : '#9ca3af', display: 'block', fontSize: 10 }}>{label}</Typography>
                  <Typography variant="caption" sx={{ fontSize: 9, color: '#9ca3af' }}>{desc}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <TextField fullWidth label="Amount (₹) *" size="small" value={amount}
            onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
            InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
          <TextField fullWidth label="Reason / Notes *" size="small" multiline rows={2}
            value={reason} onChange={e => setReason(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
        </Stack>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
        <Button variant="contained" disableElevation onClick={handleSave}
          disabled={saving || !amount || !reason}
          sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2.5 }}>
          {saving ? <CircularProgress size={18} color="inherit" /> : 'Apply Adjustment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentLedger;