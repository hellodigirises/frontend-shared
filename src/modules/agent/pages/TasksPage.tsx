// src/modules/agent/pages/TasksPage.tsx
import React, { useEffect } from 'react';
import { Box, Typography, Chip, Grid, IconButton, Tooltip } from '@mui/material';
import { Assignment, CheckCircle } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, A, DATE } from '../hooks';
import { fetchTasks, doUpdateTask, type Task } from '../store/agentSlice';
import { PageHeader, StatCard, TaskPriorityBadge } from '../components/ui';

export default function TasksPage() {
  const dispatch = useAppDispatch();
  const { tasks, loading } = useAppSelector(s=>s.agent);
  const busy = !!loading.tasks;

  useEffect(()=>{ dispatch(fetchTasks({})); },[dispatch]);

  const pending   = tasks.data.filter(t=>t.status==='PENDING').length;
  const inProgress= tasks.data.filter(t=>t.status==='IN_PROGRESS').length;
  const done      = tasks.data.filter(t=>t.status==='COMPLETED').length;

  const STATUS_COLOR:Record<string,string> = { PENDING:A.amber, IN_PROGRESS:A.blue, COMPLETED:A.green, CANCELLED:A.red };

  return (
    <Box>
      <PageHeader title="My Tasks" subtitle={`${tasks.total} total tasks`}/>
      <Grid container spacing={1.5} mb={2.5}>
        {[
          { label:'Pending',     value:pending,    accent:A.amber,  icon:<Assignment/> },
          { label:'In Progress', value:inProgress, accent:A.blue,   icon:<Assignment/> },
          { label:'Done',        value:done,        accent:A.green,  icon:<CheckCircle/> },
        ].map(c=><Grid item xs={4} key={c.label}><StatCard {...c} loading={busy} compact sub={undefined}/></Grid>)}
      </Grid>

      {['IN_PROGRESS','PENDING','COMPLETED'].map(status=>{
        const group = tasks.data.filter(t=>t.status===status);
        if (!group.length) return null;
        const color = STATUS_COLOR[status]??A.textSub;
        return (
          <Box key={status} mb={2.5}>
            <Box display="flex" alignItems="center" gap={1} mb={1.25}>
              <Box sx={{ width:8, height:8, borderRadius:'50%', bgcolor:color }}/>
              <Typography sx={{ color:color, fontSize:11.5, fontWeight:600, textTransform:'uppercase', letterSpacing:0.5 }}>{status.replace(/_/g,' ')} ({group.length})</Typography>
            </Box>
            {group.map((task:Task)=>(
              <Box key={task.id} sx={{
                bgcolor:A.surfaceHigh, borderRadius:'12px', p:1.75, mb:1,
                border:`1px solid ${task.status==='IN_PROGRESS'?`${A.blue}30`:A.border}`,
              }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box flex={1} mr={1}>
                    <Typography sx={{ color:A.text, fontSize:13.5, fontWeight:600, lineHeight:1.3 }}>{task.title}</Typography>
                    {task.description && <Typography sx={{ color:A.textSub, fontSize:12, mt:0.4 }}>{task.description}</Typography>}
                  </Box>
                  {task.status !== 'COMPLETED' && (
                    <Tooltip title="Mark Done">
                      <IconButton size="small" onClick={()=>dispatch(doUpdateTask({ id:task.id, status:'COMPLETED' }))}
                        sx={{ color:A.green, p:0.4 }}>
                        <CheckCircle sx={{ fontSize:18 }}/>
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
                <Box display="flex" gap={1} mt={1} flexWrap="wrap" alignItems="center">
                  <TaskPriorityBadge priority={task.priority}/>
                  {task.dueDate && (
                    <Typography sx={{ color:new Date(task.dueDate)<new Date()?A.red:A.textSub, fontSize:11.5 }}>
                      Due {DATE(task.dueDate)}
                    </Typography>
                  )}
                  {task.assignedByUser && (
                    <Typography sx={{ color:A.muted, fontSize:11 }}>from {task.assignedByUser.name}</Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        );
      })}
    </Box>
  );
}
