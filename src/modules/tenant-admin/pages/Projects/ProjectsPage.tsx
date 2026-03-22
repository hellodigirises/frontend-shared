import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Stack, Button, Grid, Card, CardMedia,
  CardContent, Chip, IconButton, CircularProgress, Paper,
  LinearProgress, TextField, InputAdornment, FormControl,
  InputLabel, Select, MenuItem, Tooltip, Divider, Avatar
} from '@mui/material';
import {
  AddOutlined, EditOutlined, DeleteOutlineOutlined,
  LocationOnOutlined, ApartmentOutlined, SearchOutlined,
  MapOutlined, PictureAsPdfOutlined, ViewInArOutlined,
  VerifiedOutlined, ArrowForwardOutlined, HomeWorkOutlined,
  GridViewOutlined, TableRowsOutlined, TrendingUpOutlined,
  FilterListOutlined, CalendarTodayOutlined
} from '@mui/icons-material';
import {
  Project, ProjectStatus, PropertyType, PROPERTY_TYPES,
  PROJECT_STATUSES, UNIT_STATUS_CFG, fmtPrice, getStatusCfg, completionPct
} from './propertyTypes';
import ProjectFormModal from './ProjectFormModal';
import ProjectDetailPage from './ProjectDetailPage';
import api from '../../../../api/axios';

// ─── Project Card ─────────────────────────────────────────────────────────────
const ProjectCard = ({
  project, onEdit, onDelete, onOpen,
}: {
  project: Project;
  onEdit: () => void; onDelete: () => void; onOpen: () => void;
}) => {
  const statusCfg = getStatusCfg(project.status);
  const pct = completionPct(project.launchDate, project.completionDate);
  const propType = PROPERTY_TYPES.find(p => p.value === project.propertyType);
  const allUnits = (project.towers ?? []).flatMap(t => t.floors?.flatMap(f => f.units ?? []) ?? []);
  const available = allUnits.filter(u => u?.status === 'AVAILABLE').length;

  return (
    <Card sx={{
      borderRadius: '20px', overflow: 'hidden', border: 'none',
      boxShadow: '0 2px 16px rgba(0,0,0,.06)',
      transition: 'all .22s cubic-bezier(.4,0,.2,1)',
      '&:hover': { boxShadow: '0 12px 40px rgba(0,0,0,.13)', transform: 'translateY(-4px)' },
    }}>
      {/* Image */}
      <Box sx={{ position: 'relative', height: 190, bgcolor: 'grey.100' }}>
        {(project.projectImages?.length ?? 0) > 0 ? (
          <CardMedia component="img" height="190"
            image={project.projectImages![0]} alt={project.name}
            sx={{ objectFit: 'cover' }} />
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', color: 'text.disabled' }}>
            <HomeWorkOutlined sx={{ fontSize: 40 }} />
          </Box>
        )}
        <Box sx={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,.65) 0%, transparent 55%)'
        }} />
        {/* Top badges */}
        <Stack direction="row" spacing={0.75} sx={{ position: 'absolute', top: 10, left: 12 }}>
          <Chip label={propType?.label ?? project.propertyType} size="small"
            sx={{ bgcolor: 'rgba(255,255,255,.92)', fontWeight: 800, fontSize: 10, height: 22 }} />
          {project.reraNumber && (
            <Chip icon={<VerifiedOutlined sx={{ fontSize: '12px !important' }} />}
              label="RERA" size="small" color="success"
              sx={{ fontWeight: 800, fontSize: 10, height: 22 }} />
          )}
        </Stack>
        {/* Status top-right */}
        <Box sx={{
          position: 'absolute', top: 10, right: 12,
          bgcolor: statusCfg.color, color: '#fff',
          px: 1.25, py: 0.3, borderRadius: 8,
          fontSize: 10, fontWeight: 800,
        }}>
          {statusCfg.label}
        </Box>
        {/* Bottom name */}
        <Box sx={{ position: 'absolute', bottom: 10, left: 12, right: 12 }}>
          <Typography variant="h6" fontWeight={900} color="#fff" sx={{ lineHeight: 1.2 }}>{project.name}</Typography>
          {project.developerName && (
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,.75)' }}>by {project.developerName}</Typography>
          )}
        </Box>
      </Box>

      <CardContent sx={{ p: 2.5 }}>
        {/* Location */}
        {(project.city || project.location) && (
          <Stack direction="row" alignItems="center" spacing={0.75} mb={1.5} sx={{ color: 'text.secondary' }}>
            <LocationOnOutlined sx={{ fontSize: 15 }} />
            <Typography variant="body2">{[project.city, project.state].filter(Boolean).join(', ') || project.location}</Typography>
          </Stack>
        )}

        {/* Stats row */}
        <Stack direction="row" spacing={0} mb={2} sx={{ bgcolor: 'grey.50', borderRadius: 2, overflow: 'hidden' }}>
          {[
            { label: 'Towers', value: project.towers?.length ?? 0 },
            { label: 'Units', value: project.totalUnits ?? allUnits.length },
            { label: 'Available', value: available, color: '#10b981' },
          ].map((s, i) => (
            <Box key={s.label} sx={{
              flex: 1, p: 1.25, textAlign: 'center',
              borderRight: i < 2 ? '1px solid' : 'none', borderColor: 'divider'
            }}>
              <Typography variant="body2" fontWeight={900} sx={{ color: s.color ?? 'text.primary' }}>{s.value}</Typography>
              <Typography variant="caption" color="text.secondary">{s.label}</Typography>
            </Box>
          ))}
        </Stack>

        {/* Pricing */}
        {project.basePrice && (
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="caption" color="text.secondary">Starting from</Typography>
            <Typography variant="body1" fontWeight={900} color="primary">{fmtPrice(project.basePrice)}</Typography>
          </Stack>
        )}

        {/* Progress bar */}
        {pct !== null && (
          <Box mb={2}>
            <Stack direction="row" justifyContent="space-between" mb={0.5}>
              <Typography variant="caption" color="text.secondary">Completion</Typography>
              <Typography variant="caption" fontWeight={800}>{pct}%</Typography>
            </Stack>
            <LinearProgress variant="determinate" value={pct}
              sx={{
                height: 5, borderRadius: 3, bgcolor: 'grey.100',
                '& .MuiLinearProgress-bar': { bgcolor: statusCfg.color, borderRadius: 3 }
              }} />
          </Box>
        )}

        {/* Media quick links */}
        <Stack direction="row" spacing={1} mb={2}>
          {project.brochureUrl && (
            <Tooltip title="Brochure"><IconButton size="small" component="a" href={project.brochureUrl} target="_blank" sx={{ bgcolor: 'grey.100' }}>
              <PictureAsPdfOutlined sx={{ fontSize: 16 }} />
            </IconButton></Tooltip>
          )}
          {project.tourUrl3d && (
            <Tooltip title="3D Tour"><IconButton size="small" component="a" href={project.tourUrl3d} target="_blank" sx={{ bgcolor: 'grey.100' }}>
              <ViewInArOutlined sx={{ fontSize: 16 }} />
            </IconButton></Tooltip>
          )}
          {project.latitude && project.longitude && (
            <Tooltip title="View on Map">
              <IconButton size="small" component="a"
                href={`https://www.openstreetmap.org/?mlat=${project.latitude}&mlon=${project.longitude}#map=16/${project.latitude}/${project.longitude}`}
                target="_blank" sx={{ bgcolor: 'grey.100' }}>
                <MapOutlined sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>

        {/* Actions */}
        <Stack direction="row" spacing={1}>
          <Button fullWidth variant="contained" disableElevation endIcon={<ArrowForwardOutlined />}
            onClick={onOpen}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: 13 }}>
            Manage
          </Button>
          <IconButton size="small" onClick={onEdit}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <EditOutlined fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={onDelete}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, color: 'error.main' }}>
            <DeleteOutlineOutlined fontSize="small" />
          </IconButton>
        </Stack>
      </CardContent>
    </Card>
  );
};

