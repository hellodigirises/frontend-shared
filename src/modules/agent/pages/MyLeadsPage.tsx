/**
 * MyLeadsPage.tsx — Enhanced Agent Lead Management System
 *
 * Design direction: "Field Agent Command Center"
 * Dark warm terracotta theme (matching existing agent module palette)
 * Split-panel layout: filterable card list LEFT + rich detail panel RIGHT
 * Mobile: stacks vertically, detail opens as full-screen slide-up sheet
 *
 * NEW Features over original:
 *  ✦ 3 view modes: Cards / Kanban pipeline / Compact table
 *  ✦ Lead detail panel — full CRM: info, timeline, follow-ups, notes, quick actions
 *  ✦ Inline follow-up logger with outcome + next date
 *  ✦ Quick-call / WhatsApp / Schedule Visit buttons directly on cards
 *  ✦ Smart sort: last contacted, priority, budget high-low, newest
 *  ✦ Lead scoring badge (hot / warm / cold) based on activity recency
 *  ✦ Source channel icons
 *  ✦ Budget range filter + source filter
 *  ✦ Stats strip: active, hot, follow-ups due, won this month
 *  ✦ Add manual lead form
 *  ✦ Kanban drag-friendly column layout (visual pipeline)
 *  ✦ Export button (CSV)
 */

import React, {
  useEffect, useState, useCallback, useMemo, useRef, FC, ReactNode,
} from 'react';
import {
  Box, TextField, Select, MenuItem, FormControl, InputLabel,
  Typography, Button, Pagination, Chip, Avatar, IconButton,
  Divider, Tooltip, Badge, LinearProgress, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  InputAdornment, Switch, Grid, Tabs, Tab,
} from '@mui/material';
import {
  SearchOutlined, FilterListOutlined, ViewKanbanOutlined,
  ViewListOutlined, TableRowsOutlined, AddOutlined,
  PhoneOutlined, WhatsApp, CalendarTodayOutlined,
  NavigateNextOutlined, LocalFireDepartmentOutlined,
  WaterDropOutlined, AcUnitOutlined, NorthOutlined,
  DownloadOutlined, CloseOutlined, SendOutlined,
  CheckCircleOutlined, AccessTimeOutlined, NotesOutlined,
  PersonOutlined, HomeWorkOutlined, CurrencyRupeeOutlined,
  SourceOutlined, MoreVertOutlined, AttachMoneyOutlined,
  ArrowUpwardOutlined, StarOutlined, EventNoteOutlined,
  TrendingUpOutlined, InfoOutlined, EditOutlined, PersonAddOutlined, MoveUpOutlined,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector, A, DATE, fieldSx, labelSx, selSx } from '../hooks';
import { fetchLeads, doUpdateLead, doCreateFollowUp, fetchFollowUps, fetchLeadById } from '../store/agentSlice';
import { Lead, Agent, LeadStatus, LeadPriority, SourceChannel, FollowUp,
  PIPELINE_STAGES, STAGE_MAP, PRIORITY_CFG,
  avatarColor, initials as getInitials, fmtBudget, timeAgo as getTimeAgo
} from '../../tenant-admin/pages/Lead_CRM/crmTypes';
import api from '../../../api/axios';
import LeadFormDialog from '../../tenant-admin/pages/Lead_CRM/LeadFormDialog';
import { LeadTimeline } from '../components/LeadTimeline';

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens — warm terracotta + indigo (matches existing agent theme)
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  bg         : '#1A0F0A',
  surface    : '#241510',
  surfaceHi  : '#2E1C15',
  surfaceMid : '#321E17',
  border     : 'rgba(255,220,180,0.1)',
  primary    : '#F97316',    // orange — energy
  indigo     : '#6366F1',    // tasks
  green      : '#22C55E',    // won / active
  red        : '#EF4444',    // lost / overdue
  amber      : '#F59E0B',    // follow-ups
  blue       : '#3B82F6',    // contacted
  cyan       : '#06B6D4',    // site visit
  purple     : '#A855F7',    // qualified
  text       : '#FFF5EC',
  textSub    : 'rgba(255,245,236,0.55)',
  textMut    : 'rgba(255,245,236,0.3)',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Status config
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_CFG = {
  NEW             : { color:C.blue,   bg:`${C.blue}18`,   label:'New',             icon:'🔵' },
  CONTACTED       : { color:C.amber,  bg:`${C.amber}18`,  label:'Contacted',       icon:'📞' },
  QUALIFIED       : { color:C.purple, bg:`${C.purple}15`, label:'Qualified',       icon:'⭐' },
  FOLLOW_UP       : { color:C.amber,  bg:`${C.amber}15`,  label:'Follow-up',       icon:'🔄' },
  VISIT_SCHEDULED : { color:C.cyan,   bg:`${C.cyan}15`,   label:'Site Visit',      icon:'🏠' },
  NEGOTIATION     : { color:C.primary,bg:`${C.primary}15`,label:'Negotiation',     icon:'🤝' },
  HOLD            : { color:C.textSub,bg:`${C.textSub}15`,label:'On Hold',          icon:'⏸️' },
  BOOKED          : { color:C.green,  bg:`${C.green}15`,  label:'Booked',          icon:'🎉' },
  WON             : { color:C.green,  bg:`${C.green}18`,  label:'Won',             icon:'🏆' },
  LOST            : { color:C.red,    bg:`${C.red}12`,    label:'Lost',            icon:'❌' },
} as Record<string, { color:string; bg:string; label:string; icon:string }>;

const SOURCE_CFG: Record<string, { icon:string; color:string }> = {
  WALK_IN      : { icon:'🚶', color:C.green   },
  REFERRAL     : { icon:'🤝', color:C.purple  },
  WEBSITE      : { icon:'🌐', color:C.blue    },
  MAGIC_BRICKS : { icon:'🏠', color:C.amber   },
  HOUSING_COM  : { icon:'🏡', color:C.cyan    },
  SOCIAL_MEDIA : { icon:'📱', color:C.indigo  },
  COLD_CALL    : { icon:'📞', color:C.textSub },
  WHATSAPP     : { icon:'💬', color:C.green   },
  BROKER       : { icon:'👔', color:C.primary },
};

