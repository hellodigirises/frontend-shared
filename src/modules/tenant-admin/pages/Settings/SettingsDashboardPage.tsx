import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Stack, Button, Grid, Chip, Paper,
  Divider, Avatar, CircularProgress, Alert, IconButton,
  TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Switch, InputAdornment
} from '@mui/material';
import {
  BusinessOutlined, PaletteOutlined, DomainOutlined,
  ExtensionOutlined, TuneOutlined, AccountTreeOutlined,
  SecurityOutlined, HistoryOutlined, IntegrationInstructionsOutlined,
  PaymentOutlined, EmailOutlined, ImportExportOutlined,
  LockOutlined, ChevronRightOutlined, CheckCircleOutlined,
  ErrorOutlined, HelpOutlineOutlined
} from '@mui/icons-material';
import {
  CompanyProfile, BrandingSettings, DomainRequest, CustomField,
  WorkflowRule, ModuleFlag, SecurityConfig, Integration, AuditLog,
  DOMAIN_STATUS_CFG, MODULE_FLAGS, WORKFLOW_ACTION_CFG,
  formatDate, timeAgo, avatarColor, initials
} from './settingsTypes';
import { CompanyProfileSection, BrandingSection, DomainSection } from './SettingsSections1';
import { CustomFieldsSection, ModulesSection, WorkflowSection, SecuritySection } from './SettingsSections2';
import api from '../../../../api/axios';

