import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const BookingsPage: React.FC = () => (
  <Box>
    <Typography variant="h4" fontWeight={800} gutterBottom>Team Bookings</Typography>
    <Typography color="text.secondary" sx={{ mb: 4 }}>Track all closed deals and unit bookings in your tenant.</Typography>
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent align="center" sx={{ py: 10 }}>
        <Typography color="text.disabled">Bookings view coming soon...</Typography>
      </CardContent>
    </Card>
  </Box>
);

export default BookingsPage;
