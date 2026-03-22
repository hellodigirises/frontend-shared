import React from 'react';
import { Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';

const attendanceData = [
  { id: '1', name: 'John Doe', date: '2026-03-12', checkIn: '09:05 AM', checkOut: '06:10 PM', status: 'PRESENT' },
  { id: '2', name: 'Jane Smith', date: '2026-03-12', checkIn: '09:15 AM', checkOut: '06:45 PM', status: 'LATE' },
  { id: '3', name: 'Mike Ross', date: '2026-03-12', checkIn: '-', checkOut: '-', status: 'ABSENT' },
];

const AttendancePage: React.FC = () => {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>Attendance Logs</Typography>
        <Typography variant="body1" color="text.secondary">Daily check-in and check-out tracking.</Typography>
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'var(--bg-subtle)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Check-In</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Check-Out</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendanceData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell sx={{ fontWeight: 600 }}>{row.name}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.checkIn}</TableCell>
                  <TableCell>{row.checkOut}</TableCell>
                  <TableCell>
                    <Chip 
                      label={row.status} 
                      size="small" 
                      color={row.status === 'PRESENT' ? 'success' : row.status === 'LATE' ? 'warning' : 'error'} 
                      sx={{ fontWeight: 600 }}
                    />
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

export default AttendancePage;
