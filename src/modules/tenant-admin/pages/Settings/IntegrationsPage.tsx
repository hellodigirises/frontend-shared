import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { IntegrationInstructionsOutlined } from '@mui/icons-material';
import { PageShell } from './SettingsLayout';
import { Integration } from './settingsTypes';
import api from '../../../../api/axios';

// Note: If you have an IntegrationsSection component, import and use it here.
// For now, mirroring the structure used in other pages.
export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/settings/integrations')
      .then(r => setIntegrations(r.data?.data ?? r.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
      <CircularProgress size={26}/>
    </Box>
  );

  return (
    <PageShell title="Integrations" subtitle="Connect third-party services" icon={<IntegrationInstructionsOutlined/>}>
      <Box sx={{ bgcolor:'#fff', borderRadius:'14px', border:'1px solid #E2E8F0', p:3 }}>
        {/* Replace with actual IntegrationsSection content if available */}
        <Typography variant="body2" color="text.secondary">Integrations list coming soon...</Typography>
      </Box>
    </PageShell>
  );
}
