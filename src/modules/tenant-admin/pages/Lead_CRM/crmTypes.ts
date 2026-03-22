// ─── Enums ────────────────────────────────────────────────────────────────────

export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'FOLLOW_UP' | 'VISIT_SCHEDULED' | 'NEGOTIATION' | 'HOLD' | 'BOOKED' | 'WON' | 'LOST';
export type FollowUpType = 'CALL' | 'WHATSAPP' | 'SMS' | 'EMAIL' | 'MEETING' | 'SITE_VISIT';
export type LeadPriority = 'HOT' | 'WARM' | 'COLD';
export type LeadPurpose = 'INVESTMENT' | 'SELF_USE' | 'RENTAL';
export type SourceChannel =
  | 'WEBSITE' | 'FACEBOOK' | 'GOOGLE' | 'WHATSAPP'
  | 'MANUAL' | 'MISSED_CALL' | 'CSV_IMPORT'
  | 'CHANNEL_PARTNER' | 'REFERRAL' | 'WALK_IN' | 'PORTAL';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface Agent { 
  id: string; 
  name: string; 
  email?: string; 
  avatarUrl?: string;
  role?: { name: string } | string;
}

export interface AgentStats {
  totalLeads: number;
  bookedLeads: number;
  hotLeads: number;
  completedFollowUps: number;
  conversionRate: number;
}

export interface ActivityLog {
  id: string;
  leadId: string;
  userId: string;
  type: string;
  activity: string;
  content?: string;
  oldValue?: string;
  newValue?: string;
  performedAt: string;
  metadata?: any;
  user?: { name: string };
}

export interface FollowUp {
  id: string;
  type: FollowUpType;
  notes?: string;
  scheduledAt: string;
  completedAt?: string;
  status: 'PENDING' | 'COMPLETED' | 'MISSED';
  createdBy?: { name: string };
}

export interface LeadDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: string;
}

export interface Lead {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  budget?: number;
  budgetMax?: number;
  preferredProject?: string;
  preferredUnitType?: string;
  locationPreference?: string;
  sourceChannel: SourceChannel;
  status: LeadStatus;
  priority: LeadPriority;
  purpose?: LeadPurpose;
  familySize?: number;
  buyingTimeline?: string;
  loanRequired?: boolean;
  notes?: string;
  tags?: string[];
  photoUrl?: string;
  score?: number;
  projectId?: string;
  unitId?: string;
  createdAt: string;
  updatedAt?: string;
  ownerAgent?: Agent;
  activities?: ActivityLog[];
  followUps?: FollowUp[];
  documents?: LeadDocument[];
}

// ─── Pipeline Stages ──────────────────────────────────────────────────────────

export const PIPELINE_STAGES: {
  key: LeadStatus;
  label: string;
  color: string;
  bg: string;
  darkBg: string;
  icon: string;
  desc: string;
}[] = [
  { key: 'NEW',             label: 'New',             color: '#6366f1', bg: '#eef2ff', darkBg: '#4338ca', icon: '✨', desc: 'Fresh leads' },
  { key: 'CONTACTED',       label: 'Contacted',       color: '#0ea5e9', bg: '#e0f2fe', darkBg: '#0284c7', icon: '📞', desc: 'First contact made' },
  { key: 'FOLLOW_UP',       label: 'Follow-up',       color: '#f59e0b', bg: '#fef3c7', darkBg: '#d97706', icon: '🔄', desc: 'Nurturing phase' },
  { key: 'QUALIFIED',       label: 'Qualified',       color: '#8b5cf6', bg: '#ede9fe', darkBg: '#7c3aed', icon: '⭐', desc: 'Pre-qualified' },
  { key: 'VISIT_SCHEDULED', label: 'Visit Scheduled', color: '#a855f7', bg: '#f3e8ff', darkBg: '#9333ea', icon: '🏠', desc: 'Site visit booked' },
  { key: 'NEGOTIATION',     label: 'Negotiation',     color: '#ec4899', bg: '#fce7f3', darkBg: '#db2777', icon: '🤝', desc: 'Closing in' },
  { key: 'HOLD',            label: 'On Hold',          color: '#64748b', bg: '#f1f5f9', darkBg: '#475569', icon: '⏸️', desc: 'Paused' },
  { key: 'BOOKED',          label: 'Booked',          color: '#10b981', bg: '#d1fae5', darkBg: '#059669', icon: '🎉', desc: 'Deal closed!' },
  { key: 'WON',             label: 'Won',             color: '#10b981', bg: '#d1fae5', darkBg: '#059669', icon: '🏆', desc: 'Successfully won' },
  { key: 'LOST',            label: 'Lost',            color: '#ef4444', bg: '#fee2e2', darkBg: '#dc2626', icon: '❌', desc: 'Not converted' },
];

