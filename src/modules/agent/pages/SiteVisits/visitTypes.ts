// src/modules/agent/pages/SiteVisits/visitTypes.ts

// ─── Core Enums ──────────────────────────────────────────────────────────────

export type VisitType     = 'PHYSICAL' | 'VIRTUAL' | 'GUIDED' | 'SELF_GUIDED';
export type VisitStatus   = 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED' | 'RESCHEDULED' | 'REQUESTED';
export type VisitOutcome  = 'INTERESTED' | 'NOT_INTERESTED' | 'FOLLOW_UP_NEEDED' | 'BOOKING_INITIATED' | 'NEGOTIATION' | 'LOST';
export type VisitPriority = 'HIGH' | 'MEDIUM' | 'LOW';

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

export interface SiteVisit {
  id: string;
  visitType: VisitType;
  status: VisitStatus;
  outcome?: VisitOutcome;
  priority: VisitPriority;
  // Relations
  lead: VisitLead;
  agent: VisitAgent;
  projectId?: string;
  unitId?: string;
  project?: { id: string; name: string };
  unit?: { id: string; unitNumber: string };
  // Property details (optional strings)
  tower?: string;
  floor?: string;
  // Scheduling
  visitDate: string;
  visitTime: string;
  durationMinutes: number;
  // Check-in
  checkInLat?: number;
  checkInLng?: number;
  checkInAt?: string;
  checkOutAt?: string;
  // Content
  notes?: string;
  feedback?: any;
  photoUrls: string[];
  tags: string[];
  // Meta
  completedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

// ─── Config Maps ──────────────────────────────────────────────────────────────

export const VISIT_TYPE_CFG: Record<VisitType, {
  label: string; icon: string; color: string; bg: string; darkBg: string; desc: string;
}> = {
  PHYSICAL:    { label: 'On-site Visit',  icon: '🏠', color: '#10b981', bg: '#d1fae5', darkBg: '#065f46', desc: 'Physical site tour'       },
  VIRTUAL:     { label: 'Virtual Tour',   icon: '💻', color: '#6366f1', bg: '#eef2ff', darkBg: '#312e81', desc: 'Online video walkthrough'  },
  GUIDED:      { label: 'Guided Tour',    icon: '👤', color: '#0ea5e9', bg: '#e0f2fe', darkBg: '#0c4a6e', desc: 'Agent-led personalized tour' },
  SELF_GUIDED: { label: 'Self Visit',     icon: '🚶', color: '#f59e0b', bg: '#fef3c7', darkBg: '#78350f', desc: 'Customer visits alone'      },
};

export const VISIT_STATUS_CFG: Record<VisitStatus, {
  label: string; color: string; bg: string; border: string; icon: string;
}> = {
  REQUESTED:            { label: 'Requested',    color: '#f59e0b', bg: '#fef3c7', border: '#fde68a', icon: '📩' },
  PENDING_CONFIRMATION: { label: 'Pending',      color: '#f59e0b', bg: '#fef3c7', border: '#fde68a', icon: '⏳' },
  CONFIRMED:            { label: 'Confirmed',    color: '#0ea5e9', bg: '#e0f2fe', border: '#bae6fd', icon: '✅' },
  IN_PROGRESS:          { label: 'In Progress',  color: '#8b5cf6', bg: '#ede9fe', border: '#c4b5fd', icon: '🚶' },
  COMPLETED:            { label: 'Completed',    color: '#10b981', bg: '#d1fae5', border: '#6ee7b7', icon: '🎯' },
  CANCELLED:            { label: 'Cancelled',    color: '#9ca3af', bg: '#f3f4f6', border: '#e5e7eb', icon: '🚫' },
  NO_SHOW:              { label: 'No Show',      color: '#ef4444', bg: '#fee2e2', border: '#fca5a5', icon: '❌' },
  RESCHEDULED:          { label: 'Rescheduled',  color: '#8b5cf6', bg: '#ede9fe', border: '#c4b5fd', icon: '🔄' },
};

export const PRIORITY_CFG: Record<VisitPriority, { label: string; color: string; bg: string; icon: string }> = {
  HIGH:   { label: 'High',   color: '#ef4444', bg: '#fee2e2', icon: '🔥' },
  MEDIUM: { label: 'Medium', color: '#6366f1', bg: '#eef2ff', icon: '➡️' },
  LOW:    { label: 'Low',    color: '#9ca3af', bg: '#f3f4f6', icon: '⬇️' },
};

export const VISIT_TAGS = ['VIP', 'NRI', 'Corporate', 'Investor', 'Urgent', 'Repeat'];

export const DURATION_OPTIONS = [
  { value: 30, label: '30 min' }, { value: 60, label: '1 hr'  },
  { value: 90, label: '1.5 hrs' }, { value: 120, label: '2 hrs' },
];

export const HOURS = Array.from({ length: 14 }, (_, i) => {
  const h = i + 8;
  const label = h < 12 ? `${h}:00 AM` : h === 12 ? '12:00 PM' : `${h - 12}:00 PM`;
  return { value: `${String(h).padStart(2, '0')}:00`, label };
});

export const todayStr = () => new Date().toISOString().split('T')[0];

export const avatarColor = (s = '') => ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6'][s.charCodeAt(0) % 5];
export const initials = (s = '?') => s.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
