// src/modules/agent/components/ui.tsx
import React from 'react';
import {
  Box, Typography, Chip, Skeleton, Avatar,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, Grid, Button
} from '@mui/material';
import { A, LEAD_STATUS_COLOR, TASK_PRIORITY_COLOR } from '../hooks';

export function StatCard({ label, value, sub, icon, accent, loading, compact }:{
  label:string; value:string|number; sub?:string; icon:React.ReactNode;
  accent:string; loading?:boolean; compact?:boolean;
}) {
  return (
    <Box sx={{
      bgcolor:A.surface, borderRadius:'14px',
      p:compact?1.75:2.5, border:`1px solid ${A.border}`,
      position:'relative', overflow:'hidden',
      '&::before':{ content:'""', position:'absolute', bottom:0, right:0, width:60, height:60,
        borderRadius:'50%', bgcolor:`${accent}06`, transform:'translate(20px,20px)' },
    }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={compact?1:1.5}>
        <Typography sx={{ color:A.textSub, fontSize:compact?10.5:11, textTransform:'uppercase', letterSpacing:0.5, fontWeight:500 }}>{label}</Typography>
        <Box sx={{ width:compact?28:32, height:compact?28:32, borderRadius:'8px', bgcolor:`${accent}18`, color:accent, display:'flex', alignItems:'center', justifyContent:'center', '& svg':{fontSize:compact?15:17} }}>{icon}</Box>
      </Box>
      {loading
        ? <Skeleton width={80} height={compact?22:26} sx={{ bgcolor:'rgba(255,245,236,0.06)', borderRadius:1 }}/>
        : <Typography sx={{ color:A.text, fontSize:compact?20:23, fontWeight:700, letterSpacing:-0.5, lineHeight:1 }}>{value}</Typography>
      }
      {sub && <Typography sx={{ color:A.textSub, fontSize:10.5, mt:0.5 }}>{sub}</Typography>}
    </Box>
  );
}

export function PageHeader({ title, subtitle, action }:{title:string;subtitle?:string;action?:React.ReactNode}) {
  return (
    <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2.5}>
      <Box>
        <Typography sx={{ color:A.text, fontSize:18, fontWeight:700, letterSpacing:-0.3 }}>{title}</Typography>
        {subtitle && <Typography sx={{ color:A.textSub, fontSize:12, mt:0.3 }}>{subtitle}</Typography>}
      </Box>
      {action && <Box flexShrink={0}>{action}</Box>}
    </Box>
  );
}

export function LeadStatusChip({ status }:{ status:string }) {
  const c = LEAD_STATUS_COLOR[status] ?? A.textSub;
  return <Chip label={status.replace(/_/g,' ')} size="small" sx={{ fontSize:10, height:20, bgcolor:`${c}18`, color:c, fontWeight:600, borderRadius:'6px' }}/>;
}

export function TaskPriorityBadge({ priority }:{ priority:string }) {
  const c = TASK_PRIORITY_COLOR[priority] ?? A.textSub;
  return (
    <Box sx={{ display:'inline-flex', alignItems:'center', gap:0.5 }}>
      <Box sx={{ width:6, height:6, borderRadius:'50%', bgcolor:c, flexShrink:0 }}/>
      <Typography sx={{ color:c, fontSize:10.5, fontWeight:600 }}>{priority}</Typography>
    </Box>
  );
}

