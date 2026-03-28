// src/modules/sales-manager/layout/SalesManagerLayout.tsx
import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, Avatar, Divider, Tooltip, IconButton, Badge, Menu, MenuItem,
} from '@mui/material';
import {
  Dashboard, PersonAdd, ViewKanban, Handshake, Map,
  TrackChanges, Timeline, Public, Groups, EmojiEvents,
  Assessment, MenuOpen, Menu as MenuIcon, Logout,
  NotificationsNone, Bolt, Person, Settings,
} from '@mui/icons-material';
import { S } from '../hooks';
import { useAppSelector } from '../hooks';

const W = 252, WC = 62;

const NAV = [
  { label:'Dashboard',        icon:Dashboard,    path:'/manager/dashboard'    },
  { label:'Lead Distribution',icon:PersonAdd,    path:'/manager/leads'        },
  { label:'Pipeline',         icon:ViewKanban,   path:'/manager/pipeline'     },
  { label:'Deals',            icon:Handshake,    path:'/manager/deals'        },
  { label:'Site Visits',      icon:Map,          path:'/manager/site-visits'  },
  { label:'Sales Targets',    icon:TrackChanges, path:'/manager/targets'      },
  { label:'Forecast',         icon:Timeline,     path:'/manager/forecast'     },
  { label:'Territories',      icon:Bolt,         path:'/manager/territories'  },
  { label:'Team',             icon:Groups,       path:'/manager/team'         },
  { label:'Leaderboard',      icon:EmojiEvents,  path:'/manager/leaderboard'  },
  { label:'Reports',          icon:Assessment,   path:'/manager/reports'      },
];

