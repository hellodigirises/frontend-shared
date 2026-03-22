import React from 'react';
import { Card, CardContent, CardHeader, Box, Skeleton, useTheme } from '@mui/material';
import {
    ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, TooltipContentProps
} from 'recharts';
import type { RevenueTrend } from './superadminSlice';

const CustomTooltip: React.FC<TooltipContentProps<number, string>> = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(n);
    return (
        <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 1.5, boxShadow: 3 }}>
            <Box sx={{ fontWeight: 600, mb: 1, fontSize: 13 }}>{label}</Box>
            {payload.map((p: any) => (
                <Box key={p.name} sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 12, mb: 0.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.color }} />
                    <span style={{ color: '#6B7280' }}>{p.name}: </span>
                    <span style={{ fontWeight: 600 }}>{fmt(p.value as number)}</span>
                </Box>
            ))}
        </Box>
    );
};

interface RevenueChartProps {
    data: RevenueTrend[] | undefined;
    loading?: boolean;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data, loading }) => {
    const theme = useTheme();
    const fmt = (n: number) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 0 }).format(n);

    return (
        <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <CardHeader
                title="Revenue Trend"
                subheader="Monthly recurring & annual recurring revenue over time"
                titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                subheaderTypographyProps={{ variant: 'body2' }}
                sx={{ pb: 0 }}
            />
            <CardContent>
                {loading ? (
                    <Skeleton variant="rectangular" width="100%" height={280} sx={{ borderRadius: 1 }} />
                ) : (
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                            <XAxis dataKey="month" tick={{ fontSize: 12, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                            <YAxis tickFormatter={fmt} tick={{ fontSize: 12, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                            <Tooltip content={CustomTooltip} />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                            <Line type="monotone" dataKey="mrr" name="MRR" stroke="#6366F1" strokeWidth={2.5} dot={{ r: 4, fill: '#6366F1' }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="newMRR" name="New MRR" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 3" />
                            <Line type="monotone" dataKey="expansionMRR" name="Expansion MRR" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 3" />
                            <Line type="monotone" dataKey="churnMRR" name="Churned MRR" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="3 3" />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
};

export default RevenueChart;