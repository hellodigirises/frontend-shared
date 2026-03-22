// src/modules/superadmin/components/SuperAdminLayout.tsx
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../../redux/slices/authSlice';
import { AppDispatch } from '../../../redux/store';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, Avatar, Divider, Tooltip, IconButton, Chip, Menu, MenuItem,
} from '@mui/material';
import {
  Dashboard, People, Layers, Extension, SmartToy, Phone,
  AccountBalance, BarChart, Settings, History,
  MenuOpen, Menu as MenuIcon, Logout, NotificationsNone,
} from '@mui/icons-material';
import { C } from '../hooks';

const W  = 252;
const WC = 62;

const NAV = [
  { label: 'Dashboard',         icon: Dashboard,      path: '/superadmin/dashboard'   },
  { label: 'Tenants',           icon: People,          path: '/superadmin/tenants'     },
  { label: 'Plans',             icon: Layers,          path: '/superadmin/plans'       },
  { label: 'Add-ons',           icon: Extension,       path: '/superadmin/addons'      },
  { label: 'AI Agents',         icon: SmartToy,        path: '/superadmin/ai-agents'   },
  { label: 'Telephony',         icon: Phone,           path: '/superadmin/telephony'   },
  { label: 'Billing',           icon: AccountBalance,  path: '/superadmin/billing'     },
  { label: 'Analytics',         icon: BarChart,        path: '/superadmin/analytics'   },
  { label: 'Platform Settings', icon: Settings,        path: '/superadmin/settings'    },
  { label: 'Audit Logs',        icon: History,         path: '/superadmin/audit-logs'  },
];

export default function SuperAdminLayout({ children }: { children?: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const nav = useNavigate();
  const loc = useLocation();
  const dw  = collapsed ? WC : W;

  const isActive = (path: string) => loc.pathname === path || (path !== '/superadmin/dashboard' && loc.pathname.startsWith(path));

  const handleLogout = () => {
    dispatch(logoutUser());
    nav('/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: C.bg }}>

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <Drawer variant="permanent" sx={{
        width: dw, flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: dw, bgcolor: C.surface,
          borderRight: `1px solid ${C.border}`,
          overflow: 'hidden', transition: 'width .2s ease',
          display: 'flex', flexDirection: 'column',
        },
      }}>

        {/* Logo */}
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1.5,
          px: collapsed ? 1.5 : 2.5, height: 60,
          borderBottom: `1px solid ${C.border}`, flexShrink: 0,
        }}>
          <Box sx={{
            width: 32, height: 32, flexShrink: 0, borderRadius: '8px',
            background: 'linear-gradient(135deg,#4F7FFF 0%,#7B5CF5 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 14, letterSpacing: -0.5 }}>R</Typography>
          </Box>
          {!collapsed && (
            <Box flex={1} minWidth={0}>
              <Typography sx={{ color: C.text, fontWeight: 700, fontSize: 14.5, lineHeight: 1.1, letterSpacing: -0.4 }}>
                Realesso
              </Typography>
              <Typography sx={{ color: C.primary, fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
                SuperAdmin
              </Typography>
            </Box>
          )}
          <IconButton size="small" onClick={() => setCollapsed(c => !c)}
            sx={{ color: C.muted, '&:hover': { color: C.text }, ml: collapsed ? 'auto' : 0, flexShrink: 0 }}>
            {collapsed ? <MenuIcon sx={{ fontSize: 18 }} /> : <MenuOpen sx={{ fontSize: 18 }} />}
          </IconButton>
        </Box>

        {/* Nav items */}
        <Box sx={{ flex: 1, overflowY: 'auto', py: 1.5, px: collapsed ? 0.75 : 1.25,
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.08)', borderRadius: 2 },
        }}>
          <List disablePadding>
            {NAV.map(({ label, icon: Icon, path }) => {
              const on = isActive(path);
              return (
                <Tooltip key={path} title={collapsed ? label : ''} placement="right" arrow>
                  <ListItemButton onClick={() => nav(path)} sx={{
                    borderRadius: '8px', mb: 0.4,
                    px: collapsed ? 1.25 : 1.5, py: 0.85,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    bgcolor: on ? 'rgba(79,127,255,0.13)' : 'transparent',
                    '&:hover': { bgcolor: on ? 'rgba(79,127,255,0.18)' : 'rgba(255,255,255,0.04)' },
                  }}>
                    <ListItemIcon sx={{
                      minWidth: collapsed ? 0 : 32,
                      color: on ? C.primary : C.muted,
                      '& svg': { fontSize: 18 },
                    }}>
                      <Icon />
                    </ListItemIcon>
                    {!collapsed && (
                      <ListItemText
                        primary={label}
                        primaryTypographyProps={{
                          fontSize  : 13,
                          fontWeight: on ? 600 : 400,
                          color     : on ? C.text : C.textSub,
                        }}
                      />
                    )}
                    {!collapsed && on && (
                      <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: C.primary, flexShrink: 0 }} />
                    )}
                  </ListItemButton>
                </Tooltip>
              );
            })}
          </List>
        </Box>

        {/* Footer */}
        <Divider sx={{ borderColor: C.border }} />
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1.25,
          px: collapsed ? 1 : 2, py: 1.5, flexShrink: 0,
        }}>
          <Avatar sx={{ width: 30, height: 30, bgcolor: C.primary, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>SA</Avatar>
          {!collapsed && (
            <Box flex={1} minWidth={0}>
              <Typography sx={{ color: C.text, fontSize: 12, fontWeight: 600 }} noWrap>Super Admin</Typography>
              <Typography sx={{ color: C.textSub, fontSize: 10.5 }} noWrap>admin@realesso.io</Typography>
            </Box>
          )}
          {!collapsed && (
            <Tooltip title="Logout">
              <IconButton 
                onClick={handleLogout}
                size="small" 
                sx={{ color: C.muted, '&:hover': { color: C.danger }, flexShrink: 0 }}
              >
                <Logout sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Drawer>

      {/* ── Main area ────────────────────────────────────────────────────── */}
      <Box component="main" sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', bgcolor: C.bg }}>

        {/* Topbar */}
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          gap: 1.5, px: 3, height: 60, flexShrink: 0,
          borderBottom: `1px solid ${C.border}`, bgcolor: C.surface,
        }}>
          <Chip
            label="● Platform Online"
            size="small"
            sx={{ bgcolor: 'rgba(34,197,94,0.1)', color: C.success, fontWeight: 600, fontSize: 10.5, height: 22 }}
          />
          <IconButton size="small" sx={{ color: C.muted }}>
            <NotificationsNone sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ p: 0 }}
          >
            <Avatar sx={{ width: 28, height: 28, bgcolor: C.primary, fontSize: 10, fontWeight: 700 }}>SA</Avatar>
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            PaperProps={{
              sx: { 
                bgcolor: C.surface, 
                border: `1px solid ${C.border}`,
                color: C.text,
                mt: 1.5,
                '& .MuiMenuItem-root': { fontSize: 13, py: 1 }
              }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => { setAnchorEl(null); nav('/superadmin/settings'); }}>
              <ListItemIcon><Settings sx={{ fontSize: 18, color: C.muted }} /></ListItemIcon>
              Profile Settings
            </MenuItem>
            <Divider sx={{ borderColor: C.border }} />
            <MenuItem onClick={handleLogout} sx={{ color: C.danger }}>
              <ListItemIcon><Logout sx={{ fontSize: 18, color: C.danger }} /></ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Box>

        {/* Page content */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 3 },
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.08)', borderRadius: 3 },
        }}>
          {children || <Outlet />}
        </Box>
      </Box>
    </Box>
  );
}