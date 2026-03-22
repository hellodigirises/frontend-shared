// src/modules/settings/pages/DomainPage.tsx
// This page includes the critical "Email Domain" field used by the onboarding system
// to auto-generate company emails like: rahul.sharma@prestige-dev.com
import React, { useState, useEffect } from 'react';
import {
  Box, Grid, TextField, Typography, Alert, CircularProgress,
  Chip, InputAdornment, Divider, Paper,
} from '@mui/material';
import {
  DomainOutlined, CheckCircleOutlined, ContentCopyOutlined,
  RefreshOutlined, EmailOutlined, LinkOutlined, HourglassEmptyOutlined,
} from '@mui/icons-material';
import { PageShell, SaveBar, SLabel, Section } from './SettingsLayout';
import api from '../../../../api/axios';

const F = { '& .MuiOutlinedInput-root':{ borderRadius:'10px', fontSize:13.5 } };

interface DomainForm {
  emailDomain    : string;   // e.g. "prestige-dev" → emails become firstname.lastname@prestige-dev.com
  companyEmail   : string;   // e.g. "hello@prestige-dev.com"
  requestedDomain: string;
  domainType     : 'SUBDOMAIN' | 'CUSTOM';
}

const STATUS_CFG = {
  PENDING  : { label:'Pending Review', color:'#7C3AED', bg:'#F5F3FF', icon:<HourglassEmptyOutlined sx={{fontSize:15}}/> },
  APPROVED : { label:'Approved',       color:'#059669', bg:'#ECFDF5', icon:<CheckCircleOutlined sx={{fontSize:15}}/> },
  ACTIVE   : { label:'Active',         color:'#059669', bg:'#ECFDF5', icon:<CheckCircleOutlined sx={{fontSize:15}}/> },
  REJECTED : { label:'Rejected',       color:'#DC2626', bg:'#FEF2F2', icon:null },
  VERIFYING: { label:'DNS Verifying',  color:'#D97706', bg:'#FFFBEB', icon:<RefreshOutlined sx={{fontSize:15}}/> },
};

