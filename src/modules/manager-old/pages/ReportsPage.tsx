import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const ReportsPage: React.FC = () => (
  <Box>
    <Typography variant="h4" fontWeight={800} gutterBottom>Sales Reports</Typography>
    <Typography color="text.secondary" sx={{ mb: 4 }}>Analyze team performance and conversion trends.</Typography>
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent align="center" sx={{ py: 10 }}>
        <Typography color="text.disabled">Reports and Analytics coming soon...</Typography>
      </CardContent>
    </Card>
  </Box>
);

export default ReportsPage;
