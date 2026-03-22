// src/modules/agent/hooks.ts
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../redux/store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// ── Design tokens — warm terracotta + indigo, mobile-optimised ────────────────
// Distinct from SuperAdmin (dark blue), HR (slate), Sales (jade)
export const A = {
  bg          : '#1A0F0A',   // very dark warm brown
  surface     : '#241510',
  surfaceHigh : '#2E1C15',
  border      : 'rgba(255,220,180,0.1)',
  primary     : '#F97316',   // orange — energy, field work
  indigo      : '#6366F1',   // tasks / performance
  green       : '#22C55E',   // present / completed
  red         : '#EF4444',   // absent / missed
  amber       : '#F59E0B',   // pending / follow-ups
  blue        : '#3B82F6',   // bookings / leads
  text        : '#FFF5EC',
  textSub     : 'rgba(255,245,236,0.55)',
  muted       : 'rgba(255,245,236,0.3)',
} as const;

export const LEAD_STATUS_COLOR: Record<string,string> = {
  NEW        : A.blue,
  CONTACTED  : A.amber,
  QUALIFIED  : A.indigo,
  NEGOTIATION: A.primary,
  WON        : A.green,
  LOST       : A.red,
};

export const TASK_PRIORITY_COLOR: Record<string,string> = {
  LOW: A.textSub, MEDIUM: A.blue, HIGH: A.amber, URGENT: A.red,
};

// ── Formatters ─────────────────────────────────────────────────────────────────
export const INR  = (n: number|string) =>
  new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(+n);
export const DATE = (d?: string|Date|null) =>
  d ? new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—';
export const TIME = (d?: string|Date|null) =>
  d ? new Date(d).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}) : '—';
export const RELATIVE = (d?: string|Date|null) => {
  if (!d) return '—';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff/60_000);
  if (mins < 60)  return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins/60)}h ago`;
  return DATE(d);
};

// ── Shared MUI sx ──────────────────────────────────────────────────────────────
export const fieldSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor:'#2E1C15', color:A.text, fontSize:14, borderRadius:'10px',
    '& fieldset':{borderColor:'rgba(255,220,180,0.1)'},
    '&:hover fieldset':{borderColor:A.primary},
    '&.Mui-focused fieldset':{borderColor:A.primary},
  },
};
export const labelSx = { color:A.textSub, fontSize:13 };
export const selSx = {
  bgcolor:'#2E1C15', color:A.text, fontSize:14, borderRadius:'10px',
  '& .MuiOutlinedInput-notchedOutline':{borderColor:'rgba(255,220,180,0.1)'},
  '&:hover .MuiOutlinedInput-notchedOutline':{borderColor:A.primary},
};