// ─── Integrations Section ─────────────────────────────────────────────────────
const IntegrationsSection: React.FC<{ integrations: Integration[] }> = ({ integrations }) => {
  const INTEGRATION_CATEGORIES = ['Lead Capture', 'Communication', 'Telephony', 'Finance'];

  return (
    <Box>
      <Typography sx={{ fontWeight: 800, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: 1.2, color: '#9ca3af', display: 'block', mb: 3 }}>
        Available Integrations
      </Typography>
      {INTEGRATION_CATEGORIES.map(cat => {
        const catIntegrations = integrations.filter(i => i.category === cat);
        if (catIntegrations.length === 0) return null;
        return (
          <Box key={cat} mb={3.5}>
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#374151', display: 'block', mb: 1.5 }}>
              {cat}
            </Typography>
            <Grid container spacing={2}>
              {catIntegrations.map(intg => {
                const isConnected = intg.status === 'CONNECTED';
                const hasError = intg.status === 'ERROR';
                return (
                  <Grid item xs={12} sm={6} key={intg.id}>
                    <Paper variant="outlined" sx={{
                      p: 2.5, borderRadius: 3.5, transition: 'all .2s',
                      borderColor: isConnected ? '#86efac' : hasError ? '#fca5a5' : '#e5e7eb',
                      '&:hover': { borderColor: isConnected ? '#10b981' : '#6366f1', boxShadow: '0 4px 14px rgba(0,0,0,.08)' }
                    }}>
                      <Stack direction="row" alignItems="flex-start" spacing={1.75}>
                        <Box sx={{
                          width: 44, height: 44, borderRadius: 3, bgcolor: isConnected ? '#d1fae5' : '#f3f4f6',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0
                        }}>
                          {intg.icon}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.4}>
                            <Typography variant="body2" fontWeight={800}>{intg.name}</Typography>
                            <Chip label={isConnected ? '✅ Connected' : hasError ? '❌ Error' : 'Not Connected'} size="small"
                              sx={{
                                bgcolor: isConnected ? '#d1fae5' : hasError ? '#fee2e2' : '#f3f4f6',
                                color: isConnected ? '#065f46' : hasError ? '#dc2626' : '#6b7280',
                                fontWeight: 800, fontSize: 9, height: 18
                              }} />
                          </Stack>
                          <Typography variant="caption" color="text.secondary">{intg.description}</Typography>
                          {intg.lastSyncAt && (
                            <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', fontSize: 10, mt: 0.25 }}>
                              Last sync: {timeAgo(intg.lastSyncAt)}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                      <Box sx={{ mt: 2 }}>
                        <Button size="small" variant={isConnected ? 'outlined' : 'contained'} disableElevation fullWidth
                          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2.5, fontSize: 12 }}>
                          {isConnected ? 'Configure' : 'Connect'}
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        );
      })}
    </Box>
  );
};

// ─── Audit Log Section ────────────────────────────────────────────────────────
const AuditLogSection: React.FC<{ logs: AuditLog[] }> = ({ logs }) => {
  const [search, setSearch] = useState('');
  const filtered = logs.filter(l =>
    !search || l.userName.toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.resource.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: 1.2, color: '#9ca3af', display: 'block', mb: 0.5 }}>
            Audit Log
          </Typography>
          <Typography variant="body2" color="text.secondary">Every settings change is recorded here</Typography>
        </Box>
        <Button variant="outlined" size="small"
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2.5 }}>
          Export CSV
        </Button>
      </Stack>

      <TextField fullWidth size="small" placeholder="Search by user, action, or resource..." value={search}
        onChange={e => setSearch(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start">🔍</InputAdornment>, sx: { borderRadius: 2.5 } }}
        sx={{ mb: 2.5 }} />

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 520 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                {['Time', 'User', 'Action', 'Resource', 'Changes'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 800, fontSize: 11, py: 1.5, bgcolor: '#f8fafc' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                    No audit logs found
                  </TableCell>
                </TableRow>
              ) : filtered.map(log => (
                <TableRow key={log.id} hover sx={{ '& td': { py: 1.25 } }}>
                  <TableCell>
                    <Typography variant="caption" fontWeight={700}>{timeAgo(log.createdAt)}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: 10 }}>
                      {formatDate(log.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: 9, bgcolor: avatarColor(log.userName), fontWeight: 800 }}>
                        {initials(log.userName)}
                      </Avatar>
                      <Typography variant="caption" fontWeight={700}>{log.userName}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" fontWeight={700}>{log.action}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={log.resource} size="small" sx={{ fontWeight: 700, fontSize: 9, height: 18 }} />
                  </TableCell>
                  <TableCell>
                    {log.oldValue && log.newValue ? (
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <Typography variant="caption" sx={{ color: '#ef4444', fontFamily: 'monospace', fontSize: 10 }} noWrap>{log.oldValue}</Typography>
                        <Typography variant="caption" color="text.secondary">→</Typography>
                        <Typography variant="caption" sx={{ color: '#10b981', fontFamily: 'monospace', fontSize: 10 }} noWrap>{log.newValue}</Typography>
                      </Stack>
                    ) : <Typography variant="caption" color="text.secondary">—</Typography>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

// ─── Payment Config Section ───────────────────────────────────────────────────
const PaymentConfigSection: React.FC = () => {
  const [form, setForm] = useState({
    currency: 'INR', gstPercentage: 18, tdsPercentage: 1, latePaymentPenaltyPct: 2,
    gracePeriodDays: 7, receiptPrefix: 'RCP', enableAutoReceipts: true, enableGstInvoice: true,
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Box>
      <Typography sx={{ fontWeight: 800, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: 1.2, color: '#9ca3af', display: 'block', mb: 3 }}>
        Payment & Finance Configuration
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: 1.2, color: '#9ca3af', display: 'block', mb: 1.5 }}>GST Percentage</Typography>
          <TextField fullWidth size="small" type="number" value={form.gstPercentage}
            onChange={e => set('gstPercentage', parseFloat(e.target.value))}
            InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: 1.2, color: '#9ca3af', display: 'block', mb: 1.5 }}>TDS Percentage</Typography>
          <TextField fullWidth size="small" type="number" value={form.tdsPercentage}
            onChange={e => set('tdsPercentage', parseFloat(e.target.value))}
            InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: 1.2, color: '#9ca3af', display: 'block', mb: 1.5 }}>Late Penalty %/month</Typography>
          <TextField fullWidth size="small" type="number" value={form.latePaymentPenaltyPct}
            onChange={e => set('latePaymentPenaltyPct', parseFloat(e.target.value))}
            InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: 1.2, color: '#9ca3af', display: 'block', mb: 1.5 }}>Grace Period (days)</Typography>
          <TextField fullWidth size="small" type="number" value={form.gracePeriodDays}
            onChange={e => set('gracePeriodDays', parseInt(e.target.value))}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: 1.2, color: '#9ca3af', display: 'block', mb: 1.5 }}>Receipt Number Prefix</Typography>
          <TextField fullWidth size="small" value={form.receiptPrefix}
            onChange={e => set('receiptPrefix', e.target.value)}
            placeholder="RCP" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
        </Grid>
        <Grid item xs={12}>
          <Stack direction="row" spacing={4}>
            <Switch checked={form.enableAutoReceipts} onChange={e => set('enableAutoReceipts', e.target.checked)} />
            <Typography variant="body2" fontWeight={700}>Auto-generate PDF receipts on payment</Typography>
          </Stack>
          <Stack direction="row" spacing={4} mt={1}>
            <Switch checked={form.enableGstInvoice} onChange={e => set('enableGstInvoice', e.target.checked)} />
            <Typography variant="body2" fontWeight={700}>Include GST invoice with receipts</Typography>
          </Stack>
        </Grid>
      </Grid>
      <Divider sx={{ my: 3 }} />
      <Stack direction="row" justifyContent="flex-end">
        <Button variant="contained" disableElevation onClick={async () => { setSaving(true); await api.put('/settings/payment', form); setSaving(false); }}
          disabled={saving} sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2.5, px: 4 }}>
          {saving ? <CircularProgress size={18} color="inherit" /> : 'Save Payment Config'}
        </Button>
      </Stack>
    </Box>
  );
};

