import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Stack, Button, TextField, Grid,
  Paper, Divider, Chip, CircularProgress, Alert,
  FormControl, InputLabel, Select, MenuItem, Checkbox,
  FormControlLabel, InputAdornment
} from '@mui/material';
import {
  CheckOutlined, ArrowForwardOutlined, ArrowBackOutlined, BusinessOutlined
} from '@mui/icons-material';
import {
  TenantOnboardingForm, PlanType, BillingCycle, SubscriptionPlan,
  SUBSCRIPTION_PLANS, PLAN_CFG,
  toSubdomain, INDIA_STATES, COMPANY_SIZES, BUSINESS_TYPES, INDUSTRY_TYPES, fmtINR
} from './platformTypes';
import api from '../../../api/axios';

const STEPS = ['Company Info', 'Business Details', 'Choose Plan', 'Domain Setup', 'Confirm'];

const PlanCard: React.FC<{
  plan: SubscriptionPlan; selected: boolean; billingCycle: BillingCycle; onSelect: () => void;
}> = ({ plan, selected, billingCycle, onSelect }) => {
  const cfg = PLAN_CFG[plan.type];
  const price = billingCycle === 'MONTHLY' ? plan.monthlyPrice : Math.round(plan.yearlyPrice / 12);
  const isEnterprise = plan.type === 'ENTERPRISE';

  return (
    <Box onClick={onSelect} sx={{
      borderRadius: 4, cursor: 'pointer', transition: 'all .2s', overflow: 'hidden',
      border: `2px solid ${selected ? cfg.color : '#e5e7eb'}`,
      boxShadow: selected ? `0 0 0 4px ${cfg.color}20, 0 16px 48px ${cfg.color}20` : '0 2px 8px rgba(0,0,0,.06)',
      transform: selected ? 'scale(1.02)' : 'scale(1)', position: 'relative',
    }}>
      {plan.isPopular && (
        <Box sx={{ background: cfg.gradient, color: '#fff', fontSize: 10, fontWeight: 900,
          textAlign: 'center', py: 0.5, letterSpacing: 1, textTransform: 'uppercase' }}>
          ✦ Most Popular ✦
        </Box>
      )}
      <Box sx={{ p: 3, pt: plan.isPopular ? 2.5 : 3 }}>
        <Box sx={{ p: 2.5, borderRadius: 3, mb: 2.5, background: selected ? cfg.darkGradient : '#f8fafc' }}>
          <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
            <Typography fontSize={28}>{plan.icon}</Typography>
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: selected ? '#fff' : '#0f172a' }}>{plan.name}</Typography>
              <Typography sx={{ fontSize: 11, color: selected ? cfg.color : '#6b7280', fontWeight: 700 }}>{plan.tagline}</Typography>
            </Box>
          </Stack>
          {isEnterprise ? (
            <Typography sx={{ fontSize: '1.4rem', fontWeight: 900, color: cfg.color }}>Custom Pricing</Typography>
          ) : (
            <Stack direction="row" alignItems="baseline" spacing={0.5}>
              <Typography sx={{ fontSize: '2rem', fontWeight: 900, color: selected ? '#fff' : '#0f172a', lineHeight: 1 }}>
                ₹{price.toLocaleString('en-IN')}
              </Typography>
              <Typography sx={{ fontSize: 13, color: '#9ca3af', fontWeight: 600 }}>/mo</Typography>
            </Stack>
          )}
          {billingCycle === 'YEARLY' && !isEnterprise && (
            <Typography sx={{ fontSize: 10, color: '#10b981', fontWeight: 800, mt: 0.25 }}>
              Save {Math.round((1 - plan.yearlyPrice / (plan.monthlyPrice * 12)) * 100)}% vs monthly
            </Typography>
          )}
        </Box>
        <Stack spacing={0.75} mb={2.5}>
          {plan.features.map((f, i) => (
            <Stack key={i} direction="row" alignItems="center" spacing={1.25}>
              <Box sx={{ width: 17, height: 17, borderRadius: '50%', flexShrink: 0,
                bgcolor: f.included ? cfg.color + '18' : '#f3f4f6',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {f.included ? <CheckOutlined sx={{ fontSize: 10, color: cfg.color }} /> : <Box sx={{ width: 5, height: 1, bgcolor: '#d1d5db' }} />}
              </Box>
              <Typography variant="caption" sx={{ color: f.included ? '#374151' : '#9ca3af', fontWeight: f.included ? 600 : 400, fontSize: 12 }}>
                {f.label}
                {f.note && <Typography component="span" sx={{ color: cfg.color, fontSize: 10, fontWeight: 700, ml: 0.5 }}>({f.note})</Typography>}
              </Typography>
            </Stack>
          ))}
        </Stack>
        <Box sx={{ height: 40, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: selected ? cfg.gradient : 'transparent',
          border: `1.5px solid ${selected ? 'transparent' : cfg.color + '60'}`,
          color: selected ? '#fff' : cfg.color, fontWeight: 800, fontSize: 13 }}>
          {selected ? '✓ Selected' : isEnterprise ? 'Contact Sales' : 'Select Plan'}
        </Box>
      </Box>
    </Box>
  );
};

