import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Stack, Button, TextField, Chip,
  IconButton, Divider, Grid, Paper, Alert, CircularProgress,
  Collapse, Rating
} from '@mui/material';
import {
  CloseOutlined, MyLocationOutlined, CheckCircleOutlined,
  GpsFixedOutlined, NavigationOutlined
} from '@mui/icons-material';
import {
  SiteVisit, VisitOutcome, InterestLevel, VisitFeedback,
  VISIT_OUTCOME_CFG, INTEREST_LEVEL_CFG, NEXT_ACTIONS, OBJECTION_PRESETS,
  avatarColor, initials
} from './visitTypes';
import api from '../../../../api/axios';

// ─── GPS Check-in Dialog ──────────────────────────────────────────────────────
interface CheckInProps {
  visit: SiteVisit;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const CheckInDialog: React.FC<CheckInProps> = ({ visit, open, onClose, onSave }) => {
  const [phase, setPhase] = useState<'idle' | 'locating' | 'located' | 'saving'>('idle');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState('');

  const getLocation = () => {
    setPhase('locating'); setGeoError('');
    if (!navigator.geolocation) {
      setGeoError('GPS not available on this device'); setPhase('idle'); return;
    }
    navigator.geolocation.getCurrentPosition(
      p => { setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }); setPhase('located'); },
      e => { setGeoError('Could not get location. Check browser permissions.'); setPhase('idle'); },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleCheckIn = async (status: 'IN_PROGRESS' | 'COMPLETED') => {
    setPhase('saving');
    try {
      await api.put(`/site-visits/${visit.id}`, {
        status,
        checkInLat: coords?.lat,
        checkInLng: coords?.lng,
        checkInAt: new Date().toISOString(),
        ...(status === 'COMPLETED' ? { completedAt: new Date().toISOString() } : {}),
      });
      onSave(); onClose();
    } catch (e) { console.error(e); setPhase('idle'); }
  };

  const tyCfg = {
    color: '#10b981', bg: '#d1fae5',
    icon: visit.visitType === 'ONSITE' ? '🏠' : visit.visitType === 'VIRTUAL' ? '💻' : '🏢',
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ fontWeight: 900, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography fontSize={22}>{tyCfg.icon}</Typography>
          <Box>
            <Typography fontWeight={900}>Visit Check-in</Typography>
            <Typography variant="caption" color="text.secondary">{visit.lead.customerName}</Typography>
          </Box>
        </Stack>
        <IconButton size="small" onClick={onClose} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <CloseOutlined fontSize="small" />
        </IconButton>
      </DialogTitle>
      <Divider />

      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {/* Visit info card */}
          <Paper sx={{ p: 2, borderRadius: 3, bgcolor: '#f0fdf4', border: '1px solid #86efac' }}>
            <Typography variant="body2" fontWeight={800}>{visit.project ?? 'Visit'}</Typography>
            <Typography variant="caption" color="#047857">
              {visit.tower ? `${visit.tower}` : ''}{visit.unitNumber ? ` · Unit ${visit.unitNumber}` : ''}
              {' · '}{visit.visitTime}
            </Typography>
          </Paper>

          {/* GPS section */}
          {visit.visitType === 'ONSITE' && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Box
                onClick={phase === 'idle' ? getLocation : undefined}
                sx={{
                  width: 110, height: 110, borderRadius: '50%', mx: 'auto', mb: 2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: phase === 'idle' ? 'pointer' : 'default',
                  bgcolor: phase === 'located' ? '#d1fae5' : phase === 'locating' ? '#fef3c7' : '#f3f4f6',
                  border: `3px solid ${phase === 'located' ? '#10b981' : phase === 'locating' ? '#f59e0b' : '#e5e7eb'}`,
                  transition: 'all .3s',
                  boxShadow: phase === 'locating' ? '0 0 0 8px rgba(245,158,11,.15)' : 'none',
                }}>
                {phase === 'locating' ? (
                  <CircularProgress size={36} sx={{ color: '#f59e0b' }} />
                ) : phase === 'located' ? (
                  <GpsFixedOutlined sx={{ fontSize: 44, color: '#10b981' }} />
                ) : (
                  <MyLocationOutlined sx={{ fontSize: 44, color: '#9ca3af' }} />
                )}
              </Box>

              {phase === 'located' && coords ? (
                <Stack spacing={0.5} alignItems="center">
                  <Chip label="✅ Location Verified" sx={{ bgcolor: '#d1fae5', color: '#065f46', fontWeight: 800 }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: 10 }}>
                    {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                  </Typography>
                </Stack>
              ) : phase === 'idle' ? (
                <Stack spacing={1} alignItems="center">
                  <Typography variant="body2" color="text.secondary">Tap to verify your GPS location</Typography>
                  <Button size="small" startIcon={<MyLocationOutlined />} variant="outlined"
                    onClick={getLocation} sx={{ textTransform: 'none', borderRadius: 2 }}>
                    Get My Location
                  </Button>
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">Acquiring GPS signal...</Typography>
              )}

              {geoError && <Alert severity="warning" sx={{ mt: 1.5, borderRadius: 2, fontSize: 12 }}>{geoError}</Alert>}
              {phase === 'idle' && !coords && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  GPS verification is optional but recommended
                </Typography>
              )}
            </Box>
          )}
        </Stack>
      </DialogContent>

      <Divider />
      <DialogActions sx={{ p: 2.5, gap: 1, flexDirection: 'column' }}>
        <Stack direction="row" spacing={1.5} width="100%">
          <Button fullWidth variant="outlined" disableElevation
            onClick={() => handleCheckIn('IN_PROGRESS')}
            disabled={phase === 'saving' || phase === 'locating'}
            sx={{
              textTransform: 'none', fontWeight: 700, borderRadius: 2.5, py: 1.25, borderColor: '#f59e0b', color: '#f59e0b',
              '&:hover': { borderColor: '#d97706', bgcolor: '#fffbeb' }
            }}>
            🚗 Start Visit
          </Button>
          <Button fullWidth variant="contained" disableElevation
            onClick={() => handleCheckIn('COMPLETED')}
            disabled={phase === 'saving' || phase === 'locating'}
            sx={{
              textTransform: 'none', fontWeight: 700, borderRadius: 2.5, py: 1.25,
              bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }
            }}>
            {phase === 'saving' ? <CircularProgress size={18} color="inherit" /> : '✅ Mark Complete'}
          </Button>
        </Stack>
        <Button fullWidth onClick={onClose} color="inherit" size="small" sx={{ textTransform: 'none' }}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Visit Feedback Dialog ────────────────────────────────────────────────────
