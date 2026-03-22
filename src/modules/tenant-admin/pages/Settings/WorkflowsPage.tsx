import React, { useState, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { AccountTreeOutlined } from '@mui/icons-material';
import { PageShell } from './SettingsLayout';
import { WorkflowSection } from './SettingsSections2';
import { WorkflowRule } from './settingsTypes';
import api from '../../../../api/axios';

export default function WorkflowsPage() {
  const [rules, setRules] = useState<WorkflowRule[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => 
    api.get('/settings/workflows')
      .then(r => setRules(r.data?.data ?? r.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
      <CircularProgress size={26}/>
    </Box>
  );

  return (
    <PageShell title="Workflows" subtitle="Automate actions based on system events" icon={<AccountTreeOutlined/>}>
      <Box sx={{ bgcolor:'#fff', borderRadius:'14px', border:'1px solid #E2E8F0', p:3 }}>
        <WorkflowSection rules={rules} onRefresh={load}/>
      </Box>
    </PageShell>
  );
}
