import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  InputAdornment,
  TablePagination,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  SearchOutlined,
  VisibilityOutlined,
  LockOutlined,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchTeamLeads } from '../services/managerSlice';

const STATUS_MAP: Record<string, { label: string; color: any }> = {
  NEW: { label: 'New', color: 'info' },
  CONTACTED: { label: 'Contacted', color: 'primary' },
  QUALIFIED: { label: 'Qualified', color: 'success' },
  SITE_VISIT_SCHEDULED: { label: 'Site Visit', color: 'warning' },
  NEGOTIATION: { label: 'Negotiation', color: 'secondary' },
  CLOSED: { label: 'Closed', color: 'success' },
  LOST: { label: 'Lost', color: 'error' },
};

const LeadsOverview: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { teamLeads, loading } = useSelector((state: RootState) => state.manager);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchTeamLeads({ page: teamLeads.page, limit: teamLeads.limit, search }));
  }, [dispatch, teamLeads.page, teamLeads.limit, search]);

  const handleChangePage = (_: any, newPage: number) => {
    dispatch(fetchTeamLeads({ page: newPage + 1, limit: teamLeads.limit, search }));
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(fetchTeamLeads({ page: 1, limit: parseInt(event.target.value, 10), search }));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h4" fontWeight={800}>Leads Overview</Typography>
        <Typography variant="body2" color="text.secondary">Monitor all leads across the tenant. Contact details are masked for privacy.</Typography>
      </Box>

      <TextField
        placeholder="Search team leads..."
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ maxWidth: 360, bgcolor: 'background.paper', borderRadius: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlined fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  {['Name', 'Contact (Masked)', 'Assigned To', 'Status', 'Created', 'Actions'].map((col) => (
                    <TableCell key={col} sx={{ fontWeight: 700, fontSize: 12, color: 'text.secondary' }}>
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading.leads ? (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6 }}>Loading leads...</TableCell></TableRow>
                ) : teamLeads.data.length === 0 ? (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6 }}>No leads found.</TableCell></TableRow>
                ) : (
                  teamLeads.data.map((lead) => (
                    <TableRow key={lead.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{lead.customerName}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" color="text.secondary">{lead.customerPhone}</Typography>
                          <Tooltip title="Contact details are hidden from managers">
                            <LockOutlined sx={{ fontSize: 14, color: 'text.disabled' }} />
                          </Tooltip>
                        </Box>
                        <Typography variant="caption" color="text.disabled">{lead.customerEmail}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={lead.ownerAgent?.name || 'Unassigned'}
                          size="small"
                          sx={{ fontWeight: 600, bgcolor: 'rgba(0,0,0,0.05)' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={STATUS_MAP[lead.status]?.label || lead.status}
                          color={STATUS_MAP[lead.status]?.color || 'default'}
                          size="small"
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell>{new Date(lead.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <IconButton size="small" color="primary">
                          <VisibilityOutlined fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={teamLeads.total}
            page={teamLeads.page - 1}
            onPageChange={handleChangePage}
            rowsPerPage={teamLeads.limit}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default LeadsOverview;
