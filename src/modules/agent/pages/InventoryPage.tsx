import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Box, Typography, Card, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, TextField,
  InputAdornment, CircularProgress, Grid, MenuItem, Select,
  FormControl, InputLabel, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Divider, Badge,
  Tabs, Tab, Paper, Skeleton
} from '@mui/material';
import {
  SearchOutlined, FilterListOutlined, CheckCircleOutlined,
  BookmarkOutlined, PauseCircleOutlined, RefreshOutlined,
  StarOutlined, HistoryOutlined, InfoOutlined, CloseOutlined,
  ApartmentOutlined, LocationCityOutlined
} from '@mui/icons-material';
import api from '../../../api/axios';
import { A } from '../hooks';

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Unit {
  id: string;
  unitNumber: string;
  unitType: string;
  price: number;
  status: string;
  carpetArea?: number;
  facing?: string;
  floor: {
    number: number;
    name: string;
    tower: {
      name: string;
      project: {
        id: string;
        name: string;
        city?: string;
        propertyType?: string;
      };
    };
  };
}

interface UnitHistory {
  id: string;
  action: string;
  agentName: string;
  oldStatus: string;
  newStatus: string;
  createdAt: string;
}

const STATUS_CFG: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  AVAILABLE: { color: '#059669', bg: '#d1fae5', icon: CheckCircleOutlined, label: 'Available' },
  BOOKED:    { color: '#2563eb', bg: '#dbeafe', icon: BookmarkOutlined,   label: 'Booked' },
  HOLD:      { color: '#d97706', bg: '#fef3c7', icon: PauseCircleOutlined,label: 'Hold' },
  RESERVED:  { color: '#7c3aed', bg: '#ede9fe', icon: StarOutlined,        label: 'Reserved' },
  SOLD:      { color: '#dc2626', bg: '#fee2e2', icon: CloseOutlined,       label: 'Sold' },
  BLOCKED:   { color: '#6b7280', bg: '#f3f4f6', icon: CloseOutlined,       label: 'Blocked' },
  UNDER_MAINTENANCE: { color: '#374151', bg: '#f3f4f6', icon: RefreshOutlined, label: 'Maintenance' },
};

const INR = (v: number) => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(v);

