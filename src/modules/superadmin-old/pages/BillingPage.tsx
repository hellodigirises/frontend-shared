import React, { useState } from 'react';
import {
  Box, Typography, Stack, Button, Grid, Chip, Paper, Divider,
  CircularProgress, Alert, Tab, Tabs,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton
} from '@mui/material';
import { CreditCardOutlined, CheckOutlined, DownloadOutlined, UpgradeOutlined, LockOutlined } from '@mui/icons-material';
import {
  SubscriptionPlan, AddOn, Invoice, BillingRecord, PlanType,
  SUBSCRIPTION_PLANS, ADD_ONS, PLAN_CFG, fmtINR, formatDate
} from './platformTypes';
import api from '../../../api/axios';

const PlanSwitchSection: React.FC<{ currentPlan: PlanType; billingRecord?: BillingRecord }> = ({ currentPlan, billingRecord }) => {
  const [selected, setSelected] = useState<PlanType>(currentPlan);
  const [loading, setLoading] = useState(false);
  const cfg = PLAN_CFG[currentPlan];

  const handleUpgrade = async () => {
    if (selected === currentPlan) return;
    setLoading(true);
    try { await api.post('/billing/change-plan', { planType: selected }); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <Box>
      <Box sx={{ p: 3.5, borderRadius: 4, mb: 4, background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography sx={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, color: '#64748b', mb: 1 }}>Current Plan</Typography>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color: '#f1f5f9' }}>
                {SUBSCRIPTION_PLANS.find(p => p.type === currentPlan)?.name ?? currentPlan}
              </Typography>
              <Chip label="Active" size="small" sx={{ bgcolor: '#10b98125', color: '#10b981', fontWeight: 800, border: '1px solid #10b98140' }} />
            </Stack>
            {billingRecord && (
              <Stack direction="row" spacing={3}>
                {[{ l: 'Next billing', v: formatDate(billingRecord.nextBillingDate) },
                  { l: 'Amount', v: fmtINR(billingRecord.amount) },
                  { l: 'Cycle', v: billingRecord.cycle }].map(i => (
                  <Box key={i.l}>
                    <Typography sx={{ fontSize: 10, color: '#64748b', fontWeight: 700 }}>{i.l}</Typography>
                    <Typography sx={{ fontWeight: 800, color: '#e2e8f0' }}>{i.v}</Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
          <Box sx={{ px: 3, py: 1.5, borderRadius: 3, background: cfg.gradient, fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {SUBSCRIPTION_PLANS.find(p => p.type === currentPlan)?.icon ?? '📦'}
          </Box>
        </Stack>
      </Box>

      <Typography sx={{ fontWeight: 800, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: 1.2, color: '#9ca3af', display: 'block', mb: 2 }}>
        Switch Plan
      </Typography>
      <Grid container spacing={2} mb={3}>
        {SUBSCRIPTION_PLANS.map(plan => {
          const isCurrentPlan = plan.type === currentPlan;
          const planCfg = PLAN_CFG[plan.type];
          return (
            <Grid item xs={12} sm={4} key={plan.id}>
              <Box onClick={() => !isCurrentPlan && setSelected(plan.type)} sx={{
                p: 2.5, borderRadius: 3.5, border: '2px solid', cursor: isCurrentPlan ? 'default' : 'pointer',
                borderColor: selected === plan.type ? planCfg.color : '#e5e7eb',
                bgcolor: selected === plan.type ? planCfg.color + '08' : '#fff', transition: 'all .15s',
                '&:hover': !isCurrentPlan ? { borderColor: planCfg.color } : {},
              }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.25}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Typography fontSize={22}>{plan.icon}</Typography>
                    <Box>
                      <Typography variant="body2" fontWeight={800}>{plan.name}</Typography>
                      <Typography sx={{ fontWeight: 900, color: planCfg.color }}>
                        {plan.type === 'ENTERPRISE' ? 'Custom' : `₹${plan.monthlyPrice.toLocaleString()}/mo`}
                      </Typography>
                    </Box>
                  </Stack>
                  {isCurrentPlan && <Chip label="Current" size="small" sx={{ bgcolor: planCfg.color + '18', color: planCfg.color, fontWeight: 800, fontSize: 9, height: 18 }} />}
                  {selected === plan.type && !isCurrentPlan && <CheckOutlined sx={{ color: planCfg.color }} />}
                </Stack>
                <Button fullWidth size="small" variant={selected === plan.type && !isCurrentPlan ? 'contained' : 'outlined'} disableElevation disabled={isCurrentPlan}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2.5, fontSize: 12,
                    ...(selected === plan.type && !isCurrentPlan ? { background: planCfg.gradient, color: '#fff', border: 'none' } :
                      isCurrentPlan ? {} : { borderColor: planCfg.color + '60', color: planCfg.color }) }}>
                  {isCurrentPlan ? '✓ Current' : selected === plan.type ? 'Selected' : 'Select'}
                </Button>
              </Box>
            </Grid>
          );
        })}
      </Grid>
      {selected !== currentPlan && (
        <Alert severity="info" sx={{ mb: 2.5, borderRadius: 3 }}>
          Switching to <strong>{selected}</strong>. Price difference will be prorated on next billing cycle.
        </Alert>
      )}
      <Button variant="contained" disableElevation onClick={handleUpgrade} disabled={loading || selected === currentPlan}
        startIcon={<UpgradeOutlined />} sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2.5, px: 4 }}>
        {loading ? <CircularProgress size={18} color="inherit" /> : 'Switch Plan'}
      </Button>
    </Box>
  );
};

const AddOnMarketplace: React.FC<{ currentPlan: PlanType; activeAddOns: string[] }> = ({ currentPlan, activeAddOns }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const categories = [...new Set(ADD_ONS.map(a => a.category))];
  const planIndex = SUBSCRIPTION_PLANS.findIndex(p => p.type === currentPlan);

  const handleActivate = async (id: string) => {
    setLoading(id);
    try { await api.post('/billing/add-ons/activate', { addOnId: id }); }
    catch (e) { console.error(e); } finally { setLoading(null); }
  };

  return (
    <Box>
      {categories.map(cat => (
        <Box key={cat} mb={4}>
          <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#374151', display: 'block', mb: 2 }}>
            {cat}
          </Typography>
          <Grid container spacing={2}>
            {ADD_ONS.filter(a => a.category === cat).map(addon => {
              const isActive = activeAddOns.includes(addon.id);
              const reqIdx = addon.requiredPlan ? SUBSCRIPTION_PLANS.findIndex(p => p.type === addon.requiredPlan) : 0;
              const isLocked = reqIdx > planIndex;
              return (
                <Grid item xs={12} sm={6} md={3} key={addon.id}>
                  <Paper variant="outlined" sx={{ borderRadius: 3.5, overflow: 'hidden', height: '100%',
                    borderColor: isActive ? addon.color + '50' : '#e5e7eb', bgcolor: isActive ? addon.color + '05' : '#fff',
                    transition: 'all .2s', '&:hover': { borderColor: addon.color, boxShadow: `0 8px 24px ${addon.color}15` } }}>
                    {addon.isPopular && (
                      <Box sx={{ bgcolor: addon.color, color: '#fff', textAlign: 'center', fontSize: 9, fontWeight: 900, py: 0.3, letterSpacing: 1, textTransform: 'uppercase' }}>
                        Popular
                      </Box>
                    )}
                    <Box sx={{ p: 2.5 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                        <Box sx={{ width: 44, height: 44, borderRadius: 3, bgcolor: addon.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                          {addon.icon}
                        </Box>
                        {isActive && <Chip label="Active" size="small" sx={{ bgcolor: addon.color + '18', color: addon.color, fontWeight: 800, fontSize: 9, height: 18 }} />}
                        {isLocked && <LockOutlined sx={{ fontSize: 18, color: '#d1d5db' }} />}
                      </Stack>
                      <Typography variant="body2" fontWeight={800} mb={0.4}>{addon.name}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, lineHeight: 1.4 }}>{addon.description}</Typography>
                      <Stack spacing={0.5} mb={2}>
                        {addon.features.map((f, i) => (
                          <Stack key={i} direction="row" spacing={0.75} alignItems="center">
                            <CheckOutlined sx={{ fontSize: 11, color: addon.color }} />
                            <Typography sx={{ fontSize: 11, color: '#6b7280' }}>{f}</Typography>
                          </Stack>
                        ))}
                      </Stack>
                      <Divider sx={{ mb: 1.5 }} />
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                        <Box>
                          <Typography sx={{ fontWeight: 900, color: addon.color }}>₹{addon.price.toLocaleString()}</Typography>
                          <Typography sx={{ fontSize: 10, color: '#9ca3af' }}>{addon.unit}</Typography>
                        </Box>
                        {addon.requiredPlan && <Chip label={`${addon.requiredPlan}+`} size="small" sx={{ fontSize: 9, height: 18, bgcolor: '#f3f4f6', fontWeight: 700 }} />}
                      </Stack>
                      <Button fullWidth size="small" variant={isActive ? 'outlined' : 'contained'} disableElevation
                        disabled={isLocked || loading === addon.id} onClick={() => handleActivate(addon.id)}
                        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2.5, fontSize: 12,
                          ...(isActive ? { borderColor: addon.color, color: addon.color } : !isLocked ? { bgcolor: addon.color, '&:hover': { bgcolor: addon.color, filter: 'brightness(0.9)' } } : {}) }}>
                        {loading === addon.id ? <CircularProgress size={14} color="inherit" /> : isActive ? 'Manage' : isLocked ? '🔒 Upgrade to Unlock' : '⚡ Activate'}
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      ))}
    </Box>
  );
};

const InvoiceList: React.FC<{ invoices: Invoice[] }> = ({ invoices }) => {
  const S: Record<string, { label: string; color: string; bg: string }> = {
    DRAFT:   { label: 'Draft',   color: '#9ca3af', bg: '#f3f4f6' },
    SENT:    { label: 'Sent',    color: '#0ea5e9', bg: '#e0f2fe' },
    PAID:    { label: 'Paid',    color: '#10b981', bg: '#d1fae5' },
    OVERDUE: { label: 'Overdue', color: '#ef4444', bg: '#fee2e2' },
    VOID:    { label: 'Void',    color: '#9ca3af', bg: '#f3f4f6' },
  };
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <TableContainer>
        <Table size="small">
          <TableHead><TableRow sx={{ bgcolor: '#f8fafc' }}>
            {['Invoice', 'Period', 'Amount', 'Tax', 'Total', 'Status', 'Paid On', ''].map(h => (
              <TableCell key={h} sx={{ fontWeight: 800, fontSize: 11, py: 1.5 }}>{h}</TableCell>
            ))}
          </TableRow></TableHead>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                <Typography fontSize={32} mb={1}>🧾</Typography><Typography variant="body2">No invoices yet</Typography>
              </TableCell></TableRow>
            ) : invoices.map(inv => {
              const st = S[inv.status] ?? S.DRAFT;
              return (
                <TableRow key={inv.id} hover sx={{ '& td': { py: 1.25 } }}>
                  <TableCell><Typography variant="body2" fontWeight={800}>{inv.invoiceNumber}</Typography></TableCell>
                  <TableCell><Typography variant="caption" color="text.secondary">{inv.billingPeriod}</Typography></TableCell>
                  <TableCell><Typography variant="caption">₹{inv.planAmount.toLocaleString()}</Typography></TableCell>
                  <TableCell><Typography variant="caption">₹{inv.taxAmount.toLocaleString()}</Typography></TableCell>
                  <TableCell><Typography variant="body2" fontWeight={900}>₹{inv.totalAmount.toLocaleString()}</Typography></TableCell>
                  <TableCell><Chip label={st.label} size="small" sx={{ bgcolor: st.bg, color: st.color, fontWeight: 800, fontSize: 10, height: 20 }} /></TableCell>
                  <TableCell><Typography variant="caption" color="text.secondary">{inv.paidAt ? formatDate(inv.paidAt) : '—'}</Typography></TableCell>
                  <TableCell><IconButton size="small"><DownloadOutlined sx={{ fontSize: 16 }} /></IconButton></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

const BillingPage: React.FC<{ currentPlan?: PlanType; billingRecord?: BillingRecord; invoices?: Invoice[]; activeAddOns?: string[] }> = ({
  currentPlan = 'GROWTH', billingRecord, invoices = [], activeAddOns = []
}) => {
  const [tab, setTab] = useState(0);
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#fafafa', minHeight: '100vh' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={4}>
        <Box>
          <Typography sx={{ fontFamily: '"Clash Display", sans-serif', fontWeight: 700, fontSize: '2.25rem', letterSpacing: -1.5, lineHeight: 1.1, color: '#0f172a' }}>
            Billing & Subscription
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={0.75}>Manage your plan, add-ons and invoices</Typography>
        </Box>
        <Button variant="contained" disableElevation startIcon={<CreditCardOutlined />}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 3 }}>Update Payment Method</Button>
      </Stack>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        TabIndicatorProps={{ sx: { height: 3, borderRadius: 2 } }}>
        {['📋 My Plan', '⚡ Add-on Marketplace', '🧾 Invoices'].map((t, i) => (
          <Tab key={i} label={t} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.82rem', minHeight: 44 }} />
        ))}
      </Tabs>
      <Paper variant="outlined" sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, bgcolor: '#fff' }}>
        {tab === 0 && <PlanSwitchSection currentPlan={currentPlan} billingRecord={billingRecord} />}
        {tab === 1 && <AddOnMarketplace currentPlan={currentPlan} activeAddOns={activeAddOns} />}
        {tab === 2 && <InvoiceList invoices={invoices} />}
      </Paper>
    </Box>
  );
};

export default BillingPage;