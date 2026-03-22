// src/modules/superadmin/pages/AuditLogsPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, TextField, Select, MenuItem, FormControl, InputLabel,
  Typography, Chip, Pagination, Collapse, IconButton, Tooltip,
} from '@mui/material';
import { ExpandMore, ExpandLess, Refresh } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, C, DATE } from '../hooks';
import { fetchAuditLogs, type AuditLogEntry } from '../store/superadminSlice';
import { PageHeader, SectionCard } from '../components/ui';

const PAGE = 30;

const ACTION_COLOR: Record<string, string> = {
  CREATE: '#22c55e',
  UPDATE: '#4F7FFF',
  DELETE: '#ef4444',
  LOGIN : '#a855f7',
  LOGOUT: '#f59e0b',
  EXPORT: '#06b6d4',
};

const ENTITIES = [
  '', 'Tenant', 'Plan', 'BillingInvoice', 'PlatformSetting',
  'TenantSubscription', 'TenantAddon', 'AIAgent', 'AIUsage',
  'TelephonyUsage', 'TenantDomain',
];

// Single expandable row
function LogRow({ log }: { log: AuditLogEntry }) {
  const [open, setOpen] = useState(false);
  const ac = ACTION_COLOR[log.action] ?? C.primary;
  const hasChanges = log.oldValues || log.newValues;

  return (
    <>
      <Box
        display="flex" alignItems="center" gap={2}
        px={2.5} py={1.25}
        sx={{
          borderBottom: `1px solid ${C.border}`,
          '&:hover': { bgcolor: 'rgba(79,127,255,0.02)' },
          cursor: hasChanges ? 'pointer' : 'default',
        }}
        onClick={() => hasChanges && setOpen(o => !o)}
      >
        {/* Action chip */}
        <Box sx={{ minWidth: 72 }}>
          <Chip label={log.action} size="small"
            sx={{ fontSize: 10, height: 20, bgcolor: `${ac}15`, color: ac, fontWeight: 600 }} />
        </Box>

        {/* Entity */}
        <Box sx={{ minWidth: 160 }}>
          <Typography sx={{ color: C.text, fontSize: 12.5 }}>{log.entity}</Typography>
          {log.entityId && (
            <Typography sx={{ color: C.textSub, fontSize: 10.5, fontFamily: 'monospace' }}>
              #{log.entityId.slice(-8)}
            </Typography>
          )}
        </Box>

        {/* Tenant */}
        <Box sx={{ minWidth: 130 }}>
          <Typography sx={{ color: C.textSub, fontSize: 12 }}>{log.tenant?.name ?? '—'}</Typography>
        </Box>

        {/* Performed by */}
        <Box sx={{ flex: 1 }}>
          {log.user ? (
            <>
              <Typography sx={{ color: C.text, fontSize: 12 }}>{log.user.name}</Typography>
              <Typography sx={{ color: C.textSub, fontSize: 10.5 }}>{log.user.role}</Typography>
            </>
          ) : (
            <Typography sx={{ color: C.textSub, fontSize: 12, fontStyle: 'italic' }}>System</Typography>
          )}
        </Box>

        {/* IP */}
        <Box sx={{ minWidth: 120 }}>
          <Typography sx={{ color: C.textSub, fontSize: 11, fontFamily: 'monospace' }}>
            {log.ipAddress ?? '—'}
          </Typography>
        </Box>

        {/* Date */}
        <Box sx={{ minWidth: 110 }}>
          <Typography sx={{ color: C.textSub, fontSize: 12 }}>{DATE(log.createdAt)}</Typography>
        </Box>

        {/* Expand toggle */}
        <Box sx={{ minWidth: 28 }}>
          {hasChanges && (
            <IconButton size="small" sx={{ color: C.muted, p: 0 }}>
              {open ? <ExpandLess sx={{ fontSize: 16 }} /> : <ExpandMore sx={{ fontSize: 16 }} />}
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Change diff */}
      {hasChanges && (
        <Collapse in={open}>
          <Box px={2.5} py={1.5} sx={{ bgcolor: C.surfaceHigh, borderBottom: `1px solid ${C.border}` }}>
            <Box display="flex" gap={3} flexWrap="wrap">
              {log.oldValues && (
                <Box flex={1} minWidth={200}>
                  <Typography sx={{ color: C.danger, fontSize: 10.5, fontWeight: 600, mb: 0.75, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Before
                  </Typography>
                  <Box sx={{
                    bgcolor: 'rgba(239,68,68,0.06)', borderRadius: '8px', p: 1.25,
                    fontFamily: 'monospace', fontSize: 11.5, color: C.textSub,
                    whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                  }}>
                    {JSON.stringify(log.oldValues, null, 2)}
                  </Box>
                </Box>
              )}
              {log.newValues && (
                <Box flex={1} minWidth={200}>
                  <Typography sx={{ color: C.success, fontSize: 10.5, fontWeight: 600, mb: 0.75, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    After
                  </Typography>
                  <Box sx={{
                    bgcolor: 'rgba(34,197,94,0.06)', borderRadius: '8px', p: 1.25,
                    fontFamily: 'monospace', fontSize: 11.5, color: C.textSub,
                    whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                  }}>
                    {JSON.stringify(log.newValues, null, 2)}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Collapse>
      )}
    </>
  );
}

export default function AuditLogsPage() {
  const dispatch = useAppDispatch();
  const { auditLogs, loading } = useAppSelector(s => s.superadmin);
  const [search, setSearch] = useState('');
  const [entity, setEntity] = useState('');
  const [page,   setPage]   = useState(1);
  const busy = !!loading.auditLogs;

  const load = () => {
    dispatch(fetchAuditLogs({
      entity: entity || undefined,
      skip  : (page - 1) * PAGE,
      take  : PAGE,
    }));
  };

  useEffect(() => { load(); }, [entity, page]);

  // Client-side text filter
  const filtered = auditLogs.data.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.entity?.toLowerCase().includes(q) ||
      r.action?.toLowerCase().includes(q) ||
      r.user?.name?.toLowerCase().includes(q) ||
      r.user?.email?.toLowerCase().includes(q) ||
      r.tenant?.name?.toLowerCase().includes(q) ||
      r.entityId?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil((auditLogs.total || 0) / PAGE);

  return (
    <Box>
      <PageHeader
        title="Audit Logs"
        subtitle={`${auditLogs.total.toLocaleString('en-IN')} total entries — every platform action recorded`}
        action={
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={load}
              sx={{ color: C.muted, border: `1px solid ${C.border}`, borderRadius: '8px', p: 0.75 }}>
              <Refresh sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        }
      />

      {/* Filters */}
      <Box display="flex" gap={1.5} mb={2} flexWrap="wrap">
        <TextField
          size="small"
          placeholder="Search action, entity, user, tenant…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{
            width: 300,
            '& .MuiOutlinedInput-root': {
              bgcolor: C.surface, color: C.text, borderRadius: '8px',
              '& fieldset': { borderColor: C.border }, fontSize: 13,
            },
          }}
          inputProps={{ style: { fontSize: 13 } }}
        />
        <FormControl size="small" sx={{ minWidth: 170 }}>
          <InputLabel sx={{ color: C.textSub, fontSize: 13 }}>Entity Filter</InputLabel>
          <Select value={entity} label="Entity Filter"
            onChange={e => { setEntity(e.target.value); setPage(1); }}
            sx={{
              bgcolor: C.surface, color: C.text, borderRadius: '8px',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: C.border }, fontSize: 13,
            }}>
            {ENTITIES.map(e => (
              <MenuItem key={e} value={e} sx={{ fontSize: 13 }}>{e || 'All Entities'}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Column header */}
      <Box display="flex" alignItems="center" gap={2}
        px={2.5} py={1}
        sx={{ bgcolor: C.surfaceHigh, borderRadius: '12px 12px 0 0', borderBottom: `1px solid ${C.border}` }}>
        {[
          { label: 'Action',  w: 72  },
          { label: 'Entity',  w: 160 },
          { label: 'Tenant',  w: 130 },
          { label: 'Performed By', flex: 1 },
          { label: 'IP',      w: 120 },
          { label: 'Date',    w: 110 },
          { label: '',        w: 28  },
        ].map(col => (
          <Box key={col.label} sx={{ minWidth: col.w, flex: col.flex }}>
            <Typography sx={{ color: C.textSub, fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {col.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Log rows */}
      <Box sx={{ bgcolor: C.surface, borderRadius: '0 0 14px 14px', border: `1px solid ${C.border}`, borderTop: 'none', overflow: 'hidden' }}>
        {busy
          ? Array.from({ length: 8 }).map((_, i) => (
            <Box key={i} px={2.5} py={1.5} sx={{ borderBottom: `1px solid ${C.border}` }}>
              <Box sx={{ height: 14, bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 1, width: '70%' }} />
            </Box>
          ))
          : filtered.length === 0
            ? (
              <Box py={5} textAlign="center">
                <Typography sx={{ color: C.textSub, fontSize: 13 }}>No audit records found</Typography>
              </Box>
            )
            : filtered.map(log => <LogRow key={log.id} log={log} />)
        }
      </Box>

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)}
            sx={{ '& .MuiPaginationItem-root': { color: C.textSub, '&.Mui-selected': { bgcolor: `${C.primary}22`, color: C.primary } } }} />
        </Box>
      )}
    </Box>
  );
}