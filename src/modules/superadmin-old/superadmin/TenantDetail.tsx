import React, { useEffect, useState } from 'react';
import { Box, Typography, Stack, Button, Chip } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import {
  fetchTenantDetail, clearTenantDetail,
  selectTenantDetail, selectSuperAdmin
} from './superadminSlice';
import {
  OverviewTab, SubscriptionTab, ModulesTab, AIAgentsTab,
  TelephonyTab, UsersTab, BillingTab, AuditTab,
} from '../components/TenantTabs';

// ─── Tokens ────────────────────────────────────────────────────────────────────
const FONT  = "'Clash Display', 'Outfit', sans-serif";
const BODY  = "'Cabinet Grotesk', 'DM Sans', sans-serif";
const BRAND = '#00d4aa';
const WARN  = '#f59e0b';
const BRAND2= '#7c6ff7';

// ─── Constants ─────────────────────────────────────────────────────────────────
const TABS = ['Overview', 'Subscription', 'Modules', 'AI Agents', 'Telephony', 'Users', 'Billing', 'Audit'];

const TAB_COLORS = [BRAND, BRAND2, '#60a5fa', BRAND2, WARN, '#ec4899', BRAND, '#94a3b8'];

// ─── Skeleton block ────────────────────────────────────────────────────────────
const DS: React.FC<{ h?: number; w?: string | number; br?: number }> = ({ h = 20, w = '100%', br = 1.5 }) => (
  <Box sx={{
    height: h, width: w, borderRadius: br, bgcolor: '#1e2630',
    animation: 'pulse 1.5s ease-in-out infinite',
    '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.35 } }
  }} />
);

// ─── TabPanel ──────────────────────────────────────────────────────────────────
interface TabPanelProps { value: number; index: number; children: React.ReactNode; }
const TabPanel: React.FC<TabPanelProps> = ({ value, index, children }) => (
  <Box role="tabpanel" hidden={value !== index}>
    {value === index && children}
  </Box>
);