// ─── Settings Navigation ──────────────────────────────────────────────────────
const NAV_SECTIONS = [
  { id: 'company', icon: <BusinessOutlined sx={{ fontSize: 17 }} />, label: 'Company Profile', badge: '' },
  { id: 'branding', icon: <PaletteOutlined sx={{ fontSize: 17 }} />, label: 'Branding', badge: '' },
  { id: 'domain', icon: <DomainOutlined sx={{ fontSize: 17 }} />, label: 'Domain', badge: '' },
  { id: 'modules', icon: <ExtensionOutlined sx={{ fontSize: 17 }} />, label: 'Modules', badge: '' },
  { id: 'custom-fields', icon: <TuneOutlined sx={{ fontSize: 17 }} />, label: 'Custom Fields', badge: '' },
  { id: 'workflows', icon: <AccountTreeOutlined sx={{ fontSize: 17 }} />, label: 'Workflows', badge: '' },
  { id: 'payment', icon: <PaymentOutlined sx={{ fontSize: 17 }} />, label: 'Payment Config', badge: '' },
  { id: 'security', icon: <SecurityOutlined sx={{ fontSize: 17 }} />, label: 'Security', badge: '' },
  { id: 'integrations', icon: <IntegrationInstructionsOutlined sx={{ fontSize: 17 }} />, label: 'Integrations', badge: '' },
  { id: 'audit', icon: <HistoryOutlined sx={{ fontSize: 17 }} />, label: 'Audit Log', badge: '' },
];

