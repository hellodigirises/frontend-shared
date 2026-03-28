// src/modules/finance/components/ui.tsx
import React from 'react';
import {
  Box, Typography, Chip, Skeleton, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress,
} from '@mui/material';
import { F } from '../hooks';

export function StatCard({ label, value, sub, icon, accent, loading, trend }:{
  label:string; value:string|number; sub?:string; icon:React.ReactNode;
  accent:string; loading?:boolean; trend?:number;
}) {
  return (
    <Box sx={{
      bgcolor:F.surface, borderRadius:'14px', p:2.5, border:`1px solid ${F.border}`,
      position:'relative', overflow:'hidden',
      '&::before':{ content:'""', position:'absolute', top:0, left:0, right:0, height:3, background:accent },
    }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
        <Typography sx={{ color:F.textSub, fontSize:10.5, textTransform:'uppercase', letterSpacing:0.5, fontWeight:600 }}>{label}</Typography>
        <Box sx={{ width:32, height:32, borderRadius:'8px', bgcolor:`${accent}15`, color:accent, display:'flex', alignItems:'center', justifyContent:'center', '& svg':{fontSize:16} }}>{icon}</Box>
      </Box>
      {loading
        ? <Skeleton width={120} height={28} sx={{ bgcolor:'rgba(79,127,255,0.08)', borderRadius:1 }}/>
        : <Typography sx={{ color:F.text, fontSize:24, fontWeight:800, letterSpacing:-0.5, lineHeight:1 }}>{value}</Typography>
      }
      <Box display="flex" justifyContent="space-between" mt={0.75}>
        {sub && <Typography sx={{ color:F.textSub, fontSize:11 }}>{sub}</Typography>}
        {trend !== undefined && (
          <Typography sx={{ color:trend>=0?F.green:F.red, fontSize:11, fontWeight:600 }}>
            {trend>=0?'▲':'▼'} {Math.abs(trend)}%
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export function PageHeader({ title, subtitle, action }:{title:string;subtitle?:string;action?:React.ReactNode}) {
  return (
    <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={3}>
      <Box>
        <Typography sx={{ color:F.text, fontSize:19, fontWeight:700, letterSpacing:-0.4 }}>{title}</Typography>
        {subtitle && <Typography sx={{ color:F.textSub, fontSize:12.5, mt:0.4 }}>{subtitle}</Typography>}
      </Box>
      {action && <Box flexShrink={0}>{action}</Box>}
    </Box>
  );
}

export function Card({ title, children, action }:{title?:string;children:React.ReactNode;action?:React.ReactNode}) {
  return (
    <Box sx={{ bgcolor:F.surface, borderRadius:'14px', border:`1px solid ${F.border}`, overflow:'hidden' }}>
      {title && (
        <Box sx={{ px:2.5, py:1.75, borderBottom:`1px solid ${F.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <Typography sx={{ color:F.text, fontWeight:600, fontSize:13.5 }}>{title}</Typography>
          {action}
        </Box>
      )}
      {children}
    </Box>
  );
}

const STATUS_MAP: Record<string, { bg:string; color:string }> = {
  PENDING    : { bg:`rgba(245,158,11,0.12)`, color:'#F59E0B' },
  PAID       : { bg:`rgba(16,185,129,0.12)`, color:'#10B981' },
  OVERDUE    : { bg:`rgba(239,68,68,0.12)`,  color:'#EF4444' },
  PARTIAL    : { bg:`rgba(59,130,246,0.12)`, color:'#3B82F6' },
  APPROVED   : { bg:`rgba(16,185,129,0.12)`, color:'#10B981' },
  CANCELLED  : { bg:`rgba(255,255,255,0.06)`,color:'rgba(232,239,254,0.4)' },
  DRAFT      : { bg:`rgba(255,255,255,0.06)`,color:'rgba(232,239,254,0.4)' },
  ISSUED     : { bg:`rgba(59,130,246,0.12)`, color:'#3B82F6' },
  PROCESSING : { bg:`rgba(59,130,246,0.12)`, color:'#3B82F6' },
  MATCHED    : { bg:`rgba(16,185,129,0.12)`, color:'#10B981' },
  UNMATCHED  : { bg:`rgba(239,68,68,0.12)`,  color:'#EF4444' },
  CREDIT     : { bg:`rgba(16,185,129,0.12)`, color:'#10B981' },
  DEBIT      : { bg:`rgba(239,68,68,0.12)`,  color:'#EF4444' },
  WAIVED     : { bg:`rgba(139,92,246,0.12)`, color:'#8B5CF6' },
  ON_HOLD    : { bg:`rgba(245,158,11,0.12)`, color:'#F59E0B' },
  REJECTED   : { bg:`rgba(239,68,68,0.12)`,  color:'#EF4444' },
};

export function StatusBadge({ status }:{ status:string }) {
  const m = STATUS_MAP[status] ?? { bg:'rgba(255,255,255,0.06)', color:F.muted };
  return <Chip label={status.replace(/_/g,' ')} size="small"
    sx={{ fontSize:10.5, height:21, bgcolor:m.bg, color:m.color, fontWeight:600, borderRadius:'6px' }}/>;
}

type Col<T> = { label:string; key?:keyof T; render?:(row:T)=>React.ReactNode; width?:string|number; align?:'left'|'right'|'center'; };
export function DataTable<T extends {id:string}>({ columns, rows, loading, emptyMsg, onRowClick, compact }:{
  columns:Col<T>[]; rows:T[]; loading?:boolean; emptyMsg?:string; onRowClick?:(r:T)=>void; compact?:boolean;
}) {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map(c=>(
              <TableCell key={c.label} width={c.width} align={c.align}
                sx={{ color:F.textSub, fontSize:10.5, fontWeight:700, textTransform:'uppercase', letterSpacing:0.5,
                  py:compact?1:1.5, borderBottom:`1px solid ${F.border}`, bgcolor:F.surface, whiteSpace:'nowrap' }}>
                {c.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? Array.from({length:5}).map((_,i)=>(
            <TableRow key={i}>{columns.map(c=>(
              <TableCell key={c.label} sx={{ borderBottom:`1px solid ${F.border}`, py:compact?0.9:1.1 }}>
                <Skeleton height={13} width="68%" sx={{ bgcolor:'rgba(79,127,255,0.06)' }}/>
              </TableCell>
            ))}</TableRow>
          )) : rows.length===0 ? (
            <TableRow><TableCell colSpan={columns.length} align="center"
              sx={{ py:5, borderBottom:'none', color:F.textSub, fontSize:13 }}>{emptyMsg??'No records'}</TableCell></TableRow>
          ) : rows.map(row=>(
            <TableRow key={row.id} hover onClick={()=>onRowClick?.(row)}
              sx={{ cursor:onRowClick?'pointer':'default',
                '&:hover td':{bgcolor:'rgba(79,127,255,0.03)'},
                '& td':{borderBottom:`1px solid ${F.border}`} }}>
              {columns.map(c=>(
                <TableCell key={c.label} align={c.align}
                  sx={{ color:F.textSub, fontSize:compact?12:12.5, py:compact?0.9:1.1 }}>
                  {c.render?c.render(row):c.key?String((row as any)[c.key]??'—'):'—'}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function Loader() {
  return <Box display="flex" alignItems="center" justifyContent="center" minHeight={260}>
    <CircularProgress size={26} sx={{ color:F.primary }}/>
  </Box>;
}

export function AmountCell({ value, color }:{ value:number; color?:string }) {
  return <Typography sx={{ color:color??F.text, fontSize:13, fontWeight:600, fontVariantNumeric:'tabular-nums' }}>
    {new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(value)}
  </Typography>;
}

export function KVRow({ label, value, bold }: { label: string; value: React.ReactNode; bold?: boolean }) {
  return (
    <Box display="flex" justifyContent="space-between" mb={1.5}>
      <Typography sx={{ color: F.textSub, fontSize: 13, fontWeight: 500 }}>{label}</Typography>
      <Typography sx={{ color: F.text, fontSize: 13, fontWeight: bold ? 700 : 500, textAlign: 'right' }}>
        {value || '—'}
      </Typography>
    </Box>
  );
}
