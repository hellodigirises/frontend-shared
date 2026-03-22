import React, { useState } from 'react';
import {
  Box, Typography, Stack, Button, Grid, Chip, Paper, Divider,
  Avatar, LinearProgress, TextField, FormControl, InputLabel,
  Select, MenuItem, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, InputAdornment, CircularProgress
} from '@mui/material';
import {
  DownloadOutlined, SearchOutlined, AddOutlined,
  AutoAwesomeOutlined, ScheduleOutlined, SendOutlined
} from '@mui/icons-material';
import {
  AgentMetric, PartnerMetric, ForecastData, TrendPoint,
  CHART_PALETTE, fmtINR, fmtGrowth, avatarColor, initials, DATE_RANGES
} from './analyticsTypes';
import {
  KpiCard, ChartCard, AreaChart, HBarChart, VBarChart,
  DonutChart, GaugeRing, Sparkline
} from './AnalyticsCharts';

// ─── Revenue Analytics ────────────────────────────────────────────────────────

export const RevenueAnalyticsSection: React.FC<{
  monthly: TrendPoint[];
  byProject: { label: string; value: number; color?: string }[];
  byAgent: AgentMetric[];
  byPartner: PartnerMetric[];
  totalRevenue: number;
  totalTarget?: number;
}> = ({ monthly, byProject, byAgent, byPartner, totalRevenue, totalTarget }) => {
  const monthData = monthly.map(t => ({ label: t.period, value: t.value }));
  const ytdRevenue = monthly.reduce((s, t) => s + t.value, 0);
  const targetPct = totalTarget ? Math.round(ytdRevenue / totalTarget * 100) : null;
  const prevMonthRev = monthly.slice(-2, -1)[0]?.value ?? 0;
  const currMonthRev = monthly.slice(-1)[0]?.value ?? 0;
  const momGrowth = prevMonthRev ? ((currMonthRev - prevMonthRev) / prevMonthRev) * 100 : 0;
  const g = fmtGrowth(momGrowth);

  return (
    <Box>
      <Grid container spacing={2} mb={4}>
        {[
          { icon: '💰', label: 'Total Revenue (YTD)', value: fmtINR(ytdRevenue), color: '#f59e0b', trend: { value: momGrowth } },
          { icon: '📈', label: 'Current Month',       value: fmtINR(currMonthRev), color: '#10b981', sub: `${g.icon} ${g.label} vs last month` },
          { icon: '🎯', label: 'Avg Monthly',         value: fmtINR(Math.round(ytdRevenue / (monthly.length || 1))), color: '#6366f1' },
          ...(totalTarget ? [{ icon: '🏁', label: 'Target Progress', value: `${targetPct}%`, color: '#8b5cf6', sub: `${fmtINR(ytdRevenue)} of ${fmtINR(totalTarget)}` }] : []),
        ].map((k, i) => <Grid item xs={6} sm={3} key={i}><KpiCard {...(k as any)} /></Grid>)}
      </Grid>

      {totalTarget && (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3.5, mb: 3, bgcolor: '#0f172a' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography sx={{ fontWeight: 900, color: '#f1f5f9', fontSize: '1.1rem' }}>Annual Revenue Target</Typography>
              <Typography sx={{ color: '#64748b', fontSize: 13 }}>
                {fmtINR(ytdRevenue)} collected · {fmtINR(totalTarget - ytdRevenue)} remaining
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '2rem', fontWeight: 900, color: '#f59e0b' }}>{targetPct}%</Typography>
          </Stack>
          <Box sx={{ height: 10, borderRadius: 5, bgcolor: '#1e293b', overflow: 'hidden' }}>
            <Box sx={{ height: '100%', width: `${Math.min(100, targetPct ?? 0)}%`, borderRadius: 5, transition: 'width .8s ease',
              background: 'linear-gradient(90deg, #f59e0b, #10b981)' }} />
          </Box>
        </Paper>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <ChartCard title="Monthly Revenue Trend" sub="Collected revenue per month">
            <AreaChart data={monthData} color="#f59e0b" height={220} formatValue={v => fmtINR(v)} />
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <ChartCard title="Revenue by Project">
            <DonutChart data={byProject.map((d, i) => ({ ...d, color: d.color ?? CHART_PALETTE[i] }))}
              size={160} centerLabel="Total" centerValue={fmtINR(byProject.reduce((s, d) => s + d.value, 0))} />
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard title="Revenue by Agent" sub="Top revenue generators">
            <HBarChart showRank data={byAgent.sort((a, b) => b.revenue - a.revenue).map((a, i) => ({
              label: a.name, value: a.revenue,
              sub: `${a.bookings} bookings`, color: CHART_PALETTE[i % CHART_PALETTE.length],
            }))} formatValue={v => fmtINR(v)} />
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard title="Revenue by Channel Partner" sub="Partner contribution">
            <HBarChart showRank data={byPartner.sort((a, b) => b.revenue - a.revenue).map((p, i) => ({
              label: p.name, value: p.revenue,
              sub: `${p.converted} deals · ${fmtINR(p.commission)} comm.`,
              color: CHART_PALETTE[(i + 3) % CHART_PALETTE.length],
            }))} formatValue={v => fmtINR(v)} />
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
};

// ─── Agent Performance ────────────────────────────────────────────────────────

export const AgentPerformanceSection: React.FC<{ agents: AgentMetric[] }> = ({ agents }) => {
  const total = agents.reduce((acc, a) => ({
    leads: acc.leads + a.leads, visits: acc.visits + a.visits,
    bookings: acc.bookings + a.bookings, revenue: acc.revenue + a.revenue,
  }), { leads: 0, visits: 0, bookings: 0, revenue: 0 });

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <Box>
      <Grid container spacing={2} mb={4}>
        {[
          { icon: '👥', label: 'Active Agents',    value: agents.length,               color: '#6366f1' },
          { icon: '🎯', label: 'Total Leads',       value: total.leads.toLocaleString(), color: '#0ea5e9' },
          { icon: '📝', label: 'Total Bookings',    value: total.bookings.toLocaleString(), color: '#10b981' },
          { icon: '💰', label: 'Revenue Generated', value: fmtINR(total.revenue),       color: '#f59e0b' },
        ].map(k => <Grid item xs={6} sm={3} key={k.label}><KpiCard {...k} /></Grid>)}
      </Grid>

      {/* Agent leaderboard table */}
      <ChartCard title="Agent Performance Leaderboard" sub="Ranked by bookings & revenue">
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                {['Rank', 'Agent', 'Leads', 'Follow-ups', 'Visits', 'Bookings', 'Conv. Rate', 'Revenue', 'Avg Response'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 800, fontSize: 11, py: 1.5, color: '#374151', whiteSpace: 'nowrap' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {agents.sort((a, b) => b.bookings - a.bookings).map((agent, idx) => (
                <TableRow key={agent.id} hover sx={{ '& td': { py: 1.5 } }}>
                  <TableCell>
                    <Typography sx={{ textAlign: 'center', fontSize: 18 }}>{medals[idx] ?? idx + 1}</Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: avatarColor(agent.name), fontSize: 11, fontWeight: 900 }}>
                        {initials(agent.name)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={800}>{agent.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{agent.role}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  {[agent.leads, agent.followUps, agent.visits, agent.bookings].map((v, i) => (
                    <TableCell key={i}><Typography variant="body2" fontWeight={700}>{v.toLocaleString()}</Typography></TableCell>
                  ))}
                  <TableCell>
                    <Chip label={`${agent.conversionRate}%`} size="small"
                      sx={{ bgcolor: agent.conversionRate >= 20 ? '#d1fae5' : agent.conversionRate >= 10 ? '#fef3c7' : '#fee2e2',
                        color: agent.conversionRate >= 20 ? '#065f46' : agent.conversionRate >= 10 ? '#92400e' : '#991b1b',
                        fontWeight: 800, fontSize: 11 }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={900} sx={{ color: '#f59e0b' }}>{fmtINR(agent.revenue)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {agent.avgResponseTimeHrs != null ? `${agent.avgResponseTimeHrs}h` : '—'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </ChartCard>

      {/* Per-metric charts */}
      <Grid container spacing={3} mt={1}>
        <Grid item xs={12} md={6}>
          <ChartCard title="Conversion Rate Comparison">
            <HBarChart data={agents.sort((a, b) => b.conversionRate - a.conversionRate).map((a, i) => ({
              label: a.name, value: a.conversionRate, sub: `${a.bookings} bookings`,
              color: CHART_PALETTE[i % CHART_PALETTE.length],
            }))} formatValue={v => `${v}%`} />
          </ChartCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <ChartCard title="Revenue per Agent">
            <HBarChart showRank data={agents.sort((a, b) => b.revenue - a.revenue).map((a, i) => ({
              label: a.name, value: a.revenue, color: CHART_PALETTE[i % CHART_PALETTE.length],
            }))} formatValue={v => fmtINR(v)} />
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
};

// ─── Channel Partner Analytics ────────────────────────────────────────────────

export const PartnerAnalyticsSection: React.FC<{ partners: PartnerMetric[] }> = ({ partners }) => {
  const totals = partners.reduce((a, p) => ({
    deals: a.deals + p.deals, converted: a.converted + p.converted,
    revenue: a.revenue + p.revenue, commission: a.commission + p.commission,
    pending: a.pending + p.pendingCommission,
  }), { deals: 0, converted: 0, revenue: 0, commission: 0, pending: 0 });

  return (
    <Box>
      <Grid container spacing={2} mb={4}>
        {[
          { icon: '🤝', label: 'Active Partners',     value: partners.length,                  color: '#ec4899' },
          { icon: '📋', label: 'Deals Registered',    value: totals.deals.toLocaleString(),     color: '#6366f1' },
          { icon: '✅', label: 'Deals Converted',     value: totals.converted.toLocaleString(),  color: '#10b981' },
          { icon: '💰', label: 'Revenue via Partners', value: fmtINR(totals.revenue),            color: '#f59e0b' },
          { icon: '🏅', label: 'Commission Paid',     value: fmtINR(totals.commission),         color: '#8b5cf6' },
          { icon: '⏳', label: 'Commission Pending',  value: fmtINR(totals.pending),            color: '#ef4444' },
        ].map(k => <Grid item xs={6} sm={4} md={2} key={k.label}><KpiCard {...k} /></Grid>)}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <ChartCard title="Partner Revenue Leaderboard" sub="Top performing channel partners">
            <Stack spacing={1.5}>
              {partners.sort((a, b) => b.revenue - a.revenue).map((p, i) => {
                const mx = partners[0].revenue;
                const pct = Math.round((p.revenue / mx) * 100);
                const color = CHART_PALETTE[i % CHART_PALETTE.length];
                return (
                  <Box key={p.id} sx={{ p: 2, borderRadius: 3, bgcolor: '#fafafa', border: '1px solid #f1f5f9' }}>
                    <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
                      <Typography sx={{ fontSize: 18, width: 28 }}>{i < 3 ? ['🥇','🥈','🥉'][i] : `${i+1}`}</Typography>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: avatarColor(p.name), fontSize: 11, fontWeight: 900 }}>
                        {initials(p.name)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={800}>{p.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{p.type} · {p.converted}/{p.deals} deals · {p.conversionRate}%</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" fontWeight={900} sx={{ color: '#f59e0b' }}>{fmtINR(p.revenue)}</Typography>
                        <Typography variant="caption" sx={{ color: '#8b5cf6', fontWeight: 700 }}>Comm: {fmtINR(p.commission)}</Typography>
                      </Box>
                    </Stack>
                    <Box sx={{ height: 6, bgcolor: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                      <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: color, borderRadius: 3, transition: 'width .6s ease' }} />
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={5}>
          <Stack spacing={3} sx={{ height: '100%' }}>
            <ChartCard title="Deals by Partner">
              <DonutChart data={partners.map((p, i) => ({ label: p.name, value: p.converted, color: CHART_PALETTE[i] }))}
                size={150} centerLabel="Conversions" />
            </ChartCard>
            <ChartCard title="Commission Status">
              <Stack spacing={1.5}>
                {partners.slice(0, 4).map((p, i) => (
                  <Stack key={p.id} direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar sx={{ width: 24, height: 24, fontSize: 9, bgcolor: avatarColor(p.name), fontWeight: 800 }}>{initials(p.name)}</Avatar>
                      <Typography variant="caption" fontWeight={700}>{p.name}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 700 }}>✅ {fmtINR(p.commission)}</Typography>
                      {p.pendingCommission > 0 && (
                        <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 700 }}>⏳ {fmtINR(p.pendingCommission)}</Typography>
                      )}
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </ChartCard>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

// ─── Forecast Engine ──────────────────────────────────────────────────────────

export const ForecastSection: React.FC<{
  forecast: ForecastData;
  pipelineByStage: { stage: string; value: number; weight: number; color: string }[];
}> = ({ forecast, pipelineByStage }) => {
  const g = fmtGrowth(10);   // example growth

  return (
    <Box>
      {/* Header */}
      <Box sx={{ p: 3.5, borderRadius: 4, mb: 4, background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #1a1a3e 100%)', color: '#fff' }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={3}>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
              <AutoAwesomeOutlined sx={{ color: '#f59e0b', fontSize: 22 }} />
              <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.6rem', fontWeight: 700, color: '#f1f5f9' }}>
                AI Revenue Forecast
              </Typography>
            </Stack>
            <Typography sx={{ color: '#64748b', fontSize: 13 }}>
              {forecast.forecastPeriod} · Based on current pipeline & historical conversion
            </Typography>
          </Box>
          <Chip label={`${forecast.confidence}% confidence`} size="small"
            sx={{ bgcolor: '#10b98120', color: '#10b981', fontWeight: 800, border: '1px solid #10b98140' }} />
        </Stack>

        <Grid container spacing={3}>
          {[
            { label: 'Pipeline Value',      value: fmtINR(forecast.pipelineValue),       sub: 'Current active pipeline',       color: '#94a3b8' },
            { label: 'Weighted Pipeline',   value: fmtINR(forecast.weightedPipeline),    sub: 'Probability-adjusted',           color: '#c084fc' },
            { label: 'Expected Revenue',    value: fmtINR(forecast.expectedRevenue),     sub: `At ${forecast.conversionRate}% conversion`, color: '#fbbf24' },
            { label: 'Expected Bookings',   value: forecast.expectedBookings,            sub: 'Estimated closures',             color: '#34d399' },
            { label: 'Projected Collections', value: fmtINR(forecast.projectedCollections), sub: 'Payment inflow expected',    color: '#38bdf8' },
          ].map(k => (
            <Grid item xs={6} sm={4} md key={k.label}>
              <Box>
                <Typography sx={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#64748b', mb: 0.5 }}>{k.label}</Typography>
                <Typography sx={{ fontSize: '1.3rem', fontWeight: 900, color: k.color }}>{k.value}</Typography>
                <Typography sx={{ fontSize: 11, color: '#475569' }}>{k.sub}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Weighted pipeline by stage */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ChartCard title="Weighted Pipeline by Stage" sub="Value × conversion probability">
            <Stack spacing={1.5} mt={1}>
              {pipelineByStage.map((s, i) => {
                const weighted = Math.round(s.value * s.weight / 100);
                const mx = pipelineByStage[0].value;
                return (
                  <Box key={s.stage}>
                    <Stack direction="row" justifyContent="space-between" mb={0.5}>
                      <Typography variant="caption" fontWeight={700}>{s.stage}</Typography>
                      <Stack direction="row" spacing={2}>
                        <Typography variant="caption" color="text.secondary">Raw: {fmtINR(s.value)}</Typography>
                        <Typography variant="caption" fontWeight={800} sx={{ color: s.color }}>
                          Wtd: {fmtINR(weighted)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#9ca3af' }}>{s.weight}%</Typography>
                      </Stack>
                    </Stack>
                    <Box sx={{ height: 10, bgcolor: '#f3f4f6', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
                      <Box sx={{ height: '100%', width: `${Math.round(s.value / mx * 100)}%`, bgcolor: s.color, opacity: 0.3, borderRadius: 2 }} />
                      <Box sx={{ height: '100%', width: `${Math.round(weighted / mx * 100)}%`, bgcolor: s.color, borderRadius: 2, position: 'absolute', top: 0 }} />
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard title="Forecast Confidence" sub="Projection accuracy metrics">
            <Stack spacing={3} pt={2} alignItems="center">
              <GaugeRing value={forecast.confidence} color="#10b981" size={160} label="Overall Confidence" subLabel={`${forecast.forecastPeriod}`} />
              <Stack spacing={1.5} width="100%">
                {[
                  { label: 'Pipeline Completeness', value: 82, color: '#6366f1' },
                  { label: 'Historical Accuracy',    value: 78, color: '#f59e0b' },
                  { label: 'Data Freshness',         value: 95, color: '#10b981' },
                ].map(m => (
                  <Stack key={m.label} direction="row" alignItems="center" spacing={2}>
                    <Typography variant="caption" fontWeight={700} sx={{ width: 160, flexShrink: 0 }}>{m.label}</Typography>
                    <Box sx={{ flex: 1, height: 8, bgcolor: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                      <Box sx={{ height: '100%', width: `${m.value}%`, bgcolor: m.color, borderRadius: 4, transition: 'width .6s ease' }} />
                    </Box>
                    <Typography variant="caption" fontWeight={900} sx={{ color: m.color, width: 32 }}>{m.value}%</Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
};

// ─── Custom Report Builder ────────────────────────────────────────────────────

export const CustomReportBuilder: React.FC = () => {
  const [filters, setFilters] = useState({
    metric: 'BOOKINGS', project: '', agent: '', partner: '',
    source: '', dateFrom: '', dateTo: '', groupBy: 'MONTH',
  });
  const [schedule, setSchedule] = useState({ enabled: false, freq: 'WEEKLY', email: '', day: 'MON' });
  const [running, setRunning] = useState(false);
  const set = (k: string, v: any) => setFilters(f => ({ ...f, [k]: v }));

  const METRICS = [
    { v: 'BOOKINGS',    l: 'Bookings Count' },
    { v: 'REVENUE',     l: 'Revenue Collected' },
    { v: 'LEADS',       l: 'Lead Generation' },
    { v: 'VISITS',      l: 'Site Visits' },
    { v: 'CONVERSION',  l: 'Conversion Rate' },
    { v: 'PIPELINE',    l: 'Pipeline Value' },
    { v: 'PAYMENTS',    l: 'Payment Collections' },
    { v: 'OVERDUE',     l: 'Overdue Payments' },
  ];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 700, fontSize: '1.5rem', color: '#0f172a' }}>
            Custom Report Builder
          </Typography>
          <Typography variant="body2" color="text.secondary">Build, export and schedule bespoke analytics reports</Typography>
        </Box>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3.5 }}>
            <Typography variant="body1" fontWeight={800} mb={2.5}>⚙️ Report Configuration</Typography>
            <Stack spacing={2.5}>
              <Box>
                <Typography sx={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af', mb: 1 }}>Primary Metric</Typography>
                <Grid container spacing={1}>
                  {METRICS.map(m => (
                    <Grid item xs={6} key={m.v}>
                      <Box onClick={() => set('metric', m.v)}
                        sx={{ p: 1.25, borderRadius: 2.5, cursor: 'pointer', textAlign: 'center', border: '1.5px solid',
                          borderColor: filters.metric === m.v ? '#6366f1' : '#e5e7eb',
                          bgcolor: filters.metric === m.v ? '#eef2ff' : '#fff', transition: 'all .12s' }}>
                        <Typography variant="caption" fontWeight={800} sx={{ color: filters.metric === m.v ? '#6366f1' : '#9ca3af', fontSize: 10 }}>{m.l}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Divider />

              {[
                { k: 'project', label: 'Filter by Project',  opts: ['All Projects', 'Sunrise Heights', 'Green Valley', 'Metro Square'] },
                { k: 'agent',   label: 'Filter by Agent',    opts: ['All Agents', 'Rahul Sharma', 'Priya Singh', 'Amit Kumar'] },
                { k: 'source',  label: 'Filter by Source',   opts: ['All Sources', 'Facebook Ads', 'Google Ads', 'Channel Partner', 'Referral'] },
                { k: 'groupBy', label: 'Group By',           opts: ['DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR'] },
              ].map(f => (
                <FormControl key={f.k} fullWidth size="small">
                  <InputLabel>{f.label}</InputLabel>
                  <Select value={(filters as any)[f.k] || f.opts[0]} label={f.label}
                    onChange={e => set(f.k, e.target.value)} sx={{ borderRadius: 2.5 }}>
                    {f.opts.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                  </Select>
                </FormControl>
              ))}

              <Stack direction="row" spacing={1.5}>
                <TextField fullWidth label="From" size="small" type="date" InputLabelProps={{ shrink: true }}
                  value={filters.dateFrom} onChange={e => set('dateFrom', e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
                <TextField fullWidth label="To" size="small" type="date" InputLabelProps={{ shrink: true }}
                  value={filters.dateTo} onChange={e => set('dateTo', e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
              </Stack>

              <Button fullWidth variant="contained" disableElevation
                onClick={() => { setRunning(true); setTimeout(() => setRunning(false), 1500); }}
                sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2.5, py: 1.25 }}>
                {running ? <CircularProgress size={18} color="inherit" /> : '🔍 Generate Report'}
              </Button>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            {/* Export options */}
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3.5 }}>
              <Typography variant="body1" fontWeight={800} mb={2}>📥 Export Report</Typography>
              <Stack direction="row" spacing={1.5} flexWrap="wrap">
                {[
                  { label: 'Export CSV',   icon: '📄', color: '#10b981', bg: '#d1fae5' },
                  { label: 'Export Excel', icon: '📊', color: '#3b82f6', bg: '#dbeafe' },
                  { label: 'Export PDF',   icon: '📑', color: '#ef4444', bg: '#fee2e2' },
                ].map(e => (
                  <Button key={e.label} startIcon={<Typography fontSize={16}>{e.icon}</Typography>}
                    variant="outlined" sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2.5,
                      borderColor: e.color, color: e.color, bgcolor: e.bg, '&:hover': { bgcolor: e.bg } }}>
                    {e.label}
                  </Button>
                ))}
              </Stack>
            </Paper>

            {/* Schedule Reports */}
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                  <Typography variant="body1" fontWeight={800}>⏰ Schedule Report</Typography>
                  <Typography variant="caption" color="text.secondary">Automatically email reports on a schedule</Typography>
                </Box>
                <Box onClick={() => setSchedule(s => ({ ...s, enabled: !s.enabled }))}
                  sx={{ width: 44, height: 24, borderRadius: 12, bgcolor: schedule.enabled ? '#6366f1' : '#d1d5db',
                    cursor: 'pointer', position: 'relative', transition: 'all .2s' }}>
                  <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: '#fff', position: 'absolute',
                    top: 3, left: schedule.enabled ? 23 : 3, transition: 'left .2s' }} />
                </Box>
              </Stack>

              {schedule.enabled && (
                <Stack spacing={2}>
                  <Grid container spacing={1.5}>
                    {[
                      { k: 'freq', label: 'Frequency', opts: ['DAILY', 'WEEKLY', 'MONTHLY'] },
                      { k: 'day',  label: 'Day',       opts: ['MON', 'TUE', 'WED', 'THU', 'FRI'] },
                    ].map(f => (
                      <Grid item xs={6} key={f.k}>
                        <FormControl fullWidth size="small">
                          <InputLabel>{f.label}</InputLabel>
                          <Select value={(schedule as any)[f.k]} label={f.label}
                            onChange={e => setSchedule(s => ({ ...s, [f.k]: e.target.value }))} sx={{ borderRadius: 2.5 }}>
                            {f.opts.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Grid>
                    ))}
                  </Grid>
                  <TextField fullWidth label="Recipient Email(s)" size="small"
                    placeholder="admin@company.com, manager@company.com"
                    value={schedule.email} onChange={e => setSchedule(s => ({ ...s, email: e.target.value }))}
                    InputProps={{ startAdornment: <InputAdornment position="start"><ScheduleOutlined sx={{ fontSize: 16 }} /></InputAdornment> }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
                  <Button variant="contained" disableElevation startIcon={<SendOutlined />}
                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2.5, alignSelf: 'flex-start' }}>
                    Save Schedule
                  </Button>
                </Stack>
              )}
            </Paper>

            {/* Saved reports */}
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3.5 }}>
              <Typography variant="body1" fontWeight={800} mb={2}>📋 Saved Reports</Typography>
              <Stack spacing={1.25}>
                {[
                  { name: 'Monthly Revenue Summary',     schedule: 'Every 1st — Email',  last: '3 days ago' },
                  { name: 'Weekly Booking Report',        schedule: 'Every Monday — Email', last: '2 days ago' },
                  { name: 'Overdue Payments Report',      schedule: 'Daily — Email',       last: '1 hour ago' },
                  { name: 'Agent Performance Q4',         schedule: 'Manual',              last: '1 week ago' },
                ].map((r, i) => (
                  <Stack key={i} direction="row" alignItems="center" justifyContent="space-between"
                    sx={{ p: 2, borderRadius: 2.5, bgcolor: '#fafafa', border: '1px solid #f1f5f9' }}>
                    <Box>
                      <Typography variant="body2" fontWeight={700}>{r.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{r.schedule} · Last run: {r.last}</Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" variant="outlined" sx={{ textTransform: 'none', borderRadius: 2, fontSize: 11, py: 0.5, px: 1.5, fontWeight: 700 }}>Run</Button>
                      <Button size="small" startIcon={<DownloadOutlined sx={{ fontSize: 14 }} />}
                        sx={{ textTransform: 'none', borderRadius: 2, fontSize: 11, py: 0.5, px: 1.5, fontWeight: 700, color: '#6366f1' }}>
                        Export
                      </Button>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};