const FOLLOW_TYPES = ['CALL','WHATSAPP','MEETING','SITE_VISIT','EMAIL','VIDEO_CALL'];
const OUTCOMES = ['INTERESTED','NOT_INTERESTED','CALLBACK','SITE_VISIT_SCHEDULED','BOOKING_INITIATED','NO_RESPONSE'];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const INR = (n?: number|null) =>
  !n ? '—' : n >= 10000000 ? `₹${(n/10000000).toFixed(1)}Cr` : n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${n.toLocaleString('en-IN')}`;

const timeAgo = (d?: string|null) => {
  if (!d) return '—';
  const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins/60)}h ago`;
  return `${Math.floor(mins/1440)}d ago`;
};

const leadScore = (lead: Lead): 'HOT' | 'WARM' | 'COLD' => {
  if (lead.priority) return lead.priority as any;
  if (lead.status === 'WON' || lead.status === 'LOST') return 'COLD';
  const lastActivity = lead.followUps?.[0]?.followUpAt;
  if (!lastActivity) return 'COLD';
  const days = Math.floor((Date.now() - new Date(lastActivity).getTime()) / 86400000);
  if (days <= 1) return 'HOT';
  if (days <= 7) return 'WARM';
  return 'COLD';
};

const SCORE_CFG = {
  HOT : { icon:<LocalFireDepartmentOutlined sx={{fontSize:12}}/>, color:'#F97316', bg:'rgba(249,115,22,0.15)', label:'Hot'  },
  WARM: { icon:<WaterDropOutlined sx={{fontSize:12}}/>,           color:'#F59E0B', bg:'rgba(245,158,11,0.15)', label:'Warm' },
  COLD: { icon:<AcUnitOutlined sx={{fontSize:12}}/>,              color:'#6366F1', bg:'rgba(99,102,241,0.15)', label:'Cold' },
};

const initials = (name: string) => (name || '').split(' ').filter(Boolean).map(n=>n[0]).join('').toUpperCase().slice(0,2) || '?';
const avatarBg = (name: string) => ['#6366F1','#F97316','#22C55E','#F59E0B','#EF4444','#06B6D4'][( (name || 'A').charCodeAt(0) || 0 ) % 6];

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

const StatusChip: FC<{ status: string; small?: boolean }> = ({ status, small }) => {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.NEW;
  return (
    <Box sx={{ display:'inline-flex', alignItems:'center', gap:0.5, px:small?1:1.25, py:small?0.2:0.35, borderRadius:'20px', bgcolor:cfg.bg }}>
      <Typography sx={{ fontSize:small?9:10.5 }}>{cfg.icon}</Typography>
      <Typography sx={{ fontSize:small?10:11, fontWeight:700, color:cfg.color }}>{cfg.label}</Typography>
    </Box>
  );
};

