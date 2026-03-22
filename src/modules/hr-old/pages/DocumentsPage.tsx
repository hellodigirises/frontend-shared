import React from 'react';
import { Box, Typography } from '@mui/material';

const DocumentsPage: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Typography variant="h6" color="text.secondary">Document Vault (Coming Soon)</Typography>
      <Typography variant="body2" color="text.disabled">Centralized storage for ID proofs, PAN, Aadhar, etc.</Typography>
    </Box>
  );
};

export default DocumentsPage;
