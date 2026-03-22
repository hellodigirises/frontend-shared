import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Stack, Button, TextField, Chip,
  IconButton, Divider, Grid, Paper, FormControl,
  InputLabel, Select, MenuItem, Switch, FormControlLabel,
  InputAdornment, CircularProgress, Alert, Collapse,
  ToggleButtonGroup, ToggleButton, Tooltip, Avatar, Autocomplete,
  Checkbox
} from '@mui/material';
import {
  CloseOutlined, PersonOutlined, PhoneOutlined, EmailOutlined,
  AttachMoneyOutlined, ApartmentOutlined, LocationOnOutlined,
  WarningAmberOutlined, MergeOutlined, LocalFireDepartmentOutlined,
  EditOutlined
} from '@mui/icons-material';
import {
  Lead, Agent, SourceChannel, LeadPriority, LeadPurpose,
  SOURCE_CFG, PRIORITY_CFG, TAG_PRESETS, UNIT_TYPES, BUYING_TIMELINES,
  PIPELINE_STAGES, avatarColor, initials
} from './crmTypes';
import api from '../../../../api/axios';

const BLANK: Omit<Lead, 'id' | 'createdAt' | 'activities' | 'followUps' | 'documents'> = {
  customerName: '', customerPhone: '', customerEmail: '',
  budget: undefined, budgetMax: undefined,
  preferredProject: '', preferredUnitType: '', locationPreference: '',
  sourceChannel: 'MANUAL', status: 'NEW', priority: 'WARM',
  purpose: undefined, familySize: undefined, buyingTimeline: '',
  projectId: undefined, unitId: undefined,
  loanRequired: false, notes: '', tags: [], photoUrl: '',
};

interface Props {
  open: boolean;
  onClose: () => void;
  initial: any;
  agents?: Agent[];
  apiOverride?: any;
  onSave: () => void;
  onView?: (id: string) => void;
  isAgent?: boolean;
}

const C = {
  primary: '#F97316',
  border : 'rgba(0,0,0,0.12)',
  surface: '#FFFFFF',
  surfaceHi: '#F8FAFC'
};

