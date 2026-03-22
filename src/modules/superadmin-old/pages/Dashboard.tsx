import React, { useEffect } from 'react';
import {
    Box, Typography, Grid, Card, CardContent, CardHeader, Table,
    TableBody, TableCell, TableHead, TableRow, Chip, Avatar, Skeleton,
    Alert, AlertTitle
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useAppDispatch, useSuperAdmin } from '../../../redux/hooks';
import { fetchRevenueOverview, fetchAnalytics, PlanType } from './superadminSlice';
import RevenueCards from '../components/RevenueCards';
import RevenueChart from '../components/RevenueChart';
import ProfitChart from '../components/ProfitChart';
import UsageChart from '../components/UsageChart';

const planColors: Record<PlanType, string> = {
    starter: '#10B981',
    professional: '#6366F1',
    enterprise: '#F59E0B',
    custom: '#EC4899',
};

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(n);

const DashboardPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { revenueOverview, analyticsData, loading, errors } = useSuperAdmin();

    useEffect(() => {
        dispatch(fetchRevenueOverview());
        dispatch(fetchAnalytics());
    }, [dispatch]);

    const isLoading = loading.revenueOverview || loading.analytics;

    return (
        <Box>
            {/* Header */}
            <Box mb={3}>
                <Typography variant="h5" fontWeight={700} color="text.primary">Dashboard</Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                    Platform overview and key metrics
                </Typography>
            </Box>

            {/* Revenue Cards */}
            <RevenueCards data={revenueOverview} loading={loading.revenueOverview} />

            {(errors.analytics || errors.revenueOverview) && (
                <Alert severity="error" sx={{ mt: 3, mb: 1 }}>
                    <AlertTitle>Error Loading Data</AlertTitle>
                    {errors.analytics || errors.revenueOverview || "Failed to fetch dashboard data. Please check your connection."}
                </Alert>
            )}

            {/* Charts Row */}
            <Grid container spacing={3} mt={0.5}>
                <Grid item xs={12} md={8}>
                    <RevenueChart data={analyticsData?.revenueTrend} loading={loading.analytics} />
                </Grid>
                <Grid item xs={12} md={4}>
                    <ProfitChart data={analyticsData?.revenueByPlan} loading={loading.analytics} />
                </Grid>
            </Grid>

            {/* Top Tenants */}
            <Card sx={{ mt: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <CardHeader
                    title="Top Profitable Tenants"
                    subheader="Ranked by monthly recurring revenue"
                    titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                    subheaderTypographyProps={{ variant: 'body2' }}
                />
                <CardContent sx={{ pt: 0 }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ '& th': { bgcolor: '#F9FAFB', fontWeight: 600, fontSize: 11, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 } }}>
                                <TableCell>#</TableCell>
                                <TableCell>Tenant</TableCell>
                                <TableCell>Plan</TableCell>
                                <TableCell align="right">MRR</TableCell>
                                <TableCell align="right">Growth</TableCell>
                                <TableCell>Seats</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading
                                ? Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        {Array.from({ length: 7 }).map((_, j) => (
                                            <TableCell key={j}><Skeleton height={20} /></TableCell>
                                        ))}
                                    </TableRow>
                                ))
                                : analyticsData?.topTenants.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            <Box py={4}>
                                                <Typography variant="body2" color="text.secondary">No tenant data available for this period</Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ) : analyticsData?.topTenants.map((tenant, index) => (
                                    <TableRow key={tenant.id} hover sx={{ cursor: 'pointer' }}>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600} color="text.secondary">{index + 1}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{ width: 30, height: 30, bgcolor: planColors[tenant.plan] + '22', color: planColors[tenant.plan], fontSize: 12, fontWeight: 700 }}>
                                                    {tenant.name[0]}
                                                </Avatar>
                                                <Typography variant="body2" fontWeight={500}>{tenant.name}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={tenant.plan} size="small" sx={{ bgcolor: planColors[tenant.plan] + '18', color: planColors[tenant.plan], fontWeight: 600, textTransform: 'capitalize', fontSize: 11 }} />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2" fontWeight={700}>{fmt(tenant.mrr)}</Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                                                {tenant.growth >= 0
                                                    ? <TrendingUpIcon sx={{ fontSize: 14, color: '#16A34A' }} />
                                                    : <TrendingDownIcon sx={{ fontSize: 14, color: '#DC2626' }} />}
                                                <Typography variant="body2" fontWeight={600} color={tenant.growth >= 0 ? '#16A34A' : '#DC2626'}>
                                                    {tenant.growth >= 0 ? '+' : ''}{tenant.growth}%
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{tenant.seats}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={tenant.status}
                                                size="small"
                                                sx={{
                                                    bgcolor: tenant.status === 'active' ? '#DCFCE7' : '#FEF9C3',
                                                    color: tenant.status === 'active' ? '#16A34A' : '#CA8A04',
                                                    fontWeight: 600, fontSize: 11, textTransform: 'capitalize'
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </Box>
    );
};

export default DashboardPage;