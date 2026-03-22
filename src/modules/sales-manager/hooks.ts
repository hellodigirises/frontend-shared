// src/modules/sales-manager/hooks.ts
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../redux/store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// ── Design tokens — Deep jade + gold accent, editorial density ────────────────
export const S = {
  bg         : '#09100F',
  surface    : '#111A18',
  surfaceHigh: '#182520',
  border     : 'rgba(255,255,255,0.08)',
  primary    : '#10B981',   // emerald
  gold       : '#F59E0B',   // deals / revenue
  blue       : '#3B82F6',   // leads / pipeline
  coral      : '#F87171',   // warnings / lost
  purple     : '#8B5CF6',   // forecast
  cyan       : '#06B6D4',   // visits
  text       : '#E2E8F0',
  textSub    : 'rgba(226,232,240,0.5)',
  muted      : 'rgba(226,232,240,0.28)',
} as const;

export const STAGE_COLOR: Record<string, string> = {
  NEW_LEAD    : '#64748B',
  CONTACTED   : S.blue,
  QUALIFIED   : S.cyan,
  SITE_VISIT  : S.gold,
  NEGOTIATION : S.purple,
  CLOSED_WON  : S.primary,
  CLOSED_LOST : S.coral,
  PROPOSAL    : S.blue,
  FINALIZATION: S.gold,
};

export const STAGE_ORDER = ['NEW_LEAD','CONTACTED','QUALIFIED','SITE_VISIT','NEGOTIATION','CLOSED_WON','CLOSED_LOST'];

// ── Formatters ─────────────────────────────────────────────────────────────────
export const INR  = (n: number | string) =>
  new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(+n);
export const DATE = (d?: string|Date|null) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';
export const PCT  = (n: number) => `${Number(n).toFixed(1)}%`;

// ── Shared MUI sx ──────────────────────────────────────────────────────────────
export const fieldSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor:'#182520', color:'#E2E8F0', fontSize:13, borderRadius:'8px',
    '& fieldset':{ borderColor:'rgba(255,255,255,0.08)' },
    '&:hover fieldset':{ borderColor:'#10B981' },
    '&.Mui-focused fieldset':{ borderColor:'#10B981' },
  },
};
export const labelSx = { color:'rgba(226,232,240,0.5)', fontSize:13 };
export const selSx = {
  bgcolor:'#182520', color:'#E2E8F0', fontSize:13, borderRadius:'8px',
  '& .MuiOutlinedInput-notchedOutline':{ borderColor:'rgba(255,255,255,0.08)' },
  '&:hover .MuiOutlinedInput-notchedOutline':{ borderColor:'#10B981' },
};
