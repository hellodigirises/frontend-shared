import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const SiteVisitsPage: React.FC = () => (
  <Box>
    <Typography variant="h4" fontWeight={800} gutterBottom>Team Site Visits</Typography>
    <Typography color="text.secondary" sx={{ mb: 4 }}>Monitor agent-customer site visit appointments across the team.</Typography>
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent align="center" sx={{ py: 10 }}>
        <Typography color="text.disabled">Site Visits view coming soon...</Typography>
      </CardContent>
    </Card>
  </Box>
);

export default SiteVisitsPage;
