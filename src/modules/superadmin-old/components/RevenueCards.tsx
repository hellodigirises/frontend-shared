import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Chip, Skeleton } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SpeedIcon from '@mui/icons-material/Speed';
import type { RevenueOverview } from './superadminSlice';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: number;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, change, icon, color, loading }) => (
  <Card sx={{
    height: '100%',
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    transition: 'box-shadow 0.2s',
    '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
  }}>
    <CardContent sx={{ p: 3 }}>
      {loading ? (
        <>
          <Skeleton width="60%" height={20} />
          <Skeleton width="80%" height={40} sx={{ mt: 1 }} />
          <Skeleton width="40%" height={20} sx={{ mt: 1 }} />
        </>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={500} fontSize={12} textTransform="uppercase" letterSpacing={0.8}>
              {title}
            </Typography>
            <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: `${color}18`, color }}>
              {icon}
            </Box>
          </Box>
          <Typography variant="h4" fontWeight={700} color="text.primary" mb={0.5}>
            {value}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {change !== undefined && (
              <Chip
                size="small"
                icon={change >= 0 ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />}
                label={`${change >= 0 ? '+' : ''}${change}%`}
                sx={{
                  bgcolor: change >= 0 ? '#DCFCE7' : '#FEE2E2',
                  color: change >= 0 ? '#16A34A' : '#DC2626',
                  fontWeight: 600,
                  fontSize: 11,
                  height: 22,
                  '& .MuiChip-icon': { color: 'inherit' },
                }}
              />
            )}
            {subtitle && (
              <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
            )}
          </Box>
        </>
      )}
    </CardContent>
  </Card>
);

interface RevenueCardsProps {
  data: RevenueOverview | null;
  loading?: boolean;
}

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(n);
const fmtNum = (n: number) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(n);

const RevenueCards: React.FC<RevenueCardsProps> = ({ data, loading }) => {
  const cards: MetricCardProps[] = [
    {
      title: 'Monthly Recurring Revenue',
      value: data ? fmt(data.totalMRR) : '—',
      change: data?.mrrGrowth,
      subtitle: 'vs last month',
      icon: <AttachMoneyIcon fontSize="small" />,
      color: '#6366F1',
    },
    {
      title: 'Annual Recurring Revenue',
      value: data ? fmt(data.totalARR) : '—',
      change: data?.arrGrowth,
      subtitle: 'vs last year',
      icon: <TrendingUpIcon fontSize="small" />,
      color: '#10B981',
    },
    {
      title: 'Active Tenants',
      value: data ? fmtNum(data.activeTenants) : '—',
      subtitle: `+${data?.newTenantsThisMonth ?? 0} this month`,
      icon: <PeopleAltIcon fontSize="small" />,
      color: '#F59E0B',
    },
    {
      title: 'Avg Revenue / Tenant',
      value: data ? fmt(data.avgRevenuePerTenant) : '—',
      subtitle: 'per month',
      icon: <SpeedIcon fontSize="small" />,
      color: '#EC4899',
    },
    {
      title: 'Net Revenue Retention',
      value: data ? `${data.netRevenueRetention}%` : '—',
      subtitle: 'trailing 12 months',
      icon: <TrendingUpIcon fontSize="small" />,
      color: '#14B8A6',
    },
    {
      title: 'New Tenants This Month',
      value: data ? `${data.newTenantsThisMonth}` : '—',
      subtitle: `${data?.churnedTenantsThisMonth ?? 0} churned`,
      icon: <PersonAddIcon fontSize="small" />,
      color: '#8B5CF6',
    },
  ];

  return (
    <Grid container spacing={2.5}>
      {cards.map(card => (
        <Grid item xs={12} sm={6} md={4} key={card.title}>
          <MetricCard {...card} loading={loading} />
        </Grid>
      ))}
    </Grid>
  );
};

export default RevenueCards;