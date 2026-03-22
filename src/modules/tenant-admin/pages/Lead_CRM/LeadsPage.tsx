import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  Box, Typography, Stack, Button, Grid, Chip, IconButton,
  CircularProgress, Paper, Tab, Tabs, TextField, InputAdornment,
  FormControl, InputLabel, Select, MenuItem, Divider, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert,
  Collapse, Tooltip, Badge, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, LinearProgress,
  TablePagination
} from '@mui/material';
import {
  AddOutlined, SearchOutlined, FilterListOutlined, DownloadOutlined,
  UploadOutlined, PersonAddOutlined, RefreshOutlined, TableRowsOutlined,
  ViewKanbanOutlined, BarChartOutlined, CloseOutlined,
  CheckCircleOutlined, WarningAmberOutlined, AttachMoneyOutlined,
  VisibilityOutlined, EditOutlined, DeleteOutlineOutlined,
  AutorenewOutlined, PeopleOutlined, SwapHorizOutlined,
  AccessTimeOutlined
} from '@mui/icons-material';
import {
  Lead, Agent, LeadStatus, LeadPriority, SourceChannel, AgentStats,
  PIPELINE_STAGES, STAGE_MAP, PRIORITY_CFG, SOURCE_CFG,
  avatarColor, initials, fmtBudget, timeAgo, scoreColor
} from './crmTypes';
import PipelineBoard from './PipelineBoard';
import LeadDetailPanel from './LeadDetailPanel';
import LeadFormDialog from './LeadFormDialog';
import LeadAnalytics from './LeadAnalytics';
import api from '../../../../api/axios';

