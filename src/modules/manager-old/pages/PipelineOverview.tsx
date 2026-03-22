import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  AvatarGroup,
  LinearProgress,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchTeamPipeline } from '../services/managerSlice';

const PipelineOverview: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { teamPipeline, loading } = useSelector((state: RootState) => state.manager);

  useEffect(() => {
    dispatch(fetchTeamPipeline());
  }, [dispatch]);

  if (loading.pipeline && teamPipeline.length === 0) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Sales Pipeline
        </Typography>
        <Typography color="text.secondary">
          Monitor the deal flow across all stages for your entire team.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: 3,
          overflowX: 'auto',
          pb: 2,
          minHeight: 'calc(100vh - 250px)',
          '&::-webkit-scrollbar': { height: 8 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 4 },
        }}
      >
        {teamPipeline.map((column) => (
          <Box
            key={column.status}
            sx={{
              minWidth: 320,
              width: 320,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 1,
                mb: 1,
              }}
            >
              <Typography variant="subtitle2" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {column.status}
                <Chip
                  label={column.count}
                  size="small"
                  sx={{ height: 20, fontSize: 10, fontWeight: 800, bgcolor: 'rgba(0,0,0,0.05)' }}
                />
              </Typography>
            </Box>

            {column.leads.map((lead: any) => (
              <Card
                key={lead.id}
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  borderColor: 'divider',
                  '&:hover': { boxShadow: 2, cursor: 'pointer' },
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="body2" fontWeight={700} gutterBottom>
                    {lead.customerName}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 1.5 }}>
                    <Box>
                      <Typography variant="caption" color="text.disabled" sx={{ display: 'block' }}>
                        Agent
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: 10 }}>
                          {lead.ownerAgent?.name?.[0] || '?'}
                        </Avatar>
                        <Typography variant="caption" fontWeight={600}>
                          {lead.ownerAgent?.name || 'Unassigned'}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="caption" color="text.disabled">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default PipelineOverview;
