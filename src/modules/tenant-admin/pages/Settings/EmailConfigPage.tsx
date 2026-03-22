// src/modules/settings/pages/EmailConfigPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box, Grid, TextField, Typography, Alert, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, Switch,
  FormControlLabel, InputAdornment, Chip,
} from '@mui/material';
import { EmailOutlined, SendOutlined, CheckCircleOutlined } from '@mui/icons-material';
import { PageShell, SaveBar, SLabel, Section } from './SettingsLayout';
import api from '../../../../api/axios';

const F = { '& .MuiOutlinedInput-root':{ borderRadius:'10px', fontSize:13.5 } };

interface EmailConfig {
  smtpHost       : string;
  smtpPort       : number;
  smtpUser       : string;
  smtpPass       : string;
  smtpFrom       : string;
  smtpFromName   : string;
  smtpSecure     : boolean;
  sendWelcomeEmail: boolean;
  sendPaymentEmail: boolean;
  sendReminderEmail:boolean;
  sendOtpEmail   : boolean;
}

const BLANK: EmailConfig = { smtpHost:'', smtpPort:587, smtpUser:'', smtpPass:'', smtpFrom:'', smtpFromName:'', smtpSecure:true, sendWelcomeEmail:true, sendPaymentEmail:true, sendReminderEmail:true, sendOtpEmail:true };

export default function EmailConfigPage() {
  const [form,    setForm]    = useState<EmailConfig>(BLANK);
  const [orig,    setOrig]    = useState<EmailConfig>(BLANK);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [testing, setTesting] = useState(false);
  const [testRes, setTestRes] = useState<'success'|'error'|null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    api.get('/settings/email-config').then(r=>{ 
      const d = r.data?.data ?? r.data;
      if (d) {
        setForm({...BLANK,...d}); 
        setOrig({...BLANK,...d}); 
      }
    }).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}><CircularProgress size={26}/></Box>;

  const set = <K extends keyof EmailConfig>(k:K, v:EmailConfig[K]) => { setSaved(false); setForm(f=>({...f,[k]:v})); };
  const dirty = JSON.stringify(form)!==JSON.stringify(orig);

  const handleSave = async () => {
    setSaving(true);
    try { await api.put('/settings/email-config',form); setOrig(form); setSaved(true); setTimeout(()=>setSaved(false),3000); }
    catch(e){ console.error(e); } finally{ setSaving(false); }
  };

  const handleTest = async () => {
    setTesting(true); setTestRes(null);
    try { await api.post('/settings/email-config/test',{ smtp: form }); setTestRes('success'); }
    catch { setTestRes('error'); } finally { setTesting(false); }
  };

  return (
    <PageShell title="Email Configuration" subtitle="Configure SMTP settings for outgoing emails"
      icon={<EmailOutlined/>}
      action={
        <Box component="button" onClick={handleTest} disabled={testing||!form.smtpHost}
          sx={{ px:2.5, py:1, borderRadius:'9px', border:'1px solid #E2E8F0', bgcolor:'#fff', color:'#374151', fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:1, opacity:!form.smtpHost?0.5:1 }}>
          {testing ? <CircularProgress size={14}/> : <SendOutlined sx={{fontSize:16}}/>}
          Send Test Email
        </Box>
      }>
      {saved && <Alert severity="success" sx={{ mb:3, borderRadius:'12px', fontSize:13 }}>Email configuration saved ✓</Alert>}
      {testRes==='success' && <Alert severity="success" sx={{ mb:3, borderRadius:'12px', fontSize:13 }}>Test email sent successfully ✓</Alert>}
      {testRes==='error'   && <Alert severity="error"   sx={{ mb:3, borderRadius:'12px', fontSize:13 }}>SMTP connection failed. Check your settings.</Alert>}

      <Section title="SMTP Server">
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={7}>
            <TextField fullWidth size="small" label="SMTP Host *" value={form.smtpHost} onChange={e=>set('smtpHost',e.target.value)} sx={F} placeholder="smtp.gmail.com or smtp.sendgrid.net"/>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField fullWidth size="small" label="Port" type="number" value={form.smtpPort} onChange={e=>set('smtpPort',+e.target.value)} sx={F}/>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Box sx={{ pt:0.5 }}>
              <SLabel>TLS/SSL</SLabel>
              <Switch checked={form.smtpSecure} onChange={e=>set('smtpSecure',e.target.checked)} sx={{'& .Mui-checked + .MuiSwitch-track':{bgcolor:'#2563EB !important'}}}/>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth size="small" label="SMTP Username" value={form.smtpUser} onChange={e=>set('smtpUser',e.target.value)} sx={F}/>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth size="small" label="SMTP Password" type="password" value={form.smtpPass} onChange={e=>set('smtpPass',e.target.value)} sx={F}/>
          </Grid>
        </Grid>
      </Section>

      <Section title="From Details">
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth size="small" label="From Email *" value={form.smtpFrom} onChange={e=>set('smtpFrom',e.target.value)} sx={F} placeholder="noreply@yourcompany.com" InputProps={{startAdornment:<InputAdornment position="start"><EmailOutlined sx={{fontSize:17,color:'#94A3B8'}}/></InputAdornment>}}/>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth size="small" label="From Name *" value={form.smtpFromName} onChange={e=>set('smtpFromName',e.target.value)} sx={F} placeholder="Prestige Realty"/>
          </Grid>
        </Grid>
      </Section>

      <Section title="Email Triggers" last>
        <Typography sx={{ fontSize:13, color:'#64748B', mb:2 }}>Control which system events send emails automatically</Typography>
        {[
          { k:'sendWelcomeEmail',  label:'Welcome Email on Onboarding', desc:'Send credentials when a new member is onboarded' },
          { k:'sendPaymentEmail',  label:'Payment Confirmation',         desc:'Email receipt when a payment is recorded' },
          { k:'sendReminderEmail', label:'Installment Due Reminders',    desc:'7 days before and on due date' },
          { k:'sendOtpEmail',      label:'OTP / 2FA Emails',            desc:'Send OTP for two-factor authentication' },
        ].map(item=>(
          <Box key={item.k} display="flex" justifyContent="space-between" alignItems="center" py={1.5} sx={{ borderBottom:'1px solid #F1F5F9' }}>
            <Box>
              <Typography sx={{ fontSize:13.5, fontWeight:600, color:'#0F172A' }}>{item.label}</Typography>
              <Typography sx={{ fontSize:12.5, color:'#64748B' }}>{item.desc}</Typography>
            </Box>
            <Switch checked={(form as any)[item.k]} onChange={e=>set(item.k as any, e.target.checked)} sx={{'& .Mui-checked + .MuiSwitch-track':{bgcolor:'#2563EB !important'}}}/>
          </Box>
        ))}
      </Section>

      <SaveBar dirty={dirty} saving={saving} saved={saved} onSave={handleSave} onDiscard={()=>{setForm(orig);setSaved(false);}}/>
    </PageShell>
  );
}
