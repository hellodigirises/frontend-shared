import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, Stack, TextField, Button,
  Divider, Alert, InputAdornment, Grid, CircularProgress,
  Paper, Tooltip, IconButton
} from '@mui/material';
import {
  SaveOutlined, BadgeOutlined, InfoOutlined,
  RefreshOutlined, VisibilityOutlined
} from '@mui/icons-material';
import api from '../../../../api/axios';

const EmployeeIdSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [config, setConfig] = useState({
    prefix: '',
    padLength: 4,
    separator: '',
    currentSeq: 0
  });

  const [preview, setPreview] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  useEffect(() => {
    generatePreview();
  }, [config]);

  const fetchConfig = async () => {
    try {
      const res = await api.get('/settings/employee-id-config');
      const data = res.data?.data ?? res.data;
      if (data) setConfig(data);
    } catch (e) {
      console.error('Failed to fetch config', e);
    } finally {
      setLoading(false);
    }
  };

  const generatePreview = () => {
    const padded = String(config.currentSeq + 1).padStart(config.padLength, '0');
    setPreview(`${config.prefix}${config.separator}${padded}`);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await api.post('/settings/employee-id-config', config);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" py={5}>
      <CircularProgress size={30} />
    </Box>
  );

  return (
    <Box>
      <Stack spacing={1} mb={4}>
        <Typography variant="h5" fontWeight={800}>Employee ID Configuration</Typography>
        <Typography variant="body2" color="text.secondary">
          Define how employee IDs are automatically generated for your company.
        </Typography>
      </Stack>

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 4, borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={3}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="ID Prefix"
                    placeholder="e.g. EMP, REA"
                    value={config.prefix}
                    onChange={e => setConfig({ ...config, prefix: e.target.value.toUpperCase() })}
                    helperText="Appears at the start of the ID"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Separator"
                    placeholder="e.g. -, /"
                    value={config.separator}
                    onChange={e => setConfig({ ...config, separator: e.target.value })}
                    helperText="Character between prefix and number"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Number Padding"
                    value={config.padLength}
                    onChange={e => setConfig({ ...config, padLength: parseInt(e.target.value) || 1 })}
                    helperText="Total digits for the sequence number"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Current Sequence"
                    value={config.currentSeq}
                    disabled
                    helperText="The last used number (cannot be modified here)"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                </Grid>
              </Grid>

              <Divider />

              {error && <Alert severity="error">{error}</Alert>}
              {success && <Alert severity="success">Setting saved successfully!</Alert>}

              <Button
                variant="contained"
                size="large"
                onClick={handleSave}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveOutlined />}
                sx={{ borderRadius: 3, fontWeight: 700, py: 1.5, boxShadow: 'none' }}
              >
                Save Configuration
              </Button>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Stack spacing={3}>
            <Card sx={{ p: 4, borderRadius: 3, bgcolor: 'hsl(215, 100%, 98%)', border: '1px dashed', borderColor: 'primary.main', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="overline" color="primary" fontWeight={800} sx={{ letterSpacing: 2 }}>
                Live ID Preview
              </Typography>
              <Typography variant="h3" fontWeight={900} sx={{ my: 2, color: 'primary.main', letterSpacing: -1 }}>
                {preview}
              </Typography>
              <Typography variant="caption" color="text.secondary" textAlign="center">
                This is how the ID for the <b>next</b> onboarded employee will look.
              </Typography>
            </Card>

            <Alert icon={<InfoOutlined />} severity="info" sx={{ borderRadius: 3 }}>
              Once you save this configuration, it will be applied to all future employee onboardings.
              The prefix is typically derived from your company name.
            </Alert>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeIdSettings;
