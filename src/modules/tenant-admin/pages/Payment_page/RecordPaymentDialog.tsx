import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Stack, Button, TextField, Chip,
  IconButton, Divider, Grid, Paper, FormControl,
  InputLabel, Select, MenuItem, Alert, CircularProgress,
  InputAdornment, Collapse, Slider
} from '@mui/material';
import {
  CloseOutlined, ReceiptOutlined, CheckCircleOutlined,
  WarningAmberOutlined, AccountBalanceOutlined
} from '@mui/icons-material';
import {
  Installment, Payment, PaymentMode,
  PAYMENT_MODE_CFG, INSTALLMENT_STATUS_CFG,
  fmtINRFull, fmtINR, formatDate, getDueDateLabel
} from './paymentTypes';
import api from '../../../../api/axios';

interface Props {
  open: boolean;
  onClose: () => void;
  installment: Installment | null;
  bookingId: string;
  onSave: () => void;
}

const RecordPaymentDialog: React.FC<Props> = ({ open, onClose, installment, bookingId, onSave }) => {
  const remaining = installment ? installment.amount - installment.paidAmount : 0;
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState<PaymentMode>('BANK_TRANSFER');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [txRef, setTxRef] = useState('');
  const [chequeNumber, setChequeNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [notes, setNotes] = useState('');
  const [gstIncluded, setGstIncluded] = useState(false);
  const [tdsDeducted, setTdsDeducted] = useState(false);
  const [tdsRate, setTdsRate] = useState(1);
  const [saving, setSaving] = useState(false);
  const [generateReceipt, setGenerateReceipt] = useState(true);

  useEffect(() => {
    if (open && installment) {
      setAmount(String(remaining));
      setMode('BANK_TRANSFER');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setTxRef(''); setChequeNumber(''); setBankName('');
      setNotes(''); setGstIncluded(false); setTdsDeducted(false);
    }
  }, [open, installment]);

  const amountNum = parseFloat(amount) || 0;
  const isPartial = amountNum < remaining && amountNum > 0;
  const isOverpay = amountNum > remaining;
  const gstAmount = gstIncluded ? Math.round(amountNum * 0.18) : 0;
  const tdsAmount = tdsDeducted ? Math.round(amountNum * tdsRate / 100) : 0;
  const netAmount = amountNum - tdsAmount;

  const handleSave = async () => {
    if (!installment || amountNum <= 0) return;
    setSaving(true);
    try {
      const payload: any = {
        bookingId, installmentId: installment.id,
        amount: amountNum, paymentDate,
        paymentMode: mode, transactionRef: txRef,
        chequeNumber: mode === 'CHEQUE' ? chequeNumber : undefined,
        bankName: mode === 'CHEQUE' || mode === 'BANK_TRANSFER' ? bankName : undefined,
        notes, generateReceipt,
        gstAmount: gstIncluded ? gstAmount : undefined,
        tdsAmount: tdsDeducted ? tdsAmount : undefined,
      };
      await api.post('/payments', payload);
      onSave(); onClose();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  if (!installment) return null;
  const stCfg = INSTALLMENT_STATUS_CFG[installment.status];
  const dueLbl = getDueDateLabel(installment.dueDate, installment.status);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 4, maxHeight: '94vh' } }}>

      <Box sx={{ px: 3.5, pt: 3, pb: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 900, fontSize: '1.4rem' }}>
              💳 Record Payment
            </Typography>
            <Typography variant="caption" color="text.secondary">{installment.installmentName}</Typography>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CloseOutlined fontSize="small" />
          </IconButton>
        </Stack>

        {/* Installment summary bar */}
        <Paper sx={{ mt: 2, p: 2, borderRadius: 3, bgcolor: '#0f172a', color: '#fff' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={6} sm={3}>
              <Typography sx={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Total Due</Typography>
              <Typography fontWeight={900} fontSize="1.1rem">{fmtINRFull(installment.amount)}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography sx={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Already Paid</Typography>
              <Typography fontWeight={800} fontSize="1rem" sx={{ color: '#10b981' }}>{fmtINRFull(installment.paidAmount)}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography sx={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Remaining</Typography>
              <Typography fontWeight={900} fontSize="1.1rem" sx={{ color: '#f59e0b' }}>{fmtINRFull(remaining)}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography sx={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Due Date</Typography>
              <Typography fontWeight={800} fontSize="0.85rem"
                sx={{ color: dueLbl.includes('overdue') ? '#ef4444' : '#e2e8f0' }}>
                {dueLbl}
              </Typography>
            </Grid>
          </Grid>
          {installment.paidAmount > 0 && (
            <Box sx={{ mt: 1.5 }}>
              <Box sx={{ height: 5, borderRadius: 3, bgcolor: '#1e293b', overflow: 'hidden' }}>
                <Box sx={{ height: '100%', width: `${Math.min(100, Math.round(installment.paidAmount / installment.amount * 100))}%`, bgcolor: '#10b981', borderRadius: 3 }} />
              </Box>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: 10 }}>
                {Math.round(installment.paidAmount / installment.amount * 100)}% paid
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>

      <Divider />
      <DialogContent sx={{ px: 3.5, py: 3 }}>
        <Stack spacing={3}>
          {/* Amount */}
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 1, color: '#6b7280', display: 'block', mb: 1 }}>
              Payment Amount *
            </Typography>
            <TextField fullWidth size="medium" value={amount}
              onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder={`Max: ${fmtINRFull(remaining)}`}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Typography fontWeight={800} color="text.secondary">₹</Typography></InputAdornment>,
                sx: { borderRadius: 3, fontSize: '1.4rem', fontWeight: 900 }
              }}
              sx={{ '& input': { fontSize: '1.4rem', fontWeight: 900 } }} />

            {/* Quick amount buttons */}
            <Stack direction="row" spacing={1} mt={1.25} flexWrap="wrap">
              {[25, 50, 75, 100].map(pct => (
                <Chip key={pct} label={`${pct}% · ${fmtINR(Math.round(remaining * pct / 100))}`}
                  size="small" clickable onClick={() => setAmount(String(Math.round(remaining * pct / 100)))}
                  variant={Math.round(parseFloat(amount)) === Math.round(remaining * pct / 100) ? 'filled' : 'outlined'}
                  color={Math.round(parseFloat(amount)) === Math.round(remaining * pct / 100) ? 'primary' : 'default'}
                  sx={{ fontWeight: 700, fontSize: 11, my: 0.25 }} />
              ))}
            </Stack>

            {isPartial && (
              <Alert severity="warning" sx={{ mt: 1.5, borderRadius: 3 }}>
                ⚡ <strong>Partial payment</strong> — ₹{(remaining - amountNum).toLocaleString('en-IN')} will remain outstanding
              </Alert>
            )}
            {isOverpay && (
              <Alert severity="error" sx={{ mt: 1.5, borderRadius: 3 }}>
                ❌ Amount exceeds remaining balance of {fmtINRFull(remaining)}
              </Alert>
            )}
          </Box>

          {/* Payment Mode */}
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 1, color: '#6b7280', display: 'block', mb: 1.25 }}>
              Payment Mode *
            </Typography>
            <Grid container spacing={1.25}>
              {Object.entries(PAYMENT_MODE_CFG).map(([k, v]) => (
                <Grid item xs={4} key={k}>
                  <Box onClick={() => setMode(k as PaymentMode)}
                    sx={{
                      p: 1.75, borderRadius: 3, textAlign: 'center', cursor: 'pointer',
                      border: '2px solid', transition: 'all .15s',
                      borderColor: mode === k ? v.color : '#e5e7eb',
                      bgcolor: mode === k ? v.bg : '#fff',
                      '&:hover': { borderColor: v.color }
                    }}>
                    <Typography fontSize={20} mb={0.25}>{v.icon}</Typography>
                    <Typography variant="caption" fontWeight={800} sx={{ color: mode === k ? v.color : '#9ca3af', fontSize: 10 }}>
                      {v.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Mode-specific fields */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 1, color: '#6b7280', display: 'block', mb: 1 }}>
                Payment Date *
              </Typography>
              <TextField fullWidth size="small" type="date" value={paymentDate}
                onChange={e => setPaymentDate(e.target.value)}
                inputProps={{ max: new Date().toISOString().split('T')[0] }}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 1, color: '#6b7280', display: 'block', mb: 1 }}>
                Transaction Reference {mode !== 'CASH' ? '*' : ''}
              </Typography>
              <TextField fullWidth size="small" value={txRef}
                onChange={e => setTxRef(e.target.value)}
                placeholder={mode === 'UPI' ? 'UPI Transaction ID' : mode === 'BANK_TRANSFER' ? 'NEFT/RTGS/IMPS Ref' : 'Reference number'}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
            </Grid>
            {mode === 'CHEQUE' && (
              <>
                <Grid item xs={6}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 1, color: '#6b7280', display: 'block', mb: 1 }}>Cheque Number</Typography>
                  <TextField fullWidth size="small" value={chequeNumber} onChange={e => setChequeNumber(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
                </Grid>
                <Grid item xs={6}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 1, color: '#6b7280', display: 'block', mb: 1 }}>Bank Name</Typography>
                  <TextField fullWidth size="small" value={bankName} onChange={e => setBankName(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
                </Grid>
              </>
            )}
            {mode === 'LOAN' && (
              <Grid item xs={12}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 1, color: '#6b7280', display: 'block', mb: 1 }}>Bank / Lender Name</Typography>
                <TextField fullWidth size="small" value={bankName} onChange={e => setBankName(e.target.value)} placeholder="SBI, HDFC, ICICI..." sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
              </Grid>
            )}
            {mode === 'BANK_TRANSFER' && (
              <Grid item xs={12}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 1, color: '#6b7280', display: 'block', mb: 1 }}>Bank Name (Optional)</Typography>
                <TextField fullWidth size="small" value={bankName} onChange={e => setBankName(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
              </Grid>
            )}
          </Grid>

          {/* GST / TDS section */}
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: '#fafafa' }}>
            <Typography variant="body2" fontWeight={800} mb={1.5}>🧾 Tax Details</Typography>
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" fontWeight={700}>GST Included (18%)</Typography>
                  <Typography variant="caption" color="text.secondary">Mark if GST is part of this payment</Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  {[true, false].map(v => (
                    <Box key={String(v)} onClick={() => setGstIncluded(v)}
                      sx={{
                        px: 2, py: 0.75, borderRadius: 2, cursor: 'pointer', fontWeight: 800, fontSize: 12,
                        border: '1.5px solid', transition: 'all .12s',
                        borderColor: gstIncluded === v ? (v ? '#10b981' : '#9ca3af') : '#e5e7eb',
                        bgcolor: gstIncluded === v ? (v ? '#d1fae5' : '#f3f4f6') : '#fff',
                        color: gstIncluded === v ? (v ? '#059669' : '#6b7280') : '#9ca3af',
                      }}>
                      {v ? 'Yes' : 'No'}
                    </Box>
                  ))}
                </Stack>
              </Stack>
              {gstIncluded && (
                <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 700 }}>
                  GST component: {fmtINRFull(gstAmount)} (18% of ₹{amountNum.toLocaleString('en-IN')})
                </Typography>
              )}

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" fontWeight={700}>TDS Deducted</Typography>
                  <Typography variant="caption" color="text.secondary">Tax deducted at source by customer</Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  {[true, false].map(v => (
                    <Box key={String(v)} onClick={() => setTdsDeducted(v)}
                      sx={{
                        px: 2, py: 0.75, borderRadius: 2, cursor: 'pointer', fontWeight: 800, fontSize: 12,
                        border: '1.5px solid', transition: 'all .12s',
                        borderColor: tdsDeducted === v ? (v ? '#6366f1' : '#9ca3af') : '#e5e7eb',
                        bgcolor: tdsDeducted === v ? (v ? '#eef2ff' : '#f3f4f6') : '#fff',
                        color: tdsDeducted === v ? (v ? '#4338ca' : '#6b7280') : '#9ca3af',
                      }}>
                      {v ? 'Yes' : 'No'}
                    </Box>
                  ))}
                </Stack>
              </Stack>
              {tdsDeducted && (
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="caption" fontWeight={700} sx={{ whiteSpace: 'nowrap' }}>TDS Rate: {tdsRate}%</Typography>
                  <Slider value={tdsRate} onChange={(_, v) => setTdsRate(v as number)} min={0.5} max={5} step={0.5} size="small" sx={{ flex: 1 }} />
                  <Typography variant="caption" sx={{ color: '#6366f1', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    TDS: {fmtINRFull(tdsAmount)}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Paper>

          <TextField fullWidth label="Notes (Optional)" size="small" multiline rows={2}
            value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Payment notes, any special instructions..."
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />

          {/* Receipt toggle */}
          <Stack direction="row" alignItems="center" justifyContent="space-between"
            sx={{ p: 2, borderRadius: 3, bgcolor: generateReceipt ? '#eef2ff' : '#f8fafc', border: '1.5px solid', borderColor: generateReceipt ? '#6366f1' : '#e5e7eb', cursor: 'pointer' }}
            onClick={() => setGenerateReceipt(r => !r)}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <ReceiptOutlined sx={{ color: generateReceipt ? '#6366f1' : '#9ca3af' }} />
              <Box>
                <Typography variant="body2" fontWeight={800} sx={{ color: generateReceipt ? '#4338ca' : 'text.primary' }}>
                  Generate PDF Receipt
                </Typography>
                <Typography variant="caption" color="text.secondary">Receipt will be emailed to customer</Typography>
              </Box>
            </Stack>
            <Box sx={{
              width: 44, height: 24, borderRadius: 12, bgcolor: generateReceipt ? '#6366f1' : '#d1d5db',
              position: 'relative', transition: 'all .2s',
            }}>
              <Box sx={{
                width: 18, height: 18, borderRadius: '50%', bgcolor: '#fff',
                position: 'absolute', top: 3, left: generateReceipt ? 23 : 3, transition: 'left .2s',
              }} />
            </Box>
          </Stack>

          {/* Net summary */}
          {amountNum > 0 && (
            <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: '#0f172a', color: '#fff' }}>
              <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, display: 'block', mb: 1.5 }}>
                Payment Summary
              </Typography>
              <Stack spacing={0.75}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>Gross Amount</Typography>
                  <Typography variant="body2" fontWeight={800} color="#fff">{fmtINRFull(amountNum)}</Typography>
                </Stack>
                {tdsDeducted && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>TDS Deducted ({tdsRate}%)</Typography>
                    <Typography variant="body2" fontWeight={700} sx={{ color: '#f59e0b' }}>– {fmtINRFull(tdsAmount)}</Typography>
                  </Stack>
                )}
                {gstIncluded && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>GST Component (18%)</Typography>
                    <Typography variant="body2" fontWeight={700} sx={{ color: '#e2e8f0' }}>{fmtINRFull(gstAmount)}</Typography>
                  </Stack>
                )}
                <Divider sx={{ borderColor: '#1e293b', my: 0.5 }} />
                <Stack direction="row" justifyContent="space-between">
                  <Typography fontWeight={800} sx={{ color: '#94a3b8' }}>Net Received</Typography>
                  <Typography fontWeight={900} fontSize="1.1rem" sx={{ color: '#10b981' }}>{fmtINRFull(netAmount)}</Typography>
                </Stack>
              </Stack>
            </Paper>
          )}
        </Stack>
      </DialogContent>

      <Divider />
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
        <Button variant="contained" disableElevation onClick={handleSave}
          disabled={saving || amountNum <= 0 || isOverpay || (mode !== 'CASH' && !txRef.trim())}
          sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2.5, px: 4 }}>
          {saving ? <CircularProgress size={18} color="inherit" /> : `Record ${fmtINRFull(amountNum)} Payment`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecordPaymentDialog;