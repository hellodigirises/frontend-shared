// src/modules/agent/pages/ProfilePage.tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  Box, Grid, Typography, TextField, Button, Avatar,
  Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, Select, MenuItem, FormControl, InputLabel,
  LinearProgress,
} from '@mui/material';
import { Edit, BeachAccess } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, A, DATE, INR, fieldSx, labelSx, selSx } from '../hooks';
import {
  fetchProfile,
  doUpdateProfile,
  doRequestLeave,
  fetchLeaves,
  doUploadAvatar,
} from '../store/agentSlice';
import { PageHeader, Card, KVRow } from '../components/ui';

const LEAVE_TYPES = ['CASUAL', 'SICK', 'EARNED', 'MATERNITY', 'PATERNITY', 'UNPAID'];

function LeaveRequestDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dispatch = useAppDispatch();
  const [f, setF] = useState({ leaveType: 'CASUAL', startDate: '', endDate: '', reason: '' });
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));

  const submit = () => {
    dispatch(doRequestLeave(f));
    onClose();
    setF({ leaveType: 'CASUAL', startDate: '', endDate: '', reason: '' });
  };

  // Calculate days
  let days = 0;
  if (f.startDate && f.endDate) {
    const s = new Date(f.startDate), e = new Date(f.endDate);
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
      if (d.getDay() !== 0 && d.getDay() !== 6) days++;
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { bgcolor: A.surface, border: `1px solid ${A.border}`, borderRadius: '14px' } }}>
      <DialogTitle sx={{ color: A.text, fontWeight: 700, fontSize: 15, pb: 1 }}>Request Leave</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} mt={0.25}>
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel sx={labelSx}>Leave Type</InputLabel>
              <Select value={f.leaveType} label="Leave Type" onChange={e => set('leaveType', e.target.value as string)} sx={selSx}>
                {LEAVE_TYPES.map(t => <MenuItem key={t} value={t} sx={{ fontSize: 13 }}>{t}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="Start Date" type="date" value={f.startDate}
              onChange={e => set('startDate', e.target.value)}
              sx={fieldSx} InputLabelProps={{ shrink: true, sx: labelSx }} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="End Date" type="date" value={f.endDate}
              onChange={e => set('endDate', e.target.value)}
              sx={fieldSx} InputLabelProps={{ shrink: true, sx: labelSx }} />
          </Grid>
          {days > 0 && (
            <Grid item xs={12}>
              <Box sx={{ bgcolor: `${A.primary}10`, border: `1px solid ${A.primary}30`, borderRadius: '8px', p: 1.25 }}>
                <Typography sx={{ color: A.primary, fontSize: 13, fontWeight: 600 }}>
                  {days} working day{days > 1 ? 's' : ''}
                </Typography>
              </Box>
            </Grid>
          )}
          <Grid item xs={12}>
            <TextField fullWidth size="small" label="Reason *" multiline rows={3} value={f.reason}
              onChange={e => set('reason', e.target.value)}
              sx={fieldSx} InputLabelProps={{ sx: labelSx }} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} sx={{ color: A.textSub, textTransform: 'none', fontSize: 13 }}>Cancel</Button>
        <Button variant="contained" disabled={!f.startDate || !f.endDate || !f.reason}
          onClick={submit}
          sx={{ bgcolor: A.primary, textTransform: 'none', fontWeight: 600, borderRadius: '8px', fontSize: 13 }}>
          Submit Request
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function EditProfileDialog({ open, profile, onClose }: { open: boolean; profile: any; onClose: () => void }) {
  const dispatch = useAppDispatch();
  const ap = profile?.Employee;
  const aadhar = ap?.documents?.find((d: any) => d.documentType === 'AADHAR')?.docNumber ?? '';
  const pan = ap?.documents?.find((d: any) => d.documentType === 'PAN')?.docNumber ?? '';

  const [editedProfile, setEditedProfile] = useState({
    name: profile?.name ?? '',
    email: profile?.email ?? '',
    phone: profile?.phone ?? '',
    role: profile?.role ?? '',
    designation: ap?.designation ?? '',
    department: ap?.department ?? '',
    bio: ap?.bio ?? '',
    skills: (ap?.skills ?? []).join(', '),
    languagesSpoken: (ap?.languagesSpoken ?? []).join(', '),
    aadhar,
    pan,
    salary: ap?.salary ?? 0,
    employmentType: ap?.employmentType ?? 'FULL_TIME',
    manager: ap?.manager?.name ?? '',
  });

  useEffect(() => {
    if (profile) {
      const ad = ap?.documents?.find((d: any) => d.documentType === 'AADHAR')?.docNumber ?? '';
      const pn = ap?.documents?.find((d: any) => d.documentType === 'PAN')?.docNumber ?? '';
      setEditedProfile({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        role: profile.role || '',
        department: ap?.department || '',
        designation: ap?.designation || '',
        bio: ap?.bio || '',
        skills: (ap?.skills ?? []).join(', '),
        languagesSpoken: (ap?.languagesSpoken ?? []).join(', '),
        aadhar: ad,
        pan: pn,
        salary: ap?.salary || 0,
        employmentType: ap?.employmentType || 'FULL_TIME',
        manager: ap?.manager?.name || '',
      });
    }
  }, [profile, ap]);

  const handleChange = (k: string, v: string) => {
    setEditedProfile(p => ({ ...p, [k]: v }));
  };

  const save = async () => {
    try {
      await dispatch(doUpdateProfile({
        name: editedProfile.name,
        email: editedProfile.email,
        phone: editedProfile.phone,
        designation: editedProfile.designation,
        department: editedProfile.department,
        bio: editedProfile.bio,
        skills: editedProfile.skills.split(',').map((s: string) => s.trim()).filter(Boolean),
        languagesSpoken: editedProfile.languagesSpoken.split(',').map((s: string) => s.trim()).filter(Boolean),
      })).unwrap();
      alert('Profile updated successfully');
      onClose();
      dispatch(fetchProfile());
    } catch (error) {
      alert('Failed to update profile');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { bgcolor: A.surface, border: `1px solid ${A.border}`, borderRadius: '14px' } }}>
      <DialogTitle sx={{ color: A.text, fontWeight: 700, fontSize: 15, pb: 1 }}>Edit Profile</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} mt={0.25}>
          <Grid item xs={12}>
            <TextField fullWidth size="small" label="Name" value={editedProfile.name}
              onChange={e => handleChange('name', e.target.value)}
              sx={fieldSx} InputLabelProps={{ sx: labelSx }} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth size="small" label="Email" value={editedProfile.email}
              sx={fieldSx} InputLabelProps={{ sx: labelSx }} InputProps={{ readOnly: true }}
              helperText="Contact admin to change email"
              FormHelperTextProps={{ sx: { color: A.textSub, fontSize: 10 } }} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth size="small" label="Role" value={editedProfile.role}
              sx={fieldSx} InputLabelProps={{ sx: labelSx }} InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth size="small" label="Phone" value={editedProfile.phone}
              onChange={e => handleChange('phone', e.target.value)}
              sx={fieldSx} InputLabelProps={{ sx: labelSx }} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="Department" value={editedProfile.department}
              sx={fieldSx} InputLabelProps={{ sx: labelSx }} InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="Designation" value={editedProfile.designation}
              sx={fieldSx} InputLabelProps={{ sx: labelSx }} InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ p: 1, border: `1px dashed ${A.border}`, borderRadius: '8px', bgcolor: 'rgba(255,255,255,0.03)' }}>
              <Typography sx={{ color: A.textSub, fontSize: 10, textTransform: 'uppercase', mb: 0.5 }}>Aadhar Card</Typography>
              <Typography sx={{ color: A.text, fontSize: 13, fontWeight: 600 }}>{editedProfile.aadhar || 'Not Provided'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ p: 1, border: `1px dashed ${A.border}`, borderRadius: '8px', bgcolor: 'rgba(255,255,255,0.03)' }}>
              <Typography sx={{ color: A.textSub, fontSize: 10, textTransform: 'uppercase', mb: 0.5 }}>PAN Card</Typography>
              <Typography sx={{ color: A.text, fontSize: 13, fontWeight: 600 }}>{editedProfile.pan || 'Not Provided'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="Salary" value={editedProfile.salary}
               sx={fieldSx} InputLabelProps={{ sx: labelSx }} InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="Employment Type" value={editedProfile.employmentType}
               sx={fieldSx} InputLabelProps={{ sx: labelSx }} InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth size="small" label="Reporting To (Manager)" value={editedProfile.manager}
               sx={fieldSx} InputLabelProps={{ sx: labelSx }} InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth size="small" label="Bio" multiline rows={2} value={editedProfile.bio}
              onChange={e => handleChange('bio', e.target.value)}
              sx={fieldSx} InputLabelProps={{ sx: labelSx }} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth size="small" label="Skills & Competencies (comma separated)" value={editedProfile.skills}
              onChange={e => handleChange('skills', e.target.value)}
              sx={fieldSx} InputLabelProps={{ sx: labelSx }}
              helperText="e.g. Negotiation, Lead Conversion, Site Tours"
              FormHelperTextProps={{ sx: { color: A.textSub, fontSize: 11 } }} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth size="small" label="Languages Spoken (comma separated)" value={editedProfile.languagesSpoken}
              onChange={e => handleChange('languagesSpoken', e.target.value)}
              sx={fieldSx} InputLabelProps={{ sx: labelSx }} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} sx={{ color: A.textSub, textTransform: 'none', fontSize: 13 }}>Cancel</Button>
        <Button variant="contained" onClick={save}
          sx={{ bgcolor: A.primary, textTransform: 'none', fontWeight: 600, borderRadius: '8px', fontSize: 13 }}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { profile, leaves } = useAppSelector((s: any) => s.agent);
  const [editOpen, setEditOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchLeaves());
  }, [dispatch]);

  const ap = profile?.Employee;

  const LEAVE_STATUS_COLOR: Record<string, string> = {
    PENDING: A.amber, APPROVED: A.green, REJECTED: A.red, CANCELLED: A.textSub,
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await dispatch(doUploadAvatar(file)).unwrap();
        alert('Profile photo updated');
        dispatch(fetchProfile());
      } catch (err) {
        alert('Failed to upload photo');
      }
    }
  };

  return (
    <Box>
      <PageHeader title="My Profile" action={
        <Box display="flex" gap={1}>
          <Button variant="outlined" startIcon={<BeachAccess />} size="small" onClick={() => setLeaveOpen(true)}
            sx={{ color: A.amber, borderColor: `${A.amber}50`, textTransform: 'none', fontSize: 13, borderRadius: '8px' }}>
            Request Leave
          </Button>
          <Button variant="contained" startIcon={<Edit />} size="small" onClick={() => setEditOpen(true)}
            sx={{ bgcolor: A.primary, textTransform: 'none', fontWeight: 600, borderRadius: '8px', fontSize: 13 }}>
            Edit Profile
          </Button>
        </Box>
      } />

      <Grid container spacing={2}>
        {/* Avatar + basic info */}
        <Grid item xs={12} md={4}>
          <Card>
            <Box p={2.5} textAlign="center">
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  src={profile?.avatarUrl ? `${profile.avatarUrl}${profile.avatarUrl.includes('?') ? '&' : '?' }t=${profile.updatedAt ? new Date(profile.updatedAt).getTime() : '0'}` : undefined}
                  sx={{
                    width: 100,
                    height: 100,
                    fontSize: '2rem',
                    bgcolor: 'primary.main',
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.8 },
                    mx: 'auto', mb: 2,
                  }}
                  onClick={handlePhotoClick}
                >
                  {profile?.name?.charAt(0)}
                </Avatar>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Box>
              <Typography sx={{ color: A.text, fontWeight: 700, fontSize: 17 }}>{profile?.name ?? '—'}</Typography>
              <Typography sx={{ color: A.textSub, fontSize: 13 }}>{ap?.designation ?? 'Sales Agent'}</Typography>
              {ap?.department && (
                <Chip label={ap.department} size="small"
                  sx={{ mt: 1, bgcolor: `${A.primary}15`, color: A.primary, fontSize: 11 }} />
              )}

              {ap?.bio && (
                <Typography sx={{ color: A.textSub, fontSize: 12.5, mt: 2, lineHeight: 1.6, textAlign: 'left' }}>
                  {ap.bio}
                </Typography>
              )}

              {ap?.skills?.length > 0 && (
                <Box mt={2} textAlign="left">
                  <Typography sx={{ color: A.muted, fontSize: 11, mb: 0.75, textTransform: 'uppercase', letterSpacing: 0.4 }}>Skills & Competencies</Typography>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {ap.skills.map((s: string) => (
                      <Chip key={s} label={s} size="small"
                        sx={{ fontSize: 10.5, height: 22, bgcolor: `${A.indigo}15`, color: A.indigo }} />
                    ))}
                  </Box>
                </Box>
              )}

              {ap?.languagesSpoken?.length > 0 && (
                <Box mt={2} textAlign="left">
                  <Typography sx={{ color: A.muted, fontSize: 11, mb: 0.75, textTransform: 'uppercase', letterSpacing: 0.4 }}>Languages</Typography>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {ap.languagesSpoken.map((l: string) => (
                      <Chip key={l} label={l} size="small"
                        sx={{ fontSize: 10.5, height: 22, bgcolor: `${A.green}12`, color: A.green }} />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Details */}
        <Grid item xs={12} md={8}>
          <Box mb={2}>
            <Card title="Account Details">
              <Box p={2}>
                {[
                  ['Email',      profile?.email,   false],
                  ['Phone',      profile?.phone,   false],
                  ['Role',       profile?.role,    false],
                  ['Emp Code',   ap?.employeeId,   true ],
                  ['Aadhar',     ap?.documents?.find((d: any) => d.documentType === 'AADHAR')?.docNumber, false],
                  ['PAN',        ap?.documents?.find((d: any) => d.documentType === 'PAN')?.docNumber,    false],
                  ['Salary',     INR(ap?.salary), false],
                  ['Emp Type',   ap?.employmentType, false],
                  ['Manager',    ap?.manager?.name, false],
                  ['Joined',     DATE(ap?.joiningDate), false],
                ].map(([l, v, m]) => (
                  <KVRow key={l as string} label={l as string} value={String(v ?? '—')} bold={!!m} />
                ))}
              </Box>
            </Card>
          </Box>

          {/* Targets */}
          {ap?.targetAmount > 0 && (
            <Box mb={2}>
              <Card title="My Targets" pad>
                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography sx={{ color: A.textSub, fontSize: 13 }}>Revenue Target</Typography>
                    <Typography sx={{ color: A.text, fontSize: 13 }}>{INR(ap.targetAmount)}</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={0}
                    sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,245,236,0.06)',
                      '& .MuiLinearProgress-bar': { bgcolor: A.green, borderRadius: 3 } }} />
                </Box>
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography sx={{ color: A.textSub, fontSize: 13 }}>Bookings Target</Typography>
                    <Typography sx={{ color: A.text, fontSize: 13 }}>{ap.targetBookings}</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={0}
                    sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,245,236,0.06)',
                      '& .MuiLinearProgress-bar': { bgcolor: A.primary, borderRadius: 3 } }} />
                </Box>
              </Card>
            </Box>
          )}

          {/* Leave history */}
          <Card title="Leave History" action={
            <Chip label={`${leaves.filter((l: any) => l.status === 'PENDING').length} pending`} size="small"
              sx={{ fontSize: 10, height: 20, bgcolor: `${A.amber}15`, color: A.amber }} />
          }>
            <Box p={1.5}>
              {leaves.length === 0
                ? <Typography sx={{ color: A.textSub, fontSize: 13, py: 2, textAlign: 'center' }}>No leave requests</Typography>
                : leaves.slice(0, 8).map((l: any) => {
                  const c = LEAVE_STATUS_COLOR[l.status] ?? A.textSub;
                  return (
                    <Box key={l.id} display="flex" justifyContent="space-between" alignItems="center"
                      py={0.9} sx={{ borderBottom: `1px solid ${A.border}` }}>
                      <Box>
                        <Typography sx={{ color: A.text, fontSize: 13 }}>
                          {l.leaveType} — {l.totalDays} day{l.totalDays > 1 ? 's' : ''}
                        </Typography>
                        <Typography sx={{ color: A.textSub, fontSize: 11.5 }}>
                          {DATE(l.startDate)} → {DATE(l.endDate)}
                        </Typography>
                      </Box>
                      <Chip label={l.status} size="small"
                        sx={{ fontSize: 10, height: 20, bgcolor: `${c}15`, color: c, fontWeight: 600 }} />
                    </Box>
                  );
                })
              }
            </Box>
          </Card>
        </Grid>
      </Grid>

      <EditProfileDialog open={editOpen} profile={profile} onClose={() => setEditOpen(false)} />
      <LeaveRequestDialog open={leaveOpen} onClose={() => setLeaveOpen(false)} />
    </Box>
  );
}