// ─── Main ──────────────────────────────────────────────────────────────────────
const TenantDetail: React.FC = () => {
  const { id }      = useParams<{ id: string }>();
  const navigate    = useNavigate();
  const dispatch    = useAppDispatch();
  const tenant      = useAppSelector(selectTenantDetail);
  const { loading } = useAppSelector(selectSuperAdmin);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (id) dispatch(fetchTenantDetail(id));
    return () => { dispatch(clearTenantDetail()); };
  }, [id, dispatch]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading.tenantDetail) {
    return (
      <Box sx={{ bgcolor: '#080b10', minHeight: '100vh', px: { xs: 3, md: 5 }, pt: 5, fontFamily: BODY }}>
        <Stack direction="row" spacing={1.5} mb={4} alignItems="center">
          <DS h={36} w={36} br={2} />
          <DS h={20} w={100} />
          <DS h={20} w={16} />
          <DS h={20} w={140} />
        </Stack>
        <Stack direction="row" spacing={2.5} alignItems="center" mb={4}>
          <DS h={56} w={56} br={3} />
          <Box flex={1}><DS h={30} w="50%" /><Box sx={{ mt: 1 }}><DS h={16} w="35%" /></Box></Box>
        </Stack>
        <DS h={52} w="100%" br={0} />
        <Box sx={{ mt: 4 }}><DS h={320} br={3} /></Box>
      </Box>
    );
  }

  if (!tenant) return null;

  const statusColor = tenant.status === 'active' ? BRAND : WARN;
  const nameInitials = (n: string) => n.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <Box sx={{ bgcolor: '#080b10', minHeight: '100vh', pb: 8, fontFamily: BODY }}>

      {/* ── Breadcrumb + Hero Header ── */}
      <Box sx={{ px: { xs: 3, md: 5 }, pt: 5, pb: 0, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', bgcolor: statusColor + '08', filter: 'blur(50px)', pointerEvents: 'none' }} />

        {/* Breadcrumb */}
        <Stack direction="row" spacing={1} alignItems="center" mb={3}>
          <Box
            onClick={() => navigate('/superadmin/tenants')}
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8, px: 1.5, py: 0.6, borderRadius: 2, border: '1px solid #1e2630', cursor: 'pointer', transition: 'all 0.15s', '&:hover': { borderColor: BRAND, bgcolor: BRAND + '10' } }}
          >
            <ArrowBackIcon sx={{ fontSize: 14, color: '#4b5563' }} />
            <Typography sx={{ fontFamily: BODY, fontSize: 12, fontWeight: 700, color: '#4b5563' }}>Tenants</Typography>
          </Box>
          <Typography sx={{ fontFamily: BODY, fontSize: 13, color: '#1e2630' }}>/</Typography>
          <Typography sx={{ fontFamily: BODY, fontSize: 12, color: '#9ca3af' }}>{tenant.name}</Typography>
        </Stack>

        {/* Tenant hero */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ md: 'flex-end' }} justifyContent="space-between" pb={4} sx={{ borderBottom: '1px solid #1e2630' }}>
          <Stack direction="row" spacing={2.5} alignItems="center">
            {/* Avatar with initial */}
            <Box sx={{
              width: 60, height: 60, borderRadius: 3.5, flexShrink: 0,
              background: `linear-gradient(135deg, ${statusColor}30, ${statusColor}10)`,
              border: `1px solid ${statusColor}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Typography sx={{ fontFamily: FONT, fontSize: 22, fontWeight: 700, color: statusColor }}>
                {nameInitials(tenant.name)}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontFamily: FONT, fontSize: 28, fontWeight: 700, color: 'white', letterSpacing: -1.2, lineHeight: 1 }}>
                {tenant.name}
              </Typography>
              <Stack direction="row" spacing={1.5} mt={0.7} flexWrap="wrap" alignItems="center">
                <Typography sx={{ fontFamily: BODY, fontSize: 12, color: '#4b5563' }}>{tenant.email}</Typography>
                <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#1e2630' }} />
                <Typography sx={{ fontFamily: BODY, fontSize: 12, color: '#4b5563' }}>{tenant.country}</Typography>
                <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#1e2630' }} />
                <Typography sx={{ fontFamily: BODY, fontSize: 12, color: '#4b5563' }}>{tenant.industry}</Typography>
              </Stack>
            </Box>
          </Stack>

          {/* Status + Edit */}
          <Stack direction="row" spacing={1.5} alignItems="center" flexShrink={0}>
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', gap: 0.7,
              px: 1.8, py: 0.7, borderRadius: 2.5,
              bgcolor: statusColor + '14', border: `1px solid ${statusColor}30`,
            }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: statusColor, boxShadow: `0 0 6px ${statusColor}80` }} />
              <Typography sx={{ fontFamily: BODY, fontSize: 12, fontWeight: 800, color: statusColor, textTransform: 'capitalize' }}>
                {tenant.status}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<EditIcon sx={{ fontSize: 14 }} />}
              size="small"
              sx={{
                textTransform: 'none', fontWeight: 700, fontFamily: BODY, borderRadius: 2.5,
                border: '1px solid #1e2630', color: '#9ca3af',
                '&:hover': { bgcolor: '#1e2630', borderColor: BRAND, color: BRAND }
              }}
            >
              Edit Tenant
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* ── Custom Tab Bar ── */}
      <Box sx={{ bgcolor: '#0d1117', borderBottom: '1px solid #1e2630', position: 'sticky', top: 0, zIndex: 20 }}>
        <Box sx={{ px: { xs: 3, md: 5 }, overflowX: 'auto', display: 'flex', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
          {TABS.map((label, i) => {
            const active = activeTab === i;
            const color  = TAB_COLORS[i];
            return (
              <Box key={label} onClick={() => setActiveTab(i)} sx={{
                px: 2.5, py: 1.8, cursor: 'pointer', flexShrink: 0, position: 'relative',
                borderBottom: '2px solid', borderColor: active ? color : 'transparent',
                transition: 'all 0.15s',
                '&:hover': { bgcolor: '#111827' },
              }}>
                <Typography sx={{
                  fontFamily: BODY, fontSize: 13,
                  fontWeight: active ? 800 : 600,
                  color: active ? color : '#4b5563',
                  transition: 'color 0.15s',
                  whiteSpace: 'nowrap',
                }}>
                  {label}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* ── Tab Content ── */}
      <Box sx={{ px: { xs: 3, md: 5 }, pt: 4 }}>
        {/* Apply dark overrides to the OverviewTab, BillingTab, etc. */}
        <Box sx={{
          '& .MuiCard-root, & .MuiPaper-root': {
            bgcolor: '#0d1117 !important',
            border: '1px solid #1e2630 !important',
            boxShadow: 'none !important',
            borderRadius: '12px !important',
          },
          '& .MuiTableCell-root': { borderColor: '#1e2630 !important', color: '#9ca3af !important' },
          '& .MuiTableHead-root .MuiTableRow-root': { bgcolor: '#080b10 !important' },
          '& .MuiTableRow-root:hover': { bgcolor: '#111827 !important' },
          '& .MuiTypography-h4, & .MuiTypography-h5, & .MuiTypography-h6, & .MuiTypography-subtitle1': {
            color: 'white !important'
          },
          '& .MuiTypography-body1': { color: '#9ca3af !important' },
          '& .MuiTypography-body2': { color: '#4b5563 !important' },
          '& .MuiDivider-root': { borderColor: '#1e2630 !important' },
          '& .MuiChip-root': { fontFamily: `${BODY} !important` },
          '& .MuiLinearProgress-root': { bgcolor: '#1e2630 !important' },
          '& label, & .MuiFormLabel-root': { color: '#4b5563 !important' },
          '& .MuiInputBase-root': { bgcolor: '#1e2630 !important', color: 'white !important' },
          '& fieldset': { borderColor: '#1e2630 !important' },
          '& .MuiGrid-item .MuiBox-root': { color: '#9ca3af' },
        }}>
          <TabPanel value={activeTab} index={0}><OverviewTab      tenant={tenant} /></TabPanel>
          <TabPanel value={activeTab} index={1}><SubscriptionTab  tenant={tenant} /></TabPanel>
          <TabPanel value={activeTab} index={2}><ModulesTab       tenant={tenant} /></TabPanel>
          <TabPanel value={activeTab} index={3}><AIAgentsTab      tenant={tenant} /></TabPanel>
          <TabPanel value={activeTab} index={4}><TelephonyTab     tenant={tenant} /></TabPanel>
          <TabPanel value={activeTab} index={5}><UsersTab         tenant={tenant} /></TabPanel>
          <TabPanel value={activeTab} index={6}><BillingTab       tenant={tenant} /></TabPanel>
          <TabPanel value={activeTab} index={7}><AuditTab         tenant={tenant} /></TabPanel>
        </Box>
      </Box>
    </Box>
  );
};

export default TenantDetail;