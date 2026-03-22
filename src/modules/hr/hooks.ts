// src/modules/hr/hooks.ts
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../redux/store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// ── Design system ─────────────────────────────────────────────────────────────
// Warm slate + amber/teal accent — professional HR feel
export const H = {
  bg          : '#0F1117',
  surface     : '#161B27',
  surfaceHigh : '#1E2436',
  border      : 'rgba(255,255,255,0.08)',
  primary     : '#3B82F6',  // blue
  amber       : '#F59E0B',  // attendance / warnings
  teal        : '#14B8A6',  // success / present
  coral       : '#F87171',  // danger / absent
  purple      : '#8B5CF6',  // payroll
  indigo      : '#6366F1',  // performance
  text        : '#E2E8F0',
  textSub     : 'rgba(226,232,240,0.5)',
  muted       : 'rgba(226,232,240,0.3)',
} as const;

export const STATUS_MAP: Record<string, { bg: string; color: string; label: string }> = {
  ACTIVE    : { bg: 'rgba(20,184,166,0.12)',  color: '#14B8A6', label: 'Active'     },
  INACTIVE  : { bg: 'rgba(255,255,255,0.06)', color: 'rgba(226,232,240,0.4)', label: 'Inactive' },
  TERMINATED: { bg: 'rgba(248,113,113,0.12)', color: '#F87171', label: 'Terminated' },
  RESIGNED  : { bg: 'rgba(245,158,11,0.12)',  color: '#F59E0B', label: 'Resigned'   },
  ON_LEAVE  : { bg: 'rgba(99,102,241,0.12)',  color: '#6366F1', label: 'On Leave'   },
  PRESENT   : { bg: 'rgba(20,184,166,0.12)',  color: '#14B8A6', label: 'Present'    },
  ABSENT    : { bg: 'rgba(248,113,113,0.12)', color: '#F87171', label: 'Absent'     },
  HALF_DAY  : { bg: 'rgba(245,158,11,0.12)',  color: '#F59E0B', label: 'Half Day'   },
  PENDING   : { bg: 'rgba(245,158,11,0.12)',  color: '#F59E0B', label: 'Pending'    },
  APPROVED  : { bg: 'rgba(20,184,166,0.12)',  color: '#14B8A6', label: 'Approved'   },
  REJECTED  : { bg: 'rgba(248,113,113,0.12)', color: '#F87171', label: 'Rejected'   },
  PAID      : { bg: 'rgba(20,184,166,0.12)',  color: '#14B8A6', label: 'Paid'       },
  COMPLETED : { bg: 'rgba(20,184,166,0.12)',  color: '#14B8A6', label: 'Completed'  },
  ENROLLED  : { bg: 'rgba(59,130,246,0.12)',  color: '#3B82F6', label: 'Enrolled'   },
};

export const DEPT_COLOR: Record<string, string> = {
  Sales       : '#3B82F6',
  HR          : '#8B5CF6',
  Finance     : '#14B8A6',
  Operations  : '#F59E0B',
  Marketing   : '#EC4899',
  IT          : '#6366F1',
  Construction: '#F87171',
  Management  : '#10B981',
};

// ── Formatters ─────────────────────────────────────────────────────────────────
export const INR = (n: number | string) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(+n);

export const DATE = (d?: string | Date | null) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const TIME = (d?: string | Date | null) =>
  d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—';

// ── Shared MUI sx helpers ──────────────────────────────────────────────────────
export const fieldSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: '#1E2436', color: '#E2E8F0', fontSize: 13, borderRadius: '8px',
    '& fieldset'              : { borderColor: 'rgba(255,255,255,0.08)' },
    '&:hover fieldset'        : { borderColor: '#3B82F6' },
    '&.Mui-focused fieldset'  : { borderColor: '#3B82F6' },
  },
};
export const labelSx = { color: 'rgba(226,232,240,0.5)', fontSize: 13 };
export const selectFieldSx = {
  bgcolor: '#1E2436', color: '#E2E8F0', fontSize: 13, borderRadius: '8px',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.08)' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#3B82F6' },
};
