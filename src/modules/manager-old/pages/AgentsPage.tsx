import React, { useEffect } from 'react';
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
  IconButton,
  Chip,
  Button,
  Avatar,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Search,
  PersonAddOutlined,
  EditOutlined,
  MoreVert,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchAgentsList } from '../services/managerSlice';

const AgentsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { agents, loading } = useSelector((state: RootState) => state.manager);

  useEffect(() => {
    dispatch(fetchAgentsList());
  }, [dispatch]);

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Agent Management
          </Typography>
          <Typography color="text.secondary">
            Manage your team of agents and monitor their productivity.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddOutlined />}
          sx={{ borderRadius: 2, px: 3, py: 1, fontWeight: 700 }}
        >
          Invite Agent
        </Button>
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search agents..."
              sx={{ width: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Agent Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Active Leads</TableCell>
                  <TableCell align="center">Bookings</TableCell>
                  <TableCell>Joined Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow key={agent.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.soft', color: 'primary.main', fontWeight: 700 }}>
                          {agent.name[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{agent.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{agent.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={agent.status}
                        size="small"
                        color={agent.status === 'ACTIVE' ? 'success' : 'default'}
                        variant="outlined"
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={700}>{agent._count.ownedLeads}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={700}>{agent._count.bookings}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(agent.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small">
                        <EditOutlined fontSize="small" />
                      </IconButton>
                      <IconButton size="small">
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AgentsPage;
