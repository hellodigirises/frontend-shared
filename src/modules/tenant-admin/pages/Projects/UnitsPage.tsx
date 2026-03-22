import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  Box, Typography, Card, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, TextField,
  InputAdornment, CircularProgress, Grid, MenuItem, Select,
  FormControl, InputLabel, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Divider, LinearProgress,
  Drawer, Slider, ToggleButton, ToggleButtonGroup, Badge, Alert,
  Snackbar, Avatar, TableSortLabel, Pagination, Collapse, Switch,
  FormControlLabel, Tab, Tabs, Menu, ListItemIcon, ListItemText,
  MenuList, MenuItem as MuiMenuItem, Paper, Fab, Skeleton, Zoom,
  SpeedDial, SpeedDialAction, SpeedDialIcon,
} from '@mui/material';
import {
  SearchOutlined, FilterListOutlined, EditOutlined,
  GridViewOutlined, TableRowsOutlined, CloseOutlined,
  CheckCircleOutlined, BlockOutlined, BookmarkOutlined,
  PauseCircleOutlined, DownloadOutlined, AddOutlined,
  MoreVertOutlined, RefreshOutlined, TuneOutlined,
  ViewKanbanOutlined, BarChartOutlined, LayersOutlined,
  ContentCopyOutlined, DeleteOutlined, ShareOutlined,
  PrintOutlined, FileDownloadOutlined, SwapHorizOutlined,
  InfoOutlined, HistoryOutlined, NotificationsOutlined,
  StarOutlined, StarBorderOutlined, CompareArrowsOutlined,
  KeyboardArrowDownOutlined, KeyboardArrowUpOutlined,
  FiberManualRecordOutlined, HolidayVillageOutlined,
  BathroomOutlined, StairsOutlined,
} from '@mui/icons-material';
import api from '../../../../api/axios';

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Unit {
  id: string;
  unitNumber: string;
  unitType: string;
  price: number;
  status: string;
  carpetArea?: number;
  builtUpArea?: number;
  superArea?: number;
  facing?: string;
  features?: string[];
  floor: {
    id: string;
    number: number;
    name: string;
    tower: {
      id: string;
      name: string;
      totalFloors: number;
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

interface BulkAction {
  label: string;
  icon: React.ReactNode;
  color?: 'error' | 'warning' | 'success' | 'primary';
  targetStatus?: string;
}

type SortField = 'unitNumber' | 'price' | 'carpetArea' | 'status' | 'unitType';
type SortDir = 'asc' | 'desc';
type ViewMode = 'table' | 'grid' | 'kanban' | 'floor';

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, {
  color: string; bg: string; darkColor: string;
  icon: React.ReactNode; label: string; order: number;
}> = {
  AVAILABLE:         { color: '#059669', bg: '#d1fae5', darkColor: '#34d399', icon: <CheckCircleOutlined sx={{ fontSize: 13 }} />, label: 'Available',    order: 1 },
  BOOKED:            { color: '#2563eb', bg: '#dbeafe', darkColor: '#60a5fa', icon: <BookmarkOutlined   sx={{ fontSize: 13 }} />, label: 'Booked',       order: 2 },
  HOLD:              { color: '#d97706', bg: '#fef3c7', darkColor: '#fbbf24', icon: <PauseCircleOutlined sx={{ fontSize: 13 }} />, label: 'Hold',         order: 3 },
  BLOCKED:           { color: '#6b7280', bg: '#f3f4f6', darkColor: '#9ca3af', icon: <BlockOutlined      sx={{ fontSize: 13 }} />, label: 'Blocked',      order: 4 },
  SOLD:              { color: '#dc2626', bg: '#fee2e2', darkColor: '#f87171', icon: <BlockOutlined      sx={{ fontSize: 13 }} />, label: 'Sold',         order: 5 },
  RESERVED:          { color: '#7c3aed', bg: '#ede9fe', darkColor: '#a78bfa', icon: <StarOutlined       sx={{ fontSize: 13 }} />, label: 'Reserved',     order: 6 },
  UNDER_MAINTENANCE: { color: '#374151', bg: '#f3f4f6', darkColor: '#6b7280', icon: <RefreshOutlined    sx={{ fontSize: 13 }} />, label: 'Maintenance',  order: 7 },
};

const UNIT_TYPES = ['STUDIO', 'ONE_BHK', 'TWO_BHK', 'THREE_BHK', 'FOUR_BHK', 'PENTHOUSE', 'VILLA', 'PLOT', 'COMMERCIAL', 'SHOP', 'OFFICE'];
const FACINGS = ['East', 'West', 'North', 'South', 'North-East', 'North-West', 'South-East', 'South-West'];
const FEATURES = ['Park View', 'Sea View', 'Corner Unit', 'Duplex', 'Garden', 'Terrace', 'Balcony', 'Premium Fittings'];

const INR = (n: number) =>
  n >= 10_000_000 ? `₹${(n / 10_000_000).toFixed(2)} Cr`
  : n >= 100_000  ? `₹${(n / 100_000).toFixed(1)} L`
  : `₹${n.toLocaleString('en-IN')}`;

const BULK_ACTIONS: BulkAction[] = [
  { label: 'Mark Available',   icon: <CheckCircleOutlined />, color: 'success', targetStatus: 'AVAILABLE' },
  { label: 'Mark Hold',        icon: <PauseCircleOutlined />, color: 'warning', targetStatus: 'HOLD' },
  { label: 'Mark Blocked',     icon: <BlockOutlined />,       color: 'error',   targetStatus: 'BLOCKED' },
  { label: 'Export Selected',  icon: <FileDownloadOutlined />, color: 'primary' },
];

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status, size = 'sm' }: { status: string; size?: 'sm' | 'md' }) => {
  const cfg = STATUS_CFG[status] ?? { color: '#6b7280', bg: '#f3f4f6', icon: null, label: status };
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.5,
      px: size === 'md' ? 1.5 : 1, py: size === 'md' ? 0.5 : 0.3,
      borderRadius: '20px', bgcolor: cfg.bg, color: cfg.color,
      fontSize: size === 'md' ? 12 : 11, fontWeight: 800, letterSpacing: '0.02em',
      border: `1px solid ${cfg.color}30`,
    }}>
      {cfg.icon}
      {cfg.label}
    </Box>
  );
};

// ─── PRICE TREND SPARKLINE ─────────────────────────────────────────────────────

const PriceTrend = ({ basePrice }: { basePrice: number }) => {
  // Simulate micro price history
  const points = [0.96, 0.98, 0.97, 1.0, 1.02, 1.01, 1.03].map((m, i) => ({ x: i * 12, y: 30 - Math.round(m * 15) }));
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const trend = points[points.length - 1].y < points[0].y;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <svg width={72} height={24} style={{ overflow: 'visible' }}>
        <path d={path} fill="none" stroke={trend ? '#059669' : '#dc2626'} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <Typography variant="caption" sx={{ color: trend ? '#059669' : '#dc2626', fontWeight: 700 }}>
        {trend ? '+' : '-'}3%
      </Typography>
    </Box>
  );
};

