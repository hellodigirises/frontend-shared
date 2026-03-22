import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Stack, Button, TextField, Chip,
  IconButton, Divider, Grid, Paper, FormControl,
  InputLabel, Select, MenuItem, Alert, CircularProgress,
  InputAdornment, Collapse
} from '@mui/material';
import {
  CloseOutlined, AddOutlined, DeleteOutlineOutlined,
  DragIndicatorOutlined, CheckCircleOutlined, AutoAwesomeOutlined
} from '@mui/icons-material';
import {
  PaymentPlanTemplate, InstallmentRule, PlanType,
  PLAN_TYPE_CFG, MILESTONE_TAGS, fmtINRFull, fmtINR
} from './paymentTypes';
import api from '../../../../api/axios';

// ─── Template Builder Dialog ──────────────────────────────────────────────────

interface TemplateBuilderProps {
  open: boolean;
  onClose: () => void;
  initial: PaymentPlanTemplate | null;
  onSave: () => void;
}

const BLANK_RULE: InstallmentRule = {
  name: '', description: '', percentage: 0, amount: undefined,
  daysFromBooking: undefined, milestoneTag: undefined, order: 0,
};

export const TemplateBuilderDialog: React.FC<TemplateBuilderProps> = ({ open, onClose, initial, onSave }) => {
  const [name, setName] = useState('');
  const [planType, setPlanType] = useState<PlanType>('CONSTRUCTION_LINKED');
  const [desc, setDesc] = useState('');
  const [rules, setRules] = useState<InstallmentRule[]>([]);
  const [saving, setSaving] = useState(false);

  const STARTER_TEMPLATES: Record<PlanType, InstallmentRule[]> = {
    CONSTRUCTION_LINKED: [
      { name: 'Booking Amount', milestoneTag: 'BOOKING', percentage: 5, order: 1 },
      { name: 'Down Payment', milestoneTag: 'DOWN', percentage: 15, order: 2 },
      { name: 'Foundation Stage', milestoneTag: 'FOUNDATION', percentage: 15, order: 3 },
      { name: 'Structure Stage', milestoneTag: 'STRUCTURE', percentage: 15, order: 4 },
      { name: 'Brickwork Stage', milestoneTag: 'BRICKWORK', percentage: 15, order: 5 },
      { name: 'Plastering Stage', milestoneTag: 'PLASTERING', percentage: 15, order: 6 },
      { name: 'Possession', milestoneTag: 'HANDOVER', percentage: 15, order: 7 },
      { name: 'Registration', milestoneTag: 'REGISTRATION', percentage: 5, order: 8 },
    ],
    TIME_LINKED: [
      { name: 'Booking Amount', percentage: 10, daysFromBooking: 0, order: 1 },
      { name: 'Installment 1', percentage: 20, daysFromBooking: 30, order: 2 },
      { name: 'Installment 2', percentage: 20, daysFromBooking: 90, order: 3 },
      { name: 'Installment 3', percentage: 20, daysFromBooking: 180, order: 4 },
      { name: 'Installment 4', percentage: 20, daysFromBooking: 270, order: 5 },
      { name: 'Final Payment', percentage: 10, daysFromBooking: 365, order: 6 },
    ],
    DOWN_PAYMENT: [
      { name: 'Booking Amount', percentage: 10, daysFromBooking: 0, order: 1 },
      { name: 'Down Payment', percentage: 50, daysFromBooking: 30, order: 2 },
      { name: 'Possession', percentage: 40, daysFromBooking: 730, order: 3 },
    ],
    CUSTOM: [],
  };

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setName(initial.name); setPlanType(initial.planType);
      setDesc(initial.description ?? ''); setRules(initial.installmentRules);
    } else {
      setName(''); setPlanType('CONSTRUCTION_LINKED'); setDesc('');
      setRules(STARTER_TEMPLATES.CONSTRUCTION_LINKED);
    }
  }, [open, initial]);

  const addRule = () => setRules(r => [...r, { ...BLANK_RULE, name: `Installment ${r.length + 1}`, order: r.length + 1 }]);
  const removeRule = (i: number) => setRules(r => r.filter((_, idx) => idx !== i).map((x, idx) => ({ ...x, order: idx + 1 })));
  const updateRule = (i: number, k: keyof InstallmentRule, v: any) =>
    setRules(r => r.map((x, idx) => idx === i ? { ...x, [k]: v } : x));

  const totalPct = rules.reduce((s, r) => s + (r.percentage ?? 0), 0);

  const applyTemplate = (type: PlanType) => {
    setPlanType(type);
    setRules(STARTER_TEMPLATES[type]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { name, planType, description: desc, installmentRules: rules };
      if (initial?.id) await api.put(`/payment-plan-templates/${initial.id}`, payload);
      else await api.post('/payment-plan-templates', payload);
      onSave(); onClose();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md"
      PaperProps={{ sx: { borderRadius: 4, maxHeight: '94vh' } }}>
      <Box sx={{ px: 3.5, pt: 3, pb: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 900, fontSize: '1.4rem' }}>
              📋 {initial ? 'Edit' : 'Create'} Payment Plan Template
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Define installment structure for booking plans
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CloseOutlined fontSize="small" />
          </IconButton>
        </Stack>

        {/* Plan Type Selector */}
        <Stack direction="row" spacing={1.5} mt={2.5} mb={2}>
          {Object.entries(PLAN_TYPE_CFG).map(([k, v]) => (
            <Box key={k} onClick={() => applyTemplate(k as PlanType)}
              sx={{
                flex: 1, p: 2, borderRadius: 3, cursor: 'pointer', textAlign: 'center',
                border: '2px solid', transition: 'all .15s',
                borderColor: planType === k ? '#6366f1' : '#e5e7eb',
                bgcolor: planType === k ? '#eef2ff' : '#fff',
              }}>
              <Typography fontSize={20} mb={0.25}>{v.icon}</Typography>
              <Typography variant="caption" fontWeight={800} sx={{ color: planType === k ? '#6366f1' : '#9ca3af', display: 'block', fontSize: 10 }}>
                {v.label}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
      <Divider />
      <DialogContent sx={{ px: 3.5, py: 3 }}>
        <Stack spacing={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={7}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 1, color: '#6b7280', display: 'block', mb: 1 }}>
                Template Name *
              </Typography>
              <TextField fullWidth size="small" value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Construction Linked 8-Stage Plan"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
            </Grid>
            <Grid item xs={12} sm={5}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 1, color: '#6b7280', display: 'block', mb: 1 }}>
                Description
              </Typography>
              <TextField fullWidth size="small" value={desc} onChange={e => setDesc(e.target.value)}
                placeholder="Brief description..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
            </Grid>
          </Grid>

          {/* Rules table */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Box>
                <Typography variant="body2" fontWeight={800}>Installment Rules</Typography>
                <Typography variant="caption" color="text.secondary">{rules.length} installments · Total: {totalPct}%</Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                {totalPct !== 100 && (
                  <Chip label={`Total: ${totalPct}% (should be 100%)`} size="small"
                    sx={{ bgcolor: totalPct > 100 ? '#fee2e2' : '#fef3c7', color: totalPct > 100 ? '#dc2626' : '#92400e', fontWeight: 700 }} />
                )}
                {totalPct === 100 && (
                  <Chip label="✅ Adds up to 100%" size="small" sx={{ bgcolor: '#d1fae5', color: '#065f46', fontWeight: 700 }} />
                )}
                <Button size="small" startIcon={<AddOutlined />} variant="outlined"
                  onClick={addRule} sx={{ textTransform: 'none', borderRadius: 2.5, fontWeight: 700 }}>
                  Add Row
                </Button>
              </Stack>
            </Stack>

            <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
              {/* Header */}
              <Grid container sx={{ bgcolor: '#f8fafc', px: 2, py: 1.25 }}>
                <Grid item xs={1}><Typography sx={{ fontSize: 11, fontWeight: 800, color: '#6b7280' }}>#</Typography></Grid>
                <Grid item xs={4}><Typography sx={{ fontSize: 11, fontWeight: 800, color: '#6b7280' }}>Name</Typography></Grid>
                <Grid item xs={2}><Typography sx={{ fontSize: 11, fontWeight: 800, color: '#6b7280' }}>%</Typography></Grid>
                <Grid item xs={2}><Typography sx={{ fontSize: 11, fontWeight: 800, color: '#6b7280' }}>Milestone</Typography></Grid>
                <Grid item xs={2}><Typography sx={{ fontSize: 11, fontWeight: 800, color: '#6b7280' }}>Days After</Typography></Grid>
                <Grid item xs={1} />
              </Grid>
              <Divider />

              <Stack>
                {rules.map((rule, i) => {
                  const mTag = MILESTONE_TAGS.find(m => m.value === rule.milestoneTag);
                  return (
                    <Box key={i}>
                      <Grid container alignItems="center" sx={{ px: 2, py: 1, '&:hover': { bgcolor: '#fafafa' } }}>
                        <Grid item xs={1}>
                          <Typography variant="caption" fontWeight={800} color="text.secondary"
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <DragIndicatorOutlined sx={{ fontSize: 14, color: '#d1d5db' }} />{i + 1}
                          </Typography>
                        </Grid>
                        <Grid item xs={4} sx={{ pr: 1 }}>
                          <TextField fullWidth size="small" value={rule.name}
                            onChange={e => updateRule(i, 'name', e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 13 }, '& fieldset': { borderColor: 'transparent' }, '&:hover fieldset': { borderColor: '#d1d5db !important' }, '& input': { py: 0.75 } }} />
                        </Grid>
                        <Grid item xs={2} sx={{ pr: 1 }}>
                          <TextField fullWidth size="small" value={rule.percentage}
                            onChange={e => updateRule(i, 'percentage', parseFloat(e.target.value) || 0)}
                            InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 13 }, '& input': { py: 0.75 } }} />
                        </Grid>
                        <Grid item xs={2} sx={{ pr: 1 }}>
                          <FormControl fullWidth size="small">
                            <Select value={rule.milestoneTag ?? ''} displayEmpty
                              onChange={e => updateRule(i, 'milestoneTag', e.target.value || undefined)}
                              sx={{
                                borderRadius: 2, fontSize: 12, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#d1d5db' }, '& .MuiSelect-select': { py: 0.75 }
                              }}
                              renderValue={v => v ? (MILESTONE_TAGS.find(m => m.value === v)?.label ?? v) : <span style={{ color: '#9ca3af', fontSize: 11 }}>Optional</span>}>
                              <MenuItem value=""><em>None</em></MenuItem>
                              {MILESTONE_TAGS.map(m => <MenuItem key={m.value} value={m.value} sx={{ fontSize: 12 }}>{m.icon} {m.label}</MenuItem>)}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={2}>
                          <TextField fullWidth size="small" type="number" value={rule.daysFromBooking ?? ''}
                            onChange={e => updateRule(i, 'daysFromBooking', e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder="e.g. 30"
                            InputProps={{ endAdornment: <InputAdornment position="end" sx={{ fontSize: 10 }}>days</InputAdornment> }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 13 }, '& input': { py: 0.75 } }} />
                        </Grid>
                        <Grid item xs={1}>
                          <IconButton size="small" onClick={() => removeRule(i)} sx={{ color: '#ef4444' }}>
                            <DeleteOutlineOutlined sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Grid>
                      </Grid>
                      {i < rules.length - 1 && <Divider />}
                    </Box>
                  );
                })}
              </Stack>

              {rules.length === 0 && (
                <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                  <Typography fontSize={36} mb={1}>📋</Typography>
                  <Typography variant="body2">No installment rules yet</Typography>
                  <Button size="small" startIcon={<AddOutlined />} sx={{ mt: 1.5, textTransform: 'none' }}
                    onClick={addRule}>Add First Rule</Button>
                </Box>
              )}
            </Paper>
          </Box>
        </Stack>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
        <Button variant="contained" disableElevation onClick={handleSave}
          disabled={saving || !name.trim() || rules.length === 0}
          sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2.5, px: 4 }}>
          {saving ? <CircularProgress size={18} color="inherit" /> : initial ? 'Save Changes' : 'Create Template'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Apply Template to Booking ────────────────────────────────────────────────

interface ApplyTemplateProps {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  totalAmount: number;
  bookingDate: string;
  templates: PaymentPlanTemplate[];
  onSave: () => void;
}

export const ApplyTemplateDialog: React.FC<ApplyTemplateProps> = ({
  open, onClose, bookingId, totalAmount, bookingDate, templates, onSave
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [preview, setPreview] = useState<{ name: string; amount: number; dueDate: string }[]>([]);
  const [saving, setSaving] = useState(false);

  const generatePreview = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;
    const booking = new Date(bookingDate);
    setPreview(template.installmentRules.map(r => {
      const amount = r.amount ?? Math.round(totalAmount * r.percentage / 100);
      const dueDate = new Date(booking);
      if (r.daysFromBooking) dueDate.setDate(dueDate.getDate() + r.daysFromBooking);
      return { name: r.name, amount, dueDate: dueDate.toISOString().split('T')[0] };
    }));
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;
    setSaving(true);
    try {
      await api.post(`/bookings/${bookingId}/apply-payment-template`, {
        templateId: selectedTemplate, totalAmount
      });
      onSave(); onClose();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 4 } }}>
      <Box sx={{ px: 3.5, pt: 3, pb: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 900, fontSize: '1.4rem' }}>
              📋 Apply Payment Plan
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total booking value: {fmtINRFull(totalAmount)}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CloseOutlined fontSize="small" />
          </IconButton>
        </Stack>
      </Box>
      <Divider />
      <DialogContent>
        <Stack spacing={2.5}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 1, color: '#6b7280', display: 'block', mb: 1.25 }}>
              Select Template
            </Typography>
            <Stack spacing={1.25}>
              {templates.map(t => {
                const cfg = PLAN_TYPE_CFG[t.planType];
                return (
                  <Box key={t.id}
                    onClick={() => { setSelectedTemplate(t.id); generatePreview(t.id); }}
                    sx={{
                      p: 2.25, borderRadius: 3, cursor: 'pointer', border: '2px solid',
                      borderColor: selectedTemplate === t.id ? '#6366f1' : '#e5e7eb',
                      bgcolor: selectedTemplate === t.id ? '#eef2ff' : '#fff',
                      transition: 'all .15s',
                    }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Typography fontSize={22}>{cfg.icon}</Typography>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={800}>{t.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t.installmentRules.length} installments · {cfg.label}
                          {t.isDefault && ' · ⭐ Default'}
                        </Typography>
                      </Box>
                      {selectedTemplate === t.id && <CheckCircleOutlined sx={{ color: '#6366f1' }} />}
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          </Box>

          {preview.length > 0 && (
            <Box>
              <Typography variant="body2" fontWeight={800} mb={1.25}>📋 Preview (based on {fmtINRFull(totalAmount)})</Typography>
              <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
                {preview.map((p, i) => (
                  <Box key={i}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1.25 }}>
                      <Typography variant="body2" fontWeight={700}>{p.name}</Typography>
                      <Stack alignItems="flex-end">
                        <Typography variant="body2" fontWeight={900}>{fmtINRFull(p.amount)}</Typography>
                        <Typography variant="caption" color="text.secondary">{new Date(p.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Typography>
                      </Stack>
                    </Stack>
                    {i < preview.length - 1 && <Divider />}
                  </Box>
                ))}
              </Paper>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
        <Button variant="contained" disableElevation onClick={handleSave}
          disabled={saving || !selectedTemplate}
          sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2.5, px: 4 }}>
          {saving ? <CircularProgress size={18} color="inherit" /> : 'Apply Plan & Generate Schedule'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TemplateBuilderDialog;