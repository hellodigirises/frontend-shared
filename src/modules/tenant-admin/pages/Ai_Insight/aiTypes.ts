// ─── Core Enums ──────────────────────────────────────────────────────────────

export type LeadTemperature  = 'VERY_HOT' | 'HOT' | 'WARM' | 'COLD' | 'DORMANT';
export type InsightType      = 'OPPORTUNITY' | 'RISK' | 'ACTION' | 'PREDICTION' | 'ANOMALY';
export type InsightPriority  = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type RecommendationType = 'CALL' | 'VISIT' | 'SEND_DOC' | 'OFFER_DISCOUNT' | 'ESCALATE' | 'RE_ENGAGE' | 'BOOK_NOW' | 'NEGOTIATE';

// ─── Data Interfaces ──────────────────────────────────────────────────────────

export interface LeadScore {
  leadId: string;
  score: number;              // 0-100
  temperature: LeadTemperature;
  probability: number;        // 0-100 win probability
  breakdown: ScoreBreakdown;
  trend: 'RISING' | 'FALLING' | 'STABLE';
  trendDelta: number;         // score change in last 7 days
  signals: LeadSignal[];
  recommendation: SmartRecommendation;
  computedAt: string;
}

export interface ScoreBreakdown {
  budgetMatch: { score: number; max: number; label: string };
  projectInterest: { score: number; max: number; label: string };
  visitScheduled: { score: number; max: number; label: string };
  interactionFreq: { score: number; max: number; label: string };
  sourceQuality: { score: number; max: number; label: string };
  responseSpeed: { score: number; max: number; label: string };
  buyingTimeline: { score: number; max: number; label: string };
  followUpHistory: { score: number; max: number; label: string };
}

export interface LeadSignal {
  signal: string;
  weight: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  label: string;
  timestamp?: string;
}

export interface SmartRecommendation {
  type: RecommendationType;
  title: string;
  description: string;
  urgency: 'NOW' | 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH';
  confidence: number;         // 0-100
  actions: RecommendedAction[];
}

export interface RecommendedAction {
  label: string;
  type: string;
  payload?: Record<string, any>;
}

export interface AIInsight {
  id: string;
  type: InsightType;
  priority: InsightPriority;
  category: string;
  title: string;
  description: string;
  entityType?: string;
  entityId?: string;
  entityLabel?: string;
  metric?: string;
  metricValue?: string;
  impact?: string;
  actions?: { label: string; url?: string }[];
  confidence: number;
  createdAt: string;
  isAcknowledged: boolean;
}

export interface AgentInsight {
  agentId: string;
  agentName: string;
  role: string;
  performanceScore: number;   // 0-100
  performanceTrend: 'UP' | 'DOWN' | 'STABLE';
  leads: number;
  visits: number;
  bookings: number;
  revenue: number;
  conversionRate: number;
  avgResponseTimeHrs: number;
  visitToBookingRate: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  rank: number;
}

export interface RevenueForecast {
  period: string;
  pipelineValue: number;
  weightedValue: number;
  conversionRate: number;
  forecastRevenue: number;
  forecastBookings: number;
  forecastCommissions: number;
  confidence: number;
  range: { low: number; mid: number; high: number };
  monthlyBreakdown: { month: string; forecast: number; actual?: number }[];
  assumptions: string[];
}

export interface OpportunityMatch {
  leadId: string;
  leadName: string;
  budget: number;
  preferredType: string;
  unitId: string;
  unitName: string;
  unitPrice: number;
  matchScore: number;         // 0-100
  matchReasons: string[];
  savingsAmount: number;      // price - budget if positive
}

export interface PaymentRisk {
  bookingId: string;
  customerName: string;
  riskScore: number;          // 0-100
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  overdueInstallments: number;
  totalOverdue: number;
  daysSinceLastPayment: number;
  riskFactors: string[];
  recommendation: string;
}

export interface BrokerInsight {
  partnerId: string;
  partnerName: string;
  deals: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
  avgDealValue: number;
  performanceScore: number;
  performanceTrend: 'UP' | 'DOWN' | 'STABLE';
  insights: string[];
  rating: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR';
}

