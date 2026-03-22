// src/modules/settings/pages/BrandingPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box, Grid, TextField, Typography, Alert, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel,
} from '@mui/material';
import { PaletteOutlined } from '@mui/icons-material';
import { PageShell, SaveBar, SLabel, Section } from './SettingsLayout';
import api from '../../../../api/axios';
import type { BrandingSettings } from './settingsTypes';

const F = { '& .MuiOutlinedInput-root':{ borderRadius:'10px', fontSize:13.5 } };
const FONTS = ['DM Sans','Lora','Nunito','Poppins','Raleway','Fraunces','Merriweather','Playfair Display','Sora','Outfit'];
const SIDEBAR_STYLES = [
  { value:'DARK',    label:'Dark',    desc:'Deep navy — professional' },
  { value:'LIGHT',   label:'Light',   desc:'Clean white — airy' },
  { value:'BRANDED', label:'Branded', desc:'Your primary colour' },
];

const ColorSwatch: React.FC<{ label:string; value:string; onChange:(v:string)=>void; help:string }> = ({ label, value, onChange, help }) => (
  <Box>
    <SLabel>{label}</SLabel>
    <Box display="flex" alignItems="center" gap={1.75} mb={0.5}>
      <Box sx={{ position:'relative', width:48, height:48, borderRadius:'12px', overflow:'hidden', border:'1px solid #E2E8F0', cursor:'pointer', flexShrink:0 }}>
        <Box sx={{ position:'absolute', inset:0, bgcolor:value }}/>
        <input type="color" value={value} onChange={e=>onChange(e.target.value)}
          style={{ position:'absolute', inset:-8, width:'calc(100% + 16px)', height:'calc(100% + 16px)', cursor:'pointer', border:'none', padding:0, opacity:0 }}/>
      </Box>
      <Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Box sx={{ width:12, height:12, borderRadius:'50%', bgcolor:value, border:'1px solid rgba(0,0,0,0.1)' }}/>
          <Typography sx={{ fontFamily:'monospace', fontSize:13, fontWeight:700, color:'#0F172A' }}>{value}</Typography>
        </Box>
        <Typography sx={{ fontSize:11.5, color:'#94A3B8' }}>{help}</Typography>
      </Box>
    </Box>
  </Box>
);

