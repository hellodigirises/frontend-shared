// ─── Core Enums ──────────────────────────────────────────────────────────────

export type InstallmentStatus = 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE' | 'WAIVED';
export type PaymentMode       = 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'UPI' | 'LOAN';
export type RefundStatus      = 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';
export type PlanType          = 'CONSTRUCTION_LINKED' | 'TIME_LINKED' | 'DOWN_PAYMENT' | 'CUSTOM';
export type LedgerEntryType   = 'INSTALLMENT_CREATED' | 'PAYMENT_RECORDED' | 'PARTIAL_PAYMENT' |
                                'REFUND_ISSUED' | 'ADJUSTMENT' | 'PENALTY' | 'WAIVER' | 'DISCOUNT';
export type CommissionStatus  = 'PENDING' | 'RELEASED' | 'PAID';

// ─── Data Interfaces ──────────────────────────────────────────────────────────

export interface Installment {
  id: string;
  bookingId: string;
  installmentName: string;
  description?: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: InstallmentStatus;
  milestoneTag?: string;       // e.g. 'BOOKING', 'FOUNDATION', 'STRUCTURE', 'POSSESSION'
  order: number;
  payments?: Payment[];
  reminderSent?: boolean;
  waivedBy?: string;
  waivedAt?: string;
  waivedReason?: string;
  penalty?: number;
  penaltyWaived?: boolean;
}

export interface Payment {
  id: string;
  bookingId: string;
  installmentId?: string;
  amount: number;
  paymentDate: string;
  paymentMode: PaymentMode;
  transactionRef?: string;
  chequeNumber?: string;
  bankName?: string;
  notes?: string;
  receiptNumber?: string;
  receiptUrl?: string;
  recordedBy?: { name: string };
  createdAt: string;
  gstAmount?: number;
  tdsAmount?: number;
}

export interface Refund {
  id: string;
  bookingId: string;
  amount: number;
  reason: string;
  refundDate?: string;
  refundMode?: PaymentMode;
  referenceNumber?: string;
  status: RefundStatus;
  approvedBy?: string;
  notes?: string;
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  bookingId: string;
  type: LedgerEntryType;
  description: string;
  debit?: number;
  credit?: number;
  balance: number;
  referenceId?: string;
  createdAt: string;
  createdBy?: { name: string };
}

export interface PaymentPlanTemplate {
  id: string;
  name: string;
  planType: PlanType;
  description?: string;
  installmentRules: InstallmentRule[];
  isDefault?: boolean;
  createdAt: string;
}

export interface InstallmentRule {
  id?: string;
  name: string;
  description?: string;
  percentage: number;          // % of total booking value
  amount?: number;             // fixed amount (overrides %)
  daysFromBooking?: number;    // offset from booking date
  milestoneTag?: string;       // construction milestone
  order: number;
}

export interface BookingFinancialSummary {
  bookingId: string;
  customerName: string;
  projectName: string;
  unitNumber: string;
  agentName?: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  installments: Installment[];
  payments: Payment[];
  refunds: Refund[];
  ledger: LedgerEntry[];
  loanDetails?: LoanDetail;
  commissions?: CommissionRecord[];
}

export interface LoanDetail {
  id: string;
  bankName: string;
  loanAmount: number;
  disbursedAmount: number;
  disbursementDate?: string;
  status: 'APPLIED' | 'SANCTIONED' | 'DISBURSED' | 'CLOSED';
  referenceNumber?: string;
}

export interface CommissionRecord {
  id: string;
  agentName: string;
  installmentName: string;
  commissionAmount: number;
  percentage: number;
  status: CommissionStatus;
  triggeredAt: string;
  paidAt?: string;
}

// ─── Config Maps ──────────────────────────────────────────────────────────────

