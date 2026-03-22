import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Stack, Button, Paper, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem, FormControl, InputLabel, Divider, Grid,
  Tooltip, CircularProgress, Collapse, Tab, Tabs, Avatar, Menu
} from '@mui/material';
import {
  AddOutlined, ExpandMoreOutlined, ExpandLessOutlined,
  EditOutlined, DeleteOutlineOutlined, CloseOutlined,
  ApartmentOutlined, LayersOutlined, GridViewOutlined,
  MoreVertOutlined
} from '@mui/icons-material';
import {
  Tower, Floor, Unit, UnitStatus, UNIT_STATUS_CFG,
  UNIT_TYPES, UNIT_TYPE_LABELS, FACING_OPTIONS, fmtPrice, PropertyType
} from './propertyTypes';
import api from '../../../../api/axios';

const getLabels = (isLand: boolean) => ({
  tower: isLand ? 'Block / Phase' : 'Tower / Wing',
  floor: isLand ? 'Lane / Street' : 'Floor / Level',
  unit: isLand ? 'Plot' : 'Unit',
});

// ─── Unit Cell ────────────────────────────────────────────────────────────────
const UnitCell = ({ unit, onClick, onDelete }: { unit: Unit; onClick: () => void; onDelete: (id: string) => void }) => {
  const cfg = UNIT_STATUS_CFG[unit.status] || UNIT_STATUS_CFG.AVAILABLE;
  return (
    <Tooltip title={
      <Box>
        <Typography variant="caption" fontWeight={800}>{unit.unitNumber}</Typography><br />
        <Typography variant="caption">Type: {UNIT_TYPE_LABELS[unit.unitType] || unit.unitType}</Typography><br />
        <Typography variant="caption">Area: {unit.carpetArea} sq.ft</Typography><br />
        {unit.builtUpArea && <Typography variant="caption">Built-up: {unit.builtUpArea} sq.ft</Typography>}
        {unit.superArea && <Typography variant="caption">Super: {unit.superArea} sq.ft</Typography>}
        <Typography variant="caption" fontWeight={800} display="block" mt={0.5}>{fmtPrice(unit.price)}</Typography>
        <Button size="small" color="error" onClick={(e) => { e.stopPropagation(); onDelete(unit.id); }} sx={{ mt: 1, fontSize: 9, textTransform: 'none', py: 0, color: '#fff', bgcolor: 'rgba(255,255,255,0.1)', height: 20 }}>Delete</Button>
      </Box>
    } arrow placement="top">
      <Box
        onClick={onClick}
        sx={{
          width: 52, height: 44, borderRadius: 2,
          bgcolor: cfg.bg, border: `2px solid ${cfg.color}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer',
          transition: 'all .15s',
          '&:hover': { transform: 'scale(1.08)', boxShadow: `0 4px 12px ${cfg.color}44`, zIndex: 2 },
          position: 'relative'
        }}>
        <Typography sx={{ fontSize: 9, fontWeight: 800, color: cfg.color, lineHeight: 1 }}>
          {unit.unitNumber}
        </Typography>
        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: cfg.color, mt: 0.5 }} />
      </Box>
    </Tooltip>
  );
};

// ─── Floor Row ────────────────────────────────────────────────────────────────
const FloorRow = ({ floor, onUnitClick, onAddUnit, onDeleteUnit }: { floor: Floor; onUnitClick: (u: Unit) => void; onAddUnit: (f: Floor) => void; onDeleteUnit: (id: string) => void }) => (
  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
    <Box sx={{ width: 72, flexShrink: 0 }}>
      <Typography variant="caption" fontWeight={800} color="text.secondary">
        {floor.name}
      </Typography>
    </Box>
    <Stack direction="row" flexWrap="wrap" spacing={0.75} sx={{ flex: 1, alignItems: 'center' }}>
      {floor.units.map(u => (
        <UnitCell key={u.id} unit={u} onClick={() => onUnitClick(u)} onDelete={onDeleteUnit} />
      ))}
      <Tooltip title="Add Unit to this level">
        <IconButton size="small" onClick={() => onAddUnit(floor)} sx={{ border: '1px dashed #cbd5e1', width: 32, height: 32 }}>
          <AddOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
        </IconButton>
      </Tooltip>
      {floor.units.length === 0 && (
        <Typography variant="caption" color="text.secondary">Empty Level</Typography>
      )}
    </Stack>
    <Box sx={{ textAlign: 'right', flexShrink: 0, minWidth: 60 }}>
      <Typography variant="caption" color="text.secondary">
        {floor.units.filter(u => u.status === 'AVAILABLE').length}/{floor.units.length} avail.
      </Typography>
    </Box>
  </Stack>
);

// ─── Unit Edit Dialog ─────────────────────────────────────────────────────────
const UnitEditDialog = ({
  unit, open, onClose, onSave,
}: { unit: Unit | null; open: boolean; onClose: () => void; onSave: () => void }) => {
  const [form, setForm] = useState<Partial<Unit>>({});
  const [saving, setSaving] = useState(false);

  React.useEffect(() => { if (unit) setForm({ ...unit }); }, [unit]);

  const set = (k: keyof Unit, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/inventory/units/${unit?.id}`, form);
      onSave(); onClose();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between' }}>
        Unit {unit?.unitNumber}
        <IconButton size="small" onClick={onClose}><CloseOutlined /></IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={6}>
            <TextField fullWidth label="Unit Number" size="small" value={form.unitNumber ?? ''}
              onChange={e => set('unitNumber', e.target.value)} />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Unit Type</InputLabel>
              <Select value={form.unitType ?? ''} label="Unit Type"
                onChange={e => set('unitType', e.target.value)}>
                {UNIT_TYPES.map(t => <MenuItem key={t} value={t}>{UNIT_TYPE_LABELS[t] || t}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={form.status ?? 'AVAILABLE'} label="Status"
                onChange={e => set('status', e.target.value as UnitStatus)}>
                {Object.entries(UNIT_STATUS_CFG).map(([k, v]) => (
                  <MenuItem key={k} value={k}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: v.color }} />
                      {v.label}
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Facing</InputLabel>
              <Select value={form.facing ?? ''} label="Facing"
                onChange={e => set('facing', e.target.value)}>
                <MenuItem value=""><em>Not specified</em></MenuItem>
                {FACING_OPTIONS.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
           {[
            { key: 'carpetArea', label: 'Carpet Area (sq.ft)' },
            { key: 'builtUpArea', label: 'Built-up Area (sq.ft)' },
            { key: 'superArea', label: 'Super Area (sq.ft)' },
            { key: 'price', label: 'Total Price (₹)' },
          ].map(({ key, label }) => (
            <Grid item xs={6} key={key}>
              <TextField fullWidth label={label} size="small" type="number"
                value={(form as any)[key] ?? ''}
                onChange={e => set(key as keyof Unit, Number(e.target.value) || undefined)}
                helperText={key === 'price' && (form as any)[key] ? fmtPrice((form as any)[key]) : undefined} />
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none' }}>Cancel</Button>
        <Button variant="contained" disableElevation onClick={handleSave} disabled={saving}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
          {saving ? <CircularProgress size={18} color="inherit" /> : 'Save Unit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Bulk Status Dialog ──────────────────────────────────────────────────────
const BulkStatusDialog = ({
  tower, open, onClose, onSave,
}: { tower: Tower | null; open: boolean; onClose: () => void; onSave: () => void }) => {
  const [status, setStatus] = useState<UnitStatus>('AVAILABLE');
  const [updating, setUpdating] = useState(false);

  const handleBulkUpdate = async () => {
    if (!tower) return;
    setUpdating(true);
    try {
      // We could have a backend endpoint for this, but for now we loop
      const units = tower.floors.flatMap(f => f.units);
      await Promise.all(units.map(u => api.put(`/inventory/units/${u.id}`, { status })));
      onSave(); onClose();
    } catch (e) { console.error(e); }
    finally { setUpdating(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ fontWeight: 800 }}>Bulk Update Status: {tower?.name}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Change status for all <strong>{tower?.floors.flatMap(f => f.units).length}</strong> units in this block.
        </Typography>
        <FormControl fullWidth size="small">
          <InputLabel>Target Status</InputLabel>
          <Select value={status} label="Target Status" onChange={e => setStatus(e.target.value as UnitStatus)}>
            {Object.entries(UNIT_STATUS_CFG).map(([k, v]) => (
              <MenuItem key={k} value={k}>{v.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button variant="contained" disableElevation onClick={handleBulkUpdate} disabled={updating}>
          {updating ? <CircularProgress size={18} /> : 'Update All Units'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
const TowerSection = ({
  tower, propertyType, onRefresh,
}: { tower: Tower; propertyType: string; onRefresh: () => void }) => {
  const isLand = propertyType === 'LAND';
  const labels = getLabels(isLand);
  const [expanded, setExpanded] = useState(true);
  const [editUnit, setEditUnit] = useState<Unit | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [bulkOpen, setBulkOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [newName, setNewName] = useState(tower.name);

  const allUnits = tower.floors.flatMap(f => f.units);
  const stats = useMemo(() => ({
    available: allUnits.filter(u => u.status === 'AVAILABLE').length,
    booked: allUnits.filter(u => u.status === 'BOOKED').length,
    hold: allUnits.filter(u => u.status === 'HOLD').length,
    reserved: allUnits.filter(u => u.status === 'RESERVED').length,
    blocked: allUnits.filter(u => u.status === 'BLOCKED').length,
    sold: allUnits.filter(u => u.status === 'SOLD').length,
    maintenance: allUnits.filter(u => u.status === 'UNDER_MAINTENANCE').length,
    total: allUnits.length,
  }), [allUnits]);

  return (
    <Box sx={{ mb: 3 }}>
      {/* Tower Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between"
        sx={{
          px: 2.5, py: 1.75, bgcolor: isLand ? '#065f46' : '#1e293b', borderRadius: expanded ? '12px 12px 0 0' : 3,
          cursor: 'pointer', transition: 'all .2s',
          '&:hover': { bgcolor: isLand ? '#047857' : '#334155' }
        }}
        onClick={() => setExpanded(!expanded)}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: isLand ? '#10b981' : 'primary.main', width: 32, height: 32 }}>
            {isLand ? '🌍' : '🏢'}
          </Avatar>
          <Box>
            <Typography variant="body1" fontWeight={800} color="#fff">{labels.tower} {tower.name}</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              {tower.floors.length} {labels.floor}s · {stats.total} {labels.unit}s
            </Typography>
          </Box>
        </Stack>
          <Stack direction="row" alignItems="center" spacing={2}>
            {/* Status mini badges */}
            <Stack direction="row" spacing={1}>
              {Object.entries(UNIT_STATUS_CFG).map(([k, v]) => {
                const count = allUnits.filter(u => u.status === k).length;
                if (!count) return null;
                return (
                  <Box key={k} sx={{
                    display: 'flex', alignItems: 'center', gap: 0.5, px: 1.25, py: 0.3,
                    borderRadius: 8, bgcolor: v.bg
                  }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: v.color }} />
                    <Typography sx={{ fontSize: 11, fontWeight: 800, color: v.color }}>{count}</Typography>
                  </Box>
                );
              })}
            </Stack>
            <Button size="small" variant="outlined" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)', textTransform: 'none' }} 
              onClick={(e) => { e.stopPropagation(); setBulkOpen(true); }}>Bulk Status</Button>
            <IconButton size="small" sx={{ color: '#94a3b8' }} onClick={(e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); }}>
              <MoreVertOutlined />
            </IconButton>
            <IconButton size="small" sx={{ color: '#94a3b8' }}>
              {expanded ? <ExpandLessOutlined /> : <ExpandMoreOutlined />}
            </IconButton>
          </Stack>
        </Stack>

        <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
          <MenuItem onClick={() => { setMenuAnchor(null); setRenameOpen(true); }}>
            <EditOutlined sx={{ fontSize: 18, mr: 1 }} /> Rename {labels.tower}
          </MenuItem>
          <MenuItem sx={{ color: 'error.main' }} onClick={async () => {
            if (window.confirm(`Are you sure you want to delete this ${labels.tower} and all its ${labels.unit}s?`)) {
              try { await api.delete(`/inventory/towers/${tower.id}`); onRefresh(); } catch (e) { console.error(e); }
            }
            setMenuAnchor(null);
          }}>
            <DeleteOutlineOutlined sx={{ fontSize: 18, mr: 1 }} /> Delete
          </MenuItem>
        </Menu>

      {/* Tower Body */}
      <Collapse in={expanded}>
        <Paper variant="outlined" sx={{ borderTop: 'none', borderRadius: '0 0 12px 12px', p: 2, bgcolor: '#fafafa' }}>
          {/* Legend */}
          <Stack direction="row" spacing={2} mb={2} flexWrap="wrap">
            {Object.entries(UNIT_STATUS_CFG).map(([k, v]) => (
              <Stack key={k} direction="row" alignItems="center" spacing={0.75}>
                <Box sx={{ width: 14, height: 14, borderRadius: 1, bgcolor: v.bg, border: `2px solid ${v.color}` }} />
                <Typography variant="caption" fontWeight={700} color={v.color}>{v.label}</Typography>
              </Stack>
            ))}
          </Stack>

          {/* Floors */}
          <Box>
            {[...tower.floors].reverse().map(floor => (
              <FloorRow 
                key={floor.id} 
                floor={floor} 
                onUnitClick={setEditUnit}
                onAddUnit={async (f) => {
                  try {
                    await api.post('/inventory/units', {
                      floorId: f.id,
                      unitNumber: `${f.floorNumber}0${f.units.length + 1}`,
                      unitType: f.units[0]?.unitType || 'RESIDENTIAL',
                      status: 'AVAILABLE',
                      carpetArea: f.units[0]?.carpetArea || 1000,
                      price: f.units[0]?.price || 5000000,
                    });
                    onRefresh();
                  } catch (e) { console.error(e); }
                }}
                onDeleteUnit={async (id) => {
                  if (window.confirm('Are you sure you want to delete this unit?')) {
                    try {
                      await api.delete(`/inventory/units/${id}`);
                      onRefresh();
                    } catch (e) { console.error(e); }
                  }
                }}
              />
            ))}
            {tower.floors.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                No floors/levels configured
              </Typography>
            )}
          </Box>
        </Paper>
      </Collapse>

      <UnitEditDialog unit={editUnit} open={!!editUnit}
        onClose={() => setEditUnit(null)} onSave={onRefresh} />
      <BulkStatusDialog tower={tower} open={bulkOpen} onClose={() => setBulkOpen(false)} onSave={onRefresh} />

      <Dialog open={renameOpen} onClose={() => setRenameOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Rename {tower.name}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="New Name" size="small" sx={{ mt: 1 }}
            value={newName} onChange={e => setNewName(e.target.value)} autoFocus />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRenameOpen(false)} color="inherit">Cancel</Button>
          <Button variant="contained" disableElevation onClick={async () => {
            try { await api.put(`/inventory/towers/${tower.id}`, { name: newName }); onRefresh(); setRenameOpen(false); } catch (e) { console.error(e); }
          }}>Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ─── Tower Form Dialog ────────────────────────────────────────────────────────
export const TowerFormDialog = ({
  open, onClose, projectId, propertyType, onSave,
}: { open: boolean; onClose: () => void; projectId: string; propertyType: PropertyType; onSave: () => void }) => {
  const isLand = propertyType === 'LAND';
  const labels = getLabels(isLand);
  const [form, setForm] = useState({ name: '', totalFloors: 1, totalUnits: 0, description: '' });
  const [generating, setGenerating] = useState(false);
  const [unitsPerFloor, setUnitsPerFloor] = useState(4);
  const [prefix, setPrefix] = useState('');
  const [skipNumbers, setSkipNumbers] = useState(''); // e.g. "4,13"

  const handleCreate = async () => {
    setGenerating(true);
    try {
      const tRes = await api.post('/inventory/towers', { ...form, projectId });
      const towerId = tRes.data.data.id;
      const skipSet = new Set(skipNumbers.split(',').map(s => s.trim()).filter(Boolean));
      // Auto-generate floors and units
      for (let f = 1; f <= form.totalFloors; f++) {
        const floorRes = await api.post('/inventory/floors', {
          number: f,
          name: isLand ? `Lane ${f}` : (f === 0 ? 'Ground Floor' : `Floor ${f}`),
          towerId, unitsPerFloor,
        });
        const floorId = floorRes.data.data.id;
        for (let u = 1; u <= unitsPerFloor; u++) {
          let unitNum = `${f}${String(u).padStart(2, '0')}`;
          if (skipSet.has(unitNum)) continue; // Skip specific numbers
          
          await api.post('/inventory/units', {
            floorId, unitNumber: prefix ? `${prefix}${unitNum}` : unitNum,
            unitType: isLand ? 'PLOT' : 'TWO_BHK',
            status: 'AVAILABLE',
            carpetArea: isLand ? 1200 : 1000, price: isLand ? 2500000 : 5000000,
          });
        }
      }
      onSave(); onClose();
    } catch (e) { console.error(e); }
    finally { setGenerating(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 4 } }}>
       <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between' }}>
        Add Tower / Block / Phase
        <IconButton size="small" onClick={onClose}><CloseOutlined /></IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <Stack direction="row" spacing={2}>
            <TextField fullWidth label={`${labels.tower} Name *`} size="small"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder={`e.g. ${isLand ? 'Block A, Phase 1' : 'Tower A, Wing 1'}`} />
            <TextField fullWidth label={`Total ${labels.floor}s`} size="small" type="number"
              value={form.totalFloors} onChange={e => setForm(f => ({ ...f, totalFloors: Number(e.target.value) }))} />
          </Stack>
          <TextField fullWidth label="Description" size="small" multiline rows={2}
            value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />

          <Divider />
          <Typography variant="body2" fontWeight={800}>Auto-generate {labels.unit}s</Typography>
          <Typography variant="caption" color="text.secondary">
            Automatically create {labels.floor}s and {isLand ? 'plots' : 'units'} with sequential numbering.
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField label={`${isLand ? 'Plots' : 'Units'} per ${labels.floor}`} size="small" type="number"
              value={unitsPerFloor} onChange={e => setUnitsPerFloor(Number(e.target.value))}
              sx={{ width: 140 }} />
            <TextField label="Prefix" size="small" placeholder="e.g. A-"
              value={prefix} onChange={e => setPrefix(e.target.value)}
              sx={{ width: 100 }} />
            <TextField label="Skip Nos." size="small" placeholder="4, 13"
              value={skipNumbers} onChange={e => setSkipNumbers(e.target.value)}
              sx={{ flex: 1 }} />
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Estimated creation: up to {form.totalFloors * unitsPerFloor} units
          </Typography>
        </Stack>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none' }}>Cancel</Button>
        <Button variant="contained" disableElevation onClick={handleCreate} disabled={generating || !form.name}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
          {generating ? <CircularProgress size={18} color="inherit" /> : 'Create & Generate Units'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Inventory Grid Main Component ───────────────────────────────────────────
interface InventoryGridProps {
  towers: Tower[];
  projectId: string;
  propertyType: PropertyType;
  onRefresh: () => void;
}

const InventoryGrid: React.FC<InventoryGridProps> = ({ towers, projectId, propertyType, onRefresh }) => {
  const [addTowerOpen, setAddTowerOpen] = useState(false);
  const isLand = propertyType === 'LAND';
  const labels = getLabels(isLand);
  const towerLabel = labels.tower;

  const allUnits = towers.flatMap(t => t.floors.flatMap(f => f.units));
  const total = allUnits.length;

  return (
    <Box>
      {/* Summary bar */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3} alignItems={{ sm: 'center' }} justifyContent="space-between">
        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          {Object.entries(UNIT_STATUS_CFG).map(([k, v]) => {
            const count = allUnits.filter(u => u.status === k).length;
            const pct = total ? Math.round(count / total * 100) : 0;
            return (
              <Paper key={k} variant="outlined" sx={{ px: 2, py: 1, borderRadius: 3, borderColor: v.color + '44' }}>
                <Typography variant="h6" fontWeight={900} sx={{ color: v.color, lineHeight: 1 }}>{count}</Typography>
                <Typography variant="caption" fontWeight={700} sx={{ color: v.color }}>{v.label}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{pct}%</Typography>
              </Paper>
            );
          })}
        </Stack>
        <Button variant="outlined" startIcon={<AddOutlined />}
          onClick={() => setAddTowerOpen(true)}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 3, whiteSpace: 'nowrap' }}>
          Add {towerLabel}
        </Button>
      </Stack>

      {/* Towers */}
      {towers.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 6, borderRadius: 3, textAlign: 'center', borderStyle: 'dashed' }}>
          <ApartmentOutlined sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" fontWeight={800} color="text.secondary">No {isLand ? 'blocks' : 'towers'} yet</Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>Add your first {isLand ? 'block or phase' : 'tower or wing'} to get started</Typography>
          <Button variant="contained" disableElevation startIcon={<AddOutlined />}
            onClick={() => setAddTowerOpen(true)}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 3 }}>
            Add First {isLand ? 'Block' : 'Tower'}
          </Button>
        </Paper>
      ) : (
        towers.map(tower => (
          <TowerSection key={tower.id} tower={tower} propertyType={propertyType} onRefresh={onRefresh} />
        ))
      )}

      <TowerFormDialog
        open={addTowerOpen} onClose={() => setAddTowerOpen(false)}
        projectId={projectId} propertyType={propertyType} onSave={onRefresh}
      />
    </Box>
  );
};

export default InventoryGrid;