import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  AddOutlined,
  EditOutlined,
  DeleteOutlined,
  PercentOutlined,
} from '@mui/icons-material';
import api from '../../../../api/axios';

interface CommissionRule {
  id: string;
  name: string;
  description?: string;
  ruleType: string;
  percentage?: number;
  fixedAmount?: number;
  isActive: boolean;
  slabs?: Array<{
    minAmount: number;
    maxAmount: number;
    percentage: number;
  }>;
}

const CommissionRulesPage: React.FC = () => {
  const [rules, setRules] = useState<CommissionRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ruleType: 'PERCENTAGE',
    percentage: 0,
    fixedAmount: 0,
    isActive: true,
  });

  const fetchRules = async () => {
    try {
      const response = await api.get('/commissions/rules');
      setRules(response.data || []);
    } catch (error) {
      console.error('Error fetching rules:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleCreateRule = async () => {
    try {
      await api.post('/commissions/rules', formData);
      setOpenDialog(false);
      fetchRules();
      setFormData({
        name: '',
        description: '',
        ruleType: 'PERCENTAGE',
        percentage: 0,
        fixedAmount: 0,
        isActive: true,
      });
    } catch (error) {
      console.error('Error creating rule:', error);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await api.patch(`/commissions/rules/${id}`, { isActive: !isActive });
      fetchRules();
    } catch (error) {
      console.error('Error updating rule:', error);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
      await api.delete(`/commissions/rules/${id}`);
      fetchRules();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error deleting rule');
    }
  };

  const getRuleTypeLabel = (ruleType: string) => {
    switch (ruleType) {
      case 'PERCENTAGE':
        return 'Percentage';
      case 'FIXED':
        return 'Fixed Amount';
      case 'SLAB':
        return 'Slab-based';
      case 'MILESTONE':
        return 'Milestone';
      default:
        return ruleType;
    }
  };

  const getRuleValue = (rule: CommissionRule) => {
    switch (rule.ruleType) {
      case 'PERCENTAGE':
        return `${rule.percentage}%`;
      case 'FIXED':
        return `₹${(rule.fixedAmount || 0).toLocaleString()}`;
      case 'SLAB':
        return `${rule.slabs?.length || 0} slabs`;
      case 'MILESTONE':
        return 'Manual';
      default:
        return '-';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h3" fontWeight={800} letterSpacing={-1.5}>
            Commission Rules
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Configure commission calculation rules
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={() => setOpenDialog(true)}
          sx={{ borderRadius: 4, fontWeight: 700 }}
        >
          Add Rule
        </Button>
      </Stack>

      <Card
        variant="outlined"
        sx={{ borderRadius: 6, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 700 }}>Rule Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Value</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700}>
                      {rule.name}
                    </Typography>
                    {rule.description && (
                      <Typography variant="caption" color="text.secondary">
                        {rule.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getRuleTypeLabel(rule.ruleType)}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: 10, fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700}>
                      {getRuleValue(rule)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={rule.isActive}
                          onChange={() => handleToggleActive(rule.id, rule.isActive)}
                          size="small"
                        />
                      }
                      label={rule.isActive ? 'Active' : 'Inactive'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton size="small" color="primary">
                        <EditOutlined fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteRule(rule.id)}
                      >
                        <DeleteOutlined fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Commission Rule</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Rule Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Rule Type"
                value={formData.ruleType}
                onChange={(e) => setFormData({ ...formData, ruleType: e.target.value })}
              >
                <MenuItem value="PERCENTAGE">Percentage</MenuItem>
                <MenuItem value="FIXED">Fixed Amount</MenuItem>
                <MenuItem value="SLAB">Slab-based</MenuItem>
                <MenuItem value="MILESTONE">Milestone</MenuItem>
              </TextField>
            </Grid>
            {formData.ruleType === 'PERCENTAGE' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Percentage (%)"
                  value={formData.percentage}
                  onChange={(e) =>
                    setFormData({ ...formData, percentage: parseFloat(e.target.value) })
                  }
                  InputProps={{
                    endAdornment: <PercentOutlined />,
                  }}
                />
              </Grid>
            )}
            {formData.ruleType === 'FIXED' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Fixed Amount (₹)"
                  value={formData.fixedAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, fixedAmount: parseFloat(e.target.value) })
                  }
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateRule}>
            Create Rule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommissionRulesPage;
