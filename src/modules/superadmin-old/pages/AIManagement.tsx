import React, { useEffect } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableHead,
  TableRow, Chip, Avatar, LinearProgress, Skeleton, Button
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useAppDispatch, useSuperAdmin } from '../../../redux/hooks';
import { fetchAIAgents } from './superadminSlice';

const typeColors: Record<string, string> = {
  sales: '#6366F1', support: '#10B981', lead: '#F59E0B',
  faq: '#EC4899', onboarding: '#14B8A6',
};

const AIManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { aiAgents, loading } = useSuperAdmin();

  useEffect(() => { dispatch(fetchAIAgents()); }, [dispatch]);

  const totalConversations = aiAgents.reduce((s, a) => s + a.totalConversations, 0);
  const activeCount = aiAgents.filter(a => a.status === 'active').length;
  const avgAccuracy = aiAgents.length > 0 ? aiAgents.reduce((s, a) => s + a.accuracy, 0) / aiAgents.length : 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>AI Agents</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>All AI agents across platform tenants</Typography>
        </Box>
        <Button variant="contained" sx={{ bgcolor: '#6366F1', '&:hover': { bgcolor: '#4F46E5' } }}>
          + Create Agent
        </Button>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Agents', value: aiAgents.length, icon: '🤖' },
          { label: 'Active', value: activeCount, icon: '✅' },
          { label: 'Total Conversations', value: new Intl.NumberFormat('en-US', { notation: 'compact' }).format(totalConversations), icon: '💬' },
          { label: 'Avg Accuracy', value: `${avgAccuracy.toFixed(1)}%`, icon: '🎯' },
        ].map(card => (
          <Card key={card.label} variant="outlined" sx={{ flex: '1 1 160px', p: 2 }}>
            <Typography fontSize={20}>{card.icon}</Typography>
            <Typography variant="h5" fontWeight={700} mt={0.5}>{card.value}</Typography>
            <Typography variant="caption" color="text.secondary">{card.label}</Typography>
          </Card>
        ))}
      </Box>

      <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 600, fontSize: 12, color: 'text.secondary', textTransform: 'uppercase', bgcolor: '#F9FAFB', letterSpacing: 0.5 } }}>
              <TableCell>Agent</TableCell>
              <TableCell>Tenant</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Today</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell>Accuracy</TableCell>
              <TableCell align="right">Resp. Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading.aiAgents
              ? Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>{Array.from({ length: 7 }).map((_, j) => (<TableCell key={j}><Skeleton height={20} /></TableCell>))}</TableRow>
              ))
              : aiAgents.map(agent => (
                <TableRow key={agent.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: (typeColors[agent.type] || '#6366F1') + '18', color: typeColors[agent.type] || '#6366F1' }}>
                        <SmartToyIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>{agent.name}</Typography>
                        <Chip label={agent.type} size="small" sx={{ bgcolor: (typeColors[agent.type] || '#6366F1') + '18', color: typeColors[agent.type] || '#6366F1', fontSize: 10, height: 18, textTransform: 'capitalize' }} />
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell><Typography variant="body2" color="text.secondary">{agent.tenantName}</Typography></TableCell>
                  <TableCell>
                    <Chip label={agent.status} size="small" sx={{
                      bgcolor: agent.status === 'active' ? '#DCFCE7' : agent.status === 'training' ? '#FEF9C3' : '#F3F4F6',
                      color: agent.status === 'active' ? '#16A34A' : agent.status === 'training' ? '#CA8A04' : '#6B7280',
                      fontWeight: 600, fontSize: 11, textTransform: 'capitalize',
                    }} />
                  </TableCell>
                  <TableCell align="right"><Typography variant="body2">{agent.conversationsToday}</Typography></TableCell>
                  <TableCell align="right"><Typography variant="body2">{agent.totalConversations.toLocaleString()}</Typography></TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress variant="determinate" value={agent.accuracy} sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { bgcolor: agent.accuracy > 90 ? '#10B981' : '#F59E0B' } }} />
                      <Typography variant="caption" minWidth={36}>{agent.accuracy}%</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right"><Typography variant="body2">{agent.avgResponseTime}s</Typography></TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
};

export default AIManagement;