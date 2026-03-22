import React, { useEffect } from 'react';
import { Box, Typography, Grid, Skeleton } from '@mui/material';
import { useAppDispatch, useSuperAdmin } from '../../../redux/hooks';
import { fetchAnalytics, fetchRevenueOverview } from './superadminSlice';
import RevenueCards from '../components/RevenueCards';
import RevenueChart from '../components/RevenueChart';
import ProfitChart from '../components/ProfitChart';
import UsageChart from '../components/UsageChart';

const Analytics: React.FC = () => {
  const dispatch = useAppDispatch();
  const { revenueOverview, analyticsData, loading } = useSuperAdmin();

  useEffect(() => {
    dispatch(fetchRevenueOverview());
    dispatch(fetchAnalytics());
  }, [dispatch]);

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700}>Analytics</Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>Platform-wide metrics and trends</Typography>
      </Box>

      <RevenueCards data={revenueOverview} loading={loading.revenueOverview} />

      <Grid container spacing={3} mt={0.5}>
        <Grid item xs={12}>
          <RevenueChart data={analyticsData?.revenueTrend} loading={loading.analytics} />
        </Grid>
        <Grid item xs={12} md={8}>
          <UsageChart data={analyticsData?.usageMetrics} loading={loading.analytics} />
        </Grid>
        <Grid item xs={12} md={4}>
          <ProfitChart data={analyticsData?.revenueByPlan} loading={loading.analytics} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;