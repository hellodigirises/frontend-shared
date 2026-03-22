// src/modules/agent/pages/AttendancePage.tsx
import React, { useEffect } from 'react';
import { Box, Grid, Typography, Chip } from '@mui/material';
import { useAppDispatch, useAppSelector, A, DATE, TIME } from '../hooks';
import { fetchAttendance } from '../store/agentSlice';
import { PageHeader, Card, StatCard } from '../components/ui';
import { AccessTime } from '@mui/icons-material';

export default function AttendancePage() {
  const dispatch = useAppDispatch();
  const { attendance, loading } = useAppSelector(s=>s.agent);

  useEffect(()=>{ dispatch(fetchAttendance({})); },[dispatch]);

  const present = attendance.filter((a:any)=>a.status==='PRESENT').length;
  const absent  = attendance.filter((a:any)=>a.status==='ABSENT').length;
  const late    = attendance.filter((a:any)=>a.isLate).length;
  const avgHrs  = attendance.length>0 ? (attendance.reduce((s:number,a:any)=>s+(a.totalHours??0),0)/attendance.filter((a:any)=>a.totalHours).length).toFixed(1) : '0';

  return (
    <Box>
      <PageHeader title="Attendance" subtitle="This month's attendance record"/>
      <Grid container spacing={1.5} mb={2.5}>
        {[
          { label:'Present', value:present, accent:A.green,   icon:<AccessTime/> },
          { label:'Absent',  value:absent,  accent:A.red,     icon:<AccessTime/> },
          { label:'Late',    value:late,    accent:A.amber,   icon:<AccessTime/> },
          { label:'Avg Hrs', value:`${avgHrs}h`, accent:A.primary, icon:<AccessTime/> },
        ].map(c=><Grid item xs={6} sm={3} key={c.label}><StatCard {...c} loading={!!loading.attendance} compact sub={undefined}/></Grid>)}
      </Grid>

      <Card title="Daily Records">
        <Box p={1.5}>
          {attendance.map((a:any)=>{
            const STATUS_COLOR:Record<string,string> = { PRESENT:A.green, ABSENT:A.red, HALF_DAY:A.amber, WORK_FROM_HOME:A.indigo, ON_LEAVE:A.amber };
            const c = STATUS_COLOR[a.status]??A.textSub;
            return (
              <Box key={a.id} display="flex" alignItems="center" gap={2}
                py={1} sx={{ borderBottom:`1px solid ${A.border}` }}>
                <Box sx={{ minWidth:90 }}>
                  <Typography sx={{ color:A.text, fontSize:13, fontWeight:500 }}>
                    {new Date(a.date).toLocaleDateString('en-IN',{ weekday:'short', day:'2-digit', month:'short' })}
                  </Typography>
                </Box>
                <Box flex={1}>
                  <Box display="flex" gap={0.75} flexWrap="wrap">
                    {a.checkInTime && (
                      <Chip label={`In: ${TIME(a.checkInTime)}`} size="small"
                        sx={{ fontSize:10.5, height:21, bgcolor:`${A.green}12`, color:A.green }}/>
                    )}
                    {a.checkOutTime && (
                      <Chip label={`Out: ${TIME(a.checkOutTime)}`} size="small"
                        sx={{ fontSize:10.5, height:21, bgcolor:`${A.textSub}10`, color:A.textSub }}/>
                    )}
                    {a.isLate && (
                      <Chip label={`Late +${a.lateMinutes}m`} size="small"
                        sx={{ fontSize:10.5, height:21, bgcolor:`${A.amber}12`, color:A.amber }}/>
                    )}
                  </Box>
                </Box>
                <Box textAlign="right">
                  <Chip label={a.status.replace(/_/g,' ')} size="small"
                    sx={{ fontSize:10, height:20, bgcolor:`${c}15`, color:c, fontWeight:600 }}/>
                  {a.totalHours && (
                    <Typography sx={{ color:A.textSub, fontSize:10.5, mt:0.25 }}>{a.totalHours}h</Typography>
                  )}
                </Box>
              </Box>
            );
          })}
          {attendance.length===0 && (
            <Typography sx={{ color:A.textSub, fontSize:13, py:3, textAlign:'center' }}>No attendance records</Typography>
          )}
        </Box>
      </Card>
    </Box>
  );
}