export default function BrandingPage() {
  const fallbackBrandingSettings: BrandingSettings = {
    primaryColor: '#6366F1',
    secondaryColor: '#818CF8',
    accentColor: '#EC4899',
    darkMode: false,
    sidebarStyle: 'DARK',
    fontFamily: 'DM Sans',
    emailSignature: '',
    footerText: '',
    customCss: '',
  };

  const [form,    setForm]    = useState<BrandingSettings|null>(null);
  const [orig,    setOrig]    = useState<BrandingSettings|null>(null);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(()=>{
    api.get('/settings/branding').then(r=>{
      const d = r.data?.data ?? r.data;
      if (d) { setForm(d); setOrig(d); }
    }).catch(err => {
      console.error(err);
      setLoadError('Could not load branding settings from server. Showing defaults.');
      setForm(fallbackBrandingSettings);
      setOrig(fallbackBrandingSettings);
    }).finally(()=>setLoading(false));
  },[]);

  if (loading||!form) return <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}><CircularProgress size={26}/></Box>;

  const set = <K extends keyof BrandingSettings>(k:K, v:BrandingSettings[K]) => { setSaved(false); setForm(f=>f?{...f,[k]:v}:f); };
  const dirty = JSON.stringify(form)!==JSON.stringify(orig);

  const handleSave = async () => {
    setSaving(true);
    try { await api.put('/settings/branding',form); setOrig(form); setSaved(true); setTimeout(()=>setSaved(false),3000); }
    catch(e){ console.error(e); } finally{ setSaving(false); }
  };

  return (
    <PageShell title="Branding" subtitle="Customise the visual identity of your Realesso platform" icon={<PaletteOutlined/>}>
      {loadError && <Alert severity="warning" sx={{ mb:3, borderRadius:'12px', fontSize:13 }}>{loadError}</Alert>}
      {saved && <Alert severity="success" sx={{ mb:3, borderRadius:'12px', fontSize:13 }}>Branding saved ✓</Alert>}

      {/* Live preview */}
      <Section title="Live Preview">
        <Box sx={{
          borderRadius:'12px', overflow:'hidden', border:'1px solid #E2E8F0',
          display:'flex', height:120,
        }}>
          <Box sx={{ width:180, bgcolor:form.sidebarStyle==='LIGHT'?'#fff':form.sidebarStyle==='BRANDED'?form.primaryColor:'#0B1120', display:'flex', flexDirection:'column', justifyContent:'center', px:2, gap:1 }}>
            {['Dashboard','Leads','Bookings'].map(item=>(
              <Box key={item} sx={{ height:22, borderRadius:'6px', bgcolor:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', px:1 }}>
                <Box sx={{ width:6,height:6,borderRadius:'50%',bgcolor:form.primaryColor,mr:1,flexShrink:0 }}/>
                <Typography sx={{ fontSize:10, color:'rgba(255,255,255,0.7)', fontFamily:form.fontFamily }}>
                  {item}
                </Typography>
              </Box>
            ))}
          </Box>
          <Box sx={{ flex:1, bgcolor:'#F8FAFC', p:2.5, display:'flex', flexDirection:'column', gap:1.5 }}>
            <Box display="flex" gap={1}>
              <Box sx={{ height:28, borderRadius:'8px', bgcolor:form.primaryColor, px:2, display:'flex', alignItems:'center' }}>
                <Typography sx={{ fontSize:11, color:'#fff', fontWeight:700, fontFamily:form.fontFamily }}>Primary Button</Typography>
              </Box>
              <Box sx={{ height:28, borderRadius:'8px', bgcolor:form.secondaryColor, px:2, display:'flex', alignItems:'center' }}>
                <Typography sx={{ fontSize:11, color:'#fff', fontWeight:700, fontFamily:form.fontFamily }}>Secondary</Typography>
              </Box>
              <Box sx={{ height:28, borderRadius:'8px', bgcolor:form.accentColor, px:2, display:'flex', alignItems:'center' }}>
                <Typography sx={{ fontSize:11, color:'#fff', fontWeight:700, fontFamily:form.fontFamily }}>Accent</Typography>
              </Box>
            </Box>
            <Typography sx={{ fontFamily:form.fontFamily, fontSize:15, fontWeight:700, color:'#0F172A' }}>
              Sample heading in {form.fontFamily}
            </Typography>
          </Box>
        </Box>
      </Section>

      {/* Brand colours */}
      <Section title="Brand Colours">
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <ColorSwatch label="Primary Colour" value={form.primaryColor} onChange={v=>set('primaryColor',v)} help="Buttons, active states, highlights"/>
          </Grid>
          <Grid item xs={12} sm={4}>
            <ColorSwatch label="Secondary Colour" value={form.secondaryColor} onChange={v=>set('secondaryColor',v)} help="Secondary actions and backgrounds"/>
          </Grid>
          <Grid item xs={12} sm={4}>
            <ColorSwatch label="Accent Colour" value={form.accentColor} onChange={v=>set('accentColor',v)} help="Badges, chips and decorative elements"/>
          </Grid>
        </Grid>
      </Section>

      {/* Appearance */}
      <Section title="Sidebar Style">
        <Box display="flex" gap={2} flexWrap="wrap">
          {SIDEBAR_STYLES.map(s=>(
            <Box key={s.value} onClick={()=>set('sidebarStyle',s.value as any)} sx={{
              flex:'1 1 160px', p:2, borderRadius:'12px', border:`2px solid ${form.sidebarStyle===s.value?form.primaryColor:'#E2E8F0'}`,
              bgcolor:form.sidebarStyle===s.value?form.primaryColor+'10':'#fff', cursor:'pointer', transition:'all .15s',
            }}>
              <Box sx={{ width:32, height:32, borderRadius:'8px', mb:1,
                bgcolor:s.value==='DARK'?'#0B1120':s.value==='LIGHT'?'#F8FAFC':form.primaryColor,
                border:'1px solid rgba(0,0,0,0.08)' }}/>
              <Typography sx={{ fontWeight:700, fontSize:13.5, color:'#0F172A' }}>{s.label}</Typography>
              <Typography sx={{ fontSize:12, color:'#64748B' }}>{s.desc}</Typography>
            </Box>
          ))}
        </Box>
      </Section>

      {/* Typography */}
      <Section title="Typography">
        <Grid container spacing={2.5} alignItems="center">
          <Grid item xs={12} sm={5}>
            <SLabel>Interface Font</SLabel>
            <FormControl fullWidth size="small">
              <Select value={form.fontFamily} onChange={e=>set('fontFamily',e.target.value)} sx={{borderRadius:'10px'}}>
                {FONTS.map(f=><MenuItem key={f} value={f} sx={{fontFamily:f,fontSize:14}}>{f}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <SLabel>Mode</SLabel>
            <FormControlLabel
              control={<Switch checked={form.darkMode} onChange={e=>set('darkMode',e.target.checked)} sx={{'& .Mui-checked + .MuiSwitch-track':{bgcolor:'#2563EB !important'}}}/>}
              label={<Box><Typography sx={{fontSize:13.5,fontWeight:600,color:'#0F172A'}}>Dark Mode</Typography><Typography sx={{fontSize:12,color:'#64748B'}}>Enable dark theme platform-wide</Typography></Box>}
            />
          </Grid>
        </Grid>
      </Section>

      {/* Email signature */}
      <Section title="Email Signature">
        <TextField fullWidth multiline rows={4} size="small" value={form.emailSignature??''} onChange={e=>set('emailSignature',e.target.value)}
          placeholder={"Regards,\n{{sender_name}}\n{{company_name}} | {{support_phone}}"}
          helperText="Variables: {{sender_name}} {{company_name}} {{support_email}} {{support_phone}}"
          sx={F} FormHelperTextProps={{sx:{fontSize:12,color:'#94A3B8',mx:0}}}/>
      </Section>

      {/* Custom CSS */}
      <Section title="Custom CSS (Advanced)" last>
        <Alert severity="warning" sx={{ borderRadius:'10px', mb:2, fontSize:13 }}>Changes apply globally. Test in staging first.</Alert>
        <TextField fullWidth multiline rows={7} size="small" value={form.customCss??''} onChange={e=>set('customCss',e.target.value)}
          placeholder={'/* Override any platform styles */\n.sidebar { background: #1a1a2e; }\n.primary-btn { border-radius: 4px; }'}
          sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px', fontFamily:'monospace', fontSize:12.5 } }}/>
      </Section>

      <SaveBar dirty={dirty} saving={saving} saved={saved} onSave={handleSave} onDiscard={()=>{setForm(orig);setSaved(false);}}/>
    </PageShell>
  );
}
