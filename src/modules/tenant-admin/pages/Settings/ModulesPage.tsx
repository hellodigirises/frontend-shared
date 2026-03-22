// src/modules/settings/pages/ModulesPage.tsx
import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Chip, Switch, CircularProgress, Alert } from '@mui/material';
import { ExtensionOutlined } from '@mui/icons-material';
import { PageShell, SLabel, Section } from './SettingsLayout';
import { MODULE_FLAGS, ModuleFlag } from './settingsTypes';
import api from '../../../../api/axios';

interface Props { isSuperAdmin?: boolean }

const CATEGORIES = [
  { label:'Core CRM',          keys:['PROJECT_MANAGEMENT','LEAD_CRM','SITE_VISITS','BOOKING_SYSTEM'] },
  { label:'Financial',         keys:['PAYMENT_MANAGEMENT','CHANNEL_PARTNER'] },
  { label:'Operations & HR',   keys:['HR_MODULE','DOCUMENT_MANAGEMENT','NOTIFICATION_CENTER'] },
  { label:'Intelligence',      keys:['ANALYTICS_ENGINE','AI_INSIGHTS','MARKETING_AUTOMATION'] },
];

export default function ModulesPage({ isSuperAdmin=false }: Props) {
  const [flags,    setFlags]    = useState<ModuleFlag[]>(MODULE_FLAGS);
  const [toggling, setToggling] = useState<string|null>(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(()=>{
    api.get('/settings/modules').then(r=>{
      const d = r.data?.data ?? r.data;
      if (d?.length) {
        setFlags(prev=>prev.map(f=>{
          const server = d.find((s:any)=>s.key===f.key);
          return server ? { ...f, isEnabled:server.isEnabled } : f;
        }));
      }
    }).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  const handleToggle = async (flag:ModuleFlag) => {
    if (!isSuperAdmin && flag.superAdminOnly) return;
    setToggling(flag.key);
    try {
      await api.put(`/settings/modules/${flag.key}`,{ enabled:!flag.isEnabled });
      setFlags(prev=>prev.map(f=>f.key===flag.key?{...f,isEnabled:!f.isEnabled}:f));
    } catch(e){ console.error(e); } finally{ setToggling(null); }
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}><CircularProgress size={26}/></Box>;

  const enabled = flags.filter(f=>f.isEnabled).length;

  return (
    <PageShell title="Modules" subtitle="Control which features are active in your workspace" icon={<ExtensionOutlined/>}>
      {!isSuperAdmin && (
        <Alert severity="info" sx={{ mb:3, borderRadius:'12px', fontSize:13 }}>
          Module activation is controlled by your SuperAdmin. Contact support to enable additional modules.
        </Alert>
      )}

      <Box sx={{ p:2.5, borderRadius:'14px', background:'linear-gradient(135deg,#EFF6FF,#DBEAFE)', border:'1px solid #BFDBFE', mb:3, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <Box>
          <Typography sx={{ fontWeight:700, fontSize:15, color:'#1E40AF' }}>{enabled} of {flags.length} modules active</Typography>
          <Typography sx={{ fontSize:13, color:'#3B82F6' }}>Active modules are available to all users with the required role</Typography>
        </Box>
        <Box sx={{ width:52, height:52, borderRadius:'50%', background:'#2563EB', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Typography sx={{ fontWeight:800, fontSize:18, color:'#fff' }}>{enabled}</Typography>
        </Box>
      </Box>

      {CATEGORIES.map(cat=>{
        const catFlags = flags.filter(f=>cat.keys.includes(f.key));
        return (
          <Box key={cat.label} mb={3}>
            <SLabel>{cat.label}</SLabel>
            <Grid container spacing={2}>
              {catFlags.map(flag=>{
                const locked = !isSuperAdmin && (flag.superAdminOnly??false);
                return (
                  <Grid item xs={12} sm={6} key={flag.key}>
                    <Box sx={{
                      p:2.5, borderRadius:'14px', border:`1.5px solid ${flag.isEnabled?'#BBF7D0':'#E2E8F0'}`,
                      bgcolor:flag.isEnabled?'#F0FDF4':'#fff', opacity:locked?0.6:1,
                      transition:'all .2s',
                    }}>
                      <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                        <Box display="flex" gap={1.75} alignItems="flex-start" flex={1} mr={1}>
                          <Box sx={{ width:44, height:44, borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, bgcolor:flag.isEnabled?'#DCFCE7':'#F1F5F9', flexShrink:0 }}>
                            {flag.icon}
                          </Box>
                          <Box>
                            <Box display="flex" alignItems="center" gap={0.75} mb={0.4}>
                              <Typography sx={{ fontWeight:700, fontSize:14, color:'#0F172A' }}>{flag.label}</Typography>
                              {flag.isPro && <Chip label="PRO" size="small" sx={{ fontSize:8.5, height:17, bgcolor:'#FEF3C7', color:'#92400E', fontWeight:800 }}/>}
                              {locked && <Chip label="SuperAdmin" size="small" sx={{ fontSize:8.5, height:17, bgcolor:'#EDE9FE', color:'#6D28D9', fontWeight:700 }}/>}
                            </Box>
                            <Typography sx={{ fontSize:12.5, color:'#64748B', lineHeight:1.5 }}>{flag.description}</Typography>
                            {flag.dependsOn?.length && (
                              <Typography sx={{ fontSize:11, color:'#94A3B8', mt:0.5 }}>Requires: {flag.dependsOn.join(', ')}</Typography>
                            )}
                          </Box>
                        </Box>
                        <Box flexShrink={0}>
                          {toggling===flag.key ? <CircularProgress size={22}/>
                            : <Switch checked={flag.isEnabled} onChange={()=>handleToggle(flag)} disabled={locked} color="success"
                                sx={{'& .Mui-checked + .MuiSwitch-track':{bgcolor:'#10B981 !important'}}}/>
                          }
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        );
      })}
    </PageShell>
  );
}
