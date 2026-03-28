// src/modules/finance/layout/FinanceLayout.tsx
import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, Avatar, Divider, Tooltip, IconButton, Menu, MenuItem,
} from '@mui/material';
import {
  Dashboard, Receipt, EventNote, Description, ConfirmationNumber,
  Handshake, ShoppingCart, Payments, AccountBalance,
  CompareArrows, Assessment, MenuOpen, Menu as MenuIcon, Logout, Person, Settings,
} from '@mui/icons-material';
import { F, useAppSelector } from '../hooks';

const W=252, WC=62;
const NAV = [
  { label:'Dashboard',        icon:Dashboard,         path:'/finance/dashboard'     },
  { label:'Collections',      icon:Receipt,           path:'/finance/collections'   },
  { label:'Installments',     icon:EventNote,         path:'/finance/installments'  },
  { label:'Invoices',         icon:Description,       path:'/finance/invoices'      },
  { label:'Receipts',         icon:ConfirmationNumber,path:'/finance/receipts'      },
  { label:'Commissions',      icon:Handshake,         path:'/finance/commissions'   },
  { label:'Expenses',         icon:ShoppingCart,      path:'/finance/expenses'      },
  { label:'Vendor Payments',  icon:Payments,          path:'/finance/vendor-payments'},
  { label:'Bank Accounts',    icon:AccountBalance,    path:'/finance/bank-accounts' },
  { label:'Reconciliation',   icon:CompareArrows,     path:'/finance/reconciliation'},
  { label:'Reports',          icon:Assessment,        path:'/finance/reports'       },
];

