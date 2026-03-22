import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { HistoryOutlined } from '@mui/icons-material';
import { PageShell } from './SettingsLayout';
import { AuditLog } from './settingsTypes';
import api from '../../../../api/axios';

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/settings/audit-logs')
      .then(r => setLogs(r.data?.data ?? r.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
      <CircularProgress size={26}/>
    </Box>
  );

  return (
    <PageShell title="Audit Log" subtitle="Every settings change, recorded" icon={<HistoryOutlined/>}>
      <Box sx={{ bgcolor:'#fff', borderRadius:'14px', border:'1px solid #E2E8F0', p:3 }}>
         <Typography variant="body2" color="text.secondary">Audit logs coming soon...</Typography>
      </Box>
    </PageShell>
  );
}
