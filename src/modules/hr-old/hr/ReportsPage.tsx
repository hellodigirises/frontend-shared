import React from 'react';
import { Box, Typography } from '@mui/material';

const ReportsPage: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Typography variant="h6" color="text.secondary">HR Reports (Coming Soon)</Typography>
      <Typography variant="body2" color="text.disabled">Analytics on attrition, attendance trends, and payroll distribution.</Typography>
    </Box>
  );
};

export default ReportsPage;
