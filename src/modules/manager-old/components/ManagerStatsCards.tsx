import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
} from '@mui/material';
import {
  PeopleAltOutlined,
  EmojiEventsOutlined,
  TrendingUpOutlined,
  ExploreOutlined,
  BadgeOutlined,
  AssignmentTurnedInOutlined,
} from '@mui/icons-material';

interface TeamStats {
  totalLeads: number;
  totalBookings: number;
  totalSiteVisits: number;
  agentsCount: number;
  conversionRate: number;
}

interface StatCardConfig {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  format?: (v: number) => string;
}

interface Props {
  stats: TeamStats | null;
  loading: boolean;
}

const ManagerStatsCards: React.FC<Props> = ({ stats, loading }) => {
  const cards: StatCardConfig[] = [
    {
      label: 'Team Leads',
      value: stats?.totalLeads || 0,
      icon: <PeopleAltOutlined />,
      color: '#6366F1',
    },
    {
      label: 'Team Bookings',
      value: stats?.totalBookings || 0,
      icon: <EmojiEventsOutlined />,
      color: '#10B981',
    },
    {
      label: 'Site Visits',
      value: stats?.totalSiteVisits || 0,
      icon: <ExploreOutlined />,
      color: '#0EA5E9',
    },
    {
      label: 'Total Agents',
      value: stats?.agentsCount || 0,
      icon: <BadgeOutlined />,
      color: '#F59E0B',
    },
    {
      label: 'Avg Conversion',
      value: stats?.conversionRate || 0,
      icon: <TrendingUpOutlined />,
      color: '#8B5CF6',
      format: (v) => `${v.toFixed(1)}%`,
    },
    {
      label: 'Overdue Tasks',
      value: 0, // Placeholder
      icon: <AssignmentTurnedInOutlined />,
      color: '#EF4444',
    },
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} lg={4} key={index}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': { boxShadow: 3, transform: 'translateY(-2px)', transition: 'all 0.2s' },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                    {card.label}
                  </Typography>
                  {loading ? (
                    <Skeleton variant="text" width={100} height={40} />
                  ) : (
                    <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5, letterSpacing: '-1px' }}>
                      {card.format ? card.format(card.value) : card.value}
                    </Typography>
                  )}
                </Box>
                <Box
                  sx={{
                    bgcolor: `${card.color}18`,
                    color: card.color,
                    p: 1.25,
                    borderRadius: 2,
                    display: 'flex',
                  }}
                >
                  {card.icon}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ManagerStatsCards;
