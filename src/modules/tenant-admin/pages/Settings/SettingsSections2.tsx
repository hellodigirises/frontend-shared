import React, { useState } from 'react';
import {
  Box, Typography, Stack, Button, TextField, Grid, Paper,
  Divider, Chip, IconButton, Alert, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, Switch,
  FormControlLabel, Tooltip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Checkbox, Avatar,
  Collapse, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  AddOutlined, DeleteOutlineOutlined, EditOutlined, CloseOutlined,
  DragIndicatorOutlined, CheckBoxOutlined, ToggleOnOutlined,
  SecurityOutlined, PlayArrowOutlined, PauseOutlined
} from '@mui/icons-material';
import {
  CustomField, CustomFieldType, CustomFieldEntity, WorkflowRule,
  WorkflowTrigger, WorkflowAction, WorkflowActionItem, WorkflowCondition,
  ModuleFlag, RolePermission, SecurityConfig, PermissionAction,
  CUSTOM_FIELD_TYPE_CFG, WORKFLOW_TRIGGER_CFG, WORKFLOW_ACTION_CFG,
  MODULE_FLAGS, toSlug, formatDate, avatarColor, initials
} from './settingsTypes';
import api from '../../../../api/axios';

const S = {
  section: {
    fontWeight: 800 as const, fontSize: '0.68rem', textTransform: 'uppercase' as const,
    letterSpacing: 1.2, color: '#9ca3af', display: 'block', mb: 1.5
  },
  field: { '& .MuiOutlinedInput-root': { borderRadius: 2.5 } },
};

// ─── Custom Fields Builder ────────────────────────────────────────────────────
export const CustomFieldsSection: React.FC<{
  fields: CustomField[];
  onRefresh: () => void;
}> = ({ fields, onRefresh }) => {
  const [entityFilter, setEntityFilter] = useState<CustomFieldEntity | 'ALL'>('ALL');
  const [createOpen, setCreateOpen] = useState(false);
  const [editField, setEditField] = useState<CustomField | null>(null);

  const filtered = entityFilter === 'ALL' ? fields : fields.filter(f => f.entityType === entityFilter);

  const ENTITY_LABELS: Record<CustomFieldEntity | 'ALL', string> = {
    ALL: 'All Entities', LEAD: '🎯 Lead', BOOKING: '📝 Booking', CUSTOMER: '👤 Customer',
    UNIT: '🏠 Unit', PROJECT: '🏗 Project', PARTNER: '🤝 Partner', EMPLOYEE: '👔 Employee',
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography sx={S.section}>Custom Fields</Typography>
          <Typography variant="body2" color="text.secondary">
            Add extra fields to any entity in the system
          </Typography>
        </Box>
        <Button variant="contained" disableElevation startIcon={<AddOutlined />}
          onClick={() => { setEditField(null); setCreateOpen(true); }}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2.5 }}>
          Create Field
        </Button>
      </Stack>

      {/* Entity tabs */}
      <Stack direction="row" spacing={1} mb={2.5} flexWrap="wrap">
        {Object.entries(ENTITY_LABELS).map(([k, l]) => (
          <Chip key={k} label={l} size="small" clickable
            variant={entityFilter === k ? 'filled' : 'outlined'}
            color={entityFilter === k ? 'primary' : 'default'}
            onClick={() => setEntityFilter(k as any)}
            sx={{ fontWeight: 700, fontSize: 11 }} />
        ))}
      </Stack>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                {['Field Name', 'API Key', 'Entity', 'Type', 'Required', 'Status', ''].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 800, fontSize: 11, py: 1.5 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                    <Typography fontSize={32} mb={1}>⚙️</Typography>
                    <Typography variant="body2">No custom fields yet. Create your first field above.</Typography>
                  </TableCell>
                </TableRow>
              ) : filtered.map(field => {
                const ftCfg = CUSTOM_FIELD_TYPE_CFG[field.fieldType];
                return (
                  <TableRow key={field.id} hover sx={{ '& td': { py: 1.25 } }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>{field.label}</Typography>
                      {field.helpText && <Typography variant="caption" color="text.secondary">{field.helpText}</Typography>}
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontFamily: 'monospace', fontSize: 12, color: '#6366f1', bgcolor: '#eef2ff', px: 1, py: 0.25, borderRadius: 1, display: 'inline-block' }}>
                        {field.apiKey}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" fontWeight={700}>{ENTITY_LABELS[field.entityType]}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={`${ftCfg.icon} ${ftCfg.label}`} size="small"
                        sx={{ bgcolor: ftCfg.color + '15', color: ftCfg.color, fontWeight: 700, fontSize: 10, height: 20 }} />
                    </TableCell>
                    <TableCell>
                      <Chip label={field.isRequired ? '⭐ Yes' : 'No'} size="small"
                        sx={{ bgcolor: field.isRequired ? '#fef3c7' : '#f3f4f6', color: field.isRequired ? '#92400e' : '#6b7280', fontWeight: 700, fontSize: 9, height: 18 }} />
                    </TableCell>
                    <TableCell>
                      <Chip label={field.isActive ? 'Active' : 'Inactive'} size="small"
                        sx={{ bgcolor: field.isActive ? '#d1fae5' : '#f3f4f6', color: field.isActive ? '#065f46' : '#6b7280', fontWeight: 700, fontSize: 9, height: 18 }} />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.25}>
                        <IconButton size="small" onClick={() => { setEditField(field); setCreateOpen(true); }}>
                          <EditOutlined sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton size="small" sx={{ color: 'error.main' }}>
                          <DeleteOutlineOutlined sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <CustomFieldDialog open={createOpen} onClose={() => { setCreateOpen(false); setEditField(null); }}
        initial={editField} onSave={onRefresh} />
    </Box>
  );
};

