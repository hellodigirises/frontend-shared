// src/modules/hr/pages/TrainingPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Grid, TextField, Select, MenuItem, FormControl,
  InputLabel, Typography, Chip, Switch, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Avatar,
  AvatarGroup,
} from '@mui/material';
import { Add, School, VideoCall, Place, PersonAdd } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, H, DATE, fieldSx, labelSx, selectFieldSx } from '../hooks';
import { fetchTrainings, doCreateTraining, doEnroll, type Training } from '../store/hrSlice';
import { PageHeader, StatusChip } from '../components/ui';

const CATEGORIES = ['Sales', 'Product Knowledge', 'Compliance', 'Leadership', 'Technology', 'Soft Skills', 'Safety'];

function TrainingForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dispatch = useAppDispatch();
  const [f, setF] = useState({
    title: '', description: '', category: 'Sales', date: '',
    duration: '', venue: '', isOnline: false, meetingLink: '',
    trainerName: '', maxSeats: '',
  });
  const set = (k: string, v: any) => setF(p => ({ ...p, [k]: v }));

  const submit = () => {
    dispatch(doCreateTraining({
      ...f,
      duration : f.duration  ? +f.duration  : undefined,
      maxSeats : f.maxSeats  ? +f.maxSeats  : undefined,
    }));
    onClose();
    setF({ title:'', description:'', category:'Sales', date:'', duration:'', venue:'', isOnline:false, meetingLink:'', trainerName:'', maxSeats:'' });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { bgcolor: H.surface, border: `1px solid ${H.border}`, borderRadius: '14px' } }}>
      <DialogTitle sx={{ color: H.text, fontWeight: 700, fontSize: 15, pb: 1 }}>Create Training Program</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} mt={0.25}>
          <Grid item xs={12}>
            <TextField fullWidth size="small" label="Title *"
              value={f.title} onChange={e => set('title', e.target.value)}
              sx={fieldSx} InputLabelProps={{ sx: labelSx }} />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel sx={labelSx}>Category</InputLabel>
              <Select value={f.category} label="Category" onChange={e => set('category', e.target.value)} sx={selectFieldSx}>
                {CATEGORIES.map(c => <MenuItem key={c} value={c} sx={{ fontSize: 13 }}>{c}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="Trainer Name"
              value={f.trainerName} onChange={e => set('trainerName', e.target.value)}
              sx={fieldSx} InputLabelProps={{ sx: labelSx }} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="Date *" type="datetime-local"
              value={f.date} onChange={e => set('date', e.target.value)}
              sx={fieldSx} InputLabelProps={{ sx: { ...labelSx, shrink: true } }} />
          </Grid>
          <Grid item xs={3}>
            <TextField fullWidth size="small" label="Duration (hrs)" type="number"
              value={f.duration} onChange={e => set('duration', e.target.value)}
              sx={fieldSx} InputLabelProps={{ sx: labelSx }} />
          </Grid>
          <Grid item xs={3}>
            <TextField fullWidth size="small" label="Max Seats" type="number"
              value={f.maxSeats} onChange={e => set('maxSeats', e.target.value)}
              sx={fieldSx} InputLabelProps={{ sx: labelSx }} />
          </Grid>

          {/* Online toggle */}
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={1}>
              <Switch checked={f.isOnline} onChange={e => set('isOnline', e.target.checked)}
                sx={{ '& .Mui-checked + .MuiSwitch-track': { bgcolor: `${H.primary} !important` } }} />
              <Typography sx={{ color: H.textSub, fontSize: 13 }}>Online Training</Typography>
            </Box>
          </Grid>

          {f.isOnline ? (
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Meeting Link"
                value={f.meetingLink} onChange={e => set('meetingLink', e.target.value)}
                sx={fieldSx} InputLabelProps={{ sx: labelSx }} />
            </Grid>
          ) : (
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Venue"
                value={f.venue} onChange={e => set('venue', e.target.value)}
                sx={fieldSx} InputLabelProps={{ sx: labelSx }} />
            </Grid>
          )}

          <Grid item xs={12}>
            <TextField fullWidth size="small" label="Description" multiline rows={3}
              value={f.description} onChange={e => set('description', e.target.value)}
              sx={fieldSx} InputLabelProps={{ sx: labelSx }} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} sx={{ color: H.textSub, textTransform: 'none', fontSize: 13 }}>Cancel</Button>
        <Button variant="contained" disabled={!f.title || !f.date} onClick={submit}
          sx={{ bgcolor: H.primary, textTransform: 'none', fontWeight: 600, borderRadius: '8px', fontSize: 13 }}>
          Create Program
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const CAT_COLOR: Record<string, string> = {
  Sales           : H.primary,
  'Product Knowledge': H.teal,
  Compliance      : H.amber,
  Leadership      : H.purple,
  Technology      : '#6366F1',
  'Soft Skills'   : '#EC4899',
  Safety          : H.coral,
};

function TrainingCard({ training }: { training: Training }) {
  const dispatch = useAppDispatch();
  const enrolled = training.enrollments?.length ?? 0;
  const completed = training.enrollments?.filter(e => e.status === 'COMPLETED').length ?? 0;
  const catColor = CAT_COLOR[training.category ?? ''] ?? H.primary;
  const isPast = new Date(training.date) < new Date();

  return (
    <Box sx={{
      bgcolor: H.surface, borderRadius: '14px', p: 2.5,
      border: `1px solid ${H.border}`, height: '100%',
      borderTop: `3px solid ${catColor}`,
    }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
        <Box>
          <Typography sx={{ color: H.text, fontWeight: 600, fontSize: 14, lineHeight: 1.3, mb: 0.5 }}>
            {training.title}
          </Typography>
          {training.category && (
            <Chip label={training.category} size="small"
              sx={{ fontSize: 10, height: 19, bgcolor: `${catColor}15`, color: catColor }} />
          )}
        </Box>
        {isPast
          ? <Chip label="Completed" size="small" sx={{ fontSize: 10, height: 19, bgcolor: `${H.teal}12`, color: H.teal }} />
          : <Chip label="Upcoming" size="small" sx={{ fontSize: 10, height: 19, bgcolor: `${H.amber}12`, color: H.amber }} />
        }
      </Box>

      {training.description && (
        <Typography sx={{
          color: H.textSub, fontSize: 12.5, lineHeight: 1.55, mb: 2,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {training.description}
        </Typography>
      )}

      {/* Meta */}
      <Box display="flex" flexDirection="column" gap={0.75} mb={2}>
        <Box display="flex" alignItems="center" gap={0.75}>
          {training.isOnline ? <VideoCall sx={{ fontSize: 14, color: H.primary }} /> : <Place sx={{ fontSize: 14, color: H.textSub }} />}
          <Typography sx={{ color: H.textSub, fontSize: 12 }}>
            {training.isOnline ? 'Online' : (training.venue ?? '—')}
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Typography sx={{ color: H.textSub, fontSize: 12 }}>
            📅 {DATE(training.date)}
          </Typography>
          {training.duration && (
            <Typography sx={{ color: H.textSub, fontSize: 12 }}>
              ⏱ {training.duration}h
            </Typography>
          )}
        </Box>
        {training.trainerName && (
          <Typography sx={{ color: H.textSub, fontSize: 12 }}>
            👤 {training.trainerName}
          </Typography>
        )}
      </Box>

      {/* Enrollments */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center" gap={1}>
          {(training.enrollments?.length ?? 0) > 0 && (
            <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 22, height: 22, fontSize: 9 } }}>
              {(training.enrollments ?? []).map(e => (
                <Avatar key={e.id} sx={{ bgcolor: catColor }}>
                  {(e.employee.name ?? '?').charAt(0)}
                </Avatar>
              ))}
            </AvatarGroup>
          )}
          <Typography sx={{ color: H.textSub, fontSize: 11 }}>
            {enrolled} enrolled
            {completed > 0 && ` · ${completed} completed`}
            {training.maxSeats && ` · ${training.maxSeats} seats`}
          </Typography>
        </Box>

        {!isPast && (
          <Tooltip title="Enroll">
            <IconButton size="small"
              onClick={() => dispatch(doEnroll({ trainingId: training.id }))}
              sx={{ color: catColor, bgcolor: `${catColor}12`, borderRadius: '6px', p: 0.5 }}>
              <PersonAdd sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
}

export default function TrainingPage() {
  const dispatch = useAppDispatch();
  const { trainings, loading } = useAppSelector(s => s.hr);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // all | upcoming | past

  useEffect(() => { dispatch(fetchTrainings()); }, [dispatch]);

  const now = new Date();
  const filtered = trainings.filter(t => {
    if (filter === 'upcoming') return new Date(t.date) >= now;
    if (filter === 'past')     return new Date(t.date)  < now;
    return true;
  });

  const upcoming = trainings.filter(t => new Date(t.date) >= now).length;
  const past     = trainings.filter(t => new Date(t.date)  < now).length;

  return (
    <Box>
      <PageHeader
        title="Training Programs"
        subtitle={`${trainings.length} programs · ${upcoming} upcoming`}
        action={
          <Button variant="contained" startIcon={<Add />} size="small" onClick={() => setOpen(true)}
            sx={{ bgcolor: H.primary, textTransform: 'none', fontWeight: 600, borderRadius: '8px', fontSize: 13 }}>
            Create Program
          </Button>
        }
      />

      {/* Filter tabs */}
      <Box display="flex" gap={1} mb={3}>
        {[
          { key: 'all',      label: `All (${trainings.length})` },
          { key: 'upcoming', label: `Upcoming (${upcoming})` },
          { key: 'past',     label: `Past (${past})` },
        ].map(tab => (
          <Button key={tab.key} size="small" onClick={() => setFilter(tab.key)}
            sx={{
              textTransform: 'none', fontSize: 13, borderRadius: '8px',
              bgcolor  : filter === tab.key ? `${H.primary}18` : 'transparent',
              color    : filter === tab.key ? H.primary : H.textSub,
              border   : `1px solid ${filter === tab.key ? `${H.primary}40` : H.border}`,
              '&:hover': { bgcolor: `${H.primary}10` },
            }}>
            {tab.label}
          </Button>
        ))}
      </Box>

      {filtered.length === 0 && !loading.trainings
        ? (
          <Box py={8} textAlign="center">
            <School sx={{ fontSize: 48, color: H.border, mb: 2 }} />
            <Typography sx={{ color: H.textSub, fontSize: 14 }}>No training programs</Typography>
          </Box>
        )
        : (
          <Grid container spacing={2}>
            {filtered.map(t => (
              <Grid item xs={12} sm={6} lg={4} key={t.id}>
                <TrainingCard training={t} />
              </Grid>
            ))}
          </Grid>
        )
      }

      <TrainingForm open={open} onClose={() => setOpen(false)} />
    </Box>
  );
}
