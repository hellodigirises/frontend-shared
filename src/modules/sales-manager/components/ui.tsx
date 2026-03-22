// src/modules/sales-manager/components/ui.tsx
import React from 'react';
import {
  Box, Typography, Chip, Skeleton, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Avatar, CircularProgress,
} from '@mui/material';
import { S, STAGE_COLOR } from '../hooks';

export function StatCard({ label, value, sub, icon, accent, loading, trend }: {
  label:string; value:string|number; sub?:string; icon:React.ReactNode;
  accent:string; loading?:boolean; trend?: number;
}) {
  return (
    <Box sx={{
      bgcolor:S.surface, borderRadius:'14px', p:2.5, border:`1px solid ${S.border}`,
      position:'relative', overflow:'hidden',
      '&::before':{ content:'""', position:'absolute', top:0, left:0, right:0, height:3, background:accent, borderRadius:'14px 14px 0 0' },
    }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
        <Typography sx={{ color:S.textSub, fontSize:11, textTransform:'uppercase', letterSpacing:0.5, fontWeight:500 }}>{label}</Typography>
        <Box sx={{ width:32, height:32, borderRadius:'8px', bgcolor:`${accent}18`, color:accent, display:'flex', alignItems:'center', justifyContent:'center', '& svg':{fontSize:16} }}>{icon}</Box>
      </Box>
      {loading ? <Skeleton width={100} height={28} sx={{ bgcolor:'rgba(255,255,255,0.06)', borderRadius:1 }}/>
        : <Typography sx={{ color:S.text, fontSize:23, fontWeight:700, letterSpacing:-0.5, lineHeight:1 }}>{value}</Typography>}
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.75}>
        {sub && <Typography sx={{ color:S.textSub, fontSize:11 }}>{sub}</Typography>}
        {trend !== undefined && (
          <Typography sx={{ color:trend>=0?S.primary:S.coral, fontSize:11, fontWeight:600 }}>
            {trend>=0?'↑':'↓'} {Math.abs(trend)}%
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
        <Typography sx={{ color:S.text, fontSize:19, fontWeight:700, letterSpacing:-0.4 }}>{title}</Typography>
        {subtitle && <Typography sx={{ color:S.textSub, fontSize:12.5, mt:0.4 }}>{subtitle}</Typography>}
      </Box>
      {action && <Box flexShrink={0}>{action}</Box>}
    </Box>
  );
}

export function StageChip({ stage }: { stage:string }) {
  const color = STAGE_COLOR[stage] ?? S.textSub;
  const label = stage.replace(/_/g,' ');
  return <Chip label={label} size="small" sx={{ fontSize:10, height:20, bgcolor:`${color}18`, color, fontWeight:600, borderRadius:'6px' }}/>;
}

export function Card({ title, children, action }:{title?:string;children:React.ReactNode;action?:React.ReactNode}) {
  return (
    <Box sx={{ bgcolor:S.surface, borderRadius:'14px', border:`1px solid ${S.border}`, overflow:'hidden' }}>
      {title && (
        <Box sx={{ px:2.5, py:1.75, borderBottom:`1px solid ${S.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <Typography sx={{ color:S.text, fontWeight:600, fontSize:13.5 }}>{title}</Typography>
          {action}
        </Box>
      )}
      {children}
    </Box>
  );
}

export function AgentAvatar({ name, avatarUrl, size=30 }:{name:string;avatarUrl?:string;size?:number}) {
  const hue = (name?.charCodeAt(0)??0)*17%360;
  return avatarUrl
    ? <Avatar src={avatarUrl} sx={{ width:size, height:size }}/>
    : <Avatar sx={{ width:size, height:size, bgcolor:`hsl(${hue},55%,35%)`, fontSize:size*0.38, fontWeight:700 }}>{(name??'?').charAt(0).toUpperCase()}</Avatar>;
}

type Col<T> = { label:string; key?:keyof T; render?:(row:T)=>React.ReactNode; width?:string|number; };
export function DataTable<T extends {id:string}>({ columns, rows, loading, emptyMsg, onRowClick }:{
  columns:Col<T>[];rows:T[];loading?:boolean;emptyMsg?:string;onRowClick?:(r:T)=>void;
}) {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map(c=>(
              <TableCell key={c.label} width={c.width} sx={{ color:S.textSub, fontSize:10.5, fontWeight:600, textTransform:'uppercase', letterSpacing:0.5, py:1.5, borderBottom:`1px solid ${S.border}`, bgcolor:S.surface, whiteSpace:'nowrap' }}>{c.label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? Array.from({length:5}).map((_,i)=>(
            <TableRow key={i}>{columns.map(c=>(
              <TableCell key={c.label} sx={{ borderBottom:`1px solid ${S.border}`, py:1.25 }}>
                <Skeleton height={14} width="72%" sx={{ bgcolor:'rgba(255,255,255,0.05)' }}/>
              </TableCell>
            ))}</TableRow>
          )) : rows.length===0 ? (
            <TableRow><TableCell colSpan={columns.length} align="center" sx={{ py:5, borderBottom:'none', color:S.textSub, fontSize:13 }}>{emptyMsg??'No records'}</TableCell></TableRow>
          ) : rows.map(row=>(
            <TableRow key={row.id} hover onClick={()=>onRowClick?.(row)}
              sx={{ cursor:onRowClick?'pointer':'default', '&:hover td':{bgcolor:'rgba(16,185,129,0.03)'}, '& td':{borderBottom:`1px solid ${S.border}`} }}>
              {columns.map(c=>(
                <TableCell key={c.label} sx={{ color:S.textSub, fontSize:12.5, py:1.1 }}>
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
  return <Box display="flex" alignItems="center" justifyContent="center" minHeight={300}><CircularProgress size={26} sx={{ color:S.primary }}/></Box>;
}
