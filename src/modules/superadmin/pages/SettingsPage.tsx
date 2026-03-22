// src/modules/superadmin/pages/SettingsPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Typography, TextField, Button, Chip,
  Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import { Save, Add } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, C, inputSx, labelSx, selectSx } from '../hooks';
import { fetchSettings, doSaveSetting, type PlatformSetting } from '../store/superadminSlice';
import { PageHeader, SectionCard } from '../components/ui';

// Default platform settings seeded on first load
const DEFAULTS: Omit<PlatformSetting, 'id'>[] = [
  { key: 'DEFAULT_AI_RATE',         value: '2.50',  type: 'NUMBER', description: 'Default AI cost per minute (₹)',         group: 'AI'       },
  { key: 'DEFAULT_TELEPHONY_RATE',  value: '0.50',  type: 'NUMBER', description: 'Default telephony cost per minute (₹)',   group: 'TELEPHONY'},
  { key: 'TELEPHONY_SYSTEM_RATE',   value: '0.25',  type: 'NUMBER', description: 'System telephony cost per minute (₹)',    group: 'TELEPHONY'},
  { key: 'TELEPHONY_TENANT_RATE',   value: '0.50',  type: 'NUMBER', description: 'Tenant telephony price per minute (₹)',   group: 'TELEPHONY'},
  { key: 'GST_PERCENT',             value: '18',    type: 'NUMBER', description: 'GST % applied to all invoices',           group: 'BILLING'  },
  { key: 'INVOICE_DUE_DAYS',        value: '15',    type: 'NUMBER', description: 'Days after issue before invoice is due',  group: 'BILLING'  },
  { key: 'TRIAL_DAYS',              value: '14',    type: 'NUMBER', description: 'Trial period in days for new tenants',    group: 'GENERAL'  },
  { key: 'MAX_USERS_DEFAULT',       value: '10',    type: 'NUMBER', description: 'Default max users per new tenant',        group: 'GENERAL'  },
  { key: 'PLATFORM_NAME',           value: 'Realesso', type: 'STRING', description: 'Platform display name',               group: 'GENERAL'  },
  { key: 'SUPPORT_EMAIL',           value: 'support@realesso.io', type: 'STRING', description: 'Support email address',    group: 'GENERAL'  },
];

const GROUP_COLOR: Record<string, string> = {
  GENERAL  : '#4F7FFF',
  BILLING  : '#22c55e',
  AI       : '#a855f7',
  TELEPHONY: '#06b6d4',
  CUSTOM   : '#f59e0b',
};

