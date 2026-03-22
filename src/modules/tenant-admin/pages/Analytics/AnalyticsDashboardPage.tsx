import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Stack, Button, Tabs, Tab, Grid,
  Chip, Paper, FormControl, InputLabel, Select,
  MenuItem, CircularProgress, IconButton, Divider, TextField
} from '@mui/material';
import {
  DownloadOutlined, RefreshOutlined, TuneOutlined,
  DashboardOutlined, TrendingUpOutlined, PeopleOutlined,
  HomeWorkOutlined, BookmarkOutlined, AccountBalanceOutlined,
  GroupsOutlined, BarChartOutlined, AutoAwesomeOutlined,
  SummarizeOutlined, SearchOutlined, ReceiptLongOutlined
} from '@mui/icons-material';
import {
  OverviewMetrics, FunnelStage, TrendPoint, LeadSourceBreakdown,
  AgentMetric, ProjectMetric, PartnerMetric, ForecastData,
  DATE_RANGES, CHART_PALETTE, fmtINR
} from './analyticsTypes';
import {
  ExecutiveDashboard, LeadAnalyticsSection, PipelineAnalyticsSection,
  VisitAnalyticsSection, BookingAnalyticsSection
} from './AnalyticsSections';
import {
  RevenueAnalyticsSection, AgentPerformanceSection,
  PartnerAnalyticsSection, ForecastSection, CustomReportBuilder
} from './AnalyticsSections2';
import { KpiCard } from './AnalyticsCharts';
import api from '../../../../api/axios';

