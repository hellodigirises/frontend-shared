// ─────────────────────────────────────────────────────────────────────────────
// ticketTypes.ts  —  shared types for the ticketing system
// ─────────────────────────────────────────────────────────────────────────────

export type TicketStatus   = 'OPEN' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TicketCategory =
  | 'LEAD_ISSUE'        // Agent → Sales Manager
  | 'PAYMENT_DISPUTE'   // Agent/Sales → Finance
  | 'BOOKING_ISSUE'     // Agent → Admin/Sales Manager
  | 'COMMISSION_QUERY'  // Agent/Sales → Finance
  | 'HR_REQUEST'        // Any → HR (leave, payroll, docs)
  | 'TECHNICAL'         // Any → Admin
  | 'INVENTORY_QUERY'   // Agent → Admin/Sales Manager
  | 'COMPLIANCE'        // Any → Admin
  | 'CUSTOMER_COMPLAINT'// Agent → Sales Manager/Admin
  | 'FEATURE_REQUEST'   // Any → Admin
  | 'GENERAL';

// Who can resolve based on category
export const CATEGORY_RESOLVER: Record<TicketCategory, string[]> = {
  LEAD_ISSUE        : ['SALES_MANAGER','TENANT_ADMIN'],
  PAYMENT_DISPUTE   : ['FINANCE','TENANT_ADMIN'],
  BOOKING_ISSUE     : ['SALES_MANAGER','TENANT_ADMIN'],
  COMMISSION_QUERY  : ['FINANCE','TENANT_ADMIN'],
  HR_REQUEST        : ['HR','TENANT_ADMIN'],
  TECHNICAL         : ['TENANT_ADMIN'],
  INVENTORY_QUERY   : ['SALES_MANAGER','TENANT_ADMIN'],
  COMPLIANCE        : ['TENANT_ADMIN'],
  CUSTOMER_COMPLAINT: ['SALES_MANAGER','TENANT_ADMIN'],
  FEATURE_REQUEST   : ['TENANT_ADMIN'],
  GENERAL           : ['SALES_MANAGER','HR','FINANCE','TENANT_ADMIN'],
};

export const CATEGORY_META: Record<TicketCategory, { label: string; icon: string; dept: string }> = {
  LEAD_ISSUE        : { label:'Lead Issue',          icon:'🎯', dept:'Sales'    },
  PAYMENT_DISPUTE   : { label:'Payment Dispute',     icon:'💰', dept:'Finance'  },
  BOOKING_ISSUE     : { label:'Booking Issue',       icon:'📝', dept:'Sales'    },
  COMMISSION_QUERY  : { label:'Commission Query',    icon:'🤝', dept:'Finance'  },
  HR_REQUEST        : { label:'HR Request',          icon:'👔', dept:'HR'       },
  TECHNICAL         : { label:'Technical',           icon:'⚙️', dept:'Admin'   },
  INVENTORY_QUERY   : { label:'Inventory Query',     icon:'🏠', dept:'Sales'    },
  COMPLIANCE        : { label:'Compliance',          icon:'⚖️', dept:'Admin'   },
  CUSTOMER_COMPLAINT: { label:'Customer Complaint',  icon:'😤', dept:'Sales'    },
  FEATURE_REQUEST   : { label:'Feature Request',     icon:'✨', dept:'Admin'    },
  GENERAL           : { label:'General',             icon:'📋', dept:'General'  },
};

export interface TicketComment {
  id         : string;
  ticketId   : string;
  authorId   : string;
  authorName : string;
  authorRole : string;
  content    : string;
  isInternal : boolean;  // internal note vs public reply
  createdAt  : string;
}

export interface TicketActivity {
  id        : string;
  ticketId  : string;
  actorName : string;
  action    : string;   // 'STATUS_CHANGED' | 'ASSIGNED' | 'PRIORITY_CHANGED' | 'COMMENT_ADDED'
  fromValue?: string;
  toValue?  : string;
  createdAt : string;
}

export interface Ticket {
  id            : string;
  tenantId      : string;
  ticketNumber  : string;   // TKT-2024-00001
  subject       : string;
  description   : string;
  category      : TicketCategory;
  priority      : TicketPriority;
  status        : TicketStatus;
  raisedById    : string;
  raisedByName  : string;
  raisedByRole  : string;
  assignedToId? : string;
  assignedToName?:string;
  assignedToRole?:string;
  targetDept    : string;   // 'Finance' | 'HR' | 'Sales' | 'Admin'
  relatedLeadId?: string;
  relatedBookingId?:string;
  dueDate?      : string;
  resolvedAt?   : string;
  closedAt?     : string;
  slaBreached   : boolean;
  comments      : TicketComment[];
  activity      : TicketActivity[];
  attachments   : string[];
  createdAt     : string;
  updatedAt     : string;
}