import React, { useEffect } from 'react';
import {
    Box, Typography, Grid, Card, CardContent, CardHeader,
    Table, TableBody, TableCell, TableHead, TableRow, Chip, Button, Skeleton
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useAppDispatch, useSuperAdmin } from '../../../redux/hooks';
import { fetchBillingStatements, fetchRevenueOverview } from './superadminSlice';

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR', notation: 'compact', maximumFractionDigits: 0 }).format(n);

const Billing: React.FC = () => {
    const dispatch = useAppDispatch();
    const { billingStatements, revenueOverview, loading } = useSuperAdmin();

    useEffect(() => {
        dispatch(fetchBillingStatements());
        dispatch(fetchRevenueOverview());
    }, [dispatch]);

    const stats = [
        { label: 'Current Month Revenue', value: fmt(Number(revenueOverview?.totalRevenue || 0)), sub: revenueOverview?.profitMargin + ' Margin', color: '#6366F1' },
        { label: 'Total Invoices', value: revenueOverview?.totalInvoices || 0, sub: 'In system', color: '#F59E0B' },
        { label: 'Total Profit', value: fmt(Number(revenueOverview?.totalProfit || 0)), sub: 'Net profit', color: '#14B8A6' },
        { label: 'Total Cost', value: fmt(Number(revenueOverview?.totalCost || 0)), sub: 'System usage', color: '#EF4444' },
    ];

    return (
        <Box>
            <Box mb={3}>
                <Typography variant="h5" fontWeight={700}>Billing</Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>Platform revenue and invoicing overview</Typography>
            </Box>

            <Grid container spacing={2.5} mb={3}>
                {stats.map(c => (
                    <Grid item xs={6} md={3} key={c.label}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h5" fontWeight={700} color={c.color}>
                                    {loading.revenueOverview ? <Skeleton width={80} /> : c.value}
                                </Typography>
                                <Typography variant="body2" fontWeight={500} mt={0.5}>{c.label}</Typography>
                                <Typography variant="caption" color="text.secondary">{c.sub}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <CardHeader
                    title="Monthly Statements"
                    titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                    action={<Button variant="outlined" startIcon={<DownloadIcon />} size="small">Export All</Button>}
                />
                <Table>
                    <TableHead>
                        <TableRow sx={{ '& th': { fontWeight: 600, fontSize: 12, color: 'text.secondary', textTransform: 'uppercase', bgcolor: '#F9FAFB', letterSpacing: 0.5 } }}>
                            <TableCell>Statement ID</TableCell>
                            <TableCell>Period</TableCell>
                            <TableCell align="right">Active Tenants</TableCell>
                            <TableCell align="right">Total Revenue</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="center">Download</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading.billing ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={6}><Skeleton height={40} /></TableCell>
                                </TableRow>
                            ))
                        ) : billingStatements.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <Box py={4}>
                                        <Typography variant="body2" color="text.secondary">No statements found</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : billingStatements.map(stmt => (
                            <TableRow key={stmt.id} hover>
                                <TableCell><Typography variant="body2" fontWeight={600} fontFamily="monospace">{stmt.id}</Typography></TableCell>
                                <TableCell><Typography variant="body2">{stmt.period}</Typography></TableCell>
                                <TableCell align="right"><Typography variant="body2">{stmt.tenants}</Typography></TableCell>
                                <TableCell align="right"><Typography variant="body2" fontWeight={600}>{fmt(stmt.revenue)}</Typography></TableCell>
                                <TableCell>
                                    <Chip label={stmt.status} size="small" sx={{
                                        bgcolor: stmt.status === 'finalized' ? '#DCFCE7' : '#FEF9C3',
                                        color: stmt.status === 'finalized' ? '#16A34A' : '#CA8A04',
                                        fontWeight: 600, fontSize: 11, textTransform: 'capitalize',
                                    }} />
                                </TableCell>
                                <TableCell align="center">
                                    <Button size="small" startIcon={<DownloadIcon sx={{ fontSize: 14 }} />} sx={{ fontSize: 11 }}>PDF</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </Box>
    );
};

export default Billing;