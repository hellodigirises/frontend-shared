import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Stack, Button, TextField, InputAdornment,
  IconButton, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Avatar, Chip, CircularProgress, Alert
} from '@mui/material';
import {
  SearchOutlined, AddOutlined, RefreshOutlined, 
  MoreVertOutlined, VisibilityOutlined, FilterAltOutlined
} from '@mui/icons-material';
import api from '../../../../api/axios';
import { Customer } from './customerTypes';
import CustomerDetailPanel from './CustomerDetailPanel';
import CustomerFormDialog from './CustomerFormDialog';
import { avatarColor, initials } from '../Lead_CRM/crmTypes';

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customers', { params: { search } });
      setCustomers(res.data.data ?? res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={900} sx={{ color: '#1e293b', letterSpacing: -1 }}>
            Customer Directory
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            Manage your buyers and high-value clients
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={() => setFormOpen(true)}
          sx={{ borderRadius: 2.5, px: 3, py: 1, fontWeight: 700, textTransform: 'none', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)' }}
        >
          Add Customer
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 4, mb: 3, border: '1px solid rgba(0,0,0,0.06)', bgcolor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            fullWidth
            placeholder="Search by name, phone or email..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchOutlined /></InputAdornment>,
              sx: { borderRadius: 3, bgcolor: '#fff' }
            }}
          />
          <IconButton onClick={fetchData} sx={{ bgcolor: '#f1f5f9' }}><RefreshOutlined /></IconButton>
        </Stack>
      </Paper>

      {loading ? (
        <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress thickness={5} /></Box>
      ) : customers.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 3 }}>No customers found matching your criteria.</Alert>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Property</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Assigned Agent</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Booking Date</TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((c) => (
                <TableRow key={c.id} hover sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }} onClick={() => setSelectedCustomerId(c.id)}>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar src={c.avatarUrl} sx={{ width: 40, height: 40, bgcolor: avatarColor(c.name), fontWeight: 800, fontSize: 14 }}>
                        {initials(c.name)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={800} color="#1e293b">{c.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{c.source || 'Direct'}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{c.phone}</Typography>
                    <Typography variant="caption" color="text.secondary">{c.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700}>{c.project?.name || 'N/A'}</Typography>
                    <Typography variant="caption" color="text.secondary">{c.unitId ? `Unit: ${c.unitId}` : 'Booking in progress'}</Typography>
                  </TableCell>
                  <TableCell>
                    {c.agent ? (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar src={c.agent.avatarUrl} sx={{ width: 24, height: 24, bgcolor: avatarColor(c.agent.name), fontSize: 10 }}>
                          {initials(c.agent.name)}
                        </Avatar>
                        <Typography variant="caption" fontWeight={700}>{c.agent.name}</Typography>
                      </Stack>
                    ) : <Typography variant="caption" color="text.secondary">Unassigned</Typography>}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {c.bookingDate ? new Date(c.bookingDate).toLocaleDateString() : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small"><MoreVertOutlined /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {selectedCustomerId && (
        <Box sx={{
          position: 'fixed', top: 0, right: 0, width: { xs: '100vw', sm: 500 }, height: '100vh',
          bgcolor: 'background.paper', zIndex: 1300, boxShadow: '-4px 0 24px rgba(0,0,0,.08)'
        }}>
          <CustomerDetailPanel
            customerId={selectedCustomerId}
            onClose={() => setSelectedCustomerId(null)}
            onUpdate={fetchData}
          />
        </Box>
      )}

      <CustomerFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={fetchData}
      />
    </Box>
  );
};

export default CustomersPage;
