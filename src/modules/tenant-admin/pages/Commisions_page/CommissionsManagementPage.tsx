import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  IconButton,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
} from '@mui/material';
import {
  MonetizationOnOutlined,
  CheckCircleOutlined,
  CancelOutlined,
  PaymentOutlined,
  ReceiptLongOutlined,
} from '@mui/icons-material';
import api from '../../../../api/axios';

interface Commission {
  id: string;
  commissionAmount: number;
  payoutStatus: string;
  createdAt: string;
  partner: {
    name: string;
    companyName?: string;
  };
  booking: {
    customerName: string;
    amount: number;
    bookingDate: string;
  };
  rule?: {
    name: string;
    ruleType: string;
  };
}

interface CommissionStats {
  totalCommission: number;
  byStatus: Array<{
    status: string;
    count: number;
    amount: number;
  }>;
}

const CommissionsManagementPage: React.FC = () => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [stats, setStats] = useState<CommissionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [openPayoutDialog, setOpenPayoutDialog] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const [payoutData, setPayoutData] = useState({
    paymentMode: 'BANK_TRANSFER',
    transactionRef: '',
  });

  const fetchData = async () => {
    try {
      const [commissionsRes, analyticsRes] = await Promise.all([
        api.get('/commissions', {
          params: statusFilter !== 'all' ? { payoutStatus: statusFilter.toUpperCase() } : {},
        }),
        api.get('/commissions/analytics'),
      ]);
      setCommissions(commissionsRes.data.data || []);
      setStats(analyticsRes.data);
    } catch (error) {
      console.error('Error fetching commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/commissions/${id}/approve`, {
        notes: 'Approved by admin',
      });
      fetchData();
    } catch (error) {
      console.error('Error approving commission:', error);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await api.patch(`/commissions/${id}/reject`, {
        rejectionReason: reason,
      });
      fetchData();
    } catch (error) {
      console.error('Error rejecting commission:', error);
    }
  };

  const handleMarkPaid = async () => {
    if (!selectedCommission) return;

    try {
      await api.patch(`/commissions/${selectedCommission.id}/mark-paid`, payoutData);
      setOpenPayoutDialog(false);
      setSelectedCommission(null);
      fetchData();
    } catch (error) {
      console.error('Error marking commission as paid:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'APPROVED':
        return 'info';
      case 'PENDING':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`;
    }
    return `₹${(amount / 1000).toFixed(1)}K`;
  };

  const getStatusAmount = (status: string) => {
    return stats?.byStatus.find((s) => s.status === status)?.amount || 0;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight={800} letterSpacing={-1.5}>
          Commission Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track, approve, and process channel partner payouts
        </Typography>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={3}>
          <Card
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 6,
              border: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              bgcolor: 'primary.50',
            }}
          >
            <Typography variant="caption" fontWeight={700} color="primary.main">
              Total Commission
            </Typography>
            <Typography variant="h4" fontWeight={800} color="primary.main">
              {formatCurrency(stats?.totalCommission || 0)}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 6,
              border: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              bgcolor: 'warning.50',
            }}
          >
            <Typography variant="caption" fontWeight={700} color="warning.main">
              Pending Approval
            </Typography>
            <Typography variant="h4" fontWeight={800} color="warning.main">
              {formatCurrency(getStatusAmount('PENDING'))}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 6,
              border: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              bgcolor: 'info.50',
            }}
          >
            <Typography variant="caption" fontWeight={700} color="info.main">
              Approved (Unpaid)
            </Typography>
            <Typography variant="h4" fontWeight={800} color="info.main">
              {formatCurrency(getStatusAmount('APPROVED'))}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 6,
              border: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              bgcolor: 'success.50',
            }}
          >
            <Typography variant="caption" fontWeight={700} color="success.main">
              Paid Out
            </Typography>
            <Typography variant="h4" fontWeight={800} color="success.main">
              {formatCurrency(getStatusAmount('PAID'))}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      <Card
        variant="outlined"
        sx={{ borderRadius: 6, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
          <Tabs
            value={statusFilter}
            onChange={(_, newValue) => setStatusFilter(newValue)}
            sx={{ minHeight: 48 }}
          >
            <Tab label="All" value="all" />
            <Tab label="Pending" value="pending" />
            <Tab label="Approved" value="approved" />
            <Tab label="Paid" value="paid" />
          </Tabs>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 700 }}>Partner</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Booking Amount</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Commission</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Rule Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {commissions.map((commission) => (
                <TableRow key={commission.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700}>
                      {commission.partner.name}
                    </Typography>
                    {commission.partner.companyName && (
                      <Typography variant="caption" color="text.secondary">
                        {commission.partner.companyName}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{commission.booking.customerName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(commission.booking.bookingDate).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700}>
                      {formatCurrency(commission.booking.amount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={800} color="primary.main">
                      {formatCurrency(commission.commissionAmount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={commission.rule?.ruleType || 'N/A'}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: 9, fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={commission.payoutStatus}
                      size="small"
                      color={getStatusColor(commission.payoutStatus) as any}
                      sx={{ fontWeight: 700, fontSize: 10 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      {commission.payoutStatus === 'PENDING' && (
                        <>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleApprove(commission.id)}
                          >
                            <CheckCircleOutlined fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleReject(commission.id)}
                          >
                            <CancelOutlined fontSize="small" />
                          </IconButton>
                        </>
                      )}
                      {commission.payoutStatus === 'APPROVED' && (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => {
                            setSelectedCommission(commission);
                            setOpenPayoutDialog(true);
                          }}
                        >
                          <PaymentOutlined fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton size="small">
                        <ReceiptLongOutlined fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog
        open={openPayoutDialog}
        onClose={() => setOpenPayoutDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Mark Commission as Paid</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Partner: {selectedCommission?.partner.name}
              </Typography>
              <Typography variant="h5" fontWeight={800} color="primary.main">
                {formatCurrency(selectedCommission?.commissionAmount || 0)}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Payment Mode"
                value={payoutData.paymentMode}
                onChange={(e) => setPayoutData({ ...payoutData, paymentMode: e.target.value })}
              >
                <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                <MenuItem value="CHEQUE">Cheque</MenuItem>
                <MenuItem value="UPI">UPI</MenuItem>
                <MenuItem value="CASH">Cash</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Transaction Reference"
                value={payoutData.transactionRef}
                onChange={(e) =>
                  setPayoutData({ ...payoutData, transactionRef: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPayoutDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleMarkPaid}>
            Mark as Paid
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommissionsManagementPage;
