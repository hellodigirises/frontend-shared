// src/modules/finance/pages/ExpensesPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Grid, Select, MenuItem, FormControl, InputLabel,
  Typography, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField,
} from '@mui/material';
import { Add, CheckCircle } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, F, INR, DATE, fieldSx, labelSx, selSx } from '../hooks';
import { fetchExpenses, doCreateExpense, doApproveExpense, fetchExpenseCategories } from '../store/financeSlice';
import { PageHeader, Card, DataTable, StatCard, StatusBadge, AmountCell } from '../components/ui';
import { ShoppingCart } from '@mui/icons-material';

const METHODS = ['UPI','BANK_TRANSFER','CHEQUE','CASH','NEFT','RTGS'];

export default function ExpensesPage() {
  const dispatch = useAppDispatch();
  const { expenses, expenseCategories, loading } = useAppSelector(s=>s.finance);
  const [status,   setStatus]   = useState('');
  const [catId,    setCatId]    = useState('');
  const [open,     setOpen]     = useState(false);
  const [form, setForm] = useState({ categoryId:'', title:'', description:'', vendor:'', amount:'', gstAmount:'', expenseDate:new Date().toISOString().split('T')[0], paymentMethod:'BANK_TRANSFER', referenceNumber:'' });
  const set=(k:string,v:string)=>setForm(p=>({...p,[k]:v}));
  const busy = !!loading.expenses;

  useEffect(()=>{ dispatch(fetchExpenseCategories()); dispatch(fetchExpenses({status:status||undefined,categoryId:catId||undefined})); },[dispatch,status,catId]);

  const totalAmt = expenses.data.reduce((s,e:any)=>s+e.totalAmount,0);

  const cols=[
    {label:'Date',        render:(r:any)=><Typography sx={{color:F.text,fontSize:12}}>{DATE(r.expenseDate)}</Typography>},
    {label:'Title',       render:(r:any)=><Box><Typography sx={{color:F.text,fontSize:12.5,fontWeight:500}}>{r.title}</Typography><Typography sx={{color:F.textSub,fontSize:11}}>{r.vendor||'—'}</Typography></Box>},
    {label:'Category',    render:(r:any)=><Typography sx={{color:F.textSub,fontSize:12}}>{r.category?.name??'—'}</Typography>},
    {label:'Amount',      align:'right' as const, render:(r:any)=><AmountCell value={r.amount}/>},
    {label:'GST',         align:'right' as const, render:(r:any)=><Typography sx={{color:F.textSub,fontSize:12}}>{INR(r.gstAmount)}</Typography>},
    {label:'Total',       align:'right' as const, render:(r:any)=><AmountCell value={r.totalAmount} color={F.purple}/>},
    {label:'Method',      render:(r:any)=><Typography sx={{color:F.textSub,fontSize:11}}>{r.paymentMethod?.replace(/_/g,' ')}</Typography>},
    {label:'Status',      render:(r:any)=><StatusBadge status={r.status}/>},
    {label:'',            render:(r:any)=>r.status==='PENDING'?<Tooltip title="Approve"><IconButton size="small" sx={{color:F.green}} onClick={()=>dispatch(doApproveExpense(r.id))}><CheckCircle sx={{fontSize:14}}/></IconButton></Tooltip>:null},
  ];

  return (
    <Box>
      <PageHeader title="Expenses" subtitle={`${expenses.total} expense records`}
        action={<Button variant="contained" startIcon={<Add/>} size="small" onClick={()=>setOpen(true)} sx={{bgcolor:F.primary,textTransform:'none',fontWeight:600,borderRadius:'8px',fontSize:13}}>Add Expense</Button>}/>
      <Grid container spacing={1.5} mb={3}>
        {[{label:'Total Amount',value:INR(totalAmt),accent:F.purple,icon:<ShoppingCart/>},{label:'Records',value:expenses.total,accent:F.primary,icon:<ShoppingCart/>}].map(c=><Grid item xs={6} key={c.label}><StatCard {...c} loading={busy} sub={undefined}/></Grid>)}
      </Grid>
      <Box display="flex" gap={1.5} mb={2} flexWrap="wrap">
        <FormControl size="small" sx={{minWidth:150}}>
          <InputLabel sx={labelSx}>Category</InputLabel>
          <Select value={catId} label="Category" onChange={e=>setCatId(e.target.value)} sx={selSx}>
            <MenuItem value="" sx={{fontSize:13}}>All Categories</MenuItem>
            {expenseCategories.map((c:any)=><MenuItem key={c.id} value={c.id} sx={{fontSize:13}}>{c.name}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{minWidth:130}}>
          <InputLabel sx={labelSx}>Status</InputLabel>
          <Select value={status} label="Status" onChange={e=>setStatus(e.target.value)} sx={selSx}>
            <MenuItem value="" sx={{fontSize:13}}>All</MenuItem>
            {['PENDING','APPROVED','REJECTED','PAID'].map(s=><MenuItem key={s} value={s} sx={{fontSize:13}}>{s}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>
      <Card><DataTable columns={cols} rows={expenses.data} loading={busy} emptyMsg="No expenses" compact/></Card>

      <Dialog open={open} onClose={()=>setOpen(false)} maxWidth="sm" fullWidth PaperProps={{sx:{bgcolor:F.surface,border:`1px solid ${F.border}`,borderRadius:'14px'}}}>
        <DialogTitle sx={{color:F.text,fontWeight:700,fontSize:15,pb:1}}>Add Expense</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={0.25}>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel sx={labelSx}>Category *</InputLabel>
                <Select value={form.categoryId} label="Category *" onChange={e=>set('categoryId',e.target.value)} sx={selSx}>
                  {expenseCategories.map((c:any)=><MenuItem key={c.id} value={c.id} sx={{fontSize:13}}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            {[['title','Title *'],['vendor','Vendor / Payee']].map(([k,l])=>(<Grid item xs={6} key={k}><TextField fullWidth size="small" label={l} value={(form as any)[k]} onChange={e=>set(k,e.target.value)} sx={fieldSx} InputLabelProps={{sx:labelSx}}/></Grid>))}
            <Grid item xs={4}><TextField fullWidth size="small" label="Amount *" type="number" value={form.amount} onChange={e=>set('amount',e.target.value)} sx={fieldSx} InputLabelProps={{sx:labelSx}}/></Grid>
            <Grid item xs={4}><TextField fullWidth size="small" label="GST Amount" type="number" value={form.gstAmount} onChange={e=>set('gstAmount',e.target.value)} sx={fieldSx} InputLabelProps={{sx:labelSx}}/></Grid>
            <Grid item xs={4}><TextField fullWidth size="small" label="Date *" type="date" value={form.expenseDate} onChange={e=>set('expenseDate',e.target.value)} sx={fieldSx} InputLabelProps={{sx:{...labelSx,shrink:true}}}/></Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel sx={labelSx}>Payment Method</InputLabel>
                <Select value={form.paymentMethod} label="Payment Method" onChange={e=>set('paymentMethod',e.target.value)} sx={selSx}>
                  {METHODS.map(m=><MenuItem key={m} value={m} sx={{fontSize:13}}>{m.replace(/_/g,' ')}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}><TextField fullWidth size="small" label="Reference Number" value={form.referenceNumber} onChange={e=>set('referenceNumber',e.target.value)} sx={fieldSx} InputLabelProps={{sx:labelSx}}/></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{px:3,pb:2.5,gap:1}}>
          <Button onClick={()=>setOpen(false)} sx={{color:F.textSub,textTransform:'none',fontSize:13}}>Cancel</Button>
          <Button variant="contained" disabled={!form.categoryId||!form.title||!form.amount}
            onClick={()=>{dispatch(doCreateExpense({...form,amount:+form.amount,gstAmount:+form.gstAmount||0}));setOpen(false);}}
            sx={{bgcolor:F.primary,textTransform:'none',fontWeight:600,borderRadius:'8px',fontSize:13}}>Add Expense</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
