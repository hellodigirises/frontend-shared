import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItemButton,
  ListItemIcon, ListItemText, IconButton, Avatar, Menu, MenuItem,
  Divider, Tooltip, Badge, useTheme, useMediaQuery,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PhoneIcon from '@mui/icons-material/Phone';
import ReceiptIcon from '@mui/icons-material/Receipt';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PublicIcon from '@mui/icons-material/Public';

const DRAWER_WIDTH = 256;
const COLLAPSED_WIDTH = 68;

interface NavItem { label: string; icon: React.ReactNode; path: string; }

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: <DashboardIcon fontSize="small" />, path: '/superadmin' },
  { label: 'Tenants', icon: <BusinessIcon fontSize="small" />, path: '/superadmin/tenants' },
  { label: 'Plans', icon: <AssignmentIndIcon fontSize="small" />, path: '/superadmin/plans' },
  { label: 'AI Agents', icon: <SmartToyIcon fontSize="small" />, path: '/superadmin/ai-agents' },
  { label: 'Telephony', icon: <PhoneIcon fontSize="small" />, path: '/superadmin/telephony' },
  { label: 'Billing', icon: <ReceiptIcon fontSize="small" />, path: '/superadmin/billing' },
  { label: 'Analytics', icon: <BarChartIcon fontSize="small" />, path: '/superadmin/analytics' },
  { label: 'Domains', icon: <PublicIcon fontSize="small" />, path: '/superadmin/domains' },
  { label: 'Settings', icon: <SettingsIcon fontSize="small" />, path: '/superadmin/settings' },
];

const SuperAdminLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [userMenu, setUserMenu] = useState<null | HTMLElement>(null);

  const drawerWidth = collapsed && !isMobile ? COLLAPSED_WIDTH : DRAWER_WIDTH;
  const isActive = (path: string) =>
    path === '/superadmin'
      ? location.pathname === '/superadmin'
      : location.pathname.startsWith(path);

  const SidebarContent = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* ── Logo ── */}
      <Box sx={{
        px: collapsed ? 1.5 : 2.5, py: 2.5,
        display: 'flex', alignItems: 'center', gap: 1.5,
        borderBottom: '1px solid rgba(255,255,255,0.08)', minHeight: 68,
      }}>
        <Box sx={{
          width: 36, height: 36, borderRadius: 1.5, flexShrink: 0,
          background: 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <AutoAwesomeIcon sx={{ fontSize: 18, color: '#fff' }} />
        </Box>
        {!collapsed && (
          <Box>
            <Typography variant="subtitle2" fontWeight={700} color="#F1F5F9" fontSize={15}>
              Realesso
            </Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.4)" fontSize={10} letterSpacing={1}>
              SUPER ADMIN
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── Nav ── */}
      <List sx={{ flex: 1, pt: 1.5, px: 1 }}>
        {NAV_ITEMS.map(item => {
          const active = isActive(item.path);
          return (
            <Tooltip key={item.path} title={collapsed ? item.label : ''} placement="right">
              <ListItemButton
                onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
                sx={{
                  borderRadius: 1.5, mb: 0.5, px: collapsed ? 1.5 : 2, minHeight: 42,
                  bgcolor: active ? 'rgba(99,102,241,0.18)' : 'transparent',
                  '&:hover': { bgcolor: active ? 'rgba(99,102,241,0.24)' : 'rgba(255,255,255,0.05)' },
                  transition: 'background 0.15s',
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: collapsed ? 0 : 1.5, color: active ? '#818CF8' : 'rgba(255,255,255,0.45)' }}>
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: 13.5,
                      fontWeight: active ? 600 : 400,
                      color: active ? '#E0E7FF' : 'rgba(255,255,255,0.55)',
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>

      {/* ── Collapse Toggle ── */}
      {!isMobile && (
        <Box sx={{ p: 1, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
            <IconButton
              onClick={() => setCollapsed(c => !c)}
              sx={{ width: '100%', borderRadius: 1.5, color: 'rgba(255,255,255,0.35)', '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' } }}
            >
              <ChevronLeftIcon sx={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );

  const DRAWER_SX = {
    '& .MuiDrawer-paper': {
      background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
      borderRight: 'none',
      boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
      overflow: 'hidden',
    },
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      {/* Desktop sidebar */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth, flexShrink: 0, transition: 'width 0.2s', ...DRAWER_SX,
            '& .MuiDrawer-paper': { ...DRAWER_SX['& .MuiDrawer-paper'], width: drawerWidth, transition: 'width 0.2s' },
          }}
        >
          <SidebarContent />
        </Drawer>
      )}

      {/* Mobile sidebar */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ ...DRAWER_SX, '& .MuiDrawer-paper': { ...DRAWER_SX['& .MuiDrawer-paper'], width: DRAWER_WIDTH } }}
        >
          <SidebarContent />
        </Drawer>
      )}

      {/* Main content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* AppBar */}
        <AppBar position="sticky" elevation={0}
          sx={{ bgcolor: '#fff', borderBottom: '1px solid', borderColor: 'divider', color: 'text.primary' }}
        >
          <Toolbar sx={{ gap: 1 }}>
            {isMobile && (
              <IconButton edge="start" onClick={() => setMobileOpen(true)}>
                <MenuIcon />
              </IconButton>
            )}
            <Box sx={{ flex: 1 }} />

            <Tooltip title="Notifications">
              <IconButton>
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            <Box
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer',
                px: 1, py: 0.5, borderRadius: 1.5, '&:hover': { bgcolor: '#F1F5F9' }
              }}
              onClick={e => setUserMenu(e.currentTarget)}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#6366F1', fontSize: 13, fontWeight: 700 }}>
                SA
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" fontWeight={600} lineHeight={1.2}>Super Admin</Typography>
                <Typography variant="caption" color="text.secondary" lineHeight={1}>admin@realesso.io</Typography>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page */}
        <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 3 }, overflow: 'auto' }}>
          <Outlet />
        </Box>
      </Box>

      {/* User menu */}
      <Menu anchorEl={userMenu} open={Boolean(userMenu)} onClose={() => setUserMenu(null)}>
        <MenuItem onClick={() => setUserMenu(null)}>Profile</MenuItem>
        <MenuItem onClick={() => setUserMenu(null)}>Account Settings</MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setUserMenu(null);
            localStorage.removeItem("token");
            navigate("/login");
          }}
          sx={{ color: 'error.main' }}
        >
          Sign Out
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default SuperAdminLayout;