export const INSTALLMENT_STATUS_CFG: Record<InstallmentStatus, {
  label: string; color: string; bg: string; border: string; icon: string;
}> = {
  PENDING:  { label: 'Pending',  color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe', icon: '⏳' },
  PAID:     { label: 'Paid',     color: '#10b981', bg: '#d1fae5', border: '#6ee7b7', icon: '✅' },
  PARTIAL:  { label: 'Partial',  color: '#f59e0b', bg: '#fef3c7', border: '#fde68a', icon: '⚡' },
  OVERDUE:  { label: 'Overdue',  color: '#ef4444', bg: '#fee2e2', border: '#fca5a5', icon: '🔴' },
  WAIVED:   { label: 'Waived',   color: '#9ca3af', bg: '#f3f4f6', border: '#e5e7eb', icon: '🎁' },
};

export const PAYMENT_MODE_CFG: Record<PaymentMode, {
  label: string; icon: string; color: string; bg: string;
}> = {
  CASH:          { label: 'Cash',          icon: '💵', color: '#10b981', bg: '#d1fae5' },
  BANK_TRANSFER: { label: 'Bank Transfer', icon: '🏦', color: '#3b82f6', bg: '#dbeafe' },
  CHEQUE:        { label: 'Cheque',        icon: '📄', color: '#8b5cf6', bg: '#ede9fe' },
  UPI:           { label: 'UPI',           icon: '📱', color: '#f59e0b', bg: '#fef3c7' },
  LOAN:          { label: 'Loan',          icon: '🏛',  color: '#0ea5e9', bg: '#e0f2fe' },
};

export const REFUND_STATUS_CFG: Record<RefundStatus, {
  label: string; color: string; bg: string; icon: string;
}> = {
  PENDING:  { label: 'Pending',  color: '#6366f1', bg: '#eef2ff', icon: '⏳' },
  APPROVED: { label: 'Approved', color: '#f59e0b', bg: '#fef3c7', icon: '✔️' },
  PAID:     { label: 'Paid',     color: '#10b981', bg: '#d1fae5', icon: '✅' },
  REJECTED: { label: 'Rejected', color: '#ef4444', bg: '#fee2e2', icon: '❌' },
};

export const PLAN_TYPE_CFG: Record<PlanType, { label: string; icon: string; desc: string }> = {
  CONSTRUCTION_LINKED: { label: 'Construction Linked', icon: '🏗', desc: 'Payments tied to construction milestones' },
  TIME_LINKED:         { label: 'Time Linked',         icon: '📅', desc: 'Fixed installments at regular intervals' },
  DOWN_PAYMENT:        { label: 'Down Payment',        icon: '💰', desc: 'Large upfront payment, fewer installments' },
  CUSTOM:              { label: 'Custom Plan',         icon: '⚙️', desc: 'Flexible custom installment structure' },
};

export const LEDGER_ENTRY_CFG: Record<LedgerEntryType, {
  label: string; icon: string; color: string; isDebit: boolean;
}> = {
  INSTALLMENT_CREATED: { label: 'Installment Due',    icon: '📋', color: '#6366f1', isDebit: true  },
  PAYMENT_RECORDED:    { label: 'Payment Received',   icon: '✅', color: '#10b981', isDebit: false },
  PARTIAL_PAYMENT:     { label: 'Partial Payment',    icon: '⚡', color: '#f59e0b', isDebit: false },
  REFUND_ISSUED:       { label: 'Refund Issued',      icon: '↩️', color: '#ef4444', isDebit: true  },
  ADJUSTMENT:          { label: 'Adjustment',         icon: '🔧', color: '#8b5cf6', isDebit: false },
  PENALTY:             { label: 'Late Penalty',       icon: '⚠️', color: '#ef4444', isDebit: true  },
  WAIVER:              { label: 'Amount Waived',      icon: '🎁', color: '#10b981', isDebit: false },
  DISCOUNT:            { label: 'Discount Applied',   icon: '🏷',  color: '#0ea5e9', isDebit: false },
};

export const MILESTONE_TAGS = [
  { value: 'BOOKING',    label: 'Booking Amount',   icon: '🔑', color: '#6366f1' },
  { value: 'DOWN',       label: 'Down Payment',     icon: '💰', color: '#10b981' },
  { value: 'FOUNDATION', label: 'Foundation',       icon: '🧱', color: '#f59e0b' },
  { value: 'STRUCTURE',  label: 'Structure',        icon: '🏗',  color: '#8b5cf6' },
  { value: 'BRICKWORK',  label: 'Brickwork',        icon: '🏛',  color: '#3b82f6' },
  { value: 'PLASTERING', label: 'Plastering',       icon: '🎨', color: '#ec4899' },
  { value: 'FLOORING',   label: 'Flooring',         icon: '🪵', color: '#d97706' },
  { value: 'HANDOVER',   label: 'Handover/Possession', icon: '🏠', color: '#059669' },
  { value: 'REGISTRATION', label: 'Registration',  icon: '📜', color: '#7c3aed' },
];

// ─── Financial Helpers ────────────────────────────────────────────────────────

export const INR_FORMAT = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0
});

export const fmtINR = (n: number) => {
  if (!n && n !== 0) return '—';
  if (n >= 10000000) return `₹${(n/10000000).toFixed(2)}Cr`;
  if (n >= 100000)   return `₹${(n/100000).toFixed(1)}L`;
  if (n >= 1000)     return `₹${(n/1000).toFixed(0)}K`;
  return `₹${n.toLocaleString('en-IN')}`;
};

export const fmtINRFull = (n: number) =>
  `₹${n.toLocaleString('en-IN')}`;

export const genReceiptNumber = () =>
  `RCP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5,'0')}`;

export const isOverdue = (dueDateStr: string, status: InstallmentStatus) => {
  if (status === 'PAID' || status === 'WAIVED') return false;
  return new Date(dueDateStr) < new Date();
};

export const daysUntilDue = (dueDateStr: string) => {
  const diff = new Date(dueDateStr).setHours(0,0,0,0) - new Date().setHours(0,0,0,0);
  return Math.ceil(diff / 86400000);
};

export const getDueDateLabel = (dueDateStr: string, status: InstallmentStatus) => {
  if (status === 'PAID') return 'Paid';
  if (status === 'WAIVED') return 'Waived';
  const days = daysUntilDue(dueDateStr);
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  if (days <= 7)  return `Due in ${days}d`;
  return new Date(dueDateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

// ─── Avatar Helpers ───────────────────────────────────────────────────────────

export const AVATAR_COLORS = ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ef4444','#0ea5e9'];
export const avatarColor = (s = '') => AVATAR_COLORS[s.charCodeAt(0) % AVATAR_COLORS.length];
export const initials = (s = '?') => s.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

export const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const timeAgo = (s: string) => {
  const d = Date.now() - new Date(s).getTime();
  const m = Math.floor(d / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};