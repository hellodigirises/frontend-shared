// src/modules/settings/pages/CompanyProfilePage.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Grid, TextField, Typography, Alert, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, InputAdornment,
} from '@mui/material';
import {
  BusinessOutlined, UploadOutlined, LocationOnOutlined,
  LanguageOutlined, EmailOutlined, PhoneOutlined, BadgeOutlined,
} from '@mui/icons-material';
import { PageShell, SaveBar, SLabel, Section } from './SettingsLayout';
import api from '../../../../api/axios';
import type { CompanyProfile } from './settingsTypes';

const F = { '& .MuiOutlinedInput-root':{ borderRadius:'10px', fontSize:13.5 } };
const Ia = (icon:React.ReactNode) => ({ startAdornment:<InputAdornment position="start"><Box sx={{color:'#94A3B8','& svg':{fontSize:17}}}>{icon}</Box></InputAdornment> });

export default function CompanyProfilePage() {
  const fallbackCompanyProfile: CompanyProfile = {
    id: 'cp_fallback',
    name: '',
    tagline: '',
    logoUrl: '',
    faviconUrl: '',
    address: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    website: '',
    supportEmail: '',
    supportPhone: '',
    gstNumber: '',
    reraNumber: '',
    timezone: 'UTC',
    currency: 'INR',
    language: 'en',
  };

  const [form,    setForm]    = useState<CompanyProfile | null>(null);
  const [orig,    setOrig]    = useState<CompanyProfile | null>(null);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(()=>{
    api.get('/settings/company').then(r=>{
      const d = r.data?.data ?? r.data;
      if (d) { setForm(d); setOrig(d); }
    }).catch(err => {
      console.error(err);
      setLoadError('Could not load company profile from server. Showing defaults.');
      setForm(fallbackCompanyProfile);
      setOrig(fallbackCompanyProfile);
    }).finally(()=>setLoading(false));
  },[]);

  if (loading||!form) return <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}><CircularProgress size={26}/></Box>;

  const set = (k:keyof CompanyProfile, v:string) => { setSaved(false); setForm(f=>f?{...f,[k]:v}:f); };
  const dirty = JSON.stringify(form)!==JSON.stringify(orig);

  const handleSave = async () => {
    setSaving(true);
    try { await api.put('/settings/company',form); setOrig(form); setSaved(true); setTimeout(()=>setSaved(false),3000); }
    catch(e){ console.error(e); } finally{ setSaving(false); }
  };

  return (
    <PageShell title="Company Profile" subtitle="Your company information, legal details and contact info" icon={<BusinessOutlined/>}>
      {loadError && <Alert severity="warning" sx={{ mb:3, borderRadius:'12px', fontSize:13 }}>{loadError}</Alert>}
      {saved && <Alert severity="success" sx={{ mb:3, borderRadius:'12px', fontSize:13 }}>Company profile saved ✓</Alert>}

      {/* Logo */}
      <Section title="Company Logo">
        <Box display="flex" alignItems="center" gap={3}>
          <Box onClick={()=>fileRef.current?.click()} sx={{
            width:88, height:88, borderRadius:'14px', border:'2px dashed #CBD5E1',
            display:'flex', alignItems:'center', justifyContent:'center',
            bgcolor:'#F8FAFC', cursor:'pointer', overflow:'hidden', flexShrink:0,
            '&:hover':{ borderColor:'#2563EB', bgcolor:'#EFF6FF' }, transition:'all .2s',
          }}>
            {form.logoUrl
              ? <img src={form.logoUrl} style={{ width:'100%',height:'100%',objectFit:'contain',padding:8 }} alt="logo"/>
              : <Box textAlign="center"><UploadOutlined sx={{color:'#94A3B8',fontSize:26}}/><Typography sx={{fontSize:10,color:'#94A3B8',fontWeight:700,mt:0.5}}>Upload</Typography></Box>
            }
          </Box>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={e=>e.target.files?.[0]&&set('logoUrl',URL.createObjectURL(e.target.files[0]))}/>
          <Box>
            <Typography sx={{ fontWeight:700, fontSize:14, color:'#0F172A', mb:0.5 }}>Company Logo</Typography>
            <Typography sx={{ fontSize:12.5, color:'#64748B', lineHeight:1.7 }}>
              PNG or SVG · min 200×200px<br/>Appears on invoices, receipts and outgoing emails
            </Typography>
            <Box display="flex" gap={1} mt={1.5}>
              <Box component="button" onClick={()=>fileRef.current?.click()}
                sx={{ px:2.5,py:0.75,borderRadius:'8px',border:'1px solid #E2E8F0',bgcolor:'#fff',color:'#374151',fontSize:12.5,fontWeight:600,cursor:'pointer','&:hover':{bgcolor:'#F8FAFC'} }}>
                Upload New
              </Box>
              {form.logoUrl && <Box component="button" onClick={()=>set('logoUrl','')}
                sx={{ px:2.5,py:0.75,borderRadius:'8px',border:'1px solid #FECACA',bgcolor:'#FEF2F2',color:'#DC2626',fontSize:12.5,fontWeight:600,cursor:'pointer' }}>
                Remove
              </Box>}
            </Box>
          </Box>
        </Box>
      </Section>

      {/* Basic info */}
      <Section title="Company Information">
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={7}>
            <TextField fullWidth size="small" label="Company Name *" value={form.name??''} onChange={e=>set('name',e.target.value)} sx={F} InputProps={Ia(<BusinessOutlined/>)}/>
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField fullWidth size="small" label="Tagline / Slogan" value={form.tagline??''} onChange={e=>set('tagline',e.target.value)} sx={F} placeholder="Building Dreams, Delivering Excellence"/>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth size="small" label="Registered Address" multiline rows={2} value={form.address??''} onChange={e=>set('address',e.target.value)} sx={F} InputProps={Ia(<LocationOnOutlined/>)}/>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="City" value={form.city??''} onChange={e=>set('city',e.target.value)} sx={F}/>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="State" value={form.state??''} onChange={e=>set('state',e.target.value)} sx={F}/>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Pincode" value={form.pincode??''} onChange={e=>set('pincode',e.target.value)} sx={F}/>
          </Grid>
        </Grid>
      </Section>

      {/* Contact */}
      <Section title="Contact & Web Presence">
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Support Email" type="email" value={form.supportEmail??''} onChange={e=>set('supportEmail',e.target.value)} sx={F} InputProps={Ia(<EmailOutlined/>)}/></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Support Phone" value={form.supportPhone??''} onChange={e=>set('supportPhone',e.target.value)} sx={F} InputProps={Ia(<PhoneOutlined/>)}/></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Website" value={form.website??''} onChange={e=>set('website',e.target.value)} sx={F} placeholder="https://yourcompany.com" InputProps={Ia(<LanguageOutlined/>)}/></Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small"><InputLabel>Timezone</InputLabel>
              <Select value={form.timezone??'Asia/Kolkata'} label="Timezone" onChange={e=>set('timezone',e.target.value)} sx={{borderRadius:'10px'}}>
                {['Asia/Kolkata','Asia/Dubai','America/New_York','Europe/London','Asia/Singapore'].map(tz=><MenuItem key={tz} value={tz} sx={{fontSize:13}}>{tz}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small"><InputLabel>Currency</InputLabel>
              <Select value={form.currency??'INR'} label="Currency" onChange={e=>set('currency',e.target.value)} sx={{borderRadius:'10px'}}>
                {[['INR','₹ Indian Rupee'],['USD','$ US Dollar'],['AED','AED Dirham'],['GBP','£ British Pound']].map(([v,l])=><MenuItem key={v} value={v} sx={{fontSize:13}}>{l}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Section>

      {/* Regulatory */}
      <Section title="Regulatory & Tax" last>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={4}><TextField fullWidth size="small" label="GSTIN" value={form.gstNumber??''} onChange={e=>set('gstNumber',e.target.value.toUpperCase())} sx={F} placeholder="27AABCU9603R1ZX" InputProps={Ia(<BadgeOutlined/>)}/></Grid>
          <Grid item xs={12} sm={4}><TextField fullWidth size="small" label="RERA Number" value={form.reraNumber??''} onChange={e=>set('reraNumber',e.target.value)} sx={F} placeholder="P51700015682"/></Grid>
          <Grid item xs={12} sm={4}><TextField fullWidth size="small" label="PAN Number" value={(form as any).panNumber??''} onChange={e=>set('panNumber' as any,e.target.value.toUpperCase())} sx={F} placeholder="AABCU9603R"/></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="CIN (Company Identification Number)" value={(form as any).cin??''} onChange={e=>set('cin' as any,e.target.value)} sx={F} placeholder="U45200MH2020PTC123456"/></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="MahaRERA Registration No." value={(form as any).maharera??''} onChange={e=>set('maharera' as any,e.target.value)} sx={F}/></Grid>
        </Grid>
      </Section>

      <SaveBar dirty={dirty} saving={saving} saved={saved} onSave={handleSave} onDiscard={()=>{setForm(orig);setSaved(false);}}/>
    </PageShell>
  );
}
