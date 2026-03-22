import React, { useEffect } from 'react';
import { Box, Container, CssBaseline } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile } from '../../../redux/slices/authSlice';
import { RootState } from '../../../redux/store';
import TenantAdminSidebar from './TenantAdminSidebar';
import TenantAdminTopbar from './TenantAdminTopbar';
import PasswordChangeModal from '../components/PasswordChangeModal';

const TenantAdminLayout: React.FC = () => {
  const dispatch = useDispatch<any>();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  const handlePasswordSuccess = () => {
    dispatch(getProfile());
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f1f5f9' }}>
      <CssBaseline />
      <TenantAdminSidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TenantAdminTopbar />
        <Container 
          maxWidth="xl" 
          component="main" 
          sx={{ 
            py: { xs: 2, sm: 4 }, 
            px: { xs: 2, sm: 4 },
            flexGrow: 1
          }}
        >
          <Outlet />
        </Container>
      </Box>
      <PasswordChangeModal 
        open={!!user?.mustChangePassword} 
        onSuccess={handlePasswordSuccess} 
      />
    </Box>
  );
};

export default TenantAdminLayout;
