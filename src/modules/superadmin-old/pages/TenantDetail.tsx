import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Tabs, Tab, Card, Avatar, Button, Stack, Chip,
  IconButton, Skeleton,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon      from '@mui/icons-material/Edit';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { fetchTenantDetail, clearTenantDetail, selectTenantDetail, selectSuperAdmin } from './superadminSlice';
import {
  OverviewTab, SubscriptionTab, ModulesTab, AIAgentsTab,
  TelephonyTab, UsersTab, BillingTab, AuditTab,
} from '../components/TenantTabs';

const TABS = ['Overview', 'Subscription', 'Modules', 'AI Agents', 'Telephony', 'Users', 'Billing', 'Audit'];

interface TabPanelProps { value: number; index: number; children: React.ReactNode; }
const TabPanel: React.FC<TabPanelProps> = ({ value, index, children }) => (
  <Box role="tabpanel" hidden={value !== index}>{value === index && children}</Box>
);

const TenantDetail: React.FC = () => {
  const { id }       = useParams<{ id: string }>();
  const navigate     = useNavigate();
  const dispatch     = useAppDispatch();
  const tenant       = useAppSelector(selectTenantDetail);
  const { loading }  = useAppSelector(selectSuperAdmin);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (id) dispatch(fetchTenantDetail(id));
    return () => { dispatch(clearTenantDetail()); };
  }, [id, dispatch]);

  if (loading.tenantDetail) {
    return (
      <Box>
        <Skeleton width={220} height={40} />
        <Skeleton width="100%" height={64} sx={{ mt: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={440} sx={{ mt: 2, borderRadius: 2 }} />
      </Box>
    );
  }

  if (!tenant) return null;

  return (
    <Box>
      {/* ── Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/superadmin/tenants')} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Avatar sx={{ bgcolor: '#6366F118', color: '#6366F1', fontWeight: 700 }}>
          {tenant.name[0]}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={700}>{tenant.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {tenant.email} · {tenant.country} · {tenant.industry}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label={tenant.status}
            sx={{
              bgcolor: tenant.status === 'active' ? '#DCFCE7' : '#FEF9C3',
              color:   tenant.status === 'active' ? '#16A34A' : '#CA8A04',
              fontWeight: 600, textTransform: 'capitalize',
            }}
          />
          <Button variant="outlined" startIcon={<EditIcon />} size="small">Edit</Button>
        </Stack>
      </Box>

      {/* ── Tabs ── */}
      <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ px: 2, '& .MuiTab-root': { fontSize: 13, fontWeight: 500, textTransform: 'none', minHeight: 48 } }}
          >
            {TABS.map(label => <Tab key={label} label={label} />)}
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          <TabPanel value={activeTab} index={0}><OverviewTab      tenant={tenant} /></TabPanel>
          <TabPanel value={activeTab} index={1}><SubscriptionTab  tenant={tenant} /></TabPanel>
          <TabPanel value={activeTab} index={2}><ModulesTab       tenant={tenant} /></TabPanel>
          <TabPanel value={activeTab} index={3}><AIAgentsTab      tenant={tenant} /></TabPanel>
          <TabPanel value={activeTab} index={4}><TelephonyTab     tenant={tenant} /></TabPanel>
          <TabPanel value={activeTab} index={5}><UsersTab         tenant={tenant} /></TabPanel>
          <TabPanel value={activeTab} index={6}><BillingTab       tenant={tenant} /></TabPanel>
          <TabPanel value={activeTab} index={7}><AuditTab         tenant={tenant} /></TabPanel>
        </Box>
      </Card>
    </Box>
  );
};

export default TenantDetail;