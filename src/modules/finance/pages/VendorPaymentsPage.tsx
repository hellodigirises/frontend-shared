// src/modules/finance/pages/VendorPaymentsPage.tsx
import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, Select, MenuItem, FormControl, InputLabel, Typography, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { Add, Payments } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, F, INR, DATE, fieldSx, labelSx, selSx } from '../hooks';
import { fetchVendorPayments, doCreateVendorPayment, doProcessVendorPayment } from '../store/financeSlice';
import { PageHeader, Card, DataTable, StatCard, StatusBadge, AmountCell } from '../components/ui';

export default function VendorPaymentsPage() {
  const dispatch = useAppDispatch();
  const { vendorPayments, loading } = useAppSelector(s=>s.finance);
  const [status,setStatus]=useState(''); const [open,setOpen]=useState(false); const [payOpen,setPayOpen]=useState(''); const [payRef,setPayRef]=useState('');
  const [form,setForm]=useState({ vendorName:'', purchaseOrderId:'', invoiceNumber:'', amount:'', gstAmount:'', tdsAmount:'', paymentMethod:'BANK_TRANSFER', notes:'' });
  const set=(k:string,v:string)=>setForm(p=>({...p,[k]:v}));
  const busy=!!loading.vendorPayments;
  useEffect(()=>{dispatch(fetchVendorPayments({status:status||undefined}));},[dispatch,status]);
  const pendingAmt=vendorPayments.data.filter((v:any)=>v.status==='PENDING').reduce((s:number,v:any)=>s+v.netPayable,0);
  const cols=[
    {label:'Vendor',    render:(r:any)=><Box><Typography sx={{color:F.text,fontSize:12.5,fontWeight:500}}>{r.vendorName}</Typography><Typography sx={{color:F.textSub,fontSize:11}}>PO: {r.purchaseOrderId||'—'}</Typography></Box>},
    {label:'Invoice #', render:(r:any)=><Typography sx={{color:F.textSub,fontSize:11,fontFamily:'monospace'}}>{r.invoiceNumber||'—'}</Typography>},
    {label:'Amount',    align:'right' as const, render:(r:any)=><AmountCell value={r.amount}/>},
    {label:'GST',       align:'right' as const, render:(r:any)=><Typography sx={{color:F.textSub,fontSize:12}}>{INR(r.gstAmount)}</Typography>},
    {label:'TDS',       align:'right' as const, render:(r:any)=><Typography sx={{color:F.red,fontSize:12}}>-{INR(r.tdsAmount)}</Typography>},
    {label:'Net Pay',   align:'right' as const, render:(r:any)=><AmountCell value={r.netPayable} color={F.amber}/>},
    {label:'Status',    render:(r:any)=><StatusBadge status={r.status}/>},
    {label:'Paid Date', render:(r:any)=><Typography sx={{color:F.textSub,fontSize:12}}>{DATE(r.paymentDate)}</Typography>},
    {label:'',          render:(r:any)=>r.status==='PENDING'?<Tooltip title="Process Payment"><IconButton size="small" sx={{color:F.gold}} onClick={()=>{setPayOpen(r.id);setPayRef('');}}><Payments sx={{fontSize:14}}/></IconButton></Tooltip>:null},
  ];
  return (
    <Box>
      <PageHeader title="Vendor Payments" subtitle={`${vendorPayments.total} records · Pending: ${INR(pendingAmt)}`}
        action={<Button variant="contained" startIcon={<Add/>} size="small" onClick={()=>setOpen(true)} sx={{bgcolor:F.primary,textTransform:'none',fontWeight:600,borderRadius:'8px',fontSize:13}}>Add Payment</Button>}/>
      <Grid container spacing={1.5} mb={3}>
        {[{label:'Pending Payables',value:INR(pendingAmt),accent:F.amber,icon:<Payments/>},{label:'Total',value:vendorPayments.total,accent:F.primary,icon:<Payments/>}].map(c=><Grid item xs={6} key={c.label}><StatCard {...c} loading={busy} sub={undefined}/></Grid>)}
      </Grid>
      <Box display="flex" gap={1.5} mb={2}>
        <FormControl size="small" sx={{minWidth:150}}><InputLabel sx={labelSx}>Status</InputLabel>
          <Select value={status} label="Status" onChange={e=>setStatus(e.target.value)} sx={selSx}>
            <MenuItem value="" sx={{fontSize:13}}>All</MenuItem>
            {['PENDING','PROCESSING','PAID','FAILED','CANCELLED'].map(s=><MenuItem key={s} value={s} sx={{fontSize:13}}>{s}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>
      <Card><DataTable columns={cols} rows={vendorPayments.data} loading={busy} emptyMsg="No vendor payments" compact/></Card>
      <Dialog open={open} onClose={()=>setOpen(false)} maxWidth="sm" fullWidth PaperProps={{sx:{bgcolor:F.surface,border:`1px solid ${F.border}`,borderRadius:'14px'}}}>
        <DialogTitle sx={{color:F.text,fontWeight:700,fontSize:15,pb:1}}>Add Vendor Payment</DialogTitle>
        <DialogContent><Grid container spacing={2} mt={0.25}>
          {[['vendorName','Vendor Name *'],['purchaseOrderId','PO Number'],['invoiceNumber','Invoice Number']].map(([k,l])=>(<Grid item xs={12} key={k}><TextField fullWidth size="small" label={l} value={(form as any)[k]} onChange={e=>set(k,e.target.value)} sx={fieldSx} InputLabelProps={{sx:labelSx}}/></Grid>))}
          {[['amount','Amount *'],['gstAmount','GST Amount'],['tdsAmount','TDS Amount']].map(([k,l])=>(<Grid item xs={4} key={k}><TextField fullWidth size="small" label={l} type="number" value={(form as any)[k]} onChange={e=>set(k,e.target.value)} sx={fieldSx} InputLabelProps={{sx:labelSx}}/></Grid>))}
          {form.amount&&<Grid item xs={12}><Box sx={{bgcolor:F.surfaceHigh,borderRadius:'8px',p:1.25}}><Typography sx={{color:F.textSub,fontSize:12}}>Net Payable: <span style={{color:F.amber,fontWeight:700}}>{INR((+form.amount)+(+form.gstAmount||0)-(+form.tdsAmount||0))}</span></Typography></Box></Grid>}
          <Grid item xs={12}><TextField fullWidth size="small" label="Notes" multiline rows={2} value={form.notes} onChange={e=>set('notes',e.target.value)} sx={fieldSx} InputLabelProps={{sx:labelSx}}/></Grid>
        </Grid></DialogContent>
        <DialogActions sx={{px:3,pb:2.5,gap:1}}>
          <Button onClick={()=>setOpen(false)} sx={{color:F.textSub,textTransform:'none',fontSize:13}}>Cancel</Button>
          <Button variant="contained" disabled={!form.vendorName||!form.amount} onClick={()=>{dispatch(doCreateVendorPayment({...form,amount:+form.amount,gstAmount:+form.gstAmount||0,tdsAmount:+form.tdsAmount||0}));setOpen(false);}} sx={{bgcolor:F.primary,textTransform:'none',fontWeight:600,borderRadius:'8px',fontSize:13}}>Add Payment</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!payOpen} onClose={()=>setPayOpen('')} maxWidth="xs" fullWidth PaperProps={{sx:{bgcolor:F.surface,border:`1px solid ${F.border}`,borderRadius:'14px'}}}>
        <DialogTitle sx={{color:F.text,fontWeight:700,fontSize:15}}>Process Payment</DialogTitle>
        <DialogContent><Box mt={1.5}><TextField fullWidth size="small" label="Reference Number" value={payRef} onChange={e=>setPayRef(e.target.value)} sx={fieldSx} InputLabelProps={{sx:labelSx}}/></Box></DialogContent>
        <DialogActions sx={{px:3,pb:2.5,gap:1}}>
          <Button onClick={()=>setPayOpen('')} sx={{color:F.textSub,textTransform:'none',fontSize:13}}>Cancel</Button>
          <Button variant="contained" onClick={()=>{dispatch(doProcessVendorPayment({id:payOpen,reference:payRef}));setPayOpen('');}} sx={{bgcolor:F.primary,textTransform:'none',fontWeight:600,borderRadius:'8px',fontSize:13}}>Process</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
