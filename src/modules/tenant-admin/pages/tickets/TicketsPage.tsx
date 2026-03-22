/**
 * TicketsPage.tsx
 *
 * Full internal ticketing system for Realesso.
 * Works for ALL roles — Agent, Sales Manager, HR, Finance, Admin.
 *
 * Role capabilities:
 *   AGENT        → Raise tickets to Sales/Finance/Admin. View own tickets.
 *   SALES_MANAGER→ Raise + Resolve LEAD/BOOKING/CUSTOMER tickets. View team tickets.
 *   HR           → Raise + Resolve HR_REQUEST tickets. View HR tickets.
 *   FINANCE      → Raise + Resolve PAYMENT/COMMISSION tickets. View Finance tickets.
 *   TENANT_ADMIN → Full access: raise, resolve, assign, close any ticket.
 *
 * Design: "Structured Control Room" — light neutral bg, high information density,
 *   deep ink text, coloured priority/status chips, left-panel list + right-panel detail split.
 */

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  Box, Grid, Typography, Chip, Avatar, IconButton, Button,
  TextField, Select, MenuItem, FormControl, InputLabel,
  CircularProgress, Divider, Tooltip, Badge, Tab, Tabs,
  Dialog, DialogTitle, DialogContent, DialogActions,
  InputAdornment, Alert, LinearProgress, Switch,
} from '@mui/material';
import {
  AddOutlined, SearchOutlined, FilterListOutlined,
  VisibilityOutlined, CheckCircleOutlined, AssignmentIndOutlined,
  CloseOutlined, SendOutlined, LockOutlined, RefreshOutlined,
  AttachFileOutlined, WarningAmberOutlined, DoneAllOutlined,
  PauseCircleOutlined, RadioButtonUncheckedOutlined,
  SupportAgentOutlined, FlagOutlined, AccessTimeOutlined,
  ReplyOutlined, NoteOutlined, TuneOutlined, DownloadOutlined,
} from '@mui/icons-material';
import api from '../../../../api/axios';
import type {
  Ticket, TicketComment, TicketActivity,
  TicketStatus, TicketPriority, TicketCategory,
} from './Tickettypes';
import { CATEGORY_META, CATEGORY_RESOLVER } from './Tickettypes';

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  bg      : '#F4F6FB',
  surface : '#FFFFFF',
  ink     : '#0B1120',
  border  : '#E2E8F0',
  blue    : '#2563EB',
  indigo  : '#6366F1',
  emerald : '#059669',
  amber   : '#D97706',
  rose    : '#E11D48',
  slate   : '#64748B',
  muted   : '#94A3B8',
  light   : '#F8FAFC',
} as const;

// ── Status & Priority config ──────────────────────────────────────────────────
const STATUS_CFG: Record<TicketStatus, { label:string; color:string; bg:string; icon:React.ReactNode }> = {
  OPEN       : { label:'Open',        color:'#2563EB', bg:'#EFF6FF', icon:<RadioButtonUncheckedOutlined sx={{fontSize:12}}/> },
  IN_PROGRESS: { label:'In Progress', color:'#D97706', bg:'#FFFBEB', icon:<PauseCircleOutlined sx={{fontSize:12}}/> },
  WAITING    : { label:'Waiting',     color:'#7C3AED', bg:'#F5F3FF', icon:<AccessTimeOutlined sx={{fontSize:12}}/> },
  RESOLVED   : { label:'Resolved',    color:'#059669', bg:'#ECFDF5', icon:<CheckCircleOutlined sx={{fontSize:12}}/> },
  CLOSED     : { label:'Closed',      color:'#64748B', bg:'#F1F5F9', icon:<DoneAllOutlined sx={{fontSize:12}}/> },
};

const PRIORITY_CFG: Record<TicketPriority, { color:string; bg:string; dot:string }> = {
  LOW     : { color:'#64748B', bg:'#F1F5F9', dot:'#94A3B8' },
  MEDIUM  : { color:'#2563EB', bg:'#EFF6FF', dot:'#2563EB' },
  HIGH    : { color:'#D97706', bg:'#FFFBEB', dot:'#D97706' },
  CRITICAL: { color:'#E11D48', bg:'#FFF1F2', dot:'#E11D48' },
};