const getLabels = (propertyType?: string) => {
  const isLand = propertyType === 'LAND';
  return {
    tower: isLand ? 'Block' : 'Tower',
    floor: isLand ? 'Lane' : 'Floor',
    unit: isLand ? 'Plot' : 'Unit',
  };
};

// ─── UNIT CARD (GRID VIEW) ────────────────────────────────────────────────────

const UnitCard = ({
  unit, selected, onSelect, onEdit, onFavorite, favorites,
}: {
  unit: Unit; selected: boolean; onSelect: () => void;
  onEdit: (u: Unit) => void; onFavorite: (id: string) => void; favorites: Set<string>;
}) => {
  const cfg = STATUS_CFG[unit.status] ?? STATUS_CFG.AVAILABLE;
  const isFav = favorites.has(unit.id);
  return (
    <Card onClick={onSelect} sx={{
      borderRadius: '20px',
      border: selected ? `2px solid ${cfg.color}` : `2px solid ${cfg.color}20`,
      boxShadow: selected ? `0 8px 30px ${cfg.color}25` : 'none',
      p: 0, cursor: 'pointer', overflow: 'hidden',
      transition: 'all .2s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': { boxShadow: `0 8px 30px ${cfg.color}22`, transform: 'translateY(-3px)', borderColor: cfg.color },
      position: 'relative',
    }}>
      {/* Color accent top bar */}
      <Box sx={{ height: 4, background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}88)` }} />

      {/* Selection checkbox area */}
      {selected && (
        <Box sx={{
          position: 'absolute', top: 12, left: 12,
          width: 22, height: 22, borderRadius: '50%',
          bgcolor: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CheckCircleOutlined sx={{ fontSize: 14, color: '#fff' }} />
        </Box>
      )}

      {/* Favorite button */}
      <IconButton
        size="small" onClick={e => { e.stopPropagation(); onFavorite(unit.id); }}
        sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
        {isFav ? <StarOutlined sx={{ fontSize: 16, color: '#f59e0b' }} /> : <StarBorderOutlined sx={{ fontSize: 16, color: '#9ca3af' }} />}
      </IconButton>

      <Box sx={{ p: 2.5 }}>
        {/* Header */}
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: 22, lineHeight: 1, letterSpacing: '-0.5px' }}>
                {unit.unitNumber}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                {getLabels(unit.floor?.tower?.project?.propertyType).tower} {unit.floor?.tower?.name} · {getLabels(unit.floor?.tower?.project?.propertyType).floor} {unit.floor?.number}
              </Typography>
            </Box>
            <StatusBadge status={unit.status} />
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {unit.floor?.tower?.project?.name} · {unit.floor?.tower?.project?.city || ''}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed', borderColor: `${cfg.color}30` }} />

        {/* Details grid */}
        <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
          {[
            { label: 'Type', value: unit.unitType.replace(/_/g, ' ') },
            { label: 'Facing', value: unit.facing || '—' },
            { label: 'Carpet', value: unit.carpetArea ? `${unit.carpetArea} sq.ft` : '—' },
            { label: 'Built-up', value: unit.builtUpArea ? `${unit.builtUpArea} sq.ft` : '—' },
          ].map(({ label, value }) => (
            <Box key={label}>
              <Typography sx={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 700, mt: 0.2 }}>{value}</Typography>
            </Box>
          ))}
        </Box>

        {/* Features chips */}
        {unit.features && unit.features.length > 0 && (
          <Stack direction="row" spacing={0.5} sx={{ mt: 2, flexWrap: 'wrap', gap: 0.5 }}>
            {unit.features.slice(0, 3).map(f => (
              <Chip key={f} label={f} size="small" sx={{ fontSize: 9, height: 18, fontWeight: 700, bgcolor: `${cfg.color}12`, color: cfg.color, border: 'none' }} />
            ))}
            {unit.features.length > 3 && (
              <Chip label={`+${unit.features.length - 3}`} size="small" sx={{ fontSize: 9, height: 18 }} />
            )}
          </Stack>
        )}

        {/* Price + trend */}
        <Box sx={{ mt: 2, p: 1.5, bgcolor: `${cfg.color}08`, borderRadius: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography sx={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Price</Typography>
              <Typography sx={{ fontSize: 18, fontWeight: 900, color: cfg.color, letterSpacing: '-0.5px' }}>
                {INR(unit.price)}
              </Typography>
              {unit.carpetArea && (
                <Typography variant="caption" color="text.secondary">
                  {INR(Math.round(unit.price / unit.carpetArea))}/sq.ft
                </Typography>
              )}
            </Box>
            <PriceTrend basePrice={unit.price} />
          </Stack>
        </Box>

        {/* Actions */}
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button
            fullWidth variant="contained" size="small" disableElevation
            onClick={e => { e.stopPropagation(); onEdit(unit); }}
            sx={{
              borderRadius: 2, textTransform: 'none', fontSize: 12, fontWeight: 800,
              bgcolor: cfg.color, '&:hover': { bgcolor: cfg.color, filter: 'brightness(0.9)' },
            }}>
            Manage
          </Button>
          <IconButton size="small" onClick={e => { e.stopPropagation(); onEdit(unit); }}
            sx={{ border: `1px solid ${cfg.color}30`, borderRadius: 2, color: cfg.color }}>
            <MoreVertOutlined sx={{ fontSize: 16 }} />
          </IconButton>
        </Stack>
      </Box>
    </Card>
  );
};

// ─── KANBAN VIEW ──────────────────────────────────────────────────────────────

const KanbanView = ({ units, onEdit }: { units: Unit[]; onEdit: (u: Unit) => void }) => {
  const columns = Object.entries(STATUS_CFG).sort((a, b) => a[1].order - b[1].order);
  return (
    <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
      {columns.map(([status, cfg]) => {
        const colUnits = units.filter(u => u.status === status);
        return (
          <Box key={status} sx={{ minWidth: 260, flexShrink: 0 }}>
            <Box sx={{
              p: 1.5, borderRadius: '12px 12px 0 0',
              background: `linear-gradient(135deg, ${cfg.color}15, ${cfg.color}08)`,
              border: `1px solid ${cfg.color}20`, borderBottom: 'none',
              display: 'flex', alignItems: 'center', gap: 1,
            }}>
              <Box sx={{ color: cfg.color }}>{cfg.icon}</Box>
              <Typography sx={{ fontWeight: 800, fontSize: 13, color: cfg.color }}>{cfg.label}</Typography>
              <Box sx={{ ml: 'auto', bgcolor: cfg.color, color: '#fff', borderRadius: '10px', px: 1, fontSize: 11, fontWeight: 800 }}>
                {colUnits.length}
              </Box>
            </Box>
            <Box sx={{
              border: `1px solid ${cfg.color}20`, borderTop: 'none', borderRadius: '0 0 12px 12px',
              bgcolor: `${cfg.color}05`, minHeight: 200, p: 1, display: 'flex', flexDirection: 'column', gap: 1,
            }}>
              {colUnits.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4, color: '#9ca3af', fontSize: 12 }}>No units</Box>
              ) : colUnits.map(u => (
                <Paper key={u.id} onClick={() => onEdit(u)} sx={{
                  p: 1.5, borderRadius: 2, cursor: 'pointer', boxShadow: 'none',
                  border: `1px solid ${cfg.color}15`, transition: 'all .15s',
                  '&:hover': { boxShadow: `0 4px 12px ${cfg.color}20`, transform: 'translateY(-1px)' },
                }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ fontWeight: 800, fontSize: 14 }}>{u.unitNumber}</Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: 12, color: cfg.color }}>{INR(u.price)}</Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {u.unitType.replace(/_/g, ' ')} · {getLabels(u.floor?.tower?.project?.propertyType).tower} {u.floor?.tower?.name}
                  </Typography>
                  {u.carpetArea && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {u.carpetArea} sq.ft
                    </Typography>
                  )}
                </Paper>
              ))}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

// ─── FLOOR PLAN VIEW ─────────────────────────────────────────────────────────

const FloorPlanView = ({ units }: { units: Unit[] }) => {
  const towerGroups = useMemo(() => {
    const g: Record<string, { tower: Unit['floor']['tower']; floors: Record<number, Unit[]> }> = {};
    units.forEach(u => {
      const tid = u.floor.tower.id;
      if (!g[tid]) g[tid] = { tower: u.floor.tower, floors: {} };
      const fn = u.floor.number;
      if (!g[tid].floors[fn]) g[tid].floors[fn] = [];
      g[tid].floors[fn].push(u);
    });
    return g;
  }, [units]);

  return (
    <Box>
      {Object.values(towerGroups).map(({ tower, floors }) => (
        <Card key={tower.id} sx={{ mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', overflow: 'hidden' }}>
          <Box sx={{ px: 3, py: 2, bgcolor: '#f8fafc', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" alignItems="center" gap={1}>
              <LayersOutlined sx={{ color: '#6366f1' }} />
              <Typography fontWeight={800}>{tower.project.name} · {tower.name}</Typography>
              <Chip label={`${tower.totalFloors} Floors`} size="small" sx={{ fontSize: 11, ml: 1 }} />
            </Stack>
          </Box>
          <Box sx={{ p: 2, overflowX: 'auto' }}>
            {Object.entries(floors).sort(([a], [b]) => parseInt(b) - parseInt(a)).map(([floor, floorUnits]) => (
              <Box key={floor} sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1.5 }}>
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#6b7280', minWidth: 52, textAlign: 'right' }}>
                  Floor {floor}
                </Typography>
                <Box sx={{ height: 1, width: 8, bgcolor: '#e5e7eb' }} />
                <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'nowrap' }}>
                  {floorUnits.map(u => {
                    const cfg = STATUS_CFG[u.status] ?? STATUS_CFG.AVAILABLE;
                    return (
                      <Tooltip key={u.id} title={`${u.unitNumber} · ${u.unitType.replace(/_/g, ' ')} · ${INR(u.price)}`} arrow>
                        <Box sx={{
                          width: 48, height: 36, borderRadius: 1.5,
                          bgcolor: cfg.bg, border: `1.5px solid ${cfg.color}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', transition: 'all .15s',
                          '&:hover': { transform: 'scale(1.15)', zIndex: 10, boxShadow: `0 4px 12px ${cfg.color}40` },
                        }}>
                          <Typography sx={{ fontSize: 9, fontWeight: 800, color: cfg.color, lineHeight: 1, textAlign: 'center' }}>
                            {u.unitNumber}
                          </Typography>
                        </Box>
                      </Tooltip>
                    );
                  })}
                </Stack>
              </Box>
            ))}
          </Box>
          {/* Legend */}
          <Box sx={{ px: 3, py: 1.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: '#fafafa', display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {Object.entries(STATUS_CFG).map(([k, v]) => (
              <Stack key={k} direction="row" alignItems="center" spacing={0.5}>
                <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: v.bg, border: `1.5px solid ${v.color}` }} />
                <Typography sx={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>{v.label}</Typography>
              </Stack>
            ))}
          </Box>
        </Card>
      ))}
    </Box>
  );
};

