import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Stack, IconButton, Divider, CircularProgress,
  Avatar, Grid, Paper, Chip, Button
} from '@mui/material';
import {
  Timeline, TimelineItem, TimelineSeparator, TimelineConnector, 
  TimelineContent, TimelineDot
} from '@mui/lab';
import {
  CloseOutlined, PhoneOutlined, EmailOutlined, LocationOnOutlined,
  CalendarTodayOutlined, AccountBalanceOutlined, HomeOutlined,
  AssignmentIndOutlined, HistoryEduOutlined, TrendingUpOutlined
} from '@mui/icons-material';
import api from '../../../../api/axios';
import { Customer } from './customerTypes';
import { avatarColor, initials } from '../Lead_CRM/crmTypes';

interface Props {
  customerId: string;
  onClose: () => void;
  onUpdate: () => void;
}

const CustomerDetailPanel: React.FC<Props> = ({ customerId, onClose, onUpdate }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/customers/${customerId}`);
        setCustomer(res.data.data ?? res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [customerId]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}><CircularProgress /></Box>;
  if (!customer) return <Box sx={{ p: 4 }}>Customer not found</Box>;

  const timeline = customer.metadata?.timeline || [];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc' }}>
      <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <Typography variant="h6" fontWeight={900}>Customer Profile</Typography>
        <IconButton onClick={onClose}><CloseOutlined /></IconButton>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
        {/* Header Profile */}
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 5, mb: 3, textAlign: 'center', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', bgcolor: '#fff' }}>
          <Stack spacing={2} alignItems="center">
            <Avatar src={customer.avatarUrl} sx={{ width: 100, height: 100, bgcolor: avatarColor(customer.name), fontSize: 32, fontWeight: 900, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
              {initials(customer.name)}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={900} color="#1e293b">{customer.name}</Typography>
              <Chip label={`Buyer • ${customer.project?.name || 'General'}`} size="small" sx={{ mt: 0.5, bgcolor: '#eef2ff', color: '#6366f1', fontWeight: 800, px: 1 }} />
            </Box>
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="outlined" startIcon={<PhoneOutlined />} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>Call</Button>
              <Button size="small" variant="outlined" startIcon={<EmailOutlined />} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>Email</Button>
            </Stack>
          </Stack>
        </Paper>

        <Grid container spacing={2}>
          {/* Quick Stats */}
          <Grid item xs={6}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 4, height: '100%', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', bgcolor: '#fff' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>Assigned Agent</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar src={customer.agent?.avatarUrl} sx={{ width: 28, height: 28, fontSize: 11, fontWeight: 800 }}>{initials(customer.agent?.name || '')}</Avatar>
                <Typography variant="body2" fontWeight={700}>{customer.agent?.name || 'Unassigned'}</Typography>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 4, height: '100%', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', bgcolor: '#fff' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>Source</Typography>
              <Typography variant="body2" fontWeight={800} sx={{ color: '#0f172a' }}>{customer.source || 'Direct'}</Typography>
            </Paper>
          </Grid>

          {/* Contact Details */}
          <Grid item xs={12}>
            <Typography variant="overline" color="text.secondary" fontWeight={900} sx={{ display: 'block', mt: 1, mb: 1, px: 1 }}>Contact Details</Typography>
            <Paper variant="outlined" sx={{ p: 0, borderRadius: 4, overflow: 'hidden', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', bgcolor: '#fff' }}>
              {[
                { icon: <PhoneOutlined size={18} />, label: 'Phone', value: customer.phone },
                { icon: <EmailOutlined size={18} />, label: 'Email', value: customer.email || 'N/A' },
                { icon: <LocationOnOutlined size={18} />, label: 'Address', value: customer.address || 'N/A' }
              ].map((item, i) => (
                <Box key={i}>
                  <Stack direction="row" spacing={2} sx={{ p: 2, alignItems: 'center' }}>
                    <Box sx={{ color: 'primary.main', bgcolor: '#f5f3ff', p: 1, borderRadius: 2 }}>{item.icon}</Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>{item.label}</Typography>
                      <Typography variant="body2" fontWeight={700}>{item.value}</Typography>
                    </Box>
                  </Stack>
                  {i < 2 && <Divider />}
                </Box>
              ))}
            </Paper>
          </Grid>

          {/* Property Details */}
          <Grid item xs={12}>
            <Typography variant="overline" color="text.secondary" fontWeight={900} sx={{ display: 'block', mt: 1, mb: 1, px: 1 }}>Property & Timeline</Typography>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 5, border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', bgcolor: '#fff' }}>
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={700} gutterBottom>Purchased Property</Typography>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ width: 44, height: 44, borderRadius: 3, bgcolor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                      <HomeOutlined />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={900}>{customer.project?.name || 'Commercial Space'}</Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>Unit ID: {customer.unitId || 'Not assigned'}</Typography>
                    </Box>
                  </Stack>
                </Box>

                <Divider sx={{ borderStyle: 'dashed' }} />

                <Grid container spacing={2}>
                  {[
                    { label: 'Booking Date', value: customer.bookingDate, color: '#10b981' },
                    { label: 'Possession Date', value: customer.possessionDate, color: '#f59e0b' },
                    { label: 'Handover Date', value: customer.handoverDate, color: '#6366f1' },
                    { label: 'Transfer Date', value: customer.transferDate, color: '#ec4899' }
                  ].map(d => (
                    <Grid item xs={6} key={d.label}>
                      <Typography variant="caption" color="text.secondary" fontWeight={800}>{d.label}</Typography>
                      <Typography variant="body2" fontWeight={900} sx={{ color: d.value ? d.color : 'text.disabled' }}>
                        {d.value ? new Date(d.value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Pending'}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            </Paper>
          </Grid>

          {/* Interaction Timeline */}
          {timeline.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="overline" color="text.secondary" fontWeight={900} sx={{ display: 'block', mt: 1, mb: 1, px: 1 }}>History</Typography>
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 5, border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', bgcolor: '#fff' }}>
                <Timeline sx={{ p: 0, m: 0 }}>
                  {timeline.map((item: any, i: number) => (
                    <TimelineItem key={i} sx={{ minHeight: 'auto', '&:placeholder': { display: 'none' }, '&:before': { display: 'none' } }}>
                      <TimelineSeparator>
                        <TimelineDot sx={{ m: 0, boxSize: 10, bgcolor: i === 0 ? 'primary.main' : 'divider' }} />
                        {i < timeline.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent sx={{ py: 1, px: 2 }}>
                        <Typography variant="body2" fontWeight={800}>{item.event}</Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>{new Date(item.date).toLocaleString()}</Typography>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Action Footer */}
      <Box sx={{ p: 2.5, bgcolor: '#fff', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <Button fullWidth variant="contained" size="large" disableElevation sx={{ borderRadius: 3, fontWeight: 800, textTransform: 'none', py: 1.5 }}>
          Send Marketing Material
        </Button>
      </Box>
    </Box>
  );
};

export default CustomerDetailPanel;
