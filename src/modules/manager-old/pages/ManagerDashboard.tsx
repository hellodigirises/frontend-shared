import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchTeamStats, fetchTopAgents } from '../services/managerSlice';
import ManagerStatsCards from '../components/ManagerStatsCards';

const ManagerDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { teamStats, topAgents, loading } = useSelector((state: RootState) => state.manager);

  useEffect(() => {
    dispatch(fetchTeamStats());
    dispatch(fetchTopAgents());
  }, [dispatch]);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Team Overview
        </Typography>
        <Typography color="text.secondary">
          Track agent performance and sales pipeline across your team.
        </Typography>
      </Box>

      <ManagerStatsCards stats={teamStats} loading={loading.stats} />

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} lg={8}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Top Performing Agents
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Agent</TableCell>
                      <TableCell align="center">Bookings</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topAgents.map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', fontSize: 14 }}>{agent.name[0]}</Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>{agent.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{agent.email}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Typography fontWeight={700}>{agent.bookingsCount}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip label="TOP PERFORMER" size="small" variant="outlined" color="success" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Recent Team Activity
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Activity feed coming soon...
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ManagerDashboard;
