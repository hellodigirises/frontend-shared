// src/modules/hr/pages/LeaveRequestsPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Grid, TextField, Select, MenuItem,
  FormControl, InputLabel, Typography, Chip, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Switch,
} from '@mui/material';
import { Add, CheckCircle, Cancel } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, H, DATE, fieldSx, labelSx, selectFieldSx } from '../hooks';
import { fetchLeaves, doRequestLeave, doApproveLeave, doRejectLeave, type LeaveRequest } from '../store/hrSlice';
import { PageHeader, Card, DataTable, StatCard, StatusChip, EmployeeAvatar } from '../components/ui';
import { BeachAccess } from '@mui/icons-material';

const LEAVE_TYPES = ['CASUAL','SICK','EARNED','MATERNITY','PATERNITY','UNPAID'];

function LeaveForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dispatch = useAppDispatch();
  const [f, setF] = useState({
    leaveType:'CASUAL', startDate:'', endDate:'', reason:'', isHalfDay: false,
  });
  const set = (k: string, v: any) => setF(p => ({ ...p, [k]: v }));

  const submit = () => {
    dispatch(doRequestLeave(f));
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { bgcolor:H.surface, border:`1px solid ${H.border}`, borderRadius:'14px' } }}>
      <DialogTitle sx={{ color:H.text, fontWeight:700, fontSize:15, pb:1 }}>Request Leave</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} mt={0.25}>
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel sx={labelSx}>Leave Type</InputLabel>
              <Select value={f.leaveType} label="Leave Type" onChange={e => set('leaveType',e.target.value)} sx={selectFieldSx}>
                {LEAVE_TYPES.map(t => <MenuItem key={t} value={t} sx={{ fontSize:13 }}>{t}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="Start Date" type="date"
              value={f.startDate} onChange={e => set('startDate',e.target.value)}
              sx={fieldSx} InputLabelProps={{ sx:{...labelSx,shrink:true} }} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="End Date" type="date"
              value={f.endDate} onChange={e => set('endDate',e.target.value)}
              sx={fieldSx} InputLabelProps={{ sx:{...labelSx,shrink:true} }} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth size="small" label="Reason *" multiline rows={3}
              value={f.reason} onChange={e => set('reason',e.target.value)}
              sx={fieldSx} InputLabelProps={{ sx:labelSx }} />
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={1}>
              <Switch checked={f.isHalfDay} onChange={e => set('isHalfDay',e.target.checked)}
                sx={{ '& .Mui-checked + .MuiSwitch-track': { bgcolor:`${H.primary} !important` } }} />
              <Typography sx={{ color:H.textSub, fontSize:13 }}>Half Day</Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px:3, pb:2.5, gap:1 }}>
        <Button onClick={onClose} sx={{ color:H.textSub, textTransform:'none', fontSize:13 }}>Cancel</Button>
        <Button variant="contained" disabled={!f.startDate || !f.reason} onClick={submit}
          sx={{ bgcolor:H.primary, textTransform:'none', fontWeight:600, borderRadius:'8px', fontSize:13 }}>
          Submit Request
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function LeaveRequestsPage() {
  const dispatch = useAppDispatch();
  const { leaves, loading } = useAppSelector(s => s.hr);
  const [status, setStatus] = useState('');
  const [open,   setOpen]   = useState(false);
  const busy = !!loading.leaves;

  useEffect(() => {
    dispatch(fetchLeaves({ status: status || undefined, take: 50 }));
  }, [dispatch, status]);

  const pending  = leaves.data.filter(l => l.status === 'PENDING').length;
  const approved = leaves.data.filter(l => l.status === 'APPROVED').length;
  const rejected = leaves.data.filter(l => l.status === 'REJECTED').length;

  const cols = [
    { label:'Employee', render:(r:LeaveRequest) => (
      <Box display="flex" alignItems="center" gap={1.5}>
        <EmployeeAvatar name={r.employee?.name ?? '?'} avatarUrl={r.employee?.avatarUrl} size={28} />
        <Box>
          <Typography sx={{ color:H.text, fontSize:12.5, fontWeight:500 }}>{r.employee?.name ?? '—'}</Typography>
          <Typography sx={{ color:H.textSub, fontSize:11 }}>{r.employee?.department}</Typography>
        </Box>
      </Box>
    )},
    { label:'Type',   render:(r:LeaveRequest) => (
      <Chip label={r.leaveType} size="small" sx={{ fontSize:10, height:20, bgcolor:`rgba(139,92,246,0.1)`, color:H.purple }} />
    )},
    { label:'From',   render:(r:LeaveRequest) => <Typography sx={{ color:H.text,    fontSize:12 }}>{DATE(r.startDate)}</Typography> },
    { label:'To',     render:(r:LeaveRequest) => <Typography sx={{ color:H.text,    fontSize:12 }}>{DATE(r.endDate)}</Typography> },
    { label:'Days',   render:(r:LeaveRequest) => <Typography sx={{ color:H.text,    fontSize:12 }}>{r.totalDays} {r.isHalfDay ? '(½)' : ''}</Typography> },
    { label:'Reason', render:(r:LeaveRequest) => (
      <Typography sx={{ color:H.textSub, fontSize:12, maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.reason}</Typography>
    )},
    { label:'Status', render:(r:LeaveRequest) => <StatusChip status={r.status} /> },
    { label:'', render:(r:LeaveRequest) => r.status === 'PENDING' ? (
      <Box display="flex" gap={0.25}>
        <Tooltip title="Approve">
          <IconButton size="small" sx={{ color:H.teal }}
            onClick={() => dispatch(doApproveLeave({ id:r.id, actorType:'hr' }))}>
            <CheckCircle sx={{ fontSize:15 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Reject">
          <IconButton size="small" sx={{ color:H.coral }}
            onClick={() => dispatch(doRejectLeave({ id:r.id, actorType:'hr' }))}>
            <Cancel sx={{ fontSize:15 }} />
          </IconButton>
        </Tooltip>
      </Box>
    ) : null},
  ];

  return (
    <Box>
      <PageHeader
        title="Leave Requests"
        subtitle={`${leaves.total} total requests`}
        action={
          <Button variant="contained" startIcon={<Add />} size="small" onClick={() => setOpen(true)}
            sx={{ bgcolor:H.primary, textTransform:'none', fontWeight:600, borderRadius:'8px', fontSize:13 }}>
            New Request
          </Button>
        }
      />

      <Grid container spacing={2} mb={3}>
        {[
          { label:'Pending',  value:pending,  accent:H.amber, icon:<BeachAccess /> },
          { label:'Approved', value:approved, accent:H.teal,  icon:<BeachAccess /> },
          { label:'Rejected', value:rejected, accent:H.coral, icon:<BeachAccess /> },
          { label:'Total',    value:leaves.total, accent:H.primary, icon:<BeachAccess /> },
        ].map(c => <Grid item xs={12} sm={6} md={3} key={c.label}><StatCard {...c} loading={busy} sub={undefined} /></Grid>)}
      </Grid>

      <Box display="flex" gap={1.5} mb={2}>
        <FormControl size="small" sx={{ minWidth:140 }}>
          <InputLabel sx={labelSx}>Filter Status</InputLabel>
          <Select value={status} label="Filter Status" onChange={e => setStatus(e.target.value)} sx={selectFieldSx}>
            <MenuItem value="" sx={{ fontSize:13 }}>All</MenuItem>
            {['PENDING','APPROVED','REJECTED'].map(s => <MenuItem key={s} value={s} sx={{ fontSize:13 }}>{s}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <Card><DataTable columns={cols as any} rows={leaves.data} loading={busy} emptyMsg="No leave requests" /></Card>

      <LeaveForm open={open} onClose={() => setOpen(false)} />
    </Box>
  );
}
