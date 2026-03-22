import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Stack, Button, Grid, Chip, IconButton,
  CircularProgress, Paper, Tab, Tabs, TextField, InputAdornment,
  FormControl, InputLabel, Select, MenuItem, Divider, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tooltip, LinearProgress, Alert, Badge
} from '@mui/material';
import {
  AddOutlined, SearchOutlined, DownloadOutlined, TableRowsOutlined,
  CalendarMonthOutlined, BarChartOutlined, RouteOutlined,
  EditOutlined, DeleteOutlineOutlined, CheckCircleOutlined,
  NoteAddOutlined, RefreshOutlined, WarningAmberOutlined,
  AssignmentTurnedInOutlined, PersonOutlined, FlagOutlined,
  NotificationsActiveOutlined
} from '@mui/icons-material';
import {
  SiteVisit, VisitStatus, VisitType, VisitAgent, VisitLead,
  VISIT_TYPE_CFG, VISIT_STATUS_CFG, VISIT_OUTCOME_CFG, INTEREST_LEVEL_CFG,
  PRIORITY_CFG, avatarColor, initials, formatDate, formatTime,
  isToday, isTomorrow, isPast, timeAgo, fmtBudget
} from './visitTypes';
import ScheduleVisitDialog from './ScheduleVisitDialog';
import { CheckInDialog, FeedbackDialog } from './VisitFeedbackDialog';
import VisitCalendar from './VisitCalendar';
import api from '../../../../api/axios';

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, color, onClick, active }: {
  icon: string; label: string; value: number | string;
  sub?: string; color: string; onClick?: () => void; active?: boolean;
}) => (
  <Paper variant="outlined" onClick={onClick}
    sx={{
      p: 2.5, borderRadius: 3, textAlign: 'center', cursor: onClick ? 'pointer' : 'default',
      transition: 'all .15s', border: '1.5px solid',
      borderColor: active ? color : '#e5e7eb',
      bgcolor: active ? color + '10' : '#fff',
      '&:hover': onClick ? { borderColor: color, bgcolor: color + '08', transform: 'translateY(-2px)', boxShadow: `0 8px 24px ${color}20` } : {},
    }}>
    <Typography fontSize={24} mb={0.5}>{icon}</Typography>
    <Typography variant="h5" fontWeight={900} sx={{ color, lineHeight: 1 }}>{value}</Typography>
    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>{label}</Typography>
    {sub && <Typography variant="caption" sx={{ fontSize: 10, color: color + 'aa' }}>{sub}</Typography>}
  </Paper>
);

