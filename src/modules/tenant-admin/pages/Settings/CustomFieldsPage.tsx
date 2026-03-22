// src/modules/settings/pages/CustomFieldsPage.tsx
import React, { useState, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { TuneOutlined } from '@mui/icons-material';
import { PageShell } from './SettingsLayout';
import { CustomFieldsSection } from './SettingsSections2';
import { CustomField } from './settingsTypes';
import api from '../../../../api/axios';

export default function CustomFieldsPage() {
  const [fields,  setFields]  = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => 
    api.get('/settings/custom-fields')
      .then(r => setFields(r.data?.data ?? r.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
      <CircularProgress size={26}/>
    </Box>
  );

  return (
    <PageShell title="Custom Fields" subtitle="Add extra fields to Leads, Bookings, Customers and more" icon={<TuneOutlined/>}>
      <Box sx={{ bgcolor:'#fff', borderRadius:'14px', border:'1px solid #E2E8F0', p:3 }}>
        <CustomFieldsSection fields={fields} onRefresh={load}/>
      </Box>
    </PageShell>
  );
}
