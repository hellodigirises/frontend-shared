// src/modules/finance/pages/CollectionsPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Grid, TextField, Select, MenuItem, FormControl,
  InputLabel, Typography, Dialog, DialogTitle, DialogContent,
  DialogActions,
} from '@mui/material';
import { Add, AccountBalance } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, F, INR, DATE, fieldSx, labelSx, selSx } from '../hooks';
import { fetchPayments, doCreatePayment } from '../store/financeSlice';
import { PageHeader, Card, DataTable, StatCard, AmountCell, StatusBadge } from '../components/ui';

const METHODS = ['UPI','BANK_TRANSFER','CHEQUE','CASH','PAYMENT_GATEWAY','NEFT','RTGS','IMPS','DD'];

export default function CollectionsPage() {
  const dispatch = useAppDispatch();
  const { payments, loading } = useAppSelector(s=>s.finance);
  const [from,setFrom]=useState(''); const [to,setTo]=useState(''); const [method,setMethod]=useState('');
  const [open,setOpen]=useState(false);
  const [form,setForm]=useState({ bookingId:'', customerAccountId:'', installmentId:'', amount:'', gstAmount:'', paymentMethod:'UPI', paymentDate:new Date().toISOString().split('T')[0], referenceNumber:'', bankName:'', chequeNumber:'', remarks:'' });
  const set=(k:string,v:string)=>setForm(p=>({...p,[k]:v}));
  const busy=!!loading.payments;

  const load=()=>dispatch(fetchPayments({from:from||undefined,to:to||undefined,method:method||undefined}));
  useEffect(()=>{load();},[dispatch]);

  const totalCol = payments.data.reduce((s,p:any)=>s+p.amount,0);

  const cols=[
    {label:'Date',    render:(r:any)=><Typography sx={{color:F.text,fontSize:12}}>{DATE(r.paymentDate)}</Typography>},
    {label:'Pay #',   render:(r:any)=><Typography sx={{fontFamily:'monospace',color:F.textSub,fontSize:11}}>{r.paymentNumber}</Typography>},
    {label:'Customer',render:(r:any)=><Box><Typography sx={{color:F.text,fontSize:12.5,fontWeight:500}}>{r.customerAccount?.customerName??'—'}</Typography><Typography sx={{color:F.textSub,fontSize:11}}>{r.customerAccount?.customerPhone}</Typography></Box>},
    {label:'Amount', align:'right' as const, render:(r:any)=><AmountCell value={r.amount} color={F.gold}/>},
    {label:'Method',  render:(r:any)=><Typography sx={{color:F.textSub,fontSize:12}}>{r.paymentMethod?.replace(/_/g,' ')}</Typography>},
    {label:'Ref',     render:(r:any)=><Typography sx={{color:F.textSub,fontSize:11,fontFamily:'monospace'}}>{r.referenceNumber??'—'}</Typography>},
    {label:'Receipt', render:(r:any)=>r.receipt?<Typography sx={{color:F.cyan,fontSize:11,fontFamily:'monospace'}}>{r.receipt.receiptNumber}</Typography>:<Typography sx={{color:F.muted,fontSize:11}}>—</Typography>},
  ];

  return (
    <Box>
      <PageHeader title="Collections" subtitle={`${payments.total} payment records`}
        action={<Button variant="contained" startIcon={<Add/>} size="small" onClick={()=>setOpen(true)} sx={{bgcolor:F.primary,textTransform:'none',fontWeight:600,borderRadius:'8px',fontSize:13}}>Record Payment</Button>}/>
      <Grid container spacing={1.5} mb={3}>
        {[{label:'Total Collected',value:INR(totalCol),accent:F.gold,icon:<AccountBalance/>},{label:'Transactions',value:payments.total,accent:F.primary,icon:<AccountBalance/>}].map(c=><Grid item xs={12} sm={6} key={c.label}><StatCard {...c} loading={busy} sub={undefined}/></Grid>)}
      </Grid>
      <Box display="flex" gap={1.5} mb={2} flexWrap="wrap">
        <TextField size="small" label="From" type="date" value={from} onChange={e=>setFrom(e.target.value)} sx={{width:160,...fieldSx}} InputLabelProps={{sx:{...labelSx,shrink:true}}}/>
        <TextField size="small" label="To"   type="date" value={to}   onChange={e=>setTo(e.target.value)}   sx={{width:160,...fieldSx}} InputLabelProps={{sx:{...labelSx,shrink:true}}}/>
        <FormControl size="small" sx={{minWidth:150}}>
          <InputLabel sx={labelSx}>Method</InputLabel>
          <Select value={method} label="Method" onChange={e=>setMethod(e.target.value)} sx={selSx}>
            <MenuItem value="" sx={{fontSize:13}}>All Methods</MenuItem>
            {METHODS.map(m=><MenuItem key={m} value={m} sx={{fontSize:13}}>{m.replace(/_/g,' ')}</MenuItem>)}
          </Select>
        </FormControl>
        <Button size="small" variant="contained" onClick={load} sx={{bgcolor:F.primary,textTransform:'none',borderRadius:'8px',fontSize:13,fontWeight:600}}>Filter</Button>
      </Box>
      <Card><DataTable columns={cols} rows={payments.data} loading={busy} emptyMsg="No payment records"/></Card>

      <Dialog open={open} onClose={()=>setOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{sx:{bgcolor:F.surface,border:`1px solid ${F.border}`,borderRadius:'14px'}}}>
        <DialogTitle sx={{color:F.text,fontWeight:700,fontSize:15,pb:1}}>Record Payment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={0.25}>
            {[['bookingId','Booking ID *'],['customerAccountId','Customer Account ID *'],['installmentId','Installment ID (optional)']].map(([k,l])=>(
              <Grid item xs={12} key={k}><TextField fullWidth size="small" label={l} value={(form as any)[k]} onChange={e=>set(k,e.target.value)} sx={fieldSx} InputLabelProps={{sx:labelSx}}/></Grid>
            ))}
            <Grid item xs={4}><TextField fullWidth size="small" label="Amount *" type="number" value={form.amount} onChange={e=>set('amount',e.target.value)} sx={fieldSx} InputLabelProps={{sx:labelSx}}/></Grid>
            <Grid item xs={4}><TextField fullWidth size="small" label="GST Amount" type="number" value={form.gstAmount} onChange={e=>set('gstAmount',e.target.value)} sx={fieldSx} InputLabelProps={{sx:labelSx}}/></Grid>
            <Grid item xs={4}>
              <FormControl fullWidth size="small">
                <InputLabel sx={labelSx}>Method *</InputLabel>
                <Select value={form.paymentMethod} label="Method *" onChange={e=>set('paymentMethod',e.target.value)} sx={selSx}>
                  {METHODS.map(m=><MenuItem key={m} value={m} sx={{fontSize:13}}>{m.replace(/_/g,' ')}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}><TextField fullWidth size="small" label="Payment Date *" type="date" value={form.paymentDate} onChange={e=>set('paymentDate',e.target.value)} sx={fieldSx} InputLabelProps={{sx:{...labelSx,shrink:true}}}/></Grid>
            <Grid item xs={6}><TextField fullWidth size="small" label="Reference Number" value={form.referenceNumber} onChange={e=>set('referenceNumber',e.target.value)} sx={fieldSx} InputLabelProps={{sx:labelSx}}/></Grid>
            {['CHEQUE','DD'].includes(form.paymentMethod) && <>
              <Grid item xs={6}><TextField fullWidth size="small" label="Bank Name" value={form.bankName} onChange={e=>set('bankName',e.target.value)} sx={fieldSx} InputLabelProps={{sx:labelSx}}/></Grid>
              <Grid item xs={6}><TextField fullWidth size="small" label="Cheque Number" value={form.chequeNumber} onChange={e=>set('chequeNumber',e.target.value)} sx={fieldSx} InputLabelProps={{sx:labelSx}}/></Grid>
            </>}
            <Grid item xs={12}><TextField fullWidth size="small" label="Remarks" multiline rows={2} value={form.remarks} onChange={e=>set('remarks',e.target.value)} sx={fieldSx} InputLabelProps={{sx:labelSx}}/></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{px:3,pb:2.5,gap:1}}>
          <Button onClick={()=>setOpen(false)} sx={{color:F.textSub,textTransform:'none',fontSize:13}}>Cancel</Button>
          <Button variant="contained" disabled={!form.bookingId||!form.customerAccountId||!form.amount} onClick={()=>{dispatch(doCreatePayment(form));setOpen(false);}} sx={{bgcolor:F.primary,textTransform:'none',fontWeight:600,borderRadius:'8px',fontSize:13}}>Record Payment</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
