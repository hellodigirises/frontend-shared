/**
 * TenantTabs.tsx
 * All 8 tab content panels for the TenantDetailPage.
 * Each tab is exported individually so they can be tested independently.
 */
import React from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Switch,
  LinearProgress, Divider, Table, TableBody, TableCell,
  TableHead, TableRow, Stack,
} from '@mui/material';
import type { TenantDetail } from './superadminSlice';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    notation: 'compact', maximumFractionDigits: 1,
  }).format(n);

// ─── Overview Tab ──────────────────────────────────────────────────────────────
export const OverviewTab: React.FC<{ tenant: TenantDetail }> = ({ tenant }) => (
  <Grid container spacing={2.5}>
    {[
      { label: 'Total Revenue',    value: fmt(tenant.overview.totalRevenue)  },
      { label: 'Active Users',     value: tenant.overview.activeUsers.toLocaleString() },
      { label: 'API Calls',        value: new Intl.NumberFormat('en-US', { notation: 'compact' }).format(tenant.overview.apiCalls) },
      { label: 'Support Tickets',  value: String(tenant.overview.supportTickets) },
    ].map(c => (
      <Grid item xs={6} md={3} key={c.label}>
        <Card variant="outlined">
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h5" fontWeight={700}>{c.value}</Typography>
            <Typography variant="caption" color="text.secondary">{c.label}</Typography>
          </CardContent>
        </Card>
      </Grid>
    ))}

    <Grid item xs={12}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} mb={2}>Storage Usage</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">{tenant.overview.storageUsedGB} GB used</Typography>
            <Typography variant="body2" color="text.secondary">{tenant.overview.storageCapacityGB} GB total</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={(tenant.overview.storageUsedGB / tenant.overview.storageCapacityGB) * 100}
            sx={{ height: 8, borderRadius: 4, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { bgcolor: '#6366F1' } }}
          />
        </CardContent>
      </Card>
    </Grid>
  </Grid>
);

// ─── Subscription Tab ──────────────────────────────────────────────────────────
export const SubscriptionTab: React.FC<{ tenant: TenantDetail }> = ({ tenant }) => (
  <Grid container spacing={2.5}>
    <Grid item xs={12} md={6}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} mb={2}>Plan Details</Typography>
          {([
            ['Plan',          tenant.subscription.planName],
            ['Price',         fmt(tenant.subscription.price) + '/mo'],
            ['Billing Cycle', tenant.subscription.billingCycle],
            ['Start Date',    new Date(tenant.subscription.startDate).toLocaleDateString()],
            ['End Date',      new Date(tenant.subscription.endDate).toLocaleDateString()],
            ['Discount',      `${tenant.subscription.discount}%`],
            ['Auto Renew',    tenant.subscription.autoRenew ? 'Yes' : 'No'],
          ] as [string, string][]).map(([k, v]) => (
            <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary">{k}</Typography>
              <Typography variant="body2" fontWeight={500} textTransform="capitalize">{v}</Typography>
            </Box>
          ))}
        </CardContent>
      </Card>
    </Grid>
    <Grid item xs={12} md={6}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} mb={2}>Add-Ons</Typography>
          {tenant.subscription.addOns.map(addon => (
            <Box key={addon.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box>
                <Typography variant="body2" fontWeight={500}>{addon.name}</Typography>
                <Typography variant="caption" color="text.secondary">{fmt(addon.price)}/mo</Typography>
              </Box>
              <Switch checked={addon.enabled} size="small" color="primary" readOnly />
            </Box>
          ))}
        </CardContent>
      </Card>
    </Grid>
  </Grid>
);

