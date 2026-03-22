import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const TicketsPage: React.FC = () => (
  <Box>
    <Typography variant="h4" fontWeight={800} gutterBottom>Team Tickets</Typography>
    <Typography color="text.secondary" sx={{ mb: 4 }}>Manage support requests and escalations from your team.</Typography>
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent align="center" sx={{ py: 10 }}>
        <Typography color="text.disabled">Tickets view coming soon...</Typography>
      </CardContent>
    </Card>
  </Box>
);

export default TicketsPage;
