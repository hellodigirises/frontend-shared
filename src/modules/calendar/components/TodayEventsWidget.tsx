import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Stack, 
  Avatar, 
  Chip,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { 
  EventOutlined, 
  AccessTimeOutlined, 
  ChevronRightOutlined 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

const TodayEventsWidget: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodayEvents = async () => {
      try {
        const today = new Date();
        const start = new Date(today.setHours(0, 0, 0, 0)).toISOString();
        const end = new Date(today.setHours(23, 59, 59, 999)).toISOString();
        
        const response = await axios.get(`/api/calendar?start=${start}&end=${end}`);
        setEvents(response.data.slice(0, 5)); // Show only first 5
      } catch (error) {
        console.error('Error fetching today events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayEvents();
  }, []);

  const getEventColor = (type: string) => {
    switch (type) {
      case 'FOLLOWUP': return '#6366f1';
      case 'SITE_VISIT': return '#10b981';
      case 'TASK': return '#f59e0b';
      case 'MEETING': return '#8b5cf6';
      case 'PAYMENT_REMINDER': return '#ef4444';
      default: return '#64748b';
    }
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', height: '100%' }}>
      <CardContent sx={{ p: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ bgcolor: 'primary.light', p: 1, borderRadius: 3, color: 'primary.main', display: 'flex' }}>
              <EventOutlined />
            </Box>
            <Typography variant="h6" fontWeight={800}>Today's Schedule</Typography>
          </Stack>
          <IconButton size="small" onClick={() => navigate('/calendar')}>
            <ChevronRightOutlined />
          </IconButton>
        </Stack>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : events.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">No events scheduled for today.</Typography>
          </Box>
        ) : (
          <Stack spacing={3}>
            {events.map((event: any) => (
              <Box 
                key={event.id}
                sx={{ 
                  p: 2, 
                  borderRadius: 4, 
                  bgcolor: 'background.default',
                  borderLeft: `4px solid ${getEventColor(event.eventType)}`,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
                onClick={() => navigate('/calendar')}
              >
                <Typography variant="body2" fontWeight={700} noWrap sx={{ mb: 1 }}>
                  {event.title}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <AccessTimeOutlined sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(event.startTime), 'p')}
                    </Typography>
                  </Stack>
                  <Chip 
                    label={event.eventType.replace('_', ' ')} 
                    size="small" 
                    sx={{ 
                      height: 20, 
                      fontSize: 10, 
                      fontWeight: 700, 
                      bgcolor: `${getEventColor(event.eventType)}15`,
                      color: getEventColor(event.eventType),
                      textTransform: 'uppercase'
                    }} 
                  />
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

export default TodayEventsWidget;
