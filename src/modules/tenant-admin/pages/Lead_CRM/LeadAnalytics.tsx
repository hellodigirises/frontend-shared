import React, { useMemo } from 'react';
import {
  Box, Typography, Stack, Card, Grid, Paper, Divider,
  Chip, Avatar, LinearProgress, Tooltip
} from '@mui/material';
import {
  Lead, PIPELINE_STAGES, SOURCE_CFG, PRIORITY_CFG,
  avatarColor, initials, fmtBudget
} from './crmTypes';

interface Props {
  leads: Lead[];
}

// ─── Mini Bar Chart ───────────────────────────────────────────────────────────
const BarChart = ({
  data, colorKey = 'color',
}: { data: { label: string; value: number; color: string; icon?: string }[]; colorKey?: string }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <Stack spacing={1.25}>
      {data.map(d => (
        <Stack key={d.label} direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ width: 110, flexShrink: 0 }}>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              {d.icon && <Typography fontSize={14}>{d.icon}</Typography>}
              <Typography variant="caption" fontWeight={700} noWrap>{d.label}</Typography>
            </Stack>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ height: 10, borderRadius: 5, bgcolor: 'grey.100', overflow: 'hidden' }}>
              <Box sx={{
                height: '100%', width: `${Math.round(d.value / max * 100)}%`,
                bgcolor: d.color, borderRadius: 5,
                transition: 'width .6s cubic-bezier(.4,0,.2,1)',
                minWidth: d.value > 0 ? 6 : 0,
              }} />
            </Box>
          </Box>
          <Typography variant="caption" fontWeight={900} sx={{ width: 28, textAlign: 'right', color: d.color }}>
            {d.value}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
};

