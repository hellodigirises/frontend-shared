// src/modules/hr/pages/AttendancePage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Button, Grid, TextField, Select, MenuItem, FormControl, InputLabel,
  Typography, Chip,
} from '@mui/material';
import { LoginOutlined, LogoutOutlined } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, H, DATE, TIME, fieldSx, labelSx, selectFieldSx } from '../hooks';
import { fetchAttendance, doCheckIn, doCheckOut } from '../store/hrSlice';
import { PageHeader, Card, DataTable, StatCard, StatusChip } from '../components/ui';
import { People, AccessTime, LateIcon } from '@mui/icons-material';

export default function AttendancePage() {
  const dispatch = useAppDispatch();
  const { attendance, loading } = useAppSelector(s => s.hr);
  const [from, setFrom] = useState('');
  const [to,   setTo]   = useState('');
  const [emp,  setEmp]  = useState('');
  const busy = !!loading.attendance;

  const load = useCallback(() => {
    dispatch(fetchAttendance({
      employeeId: emp  || undefined,
      from      : from || undefined,
      to        : to   || undefined,
      take      : 50,
    }));
  }, [dispatch, emp, from, to]);

  useEffect(() => { load(); }, [load]);

  const present = attendance.data.filter(r => r.status === 'PRESENT').length;
  const absent  = attendance.data.filter(r => r.status === 'ABSENT').length;
  const late    = attendance.data.filter(r => r.isLate).length;

  const cols = [
    { label: 'Employee', render: (r: any) => (
      <Box>
        <Typography sx={{ color: H.text, fontSize: 12.5, fontWeight: 500 }}>{r.employee?.name ?? '—'}</Typography>
        <Typography sx={{ color: H.textSub, fontSize: 11 }}>{r.employee?.department}</Typography>
      </Box>
    )},
    { label: 'Date',      render: (r: any) => <Typography sx={{ color:H.text,    fontSize:12 }}>{DATE(r.date)}</Typography> },
    { label: 'Check In',  render: (r: any) => <Typography sx={{ color:H.text,    fontSize:12 }}>{TIME(r.checkIn)}</Typography> },
    { label: 'Check Out', render: (r: any) => <Typography sx={{ color:H.textSub, fontSize:12 }}>{TIME(r.checkOut)}</Typography> },
    { label: 'Type',      render: (r: any) => (
      <Chip label={r.checkInType} size="small"
        sx={{ fontSize:10, height:20, bgcolor:`rgba(59,130,246,0.1)`, color:H.primary }} />
    )},
    { label: 'Hours',     render: (r: any) => <Typography sx={{ color:H.text,    fontSize:12 }}>{r.hoursWorked ? `${r.hoursWorked}h` : '—'}</Typography> },
    { label: 'Late',      render: (r: any) => r.isLate
      ? <Typography sx={{ color:H.amber, fontSize:12 }}>+{r.lateMinutes} min</Typography>
      : <Typography sx={{ color:H.teal,  fontSize:12 }}>On time</Typography>
    },
    { label: 'Status', render: (r: any) => <StatusChip status={r.status} /> },
  ];

  return (
    <Box>
      <PageHeader
        title="Attendance"
        subtitle="Track daily attendance for all employees"
        action={
          <Box display="flex" gap={1}>
            <Button variant="outlined" startIcon={<LoginOutlined />} size="small"
              onClick={() => dispatch(doCheckIn({ checkInType: 'OFFICE' }))}
              sx={{ color:H.teal, borderColor:`${H.teal}50`, textTransform:'none', fontSize:13, borderRadius:'8px' }}>
              Check In
            </Button>
            <Button variant="outlined" startIcon={<LogoutOutlined />} size="small"
              onClick={() => dispatch(doCheckOut({}))}
              sx={{ color:H.coral, borderColor:`${H.coral}50`, textTransform:'none', fontSize:13, borderRadius:'8px' }}>
              Check Out
            </Button>
          </Box>
        }
      />

      <Grid container spacing={2} mb={3}>
        {[
          { label:'Present', value: present, accent:H.teal,    icon:<AccessTime /> },
          { label:'Absent',  value: absent,  accent:H.coral,   icon:<People />     },
          { label:'Late',    value: late,    accent:H.amber,   icon:<AccessTime /> },
          { label:'Records', value: attendance.total, accent:H.primary, icon:<People /> },
        ].map(c => (
          <Grid item xs={12} sm={6} md={3} key={c.label}>
            <StatCard {...c} loading={busy} sub={undefined} />
          </Grid>
        ))}
      </Grid>

      <Box display="flex" gap={1.5} mb={2} flexWrap="wrap">
        <TextField size="small" placeholder="Employee ID" value={emp} onChange={e => setEmp(e.target.value)}
          sx={{ width: 200, '& .MuiOutlinedInput-root': { bgcolor:H.surface, color:H.text, borderRadius:'8px', '& fieldset':{borderColor:H.border}, fontSize:13 } }}
          inputProps={{ style:{ fontSize:13 } }} />
        <TextField size="small" label="From" type="date" value={from} onChange={e => setFrom(e.target.value)}
          sx={{ width:160, ...fieldSx }} InputLabelProps={{ sx:{ ...labelSx, shrink:true } }} />
        <TextField size="small" label="To" type="date" value={to} onChange={e => setTo(e.target.value)}
          sx={{ width:160, ...fieldSx }} InputLabelProps={{ sx:{ ...labelSx, shrink:true } }} />
        <Button size="small" variant="contained" onClick={load}
          sx={{ bgcolor:H.primary, textTransform:'none', fontWeight:600, borderRadius:'8px', fontSize:13 }}>
          Filter
        </Button>
      </Box>

      <Card>
        <DataTable columns={cols} rows={attendance.data} loading={busy} emptyMsg="No attendance records" />
      </Card>
    </Box>
  );
}
