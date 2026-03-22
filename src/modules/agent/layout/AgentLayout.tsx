// src/modules/agent/layout/AgentLayout.tsx
import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, Avatar, Divider, Tooltip, IconButton, Badge,
  BottomNavigation, BottomNavigationAction, useMediaQuery, useTheme,
} from '@mui/material';
import {
  Dashboard, ContactPhone, EventNote, Map, Receipt,
  Assignment, AccessTime, BarChart, LocationOn, Person,
  MenuOpen, Menu as MenuIcon, NotificationsNone, Logout, LayersOutlined,
} from '@mui/icons-material';
import { A } from '../hooks';
import { useAppSelector } from '../hooks';

const W = 240, WC = 58;

const NAV = [
  { label:'Dashboard',  icon:Dashboard,    path:'/agent/dashboard'   },
  { label:'My Leads',   icon:ContactPhone, path:'/agent/leads'       },
  { label:'Follow Ups', icon:EventNote,    path:'/agent/followups'   },
  { label:'Site Visits',icon:Map,          path:'/agent/visits'      },
  { label:'Bookings',   icon:Receipt,      path:'/agent/bookings'    },
  { label:'Inventory',  icon:LayersOutlined,path:'/agent/inventory'   },
  { label:'Tasks',      icon:Assignment,   path:'/agent/tasks'       },
  { label:'Attendance', icon:AccessTime,   path:'/agent/attendance'  },
  { label:'Performance',icon:BarChart,     path:'/agent/performance' },
  { label:'Heatmap',    icon:LocationOn,   path:'/agent/heatmap'     },
  { label:'Profile',    icon:Person,       path:'/agent/profile'     },
];

// Bottom nav items (mobile)
const BOTTOM_NAV = [
  { label:'Home',    icon:Dashboard,    path:'/agent/dashboard'  },
  { label:'Leads',   icon:ContactPhone, path:'/agent/leads'      },
  { label:'Visits',  icon:Map,          path:'/agent/visits'     },
  { label:'Tasks',   icon:Assignment,   path:'/agent/tasks'      },
  { label:'Profile', icon:Person,       path:'/agent/profile'    },
];

