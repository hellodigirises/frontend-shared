import React, { useEffect, useState, useRef } from 'react';
import {
  Box, Typography, Card, Button, Stack, TextField, MenuItem,
  CircularProgress, Grid, Divider, IconButton, Paper, Switch,
  FormControlLabel, Alert, Breadcrumbs, Link, Avatar, InputAdornment,
  Tooltip, Chip, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import {
  ArrowBackOutlined, SaveOutlined, PersonAddOutlined,
  SettingsOutlined, BusinessCenterOutlined, CalendarTodayOutlined,
  EmailOutlined, PhoneOutlined, LockResetOutlined, GroupOutlined,
  RefreshOutlined, VisibilityOutlined, VisibilityOffOutlined,
  CheckCircleOutlined, BadgeOutlined, AutoFixHighOutlined,
  ExpandMoreOutlined, ArticleOutlined, PhotoCameraOutlined,
  CloudUploadOutlined, DeleteOutline
} from '@mui/icons-material';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import api from '../../../../api/axios';

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const generatePassword = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};
const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444'];
const avatarColor = (name: string) => COLORS[name.charCodeAt(0) % COLORS.length];

const DOC_TYPES = [
  { value: 'AADHAR',          label: 'Aadhar Card' },
  { value: 'PAN',             label: 'PAN Card' },
  { value: 'PASSPORT',        label: 'Passport' },
  { value: 'DRIVING_LICENSE', label: 'Driving License' },
  { value: 'VOTER_ID',        label: 'Voter ID' },
  { value: 'OTHER',           label: 'Other' },
];

interface DocumentEntry {
  docType: string;
  docNumber: string;
  fileUrl: string;
  notes: string;
  fileName?: string;
}

