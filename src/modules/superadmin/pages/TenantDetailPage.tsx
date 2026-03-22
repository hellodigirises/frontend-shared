// src/modules/superadmin/pages/TenantDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Tabs, Tab, Button, Avatar, Grid, IconButton, Tooltip, Chip,
} from '@mui/material';
import { ArrowBack, Block, CheckCircle } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, C, INR, DATE } from '../hooks';
import { fetchTenant, doSuspendTenant, doActivateTenant, doUpdateTenantModules } from '../store/superadminSlice';
import { StatusChip, SectionCard, DataTable, CenteredLoader, KVRow } from '../components/ui';
import { api } from '../api/superadmin.api';
import { MODULE_REGISTRY } from '../../../core/registry/modules';
import { Switch, Checkbox, FormControlLabel, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';

function Panel({ v, i, children }: { v: number; i: number; children: React.ReactNode }) {
  return v === i ? <Box pt={2.5}>{children}</Box> : null;
}

function OverviewTab({ tenant }: { tenant: any }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={5}>
        <SectionCard title="Company Info">
          <Box p={2}>
            {[
              ['Client ID',  tenant.clientId,      true ],
              ['Email',      tenant.email,          false],
              ['Phone',      tenant.phone,          false],
              ['Domain',     tenant.domain,         false],
              ['Max Users',  tenant.maxUsers,       false],
              ['Trial Ends', DATE(tenant.trialEndsAt), false],
              ['Sub. Ends',  DATE(tenant.subscriptionEndsAt), false],
              ['Created',    DATE(tenant.createdAt), false],
            ].map(([l, v, m]) => <KVRow key={l as string} label={l as string} value={String(v ?? '—')} mono={!!m} />)}
          </Box>
        </SectionCard>
      </Grid>
      <Grid item xs={12} md={7}>
        <Grid container spacing={2} mb={2}>
          {[
            { l: 'Users',    v: tenant._count?.users      ?? 0, c: C.primary },
            { l: 'Leads',    v: tenant._count?.leads      ?? 0, c: C.success },
            { l: 'Bookings', v: tenant._count?.bookings   ?? 0, c: C.warning },
            { l: 'Invoices', v: tenant._count?.billingInvoices ?? 0, c: C.purple },
          ].map(({ l, v, c }) => (
            <Grid item xs={6} key={l}>
              <Box sx={{ bgcolor: C.surfaceHigh, borderRadius: '12px', p: 2, border: `1px solid ${C.border}` }}>
                <Typography sx={{ color: C.textSub, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>{l}</Typography>
                <Typography sx={{ color: c, fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>{v}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
        <SectionCard title="Domains">
          <Box p={2}>
            {(tenant.domains?.length ?? 0) === 0
              ? <Typography sx={{ color: C.textSub, fontSize: 13 }}>No domains configured</Typography>
              : tenant.domains.map((d: any) => (
                <Box key={d.id} display="flex" justifyContent="space-between" py={0.85}
                  sx={{ borderBottom: `1px solid ${C.border}` }}>
                  <Typography sx={{ color: C.text, fontSize: 13 }}>{d.domain}</Typography>
                  <Box display="flex" gap={0.5}>
                    <Chip label={d.type}      size="small" sx={{ fontSize: 10, height: 19, bgcolor: `${C.primary}15`, color: C.primary }} />
                    {d.verified   && <Chip label="Verified" size="small" sx={{ fontSize: 10, height: 19, bgcolor: `${C.success}15`, color: C.success }} />}
                    {d.sslActive  && <Chip label="SSL"      size="small" sx={{ fontSize: 10, height: 19, bgcolor: `${C.cyan}15`,    color: C.cyan    }} />}
                    {d.primary    && <Chip label="Primary"  size="small" sx={{ fontSize: 10, height: 19, bgcolor: `${C.warning}15`, color: C.warning }} />}
                  </Box>
                </Box>
              ))
            }
          </Box>
        </SectionCard>
      </Grid>
    </Grid>
  );
}

function SubscriptionTab({ tenant }: { tenant: any }) {
  const sub = tenant.subscriptions?.[0];
  return (
    <SectionCard title="Active Subscription">
      <Box p={2.5}>
        {!sub
          ? <Typography sx={{ color: C.textSub, fontSize: 13 }}>No active subscription</Typography>
          : <>
            {[
              ['Plan',          sub.plan?.name],
              ['Price',         INR(sub.plan?.price ?? 0)],
              ['Billing Cycle', sub.billingCycle],
              ['Period Start',  DATE(sub.currentPeriodStart)],
              ['Period End',    DATE(sub.currentPeriodEnd)],
            ].map(([l, v]) => <KVRow key={l} label={l} value={v ?? '—'} />)}
            <Box mt={1.5}><KVRow label="Status" value={<StatusChip status={sub.status} />} /></Box>
            {(sub.plan?.modules?.length ?? 0) > 0 && (
              <>
                <Typography sx={{ color: C.textSub, fontSize: 11, mt: 2, mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Included Modules
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={0.75}>
                  {sub.plan.modules.map((m: any) => (
                    <Chip key={m.module} label={m.module} size="small"
                      sx={{ bgcolor: `${C.primary}12`, color: C.primary, fontSize: 10.5, height: 22 }} />
                  ))}
                </Box>
              </>
            )}
          </>
        }
      </Box>
    </SectionCard>
  );
}

function AddonsTab({ tenant }: { tenant: any }) {
  return (
    <SectionCard title="Assigned Add-ons">
      <Box p={2}>
        {(tenant.tenantAddons?.length ?? 0) === 0
          ? <Typography sx={{ color: C.textSub, fontSize: 13 }}>No add-ons assigned</Typography>
          : tenant.tenantAddons.map((ta: any, i: number) => (
            <Box key={i} display="flex" justifyContent="space-between" py={0.85}
              sx={{ borderBottom: `1px solid ${C.border}` }}>
              <Typography sx={{ color: C.text, fontSize: 13 }}>{ta.addon.name}</Typography>
              <Chip label={ta.addon.type} size="small"
                sx={{ fontSize: 10, height: 19, bgcolor: `${C.cyan}15`, color: C.cyan }} />
            </Box>
          ))
        }
      </Box>
    </SectionCard>
  );
}

function BillingTab({ tenantId }: { tenantId: string }) {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    api.get('/invoices', { params: { tenantId, take: 10 } }).then(r => setRows(r.data.data?.data ?? []));
  }, [tenantId]);
  return (
    <SectionCard title="Recent Invoices">
      <DataTable
        columns={[
          { label:'Invoice #', render: r => <Typography sx={{ fontFamily:'monospace', color:C.text, fontSize:12 }}>{r.invoiceNumber}</Typography> },
          { label:'Amount',    render: r => <Typography sx={{ color:C.text, fontSize:12, fontWeight:600 }}>{INR(r.totalAmount)}</Typography> },
          { label:'Status',    render: r => <StatusChip status={r.status} /> },
          { label:'Due',       render: r => <Typography sx={{ color:C.textSub, fontSize:12 }}>{DATE(r.dueDate)}</Typography> },
          { label:'Paid',      render: r => <Typography sx={{ color:C.textSub, fontSize:12 }}>{DATE(r.paidAt)}</Typography> },
        ]}
        rows={rows} emptyMsg="No invoices" />
    </SectionCard>
  );
}

function AITab({ tenantId }: { tenantId: string }) {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    api.get('/ai-usage', { params: { tenantId, take: 20 } }).then(r => setRows(r.data.data?.data ?? []));
  }, [tenantId]);
  return (
    <SectionCard title="AI Usage">
      <DataTable
        columns={[
          { label:'Agent',     render: r => <Typography sx={{ color:C.text,    fontSize:12 }}>{r.agent?.name}</Typography> },
          { label:'Minutes',   render: r => <Typography sx={{ color:C.text,    fontSize:12 }}>{Number(r.minutes).toFixed(2)}</Typography> },
          { label:'Tokens In', render: r => <Typography sx={{ color:C.textSub, fontSize:12 }}>{r.inputTokens}</Typography> },
          { label:'Tokens Out',render: r => <Typography sx={{ color:C.textSub, fontSize:12 }}>{r.outputTokens}</Typography> },
          { label:'Cost',      render: r => <Typography sx={{ color:C.text,    fontSize:12, fontWeight:600 }}>{INR(r.cost)}</Typography> },
          { label:'Date',      render: r => <Typography sx={{ color:C.textSub, fontSize:12 }}>{DATE(r.createdAt)}</Typography> },
        ]}
        rows={rows} emptyMsg="No AI usage" />
    </SectionCard>
  );
}

function TelephonyTab({ tenantId }: { tenantId: string }) {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    api.get('/telephony/usage', { params: { tenantId, take: 20 } }).then(r => setRows(r.data.data?.data ?? []));
  }, [tenantId]);
  return (
    <SectionCard title="Telephony">
      <DataTable
        columns={[
          { label:'Minutes',   render: r => <Typography sx={{ color:C.text,    fontSize:12 }}>{Number(r.minutes).toFixed(2)}</Typography> },
          { label:'Direction', render: r => <Typography sx={{ color:C.textSub, fontSize:12 }}>{r.direction}</Typography> },
          { label:'Rate/min',  render: r => <Typography sx={{ color:C.textSub, fontSize:12 }}>{INR(r.ratePerMin)}</Typography> },
          { label:'Cost',      render: r => <Typography sx={{ color:C.text,    fontSize:12, fontWeight:600 }}>{INR(r.cost)}</Typography> },
          { label:'Provider',  render: r => <Typography sx={{ color:C.textSub, fontSize:11 }}>{r.provider ?? '—'}</Typography> },
          { label:'Date',      render: r => <Typography sx={{ color:C.textSub, fontSize:12 }}>{DATE(r.createdAt)}</Typography> },
        ]}
        rows={rows} emptyMsg="No telephony records" />
    </SectionCard>
  );
}

function AuditTab({ tenantId }: { tenantId: string }) {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    api.get('/audit-logs', { params: { tenantId, take: 30 } }).then(r => setRows(r.data.data?.data ?? []));
  }, [tenantId]);
  return (
    <SectionCard title="Audit Logs">
      <DataTable
        columns={[
          { label:'Action', render: r => <Chip label={r.action} size="small" sx={{ fontSize:10, height:20, bgcolor:`${C.primary}15`, color:C.primary }} /> },
          { label:'Entity', render: r => <Typography sx={{ color:C.text, fontSize:12 }}>{r.entity}</Typography> },
          { label:'By',     render: r => <Typography sx={{ color:C.textSub, fontSize:12 }}>{r.user?.name ?? 'System'}</Typography> },
          { label:'IP',     render: r => <Typography sx={{ color:C.textSub, fontSize:11, fontFamily:'monospace' }}>{r.ipAddress ?? '—'}</Typography> },
          { label:'Date',   render: r => <Typography sx={{ color:C.textSub, fontSize:12 }}>{DATE(r.createdAt)}</Typography> },
        ]}
        rows={rows} emptyMsg="No audit records" />
    </SectionCard>
  );
}

function ModulesTab({ tenant }: { tenant: any }) {
  const dispatch = useAppDispatch();
  // Config shape: { enabledModules: string[], disabledPages: string[] }
  const [cfg, setCfg] = useState<{ enabledModules: string[], disabledPages: string[] }>(
    tenant.modules?.enabledModules ? tenant.modules : { enabledModules: [], disabledPages: [] }
  );

  const toggleModule = (modId: string) => {
    const isEnabled = cfg.enabledModules.includes(modId);
    setCfg(prev => ({
      ...prev,
      enabledModules: isEnabled 
        ? prev.enabledModules.filter(id => id !== modId)
        : [...prev.enabledModules, modId]
    }));
  };

  const togglePage = (pageId: string) => {
    const isDisabled = cfg.disabledPages.includes(pageId);
    setCfg(prev => ({
      ...prev,
      disabledPages: isDisabled
        ? prev.disabledPages.filter(id => id !== pageId)
        : [...prev.disabledPages, pageId]
    }));
  };

  const save = () => {
    dispatch(doUpdateTenantModules({ id: tenant.id, modules: cfg }));
  };

  return (
    <SectionCard title="Granular Feature Control">
      <Box p={3}>
        <Typography sx={{ color: C.textSub, fontSize: 13, mb: 3 }}>
          Turn off entire modules or specific pages for this tenant. 
          Settings here override default plan configurations.
        </Typography>

        {MODULE_REGISTRY.map(mod => {
          const modEnabled = cfg.enabledModules.includes(mod.id);
          return (
            <Accordion key={mod.id} disableGutters elevation={0} 
              sx={{ 
                border: `1px solid ${C.border}`, mb: 1.5, borderRadius: '8px !important',
                '&:before': { display: 'none' }, bgcolor: C.surface
              }}>
              <AccordionSummary expandIcon={<ExpandMore sx={{ fontSize: 18, color: C.muted }} />}>
                <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" pr={2}>
                  <Typography sx={{ fontWeight: 600, fontSize: 14, color: modEnabled ? C.primary : C.textSub }}>
                    {mod.label}
                  </Typography>
                  <Switch size="small" checked={modEnabled} onChange={() => toggleModule(mod.id)} 
                    onClick={e => e.stopPropagation()} 
                    sx={{ '& .Mui-checked + .MuiSwitch-track': { bgcolor: `${C.primary} !important` } }} />
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3, pb: 2, pt: 0, borderTop: `1px solid ${C.border}` }}>
                <Typography sx={{ fontSize: 11, color: C.textSub, mt: 1.5, mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Available Pages
                </Typography>
                <Grid container spacing={1}>
                  {mod.pages.map(pg => {
                    const pageDisabled = cfg.disabledPages.includes(pg.id);
                    return (
                      <Grid item xs={12} sm={6} md={4} key={pg.id}>
                        <FormControlLabel
                          disabled={!modEnabled}
                          control={
                            <Checkbox size="small" checked={modEnabled && !pageDisabled} 
                              onChange={() => togglePage(pg.id)}
                              sx={{ color: C.border, '&.Mui-checked': { color: C.primary } }} />
                          }
                          label={<Typography sx={{ fontSize: 13, color: modEnabled && !pageDisabled ? C.text : C.textSub }}>{pg.label}</Typography>}
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              </AccordionDetails>
            </Accordion>
          );
        })}

        <Box mt={4}>
          <Button variant="contained" onClick={save}
            sx={{ bgcolor: C.primary, textTransform: 'none', px: 4, py: 1, borderRadius: '8px', fontWeight: 600 }}>
            Apply Changes
          </Button>
        </Box>
      </Box>
    </SectionCard>
  );
}

const TABS = ['Overview','Subscription','Modules','Add-ons','Billing','AI Usage','Telephony','Audit Logs'];

export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const { tenant } = useAppSelector(s => s.superadmin);
  const [tab, setTab] = useState(0);

  useEffect(() => { if (id) dispatch(fetchTenant(id)); }, [id, dispatch]);

  if (!tenant) return <CenteredLoader />;

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
        <IconButton size="small" onClick={() => nav('/superadmin/tenants')}
          sx={{ color: C.muted, border: `1px solid ${C.border}`, borderRadius: '8px', p: 0.6 }}>
          <ArrowBack sx={{ fontSize: 15 }} />
        </IconButton>
        <Avatar sx={{ width: 36, height: 36, bgcolor: `${C.primary}22`, color: C.primary, fontWeight: 700, fontSize: 14 }}>
          {tenant.name.charAt(0)}
        </Avatar>
        <Box flex={1}>
          <Typography sx={{ color: C.text, fontSize: 16, fontWeight: 700, letterSpacing: -0.3 }}>{tenant.name}</Typography>
          <Typography sx={{ color: C.textSub, fontSize: 12 }}>{tenant.clientId} · {tenant.email}</Typography>
        </Box>
        <StatusChip status={tenant.status} />
        {tenant.status === 'ACTIVE' || tenant.status === 'TRIAL'
          ? <Button size="small" startIcon={<Block />} onClick={() => dispatch(doSuspendTenant(tenant.id))}
              sx={{ color: C.danger, borderColor: `${C.danger}40`, textTransform:'none', fontSize:12, borderRadius:'8px', border:'1px solid' }}>
              Suspend
            </Button>
          : <Button size="small" startIcon={<CheckCircle />} onClick={() => dispatch(doActivateTenant(tenant.id))}
              sx={{ color: C.success, borderColor: `${C.success}40`, textTransform:'none', fontSize:12, borderRadius:'8px', border:'1px solid' }}>
              Activate
            </Button>
        }
      </Box>

      <Box sx={{ borderBottom: `1px solid ${C.border}` }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{
          '& .MuiTab-root'       : { color: C.textSub, fontSize: 12.5, textTransform:'none', minHeight: 40, px: 2 },
          '& .Mui-selected'      : { color: `${C.primary} !important` },
          '& .MuiTabs-indicator' : { bgcolor: C.primary },
        }}>
          {TABS.map(t => <Tab key={t} label={t} />)}
        </Tabs>
      </Box>

      <Panel v={tab} i={0}><OverviewTab    tenant={tenant} /></Panel>
      <Panel v={tab} i={1}><SubscriptionTab tenant={tenant} /></Panel>
      <Panel v={tab} i={2}><ModulesTab      tenant={tenant} /></Panel>
      <Panel v={tab} i={3}><AddonsTab       tenant={tenant} /></Panel>
      <Panel v={tab} i={4}><BillingTab      tenantId={tenant.id} /></Panel>
      <Panel v={tab} i={5}><AITab           tenantId={tenant.id} /></Panel>
      <Panel v={tab} i={6}><TelephonyTab    tenantId={tenant.id} /></Panel>
      <Panel v={tab} i={7}><AuditTab        tenantId={tenant.id} /></Panel>
    </Box>
  );
}