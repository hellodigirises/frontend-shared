import React from 'react';
import { 
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
  Toolbar, Typography, Box, Divider 
} from '@mui/material';
import { 
  DashboardOutlined, PeopleAltOutlined, TuneOutlined, 
  FormatListBulletedOutlined, MapsHomeWorkOutlined, 
  LibraryBooksOutlined, EventAvailableOutlined, 
  StorefrontOutlined, PaymentsOutlined, FactCheckOutlined, 
  BusinessCenterOutlined, BugReportOutlined, AssessmentOutlined,
  SettingsOutlined, AccountTreeOutlined, AutoAwesomeOutlined,
  NotificationsOutlined
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';

const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <DashboardOutlined />, path: '/admin/dashboard' },
  { label: 'Users', icon: <PeopleAltOutlined />, path: '/admin/users' },
  { label: 'Leads', icon: <TuneOutlined />, path: '/admin/leads', module: 'CRM', pageId: 'CRM_LEADS' },
  { label: 'Customers', icon: <PeopleAltOutlined />, path: '/admin/customers', module: 'CRM', pageId: 'CRM_CUSTOMERS' },
  { label: 'Marketing', icon: <AccountTreeOutlined />, path: '/admin/marketing', module: 'MARKETING', pageId: 'MARK_DASHBOARD' },
  { label: 'Projects', icon: <MapsHomeWorkOutlined />, path: '/admin/projects', module: 'CONSTRUCTION', pageId: 'CONST_PROJECTS' },
  { label: 'Units', icon: <FormatListBulletedOutlined />, path: '/admin/units', module: 'CRM', pageId: 'CRM_UNITS' },
  { label: 'Bookings', icon: <LibraryBooksOutlined />, path: '/admin/bookings', module: 'BOOKINGS', pageId: 'BOOK_LIST' },
  { label: 'Site Visits', icon: <EventAvailableOutlined />, path: '/admin/visits', module: 'BOOKINGS', pageId: 'BOOK_VISITS' },
  { label: 'Channel Partners', icon: <StorefrontOutlined />, path: '/admin/partners', module: 'CRM', pageId: 'CRM_PARTNERS' },
  { label: 'Commissions', icon: <PaymentsOutlined />, path: '/admin/commissions', module: 'FINANCE', pageId: 'FINANCE_COMMISSIONS' },
  { label: 'Payments', icon: <FactCheckOutlined />, path: '/admin/payments', module: 'FINANCE', pageId: 'FINANCE_INVOICES' },
  { label: 'Tasks', icon: <BusinessCenterOutlined />, path: '/admin/tasks', module: 'CRM', pageId: 'CRM_TASKS' },
  { label: 'HR', icon: <PeopleAltOutlined />, path: '/admin/hr', module: 'HR', pageId: 'HR_DASHBOARD' },
  { label: 'Procurement', icon: <FactCheckOutlined />, path: '/admin/procurement', module: 'FINANCE', pageId: 'FINANCE_VENDOR_PAYMENTS' },
  { label: 'Reports', icon: <AssessmentOutlined />, path: '/admin/reports', module: 'ANALYTICS', pageId: 'FINANCE_REPORTS' },
  { label: 'AI Insights', icon: <AutoAwesomeOutlined />, path: '/admin/ai-insights', module: 'AI_INSIGHTS', pageId: 'AI_DASHBOARD' },
  { label: 'Notifications', icon: <NotificationsOutlined />, path: '/admin/notifications', module: 'NOTIFICATIONS', pageId: 'COMM_HUB' },
  { label: 'Report', icon: <AssessmentOutlined />, path: '/admin/reports' },
  { label: 'Ticket', icon: <BugReportOutlined />, path: '/admin/tickets' },
  { label: 'Documents', icon: <LibraryBooksOutlined />, path: '/admin/documents', module: 'DOCUMENTS', pageId: 'DOCS_CENTER' },
  { label: 'Agent Module', icon: <PeopleAltOutlined />, path: '/agent', module: 'AGENT', pageId: 'AGENT_DASHBOARD' },
  { label: 'Sales Manager', icon: <BusinessCenterOutlined />, path: '/manager', module: 'SALES_MANAGER', pageId: 'SALES_DASHBOARD' },
  { label: 'Sales - Team', icon: <PeopleAltOutlined />, path: '/manager/team', module: 'SALES_MANAGER', pageId: 'SALES_TEAM' },
  { label: 'Settings', icon: <SettingsOutlined />, path: '/admin/settings' },
];

const TenantAdminSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((s: RootState) => s.auth);

  // Get granular module configuration from tenant
  const tenantConfig = user?.tenant?.modules || { enabledModules: [], disabledPages: [] };
  const enabledModules = tenantConfig.enabledModules || [];
  const disabledPages = tenantConfig.disabledPages || [];
  
  const filteredNav = NAV_ITEMS.filter(item => {
    if (!item.module) return true; // Always show core items
    if (enabledModules.length === 0) return true; // Fallback to all if not set
    
    // 1. Check if the entire module is disabled
    if (!enabledModules.includes(item.module)) return false;

    // 2. Check if the specific page is disabled
    if (item.pageId && disabledPages.includes(item.pageId)) return false;

    return true;
  });

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          bgcolor: '#1e293b',
          color: '#f8fafc',
          borderRight: 'none',
        },
      }}
    >
      <Toolbar sx={{ px: 3, py: 4 }}>
        <Typography variant="h5" fontWeight={800} color="primary.light" letterSpacing={-0.5}>
          Realesso <Box component="span" sx={{ fontSize: '0.7em', color: 'rgba(255,255,255,0.4)', ml: 1 }}>ADMIN</Box>
        </Typography>
      </Toolbar>
      
      <Box sx={{ overflowX: 'hidden', flexGrow: 1, px: 1.5 }}>
        <List>
          {filteredNav.map((item) => {
            const active = location.pathname.startsWith(item.path) || (item.path === '/admin/dashboard' && location.pathname === '/admin');
            return (
              <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    bgcolor: active ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                    color: active ? '#818cf8' : 'rgba(248, 250, 252, 0.6)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.04)',
                      color: active ? '#818cf8' : '#f8fafc',
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                    {React.cloneElement(item.icon as React.ReactElement, { fontSize: 'small' })}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label} 
                    primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: active ? 600 : 500 }} 
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
      
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Divider sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.08)' }} />
        <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 3 }}>
          <Typography variant="caption" color="rgba(255,255,255,0.4)" display="block" gutterBottom>
            Logged in as
          </Typography>
          <Typography variant="body2" fontWeight={600} noWrap>
            Modern Realty Admin
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default TenantAdminSidebar;
