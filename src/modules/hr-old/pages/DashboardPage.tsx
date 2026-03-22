import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, useTheme } from '@mui/material';
import { 
  PeopleAltOutlined, 
  FactCheckOutlined, 
  PendingActionsOutlined, 
  AccountBalanceWalletOutlined,
  BugReportOutlined,
  CalendarMonthOutlined
} from '@mui/icons-material';

const DashboardPage: React.FC = () => {
  const theme = useTheme();

  const stats = [
    { label: 'Total Employees', value: '42', icon: <PeopleAltOutlined />, color: theme.palette.primary.main },
    { label: 'Present Today', value: '38', icon: <FactCheckOutlined />, color: '#10b981' },
    { label: 'Leaves Pending', value: '5', icon: <PendingActionsOutlined />, color: '#f59e0b' },
    { label: 'Payroll Due', value: '$12,400', icon: <AccountBalanceWalletOutlined />, color: '#ef4444' },
    { label: 'Open Tickets', value: '3', icon: <BugReportOutlined />, color: '#6366f1' },
    { label: 'Contract Expiry', value: '2', icon: <CalendarMonthOutlined />, color: '#8b5cf6' },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          HR Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back! Here's what's happening with your workforce today.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={4} key={stat.label}>
            <Card 
              variant="outlined" 
              sx={{ 
                borderRadius: 4, 
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[4], borderColor: stat.color }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box 
                    sx={{ 
                      p: 1.5, 
                      borderRadius: 3, 
                      bgcolor: `${stat.color}15`, 
                      color: stat.color,
                      display: 'flex'
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
                <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={8}>
          <Card variant="outlined" sx={{ borderRadius: 4, height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body1" color="text.disabled">
              Attendance Trend Chart (Coming Soon)
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ borderRadius: 4, height: '400px', p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Active Announcements
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[1, 2, 3].map((i) => (
                <Box key={i} sx={{ p: 2, bgcolor: 'var(--bg-subtle)', borderRadius: 3 }}>
                  <Typography variant="subtitle2" fontWeight={600}>Company Picnic 2026</Typography>
                  <Typography variant="caption" color="text.secondary">Posted 2 days ago</Typography>
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
