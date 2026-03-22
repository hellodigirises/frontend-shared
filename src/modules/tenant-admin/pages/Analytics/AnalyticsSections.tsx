import React, { useMemo } from 'react';
import {
  Box, Typography, Stack, Button, Grid, Chip,
  Paper, Divider, Avatar, LinearProgress
} from '@mui/material';
import { DownloadOutlined } from '@mui/icons-material';
import {
  OverviewMetrics, FunnelStage, TrendPoint, LeadSourceBreakdown,
  AgentMetric, ProjectMetric, ForecastData,
  CHART_PALETTE, LEAD_SOURCE_COLORS, fmtINR, fmtGrowth, avatarColor, initials
} from './analyticsTypes';
import {
  KpiCard, ChartCard, AreaChart, HBarChart, VBarChart,
  DonutChart, FunnelChart, GaugeRing, Sparkline
} from './AnalyticsCharts';

// ─── Executive Dashboard ──────────────────────────────────────────────────────

export const ExecutiveDashboard: React.FC<{
  metrics: OverviewMetrics;
  trends: { revenue: TrendPoint[]; bookings: TrendPoint[]; leads: TrendPoint[] };
  funnel: FunnelStage[];
  projects: ProjectMetric[];
}> = ({ metrics, trends, funnel, projects }) => {
  const revenueData = trends.revenue.map(t => ({ label: t.period, value: t.value }));
  const bookingsData = trends.bookings.map(t => ({ label: t.period, value: t.value }));
  const revenueVsBookings = trends.revenue.map((t, i) => ({ label: t.period, value: t.value, value2: trends.bookings[i]?.value ?? 0 }));

  return (
    <Box>
      {/* KPI Grid */}
      <Grid container spacing={2} mb={4}>
        {[
          { icon: '🎯', label: 'Total Leads',         value: metrics.totalLeads.toLocaleString(),  color: '#6366f1', trend: { value: metrics.leadGrowth },    sparkData: trends.leads.map(t => t.value) },
          { icon: '🏠', label: 'Site Visits',          value: metrics.totalVisits.toLocaleString(), color: '#0ea5e9' },
          { icon: '📝', label: 'Bookings',             value: metrics.totalBookings.toLocaleString(), color: '#10b981', trend: { value: metrics.bookingGrowth }, sparkData: trends.bookings.map(t => t.value) },
          { icon: '💰', label: 'Revenue Collected',    value: fmtINR(metrics.totalRevenue),         color: '#f59e0b', trend: { value: metrics.revenueGrowth },  sparkData: trends.revenue.map(t => t.value) },
          { icon: '⏳', label: 'Pending Payments',     value: fmtINR(metrics.pendingPayments),      color: '#8b5cf6' },
          { icon: '🔴', label: 'Overdue Payments',     value: fmtINR(metrics.overduePayments),      color: '#ef4444' },
          { icon: '🤝', label: 'Active Partners',      value: metrics.activePartners,               color: '#ec4899' },
          { icon: '👥', label: 'Active Agents',        value: metrics.activeAgents,                 color: '#14b8a6' },
        ].map(k => (
          <Grid item xs={6} sm={4} md={3} key={k.label}>
            <KpiCard {...k} />
          </Grid>
        ))}
      </Grid>

      {/* Conversion rates strip */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={4}>
        {[
          { label: 'Lead → Visit Conversion', value: metrics.leadConversionRate, color: '#6366f1', sub: 'of leads booked a visit' },
          { label: 'Visit → Booking Rate',    value: metrics.visitConversionRate, color: '#10b981', sub: 'of visits led to booking' },
          { label: 'Cancellation Rate',       value: metrics.bookingCancellationRate, color: '#ef4444', sub: 'bookings cancelled' },
          { label: 'Avg Deal Size',           value: undefined, custom: fmtINR(metrics.avgDealSize), color: '#f59e0b', sub: 'per booking' },
        ].map(r => (
          <Paper key={r.label} variant="outlined" sx={{ p: 2.5, borderRadius: 3.5, flex: 1 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography sx={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af', mb: 0.5 }}>{r.label}</Typography>
                <Typography sx={{ fontSize: '1.4rem', fontWeight: 900, color: r.color }}>
                  {r.custom ?? `${r.value}%`}
                </Typography>
                <Typography sx={{ fontSize: 11, color: '#9ca3af' }}>{r.sub}</Typography>
              </Box>
              <GaugeRing value={r.value ?? 0} color={r.color} size={72} />
            </Stack>
          </Paper>
        ))}
      </Stack>

      <Grid container spacing={3}>
        {/* Revenue trend */}
        <Grid item xs={12} md={8}>
          <ChartCard title="Revenue & Bookings Trend" sub="Monthly performance">
            <AreaChart data={revenueVsBookings} color="#6366f1" color2="#10b981" height={220}
              formatValue={v => fmtINR(v)} />
            <Stack direction="row" spacing={2} mt={1.5} justifyContent="center">
              {[{ color: '#6366f1', label: 'Revenue' }, { color: '#10b981', label: 'Bookings', dashed: true }].map(l => (
                <Stack key={l.label} direction="row" alignItems="center" spacing={0.75}>
                  <Box sx={{ width: 16, height: 2.5, bgcolor: l.color, borderRadius: 1, ...(('dashed' in l && l.dashed) ? { backgroundImage: `repeating-linear-gradient(90deg,${l.color} 0,${l.color} 4px,transparent 4px,transparent 8px)`, bgcolor: 'transparent' } : {}) }} />
                  <Typography variant="caption" fontWeight={700} color="text.secondary">{l.label}</Typography>
                </Stack>
              ))}
            </Stack>
          </ChartCard>
        </Grid>

        {/* Conversion funnel */}
        <Grid item xs={12} md={4}>
          <ChartCard title="Sales Funnel" sub="Lead to booking conversion">
            <FunnelChart stages={funnel} />
          </ChartCard>
        </Grid>

        {/* Project performance */}
        <Grid item xs={12} md={6}>
          <ChartCard title="Project Demand" sub="Units sold vs available">
            <Stack spacing={2}>
              {projects.map((p, i) => (
                <Box key={p.id}>
                  <Stack direction="row" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2" fontWeight={700}>{p.name}</Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="caption" color="text.secondary">{p.soldUnits}/{p.totalUnits} units</Typography>
                      <Typography variant="caption" fontWeight={900} sx={{ color: CHART_PALETTE[i % CHART_PALETTE.length] }}>
                        {p.sellThrough}%
                      </Typography>
                    </Stack>
                  </Stack>
                  <Box sx={{ height: 10, bgcolor: '#f3f4f6', borderRadius: 5, overflow: 'hidden' }}>
                    <Stack direction="row" sx={{ height: '100%' }}>
                      <Box sx={{ width: `${Math.round(p.soldUnits/p.totalUnits*100)}%`, bgcolor: CHART_PALETTE[i % CHART_PALETTE.length], borderRadius: 5, transition: 'width .6s ease' }} />
                      <Box sx={{ width: `${Math.round(p.bookedUnits/p.totalUnits*100)}%`, bgcolor: CHART_PALETTE[i % CHART_PALETTE.length], opacity: 0.35 }} />
                    </Stack>
                  </Box>
                  <Stack direction="row" spacing={2} mt={0.5}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Box sx={{ width: 8, height: 8, borderRadius: 1, bgcolor: CHART_PALETTE[i % CHART_PALETTE.length] }} />
                      <Typography sx={{ fontSize: 10, color: '#6b7280' }}>Sold: {p.soldUnits}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Box sx={{ width: 8, height: 8, borderRadius: 1, bgcolor: CHART_PALETTE[i % CHART_PALETTE.length], opacity: 0.4 }} />
                      <Typography sx={{ fontSize: 10, color: '#6b7280' }}>Booked: {p.bookedUnits}</Typography>
                    </Stack>
                    <Typography sx={{ fontSize: 10, color: '#9ca3af', ml: 'auto !important' }}>Revenue: {fmtINR(p.revenue)}</Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </ChartCard>
        </Grid>

        {/* Bookings bar chart */}
        <Grid item xs={12} md={6}>
          <ChartCard title="Monthly Bookings" sub="Booking volume per month">
            <VBarChart data={bookingsData.map(d => ({ ...d, color: '#10b981' }))} height={220} />
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
};

// ─── Lead Analytics ───────────────────────────────────────────────────────────

export const LeadAnalyticsSection: React.FC<{
  sources: LeadSourceBreakdown[];
  trends: TrendPoint[];
  byProject: { label: string; value: number; color?: string }[];
  byBudget: { label: string; value: number }[];
  byAgent: AgentMetric[];
}> = ({ sources, trends, byProject, byBudget, byAgent }) => {
  const trendData = trends.map(t => ({ label: t.period, value: t.value }));

  return (
    <Box>
      {/* Source KPI strip */}
      <Grid container spacing={2} mb={4}>
        {[
          { icon: '🎯', label: 'Total Leads',    value: sources.reduce((s, x) => s + x.count, 0).toLocaleString(), color: '#6366f1' },
          { icon: '✅', label: 'Converted',      value: sources.reduce((s, x) => s + x.converted, 0).toLocaleString(), color: '#10b981' },
          { icon: '📊', label: 'Avg Conversion', value: `${Math.round(sources.reduce((s, x) => s + x.conversionRate, 0) / (sources.length || 1))}%`, color: '#f59e0b' },
          { icon: '🏆', label: 'Top Source',     value: sources.sort((a,b) => b.count - a.count)[0]?.source ?? '—', color: '#8b5cf6' },
        ].map(k => <Grid item xs={6} sm={3} key={k.label}><KpiCard {...k} /></Grid>)}
      </Grid>

      <Grid container spacing={3}>
        {/* Source donut */}
        <Grid item xs={12} md={5}>
          <ChartCard title="Lead Sources Distribution" sub="Where are leads coming from">
            <DonutChart data={sources.map(s => ({ label: s.source, value: s.count, color: LEAD_SOURCE_COLORS[s.source] ?? '#6366f1' }))} size={180} centerLabel="Total Leads" centerValue={sources.reduce((s, x) => s + x.count, 0).toLocaleString()} />
          </ChartCard>
        </Grid>

        {/* Source conversion table */}
        <Grid item xs={12} md={7}>
          <ChartCard title="Source Performance" sub="Conversion rate by lead source">
            <Stack spacing={1.25}>
              {sources.sort((a, b) => b.conversionRate - a.conversionRate).map((s, i) => {
                const color = LEAD_SOURCE_COLORS[s.source] ?? CHART_PALETTE[i % CHART_PALETTE.length];
                return (
                  <Box key={s.source} sx={{ p: 1.75, borderRadius: 2.5, bgcolor: '#fafafa', border: '1px solid #f1f5f9' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.75}>
                      <Stack direction="row" alignItems="center" spacing={1.25}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                        <Typography variant="body2" fontWeight={700}>{s.source}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="caption" color="text.secondary">{s.count} leads</Typography>
                        <Typography variant="caption" fontWeight={800} sx={{ color, bgcolor: color + '18', px: 1, py: 0.25, borderRadius: 1.5 }}>
                          {s.conversionRate}% conv.
                        </Typography>
                      </Stack>
                    </Stack>
                    <Box sx={{ height: 5, borderRadius: 3, bgcolor: '#f3f4f6', overflow: 'hidden' }}>
                      <Box sx={{ height: '100%', width: `${s.percentage}%`, bgcolor: color, borderRadius: 3, transition: 'width .6s ease' }} />
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </ChartCard>
        </Grid>

        {/* Lead growth trend */}
        <Grid item xs={12} md={8}>
          <ChartCard title="Lead Growth Trend" sub="Monthly lead generation">
            <AreaChart data={trendData} color="#6366f1" height={200} />
          </ChartCard>
        </Grid>

        {/* Leads by project */}
        <Grid item xs={12} md={4}>
          <ChartCard title="Leads by Project">
            <HBarChart data={byProject.map((d, i) => ({ ...d, color: CHART_PALETTE[i % CHART_PALETTE.length] }))} />
          </ChartCard>
        </Grid>

        {/* Budget distribution */}
        <Grid item xs={12} md={6}>
          <ChartCard title="Leads by Budget Range" sub="Segment distribution">
            <VBarChart data={byBudget.map((d, i) => ({ ...d, color: CHART_PALETTE[i % CHART_PALETTE.length] }))} height={180} />
          </ChartCard>
        </Grid>

        {/* Agent lead handling */}
        <Grid item xs={12} md={6}>
          <ChartCard title="Leads by Agent" sub="Top performers">
            <HBarChart data={byAgent.slice(0, 6).map((a, i) => ({
              label: a.name, value: a.leads,
              sub: `${a.conversionRate}% conv`, color: CHART_PALETTE[i % CHART_PALETTE.length]
            }))} showRank />
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
};

// ─── Pipeline Analytics ───────────────────────────────────────────────────────

export const PipelineAnalyticsSection: React.FC<{
  stages: { stage: string; label: string; count: number; value: number; avgDays: number; color: string; dropoff?: number }[];
  pipelineValue: number;
  lostReasons: { reason: string; count: number }[];
}> = ({ stages, pipelineValue, lostReasons }) => (
  <Box>
    <Grid container spacing={2} mb={4}>
      {[
        { icon: '📊', label: 'Pipeline Value',    value: fmtINR(pipelineValue),           color: '#6366f1' },
        { icon: '⌚', label: 'Avg Stage Duration', value: `${Math.round(stages.reduce((s, x) => s + x.avgDays, 0) / (stages.length || 1))}d`, color: '#f59e0b' },
        { icon: '🔥', label: 'Hot Leads',          value: stages.find(s => s.stage === 'NEGOTIATION')?.count ?? 0, color: '#ef4444' },
        { icon: '💧', label: 'Leads Lost',         value: lostReasons.reduce((s, x) => s + x.count, 0), color: '#9ca3af' },
      ].map(k => <Grid item xs={6} sm={3} key={k.label}><KpiCard {...k} /></Grid>)}
    </Grid>

    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <ChartCard title="Pipeline Funnel" sub="Leads through each stage">
          <FunnelChart stages={stages} />
        </ChartCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <ChartCard title="Pipeline Value by Stage" sub="₹ value at each stage">
          <HBarChart data={stages.map((s, i) => ({
            label: s.label, value: s.value,
            sub: `${s.count} leads · avg ${s.avgDays}d`,
            color: s.color,
          }))} formatValue={v => fmtINR(v)} />
        </ChartCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <ChartCard title="Stage Velocity" sub="Average days spent in each stage">
          <VBarChart data={stages.map((s, i) => ({ label: s.label, value: s.avgDays, color: s.color }))} height={200} formatValue={v => `${v}d`} />
        </ChartCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <ChartCard title="Lost Lead Analysis" sub="Why leads were lost">
          <HBarChart data={lostReasons.map((r, i) => ({ label: r.reason, value: r.count, color: CHART_PALETTE[(i + 5) % CHART_PALETTE.length] }))} />
        </ChartCard>
      </Grid>
    </Grid>
  </Box>
);

// ─── Booking Analytics ────────────────────────────────────────────────────────

export const BookingAnalyticsSection: React.FC<{
  monthly: TrendPoint[];
  byProject: ProjectMetric[];
  byAgent: AgentMetric[];
  cancellationRate: number;
  byType: { label: string; value: number; color?: string }[];
}> = ({ monthly, byProject, byAgent, cancellationRate, byType }) => {
  const monthData = monthly.map(t => ({ label: t.period, value: t.value }));

  return (
    <Box>
      <Grid container spacing={2} mb={4}>
        {[
          { icon: '📝', label: 'Total Bookings', value: monthly.reduce((s, t) => s + t.value, 0).toLocaleString(), color: '#10b981' },
          { icon: '🏗', label: 'Top Project',    value: byProject.sort((a,b) => b.soldUnits - a.soldUnits)[0]?.name ?? '—', color: '#6366f1' },
          { icon: '🏆', label: 'Top Agent',      value: byAgent.sort((a,b) => b.bookings - a.bookings)[0]?.name ?? '—', color: '#f59e0b' },
          { icon: '❌', label: 'Cancellations',  value: `${cancellationRate}%`, color: '#ef4444' },
        ].map(k => <Grid item xs={6} sm={3} key={k.label}><KpiCard {...k} /></Grid>)}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <ChartCard title="Monthly Booking Trend">
            <AreaChart data={monthData} color="#10b981" height={210} />
          </ChartCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <ChartCard title="By Unit Type">
            <DonutChart data={byType.map((d, i) => ({ ...d, color: d.color ?? CHART_PALETTE[i] }))} size={150} centerLabel="Bookings" />
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard title="Top Projects by Bookings" sub="Sold units ranking">
            <HBarChart showRank data={byProject.sort((a, b) => b.soldUnits - a.soldUnits).map((p, i) => ({
              label: p.name, value: p.soldUnits,
              sub: `${p.sellThrough}% sold · ${fmtINR(p.revenue)}`,
              color: CHART_PALETTE[i % CHART_PALETTE.length],
            }))} />
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard title="Agent Booking Performance" sub="Bookings closed this period">
            <HBarChart showRank data={byAgent.sort((a, b) => b.bookings - a.bookings).map((a, i) => ({
              label: a.name, value: a.bookings,
              sub: `${a.conversionRate}% conv · ${fmtINR(a.revenue)}`,
              color: CHART_PALETTE[i % CHART_PALETTE.length],
            }))} />
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
};

// ─── Visit Analytics ──────────────────────────────────────────────────────────

export const VisitAnalyticsSection: React.FC<{
  monthly: TrendPoint[];
  byProject: { label: string; value: number; sub?: string }[];
  byAgent: AgentMetric[];
  stats: { scheduled: number; completed: number; noShow: number; conversion: number };
}> = ({ monthly, byProject, byAgent, stats }) => {
  const monthData = monthly.map(t => ({ label: t.period, value: t.value }));
  const completionRate = stats.scheduled ? Math.round(stats.completed / stats.scheduled * 100) : 0;
  const noShowRate = stats.scheduled ? Math.round(stats.noShow / stats.scheduled * 100) : 0;

  return (
    <Box>
      <Grid container spacing={2} mb={4}>
        {[
          { icon: '📅', label: 'Total Visits',     value: stats.scheduled.toLocaleString(), color: '#0ea5e9' },
          { icon: '✅', label: 'Completed',         value: stats.completed.toLocaleString(), color: '#10b981', sub: `${completionRate}%` },
          { icon: '❌', label: 'No-shows',          value: stats.noShow.toLocaleString(),    color: '#ef4444', sub: `${noShowRate}% rate` },
          { icon: '🎉', label: 'Visit→Booking',     value: `${stats.conversion}%`,          color: '#f59e0b', sub: 'conversion rate' },
        ].map(k => <Grid item xs={6} sm={3} key={k.label}><KpiCard {...k} /></Grid>)}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <ChartCard title="Visit Trend" sub="Monthly visits scheduled">
            <AreaChart data={monthData} color="#0ea5e9" height={210} />
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <ChartCard title="Visit Completion" sub="Outcome breakdown">
            <Stack spacing={2} alignItems="center" pt={1}>
              <Stack direction="row" spacing={3}>
                <GaugeRing value={completionRate} color="#10b981" size={100} label="Completed" />
                <GaugeRing value={noShowRate} color="#ef4444" size={100} label="No-show" />
              </Stack>
              <Stack direction="row" spacing={3} mt={1}>
                <GaugeRing value={stats.conversion} color="#f59e0b" size={100} label="Conversion" />
              </Stack>
            </Stack>
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard title="Visits by Project" sub="Most-visited projects">
            <HBarChart data={byProject.map((p, i) => ({ ...p, color: CHART_PALETTE[i % CHART_PALETTE.length] }))} />
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard title="Agent Visit Performance" sub="Completed visits leaderboard">
            <HBarChart showRank data={byAgent.sort((a, b) => b.visits - a.visits).map((a, i) => ({
              label: a.name, value: a.visits,
              sub: `${a.bookings} bookings from visits`,
              color: CHART_PALETTE[i % CHART_PALETTE.length],
            }))} />
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
};