// ─── Assign Dialog ────────────────────────────────────────────────────────────
const AssignDialog = ({
  lead, agents, open, onClose, onSave,
}: { lead: Lead | null; agents: Agent[]; open: boolean; onClose: () => void; onSave: () => void }) => {
  const [agentId, setAgentId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (open) setAgentId(lead?.ownerAgent?.id ?? ''); }, [open]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (!lead?.id) return alert('Lead not found');
      // Removed strict !agentId check to allow unassignment (empty string)
      await api.post('/leads/assign', { leadId: lead.id, agentId: agentId || null });
      onSave(); onClose();
    } catch (e) { 
      console.error(e);
      alert('Failed to assign lead. Please try again.');
    }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between' }}>
        {lead?.ownerAgent ? 'Reassign Lead' : 'Assign Lead'}
        <IconButton size="small" onClick={onClose}><CloseOutlined /></IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {lead?.ownerAgent && (
            <Paper sx={{ p: 2, borderRadius: 3, bgcolor: '#fef3c7' }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary">Currently assigned to</Typography>
              <Typography variant="body2" fontWeight={800}>{lead.ownerAgent.name}</Typography>
            </Paper>
          )}
          <FormControl fullWidth size="small">
            <InputLabel>Select Agent *</InputLabel>
            <Select value={agentId} label="Select Agent *" onChange={e => setAgentId(e.target.value)}>
              <MenuItem value=""><em>Unassign</em></MenuItem>
              {agents.map(a => (
                <MenuItem key={a.id} value={a.id}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar src={a.avatarUrl} sx={{ width: 28, height: 28, fontSize: 11, bgcolor: avatarColor(a.name), fontWeight: 800 }}>
                      {initials(a.name)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={700}>{a.name}</Typography>
                      {a.role && <Typography variant="caption" color="text.secondary">{typeof a.role === 'string' ? a.role : a.role.name}</Typography>}
                    </Box>
                  </Stack>
                </MenuItem>
              ))}
              {lead?.ownerAgent && !agents.find(a => a.id === lead.ownerAgent?.id) && (
                <MenuItem value={lead.ownerAgent.id}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar src={lead.ownerAgent.avatarUrl} sx={{ width: 28, height: 28, fontSize: 11, bgcolor: avatarColor(lead.ownerAgent.name), fontWeight: 800 }}>
                      {initials(lead.ownerAgent.name)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={700}>{lead.ownerAgent.name} (Current)</Typography>
                      <Typography variant="caption" color="text.secondary">Currently assigned</Typography>
                    </Box>
                  </Stack>
                </MenuItem>
              )}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none' }}>Cancel</Button>
        <Button variant="contained" disableElevation onClick={handleSave} disabled={saving}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
          {saving ? <CircularProgress size={18} color="inherit" /> : 'Assign'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── CSV Import Dialog ────────────────────────────────────────────────────────
const ImportDialog = ({
  open, onClose, onSave,
}: { open: boolean; onClose: () => void; onSave: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      const lines = text.split('\n').slice(0, 6);
      setPreview(lines.map(l => l.split(',')));
    };
    reader.readAsText(f);
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      await api.post('/leads/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setDone(true); onSave();
      setTimeout(onClose, 1500);
    } catch (e) { console.error(e); }
    finally { setImporting(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between' }}>
        Import Leads from CSV
        <IconButton size="small" onClick={onClose}><CloseOutlined /></IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            CSV must have columns: <strong>name, phone, email, source, project, budget</strong>
          </Alert>
          <Box
            sx={{
              border: '2px dashed', borderColor: file ? 'primary.main' : 'divider',
              borderRadius: 3, p: 4, textAlign: 'center', cursor: 'pointer', bgcolor: file ? 'primary.50' : 'grey.50',
              transition: 'all .15s',
              '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.50' }
            }}
            onClick={() => fileRef.current?.click()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            onDragOver={e => e.preventDefault()}>
            <input ref={fileRef} type="file" accept=".csv" hidden onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            <Typography fontSize={36} mb={1}>📂</Typography>
            <Typography variant="body2" fontWeight={700}>
              {file ? file.name : 'Drop CSV here or click to browse'}
            </Typography>
            <Typography variant="caption" color="text.secondary">Supports .csv files up to 5MB</Typography>
          </Box>
          {preview.length > 0 && (
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Preview (first 5 rows)
              </Typography>
              <Box sx={{ mt: 1, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                {preview.slice(0, 5).map((row, i) => (
                  <Box key={i} sx={{ px: 2, py: 1, bgcolor: i === 0 ? 'grey.100' : 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" fontFamily="monospace">{row.join(' | ')}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
          <Collapse in={done}>
            <Alert severity="success" sx={{ borderRadius: 3 }}>Leads imported successfully! ✅</Alert>
          </Collapse>
        </Stack>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none' }}>Cancel</Button>
        <Button variant="contained" disableElevation onClick={handleImport}
          disabled={!file || importing || done}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
          {importing ? <CircularProgress size={18} color="inherit" /> : 'Import Leads'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
// ─── Agent Profile Dialog ─────────────────────────────────────────────────────
const AgentProfileDialog = ({
  agent, open, onClose
}: { agent: Agent | null; open: boolean; onClose: () => void }) => {
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && agent) {
      setLoading(true);
      api.get(`/leads/agent-stats/${agent.id}`)
        .then(r => setStats(r.data.data ?? r.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [open, agent]);

  if (!agent) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Agent Performance <IconButton size="small" onClick={onClose}><CloseOutlined /></IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Stack spacing={3} sx={{ py: 1 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={agent.avatarUrl} sx={{ width: 64, height: 64, bgcolor: avatarColor(agent.name), fontSize: 24, fontWeight: 900 }}>
              {initials(agent.name)}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={900}>{agent.name}</Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                {typeof agent.role === 'string' ? agent.role : agent.role?.name || 'Agent'}
              </Typography>
            </Box>
          </Stack>

          {loading ? (
            <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress size={24} /></Box>
          ) : stats ? (
            <Grid container spacing={2}>
              {[
                { label: 'Total Leads', value: stats.totalLeads, icon: <CheckCircleOutlined />, color: '#6366f1' },
                { label: 'Conversion', value: `${stats.conversionRate}%`, icon: <CheckCircleOutlined />, color: '#10b981' },
                { label: 'Hot Leads', value: stats.hotLeads, icon: <CheckCircleOutlined />, color: '#ef4444' },
                { label: 'Completed', value: stats.completedFollowUps, icon: <CheckCircleOutlined />, color: '#8b5cf6' },
              ].map(item => (
                <Grid item xs={6} key={item.label}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, textAlign: 'center', height: '100%', borderColor: item.color + '33', bgcolor: item.color + '08' }}>
                    <Typography variant="h5" fontWeight={900}>{item.value}</Typography>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">{item.label}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : <Alert severity="error">Failed to load stats</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button fullWidth variant="contained" disableElevation onClick={onClose} sx={{ borderRadius: 2, fontWeight: 700 }}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Assign Stage Button ──────────────────────────────────────────────────────
const StageChanger = ({ lead, onUpdate }: { lead: Lead; onUpdate: () => void }) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const stageCfg = STAGE_MAP[lead.status] || { label: lead.status, icon: '❓', color: '#888', bg: '#f5f5f5' };

  const changeStage = async (newStatus: LeadStatus) => {
    setSaving(true);
    try {
      await api.put(`/leads/${lead.id}`, { status: newStatus });
      onUpdate();
    } catch (e) { console.error(e); }
    finally { setSaving(false); setOpen(false); }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Chip
        label={`${stageCfg?.icon ?? '❓'} ${stageCfg?.label ?? lead.status}`}
        onClick={() => setOpen(v => !v)}
        deleteIcon={<SwapHorizOutlined sx={{ fontSize: '16px !important' }} />}
        onDelete={() => setOpen(v => !v)}
        sx={{
          fontWeight: 800, bgcolor: stageCfg.bg, color: stageCfg.color, cursor: 'pointer',
          '& .MuiChip-deleteIcon': { color: stageCfg.color }
        }}
      />
      {open && (
        <Paper sx={{ position: 'absolute', top: '110%', left: 0, zIndex: 100, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,.18)', minWidth: 200, p: 0.75 }}>
          {PIPELINE_STAGES.map(s => (
            <Box key={s.key}
              onClick={() => changeStage(s.key as LeadStatus)}
              sx={{
                px: 2, py: 1.25, borderRadius: 2, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1.5,
                bgcolor: lead.status === s.key ? s.bg : 'transparent',
                '&:hover': { bgcolor: s.bg },
              }}>
              <span>{s.icon}</span>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color }} />
              <Typography variant="body2" fontWeight={700} sx={{ color: s.color }}>{s.label}</Typography>
              {lead.status === s.key && <CheckCircleOutlined sx={{ fontSize: 14, color: s.color, ml: 'auto' }} />}
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  );
};

// ─── Table View ───────────────────────────────────────────────────────────────
const LeadsTable = ({
  leads, onView, onAssign, onEdit, onDelete, onAgentClick, onStageUpdate
}: {
  leads: Lead[];
  onView: (l: Lead) => void;
  onAssign: (l: Lead) => void;
  onEdit: (l: Lead) => void;
  onDelete: (l: Lead) => void;
  onAgentClick: (a: Agent) => void;
  onStageUpdate: () => void;
}) => (
  <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            {['Customer', 'Contact', 'Budget', 'Project / Type', 'Source', 'Stage', 'Priority', 'Agent', 'Created', 'Actions'].map(h => (
              <TableCell key={h} sx={{ fontWeight: 800, fontSize: 11, py: 1.5 }} align={h === 'Actions' ? 'right' : 'left'}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                No leads match your filters
              </TableCell>
            </TableRow>
          ) : leads.map(lead => {
            const stage = STAGE_MAP[lead.status] || { label: lead.status, icon: '❓', color: '#888', bg: '#f5f5f5' };
            const priority = PRIORITY_CFG[lead.priority];
            const src = SOURCE_CFG[lead.sourceChannel];
            return (
              <TableRow key={lead.id} hover sx={{ '& td': { py: 1.25 } }}>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar 
                      src={lead.photoUrl}
                      sx={{ width: 32, height: 32, bgcolor: avatarColor(lead.customerName), fontSize: 11, fontWeight: 900 }}>
                      {initials(lead.customerName)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={800}>{lead.customerName}</Typography>
                      {(lead.tags ?? []).length > 0 && (
                        <Chip label={lead.tags![0]} size="small"
                          sx={{ fontSize: 8, height: 14, fontWeight: 700 }} />
                      )}
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{lead.customerPhone}</Typography>
                  {lead.customerEmail && <Typography variant="caption" color="text.secondary">{lead.customerEmail}</Typography>}
                </TableCell>
                <TableCell>
                  {lead.budget ? (
                    <Typography variant="body2" fontWeight={800} color="primary">{fmtBudget(lead.budget)}</Typography>
                  ) : <Typography variant="caption" color="text.secondary">—</Typography>}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{lead.preferredProject || '—'}</Typography>
                  {lead.preferredUnitType && <Chip label={lead.preferredUnitType} size="small" sx={{ fontSize: 9, height: 16, mt: 0.25 }} />}
                </TableCell>
                <TableCell>
                  <Chip label={`${src?.icon} ${src?.label ?? lead.sourceChannel}`} size="small"
                    sx={{ fontSize: 9, height: 20, fontWeight: 700, bgcolor: (src?.color ?? '#888') + '18', color: src?.color ?? '#888' }} />
                </TableCell>
                <TableCell>
                  <StageChanger lead={lead} onUpdate={onStageUpdate} />
                </TableCell>
                <TableCell>
                  <Chip label={`${priority.icon} ${priority.label}`} size="small"
                    sx={{ fontSize: 9, height: 20, fontWeight: 800, bgcolor: priority.bg, color: priority.color }} />
                </TableCell>
                <TableCell>
                  {lead.ownerAgent ? (
                    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ cursor: 'pointer' }} onClick={() => onAgentClick(lead.ownerAgent!)}>
                      <Avatar src={lead.ownerAgent.avatarUrl} sx={{ width: 22, height: 22, fontSize: 9, bgcolor: avatarColor(lead.ownerAgent.name), fontWeight: 800 }}>
                        {initials(lead.ownerAgent.name)}
                      </Avatar>
                      <Typography variant="caption" fontWeight={700} sx={{ textDecoration: 'underline', color: 'primary.main' }}>
                        {lead.ownerAgent.name}
                      </Typography>
                    </Stack>
                  ) : (
                    <Chip label="Unassigned" size="small"
                      sx={{ fontSize: 9, height: 18, bgcolor: '#fef3c7', color: '#92400e', fontWeight: 700 }} />
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">{timeAgo(lead.createdAt)}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" justifyContent="flex-end">
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => onView(lead)}><VisibilityOutlined sx={{ fontSize: 15 }} /></IconButton>
                    </Tooltip>
                    <Tooltip title={lead.ownerAgent ? 'Reassign' : 'Assign'}>
                      <IconButton size="small" onClick={() => onAssign(lead)}><PersonAddOutlined sx={{ fontSize: 15 }} /></IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => onEdit(lead)}><EditOutlined sx={{ fontSize: 15 }} /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => onDelete(lead)} sx={{ color: 'error.main' }}>
                        <DeleteOutlineOutlined sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  </Paper>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [mainTab, setMainTab] = useState(0); // 0=table 1=pipeline 2=analytics
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalLeads, setTotalLeads] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [agentFilter, setAgentFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL'); // ALL, WEEK, MONTH, YEAR, CUSTOM
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [viewLeadId, setViewLeadId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [assignLead, setAssignLead] = useState<Lead | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [agentStatsOpen, setAgentStatsOpen] = useState(false);

  const handleAgentClick = (agent: Agent) => {
    setSelectedAgent(agent);
    setAgentStatsOpen(true);
  };

  const fetchData = async () => {
    try {
      const [lRes, aRes] = await Promise.all([
        api.get('/leads', { 
          params: { 
            page: page + 1, 
            limit: rowsPerPage,
            search: search,
            status: statusFilter !== 'ALL' ? statusFilter : undefined,
            agentId: agentFilter !== 'ALL' && agentFilter !== 'UNASSIGNED' ? agentFilter : undefined
          } 
        }),
        api.get('/users'),
      ]);
      setLeads(lRes.data?.data ?? lRes.data ?? []);
      setTotalLeads(lRes.data?.meta?.totalCount ?? lRes.data?.meta?.total ?? lRes.data?.length ?? 0);
      const usersData = aRes.data?.data ?? aRes.data ?? [];
      setAgents(usersData.filter((u: any) => ['AGENT', 'SALES_MANAGER', 'TENANT_ADMIN'].includes(u.role?.name || u.role)));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, rowsPerPage, statusFilter, agentFilter]);

  const handleDelete = async (lead: Lead) => {
    if (!window.confirm(`Delete lead for ${lead.customerName}?`)) return;
    try { await api.delete(`/leads/${lead.id}`); fetchData(); }
    catch (e) { console.error(e); }
  };

  const handleExport = () => {
    const headers = ['Name', 'Phone', 'Email', 'Budget', 'Project', 'Source', 'Stage', 'Priority', 'Agent', 'Created'];
    const rows = filteredLeads.map(l => [
      l.customerName, l.customerPhone, l.customerEmail ?? '',
      l.budget ?? '', l.preferredProject ?? '', l.sourceChannel,
      l.status, l.priority, l.ownerAgent?.name ?? '', l.createdAt,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'leads.csv'; a.click();
  };

  const filteredLeads = useMemo(() => leads.filter(l => {
    const q = search.toLowerCase();
    const matchQ = !q || l.customerName.toLowerCase().includes(q) ||
      l.customerPhone.includes(q) || (l.customerEmail ?? '').toLowerCase().includes(q) ||
      (l.preferredProject ?? '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'ALL' || l.status === statusFilter;
    const matchSource = sourceFilter === 'ALL' || l.sourceChannel === sourceFilter;
    const matchAgent = agentFilter === 'ALL' ? true : agentFilter === 'UNASSIGNED' ? !l.ownerAgent : l.ownerAgent?.id === agentFilter;
    const matchPriority = priorityFilter === 'ALL' || l.priority === priorityFilter;

    // Date filtering
    if (dateFilter === 'ALL') return matchQ && matchStatus && matchSource && matchAgent && matchPriority;

    const leadDate = new Date(l.createdAt);
    const now = new Date();
    let matchDate = false;

    if (dateFilter === 'WEEK') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchDate = leadDate >= weekAgo;
    } else if (dateFilter === 'MONTH') {
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      matchDate = leadDate >= monthAgo;
    } else if (dateFilter === 'YEAR') {
      const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      matchDate = leadDate >= yearAgo;
    } else if (dateFilter === 'CUSTOM' && dateRange.start && dateRange.end) {
      matchDate = leadDate >= new Date(dateRange.start) && leadDate <= new Date(dateRange.end);
    }

    return matchQ && matchStatus && matchSource && matchAgent && matchPriority && matchDate;
  }), [leads, search, statusFilter, sourceFilter, agentFilter, priorityFilter, dateFilter, dateRange]);

  const unassignedCount = leads.filter(l => !l.ownerAgent).length;
  const hotCount = leads.filter(l => l.priority === 'HOT').length;
  const overdueCount = leads.filter(l =>
    (l.followUps ?? []).some(f => f.status === 'PENDING' && new Date(f.scheduledAt) < new Date())
  ).length;

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      {/* Main content */}
      <Box sx={{ flex: 1, p: { xs: 2, md: 4 }, overflowY: 'auto', minWidth: 0 }}>
        {/* Header */}
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} mb={3} spacing={2}>
          <Box>
            <Typography variant="h3" fontWeight={900} letterSpacing={-1.5} sx={{ fontFamily: '"Playfair Display", serif' }}>
              Lead CRM
            </Typography>
            <Typography variant="body1" color="text.secondary" mt={0.5}>
              {leads.length} leads · Pipeline management & analytics
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            <Button variant="outlined" startIcon={<UploadOutlined />}
              onClick={() => setImportOpen(true)}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 3 }}>Import CSV</Button>
            <Button variant="outlined" startIcon={<DownloadOutlined />}
              onClick={handleExport}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 3 }}>Export</Button>
            <Button variant="contained" disableElevation startIcon={<AddOutlined />}
              onClick={() => { setEditLead(null); setFormOpen(true); }}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 3 }}>Add Lead</Button>
          </Stack>
        </Stack>

        {/* Alert strip */}
        <Stack direction="row" spacing={1.5} mb={3} flexWrap="wrap">
          {unassignedCount > 0 && (
            <Chip icon={<WarningAmberOutlined sx={{ fontSize: '14px !important' }} />}
              label={`${unassignedCount} unassigned`} clickable
              onClick={() => setAgentFilter('UNASSIGNED')}
              sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 800, fontSize: 11 }} />
          )}
          {hotCount > 0 && (
            <Chip label={`🔥 ${hotCount} hot leads`} clickable
              onClick={() => setPriorityFilter('HOT')}
              sx={{ bgcolor: '#fee2e2', color: '#991b1b', fontWeight: 800, fontSize: 11 }} />
          )}
          {overdueCount > 0 && (
            <Chip icon={<AccessTimeOutlined sx={{ fontSize: '14px !important' }} />}
              label={`${overdueCount} overdue follow-ups`}
              sx={{ bgcolor: '#fee2e2', color: '#991b1b', fontWeight: 800, fontSize: 11 }} />
          )}
        </Stack>

        {/* View tabs */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
          <Tabs value={mainTab} onChange={(_, v) => setMainTab(v)}>
            <Tab icon={<TableRowsOutlined sx={{ fontSize: 18 }} />} iconPosition="start" label="Table"
              sx={{ textTransform: 'none', fontWeight: 700, fontSize: 13, minHeight: 42 }} />
            <Tab icon={<ViewKanbanOutlined sx={{ fontSize: 18 }} />} iconPosition="start" label="Pipeline"
              sx={{ textTransform: 'none', fontWeight: 700, fontSize: 13, minHeight: 42 }} />
            <Tab icon={<BarChartOutlined sx={{ fontSize: 18 }} />} iconPosition="start" label="Analytics"
              sx={{ textTransform: 'none', fontWeight: 700, fontSize: 13, minHeight: 42 }} />
          </Tabs>
          <IconButton onClick={fetchData} size="small"><RefreshOutlined /></IconButton>
        </Stack>

        {/* Filters (Table view only) */}
        {mainTab === 0 && (
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 2.5 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap">
              <TextField fullWidth placeholder="Search name, phone, email, project..."
                size="small" value={search} onChange={e => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small" /></InputAdornment>,
                  sx: { borderRadius: 2 }
                }} />
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Stage</InputLabel>
                <Select value={statusFilter} label="Stage" onChange={e => setStatusFilter(e.target.value)} sx={{ borderRadius: 2 }}>
                  <MenuItem value="ALL">All Stages</MenuItem>
                  {PIPELINE_STAGES.map(s => <MenuItem key={s.key} value={s.key}>{s.icon} {s.label}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel>Priority</InputLabel>
                <Select value={priorityFilter} label="Priority" onChange={e => setPriorityFilter(e.target.value)} sx={{ borderRadius: 2 }}>
                  <MenuItem value="ALL">All Priority</MenuItem>
                  {Object.entries(PRIORITY_CFG).map(([k, v]) => <MenuItem key={k} value={k}>{v.icon} {v.label}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel>Source</InputLabel>
                <Select value={sourceFilter} label="Source" onChange={e => setSourceFilter(e.target.value)} sx={{ borderRadius: 2 }}>
                  <MenuItem value="ALL">All Sources</MenuItem>
                  {Object.entries(SOURCE_CFG).map(([k, v]) => <MenuItem key={k} value={k}>{v.icon} {v.label}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Date</InputLabel>
                <Select value={dateFilter} label="Date" onChange={e => setDateFilter(e.target.value)} sx={{ borderRadius: 2 }}>
                  <MenuItem value="ALL">All Time</MenuItem>
                  <MenuItem value="WEEK">Past Week</MenuItem>
                  <MenuItem value="MONTH">Past Month</MenuItem>
                  <MenuItem value="YEAR">Past Year</MenuItem>
                  <MenuItem value="CUSTOM">Custom Range</MenuItem>
                </Select>
              </FormControl>

              {dateFilter === 'CUSTOM' && (
                <>
                  <TextField size="small" type="date" value={dateRange.start} onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                  <TextField size="small" type="date" value={dateRange.end} onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </>
              )}

              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Agent</InputLabel>
                <Select value={agentFilter} label="Agent" onChange={e => setAgentFilter(e.target.value)} sx={{ borderRadius: 2 }}>
                  <MenuItem value="ALL">All Agents</MenuItem>
                  <MenuItem value="UNASSIGNED">⚠ Unassigned</MenuItem>
                  {agents.map(a => <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>)}
                </Select>
              </FormControl>
              {(search || statusFilter !== 'ALL' || sourceFilter !== 'ALL' || agentFilter !== 'ALL' || priorityFilter !== 'ALL') && (
                <Button size="small" color="inherit" onClick={() => {
                  setSearch(''); setStatusFilter('ALL'); setSourceFilter('ALL'); setAgentFilter('ALL'); setPriorityFilter('ALL');
                }} sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}>Clear All</Button>
              )}
            </Stack>
          </Paper>
        )}

        {mainTab === 0 && (
          <>
            <Typography variant="body2" color="text.secondary" mb={1.5}>
              Showing <strong>{filteredLeads.length}</strong> of {leads.length} leads
            </Typography>
            <LeadsTable
              leads={filteredLeads}
              onView={l => setViewLeadId(l.id)}
              onAssign={l => setAssignLead(l)}
              onEdit={l => { setEditLead(l); setFormOpen(true); }}
              onDelete={handleDelete}
              onAgentClick={handleAgentClick}
              onStageUpdate={fetchData}
            />
            <TablePagination
              component="div"
              count={totalLeads}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={e => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 20, 50, 100]}
              sx={{ borderTop: '1px solid', borderColor: 'divider' }}
            />
          </>
        )}

        {mainTab === 1 && (
          <PipelineBoard
            leads={leads}
            onViewLead={l => setViewLeadId(l.id)}
            onAssignLead={l => setAssignLead(l)}
            onAddLead={() => { setEditLead(null); setFormOpen(true); }}
            onUpdate={fetchData}
          />
        )}

        {mainTab === 2 && <LeadAnalytics leads={leads} />}
      </Box>

      {/* Lead Detail Side Panel */}
      {viewLeadId && (
        <Box sx={{
          width: 480, flexShrink: 0, borderLeft: '1px solid', borderColor: 'divider',
          height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column',
          bgcolor: 'background.paper',
          boxShadow: '-4px 0 24px rgba(0,0,0,.06)',
        }}>
          <LeadDetailPanel
            leadId={viewLeadId}
            onClose={() => setViewLeadId(null)}
            onUpdate={fetchData}
            onEdit={l => { setEditLead(l); setFormOpen(true); }}
          />
        </Box>
      )}

      {/* Modals */}
      <LeadFormDialog
        open={formOpen} onClose={() => setFormOpen(false)}
        initial={editLead} agents={agents} onSave={fetchData}
        onView={id => setViewLeadId(id)}
      />
      <AssignDialog
        lead={assignLead} agents={agents} open={!!assignLead}
        onClose={() => setAssignLead(null)} onSave={fetchData}
      />
      <ImportDialog
        open={importOpen} onClose={() => setImportOpen(false)} onSave={fetchData}
      />
      <AgentProfileDialog
        agent={selectedAgent} open={agentStatsOpen}
        onClose={() => setAgentStatsOpen(false)}
      />
    </Box>
  );
};

export default LeadsPage;