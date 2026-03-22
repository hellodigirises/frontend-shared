import React, { useState, useRef } from 'react';
import {
  Box, Typography, Stack, Button, TextField, Grid, Paper,
  Divider, Chip, IconButton, Alert, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, Switch,
  FormControlLabel, InputAdornment, Tooltip
} from '@mui/material';
import {
  UploadOutlined, CheckCircleOutlined, ContentCopyOutlined,
  VerifiedOutlined, HourglassEmptyOutlined, CloseOutlined,
  DomainOutlined, PaletteOutlined, BusinessOutlined, RefreshOutlined
} from '@mui/icons-material';
import {
  CompanyProfile, BrandingSettings, DomainRequest, DomainStatus,
  DOMAIN_STATUS_CFG, formatDate
} from './settingsTypes';
import api from '../../../../api/axios';

const S = {
  section: {
    fontWeight: 800 as const, fontSize: '0.68rem', textTransform: 'uppercase' as const,
    letterSpacing: 1.2, color: '#9ca3af', display: 'block', mb: 1.5
  },
  field: { '& .MuiOutlinedInput-root': { borderRadius: 2.5 } },
};

// ─── Company Profile Section ──────────────────────────────────────────────────
export const CompanyProfileSection: React.FC<{
  profile: CompanyProfile;
  onSave: (updated: CompanyProfile) => void;
}> = ({ profile: initial, onSave }) => {
  const [form, setForm] = useState({ ...initial });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = (k: keyof CompanyProfile, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings/company', form);
      onSave(form); setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <Box>
      {saved && <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }}>Company profile saved successfully ✅</Alert>}

      {/* Logo upload */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={S.section}>Company Logo</Typography>
        <Stack direction="row" alignItems="center" spacing={3}>
          <Box sx={{
            width: 100, height: 100, borderRadius: 4, overflow: 'hidden', flexShrink: 0,
            border: '2px dashed #d1d5db', display: 'flex', alignItems: 'center',
            justifyContent: 'center', bgcolor: '#f9fafb', cursor: 'pointer',
            '&:hover': { borderColor: '#6366f1', bgcolor: '#f5f3ff' }, transition: 'all .2s'
          }} onClick={() => fileRef.current?.click()}>
            {form.logoUrl ? (
              <img src={form.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }} />
            ) : (
              <Stack alignItems="center" spacing={0.5}>
                <UploadOutlined sx={{ fontSize: 28, color: '#9ca3af' }} />
                <Typography sx={{ fontSize: 10, color: '#9ca3af', fontWeight: 700 }}>Upload Logo</Typography>
              </Stack>
            )}
          </Box>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => e.target.files?.[0] && set('logoUrl', URL.createObjectURL(e.target.files[0]))} />
          <Box>
            <Typography variant="body2" fontWeight={700} mb={0.5}>Company Logo</Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
              PNG or SVG recommended. Min 200×200px. Will appear on receipts, agreements and emails.
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="outlined" startIcon={<UploadOutlined />}
                onClick={() => fileRef.current?.click()}
                sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}>
                Upload New
              </Button>
              {form.logoUrl && (
                <Button size="small" color="error" sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
                  onClick={() => set('logoUrl', '')}>
                  Remove
                </Button>
              )}
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* Basic info */}
        <Grid item xs={12}>
          <Typography sx={S.section}>Company Information</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Company Name *" size="small" value={form.name}
                onChange={e => set('name', e.target.value)} sx={S.field} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Tagline" size="small" value={form.tagline ?? ''}
                onChange={e => set('tagline', e.target.value)} sx={S.field}
                placeholder="e.g. Building Dreams, Delivering Excellence" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Company Address" size="small" multiline rows={2}
                value={form.address ?? ''} onChange={e => set('address', e.target.value)} sx={S.field} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="City" size="small" value={form.city ?? ''}
                onChange={e => set('city', e.target.value)} sx={S.field} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="State" size="small" value={form.state ?? ''}
                onChange={e => set('state', e.target.value)} sx={S.field} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Pincode" size="small" value={form.pincode ?? ''}
                onChange={e => set('pincode', e.target.value)} sx={S.field} />
            </Grid>
          </Grid>
        </Grid>

        {/* Contact */}
        <Grid item xs={12}>
          <Divider sx={{ mb: 3 }} />
          <Typography sx={S.section}>Contact & Web</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Support Email" size="small" type="email"
                value={form.supportEmail ?? ''} onChange={e => set('supportEmail', e.target.value)}
                sx={S.field} InputProps={{ startAdornment: <InputAdornment position="start">📧</InputAdornment> }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Support Phone" size="small"
                value={form.supportPhone ?? ''} onChange={e => set('supportPhone', e.target.value)}
                sx={S.field} InputProps={{ startAdornment: <InputAdornment position="start">📞</InputAdornment> }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Website" size="small" value={form.website ?? ''}
                onChange={e => set('website', e.target.value)} sx={S.field}
                InputProps={{ startAdornment: <InputAdornment position="start">🌐</InputAdornment> }} />
            </Grid>
          </Grid>
        </Grid>

        {/* Regulatory */}
        <Grid item xs={12}>
          <Divider sx={{ mb: 3 }} />
          <Typography sx={S.section}>Regulatory & Tax</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="GST Number" size="small" value={form.gstNumber ?? ''}
                onChange={e => set('gstNumber', e.target.value)} sx={S.field} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="RERA Number" size="small" value={form.reraNumber ?? ''}
                onChange={e => set('reraNumber', e.target.value)} sx={S.field} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Currency</InputLabel>
                <Select value={form.currency ?? 'INR'} label="Currency"
                  onChange={e => set('currency', e.target.value)} sx={{ borderRadius: 2.5 }}>
                  {[['INR', '₹ Indian Rupee'], ['USD', '$ US Dollar'], ['AED', 'AED Dirham']].map(([v, l]) => (
                    <MenuItem key={v} value={v}>{l}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />
      <Stack direction="row" justifyContent="flex-end">
        <Button variant="contained" disableElevation onClick={handleSave} disabled={saving}
          sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2.5, px: 4, py: 1.25 }}>
          {saving ? <CircularProgress size={18} color="inherit" /> : 'Save Company Profile'}
        </Button>
      </Stack>
    </Box>
  );
};

// ─── Branding Section ─────────────────────────────────────────────────────────
export const BrandingSection: React.FC<{
  branding: BrandingSettings;
  onSave: (b: BrandingSettings) => void;
}> = ({ branding: initial, onSave }) => {
  const [form, setForm] = useState({ ...initial });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = (k: keyof BrandingSettings, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try { await api.put('/settings/branding', form); onSave(form); setSaved(true); setTimeout(() => setSaved(false), 2500); }
    catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const FONTS = ['DM Sans', 'Lora', 'Nunito', 'Poppins', 'Raleway', 'Fraunces', 'Merriweather'];

  return (
    <Box>
      {saved && <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }}>Branding saved ✅</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography sx={S.section}>Brand Colours</Typography>
          <Stack direction="row" spacing={3} flexWrap="wrap">
            {[
              { k: 'primaryColor', label: 'Primary', help: 'Buttons, highlights, active states' },
              { k: 'secondaryColor', label: 'Secondary', help: 'Secondary actions' },
              { k: 'accentColor', label: 'Accent', help: 'Badges, decorative elements' },
            ].map(c => (
              <Box key={c.k}>
                <Typography sx={{ ...S.section, mb: 0.75 }}>{c.label}</Typography>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{
                    position: 'relative', width: 48, height: 48, borderRadius: 2.5, overflow: 'hidden',
                    border: '1px solid #e5e7eb', cursor: 'pointer'
                  }}>
                    <input type="color" value={(form as any)[c.k]}
                      onChange={e => set(c.k as any, e.target.value)}
                      style={{ position: 'absolute', inset: -8, width: 'calc(100% + 16px)', height: 'calc(100% + 16px)', cursor: 'pointer', border: 'none', padding: 0 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={700}>{(form as any)[c.k]}</Typography>
                    <Typography sx={{ fontSize: 10, color: '#9ca3af' }}>{c.help}</Typography>
                  </Box>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ mb: 3 }} />
          <Typography sx={S.section}>Appearance</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Sidebar Style</InputLabel>
                <Select value={form.sidebarStyle} label="Sidebar Style"
                  onChange={e => set('sidebarStyle', e.target.value)} sx={{ borderRadius: 2.5 }}>
                  <MenuItem value="DARK">Dark (Default)</MenuItem>
                  <MenuItem value="LIGHT">Light</MenuItem>
                  <MenuItem value="BRANDED">Branded (Primary Color)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Interface Font</InputLabel>
                <Select value={form.fontFamily} label="Interface Font"
                  onChange={e => set('fontFamily', e.target.value)} sx={{ borderRadius: 2.5 }}>
                  {FONTS.map(f => <MenuItem key={f} value={f} style={{ fontFamily: f }}>{f}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={<Switch checked={form.darkMode} onChange={e => set('darkMode', e.target.checked)} />}
                label={<Box><Typography variant="body2" fontWeight={700}>Dark Mode</Typography>
                  <Typography variant="caption" color="text.secondary">Enable dark theme globally</Typography></Box>}
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ mb: 3 }} />
          <Typography sx={S.section}>Email Signature</Typography>
          <TextField fullWidth multiline rows={4} size="small" value={form.emailSignature ?? ''}
            onChange={e => set('emailSignature', e.target.value)}
            placeholder="Regards,&#10;{{sender_name}}&#10;{{company_name}}&#10;{{support_phone}}"
            sx={S.field} />
        </Grid>

        <Grid item xs={12}>
          <Typography sx={{ ...S.section, mt: 1 }}>Custom CSS (Advanced)</Typography>
          <TextField fullWidth multiline rows={6} size="small" value={form.customCss ?? ''}
            onChange={e => set('customCss', e.target.value)}
            placeholder="/* Add custom CSS overrides here */"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, fontFamily: 'monospace', fontSize: 12 } }} />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />
      <Stack direction="row" justifyContent="flex-end">
        <Button variant="contained" disableElevation onClick={handleSave} disabled={saving}
          sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2.5, px: 4 }}>
          {saving ? <CircularProgress size={18} color="inherit" /> : 'Save Branding'}
        </Button>
      </Stack>
    </Box>
  );
};