interface FeedbackProps {
  visit: SiteVisit;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const FeedbackDialog: React.FC<FeedbackProps> = ({ visit, open, onClose, onSave }) => {
  const [form, setForm] = useState({
    interestLevel: 'WARM' as InterestLevel,
    budgetMatch: true,
    preferredUnit: '',
    objections: [] as string[],
    customObjection: '',
    nextAction: '',
    internalNotes: '',
    agentRating: 4,
    followUpDate: '',
    customerQuote: '',
    outcome: 'FOLLOW_UP_REQUIRED' as VisitOutcome,
  });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const toggleObj = (obj: string) =>
    setForm(f => ({
      ...f,
      objections: f.objections.includes(obj)
        ? f.objections.filter(o => o !== obj)
        : [...f.objections, obj],
    }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const allObjections = [...form.objections, ...(form.customObjection ? [form.customObjection] : [])];
      await api.post(`/site-visits/${visit.id}/feedback`, {
        interestLevel: form.interestLevel, budgetMatch: form.budgetMatch,
        preferredUnit: form.preferredUnit, objections: allObjections,
        nextAction: form.nextAction, internalNotes: form.internalNotes,
        agentRating: form.agentRating, followUpDate: form.followUpDate,
        customerQuote: form.customerQuote,
      });
      await api.put(`/site-visits/${visit.id}`, { outcome: form.outcome });
      onSave(); onClose();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 4, maxHeight: '92vh' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 900 }}>
            📝 Visit Feedback
          </Typography>
          <Typography variant="caption" color="text.secondary">{visit.lead.customerName} · {visit.project}</Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <CloseOutlined fontSize="small" />
        </IconButton>
      </DialogTitle>
      <Divider />

      <DialogContent sx={{ overflowY: 'auto' }}>
        <Stack spacing={3.5} sx={{ mt: 1.5 }}>

          {/* ── Interest Level ── */}
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 1, color: '#6b7280', display: 'block', mb: 1.5 }}>
              Customer Interest Level *
            </Typography>
            <Grid container spacing={1.25}>
              {Object.entries(INTEREST_LEVEL_CFG).map(([k, v]) => (
                <Grid item xs={12 / Object.keys(INTEREST_LEVEL_CFG).length} key={k}>
                  <Box onClick={() => set('interestLevel', k)}
                    sx={{
                      p: 1.75, borderRadius: 3, textAlign: 'center', cursor: 'pointer',
                      border: '2px solid', transition: 'all .15s',
                      borderColor: form.interestLevel === k ? v.color : '#e5e7eb',
                      bgcolor: form.interestLevel === k ? v.bg : '#fff',
                      transform: form.interestLevel === k ? 'scale(1.04)' : 'scale(1)',
                    }}>
                    <Typography fontSize={22}>{v.icon}</Typography>
                    <Typography variant="caption" fontWeight={800} sx={{ color: form.interestLevel === k ? v.color : '#9ca3af', display: 'block', mt: 0.25, fontSize: 10 }}>
                      {v.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Divider />

          {/* ── Rating + Budget ── */}
          <Grid container spacing={2.5} alignItems="center">
            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 1, color: '#6b7280', display: 'block', mb: 1 }}>
                Visit Quality Rating
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Rating value={form.agentRating} onChange={(_, v) => set('agentRating', v ?? 3)}
                  sx={{ color: '#f59e0b', fontSize: '1.6rem' }} />
                <Typography variant="caption" fontWeight={800} color="text.secondary">
                  {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][form.agentRating ?? 3]}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 1, color: '#6b7280', display: 'block', mb: 1 }}>
                Budget Match?
              </Typography>
              <Stack direction="row" spacing={1.5}>
                {[{ v: true, label: '✅ Yes, fits budget', color: '#10b981', bg: '#d1fae5' },
                { v: false, label: '❌ Over budget', color: '#ef4444', bg: '#fee2e2' }].map(b => (
                  <Box key={String(b.v)} onClick={() => set('budgetMatch', b.v)}
                    sx={{
                      flex: 1, px: 1.5, py: 1.25, borderRadius: 2.5, cursor: 'pointer',
                      border: '2px solid', transition: 'all .12s', textAlign: 'center',
                      borderColor: form.budgetMatch === b.v ? b.color : '#e5e7eb',
                      bgcolor: form.budgetMatch === b.v ? b.bg : '#fff',
                    }}>
                    <Typography variant="caption" fontWeight={800} sx={{ color: form.budgetMatch === b.v ? b.color : '#9ca3af', fontSize: 11 }}>
                      {b.label}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 1, color: '#6b7280', display: 'block', mb: 1 }}>
                Preferred Unit Shown
              </Typography>
              <TextField fullWidth size="small" value={form.preferredUnit}
                onChange={e => set('preferredUnit', e.target.value)}
                placeholder="e.g. Tower A · 3BHK · Floor 8"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 1, color: '#6b7280', display: 'block', mb: 1 }}>
                Suggested Follow-up Date
              </Typography>
              <TextField fullWidth size="small" type="date" value={form.followUpDate}
                onChange={e => set('followUpDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
            </Grid>
          </Grid>

          <Divider />

          {/* ── Objections ── */}
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 1, color: '#6b7280', display: 'block', mb: 1.25 }}>
              Customer Objections
            </Typography>
            <Stack direction="row" flexWrap="wrap" spacing={0.75} mb={1.5}>
              {OBJECTION_PRESETS.map(obj => (
                <Chip key={obj} label={obj} size="small" clickable
                  variant={form.objections.includes(obj) ? 'filled' : 'outlined'}
                  color={form.objections.includes(obj) ? 'warning' : 'default'}
                  onClick={() => toggleObj(obj)}
                  sx={{ fontWeight: 700, fontSize: 10, my: 0.25 }} />
              ))}
            </Stack>
            <TextField fullWidth size="small" placeholder="Any other objections..."
              value={form.customObjection} onChange={e => set('customObjection', e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
          </Box>

          {/* ── Next Action ── */}
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 1, color: '#6b7280', display: 'block', mb: 1.25 }}>
              Recommended Next Action
            </Typography>
            <Stack direction="row" flexWrap="wrap" spacing={0.75}>
              {NEXT_ACTIONS.map(a => (
                <Chip key={a} label={a} size="small" clickable
                  variant={form.nextAction === a ? 'filled' : 'outlined'}
                  color={form.nextAction === a ? 'primary' : 'default'}
                  onClick={() => set('nextAction', form.nextAction === a ? '' : a)}
                  sx={{ fontWeight: 700, fontSize: 10, my: 0.25 }} />
              ))}
            </Stack>
          </Box>

          {/* ── Customer Quote ── */}
          <TextField fullWidth label="Customer Quote / Key Statement" size="small" multiline rows={2}
            value={form.customerQuote} onChange={e => set('customerQuote', e.target.value)}
            placeholder='"I really liked the view from floor 12, just need to discuss budget with family"'
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />

          <TextField fullWidth label="Internal Agent Notes" size="small" multiline rows={3}
            value={form.internalNotes} onChange={e => set('internalNotes', e.target.value)}
            placeholder="Notes for the sales team, manager insights, follow-up strategy..."
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />

          <Divider />

          {/* ── Outcome ── */}
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 1, color: '#6b7280', display: 'block', mb: 1.5 }}>
              Visit Outcome *
            </Typography>
            <Grid container spacing={1.25}>
              {Object.entries(VISIT_OUTCOME_CFG).filter(([k]) => k !== 'PENDING').map(([k, v]) => (
                <Grid item xs={6} sm={4} key={k}>
                  <Box onClick={() => set('outcome', k)}
                    sx={{
                      p: 2, borderRadius: 3, textAlign: 'center', cursor: 'pointer',
                      border: '2px solid', transition: 'all .15s',
                      borderColor: form.outcome === k ? v.color : '#e5e7eb',
                      bgcolor: form.outcome === k ? v.bg : '#fff',
                      transform: form.outcome === k ? 'scale(1.03)' : 'scale(1)',
                    }}>
                    <Typography fontSize={22} mb={0.25}>{v.icon}</Typography>
                    <Typography variant="caption" fontWeight={800} sx={{ color: form.outcome === k ? v.color : '#9ca3af', display: 'block', fontSize: 10 }}>
                      {v.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          {form.outcome === 'BOOKING_INITIATED' && (
            <Alert severity="success" sx={{ borderRadius: 3 }}>
              🎉 <strong>Booking process will start</strong> — this lead will be moved to the Booking module automatically.
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <Divider />
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
        <Button variant="contained" disableElevation onClick={handleSave} disabled={saving}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2.5, px: 4 }}>
          {saving ? <CircularProgress size={18} color="inherit" /> : 'Save Feedback & Outcome'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackDialog;