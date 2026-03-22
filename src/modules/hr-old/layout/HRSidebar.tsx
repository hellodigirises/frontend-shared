import React from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Divider } from '@mui/material';
import { 
  DashboardOutlined, 
  PeopleOutlined, 
  AccessTimeOutlined, 
  CalendarMonthOutlined, 
  PaymentsOutlined, 
  DescriptionOutlined, 
  AssignmentLateOutlined, 
  AssessmentOutlined,
  FolderSharedOutlined
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const drawerWidth = 260;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardOutlined />, path: '/hr' },
  { text: 'Employees', icon: <PeopleOutlined />, path: '/hr/employees' },
  { text: 'Attendance', icon: <AccessTimeOutlined />, path: '/hr/attendance' },
  { text: 'Leaves', icon: <CalendarMonthOutlined />, path: '/hr/leaves' },
  { text: 'Payroll', icon: <PaymentsOutlined />, path: '/hr/payroll' },
  { text: 'Contracts', icon: <DescriptionOutlined />, path: '/hr/contracts' },
  { text: 'Document Vault', icon: <FolderSharedOutlined />, path: '/hr/documents' },
  { text: 'Tickets', icon: <AssignmentLateOutlined />, path: '/hr/tickets' },
  { text: 'Reports', icon: <AssessmentOutlined />, path: '/hr/reports' },
];

const HRSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px border-subtle',
          background: 'var(--bg-paper)',
        },
      }}
    >
      <Toolbar>
        <Typography variant="h6" fontWeight={700} color="primary">
          Workforce Hub
        </Typography>
      </Toolbar>
      <Box sx={{ overflow: 'auto', mt: 2 }}>
        <List sx={{ px: 2 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                    '&:hover': { backgroundColor: 'primary.dark' },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default HRSidebar;
