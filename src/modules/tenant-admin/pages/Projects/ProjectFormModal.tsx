import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Stack, Button, TextField, Chip,
  IconButton, Divider, Grid, Paper, Tabs, Tab,
  FormControl, InputLabel, Select, MenuItem,
  InputAdornment, CircularProgress, Tooltip, Alert
} from '@mui/material';
import {
  CloseOutlined, AddOutlined, RefreshOutlined,
  MyLocationOutlined, ImageOutlined, DeleteOutlineOutlined,
  PictureAsPdfOutlined, ViewInArOutlined, MapOutlined,
  VerifiedOutlined, AttachMoneyOutlined, HomeWorkOutlined
} from '@mui/icons-material';
import {
  Project, PropertyType, ProjectStatus, PROPERTY_TYPES, PROJECT_STATUSES,
  DEFAULT_AMENITIES, INFRA_TYPES, UNIT_TYPES, FACING_OPTIONS, fmtPrice
} from './propertyTypes';
import api from '../../../../api/axios';

// ─── OSM iframe ──────────────────────────────────────────────────────────────
const osmSrc = (lat: number, lng: number) =>
  `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.012},${lat - 0.012},${lng + 0.012},${lat + 0.012}&layer=mapnik&marker=${lat},${lng}`;

// ─── Tag Input ────────────────────────────────────────────────────────────────
const TagInput = ({ label, values, onChange, placeholder }: {
  label: string; values: string[]; onChange: (v: string[]) => void; placeholder?: string;
}) => {
  const [val, setVal] = useState('');
  const add = () => { if (val.trim()) { onChange([...values, val.trim()]); setVal(''); } };
  return (
    <Box>
      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.8 }}>
        {label}
      </Typography>
      <Stack direction="row" flexWrap="wrap" spacing={0.5} sx={{ mt: 0.75, mb: 1, minHeight: 28 }}>
        {values.map((v, i) => (
          <Chip key={i} label={v} size="small" onDelete={() => onChange(values.filter((_, j) => j !== i))} sx={{ my: 0.25 }} />
        ))}
      </Stack>
      <Stack direction="row" spacing={1}>
        <TextField size="small" fullWidth value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={placeholder ?? `Add ${label.toLowerCase()} and press Enter`} />
        <Button variant="outlined" size="small" onClick={add}>Add</Button>
      </Stack>
    </Box>
  );
};

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) => (
  <Stack direction="row" alignItems="flex-start" spacing={1.5} mb={3}>
    <Box sx={{ color: 'primary.main', mt: 0.25 }}>{icon}</Box>
    <Box>
      <Typography variant="subtitle1" fontWeight={800}>{title}</Typography>
      {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
    </Box>
  </Stack>
);

const FileUploadButton = ({ label, onUpload, loading, accept = "image/*,.pdf" }: { 
  label: string; onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void; loading: boolean; accept?: string;
}) => (
  <Button variant="outlined" component="label" fullWidth 
    startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <ImageOutlined />}
    disabled={loading}
    sx={{ textTransform: 'none', borderRadius: 2, height: 40, fontWeight: 700 }}>
    {loading ? 'Uploading...' : label}
    <input type="file" hidden accept={accept} onChange={onUpload} />
  </Button>
);

// ─── BLANK FORM ───────────────────────────────────────────────────────────────
const BLANK: Omit<Project, 'id' | 'towers'> = {
  name: '', propertyType: 'RESIDENTIAL_BUILDING', developerName: '',
  status: 'PLANNED', launchDate: '', completionDate: '',
  totalArea: undefined, totalUnits: undefined, reraNumber: '', description: '',
  address: '', city: '', state: '', pincode: '', latitude: undefined, longitude: undefined, googleMapsUrl: '',
  layoutMapUrl: '', masterPlanUrl: '', plotLayoutUrl: '',
  projectImages: [], projectVideos: [], brochureUrl: '', tourUrl3d: '', droneFootageUrl: '',
  amenityIds: [], nearbyPlaces: [],
  basePrice: undefined, pricePerSqFt: undefined, maintenanceCharges: undefined, 
  maintenancePeriod: 'MONTHLY', parkingPrice: undefined, gstPercent: undefined,
  stampDutyPercent: undefined, registrationCharges: undefined,
  approvalAuthority: '', developmentAuthority: '', landOwnership: '', reraDocUrl: '', landDocUrl: '',
  location: '',
};