// ─── ADVANCED FILTER DRAWER ───────────────────────────────────────────────────

interface FilterState {
  status: string[];
  unitType: string[];
  projects: string[];
  towers: string[];
  priceRange: [number, number];
  areaRange: [number, number];
  floorRange: [number, number];
  facing: string[];
  features: string[];
  favorites: boolean;
}

const FilterDrawer = ({
  open, onClose, filters, onChange, units,
}: {
  open: boolean; onClose: () => void;
  filters: FilterState; onChange: (f: FilterState) => void; units: Unit[];
}) => {
  const [local, setLocal] = useState(filters);
  const maxPrice = Math.max(...units.map(u => u.price), 10_000_000);
  const maxArea = Math.max(...units.map(u => u.carpetArea || 0), 5000);
  const maxFloor = Math.max(...units.map(u => u.floor.number), 50);
  const projects = Array.from(new Set(units.map(u => u.floor.tower.project.name)));
  const towers = Array.from(new Set(units.map(u => u.floor.tower.name)));

  const toggle = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];

  useEffect(() => { setLocal(filters); }, [filters]);

  return (
    <Drawer anchor="right" open={open} onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100vw', sm: 380 }, borderRadius: '24px 0 0 24px' } }}>
      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography sx={{ fontWeight: 900, fontSize: 20 }}>Advanced Filters</Typography>
          <IconButton onClick={onClose}><CloseOutlined /></IconButton>
        </Stack>

        <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
          {/* Status */}
          <Typography sx={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280', mb: 1.5 }}>Status</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {Object.entries(STATUS_CFG).map(([k, v]) => (
              <Box key={k} onClick={() => setLocal(l => ({ ...l, status: toggle(l.status, k) }))} sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.5,
                px: 1.2, py: 0.5, borderRadius: '20px', cursor: 'pointer',
                border: `1.5px solid ${local.status.includes(k) ? v.color : '#e5e7eb'}`,
                bgcolor: local.status.includes(k) ? v.bg : 'transparent',
                color: local.status.includes(k) ? v.color : '#6b7280',
                fontSize: 12, fontWeight: 700, transition: 'all .15s',
              }}>
                {v.icon}{v.label}
              </Box>
            ))}
          </Box>

          {/* Unit Type */}
          <Typography sx={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280', mb: 1.5 }}>Unit Type</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 3 }}>
            {UNIT_TYPES.map(t => (
              <Chip key={t} label={t.replace(/_/g, ' ')} size="small" clickable
                variant={local.unitType.includes(t) ? 'filled' : 'outlined'}
                color={local.unitType.includes(t) ? 'primary' : 'default'}
                onClick={() => setLocal(l => ({ ...l, unitType: toggle(l.unitType, t) }))}
                sx={{ fontWeight: 700, fontSize: 11 }} />
            ))}
          </Box>

          {/* Price Range */}
          <Typography sx={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280', mb: 1 }}>
            Price Range: {INR(local.priceRange[0])} — {INR(local.priceRange[1])}
          </Typography>
          <Box sx={{ px: 1, mb: 3 }}>
            <Slider value={local.priceRange} min={0} max={maxPrice} step={100000}
              onChange={(_, v) => setLocal(l => ({ ...l, priceRange: v as [number, number] }))}
              valueLabelDisplay="auto" valueLabelFormat={v => INR(v)} color="primary" />
          </Box>

          {/* Area Range */}
          <Typography sx={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280', mb: 1 }}>
            Carpet Area: {local.areaRange[0]} — {local.areaRange[1]} sq.ft
          </Typography>
          <Box sx={{ px: 1, mb: 3 }}>
            <Slider value={local.areaRange} min={0} max={maxArea} step={50}
              onChange={(_, v) => setLocal(l => ({ ...l, areaRange: v as [number, number] }))}
              valueLabelDisplay="auto" valueLabelFormat={v => `${v} sq.ft`} color="secondary" />
          </Box>

          {/* Floor Range */}
          <Typography sx={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280', mb: 1 }}>
            Floor: {local.floorRange[0]} — {local.floorRange[1]}
          </Typography>
          <Box sx={{ px: 1, mb: 3 }}>
            <Slider value={local.floorRange} min={0} max={maxFloor} step={1}
              onChange={(_, v) => setLocal(l => ({ ...l, floorRange: v as [number, number] }))}
              valueLabelDisplay="auto" color="success" />
          </Box>

          {/* Facing */}
          <Typography sx={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280', mb: 1.5 }}>Facing</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 3 }}>
            {FACINGS.map(f => (
              <Chip key={f} label={f} size="small" clickable
                variant={local.facing.includes(f) ? 'filled' : 'outlined'}
                color={local.facing.includes(f) ? 'success' : 'default'}
                onClick={() => setLocal(l => ({ ...l, facing: toggle(l.facing, f) }))}
                sx={{ fontWeight: 700, fontSize: 11 }} />
            ))}
          </Box>

          {/* Projects */}
          {projects.length > 0 && (
            <>
              <Typography sx={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280', mb: 1.5 }}>Projects</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 3 }}>
                {projects.map(p => (
                  <Chip key={p} label={p} size="small" clickable
                    variant={local.projects.includes(p) ? 'filled' : 'outlined'}
                    onClick={() => setLocal(l => ({ ...l, projects: toggle(l.projects, p) }))}
                    sx={{ fontWeight: 700, fontSize: 11 }} />
                ))}
              </Box>
            </>
          )}

          {/* Favorites */}
          <FormControlLabel
            control={<Switch checked={local.favorites} onChange={e => setLocal(l => ({ ...l, favorites: e.target.checked }))} color="warning" />}
            label={<Typography sx={{ fontWeight: 700, fontSize: 13 }}>Favorites Only ⭐</Typography>}
          />
        </Box>

        <Divider sx={{ my: 2 }} />
        <Stack direction="row" spacing={1.5}>
          <Button fullWidth variant="outlined" onClick={() => setLocal({ status: [], unitType: [], projects: [], towers: [], priceRange: [0, maxPrice], areaRange: [0, maxArea], floorRange: [0, maxFloor], facing: [], features: [], favorites: false })}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
            Reset
          </Button>
          <Button fullWidth variant="contained" disableElevation onClick={() => { onChange(local); onClose(); }}
            sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2 }}>
            Apply Filters
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
};

// ─── UNIT DETAIL DIALOG ───────────────────────────────────────────────────────

const UnitDetailDialog = ({
  unit, onClose, onSave,
}: { unit: Unit | null; onClose: () => void; onSave: () => void }) => {
  const [tab, setTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Unit>>({});
  const [history, setHistory] = useState<UnitHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (unit) {
      setForm({ ...unit });
      if (tab === 2) fetchHistory();
    }
  }, [unit, tab]);

  const fetchHistory = async () => {
    if (!unit) return;
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

  const handleSave = async () => {
    if (!unit) return;
    setSaving(true);
    try {
      await api.put(`/inventory/units/${unit.id}`, form);
      onSave();
      onClose();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const cfg = unit ? (STATUS_CFG[unit.status] ?? STATUS_CFG.AVAILABLE) : STATUS_CFG.AVAILABLE;

  return (
    <Dialog open={!!unit} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}>
      {unit && (
        <>
          {/* Accent header */}
          <Box sx={{ height: 5, background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}66)` }} />

          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{
                width: 42, height: 42, borderRadius: 2.5, bgcolor: `${cfg.color}15`,
                border: `2px solid ${cfg.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Typography sx={{ fontWeight: 900, fontSize: 13, color: cfg.color }}>
                  {unit?.unitNumber?.slice(0, 3)}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 900, fontSize: 18 }}>{getLabels(unit?.floor?.tower?.project?.propertyType).unit} {unit?.unitNumber}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {unit?.floor?.tower?.project?.name} · {unit?.floor?.tower?.name} · {getLabels(unit?.floor?.tower?.project?.propertyType).floor} {unit?.floor?.number}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <StatusBadge status={unit?.status || 'AVAILABLE'} size="md" />
              <IconButton size="small" onClick={onClose}><CloseOutlined /></IconButton>
            </Stack>
          </DialogTitle>

          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Details" sx={{ textTransform: 'none', fontWeight: 700 }} />
            <Tab label="Edit Unit" sx={{ textTransform: 'none', fontWeight: 700 }} />
            <Tab label="History" sx={{ textTransform: 'none', fontWeight: 700 }} />
            <Tab label="Analytics" sx={{ textTransform: 'none', fontWeight: 700 }} />
          </Tabs>

          <DialogContent sx={{ p: 3 }}>
            {/* Details Tab */}
            {tab === 0 && (
              <Box>
                {/* Price hero */}
                <Box sx={{ p: 2.5, borderRadius: 3, background: `linear-gradient(135deg, ${cfg.color}12, ${cfg.color}06)`, border: `1px solid ${cfg.color}20`, mb: 3 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Listed Price</Typography>
                  <Typography sx={{ fontWeight: 900, fontSize: 32, letterSpacing: '-1px', color: cfg.color }}>{INR(unit.price)}</Typography>
                  <Stack direction="row" spacing={2} mt={1}>
                    {unit.carpetArea && <Typography variant="caption" color="text.secondary">Carpet: {unit.carpetArea} sq.ft · {INR(Math.round(unit.price / unit.carpetArea))}/sq.ft</Typography>}
                    {unit.builtUpArea && <Typography variant="caption" color="text.secondary">Built-up: {unit.builtUpArea} sq.ft</Typography>}
                    {unit.superArea && <Typography variant="caption" color="text.secondary">Super: {unit.superArea} sq.ft</Typography>}
                  </Stack>
                </Box>

                <Grid container spacing={2}>
                  {[
                    { label: 'Unit Type', value: unit.unitType.replace(/_/g, ' '), icon: '🏠' },
                    { label: 'Facing', value: unit.facing || '—', icon: '🧭' },
                    { label: `${getLabels(unit.floor?.tower?.project?.propertyType).floor}`, value: `${getLabels(unit.floor?.tower?.project?.propertyType).floor} ${unit.floor?.number}`, icon: '🏗️' },
                    { label: `${getLabels(unit.floor?.tower?.project?.propertyType).tower}`, value: unit.floor?.tower?.name, icon: '🏢' },
                    { label: 'Total Floors', value: unit.floor?.tower?.totalFloors, icon: '📊' },
                    { label: 'Project', value: unit.floor?.tower?.project?.name, icon: '📍' },
                  ].map(({ label, value, icon }) => (
                    <Grid item xs={6} sm={4} key={label}>
                      <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #f1f5f9' }}>
                        <Typography sx={{ fontSize: 16, mb: 0.3 }}>{icon}</Typography>
                        <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</Typography>
                        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{value}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                {unit.features && unit.features.length > 0 && (
                  <Box sx={{ mt: 2.5 }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5 }}>Features & Amenities</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {unit.features.map(f => (
                        <Chip key={f} label={f} size="small" icon={<CheckCircleOutlined sx={{ fontSize: 14, color: '#059669 !important' }} />}
                          sx={{ fontWeight: 700, fontSize: 12, bgcolor: '#d1fae5', color: '#065f46', border: 'none' }} />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            {/* Edit Tab */}
            {tab === 1 && (
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select value={form.status || ''} label="Status"
                      onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                      {Object.entries(STATUS_CFG).map(([k, v]) => (
                        <MenuItem key={k} value={k}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box sx={{ color: v.color }}>{v.icon}</Box>
                            <span>{v.label}</span>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Unit Type</InputLabel>
                    <Select value={(form as any).unitType || ''} label="Unit Type"
                      onChange={e => setForm(f => ({ ...f, unitType: e.target.value } as any))}>
                      {UNIT_TYPES.map(t => <MenuItem key={t} value={t}>{t.replace(/_/g, ' ')}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Price (₹)" type="number"
                    value={form.price || ''} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Facing</InputLabel>
                    <Select value={form.facing || ''} label="Facing"
                      onChange={e => setForm(f => ({ ...f, facing: e.target.value }))}>
                      {FACINGS.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth size="small" label="Carpet Area (sq.ft)" type="number"
                    value={form.carpetArea || ''} onChange={e => setForm(f => ({ ...f, carpetArea: Number(e.target.value) }))} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth size="small" label="Built-up Area (sq.ft)" type="number"
                    value={form.builtUpArea || ''} onChange={e => setForm(f => ({ ...f, builtUpArea: Number(e.target.value) }))} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth size="small" label="Super Area (sq.ft)" type="number"
                    value={form.superArea || ''} onChange={e => setForm(f => ({ ...f, superArea: Number(e.target.value) }))} />
                </Grid>
                <Grid item xs={12}>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#6b7280', mb: 1 }}>Features / Amenities</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {FEATURES.map(feat => {
                      const selected = (form.features || []).includes(feat);
                      return (
                        <Chip key={feat} label={feat} size="small" clickable
                          variant={selected ? 'filled' : 'outlined'} color={selected ? 'success' : 'default'}
                          onClick={() => setForm(f => ({
                            ...f,
                            features: selected
                              ? (f.features || []).filter(x => x !== feat)
                              : [...(f.features || []), feat],
                          }))}
                          sx={{ fontWeight: 700, fontSize: 11 }} />
                      );
                    })}
                  </Box>
                </Grid>
              </Grid>
            )}

            {/* History Tab */}
            {tab === 2 && (
              <Box sx={{ minHeight: 200 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Status change history for Unit {unit?.unitNumber}</Typography>
                {historyLoading ? (
                  <Box display="flex" justifyContent="center" py={4}><CircularProgress size={24} /></Box>
                ) : history.length === 0 ? (
                  <Box display="flex" flexDirection="column" alignItems="center" py={4} sx={{ color: '#9ca3af' }}>
                    <HistoryOutlined sx={{ fontSize: 40, mb: 1, opacity: 0.3 }} />
                    <Typography variant="body2">No history records found for this unit</Typography>
                  </Box>
                ) : (
                  history.map((h) => (
                    <Box key={h.id} sx={{ display: 'flex', gap: 2, mb: 2, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2 }}>
                      <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <HistoryOutlined sx={{ fontSize: 16, color: '#6366f1' }} />
                      </Box>
                      <Box flex={1}>
                        <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{h.action}</Typography>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.3 }}>
                          <Chip label={h.oldStatus || 'NONE'} size="small" sx={{ fontSize: 10 }} />
                          <SwapHorizOutlined sx={{ fontSize: 14, color: '#9ca3af' }} />
                          <Chip label={h.newStatus} size="small" color="primary" sx={{ fontSize: 10 }} />
                        </Stack>
                        <Typography variant="caption" color="text.secondary">{h.agentName || 'System'} · {new Date(h.createdAt).toLocaleString()}</Typography>
                      </Box>
                    </Box>
                  ))
                )}
              </Box>
            )}

            {/* Analytics Tab */}
            {tab === 3 && (
              <Box>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {[
                    { label: 'Days on Market', value: '42 days', color: '#6366f1' },
                    { label: 'Visits', value: '7', color: '#f59e0b' },
                    { label: 'Inquiries', value: '12', color: '#3b82f6' },
                    { label: 'Price/sq.ft', value: unit?.carpetArea ? INR(Math.round((unit.price || 0) / unit.carpetArea)) : '—', color: '#059669' },
                  ].map(({ label, value, color }) => (
                    <Grid item xs={6} key={label}>
                      <Box sx={{ p: 2, borderRadius: 2.5, border: `1px solid ${color}25`, bgcolor: `${color}08` }}>
                        <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</Typography>
                        <Typography sx={{ fontWeight: 900, fontSize: 22, color, mt: 0.3 }}>{value}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  Comparable units in this project are priced between <strong>₹82L – ₹98L</strong>. This unit is positioned at market rate.
                </Alert>
              </Box>
            )}
          </DialogContent>

          {tab === 1 && (
            <>
              <Divider />
              <DialogActions sx={{ p: 2.5, gap: 1 }}>
                <Button onClick={onClose} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
                <Button variant="contained" disableElevation onClick={handleSave} disabled={saving}
                  sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2, px: 3,
                    bgcolor: cfg.color, '&:hover': { bgcolor: cfg.color, filter: 'brightness(0.9)' } }}>
                  {saving ? <CircularProgress size={18} color="inherit" /> : 'Save Changes'}
                </Button>
              </DialogActions>
            </>
          )}
        </>
      )}
    </Dialog>
  );
};

// ─── EXPORT UTILITIES ─────────────────────────────────────────────────────────

const exportCSV = (units: Unit[]) => {
  const headers = ['Unit No', 'Project', 'Tower/Block', 'Floor/Lane', 'Type', 'Status', 'Price', 'Carpet Area', 'Built-up Area', 'Super Area', 'Facing'];
  const rows = units.map(u => {
    const labels = getLabels(u.floor?.tower?.project?.propertyType);
    return [
      u.unitNumber, u.floor?.tower?.project?.name, `${labels.tower} ${u.floor?.tower?.name}`,
      `${labels.floor} ${u.floor?.number}`, u.unitType, u.status, u.price,
      u.carpetArea || '', u.builtUpArea || '', u.superArea || '', u.facing || '',
    ];
  });
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `units_export_${Date.now()}.csv`; a.click();
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

const UnitsPage: React.FC = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [editUnit, setEditUnit] = useState<Unit | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [filterDrawer, setFilterDrawer] = useState(false);
  const [sortField, setSortField] = useState<SortField>('unitNumber');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [compareList, setCompareList] = useState<Unit[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [bulkMenuAnchor, setBulkMenuAnchor] = useState<HTMLElement | null>(null);

  const defaultFilters: FilterState = {
    status: [], unitType: [], projects: [], towers: [],
    priceRange: [0, 100_000_000],
    areaRange: [0, 10000],
    floorRange: [0, 100],
    facing: [], features: [], favorites: false,
  };
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/inventory/units?limit=1000');
      setUnits(r.data.data || []);
    } catch { setSnack({ open: true, message: 'Failed to load units', severity: 'error' }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let c = 0;
    if (filters.status.length) c++;
    if (filters.unitType.length) c++;
    if (filters.projects.length) c++;
    if (filters.facing.length) c++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 100_000_000) c++;
    if (filters.areaRange[0] > 0 || filters.areaRange[1] < 10000) c++;
    if (filters.favorites) c++;
    return c;
  }, [filters]);

  // Filtered + sorted + paginated
  const { filtered, totalCount } = useMemo(() => {
    const q = search.toLowerCase();
    let f = units.filter(u => {
      if (q && !u.unitNumber.toLowerCase().includes(q)
        && !u.floor.tower.project.name.toLowerCase().includes(q)
        && !u.floor.tower.name.toLowerCase().includes(q)
        && !u.unitType.toLowerCase().includes(q)) return false;
      if (filters.status.length && !filters.status.includes(u.status)) return false;
      if (filters.unitType.length && !filters.unitType.includes(u.unitType)) return false;
      if (filters.projects.length && !filters.projects.includes(u.floor.tower.project.name)) return false;
      if (filters.facing.length && u.facing && !filters.facing.includes(u.facing)) return false;
      if (u.price < filters.priceRange[0] || u.price > filters.priceRange[1]) return false;
      if (u.carpetArea && (u.carpetArea < filters.areaRange[0] || u.carpetArea > filters.areaRange[1])) return false;
      if (u.floor.number < filters.floorRange[0] || u.floor.number > filters.floorRange[1]) return false;
      if (filters.favorites && !favorites.has(u.id)) return false;
      return true;
    });

    f.sort((a, b) => {
      let av: string | number, bv: string | number;
      switch (sortField) {
        case 'price': av = a.price; bv = b.price; break;
        case 'carpetArea': av = a.carpetArea || 0; bv = b.carpetArea || 0; break;
        case 'status': av = a.status; bv = b.status; break;
        case 'unitType': av = a.unitType; bv = b.unitType; break;
        default: av = a.unitNumber; bv = b.unitNumber;
      }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return { filtered: f, totalCount: f.length };
  }, [units, search, filters, sortField, sortDir, favorites]);

  const paginated = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);

  const stats = useMemo(() => {
    const s: Record<string, number> = { total: units.length };
    Object.keys(STATUS_CFG).forEach(k => { s[k] = 0; });
    units.forEach(u => { if (s[u.status] !== undefined) s[u.status]++; });
    const available = units.filter(u => u.status === 'AVAILABLE');
    s.totalValue = available.reduce((sum, u) => sum + u.price, 0);
    s.avgPrice = available.length ? s.totalValue / available.length : 0;
    return s;
  }, [units]);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const toggleSelect = (id: string) => setSelected(s => { const ns = new Set(s); ns.has(id) ? ns.delete(id) : ns.add(id); return ns; });
  const toggleFavorite = (id: string) => setFavorites(s => { const ns = new Set(s); ns.has(id) ? ns.delete(id) : ns.add(id); return ns; });
  const selectAll = () => setSelected(s => s.size === paginated.length ? new Set() : new Set(paginated.map(u => u.id)));

  const handleBulkStatusChange = async (status: string) => {
    try {
      await Promise.all([...selected].map(id => api.put(`/inventory/units/${id}`, { status })));
      setSnack({ open: true, message: `${selected.size} units updated to ${status}`, severity: 'success' });
      setSelected(new Set());
      fetchData();
    } catch { setSnack({ open: true, message: 'Bulk update failed', severity: 'error' }); }
    setBulkMenuAnchor(null);
  };

  const addToCompare = (unit: Unit) => {
    if (compareList.length >= 3) { setSnack({ open: true, message: 'Max 3 units for comparison', severity: 'error' }); return; }
    if (!compareList.find(u => u.id === unit.id)) setCompareList(l => [...l, unit]);
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableSortLabel active={sortField === field} direction={sortField === field ? sortDir : 'asc'} onClick={() => handleSort(field)}>
      {children}
    </TableSortLabel>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#fafafa', minHeight: '100vh' }}>

      {/* ─── HEADER ─────────────────────────────────────────────────── */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-start' }} mb={4} spacing={2}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={0.5}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HolidayVillageOutlined sx={{ color: '#fff', fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontWeight: 900, fontSize: { xs: 24, md: 30 }, letterSpacing: '-1px' }}>
              Inventory Manager
            </Typography>
          </Stack>
          <Typography color="text.secondary" sx={{ fontSize: 14 }}>
            {stats.total} units · {INR(stats.availableValue || stats.totalValue || 0)} available value
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button startIcon={<DownloadOutlined />} variant="outlined" size="small" disableElevation
            onClick={() => exportCSV(filtered)}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
            Export CSV
          </Button>
          <Button startIcon={<PrintOutlined />} variant="outlined" size="small" onClick={() => window.print()}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
            Print
          </Button>
          <Button startIcon={<RefreshOutlined />} size="small" onClick={fetchData}
            sx={{ textTransform: 'none', borderRadius: 2 }}>
            Refresh
          </Button>
        </Stack>
      </Stack>

      {/* ─── STATS BAR ──────────────────────────────────────────────── */}
      <Grid container spacing={1.5} mb={3}>
        {Object.entries(STATUS_CFG).map(([k, v]) => {
          const count = stats[k] ?? 0;
          const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
          const isActive = filters.status.includes(k);
          return (
            <Grid item xs={6} sm={4} md={3} lg={true} key={k}>
              <Card onClick={() => setFilters(f => ({ ...f, status: isActive ? f.status.filter(s => s !== k) : [...f.status, k] }))}
                sx={{
                  borderRadius: 3, p: 1.5, boxShadow: 'none', cursor: 'pointer',
                  border: `2px solid ${isActive ? v.color : 'transparent'}`,
                  bgcolor: isActive ? v.bg : '#fff',
                  transition: 'all .15s',
                  '&:hover': { borderColor: v.color, transform: 'translateY(-1px)' },
                }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ fontWeight: 900, fontSize: 22, color: v.color }}>{count}</Typography>
                  <Box sx={{ color: v.color, opacity: .7 }}>{v.icon}</Box>
                </Stack>
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#6b7280' }}>{v.label}</Typography>
                <LinearProgress variant="determinate" value={pct} sx={{
                  mt: 0.75, height: 3, borderRadius: 2, bgcolor: `${v.color}20`,
                  '& .MuiLinearProgress-bar': { bgcolor: v.color }
                }} />
              </Card>
            </Grid>
          );
        })}
        {/* Summary cards */}
        <Grid item xs={6} sm={4} md={3} lg={true}>
          <Card sx={{ borderRadius: 3, p: 1.5, boxShadow: 'none', border: '1px solid #e5e7eb', bgcolor: '#fff' }}>
            <Typography sx={{ fontWeight: 900, fontSize: 16, color: '#6366f1' }}>{INR(stats.totalValue || 0)}</Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#6b7280' }}>Available Value</Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={3} lg={true}>
          <Card sx={{ borderRadius: 3, p: 1.5, boxShadow: 'none', border: '1px solid #e5e7eb', bgcolor: '#fff' }}>
            <Typography sx={{ fontWeight: 900, fontSize: 16, color: '#059669' }}>{INR(stats.avgPrice || 0)}</Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#6b7280' }}>Avg. Available Price</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* ─── TOOLBAR ─────────────────────────────────────────────────── */}
      <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #e5e7eb', p: 1.5, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
          <TextField fullWidth placeholder="Search unit number, project, tower, type..." size="small" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small" /></InputAdornment>,
              sx: { borderRadius: 2 },
              endAdornment: search && <InputAdornment position="end"><IconButton size="small" onClick={() => setSearch('')}><CloseOutlined sx={{ fontSize: 14 }} /></IconButton></InputAdornment>,
            }} />
          <Stack direction="row" spacing={1} flexShrink={0}>
            <Badge badgeContent={activeFilterCount} color="primary">
              <Button startIcon={<TuneOutlined />} variant={activeFilterCount > 0 ? 'contained' : 'outlined'} disableElevation
                onClick={() => setFilterDrawer(true)} size="small"
                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, whiteSpace: 'nowrap' }}>
                Filters
              </Button>
            </Badge>
            {selected.size > 0 && (
              <>
                <Button variant="contained" color="warning" size="small" disableElevation
                  onClick={e => setBulkMenuAnchor(e.currentTarget)}
                  endIcon={<KeyboardArrowDownOutlined />}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, whiteSpace: 'nowrap' }}>
                  {selected.size} selected
                </Button>
                <Menu anchorEl={bulkMenuAnchor} open={!!bulkMenuAnchor} onClose={() => setBulkMenuAnchor(null)}
                  PaperProps={{ sx: { borderRadius: 2, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', minWidth: 200 } }}>
                  {BULK_ACTIONS.map(a => (
                    <MuiMenuItem key={a.label} onClick={() => a.targetStatus ? handleBulkStatusChange(a.targetStatus) : null}
                      sx={{ fontSize: 13, fontWeight: 600 }}>
                      <ListItemIcon sx={{ color: a.color ? `${a.color}.main` : 'inherit' }}>{a.icon}</ListItemIcon>
                      <ListItemText>{a.label}</ListItemText>
                    </MuiMenuItem>
                  ))}
                  <Divider />
                  <MuiMenuItem onClick={() => exportCSV(units.filter(u => selected.has(u.id)))} sx={{ fontSize: 13, fontWeight: 600 }}>
                    <ListItemIcon><FileDownloadOutlined /></ListItemIcon>
                    <ListItemText>Export Selected</ListItemText>
                  </MuiMenuItem>
                  <MuiMenuItem onClick={() => setSelected(new Set())} sx={{ fontSize: 13, fontWeight: 600, color: 'error.main' }}>
                    <ListItemIcon sx={{ color: 'error.main' }}><CloseOutlined /></ListItemIcon>
                    <ListItemText>Clear Selection</ListItemText>
                  </MuiMenuItem>
                </Menu>
              </>
            )}
            {/* View mode toggles */}
            <ToggleButtonGroup value={viewMode} exclusive onChange={(_, v) => v && setViewMode(v)} size="small"
              sx={{ '& .MuiToggleButton-root': { borderRadius: 2, border: '1px solid #e5e7eb', fontWeight: 700 } }}>
              <ToggleButton value="table"><Tooltip title="Table"><TableRowsOutlined sx={{ fontSize: 18 }} /></Tooltip></ToggleButton>
              <ToggleButton value="grid"><Tooltip title="Grid"><GridViewOutlined sx={{ fontSize: 18 }} /></Tooltip></ToggleButton>
              <ToggleButton value="kanban"><Tooltip title="Kanban"><ViewKanbanOutlined sx={{ fontSize: 18 }} /></Tooltip></ToggleButton>
              <ToggleButton value="floor"><Tooltip title="Floor Plan"><LayersOutlined sx={{ fontSize: 18 }} /></Tooltip></ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Stack>
      </Card>

      {/* Result count + active filters */}
      <Stack direction="row" alignItems="center" spacing={1.5} mb={2} flexWrap="wrap">
        <Typography sx={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>
          {totalCount} units {search || activeFilterCount > 0 ? `(filtered from ${units.length})` : ''}
        </Typography>
        {activeFilterCount > 0 && (
          <Button size="small" color="error" onClick={() => { setFilters(defaultFilters); setPage(1); }}
            sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12, p: '2px 8px', borderRadius: 10 }}>
            Clear all filters
          </Button>
        )}
        {compareList.length > 0 && (
          <Button size="small" variant="outlined" color="secondary" startIcon={<CompareArrowsOutlined />}
            onClick={() => setCompareOpen(true)}
            sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12, borderRadius: 10 }}>
            Compare ({compareList.length})
          </Button>
        )}
      </Stack>

      {/* ─── LOADING ─────────────────────────────────────────────────── */}
      {loading && (
        <Grid container spacing={2}>
          {[...Array(8)].map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <Skeleton variant="rounded" height={280} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* ─── CONTENT ─────────────────────────────────────────────────── */}
      {!loading && (
        <>
          {/* TABLE VIEW */}
          {viewMode === 'table' && (
            <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      <TableCell padding="checkbox">
                        <input type="checkbox" checked={selected.size === paginated.length && paginated.length > 0}
                          onChange={selectAll} style={{ cursor: 'pointer' }} />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        <SortableHeader field="unitNumber">Unit</SortableHeader>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Project · Tower/Block</TableCell>
                      <TableCell sx={{ fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Floor/Lane</TableCell>
                      <TableCell sx={{ fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        <SortableHeader field="unitType">Type</SortableHeader>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        <SortableHeader field="carpetArea">Area</SortableHeader>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Facing</TableCell>
                      <TableCell sx={{ fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        <SortableHeader field="price">Price</SortableHeader>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>₹/sq.ft</TableCell>
                      <TableCell sx={{ fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        <SortableHeader field="status">Status</SortableHeader>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginated.length === 0 ? (
                      <TableRow><TableCell colSpan={11} align="center" sx={{ py: 8, color: '#9ca3af', fontSize: 14 }}>
                        No units match your search or filters
                      </TableCell></TableRow>
                    ) : paginated.map(u => {
                      const cfg = STATUS_CFG[u.status] ?? STATUS_CFG.AVAILABLE;
                      const pricePerSqFt = u.carpetArea ? Math.round(u.price / u.carpetArea) : null;
                      const isSel = selected.has(u.id);
                      return (
                        <TableRow key={u.id} hover selected={isSel}
                          sx={{ '& td': { py: 1.2 }, bgcolor: isSel ? `${cfg.color}08` : 'inherit', cursor: 'pointer' }}
                          onClick={() => setEditUnit(u)}>
                          <TableCell padding="checkbox" onClick={e => { e.stopPropagation(); toggleSelect(u.id); }}>
                            <input type="checkbox" checked={isSel} onChange={() => toggleSelect(u.id)} style={{ cursor: 'pointer' }} />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <IconButton size="small" onClick={e => { e.stopPropagation(); toggleFavorite(u.id); }}>
                                {favorites.has(u.id)
                                  ? <StarOutlined sx={{ fontSize: 14, color: '#f59e0b' }} />
                                  : <StarBorderOutlined sx={{ fontSize: 14, color: '#d1d5db' }} />}
                              </IconButton>
                              <Typography sx={{ fontWeight: 900, fontSize: 14 }}>{u.unitNumber}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{u.floor?.tower?.project?.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{getLabels(u.floor?.tower?.project?.propertyType).tower} {u.floor?.tower?.name}</Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.3, bgcolor: '#f1f5f9', borderRadius: 1 }}>
                              <StairsOutlined sx={{ fontSize: 11, color: '#6b7280' }} />
                              <Typography sx={{ fontSize: 12, fontWeight: 700 }}>{u.floor?.number}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip label={u.unitType.replace(/_/g, ' ')} size="small"
                              sx={{ fontSize: 11, height: 22, fontWeight: 700, bgcolor: '#f1f5f9' }} />
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                              {u.carpetArea ? `${u.carpetArea}` : '—'}
                            </Typography>
                            {u.superArea && <Typography variant="caption" color="text.secondary">S:{u.superArea}</Typography>}
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: 12, color: '#6b7280' }}>{u.facing || '—'}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontWeight: 900, fontSize: 14, color: cfg.color }}>{INR(u.price)}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: 12, color: '#6b7280' }}>
                              {pricePerSqFt ? INR(pricePerSqFt) : '—'}
                            </Typography>
                          </TableCell>
                          <TableCell><StatusBadge status={u.status} /></TableCell>
                          <TableCell onClick={e => e.stopPropagation()}>
                            <Stack direction="row" spacing={0.5}>
                              <Tooltip title="Edit">
                                <IconButton size="small" onClick={() => setEditUnit(u)}>
                                  <EditOutlined sx={{ fontSize: 15 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Add to compare">
                                <IconButton size="small" onClick={() => addToCompare(u)}>
                                  <CompareArrowsOutlined sx={{ fontSize: 15 }} />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderTop: '1px solid #f1f5f9' }}>
                <Typography variant="caption" color="text.secondary">
                  Page {page} · {Math.min((page - 1) * pageSize + 1, totalCount)}–{Math.min(page * pageSize, totalCount)} of {totalCount}
                </Typography>
                <Pagination count={Math.ceil(totalCount / pageSize)} page={page} onChange={(_, v) => setPage(v)} size="small" />
              </Box>
            </Card>
          )}

          {/* GRID VIEW */}
          {viewMode === 'grid' && (
            <>
              <Grid container spacing={2}>
                {paginated.map(u => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={u.id}>
                    <UnitCard unit={u} selected={selected.has(u.id)} onSelect={() => toggleSelect(u.id)}
                      onEdit={setEditUnit} onFavorite={toggleFavorite} favorites={favorites} />
                  </Grid>
                ))}
              </Grid>
              {totalCount > pageSize && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination count={Math.ceil(totalCount / pageSize)} page={page} onChange={(_, v) => setPage(v)} />
                </Box>
              )}
            </>
          )}

          {/* KANBAN VIEW */}
          {viewMode === 'kanban' && <KanbanView units={filtered} onEdit={setEditUnit} />}

          {/* FLOOR PLAN VIEW */}
          {viewMode === 'floor' && <FloorPlanView units={filtered} />}
        </>
      )}

      {/* ─── COMPARE DIALOG ─────────────────────────────────────────── */}
      <Dialog open={compareOpen} onClose={() => setCompareOpen(false)} maxWidth="lg" fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 900, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Compare Units
          <Stack direction="row" spacing={1}>
            <Button size="small" onClick={() => setCompareList([])} color="error" sx={{ textTransform: 'none' }}>Clear</Button>
            <IconButton size="small" onClick={() => setCompareOpen(false)}><CloseOutlined /></IconButton>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 800, width: 160 }}>Attribute</TableCell>
                  {compareList.map(u => (
                    <TableCell key={u.id} sx={{ fontWeight: 900 }}>
                      {u.unitNumber}
                      <IconButton size="small" onClick={() => setCompareList(l => l.filter(x => x.id !== u.id))}
                        sx={{ ml: 1 }}><CloseOutlined sx={{ fontSize: 12 }} /></IconButton>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  { label: 'Project', fn: (u: Unit) => u.floor.tower.project.name },
                  { label: 'Tower', fn: (u: Unit) => u.floor.tower.name },
                  { label: 'Floor', fn: (u: Unit) => `Floor ${u.floor.number}` },
                  { label: 'Type', fn: (u: Unit) => u.unitType.replace(/_/g, ' ') },
                  { label: 'Status', fn: (u: Unit) => <StatusBadge status={u.status} /> },
                  { label: 'Price', fn: (u: Unit) => <strong style={{ color: '#6366f1' }}>{INR(u.price)}</strong> },
                  { label: 'Carpet Area', fn: (u: Unit) => u.carpetArea ? `${u.carpetArea} sq.ft` : '—' },
                  { label: 'Built-up', fn: (u: Unit) => u.builtUpArea ? `${u.builtUpArea} sq.ft` : '—' },
                  { label: 'Super Area', fn: (u: Unit) => u.superArea ? `${u.superArea} sq.ft` : '—' },
                  { label: '₹/sq.ft', fn: (u: Unit) => u.carpetArea ? INR(Math.round(u.price / u.carpetArea)) : '—' },
                  { label: 'Facing', fn: (u: Unit) => u.facing || '—' },
                ].map(row => (
                  <TableRow key={row.label} hover>
                    <TableCell sx={{ color: '#6b7280', fontWeight: 700, fontSize: 12 }}>{row.label}</TableCell>
                    {compareList.map(u => <TableCell key={u.id} sx={{ fontSize: 13 }}>{row.fn(u)}</TableCell>)}
                    {/* Pad empty columns */}
                    {[...Array(3 - compareList.length)].map((_, i) => <TableCell key={i} />)}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>

      {/* ─── FILTER DRAWER ───────────────────────────────────────────── */}
      <FilterDrawer open={filterDrawer} onClose={() => setFilterDrawer(false)}
        filters={filters} onChange={f => { setFilters(f); setPage(1); }} units={units} />

      {/* ─── UNIT DETAIL / EDIT DIALOG ───────────────────────────────── */}
      <UnitDetailDialog unit={editUnit} onClose={() => setEditUnit(null)} onSave={() => { fetchData(); setSnack({ open: true, message: 'Unit updated successfully', severity: 'success' }); }} />

      {/* ─── SNACKBAR ────────────────────────────────────────────────── */}
      <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))} sx={{ borderRadius: 2, fontWeight: 700 }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UnitsPage;