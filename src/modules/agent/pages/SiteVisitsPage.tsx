// src/modules/agent/pages/SiteVisitsPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Grid, Typography, Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AddOutlined, CalendarMonthOutlined, CheckCircleOutlined, PendingActionsOutlined } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, A } from '../hooks';
import { fetchVisits, doUpdateVisit } from '../store/agentSlice';
import { PageHeader, VisitCard, StatCard, Loader } from '../components/ui';
import ScheduleVisitDialog from './SiteVisits/ScheduleVisitDialog';
import { VISIT_STATUS_CFG } from './SiteVisits/visitTypes';

export default function SiteVisitsPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { visits, loading } = useAppSelector(s=>s.agent);
  const [open,   setOpen]   = useState(false);
  const [status, setStatus] = useState('');
  const busy = !!loading.visits;

  useEffect(()=>{ 
    dispatch(fetchVisits({ status:status||undefined })); 
  },[dispatch,status]);

  const handleUpdate = (id:string, s:string, outcome?:string) => {
    dispatch(doUpdateVisit({ id, status: s, outcome })).then((res: any) => {
        dispatch(fetchVisits({ status:status||undefined }));
        
        // If booking initiated, redirect to bookings page with lead details
        if (s === 'COMPLETED' && outcome === 'BOOKING_INITIATED') {
          const v = visits.data.find(x => x.id === id);
          if (v) {
            navigate('/agent/bookings', { 
              state: { 
                prefill: {
                  leadId: v.leadId,
                  unitId: v.unitId || '',
                  customerName: v.lead?.customerName || '',
                  customerPhone: v.lead?.customerPhone || '',
                  customerEmail: (v.lead as any)?.customerEmail || '',
                  projectId: v.projectId || '',
                }
              } 
            });
          }
        }
    });
  };

  const scheduled  = visits.data.filter(v=>v.status==='CONFIRMED').length;
  const pending    = visits.data.filter(v=>['REQUESTED','PENDING_CONFIRMATION'].includes(v.status)).length;
  const completed  = visits.data.filter(v=>v.status==='COMPLETED').length;

  return (
    <Box>
      <PageHeader 
        title="Site Visits" 
        subtitle={`${visits.total} visits recorded`}
        action={
          <Button 
            variant="contained" 
            startIcon={<AddOutlined/>} 
            size="small" 
            onClick={()=>setOpen(true)}
            sx={{ bgcolor:A.primary, textTransform:'none', fontWeight:700, borderRadius:'10px', px:2 }}
          >
            New Visit
          </Button>
        }
      />

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={4}>
          <StatCard 
            label="Confirmed" 
            value={scheduled} 
            accent={A.amber} 
            icon={<CalendarMonthOutlined/>} 
            loading={busy}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard 
            label="Pending" 
            value={pending} 
            accent={A.primary} 
            icon={<PendingActionsOutlined/>} 
            loading={busy}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard 
            label="Completed" 
            value={completed} 
            accent={A.green} 
            icon={<CheckCircleOutlined/>} 
            loading={busy}
          />
        </Grid>
      </Grid>

      <Box display="flex" gap={1} mb={3} flexWrap="wrap">
        <Button 
          size="small" 
          onClick={()=>setStatus('')}
          sx={{ 
            textTransform:'none', fontSize:12, borderRadius:'20px', px:2,
            bgcolor:status==='' ? `${A.primary}15` : 'transparent',
            color:status==='' ? A.primary : A.textSub,
            border:`1px solid ${status==='' ? `${A.primary}40` : A.border}` 
          }}
        >
          All
        </Button>
        {Object.entries(VISIT_STATUS_CFG).map(([key, cfg]) => (
          <Button 
            key={key} 
            size="small" 
            onClick={()=>setStatus(key)}
            sx={{ 
              textTransform:'none', fontSize:12, borderRadius:'20px', px:2,
              bgcolor:status===key ? `${cfg.color}15` : 'transparent',
              color:status===key ? cfg.color : A.textSub,
              border:`1px solid ${status===key ? `${cfg.color}40` : A.border}` 
            }}
          >
            {cfg.label}
          </Button>
        ))}
      </Box>

      {busy && visits.data.length === 0 ? (
        <Loader />
      ) : (
        <Grid container spacing={2}>
          {visits.data.map(v => (
            <Grid item xs={12} sm={6} md={4} key={v.id}>
              <VisitCard 
                visit={v} 
                onUpdate={handleUpdate}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {visits.data.length === 0 && !busy && (
        <Box py={10} textAlign="center" sx={{ bgcolor:A.surface, borderRadius:'18px', border:`1px solid ${A.border}` }}>
          <CalendarMonthOutlined sx={{ fontSize:48, color:A.muted, mb:1.5 }} />
          <Typography sx={{ color:A.textSub, fontSize:15, fontWeight:500 }}>No site visits found</Typography>
          <Typography sx={{ color:A.muted, fontSize:13 }}>Try changing the filters or schedule a new one</Typography>
        </Box>
      )}

      <ScheduleVisitDialog 
        open={open}
        onClose={() => setOpen(false)}
        onSave={() => {
          setOpen(false);
          setStatus(''); // Reset status to All to show the newly created visit
          dispatch(fetchVisits({ status: undefined }));
        }}
      />
    </Box>
  );
}