const TenantOnboardingPage: React.FC<{ onComplete?: (subdomain: string) => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<TenantOnboardingForm>({
    companyName: '', ownerName: '', email: '', phone: '', city: '', state: 'Maharashtra', country: 'India',
    industryType: '', companySize: '', expectedUsers: 10, primaryBusinessType: '',
    selectedPlan: 'GROWTH', billingCycle: 'MONTHLY', subdomain: '', customDomain: '', agreedToTerms: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (k: keyof TenantOnboardingForm, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleCompanyNameChange = (v: string) => {
    set('companyName', v);
    if (!form.subdomain || form.subdomain === toSubdomain(form.companyName)) set('subdomain', toSubdomain(v));
  };

  const selectedPlan = SUBSCRIPTION_PLANS.find(p => p.type === form.selectedPlan)!;

  const canProceed = useMemo(() => {
    if (step === 0) return !!(form.companyName && form.ownerName && form.email && form.phone && form.city);
    if (step === 1) return !!(form.industryType && form.companySize && form.primaryBusinessType);
    if (step === 2) return !!form.selectedPlan;
    if (step === 3) return form.subdomain.length >= 3;
    if (step === 4) return form.agreedToTerms;
    return true;
  }, [step, form]);

  const handleSubmit = async () => {
    setSubmitting(true); setError('');
    try {
      await api.post('/onboarding/register', form);
      setSuccess(true); onComplete?.(form.subdomain);
    } catch (e: any) { setError(e?.response?.data?.message ?? 'Registration failed. Please try again.'); }
    finally { setSubmitting(false); }
  };

  if (success) return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1a1a3e 100%)' }}>
      <Box sx={{ textAlign: 'center', color: '#fff', p: 4, maxWidth: 520 }}>
        <Box sx={{ width: 100, height: 100, borderRadius: '50%', bgcolor: '#10b981', mx: 'auto', mb: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48,
          boxShadow: '0 0 0 20px rgba(16,185,129,.15)' }}>🎉</Box>
        <Typography sx={{ fontFamily: '"Clash Display", sans-serif', fontWeight: 700, fontSize: '2.5rem', mb: 1.5, letterSpacing: -1 }}>
          Welcome aboard!
        </Typography>
        <Typography sx={{ color: '#94a3b8', mb: 3 }}>
          Your CRM is live at<br />
          <strong style={{ color: '#10b981', fontSize: '1.1rem' }}>https://{form.subdomain}.realesso.com</strong>
        </Typography>
        <Stack spacing={1.5} alignItems="center" mb={4}>
          {['Tenant account created','Admin user configured','Plan activated','Subdomain provisioned'].map(s => (
            <Chip key={s} label={`✅ ${s}`} sx={{ bgcolor: '#10b98125', color: '#10b981', fontWeight: 700, height: 28 }} />
          ))}
        </Stack>
        <Button variant="contained" disableElevation size="large"
          sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 3, px: 5, py: 1.5,
            background: 'linear-gradient(135deg, #10b981, #059669)', fontSize: '1rem' }}>
          Open My CRM →
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1a1a3e 50%, #0f172a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      {/* Ambient glow */}
      {['#6366f1','#10b981','#f59e0b'].map((c, i) => (
        <Box key={i} sx={{ position: 'fixed', width: 350, height: 350, borderRadius: '50%', bgcolor: c, opacity: 0.04,
          filter: 'blur(80px)', top: i===0?'-10%':i===1?'60%':'20%', left: i===0?'-5%':i===1?'70%':'50%', pointerEvents:'none' }} />
      ))}

      <Box sx={{ width: '100%', maxWidth: step === 2 ? 1100 : 680, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1.5} mb={2.5}>
            <Box sx={{ width: 44, height: 44, borderRadius: 3, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🏢</Box>
            <Typography sx={{ fontFamily: '"Clash Display", sans-serif', fontWeight: 700, fontSize: '1.5rem', color: '#fff' }}>
              Realesso CRM
            </Typography>
          </Stack>
          <Typography sx={{ fontFamily: '"Clash Display", sans-serif', fontWeight: 700, fontSize: '1.8rem', color: '#f1f5f9', letterSpacing: -1, mb: 0.75 }}>
            {['🏢 Company Info', '📊 Business Details', '💳 Choose Plan', '🌐 Domain Setup', '🚀 Review & Launch'][step]}
          </Typography>
          <Typography sx={{ color: '#94a3b8' }}>Step {step + 1} of {STEPS.length}</Typography>
        </Box>

        {/* Progress */}
        <Box sx={{ height: 3, bgcolor: '#1e293b', borderRadius: 2, mb: 4, mx: 'auto', maxWidth: 400, overflow: 'hidden' }}>
          <Box sx={{ height: '100%', width: `${((step + 1) / STEPS.length) * 100}%`, background: 'linear-gradient(90deg, #6366f1, #10b981)', borderRadius: 2, transition: 'width .4s ease' }} />
        </Box>

        {/* Card */}
        <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', bgcolor: '#fff', border: '1px solid #e5e7eb' }}>
          <Box sx={{ p: { xs: 3, md: 4 } }}>
            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}

            {step === 0 && (
              <Grid container spacing={2.5}>
                {[
                  { label: 'Company Name *', key: 'companyName', sm: 6, special: 'company' },
                  { label: 'Owner / Admin Name *', key: 'ownerName', sm: 6 },
                  { label: 'Business Email *', key: 'email', sm: 6, type: 'email' },
                  { label: 'Phone *', key: 'phone', sm: 6, prefix: '+91' },
                  { label: 'City *', key: 'city', sm: 4 },
                ].map(f => (
                  <Grid item xs={12} sm={f.sm} key={f.key}>
                    <TextField fullWidth label={f.label} size="small" type={f.type ?? 'text'}
                      value={(form as any)[f.key]}
                      onChange={e => f.special === 'company' ? handleCompanyNameChange(e.target.value) : set(f.key as any, e.target.value)}
                      InputProps={f.prefix ? { startAdornment: <InputAdornment position="start">{f.prefix}</InputAdornment> } : undefined}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
                  </Grid>
                ))}
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>State</InputLabel>
                    <Select value={form.state} label="State" onChange={e => set('state', e.target.value)} sx={{ borderRadius: 2.5 }}>
                      {INDIA_STATES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Country" size="small" value={form.country}
                    onChange={e => set('country', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
                </Grid>
              </Grid>
            )}

            {step === 1 && (
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Industry Type *</InputLabel>
                    <Select value={form.industryType} label="Industry Type *" onChange={e => set('industryType', e.target.value)} sx={{ borderRadius: 2.5 }}>
                      {INDUSTRY_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Business Type *</InputLabel>
                    <Select value={form.primaryBusinessType} label="Business Type *" onChange={e => set('primaryBusinessType', e.target.value)} sx={{ borderRadius: 2.5 }}>
                      {BUSINESS_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Company Size *</InputLabel>
                    <Select value={form.companySize} label="Company Size *" onChange={e => set('companySize', e.target.value)} sx={{ borderRadius: 2.5 }}>
                      {COMPANY_SIZES.map(s => <MenuItem key={s} value={s}>{s} employees</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Expected CRM Users</InputLabel>
                    <Select value={form.expectedUsers} label="Expected CRM Users" onChange={e => set('expectedUsers', e.target.value)} sx={{ borderRadius: 2.5 }}>
                      {[5,10,25,50,100,250].map(n => <MenuItem key={n} value={n}>{n} users</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}

            {step === 2 && (
              <Box>
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} mb={4}>
                  <Typography fontWeight={700} sx={{ color: form.billingCycle === 'MONTHLY' ? '#0f172a' : '#9ca3af' }}>Monthly</Typography>
                  <Box onClick={() => set('billingCycle', form.billingCycle === 'MONTHLY' ? 'YEARLY' : 'MONTHLY')}
                    sx={{ width: 52, height: 28, borderRadius: 14, bgcolor: '#6366f1', position: 'relative', cursor: 'pointer' }}>
                    <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: '#fff', position: 'absolute',
                      top: 3, left: form.billingCycle === 'YEARLY' ? 27 : 3, transition: 'left .2s' }} />
                  </Box>
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <Typography fontWeight={700} sx={{ color: form.billingCycle === 'YEARLY' ? '#0f172a' : '#9ca3af' }}>Yearly</Typography>
                    <Chip label="Save up to 17%" size="small" sx={{ bgcolor: '#d1fae5', color: '#065f46', fontWeight: 800, fontSize: 10, height: 20 }} />
                  </Stack>
                </Stack>
                <Grid container spacing={2.5}>
                  {SUBSCRIPTION_PLANS.map(plan => (
                    <Grid item xs={12} md={4} key={plan.id}>
                      <PlanCard plan={plan} selected={form.selectedPlan === plan.type} billingCycle={form.billingCycle} onSelect={() => set('selectedPlan', plan.type)} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {step === 3 && (
              <Stack spacing={3}>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: 1.2, color: '#9ca3af', display: 'block', mb: 1.5 }}>
                    Your Subdomain *
                  </Typography>
                  <TextField fullWidth size="small" value={form.subdomain}
                    onChange={e => set('subdomain', toSubdomain(e.target.value))} inputProps={{ maxLength: 20 }}
                    InputProps={{ endAdornment: <InputAdornment position="end" sx={{ color: '#9ca3af', fontWeight: 700 }}>.realesso.com</InputAdornment>, sx: { borderRadius: 2.5 } }}
                    helperText={`Live URL: https://${form.subdomain || 'yourcompany'}.realesso.com`} />
                </Box>
                <Box sx={{ p: 3, borderRadius: 3.5, bgcolor: '#0f172a', color: '#fff' }}>
                  <Typography sx={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#64748b', mb: 1.5 }}>CRM URL Preview</Typography>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981', boxShadow: '0 0 8px #10b98180' }} />
                    <Typography sx={{ fontFamily: 'monospace', fontSize: '1.1rem', color: '#10b981', fontWeight: 700 }}>
                      https://{form.subdomain || 'yourcompany'}.realesso.com
                    </Typography>
                  </Stack>
                </Box>
                {form.selectedPlan === 'ENTERPRISE' && (
                  <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid #e5e7eb' }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: 1.2, color: '#9ca3af', display: 'block', mb: 1 }}>
                      Custom Domain (Enterprise)
                    </Typography>
                    <TextField fullWidth size="small" value={form.customDomain ?? ''} onChange={e => set('customDomain', e.target.value)}
                      placeholder="crm.yourcompany.com" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
                  </Box>
                )}
              </Stack>
            )}

            {step === 4 && (
              <Stack spacing={3}>
                <Box sx={{ p: 3, borderRadius: 3.5, background: 'linear-gradient(135deg, #0f172a, #1a1a3e)', color: '#fff' }}>
                  <Typography sx={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, color: '#64748b', mb: 2 }}>Registration Summary</Typography>
                  <Grid container spacing={2.5}>
                    {[
                      { l: 'Company', v: form.companyName }, { l: 'Owner', v: form.ownerName },
                      { l: 'Email', v: form.email }, { l: 'Plan', v: `${selectedPlan?.name} · ${form.billingCycle}` },
                      { l: 'Price', v: form.billingCycle === 'MONTHLY' ? `₹${(selectedPlan?.monthlyPrice??0).toLocaleString()}/mo` : `₹${(selectedPlan?.yearlyPrice??0).toLocaleString()}/yr` },
                      { l: 'CRM URL', v: `${form.subdomain}.realesso.com` },
                    ].map(item => (
                      <Grid item xs={6} key={item.l}>
                        <Typography sx={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>{item.l}</Typography>
                        <Typography sx={{ fontWeight: 800, color: '#f1f5f9', wordBreak: 'break-all' }}>{item.v}</Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
                <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: '#f0fdf4', border: '1.5px solid #86efac' }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Typography fontSize={24}>🎁</Typography>
                    <Box>
                      <Typography variant="body2" fontWeight={800} sx={{ color: '#065f46' }}>{selectedPlan?.trialDays}-day free trial included</Typography>
                      <Typography variant="caption" sx={{ color: '#047857' }}>No credit card required. Billed after trial ends.</Typography>
                    </Box>
                  </Stack>
                </Box>
                <FormControlLabel control={<Checkbox checked={form.agreedToTerms} onChange={e => set('agreedToTerms', e.target.checked)} />}
                  label={<Typography variant="body2">I agree to the <Typography component="span" sx={{ color: '#6366f1', fontWeight: 700 }}>Terms of Service</Typography> and <Typography component="span" sx={{ color: '#6366f1', fontWeight: 700 }}>Privacy Policy</Typography></Typography>} />
              </Stack>
            )}
          </Box>

          <Box sx={{ px: { xs: 3, md: 4 }, pb: 3, pt: 2, bgcolor: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Button disabled={step === 0} onClick={() => setStep(s => s - 1)} startIcon={<ArrowBackOutlined />}
                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2.5 }}>Back</Button>
              {step < STEPS.length - 1 ? (
                <Button variant="contained" disableElevation disabled={!canProceed} endIcon={<ArrowForwardOutlined />} onClick={() => setStep(s => s + 1)}
                  sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2.5, px: 4, background: 'linear-gradient(135deg, #6366f1, #4338ca)' }}>
                  Continue
                </Button>
              ) : (
                <Button variant="contained" disableElevation disabled={submitting || !canProceed} onClick={handleSubmit}
                  sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2.5, px: 5, background: 'linear-gradient(135deg, #10b981, #059669)', fontSize: '1rem' }}>
                  {submitting ? <CircularProgress size={20} color="inherit" /> : '🚀 Launch My CRM'}
                </Button>
              )}
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default TenantOnboardingPage;