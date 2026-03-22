import React from 'react';
import { Card, CardContent, CardHeader, Skeleton, useTheme } from '@mui/material';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend
} from 'recharts';
import type { UsageMetric } from './superadminSlice';

interface UsageChartProps {
    data: UsageMetric[] | undefined;
    loading?: boolean;
}

const UsageChart: React.FC<UsageChartProps> = ({ data, loading }) => {
    const theme = useTheme();
    const fmt = (v: number | string | undefined) => {
        if (v === undefined || v === null) return '0';
        const num = typeof v === 'string' ? parseFloat(v) : v;
        if (isNaN(num)) return '0';
        return new Intl.NumberFormat('en-US', { notation: 'compact' }).format(num);
    };

    return (
        <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <CardHeader
                title="Platform Usage"
                subheader="API calls, active users, AI conversations & telephony calls"
                titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                subheaderTypographyProps={{ variant: 'body2' }}
                sx={{ pb: 0 }}
            />
            <CardContent>
                {loading ? (
                    <Skeleton variant="rectangular" width="100%" height={260} sx={{ borderRadius: 1 }} />
                ) : (
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                {[
                                    { id: 'apiCalls', color: '#6366F1' },
                                    { id: 'activeUsers', color: '#10B981' },
                                    { id: 'aiConversations', color: '#F59E0B' },
                                    { id: 'telephonyCalls', color: '#EC4899' },
                                ].map(({ id, color }) => (
                                    <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                            <XAxis dataKey="date" tick={{ fontSize: 12, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                            <YAxis tickFormatter={fmt} tick={{ fontSize: 12, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                            <Tooltip formatter={(v: any) => fmt(v)} />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                            <Area type="monotone" dataKey="apiCalls" name="API Calls" stroke="#6366F1" fill="url(#apiCalls)" strokeWidth={2} />
                            <Area type="monotone" dataKey="activeUsers" name="Active Users" stroke="#10B981" fill="url(#activeUsers)" strokeWidth={2} />
                            <Area type="monotone" dataKey="aiConversations" name="AI Conversations" stroke="#F59E0B" fill="url(#aiConversations)" strokeWidth={2} />
                            <Area type="monotone" dataKey="telephonyCalls" name="Telephony Calls" stroke="#EC4899" fill="url(#telephonyCalls)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
};

export default UsageChart;