const GROUPS = ['GENERAL', 'BILLING', 'AI', 'TELEPHONY', 'CUSTOM'];

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const { settings } = useAppSelector(s => s.superadmin);
  const [edits,    setEdits]    = useState<Record<string, string>>({});
  const [saving,   setSaving]   = useState<Record<string, boolean>>({});
  const [newKey,   setNewKey]   = useState('');
  const [newVal,   setNewVal]   = useState('');
  const [newDesc,  setNewDesc]  = useState('');
  const [newGroup, setNewGroup] = useState('GENERAL');
  const [newType,  setNewType]  = useState('STRING');

  useEffect(() => { dispatch(fetchSettings()); }, [dispatch]);

  // Seed defaults on empty platform
  useEffect(() => {
    if (settings.length === 0) {
      DEFAULTS.forEach(s => dispatch(doSaveSetting({ key: s.key, value: s.value, description: s.description, group: s.group, type: s.type })));
    }
  }, [settings.length, dispatch]);

  // Merge loaded settings with defaults so UI always shows all keys
  const merged: PlatformSetting[] = settings.length > 0
    ? settings
    : DEFAULTS.map((d, i) => ({ ...d, id: String(i) }));

  const grouped = merged.reduce((acc: Record<string, PlatformSetting[]>, s) => {
    const g = s.group ?? 'GENERAL';
    if (!acc[g]) acc[g] = [];
    acc[g].push(s);
    return acc;
  }, {});

  const save = async (s: PlatformSetting) => {
    const val = edits[s.key] ?? s.value;
    setSaving(p => ({ ...p, [s.key]: true }));
    await dispatch(doSaveSetting({ key: s.key, value: val, description: s.description, group: s.group, type: s.type }));
    setSaving(p => ({ ...p, [s.key]: false }));
    setEdits(p => { const n = { ...p }; delete n[s.key]; return n; });
  };

  const addNew = () => {
    if (!newKey || !newVal) return;
    dispatch(doSaveSetting({ key: newKey.toUpperCase().replace(/\s/g, '_'), value: newVal, description: newDesc, group: newGroup, type: newType }));
    setNewKey(''); setNewVal(''); setNewDesc('');
  };

  return (
    <Box>
      <PageHeader
        title="Platform Settings"
        subtitle="Global configuration values applied across the entire platform"
      />

      {Object.entries(grouped).map(([group, items]) => {
        const ac = GROUP_COLOR[group] ?? C.primary;
        return (
          <Box key={group} mb={3}>
            <Box display="flex" alignItems="center" gap={1} mb={1.5}>
              <Chip label={group} size="small"
                sx={{ bgcolor: `${ac}18`, color: ac, fontWeight: 700, fontSize: 11 }} />
              <Typography sx={{ color: C.textSub, fontSize: 11.5 }}>{items.length} settings</Typography>
            </Box>

            <SectionCard>
              <Box p={0}>
                {(items as PlatformSetting[]).map(s => {
                  const isDirty = edits[s.key] !== undefined && edits[s.key] !== s.value;
                  return (
                    <Box key={s.key} display="flex" alignItems="center" gap={2}
                      px={2.5} py={1.5} sx={{ borderBottom: `1px solid ${C.border}` }}>
                      {/* Key + description */}
                      <Box flex={1} minWidth={0}>
                        <Typography sx={{ color: C.text, fontSize: 12.5, fontWeight: 500, fontFamily: 'monospace' }}>
                          {s.key}
                        </Typography>
                        {s.description && (
                          <Typography sx={{ color: C.textSub, fontSize: 11, mt: 0.2 }}>{s.description}</Typography>
                        )}
                      </Box>

                      {/* Type badge */}
                      <Chip label={s.type ?? 'STRING'} size="small"
                        sx={{ fontSize: 9.5, height: 18, bgcolor: 'rgba(255,255,255,0.06)', color: C.muted, flexShrink: 0 }} />

                      {/* Value input */}
                      <TextField
                        size="small"
                        value={edits[s.key] ?? s.value}
                        onChange={e => setEdits(p => ({ ...p, [s.key]: e.target.value }))}
                        sx={{ width: 200, ...inputSx }}
                        inputProps={{ style: { fontSize: 13, fontFamily: 'monospace' } }}
                      />

                      {/* Save button */}
                      <Button
                        size="small"
                        variant={isDirty ? 'contained' : 'outlined'}
                        startIcon={<Save sx={{ fontSize: 12 }} />}
                        disabled={!isDirty || !!saving[s.key]}
                        onClick={() => save(s)}
                        sx={{
                          minWidth: 72, fontSize: 12, textTransform: 'none', borderRadius: '8px', flexShrink: 0,
                          ...(isDirty
                            ? { bgcolor: C.primary }
                            : { color: C.muted, borderColor: C.border }),
                        }}
                      >
                        Save
                      </Button>
                    </Box>
                  );
                })}
              </Box>
            </SectionCard>
          </Box>
        );
      })}

      {/* Add custom setting */}
      <SectionCard title="Add Custom Setting">
        <Box p={2.5}>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} md={3}>
              <TextField fullWidth size="small" label="Key (SCREAMING_SNAKE_CASE)"
                value={newKey} onChange={e => setNewKey(e.target.value.toUpperCase().replace(/\s/g, '_'))}
                sx={inputSx} InputLabelProps={{ sx: labelSx }} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth size="small" label="Value"
                value={newVal} onChange={e => setNewVal(e.target.value)}
                sx={inputSx} InputLabelProps={{ sx: labelSx }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth size="small" label="Description (optional)"
                value={newDesc} onChange={e => setNewDesc(e.target.value)}
                sx={inputSx} InputLabelProps={{ sx: labelSx }} />
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel sx={labelSx}>Group</InputLabel>
                <Select value={newGroup} label="Group" onChange={e => setNewGroup(e.target.value)} sx={selectSx}>
                  {GROUPS.map(g => <MenuItem key={g} value={g} sx={{ fontSize: 13 }}>{g}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={1}>
              <FormControl fullWidth size="small">
                <InputLabel sx={labelSx}>Type</InputLabel>
                <Select value={newType} label="Type" onChange={e => setNewType(e.target.value)} sx={selectSx}>
                  {['STRING', 'NUMBER', 'BOOLEAN', 'JSON'].map(t => (
                    <MenuItem key={t} value={t} sx={{ fontSize: 13 }}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={1}>
              <Button fullWidth variant="contained" startIcon={<Add />}
                disabled={!newKey || !newVal} onClick={addNew}
                sx={{ bgcolor: C.primary, textTransform: 'none', fontWeight: 600, borderRadius: '8px', height: 37, fontSize: 13 }}>
                Add
              </Button>
            </Grid>
          </Grid>
        </Box>
      </SectionCard>
    </Box>
  );
}