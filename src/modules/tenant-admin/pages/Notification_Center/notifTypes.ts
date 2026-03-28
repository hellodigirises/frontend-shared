// ─── Core Enums ──────────────────────────────────────────────────────────────

export type NotifType      = 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR' | 'ACTION_REQUIRED' | 'LEAD_ASSIGNED' | 'PAYMENT_RECEIVED' | 'BOOKING_CONFIRMED' | 'PAYMENT_OVERDUE' | 'MESSAGE_RECEIVED';
export type NotifChannel   = 'IN_APP' | 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH';
export type NotifCategory  =
  | 'LEAD' | 'VISIT' | 'BOOKING' | 'PAYMENT' | 'DOCUMENT'
  | 'TASK' | 'COMMISSION' | 'SYSTEM' | 'ANNOUNCEMENT' | 'MESSAGE';

export type MessageStatus  = 'SENT' | 'DELIVERED' | 'READ';
export type ConvType       = 'DIRECT' | 'GROUP';
export type AnnouncementAudience = 'ALL' | 'AGENTS' | 'MANAGERS' | 'HR' | 'FINANCE' | 'ADMIN' | 'ROLE_SPECIFIC' | 'DEPARTMENT';
export type EscalationStatus = 'PENDING' | 'ESCALATED' | 'RESOLVED';

// ─── Data Interfaces ──────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  type: NotifType;
  category: NotifCategory;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  entityLabel?: string;
  isRead: boolean;
  isPinned?: boolean;
  priority: 'HIGH' | 'NORMAL' | 'LOW';
  channels: NotifChannel[];
  actionLabel?: string;
  actionUrl?: string;
  createdAt: string;
  readAt?: string;
  expiresAt?: string;
  triggeredBy?: { name: string };
  metadata?: Record<string, any>;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole?: string;
  content: string;
  attachments?: MessageAttachment[];
  status: MessageStatus;
  replyToId?: string;
  replyToContent?: string;
  reactions?: Record<string, string[]>;
  editedAt?: string;
  deletedAt?: string;
  createdAt: string;
}

export interface MessageAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
}

