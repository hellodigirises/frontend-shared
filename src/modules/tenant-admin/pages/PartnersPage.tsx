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
  Avatar,
  CircularProgress,
  IconButton
} from '@mui/material';
import { HandshakeOutlined, AddOutlined, VisibilityOutlined } from '@mui/icons-material';
import api from '../../../api/axios';

interface Partner {
  id: string;
  name: string;
  type: string;
  commissionRate: number;
  totalLeads: number;
  totalBookings: number;
}

const PartnersPage: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Mocking for now as specific partner endpoints might be in a separate service
      await api.get('/reports/dashboard'); // Keep tenant-aware API check aligned with mounted backend routes
      setPartners([
        { id: '1', name: 'Elite Realty', type: 'AGENCY', commissionRate: 2.5, totalLeads: 45, totalBookings: 8 },
        { id: '2', name: 'John Doe Partners', type: 'INDIVIDUAL', commissionRate: 1.5, totalLeads: 12, totalBookings: 2 }
      ]);
    } catch (error) {
      console.error('Error fetching partners:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h3" fontWeight={800} letterSpacing={-1.5}>Channel Partners</Typography>
          <Typography variant="body1" color="text.secondary">Manage external agency and individual partners.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddOutlined />} sx={{ borderRadius: 4, fontWeight: 700 }}>Add Partner</Button>
      </Stack>

      <Card variant="outlined" sx={{ borderRadius: 6, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 700 }}>Partner Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Commission</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Total Leads</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Total Bookings</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {partners.map((partner) => (
                <TableRow key={partner.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.50', color: 'primary.main' }}>
                         <HandshakeOutlined />
                      </Avatar>
                      <Typography variant="body2" fontWeight={700}>{partner.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={partner.type} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: 10 }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700}>{partner.commissionRate}%</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{partner.totalLeads}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{partner.totalBookings}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small"><VisibilityOutlined fontSize="small" /></IconButton>
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

export default PartnersPage;
