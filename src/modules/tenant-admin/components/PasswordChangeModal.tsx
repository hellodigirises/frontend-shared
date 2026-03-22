import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, Box, Alert,
  InputAdornment, IconButton, Stack
} from '@mui/material';
import {
  LockOutlined, VisibilityOutlined, VisibilityOffOutlined,
  ShieldOutlined, CheckCircleOutlined
} from '@mui/icons-material';
import api from '../../../api/axios';

interface PasswordChangeModalProps {
  open: boolean;
  onSuccess: () => void;
}

const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ open, onSuccess }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, p: 1 }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 0 }}>
        <Box sx={{ 
          width: 50, height: 50, borderRadius: '50%', 
          bgcolor: 'primary.light', color: 'primary.main',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          mx: 'auto', mb: 2
        }}>
          <ShieldOutlined fontSize="large" />
        </Box>
        <Typography variant="h5" fontWeight="700">Change Password</Typography>
        <Typography variant="body2" color="text.secondary">
          Security Update Required
        </Typography>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Your administrator requires you to change your password before continuing.
            </Alert>

            {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

            <TextField
              label="Temporary/Current Password"
              type={showPass ? 'text' : 'password'}
              fullWidth
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPass(!showPass)} edge="end">
                      {showPass ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <TextField
              label="New Password"
              type="password"
              fullWidth
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              helperText="Min. 8 characters with upper, lower and numbers"
            />

            <TextField
              label="Confirm New Password"
              type="password"
              fullWidth
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            fullWidth 
            type="submit" 
            variant="contained" 
            size="large"
            disabled={loading}
            startIcon={<CheckCircleOutlined />}
            sx={{ 
              borderRadius: 2, 
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PasswordChangeModal;