const LeadFormDialog: React.FC<Props> = ({ open, onClose, onSave, initial, onView, isAgent, agents = [], apiOverride }) => {
  const activeApi = apiOverride || api;
  const [form, setForm] = useState({ ...BLANK, assignedAgentId: '' });
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [duplicate, setDuplicate] = useState<Lead | null>(null);
  const [checkingDup, setCheckingDup] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loadingInv, setLoadingInv] = useState(false);
  const [showAllUnits, setShowAllUnits] = useState(false);
  const [willingToBook, setWillingToBook] = useState(false);
  const isEdit = !!initial?.id;

  useEffect(() => {
    if (open) {
      setLoadingInv(true);
      const projectsUrl = '/inventory/projects?limit=1000';
      const unitsUrl = '/inventory/units?limit=1000';
      
      Promise.all([
        activeApi.get(projectsUrl).catch(() => ({ data: { data: [] } })),
        activeApi.get(unitsUrl).catch(() => ({ data: { data: [] } }))
      ]).then(([p, u]) => {
        const extractArray = (res: any) => {
          if (!res) return [];
          if (Array.isArray(res)) return res;
          if (Array.isArray(res.data)) return res.data;
          if (res.data && Array.isArray(res.data.data)) return res.data.data;
          if (res.data?.data && Array.isArray(res.data.data.data)) return res.data.data.data;
          return [];
        };
        setProjects(extractArray(p.data));
        setUnits(extractArray(u.data));
      }).finally(() => setLoadingInv(false));
    }
  }, [open, isAgent, activeApi]);

  useEffect(() => {
    if (open) {
      const data = { ...BLANK, assignedAgentId: initial?.ownerAgent?.id ?? '', ...(initial ?? {}) };
      console.log('FORM OPENED WITH DATA:', data);
      setForm(data);
      setDuplicate(null);
    }
  }, [open, initial]);

  const set = (k: string, v: any) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(prev => {
      const next = { ...prev };
      delete next[k];
      return next;
    });
  };

  // Duplicate check on phone change
  const checkDuplicate = async (phone: string) => {
    if (!phone || phone.length < 10 || isEdit) return;
    setCheckingDup(true);
    try {
      const r = await api.get(`/leads?phone=${phone}`);
      const leads = r.data?.data ?? r.data ?? [];
      const dup = leads.find((l: Lead) => l.customerPhone === phone);
      setDuplicate(dup ?? null);
    } catch { }
    finally { setCheckingDup(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    setErrors({});
    try {
        if (form.unitId) {
            const unit = units.find(u => u.id === form.unitId);
            if (unit && unit.status !== 'AVAILABLE' && !willingToBook) {
                setErrors({ unitId: 'Customer commitment required for Hold/Reserved units' });
                setSaving(false);
                return;
            }
        }

        if (isEdit) {
        // Sanitize payload: ONLY send fields allowed by UpdateLeadSchema
        const allowed = [
          'customerName', 'customerPhone', 'customerEmail', 'sourceChannel', 'status',
          'priority', 'budget', 'budgetMax', 'preferredProject', 'preferredUnitType',
          'locationPreference', 'purpose', 'familySize', 'buyingTimeline', 'loanRequired',
          'notes', 'tags', 'photoUrl', 'projectId', 'unitId', 'assignedAgentId', 'assignedToId'
        ];
        const payload: any = {};
        allowed.forEach(k => {
          const val = (form as any)[k];
          if (val !== undefined) {
            // Convert empty strings to null for optional non-string fields
            if (['budget', 'budgetMax', 'familySize', 'purpose'].includes(k) && val === '') {
              payload[k] = null;
            } else {
              payload[k] = val;
            }
          }
        });
        
        console.log('UPDATING LEAD WITH CLEAN PAYLOAD:', payload);
        const updateUrl = isAgent ? `/leads/${initial!.id}` : `/leads/${initial!.id}`;
        // Wait, if isAgent is true, and apiOverride is passed (pointing to /api/v1/agent), 
        // the final URL will be /api/v1/agent/leads/:id
        await activeApi.put(updateUrl, payload);
      } else {
        // Sanitize create payload too
        const payload: any = { ...form };
        ['budget', 'budgetMax', 'familySize', 'purpose'].forEach(k => {
          if (payload[k] === '') payload[k] = null;
        });

        const r = await activeApi.post('/leads', payload);
        if (form.assignedAgentId && !isAgent) {
          await activeApi.post('/leads/assign', { leadId: r.data.id ?? r.data.data?.id, agentId: form.assignedAgentId });
        }
      }
      onSave();
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onClose(); }, 1500);
    } catch (e: any) {
      console.error(e);
      if (e.response?.data?.details) {
        const errs: Record<string, string> = {};
        e.response.data.details.forEach((d: any) => { errs[d.field] = d.message; });
        setErrors(errs);
      } else if (e.response?.data?.error) {
        setErrors({ base: e.response.data.error });
      } else {
        setErrors({ base: 'Failed to save lead. Please check console.' });
      }
      // Temporary alert to catch the exact error for debugging
      const errorMsg = e.response?.data?.details 
        ? JSON.stringify(e.response.data.details) 
        : (e.response?.data?.error || e.message);
      window.alert('SAVE FAILED: ' + errorMsg);
    }
    finally { setSaving(false); }
  };

  const addTag = (tag: string) => {
    if (tag && !(form.tags ?? []).includes(tag)) {
      set('tags', [...(form.tags ?? []), tag]);
    }
    setTagInput('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return alert('File too large (max 2MB)');
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      set('photoUrl', ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Auto-compute score
  const computedScore = (() => {
    let s = 0;
    if (form.budget && form.budget >= 5000000) s += 25;
    else if (form.budget) s += 10;
    if (form.buyingTimeline === 'Immediate') s += 30;
    else if (form.buyingTimeline === '1-3 months') s += 20;
    else if (form.buyingTimeline === '3-6 months') s += 10;
    if (form.preferredProject) s += 15;
    if (form.preferredUnitType) s += 10;
    if (form.customerEmail) s += 10;
    if (form.purpose === 'SELF_USE') s += 10;
    return Math.min(s, 100);
  })();

  const scorePriority: LeadPriority = computedScore >= 60 ? 'HOT' : computedScore >= 30 ? 'WARM' : 'COLD';

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md"
      PaperProps={{ sx: { borderRadius: 4, maxHeight: '92vh' } }}>
      <DialogTitle sx={{
        fontWeight: 900, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: '"Playfair Display", serif', pb: 1
      }}>
        {isEdit ? `Edit Lead — ${initial?.customerName}` : 'Capture New Lead'}
        <IconButton size="small" onClick={onClose}><CloseOutlined /></IconButton>
      </DialogTitle>
      <Divider />

      <DialogContent sx={{ overflowY: 'auto' }}>
        <Stack spacing={3.5} sx={{ mt: 1.5 }}>
          {/* Duplicate Warning */}
          <Collapse in={!!duplicate}>
            <Alert
              severity="warning"
              icon={<WarningAmberOutlined />}
              action={
                <Stack direction="row" spacing={1}>
                  <Button size="small" startIcon={<MergeOutlined />}
                    onClick={() => { if (duplicate) onView(duplicate.id); onClose(); }}>
                    View Existing
                  </Button>
                  <Button size="small" color="inherit" onClick={() => setDuplicate(null)}>Ignore</Button>
                </Stack>
              }
              sx={{ borderRadius: 3 }}>
              <strong>Duplicate detected!</strong> A lead with this phone number already exists
              {duplicate?.customerName && ` — ${duplicate.customerName} (${duplicate.status})`}.
            </Alert>
          </Collapse>

          {/* Success Alert */}
          <Collapse in={success}>
            <Alert severity="success" sx={{ borderRadius: 3 }}>
              Lead {isEdit ? 'updated' : 'created'} successfully!
            </Alert>
          </Collapse>

          {/* Base Error Alert */}
          <Collapse in={!!errors.base}>
            <Alert severity="error" sx={{ borderRadius: 3 }}>
              {errors.base}
            </Alert>
          </Collapse>

          {/* ── Customer Info ── */}
          <Box>
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', mb: 2 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar src={form.photoUrl} sx={{ width: 80, height: 80, bgcolor: avatarColor(form.customerName), fontSize: 28, fontWeight: 900 }}>
                  {initials(form.customerName)}
                </Avatar>
                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
                <IconButton size="small" sx={{ position: 'absolute', bottom: -5, right: -5, bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' } }}
                  onClick={() => fileInputRef.current?.click()}>
                  <EditOutlined sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
              <Typography variant="overline" color="text.secondary" fontWeight={800} sx={{ letterSpacing: 1 }}>
                Customer Information
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Customer Name *" size="small" value={form.customerName}
                  onChange={e => set('customerName', e.target.value)}
                  error={!!errors.customerName} helperText={errors.customerName}
                  InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutlined sx={{ fontSize: 17 }} /></InputAdornment> }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Phone Number *" size="small" value={form.customerPhone}
                  onChange={e => { set('customerPhone', e.target.value); checkDuplicate(e.target.value); }}
                  error={!!errors.customerPhone} helperText={errors.customerPhone}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PhoneOutlined sx={{ fontSize: 17 }} /></InputAdornment>,
                    endAdornment: checkingDup ? <InputAdornment position="end"><CircularProgress size={14} /></InputAdornment> : null
                  }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Email Address" size="small" value={form.customerEmail ?? ''}
                  onChange={e => set('customerEmail', e.target.value)}
                  error={!!errors.customerEmail} helperText={errors.customerEmail}
                  InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlined sx={{ fontSize: 17 }} /></InputAdornment> }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" error={!!errors.sourceChannel}>
                  <InputLabel>Source Channel *</InputLabel>
                  <Select value={form.sourceChannel} label="Source Channel *"
                    onChange={e => set('sourceChannel', e.target.value as SourceChannel)}>
                    {Object.entries(SOURCE_CFG).map(([k, v]) => (
                      <MenuItem key={k} value={k}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <span>{v.icon}</span><span>{v.label}</span>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.sourceChannel && <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>{errors.sourceChannel}</Typography>}
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* ── Property Interest ── */}
          <Box>
            <Typography variant="overline" color="text.secondary" fontWeight={800} sx={{ letterSpacing: 1 }}>
              Property Interest
            </Typography>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Budget Min (₹)" size="small" type="number"
                  value={form.budget ?? ''}
                  onChange={e => set('budget', e.target.value ? Number(e.target.value) : undefined)}
                  error={!!errors.budget} helperText={errors.budget}
                  InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Budget Max (₹)" size="small" type="number"
                  value={form.budgetMax ?? ''}
                  onChange={e => set('budgetMax', e.target.value ? Number(e.target.value) : undefined)}
                  error={!!errors.budgetMax} helperText={errors.budgetMax}
                  InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={projects}
                  getOptionLabel={(o) => o.name || ''}
                  value={projects.find(p => p.id === form.projectId) || null}
                  onChange={(_, val) => {
                    set('projectId', val?.id || undefined);
                    set('preferredProject', val?.name || '');
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Project" size="small" error={!!errors.preferredProject} helperText={errors.preferredProject} InputProps={{ ...params.InputProps, startAdornment: <><InputAdornment position="start" sx={{ pl: 1, mt: -0.5 }}><ApartmentOutlined sx={{ fontSize: 17 }} /></InputAdornment>{params.InputProps.startAdornment}</> }} />
                  )}
                  loading={loadingInv}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={Array.isArray(units) ? units.filter(u => (!form.projectId || u.floor?.tower?.projectId === form.projectId) && (showAllUnits || u.status === 'AVAILABLE' || u.id === form.unitId)) : []}
                  getOptionLabel={(o) => o?.unitNumber ? `${o.unitNumber} (${o.unitType || '?'}) - ${o.status || '?'}` : ''}
                  value={Array.isArray(units) ? (units.find(u => u.id === form.unitId) || null) : null}
                  onChange={(_, val) => {
                    set('unitId', val?.id || undefined);
                    if (val) {
                      set('preferredUnitType', val.unitType);
                      if (val.status !== 'AVAILABLE') setWillingToBook(false);
                    }
                  }}
                  renderOption={(props, option) => {
                    const statusColors: Record<string, string> = {
                      AVAILABLE: '#10b981',
                      HOLD: '#f59e0b',
                      BOOKED: '#ef4444',
                      SOLD: '#ef4444',
                      RESERVED: '#6366f1',
                      BLOCKED: '#6b7280',
                      REQUESTED: '#6366f1',
                      UNDER_MAINTENANCE: '#f43f5e'
                    };
                    const color = statusColors[option.status] || '#888';
                    return (
                      <li {...props}>
                        <Box display="flex" justifyContent="space-between" width="100%" alignItems="center">
                          <Box>
                            <Typography variant="body2" fontWeight={700}>{option.unitNumber}</Typography>
                            <Typography variant="caption" color="text.secondary">{option.unitType} · {option.floor?.floorNumber}F</Typography>
                          </Box>
                          <Chip 
                            label={option.status} 
                            size="small" 
                            sx={{ 
                              height: 18, 
                              fontSize: 9, 
                              fontWeight: 800, 
                              bgcolor: color + '15', 
                              color: color,
                              border: `1px solid ${color}30`
                            }} 
                          />
                        </Box>
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Search Units (Hold/Booking/Sold)" size="small" />
                  )}
                  loading={loadingInv}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Location Preference" size="small" value={form.locationPreference ?? ''}
                  onChange={e => set('locationPreference', e.target.value)}
                  error={!!errors.locationPreference} helperText={errors.locationPreference}
                  InputProps={{ startAdornment: <InputAdornment position="start"><LocationOnOutlined sx={{ fontSize: 17 }} /></InputAdornment> }} />
              </Grid>

              {/* Unit Selection Logic Helper */}
              <Grid item xs={12}>
                <Box display="flex" justifyContent="space-between" alignItems="center" bgcolor={showAllUnits ? C.primary + '08' : 'transparent'} p={1} borderRadius={2} border={`1px dashed ${showAllUnits ? C.primary : C.border}`} mb={1}>
                    <Typography variant="caption" fontWeight={700} color={showAllUnits ? 'primary' : 'text.secondary'}>
                        {showAllUnits ? "⚠️ Showing ALL units (including Booked/Hold)" : "Showing AVAILABLE units only"}
                    </Typography>
                    <FormControlLabel
                        control={<Switch size="small" checked={showAllUnits} onChange={(e) => setShowAllUnits(e.target.checked)} />}
                        label={<Typography variant="caption" fontWeight={800}>Show All</Typography>}
                    />
                </Box>
                
                {form.unitId && units.find(u => u.id === form.unitId)?.status !== 'AVAILABLE' && (
                    <Box sx={{ p: 2, bgcolor: '#fff4e5', borderRadius: 2, border: '1px solid #ffe2b3', mt: 1 }}>
                        <Typography variant="caption" sx={{ color: '#663c00', fontWeight: 800, display: 'block', mb: 1 }}>
                            ⚠️ This unit is currently {units.find(u => u.id === form.unitId)?.status}. 
                            Selecting it requires confirmation of customer's intent to book immediately.
                        </Typography>
                        <FormControlLabel
                            control={<Checkbox size="small" checked={willingToBook} onChange={(e) => setWillingToBook(e.target.checked)} color="warning" />}
                            label={<Typography variant="caption" fontWeight={800} color="#663c00">Customer is willing to proceed with booking for this unit</Typography>}
                        />
                    </Box>
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" error={!!errors.buyingTimeline}>
                  <InputLabel>Buying Timeline</InputLabel>
                  <Select value={form.buyingTimeline ?? ''} label="Buying Timeline"
                    onChange={e => set('buyingTimeline', e.target.value)}>
                    <MenuItem value=""><em>Unknown</em></MenuItem>
                    {BUYING_TIMELINES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </Select>
                  {errors.buyingTimeline && <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>{errors.buyingTimeline}</Typography>}
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* ── Additional Details ── */}
          <Box>
            <Typography variant="overline" color="text.secondary" fontWeight={800} sx={{ letterSpacing: 1 }}>
              Additional Details
            </Typography>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Purchase Purpose</InputLabel>
                  <Select value={form.purpose ?? ''} label="Purchase Purpose"
                    onChange={e => set('purpose', e.target.value as LeadPurpose | '')}>
                    <MenuItem value=""><em>Not specified</em></MenuItem>
                    <MenuItem value="SELF_USE">🏠 Self Use</MenuItem>
                    <MenuItem value="INVESTMENT">💰 Investment</MenuItem>
                    <MenuItem value="RENTAL">🔑 Rental Income</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField fullWidth label="Family Size" size="small" type="number"
                  value={form.familySize ?? ''} onChange={e => set('familySize', e.target.value ? Number(e.target.value) : undefined)} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControlLabel
                  control={<Switch checked={!!form.loanRequired} onChange={e => set('loanRequired', e.target.checked)} color="primary" />}
                  label={<Typography variant="body2" fontWeight={600}>Loan Required</Typography>}
                  sx={{ mt: 0.5 }}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* ── Priority & Stage ── */}
          <Box>
            <Typography variant="overline" color="text.secondary" fontWeight={800} sx={{ letterSpacing: 1 }}>
              Priority & Stage
            </Typography>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={6}>
                {/* Priority selector */}
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 0.75 }}>Lead Priority</Typography>
                <Stack direction="row" spacing={1.5}>
                  {(['HOT', 'WARM', 'COLD'] as LeadPriority[]).map(p => {
                    const cfg = PRIORITY_CFG[p];
                    const isSelected = form.priority === p;
                    return (
                      <Box key={p} onClick={() => set('priority', p)} sx={{
                        flex: 1, p: 1.5, borderRadius: 3, textAlign: 'center', cursor: 'pointer',
                        border: '2px solid', transition: 'all .15s',
                        borderColor: isSelected ? cfg.color : 'divider',
                        bgcolor: isSelected ? cfg.bg : 'background.paper',
                        '&:hover': { borderColor: cfg.color }
                      }}>
                        <Typography fontSize={20}>{cfg.icon}</Typography>
                        <Typography variant="caption" fontWeight={800} sx={{ color: cfg.color }}>{cfg.label}</Typography>
                      </Box>
                    );
                  })}
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" error={!!errors.status}>
                  <InputLabel>Pipeline Stage</InputLabel>
                  <Select value={form.status} label="Pipeline Stage"
                    onChange={e => set('status', e.target.value)}>
                    {PIPELINE_STAGES.map(s => (
                      <MenuItem key={s.key} value={s.key}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <span>{s.icon}</span>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color }} />
                          <span>{s.label}</span>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.status && <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>{errors.status}</Typography>}
                </FormControl>
              </Grid>
            </Grid>

            {/* Score preview */}
            <Paper sx={{ mt: 2, p: 2, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack spacing={0.25}>
                  <Typography variant="caption" fontWeight={700} color="text.secondary">Auto Lead Score</Typography>
                  <Typography variant="h6" fontWeight={900} sx={{ color: computedScore >= 60 ? '#10b981' : computedScore >= 30 ? '#f59e0b' : '#6366f1' }}>
                    {computedScore}/100
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="caption" color="text.secondary">Suggested priority:</Typography>
                  <Chip
                    label={`${PRIORITY_CFG[scorePriority].icon} ${PRIORITY_CFG[scorePriority].label}`}
                    size="small"
                    sx={{ bgcolor: PRIORITY_CFG[scorePriority].bg, color: PRIORITY_CFG[scorePriority].color, fontWeight: 800 }}
                  />
                </Stack>
              </Stack>
              <Box sx={{ mt: 1, height: 6, borderRadius: 3, bgcolor: 'grey.200', overflow: 'hidden' }}>
                <Box sx={{
                  height: '100%', borderRadius: 3, transition: 'width .4s ease',
                  width: `${computedScore}%`,
                  bgcolor: computedScore >= 60 ? '#10b981' : computedScore >= 30 ? '#f59e0b' : '#6366f1'
                }} />
              </Box>
            </Paper>
          </Box>

          <Divider />

          {/* ── Assignment & Tags ── */}
          <Box>
            <Typography variant="overline" color="text.secondary" fontWeight={800} sx={{ letterSpacing: 1 }}>
              {isAgent ? 'Transfer & Tags' : 'Assignment & Tags'}
            </Typography>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>{isAgent ? 'Transfer to Agent' : 'Assign to Agent'}</InputLabel>
                  <Select value={form.assignedAgentId ?? ''} label={isAgent ? 'Transfer to Agent' : 'Assign to Agent'}
                    onChange={e => set('assignedAgentId', e.target.value)}>
                    <MenuItem value=""><em>Unassigned</em></MenuItem>
                    {agents.map(a => (
                      <MenuItem key={a.id} value={a.id}>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar src={a.avatarUrl} sx={{ width: 24, height: 24, bgcolor: avatarColor(a.name), fontSize: 10, fontWeight: 800 }}>
                            {initials(a.name)}
                          </Avatar>
                          <span>{a.name}</span>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Stack direction="row" spacing={1} mb={1}>
                    <TextField fullWidth size="small" label="Add Tag" value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(tagInput))} />
                    <Button variant="outlined" size="small" onClick={() => addTag(tagInput)}>Add</Button>
                  </Stack>
                  <Stack direction="row" flexWrap="wrap" spacing={0.5}>
                    {TAG_PRESETS.map(t => (
                      <Chip key={t} label={t} size="small" clickable
                        variant={(form.tags ?? []).includes(t) ? 'filled' : 'outlined'}
                        color={(form.tags ?? []).includes(t) ? 'primary' : 'default'}
                        onClick={() => {
                          const tags = form.tags ?? [];
                          set('tags', tags.includes(t) ? tags.filter(x => x !== t) : [...tags, t]);
                        }}
                        sx={{ fontWeight: 700, fontSize: 10, my: 0.25 }} />
                    ))}
                    {(form.tags ?? []).filter(t => !TAG_PRESETS.includes(t)).map((t, i) => (
                      <Chip key={i} label={t} size="small" onDelete={() => set('tags', (form.tags ?? []).filter(x => x !== t))}
                        sx={{ fontWeight: 700, fontSize: 10, my: 0.25 }} />
                    ))}
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* ── Notes ── */}
          <Box>
            <Typography variant="overline" color="text.secondary" fontWeight={800} sx={{ letterSpacing: 1 }}>
              Initial Notes
            </Typography>
            <TextField fullWidth multiline rows={3} size="small" sx={{ mt: 1 }}
              placeholder="Customer requirements, budget discussion, any special notes..."
              value={form.notes ?? ''} onChange={e => set('notes', e.target.value)}
              error={!!errors.notes} helperText={errors.notes} />
          </Box>
        </Stack>
      </DialogContent>

      <Divider />
      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none' }}>Cancel</Button>
        <Button variant="contained" disableElevation onClick={handleSave}
          disabled={saving || !form.customerName || !form.customerPhone || !form.sourceChannel}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 3 }}>
          {saving ? <CircularProgress size={18} color="inherit" /> : isEdit ? 'Save Changes' : 'Create Lead'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LeadFormDialog;