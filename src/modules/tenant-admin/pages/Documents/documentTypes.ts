// ─── Core Enums ──────────────────────────────────────────────────────────────

export type DocumentCategory = 'KYC' | 'LEGAL' | 'FINANCE' | 'MARKETING' | 'INTERNAL' | 'AGREEMENT';
export type DocumentStatus   = 'UPLOADED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
export type KYCStatus        = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';
export type EntityType       = 'LEAD' | 'BOOKING' | 'CUSTOMER' | 'PROJECT' | 'UNIT' | 'PARTNER' | 'EMPLOYEE' | 'TENANT';
export type FileType         = 'PDF' | 'JPG' | 'PNG' | 'DOCX' | 'XLSX' | 'MP4' | 'OTHER';
export type ShareAccess      = 'VIEW' | 'DOWNLOAD' | 'EDIT';
export type AgreementStatus  = 'DRAFT' | 'SENT' | 'VIEWED' | 'SIGNED' | 'EXPIRED' | 'REJECTED';
export type SignatureMethod  = 'DRAW' | 'UPLOAD' | 'OTP';
export type AuditAction      = 'UPLOADED' | 'DOWNLOADED' | 'VIEWED' | 'SHARED' | 'APPROVED' | 'REJECTED' | 'DELETED' | 'SIGNED' | 'VERSIONED';

// ─── Data Interfaces ──────────────────────────────────────────────────────────

export interface Document {
  id: string;
  fileName: string;
  displayName?: string;
  fileType: FileType;
  fileSize: number;           // bytes
  mimeType: string;
  category: DocumentCategory;
  status: DocumentStatus;
  entityType: EntityType;
  entityId: string;
  entityLabel?: string;       // "Rahul Sharma - Booking #1234"
  s3Url?: string;
  previewUrl?: string;
  thumbnailUrl?: string;
  tags?: string[];
  description?: string;
  // Versioning
  version: number;
  previousVersions?: DocumentVersion[];
  // Expiry
  expiryDate?: string;
  isExpired?: boolean;
  expiresInDays?: number;
  // Sharing
  shareLinks?: ShareLink[];
  // Metadata
  uploadedBy: { id: string; name: string };
  reviewedBy?: { id: string; name: string };
  approvedBy?: { id: string; name: string };
  createdAt: string;
  updatedAt?: string;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  fileName: string;
  fileSize: number;
  s3Url?: string;
  uploadedBy: { name: string };
  createdAt: string;
  changeNote?: string;
}