// ─── Modules Tab ──────────────────────────────────────────────────────────────
export const ModulesTab: React.FC<{ tenant: TenantDetail }> = ({ tenant }) => (
  <Grid container spacing={2}>
    {tenant.modules.map(mod => (
      <Grid item xs={12} sm={6} md={4} key={mod.id}>
        <Card variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" fontWeight={600}>{mod.name}</Typography>
              <Switch checked={mod.enabled} size="small" color="primary" readOnly />
            </Box>
            {mod.enabled && (
              <>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  {mod.usageCount.toLocaleString()} total uses
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Last: {mod.lastUsed ? new Date(mod.lastUsed).toLocaleDateString() : '—'}
                </Typography>
              </>
            )}
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);

// ─── AI Agents Tab ────────────────────────────────────────────────────────────
export const AIAgentsTab: React.FC<{ tenant: TenantDetail }> = ({ tenant }) => (
  <Stack spacing={2}>
    {tenant.aiAgents.map(agent => (
      <Card key={agent.id} variant="outlined">
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>{agent.name}</Typography>
              <Typography variant="caption" color="text.secondary" textTransform="capitalize">{agent.type}</Typography>
            </Box>
            <Chip label={agent.status} size="small" sx={{
              bgcolor: agent.status === 'active' ? '#DCFCE7' : agent.status === 'training' ? '#FEF9C3' : '#F3F4F6',
              color:   agent.status === 'active' ? '#16A34A' : agent.status === 'training' ? '#CA8A04' : '#6B7280',
              fontWeight: 600, textTransform: 'capitalize', fontSize: 11,
            }} />
          </Box>
          <Grid container spacing={2}>
            {([
              ['Conversations Today', agent.conversationsToday],
              ['Total Conversations', agent.totalConversations.toLocaleString()],
              ['Avg Response Time',   `${agent.avgResponseTime}s`],
              ['Accuracy',            `${agent.accuracy}%`],
            ] as [string, string | number][]).map(([label, val]) => (
              <Grid item xs={6} sm={3} key={String(label)}>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
                <Typography variant="body2" fontWeight={600}>{val}</Typography>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    ))}
  </Stack>
);

// ─── Telephony Tab ────────────────────────────────────────────────────────────
export const TelephonyTab: React.FC<{ tenant: TenantDetail }> = ({ tenant }) => {
  const t = tenant.telephony;
  const pct = (t.minutesUsed / t.minutesLimit) * 100;
  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12} md={6}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle2" fontWeight={600} mb={2}>Configuration</Typography>
            {([
              ['Provider',    t.provider],
              ['Status',      t.status],
              ['Calls Today', String(t.callsToday)],
              ['Total Calls', t.totalCalls.toLocaleString()],
            ] as [string, string][]).map(([k, v]) => (
              <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary">{k}</Typography>
                <Typography variant="body2" fontWeight={500} textTransform="capitalize">{v}</Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle2" fontWeight={600} mb={2}>Minutes Usage</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">{t.minutesUsed.toLocaleString()} used</Typography>
              <Typography variant="body2" color="text.secondary">{t.minutesLimit.toLocaleString()} limit</Typography>
            </Box>
            <LinearProgress
              variant="determinate" value={pct}
              sx={{ height: 8, borderRadius: 4, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { bgcolor: pct > 80 ? '#EF4444' : '#6366F1' } }}
            />
            <Typography variant="caption" color="text.secondary" mt={1} display="block">{pct.toFixed(0)}% used</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" fontWeight={600} mb={1}>Phone Numbers</Typography>
            {t.phoneNumbers.map(n => (
              <Typography key={n} variant="body2" color="text.secondary">{n}</Typography>
            ))}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// ─── Users Tab ────────────────────────────────────────────────────────────────
export const UsersTab: React.FC<{ tenant: TenantDetail }> = ({ tenant }) => (
  <Card variant="outlined">
    <Table>
      <TableHead>
        <TableRow sx={{ '& th': { fontWeight: 600, fontSize: 12, color: 'text.secondary', textTransform: 'uppercase', bgcolor: '#F9FAFB' } }}>
          <TableCell>Name</TableCell><TableCell>Email</TableCell>
          <TableCell>Role</TableCell><TableCell>Status</TableCell><TableCell>Last Login</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {tenant.users.map(u => (
          <TableRow key={u.id} hover>
            <TableCell><Typography variant="body2" fontWeight={500}>{u.name}</Typography></TableCell>
            <TableCell><Typography variant="body2" color="text.secondary">{u.email}</Typography></TableCell>
            <TableCell><Chip label={u.role} size="small" variant="outlined" sx={{ fontSize: 11 }} /></TableCell>
            <TableCell>
              <Chip label={u.status} size="small" sx={{
                bgcolor: u.status === 'active' ? '#DCFCE7' : '#F3F4F6',
                color:   u.status === 'active' ? '#16A34A' : '#6B7280',
                fontWeight: 600, fontSize: 11,
              }} />
            </TableCell>
            <TableCell><Typography variant="body2" color="text.secondary">{new Date(u.lastLogin).toLocaleDateString()}</Typography></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Card>
);

// ─── Billing Tab ──────────────────────────────────────────────────────────────
export const BillingTab: React.FC<{ tenant: TenantDetail }> = ({ tenant }) => (
  <Card variant="outlined">
    <Table>
      <TableHead>
        <TableRow sx={{ '& th': { fontWeight: 600, fontSize: 12, color: 'text.secondary', textTransform: 'uppercase', bgcolor: '#F9FAFB' } }}>
          <TableCell>Date</TableCell><TableCell>Description</TableCell>
          <TableCell align="right">Amount</TableCell><TableCell>Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {tenant.billing.map(r => (
          <TableRow key={r.id} hover>
            <TableCell><Typography variant="body2">{new Date(r.date).toLocaleDateString()}</Typography></TableCell>
            <TableCell><Typography variant="body2">{r.description}</Typography></TableCell>
            <TableCell align="right"><Typography variant="body2" fontWeight={600}>{fmt(r.amount)}</Typography></TableCell>
            <TableCell>
              <Chip label={r.status} size="small" sx={{
                bgcolor: r.status === 'paid' ? '#DCFCE7' : r.status === 'pending' ? '#FEF9C3' : '#FEE2E2',
                color:   r.status === 'paid' ? '#16A34A' : r.status === 'pending' ? '#CA8A04' : '#DC2626',
                fontWeight: 600, fontSize: 11, textTransform: 'capitalize',
              }} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Card>
);

// ─── Audit Tab ────────────────────────────────────────────────────────────────
export const AuditTab: React.FC<{ tenant: TenantDetail }> = ({ tenant }) => (
  <Card variant="outlined">
    <Table>
      <TableHead>
        <TableRow sx={{ '& th': { fontWeight: 600, fontSize: 12, color: 'text.secondary', textTransform: 'uppercase', bgcolor: '#F9FAFB' } }}>
          <TableCell>Action</TableCell><TableCell>Actor</TableCell>
          <TableCell>Target</TableCell><TableCell>IP</TableCell><TableCell>Time</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {tenant.auditLogs.map(log => (
          <TableRow key={log.id} hover>
            <TableCell><Typography variant="body2" fontWeight={500}>{log.action}</Typography></TableCell>
            <TableCell><Typography variant="body2">{log.actor}</Typography></TableCell>
            <TableCell><Typography variant="body2" color="text.secondary">{log.target}</Typography></TableCell>
            <TableCell><Typography variant="caption" color="text.secondary" fontFamily="monospace">{log.ip}</Typography></TableCell>
            <TableCell><Typography variant="caption" color="text.secondary">{new Date(log.timestamp).toLocaleString()}</Typography></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Card>
);