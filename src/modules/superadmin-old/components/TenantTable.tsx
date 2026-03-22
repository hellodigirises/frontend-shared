import React, { useState } from 'react';
import {
  Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Box, Typography, Chip, Avatar, IconButton, Menu, MenuItem,
  TextField, InputAdornment, Select, FormControl, InputLabel, Button,
  Skeleton, Stack, Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FilterListIcon from '@mui/icons-material/FilterList';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import BlockIcon from '@mui/icons-material/Block';
import RefreshIcon from '@mui/icons-material/Refresh';
import type { Tenant, TenantStatus, PlanType } from './superadminSlice';

const statusColors: Record<TenantStatus, { bg: string; color: string }> = {
  active: { bg: '#DCFCE7', color: '#16A34A' },
  trial: { bg: '#FEF9C3', color: '#CA8A04' },
  suspended: { bg: '#FEE2E2', color: '#DC2626' },
  cancelled: { bg: '#F3F4F6', color: '#6B7280' },
};

const planColors: Record<PlanType, string> = {
  starter: '#10B981',
  professional: '#6366F1',
  enterprise: '#F59E0B',
  custom: '#EC4899',
};

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 0 }).format(n);

interface TenantTableProps {
  tenants: Tenant[];
  total: number;
  page: number;
  pageSize: number;
  loading?: boolean;
  search: string;
  statusFilter: string;
  planFilter: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSearchChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onPlanChange: (v: string) => void;
  onTenantClick: (id: string) => void;
}

const TenantTable: React.FC<TenantTableProps> = ({
  tenants, total, page, pageSize, loading,
  search, statusFilter, planFilter,
  onPageChange, onPageSizeChange, onSearchChange,
  onStatusChange, onPlanChange, onTenantClick,
}) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);

  const openMenu = (e: React.MouseEvent<HTMLElement>, id: string) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setSelectedTenant(id);
  };

  return (
    <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      {/* Toolbar */}
      <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
          <Typography variant="h6" fontWeight={600}>Tenants</Typography>
          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            <TextField
              size="small"
              placeholder="Search tenants..."
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment> }}
              sx={{ minWidth: 220 }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={e => onStatusChange(e.target.value)}>
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="trial">Trial</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Plan</InputLabel>
              <Select value={planFilter} label="Plan" onChange={e => onPlanChange(e.target.value)}>
                <MenuItem value="all">All Plans</MenuItem>
                <MenuItem value="starter">Starter</MenuItem>
                <MenuItem value="professional">Professional</MenuItem>
                <MenuItem value="enterprise">Enterprise</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </Select>
            </FormControl>
            <Button variant="outlined" startIcon={<FilterListIcon />} size="small">
              More Filters
            </Button>
          </Stack>
        </Stack>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ '& th': { bgcolor: '#F9FAFB', fontWeight: 600, fontSize: 12, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 } }}>
              <TableCell>Tenant</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">MRR</TableCell>
              <TableCell>Seats</TableCell>
              <TableCell>Country</TableCell>
              <TableCell>Renewal</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}><Skeleton width="80%" height={20} /></TableCell>
                  ))}
                </TableRow>
              ))
              : tenants.map(tenant => (
                <TableRow
                  key={tenant.id}
                  hover
                  onClick={() => onTenantClick(tenant.id)}
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#F9FAFB' } }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 34, height: 34, bgcolor: planColors[tenant.plan] + '22', color: planColors[tenant.plan], fontSize: 14, fontWeight: 700 }}>
                        {tenant.name[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{tenant.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{tenant.email}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={tenant.plan} size="small" sx={{ bgcolor: planColors[tenant.plan] + '18', color: planColors[tenant.plan], fontWeight: 600, textTransform: 'capitalize', fontSize: 11 }} />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={tenant.status}
                      size="small"
                      sx={{ ...statusColors[tenant.status], fontWeight: 600, textTransform: 'capitalize', fontSize: 11 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}>{fmt(tenant.mrr)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{tenant.usedSeats}/{tenant.seats}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{tenant.country}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(tenant.renewalDate).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="More actions">
                      <IconButton size="small" onClick={e => openMenu(e, tenant.id)}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={total}
        page={page}
        rowsPerPage={pageSize}
        onPageChange={(_, p) => onPageChange(p)}
        onRowsPerPageChange={e => onPageSizeChange(Number(e.target.value))}
        rowsPerPageOptions={[10, 25, 50]}
      />

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={() => { onTenantClick(selectedTenant!); setMenuAnchor(null); }}>
          <OpenInNewIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} /> View Details
        </MenuItem>
        <MenuItem onClick={() => setMenuAnchor(null)}>
          <RefreshIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} /> Reset Password
        </MenuItem>
        <MenuItem onClick={() => setMenuAnchor(null)} sx={{ color: 'error.main' }}>
          <BlockIcon fontSize="small" sx={{ mr: 1.5 }} /> Suspend
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default TenantTable;