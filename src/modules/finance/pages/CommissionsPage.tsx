// src/modules/finance/pages/CommissionsPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Grid, Select, MenuItem, FormControl, InputLabel,
  Typography, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField,
} from '@mui/material';
import { Add, CheckCircle, Payments } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, F, INR, DATE, fieldSx, labelSx, selSx } from '../hooks';
import { fetchCommissions, doCreateCommission, doApproveCommission, doPayCommission } from '../store/financeSlice';
import { PageHeader, Card, DataTable, StatCard, StatusBadge, AmountCell } from '../components/ui';

export default function CommissionsPage() {
  const dispatch = useAppDispatch();
  const { commissions, loading } = useAppSelector(s=>s.finance);
  const [status, setStatus] = useState('');
  const [open,   setOpen]   = useState(false);
  const [payOpen,setPayOpen]=useState('');
  const [payRef, setPayRef] = useState('');
  const [form, setForm] = useState({ bookingId:'', partnerName:'', commissionRate:'', commissionAmount:'', gstAmount:'', tdsAmount:'', bankName:'', accountNumber:'', ifsc:'', notes:'' });
  const set=(k:string,v:string)=>setForm(p=>({...p,[k]:v}));
  const busy = !!loading.commissions;
  useEffect(()=>{ dispatch(fetchCommissions({status:status||undefined})); },[dispatch,status]);

  const pendingAmt  = commissions.data.filter((c:any)=>c.status==='PENDING').reduce((s:number,c:any)=>s+c.netPayable,0);
  const approvedAmt = commissions.data.filter((c:any)=>c.status==='APPROVED').reduce((s:number,c:any)=>s+c.netPayable,0);
  const paidAmt     = commissions.data.filter((c:any)=>c.status==='PAID').reduce((s:number,c:any)=>s+c.netPayable,0);

  const cols=[
    {label:'Partner',        render:(r:any)=><Box><Typography sx={{color:F.text,fontSize:12.5,fontWeight:500}}>{r.partnerName}</Typography><Typography sx={{color:F.textSub,fontSize:11}}>GSTIN: {r.partnerGstIn||'—'}</Typography></Box>},
    {label:'Booking',        render:(r:any)=><Typography sx={{color:F.textSub,fontSize:12}}>{r.booking?.customerName??'—'}</Typography>},
    {label:'Rate',           render:(r:any)=><Typography sx={{color:F.textSub,fontSize:12}}>{r.commissionRate}%</Typography>},
    {label:'Commission',     align:'right' as const, render:(r:any)=><AmountCell value={r.commissionAmount}/>},
    {label:'GST',            align:'right' as const, render:(r:any)=><Typography sx={{color:F.textSub,fontSize:12}}>{INR(r.gstAmount)}</Typography>},
    {label:'TDS',            align:'right' as const, render:(r:any)=><Typography sx={{color:F.textSub,fontSize:12}}>-{INR(r.tdsAmount)}</Typography>},
    {label:'Net Payable',    align:'right' as const, render:(r:any)=><AmountCell value={r.netPayable} color={F.purple}/>},
    {label:'Status',         render:(r:any)=><StatusBadge status={r.status}/>},
    {label:'',               render:(r:any)=>(
      <Box display="flex" gap={0.25}>
        {r.status==='PENDING' && <Tooltip title="Approve"><IconButton size="small" sx={{color:F.green}} onClick={()=>dispatch(doApproveCommission(r.id))}><CheckCircle sx={{fontSize:14}}/></IconButton></Tooltip>}
        {r.status==='APPROVED' && <Tooltip title="Mark Paid"><IconButton size="small" sx={{color:F.gold}} onClick={()=>{setPayOpen(r.id);setPayRef('');}}><Payments sx={{fontSize:14}}/></IconButton></Tooltip>}
      </Box>
    )},
  ];

  return (
    <Box>
      <PageHeader title="Channel Partner Commissions" subtitle={`${commissions.total} commission records`}
        action={<Button variant="contained" startIcon={<Add/>} size="small" onClick={()=>setOpen(true)} sx={{bgcolor:F.primary,textTransform:'none',fontWeight:600,borderRadius:'8px',fontSize:13}}>Add Commission</Button>}/>
      <Grid container spacing={1.5} mb={3}>
        {[{label:'Pending',value:INR(pendingAmt),accent:F.amber,icon:<Payments/>},{label:'Approved',value:INR(approvedAmt),accent:F.green,icon:<Payments/>},{label:'Paid',value:INR(paidAmt),accent:F.purple,icon:<Payments/>}].map(c=><Grid item xs={4} key={c.label}><StatCard {...c} loading={busy} sub={undefined}/></Grid>)}
      </Grid>
      <Box display="flex" gap={1.5} mb={2}>
        <FormControl size="small" sx={{minWidth:150}}>
          <InputLabel sx={labelSx}>Status</InputLabel>
          <Select value={status} label="Status" onChange={e=>setStatus(e.target.value)} sx={selSx}>
            <MenuItem value="" sx={{fontSize:13}}>All</MenuItem>
            {['PENDING','APPROVED','PAID','CANCELLED','ON_HOLD'].map(s=><MenuItem key={s} value={s} sx={{fontSize:13}}>{s}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>
      <Card><DataTable columns={cols} rows={commissions.data} loading={busy} emptyMsg="No commissions" compact/></Card>

      {/* Create dialog */}
      <Dialog open={open} onClose={()=>setOpen(false)} maxWidth="sm" fullWidth PaperProps={{sx:{bgcolor:F.surface,border:`1px solid ${F.border}`,borderRadius:'14px'}}}>
        <DialogTitle sx={{color:F.text,fontWeight:700,fontSize:15,pb:1}}>Add Commission</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={0.25}>
            {[['bookingId','Booking ID *'],['partnerName','Partner Name *'],['bankName','Bank Name'],['accountNumber','Account Number'],['ifsc','IFSC Code']].map(([k,l])=>(
              <Grid item xs={k==='bookingId'||k==='partnerName'?12:4} key={k}>
                <TextField fullWidth size="small" label={l} value={(form as any)[k]} onChange={e=>set(k,e.target.value)} sx={fieldSx} InputLabelProps={{sx:labelSx}}/>
              </Grid>
            ))}
            {[['commissionRate','Commission Rate (%)'],['commissionAmount','Commission Amount (₹)'],['gstAmount','GST Amount (₹)'],['tdsAmount','TDS Amount (₹)']].map(([k,l])=>(
              <Grid item xs={6} key={k}>
                <TextField fullWidth size="small" label={l} type="number" value={(form as any)[k]} onChange={e=>set(k,e.target.value)} sx={fieldSx} InputLabelProps={{sx:labelSx}}/>
              </Grid>
            ))}
            {form.commissionAmount&&<Grid item xs={12}>
              <Box sx={{bgcolor:F.surfaceHigh,borderRadius:'8px',p:1.25}}>
                <Typography sx={{color:F.textSub,fontSize:12}}>Net Payable: <span style={{color:F.purple,fontWeight:700}}>{INR((+form.commissionAmount)+(+form.gstAmount||0)-(+form.tdsAmount||0))}</span></Typography>
              </Box>
            </Grid>}
            <Grid item xs={12}><TextField fullWidth size="small" label="Notes" multiline rows={2} value={form.notes} onChange={e=>set('notes',e.target.value)} sx={fieldSx} InputLabelProps={{sx:labelSx}}/></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{px:3,pb:2.5,gap:1}}>
          <Button onClick={()=>setOpen(false)} sx={{color:F.textSub,textTransform:'none',fontSize:13}}>Cancel</Button>
          <Button variant="contained" disabled={!form.bookingId||!form.partnerName||!form.commissionAmount}
            onClick={()=>{dispatch(doCreateCommission({...form,commissionRate:+form.commissionRate,commissionAmount:+form.commissionAmount,gstAmount:+form.gstAmount||0,tdsAmount:+form.tdsAmount||0}));setOpen(false);}}
            sx={{bgcolor:F.primary,textTransform:'none',fontWeight:600,borderRadius:'8px',fontSize:13}}>Add Commission</Button>
        </DialogActions>
      </Dialog>

      {/* Pay dialog */}
      <Dialog open={!!payOpen} onClose={()=>setPayOpen('')} maxWidth="xs" fullWidth PaperProps={{sx:{bgcolor:F.surface,border:`1px solid ${F.border}`,borderRadius:'14px'}}}>
        <DialogTitle sx={{color:F.text,fontWeight:700,fontSize:15}}>Mark Commission Paid</DialogTitle>
        <DialogContent><Box mt={1.5}><TextField fullWidth size="small" label="Payment Reference *" value={payRef} onChange={e=>setPayRef(e.target.value)} sx={fieldSx} InputLabelProps={{sx:labelSx}}/></Box></DialogContent>
        <DialogActions sx={{px:3,pb:2.5,gap:1}}>
          <Button onClick={()=>setPayOpen('')} sx={{color:F.textSub,textTransform:'none',fontSize:13}}>Cancel</Button>
          <Button variant="contained" disabled={!payRef} onClick={()=>{dispatch(doPayCommission({id:payOpen,reference:payRef}));setPayOpen('');}} sx={{bgcolor:F.primary,textTransform:'none',fontWeight:600,borderRadius:'8px',fontSize:13}}>Mark Paid</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
