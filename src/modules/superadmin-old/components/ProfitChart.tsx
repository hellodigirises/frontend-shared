import React from 'react';
import { Card, CardContent, CardHeader, Box, Typography, Skeleton, Stack } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, TooltipContentProps } from 'recharts';
import type { RevenueByPlan } from './superadminSlice';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EC4899'];

const CustomTooltip: React.FC<TooltipContentProps<number, string>> = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload as RevenueByPlan;
    const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(n);
    return (
        <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 1.5, boxShadow: 3 }}>
            <Typography fontWeight={600} fontSize={13}>{d.plan}</Typography>
            <Typography fontSize={12} color="text.secondary">{fmt(d.revenue)} · {d.tenants} tenants</Typography>
        </Box>
    );
};

interface ProfitChartProps {
    data: RevenueByPlan[] | undefined;
    loading?: boolean;
}

const ProfitChart: React.FC<ProfitChartProps> = ({ data, loading }) => {
    const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 0 }).format(n);

    return (
        <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', height: '100%' }}>
            <CardHeader
                title="Revenue by Plan"
                subheader="Distribution of MRR across plans"
                titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                subheaderTypographyProps={{ variant: 'body2' }}
                sx={{ pb: 0 }}
            />
            <CardContent>
                {loading ? (
                    <Skeleton variant="circular" width={180} height={180} sx={{ mx: 'auto' }} />
                ) : (
                    <>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={85}
                                    paddingAngle={3}
                                    dataKey="revenue"
                                >
                                    {data?.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={CustomTooltip} />
                            </PieChart>
                        </ResponsiveContainer>
                        <Stack spacing={1} mt={1}>
                            {data?.map((item, i) => (
                                <Box key={item.plan} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: COLORS[i % COLORS.length], flexShrink: 0 }} />
                                        <Typography variant="body2" color="text.secondary">{item.plan}</Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="body2" fontWeight={600}>{fmt(item.revenue)}</Typography>
                                        <Typography variant="caption" color="text.secondary">{item.percentage}% · {item.tenants} tenants</Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Stack>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default ProfitChart;