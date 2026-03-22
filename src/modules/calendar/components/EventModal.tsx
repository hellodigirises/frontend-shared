import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import { Close as CloseIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

interface EventModalProps {
  open: boolean;
  onClose: () => void;
  event: any;
  onRefresh: () => void;
}

const EVENT_TYPES = [
  { value: 'FOLLOWUP', label: 'Follow-up' },
  { value: 'SITE_VISIT', label: 'Site Visit' },
  { value: 'TASK', label: 'Task' },
  { value: 'MEETING', label: 'Meeting' },
  { value: 'PAYMENT_REMINDER', label: 'Payment Reminder' },
  { value: 'GENERAL', label: 'General' },
];

const EventModal: React.FC<EventModalProps> = ({ open, onClose, event, onRefresh }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'GENERAL',
    startTime: new Date(),
    endTime: new Date(new Date().getTime() + 60 * 60 * 1000),
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        eventType: event.eventType || 'GENERAL',
        startTime: event.startTime ? new Date(event.startTime) : new Date(),
        endTime: event.endTime ? new Date(event.endTime) : new Date(new Date().getTime() + 60 * 60 * 1000),
      });
    } else {
      setFormData({
        title: '',
        description: '',
        eventType: 'GENERAL',
        startTime: new Date(),
        endTime: new Date(new Date().getTime() + 60 * 60 * 1000),
      });
    }
  }, [event, open]);

  const handleSubmit = async () => {
    try {
      if (event?.id) {
        await axios.put(`/api/calendar/${event.id}`, formData);
      } else {
        await axios.post('/api/calendar', formData);
      }
      onRefresh();
      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleDelete = async () => {
    if (!event?.id) return;
    try {
      await axios.delete(`/api/calendar/${event.id}`);
      onRefresh();
      onClose();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{event?.id ? 'Edit Event' : 'New Event'}</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <TextField
              select
              label="Event Type"
              fullWidth
              value={formData.eventType}
              onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
            >
              {EVENT_TYPES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <Stack direction="row" spacing={2}>
              <DateTimePicker
                label="Start Time"
                value={formData.startTime}
                onChange={(date: any) => setFormData({ ...formData, startTime: date || new Date() })}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <DateTimePicker
                label="End Time"
                value={formData.endTime}
                onChange={(date: any) => setFormData({ ...formData, endTime: date || new Date() })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Stack>
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Stack>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Box>
          {event?.id && (
            <Button color="error" startIcon={<DeleteIcon />} onClick={handleDelete}>
              Delete
            </Button>
          )}
        </Box>
        <Stack direction="row" spacing={1}>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {event?.id ? 'Update' : 'Create'}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default EventModal;