// ─── Main Portfolio Page ──────────────────────────────────────────────────────
const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [openProject, setOpenProject] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ProjectStatus>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | PropertyType>('ALL');

  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await api.get('/inventory/projects');
      setProjects(r.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return;
    try { await api.delete(`/inventory/projects/${id}`); fetchData(); }
    catch (e) { console.error(e); }
  };

  const filtered = useMemo(() => projects.filter(p => {
    const q = search.toLowerCase();
    const matchQ = !q || p.name.toLowerCase().includes(q) ||
      (p.city ?? '').toLowerCase().includes(q) ||
      (p.developerName ?? '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchType = typeFilter === 'ALL' || p.propertyType === typeFilter;
    return matchQ && matchStatus && matchType;
  }), [projects, search, statusFilter, typeFilter]);

  const stats = useMemo(() => {
    const allUnits = projects.flatMap(p => 
      (p.towers ?? []).flatMap(t => 
        t.floors?.flatMap(f => f.units ?? []) ?? []
      )
    );
    return {
      projects: projects.length,
      totalUnits: projects.reduce((s, p) => s + (p.totalUnits ?? 0), 0) || allUnits.length,
      available: allUnits.filter(u => u?.status === 'AVAILABLE').length,
      booked: allUnits.filter(u => u?.status === 'BOOKED').length,
      ongoing: projects.filter(p => p.status === 'ONGOING').length,
      completed: projects.filter(p => p.status === 'COMPLETED' || p.status === 'READY_TO_MOVE').length,
    };
  }, [projects]);

  // Show detail page if a project is opened
  if (openProject) {
    return <ProjectDetailPage projectId={openProject} onBack={() => setOpenProject(null)} />;
  }

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} mb={4} spacing={2}>
        <Box>
          <Typography variant="h3" fontWeight={900} letterSpacing={-1.5}
            sx={{ fontFamily: '"Playfair Display", serif' }}>
            Project Portfolio
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={0.5}>
            Land · Residential · Commercial — all in one place
          </Typography>
        </Box>
        <Button variant="contained" disableElevation startIcon={<AddOutlined />}
          onClick={() => { setEditing(null); setFormOpen(true); }}
          sx={{ borderRadius: 3, px: 3, py: 1.5, textTransform: 'none', fontWeight: 700, fontSize: 14 }}>
          New Project
        </Button>
      </Stack>

      {/* Stats strip */}
      <Grid container spacing={2} mb={4}>
        {[
          { label: 'Total Projects', value: stats.projects, color: '#6366f1', icon: '🏗' },
          { label: 'Ongoing', value: stats.ongoing, color: '#3b82f6', icon: '🚧' },
          { label: 'Completed', value: stats.completed, color: '#10b981', icon: '✅' },
          { label: 'Total Units', value: stats.totalUnits, color: '#f59e0b', icon: '🏠' },
          { label: 'Available', value: stats.available, color: '#10b981', icon: '🟢' },
          { label: 'Booked', value: stats.booked, color: '#ef4444', icon: '🔴' },
        ].map(s => (
          <Grid item xs={6} sm={4} lg={2} key={s.label}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, textAlign: 'center' }}>
              <Typography fontSize={22} mb={0.25}>{s.icon}</Typography>
              <Typography variant="h5" fontWeight={900} sx={{ color: s.color }}>{s.value}</Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>{s.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField fullWidth placeholder="Search by name, city, developer..."
            size="small" value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small" /></InputAdornment>,
              sx: { borderRadius: 2 }
            }} />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Property Type</InputLabel>
            <Select value={typeFilter} label="Property Type"
              onChange={e => setTypeFilter(e.target.value as any)} sx={{ borderRadius: 2 }}>
              <MenuItem value="ALL">All Types</MenuItem>
              {PROPERTY_TYPES.map(t => (
                <MenuItem key={t.value} value={t.value}>{t.icon} {t.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status"
              onChange={e => setStatusFilter(e.target.value as any)} sx={{ borderRadius: 2 }}>
              <MenuItem value="ALL">All Statuses</MenuItem>
              {PROJECT_STATUSES.map(s => (
                <MenuItem key={s.value} value={s.value}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color }} />
                    {s.label}
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Status filter pills */}
      <Stack direction="row" spacing={1} flexWrap="wrap" mb={3}>
        {PROJECT_STATUSES.map(s => (
          <Chip key={s.value} label={s.label} clickable
            onClick={() => setStatusFilter(statusFilter === s.value ? 'ALL' : s.value)}
            variant={statusFilter === s.value ? 'filled' : 'outlined'}
            sx={{
              fontWeight: 800, fontSize: 11,
              bgcolor: statusFilter === s.value ? s.color : undefined,
              color: statusFilter === s.value ? '#fff' : s.color,
              borderColor: s.color,
            }} />
        ))}
      </Stack>

      <Typography variant="body2" color="text.secondary" mb={2.5}>
        Showing <strong>{filtered.length}</strong> of {projects.length} projects
      </Typography>

      {/* Grid */}
      {filtered.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 8, borderRadius: 4, textAlign: 'center', borderStyle: 'dashed' }}>
          <HomeWorkOutlined sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" fontWeight={800} color="text.secondary">No projects found</Typography>
          <Typography variant="body2" color="text.secondary" mb={2.5}>
            {search ? 'Try different search terms' : 'Create your first project to get started'}
          </Typography>
          {!search && (
            <Button variant="contained" disableElevation startIcon={<AddOutlined />}
              onClick={() => { setEditing(null); setFormOpen(true); }}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 3 }}>
              Create First Project
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filtered.map(p => (
            <Grid item xs={12} sm={6} lg={4} key={p.id}>
              <ProjectCard
                project={p}
                onOpen={() => setOpenProject(p.id)}
                onEdit={() => { setEditing(p); setFormOpen(true); }}
                onDelete={() => handleDelete(p.id)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Form modal */}
      <ProjectFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initial={editing}
        onSave={fetchData}
      />
    </Box>
  );
};

export default ProjectsPage;