export interface Conversation {
  id: string;
  type: ConvType;
  name?: string;             // for groups
  participants: ConvParticipant[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  isPinned?: boolean;
  isArchived?: boolean;
}

export interface ConvParticipant {
  id: string;
  name: string;
  role?: string;
  isOnline?: boolean;
  lastSeen?: string;
  avatar?: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  department?: string;
  targetRole?: string;
  priority: 'HIGH' | 'NORMAL' | 'LOW';
  pinned: boolean;
  scheduledAt?: string;
  publishedAt?: string;
  expiresAt?: string;
  readCount: number;
  totalRecipients: number;
  attachments?: { name: string; url: string }[];
  createdBy: { id: string; name: string };
  createdAt: string;
  tags?: string[];
}

export interface ActivityFeedItem {
  id: string;
  actorName: string;
  actorRole?: string;
  action: string;
  entityType: string;
  entityLabel: string;
  entityId: string;
  details?: string;
  timestamp: string;
  icon: string;
  color: string;
}

export interface NotificationPreferences {
  userId: string;
  email: {
    leadAssigned: boolean;
    followUpReminder: boolean;
    visitReminder: boolean;
    bookingConfirmed: boolean;
    paymentAlert: boolean;
    overdueAlert: boolean;
    documentRequest: boolean;
    taskAssigned: boolean;
    announcements: boolean;
  };
  inApp: {
    all: boolean;
    mentions: boolean;
    reminders: boolean;
    criticalOnly: boolean;
  };
  push: {
    enabled: boolean;
    quietHoursFrom: string;
    quietHoursTo: string;
  };
  digest: 'REALTIME' | 'HOURLY' | 'DAILY' | 'WEEKLY';
}

export interface CommunicationLog {
  id: string;
  entityType: string;
  entityId: string;
  entityLabel?: string;
  channel: NotifChannel;
  direction: 'INBOUND' | 'OUTBOUND';
  subject?: string;
  summary: string;
  status: 'DELIVERED' | 'FAILED' | 'PENDING';
  createdBy?: { name: string };
  createdAt: string;
}

export interface EscalationRecord {
  id: string;
  entityType: string;
  entityId: string;
  entityLabel: string;
  reason: string;
  originalAssignee: { name: string };
  escalatedTo?: { name: string };
  status: EscalationStatus;
  attempts: number;
  createdAt: string;
  resolvedAt?: string;
}

// ─── Config Maps ──────────────────────────────────────────────────────────────

export const NOTIF_TYPE_CFG: Record<NotifType, {
  label: string; color: string; bg: string; border: string; icon: string; darkBg: string;
}> = {
  INFO:            { label: 'Info',            color: '#3b82f6', bg: '#dbeafe', border: '#bfdbfe', icon: 'ℹ️',  darkBg: '#1e3a5f' },
  WARNING:         { label: 'Warning',         color: '#f59e0b', bg: '#fef3c7', border: '#fde68a', icon: '⚠️',  darkBg: '#451a03' },
  SUCCESS:         { label: 'Success',         color: '#10b981', bg: '#d1fae5', border: '#6ee7b7', icon: '✅',  darkBg: '#064e3b' },
  ERROR:           { label: 'Error',           color: '#ef4444', bg: '#fee2e2', border: '#fca5a5', icon: '🚨',  darkBg: '#450a0a' },
  ACTION_REQUIRED: { label: 'Action Required', color: '#8b5cf6', bg: '#ede9fe', border: '#c4b5fd', icon: '⚡',  darkBg: '#2e1065' },
  LEAD_ASSIGNED:   { label: 'Lead Assigned',   color: '#6366f1', bg: '#eef2ff', border: '#e0e7ff', icon: '🎯',  darkBg: '#1e1b4b' },
  PAYMENT_RECEIVED:{ label: 'Payment Paid',    color: '#10b981', bg: '#d1fae5', border: '#a7f3d0', icon: '💰',  darkBg: '#064e3b' },
  BOOKING_CONFIRMED:{ label: 'Booking Fixed',  color: '#0ea5e9', bg: '#e0f2fe', border: '#bae6fd', icon: '📝',  darkBg: '#0c4a6e' },
  PAYMENT_OVERDUE: { label: 'Payment Alert',   color: '#f59e0b', bg: '#fef3c7', border: '#fde68a', icon: '⚠️',  darkBg: '#451a03' },
  MESSAGE_RECEIVED:{ label: 'New Message',     color: '#ec4899', bg: '#fce7f3', border: '#fbcfe8', icon: '💬',  darkBg: '#500724' },
};

export const NOTIF_CATEGORY_CFG: Record<NotifCategory, { label: string; icon: string; color: string }> = {
  LEAD:         { label: 'Lead',         icon: '🎯', color: '#6366f1' },
  VISIT:        { label: 'Site Visit',   icon: '🏠', color: '#0ea5e9' },
  BOOKING:      { label: 'Booking',      icon: '📝', color: '#10b981' },
  PAYMENT:      { label: 'Payment',      icon: '💰', color: '#f59e0b' },
  DOCUMENT:     { label: 'Document',     icon: '📄', color: '#8b5cf6' },
  TASK:         { label: 'Task',         icon: '✅', color: '#14b8a6' },
  COMMISSION:   { label: 'Commission',   icon: '🏅', color: '#f97316' },
  SYSTEM:       { label: 'System',       icon: '⚙️', color: '#64748b' },
  ANNOUNCEMENT: { label: 'Announcement', icon: '📢', color: '#ec4899' },
  MESSAGE:      { label: 'Message',      icon: '💬', color: '#06b6d4' },
};

export const AUDIENCE_CFG: Record<AnnouncementAudience, { label: string; icon: string; color: string }> = {
  ALL:           { label: 'Everyone',     icon: '🌐', color: '#6366f1' },
  AGENTS:        { label: 'Agents',       icon: '👤', color: '#10b981' },
  MANAGERS:      { label: 'Managers',     icon: '👔', color: '#0ea5e9' },
  HR:            { label: 'HR Team',      icon: '👥', color: '#ec4899' },
  FINANCE:       { label: 'Finance',      icon: '💰', color: '#f59e0b' },
  ADMIN:         { label: 'Admins',       icon: '🛡',  color: '#8b5cf6' },
  ROLE_SPECIFIC: { label: 'Specific Role',icon: '👤', color: '#10b981' },
  DEPARTMENT:    { label: 'Department',   icon: '🏢', color: '#8b5cf6' },
};

export const CHANNEL_CFG: Record<NotifChannel, { label: string; icon: string; color: string }> = {
  IN_APP:   { label: 'In-App',   icon: '🔔', color: '#6366f1' },
  EMAIL:    { label: 'Email',    icon: '📧', color: '#0ea5e9' },
  SMS:      { label: 'SMS',      icon: '📱', color: '#10b981' },
  WHATSAPP: { label: 'WhatsApp', icon: '💬', color: '#25d366' },
  PUSH:     { label: 'Push',     icon: '📲', color: '#f59e0b' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const AVATAR_COLORS = ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ef4444','#0ea5e9'];
export const avatarColor   = (s = '') => {
  if (!s) return AVATAR_COLORS[0];
  return AVATAR_COLORS[s.charCodeAt(0) % AVATAR_COLORS.length];
};
export const initials      = (s = '?') => {
  if (!s || typeof s !== 'string') return '?';
  const parts = s.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
};
export const timeAgo       = (s: string) => {
  if (!s) return '';
  try {
    const d = Date.now() - new Date(s).getTime();
    if (isNaN(d)) return '';
    const m = Math.floor(d / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    if (Math.floor(h / 24) === 1) return 'yesterday';
    return `${Math.floor(h / 24)}d ago`;
  } catch (e) {
    return '';
  }
};
export const formatTime    = (s: string) => {
  if (!s) return '';
  try {
    return new Date(s).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  } catch (e) { return ''; }
};
export const formatDate    = (s: string) => {
  if (!s) return '';
  try {
    return new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } catch (e) { return ''; }
};
export const formatFileSize = (b: number) => {
  if (!b) return '0KB';
  return b < 1048576 ? `${(b / 1024).toFixed(1)}KB` : `${(b / 1048576).toFixed(1)}MB`;
};