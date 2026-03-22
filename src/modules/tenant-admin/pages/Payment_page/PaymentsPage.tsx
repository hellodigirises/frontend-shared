import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Stack, Button, Grid, Chip, IconButton,
  CircularProgress, Paper, Tab, Tabs, TextField, InputAdornment,
  FormControl, InputLabel, Select, MenuItem, Divider, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tooltip, LinearProgress, Alert, Badge
} from '@mui/material';
import {
  AddOutlined, SearchOutlined, DownloadOutlined, FilterListOutlined,
  ReceiptOutlined, RefreshOutlined, WarningAmberOutlined,
  AccountBalanceOutlined, TrendingUpOutlined, BarChartOutlined,
  TableRowsOutlined, SettingsOutlined, EditOutlined,
  CheckCircleOutlined, MoneyOffOutlined, AutoFixHighOutlined,
  NotificationsActiveOutlined, PrintOutlined
} from '@mui/icons-material';
import {
  Installment, Payment, BookingFinancialSummary,
  InstallmentStatus, PaymentMode, PaymentPlanTemplate,
  INSTALLMENT_STATUS_CFG, PAYMENT_MODE_CFG, PLAN_TYPE_CFG,
  MILESTONE_TAGS, fmtINRFull, fmtINR, formatDate, getDueDateLabel,
  isOverdue, daysUntilDue, avatarColor, initials, timeAgo
} from './paymentTypes';
import RecordPaymentDialog from './RecordPaymentDialog';
import { TemplateBuilderDialog, ApplyTemplateDialog } from './PaymentPlanTemplates';
import { PaymentLedger, RefundDialog, AdjustmentDialog } from './PaymentLedger';
import api from '../../../../api/axios';

