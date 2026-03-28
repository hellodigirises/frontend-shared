// src/modules/hr/layout/HRLayout.tsx
import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, Avatar, Divider, Tooltip, IconButton, Chip, Menu, MenuItem,
} from '@mui/material';
import { 
  Dashboard, People, AccessTime, BeachAccess, AccountBalance, 
  BarChart, Folder, School, Campaign, MenuOpen, Menu as MenuIcon, 
  Logout, NotificationsNone, ChevronRight, Person, Settings,
} from '@mui/icons-material';
import { H, useAppSelector } from '../hooks';
import NotificationBell from '../../../components/NotificationBell';

const W  = 248;
const WC = 60;

const NAV = [
  { label: 'Dashboard',     icon: Dashboard,       path: '/hr/dashboard'   },
  { label: 'Employees',     icon: People,           path: '/hr/employees'   },
  { label: 'Attendance',    icon: AccessTime,       path: '/hr/attendance'  },
  { label: 'Leave Requests',icon: BeachAccess,      path: '/hr/leaves'      },
  { label: 'Payroll',       icon: AccountBalance,   path: '/hr/payroll'     },
  { label: 'Performance',   icon: BarChart,         path: '/hr/performance' },
  { label: 'Documents',     icon: Folder,           path: '/hr/documents'   },
  { label: 'Training',      icon: School,           path: '/hr/training'    },
  { label: 'Announcements', icon: Campaign,         path: '/hr/announcements'},
];