export const STAGE_MAP = Object.fromEntries(PIPELINE_STAGES.map(s => [s.key, s]));

// ─── Source Config ────────────────────────────────────────────────────────────

export const SOURCE_CFG: Record<SourceChannel, { label: string; icon: string; color: string }> = {
  WEBSITE:         { label: 'Website',         icon: '🌐', color: '#3b82f6' },
  FACEBOOK:        { label: 'Facebook',        icon: '📘', color: '#1d4ed8' },
  GOOGLE:          { label: 'Google Ads',      icon: '🔍', color: '#ef4444' },
  WHATSAPP:        { label: 'WhatsApp',        icon: '💬', color: '#25d366' },
  MANUAL:          { label: 'Manual Entry',    icon: '✍️', color: '#6b7280' },
  MISSED_CALL:     { label: 'Missed Call',     icon: '📵', color: '#f59e0b' },
  CSV_IMPORT:      { label: 'CSV Import',      icon: '📂', color: '#8b5cf6' },
  CHANNEL_PARTNER: { label: 'Channel Partner', icon: '🤝', color: '#0ea5e9' },
  REFERRAL:        { label: 'Referral',        icon: '👥', color: '#10b981' },
  WALK_IN:         { label: 'Walk-in',         icon: '🚶', color: '#ec4899' },
  PORTAL:          { label: 'Portal',          icon: '🏢', color: '#6366f1' },
};

// ─── Priority Config ──────────────────────────────────────────────────────────

export const PRIORITY_CFG: Record<LeadPriority, { label: string; color: string; bg: string; icon: string }> = {
  HOT:  { label: 'Hot',  color: '#ef4444', bg: '#fee2e2', icon: '🔥' },
  WARM: { label: 'Warm', color: '#f59e0b', bg: '#fef3c7', icon: '🌤' },
  COLD: { label: 'Cold', color: '#6366f1', bg: '#eef2ff', icon: '❄️' },
};

// ─── Follow-up Config ─────────────────────────────────────────────────────────

export const FOLLOWUP_CFG: Record<FollowUpType, { label: string; icon: string; color: string }> = {
  CALL:       { label: 'Phone Call',  icon: '📞', color: '#3b82f6' },
  WHATSAPP:   { label: 'WhatsApp',   icon: '💬', color: '#25d366' },
  SMS:        { label: 'SMS',        icon: '📱', color: '#6366f1' },
  EMAIL:      { label: 'Email',      icon: '📧', color: '#f59e0b' },
  MEETING:    { label: 'Meeting',    icon: '👥', color: '#8b5cf6' },
  SITE_VISIT: { label: 'Site Visit', icon: '🏠', color: '#10b981' },
};

// ─── Tag Presets ──────────────────────────────────────────────────────────────

export const TAG_PRESETS = ['VIP', 'Investor', 'Urgent', 'Loan Required', 'NRI', 'End User', 'Repeat Buyer', 'Corporate'];

// ─── Timeline Activity Icons ──────────────────────────────────────────────────

export const ACTIVITY_ICONS: Record<string, string> = {
  SYSTEM:          '✨',
  STATUS_CHANGE:   '🔄',
  NOTE_ADDED:      '📝',
  FOLLOW_UP:       '📞',
  SITE_VISIT:      '📍',
  TRANSFER:        '➡️',
  DOCUMENT_ADDED:  '📄',
  BOOKED:          '🎉',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const AVATAR_COLORS = ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ef4444','#0ea5e9'];
export const avatarColor = (s: string) => AVATAR_COLORS[(s?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
export const initials = (s: string) => (s ?? '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

export const fmtBudget = (n?: number) => {
  if (!n) return '—';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(0)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
};

export const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export const scoreColor = (score?: number) => {
  if (!score) return '#9ca3af';
  if (score >= 70) return '#10b981';
  if (score >= 40) return '#f59e0b';
  return '#6366f1';
};

export const UNIT_TYPES = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', 'Studio', 'Penthouse', 'Plot', 'Shop', 'Office'];
export const BUYING_TIMELINES = ['Immediate', '1-3 months', '3-6 months', '6-12 months', '1+ year'];