export default function SalesManagerLayout({ children }: { children?: React.ReactNode }) {
  const [collapsed, setC] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const nav = useNavigate();
  const loc = useLocation();
  const managerState = useAppSelector(s => s.sales);
  const profile = managerState?.profile;
  const alerts = managerState?.alerts || [];
  
  const dw = collapsed ? WC : W;
  const on = (path: string) => loc.pathname.startsWith(path);

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleMenuClose();
    localStorage.removeItem('token');
    nav('/login');
  };

  return (
    <Box sx={{ display:'flex', minHeight:'100vh', bgcolor:S.bg }}>
      <Drawer variant="permanent" sx={{ width:dw, flexShrink:0,
        '& .MuiDrawer-paper':{ width:dw, bgcolor:S.surface, borderRight:`1px solid ${S.border}`,
          overflow:'hidden', transition:'width .2s ease', display:'flex', flexDirection:'column' } }}>

        {/* Brand */}
        <Box sx={{ display:'flex', alignItems:'center', gap:1.5, px:collapsed?1.5:2.5, height:60,
          borderBottom:`1px solid ${S.border}`, flexShrink:0 }}>
          <Box sx={{ width:32, height:32, borderRadius:'8px', flexShrink:0,
            background:'linear-gradient(135deg,#10B981 0%,#059669 100%)',
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Typography sx={{ color:'#fff', fontWeight:800, fontSize:14 }}>S</Typography>
          </Box>
          {!collapsed && <Box flex={1} minWidth={0}>
            <Typography sx={{ color:S.text, fontWeight:700, fontSize:14, letterSpacing:-0.3, lineHeight:1.1 }}>Sales</Typography>
            <Typography sx={{ color:S.primary, fontSize:9.5, fontWeight:600, letterSpacing:1.5, textTransform:'uppercase' }}>Command Center</Typography>
          </Box>}
          <IconButton size="small" onClick={()=>setC(c=>!c)}
            sx={{ color:S.muted, '&:hover':{color:S.text}, ml:collapsed?'auto':0 }}>
            {collapsed ? <MenuIcon sx={{fontSize:17}}/> : <MenuOpen sx={{fontSize:17}}/>}
          </IconButton>
        </Box>

        {/* Nav */}
        <Box sx={{ flex:1, overflowY:'auto', py:1.5, px:collapsed?0.75:1.25,
          '&::-webkit-scrollbar':{width:3}, '&::-webkit-scrollbar-thumb':{bgcolor:'rgba(255,255,255,0.07)',borderRadius:2} }}>
          <List disablePadding>
            {NAV.map(({label,icon:Icon,path})=>{
              const active = on(path);
              return (
                <Tooltip key={path} title={collapsed?label:''} placement="right" arrow>
                  <ListItemButton onClick={()=>nav(path)} sx={{
                    borderRadius:'8px', mb:0.4, px:collapsed?1.25:1.5, py:0.9,
                    justifyContent:collapsed?'center':'flex-start',
                    bgcolor:active?'rgba(16,185,129,0.12)':'transparent',
                    '&:hover':{bgcolor:active?'rgba(16,185,129,0.18)':'rgba(255,255,255,0.04)'},
                  }}>
                    <ListItemIcon sx={{ minWidth:collapsed?0:32, color:active?S.primary:S.muted, '& svg':{fontSize:18} }}>
                      <Icon/>
                    </ListItemIcon>
                    {!collapsed && <ListItemText primary={label} primaryTypographyProps={{ fontSize:13, fontWeight:active?600:400, color:active?S.text:S.textSub }} />}
                    {!collapsed && active && <Box sx={{ width:5, height:5, borderRadius:'50%', bgcolor:S.primary, flexShrink:0 }}/>}
                  </ListItemButton>
                </Tooltip>
              );
            })}
          </List>
        </Box>

        <Divider sx={{ borderColor:S.border }}/>
        <Box sx={{ display:'flex', alignItems:'center', gap:1.25, px:collapsed?1:2, py:1.5, flexShrink:0 }}>
          <Avatar 
            src={profile?.avatarUrl}
            onClick={handleMenuOpen}
            sx={{ width:30, height:30, bgcolor:S.primary, fontSize:11, fontWeight:700, flexShrink:0, cursor:'pointer' }}
          >
            {(profile?.name ?? 'SM').charAt(0)}
          </Avatar>
          {!collapsed && <Box flex={1} minWidth={0}>
            <Typography sx={{ color:S.text, fontSize:12, fontWeight:600 }} noWrap>{profile?.name ?? 'Sales Manager'}</Typography>
            <Typography sx={{ color:S.textSub, fontSize:10.5 }} noWrap>{profile?.email ?? 'manager@company.io'}</Typography>
          </Box>}
          {!collapsed && <IconButton size="small" onClick={handleLogout} sx={{ color:S.muted, '&:hover':{color:S.coral}, flexShrink:0 }}><Logout sx={{fontSize:14}}/></IconButton>}
        </Box>
      </Drawer>

      {/* Main */}
      <Box component="main" sx={{ flex:1, minWidth:0, display:'flex', flexDirection:'column' }}>
        <Box sx={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:1.5,
          px:3, height:60, flexShrink:0, borderBottom:`1px solid ${S.border}`, bgcolor:S.surface }}>
          <Badge badgeContent={alerts.length} color="error" max={99}>
            <IconButton size="small" sx={{ color:S.muted }}><NotificationsNone sx={{fontSize:18}}/></IconButton>
          </Badge>
          <Avatar 
            src={profile?.avatarUrl}
            onClick={handleMenuOpen}
            sx={{ width:28, height:28, bgcolor:S.primary, fontSize:10, fontWeight:700, cursor:'pointer' }}
          >
            {(profile?.name ?? 'SM').charAt(0)}
          </Avatar>
        </Box>
        <Box sx={{ flex:1, overflowY:'auto', p:{xs:2,md:3},
          '&::-webkit-scrollbar':{width:6}, '&::-webkit-scrollbar-thumb':{bgcolor:'rgba(255,255,255,0.07)',borderRadius:3} }}>
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
            bgcolor: S.surface,
            border: `1px solid ${S.border}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            mt: 1,
            minWidth: 160,
            '& .MuiMenuItem-root': {
              fontSize: 13,
              color: S.textSub,
              gap: 1.5,
              py: 1,
              '&:hover': { bgcolor: `${S.primary}10`, color: S.text },
              '& .MuiSvgIcon-root': { fontSize: 18, color: S.muted }
            }
          }
        }}
      >
        <MenuItem onClick={() => { handleMenuClose(); nav('/manager/profile'); }}>
          <Person /> My Profile
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); nav('/manager/settings'); }}>
          <Settings /> Settings
        </MenuItem>
        <Divider sx={{ borderColor: S.border }} />
        <MenuItem onClick={handleLogout} sx={{ color: `${S.coral} !important` }}>
          <Logout sx={{ color: `${S.coral} !important` }} /> Logout
        </MenuItem>
      </Menu>
    </Box>
  );
}
