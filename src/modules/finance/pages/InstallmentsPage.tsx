// src/modules/finance/pages/InstallmentsPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Grid, Select, MenuItem, FormControl, InputLabel,
  Typography, Switch, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, IconButton, Tooltip,
} from '@mui/material';
import { PaymentOutlined, Warning } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, F, INR, DATE, fieldSx, labelSx, selSx } from '../hooks';
import { fetchInstallments, doPayInstallment } from '../store/financeSlice';
import { PageHeader, Card, DataTable, StatCard, AmountCell, StatusBadge } from '../components/ui';
import { EventNote } from '@mui/icons-material';

export default function InstallmentsPage() {
  const dispatch = useAppDispatch();
  const { installments, loading } = useAppSelector(s=>s.finance);
  const [status,   setStatus]   = useState('');
  const [overdue,  setOverdue]  = useState(false);
  const [payId,    setPayId]    = useState('');
  const [payAmt,   setPayAmt]   = useState('');
  const busy = !!loading.installments;

  useEffect(()=>{
    dispatch(fetchInstallments({ status:status||undefined, overdue:overdue||undefined, take:50 }));
  },[dispatch,status,overdue]);

  const overdueCount = installments.data.filter(i=>i.status==='OVERDUE').length;
  const pendingSum   = installments.data.filter(i=>['PENDING','PARTIAL'].includes(i.status)).reduce((s,i:any)=>s+i.totalAmount-i.paidAmount,0);

  const cols = [
    {label:'Customer',   render:(r:any)=><Box><Typography sx={{color:F.text,fontSize:12.5,fontWeight:500}}>{r.customerAccount?.customerName??'—'}</Typography><Typography sx={{color:F.textSub,fontSize:11}}>{r.customerAccount?.customerPhone}</Typography></Box>},
    {label:'Milestone',  render:(r:any)=><Typography sx={{color:F.text,fontSize:12}}>{r.milestoneName}</Typography>},
    {label:'#',          render:(r:any)=><Typography sx={{color:F.textSub,fontSize:12}}>{r.installmentNumber}</Typography>},
    {label:'Amount',     align:'right' as const, render:(r:any)=><AmountCell value={r.totalAmount}/>},
    {label:'Paid',       align:'right' as const, render:(r:any)=><AmountCell value={r.paidAmount} color={F.green}/>},
    {label:'Balance',    align:'right' as const, render:(r:any)=><AmountCell value={r.totalAmount-r.paidAmount} color={r.status==='PAID'?F.green:F.red}/>},
    {label:'Due Date',   render:(r:any)=><Typography sx={{color:new Date(r.dueDate)<new Date()&&r.status!=='PAID'?F.red:F.textSub,fontSize:12}}>{DATE(r.dueDate)}</Typography>},
    {label:'Status',     render:(r:any)=><StatusBadge status={r.status}/>},
    {label:'',           render:(r:any)=>['PENDING','PARTIAL','OVERDUE'].includes(r.status)?(
      <Tooltip title="Record Payment">
        <IconButton size="small" sx={{color:F.primary}} onClick={()=>{setPayId(r.id);setPayAmt(String(r.totalAmount-r.paidAmount));}}>
          <PaymentOutlined sx={{fontSize:15}}/>
        </IconButton>
      </Tooltip>
    ):null},
  ];

  return (
    <Box>
      <PageHeader title="Installments" subtitle={`${installments.total} installment records`}/>
      <Grid container spacing={1.5} mb={3}>
        {[
          {label:'Overdue',         value:overdueCount, accent:F.red,   icon:<Warning/>},
          {label:'Pending Balance', value:INR(pendingSum), accent:F.amber, icon:<EventNote/>},
          {label:'Total Records',   value:installments.total, accent:F.primary, icon:<EventNote/>},
        ].map(c=><Grid item xs={12} sm={4} key={c.label}><StatCard {...c} loading={busy} sub={undefined}/></Grid>)}
      </Grid>
      <Box display="flex" gap={1.5} mb={2} flexWrap="wrap" alignItems="center">
        <FormControl size="small" sx={{minWidth:150}}>
          <InputLabel sx={labelSx}>Status Filter</InputLabel>
          <Select value={status} label="Status Filter" onChange={e=>setStatus(e.target.value)} sx={selSx}>
            <MenuItem value="" sx={{fontSize:13}}>All</MenuItem>
            {['PENDING','PARTIAL','PAID','OVERDUE','WAIVED'].map(s=><MenuItem key={s} value={s} sx={{fontSize:13}}>{s}</MenuItem>)}
          </Select>
        </FormControl>
        <Box display="flex" alignItems="center" gap={1}>
          <Switch checked={overdue} onChange={e=>setOverdue(e.target.checked)}
            sx={{'& .Mui-checked + .MuiSwitch-track':{bgcolor:`${F.red} !important`}}}/>
          <Typography sx={{color:F.textSub,fontSize:13}}>Overdue only</Typography>
        </Box>
      </Box>
      <Card><DataTable columns={cols} rows={installments.data} loading={busy} emptyMsg="No installment records" compact/></Card>

      {/* Pay dialog */}
      <Dialog open={!!payId} onClose={()=>setPayId('')} maxWidth="xs" fullWidth
        PaperProps={{sx:{bgcolor:F.surface,border:`1px solid ${F.border}`,borderRadius:'14px'}}}>
        <DialogTitle sx={{color:F.text,fontWeight:700,fontSize:15}}>Record Installment Payment</DialogTitle>
        <DialogContent>
          <Box mt={1.5}>
            <TextField fullWidth size="small" label="Amount *" type="number" value={payAmt} onChange={e=>setPayAmt(e.target.value)} sx={fieldSx} InputLabelProps={{sx:labelSx}}/>
          </Box>
        </DialogContent>
        <DialogActions sx={{px:3,pb:2.5,gap:1}}>
          <Button onClick={()=>setPayId('')} sx={{color:F.textSub,textTransform:'none',fontSize:13}}>Cancel</Button>
          <Button variant="contained" disabled={!payAmt} onClick={()=>{dispatch(doPayInstallment({id:payId,amount:+payAmt}));setPayId('');}}
            sx={{bgcolor:F.primary,textTransform:'none',fontWeight:600,borderRadius:'8px',fontSize:13}}>Confirm Payment</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