export default function AgentLayout({ children }: { children?: React.ReactNode }) {
  const [collapsed, setC] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();
  const notifications = useAppSelector(s => s.agent.notifications);
  const profile       = useAppSelector(s => s.agent.profile);
  const theme         = useTheme();
  const isMobile      = useMediaQuery(theme.breakpoints.down('md'));

  const dw  = collapsed ? WC : W;
  const on  = (path: string) => loc.pathname.startsWith(path);

  // Mobile: bottom nav
  if (isMobile) {
    const currentIdx = BOTTOM_NAV.findIndex(n => on(n.path));
    return (
      <Box sx={{ display:'flex', flexDirection:'column', minHeight:'100vh', bgcolor:A.bg }}>
        {/* Mobile topbar */}
        <Box sx={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          px:2, py:1.5, bgcolor:A.surface, borderBottom:`1px solid ${A.border}`,
          position:'sticky', top:0, zIndex:100,
        }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{ width:28, height:28, borderRadius:'7px', background:`linear-gradient(135deg,${A.primary} 0%,#EA580C 100%)`, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Typography sx={{ color:'#fff', fontWeight:800, fontSize:13 }}>R</Typography>
            </Box>
            <Typography sx={{ color:A.text, fontWeight:700, fontSize:14 }}>Realesso Agent</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.75}>
            <Badge badgeContent={notifications.filter((n:any)=>n.status==='UNREAD').length} color="error">
              <IconButton size="small" onClick={()=>nav('/agent/dashboard')} sx={{ color:A.muted }}>
                <NotificationsNone sx={{ fontSize:20 }}/>
              </IconButton>
            </Badge>
            <Avatar sx={{ width:28, height:28, bgcolor:A.primary, fontSize:11, fontWeight:700 }}>
              {(profile?.name??'A').charAt(0)}
            </Avatar>
          </Box>
        </Box>

        {/* Page content */}
        <Box sx={{ flex:1, overflowY:'auto', pb:8 }}>
          {children || <Outlet />}
        </Box>

        {/* Bottom navigation */}
        <Box sx={{ position:'fixed', bottom:0, left:0, right:0, zIndex:200, bgcolor:A.surface, borderTop:`1px solid ${A.border}` }}>
          <BottomNavigation value={currentIdx} onChange={(_,v)=>nav(BOTTOM_NAV[v].path)}
            sx={{ bgcolor:'transparent', height:60 }}>
            {BOTTOM_NAV.map(({label,icon:Icon},i)=>(
              <BottomNavigationAction key={label} label={label} icon={<Icon sx={{ fontSize:22 }}/>}
                sx={{
                  color: currentIdx===i ? A.primary : A.muted,
                  '& .MuiBottomNavigationAction-label':{ fontSize:10.5, mt:0.25, color: currentIdx===i ? A.primary : A.muted },
                  '&.Mui-selected':{ color:A.primary },
                  minWidth:60,
                }}/>
            ))}
          </BottomNavigation>
        </Box>
      </Box>
    );
  }

  // Desktop: sidebar
  return (
    <Box sx={{ display:'flex', minHeight:'100vh', bgcolor:A.bg }}>
      <Drawer variant="permanent" sx={{ width:dw, flexShrink:0,
        '& .MuiDrawer-paper':{ width:dw, bgcolor:A.surface, borderRight:`1px solid ${A.border}`,
          overflow:'hidden', transition:'width .2s ease', display:'flex', flexDirection:'column' } }}>

        <Box sx={{ display:'flex', alignItems:'center', gap:1.25, px:collapsed?1.25:2.5, height:60, borderBottom:`1px solid ${A.border}`, flexShrink:0 }}>
          <Box sx={{ width:30, height:30, flexShrink:0, borderRadius:'8px',
            background:`linear-gradient(135deg,${A.primary} 0%,#EA580C 100%)`,
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Typography sx={{ color:'#fff', fontWeight:800, fontSize:13 }}>R</Typography>
          </Box>
          {!collapsed && <Box flex={1} minWidth={0}>
            <Typography sx={{ color:A.text, fontWeight:700, fontSize:13.5, letterSpacing:-0.3, lineHeight:1.1 }}>Agent Portal</Typography>
            <Typography sx={{ color:A.primary, fontSize:9, fontWeight:600, letterSpacing:1.5, textTransform:'uppercase' }}>Realesso</Typography>
          </Box>}
          <IconButton size="small" onClick={()=>setC(c=>!c)} sx={{ color:A.muted, '&:hover':{color:A.text}, ml:collapsed?'auto':0 }}>
            {collapsed ? <MenuIcon sx={{fontSize:16}}/> : <MenuOpen sx={{fontSize:16}}/>}
          </IconButton>
        </Box>

        <Box sx={{ flex:1, overflowY:'auto', py:1.5, px:collapsed?0.75:1.25 }}>
          <List disablePadding>
            {NAV.map(({label,icon:Icon,path})=>{
              const active = on(path);
              return (
                <Tooltip key={path} title={collapsed?label:''} placement="right" arrow>
                  <ListItemButton onClick={()=>nav(path)} sx={{
                    borderRadius:'8px', mb:0.35, px:collapsed?1.25:1.5, py:0.85,
                    justifyContent:collapsed?'center':'flex-start',
                    bgcolor:active?`${A.primary}18`:'transparent',
                    '&:hover':{bgcolor:active?`${A.primary}22`:'rgba(255,245,236,0.04)'},
                  }}>
                    <ListItemIcon sx={{ minWidth:collapsed?0:30, color:active?A.primary:A.muted, '& svg':{fontSize:18} }}>
                      <Icon/>
                    </ListItemIcon>
                    {!collapsed && <ListItemText primary={label} primaryTypographyProps={{ fontSize:13, fontWeight:active?600:400, color:active?A.text:A.textSub }}/>}
                    {!collapsed && active && <Box sx={{ width:4, height:4, borderRadius:'50%', bgcolor:A.primary, flexShrink:0 }}/>}
                  </ListItemButton>
                </Tooltip>
              );
            })}
          </List>
        </Box>

        <Divider sx={{ borderColor:A.border }}/>
        <Box sx={{ display:'flex', alignItems:'center', gap:1.25, px:collapsed?1:2, py:1.5, flexShrink:0 }}>
          <Avatar sx={{ width:28, height:28, bgcolor:A.primary, fontSize:11, fontWeight:700, flexShrink:0 }}>
            {(profile?.name??'A').charAt(0)}
          </Avatar>
          {!collapsed && <Box flex={1} minWidth={0}>
            <Typography sx={{ color:A.text, fontSize:12, fontWeight:600 }} noWrap>{profile?.name??'Agent'}</Typography>
            <Typography sx={{ color:A.textSub, fontSize:10.5 }} noWrap>Field Sales Agent</Typography>
          </Box>}
          {!collapsed && <IconButton size="small" sx={{ color:A.muted, '&:hover':{color:A.red}, flexShrink:0 }}><Logout sx={{fontSize:14}}/></IconButton>}
        </Box>
      </Drawer>

      <Box component="main" sx={{ flex:1, minWidth:0, display:'flex', flexDirection:'column' }}>
        <Box sx={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:1.5, px:3, height:60, flexShrink:0, borderBottom:`1px solid ${A.border}`, bgcolor:A.surface }}>
          <Badge badgeContent={notifications.filter((n:any)=>n.status==='UNREAD').length} color="error">
            <IconButton size="small" sx={{ color:A.muted }}><NotificationsNone sx={{fontSize:18}}/></IconButton>
          </Badge>
          <Avatar sx={{ width:28, height:28, bgcolor:A.primary, fontSize:10, fontWeight:700 }}>
            {(profile?.name??'A').charAt(0)}
          </Avatar>
        </Box>
        <Box sx={{ flex:1, overflowY:'auto', p:{xs:2,md:3} }}>
          {children || <Outlet />}
        </Box>
      </Box>
    </Box>
  );
}