// ─── Mock data builder (in production, replace with API calls) ────────────────
const buildMockData = () => {
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  const metrics: OverviewMetrics = {
    totalLeads: 1847, totalVisits: 423, totalBookings: 156,
    totalRevenue: 187500000, pendingPayments: 43200000, overduePayments: 8750000,
    activePartners: 34, activeAgents: 18,
    leadConversionRate: 22, visitConversionRate: 37, bookingCancellationRate: 4,
    avgDealSize: 12000000, revenueGrowth: 14.2, bookingGrowth: 8.7, leadGrowth: 21.3,
  };

  const revTrend: TrendPoint[] = months.map((m, i) => ({ period: m, value: rand(8000000, 22000000) + i * 300000 }));
  const bkgTrend: TrendPoint[] = months.map((m, i) => ({ period: m, value: rand(8, 18) + Math.floor(i / 2) }));
  const ldTrend:  TrendPoint[] = months.map((m, i) => ({ period: m, value: rand(100, 200) + i * 5 }));

  const funnel: FunnelStage[] = [
    { stage: 'LEADS',       label: 'Total Leads',      count: 1847, value: 22164000000, dropoff: 0,  color: '#6366f1' },
    { stage: 'CONTACTED',   label: 'Contacted',        count: 1382, value: 16584000000, dropoff: 25, color: '#8b5cf6' },
    { stage: 'VISIT',       label: 'Site Visit',       count: 423,  value: 5076000000,  dropoff: 69, color: '#0ea5e9' },
    { stage: 'NEGOTIATION', label: 'Negotiation',      count: 218,  value: 2616000000,  dropoff: 48, color: '#f59e0b' },
    { stage: 'BOOKING',     label: 'Booking Closed',   count: 156,  value: 1872000000,  dropoff: 28, color: '#10b981' },
  ];

  const sources: LeadSourceBreakdown[] = [
    { source: 'Facebook Ads',    count: 412, percentage: 22, converted: 91,  conversionRate: 22, color: '#1877f2' },
    { source: 'Google Ads',      count: 387, percentage: 21, converted: 98,  conversionRate: 25, color: '#ea4335' },
    { source: 'Channel Partner', count: 276, percentage: 15, converted: 82,  conversionRate: 30, color: '#6366f1' },
    { source: 'Instagram',       count: 221, percentage: 12, converted: 42,  conversionRate: 19, color: '#e1306c' },
    { source: 'Referral',        count: 198, percentage: 11, converted: 67,  conversionRate: 34, color: '#f59e0b' },
    { source: 'Website',         count: 167, percentage: 9,  converted: 28,  conversionRate: 17, color: '#10b981' },
    { source: 'Walk-in',         count: 112, percentage: 6,  converted: 31,  conversionRate: 28, color: '#8b5cf6' },
    { source: 'Cold Call',       count: 74,  percentage: 4,  converted: 11,  conversionRate: 15, color: '#9ca3af' },
  ];

  const projects: ProjectMetric[] = [
    { id: '1', name: 'Sunrise Heights',  totalUnits: 200, soldUnits: 142, bookedUnits: 18, availableUnits: 40, revenue: 87500000, visits: 187, leads: 423, avgPrice: 8500000, sellThrough: 80 },
    { id: '2', name: 'Green Valley',     totalUnits: 150, soldUnits: 78,  bookedUnits: 22, availableUnits: 50, revenue: 62000000, visits: 134, leads: 312, avgPrice: 11000000, sellThrough: 67 },
    { id: '3', name: 'Metro Square',     totalUnits: 120, soldUnits: 52,  bookedUnits: 15, availableUnits: 53, revenue: 38000000, visits: 102, leads: 267, avgPrice: 9500000, sellThrough: 56 },
    { id: '4', name: 'Prestige Towers',  totalUnits: 80,  soldUnits: 31,  bookedUnits: 8,  availableUnits: 41, revenue: 28000000, visits: 58,  leads: 198, avgPrice: 13000000, sellThrough: 49 },
  ];

  const agents: AgentMetric[] = [
    { id: '1', name: 'Rahul Sharma',  role: 'Senior Agent', leads: 287, visits: 78, bookings: 34, revenue: 41200000, conversionRate: 28, followUps: 412, avgResponseTimeHrs: 1.2 },
    { id: '2', name: 'Priya Singh',   role: 'Agent',        leads: 241, visits: 62, bookings: 28, revenue: 33600000, conversionRate: 23, followUps: 387, avgResponseTimeHrs: 2.1 },
    { id: '3', name: 'Amit Kumar',    role: 'Agent',        leads: 198, visits: 54, bookings: 22, revenue: 26400000, conversionRate: 21, followUps: 298, avgResponseTimeHrs: 1.8 },
    { id: '4', name: 'Sneha Patel',   role: 'Senior Agent', leads: 312, visits: 89, bookings: 41, revenue: 49200000, conversionRate: 31, followUps: 456, avgResponseTimeHrs: 0.9 },
    { id: '5', name: 'Vikram Joshi',  role: 'Agent',        leads: 167, visits: 43, bookings: 18, revenue: 21600000, conversionRate: 19, followUps: 234, avgResponseTimeHrs: 3.2 },
    { id: '6', name: 'Kavya Nair',    role: 'Agent',        leads: 143, visits: 38, bookings: 13, revenue: 15600000, conversionRate: 16, followUps: 198, avgResponseTimeHrs: 2.8 },
  ];

  const partners: PartnerMetric[] = [
    { id: '1', name: 'Prop Connect',   type: 'Broker', deals: 42, converted: 18, revenue: 21600000, commission: 2160000, pendingCommission: 540000, conversionRate: 43 },
    { id: '2', name: 'Urban Realty',   type: 'Agency', deals: 38, converted: 14, revenue: 16800000, commission: 1680000, pendingCommission: 280000, conversionRate: 37 },
    { id: '3', name: 'HomeQuest',      type: 'Broker', deals: 31, converted: 11, revenue: 13200000, commission: 1320000, pendingCommission: 0,       conversionRate: 35 },
    { id: '4', name: 'Prime Partners', type: 'Agency', deals: 24, converted: 9,  revenue: 10800000, commission: 1080000, pendingCommission: 360000, conversionRate: 38 },
    { id: '5', name: 'DealMakers',     type: 'Broker', deals: 19, converted: 6,  revenue: 7200000,  commission: 720000,  pendingCommission: 180000, conversionRate: 32 },
  ];

  const forecast: ForecastData = {
    pipelineValue: 58000000, weightedPipeline: 17400000,
    conversionRate: 30, expectedRevenue: 17400000,
    expectedBookings: 14, projectedCollections: 11600000,
    forecastPeriod: 'Next 90 days', confidence: 74,
  };

  const pipelineByStage = funnel.map(f => ({
    stage: f.label, value: f.value,
    weight: [10, 25, 50, 70, 90][funnel.indexOf(f)],
    color: f.color,
  }));

  const visitMonthly: TrendPoint[] = months.map((m, i) => ({ period: m, value: rand(28, 48) + i }));
  const visitByProject = projects.map((p, i) => ({ label: p.name, value: p.visits, color: CHART_PALETTE[i] }));

  const byBudget = [
    { label: '<50L', value: 312 }, { label: '50-80L', value: 487 }, { label: '80L-1Cr', value: 398 },
    { label: '1-1.5Cr', value: 276 }, { label: '1.5-2Cr', value: 198 }, { label: '>2Cr', value: 176 },
  ];

  const pipelineStages = [
    { stage: 'LEADS', label: 'New Leads', count: 312, value: 6240000000, avgDays: 2, color: '#6366f1', dropoff: undefined },
    { stage: 'CONTACTED', label: 'Contacted', count: 198, value: 3960000000, avgDays: 5, color: '#8b5cf6', dropoff: 36 },
    { stage: 'VISIT', label: 'Visit Scheduled', count: 87, value: 1740000000, avgDays: 12, color: '#0ea5e9', dropoff: 56 },
    { stage: 'NEGOTIATION', label: 'Negotiation', count: 43, value: 860000000, avgDays: 18, color: '#f59e0b', dropoff: 51 },
    { stage: 'BOOKING', label: 'Booking', count: 22, value: 440000000, avgDays: 7, color: '#10b981', dropoff: 49 },
  ];

  const lostReasons = [
    { reason: 'Budget constraints', count: 78 },
    { reason: 'Competitor chosen', count: 54 },
    { reason: 'Not ready to buy', count: 47 },
    { reason: 'Location concern', count: 38 },
    { reason: 'Loan not approved', count: 31 },
    { reason: 'Family not convinced', count: 27 },
  ];

  const bookingsByType = [
    { label: '2BHK', value: 52, color: '#6366f1' }, { label: '3BHK', value: 68, color: '#10b981' },
    { label: '4BHK', value: 24, color: '#f59e0b' }, { label: 'Villa', value: 12, color: '#ec4899' },
  ];

  return {
    metrics, funnel, sources, projects, agents, partners, forecast,
    pipelineByStage, pipelineStages, lostReasons, byBudget, bookingsByType,
    trends: { revenue: revTrend, bookings: bkgTrend, leads: ldTrend },
    visitMonthly, visitByProject,
    visitStats: { scheduled: 423, completed: 367, noShow: 38, conversion: 37 },
  };
};

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
  { id: 'executive', icon: <DashboardOutlined sx={{ fontSize: 17 }} />,     label: 'Executive'    },
  { id: 'leads',     icon: <TrendingUpOutlined sx={{ fontSize: 17 }} />,     label: 'Leads'        },
  { id: 'pipeline',  icon: <BarChartOutlined sx={{ fontSize: 17 }} />,       label: 'Pipeline'     },
  { id: 'visits',    icon: <HomeWorkOutlined sx={{ fontSize: 17 }} />,       label: 'Site Visits'  },
  { id: 'bookings',  icon: <BookmarkOutlined sx={{ fontSize: 17 }} />,       label: 'Bookings'     },
  { id: 'revenue',   icon: <AccountBalanceOutlined sx={{ fontSize: 17 }} />, label: 'Revenue'      },
  { id: 'agents',    icon: <PeopleOutlined sx={{ fontSize: 17 }} />,         label: 'Agents'       },
  { id: 'partners',  icon: <GroupsOutlined sx={{ fontSize: 17 }} />,         label: 'Partners'     },
  { id: 'forecast',  icon: <AutoAwesomeOutlined sx={{ fontSize: 17 }} />,    label: 'Forecast ✨' },
  { id: 'reports',   icon: <SummarizeOutlined sx={{ fontSize: 17 }} />,      label: 'Reports'      },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
const AnalyticsDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState('This Year');
  const [loading, setLoading] = useState(false);
  const [data] = useState(buildMockData);  // in prod: useState(null) + fetchData

  if (!data) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress />
    </Box>
  );

  const tabId = TABS[activeTab]?.id ?? 'executive';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* ── Page Header ── */}
      <Box sx={{ px: { xs: 2, md: 4 }, pt: 4, pb: 0 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-start' }} mb={3} spacing={2}>
          <Box>
            <Typography sx={{
              fontFamily: '"Cormorant Garamond", serif',
              fontWeight: 700, fontSize: '2.5rem', letterSpacing: -1,
              lineHeight: 1.05, color: '#0f172a',
            }}>
              Analytics & Insights
            </Typography>
            <Typography variant="body1" color="text.secondary" mt={0.75}>
              Full company intelligence — real-time performance across every module
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            {/* Date Range Selector */}
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select value={dateRange} onChange={e => setDateRange(e.target.value)}
                sx={{ borderRadius: 2.5, fontWeight: 700, fontSize: 13 }}>
                {DATE_RANGES.map(d => <MenuItem key={d.label} value={d.label}>{d.label}</MenuItem>)}
              </Select>
            </FormControl>
            <Button variant="outlined" startIcon={<DownloadOutlined />}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 3 }}>
              Export
            </Button>
            <IconButton onClick={() => setLoading(l => !l)} size="small"
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <RefreshOutlined fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>

        {/* Quick insight strip */}
        <Stack direction="row" spacing={1.5} mb={3} flexWrap="wrap">
          {[
            { label: `📈 Revenue up ${data.metrics.revenueGrowth}% vs last year`, color: '#10b981', bg: '#d1fae5' },
            { label: `🎯 ${data.metrics.totalLeads.toLocaleString()} leads this year`, color: '#6366f1', bg: '#eef2ff' },
            { label: `📝 ${data.metrics.totalBookings} bookings closed`, color: '#f59e0b', bg: '#fef3c7' },
            { label: `🔴 ${fmtINR(data.metrics.overduePayments)} overdue`, color: '#ef4444', bg: '#fee2e2' },
          ].map(i => (
            <Chip key={i.label} label={i.label}
              sx={{ bgcolor: i.bg, color: i.color, fontWeight: 800, fontSize: 11, height: 28 }} />
          ))}
        </Stack>

        {/* Tab Navigation */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}
            variant="scrollable" scrollButtons="auto"
            TabIndicatorProps={{ sx: { height: 3, borderRadius: 2 } }}>
            {TABS.map(t => (
              <Tab key={t.id} icon={t.icon} iconPosition="start" label={t.label}
                sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.8rem', minHeight: 46, px: 2 }} />
            ))}
          </Tabs>
        </Box>
      </Box>

      {/* ── Tab Content ── */}
      <Box sx={{ px: { xs: 2, md: 4 }, py: 4 }}>
        {tabId === 'executive' && (
          <ExecutiveDashboard
            metrics={data.metrics}
            trends={data.trends}
            funnel={data.funnel}
            projects={data.projects}
          />
        )}

        {tabId === 'leads' && (
          <LeadAnalyticsSection
            sources={data.sources}
            trends={data.trends.leads}
            byProject={data.projects.map((p, i) => ({ label: p.name, value: p.leads, color: CHART_PALETTE[i] }))}
            byBudget={data.byBudget}
            byAgent={data.agents}
          />
        )}

        {tabId === 'pipeline' && (
          <PipelineAnalyticsSection
            stages={data.pipelineStages}
            pipelineValue={data.funnel[0].value}
            lostReasons={data.lostReasons}
          />
        )}

        {tabId === 'visits' && (
          <VisitAnalyticsSection
            monthly={data.visitMonthly}
            byProject={data.visitByProject}
            byAgent={data.agents}
            stats={data.visitStats}
          />
        )}

        {tabId === 'bookings' && (
          <BookingAnalyticsSection
            monthly={data.trends.bookings}
            byProject={data.projects}
            byAgent={data.agents}
            cancellationRate={data.metrics.bookingCancellationRate}
            byType={data.bookingsByType}
          />
        )}

        {tabId === 'revenue' && (
          <RevenueAnalyticsSection
            monthly={data.trends.revenue}
            byProject={data.projects.map((p, i) => ({ label: p.name, value: p.revenue, color: CHART_PALETTE[i] }))}
            byAgent={data.agents}
            byPartner={data.partners}
            totalRevenue={data.metrics.totalRevenue}
            totalTarget={250000000}
          />
        )}

        {tabId === 'agents' && (
          <AgentPerformanceSection agents={data.agents} />
        )}

        {tabId === 'partners' && (
          <PartnerAnalyticsSection partners={data.partners} />
        )}

        {tabId === 'forecast' && (
          <ForecastSection
            forecast={data.forecast}
            pipelineByStage={data.pipelineByStage}
          />
        )}

        {tabId === 'reports' && (
          <CustomReportBuilder />
        )}
      </Box>
    </Box>
  );
};

export default AnalyticsDashboardPage;