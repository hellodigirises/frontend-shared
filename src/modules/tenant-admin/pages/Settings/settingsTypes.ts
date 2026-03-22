// ─── Core Enums ──────────────────────────────────────────────────────────────

export type CustomFieldType    = 'TEXT' | 'NUMBER' | 'DROPDOWN' | 'CHECKBOX' | 'DATE' | 'MULTI_SELECT' | 'PHONE' | 'EMAIL' | 'URL';
export type CustomFieldEntity  = 'LEAD' | 'BOOKING' | 'CUSTOMER' | 'UNIT' | 'PROJECT' | 'PARTNER' | 'EMPLOYEE';
export type WorkflowTrigger    = 'LEAD_CREATED' | 'LEAD_ASSIGNED' | 'VISIT_SCHEDULED' | 'VISIT_COMPLETED' | 'BOOKING_CREATED' | 'PAYMENT_RECEIVED' | 'PAYMENT_OVERDUE' | 'TASK_OVERDUE' | 'DOCUMENT_UPLOADED';
export type WorkflowAction     = 'ASSIGN_AGENT' | 'CREATE_TASK' | 'SEND_EMAIL' | 'SEND_NOTIFICATION' | 'UPDATE_STAGE' | 'CREATE_FOLLOWUP' | 'SEND_WHATSAPP';
export type DomainStatus       = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'VERIFYING';
export type PermissionAction   = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'APPROVE';
export type IntegrationStatus  = 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'PENDING';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface CompanyProfile {
  id: string;
  name: string;
  tagline?: string;
  logoUrl?: string;
  faviconUrl?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  website?: string;
  supportEmail?: string;
  supportPhone?: string;
  gstNumber?: string;
  reraNumber?: string;
  timezone?: string;
  currency?: string;
  language?: string;
}

export interface BrandingSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  darkMode: boolean;
  sidebarStyle: 'DARK' | 'LIGHT' | 'BRANDED';
  fontFamily: string;
  emailSignature?: string;
  footerText?: string;
  customCss?: string;
}

export interface DomainRequest {
  id?: string;
  currentDomain: string;
  requestedDomain: string;
  domainType: 'SUBDOMAIN' | 'CUSTOM';
  status: DomainStatus;
  verificationRecord?: string;
  isVerified: boolean;
  requestedAt?: string;
  resolvedAt?: string;
  notes?: string;
}

export interface CustomField {
  id: string;
  name: string;
  apiKey: string;            // snake_case key for API
  entityType: CustomFieldEntity;
  fieldType: CustomFieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  options?: string[];        // for dropdown / multi_select
  isRequired: boolean;
  isActive: boolean;
  defaultValue?: string;
  order: number;
  createdAt: string;
}

export interface WorkflowRule {
  id: string;
  name: string;
  description?: string;
  trigger: WorkflowTrigger;
  conditions: WorkflowCondition[];
  actions: WorkflowActionItem[];
  isActive: boolean;
  executionCount: number;
  createdAt: string;
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value?: string;
}

export interface WorkflowActionItem {
  action: WorkflowAction;
  params: Record<string, string>;
}

export interface ModuleFlag {
  key: string;
  label: string;
  description: string;
  icon: string;
  isEnabled: boolean;
  isPro?: boolean;
  superAdminOnly?: boolean;
  dependsOn?: string[];
}

export interface RolePermission {
  id: string;
  roleName: string;
  description?: string;
  color: string;
  isDefault?: boolean;
  permissions: Record<string, Record<PermissionAction, boolean>>;
  memberCount?: number;
}

export interface PaymentConfig {
  currency: string;
  gstPercentage: number;
  tdsPercentage: number;
  latePaymentPenaltyPct: number;
  gracePeriodDays: number;
  defaultPaymentPlanId?: string;
  receiptPrefix: string;
  enableAutoReceipts: boolean;
  enableGstInvoice: boolean;
}

export interface SecurityConfig {
  minPasswordLength: number;
  requireUppercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  passwordExpiryDays: number;
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  twoFactorEnabled: boolean;
  ipWhitelistEnabled: boolean;
  allowedIPs: string[];
}

