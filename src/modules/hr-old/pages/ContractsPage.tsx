import React from 'react';
import { Box, Typography, Card, Grid, CardContent, IconButton } from '@mui/material';
import { DescriptionOutlined, VisibilityOutlined, DownloadOutlined } from '@mui/icons-material';

const contracts = [
  { id: '1', name: 'John Doe - Employment Contract', date: '2023-01-15' },
  { id: '2', name: 'Jane Smith - Offer Letter', date: '2023-02-10' },
];

const ContractsPage: React.FC = () => {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>Contract Management</Typography>
        <Typography variant="body1" color="text.secondary">Securely store and manage employee legal documents.</Typography>
      </Box>

      <Grid container spacing={3}>
        {contracts.map((c) => (
          <Grid item xs={12} sm={6} md={4} key={c.id}>
            <Card variant="outlined" sx={{ borderRadius: 4 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <DescriptionOutlined color="primary" sx={{ fontSize: 40 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700} noWrap>{c.name}</Typography>
                  <Typography variant="caption" color="text.secondary">Signed: {c.date}</Typography>
                </Box>
                <Box>
                  <IconButton size="small"><VisibilityOutlined /></IconButton>
                  <IconButton size="small"><DownloadOutlined /></IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ContractsPage;
