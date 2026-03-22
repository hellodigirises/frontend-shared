import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Stack, Button, Chip, Paper, Grid,
  Divider, Tab, Tabs, Avatar, LinearProgress, IconButton,
  Card, CircularProgress, Tooltip
} from '@mui/material';
import {
  ArrowBackOutlined, EditOutlined, LocationOnOutlined,
  ApartmentOutlined, CalendarTodayOutlined, VerifiedOutlined,
  ImageOutlined, PictureAsPdfOutlined, ViewInArOutlined,
  MapOutlined, AttachMoneyOutlined, AddOutlined,
  BusinessOutlined, LayersOutlined, GridViewOutlined,
  TrendingUpOutlined, HomeWorkOutlined, FmdGoodOutlined
} from '@mui/icons-material';
import {
  Project, Tower, UNIT_STATUS_CFG, DEFAULT_AMENITIES,
  INFRA_TYPES, fmtPrice, getStatusCfg, completionPct,
  PROPERTY_TYPES
} from './propertyTypes';
import InventoryGrid from './InventoryGrid';
import ProjectFormModal from './ProjectFormModal';
import api from '../../../../api/axios';

const osmSrc = (lat: number, lng: number) =>
  `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.012},${lat - 0.012},${lng + 0.012},${lat + 0.012}&layer=mapnik&marker=${lat},${lng}`;

interface Props {
  projectId: string;
  onBack: () => void;
}

