import React from 'react';
import { Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip } from '@mui/material';

const leaveRequests = [
  { id: '1', name: 'John Doe', type: 'SICK', start: '2026-03-15', end: '2026-03-16', status: 'PENDING' },
  { id: '2', name: 'Jane Smith', type: 'CASUAL', start: '2026-03-20', end: '2026-03-22', status: 'APPROVED' },
];

const LeavesPage: React.FC = () => {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>Leave Requests</Typography>
        <Typography variant="body1" color="text.secondary">Review and approve employee leave applications.</Typography>
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'var(--bg-subtle)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaveRequests.map((row) => (
                <TableRow key={row.id}>
                  <TableCell sx={{ fontWeight: 600 }}>{row.name}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{row.start} to {row.end}</TableCell>
                  <TableCell>
                    <Chip 
                      label={row.status} 
                      size="small" 
                      color={row.status === 'APPROVED' ? 'success' : row.status === 'PENDING' ? 'warning' : 'error'} 
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {row.status === 'PENDING' && (
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button size="small" variant="contained" color="success">Approve</Button>
                        <Button size="small" variant="outlined" color="error">Reject</Button>
                      </Box>
                    )}
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

export default LeavesPage;
