// ─── Core Types ───────────────────────────────────────────────────────────────

export interface OverviewMetrics {
  totalLeads: number;
  totalVisits: number;
  totalBookings: number;
  totalRevenue: number;
  pendingPayments: number;
  overduePayments: number;
  activePartners: number;
  activeAgents: number;
  leadConversionRate: number;
  visitConversionRate: number;
  bookingCancellationRate: number;
  avgDealSize: number;
  revenueGrowth: number;
  bookingGrowth: number;
  leadGrowth: number;
}

export interface FunnelStage {
  stage: string;
  label: string;
  count: number;
  value: number;
  dropoff: number;
  color: string;
}

export interface TrendPoint {
  period: string;
  value: number;
  value2?: number;
}

export interface LeadSourceBreakdown {
  source: string;
  count: number;
  percentage: number;
  converted: number;
  conversionRate: number;
  color: string;
}

export interface AgentMetric {
  id: string;
  name: string;
  role: string;
  leads: number;
  visits: number;
  bookings: number;
  revenue: number;
  conversionRate: number;
  followUps: number;
  avgResponseTimeHrs?: number;
}

export interface ProjectMetric {
  id: string;
  name: string;
  totalUnits: number;
  soldUnits: number;
  bookedUnits: number;
  availableUnits: number;
  revenue: number;
  visits: number;
  leads: number;
  avgPrice: number;
  sellThrough: number;
}

export interface PartnerMetric {
  id: string;
  name: string;
  type: string;
  deals: number;
  converted: number;
  revenue: number;
  commission: number;
  pendingCommission: number;
  conversionRate: number;
}

export interface ForecastData {
  pipelineValue: number;
  weightedPipeline: number;
  conversionRate: number;
  expectedRevenue: number;
  expectedBookings: number;
  projectedCollections: number;
  forecastPeriod: string;
  confidence: number;
}

export interface DateRange {
  from: string;
  to: string;
  label: string;
}

export type AnalyticsTab =
  | 'executive' | 'leads' | 'pipeline' | 'visits'
  | 'bookings' | 'revenue' | 'payments' | 'partners'
  | 'agents' | 'forecast' | 'reports';

// ─── Config ───────────────────────────────────────────────────────────────────

export const CHART_PALETTE = [
  '#6366f1', '#10b981', '#f59e0b', '#3b82f6',
  '#ec4899', '#8b5cf6', '#ef4444', '#0ea5e9',
  '#14b8a6', '#f97316', '#84cc16', '#06b6d4',
];

export const LEAD_SOURCE_COLORS: Record<string, string> = {
  'Facebook Ads': '#1877f2', 'Google Ads': '#ea4335', 'Instagram': '#e1306c',
  'Channel Partner': '#6366f1', 'Website': '#10b981', 'Referral': '#f59e0b',
  'Walk-in': '#8b5cf6', 'Cold Call': '#9ca3af', 'YouTube': '#ff0000',
  'WhatsApp': '#25d366', 'LinkedIn': '#0077b5', 'Newspaper': '#374151',
};

export const DATE_RANGES: DateRange[] = [
  { label: 'This Month',  from: 'm0',  to: 'm0'   },
  { label: 'Last Month',  from: 'm-1', to: 'm-1'  },
  { label: 'Last 3M',     from: 'm-3', to: 'm0'   },
  { label: 'Last 6M',     from: 'm-6', to: 'm0'   },
  { label: 'This Year',   from: 'y0',  to: 'y0'   },
  { label: 'Custom',      from: '',    to: ''      },
];

// ─── Formatters ───────────────────────────────────────────────────────────────

export const fmtINR = (n: number) => {
  if (!n && n !== 0) return '—';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)     return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n.toLocaleString('en-IN')}`;
};

export const fmtGrowth = (n: number) => ({
  label: `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`,
  color: n >= 0 ? '#10b981' : '#ef4444',
  bg:    n >= 0 ? '#d1fae5' : '#fee2e2',
  icon:  n >= 0 ? '↑' : '↓',
});

export const AVATAR_COLORS = ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ef4444','#0ea5e9'];
export const avatarColor = (s = '') => AVATAR_COLORS[s.charCodeAt(0) % AVATAR_COLORS.length];
export const initials    = (s = '?') => s.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

// ─── SVG Chart Helpers ────────────────────────────────────────────────────────

export const normalise = (data: number[]): number[] => {
  const mn = Math.min(...data, 0), mx = Math.max(...data, 1);
  return data.map(v => Math.round(((v - mn) / (mx - mn)) * 100));
};

export const toPolyline = (data: number[], w: number, h: number): string => {
  const norm = normalise(data);
  const step = data.length > 1 ? w / (data.length - 1) : w;
  return norm.map((v, i) => `${Math.round(i * step)},${Math.round(h - (v / 100) * (h - 4) + 2)}`).join(' ');
};

export const toAreaPath = (data: number[], w: number, h: number): string => {
  const norm = normalise(data);
  const step = data.length > 1 ? w / (data.length - 1) : w;
  const pts = norm.map((v, i) => `${Math.round(i * step)},${Math.round(h - (v / 100) * (h - 4) + 2)}`);
  return `M0,${h} L${pts.join(' L')} L${w},${h} Z`;
};