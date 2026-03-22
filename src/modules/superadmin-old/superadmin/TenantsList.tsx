import React, { useEffect } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useSuperAdmin } from '../../../redux/hooks';
import { fetchTenants, setFilters, setPage, setPageSize } from './superadminSlice';
import TenantTable from '/components/TenantTable';

const FONT = "'Clash Display', 'Outfit', sans-serif";
const BODY = "'Cabinet Grotesk', 'DM Sans', sans-serif";
const BRAND = '#00d4aa';

const TenantsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { tenants, loading, filters, pagination } = useSuperAdmin();

  useEffect(() => {
    dispatch(fetchTenants({ page: pagination.page, pageSize: pagination.pageSize, filters }));
  }, [dispatch, pagination.page, pagination.pageSize, filters]);

  return (
    <Box sx={{ bgcolor: '#080b10', minHeight: '100vh', pb: 8, fontFamily: BODY }}>

      {/* ── Header ── */}
      <Box sx={{ px: { xs: 3, md: 5 }, pt: 5, pb: 4, borderBottom: '1px solid #1e2630', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', bgcolor: BRAND + '07', filter: 'blur(50px)', pointerEvents: 'none' }} />
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'flex-end' }} spacing={3} sx={{ position: 'relative' }}>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
              <Box sx={{ px: 1.5, py: 0.4, borderRadius: 1.5, bgcolor: BRAND + '18', border: `1px solid ${BRAND}30` }}>
                <Typography sx={{ fontFamily: BODY, fontSize: 10, fontWeight: 800, color: BRAND, textTransform: 'uppercase', letterSpacing: 1.2 }}>
                  Tenant Management
                </Typography>
              </Box>
            </Stack>
            <Typography sx={{ fontFamily: FONT, fontSize: 36, fontWeight: 700, color: 'white', letterSpacing: -1.8, lineHeight: 1 }}>
              Tenants
            </Typography>
            <Typography sx={{ fontFamily: BODY, fontSize: 13, color: '#4b5563', mt: 0.8 }}>
              Manage all platform tenants · {pagination.total ?? '—'} total
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            {pagination.total != null && (
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8, px: 2, py: 0.8, borderRadius: 10, border: `1px solid ${BRAND}30`, bgcolor: BRAND + '10' }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: BRAND }} />
                <Typography sx={{ fontFamily: BODY, fontSize: 12, fontWeight: 800, color: BRAND }}>{pagination.total} Total</Typography>
              </Box>
            )}
          </Stack>
        </Stack>
      </Box>

      {/* ── TenantTable — preserved exactly, wrapped in dark style overrides ── */}
      <Box sx={{ px: { xs: 3, md: 5 }, pt: 4 }}>
        <Box sx={{
          // Dark theme cascade for your existing TenantTable component
          '& .MuiPaper-root, & .MuiCard-root': {
            bgcolor: '#0d1117 !important',
            border: '1px solid #1e2630 !important',
            boxShadow: 'none !important',
            borderRadius: '12px !important',
          },
          '& .MuiTableHead-root .MuiTableRow-root': { bgcolor: '#080b10 !important' },
          '& .MuiTableCell-head': {
            fontWeight: '800 !important',
            fontSize: '10.5px !important',
            color: '#4b5563 !important',
            textTransform: 'uppercase !important',
            letterSpacing: '0.8px !important',
            fontFamily: `${BODY} !important`,
            borderBottom: '1px solid #1e2630 !important',
          },
          '& .MuiTableCell-body': {
            color: '#9ca3af !important',
            fontFamily: `${BODY} !important`,
            borderColor: '#1e2630 !important',
          },
          '& .MuiTableRow-root:hover': { bgcolor: '#111827 !important' },
          '& .MuiInputBase-root': {
            bgcolor: '#1e2630 !important',
            borderRadius: '10px !important',
            color: 'white !important',
          },
          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1e2630 !important' },
          '& .MuiInputLabel-root': { color: '#4b5563 !important' },
          '& .MuiSelect-icon': { color: '#4b5563 !important' },
          '& .MuiTablePagination-root': { color: '#4b5563 !important', borderTop: '1px solid #1e2630 !important', bgcolor: '#080b10 !important' },
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { color: '#4b5563 !important' },
          '& .MuiIconButton-root': { color: '#4b5563 !important', '&:hover': { color: `${BRAND} !important` } },
          '& .MuiChip-root': { fontFamily: `${BODY} !important` },
          '& .MuiAvatar-root': { fontFamily: `${BODY} !important` },
        }}>
          <TenantTable
            tenants={tenants}
            total={pagination.total}
            page={pagination.page}
            pageSize={pagination.pageSize}
            loading={loading.tenants}
            search={filters.search}
            statusFilter={filters.status}
            planFilter={filters.plan}
            onPageChange={p => dispatch(setPage(p + 1))}
            onPageSizeChange={s => dispatch(setPageSize(s))}
            onSearchChange={v => dispatch(setFilters({ search: v }))}
            onStatusChange={v => dispatch(setFilters({ status: v as typeof filters.status }))}
            onPlanChange={v => dispatch(setFilters({ plan: v as typeof filters.plan }))}
            onTenantClick={id => navigate(`/superadmin/tenants/${id}`)}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default TenantsList;