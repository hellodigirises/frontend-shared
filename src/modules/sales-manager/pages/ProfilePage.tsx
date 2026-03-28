// src/modules/sales-manager/pages/ProfilePage.tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  Box, Grid, Typography, TextField, Button, Avatar,
  Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, S, DATE, INR, fieldSx, labelSx, selSx } from '../hooks';
import {
  fetchProfile,
  doUpdateProfile,
  doUploadAvatar,
} from '../store/salesSlice';
import { PageHeader, Card, KVRow } from '../components/ui';

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
      PaperProps={{ sx: { bgcolor: S.surface, border: `1px solid ${S.border}`, borderRadius: '14px' } }}>
      <DialogTitle sx={{ color: S.text, fontWeight: 700, fontSize: 15, pb: 1 }}>Edit Profile</DialogTitle>
      <DialogContent dividers sx={{ borderTop: `1px solid ${S.border}`, borderBottom: `1px solid ${S.border}` }}>
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
              FormHelperTextProps={{ sx: { color: S.textSub, fontSize: 10 } }} />
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
            <Box sx={{ p: 1, border: `1px dashed ${S.border}`, borderRadius: '8px', bgcolor: 'rgba(255,255,255,0.03)' }}>
              <Typography sx={{ color: S.textSub, fontSize: 10, textTransform: 'uppercase', mb: 0.5 }}>Aadhar Card</Typography>
              <Typography sx={{ color: S.text, fontSize: 13, fontWeight: 600 }}>{editedProfile.aadhar || 'Not Provided'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ p: 1, border: `1px dashed ${S.border}`, borderRadius: '8px', bgcolor: 'rgba(255,255,255,0.03)' }}>
              <Typography sx={{ color: S.textSub, fontSize: 10, textTransform: 'uppercase', mb: 0.5 }}>PAN Card</Typography>
              <Typography sx={{ color: S.text, fontSize: 13, fontWeight: 600 }}>{editedProfile.pan || 'Not Provided'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="Employment Type" value={editedProfile.employmentType}
               sx={fieldSx} InputLabelProps={{ sx: labelSx }} InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={6}>
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
              helperText="e.g. Sales, CRM, Leadership"
              FormHelperTextProps={{ sx: { color: S.textSub, fontSize: 11 } }} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth size="small" label="Languages Spoken (comma separated)" value={editedProfile.languagesSpoken}
              onChange={e => handleChange('languagesSpoken', e.target.value)}
              sx={fieldSx} InputLabelProps={{ sx: labelSx }} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} sx={{ color: S.textSub, textTransform: 'none', fontSize: 13 }}>Cancel</Button>
        <Button variant="contained" onClick={save}
          sx={{ bgcolor: S.primary, textTransform: 'none', fontWeight: 600, borderRadius: '8px', fontSize: 13 }}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector((s: any) => s.sales);
  const [editOpen, setEditOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  const ap = profile?.Employee;

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
        <Button variant="contained" startIcon={<Edit />} size="small" onClick={() => setEditOpen(true)}
          sx={{ bgcolor: S.primary, textTransform: 'none', fontWeight: 600, borderRadius: '8px', fontSize: 13 }}>
          Edit Profile
        </Button>
      } />

      <Grid container spacing={2}>
        {/* Avatar + basic info */}
        <Grid item xs={12} md={4}>
          <Card>
            <Box p={2.5} textAlign="center">
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  src={profile?.avatarUrl}
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
              <Typography sx={{ color: S.text, fontWeight: 700, fontSize: 17 }}>{profile?.name ?? '—'}</Typography>
              <Typography sx={{ color: S.textSub, fontSize: 13 }}>{ap?.designation ?? 'Sales Manager'}</Typography>
              {ap?.department && (
                <Chip label={ap.department} size="small"
                  sx={{ mt: 1, bgcolor: `${S.primary}15`, color: S.primary, fontSize: 11 }} />
              )}

              {ap?.bio && (
                <Typography sx={{ color: S.textSub, fontSize: 12.5, mt: 2, lineHeight: 1.6, textAlign: 'left' }}>
                  {ap.bio}
                </Typography>
              )}

              {ap?.skills?.length > 0 && (
                <Box mt={2} textAlign="left">
                  <Typography sx={{ color: S.muted, fontSize: 11, mb: 0.75, textTransform: 'uppercase', letterSpacing: 0.4 }}>Skills & Competencies</Typography>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {ap.skills.map((s: string) => (
                      <Chip key={s} label={s} size="small"
                        sx={{ fontSize: 10.5, height: 22, bgcolor: `${S.primary}15`, color: S.primary }} />
                    ))}
                  </Box>
                </Box>
              )}

              {ap?.languagesSpoken?.length > 0 && (
                <Box mt={2} textAlign="left">
                  <Typography sx={{ color: S.muted, fontSize: 11, mb: 0.75, textTransform: 'uppercase', letterSpacing: 0.4 }}>Languages</Typography>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {ap.languagesSpoken.map((l: string) => (
                      <Chip key={l} label={l} size="small"
                        sx={{ fontSize: 10.5, height: 22, bgcolor: `${S.cyan}12`, color: S.cyan }} />
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
        </Grid>
      </Grid>

      <EditProfileDialog open={editOpen} profile={profile} onClose={() => setEditOpen(false)} />
    </Box>
  );
}
