// src/modules/superadmin/hooks.ts
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../redux/store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// ── Design tokens ─────────────────────────────────────────────────────────────
export const C = {
  bg          : '#0B0D1A',
  surface     : '#13162B',
  surfaceHigh : '#1B1F38',
  border      : 'rgba(255,255,255,0.07)',
  primary     : '#4F7FFF',
  success     : '#22c55e',
  warning     : '#f59e0b',
  danger      : '#ef4444',
  purple      : '#a855f7',
  cyan        : '#06b6d4',
  orange      : '#f97316',
  pink        : '#ec4899',
  muted       : 'rgba(255,255,255,0.4)',
  text        : '#E8EAF6',
  textSub     : 'rgba(255,255,255,0.5)',
} as const;

export const STATUS_META: Record<string, { bg: string; color: string; label: string }> = {
  ACTIVE      : { bg: 'rgba(34,197,94,0.12)',  color: '#22c55e', label: 'Active'      },
  SUSPENDED   : { bg: 'rgba(239,68,68,0.12)',  color: '#ef4444', label: 'Suspended'   },
  TRIAL       : { bg: 'rgba(79,127,255,0.12)', color: '#4F7FFF', label: 'Trial'       },
  TRIALING    : { bg: 'rgba(79,127,255,0.12)', color: '#4F7FFF', label: 'Trialing'    },
  CANCELLED   : { bg: 'rgba(255,255,255,0.06)',color: 'rgba(255,255,255,0.35)', label: 'Cancelled'  },
  PENDING     : { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', label: 'Pending'     },
  PAID        : { bg: 'rgba(34,197,94,0.12)',  color: '#22c55e', label: 'Paid'        },
  OVERDUE     : { bg: 'rgba(239,68,68,0.12)',  color: '#ef4444', label: 'Overdue'     },
  REFUNDED    : { bg: 'rgba(168,85,247,0.12)', color: '#a855f7', label: 'Refunded'    },
  COMPLETED   : { bg: 'rgba(34,197,94,0.12)',  color: '#22c55e', label: 'Completed'   },
  FAILED      : { bg: 'rgba(239,68,68,0.12)',  color: '#ef4444', label: 'Failed'      },
};

// ── Formatters ─────────────────────────────────────────────────────────────────
export const INR = (n: number | string) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(+n);

export const DATE = (d?: string | Date | null) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const NUM = (n?: number | string | null) =>
  n != null ? Number(n).toLocaleString('en-IN') : '0';

// ── Shared input/select MUI sx ─────────────────────────────────────────────────
export const inputSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor : '#1B1F38',
    color   : '#E8EAF6',
    fontSize: 13,
    borderRadius: '8px',
    '& fieldset'       : { borderColor: 'rgba(255,255,255,0.07)' },
    '&:hover fieldset' : { borderColor: '#4F7FFF' },
    '&.Mui-focused fieldset': { borderColor: '#4F7FFF' },
  },
};

export const labelSx = { color: 'rgba(255,255,255,0.5)', fontSize: 13 };

export const selectSx = {
  bgcolor: '#1B1F38', color: '#E8EAF6', fontSize: 13, borderRadius: '8px',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.07)' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4F7FFF' },
};