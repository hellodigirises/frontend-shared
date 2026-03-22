import React from 'react';
import { 
  AppBar, Toolbar, Box, TextField, InputAdornment, 
  IconButton, Typography, Avatar 
} from '@mui/material';
import { SearchOutlined, AppsOutlined } from '@mui/icons-material';
import NotificationBell from '../../../components/NotificationBell';

const TenantAdminTopbar: React.FC = () => {
  return (
    <AppBar 
      position="sticky" 
      color="inherit" 
      elevation={0}
      sx={{ 
        bgcolor: '#fff', 
        borderBottom: '1px solid', 
        borderColor: 'divider',
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}
    >
      <Toolbar sx={{ px: { xs: 2, sm: 4 } }}>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Global search..."
            sx={{ 
              width: 300,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: '#f8fafc',
                '& fieldset': { borderColor: 'transparent' },
                '&:hover fieldset': { borderColor: 'primary.light' },
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined fontSize="small" color="disabled" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <NotificationBell />
          
          <IconButton sx={{ bgcolor: '#f1f5f9' }}>
            <AppsOutlined fontSize="small" />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 1 }}>
            <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
              <Typography variant="body2" fontWeight={700} lineHeight={1}>
                Harsh Admin
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tenant Administrator
              </Typography>
            </Box>
            <Avatar 
              sx={{ 
                width: 40, height: 40, 
                bgcolor: 'primary.main', 
                border: '2px solid #fff',
                boxShadow: '0 0 10px rgba(0,0,0,0.1)' 
              }}
            >
              H
            </Avatar>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TenantAdminTopbar;
