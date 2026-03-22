// src/modules/settings/pages/SecurityPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box, Grid, TextField, Typography, Alert, CircularProgress,
  Switch, FormControlLabel, Chip, Divider,
} from '@mui/material';
import { SecurityOutlined, AddOutlined, CloseOutlined } from '@mui/icons-material';
import { PageShell, SaveBar, SLabel, Section } from './SettingsLayout';
import api from '../../../../api/axios';
import type { SecurityConfig } from './settingsTypes';

const F = { '& .MuiOutlinedInput-root':{ borderRadius:'10px', fontSize:13.5 } };

const BLANK: SecurityConfig = {
  minPasswordLength:8, requireUppercase:true, requireNumbers:true, requireSpecialChars:true,
  passwordExpiryDays:90, sessionTimeoutMinutes:60, maxLoginAttempts:5,
  twoFactorEnabled:false, ipWhitelistEnabled:false, allowedIPs:[],
};

export default function SecurityPage() {
  const [form,    setForm]    = useState<SecurityConfig>(BLANK);
  const [orig,    setOrig]    = useState<SecurityConfig>(BLANK);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [loading, setLoading] = useState(true);
  const [newIP,   setNewIP]   = useState('');

  useEffect(()=>{
    api.get('/settings/security').then(r=>{ 
      const d = r.data?.data ?? r.data;
      if (d) {
        setForm({...BLANK,...d}); 
        setOrig({...BLANK,...d}); 
      }
    }).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}><CircularProgress size={26}/></Box>;

  const set = <K extends keyof SecurityConfig>(k:K, v:SecurityConfig[K]) => { setSaved(false); setForm(f=>({...f,[k]:v})); };
  const dirty = JSON.stringify(form)!==JSON.stringify(orig);

  const handleSave = async () => {
    setSaving(true);
    try { await api.put('/settings/security',form); setOrig(form); setSaved(true); setTimeout(()=>setSaved(false),3000); }
    catch(e){ console.error(e); } finally{ setSaving(false); }
  };

  const addIP = () => { if (newIP.trim()) { set('allowedIPs',[...form.allowedIPs,newIP.trim()]); setNewIP(''); } };

  return (
    <PageShell title="Security" subtitle="Password policies, session controls and access restrictions" icon={<SecurityOutlined/>}>
      {saved && <Alert severity="success" sx={{ mb:3, borderRadius:'12px', fontSize:13 }}>Security settings saved ✓</Alert>}

      {/* Password policy */}
      <Section title="Password Policy">
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Minimum Length" type="number" value={form.minPasswordLength}
              onChange={e=>set('minPasswordLength',+e.target.value)} inputProps={{min:6,max:32}} sx={F}/>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Password Expiry (days)" type="number" value={form.passwordExpiryDays}
              onChange={e=>set('passwordExpiryDays',+e.target.value)} inputProps={{min:0}} sx={F}
              helperText="0 = never expires" FormHelperTextProps={{sx:{fontSize:11.5,mx:0}}}/>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Max Login Attempts" type="number" value={form.maxLoginAttempts}
              onChange={e=>set('maxLoginAttempts',+e.target.value)} inputProps={{min:3,max:20}} sx={F}/>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" gap={3} flexWrap="wrap">
              {[
                { k:'requireUppercase',    l:'Require uppercase letter' },
                { k:'requireNumbers',      l:'Require numbers' },
                { k:'requireSpecialChars', l:'Require special characters' },
              ].map(o=>(
                <FormControlLabel key={o.k}
                  control={<Switch checked={(form as any)[o.k]} onChange={e=>set(o.k as any,e.target.checked)} size="small" sx={{'& .Mui-checked + .MuiSwitch-track':{bgcolor:'#2563EB !important'}}}/>}
                  label={<Typography sx={{fontSize:13.5,fontWeight:600,color:'#374151'}}>{o.l}</Typography>}/>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Section>

      {/* Session & 2FA */}
      <Section title="Session & Authentication">
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Session Timeout (minutes)" type="number" value={form.sessionTimeoutMinutes}
              onChange={e=>set('sessionTimeoutMinutes',+e.target.value)} sx={F}/>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Box display="flex" flexDirection="column" gap={1.5} pt={0.5}>
              <Box display="flex" justifyContent="space-between" alignItems="center" p={1.75} sx={{ borderRadius:'10px', border:'1px solid #E2E8F0' }}>
                <Box>
                  <Typography sx={{ fontWeight:700, fontSize:13.5, color:'#0F172A' }}>Two-Factor Authentication</Typography>
                  <Typography sx={{ fontSize:12.5, color:'#64748B' }}>Require OTP on every login for all users</Typography>
                </Box>
                <Switch checked={form.twoFactorEnabled} onChange={e=>set('twoFactorEnabled',e.target.checked)} sx={{'& .Mui-checked + .MuiSwitch-track':{bgcolor:'#2563EB !important'}}}/>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" p={1.75} sx={{ borderRadius:'10px', border:'1px solid #E2E8F0' }}>
                <Box>
                  <Typography sx={{ fontWeight:700, fontSize:13.5, color:'#0F172A' }}>IP Whitelist</Typography>
                  <Typography sx={{ fontSize:12.5, color:'#64748B' }}>Restrict logins to specific IP addresses only</Typography>
                </Box>
                <Switch checked={form.ipWhitelistEnabled} onChange={e=>set('ipWhitelistEnabled',e.target.checked)} sx={{'& .Mui-checked + .MuiSwitch-track':{bgcolor:'#2563EB !important'}}}/>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Section>

      {/* IP Whitelist */}
      {form.ipWhitelistEnabled && (
        <Section title="Allowed IP Addresses" last>
          <Box display="flex" gap={1.5} mb={2}>
            <TextField fullWidth size="small" value={newIP} onChange={e=>setNewIP(e.target.value)}
              placeholder="e.g. 192.168.1.0/24 or 103.21.244.0" sx={F}
              onKeyDown={e=>e.key==='Enter'&&addIP()}/>
            <Box component="button" onClick={addIP}
              sx={{ px:2.5, py:0, borderRadius:'10px', border:'1px solid #E2E8F0', bgcolor:'#fff', color:'#374151', fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:0.5, whiteSpace:'nowrap', '&:hover':{bgcolor:'#F8FAFC'} }}>
              <AddOutlined sx={{fontSize:16}}/> Add
            </Box>
          </Box>
          {form.allowedIPs.length===0
            ? <Typography sx={{ fontSize:13, color:'#94A3B8', py:2, textAlign:'center', bgcolor:'#F8FAFC', borderRadius:'10px' }}>No IPs added — all IPs are blocked</Typography>
            : <Box display="flex" flexWrap="wrap" gap={0.75}>
                {form.allowedIPs.map((ip,i)=>(
                  <Chip key={i} label={ip} size="small" onDelete={()=>set('allowedIPs',form.allowedIPs.filter((_,j)=>j!==i))}
                    sx={{ fontFamily:'monospace', fontSize:12, fontWeight:600, bgcolor:'#F1F5F9' }}
                    deleteIcon={<CloseOutlined sx={{fontSize:'14px !important'}}/>}/>
                ))}
              </Box>
          }
        </Section>
      )}

      <SaveBar dirty={dirty} saving={saving} saved={saved} onSave={handleSave} onDiscard={()=>{setForm(orig);setSaved(false);}}/>
    </PageShell>
  );
}