// ─── Stat Card ────────────────────────────────────────────────────────────────
const KpiCard = ({ icon, label, value, sub, color, onClick, active }: any) => (
  <Paper variant="outlined" onClick={onClick}
    sx={{
      p: 2.5, borderRadius: 3.5, cursor: onClick ? 'pointer' : 'default',
      border: '1.5px solid', transition: 'all .2s',
      borderColor: active ? color : '#e5e7eb',
      bgcolor: active ? color + '0c' : '#fff',
      '&:hover': onClick ? { transform: 'translateY(-3px)', boxShadow: `0 12px 32px ${color}20`, borderColor: color } : {},
    }}>
    <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
      <Box>
        <Typography sx={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, color: '#9ca3af', mb: 1 }}>{label}</Typography>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color, lineHeight: 1 }}>{value}</Typography>
        {sub && <Typography sx={{ fontSize: 11, color: '#9ca3af', mt: 0.5, fontWeight: 600 }}>{sub}</Typography>}
      </Box>
      <Box sx={{ width: 44, height: 44, borderRadius: 3, bgcolor: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
        {icon}
      </Box>
    </Stack>
  </Paper>
);

// ─── Finance Analytics ────────────────────────────────────────────────────────
const FinanceAnalytics = ({ installments, payments }: { installments: Installment[]; payments: Payment[] }) => {
  const stats = useMemo(() => {
    const total = installments.reduce((s, i) => s + i.amount, 0);
    const collected = installments.reduce((s, i) => s + i.paidAmount, 0);
    const overdue = installments.filter(i => isOverdue(i.dueDate, i.status)).reduce((s, i) => s + (i.amount - i.paidAmount), 0);
    const waived = installments.filter(i => i.status === 'WAIVED').reduce((s, i) => s + i.amount, 0);
    const byMode = Object.entries(PAYMENT_MODE_CFG).map(([k, v]) => ({
      mode: k as PaymentMode, ...v,
      total: payments.filter(p => p.paymentMode === k).reduce((s, p) => s + p.amount, 0),
      count: payments.filter(p => p.paymentMode === k).length,
    })).filter(m => m.count > 0);

    return { total, collected, overdue, waived, pending: total - collected, collectionRate: total ? Math.round(collected / total * 100) : 0, byMode };
  }, [installments, payments]);

  // Monthly collections
  const monthlyData = useMemo(() => {
    const m: Record<string, number> = {};
    payments.forEach(p => {
      const k = p.paymentDate.slice(0, 7); // YYYY-MM
      m[k] = (m[k] ?? 0) + p.amount;
    });
    return Object.entries(m).sort((a, b) => a[0].localeCompare(b[0])).slice(-12);
  }, [payments]);

  const maxMonthly = Math.max(...monthlyData.map(m => m[1]), 1);

  const statusBreakdown = Object.entries(INSTALLMENT_STATUS_CFG).map(([k, v]) => ({
    ...v, key: k as InstallmentStatus,
    count: installments.filter(i => i.status === k).length,
    amount: installments.filter(i => i.status === k).reduce((s, i) => s + i.amount, 0),
  }));

  const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444', '#0ea5e9'];

  return (
    <Box>
      {/* KPI Strip */}
      <Grid container spacing={2} mb={4}>
        {[
          { icon: '💰', label: 'Total Receivable', value: fmtINR(stats.total), color: '#6366f1' },
          { icon: '✅', label: 'Total Collected', value: fmtINR(stats.collected), color: '#10b981', sub: `${stats.collectionRate}% collection rate` },
          { icon: '⏳', label: 'Pending', value: fmtINR(stats.pending), color: '#f59e0b' },
          { icon: '🔴', label: 'Overdue', value: fmtINR(stats.overdue), color: '#ef4444' },
          { icon: '🧾', label: 'Total Payments', value: payments.length, color: '#8b5cf6' },
          { icon: '🎁', label: 'Waived', value: fmtINR(stats.waived), color: '#9ca3af' },
        ].map(k => (
          <Grid item xs={6} sm={4} md={2} key={k.label}>
            <KpiCard {...k} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Collection progress */}
        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3.5, height: '100%' }}>
            <Typography variant="body1" fontWeight={800} mb={2.5}>📊 Installment Status</Typography>
            <Stack spacing={2}>
              {statusBreakdown.map(s => {
                const pct = installments.length ? Math.round(s.count / installments.length * 100) : 0;
                return (
                  <Stack key={s.key} direction="row" alignItems="center" spacing={2}>
                    <Typography fontSize={16} sx={{ width: 22 }}>{s.icon}</Typography>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" justifyContent="space-between" mb={0.4}>
                        <Typography variant="caption" fontWeight={700}>{s.label}</Typography>
                        <Stack direction="row" spacing={1.5}>
                          <Typography variant="caption" fontWeight={900} sx={{ color: s.color }}>{s.count} installments</Typography>
                          <Typography variant="caption" color="text.secondary">{fmtINR(s.amount)}</Typography>
                        </Stack>
                      </Stack>
                      <Box sx={{ height: 8, borderRadius: 4, bgcolor: '#f3f4f6', overflow: 'hidden' }}>
                        <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: s.color, borderRadius: 4, transition: 'width .6s ease' }} />
                      </Box>
                    </Box>
                  </Stack>
                );
              })}
            </Stack>

            <Divider sx={{ my: 2.5 }} />

            {/* Collection rate donut-like */}
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{
                width: 120, height: 120, borderRadius: '50%', mx: 'auto',
                background: `conic-gradient(#10b981 0% ${stats.collectionRate}%, #f3f4f6 ${stats.collectionRate}% 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'inset 0 0 0 28px #fff',
              }}>
                <Box>
                  <Typography variant="h5" fontWeight={900} sx={{ color: '#10b981', lineHeight: 1 }}>{stats.collectionRate}%</Typography>
                  <Typography variant="caption" color="text.secondary">collected</Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Monthly revenue */}
        <Grid item xs={12} md={7}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3.5 }}>
            <Typography variant="body1" fontWeight={800} mb={2.5}>📈 Monthly Collections</Typography>
            {monthlyData.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                <Typography>No payment data yet</Typography>
              </Box>
            ) : (
              <Stack spacing={1.25}>
                {monthlyData.map(([month, amount], i) => {
                  const pct = Math.round(amount / maxMonthly * 100);
                  const [y, m] = month.split('-');
                  const label = new Date(parseInt(y), parseInt(m) - 1).toLocaleString('en-IN', { month: 'short', year: '2-digit' });
                  return (
                    <Stack key={month} direction="row" alignItems="center" spacing={2}>
                      <Typography variant="caption" fontWeight={700} sx={{ width: 50 }}>{label}</Typography>
                      <Box sx={{ flex: 1, height: 26, bgcolor: '#f3f4f6', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
                        <Box sx={{
                          height: '100%', width: `${pct}%`, bgcolor: CHART_COLORS[i % 8], borderRadius: 2, transition: 'width .6s ease',
                          background: `linear-gradient(90deg, ${CHART_COLORS[i % 8]}, ${CHART_COLORS[(i + 1) % 8]})`
                        }} />
                      </Box>
                      <Typography variant="caption" fontWeight={900} sx={{ width: 72, textAlign: 'right' }}>{fmtINR(amount)}</Typography>
                    </Stack>
                  );
                })}
              </Stack>
            )}
          </Paper>

          {/* Payment mode breakdown */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3.5, mt: 3 }}>
            <Typography variant="body1" fontWeight={800} mb={2}>💳 By Payment Mode</Typography>
            {stats.byMode.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No payments recorded</Typography>
            ) : (
              <Stack direction="row" flexWrap="wrap" spacing={1.5}>
                {stats.byMode.map(m => (
                  <Box key={m.mode} sx={{ p: 2, borderRadius: 3, bgcolor: m.bg, border: `1px solid ${m.color}30`, minWidth: 120 }}>
                    <Typography fontSize={22} mb={0.5}>{m.icon}</Typography>
                    <Typography variant="body2" fontWeight={900} sx={{ color: m.color }}>{fmtINR(m.total)}</Typography>
                    <Typography variant="caption" fontWeight={700} sx={{ color: m.color }}>{m.label}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">{m.count} transactions</Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// ─── Installment Schedule ─────────────────────────────────────────────────────
const InstallmentSchedule = ({ installments, bookingId, onRecordPayment, onRefresh }: {
  installments: Installment[];
  bookingId: string;
  onRecordPayment: (i: Installment) => void;
  onRefresh: () => void;
}) => {
  const [adjustTarget, setAdjustTarget] = useState<Installment | null>(null);

  const sortedInstallments = [...installments].sort((a, b) => a.order - b.order);

  return (
    <Box>
      {adjustTarget && (
        <AdjustmentDialog open={!!adjustTarget} onClose={() => setAdjustTarget(null)}
          installment={adjustTarget} onSave={() => { setAdjustTarget(null); onRefresh(); }} />
      )}

      <Paper variant="outlined" sx={{ borderRadius: 3.5, overflow: 'hidden' }}>
        <Box sx={{ px: 3, py: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body1" fontWeight={800}>
              Installment Schedule ({installments.length} installments)
            </Typography>
            <Stack direction="row" spacing={1}>
              {installments.filter(i => isOverdue(i.dueDate, i.status)).length > 0 && (
                <Chip label={`⚠ ${installments.filter(i => isOverdue(i.dueDate, i.status)).length} overdue`}
                  size="small" sx={{ bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 800 }} />
              )}
            </Stack>
          </Stack>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                {['#', 'Installment', 'Total Amount', 'Paid', 'Remaining', 'Due Date', 'Status', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 800, fontSize: 11, py: 1.5, color: '#374151' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedInstallments.map((inst, idx) => {
                const stCfg = INSTALLMENT_STATUS_CFG[inst.status];
                const remaining = inst.amount - inst.paidAmount;
                const pct = inst.amount ? Math.round(inst.paidAmount / inst.amount * 100) : 0;
                const dueDays = daysUntilDue(inst.dueDate);
                const overdue = isOverdue(inst.dueDate, inst.status);
                const mTag = MILESTONE_TAGS.find(m => m.value === inst.milestoneTag);
                const canPay = inst.status !== 'PAID' && inst.status !== 'WAIVED';

                return (
                  <TableRow key={inst.id} hover
                    sx={{ '& td': { py: 1.5 }, bgcolor: overdue ? '#fff8f8' : 'inherit' }}>
                    <TableCell>
                      <Typography variant="caption" fontWeight={800} color="text.secondary">{idx + 1}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {mTag && <Typography fontSize={16}>{mTag.icon}</Typography>}
                          <Typography variant="body2" fontWeight={800}>{inst.installmentName}</Typography>
                        </Stack>
                        {inst.description && (
                          <Typography variant="caption" color="text.secondary">{inst.description}</Typography>
                        )}
                        {inst.penalty && !inst.penaltyWaived && (
                          <Chip label={`⚠ Penalty: ${fmtINR(inst.penalty)}`} size="small"
                            sx={{ mt: 0.25, fontSize: 9, height: 16, bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 700 }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={800}>{fmtINRFull(inst.amount)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={800} sx={{ color: '#10b981' }}>
                        {inst.paidAmount > 0 ? fmtINRFull(inst.paidAmount) : '—'}
                      </Typography>
                      {inst.paidAmount > 0 && (
                        <Box sx={{ mt: 0.5, height: 4, width: 60, borderRadius: 2, bgcolor: '#f3f4f6', overflow: 'hidden' }}>
                          <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: '#10b981', borderRadius: 2 }} />
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={900}
                        sx={{ color: overdue ? '#ef4444' : remaining === 0 ? '#10b981' : 'text.primary' }}>
                        {remaining > 0 ? fmtINRFull(remaining) : '✅ Clear'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}
                        sx={{ color: overdue ? '#ef4444' : dueDays <= 3 && dueDays >= 0 ? '#f59e0b' : 'text.primary' }}>
                        {getDueDateLabel(inst.dueDate, inst.status)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">{formatDate(inst.dueDate)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={`${stCfg.icon} ${stCfg.label}`} size="small"
                        sx={{ bgcolor: stCfg.bg, color: stCfg.color, fontWeight: 800, fontSize: 10, height: 22 }} />
                      {overdue && (
                        <Chip label="OVERDUE" size="small"
                          sx={{ ml: 0.5, fontSize: 9, height: 18, bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 800 }} />
                      )}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        {canPay && (
                          <Tooltip title="Record Payment">
                            <Button size="small" variant="contained" disableElevation
                              onClick={() => onRecordPayment(inst)}
                              sx={{
                                textTransform: 'none', fontWeight: 800, fontSize: 11, borderRadius: 2, px: 1.5, py: 0.5,
                                bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }
                              }}>
                              Pay
                            </Button>
                          </Tooltip>
                        )}
                        <Tooltip title="Adjustment">
                          <IconButton size="small" onClick={() => setAdjustTarget(inst)}>
                            <AutoFixHighOutlined sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
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

// ─── Payment History ──────────────────────────────────────────────────────────
const PaymentHistory = ({ payments, onRefund }: { payments: Payment[]; onRefund: (p: Payment) => void }) => (
  <Paper variant="outlined" sx={{ borderRadius: 3.5, overflow: 'hidden' }}>
    <Box sx={{ px: 3, py: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body1" fontWeight={800}>Payment History ({payments.length})</Typography>
        <Button size="small" startIcon={<DownloadOutlined />} sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}>Export</Button>
      </Stack>
    </Box>
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: '#f8fafc' }}>
            {['Receipt', 'Date', 'Installment', 'Amount', 'Mode', 'Reference', 'Recorded By', ''].map(h => (
              <TableCell key={h} sx={{ fontWeight: 800, fontSize: 11, py: 1.5 }}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                <Typography fontSize={32} mb={1}>🧾</Typography>
                <Typography variant="body2">No payments recorded yet</Typography>
              </TableCell>
            </TableRow>
          ) : payments.map(p => {
            const modeCfg = PAYMENT_MODE_CFG[p.paymentMode];
            return (
              <TableRow key={p.id} hover sx={{ '& td': { py: 1.25 } }}>
                <TableCell>
                  <Typography variant="caption" fontWeight={800} sx={{ color: '#6366f1' }}>{p.receiptNumber ?? '—'}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" fontWeight={700}>{formatDate(p.paymentDate)}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={700} sx={{ fontSize: 12 }}>
                    {p.installmentId ? `Installment` : 'General'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={900} sx={{ color: '#10b981' }}>{fmtINRFull(p.amount)}</Typography>
                  {p.tdsAmount && (
                    <Typography variant="caption" color="text.secondary">TDS: {fmtINRFull(p.tdsAmount)}</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip label={`${modeCfg.icon} ${modeCfg.label}`} size="small"
                    sx={{ bgcolor: modeCfg.bg, color: modeCfg.color, fontWeight: 800, fontSize: 10, height: 22 }} />
                </TableCell>
                <TableCell>
                  <Typography variant="caption" fontWeight={700}>{p.transactionRef ?? p.chequeNumber ?? '—'}</Typography>
                  {p.bankName && <Typography variant="caption" color="text.secondary" display="block">{p.bankName}</Typography>}
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">{p.recordedBy?.name ?? 'System'}</Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5}>
                    {p.receiptUrl && (
                      <Tooltip title="Download Receipt">
                        <IconButton size="small" sx={{ color: '#6366f1' }}>
                          <ReceiptOutlined sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Issue Refund">
                      <IconButton size="small" onClick={() => onRefund(p)} sx={{ color: '#ef4444' }}>
                        <MoneyOffOutlined sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  </Paper>
);

// ─── Main PaymentsPage ────────────────────────────────────────────────────────
const PaymentsPage: React.FC = () => {
  const [summaries, setSummaries] = useState<BookingFinancialSummary[]>([]);
  const [allInstallments, setAllInstallments] = useState<Installment[]>([]);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [templates, setTemplates] = useState<PaymentPlanTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [mainTab, setMainTab] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Dialog states
  const [recordPayTarget, setRecordPayTarget] = useState<Installment | null>(null);
  const [recordPayBooking, setRecordPayBooking] = useState('');
  const [templateBuilderOpen, setTemplateBuilderOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<PaymentPlanTemplate | null>(null);
  const [refundTarget, setRefundTarget] = useState<Payment | null>(null);

  const fetchData = async () => {
    try {
      const [iRes, pRes, tRes] = await Promise.all([
        api.get('/installments'),
        api.get('/payments'),
        api.get('/payment-plan-templates'),
      ]);
      setAllInstallments(iRes.data?.data ?? iRes.data ?? []);
      setAllPayments(pRes.data?.data ?? pRes.data ?? []);
      setTemplates(tRes.data?.data ?? tRes.data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // Aggregate stats
  const totalReceivable = allInstallments.reduce((s, i) => s + i.amount, 0);
  const totalCollected = allInstallments.reduce((s, i) => s + i.paidAmount, 0);
  const totalOverdue = allInstallments.filter(i => isOverdue(i.dueDate, i.status)).reduce((s, i) => s + (i.amount - i.paidAmount), 0);
  const overdueCount = allInstallments.filter(i => isOverdue(i.dueDate, i.status)).length;
  const dueThisWeek = allInstallments.filter(i => {
    const d = daysUntilDue(i.dueDate);
    return d >= 0 && d <= 7 && i.status !== 'PAID' && i.status !== 'WAIVED';
  }).length;

  const filtered = useMemo(() => allInstallments.filter(i => {
    const matchStatus = statusFilter === 'ALL' || i.status === statusFilter ||
      (statusFilter === 'OVERDUE' && isOverdue(i.dueDate, i.status));
    return matchStatus;
  }), [allInstallments, statusFilter]);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#fafafa', minHeight: '100vh' }}>
      {/* Header */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-start' }} mb={4} spacing={2}>
        <Box>
          <Typography sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 900, fontSize: '2.25rem', letterSpacing: -1.5, lineHeight: 1.1, color: '#0f172a' }}>
            Payments
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={0.75}>
            Installment schedules · Collections · Receipts · Analytics
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" startIcon={<SettingsOutlined />}
            onClick={() => { setEditTemplate(null); setTemplateBuilderOpen(true); }}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 3 }}>
            Payment Plans
          </Button>
          <Button variant="outlined" startIcon={<DownloadOutlined />}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 3 }}>
            Export
          </Button>
        </Stack>
      </Stack>

      {/* KPI Strip */}
      <Grid container spacing={2} mb={3.5}>
        {[
          { icon: '💰', label: 'Total Receivable', value: fmtINR(totalReceivable), color: '#6366f1' },
          { icon: '✅', label: 'Total Collected', value: fmtINR(totalCollected), color: '#10b981', sub: `${totalReceivable ? Math.round(totalCollected / totalReceivable * 100) : 0}% collected` },
          { icon: '⏳', label: 'Outstanding', value: fmtINR(totalReceivable - totalCollected), color: '#f59e0b' },
          { icon: '🔴', label: 'Total Overdue', value: fmtINR(totalOverdue), color: '#ef4444', sub: `${overdueCount} installments` },
          { icon: '📅', label: 'Due This Week', value: dueThisWeek, color: '#8b5cf6' },
          { icon: '🧾', label: 'Payments', value: allPayments.length, color: '#0ea5e9' },
        ].map(k => (
          <Grid item xs={6} sm={4} md={2} key={k.label}>
            <KpiCard {...k} />
          </Grid>
        ))}
      </Grid>

      {/* Alert strip */}
      {(overdueCount > 0 || dueThisWeek > 0) && (
        <Stack direction="row" spacing={1.5} mb={3} flexWrap="wrap">
          {overdueCount > 0 && (
            <Chip icon={<WarningAmberOutlined sx={{ fontSize: '14px !important' }} />}
              label={`${overdueCount} overdue installments · ${fmtINR(totalOverdue)} pending`}
              clickable onClick={() => setStatusFilter('OVERDUE')}
              sx={{ bgcolor: '#fee2e2', color: '#991b1b', fontWeight: 800, fontSize: 11, height: 28 }} />
          )}
          {dueThisWeek > 0 && (
            <Chip label={`📅 ${dueThisWeek} installments due this week`}
              sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 800, fontSize: 11, height: 28 }} />
          )}
        </Stack>
      )}

      {/* View Tabs */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
        <Tabs value={mainTab} onChange={(_, v) => setMainTab(v)}
          TabIndicatorProps={{ sx: { height: 3, borderRadius: 2 } }}>
          {[
            { icon: <AccountBalanceOutlined sx={{ fontSize: 17 }} />, label: 'Installments' },
            { icon: <ReceiptOutlined sx={{ fontSize: 17 }} />, label: 'Payments' },
            { icon: <TrendingUpOutlined sx={{ fontSize: 17 }} />, label: 'Analytics' },
            { icon: <SettingsOutlined sx={{ fontSize: 17 }} />, label: 'Plan Templates' },
          ].map((t, i) => (
            <Tab key={i} icon={t.icon} iconPosition="start" label={t.label}
              sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.82rem', minHeight: 44 }} />
          ))}
        </Tabs>
        <IconButton onClick={fetchData} size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <RefreshOutlined fontSize="small" />
        </IconButton>
      </Stack>

      {/* ── Tab 0: Installments ── */}
      {mainTab === 0 && (
        <>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 2.5 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <TextField fullWidth placeholder="Search installment, customer, project..."
                size="small" value={search} onChange={e => setSearch(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small" sx={{ color: '#9ca3af' }} /></InputAdornment>, sx: { borderRadius: 2.5 } }} />
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)} sx={{ borderRadius: 2.5 }}>
                  <MenuItem value="ALL">All Statuses</MenuItem>
                  <MenuItem value="OVERDUE">🔴 Overdue</MenuItem>
                  {Object.entries(INSTALLMENT_STATUS_CFG).map(([k, v]) => <MenuItem key={k} value={k}>{v.icon} {v.label}</MenuItem>)}
                </Select>
              </FormControl>
              {statusFilter !== 'ALL' && (
                <Button size="small" onClick={() => setStatusFilter('ALL')} color="inherit"
                  sx={{ textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}>Clear</Button>
              )}
            </Stack>
          </Paper>

          <Typography variant="body2" color="text.secondary" mb={1.5}>
            Showing <strong>{filtered.length}</strong> of <strong>{allInstallments.length}</strong> installments
          </Typography>

          <Paper variant="outlined" sx={{ borderRadius: 3.5, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    {['#', 'Installment', 'Project / Unit', 'Total', 'Paid', 'Balance', 'Due Date', 'Status', 'Action'].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 800, fontSize: 11, py: 1.5, color: '#374151' }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 10, color: 'text.secondary' }}>
                        <Typography fontSize={40} mb={1.5}>💰</Typography>
                        <Typography variant="body2">No installments match your filters</Typography>
                      </TableCell>
                    </TableRow>
                  ) : filtered.map((inst, idx) => {
                    const stCfg = INSTALLMENT_STATUS_CFG[inst.status];
                    const remaining = inst.amount - inst.paidAmount;
                    const overdue = isOverdue(inst.dueDate, inst.status);
                    const mTag = MILESTONE_TAGS.find(m => m.value === inst.milestoneTag);
                    const pct = inst.amount ? Math.round(inst.paidAmount / inst.amount * 100) : 0;
                    const canPay = inst.status !== 'PAID' && inst.status !== 'WAIVED';

                    return (
                      <TableRow key={inst.id} hover sx={{ '& td': { py: 1.5 }, bgcolor: overdue ? '#fff8f8' : 'inherit' }}>
                        <TableCell><Typography variant="caption" fontWeight={800} color="text.secondary">{idx + 1}</Typography></TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            {mTag && <Typography fontSize={15}>{mTag.icon}</Typography>}
                            <Typography variant="body2" fontWeight={800}>{inst.installmentName}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>—</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={800}>{fmtINRFull(inst.amount)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Stack>
                            <Typography variant="body2" fontWeight={800} sx={{ color: '#10b981' }}>
                              {inst.paidAmount > 0 ? fmtINRFull(inst.paidAmount) : '—'}
                            </Typography>
                            {pct > 0 && pct < 100 && (
                              <Box sx={{ mt: 0.5, height: 3, width: 56, borderRadius: 2, bgcolor: '#f3f4f6', overflow: 'hidden' }}>
                                <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: '#10b981', borderRadius: 2 }} />
                              </Box>
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={900}
                            sx={{ color: overdue ? '#ef4444' : remaining === 0 ? '#10b981' : 'text.primary' }}>
                            {remaining > 0 ? fmtINRFull(remaining) : '✅'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}
                            sx={{ color: overdue ? '#ef4444' : 'text.primary', fontSize: 12 }}>
                            {getDueDateLabel(inst.dueDate, inst.status)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{formatDate(inst.dueDate)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={`${stCfg.icon} ${stCfg.label}`} size="small"
                            sx={{ bgcolor: stCfg.bg, color: stCfg.color, fontWeight: 800, fontSize: 10, height: 22 }} />
                        </TableCell>
                        <TableCell>
                          {canPay && (
                            <Button size="small" variant="contained" disableElevation
                              onClick={() => { setRecordPayTarget(inst); setRecordPayBooking(inst.bookingId); }}
                              sx={{
                                textTransform: 'none', fontWeight: 800, fontSize: 11, borderRadius: 2,
                                bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }
                              }}>
                              💳 Pay
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      {/* ── Tab 1: Payment History ── */}
      {mainTab === 1 && (
        <PaymentHistory payments={allPayments} onRefund={setRefundTarget} />
      )}

      {/* ── Tab 2: Analytics ── */}
      {mainTab === 2 && (
        <FinanceAnalytics installments={allInstallments} payments={allPayments} />
      )}

      {/* ── Tab 3: Plan Templates ── */}
      {mainTab === 3 && (
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
            <Typography variant="body1" fontWeight={800}>Payment Plan Templates ({templates.length})</Typography>
            <Button variant="contained" disableElevation startIcon={<AddOutlined />}
              onClick={() => { setEditTemplate(null); setTemplateBuilderOpen(true); }}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2.5 }}>
              Create Template
            </Button>
          </Stack>
          <Grid container spacing={2}>
            {templates.map(t => {
              const cfg = PLAN_TYPE_CFG[t.planType];
              const totalPct = t.installmentRules.reduce((s, r) => s + r.percentage, 0);
              return (
                <Grid item xs={12} sm={6} lg={4} key={t.id}>
                  <Paper variant="outlined" sx={{
                    p: 3, borderRadius: 3.5, cursor: 'pointer', transition: 'all .15s',
                    '&:hover': { borderColor: '#6366f1', boxShadow: '0 8px 24px rgba(99,102,241,.12)' }
                  }}
                    onClick={() => { setEditTemplate(t); setTemplateBuilderOpen(true); }}>
                    <Stack direction="row" spacing={2} alignItems="flex-start" mb={2}>
                      <Box sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                        {cfg.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" fontWeight={800}>{t.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{cfg.label}</Typography>
                        {t.isDefault && <Chip label="⭐ Default" size="small" sx={{ ml: 1, fontSize: 9, height: 16, bgcolor: '#fef3c7', color: '#92400e', fontWeight: 700 }} />}
                      </Box>
                      <IconButton size="small" onClick={e => { e.stopPropagation(); setEditTemplate(t); setTemplateBuilderOpen(true); }}>
                        <EditOutlined sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Stack>
                    <Stack spacing={0.75}>
                      {t.installmentRules.slice(0, 4).map((r, i) => (
                        <Stack key={i} direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" spacing={0.75} alignItems="center">
                            <Typography fontSize={12}>{MILESTONE_TAGS.find(m => m.value === r.milestoneTag)?.icon ?? '📋'}</Typography>
                            <Typography variant="caption" fontWeight={600}>{r.name}</Typography>
                          </Stack>
                          <Typography variant="caption" fontWeight={800} sx={{ color: '#6366f1' }}>{r.percentage}%</Typography>
                        </Stack>
                      ))}
                      {t.installmentRules.length > 4 && (
                        <Typography variant="caption" color="text.secondary">+{t.installmentRules.length - 4} more installments</Typography>
                      )}
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2} pt={1.5} sx={{ borderTop: '1px solid #f1f5f9' }}>
                      <Typography variant="caption" color="text.secondary">{t.installmentRules.length} installments</Typography>
                      <Chip label={`${totalPct}%`} size="small"
                        sx={{ bgcolor: totalPct === 100 ? '#d1fae5' : '#fee2e2', color: totalPct === 100 ? '#065f46' : '#dc2626', fontWeight: 800, fontSize: 10 }} />
                    </Stack>
                  </Paper>
                </Grid>
              );
            })}
            {templates.length === 0 && (
              <Grid item xs={12}>
                <Box sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
                  <Typography fontSize={48} mb={2}>📋</Typography>
                  <Typography variant="h6" fontWeight={700} mb={1}>No templates yet</Typography>
                  <Typography variant="body2" mb={3}>Create payment plan templates to quickly apply installment schedules to bookings</Typography>
                  <Button variant="contained" disableElevation startIcon={<AddOutlined />}
                    onClick={() => { setEditTemplate(null); setTemplateBuilderOpen(true); }}
                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2.5 }}>
                    Create First Template
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      )}

      {/* ── Dialogs ── */}
      <RecordPaymentDialog
        open={!!recordPayTarget}
        onClose={() => setRecordPayTarget(null)}
        installment={recordPayTarget}
        bookingId={recordPayBooking}
        onSave={fetchData}
      />
      <TemplateBuilderDialog
        open={templateBuilderOpen}
        onClose={() => { setTemplateBuilderOpen(false); setEditTemplate(null); }}
        initial={editTemplate}
        onSave={fetchData}
      />
      {refundTarget && (
        <RefundDialog
          open={!!refundTarget}
          onClose={() => setRefundTarget(null)}
          bookingId={refundTarget.bookingId}
          paymentId={refundTarget.id}
          maxAmount={refundTarget.amount}
          onSave={fetchData}
        />
      )}
    </Box>
  );
};

export default PaymentsPage;