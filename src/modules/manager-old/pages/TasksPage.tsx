import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const TasksPage: React.FC = () => (
  <Box>
    <Typography variant="h4" fontWeight={800} gutterBottom>Team Tasks</Typography>
    <Typography color="text.secondary" sx={{ mb: 4 }}>Manage and assign tasks across your sales team.</Typography>
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent align="center" sx={{ py: 10 }}>
        <Typography color="text.disabled">Team Tasks view coming soon...</Typography>
      </CardContent>
    </Card>
  </Box>
);

export default TasksPage;