// ─── Conversion Funnel ────────────────────────────────────────────────────────
const ConversionFunnel = ({ leads }: { leads: Lead[] }) => {
  const total = leads.length || 1;
  const stages = PIPELINE_STAGES.filter(s => s.key !== 'LOST');

  return (
    <Box>
      <Stack spacing={1.5}>
        {stages.map((stage, i) => {
          const count = leads.filter(l => l.status === stage.key).length;
          const cumCount = leads.filter(l => {
            const idx = PIPELINE_STAGES.findIndex(s => s.key === l.status);
            return idx >= i;
          }).length;
          const pct = Math.round(cumCount / total * 100);
          const dropOff = i > 0
            ? leads.filter(l => {
                const idx = PIPELINE_STAGES.findIndex(s => s.key === l.status);
                return idx === i - 1;
              }).length - count
            : 0;

          return (
            <Box key={stage.key}>
              <Stack direction="row" alignItems="center" spacing={2} mb={0.5}>
                <Typography fontSize={16}>{stage.icon}</Typography>
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" justifyContent="space-between" mb={0.5}>
                    <Typography variant="caption" fontWeight={800}>{stage.label}</Typography>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      {dropOff > 0 && (
                        <Typography variant="caption" sx={{ color: '#ef4444', fontSize: 10 }}>
                          −{dropOff} dropped
                        </Typography>
                      )}
                      <Typography variant="caption" fontWeight={900} sx={{ color: stage.color }}>
                        {cumCount} ({pct}%)
                      </Typography>
                    </Stack>
                  </Stack>
                  <Box sx={{ height: 12, borderRadius: 6, bgcolor: 'grey.100', overflow: 'hidden' }}>
                    <Box sx={{
                      height: '100%', width: `${pct}%`, bgcolor: stage.color,
                      borderRadius: 6, transition: 'width .6s ease',
                    }} />
                  </Box>
                </Box>
                <Typography variant="caption" fontWeight={700} sx={{ width: 30, textAlign: 'right' }}>{count}</Typography>
              </Stack>
            </Box>
          );
        })}
      </Stack>

      {/* Conversion rate */}
      <Box sx={{ mt: 3, p: 2, borderRadius: 3, bgcolor: '#d1fae5', border: '1px solid #6ee7b7' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="caption" color="#065f46" fontWeight={700}>Overall Conversion Rate</Typography>
            <Typography variant="h5" fontWeight={900} color="#059669">
              {Math.round(leads.filter(l => l.status === 'BOOKED').length / total * 100)}%
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="#065f46" fontWeight={700}>Lost Rate</Typography>
            <Typography variant="h5" fontWeight={900} color="#ef4444">
              {Math.round(leads.filter(l => l.status === 'LOST').length / total * 100)}%
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

// ─── Agent Leaderboard ────────────────────────────────────────────────────────
const AgentLeaderboard = ({ leads }: { leads: Lead[] }) => {
  const agentStats = useMemo(() => {
    const map: Record<string, { name: string; total: number; booked: number; hot: number; pipeline: number }> = {};
    leads.forEach(l => {
      if (!l.ownerAgent) return;
      const id = l.ownerAgent.id;
      if (!map[id]) map[id] = { name: l.ownerAgent.name, total: 0, booked: 0, hot: 0, pipeline: 0 };
      map[id].total++;
      if (l.status === 'BOOKED') map[id].booked++;
      if (l.priority === 'HOT') map[id].hot++;
      if (l.budget) map[id].pipeline += l.budget;
    });
    return Object.values(map).sort((a, b) => b.booked - a.booked);
  }, [leads]);

  return (
    <Stack spacing={1.5}>
      {agentStats.map((agent, idx) => {
        const convRate = agent.total ? Math.round(agent.booked / agent.total * 100) : 0;
        const medals = ['🥇', '🥈', '🥉'];
        return (
          <Box key={agent.name}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Typography fontSize={16} sx={{ width: 24, textAlign: 'center' }}>
                {medals[idx] ?? `#${idx + 1}`}
              </Typography>
              <Avatar sx={{ width: 34, height: 34, bgcolor: avatarColor(agent.name), fontSize: 12, fontWeight: 900 }}>
                {initials(agent.name)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" justifyContent="space-between" mb={0.25}>
                  <Typography variant="body2" fontWeight={800}>{agent.name}</Typography>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    {agent.hot > 0 && <Typography variant="caption" sx={{ color: '#ef4444' }}>🔥 {agent.hot}</Typography>}
                    <Typography variant="caption" fontWeight={900} color="primary">
                      {agent.booked} closed · {convRate}%
                    </Typography>
                  </Stack>
                </Stack>
                <LinearProgress variant="determinate" value={convRate}
                  sx={{ height: 5, borderRadius: 3, bgcolor: 'grey.100',
                    '& .MuiLinearProgress-bar': { bgcolor: '#10b981', borderRadius: 3 } }} />
                <Stack direction="row" justifyContent="space-between" mt={0.5}>
                  <Typography variant="caption" color="text.secondary">{agent.total} leads</Typography>
                  <Typography variant="caption" color="text.secondary">Pipeline: {fmtBudget(agent.pipeline)}</Typography>
                </Stack>
              </Box>
            </Stack>
          </Box>
        );
      })}
      {agentStats.length === 0 && (
        <Typography variant="body2" color="text.secondary">No assigned leads yet</Typography>
      )}
    </Stack>
  );
};

// ─── Main Analytics Component ─────────────────────────────────────────────────
const LeadAnalytics: React.FC<Props> = ({ leads }) => {
  const total = leads.length || 1;

  // KPI cards
  const kpis = useMemo(() => ({
    total: leads.length,
    booked: leads.filter(l => l.status === 'BOOKED').length,
    lost: leads.filter(l => l.status === 'LOST').length,
    hot: leads.filter(l => l.priority === 'HOT').length,
    unassigned: leads.filter(l => !l.ownerAgent).length,
    thisWeek: leads.filter(l => {
      const diff = Date.now() - new Date(l.createdAt).getTime();
      return diff < 7 * 24 * 60 * 60 * 1000;
    }).length,
    totalPipeline: leads.reduce((s, l) => s + (l.budget ?? 0), 0),
    avgBudget: leads.filter(l => l.budget).reduce((s, l, _, arr) => s + (l.budget ?? 0) / arr.length, 0),
  }), [leads]);

  // Source breakdown
  const sourceData = useMemo(() => {
    const map: Record<string, number> = {};
    leads.forEach(l => { map[l.sourceChannel] = (map[l.sourceChannel] ?? 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({
      label: SOURCE_CFG[k as keyof typeof SOURCE_CFG]?.label ?? k,
      value: v,
      color: SOURCE_CFG[k as keyof typeof SOURCE_CFG]?.color ?? '#888',
      icon: SOURCE_CFG[k as keyof typeof SOURCE_CFG]?.icon ?? '📌',
    }));
  }, [leads]);

  // Stage distribution
  const stageData = useMemo(() =>
    PIPELINE_STAGES.map(s => ({
      label: s.label,
      value: leads.filter(l => l.status === s.key).length,
      color: s.color,
      icon: s.icon,
    })), [leads]);

  // Project breakdown
  const projectData = useMemo(() => {
    const map: Record<string, number> = {};
    leads.forEach(l => {
      if (l.preferredProject) map[l.preferredProject] = (map[l.preferredProject] ?? 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => ({
      label: k, value: v, color: '#6366f1',
    }));
  }, [leads]);

  return (
    <Box>
      {/* KPI cards */}
      <Grid container spacing={2} mb={4}>
        {[
          { label: 'Total Leads',     value: kpis.total,    color: '#6366f1', icon: '📋' },
          { label: 'Booked',          value: kpis.booked,   color: '#10b981', icon: '🎉' },
          { label: 'Hot Leads',       value: kpis.hot,      color: '#ef4444', icon: '🔥' },
          { label: 'Unassigned',      value: kpis.unassigned, color: '#f59e0b', icon: '⚠️' },
          { label: 'This Week',       value: kpis.thisWeek, color: '#0ea5e9', icon: '📅' },
          { label: 'Pipeline Value',  value: fmtBudget(kpis.totalPipeline), color: '#8b5cf6', icon: '💰' },
        ].map(k => (
          <Grid item xs={6} sm={4} lg={2} key={k.label}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, textAlign: 'center' }}>
              <Typography fontSize={22} mb={0.25}>{k.icon}</Typography>
              <Typography variant="h5" fontWeight={900} sx={{ color: k.color }}>{k.value}</Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>{k.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Conversion Funnel */}
        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="body1" fontWeight={800} mb={2.5}>🔽 Conversion Funnel</Typography>
            <ConversionFunnel leads={leads} />
          </Paper>
        </Grid>

        {/* Source Breakdown */}
        <Grid item xs={12} md={7}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="body1" fontWeight={800} mb={2.5}>📡 Lead Sources</Typography>
            <BarChart data={sourceData} />

            {/* Source % strip */}
            <Box sx={{ mt: 2.5 }}>
              <Stack direction="row" sx={{ height: 12, borderRadius: 6, overflow: 'hidden' }} spacing={0}>
                {sourceData.map(d => (
                  <Tooltip key={d.label} title={`${d.label}: ${d.value}`}>
                    <Box sx={{ width: `${Math.round(d.value / total * 100)}%`, bgcolor: d.color, minWidth: d.value > 0 ? 4 : 0 }} />
                  </Tooltip>
                ))}
              </Stack>
              <Stack direction="row" flexWrap="wrap" spacing={1} mt={1}>
                {sourceData.map(d => (
                  <Stack key={d.label} direction="row" alignItems="center" spacing={0.5}>
                    <Box sx={{ width: 8, height: 8, borderRadius: 2, bgcolor: d.color }} />
                    <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary' }}>
                      {d.icon} {Math.round(d.value / total * 100)}%
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Paper>
        </Grid>

        {/* Agent Leaderboard */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="body1" fontWeight={800} mb={2.5}>🏆 Agent Leaderboard</Typography>
            <AgentLeaderboard leads={leads} />
          </Paper>
        </Grid>

        {/* Project Demand */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="body1" fontWeight={800} mb={2.5}>🏗 Project Demand</Typography>
            {projectData.length > 0 ? (
              <BarChart data={projectData.map((d, i) => ({
                ...d,
                color: ['#6366f1','#3b82f6','#10b981','#f59e0b','#ec4899','#8b5cf6','#0ea5e9','#ef4444'][i % 8]
              }))} />
            ) : (
              <Typography variant="body2" color="text.secondary">No project preference data yet</Typography>
            )}
          </Paper>
        </Grid>

        {/* Priority distribution */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="body1" fontWeight={800} mb={2.5}>⚡ Lead Priority Distribution</Typography>
            <Grid container spacing={2}>
              {Object.entries(PRIORITY_CFG).map(([k, v]) => {
                const count = leads.filter(l => l.priority === k).length;
                const pct = Math.round(count / total * 100);
                return (
                  <Grid item xs={12} sm={4} key={k}>
                    <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: v.bg, border: '1px solid', borderColor: v.color + '44' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography fontSize={22}>{v.icon}</Typography>
                          <Typography variant="body1" fontWeight={900} sx={{ color: v.color }}>{v.label}</Typography>
                        </Stack>
                        <Typography variant="h5" fontWeight={900} sx={{ color: v.color }}>{count}</Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={pct}
                        sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,.5)',
                          '& .MuiLinearProgress-bar': { bgcolor: v.color, borderRadius: 3 } }} />
                      <Typography variant="caption" sx={{ color: v.color, mt: 0.5, display: 'block' }}>{pct}% of all leads</Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LeadAnalytics;