export interface EmailTemplate {
  id: string;
  key: string;
  label: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  variables: string[];
  category: string;
  isActive: boolean;
  updatedAt: string;
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  status: IntegrationStatus;
  apiKey?: string;
  webhookUrl?: string;
  accessToken?: string;
  extraConfig?: Record<string, string>;
  connectedAt?: string;
  lastSyncAt?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// ─── Config Maps ──────────────────────────────────────────────────────────────

export const CUSTOM_FIELD_TYPE_CFG: Record<CustomFieldType, { label: string; icon: string; color: string }> = {
  TEXT:         { label: 'Text',         icon: '📝', color: '#6366f1' },
  NUMBER:       { label: 'Number',       icon: '🔢', color: '#3b82f6' },
  DROPDOWN:     { label: 'Dropdown',     icon: '📋', color: '#f59e0b' },
  CHECKBOX:     { label: 'Checkbox',     icon: '☑️',  color: '#10b981' },
  DATE:         { label: 'Date',         icon: '📅', color: '#8b5cf6' },
  MULTI_SELECT: { label: 'Multi-Select', icon: '🔲', color: '#ec4899' },
  PHONE:        { label: 'Phone',        icon: '📞', color: '#0ea5e9' },
  EMAIL:        { label: 'Email',        icon: '📧', color: '#14b8a6' },
  URL:          { label: 'URL',          icon: '🔗', color: '#64748b' },
};

export const WORKFLOW_TRIGGER_CFG: Record<WorkflowTrigger, { label: string; icon: string }> = {
  LEAD_CREATED:      { label: 'Lead Created',        icon: '🎯' },
  LEAD_ASSIGNED:     { label: 'Lead Assigned',        icon: '👤' },
  VISIT_SCHEDULED:   { label: 'Visit Scheduled',      icon: '📅' },
  VISIT_COMPLETED:   { label: 'Visit Completed',      icon: '✅' },
  BOOKING_CREATED:   { label: 'Booking Created',      icon: '📝' },
  PAYMENT_RECEIVED:  { label: 'Payment Received',     icon: '💰' },
  PAYMENT_OVERDUE:   { label: 'Payment Overdue',      icon: '🔴' },
  TASK_OVERDUE:      { label: 'Task Overdue',         icon: '⚠️' },
  DOCUMENT_UPLOADED: { label: 'Document Uploaded',    icon: '📄' },
};

export const WORKFLOW_ACTION_CFG: Record<WorkflowAction, { label: string; icon: string; color: string }> = {
  ASSIGN_AGENT:      { label: 'Assign Agent',         icon: '👤', color: '#6366f1' },
  CREATE_TASK:       { label: 'Create Task',          icon: '✅', color: '#10b981' },
  SEND_EMAIL:        { label: 'Send Email',           icon: '📧', color: '#0ea5e9' },
  SEND_NOTIFICATION: { label: 'Send Notification',    icon: '🔔', color: '#f59e0b' },
  UPDATE_STAGE:      { label: 'Update Stage',         icon: '🔄', color: '#8b5cf6' },
  CREATE_FOLLOWUP:   { label: 'Create Follow-up',     icon: '📞', color: '#ec4899' },
  SEND_WHATSAPP:     { label: 'Send WhatsApp',        icon: '💬', color: '#25d366' },
};

export const DOMAIN_STATUS_CFG: Record<DomainStatus, { label: string; color: string; bg: string; icon: string }> = {
  PENDING:   { label: 'Pending Review', color: '#6366f1', bg: '#eef2ff', icon: '⏳' },
  APPROVED:  { label: 'Approved',       color: '#10b981', bg: '#d1fae5', icon: '✅' },
  REJECTED:  { label: 'Rejected',       color: '#ef4444', bg: '#fee2e2', icon: '❌' },
  ACTIVE:    { label: 'Active',         color: '#10b981', bg: '#d1fae5', icon: '🟢' },
  VERIFYING: { label: 'DNS Verifying',  color: '#f59e0b', bg: '#fef3c7', icon: '🔍' },
};

export const MODULE_FLAGS: ModuleFlag[] = [
  { key: 'PROJECT_MANAGEMENT',  label: 'Project Management',   description: 'Projects, towers, units & inventory', icon: '🏗',  isEnabled: true  },
  { key: 'LEAD_CRM',            label: 'Lead CRM',             description: 'Leads, pipeline & follow-ups',        icon: '🎯', isEnabled: true  },
  { key: 'SITE_VISITS',         label: 'Site Visits',          description: 'Visit scheduling & tracking',         icon: '🏠', isEnabled: true  },
  { key: 'BOOKING_SYSTEM',      label: 'Booking System',       description: 'Bookings & unit allocation',          icon: '📝', isEnabled: true  },
  { key: 'PAYMENT_MANAGEMENT',  label: 'Payment Management',   description: 'Installments, receipts & ledger',     icon: '💰', isEnabled: true  },
  { key: 'CHANNEL_PARTNER',     label: 'Channel Partners',     description: 'Broker network & commissions',        icon: '🤝', isEnabled: true  },
  { key: 'HR_MODULE',           label: 'HR Module',            description: 'Employees, attendance & payroll',     icon: '👔', isEnabled: false, isPro: true },
  { key: 'DOCUMENT_MANAGEMENT', label: 'Document Vault',       description: 'KYC, agreements & digital signatures',icon: '📄', isEnabled: true  },
  { key: 'ANALYTICS_ENGINE',    label: 'Advanced Analytics',   description: 'Reports, dashboards & insights',      icon: '📊', isEnabled: true  },
  { key: 'AI_INSIGHTS',         label: 'AI Insights',          description: 'Lead scoring & smart recommendations',icon: '🧠', isEnabled: false, isPro: true },
  { key: 'NOTIFICATION_CENTER', label: 'Notification Center',  description: 'Alerts, messages & announcements',    icon: '🔔', isEnabled: true  },
  { key: 'MARKETING_AUTOMATION',label: 'Marketing Automation', description: 'Lead nurturing & email sequences',    icon: '📣', isEnabled: false, isPro: true },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const toSlug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

export const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
export const timeAgo = (s: string) => {
  const d = Date.now() - new Date(s).getTime(), m = Math.floor(d / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export const AVATAR_COLORS = ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#8b5cf6'];
export const avatarColor = (s = '') => AVATAR_COLORS[s.charCodeAt(0) % AVATAR_COLORS.length];
export const initials    = (s = '?') => s.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);