export interface ShareLink {
  id: string;
  token: string;
  accessLevel: ShareAccess;
  expiresAt?: string;
  viewCount: number;
  recipientEmail?: string;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  documentId: string;
  userId: string;
  userName: string;
  action: AuditAction;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface KYCRecord {
  id: string;
  customerId: string;
  customerName: string;
  bookingId?: string;
  pan?: Document;
  aadhar?: Document;
  addressProof?: Document;
  photo?: Document;
  bankStatement?: Document;
  status: KYCStatus;
  verifiedBy?: { name: string };
  verifiedAt?: string;
  rejectionReason?: string;
  completeness: number;       // % of required docs uploaded
  createdAt: string;
}

export interface AgreementTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  htmlContent: string;
  variables: TemplateVariable[];
  isDefault?: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface TemplateVariable {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'currency';
  required: boolean;
  defaultValue?: string;
}

export interface Agreement {
  id: string;
  templateId: string;
  templateName: string;
  bookingId?: string;
  customerId?: string;
  customerName: string;
  projectName?: string;
  unitNumber?: string;
  status: AgreementStatus;
  filledVariables: Record<string, string>;
  generatedPdfUrl?: string;
  signedPdfUrl?: string;
  signatureMethod?: SignatureMethod;
  signedAt?: string;
  sentAt?: string;
  sentTo?: string;         // email
  viewedAt?: string;
  expiresAt?: string;
  signerIpAddress?: string;
  createdAt: string;
  createdBy?: { name: string };
}

export interface DocumentVaultStats {
  totalDocuments: number;
  totalSize: number;          // bytes
  pendingApprovals: number;
  expiringThisMonth: number;
  kycPending: number;
  agreementsPending: number;
  uploadedToday: number;
  rejectedDocuments: number;
}

// ─── Config Maps ──────────────────────────────────────────────────────────────

export const DOC_CATEGORY_CFG: Record<DocumentCategory, {
  label: string; icon: string; color: string; bg: string; description: string;
}> = {
  KYC:       { label: 'KYC',        icon: '🪪',  color: '#6366f1', bg: '#eef2ff', description: 'Identity & address proofs' },
  LEGAL:     { label: 'Legal',      icon: '⚖️',  color: '#8b5cf6', bg: '#ede9fe', description: 'Legal documents & approvals' },
  FINANCE:   { label: 'Finance',    icon: '💰',  color: '#f59e0b', bg: '#fef3c7', description: 'Payment & financial records' },
  MARKETING: { label: 'Marketing',  icon: '📣',  color: '#0ea5e9', bg: '#e0f2fe', description: 'Brochures & presentations' },
  INTERNAL:  { label: 'Internal',   icon: '🔒',  color: '#64748b', bg: '#f1f5f9', description: 'Internal team documents' },
  AGREEMENT: { label: 'Agreement',  icon: '📝',  color: '#10b981', bg: '#d1fae5', description: 'Booking & sale agreements' },
};

export const DOC_STATUS_CFG: Record<DocumentStatus, {
  label: string; color: string; bg: string; icon: string;
}> = {
  UPLOADED:     { label: 'Uploaded',     color: '#6366f1', bg: '#eef2ff', icon: '📤' },
  UNDER_REVIEW: { label: 'Under Review', color: '#f59e0b', bg: '#fef3c7', icon: '🔍' },
  APPROVED:     { label: 'Approved',     color: '#10b981', bg: '#d1fae5', icon: '✅' },
  REJECTED:     { label: 'Rejected',     color: '#ef4444', bg: '#fee2e2', icon: '❌' },
};

export const KYC_STATUS_CFG: Record<KYCStatus, {
  label: string; color: string; bg: string; icon: string;
}> = {
  PENDING:  { label: 'Pending',  color: '#f59e0b', bg: '#fef3c7', icon: '⏳' },
  VERIFIED: { label: 'Verified', color: '#10b981', bg: '#d1fae5', icon: '✅' },
  REJECTED: { label: 'Rejected', color: '#ef4444', bg: '#fee2e2', icon: '❌' },
  EXPIRED:  { label: 'Expired',  color: '#9ca3af', bg: '#f3f4f6', icon: '⌛' },
};

export const AGREEMENT_STATUS_CFG: Record<AgreementStatus, {
  label: string; color: string; bg: string; icon: string;
}> = {
  DRAFT:    { label: 'Draft',    color: '#64748b', bg: '#f1f5f9', icon: '📄' },
  SENT:     { label: 'Sent',     color: '#0ea5e9', bg: '#e0f2fe', icon: '📧' },
  VIEWED:   { label: 'Viewed',   color: '#6366f1', bg: '#eef2ff', icon: '👁'  },
  SIGNED:   { label: 'Signed',   color: '#10b981', bg: '#d1fae5', icon: '✍️' },
  EXPIRED:  { label: 'Expired',  color: '#9ca3af', bg: '#f3f4f6', icon: '⌛'  },
  REJECTED: { label: 'Rejected', color: '#ef4444', bg: '#fee2e2', icon: '❌'  },
};

export const ENTITY_TYPE_CFG: Record<EntityType, { label: string; icon: string; color: string }> = {
  LEAD:      { label: 'Lead',            icon: '🎯', color: '#6366f1' },
  BOOKING:   { label: 'Booking',         icon: '📝', color: '#10b981' },
  CUSTOMER:  { label: 'Customer',        icon: '👤', color: '#0ea5e9' },
  PROJECT:   { label: 'Project',         icon: '🏗',  color: '#f59e0b' },
  UNIT:      { label: 'Unit',            icon: '🏠', color: '#8b5cf6' },
  PARTNER:   { label: 'Channel Partner', icon: '🤝', color: '#ec4899' },
  EMPLOYEE:  { label: 'Employee',        icon: '👔', color: '#64748b' },
  TENANT:    { label: 'Tenant/Company',  icon: '🏢', color: '#14b8a6' },
};

export const FILE_TYPE_CFG: Record<FileType, { icon: string; color: string; canPreview: boolean }> = {
  PDF:   { icon: '📑', color: '#ef4444', canPreview: true  },
  JPG:   { icon: '🖼',  color: '#0ea5e9', canPreview: true  },
  PNG:   { icon: '🖼',  color: '#0ea5e9', canPreview: true  },
  DOCX:  { icon: '📘', color: '#3b82f6', canPreview: false },
  XLSX:  { icon: '📗', color: '#10b981', canPreview: false },
  MP4:   { icon: '🎥', color: '#8b5cf6', canPreview: true  },
  OTHER: { icon: '📎', color: '#9ca3af', canPreview: false },
};

export const KYC_REQUIRED_DOCS = [
  { key: 'pan',          label: 'PAN Card',       icon: '🪪',  required: true  },
  { key: 'aadhar',       label: 'Aadhar Card',    icon: '📋', required: true  },
  { key: 'addressProof', label: 'Address Proof',  icon: '🏠', required: true  },
  { key: 'photo',        label: 'Photograph',     icon: '📸', required: false },
  { key: 'bankStatement',label: 'Bank Statement', icon: '🏦', required: false },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1048576)     return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824)  return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(2)} GB`;
};

export const getFileType = (fileName: string): FileType => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'pdf')  return 'PDF';
  if (ext === 'jpg' || ext === 'jpeg') return 'JPG';
  if (ext === 'png')  return 'PNG';
  if (ext === 'docx' || ext === 'doc') return 'DOCX';
  if (ext === 'xlsx' || ext === 'xls') return 'XLSX';
  if (ext === 'mp4')  return 'MP4';
  return 'OTHER';
};

export const daysUntilExpiry = (expiryDate: string): number => {
  const diff = new Date(expiryDate).setHours(0,0,0,0) - new Date().setHours(0,0,0,0);
  return Math.ceil(diff / 86400000);
};

export const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const timeAgo = (s: string) => {
  const d = Date.now() - new Date(s).getTime();
  const m = Math.floor(d / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export const AVATAR_COLORS = ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#8b5cf6'];
export const avatarColor = (s = '') => AVATAR_COLORS[s.charCodeAt(0) % AVATAR_COLORS.length];
export const initials    = (s = '?') => s.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);