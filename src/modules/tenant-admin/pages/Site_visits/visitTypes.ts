// ─── Core Enums ──────────────────────────────────────────────────────────────

export type VisitType     = 'ONSITE' | 'VIRTUAL' | 'OFFICE';
export type VisitStatus   = 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED' | 'RESCHEDULED';
export type VisitOutcome  = 'BOOKING_INITIATED' | 'FOLLOW_UP_REQUIRED' | 'NEGOTIATION_STARTED' | 'REVISIT_NEEDED' | 'LOST' | 'PENDING';
export type InterestLevel = 'VERY_HOT' | 'HOT' | 'WARM' | 'COLD' | 'NOT_INTERESTED';
export type ReminderChannel = 'APP' | 'EMAIL' | 'SMS' | 'WHATSAPP';
export type VisitPriority = 'HIGH' | 'NORMAL' | 'LOW';

// ─── Data Interfaces ──────────────────────────────────────────────────────────

export interface VisitLead {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  preferredProject?: string;
  budget?: number;
  status?: string;
}

export interface VisitAgent {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role?: { name: string };
}

export interface VisitReminder {
  id?: string;
  channel: ReminderChannel;
  minutesBefore: number;
  sent?: boolean;
  sentAt?: string;
}

export interface VisitFeedback {
  interestLevel: InterestLevel;
  budgetMatch: boolean;
  preferredUnit?: string;
  objections?: string[];
  nextAction?: string;
  internalNotes?: string;
  agentRating?: number;
  followUpDate?: string;
  photoUrls?: string[];
  customerQuote?: string;
}

export interface VisitActivity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
  createdBy?: { name: string };
}

export interface SiteVisit {
  id: string;
  visitType: VisitType;
  status: VisitStatus;
  outcome: VisitOutcome;
  priority?: VisitPriority;
  // Relations
  lead: VisitLead;
  agent: VisitAgent;
  coAgents?: VisitAgent[];
  groupLeads?: VisitLead[];
  // Property
  project?: string;
  projectId?: string;
  tower?: string;
  floor?: string;
  unitNumber?: string;
  meetingLocation?: string;
  meetingLink?: string;
  // Scheduling
  visitDate: string;
  visitTime: string;
  durationMinutes?: number;
  // Check-in
  checkInLat?: number;
  checkInLng?: number;
  checkInAt?: string;
  checkOutAt?: string;
  // Reschedule history
  originalDate?: string;
  originalTime?: string;
  rescheduleReason?: string;
  rescheduledCount?: number;
  // Reminders
  reminders?: VisitReminder[];
  // Content
  notes?: string;
  feedback?: VisitFeedback;
  activities?: VisitActivity[];
  photoUrls?: string[];
  tags?: string[];
  // Meta
  completedAt?: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: { name: string };
}

// ─── Config Maps ──────────────────────────────────────────────────────────────

export const VISIT_TYPE_CFG: Record<VisitType, {
  label: string; icon: string; color: string; bg: string; darkBg: string; desc: string;
}> = {
  ONSITE:  { label: 'On-site Visit',  icon: '🏠', color: '#10b981', bg: '#d1fae5', darkBg: '#065f46', desc: 'Physical site tour'       },
  VIRTUAL: { label: 'Virtual Tour',   icon: '💻', color: '#6366f1', bg: '#eef2ff', darkBg: '#312e81', desc: 'Online video walkthrough'  },
  OFFICE:  { label: 'Office Meeting', icon: '🏢', color: '#0ea5e9', bg: '#e0f2fe', darkBg: '#0c4a6e', desc: 'Meet at sales office'      },
};