export default function DomainPage() {
  const [form,      setForm]      = useState<DomainForm>({ emailDomain:'', companyEmail:'', requestedDomain:'', domainType:'SUBDOMAIN' });
  const [orig,      setOrig]      = useState<DomainForm>({ emailDomain:'', companyEmail:'', requestedDomain:'', domainType:'SUBDOMAIN' });
  const [domainReq, setDomainReq] = useState<any>(null);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [copied,    setCopied]    = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [tenantSub, setTenantSub] = useState('yourcompany');

  useEffect(()=>{
    Promise.all([
      api.get('/settings/company'),
      api.get('/settings/domain-request').catch(()=>({ data:null })),
    ]).then(([cRes, dRes])=>{
      const c = cRes.data?.data ?? cRes.data;
      const dr = dRes.data?.data ?? dRes.data;
      
      if (c) {
        const slug = (c.name??'yourcompany').toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
        setTenantSub(slug);
        const d: DomainForm = {
          emailDomain   : c.emailDomain   ?? '',
          companyEmail  : c.companyEmail  ?? '',
          requestedDomain: '',
          domainType    : 'SUBDOMAIN',
        };
        setForm(d); setOrig(d);
      }
      if (dr) setDomainReq(dr);
    }).finally(()=>setLoading(false));
  },[]);

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}><CircularProgress size={26}/></Box>;

  const set = (k:keyof DomainForm, v:string) => { setSaved(false); setForm(f=>({...f,[k]:v})); };
  const dirty = JSON.stringify(form)!==JSON.stringify(orig);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings/company',{ emailDomain:form.emailDomain, companyEmail:form.companyEmail });
      setOrig(form); setSaved(true); setTimeout(()=>setSaved(false),3000);
    } catch(e){ console.error(e); } finally{ setSaving(false); }
  };

  const handleSubmitDomainReq = async () => {
    if (!form.requestedDomain) return;
    setSaving(true);
    try {
      const r = await api.post('/settings/domain-request',{ requestedDomain:form.requestedDomain, domainType:form.domainType });
      setDomainReq(r.data);
    } catch(e){ console.error(e); } finally{ setSaving(false); }
  };

  const stCfg = domainReq ? (STATUS_CFG as any)[domainReq.status] : null;

  const previewEmail = form.emailDomain
    ? `firstname.lastname@${form.emailDomain}`
    : '—';

  const copy = (text:string) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(()=>setCopied(false),2000); };

  return (
    <PageShell title="Domain & Email" subtitle="Configure your platform domain and company email identity" icon={<DomainOutlined/>}>
      {saved && <Alert severity="success" sx={{ mb:3, borderRadius:'12px', fontSize:13 }}>Email domain settings saved ✓</Alert>}

      {/* ── Current platform domain ── */}
      <Box sx={{ p:3, borderRadius:'14px', background:'linear-gradient(135deg,#0B1120 0%,#1E2D45 100%)', mb:2.5, color:'#fff' }}>
        <Typography sx={{ fontSize:10.5, fontWeight:700, letterSpacing:1.2, color:'#64748B', textTransform:'uppercase', mb:1.5 }}>Current Platform Domain</Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Box sx={{ width:10, height:10, borderRadius:'50%', bgcolor:'#10B981', boxShadow:'0 0 8px rgba(16,185,129,.6)', flexShrink:0 }}/>
          <Typography sx={{ fontSize:18, fontWeight:800, fontFamily:'monospace', color:'#F1F5F9', flex:1 }}>
            {tenantSub}.realesso.com
          </Typography>
          <Chip label="🟢 Active" size="small" sx={{ bgcolor:'rgba(16,185,129,0.15)', color:'#10B981', fontWeight:700, border:'1px solid rgba(16,185,129,0.3)' }}/>
          <Box component="button" onClick={()=>copy(`${tenantSub}.realesso.com`)}
            sx={{ bgcolor:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'8px', color:'#94A3B8', px:1.5, py:0.5, cursor:'pointer', display:'flex', alignItems:'center', gap:0.5, '&:hover':{bgcolor:'rgba(255,255,255,0.12)'} }}>
            {copied ? <CheckCircleOutlined sx={{fontSize:14,color:'#10B981'}}/> : <ContentCopyOutlined sx={{fontSize:14}}/>}
            <Typography sx={{fontSize:12,fontWeight:600}}>{copied?'Copied':'Copy'}</Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Company email domain — KEY FIELD ── */}
      <Section title="Company Email Identity">
        <Alert severity="info" sx={{ borderRadius:'10px', mb:2.5, fontSize:13 }}>
          <strong>How it works:</strong> When you onboard a new staff member named "Rahul Sharma", the system auto-generates <code style={{background:'#E0F2FE',padding:'1px 6px',borderRadius:4}}>rahul.sharma@{form.emailDomain||'your-domain.com'}</code> and includes it in their welcome email.
        </Alert>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <SLabel>Company Email Domain *</SLabel>
            <TextField fullWidth size="small" value={form.emailDomain} 
              onChange={e=>set('emailDomain',e.target.value.toLowerCase().replace(/[^a-z0-9-.]/g,''))}
              placeholder="e.g. prestige-dev.com or realesso.in"
              InputProps={{
                startAdornment:<InputAdornment position="start"><Typography sx={{color:'#94A3B8',fontSize:13}}>@</Typography></InputAdornment>,
              }}
              sx={F} helperText="Enter your company's full email domain (e.g. prestige-dev.com)"
              FormHelperTextProps={{sx:{fontSize:11.5,mx:0}}}/>
          </Grid>
          <Grid item xs={12} sm={6}>
            <SLabel>Company-wide Reply Email</SLabel>
            <TextField fullWidth size="small" value={form.companyEmail} onChange={e=>set('companyEmail',e.target.value)}
              placeholder={`hello@${form.emailDomain||'prestige-dev.com'}`}
              InputProps={{ startAdornment:<InputAdornment position="start"><EmailOutlined sx={{fontSize:17,color:'#94A3B8'}}/></InputAdornment> }}
              sx={F} helperText="Used as the From address for outgoing emails"
              FormHelperTextProps={{sx:{fontSize:11.5,mx:0}}}/>
          </Grid>

          {/* Live preview */}
          {form.emailDomain && (
            <Grid item xs={12}>
              <Box sx={{ p:2, borderRadius:'12px', bgcolor:'#F0FDF4', border:'1px solid #BBF7D0' }}>
                <Typography sx={{ fontSize:12.5, fontWeight:700, color:'#059669', mb:1 }}>✓ Email Preview — how onboarded staff will see it</Typography>
                <Grid container spacing={1.5}>
                  {[
                    ['Rahul Sharma → Agent',       `rahul.sharma@${form.emailDomain}`],
                    ['Priya Verma → HR',            `priya.verma@${form.emailDomain}`],
                    ['Amit Singh → Finance',        `amit.singh@${form.emailDomain}`],
                    ['Recurring name → Agent',      `rahul.sharma2@${form.emailDomain}`],
                  ].map(([name,email])=>(
                    <Grid item xs={12} sm={6} key={name}>
                      <Box sx={{ display:'flex', justifyContent:'space-between', py:0.6, borderBottom:'1px solid #BBF7D0' }}>
                        <Typography sx={{ fontSize:12, color:'#64748B' }}>{name}</Typography>
                        <Typography sx={{ fontSize:12, fontWeight:600, color:'#059669', fontFamily:'monospace' }}>{email}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>
          )}
        </Grid>
      </Section>

      {/* ── Custom platform domain ── */}
      <Section title="Custom Platform Domain (Optional)">
        {domainReq && stCfg ? (
          <Box>
            <Box sx={{ p:2.5, borderRadius:'12px', border:`1px solid ${stCfg.color}40`, bgcolor:`${stCfg.bg}`, mb:2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box sx={{ color:stCfg.color }}>{stCfg.icon}</Box>
                  <Typography sx={{ fontWeight:700, fontSize:14, color:'#0F172A' }}>{domainReq.requestedDomain}</Typography>
                </Box>
                <Chip label={stCfg.label} size="small" sx={{ bgcolor:stCfg.bg, color:stCfg.color, fontWeight:700, border:`1px solid ${stCfg.color}30` }}/>
              </Box>
              {['APPROVED','VERIFYING'].includes(domainReq.status) && domainReq.verificationRecord && (
                <Box sx={{ p:2, borderRadius:'10px', bgcolor:'#0B1120', mt:1.5 }}>
                  <Typography sx={{ fontSize:10.5, color:'#64748B', fontWeight:700, letterSpacing:1, textTransform:'uppercase', mb:1 }}>DNS Record to Add</Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ fontFamily:'monospace', fontSize:12.5, color:'#10B981' }}>{domainReq.verificationRecord}</Typography>
                    <Box component="button" onClick={()=>copy(domainReq.verificationRecord)}
                      sx={{ bgcolor:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'8px', color:'#94A3B8', px:1.5, py:0.5, cursor:'pointer' }}>
                      <ContentCopyOutlined sx={{fontSize:14}}/>
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize:11.5, color:'#475569', mt:1 }}>
                    Add a CNAME record: <strong style={{color:'#E2E8F0'}}>{domainReq.requestedDomain}</strong> → <strong style={{color:'#E2E8F0'}}>app.realesso.com</strong>. DNS changes may take up to 48 hours.
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography sx={{ fontSize:13, color:'#64748B', mb:2, lineHeight:1.7 }}>
              Request a custom domain like <code style={{background:'#F1F5F9',padding:'1px 6px',borderRadius:4,fontSize:12}}>crm.yourcompany.com</code> instead of the default Realesso subdomain. Reviewed within 1 business day.
            </Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <Box display="flex" gap={1.5} mb={2}>
                  {[{v:'SUBDOMAIN',l:'Realesso Subdomain',sub:'yourname.realesso.com'},{v:'CUSTOM',l:'Custom Domain',sub:'crm.yourdomain.com'}].map(d=>(
                    <Box key={d.v} onClick={()=>set('domainType',d.v as any)} sx={{
                      flex:1, p:2, borderRadius:'12px', cursor:'pointer', border:'2px solid',
                      borderColor:form.domainType===d.v?'#2563EB':'#E2E8F0',
                      bgcolor:form.domainType===d.v?'#EFF6FF':'#fff', transition:'all .15s',
                    }}>
                      <Typography sx={{ fontWeight:700, fontSize:13.5, color:form.domainType===d.v?'#2563EB':'#374151', mb:0.25 }}>{d.l}</Typography>
                      <Typography sx={{ fontSize:11.5, color:'#94A3B8', fontFamily:'monospace' }}>{d.sub}</Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} sm={8}>
                <SLabel>{form.domainType==='SUBDOMAIN'?'Subdomain Name':'Your Custom Domain'}</SLabel>
                <TextField fullWidth size="small" value={form.requestedDomain} onChange={e=>set('requestedDomain',e.target.value)}
                  placeholder={form.domainType==='SUBDOMAIN'?'yourcompany':'crm.yourcompany.com'}
                  InputProps={{
                    startAdornment:<InputAdornment position="start"><LinkOutlined sx={{fontSize:17,color:'#94A3B8'}}/></InputAdornment>,
                    endAdornment: form.domainType==='SUBDOMAIN'
                      ? <InputAdornment position="end"><Typography sx={{color:'#94A3B8',fontSize:12}}>.realesso.com</Typography></InputAdornment>
                      : undefined,
                  }} sx={F}/>
              </Grid>
              <Grid item xs={12} sm={4} sx={{ display:'flex', alignItems:'flex-end' }}>
                <Box component="button" onClick={handleSubmitDomainReq} disabled={saving||!form.requestedDomain}
                  sx={{ width:'100%', py:1.1, borderRadius:'10px', border:'none', background:'linear-gradient(135deg,#2563EB,#1D4ED8)', color:'#fff', fontSize:13.5, fontWeight:700, cursor:saving||!form.requestedDomain?'not-allowed':'pointer', opacity:!form.requestedDomain?0.6:1 }}>
                  {saving?'Submitting…':'Submit Request'}
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </Section>

      <SaveBar dirty={dirty} saving={saving} saved={saved} onSave={handleSave} onDiscard={()=>{setForm(orig);setSaved(false);}}/>
    </PageShell>
  );
}
