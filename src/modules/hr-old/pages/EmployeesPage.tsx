import React from 'react';
import { Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Avatar, Chip } from '@mui/material';
import { AddOutlined } from '@mui/icons-material';

const employees = [
  { id: '1', name: 'John Doe', role: 'Sales Manager', dept: 'Sales', status: 'ACTIVE', join: '2023-01-15' },
  { id: '2', name: 'Jane Smith', role: 'Field Agent', dept: 'Operations', status: 'ACTIVE', join: '2023-02-20' },
  { id: '3', name: 'Mike Ross', role: 'HR specialist', dept: 'HR', status: 'INACTIVE', join: '2022-11-05' },
];

const EmployeesPage: React.FC = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Employees</Typography>
          <Typography variant="body1" color="text.secondary">Manage your workforce and their roles.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddOutlined />} sx={{ borderRadius: 3, px: 3, py: 1.2 }}>
          Add Employee
        </Button>
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'var(--bg-subtle)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Joined On</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>{emp.name[0]}</Avatar>
                      <Typography variant="subtitle2" fontWeight={600}>{emp.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{emp.dept}</TableCell>
                  <TableCell>{emp.role}</TableCell>
                  <TableCell>{emp.join}</TableCell>
                  <TableCell>
                    <Chip 
                      label={emp.status} 
                      size="small" 
                      color={emp.status === 'ACTIVE' ? 'success' : 'default'} 
                      variant="tonal"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" variant="text">Edit</Button>
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

export default EmployeesPage;