// ─── TABS ─────────────────────────────────────────────────────────────────────
const TABS = [
  { label: 'Basic Info', icon: '🏗' },
  { label: 'Location & Map', icon: '📍' },
  { label: 'Amenities', icon: '🏊' },
  { label: 'Property Layout', icon: '📐' },
  { label: 'Media', icon: '🖼' },
  { label: 'Legal & Govt', icon: '📋' },
  { label: 'Pricing', icon: '💰' },
  { label: 'Infrastructure', icon: '🗺' },
];

// ─── Main Component ───────────────────────────────────────────────────────────
interface Props {
  open: boolean;
  onClose: () => void;
  initial: Project | null;
  onSave: () => void;
}

const ProjectFormModal: React.FC<Props> = ({ open, onClose, initial, onSave }) => {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState<typeof BLANK>({ ...BLANK });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const isEdit = !!initial?.id;
  const isLand = form.propertyType === 'LAND';
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      if (initial) {
        // Format dates from ISO to YYYY-MM-DD for HTML input
        const fmt = (d: any) => d ? new Date(d).toISOString().split('T')[0] : '';
        setForm({
          ...BLANK,
          ...initial,
          launchDate: fmt(initial.launchDate),
          completionDate: fmt(initial.completionDate),
        });
      } else {
        setForm({ ...BLANK });
      }
      setTab(0); setErrors({}); setSuccess(false);
    }
  }, [open, initial]);

  const set = (k: keyof typeof BLANK, v: any) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(prev => {
      const next = { ...prev };
      delete next[k];
      return next;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrors({});
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/inventory/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (field === 'projectImages') {
        set('projectImages', [...(form.projectImages || []), res.data.url]);
      } else if (field === 'projectVideos') { // added check for projectVideos
        set('projectVideos', [...(form.projectVideos || []), res.data.url]);
      } else {
        set(field as keyof typeof BLANK, res.data.url);
      }
    } catch (err) {
      console.error('Upload failed', err);
      setErrors({ base: 'File upload failed (Max 5MB, JPG/PNG/PDF).' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setErrors({});
    try {
      // Filter payload to only include fields in BLANK to avoid Prisma errors with extra fields
      const payload: any = {};
      Object.keys(BLANK).forEach(k => {
        const val = (form as any)[k];
        if (val !== undefined && val !== null) payload[k] = val;
      });

      console.log('SAVING PROJECT WITH DATA:', payload);
      if (isEdit) await api.put(`/inventory/projects/${initial!.id}`, payload);
      else await api.post('/inventory/projects', payload);
      
      setSuccess(true); 
      onSave();
      setTimeout(onClose, 1200);
    } catch (e: any) { 
      console.error('SAVE ERROR:', e);
      if (e.response?.data) console.log('ERROR DETAILS:', e.response.data);

      if (e.response?.data?.details) {
        const errMap: Record<string, string> = {};
        e.response.data.details.forEach((d: any) => { 
          const field = d.field || (d.path && d.path[0]);
          if (field) errMap[field] = d.message; 
        });
        setErrors(errMap);
      } else if (e.response?.data?.error) {
        setErrors({ base: e.response.data.error + (e.response.data.details ? ': ' + JSON.stringify(e.response.data.details) : '') });
      } else {
        setErrors({ base: 'Failed to save project. Please check fields or server logs.' });
      }
    }
    finally { setSaving(false); }
  };

  // ─── Tabs content ──────────────────────────────────────────────────────────
  const renderTab = () => {
    switch (tab) {
      // ── 0: Basic Info ──────────────────────────────────────────────────────
      case 0: return (
        <Stack spacing={3}>
          <SectionHeader icon={<HomeWorkOutlined />} title="Basic Information" subtitle="Core project identity and timeline" />

          {/* Property type selector */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.8, mb: 1, display: 'block' }}>
              Property Type *
            </Typography>
            <Grid container spacing={1.5}>
              {PROPERTY_TYPES.map(pt => (
                <Grid item xs={12} sm={4} key={pt.value}>
                  <Paper
                    onClick={() => set('propertyType', pt.value)}
                    sx={{
                      p: 2, borderRadius: 3, cursor: 'pointer',
                      border: '2px solid', transition: 'all .15s',
                      borderColor: form.propertyType === pt.value ? 'primary.main' : errors.propertyType ? 'error.main' : 'divider',
                      bgcolor: form.propertyType === pt.value ? 'primary.50' : 'background.paper',
                      '&:hover': { borderColor: 'primary.main' },
                    }}>
                    <Typography fontSize={24} mb={0.5}>{pt.icon}</Typography>
                    <Typography variant="body2" fontWeight={800}>{pt.label}</Typography>
                    <Typography variant="caption" color="text.secondary">{pt.desc}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            {errors.propertyType && <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>{errors.propertyType}</Typography>}
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField fullWidth label="Project Name *" size="small" value={form.name}
              onChange={e => set('name', e.target.value)}
              error={!!errors.name} helperText={errors.name} />
            <TextField fullWidth label="Developer / Builder" size="small" value={form.developerName}
              onChange={e => set('developerName', e.target.value)}
              error={!!errors.developerName} helperText={errors.developerName} />
          </Stack>

          <TextField fullWidth label="Project Description" size="small" multiline rows={3}
            value={form.description} onChange={e => set('description', e.target.value)}
            error={!!errors.description} helperText={errors.description} />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl fullWidth size="small" error={!!errors.status}>
              <InputLabel>Project Status</InputLabel>
              <Select value={form.status} label="Project Status"
                onChange={e => set('status', e.target.value as ProjectStatus)}>
                {PROJECT_STATUSES.map(s => (
                  <MenuItem key={s.value} value={s.value}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color }} />
                      {s.label}
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
              {errors.status && <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>{errors.status}</Typography>}
            </FormControl>
            <TextField fullWidth label="RERA Number" size="small" value={form.reraNumber}
              onChange={e => set('reraNumber', e.target.value)}
              error={!!errors.reraNumber} helperText={errors.reraNumber}
              InputProps={{ startAdornment: <InputAdornment position="start"><VerifiedOutlined sx={{ fontSize: 16 }} /></InputAdornment> }} />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField fullWidth label="Launch Date" size="small" type="date"
              InputLabelProps={{ shrink: true }} value={form.launchDate}
              onChange={e => set('launchDate', e.target.value)}
              error={!!errors.launchDate} helperText={errors.launchDate} />
            <TextField fullWidth label="Completion Date" size="small" type="date"
              InputLabelProps={{ shrink: true }} value={form.completionDate}
              onChange={e => set('completionDate', e.target.value)}
              error={!!errors.completionDate} helperText={errors.completionDate} />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField fullWidth label="Total Area (sq.ft)" size="small" type="number"
              value={form.totalArea ?? ''} onChange={e => {
                const v = parseFloat(e.target.value);
                set('totalArea', isNaN(v) ? undefined : v);
              }}
              error={!!errors.totalArea} helperText={errors.totalArea} />
            <TextField fullWidth label="Total Units / Plots" size="small" type="number"
              value={form.totalUnits ?? ''} onChange={e => {
                const v = parseInt(e.target.value);
                set('totalUnits', isNaN(v) ? undefined : v);
              }}
              error={!!errors.totalUnits} helperText={errors.totalUnits} />
          </Stack>
        </Stack>
      );

      // ── 1: Location & Map ─────────────────────────────────────────────────
      case 1: return (
        <Stack spacing={3}>
          <SectionHeader icon={<MapOutlined />} title="Location & Map" subtitle="Geographic details and map pin" />

          <TextField fullWidth label="Full Address" size="small" value={form.address}
            onChange={e => set('address', e.target.value)} multiline rows={2}
            error={!!errors.address} helperText={errors.address} />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField fullWidth label="City" size="small" value={form.city}
              onChange={e => set('city', e.target.value)}
              error={!!errors.city} helperText={errors.city} />
            <TextField fullWidth label="State" size="small" value={form.state}
              onChange={e => set('state', e.target.value)}
              error={!!errors.state} helperText={errors.state} />
            <TextField fullWidth label="Pincode" size="small" value={form.pincode}
              onChange={e => set('pincode', e.target.value)}
              error={!!errors.pincode} helperText={errors.pincode} />
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField fullWidth label="Latitude" size="small" type="number"
              value={form.latitude ?? ''} onChange={e => {
                const v = parseFloat(e.target.value);
                set('latitude', isNaN(v) ? undefined : v);
              }}
              error={!!errors.latitude} helperText={errors.latitude}
              InputProps={{ startAdornment: <InputAdornment position="start">°N</InputAdornment> }} />
            <TextField fullWidth label="Longitude" size="small" type="number"
              value={form.longitude ?? ''} onChange={e => {
                const v = parseFloat(e.target.value);
                set('longitude', isNaN(v) ? undefined : v);
              }}
              error={!!errors.longitude} helperText={errors.longitude}
              InputProps={{ startAdornment: <InputAdornment position="start">°E</InputAdornment> }} />
            <Tooltip title="Use current device location">
              <IconButton size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, px: 1.5 }}
                onClick={() => navigator.geolocation?.getCurrentPosition(p => {
                  set('latitude', p.coords.latitude); set('longitude', p.coords.longitude);
                })}>
                <MyLocationOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>

          <TextField fullWidth label="Google Maps URL" size="small" value={form.googleMapsUrl}
            onChange={e => set('googleMapsUrl', e.target.value)}
            error={!!errors.googleMapsUrl} helperText={errors.googleMapsUrl}
            InputProps={{ startAdornment: <InputAdornment position="start">🗺</InputAdornment> }} />

          {/* Map preview */}
          {form.latitude && form.longitude ? (
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700} mb={0.75} display="block">
                Map Preview — {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}
              </Typography>
              <Box sx={{ borderRadius: 3, overflow: 'hidden', height: 260, border: '1px solid', borderColor: 'divider' }}>
                <iframe title="map" src={osmSrc(form.latitude, form.longitude)}
                  width="100%" height="260" style={{ border: 'none', display: 'block' }} />
              </Box>
            </Box>
          ) : (
            <Paper variant="outlined" sx={{ p: 5, borderRadius: 3, textAlign: 'center', color: 'text.secondary', borderStyle: 'dashed' }}>
              <MapOutlined sx={{ fontSize: 48, opacity: 0.2, mb: 1 }} />
              <Typography variant="body2" fontWeight={600}>Enter coordinates above to preview the location</Typography>
              <Typography variant="caption">Or click the 📍 button to use your device's GPS</Typography>
            </Paper>
          )}
        </Stack>
      );

      // ── 2: Amenities ──────────────────────────────────────────────────────
      case 2: return (
        <Stack spacing={3}>
          <SectionHeader icon={<span style={{ fontSize: 20 }}>🏊</span>} title="Amenities" subtitle="Select all amenities available at this project" />
          <Grid container spacing={1.5}>
            {DEFAULT_AMENITIES.map((a, i) => {
              const id = `amenity_${i}`;
              const selected = (form.amenityIds ?? []).includes(id);
              return (
                <Grid item xs={6} sm={4} md={3} key={id}>
                  <Paper
                    onClick={() => {
                      const ids = form.amenityIds ?? [];
                      set('amenityIds', selected ? ids.filter(x => x !== id) : [...ids, id]);
                    }}
                    sx={{
                      p: 2, borderRadius: 3, cursor: 'pointer', textAlign: 'center',
                      border: '2px solid', transition: 'all .15s',
                      borderColor: selected ? 'primary.main' : 'divider',
                      bgcolor: selected ? 'primary.50' : 'background.paper',
                      '&:hover': { borderColor: 'primary.light' },
                    }}>
                    <Typography fontSize={26} mb={0.5}>{a.icon}</Typography>
                    <Typography variant="caption" fontWeight={700} sx={{ display: 'block', lineHeight: 1.3 }}>{a.name}</Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
          <Typography variant="caption" color="text.secondary">
            {(form.amenityIds ?? []).length} amenities selected
          </Typography>
        </Stack>
      );

      // ── 3: Property Layout ────────────────────────────────────────────────
      case 3: return (
        <Stack spacing={3}>
          <SectionHeader icon={<span style={{ fontSize: 20 }}>📐</span>} title={isLand ? "Plot Layouts" : "Property Layout"} subtitle={isLand ? "Upload site plans and plot documents" : "Upload site plans and layout documents"} />
          {[
            { key: 'layoutMapUrl', label: isLand ? 'Project Layout' : 'Layout Map', desc: 'Overall site layout' },
            { key: 'masterPlanUrl', label: 'Master Plan', desc: 'Master plan document' },
            { key: 'plotLayoutUrl', label: isLand ? 'Plot Distribution' : 'Plot Layout', desc: 'Individual plot layout (for land)' },
          ].map(({ key, label, desc }) => (
            <Box key={key}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.75}>
                <Box>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.8 }}>
                    {label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{desc}</Typography>
                </Box>
                <Box sx={{ width: 140 }}>
                  <FileUploadButton label="Upload File" onUpload={e => handleFileUpload(e, key)} loading={uploading} />
                </Box>
              </Stack>
              <TextField fullWidth size="small"
                value={(form as any)[key] ?? ''}
                onChange={e => set(key as any, e.target.value)}
                placeholder="https://... (image or PDF URL)"
                error={!!errors[key]} helperText={errors[key]}
                InputProps={{ startAdornment: <InputAdornment position="start"><ImageOutlined sx={{ fontSize: 16 }} /></InputAdornment> }} />
              {(form as any)[key] && (
                <Box sx={{ mt: 1.5, borderRadius: 2, overflow: 'hidden', maxHeight: 160, border: '1px solid', borderColor: 'divider' }}>
                  <img src={(form as any)[key]} alt={label} style={{ width: '100%', objectFit: 'cover' }}
                    onError={e => (e.currentTarget.style.display = 'none')} />
                </Box>
              )}
            </Box>
          ))}
        </Stack>
      );

      // ── 4: Media ─────────────────────────────────────────────────────────
      case 4: return (
        <Stack spacing={3}>
          <SectionHeader icon={<span style={{ fontSize: 20 }}>🖼</span>} title="Project Media" subtitle="Images, videos and virtual tours" />
          
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Project Images
            </Typography>
            <Box sx={{ width: 140 }}>
              <FileUploadButton label="Upload Image" onUpload={e => handleFileUpload(e, 'projectImages')} loading={uploading} />
            </Box>
          </Stack>
          <TagInput label="" values={form.projectImages ?? []}
            onChange={v => set('projectImages', v)} placeholder="Paste image URL and press Enter" />

          {/* Image previews */}
          {(form.projectImages?.length ?? 0) > 0 && (
            <Grid container spacing={1.5}>
              {form.projectImages!.map((url, i) => (
                <Grid item xs={6} sm={4} key={i}>
                  <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', aspectRatio: '16/10', bgcolor: 'grey.100' }}>
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => (e.currentTarget.style.display = 'none')} />
                    <IconButton size="small"
                      onClick={() => set('projectImages', form.projectImages!.filter((_, j) => j !== i))}
                      sx={{
                        position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,.5)', color: '#fff',
                        '&:hover': { bgcolor: 'error.main' }
                      }}>
                      <CloseOutlined sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}

          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5} mt={1}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Project Videos
            </Typography>
            <Box sx={{ width: 140 }}>
              <FileUploadButton label="Upload Video" onUpload={e => handleFileUpload(e, 'projectVideos')} loading={uploading} accept="video/*" />
            </Box>
          </Stack>
          <TagInput label="" values={form.projectVideos ?? []}
            onChange={v => set('projectVideos', v)} />

          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <TextField fullWidth label="Brochure URL" size="small" value={form.brochureUrl}
                onChange={e => set('brochureUrl', e.target.value)}
                error={!!errors.brochureUrl} helperText={errors.brochureUrl}
                InputProps={{ startAdornment: <InputAdornment position="start"><PictureAsPdfOutlined sx={{ fontSize: 16 }} /></InputAdornment> }} />
              <Box sx={{ width: 180 }}>
                <FileUploadButton label="Upload Brochure" onUpload={e => handleFileUpload(e, 'brochureUrl')} loading={uploading} accept=".pdf" />
              </Box>
            </Stack>
            <TextField fullWidth label="3D Tour / Walkthrough URL" size="small" value={form.tourUrl3d}
              onChange={e => set('tourUrl3d', e.target.value)}
              error={!!errors.tourUrl3d} helperText={errors.tourUrl3d}
              InputProps={{ startAdornment: <InputAdornment position="start"><ViewInArOutlined sx={{ fontSize: 16 }} /></InputAdornment> }} />
            <TextField fullWidth label="Drone Footage URL" size="small" value={form.droneFootageUrl}
              onChange={e => set('droneFootageUrl', e.target.value)}
              error={!!errors.droneFootageUrl} helperText={errors.droneFootageUrl} />
          </Stack>
        </Stack>
      );

      // ── 5: Legal & Govt ───────────────────────────────────────────────────
      case 5: return (
        <Stack spacing={3}>
          <SectionHeader icon={<VerifiedOutlined />} title="Legal & Government" subtitle="Approval documents and ownership details" />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField fullWidth label="RERA Number" size="small" value={form.reraNumber}
              onChange={e => set('reraNumber', e.target.value)}
              error={!!errors.reraNumber} helperText={errors.reraNumber} />
            <TextField fullWidth label="Approval Authority" size="small" value={form.approvalAuthority}
              onChange={e => set('approvalAuthority', e.target.value)}
              error={!!errors.approvalAuthority} helperText={errors.approvalAuthority} />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField fullWidth label="Land Ownership" size="small" value={form.landOwnership}
              onChange={e => set('landOwnership', e.target.value)} placeholder="e.g. Freehold, Leasehold, NA Plot" />
            <TextField fullWidth label="Development Authority (e.g. LDA)" size="small" value={form.developmentAuthority}
              onChange={e => set('developmentAuthority', e.target.value)} placeholder="e.g. LDA, GDA, BDA" />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField fullWidth label="RERA Certificate URL" size="small" value={form.reraDocUrl}
              onChange={e => set('reraDocUrl', e.target.value)}
              error={!!errors.reraDocUrl} helperText={errors.reraDocUrl}
              InputProps={{ startAdornment: <InputAdornment position="start"><PictureAsPdfOutlined sx={{ fontSize: 16 }} /></InputAdornment> }} />
            <Box sx={{ width: 140 }}>
              <FileUploadButton label="Upload RERA" onUpload={e => handleFileUpload(e, 'reraDocUrl')} loading={uploading} accept=".pdf" />
            </Box>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField fullWidth label="Land Document URL" size="small" value={form.landDocUrl}
              onChange={e => set('landDocUrl', e.target.value)}
              error={!!errors.landDocUrl} helperText={errors.landDocUrl}
              InputProps={{ startAdornment: <InputAdornment position="start"><PictureAsPdfOutlined sx={{ fontSize: 16 }} /></InputAdornment> }} />
            <Box sx={{ width: 140 }}>
              <FileUploadButton label="Upload Doc" onUpload={e => handleFileUpload(e, 'landDocUrl')} loading={uploading} accept=".pdf" />
            </Box>
          </Stack>
          {form.reraNumber && (
            <Paper sx={{ p: 2, borderRadius: 3, bgcolor: '#d1fae5', border: '1px solid #6ee7b7' }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <VerifiedOutlined sx={{ color: '#059669' }} />
                <Box>
                  <Typography variant="body2" fontWeight={800} color="#065f46">RERA Registered</Typography>
                  <Typography variant="caption" color="#047857">RERA No: {form.reraNumber}</Typography>
                </Box>
              </Stack>
            </Paper>
          )}
        </Stack>
      );

      // ── 6: Pricing ────────────────────────────────────────────────────────
      case 6: return (
        <Stack spacing={3}>
          <SectionHeader icon={<AttachMoneyOutlined />} title="Pricing & Taxes" subtitle="Configure pricing structure and local taxes" />
          <Grid container spacing={2}>
            {[
              { key: 'basePrice', label: 'Base Price (₹)', placeholder: '5000000' },
              { key: 'pricePerSqFt', label: 'Price Per Sq.Ft (₹)', placeholder: '4500' },
              { key: 'parkingPrice', label: 'Parking Price (₹)', placeholder: '150000' },
            ].map(({ key, label, placeholder }) => (
              <Grid item xs={12} sm={4} key={key}>
                <TextField fullWidth label={label} size="small" type="number"
                  placeholder={placeholder}
                  value={(form as any)[key] ?? ''}
                  onChange={e => set(key as any, Number(e.target.value) || undefined)}
                  error={!!errors[key]} helperText={errors[key] || ((form as any)[key] ? fmtPrice((form as any)[key]) : undefined)} />
              </Grid>
            ))}
            
            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={1}>
                <TextField fullWidth label="Maintenance (₹)" size="small" type="number"
                  value={form.maintenanceCharges ?? ''} onChange={e => set('maintenanceCharges', Number(e.target.value) || undefined)} />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Period</InputLabel>
                  <Select value={form.maintenancePeriod ?? 'MONTHLY'} label="Period"
                    onChange={e => set('maintenancePeriod', e.target.value as any)}>
                    <MenuItem value="MONTHLY">Monthly</MenuItem>
                    <MenuItem value="QUARTERLY">Quarterly</MenuItem>
                    <MenuItem value="YEARLY">Yearly</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="GST %" size="small" type="number"
                value={form.gstPercent ?? ''} onChange={e => set('gstPercent', parseFloat(e.target.value) || undefined)}
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Stamp Duty %" size="small" type="number"
                value={form.stampDutyPercent ?? ''} onChange={e => set('stampDutyPercent', parseFloat(e.target.value) || undefined)}
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Registration Charges (₹)" size="small" type="number"
                value={form.registrationCharges ?? ''} onChange={e => set('registrationCharges', Number(e.target.value) || undefined)} />
            </Grid>
          </Grid>
          {form.basePrice && form.gstPercent && (
            <Paper sx={{ p: 2, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>Effective Price (incl. GST)</Typography>
              <Typography variant="h5" fontWeight={900} color="primary" mt={0.25}>
                {fmtPrice(form.basePrice * (1 + form.gstPercent / 100))}
              </Typography>
            </Paper>
          )}
        </Stack>
      );

      // ── 7: Nearby Infrastructure ──────────────────────────────────────────
      case 7: return (
        <Stack spacing={3}>
          <SectionHeader icon={<span style={{ fontSize: 20 }}>🗺</span>} title="Nearby Infrastructure" subtitle="Distance to important landmarks — boosts buyer confidence" />
          <Grid container spacing={2}>
            {INFRA_TYPES.map(infra => {
              const existing = (form.nearbyPlaces ?? []).find(p => p.type === infra.key);
              return (
                <Grid item xs={12} sm={6} key={infra.key}>
                  <Stack direction="row" spacing={1.5} alignItems="center"
                    sx={{
                      p: 1.5, borderRadius: 3, border: '1px solid', borderColor: existing ? 'primary.light' : 'divider',
                      bgcolor: existing ? 'primary.50' : 'transparent'
                    }}>
                    <Typography fontSize={22}>{infra.icon}</Typography>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" fontWeight={700}>{infra.label}</Typography>
                      <TextField
                        fullWidth size="small" placeholder="e.g. 1.2 km, 500m"
                        value={existing?.distance ?? ''}
                        variant="standard"
                        onChange={e => {
                          const updated = (form.nearbyPlaces ?? []).filter(p => p.type !== infra.key);
                          if (e.target.value) updated.push({ type: infra.key, name: infra.label, distance: e.target.value });
                          set('nearbyPlaces', updated);
                        }}
                        InputProps={{ disableUnderline: !existing, sx: { fontSize: 13, fontWeight: 700 } }}
                      />
                    </Box>
                    {existing && <Chip label={existing.distance} size="small" color="primary" sx={{ fontWeight: 700 }} />}
                  </Stack>
                </Grid>
              );
            })}
          </Grid>
        </Stack>
      );

      default: return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md"
      PaperProps={{ sx: { borderRadius: 4, height: '90vh', display: 'flex', flexDirection: 'column' } }}>
      {/* Title */}
      <DialogTitle sx={{
        fontWeight: 900, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: '"Playfair Display", serif', pb: 0
      }}>
        {isEdit ? `Edit: ${initial?.name}` : 'Create New Project'}
        <IconButton size="small" onClick={onClose}><CloseOutlined /></IconButton>
      </DialogTitle>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          {TABS.map((t, i) => (
            <Tab key={i} label={
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <span style={{ fontSize: 14 }}>{t.icon}</span>
                <span>{t.label}</span>
              </Stack>
            } sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12, minHeight: 48 }} />
          ))}
        </Tabs>
      </Box>

      {/* Content */}
      <DialogContent sx={{ flex: 1, overflowY: 'auto', pt: 3 }}>
        {errors.base && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            <Typography variant="body2" fontWeight={700}>{errors.base}</Typography>
          </Alert>
        )}
        {renderTab()}
      </DialogContent>

      <Divider sx={{ mb: 1.5 }} />
      <DialogActions sx={{ p: 2.5, gap: 1, justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1}>
          <Button disabled={tab === 0} onClick={() => setTab(t => t - 1)}
            sx={{ textTransform: 'none' }}>← Back</Button>
          <Button disabled={tab === TABS.length - 1} onClick={() => setTab(t => t + 1)}
            sx={{ textTransform: 'none' }}>Next →</Button>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" disableElevation onClick={handleSave} disabled={saving || success}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 3 }}>
            {saving ? <CircularProgress size={18} color="inherit" />
              : success ? '✓ Saved!'
                : isEdit ? 'Save Changes' : 'Create Project'}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectFormModal;