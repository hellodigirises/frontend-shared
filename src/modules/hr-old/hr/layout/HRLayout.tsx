import React from 'react';
import { Box, Container, AppBar, Toolbar, Typography, Avatar, IconButton, Badge } from '@mui/material';
import { NotificationsOutlined, SearchOutlined } from '@mui/icons-material';
import { Outlet } from 'react-router-dom';
import HRSidebar from './HRSidebar';

const HRLayout: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'var(--bg-default)' }}>
      <HRSidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
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
            <Typography variant="h6" fontWeight={600}>
              HR Management
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton size="small">
                <SearchOutlined />
              </IconButton>
              <IconButton size="small">
                <Badge badgeContent={4} color="error">
                  <NotificationsOutlined />
                </Badge>
              </IconButton>
              <Avatar sx={{ width: 32, height: 32, ml: 1, bgcolor: 'primary.main' }}>AD</Avatar>
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

export default HRLayout;