const ProjectDetailPage: React.FC<Props> = ({ projectId, onBack }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [editOpen, setEditOpen] = useState(false);

  const fetchProject = async () => {
    try {
      const r = await api.get(`/inventory/projects/${projectId}`);
      setProject(r.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProject(); }, [projectId]);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress />
    </Box>
  );
  if (!project) return <Typography>Project not found.</Typography>;

  const statusCfg = getStatusCfg(project.status);
  const pct = completionPct(project.launchDate, project.completionDate);
  const allUnits = (project.towers ?? []).flatMap(t => t.floors?.flatMap(f => f.units ?? []) ?? []);
  const propType = PROPERTY_TYPES.find(p => p.value === project.propertyType);
  const amenitiesSelected = DEFAULT_AMENITIES.filter((_, i) => (project.amenityIds ?? []).includes(`amenity_${i}`));

  const unitStats = {
    total: allUnits.length,
    available: allUnits.filter(u => u?.status === 'AVAILABLE').length,
    booked: allUnits.filter(u => u?.status === 'BOOKED').length,
    hold: allUnits.filter(u => u?.status === 'HOLD').length,
    blocked: allUnits.filter(u => u?.status === 'BLOCKED').length,
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Back + Header */}
      <Stack direction="row" alignItems="flex-start" spacing={2} mb={4}>
        <IconButton onClick={onBack} sx={{ mt: 0.5 }}>
          <ArrowBackOutlined />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-start' }} spacing={2}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1.5} mb={0.5}>
                <Typography fontSize={22}>{propType?.icon}</Typography>
                <Chip label={propType?.label} size="small" sx={{ fontWeight: 700, fontSize: 11 }} />
                <Chip label={statusCfg.label} size="small"
                  sx={{ fontWeight: 800, fontSize: 11, bgcolor: statusCfg.bg, color: statusCfg.color }} />
                {project.reraNumber && (
                  <Chip icon={<VerifiedOutlined sx={{ fontSize: '14px !important' }} />}
                    label={`RERA: ${project.reraNumber}`} size="small" color="success"
                    sx={{ fontWeight: 700, fontSize: 10 }} />
                )}
              </Stack>
              <Typography variant="h3" fontWeight={900} letterSpacing={-1.5}
                sx={{ fontFamily: '"Playfair Display", serif', lineHeight: 1.1 }}>
                {project.name}
              </Typography>
              {project.developerName && (
                <Typography variant="body2" color="text.secondary" mt={0.5}>by {project.developerName}</Typography>
              )}
              {(project.city || project.state) && (
                <Stack direction="row" alignItems="center" spacing={0.5} mt={0.5} sx={{ color: 'text.secondary' }}>
                  <FmdGoodOutlined sx={{ fontSize: 16 }} />
                  <Typography variant="body2">{[project.address, project.city, project.state].filter(Boolean).join(', ')}</Typography>
                </Stack>
              )}
            </Box>
            <Button variant="outlined" startIcon={<EditOutlined />}
              onClick={() => setEditOpen(true)}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 3 }}>
              Edit Project
            </Button>
          </Stack>
        </Box>
      </Stack>

      {/* Hero image + quick stats */}
      <Grid container spacing={3} mb={4}>
        {/* Hero */}
        <Grid item xs={12} md={5}>
          <Box sx={{ borderRadius: 4, overflow: 'hidden', height: 240, position: 'relative', bgcolor: 'grey.100' }}>
            {(project.projectImages?.length ?? 0) > 0 ? (
              <img src={project.projectImages![0]} alt={project.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', color: 'text.disabled' }}>
                <HomeWorkOutlined sx={{ fontSize: 56 }} />
                <Typography variant="caption">No images uploaded</Typography>
              </Box>
            )}
            {(project.projectImages?.length ?? 0) > 1 && (
              <Box sx={{
                position: 'absolute', bottom: 10, right: 10, bgcolor: 'rgba(0,0,0,.6)', color: '#fff',
                px: 1.25, py: 0.4, borderRadius: 8, fontSize: 11, fontWeight: 700
              }}>
                +{project.projectImages!.length - 1} photos
              </Box>
            )}
          </Box>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={7}>
          <Grid container spacing={2} height="100%">
            {[
              { label: 'Total Units', value: project.totalUnits ?? unitStats.total, icon: '🏠' },
              { label: 'Available', value: unitStats.available, icon: '✅', color: '#10b981' },
              { label: 'Booked', value: unitStats.booked, icon: '📋', color: '#ef4444' },
              { label: 'Base Price', value: fmtPrice(project.basePrice), icon: '💰' },
              { label: 'Total Area', value: project.totalArea ? `${project.totalArea.toLocaleString()} sq.ft` : '—', icon: '📐' },
              { label: 'Towers', value: project.towers?.length ?? 0, icon: '🏢' },
            ].map(s => (
              <Grid item xs={6} sm={4} key={s.label}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, height: '100%' }}>
                  <Typography fontSize={20} mb={0.25}>{s.icon}</Typography>
                  <Typography variant="h6" fontWeight={900} sx={{ color: s.color ?? 'text.primary' }}>{s.value}</Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>{s.label}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      {/* Progress bar */}
      {pct !== null && (
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 4 }}>
          <Stack direction="row" justifyContent="space-between" mb={1}>
            <Typography variant="body2" fontWeight={800}>Construction Progress</Typography>
            <Typography variant="body2" fontWeight={900} color="primary">{pct}%</Typography>
          </Stack>
          <LinearProgress variant="determinate" value={pct}
            sx={{
              height: 10, borderRadius: 5, bgcolor: 'grey.100',
              '& .MuiLinearProgress-bar': { bgcolor: statusCfg.color, borderRadius: 5 }
            }} />
          <Stack direction="row" justifyContent="space-between" mt={1}>
            <Typography variant="caption" color="text.secondary">
              Launch: {project.launchDate ? new Date(project.launchDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Completion: {project.completionDate ? new Date(project.completionDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}
            </Typography>
          </Stack>
        </Paper>
      )}

      {/* Unit availability donut-like bars */}
      <Grid container spacing={2} mb={4}>
        {Object.entries(UNIT_STATUS_CFG).map(([k, v]) => {
          const count = unitStats[k.toLowerCase() as keyof typeof unitStats] as number ?? 0;
          const pct = unitStats.total ? Math.round(count / unitStats.total * 100) : 0;
          return (
            <Grid item xs={6} sm={3} key={k}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, borderColor: v.color + '44' }}>
                <Stack direction="row" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" fontWeight={700} sx={{ color: v.color }}>{v.label}</Typography>
                  <Typography variant="caption" fontWeight={900} sx={{ color: v.color }}>{pct}%</Typography>
                </Stack>
                <Typography variant="h5" fontWeight={900}>{count}</Typography>
                <LinearProgress variant="determinate" value={pct}
                  sx={{
                    mt: 1, height: 5, borderRadius: 3, bgcolor: v.bg,
                    '& .MuiLinearProgress-bar': { bgcolor: v.color }
                  }} />
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        {['Inventory Grid', 'Overview', 'Location', 'Amenities', 'Media', 'Pricing'].map((t, i) => (
          <Tab key={i} label={t} sx={{ textTransform: 'none', fontWeight: 700, fontSize: 13 }} />
        ))}
      </Tabs>

      {/* ── Tab 0: Inventory Grid ── */}
      {tab === 0 && (
        <InventoryGrid
          towers={project.towers ?? []}
          projectId={project.id}
          propertyType={project.propertyType}
          onRefresh={fetchProject}
        />
      )}

      {/* ── Tab 1: Overview ── */}
      {tab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {project.description && (
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                <Typography variant="body2" fontWeight={800} mb={1}>About this Project</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>{project.description}</Typography>
              </Paper>
            )}
            {/* Legal */}
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="body2" fontWeight={800} mb={2}>Legal & Compliance</Typography>
              <Grid container spacing={2}>
                {[
                  { label: 'RERA Number', value: project.reraNumber },
                  { label: 'Approval Authority', value: project.approvalAuthority },
                  { label: 'Land Ownership', value: project.landOwnership },
                ].map(row => row.value ? (
                  <Grid item xs={12} sm={6} key={row.label}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>{row.label}</Typography>
                    <Typography variant="body2" fontWeight={800}>{row.value}</Typography>
                  </Grid>
                ) : null)}
              </Grid>
              {(project.reraDocUrl || project.landDocUrl) && (
                <Stack direction="row" spacing={1.5} mt={2}>
                  {project.reraDocUrl && (
                    <Button size="small" variant="outlined" startIcon={<PictureAsPdfOutlined />}
                      component="a" href={project.reraDocUrl} target="_blank"
                      sx={{ textTransform: 'none', borderRadius: 2 }}>RERA Certificate</Button>
                  )}
                  {project.landDocUrl && (
                    <Button size="small" variant="outlined" startIcon={<PictureAsPdfOutlined />}
                      component="a" href={project.landDocUrl} target="_blank"
                      sx={{ textTransform: 'none', borderRadius: 2 }}>Land Documents</Button>
                  )}
                </Stack>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            {/* Nearby infra */}
            {(project.nearbyPlaces?.length ?? 0) > 0 && (
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="body2" fontWeight={800} mb={2}>📍 Nearby Infrastructure</Typography>
                <Stack spacing={1.5}>
                  {project.nearbyPlaces!.map((place, i) => {
                    const infra = INFRA_TYPES.find(t => t.key === place.type);
                    return (
                      <Stack key={i} direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography fontSize={16}>{infra?.icon ?? '📍'}</Typography>
                          <Typography variant="body2" fontWeight={600}>{place.name}</Typography>
                        </Stack>
                        <Chip label={place.distance} size="small"
                          sx={{ fontWeight: 700, fontSize: 10, bgcolor: 'grey.100' }} />
                      </Stack>
                    );
                  })}
                </Stack>
              </Paper>
            )}
          </Grid>
        </Grid>
      )}

      {/* ── Tab 2: Location ── */}
      {tab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {project.latitude && project.longitude ? (
              <Box sx={{ borderRadius: 4, overflow: 'hidden', height: 400, border: '1px solid', borderColor: 'divider' }}>
                <iframe title="map" src={osmSrc(project.latitude, project.longitude)}
                  width="100%" height="400" style={{ border: 'none', display: 'block' }} />
              </Box>
            ) : (
              <Paper variant="outlined" sx={{ p: 6, borderRadius: 3, textAlign: 'center', borderStyle: 'dashed' }}>
                <MapOutlined sx={{ fontSize: 56, opacity: 0.2, mb: 1 }} />
                <Typography variant="body2" color="text.secondary">No coordinates set. Edit project to add location.</Typography>
              </Paper>
            )}
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="body2" fontWeight={800} mb={2}>Location Details</Typography>
              <Stack spacing={1.5}>
                {[
                  { label: 'Address', value: project.address },
                  { label: 'City', value: project.city },
                  { label: 'State', value: project.state },
                  { label: 'Pincode', value: project.pincode },
                  { label: 'Coordinates', value: project.latitude && project.longitude ? `${project.latitude.toFixed(4)}, ${project.longitude.toFixed(4)}` : null },
                ].map(row => row.value ? (
                  <Box key={row.label}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>{row.label}</Typography>
                    <Typography variant="body2" fontWeight={700}>{row.value}</Typography>
                  </Box>
                ) : null)}
              </Stack>
              {project.googleMapsUrl && (
                <Button fullWidth variant="outlined" size="small"
                  component="a" href={project.googleMapsUrl} target="_blank"
                  startIcon={<MapOutlined />} sx={{ mt: 2, textTransform: 'none', borderRadius: 2 }}>
                  Open in Google Maps
                </Button>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* ── Tab 3: Amenities ── */}
      {tab === 3 && (
        <Box>
          {amenitiesSelected.length === 0 ? (
            <Typography color="text.secondary">No amenities selected. Edit project to add amenities.</Typography>
          ) : (
            <Grid container spacing={2}>
              {amenitiesSelected.map((a, i) => (
                <Grid item xs={6} sm={4} md={3} key={i}>
                  <Paper variant="outlined" sx={{
                    p: 2.5, borderRadius: 3, textAlign: 'center',
                    transition: 'all .15s', '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.50' }
                  }}>
                    <Typography fontSize={32} mb={1}>{a.icon}</Typography>
                    <Typography variant="body2" fontWeight={700}>{a.name}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* ── Tab 4: Media ── */}
      {tab === 4 && (
        <Stack spacing={4}>
          {(project.projectImages?.length ?? 0) > 0 && (
            <Box>
              <Typography variant="body2" fontWeight={800} mb={2}>📸 Project Images</Typography>
              <Grid container spacing={2}>
                {project.projectImages!.map((url, i) => (
                  <Grid item xs={6} sm={4} md={3} key={i}>
                    <Box sx={{ borderRadius: 3, overflow: 'hidden', aspectRatio: '4/3', bgcolor: 'grey.100' }}>
                      <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          <Stack direction="row" spacing={2} flexWrap="wrap">
            {project.brochureUrl && (
              <Button variant="outlined" startIcon={<PictureAsPdfOutlined />}
                component="a" href={project.brochureUrl} target="_blank"
                sx={{ textTransform: 'none', borderRadius: 2 }}>Download Brochure</Button>
            )}
            {project.tourUrl3d && (
              <Button variant="outlined" startIcon={<ViewInArOutlined />}
                component="a" href={project.tourUrl3d} target="_blank"
                sx={{ textTransform: 'none', borderRadius: 2 }}>3D Walkthrough</Button>
            )}
            {project.droneFootageUrl && (
              <Button variant="outlined"
                component="a" href={project.droneFootageUrl} target="_blank"
                sx={{ textTransform: 'none', borderRadius: 2 }}>🚁 Drone Footage</Button>
            )}
          </Stack>
          {project.masterPlanUrl && (
            <Box>
              <Typography variant="body2" fontWeight={800} mb={1.5}>Master Plan</Typography>
              <Box sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider', maxHeight: 400 }}>
                <img src={project.masterPlanUrl} alt="Master Plan" style={{ width: '100%', objectFit: 'contain' }} />
              </Box>
            </Box>
          )}
        </Stack>
      )}

      {/* ── Tab 5: Pricing ── */}
      {tab === 5 && (
        <Grid container spacing={3}>
          {[
            { label: 'Base Price', value: project.basePrice ? fmtPrice(project.basePrice) : '—', icon: '💰', big: true },
            { label: 'Price Per Sq.Ft', value: project.pricePerSqFt ? fmtPrice(project.pricePerSqFt) : '—', icon: '📐' },
            { label: 'Maintenance Charges', value: project.maintenanceCharges ? `${fmtPrice(project.maintenanceCharges)} (${project.maintenancePeriod?.toLowerCase() || 'monthly'})` : '—', icon: '🔧' },
            { label: 'Parking Price', value: project.parkingPrice ? fmtPrice(project.parkingPrice) : '—', icon: '🚗' },
            { label: 'GST', value: project.gstPercent ? `${project.gstPercent}%` : '—', icon: '📊' },
            { label: 'Stamp Duty', value: project.stampDutyPercent ? `${project.stampDutyPercent}%` : '—', icon: '📜' },
            { label: 'Registration', value: project.registrationCharges ? fmtPrice(project.registrationCharges) : '—', icon: '📝' },
            {
              label: 'Estimated All-in Price',
              value: project.basePrice ? fmtPrice(project.basePrice * (1 + (project.gstPercent || 0) / 100 + (project.stampDutyPercent || 0) / 100) + (project.registrationCharges || 0)) : '—',
              icon: '✅', big: true,
            },
          ].map(s => (
            <Grid item xs={6} sm={4} key={s.label}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, border: s.big ? '2px solid' : undefined, borderColor: s.big ? 'primary.main' : undefined, height: '100%' }}>
                <Typography fontSize={24} mb={0.5}>{s.icon}</Typography>
                <Typography variant={s.big ? 'h5' : 'h6'} fontWeight={900} color={s.big ? 'primary' : 'text.primary'}>
                  {s.value}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>{s.label}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Edit Modal */}
      <ProjectFormModal
        open={editOpen} onClose={() => setEditOpen(false)}
        initial={project} onSave={fetchProject}
      />
    </Box>
  );
};

export default ProjectDetailPage;