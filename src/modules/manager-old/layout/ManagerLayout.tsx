import React from 'react';
import { Box, Container, AppBar, Toolbar, Typography, Avatar, IconButton, Badge } from '@mui/material';
import { NotificationsOutlined, SearchOutlined } from '@mui/icons-material';
import { Outlet, Navigate } from 'react-router-dom';
import { RootState } from '../../../redux/store';
import ManagerSidebar from './ManagerSidebar';
import NotificationBell from '../../../components/NotificationBell';

const ManagerLayout: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  // RBAC Check
  if (!user || (user.role !== 'SALES_MANAGER' && user.role !== 'TENANT_ADMIN')) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f1f5f9' }}>
      <ManagerSidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppBar 
          position="static" 
          color="inherit" 
          elevation={0} 
          sx={{ 
            borderBottom: '1px solid', 
            borderColor: 'divider',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight={700} color="warning.main">
              Manager Control
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton size="small">
                <SearchOutlined />
              </IconButton>
              <NotificationBell />
              <Avatar sx={{ width: 32, height: 32, ml: 1, bgcolor: 'warning.main', cursor: 'pointer' }}>MC</Avatar>
            </Box>
          </Toolbar>
        </AppBar>
        <Container maxWidth="xl" sx={{ py: 4, flexGrow: 1 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default ManagerLayout;
