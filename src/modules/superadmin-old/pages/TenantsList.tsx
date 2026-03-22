import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useSuperAdmin } from '../../../redux/hooks';
import { fetchTenants, setFilters, setPage, setPageSize } from './superadminSlice';
import TenantTable from '../components/TenantTable';

const TenantsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { tenants, loading, filters, pagination } = useSuperAdmin();

  useEffect(() => {
    dispatch(fetchTenants({ page: pagination.page, pageSize: pagination.pageSize, filters }));
  }, [dispatch, pagination.page, pagination.pageSize, filters]);

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700}>Tenants</Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Manage all platform tenants
        </Typography>
      </Box>

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
  );
};

export default TenantsList;