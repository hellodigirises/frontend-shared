import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, Box, Alert,
  Stack, RadioGroup, FormControlLabel, Radio, Divider
} from '@mui/material';
import { WarningAmberOutlined, DeleteOutline } from '@mui/icons-material';

interface DeleteMemberDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (fullDelete: boolean) => void;
  userName: string;
  loading?: boolean;
}

const DeleteMemberDialog: React.FC<DeleteMemberDialogProps> = ({
  open, onClose, onConfirm, userName, loading
}) => {
  const [mode, setMode] = useState<'SCRUB' | 'WIPE'>('SCRUB');
  const [confirmText, setConfirmText] = useState('');

  const isConfirmed = confirmText.trim().toUpperCase() === 'CONFIRM';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pt: 3 }}>
        <Box sx={{ p: 1, bgcolor: 'error.light', color: 'error.main', borderRadius: '50%', display: 'flex' }}>
          <WarningAmberOutlined />
        </Box>
        <Typography variant="h6" fontWeight={800}>Delete Member?</Typography>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            You are about to delete <strong>{userName}</strong>. Please choose the deletion type:
          </Typography>

          <RadioGroup value={mode} onChange={(e) => setMode(e.target.value as any)}>
            <Stack spacing={2}>
              <Box 
                sx={{ 
                  p: 2, 
                  border: '1px solid', 
                  borderColor: mode === 'SCRUB' ? 'primary.main' : 'divider', 
                  borderRadius: 3, 
                  bgcolor: mode === 'SCRUB' ? 'hsl(215,100%,99%)' : 'transparent', 
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }} 
                onClick={() => setMode('SCRUB')}
              >
                <FormControlLabel value="SCRUB" control={<Radio />} label={
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>Revoke Access (Keep Records)</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      Deletes login credentials but keeps HR profile, documents, and historical data.
                    </Typography>
                  </Box>
                } />
              </Box>

              <Box 
                sx={{ 
                  p: 2, 
                  border: '1px solid', 
                  borderColor: mode === 'WIPE' ? 'error.main' : 'divider', 
                  borderRadius: 3, 
                  bgcolor: mode === 'WIPE' ? 'hsl(0,100%,99%)' : 'transparent', 
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }} 
                onClick={() => setMode('WIPE')}
              >
                <FormControlLabel value="WIPE" control={<Radio color="error" />} label={
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} color="error.main">Permanently Wipe All Data</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      Irreversibly deletes User, Employee profile, and all KYC Documents.
                    </Typography>
                  </Box>
                } />
              </Box>
            </Stack>
          </RadioGroup>

          <Divider />

          <Box>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Confirm by typing <strong>CONFIRM</strong>
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Type CONFIRM here"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              autoComplete="off"
              InputProps={{ 
                sx: { borderRadius: 2, fontWeight: 700, fontFamily: 'monospace' } 
              }}
            />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={onClose} variant="text" color="inherit" sx={{ textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
        <Button
          onClick={() => onConfirm(mode === 'WIPE')}
          variant="contained"
          color={mode === 'WIPE' ? 'error' : 'primary'}
          disabled={!isConfirmed || loading}
          startIcon={<DeleteOutline />}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 3 }}
        >
          {loading ? 'Processing...' : mode === 'WIPE' ? 'Wipe Everything' : 'Revoke Access'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteMemberDialog;
