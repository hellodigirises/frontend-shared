import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, CardHeader, Grid,
  TextField, Button, Switch, FormControlLabel, Divider, Stack, Chip
} from '@mui/material';

const Settings: React.FC = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);
  const [auditLogs, setAuditLogs] = useState(true);

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700}>Settings</Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>Platform configuration and preferences</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* General */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <CardHeader title="General" titleTypographyProps={{ variant: 'h6', fontWeight: 600 }} />
            <CardContent>
              <Stack spacing={2.5}>
                <TextField label="Platform Name" defaultValue="SaaSPlatform" fullWidth size="small" />
                <TextField label="Support Email" defaultValue="support@platform.io" fullWidth size="small" />
                <TextField label="Terms of Service URL" defaultValue="https://platform.io/terms" fullWidth size="small" />
                <TextField label="Privacy Policy URL" defaultValue="https://platform.io/privacy" fullWidth size="small" />
                <Button variant="contained" sx={{ bgcolor: '#6366F1', alignSelf: 'flex-start', '&:hover': { bgcolor: '#4F46E5' } }}>
                  Save Changes
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Security */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <CardHeader title="Security" titleTypographyProps={{ variant: 'h6', fontWeight: 600 }} />
            <CardContent>
              <Stack spacing={2} divider={<Divider />}>
                <FormControlLabel
                  control={<Switch checked={twoFactor} onChange={e => setTwoFactor(e.target.checked)} color="primary" />}
                  label={<Box><Typography variant="body2" fontWeight={500}>Two-Factor Authentication</Typography><Typography variant="caption" color="text.secondary">Require 2FA for all admin accounts</Typography></Box>}
                  labelPlacement="start"
                  sx={{ justifyContent: 'space-between', m: 0 }}
                />
                <FormControlLabel
                  control={<Switch checked={auditLogs} onChange={e => setAuditLogs(e.target.checked)} color="primary" />}
                  label={<Box><Typography variant="body2" fontWeight={500}>Audit Logging</Typography><Typography variant="caption" color="text.secondary">Log all admin actions and changes</Typography></Box>}
                  labelPlacement="start"
                  sx={{ justifyContent: 'space-between', m: 0 }}
                />
                <FormControlLabel
                  control={<Switch checked={maintenanceMode} onChange={e => setMaintenanceMode(e.target.checked)} color="warning" />}
                  label={<Box><Typography variant="body2" fontWeight={500}>Maintenance Mode</Typography><Typography variant="caption" color="text.secondary">Block tenant access temporarily</Typography></Box>}
                  labelPlacement="start"
                  sx={{ justifyContent: 'space-between', m: 0 }}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <CardHeader title="Notifications" titleTypographyProps={{ variant: 'h6', fontWeight: 600 }} />
            <CardContent>
              <FormControlLabel
                control={<Switch checked={emailNotifications} onChange={e => setEmailNotifications(e.target.checked)} color="primary" />}
                label="Email Notifications"
              />
              <Stack spacing={2} mt={2}>
                {['New tenant signup', 'Payment failures', 'Churn alerts', 'Security events', 'System health alerts'].map(item => (
                  <FormControlLabel key={item} control={<Switch defaultChecked size="small" />} label={<Typography variant="body2">{item}</Typography>} />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* API Keys */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <CardHeader
              title="API Keys"
              titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
              action={<Button variant="outlined" size="small">+ Generate Key</Button>}
            />
            <CardContent>
              <Stack spacing={2}>
                {[
                  { name: 'Production API Key', key: 'sk-prod-••••••••••••abc1', status: 'active' },
                  { name: 'Staging API Key', key: 'sk-stg-••••••••••••xyz9', status: 'active' },
                  { name: 'Legacy Key', key: 'sk-old-••••••••••••def4', status: 'revoked' },
                ].map(k => (
                  <Box key={k.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, bgcolor: '#F8FAFC', borderRadius: 1 }}>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>{k.name}</Typography>
                      <Typography variant="caption" fontFamily="monospace" color="text.secondary">{k.key}</Typography>
                    </Box>
                    <Chip label={k.status} size="small" sx={{
                      bgcolor: k.status === 'active' ? '#DCFCE7' : '#FEE2E2',
                      color: k.status === 'active' ? '#16A34A' : '#DC2626',
                      fontWeight: 600, fontSize: 11,
                    }} />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;