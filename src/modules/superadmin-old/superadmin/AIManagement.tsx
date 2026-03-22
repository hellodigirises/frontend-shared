import React, { useEffect } from 'react';
import {
  Box, Typography, Grid, Card, Table, TableBody, TableCell,
  TableHead, TableRow, Stack, Avatar, Button
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { AddOutlined } from '@mui/icons-material';
import { useAppDispatch, useSuperAdmin } from '../../../redux/hooks';
import { fetchAIAgents } from './superadminSlice';

const FONT = "'Clash Display', 'Outfit', sans-serif";
const BODY = "'Cabinet Grotesk', 'DM Sans', sans-serif";
const BRAND = '#00d4aa';
const WARN = '#f59e0b';

const DS: React.FC<{ h?: number; w?: string | number }> = ({ h = 16, w = '100%' }) => (
  <Box sx={{
    height: h, width: w, borderRadius: 1.5, bgcolor: '#1e2630',
    animation: 'pulse 1.5s ease-in-out infinite',
    '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.35 } }
  }} />
);

const typeColors: Record<string, string> = {
  sales: '#7c6ff7', support: BRAND, lead: WARN,
  faq: '#ec4899', onboarding: '#60a5fa',
};

const AIManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { aiAgents, loading } = useSuperAdmin();

  useEffect(() => { dispatch(fetchAIAgents()); }, [dispatch]);

  const totalConversations = aiAgents.reduce((s, a) => s + a.totalConversations, 0);
  const activeCount = aiAgents.filter(a => a.status === 'active').length;
  const avgAccuracy = aiAgents.length > 0
    ? aiAgents.reduce((s, a) => s + a.accuracy, 0) / aiAgents.length
    : 0;

  const statusCfg = (s: string) => ({
    active: { color: BRAND, bg: BRAND + '14', dot: BRAND, label: 'Active' },
    training: { color: WARN, bg: WARN + '14', dot: WARN, label: 'Training' },
    inactive: { color: '#4b5563', bg: '#1e2630', dot: '#4b5563', label: 'Inactive' },
  }[s] ?? { color: '#4b5563', bg: '#1e2630', dot: '#4b5563', label: s });

  return (
    <Box sx={{ bgcolor: '#080b10', minHeight: '100vh', pb: 8, fontFamily: BODY }}>

      {/* ── Header ── */}
      <Box sx={{ px: { xs: 3, md: 5 }, pt: 5, pb: 4, borderBottom: '1px solid #1e2630', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', bgcolor: '#7c6ff708', filter: 'blur(50px)', pointerEvents: 'none' }} />
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'flex-end' }} spacing={3} sx={{ position: 'relative' }}>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
              <Box sx={{ px: 1.5, py: 0.4, borderRadius: 1.5, bgcolor: '#7c6ff718', border: '1px solid #7c6ff730' }}>
                <Typography sx={{ fontFamily: BODY, fontSize: 10, fontWeight: 800, color: '#7c6ff7', textTransform: 'uppercase', letterSpacing: 1.2 }}>
                  AI Platform
                </Typography>
              </Box>
            </Stack>
            <Typography sx={{ fontFamily: FONT, fontSize: 36, fontWeight: 700, color: 'white', letterSpacing: -1.8, lineHeight: 1 }}>
              AI Agents
            </Typography>
            <Typography sx={{ fontFamily: BODY, fontSize: 13, color: '#4b5563', mt: 0.8 }}>
              All AI agents across platform tenants
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddOutlined />}
            sx={{ textTransform: 'none', fontWeight: 800, fontFamily: BODY, borderRadius: 2.5, bgcolor: '#7c6ff7', color: '#fff', '&:hover': { filter: 'brightness(0.9)' }, boxShadow: '0 4px 14px #7c6ff730' }}>
            Create Agent
          </Button>
        </Stack>
      </Box>

      <Box sx={{ px: { xs: 3, md: 5 }, pt: 4 }}>

        {/* ── Summary tiles ── */}
        <Grid container spacing={2.5} mb={4}>
          {[
            { label: 'Total Agents', value: loading.aiAgents ? null : aiAgents.length, color: '#7c6ff7' },
            { label: 'Active', value: loading.aiAgents ? null : activeCount, color: BRAND },
            { label: 'Total Conversations', value: loading.aiAgents ? null : new Intl.NumberFormat('en-US', { notation: 'compact' }).format(totalConversations), color: '#60a5fa' },
            { label: 'Avg Accuracy', value: loading.aiAgents ? null : `${avgAccuracy.toFixed(1)}%`, color: WARN },
          ].map(c => (
            <Grid item xs={6} sm={3} key={c.label}>
              <Card sx={{
                p: 3, borderRadius: 3, bgcolor: '#0d1117', border: `1px solid ${c.color}20`,
                boxShadow: 'none', position: 'relative', overflow: 'hidden',
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-2px)', borderColor: c.color + '50', boxShadow: `0 8px 24px ${c.color}10` }
              }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, bgcolor: c.color }} />
                <Typography sx={{ fontFamily: BODY, fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: 1 }}>
                  {c.label}
                </Typography>
                {c.value === null
                  ? <Box sx={{ mt: 0.8 }}><DS h={26} w={60} /></Box>
                  : <Typography sx={{ fontFamily: FONT, fontSize: 28, fontWeight: 700, color: c.color, letterSpacing: -1.2, lineHeight: 1, mt: 0.6 }}>
                    {c.value}
                  </Typography>
                }
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* ── Agents Table ── */}
        <Card sx={{ borderRadius: 3, bgcolor: '#0d1117', border: '1px solid #1e2630', boxShadow: 'none', overflow: 'hidden' }}>
          <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #1e2630' }}>
            <Typography sx={{ fontFamily: BODY, fontWeight: 800, fontSize: 14, color: 'white' }}>All AI Agents</Typography>
            {!loading.aiAgents && (
              <Typography sx={{ fontFamily: BODY, fontSize: 11.5, color: '#4b5563', mt: 0.2 }}>
                {aiAgents.length} agent{aiAgents.length !== 1 ? 's' : ''} · {activeCount} active
              </Typography>
            )}
          </Box>

          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#080b10' }}>
                {['Agent', 'Tenant', 'Status', 'Today', 'Total', 'Accuracy', 'Resp. Time'].map((h, i) => (
                  <TableCell key={h} align={i >= 3 ? 'right' : 'left'}
                    sx={{ fontWeight: 800, fontSize: 10.5, color: '#4b5563', textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: BODY, py: 1.8, borderBottom: '1px solid #1e2630' }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading.aiAgents
                ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} sx={{ '& td': { borderBottom: '1px solid #1e2630' } }}>
                    {[180, 120, 80, 50, 60, 160, 70].map((w, j) => (
                      <TableCell key={j} sx={{ py: 2 }}><DS h={14} w={w} /></TableCell>
                    ))}
                  </TableRow>
                ))
                : aiAgents.map(agent => {
                  const sc = statusCfg(agent.status);
                  const tc = typeColors[agent.type] || '#7c6ff7';
                  return (
                    <TableRow key={agent.id} hover
                      sx={{ '& td': { py: 1.8, borderBottom: '1px solid #1e2630', fontFamily: BODY }, '&:hover': { bgcolor: '#111827' }, transition: 'background 0.12s' }}>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar sx={{ width: 36, height: 36, bgcolor: tc + '20', color: tc, flexShrink: 0 }}>
                            <SmartToyIcon sx={{ fontSize: 17 }} />
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 800, fontSize: 13, color: 'white', fontFamily: BODY }}>{agent.name}</Typography>
                            <Box sx={{ display: 'inline-flex', px: 1, py: 0.2, borderRadius: 1, bgcolor: tc + '18', mt: 0.3 }}>
                              <Typography sx={{ fontFamily: BODY, fontSize: 9.5, fontWeight: 800, color: tc, textTransform: 'capitalize' }}>{agent.type}</Typography>
                            </Box>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontFamily: BODY, fontSize: 12.5, color: '#4b5563' }}>{agent.tenantName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6, px: 1.2, py: 0.4, borderRadius: 1.5, bgcolor: sc.bg }}>
                          <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: sc.dot }} />
                          <Typography sx={{ fontFamily: BODY, fontSize: 10.5, fontWeight: 800, color: sc.color, textTransform: 'capitalize' }}>{sc.label}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography sx={{ fontFamily: BODY, fontSize: 13, fontWeight: 700, color: '#9ca3af' }}>{agent.conversationsToday}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography sx={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: '#7c6ff7', letterSpacing: -0.3 }}>
                          {agent.totalConversations.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1.2} alignItems="center" justifyContent="flex-end">
                          <Box sx={{ width: 60, height: 6, borderRadius: 3, bgcolor: '#1e2630', overflow: 'hidden', flexShrink: 0 }}>
                            <Box sx={{ height: '100%', width: `${agent.accuracy}%`, bgcolor: agent.accuracy > 90 ? BRAND : WARN, borderRadius: 3, transition: 'width 0.5s ease' }} />
                          </Box>
                          <Typography sx={{ fontFamily: BODY, fontSize: 11.5, fontWeight: 800, color: agent.accuracy > 90 ? BRAND : WARN, minWidth: 38 }}>
                            {agent.accuracy}%
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Typography sx={{ fontFamily: BODY, fontSize: 13, color: '#4b5563' }}>{agent.avgResponseTime}s</Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </Card>
      </Box>
    </Box>
  );
};

export default AIManagement;