/* ─── Main Component ──────────────────────────────────────────────────────── */
const StaffOnboardingPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = window.location.pathname;
  const isHR = location.includes('/hr/');
  const basePath = isHR ? '/hr/employees' : '/admin/users';
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [roles, setRoles] = useState<{ id: string, name: string }[]>([]);
  const [managers, setManagers] = useState<{ id: string, name: string }[]>([]);
  const [tenantSettings, setTenantSettings] = useState<{ name: string, emailDomain?: string | null } | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [suggestedEmpId, setSuggestedEmpId] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    roleId: '',
    department: '',
    joiningDate: new Date().toISOString().split('T')[0],
    managerId: '',
    employeeId: '',
    designation: '',
    salary: 0,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    sendEmail: true,
    avatarUrl: '',
  });

  const [documents, setDocuments] = useState<DocumentEntry[]>([
    { docType: 'AADHAR', docNumber: '', fileUrl: '', notes: '' },
    { docType: 'PAN',    docNumber: '', fileUrl: '', notes: '' },
  ]);

  useEffect(() => {
    fetchMetadata();
    if (isEdit) fetchUser();
  }, [id]);

  const fetchMetadata = async () => {
    // 1. Fallback Roles (safety net if API fails)
    const FALLBACK_ROLES = [
      { id: 'AGENT', name: 'Agent' },
      { id: 'SALES_MANAGER', name: 'Sales Manager' },
      { id: 'HR', name: 'HR' },
      { id: 'FINANCE', name: 'Finance' },
      { id: 'PROCUREMENT', name: 'Procurement' },
    ];

    try {
      // 2. Individual fetches to prevent one failure from blocking others
      const fetchRoles = api.get('/users/available-roles').then(r => {
        const d = r.data?.data ?? r.data;
        if (Array.isArray(d) && d.length > 0) setRoles(d);
        else if (roles.length === 0) setRoles(FALLBACK_ROLES);
      }).catch(err => {
        console.error('Failed to fetch roles:', err);
        if (roles.length === 0) setRoles(FALLBACK_ROLES);
      });

      const fetchManagers = api.get('/users').then(r => {
        const d = r.data?.data ?? r.data;
        setManagers(Array.isArray(d) ? (d as any[]).filter(m => m.id !== id) : []);
      }).catch(err => console.error('Failed to fetch managers:', err));

      const fetchSettings = api.get('/users/tenant-settings').then(r => {
        setTenantSettings(r.data?.data ?? r.data);
      }).catch(err => console.error('Failed to fetch tenant settings:', err));

      const fetchEmpId = api.get('/settings/employee-id-config/next').then(res => {
        if (res?.data?.data && !isEdit) {
          setSuggestedEmpId(res.data.data.nextId ?? '');
          setForm(f => ({ ...f, employeeId: res.data.data.nextId ?? '' }));
        }
      }).catch(() => null);

      await Promise.allSettled([fetchRoles, fetchManagers, fetchSettings, fetchEmpId]);
    } catch (e) { 
      console.error('Metadata fetch error:', e);
      if (roles.length === 0) setRoles(FALLBACK_ROLES);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await api.get(`/users/${id}`);
      const user = res.data?.data ?? res.data;
      setForm({
        name:        user.name ?? '',
        email:       user.email ?? '',
        phone:       user.phone ?? '',
        password:    '',
        roleId:      typeof user.role === 'string' ? user.role : user.role?.id ?? '',
        department:  user.department ?? '',
        joiningDate: user.joiningDate ? user.joiningDate.split('T')[0] : new Date().toISOString().split('T')[0],
        managerId:   user.managerId ?? '',
        employeeId:  user.employeeId ?? '',
        designation: user.Employee?.designation ?? user.department ?? '',
        salary:      user.Employee?.salary ?? 0,
        status:      user.isActive === false ? 'INACTIVE' : 'ACTIVE',
        sendEmail:   false,
        avatarUrl:   user.avatarUrl ?? '',
      });
      setAvatarPreview(user.avatarUrl ?? null);

      if (user.Employee?.documents) {
        setDocuments(user.Employee.documents.map((d: any) => ({
          docType: d.documentType,
          docNumber: d.docNumber ?? '',
          fileUrl: d.fileUrl ?? '',
          notes: d.notes ?? '',
          fileName: d.fileUrl ? d.fileUrl.split('/').pop() : ''
        })));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.name) errors.name = 'Name is required';
    if (!form.email) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Invalid Email Address';
    
    if (form.phone && !/^\d{10}$/.test(form.phone)) errors.phone = 'Phone must be exactly 10 digits';
    if (!isEdit && !form.password) errors.password = 'Password is required';
    else if (!isEdit && form.password.length < 8) errors.password = 'At least 8 characters';

    // Document Validation
    documents.forEach((doc, i) => {
      if (doc.docType === 'AADHAR' && doc.docNumber && !/^\d{12}$/.test(doc.docNumber.replace(/\s/g, ''))) {
        errors[`doc_${i}`] = 'Aadhar must be 12 digits';
      }
      if (doc.docType === 'PAN' && doc.docNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(doc.docNumber.toUpperCase())) {
        errors[`doc_${i}`] = 'Invalid PAN format (e.g. ABCDE1234F)';
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    setError(null);
    setFieldErrors({});

    try {
      const payload = { ...form };
      if (isEdit && !payload.password) delete (payload as any).password;
      
      let userId: string;
      if (isEdit) {
        await api.put(`/users/${id}`, payload);
        userId = id!;
      } else {
        const res = await api.post('/users', payload);
        const created = res.data?.data ?? res.data;
        userId = created?.id;
      }

      // Save documents
      const docsToSave = documents.filter(d => d.docNumber || d.fileUrl);
      if (docsToSave.length > 0 && userId) {
        await Promise.allSettled(
          docsToSave.map(doc =>
            api.post(`/users/${userId}/documents`, { ...doc, tag: 'EMPLOYEE_DOCUMENT' })
          )
        );
      }

      // If a new avatar was selected (base64 or URL), update via the avatar endpoint too
      if (avatarPreview && avatarPreview.startsWith('data:') && userId) {
        await api.post(`/users/${userId}/avatar`, { avatarUrl: avatarPreview }).catch(() => {});
      }

      setSuccess(true);
      setTimeout(() => navigate(basePath), 2000);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Something went wrong';
      
      // Map 409 Conflict to fields
      if (err.response?.status === 409) {
        if (msg.toLowerCase().includes('email')) setFieldErrors(prev => ({ ...prev, email: 'Email already in use' }));
        else if (msg.toLowerCase().includes('employee id')) setFieldErrors(prev => ({ ...prev, employeeId: 'ID already in use' }));
        setError(msg);
      } 
      // Map Zod/Validation errors
      else if (err.response?.status === 400 && err.response?.data?.details) {
        const details = err.response.data.details;
        const newFieldErrors: any = {};
        details.forEach((d: any) => { newFieldErrors[d.field] = d.message; });
        setFieldErrors(newFieldErrors);
      }
      else {
        setError(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAvatarPreview(base64);
        setForm(prev => ({ ...prev, avatarUrl: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size should be less than 2MB for this demonstration.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        updateDoc(index, 'fileUrl', base64);
        updateDoc(index, 'fileName', file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateDoc = (index: number, field: keyof DocumentEntry, value: string) => {
    setDocuments(prev => prev.map((d, i) => i === index ? { ...d, [field]: value } : d));
  };

  const addDoc = () =>
    setDocuments(prev => [...prev, { docType: 'OTHER', docNumber: '', fileUrl: '', notes: '' }]);
  const removeDoc = (index: number) =>
    setDocuments(prev => prev.filter((_, i) => i !== index));

  const emailDomain = tenantSettings?.emailDomain ?? '';
  const nameSlug = form.name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
  const previewEmail = nameSlug && emailDomain ? `${nameSlug}@${emailDomain}` : '';

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress size={40} />
    </Box>
  );

  if (success) return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="70vh" gap={2}>
      <CheckCircleOutlined sx={{ fontSize: 72, color: 'success.main' }} />
      <Typography variant="h5" fontWeight={800}>
        {isEdit ? 'Updated!' : 'Member Onboarded!'}
      </Typography>
      <Typography color="text.secondary">Redirecting you back…</Typography>
    </Box>
  );

  return (
    <Box maxWidth={900} mx="auto">
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link component={RouterLink} to={basePath} underline="hover" color="inherit" sx={{ fontSize: 13 }}>
          {isHR ? 'Employees' : 'Users'}
        </Link>
        <Typography color="text.primary" sx={{ fontSize: 13 }}>
          {isEdit ? 'Edit Member' : 'Add Member'}
        </Typography>
      </Breadcrumbs>

      <Stack direction="row" alignItems="center" spacing={2} mb={4}>
        <IconButton onClick={() => navigate(basePath)}>
          <ArrowBackOutlined />
        </IconButton>
        <Box flex={1}>
          <Typography variant="h5" fontWeight={800}>
            {isEdit ? 'Edit Member' : 'Add New Member'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isEdit ? 'Update member details' : 'Fill in the details to onboard a new staff member'}
          </Typography>
        </Box>
        
        {/* Profile Photo Upload */}
        <Box position="relative">
          <Avatar 
            src={avatarPreview || ''}
            sx={{ width: 80, height: 80, bgcolor: avatarColor(form.name || 'U'), fontWeight: 800, fontSize: 32, cursor: 'pointer', border: '2px solid white', boxShadow: 3 }}
            onClick={() => avatarInputRef.current?.click()}
          >
            {getInitials(form.name || 'User')}
          </Avatar>
          <IconButton 
            size="small" 
            sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
            onClick={() => avatarInputRef.current?.click()}
          >
            <PhotoCameraOutlined sx={{ fontSize: 14 }} />
          </IconButton>
          <input type="file" hidden ref={avatarInputRef} accept="image/*" onChange={handleAvatarChange} />
        </Box>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>

          {/* ────── Section 1: Personal Info ────── */}
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
              <PersonAddOutlined color="primary" />
              <Typography variant="subtitle1" fontWeight={800}>Personal Information</Typography>
            </Stack>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth required label="Full Name"
                  placeholder="e.g. John Doe"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  error={!!fieldErrors.name}
                  helperText={fieldErrors.name}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth required label="Personal Email" type="email"
                  placeholder="john@gmail.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  error={!!fieldErrors.email}
                  helperText={fieldErrors.email}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Phone Number"
                  placeholder="10 digit mobile number"
                  value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  error={!!fieldErrors.phone}
                  helperText={fieldErrors.phone}
                  inputProps={{ maxLength: 10 }}
                  InputProps={{ startAdornment: <InputAdornment position="start">+91</InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
              </Grid>
              {previewEmail && (
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: 'hsl(215,100%,98%)' }}>
                    <Typography variant="caption" color="primary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.8 }}>
                      Generated Company Email
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace', mt: 0.5 }}>
                      {previewEmail}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Card>

          {/* ────── Section 2: Role & Professional ────── */}
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
              <SettingsOutlined color="primary" />
              <Typography variant="subtitle1" fontWeight={800}>Role & Professional Details</Typography>
            </Stack>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField select fullWidth required label="System Role"
                  helperText="Defines platform access permissions"
                  value={form.roleId} onChange={e => setForm({ ...form, roleId: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}>
                  {roles.map(r => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Job Designation"
                  placeholder="e.g. Senior Executive, Team Lead"
                  value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Department"
                  placeholder="e.g. Sales, Marketing, HR"
                  value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Monthly Salary (INR)" type="number"
                  placeholder="e.g. 50000"
                  value={form.salary} onChange={e => setForm({ ...form, salary: parseFloat(e.target.value) || 0 })}
                  InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Joining Date" type="date"
                  value={form.joiningDate} onChange={e => setForm({ ...form, joiningDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField select fullWidth label="Reporting To (Manager)"
                  value={form.managerId} onChange={e => setForm({ ...form, managerId: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}>
                  <MenuItem value=""><em>None</em></MenuItem>
                  {managers.map(m => <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Employee ID"
                  value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })}
                  placeholder={suggestedEmpId}
                  error={!!fieldErrors.employeeId}
                  helperText={fieldErrors.employeeId || (suggestedEmpId ? `Suggested: ${suggestedEmpId}` : '')}
                  InputProps={{
                    endAdornment: suggestedEmpId && (
                      <InputAdornment position="end">
                        <Tooltip title="Use Suggestion">
                          <IconButton onClick={() => setForm(f => ({ ...f, employeeId: suggestedEmpId }))} edge="end">
                             <AutoFixHighOutlined fontSize="small" color="primary" />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    )
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
              </Grid>
            </Grid>
          </Card>

          {/* ────── Section 3: Documents & KYC ────── */}
          <Accordion defaultExpanded sx={{ borderRadius: '12px !important', boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <ArticleOutlined color="primary" />
                <Typography variant="subtitle1" fontWeight={800}>Documents & KYC</Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                {documents.map((doc, i) => (
                  <Paper key={i} variant="outlined" sx={{ p: 2, borderRadius: 3, position: 'relative' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={3}>
                        <TextField select fullWidth size="small" label="Type"
                          value={doc.docType} onChange={e => updateDoc(i, 'docType', e.target.value)}>
                          {DOC_TYPES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField fullWidth size="small" label="Document Number"
                          placeholder={doc.docType === 'AADHAR' ? '12 Digit Number' : doc.docType === 'PAN' ? 'ABCDE1234F' : 'Enter number'}
                          value={doc.docNumber} onChange={e => updateDoc(i, 'docNumber', e.target.value)}
                          error={!!fieldErrors[`doc_${i}`]}
                          helperText={fieldErrors[`doc_${i}`]}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Button 
                          variant="outlined" 
                          fullWidth 
                          component="label" 
                          startIcon={doc.fileUrl ? <CheckCircleOutlined color="success" /> : <CloudUploadOutlined />}
                          sx={{ height: 40, borderStyle: 'dashed', textTransform: 'none' }}
                        >
                          {doc.fileName ? doc.fileName.slice(0, 10) + '...' : 'Upload'}
                          <input type="file" hidden onChange={e => handleDocFileUpload(i, e)} />
                        </Button>
                      </Grid>
                      <Grid item xs={12} sm={2} display="flex" justifyContent="flex-end">
                        <IconButton color="error" onClick={() => removeDoc(i)} disabled={documents.length <= 1}>
                          <DeleteOutline />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
                <Button variant="text" onClick={addDoc} sx={{ alignSelf: 'flex-start' }}>+ Add More Documents</Button>
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* ────── Section 4: Security ────── */}
          {!isEdit && (
            <Card sx={{ p: 3, borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
                <LockResetOutlined color="primary" />
                <Typography variant="subtitle1" fontWeight={800}>Security & Credentials</Typography>
              </Stack>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={8}>
                  <TextField fullWidth required label="Temporary Password"
                    type={showPass ? 'text' : 'password'}
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPass(!showPass)}>
                            {showPass ? <VisibilityOffOutlined fontSize="small" /> : <VisibilityOutlined fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button variant="outlined" fullWidth onClick={() => { setForm({ ...form, password: generatePassword() }); setShowPass(true); }} sx={{ height: 56, borderRadius: 3 }}>
                    Generate
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Switch checked={form.sendEmail} onChange={e => setForm({ ...form, sendEmail: e.target.checked })} />}
                    label="Send login credentials and welcome email to primary email"
                  />
                </Grid>
              </Grid>
            </Card>
          )}

          {/* Submit */}
          <Stack direction="row" spacing={2} justifyContent="flex-end" pt={4}>
            <Button size="large" onClick={() => navigate(basePath)}>Cancel</Button>
            <Button type="submit" size="large" variant="contained" disableElevation
              disabled={saving} startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveOutlined />}
              sx={{ px: 6, borderRadius: 3, fontWeight: 700 }}>
              {isEdit ? 'Save Changes' : 'Onboard Employee'}
            </Button>
          </Stack>

        </Stack>
      </form>
    </Box>
  );
};

export default StaffOnboardingPage;