// ─── Visit Analytics ──────────────────────────────────────────────────────────
const VisitAnalytics = ({ visits }: { visits: SiteVisit[] }) => {
  const stats = useMemo(() => {
    const total = visits.length || 1;
    const completed = visits.filter(v => v.status === 'COMPLETED').length;
    const noShow = visits.filter(v => v.status === 'NO_SHOW').length;
    const booked = visits.filter(v => v.outcome === 'BOOKING_INITIATED').length;
    const inProg = visits.filter(v => v.status === 'IN_PROGRESS').length;
    return {
      total: visits.length, completed, noShow, booked, inProg,
      completionRate: Math.round(completed / total * 100),
      noShowRate: Math.round(noShow / total * 100),
      conversionRate: Math.round(booked / (completed || 1) * 100),
      avgDuration: Math.round(visits.filter(v => v.durationMinutes).reduce((s, v) => s + (v.durationMinutes ?? 0), 0) / (visits.filter(v => v.durationMinutes).length || 1)),
    };
  }, [visits]);

  const agentStats = useMemo(() => {
    const m: Record<string, { name: string; total: number; completed: number; booked: number; noShow: number }> = {};
    visits.forEach(v => {
      const id = v.agent.id;
      if (!m[id]) m[id] = { name: v.agent.name, total: 0, completed: 0, booked: 0, noShow: 0 };
      m[id].total++;
      if (v.status === 'COMPLETED') m[id].completed++;
      if (v.outcome === 'BOOKING_INITIATED') m[id].booked++;
      if (v.status === 'NO_SHOW') m[id].noShow++;
    });
    return Object.values(m).sort((a, b) => b.completed - a.completed);
  }, [visits]);

  const projectStats = useMemo(() => {
    const m: Record<string, number> = {};
    visits.forEach(v => { if (v.project) m[v.project] = (m[v.project] ?? 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [visits]);

  const outcomeStats = useMemo(() =>
    Object.entries(VISIT_OUTCOME_CFG).map(([k, v]) => ({
      key: k, ...v, count: visits.filter(x => x.outcome === k).length,
    })), [visits]);

  const interestStats = useMemo(() => {
    const completed = visits.filter(v => v.feedback?.interestLevel);
    const m: Record<string, number> = {};
    completed.forEach(v => { const il = v.feedback!.interestLevel; m[il] = (m[il] ?? 0) + 1; });
    return m;
  }, [visits]);

  const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444', '#0ea5e9'];

  return (
    <Box>
      {/* KPI Row */}
      <Grid container spacing={2} mb={4}>
        {[
          { icon: '📅', label: 'Total Visits', value: stats.total, color: '#6366f1' },
          { icon: '✅', label: 'Completed', value: stats.completed, color: '#10b981', sub: `${stats.completionRate}% rate` },
          { icon: '🎉', label: 'Bookings', value: stats.booked, color: '#f59e0b', sub: `${stats.conversionRate}% conv` },
          { icon: '❌', label: 'No-shows', value: stats.noShow, color: '#ef4444', sub: `${stats.noShowRate}% rate` },
          { icon: '🕐', label: 'Today', value: visits.filter(v => isToday(v.visitDate)).length, color: '#0ea5e9' },
          { icon: '⏱', label: 'Avg Duration', value: `${stats.avgDuration}m`, color: '#8b5cf6' },
        ].map(k => (
          <Grid item xs={6} sm={4} lg={2} key={k.label}>
            <StatCard {...k} value={k.value} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Visit Status Breakdown */}
        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="body1" fontWeight={800} mb={2.5}>📊 Status Breakdown</Typography>
            <Stack spacing={2}>
              {Object.entries(VISIT_STATUS_CFG).map(([k, v]) => {
                const count = visits.filter(x => x.status === k).length;
                const pct = visits.length ? Math.round(count / visits.length * 100) : 0;
                return (
                  <Stack key={k} direction="row" alignItems="center" spacing={2}>
                    <Typography fontSize={16} sx={{ width: 22 }}>{v.icon}</Typography>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" justifyContent="space-between" mb={0.4}>
                        <Typography variant="caption" fontWeight={700}>{v.label}</Typography>
                        <Typography variant="caption" fontWeight={900} sx={{ color: v.color }}>{count} ({pct}%)</Typography>
                      </Stack>
                      <Box sx={{ height: 8, borderRadius: 4, bgcolor: '#f3f4f6', overflow: 'hidden' }}>
                        <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: v.color, borderRadius: 4, transition: 'width .6s ease' }} />
                      </Box>
                    </Box>
                  </Stack>
                );
              })}
            </Stack>
          </Paper>
        </Grid>

        {/* Outcome + Interest */}
        <Grid item xs={12} md={7}>
          <Stack spacing={3}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="body1" fontWeight={800} mb={2}>🎯 Visit Outcomes</Typography>
              <Grid container spacing={1.5}>
                {outcomeStats.map(o => (
                  <Grid item xs={6} sm={4} key={o.key}>
                    <Box sx={{ p: 2, borderRadius: 3, textAlign: 'center', bgcolor: o.bg, border: `1px solid ${o.color}30` }}>
                      <Typography fontSize={22}>{o.icon}</Typography>
                      <Typography variant="h6" fontWeight={900} sx={{ color: o.color }}>{o.count}</Typography>
                      <Typography variant="caption" fontWeight={700} sx={{ color: o.color, fontSize: 10 }}>{o.label}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="body1" fontWeight={800} mb={2}>💡 Customer Interest (from feedback)</Typography>
              <Stack direction="row" spacing={1.5} flexWrap="wrap">
                {Object.entries(INTEREST_LEVEL_CFG).map(([k, v]) => {
                  const count = interestStats[k] ?? 0;
                  return (
                    <Box key={k} sx={{ p: 1.5, borderRadius: 3, textAlign: 'center', bgcolor: v.bg, border: `1px solid ${v.color}30`, minWidth: 80 }}>
                      <Typography fontSize={18}>{v.icon}</Typography>
                      <Typography variant="h6" fontWeight={900} sx={{ color: v.color }}>{count}</Typography>
                      <Typography variant="caption" fontWeight={700} sx={{ color: v.color, fontSize: 9 }}>{v.label}</Typography>
                    </Box>
                  );
                })}
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        {/* Visit Type */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="body1" fontWeight={800} mb={2}>🏠 Visit Types</Typography>
            <Stack spacing={1.5}>
              {Object.entries(VISIT_TYPE_CFG).map(([k, v]) => {
                const count = visits.filter(x => x.visitType === k).length;
                const pct = visits.length ? Math.round(count / visits.length * 100) : 0;
                return (
                  <Box key={k} sx={{ p: 2, borderRadius: 3, bgcolor: v.bg, border: `1px solid ${v.color}30` }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.75}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography fontSize={18}>{v.icon}</Typography>
                        <Typography variant="body2" fontWeight={800} sx={{ color: v.color }}>{v.label}</Typography>
                      </Stack>
                      <Typography variant="h6" fontWeight={900} sx={{ color: v.color }}>{count}</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={pct}
                      sx={{
                        height: 5, borderRadius: 3, bgcolor: 'rgba(255,255,255,.6)',
                        '& .MuiLinearProgress-bar': { bgcolor: v.color, borderRadius: 3 }
                      }} />
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        </Grid>

        {/* Agent Leaderboard */}
        <Grid item xs={12} md={8}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="body1" fontWeight={800} mb={2.5}>🏆 Agent Performance</Typography>
            <Stack spacing={2}>
              {agentStats.map((a, idx) => {
                const rate = a.total ? Math.round(a.completed / a.total * 100) : 0;
                const medals = ['🥇', '🥈', '🥉'];
                return (
                  <Stack key={a.name} direction="row" alignItems="center" spacing={2}>
                    <Typography sx={{ width: 28, textAlign: 'center', fontSize: 18 }}>{medals[idx] ?? `${idx + 1}`}</Typography>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: avatarColor(a.name), fontSize: 13, fontWeight: 800 }}>
                      {initials(a.name)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" justifyContent="space-between" mb={0.3}>
                        <Typography variant="body2" fontWeight={800}>{a.name}</Typography>
                        <Stack direction="row" spacing={2}>
                          <Typography variant="caption" color="text.secondary">{a.total} total</Typography>
                          <Typography variant="caption" fontWeight={800} color="primary">{a.completed} done · {rate}%</Typography>
                          <Typography variant="caption" fontWeight={800} sx={{ color: '#10b981' }}>🎉 {a.booked}</Typography>
                          {a.noShow > 0 && <Typography variant="caption" sx={{ color: '#ef4444' }}>❌ {a.noShow}</Typography>}
                        </Stack>
                      </Stack>
                      <LinearProgress variant="determinate" value={rate}
                        sx={{
                          height: 6, borderRadius: 3, bgcolor: '#f3f4f6',
                          '& .MuiLinearProgress-bar': { bgcolor: '#10b981', borderRadius: 3 }
                        }} />
                    </Box>
                  </Stack>
                );
              })}
            </Stack>
          </Paper>
        </Grid>

        {/* Project Demand */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="body1" fontWeight={800} mb={2.5}>🏗 Visits by Project</Typography>
            {projectStats.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No project data yet</Typography>
            ) : (
              <Stack spacing={1.5}>
                {projectStats.map(([proj, count], i) => {
                  const pct = Math.round(count / visits.length * 100);
                  return (
                    <Stack key={proj} direction="row" alignItems="center" spacing={2}>
                      <Typography variant="caption" fontWeight={700} sx={{ width: 160 }} noWrap>{proj}</Typography>
                      <Box sx={{ flex: 1, height: 10, borderRadius: 5, bgcolor: '#f3f4f6', overflow: 'hidden' }}>
                        <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: CHART_COLORS[i % 8], borderRadius: 5, transition: 'width .6s ease' }} />
                      </Box>
                      <Typography variant="caption" fontWeight={900} sx={{ width: 32, textAlign: 'right', color: CHART_COLORS[i % 8] }}>{count}</Typography>
                    </Stack>
                  );
                })}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444', '#0ea5e9'];

// ─── Agent Route View ─────────────────────────────────────────────────────────
const AgentRouteView = ({ visits }: { visits: SiteVisit[] }) => {
  const todayVisits = visits.filter(v => isToday(v.visitDate));
  const routes = useMemo(() => {
    const m: Record<string, { agent: VisitAgent; visits: SiteVisit[] }> = {};
    todayVisits.forEach(v => {
      if (!m[v.agent.id]) m[v.agent.id] = { agent: v.agent, visits: [] };
      m[v.agent.id].visits.push(v);
    });
    Object.values(m).forEach(a => a.visits.sort((x, y) => x.visitTime.localeCompare(y.visitTime)));
    return Object.values(m);
  }, [todayVisits]);

  if (routes.length === 0) return (
    <Box sx={{ py: 10, textAlign: 'center', color: 'text.secondary' }}>
      <Typography fontSize={52} mb={2}>🗺</Typography>
      <Typography variant="h6" fontWeight={700}>No visits scheduled today</Typography>
      <Typography variant="body2">Agent routes will appear here when visits are scheduled</Typography>
    </Box>
  );

  return (
    <Box>
      <Typography variant="body1" fontWeight={800} mb={0.5}>
        🗺 Today's Agent Routes
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        {' · '}{todayVisits.length} total visits across {routes.length} agents
      </Typography>
      <Grid container spacing={3}>
        {routes.map(({ agent, visits: av }) => {
          const completed = av.filter(v => v.status === 'COMPLETED').length;
          return (
            <Grid item xs={12} sm={6} lg={4} key={agent.id}>
              <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
                {/* Agent header */}
                <Box sx={{
                  p: 2.5, background: `linear-gradient(135deg, ${avatarColor(agent.name)}, ${avatarColor(agent.name)}cc)`,
                }}>
                  <Stack direction="row" alignItems="center" spacing={1.5} mb={1.5}>
                    <Avatar sx={{ width: 44, height: 44, bgcolor: 'rgba(255,255,255,.25)', fontWeight: 900, fontSize: 16, border: '2px solid rgba(255,255,255,.4)' }}>
                      {initials(agent.name)}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight={900} color="#fff">{agent.name}</Typography>
                      {agent.role && <Typography variant="caption" sx={{ color: 'rgba(255,255,255,.7)' }}>{agent.role.name}</Typography>}
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1.5}>
                    <Chip label={`${av.length} visits`} size="small" sx={{ bgcolor: 'rgba(255,255,255,.2)', color: '#fff', fontWeight: 800, fontSize: 10, height: 20 }} />
                    <Chip label={`${completed} done`} size="small" sx={{ bgcolor: 'rgba(255,255,255,.2)', color: '#fff', fontWeight: 800, fontSize: 10, height: 20 }} />
                  </Stack>
                  {/* Progress bar */}
                  <Box sx={{ mt: 1.5, height: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,.2)', overflow: 'hidden' }}>
                    <Box sx={{ height: '100%', width: `${av.length ? Math.round(completed / av.length * 100) : 0}%`, bgcolor: 'rgba(255,255,255,.8)', borderRadius: 2 }} />
                  </Box>
                </Box>

                {/* Visit timeline */}
                <Box sx={{ p: 2 }}>
                  <Stack spacing={0}>
                    {av.map((v, i) => {
                      const tyCfg = VISIT_TYPE_CFG[v.visitType];
                      const stCfg = VISIT_STATUS_CFG[v.status];
                      const done = v.status === 'COMPLETED' || v.status === 'NO_SHOW';
                      return (
                        <Stack key={v.id} direction="row" spacing={1.5} sx={{ position: 'relative' }}>
                          {i < av.length - 1 && (
                            <Box sx={{
                              position: 'absolute', left: 16, top: 34, bottom: 0, width: 2,
                              bgcolor: done ? '#d1fae5' : '#f3f4f6', zIndex: 0
                            }} />
                          )}
                          <Box sx={{
                            width: 32, height: 32, borderRadius: '50%', flexShrink: 0, zIndex: 1,
                            bgcolor: done ? '#d1fae5' : tyCfg.bg,
                            border: `2px solid ${done ? '#10b981' : tyCfg.color}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                          }}>
                            {done ? '✅' : tyCfg.icon}
                          </Box>
                          <Box sx={{ flex: 1, pb: 2.5 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" fontWeight={900}>{v.visitTime}</Typography>
                              <Chip label={stCfg.label} size="small"
                                sx={{ bgcolor: stCfg.bg, color: stCfg.color, fontWeight: 800, fontSize: 9, height: 18 }} />
                            </Stack>
                            <Typography variant="body2" fontWeight={700}>{v.lead.customerName}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {v.project}{v.tower ? ` · ${v.tower}` : ''}
                              {v.unitNumber ? ` · Unit ${v.unitNumber}` : ''}
                            </Typography>
                            {v.meetingLocation && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                📍 {v.meetingLocation}
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      );
                    })}
                  </Stack>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

// ─── Visits Table ─────────────────────────────────────────────────────────────
const VisitsTable = ({ visits, onEdit, onCheckIn, onFeedback, onDelete }: {
  visits: SiteVisit[];
  onEdit: (v: SiteVisit) => void;
  onCheckIn: (v: SiteVisit) => void;
  onFeedback: (v: SiteVisit) => void;
  onDelete: (v: SiteVisit) => void;
}) => (
  <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: '#f8fafc' }}>
            {['Customer', 'Property', 'Type', 'Date & Time', 'Agent', 'Status', 'Outcome / Feedback', 'Actions'].map(h => (
              <TableCell key={h} sx={{ fontWeight: 800, fontSize: 11, py: 1.5, color: '#374151' }}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {visits.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 10, color: 'text.secondary' }}>
                <Typography fontSize={40} mb={1.5}>📅</Typography>
                <Typography variant="body2">No visits match your filters</Typography>
              </TableCell>
            </TableRow>
          ) : visits.map(v => {
            const tyCfg = VISIT_TYPE_CFG[v.visitType];
            const stCfg = VISIT_STATUS_CFG[v.status];
            const outCfg = VISIT_OUTCOME_CFG[v.outcome];
            const pri = v.priority ? PRIORITY_CFG[v.priority] : null;
            const dateHighlight = isToday(v.visitDate) ? '#10b981' : isTomorrow(v.visitDate) ? '#f59e0b' : null;
            const needsCheckIn = v.status === 'SCHEDULED' || v.status === 'CONFIRMED';
            const needsFeedback = v.status === 'COMPLETED' && !v.feedback;
            const isOverdue = isPast(v.visitDate, v.visitTime) && needsCheckIn;

            return (
              <TableRow key={v.id} hover
                sx={{
                  '& td': { py: 1.5 },
                  bgcolor: isOverdue ? '#fff8f8' : 'inherit',
                }}>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: avatarColor(v.lead.customerName), fontSize: 11, fontWeight: 900 }}>
                      {initials(v.lead.customerName)}
                    </Avatar>
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={0.75}>
                        <Typography variant="body2" fontWeight={800}>{v.lead.customerName}</Typography>
                        {pri && <Typography fontSize={12}>{pri.icon}</Typography>}
                      </Stack>
                      <Typography variant="caption" color="text.secondary">{v.lead.customerPhone}</Typography>
                      {(v.tags ?? []).length > 0 && (
                        <Chip label={v.tags![0]} size="small" sx={{ fontSize: 9, height: 14, mt: 0.25 }} />
                      )}
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={700}>{v.project || '—'}</Typography>
                  {(v.tower || v.unitNumber) && (
                    <Typography variant="caption" color="text.secondary">
                      {v.tower}{v.unitNumber ? ` · ${v.unitNumber}` : ''}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip label={`${tyCfg.icon} ${tyCfg.label}`} size="small"
                    sx={{ bgcolor: tyCfg.bg, color: tyCfg.color, fontWeight: 800, fontSize: 10, height: 22 }} />
                  {(v.groupLeads?.length ?? 0) > 0 && (
                    <Chip label={`👥 +${v.groupLeads!.length}`} size="small"
                      sx={{ ml: 0.5, fontSize: 9, height: 18, bgcolor: '#eef2ff', color: '#6366f1', fontWeight: 700 }} />
                  )}
                </TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    {dateHighlight && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dateHighlight, flexShrink: 0 }} />}
                    <Box>
                      <Typography variant="body2" fontWeight={700} sx={{ color: dateHighlight ?? 'text.primary' }}>
                        {isToday(v.visitDate) ? 'Today' : isTomorrow(v.visitDate) ? 'Tomorrow' : formatDate(v.visitDate)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(v.visitTime)}{v.durationMinutes ? ` · ${v.durationMinutes}min` : ''}
                      </Typography>
                    </Box>
                  </Stack>
                  {isOverdue && (
                    <Chip label="⚠ Overdue" size="small" sx={{ fontSize: 9, height: 16, bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 700, mt: 0.25 }} />
                  )}
                </TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <Avatar sx={{ width: 22, height: 22, fontSize: 9, bgcolor: avatarColor(v.agent.name), fontWeight: 800 }}>
                      {initials(v.agent.name)}
                    </Avatar>
                    <Box>
                      <Typography variant="caption" fontWeight={700}>{v.agent.name}</Typography>
                      {(v.coAgents?.length ?? 0) > 0 && (
                        <Typography variant="caption" color="text.secondary" display="block">+{v.coAgents!.length} co-agent</Typography>
                      )}
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip label={`${stCfg.icon} ${stCfg.label}`} size="small"
                    sx={{ bgcolor: stCfg.bg, color: stCfg.color, fontWeight: 800, fontSize: 10, height: 22 }} />
                </TableCell>
                <TableCell>
                  {v.outcome !== 'PENDING' ? (
                    <Chip label={`${outCfg.icon} ${outCfg.label}`} size="small"
                      sx={{ bgcolor: outCfg.bg, color: outCfg.color, fontWeight: 800, fontSize: 10, height: 22, mb: 0.5 }} />
                  ) : null}
                  {v.feedback?.interestLevel && (
                    <Chip label={`${INTEREST_LEVEL_CFG[v.feedback.interestLevel].icon} ${INTEREST_LEVEL_CFG[v.feedback.interestLevel].label}`}
                      size="small" sx={{
                        bgcolor: INTEREST_LEVEL_CFG[v.feedback.interestLevel].bg,
                        color: INTEREST_LEVEL_CFG[v.feedback.interestLevel].color,
                        fontWeight: 800, fontSize: 9, height: 18, display: 'flex'
                      }} />
                  )}
                  {needsFeedback && (
                    <Chip label="📝 Needs feedback" size="small"
                      sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 700, fontSize: 9, height: 18 }} />
                  )}
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.25}>
                    {needsCheckIn && (
                      <Tooltip title={isOverdue ? '⚠ Overdue — mark complete' : 'Check-in / Start Visit'}>
                        <IconButton size="small" onClick={() => onCheckIn(v)} sx={{ color: '#10b981' }}>
                          <CheckCircleOutlined sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                    {needsFeedback && (
                      <Tooltip title="Add Feedback">
                        <IconButton size="small" onClick={() => onFeedback(v)} sx={{ color: '#f59e0b' }}>
                          <NoteAddOutlined sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Edit / Reschedule">
                      <IconButton size="small" onClick={() => onEdit(v)}><EditOutlined sx={{ fontSize: 17 }} /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => onDelete(v)} sx={{ color: 'error.main' }}>
                        <DeleteOutlineOutlined sx={{ fontSize: 17 }} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  </Paper>
);

// ─── Main SiteVisitsPage ──────────────────────────────────────────────────────
const SiteVisitsPage: React.FC = () => {
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [leads, setLeads] = useState<VisitLead[]>([]);
  const [agents, setAgents] = useState<VisitAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [mainTab, setMainTab] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [agentFilter, setAgentFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [editVisit, setEditVisit] = useState<SiteVisit | null>(null);
  const [checkInVisit, setCheckInVisit] = useState<SiteVisit | null>(null);
  const [feedbackVisit, setFeedbackVisit] = useState<SiteVisit | null>(null);
  const [prefillDate, setPrefillDate] = useState<string | undefined>();

  const fetchData = async () => {
    try {
      const [vRes, lRes, aRes] = await Promise.all([
        api.get('/site-visits'),
        api.get('/leads'),
        api.get('/tenant/users'),
      ]);
      setVisits(vRes.data?.data ?? vRes.data ?? []);
      setLeads((lRes.data?.data ?? lRes.data ?? []).map((l: any) => ({
        id: l.id, customerName: l.customerName, customerPhone: l.customerPhone,
        customerEmail: l.customerEmail, preferredProject: l.preferredProject, budget: l.budget, status: l.status,
      })));
      setAgents((aRes.data ?? []).filter((u: any) => ['Agent', 'Sales Manager'].includes(u.role?.name)));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (v: SiteVisit) => {
    if (!window.confirm(`Delete visit for ${v.lead.customerName}?`)) return;
    try { await api.delete(`/site-visits/${v.id}`); fetchData(); } catch (e) { console.error(e); }
  };

  const handleExport = () => {
    const headers = ['Customer', 'Phone', 'Project', 'Tower', 'Unit', 'Type', 'Date', 'Time', 'Agent', 'Status', 'Outcome'];
    const rows = filtered.map(v => [
      v.lead.customerName, v.lead.customerPhone, v.project ?? '', v.tower ?? '',
      v.unitNumber ?? '', v.visitType, v.visitDate, v.visitTime, v.agent.name, v.status, v.outcome,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = 'site-visits.csv'; a.click();
  };

  // Stats for alert strip
  const todayCount = visits.filter(v => isToday(v.visitDate)).length;
  const tomorrowCount = visits.filter(v => isTomorrow(v.visitDate)).length;
  const pendingFeedback = visits.filter(v => v.status === 'COMPLETED' && !v.feedback).length;
  const overdueCount = visits.filter(v => isPast(v.visitDate, v.visitTime) && (v.status === 'SCHEDULED' || v.status === 'CONFIRMED')).length;

  const filtered = useMemo(() => visits.filter(v => {
    const q = search.toLowerCase();
    const matchQ = !q || v.lead.customerName.toLowerCase().includes(q) ||
      (v.project ?? '').toLowerCase().includes(q) || v.agent.name.toLowerCase().includes(q) ||
      v.lead.customerPhone.includes(q);
    const matchStatus = statusFilter === 'ALL' || v.status === statusFilter;
    const matchType = typeFilter === 'ALL' || v.visitType === typeFilter;
    const matchAgent = agentFilter === 'ALL' || v.agent.id === agentFilter;
    const matchPriority = priorityFilter === 'ALL' || v.priority === priorityFilter;
    return matchQ && matchStatus && matchType && matchAgent && matchPriority;
  }).sort((a, b) => {
    if (a.visitDate !== b.visitDate) return a.visitDate.localeCompare(b.visitDate);
    return a.visitTime.localeCompare(b.visitTime);
  }), [visits, search, statusFilter, typeFilter, agentFilter, priorityFilter]);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#fafafa', minHeight: '100vh' }}>
      {/* ── Page Header ── */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-start' }} mb={3.5} spacing={2}>
        <Box>
          <Typography sx={{
            fontFamily: '"Playfair Display", serif', fontWeight: 900, fontSize: '2.25rem',
            letterSpacing: -1.5, lineHeight: 1.1, color: '#0f172a'
          }}>
            Site Visits
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={0.75}>
            {visits.length} total · Schedule, track and convert site visits into bookings
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" startIcon={<DownloadOutlined />} onClick={handleExport}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 3 }}>Export CSV</Button>
          <Button variant="contained" disableElevation startIcon={<AddOutlined />}
            onClick={() => { setEditVisit(null); setPrefillDate(undefined); setScheduleOpen(true); }}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 3, px: 2.5 }}>
            Schedule Visit
          </Button>
        </Stack>
      </Stack>

      {/* ── KPI Strip ── */}
      <Grid container spacing={2} mb={3}>
        {[
          { icon: '📅', label: 'Total', value: visits.length, color: '#6366f1', filter: null },
          { icon: '🟢', label: 'Today', value: todayCount, color: '#10b981', filter: null },
          { icon: '✅', label: 'Completed', value: visits.filter(v => v.status === 'COMPLETED').length, color: '#10b981', filter: 'COMPLETED' },
          { icon: '❌', label: 'No-shows', value: visits.filter(v => v.status === 'NO_SHOW').length, color: '#ef4444', filter: 'NO_SHOW' },
          { icon: '🎉', label: 'Bookings', value: visits.filter(v => v.outcome === 'BOOKING_INITIATED').length, color: '#f59e0b', filter: null },
          { icon: '📝', label: 'Need Feedback', value: pendingFeedback, color: '#f59e0b', filter: 'COMPLETED' },
        ].map(k => (
          <Grid item xs={6} sm={4} md={2} key={k.label}>
            <StatCard {...k} value={k.value} active={k.filter ? statusFilter === k.filter : false}
              onClick={k.filter ? () => { setStatusFilter(statusFilter === k.filter! ? 'ALL' : k.filter!); setMainTab(0); } : undefined} />
          </Grid>
        ))}
      </Grid>

      {/* ── Alert Strip ── */}
      {(todayCount > 0 || overdueCount > 0 || pendingFeedback > 0 || tomorrowCount > 0) && (
        <Stack direction="row" spacing={1.5} mb={3} flexWrap="wrap">
          {overdueCount > 0 && (
            <Chip icon={<WarningAmberOutlined sx={{ fontSize: '14px !important' }} />}
              label={`${overdueCount} overdue visit${overdueCount > 1 ? 's' : ''} — needs action`}
              sx={{ bgcolor: '#fee2e2', color: '#991b1b', fontWeight: 800, fontSize: 11, height: 28 }} />
          )}
          {todayCount > 0 && (
            <Chip label={`🟢 ${todayCount} visit${todayCount > 1 ? 's' : ''} today`}
              sx={{ bgcolor: '#d1fae5', color: '#065f46', fontWeight: 800, fontSize: 11, height: 28 }} />
          )}
          {tomorrowCount > 0 && (
            <Chip label={`🟡 ${tomorrowCount} tomorrow`}
              sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 800, fontSize: 11, height: 28 }} />
          )}
          {pendingFeedback > 0 && (
            <Chip label={`📝 ${pendingFeedback} awaiting feedback`} clickable
              onClick={() => { setStatusFilter('COMPLETED'); setMainTab(0); }}
              sx={{ bgcolor: '#e0f2fe', color: '#0c4a6e', fontWeight: 800, fontSize: 11, height: 28 }} />
          )}
        </Stack>
      )}

      {/* ── View Tabs ── */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
        <Tabs value={mainTab} onChange={(_, v) => setMainTab(v)}
          TabIndicatorProps={{ sx: { height: 3, borderRadius: 2 } }}>
          {[
            { icon: <TableRowsOutlined sx={{ fontSize: 17 }} />, label: 'List View' },
            { icon: <CalendarMonthOutlined sx={{ fontSize: 17 }} />, label: 'Calendar' },
            { icon: <RouteOutlined sx={{ fontSize: 17 }} />, label: 'Agent Routes' },
            { icon: <BarChartOutlined sx={{ fontSize: 17 }} />, label: 'Analytics' },
          ].map((t, i) => (
            <Tab key={i} icon={t.icon} iconPosition="start" label={t.label}
              sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.82rem', minHeight: 44 }} />
          ))}
        </Tabs>
        <IconButton onClick={fetchData} size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <RefreshOutlined fontSize="small" />
        </IconButton>
      </Stack>

      {/* ── List View Filters ── */}
      {mainTab === 0 && (
        <>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 2.5 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap">
              <TextField fullWidth placeholder="Search customer, project, agent, phone..."
                size="small" value={search} onChange={e => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small" sx={{ color: '#9ca3af' }} /></InputAdornment>,
                  sx: { borderRadius: 2.5 }
                }} />
              {[
                { label: 'Status', val: statusFilter, set: setStatusFilter, opts: [['ALL', 'All Statuses'], ...Object.entries(VISIT_STATUS_CFG).map(([k, v]) => [k, `${v.icon} ${v.label}`])] },
                { label: 'Type', val: typeFilter, set: setTypeFilter, opts: [['ALL', 'All Types'], ...Object.entries(VISIT_TYPE_CFG).map(([k, v]) => [k, `${v.icon} ${v.label}`])] },
                { label: 'Agent', val: agentFilter, set: setAgentFilter, opts: [['ALL', 'All Agents'], ...agents.map(a => [a.id, a.name])] },
                { label: 'Priority', val: priorityFilter, set: setPriorityFilter, opts: [['ALL', 'All Priority'], ...Object.entries(PRIORITY_CFG).map(([k, v]) => [k, `${v.icon} ${v.label}`])] },
              ].map(f => (
                <FormControl key={f.label} size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>{f.label}</InputLabel>
                  <Select value={f.val} label={f.label} onChange={e => f.set(e.target.value)} sx={{ borderRadius: 2.5 }}>
                    {f.opts.map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
                  </Select>
                </FormControl>
              ))}
              {(search || statusFilter !== 'ALL' || typeFilter !== 'ALL' || agentFilter !== 'ALL' || priorityFilter !== 'ALL') && (
                <Button size="small" color="inherit"
                  onClick={() => { setSearch(''); setStatusFilter('ALL'); setTypeFilter('ALL'); setAgentFilter('ALL'); setPriorityFilter('ALL'); }}
                  sx={{ textTransform: 'none', whiteSpace: 'nowrap', fontWeight: 700 }}>
                  Clear all
                </Button>
              )}
            </Stack>
          </Paper>
          <Typography variant="body2" color="text.secondary" mb={1.5}>
            Showing <strong>{filtered.length}</strong> of <strong>{visits.length}</strong> visits
          </Typography>
          <VisitsTable visits={filtered}
            onEdit={v => { setEditVisit(v); setScheduleOpen(true); }}
            onCheckIn={setCheckInVisit}
            onFeedback={setFeedbackVisit}
            onDelete={handleDelete} />
        </>
      )}

      {mainTab === 1 && (
        <VisitCalendar visits={visits}
          onAddVisit={date => { setEditVisit(null); setPrefillDate(date); setScheduleOpen(true); }}
          onViewVisit={v => { setEditVisit(v); setScheduleOpen(true); }}
        />
      )}

      {mainTab === 2 && <AgentRouteView visits={visits} />}
      {mainTab === 3 && <VisitAnalytics visits={visits} />}

      {/* ── Dialogs ── */}
      <ScheduleVisitDialog
        open={scheduleOpen}
        onClose={() => { setScheduleOpen(false); setEditVisit(null); }}
        initial={editVisit} leads={leads} agents={agents}
        prefillDate={prefillDate}
        onSave={fetchData}
      />
      {checkInVisit && (
        <CheckInDialog visit={checkInVisit} open={!!checkInVisit}
          onClose={() => setCheckInVisit(null)} onSave={fetchData} />
      )}
      {feedbackVisit && (
        <FeedbackDialog visit={feedbackVisit} open={!!feedbackVisit}
          onClose={() => setFeedbackVisit(null)} onSave={fetchData} />
      )}
    </Box>
  );
};

export default SiteVisitsPage;