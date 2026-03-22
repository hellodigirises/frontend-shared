// src/modules/superadmin/pages/TenantsPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, TextField, Select, MenuItem, FormControl, InputLabel,
  Pagination, Avatar, Typography, IconButton, Tooltip,
} from '@mui/material';
import { Add, Visibility, Block, CheckCircle, Refresh } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, C, DATE } from '../hooks';
import { fetchTenants, doSuspendTenant, doActivateTenant, type Tenant } from '../store/superadminSlice';
import { PageHeader, StatusChip, SectionCard, DataTable } from '../components/ui';
import CreateTenantDialog from '../components/CreateTenantDialog';

const PAGE = 15;

export default function TenantsPage() {
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const { tenants, loading } = useAppSelector(s => s.superadmin);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page,   setPage]   = useState(1);
  const [open,   setOpen]   = useState(false);
  const busy = !!loading.tenants;

  const load = useCallback(() => {
    dispatch(fetchTenants({
      search: search || undefined, status: status || undefined,
      skip: (page - 1) * PAGE, take: PAGE,
    }));
  }, [dispatch, search, status, page]);

  useEffect(() => { load(); }, [load]);

  const cols = [
    { label: 'Tenant', render: (r: Tenant) => (
      <Box display="flex" alignItems="center" gap={1.5}>
        <Avatar sx={{ width: 28, height: 28, bgcolor: `${C.primary}22`, color: C.primary, fontSize: 11, fontWeight: 700 }}>
          {r.name.charAt(0)}
        </Avatar>
        <Box>
          <Typography sx={{ color: C.text, fontSize: 12.5, fontWeight: 500, lineHeight: 1.2 }}>{r.name}</Typography>
          <Typography sx={{ color: C.textSub, fontSize: 11 }}>{r.email}</Typography>
        </Box>
      </Box>
    )},
    { label: 'Client ID', render: (r: Tenant) =>
      <Typography sx={{ color: C.textSub, fontSize: 11, fontFamily: 'monospace' }}>{r.clientId}</Typography> },
    { label: 'Plan', render: (r: Tenant) =>
      <Typography sx={{ color: C.text, fontSize: 12.5 }}>{r.subscriptions?.[0]?.plan?.name ?? r.subscriptionPlan}</Typography> },
    { label: 'Status', render: (r: Tenant) => <StatusChip status={r.status} /> },
    { label: 'Users', render: (r: Tenant) =>
      <Typography sx={{ color: C.textSub, fontSize: 12.5 }}>{r._count?.users ?? 0} / {r.maxUsers}</Typography> },
    { label: 'Renewal', render: (r: Tenant) =>
      <Typography sx={{ color: C.textSub, fontSize: 12 }}>{DATE(r.subscriptions?.[0]?.currentPeriodEnd)}</Typography> },
    { label: 'Joined', render: (r: Tenant) =>
      <Typography sx={{ color: C.textSub, fontSize: 12 }}>{DATE(r.createdAt)}</Typography> },
    { label: '', render: (r: Tenant) => (
      <Box display="flex" gap={0.25}>
        <Tooltip title="View">
          <IconButton size="small" sx={{ color: C.primary }}
            onClick={e => { e.stopPropagation(); nav(`/superadmin/tenants/${r.id}`); }}>
            <Visibility sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
        {r.status === 'ACTIVE' || r.status === 'TRIAL'
          ? <Tooltip title="Suspend">
              <IconButton size="small" sx={{ color: C.danger }}
                onClick={e => { e.stopPropagation(); dispatch(doSuspendTenant(r.id)); }}>
                <Block sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          : <Tooltip title="Activate">
              <IconButton size="small" sx={{ color: C.success }}
                onClick={e => { e.stopPropagation(); dispatch(doActivateTenant(r.id)); }}>
                <CheckCircle sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
        }
      </Box>
    )},
  ];

  return (
    <Box>
      <PageHeader
        title="Tenants"
        subtitle={`${tenants.total} total tenants`}
        action={
          <Box display="flex" gap={1}>
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={load} sx={{ color: C.muted, border: `1px solid ${C.border}`, borderRadius: '8px' }}>
                <Refresh sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            <Button variant="outlined" size="small" onClick={() => window.open('/Onboardingcheckout.html', '_blank')}
              sx={{ borderColor: C.primary, color: C.primary, textTransform: 'none', fontWeight: 600, borderRadius: '8px', fontSize: 13, '&:hover': { borderColor: C.primary, bgcolor: `${C.primary}11` } }}>
              Onboard Client
            </Button>
            <Button variant="contained" startIcon={<Add />} size="small" onClick={() => setOpen(true)}
              sx={{ bgcolor: C.primary, textTransform: 'none', fontWeight: 600, borderRadius: '8px', fontSize: 13 }}>
              New Tenant
            </Button>
          </Box>
        }
      />

      <Box display="flex" gap={1.5} mb={2} flexWrap="wrap">
        <TextField size="small" placeholder="Search name, email, client ID…" value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          sx={{ width: 270, '& .MuiOutlinedInput-root': { bgcolor: C.surface, color: C.text, borderRadius: '8px', '& fieldset': { borderColor: C.border }, fontSize: 13 } }}
          inputProps={{ style: { fontSize: 13 } }} />
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel sx={{ color: C.textSub, fontSize: 13 }}>Status</InputLabel>
          <Select value={status} label="Status" onChange={e => { setStatus(e.target.value); setPage(1); }}
            sx={{ bgcolor: C.surface, color: C.text, borderRadius: '8px', '& .MuiOutlinedInput-notchedOutline': { borderColor: C.border }, fontSize: 13 }}>
            <MenuItem value="" sx={{ fontSize: 13 }}>All</MenuItem>
            {['ACTIVE','TRIAL','SUSPENDED','CANCELLED'].map(s => (
              <MenuItem key={s} value={s} sx={{ fontSize: 13 }}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <SectionCard>
        <DataTable columns={cols as any} rows={tenants.data} loading={busy}
          emptyMsg="No tenants found" onRowClick={r => nav(`/superadmin/tenants/${r.id}`)} />
      </SectionCard>

      {Math.ceil(tenants.total / PAGE) > 1 && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination count={Math.ceil(tenants.total / PAGE)} page={page} onChange={(_, p) => setPage(p)}
            sx={{ '& .MuiPaginationItem-root': { color: C.textSub } }} />
        </Box>
      )}

      <CreateTenantDialog open={open} onClose={() => setOpen(false)} />
    </Box>
  );
}