export interface InactiveLeadAlert {
  leadId: string;
  leadName: string;
  phone: string;
  project?: string;
  daysSinceLastActivity: number;
  lastActivityType: string;
  score: number;
  reEngageRecommendation: string;
  potentialValue: number;
}

// ─── Config Maps ──────────────────────────────────────────────────────────────

export const TEMPERATURE_CFG: Record<LeadTemperature, {
  label: string; color: string; bg: string; darkBg: string; icon: string; glow: string;
}> = {
  VERY_HOT: { label: 'Very Hot',  color: '#dc2626', bg: '#fee2e2', darkBg: '#450a0a', icon: '🔥', glow: 'rgba(220,38,38,.4)' },
  HOT:      { label: 'Hot',       color: '#f97316', bg: '#ffedd5', darkBg: '#431407', icon: '⚡', glow: 'rgba(249,115,22,.4)' },
  WARM:     { label: 'Warm',      color: '#f59e0b', bg: '#fef3c7', darkBg: '#451a03', icon: '🌤', glow: 'rgba(245,158,11,.4)' },
  COLD:     { label: 'Cold',      color: '#6366f1', bg: '#eef2ff', darkBg: '#1e1b4b', icon: '❄️', glow: 'rgba(99,102,241,.4)' },
  DORMANT:  { label: 'Dormant',   color: '#9ca3af', bg: '#f3f4f6', darkBg: '#111827', icon: '💤', glow: 'rgba(156,163,175,.3)' },
};

export const INSIGHT_TYPE_CFG: Record<InsightType, { label: string; icon: string; color: string; bg: string }> = {
  OPPORTUNITY: { label: 'Opportunity', icon: '💡', color: '#10b981', bg: '#d1fae5' },
  RISK:        { label: 'Risk',        icon: '⚠️',  color: '#ef4444', bg: '#fee2e2' },
  ACTION:      { label: 'Action',      icon: '⚡',  color: '#6366f1', bg: '#eef2ff' },
  PREDICTION:  { label: 'Prediction',  icon: '🔮', color: '#8b5cf6', bg: '#ede9fe' },
  ANOMALY:     { label: 'Anomaly',     icon: '🚨', color: '#f59e0b', bg: '#fef3c7' },
};

export const INSIGHT_PRIORITY_CFG: Record<InsightPriority, { label: string; color: string; bg: string }> = {
  CRITICAL: { label: 'Critical', color: '#dc2626', bg: '#fee2e2' },
  HIGH:     { label: 'High',     color: '#f97316', bg: '#ffedd5' },
  MEDIUM:   { label: 'Medium',   color: '#f59e0b', bg: '#fef3c7' },
  LOW:      { label: 'Low',      color: '#9ca3af', bg: '#f3f4f6' },
};

export const RECOMMENDATION_CFG: Record<RecommendationType, { label: string; icon: string; color: string }> = {
  CALL:             { label: 'Call Customer',       icon: '📞', color: '#10b981' },
  VISIT:            { label: 'Schedule Visit',      icon: '🏠', color: '#6366f1' },
  SEND_DOC:         { label: 'Send Brochure',       icon: '📤', color: '#0ea5e9' },
  OFFER_DISCOUNT:   { label: 'Offer Discount',      icon: '🏷',  color: '#f59e0b' },
  ESCALATE:         { label: 'Escalate to Manager', icon: '↑',  color: '#8b5cf6' },
  RE_ENGAGE:        { label: 'Re-engage Lead',      icon: '🔄', color: '#ec4899' },
  BOOK_NOW:         { label: 'Initiate Booking',    icon: '🎉', color: '#10b981' },
  NEGOTIATE:        { label: 'Start Negotiation',   icon: '🤝', color: '#f97316' },
};