export default function InventoryPage() {
  const [loading, setLoading] = useState(true);
  const [units, setUnits] = useState<Unit[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const [detailUnit, setDetailUnit] = useState<Unit | null>(null);
  const [history, setHistory] = useState<UnitHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [tab, setTab] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory/units?limit=1000');
      setUnits(res.data.data);
    } catch (e) {
      console.error('Fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() => {
    return units.filter(u => {
      const matchSearch = u.unitNumber.toLowerCase().includes(search.toLowerCase()) ||
                         u.floor.tower.project.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [units, search, statusFilter]);

  const handleOpenDetail = async (unit: Unit) => {
    setDetailUnit(unit);
    setTab(0);
    setHistoryLoading(true);
    try {
      const res = await api.get(`/inventory/units/${unit.id}/history`);
      setHistory(res.data.data);
    } catch (e) {
      console.error('History fetch error:', e);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!detailUnit) return;
    try {
      await api.put(`/inventory/units/${detailUnit.id}`, { status: newStatus });
      fetchData(); // Refresh list
      handleOpenDetail({ ...detailUnit, status: newStatus }); // Refresh detail
    } catch (e) {
      console.error('Status update error:', e);
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: A.text }}>Inventory Search</Typography>
          <Typography variant="body2" sx={{ color: A.textSub }}>Check availability and book units for your customers</Typography>
        </Box>
        <Button startIcon={<RefreshOutlined />} onClick={fetchData} sx={{ color: A.primary }}>Refresh</Button>
      </Stack>

      <Card sx={{ p: 2, mb: 3, borderRadius: '12px', border: `1px solid ${A.border}`, boxShadow: 'none' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search by Unit Number or Project name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchOutlined sx={{ color: A.muted }} /></InputAdornment>,
                sx: { borderRadius: '8px', bgcolor: 'rgba(0,0,0,0.02)' }
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{ borderRadius: '8px' }}
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                {Object.keys(STATUS_CFG).map(s => (
                  <MenuItem key={s} value={s}>{STATUS_CFG[s].label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {loading ? (
        <Box display="flex" justifyContent="center" py={10}><CircularProgress sx={{ color: A.primary }} /></Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: '12px', border: `1px solid ${A.border}`, boxShadow: 'none', overflow: 'hidden' }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, py: 1.5 }}>Unit</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Project / Tower</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((u) => {
                const cfg = STATUS_CFG[u.status] || STATUS_CFG.BLOCKED;
                return (
                  <TableRow key={u.id} hover onClick={() => handleOpenDetail(u)} sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0,0,0,0.01)' } }}>
                    <TableCell sx={{ fontWeight: 700, color: A.text }}>{u.unitNumber}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{u.floor.tower.project.name}</Typography>
                      <Typography variant="caption" sx={{ color: A.textSub }}>{u.floor.tower.name} - Floor {u.floor.number}</Typography>
                    </TableCell>
                    <TableCell sx={{ color: A.textSub }}>{u.unitType}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{INR(u.price)}</TableCell>
                    <TableCell>
                      <Chip
                        label={cfg.label}
                        size="small"
                        sx={{
                          bgcolor: cfg.bg,
                          color: cfg.color,
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          height: 20
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small"><InfoOutlined sx={{ fontSize: 18 }} /></IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Unit Detail Dialog */}
      <Dialog open={!!detailUnit} onClose={() => setDetailUnit(null)} fullWidth maxWidth="sm">
        {detailUnit && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: `${A.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ApartmentOutlined sx={{ color: A.primary }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Unit {detailUnit.unitNumber}</Typography>
                  <Typography variant="caption" sx={{ color: A.textSub }}>{detailUnit.floor.tower.project.name} • {detailUnit.floor.tower.name}</Typography>
                </Box>
              </Stack>
              <IconButton onClick={() => setDetailUnit(null)} size="small"><CloseOutlined /></IconButton>
            </DialogTitle>
            <DialogContent>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: `1px solid ${A.border}` }}>
                <Tab label="Details" sx={{ textTransform: 'none', fontWeight: 600 }} />
                <Tab label="History" sx={{ textTransform: 'none', fontWeight: 600 }} icon={<HistoryOutlined sx={{ fontSize: 18 }} />} iconPosition="start" />
              </Tabs>

              {tab === 0 ? (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Box sx={{ p: 2, borderRadius: '12px', bgcolor: (STATUS_CFG[detailUnit.status] || STATUS_CFG.BLOCKED).bg, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: (STATUS_CFG[detailUnit.status] || STATUS_CFG.BLOCKED).color, fontWeight: 700, textTransform: 'uppercase' }}>Current Status</Typography>
                        <Typography variant="h6" sx={{ color: (STATUS_CFG[detailUnit.status] || STATUS_CFG.BLOCKED).color, fontWeight: 800 }}>{STATUS_CFG[detailUnit.status]?.label}</Typography>
                      </Box>
                      {detailUnit.status === 'AVAILABLE' && (
                        <Stack direction="row" spacing={1}>
                          <Button variant="contained" size="small" onClick={() => handleStatusChange('HOLD')} sx={{ bgcolor: STATUS_CFG.HOLD.color, '&:hover': { bgcolor: '#b45309' } }}>Hold</Button>
                          <Button variant="contained" size="small" onClick={() => handleStatusChange('RESERVED')} sx={{ bgcolor: STATUS_CFG.RESERVED.color, '&:hover': { bgcolor: '#6d28d9' } }}>Reserve</Button>
                          <Button variant="contained" size="small" onClick={() => handleStatusChange('BOOKED')} sx={{ bgcolor: STATUS_CFG.BOOKED.color, '&:hover': { bgcolor: '#1d4ed8' } }}>Book Now</Button>
                        </Stack>
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: A.muted }}>Unit Type</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{detailUnit.unitType}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: A.muted }}>Price</Typography>
                    <Typography sx={{ fontWeight: 600, color: A.primary }}>{INR(detailUnit.price)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: A.muted }}>Carpet Area</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{detailUnit.carpetArea} sq.ft</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: A.muted }}>Facing</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{detailUnit.facing || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              ) : (
                <Box sx={{ minHeight: 200 }}>
                  {historyLoading ? (
                    <Box display="flex" justifyContent="center" py={4}><CircularProgress size={24} /></Box>
                  ) : history.length === 0 ? (
                    <Box display="flex" flexDirection="column" alignItems="center" py={4} sx={{ color: A.muted }}>
                      <HistoryOutlined sx={{ fontSize: 40, mb: 1, opacity: 0.3 }} />
                      <Typography variant="body2">No history records found for this unit</Typography>
                    </Box>
                  ) : (
                    <Stack spacing={2}>
                      {history.map((h) => (
                        <Box key={h.id} sx={{ p: 1.5, borderRadius: '8px', border: `1px solid ${A.border}`, position: 'relative' }}>
                          <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{h.agentName || 'System'}</Typography>
                            <Chip label={h.action} size="small" sx={{ fontSize: '0.6rem', height: 16 }} />
                          </Stack>
                          <Typography variant="caption" display="block" sx={{ color: A.textSub }}>
                            Status changed from <b>{h.oldStatus}</b> to <b>{h.newStatus}</b>
                          </Typography>
                          <Typography variant="caption" sx={{ color: A.muted, position: 'absolute', top: 12, right: 12 }}>
                            {new Date(h.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.01)' }}>
              <Button onClick={() => setDetailUnit(null)} sx={{ color: A.muted }}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