export function Card({ title, children, action, pad }:{title?:string;children:React.ReactNode;action?:React.ReactNode;pad?:boolean}) {
  return (
    <Box sx={{ bgcolor:A.surface, borderRadius:'14px', border:`1px solid ${A.border}`, overflow:'hidden' }}>
      {title && (
        <Box sx={{ px:2.5, py:1.75, borderBottom:`1px solid ${A.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <Typography sx={{ color:A.text, fontWeight:600, fontSize:13.5 }}>{title}</Typography>
          {action}
        </Box>
      )}
      <Box sx={pad?{p:2}:{}}>{children}</Box>
    </Box>
  );
}

export function Loader() {
  return <Box display="flex" alignItems="center" justifyContent="center" minHeight={200}>
    <CircularProgress size={26} sx={{ color:A.primary }}/>
  </Box>;
}

// LeadCard — mobile-friendly card design
export function LeadCard({ lead, onClick }:{ lead:any; onClick?:()=>void }) {
  const color = LEAD_STATUS_COLOR[lead.status] ?? A.textSub;
  return (
    <Box onClick={onClick} sx={{
      bgcolor:A.surfaceHigh, borderRadius:'12px', p:2,
      border:`1px solid ${A.border}`, mb:1.25, cursor:onClick?'pointer':'default',
      borderLeft:`3px solid ${color}`,
      '&:hover':{ bgcolor:`${A.primary}06` },
    }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box flex={1}>
          <Typography sx={{ color:A.text, fontWeight:600, fontSize:14, lineHeight:1.2 }}>{lead.customerName}</Typography>
          <Typography sx={{ color:A.textSub, fontSize:12, mt:0.25 }}>{lead.customerPhone}</Typography>
        </Box>
        <LeadStatusChip status={lead.status}/>
      </Box>
      {lead.project && (
        <Typography sx={{ color:A.textSub, fontSize:11.5, mt:0.75 }}>
          📍 {lead.project.name} {lead.project.city && `· ${lead.project.city}`}
        </Typography>
      )}
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.75}>
        <Typography sx={{ color:A.textSub, fontSize:11 }}>
          {lead.sourceChannel?.replace(/_/g,' ')}
        </Typography>
        {lead._count?.followUps > 0 && (
          <Typography sx={{ color:A.amber, fontSize:11 }}>
            {lead._count.followUps} follow-up{lead._count.followUps>1?'s':''}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export function KVRow({ label, value, bold }: { label: string; value: React.ReactNode; bold?: boolean }) {
  return (
    <Box display="flex" justifyContent="space-between" mb={1.5}>
      <Typography sx={{ color: A.textSub, fontSize: 13, fontWeight: 500 }}>{label}</Typography>
      <Typography sx={{ color: A.text, fontSize: 13, fontWeight: bold ? 700 : 500, textAlign: 'right' }}>
        {value || '—'}
      </Typography>
    </Box>
  );
}

// Visit card
export function VisitCard({ visit, onUpdate }:{ visit:any; onUpdate?:(id:string,status:string,outcome?:string)=>void }) {
  const [showOutcomes, setShowOutcomes] = React.useState(false);

  const STATUS_MAP: Record<string, { label:string; color:string; icon:string }> = {
    REQUESTED:             { label:'Requested',   color:A.primary, icon:'📨' },
    PENDING_CONFIRMATION:  { label:'Pending',     color:A.amber,   icon:'⏳' },
    CONFIRMED:             { label:'Confirmed',   color:A.green,   icon:'✅' },
    IN_PROGRESS:           { label:'In Progress', color:A.blue,    icon:'🏃' },
    COMPLETED:             { label:'Completed',   color:A.green,   icon:'🏆' },
    CANCELLED:             { label:'Cancelled',   color:A.red,     icon:'❌' },
    NO_SHOW:               { label:'No Show',     color:A.red,     icon:'👻' },
    RESCHEDULED:           { label:'Rescheduled', color:A.amber,   icon:'🔄' },
  };

  const OUTCOMES = [
    { id: 'BOOKING_INITIATED', label: 'Booking Initiated', icon: '💰' },
    { id: 'INTERESTED',        label: 'Interested',        icon: '👍' },
    { id: 'NOT_INTERESTED',    label: 'Not Interested',    icon: '👎' },
    { id: 'FOLLOW_UP_NEEDED',  label: 'Needs Follow-up',   icon: '📞' },
  ];

  const status = visit.status || 'PENDING_CONFIRMATION';
  const cfg = STATUS_MAP[status] || { label:status, color:A.textSub, icon:'📍' };

  return (
    <Box sx={{ 
      bgcolor:A.surface, borderRadius:'16px', p:2.25, mb:1.25, 
      border:`1px solid ${A.border}`, position:'relative',
      '&:hover': { borderColor: `${cfg.color}40`, bgcolor: 'rgba(255,255,255,0.02)' }
    }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
        <Box flex={1}>
          <Typography sx={{ color:A.text, fontWeight:700, fontSize:15, letterSpacing:-0.3 }}>
            {visit.lead?.customerName ?? 'Unknown Lead'}
          </Typography>
          <Typography sx={{ color:A.textSub, fontSize:12, mt:0.25 }}>
            {visit.project?.name ?? 'No Project'} {visit.unit?.unitNumber && `· Unit ${visit.unit.unitNumber}`}
          </Typography>
        </Box>
        <Box sx={{ 
          px:1.25, py:0.4, borderRadius:'20px', bgcolor:`${cfg.color}15`, 
          display:'flex', alignItems:'center', gap:0.5, border:`1px solid ${cfg.color}25` 
        }}>
          <Typography sx={{ fontSize:10 }}>{cfg.icon}</Typography>
          <Typography sx={{ fontSize:10, fontWeight:800, color:cfg.color, textTransform:'uppercase' }}>
            {cfg.label}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ bgcolor:'rgba(255,255,255,0.03)', p:1.25, borderRadius:'12px', mb:1.5 }}>
        <Typography sx={{ color:A.primary, fontSize:13, fontWeight:700, display:'flex', alignItems:'center', gap:0.75 }}>
          📅 {new Date(visit.visitDate).toLocaleString('en-IN',{ weekday:'short', day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
        </Typography>
        <Typography sx={{ color:A.textSub, fontSize:11.5, mt:0.5 }}>
          Time: <span style={{ color:A.text }}>{visit.visitTime}</span> · Type: <span style={{ color:A.text }}>{visit.visitType}</span>
        </Typography>
      </Box>

      {['CONFIRMED', 'REQUESTED', 'PENDING_CONFIRMATION', 'IN_PROGRESS'].includes(status) && onUpdate && !showOutcomes && (
        <Box display="flex" gap={1}>
          <Box component="button" onClick={()=>setShowOutcomes(true)}
            sx={{ 
              flex:1.5, bgcolor:`${A.green}18`, border:`1px solid ${A.green}40`, 
              borderRadius:'10px', color:A.green, fontSize:12.5, fontWeight:700, py:0.8, 
              cursor:'pointer', transition:'all .2s', '&:hover':{ bgcolor:`${A.green}25` } 
            }}>
            ✓ Mark Complete
          </Box>
          <Box component="button" onClick={()=>onUpdate(visit.id,'CANCELLED')}
            sx={{ 
              flex:1, bgcolor:'transparent', border:`1px solid ${A.border}`, 
              borderRadius:'10px', color:A.textSub, fontSize:12.5, fontWeight:600, py:0.8, 
              cursor:'pointer', transition:'all .2s', '&:hover':{ borderColor:A.red, color:A.red } 
            }}>
            ✕ Cancel
          </Box>
        </Box>
      )}

      {showOutcomes && (
        <Box>
          <Typography sx={{ color:A.textSub, fontSize:11, mb:1, fontWeight:600, textTransform:'uppercase' }}>Select Visit Outcome</Typography>
          <Grid container spacing={1}>
            {OUTCOMES.map(o => (
              <Grid item xs={6} key={o.id}>
                <Box component="button" onClick={()=>onUpdate && onUpdate(visit.id,'COMPLETED',o.id)}
                  sx={{ 
                    width:'100%', bgcolor:'rgba(255,255,255,0.05)', border:`1px solid ${A.border}`, 
                    borderRadius:'8px', color:A.text, fontSize:11, fontWeight:600, py:1, px:1,
                    textAlign:'left', cursor:'pointer', display:'flex', alignItems:'center', gap:1,
                    '&:hover':{ bgcolor:`${A.primary}15`, borderColor:A.primary }
                  }}>
                  <span>{o.icon}</span> {o.label}
                </Box>
              </Grid>
            ))}
          </Grid>
          <Button size="small" sx={{ mt:1, fontSize:10, color:A.textSub }} onClick={()=>setShowOutcomes(false)}>Cancel</Button>
        </Box>
      )}

      {status === 'COMPLETED' && (
        <Box sx={{ textAlign:'center' }}>
          <Typography sx={{ color:A.green, fontSize:12, fontWeight:700 }}>
            ✨ Visit Successfully Completed
          </Typography>
          {visit.outcome && (
            <Typography sx={{ color:A.textSub, fontSize:11, mt:0.5 }}>
              Outcome: <span style={{ color:A.primary, fontWeight:600 }}>{visit.outcome.replace(/_/g,' ')}</span>
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