// ─── Domain Settings Section ──────────────────────────────────────────────────
export const DomainSection: React.FC<{
  domainRequest: DomainRequest | null;
  currentSubdomain: string;
  onSubmit: (req: Partial<DomainRequest>) => void;
}> = ({ domainRequest, currentSubdomain, onSubmit }) => {
  const [form, setForm] = useState({ requestedDomain: '', domainType: 'SUBDOMAIN' as 'SUBDOMAIN' | 'CUSTOM' });
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [dnsCopied, setDnsCopied] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post('/settings/domain-request', form);
      onSubmit(form);
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const handleVerifyDNS = async () => {
    setVerifying(true);
    try { await api.post('/settings/domain-request/verify'); }
    catch (e) { console.error(e); }
    finally { setVerifying(false); }
  };

  const copyDNS = () => {
    navigator.clipboard?.writeText(domainRequest?.verificationRecord ?? '');
    setDnsCopied(true); setTimeout(() => setDnsCopied(false), 2000);
  };

  const stCfg = domainRequest ? DOMAIN_STATUS_CFG[domainRequest.status] : null;

  return (
    <Box>
      {/* Current domain */}
      <Box sx={{ p: 3, borderRadius: 3.5, bgcolor: '#0f172a', mb: 4, color: '#fff' }}>
        <Typography sx={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, color: '#64748b', mb: 1.5 }}>
          Current Active Domain
        </Typography>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={{
            width: 10, height: 10, borderRadius: '50%', bgcolor: '#10b981',
            boxShadow: '0 0 8px rgba(16,185,129,.6)'
          }} />
          <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'monospace', color: '#f1f5f9' }}>
            {currentSubdomain}.realesso.com
          </Typography>
          <Chip label="🟢 Active" size="small" sx={{ bgcolor: '#10b98125', color: '#10b981', fontWeight: 800, border: '1px solid #10b98140' }} />
        </Stack>
      </Box>

      {/* Domain request status */}
      {domainRequest && stCfg && (
        <Paper variant="outlined" sx={{
          p: 3, borderRadius: 3.5, mb: 4,
          borderColor: stCfg.color + '40', bgcolor: stCfg.bg + '40'
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Typography fontSize={20}>{stCfg.icon}</Typography>
                <Box>
                  <Typography variant="body1" fontWeight={800}>{domainRequest.requestedDomain}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Requested {domainRequest.requestedAt ? formatDate(domainRequest.requestedAt) : ''}
                  </Typography>
                </Box>
              </Stack>
            </Box>
            <Chip label={stCfg.label} size="small"
              sx={{ bgcolor: stCfg.bg, color: stCfg.color, fontWeight: 800 }} />
          </Stack>

          {/* DNS verification step */}
          {(domainRequest.status === 'APPROVED' || domainRequest.status === 'VERIFYING') && domainRequest.verificationRecord && (
            <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: '#0f172a', color: '#fff' }}>
              <Typography sx={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#64748b', mb: 1.5 }}>
                Step 2 — Add this DNS Record
              </Typography>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#1e293b', mb: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ fontFamily: 'monospace', fontSize: 13, color: '#10b981' }}>
                    {domainRequest.verificationRecord}
                  </Typography>
                  <IconButton size="small" onClick={copyDNS} sx={{ color: '#64748b', '&:hover': { color: '#10b981' } }}>
                    {dnsCopied ? <CheckCircleOutlined sx={{ fontSize: 16 }} /> : <ContentCopyOutlined sx={{ fontSize: 16 }} />}
                  </IconButton>
                </Stack>
              </Box>
              <Typography sx={{ fontSize: 11, color: '#64748b', mb: 2 }}>
                Add a CNAME record in your DNS provider pointing <strong style={{ color: '#e2e8f0' }}>{domainRequest.requestedDomain}</strong> → <strong style={{ color: '#e2e8f0' }}>app.realesso.com</strong>. Changes may take up to 48 hours.
              </Typography>
              <Button variant="outlined" size="small" startIcon={verifying ? <CircularProgress size={14} color="inherit" /> : <RefreshOutlined />}
                onClick={handleVerifyDNS} disabled={verifying}
                sx={{
                  textTransform: 'none', fontWeight: 700, borderRadius: 2, color: '#10b981', borderColor: '#10b981',
                  '&:hover': { bgcolor: '#10b98115' }
                }}>
                {verifying ? 'Checking DNS...' : 'Verify DNS Now'}
              </Button>
            </Box>
          )}

          {domainRequest.status === 'REJECTED' && domainRequest.notes && (
            <Alert severity="error" sx={{ borderRadius: 2.5 }}>
              Rejected: {domainRequest.notes}
            </Alert>
          )}
        </Paper>
      )}

      {/* New request form */}
      {!domainRequest || domainRequest.status === 'REJECTED' ? (
        <Box>
          <Typography sx={S.section}>Request Domain Change</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={5}>
              <Box sx={{ mb: 1.5 }}>
                <Typography sx={{ ...S.section, mb: 1 }}>Domain Type</Typography>
                <Stack direction="row" spacing={1.25}>
                  {[{ v: 'SUBDOMAIN', l: 'Subdomain', sub: 'yourname.realesso.com' }, { v: 'CUSTOM', l: 'Custom Domain', sub: 'crm.yourdomain.com' }].map(d => (
                    <Box key={d.v} onClick={() => set('domainType', d.v)}
                      sx={{
                        flex: 1, p: 2, borderRadius: 3, cursor: 'pointer', border: '2px solid',
                        borderColor: form.domainType === d.v ? '#6366f1' : '#e5e7eb',
                        bgcolor: form.domainType === d.v ? '#eef2ff' : '#fff', transition: 'all .15s'
                      }}>
                      <Typography variant="body2" fontWeight={800} sx={{ color: form.domainType === d.v ? '#6366f1' : '#374151' }}>{d.l}</Typography>
                      <Typography variant="caption" sx={{ color: '#9ca3af', fontFamily: 'monospace', fontSize: 10 }}>{d.sub}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Grid>
            <Grid item xs={12} sm={7}>
              <Typography sx={{ ...S.section, mb: 1 }}>
                {form.domainType === 'SUBDOMAIN' ? 'Subdomain Name' : 'Custom Domain'}
              </Typography>
              <TextField fullWidth size="small"
                value={form.requestedDomain} onChange={e => set('requestedDomain', e.target.value)}
                placeholder={form.domainType === 'SUBDOMAIN' ? 'yourcompany' : 'crm.yourcompany.com'}
                InputProps={{
                  endAdornment: form.domainType === 'SUBDOMAIN' ? (
                    <InputAdornment position="end">
                      <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 700 }}>.realesso.com</Typography>
                    </InputAdornment>
                  ) : undefined,
                }}
                sx={S.field} />
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mt: 2, borderRadius: 3 }}>
            ℹ️ Domain change requests are reviewed by our team within 1 business day. You will be notified once approved.
          </Alert>

          <Stack direction="row" justifyContent="flex-end" mt={3}>
            <Button variant="contained" disableElevation onClick={handleSubmit}
              disabled={submitting || !form.requestedDomain.trim()}
              sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2.5, px: 4 }}>
              {submitting ? <CircularProgress size={18} color="inherit" /> : '📨 Submit Domain Request'}
            </Button>
          </Stack>
        </Box>
      ) : (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          A domain change request is already in progress. Please wait for the current request to be resolved before submitting a new one.
        </Alert>
      )}
    </Box>
  );
};