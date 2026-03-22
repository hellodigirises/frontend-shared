// src/modules/finance/pages/InvoicesPage.tsx
import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, Select, MenuItem, FormControl, InputLabel, Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, F, INR, DATE, fieldSx, labelSx, selSx } from '../hooks';
import { fetchInvoices, doCreateInvoice } from '../store/financeSlice';
import { PageHeader, Card, DataTable, StatusBadge, AmountCell } from '../components/ui';

export default function InvoicesPage() {
  const dispatch = useAppDispatch();
  const { invoices, loading } = useAppSelector(s=>s.finance);
  const [status, setStatus] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ customerAccountId:'', bookingId:'', description:'', amount:'', gstPercent:'5', dueDate:'', notes:'' });
  const set=(k:string,v:string)=>setForm(p=>({...p,[k]:v}));
  useEffect(()=>{ dispatch(fetchInvoices({status:status||undefined})); },[dispatch,status]);

  const cols=[
    {label:'Invoice #', render:(r:any)=><Typography sx={{fontFamily:'monospace',color:F.text,fontSize:12}}>{r.invoiceNumber}</Typography>},
    {label:'Customer',  render:(r:any)=><Typography sx={{color:F.text,fontSize:12.5}}>{r.customerAccount?.customerName??'—'}</Typography>},
    {label:'Subtotal',  align:'right' as const, render:(r:any)=><AmountCell value={r.subtotal}/>},
    {label:'GST',       align:'right' as const, render:(r:any)=><Typography sx={{color:F.textSub,fontSize:12}}>{INR(r.gstAmount)} ({r.gstPercent}%)</Typography>},
    {label:'Total',     align:'right' as const, render:(r:any)=><AmountCell value={r.totalAmount} color={F.gold}/>},
    {label:'Status',    render:(r:any)=><StatusBadge status={r.status}/>},
    {label:'Issued',    render:(r:any)=><Typography sx={{color:F.textSub,fontSize:12}}>{DATE(r.issuedAt)}</Typography>},
    {label:'Due',       render:(r:any)=><Typography sx={{color:r.dueDate&&new Date(r.dueDate)<new Date()&&r.status!=='PAID'?F.red:F.textSub,fontSize:12}}>{DATE(r.dueDate)}</Typography>},
  ];

  return (
    <Box>
      <PageHeader title="Invoices" subtitle={`${invoices.total} invoices`}
        action={<Button variant="contained" startIcon={<Add/>} size="small" onClick={()=>setOpen(true)} sx={{bgcolor:F.primary,textTransform:'none',fontWeight:600,borderRadius:'8px',fontSize:13}}>New Invoice</Button>}/>
      <Box display="flex" gap={1.5} mb={2}>
        <FormControl size="small" sx={{minWidth:140}}>
          <InputLabel sx={labelSx}>Status</InputLabel>
          <Select value={status} label="Status" onChange={e=>setStatus(e.target.value)} sx={selSx}>
            <MenuItem value="" sx={{fontSize:13}}>All</MenuItem>
            {['DRAFT','ISSUED','PAID','OVERDUE','CANCELLED'].map(s=><MenuItem key={s} value={s} sx={{fontSize:13}}>{s}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>
      <Card><DataTable columns={cols} rows={invoices.data} loading={!!loading.invoices} emptyMsg="No invoices" compact/></Card>
      <Dialog open={open} onClose={()=>setOpen(false)} maxWidth="sm" fullWidth PaperProps={{sx:{bgcolor:F.surface,border:`1px solid ${F.border}`,borderRadius:'14px'}}}>
        <DialogTitle sx={{color:F.text,fontWeight:700,fontSize:15,pb:1}}>Create Invoice</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={0.25}>
            {[['customerAccountId','Customer Account ID *'],['bookingId','Booking ID (optional)'],['description','Line Item Description *']].map(([k,l])=>(
              <Grid item xs={12} key={k}><TextField fullWidth size="small" label={l} value={(form as any)[k]} onChange={e=>set(k,e.target.value)} sx={fieldSx} InputLabelProps={{sx:labelSx}}/></Grid>
            ))}
            <Grid item xs={4}><TextField fullWidth size="small" label="Amount *" type="number" value={form.amount} onChange={e=>set('amount',e.target.value)} sx={fieldSx} InputLabelProps={{sx:labelSx}}/></Grid>
            <Grid item xs={4}><TextField fullWidth size="small" label="GST %" type="number" value={form.gstPercent} onChange={e=>set('gstPercent',e.target.value)} sx={fieldSx} InputLabelProps={{sx:labelSx}}/></Grid>
            <Grid item xs={4}><TextField fullWidth size="small" label="Due Date" type="date" value={form.dueDate} onChange={e=>set('dueDate',e.target.value)} sx={fieldSx} InputLabelProps={{sx:{...labelSx,shrink:true}}}/></Grid>
            {form.amount && <Grid item xs={12}>
              <Box sx={{bgcolor:F.surfaceHigh,borderRadius:'8px',p:1.5,display:'flex',gap:3}}>
                {[['Subtotal',INR(+form.amount)],['GST',INR((+form.amount*+form.gstPercent)/100)],['Total',INR(+form.amount+(+form.amount*+form.gstPercent)/100)]].map(([l,v])=>(
                  <Box key={l}><Typography sx={{color:F.textSub,fontSize:11}}>{l}</Typography><Typography sx={{color:F.gold,fontWeight:700,fontSize:13}}>{v}</Typography></Box>
                ))}
              </Box>
            </Grid>}
            <Grid item xs={12}><TextField fullWidth size="small" label="Notes" multiline rows={2} value={form.notes} onChange={e=>set('notes',e.target.value)} sx={fieldSx} InputLabelProps={{sx:labelSx}}/></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{px:3,pb:2.5,gap:1}}>
          <Button onClick={()=>setOpen(false)} sx={{color:F.textSub,textTransform:'none',fontSize:13}}>Cancel</Button>
          <Button variant="contained" disabled={!form.customerAccountId||!form.amount||!form.description}
            onClick={()=>{dispatch(doCreateInvoice({ customerAccountId:form.customerAccountId, bookingId:form.bookingId||undefined, lineItems:[{description:form.description,qty:1,rate:+form.amount,amount:+form.amount}], gstPercent:+form.gstPercent, dueDate:form.dueDate||undefined, notes:form.notes||undefined }));setOpen(false);}}
            sx={{bgcolor:F.primary,textTransform:'none',fontWeight:600,borderRadius:'8px',fontSize:13}}>Create Invoice</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