export default function FinanceLayout({ children }: { children?: React.ReactNode }) {
  const [col, setC] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const nav = useNavigate();
  const loc = useLocation();
  const profile = useAppSelector(s => s.finance.profile);
  const dw  = col ? WC : W;
  const on  = (p: string) => loc.pathname.startsWith(p);

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleMenuClose();
    localStorage.removeItem('token');
    nav('/login');
  };

  return (
    <Box sx={{ display:'flex', minHeight:'100vh', bgcolor:F.bg }}>
      <Drawer variant="permanent" sx={{ width:dw, flexShrink:0,
        '& .MuiDrawer-paper':{ width:dw, bgcolor:F.surface, borderRight:`1px solid ${F.border}`,
          overflow:'hidden', transition:'width .2s ease', display:'flex', flexDirection:'column' } }}>

        <Box sx={{ display:'flex', alignItems:'center', gap:1.25, px:col?1.25:2.5, height:60, borderBottom:`1px solid ${F.border}`, flexShrink:0 }}>
          <Box sx={{ width:30, height:30, flexShrink:0, borderRadius:'8px',
            background:`linear-gradient(135deg,#4F7FFF 0%,#2563EB 100%)`,
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Typography sx={{ color:'#fff', fontWeight:800, fontSize:13 }}>₹</Typography>
          </Box>
          {!col && <Box flex={1} minWidth={0}>
            <Typography sx={{ color:F.text, fontWeight:700, fontSize:14, letterSpacing:-0.3, lineHeight:1.1 }}>Finance</Typography>
            <Typography sx={{ color:F.primary, fontSize:9.5, fontWeight:600, letterSpacing:1.5, textTransform:'uppercase' }}>Accounting</Typography>
          </Box>}
          <IconButton size="small" onClick={()=>setC(c=>!c)} sx={{ color:F.muted, '&:hover':{color:F.text}, ml:col?'auto':0 }}>
            {col ? <MenuIcon sx={{fontSize:16}}/> : <MenuOpen sx={{fontSize:16}}/>}
          </IconButton>
        </Box>

        <Box sx={{ flex:1, overflowY:'auto', py:1.5, px:col?0.75:1.25 }}>
          <List disablePadding>
            {NAV.map(({label,icon:Icon,path})=>{
              const active=on(path);
              return (
                <Tooltip key={path} title={col?label:''} placement="right" arrow>
                  <ListItemButton onClick={()=>nav(path)} sx={{
                    borderRadius:'8px', mb:0.35, px:col?1.25:1.5, py:0.85,
                    justifyContent:col?'center':'flex-start',
                    bgcolor:active?`${F.primary}15`:'transparent',
                    '&:hover':{bgcolor:active?`${F.primary}20`:'rgba(79,127,255,0.05)'},
                  }}>
                    <ListItemIcon sx={{ minWidth:col?0:30, color:active?F.primary:F.muted, '& svg':{fontSize:17} }}>
                      <Icon/>
                    </ListItemIcon>
                    {!col && <ListItemText primary={label} primaryTypographyProps={{ fontSize:12.5, fontWeight:active?600:400, color:active?F.text:F.textSub }}/>}
                    {!col && active && <Box sx={{ width:4, height:4, borderRadius:'50%', bgcolor:F.primary, flexShrink:0 }}/>}
                  </ListItemButton>
                </Tooltip>
              );
            })}
          </List>
        </Box>

        <Divider sx={{ borderColor:F.border }}/>
        <Box sx={{ display:'flex', alignItems:'center', gap:1.25, px:col?1:2, py:1.5, flexShrink:0 }}>
          <Avatar 
            src={profile?.avatarUrl}
            onClick={handleMenuOpen}
            sx={{ width:28, height:28, bgcolor:F.primary, fontSize:11, fontWeight:700, flexShrink:0, cursor:'pointer' }}
          >
            {(profile?.name ?? 'FN').charAt(0)}
          </Avatar>
          {!col && <Box flex={1} minWidth={0}>
            <Typography sx={{ color:F.text, fontSize:12, fontWeight:600 }} noWrap>{profile?.name ?? 'Finance Team'}</Typography>
            <Typography sx={{ color:F.textSub, fontSize:10.5 }} noWrap>{profile?.email ?? 'finance@realesso.io'}</Typography>
          </Box>}
          {!col && <IconButton size="small" onClick={handleLogout} sx={{ color:F.muted, '&:hover':{color:F.red}, flexShrink:0 }}><Logout sx={{fontSize:14}}/></IconButton>}
        </Box>
      </Drawer>

      <Box component="main" sx={{ flex:1, minWidth:0, display:'flex', flexDirection:'column' }}>
        <Box sx={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:1.5, px:3, height:60, flexShrink:0, borderBottom:`1px solid ${F.border}`, bgcolor:F.surface }}>
          <Avatar 
            src={profile?.avatarUrl}
            onClick={handleMenuOpen}
            sx={{ width:28, height:28, bgcolor:F.primary, fontSize:10, fontWeight:700, cursor:'pointer' }}
          >
            {(profile?.name ?? 'FN').charAt(0)}
          </Avatar>
        </Box>
        <Box sx={{ flex:1, overflowY:'auto', p:{xs:2,md:3} }}>
          {children || <Outlet />}
        </Box>
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            bgcolor: F.surface,
            border: `1px solid ${F.border}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            mt: 1,
            minWidth: 160,
            '& .MuiMenuItem-root': {
              fontSize: 13,
              color: F.textSub,
              gap: 1.5,
              py: 1,
              '&:hover': { bgcolor: `${F.primary}10`, color: F.text },
              '& .MuiSvgIcon-root': { fontSize: 18, color: F.muted }
            }
          }
        }}
      >
        <MenuItem onClick={() => { handleMenuClose(); nav('/finance/profile'); }}>
          <Person /> My Profile
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); nav('/finance/settings'); }}>
          <Settings /> Settings
        </MenuItem>
        <Divider sx={{ borderColor: F.border }} />
        <MenuItem onClick={handleLogout} sx={{ color: `${F.red} !important` }}>
          <Logout sx={{ color: `${F.red} !important` }} /> Logout
        </MenuItem>
      </Menu>
    </Box>
  );
}