export const VISIT_STATUS_CFG: Record<VisitStatus, {
  label: string; color: string; bg: string; border: string; icon: string; step: number;
}> = {
  SCHEDULED:   { label: 'Scheduled',   color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe', icon: '📅', step: 1 },
  CONFIRMED:   { label: 'Confirmed',   color: '#0ea5e9', bg: '#e0f2fe', border: '#bae6fd', icon: '✅', step: 2 },
  IN_PROGRESS: { label: 'In Progress', color: '#f59e0b', bg: '#fef3c7', border: '#fde68a', icon: '🚗', step: 3 },
  COMPLETED:   { label: 'Completed',   color: '#10b981', bg: '#d1fae5', border: '#6ee7b7', icon: '🎯', step: 4 },
  RESCHEDULED: { label: 'Rescheduled', color: '#8b5cf6', bg: '#ede9fe', border: '#c4b5fd', icon: '🔄', step: 0 },
  NO_SHOW:     { label: 'No Show',     color: '#ef4444', bg: '#fee2e2', border: '#fca5a5', icon: '❌', step: 0 },
  CANCELLED:   { label: 'Cancelled',   color: '#9ca3af', bg: '#f3f4f6', border: '#e5e7eb', icon: '🚫', step: 0 },
};

export const VISIT_OUTCOME_CFG: Record<VisitOutcome, {
  label: string; color: string; bg: string; icon: string; next?: string;
}> = {
  BOOKING_INITIATED:   { label: 'Booking Initiated',  color: '#10b981', bg: '#d1fae5', icon: '🎉', next: 'booking'     },
  NEGOTIATION_STARTED: { label: 'Negotiation',        color: '#8b5cf6', bg: '#ede9fe', icon: '🤝', next: 'negotiation' },
  FOLLOW_UP_REQUIRED:  { label: 'Follow-up Required', color: '#f59e0b', bg: '#fef3c7', icon: '📞', next: 'followup'    },
  REVISIT_NEEDED:      { label: 'Revisit Needed',     color: '#0ea5e9', bg: '#e0f2fe', icon: '🔁', next: 'visit'       },
  LOST:                { label: 'Lost',               color: '#ef4444', bg: '#fee2e2', icon: '❌'                       },
  PENDING:             { label: 'Pending',            color: '#9ca3af', bg: '#f3f4f6', icon: '⏳'                       },
};

export const INTEREST_LEVEL_CFG: Record<InterestLevel, {
  label: string; color: string; bg: string; icon: string; score: number;
}> = {
  VERY_HOT:       { label: 'Very Hot',       color: '#dc2626', bg: '#fee2e2', icon: '🔥', score: 5 },
  HOT:            { label: 'Hot',            color: '#f97316', bg: '#ffedd5', icon: '⚡', score: 4 },
  WARM:           { label: 'Warm',           color: '#f59e0b', bg: '#fef3c7', icon: '🌤', score: 3 },
  COLD:           { label: 'Cold',           color: '#6366f1', bg: '#eef2ff', icon: '❄️', score: 2 },
  NOT_INTERESTED: { label: 'Not Interested', color: '#9ca3af', bg: '#f3f4f6', icon: '👎', score: 1 },
};

export const PRIORITY_CFG: Record<VisitPriority, { label: string; color: string; bg: string; icon: string }> = {
  HIGH:   { label: 'High',   color: '#ef4444', bg: '#fee2e2', icon: '⬆️' },
  NORMAL: { label: 'Normal', color: '#6366f1', bg: '#eef2ff', icon: '➡️' },
  LOW:    { label: 'Low',    color: '#9ca3af', bg: '#f3f4f6', icon: '⬇️' },
};

// ─── Presets ──────────────────────────────────────────────────────────────────

export const OBJECTION_PRESETS = [
  'Price too high', 'Location concern', 'Comparing other projects',
  'Waiting for loan approval', 'Family not convinced', 'Timeline mismatch',
  'Need bigger unit', 'Floor/facing not preferred', 'Parking concern',
  'Amenities concern', 'Builder reputation', 'Possession date far off',
];

export const NEXT_ACTIONS = [
  'Schedule revisit', 'Send brochure & price sheet', 'Share payment plan',
  'Arrange loan consultation', 'Send unit comparison', 'Follow up in 3 days',
  'Follow up in 1 week', 'Share testimonials', 'Initiate booking process',
  'Escalate to manager', 'Mark as lost',
];

export const VISIT_TAGS = ['VIP', 'NRI', 'Corporate', 'Investor', 'Referral', 'Urgent', 'Repeat Visitor'];

export const DURATION_OPTIONS = [
  { value: 30, label: '30 min' }, { value: 45, label: '45 min' },
  { value: 60, label: '1 hr'  }, { value: 90, label: '1.5 hrs' },
  { value: 120, label: '2 hrs' }, { value: 180, label: '3 hrs'  },
];

// ─── Calendar Helpers ─────────────────────────────────────────────────────────

export const HOURS = Array.from({ length: 14 }, (_, i) => {
  const h = i + 8;
  const label = h < 12 ? `${h}:00 AM` : h === 12 ? '12:00 PM' : `${h - 12}:00 PM`;
  return { value: `${String(h).padStart(2, '0')}:00`, label, hour: h };
});

export const MONTH_NAMES = ['January','February','March','April','May','June',
  'July','August','September','October','November','December'];
export const DAY_NAMES_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
export const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

// ─── Date Helpers ─────────────────────────────────────────────────────────────

export const todayStr = () => new Date().toISOString().split('T')[0];

export const isToday = (d: string) => {
  const t = new Date(), dd = new Date(d);
  return dd.getFullYear() === t.getFullYear() && dd.getMonth() === t.getMonth() && dd.getDate() === t.getDate();
};
export const isTomorrow = (d: string) => {
  const t = new Date(); t.setDate(t.getDate() + 1); const dd = new Date(d);
  return dd.getFullYear() === t.getFullYear() && dd.getMonth() === t.getMonth() && dd.getDate() === t.getDate();
};
export const isPast = (date: string, time: string) =>
  new Date(`${date}T${time}`) < new Date();

export const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
export const formatFullDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
export const formatTime = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return `${h === 0 ? 12 : h > 12 ? h - 12 : h}:${String(m).padStart(2,'0')} ${h < 12 ? 'AM' : 'PM'}`;
};
export const timeAgo = (s: string) => {
  const d = Date.now() - new Date(s).getTime();
  const m = Math.floor(d / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const hrs = Math.floor(m / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

// ─── Avatar Helpers ───────────────────────────────────────────────────────────

export const AVATAR_COLORS = ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ef4444','#0ea5e9'];
export const avatarColor = (s = '') => AVATAR_COLORS[s.charCodeAt(0) % AVATAR_COLORS.length];
export const initials = (s = '?') => s.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
export const fmtBudget = (n?: number) => {
  if (!n) return '—';
  if (n >= 10000000) return `₹${(n/10000000).toFixed(1)}Cr`;
  if (n >= 100000)   return `₹${(n/100000).toFixed(0)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
};