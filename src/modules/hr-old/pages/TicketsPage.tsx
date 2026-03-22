import React from 'react';
import { Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';

const tickets = [
  { id: '1', title: 'Payroll discrepancy', user: 'Jane Smith', status: 'OPEN', priority: 'HIGH' },
  { id: '2', title: 'Laptop screen flickering', user: 'John Doe', status: 'RESOLVED', priority: 'MEDIUM' },
];

const TicketsPage: React.FC = () => {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>HR Support Tickets</Typography>
        <Typography variant="body1" color="text.secondary">Internal issues raised by employees.</Typography>
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'var(--bg-subtle)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Ticket</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Opened By</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets.map((t) => (
                <TableRow key={t.id}>
                  <TableCell sx={{ fontWeight: 600 }}>{t.title}</TableCell>
                  <TableCell>{t.user}</TableCell>
                  <TableCell>
                    <Chip label={t.priority} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={t.status} 
                      size="small" 
                      color={t.status === 'OPEN' ? 'error' : 'success'} 
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small">View</Button>
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

import { Button } from '@mui/material';
export default TicketsPage;