// ─── Main Settings Page ───────────────────────────────────────────────────────
const SettingsDashboardPage: React.FC<{ isSuperAdmin?: boolean }> = ({ isSuperAdmin = false }) => {
  const [activeSection, setActiveSection] = useState('company');
  const [loading, setLoading] = useState(true);

  // State for all settings
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [branding, setBranding] = useState<BrandingSettings | null>(null);
  const [domainRequest, setDomainRequest] = useState<DomainRequest | null>(null);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [workflowRules, setWorkflowRules] = useState<WorkflowRule[]>([]);
  const [modules, setModules] = useState<ModuleFlag[]>(MODULE_FLAGS);
  const [security, setSecurity] = useState<SecurityConfig | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [cRes, bRes, dRes, cfRes, wfRes, sRes, intRes, alRes] = await Promise.all([
        api.get('/settings/company'),
        api.get('/settings/branding'),
        api.get('/settings/domain-request'),
        api.get('/settings/custom-fields'),
        api.get('/settings/workflows'),
        api.get('/settings/security'),
        api.get('/settings/integrations'),
        api.get('/settings/audit-logs'),
      ]);
      setCompany(cRes.data);
      setBranding(bRes.data);
      setDomainRequest(dRes.data ?? null);
      setCustomFields(cfRes.data?.data ?? cfRes.data ?? []);
      setWorkflowRules(wfRes.data?.data ?? wfRes.data ?? []);
      setSecurity(sRes.data);
      setIntegrations(intRes.data?.data ?? intRes.data ?? []);
      setAuditLogs(alRes.data?.data ?? alRes.data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleModuleToggle = (key: string, enabled: boolean) =>
    setModules(m => m.map(x => x.key === key ? { ...x, isEnabled: enabled } : x));

  const currentSection = NAV_SECTIONS.find(n => n.id === activeSection);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#fafaf7' }}>
      {/* ── Left Sidebar ── */}
      <Box sx={{ width: 260, flexShrink: 0, bgcolor: '#0f172a', borderRight: '1px solid #1e293b', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
        <Box sx={{ p: 3, pb: 2 }}>
          <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: '1.25rem', color: '#f1f5f9', mb: 0.25 }}>
            Settings
          </Typography>
          <Typography sx={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>
            {isSuperAdmin ? 'SuperAdmin Control' : 'Tenant Configuration'}
          </Typography>
        </Box>
        <Divider sx={{ borderColor: '#1e293b' }} />
        <Box sx={{ p: 1.5 }}>
          {NAV_SECTIONS.map(section => {
            const isActive = activeSection === section.id;
            return (
              <Box key={section.id} onClick={() => setActiveSection(section.id)}
                sx={{
                  px: 2, py: 1.5, borderRadius: 2.5, cursor: 'pointer', mb: 0.5,
                  display: 'flex', alignItems: 'center', gap: 1.5,
                  bgcolor: isActive ? '#1e293b' : 'transparent',
                  borderLeft: `3px solid ${isActive ? '#10b981' : 'transparent'}`,
                  transition: 'all .12s',
                  '&:hover': { bgcolor: '#1e293b' },
                }}>
                <Box sx={{ color: isActive ? '#10b981' : '#64748b', display: 'flex', alignItems: 'center' }}>
                  {section.icon}
                </Box>
                <Typography sx={{ fontSize: 13, fontWeight: isActive ? 800 : 600, color: isActive ? '#f1f5f9' : '#94a3b8', flex: 1 }}>
                  {section.label}
                </Typography>
                {isActive && <ChevronRightOutlined sx={{ fontSize: 14, color: '#10b981' }} />}
              </Box>
            );
          })}
        </Box>

        {/* Sidebar footer */}
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 2, borderTop: '1px solid #1e293b', bgcolor: '#0f172a' }}>
          <Typography sx={{ fontSize: 10, color: '#475569', textAlign: 'center' }}>
            PropTrack CRM · v3.0.1
          </Typography>
        </Box>
      </Box>

      {/* ── Main Content ── */}
      <Box sx={{ flex: 1, p: { xs: 2, md: 4 }, maxWidth: '100%', overflowY: 'auto' }}>
        {/* Section header */}
        <Box mb={4}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={0.5}>
            <Box sx={{ color: '#10b981' }}>{currentSection?.icon}</Box>
            <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: '1.75rem', color: '#0f172a', letterSpacing: -0.5 }}>
              {currentSection?.label}
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {activeSection === 'company' && 'Your company information, branding and legal details'}
            {activeSection === 'branding' && 'Customize the look and feel of your platform'}
            {activeSection === 'domain' && 'Configure your platform domain and DNS settings'}
            {activeSection === 'modules' && 'Control which modules are active in your workspace'}
            {activeSection === 'custom-fields' && 'Add custom fields to any entity in the system'}
            {activeSection === 'workflows' && 'Set up automated rules triggered by system events'}
            {activeSection === 'payment' && 'Configure payment rules, GST, TDS and receipt settings'}
            {activeSection === 'security' && 'Manage password policies, sessions and access controls'}
            {activeSection === 'integrations' && 'Connect third-party services to your platform'}
            {activeSection === 'audit' && 'Full log of every settings change made in the system'}
          </Typography>
        </Box>

        <Paper variant="outlined" sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, bgcolor: '#fff' }}>
          {activeSection === 'company' && company && (
            <CompanyProfileSection profile={company} onSave={setCompany} />
          )}
          {activeSection === 'branding' && branding && (
            <BrandingSection branding={branding} onSave={setBranding} />
          )}
          {activeSection === 'domain' && company && (
            <DomainSection domainRequest={domainRequest} currentSubdomain={company.name?.toLowerCase().replace(/\s+/g, '') ?? 'tenant'}
              onSubmit={r => setDomainRequest({ ...r, isVerified: false, status: 'PENDING', requestedAt: new Date().toISOString() } as DomainRequest)} />
          )}
          {activeSection === 'modules' && (
            <ModulesSection flags={modules} isSuperAdmin={isSuperAdmin} onToggle={handleModuleToggle} />
          )}
          {activeSection === 'custom-fields' && (
            <CustomFieldsSection fields={customFields} onRefresh={fetchAll} />
          )}
          {activeSection === 'workflows' && (
            <WorkflowSection rules={workflowRules} onRefresh={fetchAll} />
          )}
          {activeSection === 'payment' && <PaymentConfigSection />}
          {activeSection === 'security' && security && (
            <SecuritySection config={security} onSave={setSecurity} />
          )}
          {activeSection === 'integrations' && (
            <IntegrationsSection integrations={integrations} />
          )}
          {activeSection === 'audit' && (
            <AuditLogSection logs={auditLogs} />
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default SettingsDashboardPage;