const ROLE_COLORS: Record<string, string> = {
  AGENT:'#6366F1', SALES_MANAGER:'#2563EB', HR:'#7C3AED',
  FINANCE:'#D97706', TENANT_ADMIN:'#059669',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const timeAgo = (d: string) => {
  const diff = Date.now() - new Date(d).getTime(), m = Math.floor(diff/60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m/60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
};
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
const initials = (name: string) => name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || '?';
const avatarBg = (name: string) => {
  const colors = ['#6366F1','#059669','#D97706','#E11D48','#0891B2','#7C3AED','#2563EB'];
  return colors[(name?.charCodeAt(0)??0) % colors.length];
};

// ── Mock data factory ─────────────────────────────────────────────────────────
const MOCK: Ticket[] = [
  {
    id:'1', tenantId:'t1', ticketNumber:'TKT-2024-00001',
    subject:'Lead not getting assigned after import from MagicBricks',
    description:'I imported 45 leads from MagicBricks yesterday but none of them appeared in the round-robin queue. The leads show in the system with status NEW but no agent was assigned automatically. Please check the assignment logic.',
    category:'LEAD_ISSUE', priority:'HIGH', status:'IN_PROGRESS',
    raisedById:'u1', raisedByName:'Arjun Mehta', raisedByRole:'AGENT',
    assignedToId:'u3', assignedToName:'Vikram Joshi', assignedToRole:'SALES_MANAGER',
    targetDept:'Sales', slaBreached:false,
    comments:[
      { id:'c1', ticketId:'1', authorId:'u3', authorName:'Vikram Joshi', authorRole:'SALES_MANAGER', content:'Looking into this. The round-robin config may have been reset after the last system update.', isInternal:false, createdAt:new Date(Date.now()-3600000).toISOString() },
      { id:'c2', ticketId:'1', authorId:'u3', authorName:'Vikram Joshi', authorRole:'SALES_MANAGER', content:'Internal note: need to check tenantConfig.leadAssignment table for this tenant.', isInternal:true, createdAt:new Date(Date.now()-1800000).toISOString() },
    ],
    activity:[
      { id:'a1', ticketId:'1', actorName:'Arjun Mehta', action:'CREATED', createdAt:new Date(Date.now()-86400000).toISOString() },
      { id:'a2', ticketId:'1', actorName:'Vikram Joshi', action:'STATUS_CHANGED', fromValue:'OPEN', toValue:'IN_PROGRESS', createdAt:new Date(Date.now()-3600000).toISOString() },
    ],
    attachments:[], createdAt:new Date(Date.now()-86400000).toISOString(), updatedAt:new Date(Date.now()-1800000).toISOString(),
  },
  {
    id:'2', tenantId:'t1', ticketNumber:'TKT-2024-00002',
    subject:'Commission payment not reflecting for Oberoi Realty booking',
    description:'Booking ID BK-2024-1892 was closed on 12th March. My commission of ₹42,000 should have been processed by now (as per 7-day SLA) but it still shows as PENDING in my profile.',
    category:'COMMISSION_QUERY', priority:'MEDIUM', status:'OPEN',
    raisedById:'u2', raisedByName:'Priya Sharma', raisedByRole:'AGENT',
    targetDept:'Finance', slaBreached:false,
    comments:[], activity:[
      { id:'a3', ticketId:'2', actorName:'Priya Sharma', action:'CREATED', createdAt:new Date(Date.now()-172800000).toISOString() },
    ],
    attachments:[], createdAt:new Date(Date.now()-172800000).toISOString(), updatedAt:new Date(Date.now()-172800000).toISOString(),
  },
  {
    id:'3', tenantId:'t1', ticketNumber:'TKT-2024-00003',
    subject:'Request for salary slip — March 2024',
    description:'Please share the salary slip for March 2024. I need it for my home loan application by end of this week.',
    category:'HR_REQUEST', priority:'LOW', status:'RESOLVED',
    raisedById:'u4', raisedByName:'Rohan Desai', raisedByRole:'AGENT',
    assignedToId:'u5', assignedToName:'Neha Kulkarni', assignedToRole:'HR',
    resolvedAt: new Date(Date.now()-86400000).toISOString(),
    targetDept:'HR', slaBreached:false,
    comments:[
      { id:'c3', ticketId:'3', authorId:'u5', authorName:'Neha Kulkarni', authorRole:'HR', content:'Salary slip has been emailed to your registered email ID. Please check and confirm.', isInternal:false, createdAt:new Date(Date.now()-86400000).toISOString() },
    ],
    activity:[
      { id:'a4', ticketId:'3', actorName:'Rohan Desai', action:'CREATED', createdAt:new Date(Date.now()-259200000).toISOString() },
      { id:'a5', ticketId:'3', actorName:'Neha Kulkarni', action:'RESOLVED', createdAt:new Date(Date.now()-86400000).toISOString() },
    ],
    attachments:[], createdAt:new Date(Date.now()-259200000).toISOString(), updatedAt:new Date(Date.now()-86400000).toISOString(),
  },
  {
    id:'4', tenantId:'t1', ticketNumber:'TKT-2024-00004',
    subject:'Customer complaint — aggressive follow-up by Agent Raj Kumar',
    description:'Customer Mr. Desai (Lead #LD-4892) has complained about receiving 4 calls in a single day from our agent. Needs immediate attention to protect company reputation.',
    category:'CUSTOMER_COMPLAINT', priority:'CRITICAL', status:'OPEN',
    raisedById:'u3', raisedByName:'Vikram Joshi', raisedByRole:'SALES_MANAGER',
    targetDept:'Admin', slaBreached:true,
    comments:[], activity:[
      { id:'a6', ticketId:'4', actorName:'Vikram Joshi', action:'CREATED', createdAt:new Date(Date.now()-7200000).toISOString() },
    ],
    attachments:[], createdAt:new Date(Date.now()-7200000).toISOString(), updatedAt:new Date(Date.now()-7200000).toISOString(),
  },
  {
    id:'5', tenantId:'t1', ticketNumber:'TKT-2024-00005',
    subject:'Installment overdue alert not being sent to customer',
    description:'For 3 bookings this month, customers did not receive the 7-day overdue reminder email. We have missed collections as a result. This appears to be a system configuration issue.',
    category:'TECHNICAL', priority:'HIGH', status:'WAITING',
    raisedById:'u6', raisedByName:'Amit Singh', raisedByRole:'FINANCE',
    assignedToId:'u7', assignedToName:'Admin Team', assignedToRole:'TENANT_ADMIN',
    targetDept:'Admin', slaBreached:false,
    comments:[
      { id:'c4', ticketId:'5', authorId:'u7', authorName:'Admin Team', authorRole:'TENANT_ADMIN', content:'Escalated to our technical support team. Awaiting their response.', isInternal:false, createdAt:new Date(Date.now()-3600000).toISOString() },
    ],
    activity:[
      { id:'a7', ticketId:'5', actorName:'Amit Singh', action:'CREATED', createdAt:new Date(Date.now()-43200000).toISOString() },
      { id:'a8', ticketId:'5', actorName:'Admin Team', action:'STATUS_CHANGED', fromValue:'IN_PROGRESS', toValue:'WAITING', createdAt:new Date(Date.now()-3600000).toISOString() },
    ],
    attachments:[], createdAt:new Date(Date.now()-43200000).toISOString(), updatedAt:new Date(Date.now()-3600000).toISOString(),
  },
];

// ── New Ticket Dialog ─────────────────────────────────────────────────────────
const NewTicketDialog: React.FC<{
  open: boolean; onClose: ()=>void;
  userRole: string; onCreated: (t: Ticket)=>void;
}> = ({ open, onClose, userRole, onCreated }) => {
  const [form, setForm] = useState({
    subject:'', description:'', category:'GENERAL' as TicketCategory,
    priority:'MEDIUM' as TicketPriority, relatedId:'',
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setForm(f=>({...f,[k]:v}));

  // Filter categories based on role
  const allowedCats = Object.entries(CATEGORY_META).filter(([cat]) => {
    const resolvers = CATEGORY_RESOLVER[cat as TicketCategory];
    // Agents can't raise compliance tickets
    if (userRole==='AGENT' && cat==='COMPLIANCE') return false;
    return true;
  });

  const handleCreate = async () => {
    if (!form.subject.trim() || !form.description.trim()) return;
    setSaving(true);
    try {
      const payload = {
        subject: form.subject.trim(),
        description: form.description.trim(),
        category: form.category,
        priority: form.priority,
        relatedId: form.relatedId.trim() || undefined,
      };
      const res = await api.post('/tickets', payload);
      onCreated(res.data?.data ?? res.data);
      onClose();
      setForm({ subject:'', description:'', category:'GENERAL', priority:'MEDIUM', relatedId:'' });
    } finally { setSaving(false); }
  };

  const Fs = { '& .MuiOutlinedInput-root':{ borderRadius:'10px', fontSize:13.5, '& fieldset':{borderColor:T.border}, '&:hover fieldset':{borderColor:T.blue}, '&.Mui-focused fieldset':{borderColor:T.blue} } };
  const Lb = { sx:{ fontSize:13, color:T.slate } };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx:{ borderRadius:'18px', border:`1px solid ${T.border}` } }}>
      <DialogTitle sx={{ fontWeight:800, fontSize:17, color:T.ink, pb:1, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Box sx={{ width:32, height:32, borderRadius:'9px', bgcolor:`${T.blue}12`, color:T.blue, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <SupportAgentOutlined sx={{ fontSize:17 }}/>
          </Box>
          Raise a Ticket
        </Box>
        <IconButton size="small" onClick={onClose}><CloseOutlined sx={{fontSize:18}}/></IconButton>
      </DialogTitle>
      <Divider/>
      <DialogContent sx={{ pt:2.5 }}>
        <Box display="flex" flexDirection="column" gap={2.5}>
          <TextField fullWidth size="small" label="Subject *" value={form.subject} onChange={e=>set('subject',e.target.value)}
            placeholder="Brief summary of your issue" sx={Fs} InputLabelProps={Lb}/>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontSize:13, color:T.slate }}>Category *</InputLabel>
                <Select value={form.category} label="Category *" onChange={e=>set('category',e.target.value)}
                  sx={{ borderRadius:'10px', fontSize:13.5, '& fieldset':{borderColor:T.border} }}>
                  {allowedCats.map(([k,v])=>(
                    <MenuItem key={k} value={k} sx={{ fontSize:13 }}>{v.icon} {v.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontSize:13, color:T.slate }}>Priority</InputLabel>
                <Select value={form.priority} label="Priority" onChange={e=>set('priority',e.target.value)}
                  sx={{ borderRadius:'10px', fontSize:13.5, '& fieldset':{borderColor:T.border} }}>
                  {(['LOW','MEDIUM','HIGH','CRITICAL'] as TicketPriority[]).map(p=>(
                    <MenuItem key={p} value={p} sx={{ fontSize:13 }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box sx={{ width:8, height:8, borderRadius:'50%', bgcolor:PRIORITY_CFG[p].dot }}/>
                        {p}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Routing info */}
          {form.category !== 'GENERAL' && (
            <Box sx={{ p:1.75, borderRadius:'10px', bgcolor:`${T.blue}06`, border:`1px solid ${T.blue}20`, display:'flex', alignItems:'center', gap:1.25 }}>
              <SupportAgentOutlined sx={{ fontSize:16, color:T.blue, flexShrink:0 }}/>
              <Typography sx={{ fontSize:12.5, color:T.blue, fontWeight:500 }}>
                This ticket will be routed to <strong>{CATEGORY_META[form.category].dept}</strong> team · Resolvers: {CATEGORY_RESOLVER[form.category].join(', ')}
              </Typography>
            </Box>
          )}

          <TextField fullWidth size="small" label="Description *" multiline rows={4} value={form.description}
            onChange={e=>set('description',e.target.value)}
            placeholder="Explain the issue in detail. Include relevant IDs (lead ID, booking ID, etc.)"
            sx={Fs} InputLabelProps={Lb}/>

          <TextField fullWidth size="small" label="Related ID (optional)" value={form.relatedId}
            onChange={e=>set('relatedId',e.target.value)} placeholder="e.g. LD-4892 or BK-1234"
            sx={Fs} InputLabelProps={Lb}/>
        </Box>
      </DialogContent>
      <Divider/>
      <DialogActions sx={{ px:3, py:2.5, gap:1 }}>
        <Button onClick={onClose} sx={{ color:T.slate, textTransform:'none', fontSize:13 }}>Cancel</Button>
        <Button variant="contained" disableElevation disabled={saving||!form.subject||!form.description}
          onClick={handleCreate}
          startIcon={saving ? <CircularProgress size={14} color="inherit"/> : <SendOutlined sx={{fontSize:16}}/>}
          sx={{ bgcolor:T.blue, textTransform:'none', fontWeight:700, borderRadius:'10px', px:3, fontSize:13 }}>
          {saving ? 'Raising…' : 'Raise Ticket'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Ticket Detail Panel ───────────────────────────────────────────────────────
const TicketDetail: React.FC<{
  ticket: Ticket; userRole: string; userId: string;
  onUpdate: (id: string, updates: Partial<Ticket>)=>void;
  onClose: ()=>void;
}> = ({ ticket, userRole, userId, onUpdate, onClose }) => {
  const [comment,     setComment]     = useState('');
  const [isInternal,  setIsInternal]  = useState(false);
  const [activeTab,   setActiveTab]   = useState(0);
  const [posting,     setPosting]     = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const canResolve = CATEGORY_RESOLVER[ticket.category]?.includes(userRole) || userRole === 'TENANT_ADMIN';
  const canAssign  = userRole === 'TENANT_ADMIN' || userRole === 'SALES_MANAGER' || userRole === 'HR' || userRole === 'FINANCE';
  const isRaiser   = ticket.raisedById === userId;

  const sCfg = STATUS_CFG[ticket.status];
  const pCfg = PRIORITY_CFG[ticket.priority];
  const cMeta = CATEGORY_META[ticket.category];

  const postComment = async () => {
    if (!comment.trim()) return;
    setPosting(true);
    try {
      const res = await api.post(`/tickets/${ticket.id}/comments`, {
        content: comment.trim(),
        isInternal,
      });
      onUpdate(ticket.id, res.data?.data ?? res.data);
      setComment('');
    } finally { setPosting(false); }
  };

  const changeStatus = async (newStatus: TicketStatus) => {
    const res = await api.put(`/tickets/${ticket.id}`, { status: newStatus });
    onUpdate(ticket.id, res.data?.data ?? res.data);
  };

  const Fs = { '& .MuiOutlinedInput-root':{ borderRadius:'10px', fontSize:13, '& fieldset':{borderColor:T.border}, '&.Mui-focused fieldset':{borderColor:T.blue} } };

  return (
    <Box sx={{ display:'flex', flexDirection:'column', height:'100%', bgcolor:T.surface }}>

      {/* Detail header */}
      <Box sx={{ px:3, py:2.5, borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'flex-start', gap:2 }}>
        <Box flex={1} minWidth={0}>
          <Box display="flex" alignItems="center" gap={1} mb={0.75} flexWrap="wrap">
            <Typography sx={{ fontFamily:'monospace', fontSize:11.5, color:T.slate, fontWeight:700 }}>{ticket.ticketNumber}</Typography>
            <Box sx={{ px:1.25, py:0.3, borderRadius:'6px', bgcolor:sCfg.bg, display:'flex', alignItems:'center', gap:0.5 }}>
              <Box sx={{ color:sCfg.color, display:'flex' }}>{sCfg.icon}</Box>
              <Typography sx={{ fontSize:11, fontWeight:700, color:sCfg.color }}>{sCfg.label}</Typography>
            </Box>
            <Box sx={{ px:1.25, py:0.3, borderRadius:'6px', bgcolor:pCfg.bg, display:'flex', alignItems:'center', gap:0.5 }}>
              <Box sx={{ width:6, height:6, borderRadius:'50%', bgcolor:pCfg.dot }}/>
              <Typography sx={{ fontSize:11, fontWeight:700, color:pCfg.color }}>{ticket.priority}</Typography>
            </Box>
            {ticket.slaBreached && (
              <Chip label="⚠ SLA Breached" size="small" sx={{ fontSize:10, height:20, bgcolor:'#FFF1F2', color:'#E11D48', fontWeight:700 }}/>
            )}
          </Box>
          <Typography sx={{ fontWeight:700, fontSize:15, color:T.ink, lineHeight:1.3 }}>{ticket.subject}</Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ flexShrink:0, color:T.muted, '&:hover':{color:T.ink} }}>
          <CloseOutlined sx={{fontSize:18}}/>
        </IconButton>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom:`1px solid ${T.border}`, px:2 }}>
        <Tabs value={activeTab} onChange={(_,v)=>setActiveTab(v)} sx={{ minHeight:40,
          '& .MuiTab-root':{ textTransform:'none', fontWeight:600, fontSize:12.5, minHeight:40, color:T.slate },
          '& .Mui-selected':{ color:T.blue },
          '& .MuiTabs-indicator':{ bgcolor:T.blue },
        }}>
          <Tab label="Conversation"/>
          <Tab label="Details"/>
          <Tab label={`Activity (${ticket.activity.length})`}/>
        </Tabs>
      </Box>

      {/* Tab content */}
      <Box sx={{ flex:1, overflowY:'auto', p:2.5 }}>

        {/* ── Conversation tab ── */}
        {activeTab === 0 && (
          <Box>
            {/* Original description */}
            <Box sx={{ display:'flex', gap:1.75, mb:3 }}>
              <Avatar sx={{ width:32, height:32, bgcolor:avatarBg(ticket.raisedByName), fontSize:11, fontWeight:700, flexShrink:0, mt:0.25 }}>
                {initials(ticket.raisedByName)}
              </Avatar>
              <Box flex={1}>
                <Box display="flex" alignItems="center" gap={1} mb={0.75}>
                  <Typography sx={{ fontWeight:700, fontSize:13, color:T.ink }}>{ticket.raisedByName}</Typography>
                  <Chip label={ticket.raisedByRole.replace(/_/g,' ')} size="small"
                    sx={{ fontSize:9.5, height:18, bgcolor:`${ROLE_COLORS[ticket.raisedByRole]??T.blue}12`, color:ROLE_COLORS[ticket.raisedByRole]??T.blue, fontWeight:700 }}/>
                  <Typography sx={{ fontSize:11.5, color:T.muted }}>{timeAgo(ticket.createdAt)}</Typography>
                </Box>
                <Box sx={{ p:2, borderRadius:'12px', bgcolor:T.light, border:`1px solid ${T.border}` }}>
                  <Typography sx={{ fontSize:13.5, color:T.ink, lineHeight:1.7, whiteSpace:'pre-wrap' }}>{ticket.description}</Typography>
                </Box>
              </Box>
            </Box>

            {/* Comments */}
            {ticket.comments.map(c=>(
              <Box key={c.id} sx={{ display:'flex', gap:1.75, mb:2.5 }}>
                <Avatar sx={{ width:28, height:28, bgcolor:avatarBg(c.authorName), fontSize:10, fontWeight:700, flexShrink:0, mt:0.25 }}>
                  {initials(c.authorName)}
                </Avatar>
                <Box flex={1}>
                  <Box display="flex" alignItems="center" gap={1} mb={0.6}>
                    <Typography sx={{ fontWeight:700, fontSize:12.5, color:T.ink }}>{c.authorName}</Typography>
                    <Chip label={c.authorRole.replace(/_/g,' ')} size="small"
                      sx={{ fontSize:9, height:17, bgcolor:`${ROLE_COLORS[c.authorRole]??T.blue}12`, color:ROLE_COLORS[c.authorRole]??T.blue, fontWeight:700 }}/>
                    {c.isInternal && <Chip label="Internal Note" size="small" sx={{ fontSize:9, height:17, bgcolor:'#FFFBEB', color:'#D97706', fontWeight:700 }}/>}
                    <Typography sx={{ fontSize:11, color:T.muted }}>{timeAgo(c.createdAt)}</Typography>
                  </Box>
                  <Box sx={{ p:1.75, borderRadius:'10px',
                    bgcolor: c.isInternal ? '#FFFDE7' : T.surface,
                    border: `1px solid ${c.isInternal ? '#FDE68A' : T.border}`,
                  }}>
                    <Typography sx={{ fontSize:13, color:T.ink, lineHeight:1.65 }}>{c.content}</Typography>
                  </Box>
                </Box>
              </Box>
            ))}
            <div ref={bottomRef}/>
          </Box>
        )}

        {/* ── Details tab ── */}
        {activeTab === 1 && (
          <Box>
            {[
              ['Ticket #',     ticket.ticketNumber],
              ['Category',     `${cMeta.icon} ${cMeta.label}`],
              ['Routed To',    cMeta.dept],
              ['Raised By',    `${ticket.raisedByName} (${ticket.raisedByRole.replace(/_/g,' ')})`],
              ['Assigned To',  ticket.assignedToName ? `${ticket.assignedToName} (${ticket.assignedToRole?.replace(/_/g,' ')})` : '— Unassigned'],
              ['Created',      fmtDate(ticket.createdAt)],
              ['Last Updated', fmtDate(ticket.updatedAt)],
              ['Resolved',     ticket.resolvedAt ? fmtDate(ticket.resolvedAt) : '—'],
              ['SLA Breached', ticket.slaBreached ? '⚠ Yes' : 'No'],
            ].map(([k,v])=>(
              <Box key={k} display="flex" justifyContent="space-between" py={1.25} sx={{ borderBottom:`1px solid ${T.border}` }}>
                <Typography sx={{ fontSize:12.5, color:T.slate, fontWeight:600 }}>{k}</Typography>
                <Typography sx={{ fontSize:12.5, color:T.ink, textAlign:'right', maxWidth:'60%' }}>{v}</Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* ── Activity tab ── */}
        {activeTab === 2 && (
          <Box>
            {[...ticket.activity].reverse().map((a, i)=>(
              <Box key={a.id} display="flex" gap={1.5} mb={1.75}>
                <Box sx={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                  <Box sx={{ width:28, height:28, borderRadius:'50%', bgcolor:T.light, border:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {a.action==='CREATED' && <SupportAgentOutlined sx={{fontSize:13, color:T.blue}}/>}
                    {a.action==='STATUS_CHANGED' && <RefreshOutlined sx={{fontSize:13, color:T.amber}}/>}
                    {a.action==='ASSIGNED' && <AssignmentIndOutlined sx={{fontSize:13, color:T.indigo}}/>}
                    {a.action==='RESOLVED' && <CheckCircleOutlined sx={{fontSize:13, color:T.emerald}}/>}
                    {!['CREATED','STATUS_CHANGED','ASSIGNED','RESOLVED'].includes(a.action) && <NoteOutlined sx={{fontSize:13, color:T.slate}}/>}
                  </Box>
                  {i < ticket.activity.length-1 && <Box sx={{ width:1, flex:1, bgcolor:T.border, mt:0.5 }}/>}
                </Box>
                <Box pb={1.5}>
                  <Typography sx={{ fontSize:13, color:T.ink, fontWeight:500 }}>
                    <strong>{a.actorName}</strong>{' '}
                    {a.action === 'CREATED'        ? 'raised this ticket' :
                     a.action === 'STATUS_CHANGED' ? <>changed status from <Chip label={a.fromValue} size="small" sx={{fontSize:9,height:17,mx:0.4}}/> to <Chip label={a.toValue} size="small" sx={{fontSize:9,height:17,mx:0.4}}/></> :
                     a.action === 'RESOLVED'       ? 'resolved this ticket' :
                     a.action === 'ASSIGNED'       ? `assigned to ${a.toValue}` : a.action}
                  </Typography>
                  <Typography sx={{ fontSize:11.5, color:T.muted, mt:0.25 }}>{timeAgo(a.createdAt)}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Reply box */}
      {ticket.status !== 'CLOSED' && (
        <Box sx={{ borderTop:`1px solid ${T.border}`, p:2.5 }}>
          <TextField fullWidth multiline rows={3} size="small"
            placeholder={isInternal ? "Write an internal note (only visible to staff)…" : "Write a reply…"}
            value={comment} onChange={e=>setComment(e.target.value)}
            sx={{ ...Fs, mb:1.5,
              '& .MuiOutlinedInput-root':{ borderRadius:'12px', fontSize:13,
                bgcolor: isInternal ? '#FFFDE7' : T.surface,
                '& fieldset':{ borderColor: isInternal ? '#FDE68A' : T.border } } }}/>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={1}>
              <Switch size="small" checked={isInternal} onChange={e=>setIsInternal(e.target.checked)}
                sx={{ '& .Mui-checked + .MuiSwitch-track':{bgcolor:`${T.amber} !important`} }}/>
              <Typography sx={{ fontSize:12.5, color: isInternal ? T.amber : T.slate, fontWeight:600 }}>
                {isInternal ? 'Internal Note' : 'Public Reply'}
              </Typography>
            </Box>
            <Box display="flex" gap={1}>
              {/* Status actions based on role */}
              {canResolve && ticket.status === 'OPEN' && (
                <Button size="small" variant="outlined" onClick={()=>changeStatus('IN_PROGRESS')}
                  sx={{ textTransform:'none', fontSize:12, borderRadius:'8px', color:T.amber, borderColor:`${T.amber}50`, '&:hover':{bgcolor:`${T.amber}08`} }}>
                  Start Working
                </Button>
              )}
              {canResolve && ticket.status === 'IN_PROGRESS' && (
                <Button size="small" variant="outlined" onClick={()=>changeStatus('WAITING')}
                  sx={{ textTransform:'none', fontSize:12, borderRadius:'8px', color:T.indigo, borderColor:`${T.indigo}50` }}>
                  Waiting on Raiser
                </Button>
              )}
              {canResolve && ['OPEN','IN_PROGRESS','WAITING'].includes(ticket.status) && (
                <Button size="small" variant="contained" disableElevation onClick={()=>changeStatus('RESOLVED')}
                  startIcon={<CheckCircleOutlined sx={{fontSize:14}}/>}
                  sx={{ textTransform:'none', fontSize:12, borderRadius:'8px', bgcolor:T.emerald, fontWeight:700 }}>
                  Resolve
                </Button>
              )}
              {(isRaiser || userRole==='TENANT_ADMIN') && ticket.status === 'RESOLVED' && (
                <Button size="small" variant="contained" disableElevation onClick={()=>changeStatus('CLOSED')}
                  startIcon={<LockOutlined sx={{fontSize:14}}/>}
                  sx={{ textTransform:'none', fontSize:12, borderRadius:'8px', bgcolor:T.slate, fontWeight:700 }}>
                  Close
                </Button>
              )}
              <Button size="small" variant="contained" disableElevation
                startIcon={posting ? <CircularProgress size={12} color="inherit"/> : <SendOutlined sx={{fontSize:14}}/>}
                disabled={posting || !comment.trim()} onClick={postComment}
                sx={{ textTransform:'none', fontSize:12, borderRadius:'8px', bgcolor:T.blue, fontWeight:700 }}>
                {posting ? 'Posting…' : 'Post'}
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

// ── Ticket Row Card ───────────────────────────────────────────────────────────
const TicketCard: React.FC<{ ticket: Ticket; selected: boolean; onClick: ()=>void }> = ({ ticket, selected, onClick }) => {
  const sCfg = STATUS_CFG[ticket.status];
  const pCfg = PRIORITY_CFG[ticket.priority];
  const cMeta = CATEGORY_META[ticket.category];
  const unread = ticket.comments.filter(c=>!c.isInternal).length;

  return (
    <Box onClick={onClick} sx={{
      p:2, borderRadius:'14px', border:`1.5px solid ${selected ? T.blue : T.border}`,
      bgcolor: selected ? `${T.blue}05` : T.surface,
      cursor:'pointer', mb:1.25, transition:'all .15s',
      boxShadow: selected ? `0 0 0 3px ${T.blue}15` : '0 1px 4px rgba(10,15,30,0.04)',
      '&:hover':{ borderColor: selected ? T.blue : '#CBD5E1', bgcolor: selected ? `${T.blue}05` : '#FAFBFF' },
    }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={0.75}>
        <Box display="flex" alignItems="center" gap={0.75} flex={1} minWidth={0}>
          {ticket.slaBreached && <WarningAmberOutlined sx={{ fontSize:14, color:'#E11D48', flexShrink:0 }}/>}
          <Typography sx={{ fontWeight:700, fontSize:13.5, color:T.ink, lineHeight:1.3 }} noWrap>{ticket.subject}</Typography>
        </Box>
        <Box sx={{ px:1.25, py:0.25, borderRadius:'6px', bgcolor:pCfg.bg, flexShrink:0, ml:1 }}>
          <Typography sx={{ fontSize:10, fontWeight:700, color:pCfg.color }}>{ticket.priority}</Typography>
        </Box>
      </Box>

      <Box display="flex" alignItems="center" gap={1} mb={1.25} flexWrap="wrap">
        <Typography sx={{ fontFamily:'monospace', fontSize:11, color:T.muted }}>{ticket.ticketNumber}</Typography>
        <Box sx={{ width:3, height:3, borderRadius:'50%', bgcolor:T.border }}/>
        <Typography sx={{ fontSize:11.5, color:T.slate }}>{cMeta.icon} {cMeta.label}</Typography>
        <Box sx={{ width:3, height:3, borderRadius:'50%', bgcolor:T.border }}/>
        <Typography sx={{ fontSize:11.5, color:T.slate }}>→ {ticket.targetDept}</Typography>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar sx={{ width:20, height:20, bgcolor:avatarBg(ticket.raisedByName), fontSize:9, fontWeight:700 }}>
            {initials(ticket.raisedByName)}
          </Avatar>
          <Typography sx={{ fontSize:11.5, color:T.slate }}>{ticket.raisedByName}</Typography>
          <Typography sx={{ fontSize:11, color:T.muted }}>· {timeAgo(ticket.createdAt)}</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={0.75}>
          {unread > 0 && (
            <Box sx={{ px:1, py:0.25, borderRadius:'20px', bgcolor:`${T.blue}12`, display:'flex', alignItems:'center', gap:0.4 }}>
              <ReplyOutlined sx={{ fontSize:11, color:T.blue }}/>
              <Typography sx={{ fontSize:10.5, fontWeight:700, color:T.blue }}>{unread}</Typography>
            </Box>
          )}
          <Box sx={{ px:1.25, py:0.3, borderRadius:'6px', bgcolor:sCfg.bg, display:'flex', alignItems:'center', gap:0.4 }}>
            <Box sx={{ color:sCfg.color, display:'flex' }}>{sCfg.icon}</Box>
            <Typography sx={{ fontSize:10.5, fontWeight:700, color:sCfg.color }}>{sCfg.label}</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
const TicketsPage: React.FC = () => {
  const userRole = (localStorage.getItem('role') ?? 'AGENT') as string;
  const userId   = localStorage.getItem('userId') ?? 'me';

  const [tickets,    setTickets]    = useState<Ticket[]>([]);
  const [selected,   setSelected]   = useState<Ticket | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [newOpen,    setNewOpen]    = useState(false);
  const [search,     setSearch]     = useState('');
  const [statusF,    setStatusF]    = useState<TicketStatus | 'ALL'>('ALL');
  const [priorityF,  setPriorityF]  = useState<TicketPriority | 'ALL'>('ALL');
  const [categoryF,  setCategoryF]  = useState<TicketCategory | 'ALL'>('ALL');
  const [viewMode,   setViewMode]   = useState<'all'|'mine'|'assigned'>('all');

  useEffect(() => {
    const loadTickets = async () => {
      setLoading(true);
      try {
        const res = await api.get('/tickets');
        setTickets(res.data?.data ?? res.data ?? []);
      } catch {
        setTickets(MOCK);
      } finally {
        setLoading(false);
      }
    };

    void loadTickets();
  }, []);

  const filtered = useMemo(()=>{
    let list = [...tickets];
    if (viewMode === 'mine')     list = list.filter(t=>t.raisedById===userId);
    if (viewMode === 'assigned') list = list.filter(t=>t.assignedToId===userId);
    if (statusF   !== 'ALL')     list = list.filter(t=>t.status===statusF);
    if (priorityF !== 'ALL')     list = list.filter(t=>t.priority===priorityF);
    if (categoryF !== 'ALL')     list = list.filter(t=>t.category===categoryF);
    if (search)                  list = list.filter(t=>
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.raisedByName.toLowerCase().includes(search.toLowerCase())
    );
    return list.sort((a,b)=>{
      const p = {CRITICAL:0,HIGH:1,MEDIUM:2,LOW:3};
      return (p[a.priority]-p[b.priority]) || (new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());
    });
  },[tickets,viewMode,statusF,priorityF,categoryF,search,userId]);

  const updateTicket = useCallback((id: string, updates: Partial<Ticket>)=>{
    setTickets(ts => ts.map(t=> t.id===id ? { ...t, ...updates } : t));
    setSelected(s => s?.id===id ? { ...s, ...updates } : s);
  },[]);

  const addTicket = useCallback((t: Ticket)=>{
    setTickets(ts=>[t,...ts]);
    setSelected(t);
  },[]);

  // Stats
  const stats = useMemo(()=>({
    open:       tickets.filter(t=>t.status==='OPEN').length,
    inProgress: tickets.filter(t=>t.status==='IN_PROGRESS').length,
    resolved:   tickets.filter(t=>t.status==='RESOLVED').length,
    critical:   tickets.filter(t=>t.priority==='CRITICAL'&&t.status!=='RESOLVED'&&t.status!=='CLOSED').length,
  }),[tickets]);

  const Sel = ({ options, value, onChange, label }: any) => (
    <FormControl size="small" sx={{ minWidth:130 }}>
      <InputLabel sx={{ fontSize:12.5, color:T.slate }}>{label}</InputLabel>
      <Select value={value} label={label} onChange={e=>onChange(e.target.value)}
        sx={{ borderRadius:'10px', fontSize:13, '& fieldset':{borderColor:T.border}, bgcolor:T.surface }}>
        {options.map(([v,l]: [string,string])=>
          <MenuItem key={v} value={v} sx={{ fontSize:12.5 }}>{l}</MenuItem>
        )}
      </Select>
    </FormControl>
  );

  return (
    <Box sx={{ height:'calc(100vh - 120px)', display:'flex', flexDirection:'column' }}>

      {/* ── Page header ── */}
      <Box sx={{ mb:3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box>
            <Typography sx={{ fontWeight:800, fontSize:22, color:T.ink, letterSpacing:-0.5 }}>Support Tickets</Typography>
            <Typography sx={{ fontSize:13.5, color:T.slate, mt:0.25 }}>
              Internal issue tracking · {tickets.length} total tickets
            </Typography>
          </Box>
          <Button variant="contained" disableElevation startIcon={<AddOutlined/>} onClick={()=>setNewOpen(true)}
            sx={{ bgcolor:T.blue, textTransform:'none', fontWeight:700, borderRadius:'11px', px:2.5, fontSize:13.5 }}>
            Raise Ticket
          </Button>
        </Box>

        {/* Stats row */}
        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          {[
            { label:'Open',        value:stats.open,       color:T.blue,    bg:'#EFF6FF' },
            { label:'In Progress', value:stats.inProgress, color:T.amber,   bg:'#FFFBEB' },
            { label:'Resolved',    value:stats.resolved,   color:T.emerald, bg:'#ECFDF5' },
            { label:'Critical',    value:stats.critical,   color:'#E11D48', bg:'#FFF1F2' },
          ].map(s=>(
            <Box key={s.label} sx={{ px:2.5, py:1.5, borderRadius:'12px', border:`1px solid ${s.color}25`, bgcolor:s.bg, display:'flex', alignItems:'center', gap:1.5, minWidth:110 }}>
              <Box>
                <Typography sx={{ fontSize:22, fontWeight:800, color:s.color, lineHeight:1 }}>{s.value}</Typography>
                <Typography sx={{ fontSize:11.5, color:s.color, fontWeight:600, opacity:0.75 }}>{s.label}</Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Filters row */}
        <Box display="flex" gap={1.5} flexWrap="wrap" alignItems="center">
          <TextField size="small" placeholder="Search tickets…" value={search} onChange={e=>setSearch(e.target.value)}
            InputProps={{ startAdornment:<InputAdornment position="start"><SearchOutlined sx={{fontSize:17, color:T.muted}}/></InputAdornment>,
              sx:{ borderRadius:'10px', fontSize:13, bgcolor:T.surface, '& fieldset':{borderColor:T.border}, width:220 } }}/>

          <Sel label="Status"   value={statusF}   onChange={setStatusF}
            options={[['ALL','All Status'],['OPEN','Open'],['IN_PROGRESS','In Progress'],['WAITING','Waiting'],['RESOLVED','Resolved'],['CLOSED','Closed']]}/>
          <Sel label="Priority" value={priorityF} onChange={setPriorityF}
            options={[['ALL','All Priority'],['CRITICAL','Critical'],['HIGH','High'],['MEDIUM','Medium'],['LOW','Low']]}/>
          <Sel label="Category" value={categoryF} onChange={setCategoryF}
            options={[['ALL','All Categories'],...Object.entries(CATEGORY_META).map(([k,v])=>[k,`${v.icon} ${v.label}`])]}/>

          {/* View mode toggle */}
          <Box display="flex" gap={0.5} sx={{ ml:'auto', bgcolor:T.light, borderRadius:'10px', p:0.5, border:`1px solid ${T.border}` }}>
            {([['all','All'],['mine','My Tickets'],['assigned','Assigned to Me']] as const).map(([v,l])=>(
              <Box key={v} component="button" onClick={()=>setViewMode(v)}
                sx={{ px:1.75, py:0.7, borderRadius:'8px', border:'none', cursor:'pointer', fontSize:12, fontWeight:600,
                  bgcolor: viewMode===v ? T.surface : 'transparent',
                  color:   viewMode===v ? T.ink : T.slate,
                  boxShadow: viewMode===v ? '0 1px 4px rgba(10,15,30,0.08)' : 'none',
                  transition:'all .15s',
                }}>{l}</Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ── Split panel layout ── */}
      <Box sx={{ flex:1, display:'flex', gap:2.5, minHeight:0 }}>

        {/* Left: ticket list */}
        <Box sx={{
          width: selected ? 380 : '100%', flexShrink:0,
          overflowY:'auto', transition:'width .2s ease',
          pr: selected ? 0.5 : 0,
        }}>
          {loading ? (
            <Box display="flex" justifyContent="center" pt={6}>
              <CircularProgress size={28} sx={{ color:T.blue }}/>
            </Box>
          ) : filtered.length === 0 ? (
            <Box sx={{ textAlign:'center', py:8 }}>
              <SupportAgentOutlined sx={{ fontSize:48, color:T.border, mb:2 }}/>
              <Typography sx={{ color:T.slate, fontSize:14, fontWeight:600 }}>No tickets found</Typography>
              <Typography sx={{ color:T.muted, fontSize:13, mt:0.5 }}>Try adjusting your filters</Typography>
            </Box>
          ) : filtered.map(ticket=>(
            <TicketCard key={ticket.id} ticket={ticket} selected={selected?.id===ticket.id}
              onClick={()=>setSelected(s=>s?.id===ticket.id?null:ticket)}/>
          ))}
        </Box>

        {/* Right: detail panel */}
        {selected && (
          <Box sx={{
            flex:1, minWidth:0,
            borderRadius:'18px', border:`1px solid ${T.border}`,
            bgcolor:T.surface,
            boxShadow:'0 4px 24px rgba(10,15,30,0.07)',
            display:'flex', flexDirection:'column', overflow:'hidden',
            height:'100%',
          }}>
            <TicketDetail
              ticket={selected} userRole={userRole} userId={userId}
              onUpdate={updateTicket} onClose={()=>setSelected(null)}/>
          </Box>
        )}
      </Box>

      <NewTicketDialog open={newOpen} onClose={()=>setNewOpen(false)} userRole={userRole} onCreated={addTicket}/>
    </Box>
  );
};

export default TicketsPage;