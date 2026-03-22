// src/modules/settings/layout/SettingsLayout.tsx
import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Box, Typography, Divider, Tooltip, Chip, IconButton } from '@mui/material';
import {
  BusinessOutlined, PaletteOutlined, DomainOutlined, ExtensionOutlined,
  TuneOutlined, AccountTreeOutlined, SecurityOutlined, HistoryOutlined,
  IntegrationInstructionsOutlined, PaymentOutlined, EmailOutlined,
  ChevronRightOutlined, MenuOpen, Menu as MenuIcon,
  NotificationsActiveOutlined,
} from '@mui/icons-material';

const S = {
  sidebar:'#0B1120', sidebarB:'#111827', active:'#1E2D45',
  border:'rgba(255,255,255,0.06)', green:'#10B981', text:'#F1F5F9',
  textSub:'#64748B', textMut:'#334155', blue:'#3B82F6', bg:'#F8FAFC',
} as const;

const NAV = [
  { group:'Organisation', items:[
    { id:'company',      icon:<BusinessOutlined sx={{fontSize:16}}/>,               label:'Company Profile',  badge:''    },
    { id:'branding',     icon:<PaletteOutlined sx={{fontSize:16}}/>,                label:'Branding',         badge:''    },
    { id:'domain',       icon:<DomainOutlined sx={{fontSize:16}}/>,                 label:'Domain & Email',   badge:'NEW' },
    { id:'email-config', icon:<EmailOutlined sx={{fontSize:16}}/>,                  label:'Email Config',     badge:''    },
  ]},
  { group:'Platform', items:[
    { id:'modules',      icon:<ExtensionOutlined sx={{fontSize:16}}/>,              label:'Modules',          badge:''    },
    { id:'custom-fields',icon:<TuneOutlined sx={{fontSize:16}}/>,                   label:'Custom Fields',    badge:''    },
    { id:'workflows',    icon:<AccountTreeOutlined sx={{fontSize:16}}/>,             label:'Workflows',        badge:''    },
    { id:'notifications',icon:<NotificationsActiveOutlined sx={{fontSize:16}}/>,    label:'Notifications',    badge:''    },
    { id:'employee-id',  icon:<TuneOutlined sx={{fontSize:16}}/>,                   label:'Employee ID',      badge:'NEW' },
  ]},
  { group:'Finance & Security', items:[
    { id:'payment',      icon:<PaymentOutlined sx={{fontSize:16}}/>,                label:'Payment Config',   badge:''    },
    { id:'security',     icon:<SecurityOutlined sx={{fontSize:16}}/>,               label:'Security',         badge:''    },
    { id:'integrations', icon:<IntegrationInstructionsOutlined sx={{fontSize:16}}/>,label:'Integrations',     badge:''    },
    { id:'audit',        icon:<HistoryOutlined sx={{fontSize:16}}/>,                label:'Audit Log',        badge:''    },
  ]},
];

// ── Shared Page Shell ─────────────────────────────────────────────────────────
export const PageShell: React.FC<{
  title:string; subtitle:string; icon:React.ReactNode; action?:React.ReactNode; children:React.ReactNode;
}> = ({ title, subtitle, icon, action, children }) => (
  <Box sx={{ maxWidth:860, mx:'auto' }}>
    <Box sx={{ mb:4, display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:2 }}>
      <Box display="flex" alignItems="center" gap={1.75}>
        <Box sx={{
          width:42, height:42, borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center',
          background:'linear-gradient(135deg,#1E2D45 0%,#0B1120 100%)',
          color:'#10B981', border:'1px solid rgba(255,255,255,0.06)', '& svg':{fontSize:20},
        }}>{icon}</Box>
        <Box>
          <Typography sx={{ fontWeight:800, fontSize:20, color:'#0B1120', letterSpacing:-0.4, lineHeight:1.1 }}>{title}</Typography>
          <Typography sx={{ fontSize:13, color:'#64748B', mt:0.25 }}>{subtitle}</Typography>
        </Box>
      </Box>
      {action}
    </Box>
    {children}
  </Box>
);