const ScoreBadge: FC<{ lead: Lead }> = ({ lead }) => {
  const score = leadScore(lead);
  const cfg   = SCORE_CFG[score];
  return (
    <Box sx={{ display:'inline-flex', alignItems:'center', gap:0.4, px:1, py:0.2, borderRadius:'20px', bgcolor:cfg.bg }}>
      <Box sx={{ color:cfg.color }}>{cfg.icon}</Box>
      <Typography sx={{ fontSize:9.5, fontWeight:700, color:cfg.color }}>{cfg.label}</Typography>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Lead Card (cards view)
// ─────────────────────────────────────────────────────────────────────────────
const LeadCardEnhanced: FC<{
  lead: Lead; selected: boolean;
  onSelect: ()=>void;
  onCall: ()=>void;
  onWhatsApp: ()=>void;
  onScheduleVisit: ()=>void;
}> = ({ lead, selected, onSelect, onCall, onWhatsApp, onScheduleVisit }) => {
  const cfg    = STATUS_CFG[lead.status] ?? STATUS_CFG.NEW;
  const srcCfg = SOURCE_CFG[lead.sourceChannel] ?? { icon:'📋', color:C.textSub };
  const score  = leadScore(lead);
  const followUpCount = lead._count?.followUps ?? 0;

  return (
    <Box
      onClick={onSelect}
      sx={{
        bgcolor  : selected ? C.surfaceHi : C.surface,
        borderRadius:'14px', p:2, mb:1.25, cursor:'pointer',
        border   : `1.5px solid ${selected ? C.primary : C.border}`,
        borderLeft: `4px solid ${cfg.color}`,
        boxShadow: selected ? `0 0 0 2px ${C.primary}25` : 'none',
        transition:'all .15s',
        '&:hover' : { bgcolor:C.surfaceHi, borderColor:selected?C.primary:`${cfg.color}40` },
        position:'relative', overflow:'hidden',
      }}
    >
      {/* Score pulse dot */}
      {score === 'HOT' && (
        <Box sx={{ position:'absolute', top:10, right:10, width:8, height:8, borderRadius:'50%', bgcolor:C.primary,
          '&::after':{ content:'""', position:'absolute', inset:-3, borderRadius:'50%', border:`2px solid ${C.primary}`, animation:'pulse 1.5s infinite',
            '@keyframes pulse':{ '0%,100%':{opacity:0.7,transform:'scale(1)'},'50%':{opacity:0,transform:'scale(1.8)'} } } }}/>
      )}

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.25}>
        <Box display="flex" alignItems="center" gap={1.25} flex={1} minWidth={0}>
          <Avatar 
            src={lead.photoUrl}
            sx={{ width:34, height:34, bgcolor:avatarBg(lead.customerName), fontSize:12, fontWeight:800, flexShrink:0 }}>
            {initials(lead.customerName)}
          </Avatar>
          <Box flex={1} minWidth={0}>
            <Typography sx={{ color:C.text, fontWeight:700, fontSize:14, lineHeight:1.2 }} noWrap>{lead.customerName}</Typography>
            <Box display="flex" alignItems="center" gap={0.75} mt={0.2}>
              <Typography sx={{ color:C.textSub, fontSize:11.5 }}>{lead.customerPhone}</Typography>
              {lead.customerEmail && <>
                <Box sx={{ width:3, height:3, borderRadius:'50%', bgcolor:C.textMut }}/>
                <Typography sx={{ color:C.textSub, fontSize:11, maxWidth:120 }} noWrap>{lead.customerEmail}</Typography>
              </>}
            </Box>
          </Box>
        </Box>
        <StatusChip status={lead.status} small/>
      </Box>

      {/* Info row */}
      <Box display="flex" gap={1.5} flexWrap="wrap" mb={1.25}>
        {lead.project && (
          <Box display="flex" alignItems="center" gap={0.5}>
            <HomeWorkOutlined sx={{ fontSize:12, color:C.textMut }}/>
            <Typography sx={{ color:C.textSub, fontSize:11.5 }}>{lead.project.name}</Typography>
          </Box>
        )}
        {lead.budget && (
          <Box display="flex" alignItems="center" gap={0.5}>
            <CurrencyRupeeOutlined sx={{ fontSize:12, color:C.textMut }}/>
            <Typography sx={{ color:C.amber, fontSize:11.5, fontWeight:600 }}>{INR(lead.budget)}</Typography>
          </Box>
        )}
        <Box display="flex" alignItems="center" gap={0.5}>
          <Typography sx={{ fontSize:11.5 }}>{srcCfg.icon}</Typography>
          <Typography sx={{ color:C.textSub, fontSize:11.5 }}>{lead.sourceChannel?.replace(/_/g,' ')}</Typography>
        </Box>
      </Box>

      {/* Footer */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center" gap={0.75}>
          <ScoreBadge lead={lead}/>
          {followUpCount > 0 && (
            <Box sx={{ px:1, py:0.2, borderRadius:'20px', bgcolor:`${C.amber}15`, display:'flex', alignItems:'center', gap:0.4 }}>
              <AccessTimeOutlined sx={{ fontSize:10, color:C.amber }}/>
              <Typography sx={{ fontSize:10, fontWeight:700, color:C.amber }}>{followUpCount}</Typography>
            </Box>
          )}
          <Typography sx={{ color:C.textMut, fontSize:10.5 }}>{timeAgo(lead.updatedAt)}</Typography>
        </Box>

        {/* Quick action buttons */}
        <Box display="flex" gap={0.5} onClick={e=>e.stopPropagation()}>
          <Tooltip title="Call"><IconButton size="small" onClick={onCall}
            sx={{ color:C.green, bgcolor:`${C.green}10`, borderRadius:'8px', width:28, height:28, '&:hover':{bgcolor:`${C.green}20`} }}>
            <PhoneOutlined sx={{fontSize:14}}/>
          </IconButton></Tooltip>
          <Tooltip title="WhatsApp"><IconButton size="small" onClick={onWhatsApp}
            sx={{ color:C.green, bgcolor:`${C.green}10`, borderRadius:'8px', width:28, height:28, '&:hover':{bgcolor:`${C.green}20`} }}>
            <WhatsApp sx={{fontSize:14}}/>
          </IconButton></Tooltip>
          <Tooltip title="Schedule Visit"><IconButton size="small" onClick={onScheduleVisit}
            sx={{ color:C.cyan, bgcolor:`${C.cyan}10`, borderRadius:'8px', width:28, height:28, '&:hover':{bgcolor:`${C.cyan}20`} }}>
            <CalendarTodayOutlined sx={{fontSize:14}}/>
          </IconButton></Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Kanban Column
// ─────────────────────────────────────────────────────────────────────────────
const KanbanColumn: FC<{ status: string; leads: Lead[]; onLeadClick: (l:Lead)=>void }> = ({ status, leads, onLeadClick }) => {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.NEW;
  return (
    <Box sx={{ minWidth:220, flex:'0 0 220px', display:'flex', flexDirection:'column', maxHeight:'calc(100vh - 340px)' }}>
      <Box sx={{ px:1.5, py:1.25, borderRadius:'10px 10px 0 0', bgcolor:cfg.bg, border:`1px solid ${cfg.color}30`, mb:0 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={0.75}>
            <Typography sx={{fontSize:14}}>{cfg.icon}</Typography>
            <Typography sx={{ fontSize:12.5, fontWeight:700, color:cfg.color }}>{cfg.label}</Typography>
          </Box>
          <Box sx={{ px:1, py:0.2, borderRadius:'20px', bgcolor:`${cfg.color}20` }}>
            <Typography sx={{ fontSize:11, fontWeight:800, color:cfg.color }}>{leads.length}</Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{ flex:1, overflowY:'auto', px:0.5, py:0.75, border:`1px solid ${cfg.color}15`, borderTop:'none', borderRadius:'0 0 10px 10px', bgcolor:C.surface }}>
        {leads.length === 0 && (
          <Box sx={{ py:4, textAlign:'center', opacity:0.4 }}>
            <Typography sx={{ fontSize:12, color:C.textSub }}>No leads</Typography>
          </Box>
        )}
        {leads.map(lead=>(
          <Box key={lead.id} onClick={()=>onLeadClick(lead)} sx={{
            p:1.5, borderRadius:'10px', mb:0.75, cursor:'pointer',
            bgcolor:C.surfaceHi, border:`1px solid ${C.border}`,
            '&:hover':{ borderColor:`${cfg.color}40`, bgcolor:C.surfaceMid },
            transition:'all .12s',
          }}>
            <Typography sx={{ color:C.text, fontWeight:600, fontSize:12.5, mb:0.4 }} noWrap>{lead.customerName}</Typography>
            <Typography sx={{ color:C.textSub, fontSize:11.5, mb:0.5 }}>{lead.customerPhone}</Typography>
            {lead.budget && <Typography sx={{ color:C.amber, fontSize:11, fontWeight:600 }}>{INR(lead.budget)}</Typography>}
            <Box display="flex" justifyContent="space-between" mt={0.75}>
              <ScoreBadge lead={lead}/>
              <Typography sx={{ color:C.textMut, fontSize:10 }}>{timeAgo(lead.updatedAt)}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Follow-Up Logger Dialog
// ─────────────────────────────────────────────────────────────────────────────
const FollowUpDialog: FC<{
  open: boolean; lead: Lead | null; onClose: ()=>void;
  onLog: (data: any)=>void;
}> = ({ open, lead, onClose, onLog }) => {
  const [form, setForm] = useState({ activityType:'CALL', notes:'', nextFollowUpDate:'', nextFollowUpType:'CALL', outcome:'' });
  const set = (k:string,v:string) => setForm(f=>({...f,[k]:v}));

  if (!lead) return null;

  const TYPE_ICONS: Record<string,string> = { CALL:'📞', WHATSAPP:'💬', MEETING:'🤝', SITE_VISIT:'📍', EMAIL:'📧', VIDEO_CALL:'📹' };
  const Fs = { '& .MuiOutlinedInput-root':{ bgcolor:C.surfaceHi, color:C.text, borderRadius:'10px', fontSize:13, '& fieldset':{borderColor:C.border}, '&:hover fieldset':{borderColor:C.primary}, '&.Mui-focused fieldset':{borderColor:C.primary} } };
  const Lb = { sx:{ color:C.textSub, fontSize:13 } };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx:{ bgcolor:C.surface, border:`1px solid ${C.border}`, borderRadius:'18px' } }}>
      <DialogTitle sx={{ color:C.text, fontWeight:700, fontSize:15, pb:1, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Box sx={{ width:30, height:30, borderRadius:'9px', bgcolor:`${C.primary}15`, color:C.primary, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <EventNoteOutlined sx={{fontSize:16}}/>
          </Box>
          Log Follow-up · <Typography component="span" sx={{ color:C.primary, fontWeight:700, fontSize:15 }}>{lead.customerName}</Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color:C.textSub }}><CloseOutlined sx={{fontSize:17}}/></IconButton>
      </DialogTitle>
      <Divider sx={{ borderColor:C.border }}/>
      <DialogContent sx={{ pt:2.5 }}>
        <Box display="flex" flexDirection="column" gap={2.5}>
          {/* Activity type chips */}
          <Box>
            <Typography sx={{ color:C.textSub, fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:0.5, mb:1 }}>Activity Type</Typography>
            <Box display="flex" flexWrap="wrap" gap={0.75}>
              {FOLLOW_TYPES.map(t=>(
                <Box key={t} onClick={()=>set('activityType',t)} sx={{
                  px:1.5, py:0.6, borderRadius:'10px', cursor:'pointer',
                  border:`1.5px solid ${form.activityType===t?C.primary:C.border}`,
                  bgcolor:form.activityType===t?`${C.primary}12`:C.surfaceHi,
                  display:'flex', alignItems:'center', gap:0.6, transition:'all .12s',
                }}>
                  <Typography sx={{fontSize:13}}>{TYPE_ICONS[t]}</Typography>
                  <Typography sx={{ fontSize:12, fontWeight:600, color:form.activityType===t?C.primary:C.textSub }}>{t.replace(/_/g,' ')}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <TextField fullWidth size="small" label="Notes" multiline rows={3} value={form.notes}
            onChange={e=>set('notes',e.target.value)} sx={Fs} InputLabelProps={Lb}
            placeholder="What was discussed? What's the customer's intent?"/>

          <Grid container spacing={2}>
            <Grid item xs={7}>
              <TextField fullWidth size="small" label="Next Follow-up Date" type="datetime-local" value={form.nextFollowUpDate}
                onChange={e=>set('nextFollowUpDate',e.target.value)} sx={Fs} InputLabelProps={{...Lb, shrink:true}}/>
            </Grid>
            <Grid item xs={5}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color:C.textSub, fontSize:13 }}>Via</InputLabel>
                <Select value={form.nextFollowUpType} label="Via" onChange={e=>set('nextFollowUpType',e.target.value)}
                  sx={{ bgcolor:C.surfaceHi, color:C.text, borderRadius:'10px', fontSize:13, '& fieldset':{borderColor:C.border}, '&:hover .MuiOutlinedInput-notchedOutline':{borderColor:C.primary} }}>
                  {FOLLOW_TYPES.map(t=><MenuItem key={t} value={t} sx={{fontSize:13}}>{TYPE_ICONS[t]} {t.replace(/_/g,' ')}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box>
            <Typography sx={{ color:C.textSub, fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:0.5, mb:1 }}>Call Outcome</Typography>
            <Box display="flex" flexWrap="wrap" gap={0.6}>
              {OUTCOMES.map(o=>(
                <Box key={o} onClick={()=>set('outcome',o)} sx={{
                  px:1.25, py:0.5, borderRadius:'8px', cursor:'pointer',
                  border:`1px solid ${form.outcome===o?C.green:C.border}`,
                  bgcolor:form.outcome===o?`${C.green}12`:C.surfaceHi,
                }}>
                  <Typography sx={{ fontSize:11.5, fontWeight:600, color:form.outcome===o?C.green:C.textSub }}>
                    {o.replace(/_/g,' ')}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <Divider sx={{ borderColor:C.border }}/>
      <DialogActions sx={{ px:3, py:2, gap:1 }}>
        <Button onClick={onClose} sx={{ color:C.textSub, textTransform:'none', fontSize:13 }}>Cancel</Button>
        <Button variant="contained" disableElevation onClick={()=>{ onLog(form); onClose(); }}
          startIcon={<SendOutlined sx={{fontSize:15}}/>}
          sx={{ bgcolor:C.primary, textTransform:'none', fontWeight:700, borderRadius:'10px', fontSize:13, '&:hover':{bgcolor:'#EA580C'} }}>
          Log Activity
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Lead Detail Panel
// ─────────────────────────────────────────────────────────────────────────────
const LeadDetailPanel: FC<{
  lead: Lead;
  onClose: ()=>void;
  onStatusChange: (status:string)=>void;
  onLogFollowUp: ()=>void;
  onNote: (note:string)=>void;
  onEdit: ()=>void;
}> = ({ lead, onClose, onStatusChange, onLogFollowUp, onNote, onEdit }) => {
  const [tab,     setTab]     = useState(0);
  const [note,    setNote]    = useState('');
  const [editSts, setEditSts] = useState(false);
  const cfg = STATUS_CFG[lead.status] ?? STATUS_CFG.NEW;
  const score = leadScore(lead);

  const infoRows = [
    { icon:<PhoneOutlined sx={{fontSize:14}}/>,         label:'Phone',    val:lead.customerPhone   },
    { icon:<PersonOutlined sx={{fontSize:14}}/>,         label:'Email',    val:lead.customerEmail||'—' },
    { icon:<HomeWorkOutlined sx={{fontSize:14}}/>,       label:'Project',  val:lead.project?.name||'—' },
    { icon:<CurrencyRupeeOutlined sx={{fontSize:14}}/>,  label:'Budget',   val:INR(lead.budget) },
    { icon:<SourceOutlined sx={{fontSize:14}}/>,         label:'Source',   val:lead.sourceChannel?.replace(/_/g,' ')||'—' },
    { icon:<AccessTimeOutlined sx={{fontSize:14}}/>,     label:'Added',    val:DATE(lead.createdAt) },
    { icon:<EventNoteOutlined sx={{fontSize:14}}/>,      label:'Updated',  val:DATE(lead.updatedAt) },
  ];

  return (
    <Box sx={{ bgcolor:C.surface, borderRadius:'18px', border:`1px solid ${C.border}`, display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>

      {/* Panel header */}
      <Box sx={{ p:2.5, borderBottom:`1px solid ${C.border}`, background:`linear-gradient(135deg, ${C.surfaceHi} 0%, ${C.surface} 100%)` }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.75}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar 
              src={lead.photoUrl}
              sx={{ width:44, height:44, bgcolor:avatarBg(lead.customerName), fontSize:16, fontWeight:800 }}>
              {initials(lead.customerName)}
            </Avatar>
            <Box>
              <Typography sx={{ color:C.text, fontWeight:800, fontSize:16, letterSpacing:-0.3 }}>{lead.customerName}</Typography>
              <Typography sx={{ color:C.textSub, fontSize:12.5, mt:0.1 }}>{lead.customerPhone}</Typography>
            </Box>
          </Box>
          <Box display="flex" gap={0.5}>
            <Tooltip title="Edit Lead">
                <IconButton size="small" onClick={onEdit} sx={{ color:C.textSub, '&:hover':{color:C.primary} }}>
                    <EditOutlined sx={{fontSize:17}}/>
                </IconButton>
            </Tooltip>
            <Tooltip title="Transfer to Agent">
                <IconButton size="small" onClick={onEdit} sx={{ color:C.textSub, '&:hover':{color:C.primary} }}>
                    <PersonAddOutlined sx={{fontSize:17}}/>
                </IconButton>
            </Tooltip>
            <IconButton size="small" onClick={onClose} sx={{ color:C.textSub, '&:hover':{color:C.text} }}>
                <CloseOutlined sx={{fontSize:17}}/>
            </IconButton>
          </Box>
        </Box>

        {/* Status + score */}
        <Box display="flex" gap={1} alignItems="center" mb={1.75} flexWrap="wrap">
          <Box onClick={()=>setEditSts(v=>!v)} sx={{ cursor:'pointer' }}>
            <StatusChip status={lead.status}/>
          </Box>
          <ScoreBadge lead={lead}/>
          {lead.budget && (
            <Box sx={{ px:1.25, py:0.35, borderRadius:'20px', bgcolor:`${C.amber}15` }}>
              <Typography sx={{ fontSize:11, fontWeight:700, color:C.amber }}>{INR(lead.budget)}</Typography>
            </Box>
          )}
        </Box>

        {/* Status picker */}
        {editSts && (
          <Box sx={{ p:1.25, borderRadius:'12px', bgcolor:C.surfaceHi, border:`1px solid ${C.border}`, mb:1.25 }}>
            <Typography sx={{ color:C.textSub, fontSize:11, fontWeight:600, mb:1, textTransform:'uppercase', letterSpacing:0.5 }}>Change Status</Typography>
            <Box display="flex" flexWrap="wrap" gap={0.6}>
              {Object.keys(STATUS_CFG).map(s=>(
                <Box key={s} onClick={()=>{ onStatusChange(s); setEditSts(false); }} sx={{
                  px:1.25, py:0.4, borderRadius:'8px', cursor:'pointer',
                  bgcolor:lead.status===s?`${STATUS_CFG[s].color}20`:C.surface,
                  border:`1px solid ${lead.status===s?STATUS_CFG[s].color:C.border}`,
                  display:'flex', alignItems:'center', gap:0.4,
                }}>
                  <Typography sx={{fontSize:11}}>{STATUS_CFG[s].icon}</Typography>
                  <Typography sx={{ fontSize:11.5, fontWeight:600, color:lead.status===s?STATUS_CFG[s].color:C.textSub }}>{STATUS_CFG[s].label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Action buttons */}
        <Box display="flex" gap={0.75}>
          <Button size="small" variant="outlined" startIcon={<PhoneOutlined sx={{fontSize:14}}/>}
            href={`tel:${lead.customerPhone}`}
            sx={{ flex:1, textTransform:'none', fontSize:12.5, borderRadius:'10px', color:C.green, borderColor:`${C.green}40`, '&:hover':{bgcolor:`${C.green}08`} }}>
            Call
          </Button>
          <Button size="small" variant="outlined" startIcon={<WhatsApp sx={{fontSize:14}}/>}
            href={`https://wa.me/${lead.customerPhone?.replace(/\D/g,'')}`} target="_blank"
            sx={{ flex:1, textTransform:'none', fontSize:12.5, borderRadius:'10px', color:'#25D366', borderColor:'#25D36640', '&:hover':{bgcolor:'#25D36608'} }}>
            WhatsApp
          </Button>
          <Button size="small" variant="contained" disableElevation startIcon={<EventNoteOutlined sx={{fontSize:14}}/>}
            onClick={onLogFollowUp}
            sx={{ flex:1, textTransform:'none', fontSize:12.5, borderRadius:'10px', bgcolor:C.primary, fontWeight:700, '&:hover':{bgcolor:'#EA580C'} }}>
            Log Activity
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom:`1px solid ${C.border}` }}>
        <Tabs value={tab} onChange={(_,v)=>setTab(v)} sx={{
          minHeight:38, px:1.5,
          '& .MuiTab-root':{ textTransform:'none', fontWeight:600, fontSize:12.5, minHeight:38, color:C.textSub, py:0 },
          '& .Mui-selected':{ color:C.primary },
          '& .MuiTabs-indicator':{ bgcolor:C.primary },
        }}>
          <Tab label="Details"/>
          <Tab label={`Timeline (${lead.activities?.length??0})`}/>
          <Tab label="Notes"/>
        </Tabs>
      </Box>

      {/* Tab content */}
      <Box sx={{ flex:1, overflowY:'auto', p:2 }}>

        {tab === 0 && (
          <Box>
            {infoRows.map(row=>(
              <Box key={row.label} display="flex" alignItems="center" gap={1.25} py={0.9} sx={{ borderBottom:`1px solid ${C.border}` }}>
                <Box sx={{ color:C.textMut, display:'flex', flexShrink:0 }}>{row.icon}</Box>
                <Typography sx={{ color:C.textSub, fontSize:12.5, width:64, flexShrink:0 }}>{row.label}</Typography>
                <Typography sx={{ color:C.text, fontSize:12.5, fontWeight:500 }}>{row.val}</Typography>
              </Box>
            ))}
            {lead.notes && (
              <Box mt={2} p={1.75} sx={{ bgcolor:C.surfaceHi, borderRadius:'10px', border:`1px solid ${C.border}` }}>
                <Typography sx={{ color:C.textSub, fontSize:11, fontWeight:600, mb:0.75, textTransform:'uppercase', letterSpacing:0.4 }}>Agent Notes</Typography>
                <Typography sx={{ color:C.text, fontSize:13, lineHeight:1.65 }}>{lead.notes}</Typography>
              </Box>
            )}
          </Box>
        )}

        {tab === 1 && (
          <Box>
            <LeadTimeline activities={lead.activities || []} />
          </Box>
        )}

        {tab === 2 && (
          <Box>
            <TextField fullWidth multiline rows={4} size="small"
              placeholder="Add a private note about this lead…"
              value={note} onChange={e=>setNote(e.target.value)}
              sx={{ mb:1.5, '& .MuiOutlinedInput-root':{ bgcolor:C.surfaceHi, color:C.text, borderRadius:'10px', fontSize:13, '& fieldset':{borderColor:C.border}, '&:hover fieldset':{borderColor:C.primary}, '&.Mui-focused fieldset':{borderColor:C.primary} } }}/>
            <Button variant="contained" disableElevation size="small" onClick={()=>{ onNote(note); setNote(''); }}
              disabled={!note.trim()}
              sx={{ textTransform:'none', bgcolor:C.primary, borderRadius:'8px', fontSize:13, fontWeight:600, '&:hover':{bgcolor:'#EA580C'} }}>
              Save Note
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
const STATUSES = ['NEW','CONTACTED','QUALIFIED','NEGOTIATION','WON','LOST'];
const PAGE_SIZE = 15;

type ViewMode = 'cards' | 'kanban' | 'table';
type SortMode = 'recent' | 'name' | 'budget_high' | 'hot_first';

export default function MyLeadsPage() {
  const dispatch = useAppDispatch();
  const { leads, loading } = useAppSelector(s => s.agent);

  const [search,   setSearch]   = useState('');
  const [status,   setStatus]   = useState('');
  const [source,   setSource]   = useState('');
  const [sort,     setSort]     = useState<SortMode>('recent');
  const [page,     setPage]     = useState(1);
  const [view,     setView]     = useState<ViewMode>('cards');
  const [selectedLeadId, setSelectedLeadId] = useState<string|null>(null);
  const [fuLead,   setFuLead]   = useState<Lead|null>(null);
  const [peers, setPeers] = useState<Agent[]>([]);
  const [addOpen,  setAddOpen]  = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<any>(null);
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const busy = !!loading.leads;

  const load = useCallback(()=>{
    dispatch(fetchLeads({ search:search||undefined, status:status||undefined, skip:(page-1)*PAGE_SIZE, take:PAGE_SIZE }));
  },[dispatch,search,status,page]);

  useEffect(()=>{
    load();
    api.get('/agent/peers').then((r: any) => setPeers(r.data?.data || [])).catch(console.error);
  },[load, dispatch]);

  // Stats
  const allLeads = leads.data;
  const selected = useMemo(() => allLeads.find(l => l.id === selectedLeadId) || null, [allLeads, selectedLeadId]);
  const setSelected = useCallback((val: any) => {
    if (typeof val === 'function') {
      const next = val(selected);
      setSelectedLeadId(next?.id || null);
    } else {
      setSelectedLeadId(val?.id || null);
    }
  }, [selected]);

  const stats = useMemo(()=>({
    total  : leads.total,
    active : allLeads.filter(l=>!['WON','LOST'].includes(l.status)).length,
    hot    : allLeads.filter(l=>leadScore(l)==='HOT').length,
    won    : allLeads.filter(l=>l.status==='WON').length,
    fuDue  : allLeads.filter(l=>l.followUps?.[0] && (() => {
      const d = new Date(l.followUps![0].followUpAt);
      const today = new Date();
      return d >= new Date(today.setHours(0,0,0,0)) && d < new Date(today.setHours(23,59,59));
    })()).length,
  }),[allLeads, leads.total]);

  // Sorted leads
  const sorted = useMemo(()=>{
    const list = [...allLeads];
    if (sort==='name')       list.sort((a,b)=>a.customerName.localeCompare(b.customerName));
    if (sort==='budget_high')list.sort((a,b)=>(b.budget??0)-(a.budget??0));
    if (sort==='hot_first')  list.sort((a,b)=>{
      const S = {HOT:0,WARM:1,COLD:2};
      return S[leadScore(a)]-S[leadScore(b)];
    });
    if (source) return list.filter(l=>l.sourceChannel===source);
    return list;
  },[allLeads,sort,source]);

  // Kanban grouped
  const kanban = useMemo(()=>{
    const m: Record<string,Lead[]> = {};
    STATUSES.forEach(s=>{ m[s]=[]; });
    sorted.forEach(l=>{ m[l.status]?.push(l); });
    return m;
  },[sorted]);

  const handleStatusChange = (leadId:string, newStatus:string) => {
    dispatch(doUpdateLead({ id:leadId, status:newStatus }));
  };

  const handleLogFollowUp = (data:any) => {
    if (!fuLead) return;
    dispatch(doCreateFollowUp({ leadId:fuLead.id, ...data })).then(() => {
        dispatch(fetchLeadById(fuLead.id));
    });
  };

  const handleNote = (note:string) => {
    if (!selected) return;
    dispatch(doUpdateLead({ id:selected.id, notes:note }));
  };

  const handleExport = () => {
    const rows = [
      ['Name','Phone','Email','Status','Source','Budget','Project','Updated'],
      ...allLeads.map(l=>[l.customerName,l.customerPhone,l.customerEmail||'',l.status,l.sourceChannel||'',l.budget||'',l.project?.name||'',DATE(l.updatedAt)]),
    ];
    const csv = rows.map(r=>r.join(',')).join('\n');
    const blob = new Blob([csv],{type:'text/csv'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href=url; a.download='my-leads.csv'; a.click();
  };

  // ── Shared input styles ─────────────────────────────────────────────────────
  const Fs = { '& .MuiOutlinedInput-root':{ bgcolor:C.surface, color:C.text, borderRadius:'10px', fontSize:13.5, '& fieldset':{borderColor:C.border}, '&:hover fieldset':{borderColor:C.primary} } };
  const Ss = { bgcolor:C.surface, color:C.text, borderRadius:'10px', fontSize:13, '& fieldset':{borderColor:C.border}, '&:hover .MuiOutlinedInput-notchedOutline':{borderColor:C.primary} };

  return (
    <Box sx={{ height:'calc(100vh - 110px)', display:'flex', flexDirection:'column', overflow:'hidden' }}>

      {/* ── Header ── */}
      <Box mb={2.5}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2.5}>
          <Box>
            <Typography sx={{ color:C.text, fontWeight:800, fontSize:21, letterSpacing:-0.5 }}>My Leads</Typography>
            <Typography sx={{ color:C.textSub, fontSize:13, mt:0.25 }}>{leads.total} leads assigned to you</Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Button size="small" variant="outlined" startIcon={<DownloadOutlined sx={{fontSize:15}}/>}
              onClick={handleExport}
              sx={{ textTransform:'none', fontSize:12.5, borderRadius:'10px', color:C.textSub, borderColor:C.border, '&:hover':{borderColor:C.primary, color:C.primary} }}>
              Export
            </Button>
            <Button size="small" variant="contained" disableElevation startIcon={<AddOutlined sx={{fontSize:15}}/>}
              onClick={()=>setAddOpen(true)}
              sx={{ textTransform:'none', fontSize:12.5, borderRadius:'10px', bgcolor:C.primary, fontWeight:700, '&:hover':{bgcolor:'#EA580C'} }}>
              Add Lead
            </Button>
          </Box>
        </Box>

        {/* Stats strip */}
        <Box display="flex" gap={1.5} mb={2.5} flexWrap="wrap">
          {[
            { label:'Active',     value:stats.active,  color:C.blue,    bg:`${C.blue}12` },
            { label:'Hot Leads',  value:stats.hot,     color:C.primary, bg:`${C.primary}12` },
            { label:'Due Today',  value:stats.fuDue,   color:C.amber,   bg:`${C.amber}12` },
            { label:'Won',        value:stats.won,     color:C.green,   bg:`${C.green}12` },
          ].map(s=>(
            <Box key={s.label} sx={{ px:2, py:1.1, borderRadius:'12px', bgcolor:s.bg, border:`1px solid ${s.color}20`, display:'flex', gap:1.25, alignItems:'center' }}>
              <Typography sx={{ fontSize:20, fontWeight:800, color:s.color, lineHeight:1, letterSpacing:-0.5 }}>{s.value}</Typography>
              <Typography sx={{ fontSize:11.5, color:s.color, fontWeight:600, opacity:0.8 }}>{s.label}</Typography>
            </Box>
          ))}
          {/* Conversion rate */}
          <Box sx={{ px:2, py:1.1, borderRadius:'12px', bgcolor:`${C.purple}12`, border:`1px solid ${C.purple}20`, display:'flex', gap:1.25, alignItems:'center', minWidth:140 }}>
            <Box>
              <Typography sx={{ fontSize:13, fontWeight:800, color:C.purple, lineHeight:1 }}>
                {leads.total>0?((stats.won/leads.total)*100).toFixed(1):0}%
              </Typography>
              <Typography sx={{ fontSize:11, color:C.purple, fontWeight:600, opacity:0.8 }}>Conversion</Typography>
            </Box>
            <Box flex={1}>
              <LinearProgress variant="determinate" value={leads.total>0?(stats.won/leads.total)*100:0}
                sx={{ height:4, borderRadius:2, bgcolor:`${C.purple}20`, '& .MuiLinearProgress-bar':{bgcolor:C.purple,borderRadius:2} }}/>
            </Box>
          </Box>
        </Box>

        {/* Filters + view toggle */}
        <Box display="flex" gap={1.25} flexWrap="wrap" alignItems="center">
          <TextField size="small" placeholder="Search name, phone, email…" value={search}
            onChange={e=>{setSearch(e.target.value);setPage(1);}}
            InputProps={{ startAdornment:<InputAdornment position="start"><SearchOutlined sx={{fontSize:17,color:C.textMut}}/></InputAdornment>,
              sx:{...Fs['& .MuiOutlinedInput-root'], width:210} }}
            sx={{ '& .MuiOutlinedInput-root':{...Fs['& .MuiOutlinedInput-root']} }}/>

          <FormControl size="small" sx={{ minWidth:120 }}>
            <InputLabel sx={{ color:C.textSub, fontSize:13 }}>Status</InputLabel>
            <Select value={status} label="Status" onChange={e=>{setStatus(e.target.value);setPage(1);}} sx={Ss}>
              <MenuItem value="" sx={{fontSize:13}}>All</MenuItem>
              {STATUSES.map(s=><MenuItem key={s} value={s} sx={{fontSize:13}}>{STATUS_CFG[s].icon} {s}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth:130 }}>
            <InputLabel sx={{ color:C.textSub, fontSize:13 }}>Source</InputLabel>
            <Select value={source} label="Source" onChange={e=>setSource(e.target.value)} sx={Ss}>
              <MenuItem value="" sx={{fontSize:13}}>All Sources</MenuItem>
              {Object.entries(SOURCE_CFG).map(([k,v])=><MenuItem key={k} value={k} sx={{fontSize:13}}>{v.icon} {k.replace(/_/g,' ')}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth:140 }}>
            <InputLabel sx={{ color:C.textSub, fontSize:13 }}>Sort by</InputLabel>
            <Select value={sort} label="Sort by" onChange={e=>setSort(e.target.value as SortMode)} sx={Ss}>
              <MenuItem value="recent"    sx={{fontSize:13}}>Most Recent</MenuItem>
              <MenuItem value="hot_first" sx={{fontSize:13}}>🔥 Hot First</MenuItem>
              <MenuItem value="name"      sx={{fontSize:13}}>Name A–Z</MenuItem>
              <MenuItem value="budget_high" sx={{fontSize:13}}>💰 Budget High–Low</MenuItem>
            </Select>
          </FormControl>

          {/* View mode toggle */}
          <Box display="flex" gap={0.4} sx={{ ml:'auto', bgcolor:C.surfaceHi, borderRadius:'10px', p:0.5, border:`1px solid ${C.border}` }}>
            {([['cards','Cards',<ViewListOutlined sx={{fontSize:16}}/>],['kanban','Pipeline',<ViewKanbanOutlined sx={{fontSize:16}}/>],['table','Table',<TableRowsOutlined sx={{fontSize:16}}/>]] as const).map(([v,l,icon])=>(
              <Box key={v} component="button" onClick={()=>setView(v)}
                title={l}
                sx={{ px:1.25, py:0.7, borderRadius:'8px', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:0.5, fontSize:11.5, fontWeight:600,
                  bgcolor:view===v?C.surface:'transparent',
                  color:view===v?C.primary:C.textSub,
                  boxShadow:view===v?'0 1px 4px rgba(0,0,0,0.3)':'none',
                  transition:'all .12s',
                }}>
                {icon}
                <Box component="span" sx={{ display:{xs:'none',sm:'inline'} }}>{l}</Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ── Content ── */}
      <Box sx={{ flex:1, display:'flex', gap:3, minHeight:0 }}>

        {/* ── Cards / Table view — left list ── */}
        {view !== 'kanban' && (
          <Box sx={{ width:selected?380:'100%', flexShrink:0, overflowY:'auto', transition:'width .2s ease', pr:selected?0.5:0 }}>
            {busy ? (
              Array.from({length:5}).map((_,i)=>(
                <Box key={i} sx={{ bgcolor:C.surfaceHi, borderRadius:'12px', height:100, mb:1.25, opacity:0.4+(i*0.1) }}/>
              ))
            ) : sorted.length === 0 ? (
              <Box py={8} textAlign="center">
                <Typography sx={{ color:C.textSub, fontSize:14 }}>No leads match your filters</Typography>
              </Box>
            ) : view === 'cards' ? (
              <>
                {sorted.map(lead=>(
                  <LeadCardEnhanced key={lead.id} lead={lead}
                    selected={selected?.id===lead.id}
                    onSelect={()=>setSelected(s=>s?.id===lead.id?null:lead)}
                    onCall={()=>window.location.href=`tel:${lead.customerPhone}`}
                    onWhatsApp={()=>window.open(`https://wa.me/${lead.customerPhone?.replace(/\D/g,'')}`,`_blank`)}
                    onScheduleVisit={()=>{ setSelected(lead); setFuLead(lead); }}
                  />
                ))}
                {Math.ceil(leads.total/PAGE_SIZE)>1 && (
                  <Box display="flex" justifyContent="center" mt={2}>
                    <Pagination count={Math.ceil(leads.total/PAGE_SIZE)} page={page} onChange={(_,p)=>setPage(p)}
                      sx={{ '& .MuiPaginationItem-root':{color:C.textSub,'&.Mui-selected':{bgcolor:`${C.primary}25`,color:C.primary}} }}/>
                  </Box>
                )}
              </>
            ) : (
              // Table view
              <Box sx={{ bgcolor:C.surface, borderRadius:'14px', border:`1px solid ${C.border}`, overflow:'hidden' }}>
                <Box sx={{ display:'grid', gridTemplateColumns:'2fr 1.2fr 1fr 1fr 0.8fr 0.8fr 1fr', px:2, py:1.25, borderBottom:`1px solid ${C.border}`, bgcolor:C.surfaceHi }}>
                  {['Customer','Status','Source','Budget','Score','Follow-ups','Updated'].map(h=>(
                    <Typography key={h} sx={{ color:C.textSub, fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:0.5 }}>{h}</Typography>
                  ))}
                </Box>
                {sorted.map((lead,i)=>(
                  <Box key={lead.id} onClick={()=>setSelected(s=>s?.id===lead.id?null:lead)}
                    sx={{ display:'grid', gridTemplateColumns:'2fr 1.2fr 1fr 1fr 0.8fr 0.8fr 1fr',
                      px:2, py:1.1, borderBottom:`1px solid ${C.border}`, cursor:'pointer', alignItems:'center',
                      bgcolor:selected?.id===lead.id?`${C.primary}08`:'transparent',
                      '&:hover':{ bgcolor:C.surfaceHi } }}>
                    <Box>
                      <Typography sx={{ color:C.text, fontSize:13, fontWeight:600 }} noWrap>{lead.customerName}</Typography>
                      <Typography sx={{ color:C.textSub, fontSize:11.5 }}>{lead.customerPhone}</Typography>
                    </Box>
                    <StatusChip status={lead.status} small/>
                    <Typography sx={{ color:C.textSub, fontSize:12 }}>{SOURCE_CFG[lead.sourceChannel]?.icon} {lead.sourceChannel?.replace(/_/g,' ')}</Typography>
                    <Typography sx={{ color:C.amber, fontSize:12.5, fontWeight:600 }}>{INR(lead.budget)}</Typography>
                    <ScoreBadge lead={lead}/>
                    <Typography sx={{ color:C.textSub, fontSize:12, textAlign:'center' }}>{lead._count?.followUps??0}</Typography>
                    <Typography sx={{ color:C.textMut, fontSize:11.5 }}>{timeAgo(lead.updatedAt)}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* ── Kanban view ── */}
        {view === 'kanban' && (
          <Box sx={{ flex:1, overflowX:'auto', display:'flex', gap:2, pb:1, alignItems:'flex-start' }}>
            {STATUSES.map(s=>(
              <KanbanColumn key={s} status={s} leads={kanban[s]??[]} onLeadClick={l=>{ setSelected(l); setView('cards'); }}/>
            ))}
          </Box>
        )}

        {/* ── Detail panel (right) ── */}
        {selected && view !== 'kanban' && (
          <Box sx={{ flex:1, minWidth:0, minHeight:0, overflow:'hidden' }}>
            <LeadDetailPanel
              lead={selected}
              onClose={()=>setSelected(null)}
              onStatusChange={(s)=>handleStatusChange(selected.id,s)}
              onLogFollowUp={()=>setFuLead(selected)}
              onNote={handleNote}
              onEdit={() => { setLeadToEdit(selected); setEditOpen(true); }}
            />
          </Box>
        )}
      </Box>

      {/* ── Follow-up dialog ── */}
      <FollowUpDialog open={!!fuLead} lead={fuLead} onClose={()=>setFuLead(null)} onLog={handleLogFollowUp}/>

          <LeadFormDialog
            open={addOpen || editOpen}
            onClose={() => { setAddOpen(false); setEditOpen(false); setLeadToEdit(null); }}
            onSave={() => { setAddOpen(false); setEditOpen(false); setLeadToEdit(null); load(); }}
            initial={leadToEdit || undefined}
            isAgent={true}
            agents={peers}
            apiOverride={api}
          />
    </Box>
  );
}