export const URGENCY_CFG = {
  NOW:        { label: 'Act Now',      color: '#dc2626', bg: '#fee2e2',   pulse: true },
  TODAY:      { label: 'Today',        color: '#f97316', bg: '#ffedd5',   pulse: false },
  THIS_WEEK:  { label: 'This Week',    color: '#f59e0b', bg: '#fef3c7',   pulse: false },
  THIS_MONTH: { label: 'This Month',   color: '#9ca3af', bg: '#f3f4f6',   pulse: false },
};

// ─── Scoring Engine (Rule-Based, no ML needed) ────────────────────────────────

export interface ScoringInput {
  budgetMatch: number;        // 0-1
  hasProjectInterest: boolean;
  visitCompleted: boolean;
  visitScheduled: boolean;
  interactionCount: number;
  daysSinceLastInteraction: number;
  leadSource: string;
  responseTimeHrs?: number;
  buyingTimelineMonths?: number;
  followUpCount: number;
  stage: string;
}

const HIGH_QUALITY_SOURCES = ['Referral', 'Channel Partner', 'Walk-in'];
const MEDIUM_QUALITY_SOURCES = ['Google Ads', 'LinkedIn', 'Website'];

export function computeLeadScore(input: ScoringInput): { score: number; breakdown: ScoreBreakdown } {
  const bd: ScoreBreakdown = {
    budgetMatch:     { score: Math.round(input.budgetMatch * 20), max: 20, label: 'Budget alignment' },
    projectInterest: { score: input.hasProjectInterest ? 15 : 5, max: 15, label: 'Project interest' },
    visitScheduled:  { score: input.visitCompleted ? 15 : input.visitScheduled ? 8 : 0, max: 15, label: 'Site visit' },
    interactionFreq: { score: Math.min(15, Math.floor(input.interactionCount / 2) * 3), max: 15, label: 'Engagement level' },
    sourceQuality:   { score: HIGH_QUALITY_SOURCES.includes(input.leadSource) ? 10 : MEDIUM_QUALITY_SOURCES.includes(input.leadSource) ? 6 : 3, max: 10, label: 'Lead source quality' },
    responseSpeed:   { score: !input.responseTimeHrs ? 5 : input.responseTimeHrs <= 1 ? 10 : input.responseTimeHrs <= 4 ? 7 : input.responseTimeHrs <= 24 ? 4 : 1, max: 10, label: 'Response speed' },
    buyingTimeline:  { score: !input.buyingTimelineMonths ? 5 : input.buyingTimelineMonths <= 1 ? 10 : input.buyingTimelineMonths <= 3 ? 7 : input.buyingTimelineMonths <= 6 ? 4 : 2, max: 10, label: 'Buying timeline' },
    followUpHistory: { score: Math.min(5, input.followUpCount), max: 5, label: 'Follow-up history' },
  };
  const score = Object.values(bd).reduce((s, v) => s + v.score, 0);
  return { score, breakdown: bd };
}

export function scoreToTemperature(score: number): LeadTemperature {
  if (score >= 80) return 'VERY_HOT';
  if (score >= 65) return 'HOT';
  if (score >= 45) return 'WARM';
  if (score >= 25) return 'COLD';
  return 'DORMANT';
}

export function computeWinProbability(score: number, stage: string, visitCompleted: boolean): number {
  const stageBonus: Record<string, number> = {
    NEW: 0, CONTACTED: 5, VISIT_SCHEDULED: 10, VISIT_COMPLETED: 20,
    NEGOTIATION: 30, BOOKING: 50,
  };
  const visitBonus = visitCompleted ? 15 : 0;
  const base = Math.round((score / 100) * 55);
  return Math.min(98, base + (stageBonus[stage] ?? 0) + visitBonus);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const fmtINR = (n: number) => {
  if (!n && n !== 0) return '—';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)     return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n.toLocaleString('en-IN')}`;
};

export const AVATAR_COLORS = ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ef4444','#0ea5e9'];
export const avatarColor = (s = '') => AVATAR_COLORS[s.charCodeAt(0) % AVATAR_COLORS.length];
export const initials    = (s = '?') => s.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
export const timeAgo     = (s: string) => {
  const d = Date.now() - new Date(s).getTime(), m = Math.floor(d / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};