export const SaveBar: React.FC<{
  dirty?:boolean; saving?:boolean; saved?:boolean; onSave:()=>void; onDiscard?:()=>void;
}> = ({ dirty=true, saving, saved, onSave, onDiscard }) => (
  <Box sx={{ mt:4, pt:3, borderTop:'1px solid #E2E8F0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
    {saved
      ? <Typography sx={{ fontSize:13, color:'#10B981', fontWeight:600 }}>✓ Changes saved successfully</Typography>
      : <Typography sx={{ fontSize:13, color:'#64748B' }}>{dirty ? 'You have unsaved changes' : 'All changes saved'}</Typography>
    }
    <Box display="flex" gap={1}>
      {onDiscard && dirty && (
        <Box component="button" onClick={onDiscard} disabled={saving}
          sx={{ px:2.5, py:1, borderRadius:'9px', border:'1px solid #E2E8F0', bgcolor:'#fff', color:'#64748B', fontSize:13.5, fontWeight:600, cursor:'pointer', '&:hover':{bgcolor:'#F8FAFC'} }}>
          Discard
        </Box>
      )}
      <Box component="button" onClick={onSave} disabled={saving}
        sx={{ px:3.5, py:1, borderRadius:'9px', border:'none', background:saving?'#93C5FD':'linear-gradient(135deg,#2563EB,#1D4ED8)', color:'#fff', fontSize:13.5, fontWeight:700, cursor:saving?'not-allowed':'pointer', transition:'opacity .15s', '&:hover':{opacity:0.92} }}>
        {saving ? 'Saving…' : 'Save Changes'}
      </Box>
    </Box>
  </Box>
);

export const SLabel: React.FC<{ children:React.ReactNode }> = ({ children }) => (
  <Typography sx={{ fontWeight:800, fontSize:'0.65rem', textTransform:'uppercase', letterSpacing:1.4, color:'#94A3B8', display:'block', mb:1.5 }}>
    {children}
  </Typography>
);

export const Section: React.FC<{ title?:string; children:React.ReactNode; last?:boolean }> = ({ title, children, last }) => (
  <Box sx={{ p:3, borderRadius:'14px', border:'1px solid #E2E8F0', bgcolor:'#fff', mb:last?0:2.5 }}>
    {title && <SLabel>{title}</SLabel>}
    {children}
  </Box>
);

// ── Main Layout ───────────────────────────────────────────────────────────────
const W=252, WC=62;
export default function SettingsLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [col, setCol] = useState(false);
  const dw = col ? WC : W;
  const currentId = location.pathname.split('/').filter(Boolean).pop() ?? 'company';

  return (
    <Box sx={{ display:'flex', minHeight:'100vh', bgcolor:S.bg }}>
      <Box sx={{ width:dw, flexShrink:0, bgcolor:S.sidebar, borderRight:`1px solid ${S.border}`, position:'sticky', top:0, height:'100vh', overflowY:'auto', overflowX:'hidden', display:'flex', flexDirection:'column', transition:'width .2s ease' }}>
        <Box sx={{ display:'flex', alignItems:'center', gap:1.5, px:col?1.25:2.5, height:60, borderBottom:`1px solid ${S.border}`, flexShrink:0 }}>
          {!col && <Box flex={1} minWidth={0}>
            <Typography sx={{ fontWeight:800, fontSize:15, color:S.text, letterSpacing:-0.3, lineHeight:1.1 }}>Settings</Typography>
            <Typography sx={{ fontSize:10, color:S.textSub, fontWeight:600, letterSpacing:0.5, textTransform:'uppercase' }}>Configuration</Typography>
          </Box>}
          <IconButton size="small" onClick={()=>setCol(c=>!c)} sx={{ color:S.textSub, '&:hover':{color:S.text}, ml:col?'auto':0, mr:col?'auto':0 }}>
            {col ? <MenuIcon sx={{fontSize:16}}/> : <MenuOpen sx={{fontSize:16}}/>}
          </IconButton>
        </Box>

        <Box sx={{ flex:1, overflowY:'auto', py:2, px:col?0.75:1.5 }}>
          {NAV.map(group=>(
            <Box key={group.group} mb={2.5}>
              {!col && <Typography sx={{ fontSize:9.5, fontWeight:800, letterSpacing:1.2, color:S.textMut, textTransform:'uppercase', px:1, mb:1 }}>{group.group}</Typography>}
              {group.items.map(item=>{
                const active = currentId===item.id;
                return (
                  <Tooltip key={item.id} title={col?item.label:''} placement="right" arrow>
                    <Box onClick={()=>navigate(item.id)} sx={{
                      display:'flex', alignItems:'center', gap:1.5, px:col?0:1.5, py:1,
                      justifyContent:col?'center':'flex-start', borderRadius:'9px', mb:0.4, cursor:'pointer',
                      bgcolor:active?S.active:'transparent', borderLeft:`3px solid ${active?S.green:'transparent'}`,
                      transition:'all .12s', '&:hover':{bgcolor:active?S.active:'rgba(255,255,255,0.03)'},
                    }}>
                      <Box sx={{ color:active?S.green:S.textSub, display:'flex', flexShrink:0 }}>{item.icon}</Box>
                      {!col && <>
                        <Typography sx={{ fontSize:13, fontWeight:active?700:500, color:active?S.text:'#94A3B8', flex:1, lineHeight:1 }}>{item.label}</Typography>
                        {item.badge && <Chip label={item.badge} size="small" sx={{ fontSize:8.5, height:16, bgcolor:'#1D4ED8', color:'#fff', fontWeight:800, borderRadius:'5px' }}/>}
                        {active && <ChevronRightOutlined sx={{ fontSize:13, color:S.green }}/>}
                      </>}
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>
          ))}
        </Box>

        <Box sx={{ px:col?1:2, py:2, borderTop:`1px solid ${S.border}`, flexShrink:0 }}>
          {!col && <Typography sx={{ fontSize:10, color:S.textMut, textAlign:'center' }}>Realesso CRM · v3.0</Typography>}
        </Box>
      </Box>

      <Box component="main" sx={{ flex:1, minWidth:0, overflowY:'auto' }}>
        <Box sx={{ p:{ xs:2.5, md:4 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