const CustomFieldDialog: React.FC<{
  open: boolean; onClose: () => void;
  initial: CustomField | null; onSave: () => void;
}> = ({ open, onClose, initial, onSave }) => {
  const [form, setForm] = useState({
    label: initial?.label ?? '', entityType: initial?.entityType ?? 'LEAD',
    fieldType: initial?.fieldType ?? 'TEXT', placeholder: initial?.placeholder ?? '',
    helpText: initial?.helpText ?? '', isRequired: initial?.isRequired ?? false,
    options: initial?.options?.join('\n') ?? '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const apiKey = toSlug(form.label);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, apiKey, options: form.options ? form.options.split('\n').filter(Boolean) : undefined };
      if (initial) await api.put(`/settings/custom-fields/${initial.id}`, payload);
      else await api.post('/settings/custom-fields', payload);
      onSave(); onClose();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const needsOptions = form.fieldType === 'DROPDOWN' || form.fieldType === 'MULTI_SELECT';

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4 } }}>
      <Box sx={{ px: 3.5, pt: 3, pb: 2.5 }}>
        <Stack direction="row" justifyContent="space-between">
          <Typography sx={{ fontWeight: 800, fontSize: '1.2rem' }}>{initial ? '✏️ Edit Custom Field' : '➕ Create Custom Field'}</Typography>
          <IconButton size="small" onClick={onClose} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}><CloseOutlined fontSize="small" /></IconButton>
        </Stack>
      </Box>
      <Divider />
      <DialogContent>
        <Stack spacing={2.5}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={7}>
              <Typography sx={S.section}>Field Label *</Typography>
              <TextField fullWidth size="small" value={form.label} onChange={e => set('label', e.target.value)} placeholder="e.g. Investment Type" sx={S.field} />
              {form.label && (
                <Typography variant="caption" sx={{ color: '#9ca3af', fontFamily: 'monospace', mt: 0.5, display: 'block' }}>
                  API Key: <strong style={{ color: '#6366f1' }}>{apiKey}</strong>
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={5}>
              <Typography sx={S.section}>Entity</Typography>
              <FormControl fullWidth size="small">
                <Select value={form.entityType} onChange={e => set('entityType', e.target.value)} sx={{ borderRadius: 2.5 }}>
                  {['LEAD', 'BOOKING', 'CUSTOMER', 'UNIT', 'PROJECT', 'PARTNER', 'EMPLOYEE'].map(e => (
                    <MenuItem key={e} value={e}>{e}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box>
            <Typography sx={S.section}>Field Type</Typography>
            <Grid container spacing={1}>
              {Object.entries(CUSTOM_FIELD_TYPE_CFG).map(([k, v]) => (
                <Grid item xs={6} sm={4} key={k}>
                  <Box onClick={() => set('fieldType', k)}
                    sx={{
                      p: 1.5, borderRadius: 2.5, textAlign: 'center', cursor: 'pointer', border: '1.5px solid',
                      borderColor: form.fieldType === k ? v.color : '#e5e7eb',
                      bgcolor: form.fieldType === k ? v.color + '12' : '#fff', transition: 'all .12s'
                    }}>
                    <Typography fontSize={18}>{v.icon}</Typography>
                    <Typography variant="caption" fontWeight={800} sx={{ color: form.fieldType === k ? v.color : '#9ca3af', fontSize: 10 }}>{v.label}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          {needsOptions && (
            <Box>
              <Typography sx={S.section}>Options (one per line)</Typography>
              <TextField fullWidth multiline rows={4} size="small" value={form.options} onChange={e => set('options', e.target.value)} placeholder="End-user&#10;Investor&#10;NRI&#10;Commercial" sx={S.field} />
            </Box>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <Typography sx={S.section}>Placeholder Text</Typography>
              <TextField fullWidth size="small" value={form.placeholder} onChange={e => set('placeholder', e.target.value)} sx={S.field} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControlLabel control={<Switch checked={form.isRequired} onChange={e => set('isRequired', e.target.checked)} />}
                label={<Typography variant="body2" fontWeight={700}>Required field</Typography>} />
            </Grid>
          </Grid>

          <Box>
            <Typography sx={S.section}>Help Text</Typography>
            <TextField fullWidth size="small" value={form.helpText} onChange={e => set('helpText', e.target.value)} placeholder="Brief instructions for this field" sx={S.field} />
          </Box>
        </Stack>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
        <Button variant="contained" disableElevation onClick={handleSave} disabled={saving || !form.label}
          sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2.5, px: 4 }}>
          {saving ? <CircularProgress size={18} color="inherit" /> : initial ? 'Save Changes' : 'Create Field'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Module Flags Section ─────────────────────────────────────────────────────
export const ModulesSection: React.FC<{
  flags: ModuleFlag[];
  isSuperAdmin: boolean;
  onToggle: (key: string, enabled: boolean) => void;
}> = ({ flags, isSuperAdmin, onToggle }) => {
  const [toggling, setToggling] = useState<string | null>(null);

  const handleToggle = async (flag: ModuleFlag) => {
    if (!isSuperAdmin && flag.superAdminOnly) return;
    setToggling(flag.key);
    try { await api.put(`/settings/modules/${flag.key}`, { enabled: !flag.isEnabled }); onToggle(flag.key, !flag.isEnabled); }
    catch (e) { console.error(e); } finally { setToggling(null); }
  };

  const categories = [
    { label: 'Core Modules', keys: ['PROJECT_MANAGEMENT', 'LEAD_CRM', 'SITE_VISITS', 'BOOKING_SYSTEM'] },
    { label: 'Financial', keys: ['PAYMENT_MANAGEMENT', 'CHANNEL_PARTNER'] },
    { label: 'Operations', keys: ['HR_MODULE', 'DOCUMENT_MANAGEMENT', 'NOTIFICATION_CENTER'] },
    { label: 'Intelligence', keys: ['ANALYTICS_ENGINE', 'AI_INSIGHTS', 'MARKETING_AUTOMATION'] },
  ];

  return (
    <Box>
      {!isSuperAdmin && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 3 }}>
          Module activation is controlled by your SuperAdmin. Contact support to enable additional modules.
        </Alert>
      )}
      <Stack spacing={4}>
        {categories.map(cat => {
          const catFlags = flags.filter(f => cat.keys.includes(f.key));
          return (
            <Box key={cat.label}>
              <Typography sx={S.section}>{cat.label}</Typography>
              <Grid container spacing={2}>
                {catFlags.map(flag => (
                  <Grid item xs={12} sm={6} key={flag.key}>
                    <Paper variant="outlined" sx={{
                      p: 2.5, borderRadius: 3.5, transition: 'all .2s',
                      borderColor: flag.isEnabled ? '#6ee7b7' : '#e5e7eb',
                      bgcolor: flag.isEnabled ? '#f0fdf4' : '#fff',
                      opacity: (flag.superAdminOnly && !isSuperAdmin) ? 0.6 : 1,
                    }}>
                      <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                        <Stack direction="row" spacing={1.75} alignItems="flex-start" sx={{ flex: 1, mr: 1 }}>
                          <Box sx={{
                            width: 44, height: 44, borderRadius: 3, bgcolor: flag.isEnabled ? '#d1fae5' : '#f3f4f6',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0
                          }}>
                            {flag.icon}
                          </Box>
                          <Box>
                            <Stack direction="row" alignItems="center" spacing={0.75} mb={0.4}>
                              <Typography variant="body2" fontWeight={800}>{flag.label}</Typography>
                              {flag.isPro && (
                                <Chip label="PRO" size="small"
                                  sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 900, fontSize: 8, height: 16, px: 0.5 }} />
                              )}
                              {flag.superAdminOnly && !isSuperAdmin && (
                                <Chip label="SuperAdmin" size="small"
                                  sx={{ bgcolor: '#ede9fe', color: '#6d28d9', fontWeight: 800, fontSize: 9, height: 16 }} />
                              )}
                            </Stack>
                            <Typography variant="caption" color="text.secondary">{flag.description}</Typography>
                            {flag.dependsOn && flag.dependsOn.length > 0 && (
                              <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', fontSize: 10, mt: 0.25 }}>
                                Requires: {flag.dependsOn.join(', ')}
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                        <Box sx={{ flexShrink: 0 }}>
                          {toggling === flag.key ? (
                            <CircularProgress size={22} />
                          ) : (
                            <Switch checked={flag.isEnabled}
                              onChange={() => handleToggle(flag)}
                              disabled={flag.superAdminOnly && !isSuperAdmin}
                              color="success" />
                          )}
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};

// ─── Workflow Rules Section ───────────────────────────────────────────────────
export const WorkflowSection: React.FC<{
  rules: WorkflowRule[];
  onRefresh: () => void;
}> = ({ rules, onRefresh }) => {
  const [createOpen, setCreateOpen] = useState(false);

  const handleToggle = async (rule: WorkflowRule) => {
    try { await api.put(`/settings/workflows/${rule.id}`, { isActive: !rule.isActive }); onRefresh(); }
    catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this workflow rule?')) return;
    try { await api.delete(`/settings/workflows/${id}`); onRefresh(); }
    catch (e) { console.error(e); }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography sx={S.section}>Workflow Automation Rules</Typography>
          <Typography variant="body2" color="text.secondary">Automate repetitive actions based on triggers</Typography>
        </Box>
        <Button variant="contained" disableElevation startIcon={<AddOutlined />}
          onClick={() => setCreateOpen(true)}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2.5 }}>
          Create Rule
        </Button>
      </Stack>

      <Stack spacing={2}>
        {rules.length === 0 && (
          <Box sx={{ py: 8, textAlign: 'center', color: 'text.secondary', border: '2px dashed #e5e7eb', borderRadius: 3 }}>
            <Typography fontSize={36} mb={1}>⚡</Typography>
            <Typography variant="body2">No workflow rules yet. Create your first automation.</Typography>
          </Box>
        )}
        {rules.map(rule => {
          const trigCfg = WORKFLOW_TRIGGER_CFG[rule.trigger];
          return (
            <Paper key={rule.id} variant="outlined" sx={{
              borderRadius: 3, overflow: 'hidden',
              borderColor: rule.isActive ? '#c7d2fe' : '#e5e7eb',
              bgcolor: rule.isActive ? '#fafbff' : '#fff'
            }}>
              <Stack direction="row" alignItems="center" sx={{ px: 2.5, py: 2 }} spacing={2}>
                {/* Status dot */}
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: rule.isActive ? '#10b981' : '#d1d5db', flexShrink: 0 }} />

                {/* Trigger */}
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5} mb={0.75}>
                    <Chip label={`${trigCfg.icon} ${trigCfg.label}`} size="small"
                      sx={{ bgcolor: '#eef2ff', color: '#4338ca', fontWeight: 800, fontSize: 10, height: 22 }} />
                    <Typography sx={{ color: '#9ca3af', fontSize: 12 }}>→</Typography>
                    <Stack direction="row" spacing={0.75} flexWrap="wrap">
                      {rule.actions.map((a, i) => {
                        const aCfg = WORKFLOW_ACTION_CFG[a.action];
                        return (
                          <Chip key={i} label={`${aCfg.icon} ${aCfg.label}`} size="small"
                            sx={{ bgcolor: aCfg.color + '15', color: aCfg.color, fontWeight: 700, fontSize: 10, height: 22 }} />
                        );
                      })}
                    </Stack>
                  </Stack>
                  <Typography variant="body2" fontWeight={800}>{rule.name}</Typography>
                  {rule.description && <Typography variant="caption" color="text.secondary">{rule.description}</Typography>}
                  <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mt: 0.25 }}>
                    Executed {rule.executionCount} times · Created {formatDate(rule.createdAt)}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Switch checked={rule.isActive} onChange={() => handleToggle(rule)} size="small" />
                  <IconButton size="small" sx={{ color: 'error.main' }} onClick={() => handleDelete(rule.id)}>
                    <DeleteOutlineOutlined sx={{ fontSize: 16 }} />
                  </IconButton>
                </Stack>
              </Stack>
            </Paper>
          );
        })}
      </Stack>

      {/* Create dialog (simplified) */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4 } }}>
        <Box sx={{ px: 3.5, pt: 3, pb: 2.5 }}>
          <Stack direction="row" justifyContent="space-between">
            <Typography fontWeight={800} fontSize="1.2rem">⚡ Create Workflow Rule</Typography>
            <IconButton size="small" onClick={() => setCreateOpen(false)} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <CloseOutlined fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
        <Divider />
        <DialogContent>
          <Stack spacing={2.5}>
            <TextField fullWidth label="Rule Name *" size="small" sx={S.field} />
            <FormControl fullWidth size="small">
              <InputLabel>When this happens (Trigger)</InputLabel>
              <Select label="When this happens (Trigger)" sx={{ borderRadius: 2.5 }}>
                {Object.entries(WORKFLOW_TRIGGER_CFG).map(([k, v]) => (
                  <MenuItem key={k} value={k}>{v.icon} {v.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box>
              <Typography sx={S.section}>Then do this (Actions)</Typography>
              <Stack spacing={1.25}>
                {Object.entries(WORKFLOW_ACTION_CFG).map(([k, v]) => (
                  <Stack key={k} direction="row" alignItems="center" justifyContent="space-between"
                    sx={{ p: 1.75, borderRadius: 2.5, bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Typography fontSize={16}>{v.icon}</Typography>
                      <Typography variant="body2" fontWeight={600}>{v.label}</Typography>
                    </Stack>
                    <Checkbox size="small" />
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setCreateOpen(false)} color="inherit" sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" disableElevation sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2.5, px: 4 }}>
            Create Rule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ─── Security Settings ────────────────────────────────────────────────────────
export const SecuritySection: React.FC<{
  config: SecurityConfig;
  onSave: (c: SecurityConfig) => void;
}> = ({ config: initial, onSave }) => {
  const [form, setForm] = useState({ ...initial });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newIP, setNewIP] = useState('');
  const set = (k: keyof SecurityConfig, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try { await api.put('/settings/security', form); onSave(form); setSaved(true); setTimeout(() => setSaved(false), 2500); }
    catch (e) { console.error(e); } finally { setSaving(false); }
  };

  return (
    <Box>
      {saved && <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }}>Security settings saved ✅</Alert>}
      <Stack spacing={4}>
        {/* Password policy */}
        <Box>
          <Typography sx={S.section}>Password Policy</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Minimum Length" size="small" type="number"
                value={form.minPasswordLength} onChange={e => set('minPasswordLength', parseInt(e.target.value))}
                inputProps={{ min: 6, max: 32 }} sx={S.field} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Password Expiry (days)" size="small" type="number"
                value={form.passwordExpiryDays} onChange={e => set('passwordExpiryDays', parseInt(e.target.value))}
                inputProps={{ min: 0, max: 365 }} sx={S.field}
                helperText="0 = never expires" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Max Login Attempts" size="small" type="number"
                value={form.maxLoginAttempts} onChange={e => set('maxLoginAttempts', parseInt(e.target.value))}
                inputProps={{ min: 3, max: 20 }} sx={S.field} />
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={3} flexWrap="wrap">
                {[
                  { k: 'requireUppercase', label: 'Require uppercase letter' },
                  { k: 'requireNumbers', label: 'Require numbers' },
                  { k: 'requireSpecialChars', label: 'Require special characters' },
                ].map(opt => (
                  <FormControlLabel key={opt.k}
                    control={<Switch checked={(form as any)[opt.k]} onChange={e => set(opt.k as any, e.target.checked)} size="small" />}
                    label={<Typography variant="body2" fontWeight={600}>{opt.label}</Typography>} />
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* Session & 2FA */}
        <Box>
          <Typography sx={S.section}>Session & Access</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Session Timeout (minutes)" size="small" type="number"
                value={form.sessionTimeoutMinutes} onChange={e => set('sessionTimeoutMinutes', parseInt(e.target.value))}
                inputProps={{ min: 5, max: 480 }} sx={S.field} />
            </Grid>
            <Grid item xs={12} sm={8}>
              <Stack spacing={1.5} pt={0.5}>
                <FormControlLabel
                  control={<Switch checked={form.twoFactorEnabled} onChange={e => set('twoFactorEnabled', e.target.checked)} />}
                  label={<Box>
                    <Typography variant="body2" fontWeight={700}>Enable Two-Factor Authentication</Typography>
                    <Typography variant="caption" color="text.secondary">Require OTP on every login</Typography>
                  </Box>} />
                <FormControlLabel
                  control={<Switch checked={form.ipWhitelistEnabled} onChange={e => set('ipWhitelistEnabled', e.target.checked)} />}
                  label={<Box>
                    <Typography variant="body2" fontWeight={700}>IP Whitelist</Typography>
                    <Typography variant="caption" color="text.secondary">Restrict login to specific IP addresses</Typography>
                  </Box>} />
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {/* IP whitelist */}
        {form.ipWhitelistEnabled && (
          <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid #e5e7eb' }}>
            <Typography sx={{ ...S.section, mb: 2 }}>Allowed IP Addresses</Typography>
            <Stack direction="row" spacing={1.5} mb={2}>
              <TextField fullWidth size="small" value={newIP} onChange={e => setNewIP(e.target.value)}
                placeholder="e.g. 192.168.1.0/24" sx={S.field} />
              <Button variant="outlined" onClick={() => { if (newIP.trim()) { set('allowedIPs', [...form.allowedIPs, newIP.trim()]); setNewIP(''); } }}
                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2.5, whiteSpace: 'nowrap' }}>
                Add IP
              </Button>
            </Stack>
            <Stack direction="row" flexWrap="wrap" spacing={0.75}>
              {form.allowedIPs.map((ip, i) => (
                <Chip key={i} label={ip} size="small"
                  onDelete={() => set('allowedIPs', form.allowedIPs.filter((_, j) => j !== i))}
                  sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 11 }} />
              ))}
            </Stack>
          </Box>
        )}
      </Stack>

      <Divider sx={{ my: 3 }} />
      <Stack direction="row" justifyContent="flex-end">
        <Button variant="contained" disableElevation onClick={handleSave} disabled={saving}
          sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2.5, px: 4 }}>
          {saving ? <CircularProgress size={18} color="inherit" /> : '🔒 Save Security Settings'}
        </Button>
      </Stack>
    </Box>
  );
};