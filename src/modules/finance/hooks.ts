// src/modules/finance/hooks.ts
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../redux/store';
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// ── Design tokens — deep sapphire + gold, ERP-grade density ──────────────────
export const F = {
  bg         : '#080E1A',
  surface    : '#0D1629',
  surfaceHigh: '#132039',
  border     : 'rgba(100,149,237,0.12)',
  primary    : '#4F7FFF',   // blue
  gold       : '#F59E0B',   // income / collections
  green      : '#10B981',   // paid / profit
  red        : '#EF4444',   // overdue / loss
  amber      : '#F59E0B',   // pending
  purple     : '#8B5CF6',   // commissions
  cyan       : '#06B6D4',   // receipts
  text       : '#E8EFFE',
  textSub    : 'rgba(232,239,254,0.55)',
  muted      : 'rgba(232,239,254,0.3)',
} as const;

export const INR  = (n: number|string) => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(+n);
export const INR2 = (n: number|string) => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',minimumFractionDigits:2}).format(+n);
export const DATE = (d?: string|Date|null) => d ? new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—';
export const PCT  = (n: number) => `${Number(n).toFixed(1)}%`;

export const fieldSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor:'#132039', color:F.text, fontSize:13, borderRadius:'8px',
    '& fieldset':{borderColor:'rgba(100,149,237,0.12)'},
    '&:hover fieldset':{borderColor:F.primary},
    '&.Mui-focused fieldset':{borderColor:F.primary},
  },
};
export const labelSx = { color:F.textSub, fontSize:13 };
export const selSx = {
  bgcolor:'#132039', color:F.text, fontSize:13, borderRadius:'8px',
  '& .MuiOutlinedInput-notchedOutline':{borderColor:'rgba(100,149,237,0.12)'},
  '&:hover .MuiOutlinedInput-notchedOutline':{borderColor:F.primary},
};