export default function HRLayout({ children }: { children?: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const nav = useNavigate();
  const loc = useLocation();
  const profile = useAppSelector(s => s.hr.profile);
  const dw  = collapsed ? WC : W;

  const active = (path: string) => loc.pathname.startsWith(path);

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleMenuClose();
    localStorage.removeItem('token');
    nav('/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: H.bg }}>

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <Drawer variant="permanent" sx={{
        width: dw, flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: dw, bgcolor: H.surface,
          borderRight: `1px solid ${H.border}`,
          overflow: 'hidden', transition: 'width .2s ease',
          display: 'flex', flexDirection: 'column',
        },
      }}>

        {/* Brand */}
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1.5,
          px: collapsed ? 1.5 : 2.5, height: 60,
          borderBottom: `1px solid ${H.border}`, flexShrink: 0,
        }}>
          <Box sx={{
            width: 32, height: 32, flexShrink: 0, borderRadius: '8px',
            background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <People sx={{ color: '#fff', fontSize: 16 }} />
          </Box>
          {!collapsed && (
            <Box flex={1} minWidth={0}>
              <Typography sx={{ color: H.text, fontWeight: 700, fontSize: 14, letterSpacing: -0.3, lineHeight: 1.1 }}>
                HR Module
              </Typography>
              <Typography sx={{ color: H.primary, fontSize: 9.5, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                Realesso
              </Typography>
            </Box>
          )}
          <IconButton size="small" onClick={() => setCollapsed(c => !c)}
            sx={{ color: H.muted, '&:hover': { color: H.text }, ml: collapsed ? 'auto' : 0 }}>
            {collapsed ? <MenuIcon sx={{ fontSize: 17 }} /> : <MenuOpen sx={{ fontSize: 17 }} />}
          </IconButton>
        </Box>

        {/* Nav items */}
        <Box sx={{ flex: 1, overflowY: 'auto', py: 1.5, px: collapsed ? 0.75 : 1.25,
          '&::-webkit-scrollbar': { width: 3 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.07)', borderRadius: 2 },
        }}>
          <List disablePadding>
            {NAV.map(({ label, icon: Icon, path }) => {
              const on = active(path);
              return (
                <Tooltip key={path} title={collapsed ? label : ''} placement="right" arrow>
                  <ListItemButton onClick={() => nav(path)} sx={{
                    borderRadius: '8px', mb: 0.4,
                    px: collapsed ? 1.25 : 1.5, py: 0.9,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    bgcolor: on ? 'rgba(59,130,246,0.12)' : 'transparent',
                    '&:hover': { bgcolor: on ? 'rgba(59,130,246,0.16)' : 'rgba(255,255,255,0.04)' },
                  }}>
                    <ListItemIcon sx={{
                      minWidth: collapsed ? 0 : 32,
                      color: on ? H.primary : H.muted,
                      '& svg': { fontSize: 18 },
                    }}>
                      <Icon />
                    </ListItemIcon>
                    {!collapsed && (
                      <ListItemText
                        primary={label}
                        primaryTypographyProps={{
                          fontSize: 13, fontWeight: on ? 600 : 400,
                          color: on ? H.text : H.textSub,
                        }}
                      />
                    )}
                    {!collapsed && on && (
                      <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: H.primary, flexShrink: 0 }} />
                    )}
                  </ListItemButton>
                </Tooltip>
              );
            })}
          </List>
        </Box>

        <Divider sx={{ borderColor: H.border }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: collapsed ? 1 : 2, py: 1.5, flexShrink: 0 }}>
          <Avatar 
            src={profile?.avatarUrl}
            onClick={handleMenuOpen}
            sx={{ width: 30, height: 30, bgcolor: H.primary, fontSize: 11, fontWeight: 700, flexShrink: 0, cursor: 'pointer' }}
          >
            {(profile?.name ?? 'HR').charAt(0)}
          </Avatar>
          {!collapsed && (
            <Box flex={1} minWidth={0}>
              <Typography sx={{ color: H.text, fontSize: 12, fontWeight: 600 }} noWrap>{profile?.name ?? 'HR Admin'}</Typography>
              <Typography sx={{ color: H.textSub, fontSize: 10.5 }} noWrap>{profile?.email ?? 'hr@company.io'}</Typography>
            </Box>
          )}
          {!collapsed && (
            <IconButton size="small" onClick={handleLogout} sx={{ color: H.muted, '&:hover': { color: H.coral }, flexShrink: 0 }}>
              <Logout sx={{ fontSize: 14 }} />
            </IconButton>
          )}
        </Box>
      </Drawer>
      {/* ── Main ─────────────────────────────────────────────────────── */}
      <Box component="main" sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          gap: 1.5, px: 3, height: 60, flexShrink: 0,
          borderBottom: `1px solid ${H.border}`, bgcolor: H.surface,
        }}>
          <Chip label="HR System Active" size="small"
            sx={{ bgcolor: 'rgba(20,184,166,0.1)', color: H.teal, fontWeight: 600, fontSize: 10.5, height: 22 }} />
          <NotificationBell />
          <Avatar 
            src={profile?.avatarUrl}
            onClick={handleMenuOpen}
            sx={{ width: 28, height: 28, bgcolor: H.primary, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
          >
            {(profile?.name ?? 'HR').charAt(0)}
          </Avatar>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 3 },
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.07)', borderRadius: 3 },
        }}>
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
            bgcolor: H.surface,
            border: `1px solid ${H.border}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            mt: 1,
            minWidth: 160,
            '& .MuiMenuItem-root': {
              fontSize: 13,
              color: H.textSub,
              gap: 1.5,
              py: 1,
              '&:hover': { bgcolor: `${H.primary}10`, color: H.text },
              '& .MuiSvgIcon-root': { fontSize: 18, color: H.muted }
            }
          }
        }}
      >
        <MenuItem onClick={() => { handleMenuClose(); nav('/hr/profile'); }}>
          <Person /> My Profile
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); nav('/hr/settings'); }}>
          <Settings /> Settings
        </MenuItem>
        <Divider sx={{ borderColor: H.border }} />
        <MenuItem onClick={handleLogout} sx={{ color: `${H.coral} !important` }}>
          <Logout sx={{ color: `${H.coral} !important` }} /> Logout
        </MenuItem>
      </Menu>
    </Box>
  );
}
