import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { 
  Box, 
  Paper, 
  Typography, 
  CircularProgress, 
  useTheme,
  Button,
  IconButton,
  Stack
} from '@mui/material';
import { 
  Add as AddIcon,
  ChevronLeft,
  ChevronRight,
  Today as TodayIcon
} from '@mui/icons-material';
import axios from 'axios';
import EventModal from '../components/EventModal';

const CalendarPage: React.FC = () => {
  const theme = useTheme();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const calendarRef = React.useRef<FullCalendar>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/calendar');
      const formattedEvents = response.data.map((event: any) => ({
        id: event.id,
        title: event.title,
        start: event.startTime,
        end: event.endTime,
        backgroundColor: getEventColor(event.eventType),
        borderColor: getEventColor(event.eventType),
        extendedProps: { ...event }
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const getEventColor = (type: string) => {
    switch (type) {
      case 'FOLLOWUP': return theme.palette.info.main;
      case 'SITE_VISIT': return theme.palette.success.main;
      case 'TASK': return theme.palette.warning.main;
      case 'MEETING': return theme.palette.secondary.main;
      case 'PAYMENT_REMINDER': return theme.palette.error.main;
      default: return theme.palette.primary.main;
    }
  };

  const handleDateClick = (arg: any) => {
    setSelectedEvent({ startTime: arg.dateStr });
    setModalOpen(true);
  };

  const handleEventClick = (arg: any) => {
    setSelectedEvent(arg.event.extendedProps);
    setModalOpen(true);
  };

  const handleAddClick = () => {
    setSelectedEvent(null);
    setModalOpen(true);
  };

  return (
    <Box sx={{ p: 3, height: 'calc(100vh - 100px)' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Smart Calendar
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          New Event
        </Button>
      </Stack>

      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          height: '100%', 
          borderRadius: 4,
          border: `1px solid ${theme.palette.divider}`,
          '& .fc': {
            '--fc-border-color': theme.palette.divider,
            '--fc-today-bg-color': theme.palette.action.hover,
            fontFamily: theme.typography.fontFamily,
          },
          '& .fc-col-header-cell': {
            py: 1.5,
            backgroundColor: theme.palette.background.default,
          },
          '& .fc-event': {
            cursor: 'pointer',
            border: 'none',
            borderRadius: '4px',
            p: 0.5,
          }
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={events}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            height="100%"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
          />
        )}
      </Paper>

      <EventModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        event={selectedEvent}
        onRefresh={fetchEvents}
      />
    </Box>
  );
};

export default CalendarPage;
