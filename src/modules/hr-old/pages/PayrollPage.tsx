import React from 'react';
import { Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material';

const payrollHistory = [
  { id: '1', month: 'February 2026', total: '$120,500', status: 'PAID' },
  { id: '2', month: 'January 2026', total: '$118,200', status: 'PAID' },
];

const PayrollPage: React.FC = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Payroll</Typography>
          <Typography variant="body1" color="text.secondary">Generate payslips and track salary payouts.</Typography>
        </Box>
        <Button variant="contained" sx={{ borderRadius: 3 }}>Generate March Payroll</Button>
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'var(--bg-subtle)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Billing Cycle</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Total Payout</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payrollHistory.map((row) => (
                <TableRow key={row.id}>
                  <TableCell sx={{ fontWeight: 600 }}>{row.month}</TableCell>
                  <TableCell>{row.total}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="success.main" fontWeight={600}>{row.status}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small">Download PDF</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default PayrollPage;
