// src/modules/finance/pages/BankAccountsPage.tsx
import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, Typography, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { Add, AccountBalance } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, F, INR, fieldSx, labelSx } from '../hooks';
import { fetchBankAccounts, doCreateBankAccount, fetchBankTxs, doCreateVendorPayment } from '../store/financeSlice';
import { PageHeader, Card, DataTable, StatCard } from '../components/ui';
import { financeApi } from '../api/finance.api';

export default function BankAccountsPage() {
  const dispatch = useAppDispatch();
  const { bankAccounts, bankTransactions, loading } = useAppSelector(s=>s.finance);
  const [open,setOpen]=useState(false); const [txOpen,setTxOpen]=useState(false);
  const [selBank,setSelBank]=useState('');
  const [form,setForm]=useState({ bankName:'', accountName:'', accountNumber:'', ifscCode:'', accountType:'CURRENT', branch:'' });
  const [txForm,setTxForm]=useState({ bankAccountId:'', transactionDate:new Date().toISOString().split('T')[0], description:'', amount:'', type:'CREDIT', referenceNumber:'' });
  const setBa=(k:string,v:string)=>setForm(p=>({...p,[k]:v}));
  const setTx=(k:string,v:string)=>setTxForm(p=>({...p,[k]:v}));
  const totalBalance=bankAccounts.reduce((s:number,b:any)=>s+b.balance,0);
  useEffect(()=>{dispatch(fetchBankAccounts());},[dispatch]);
  useEffect(()=>{ if(selBank) dispatch(fetchBankTxs({bankAccountId:selBank,take:50})); },[dispatch,selBank]);

  const txCols=[
    {label:'Date',   render:(r:any)=><Typography sx={{color:F.text,fontSize:12}}>{new Date(r.transactionDate).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</Typography>},
    {label:'Description',render:(r:any)=><Typography sx={{color:F.text,fontSize:12.5}}>{r.description}</Typography>},
    {label:'Ref',    render:(r:any)=><Typography sx={{color:F.textSub,fontSize:11,fontFamily:'monospace'}}>{r.referenceNumber||'—'}</Typography>},
    {label:'Debit',  align:'right' as const, render:(r:any)=>r.type==='DEBIT'?<Typography sx={{color:F.red,fontSize:13,fontWeight:600}}>{INR(r.amount)}</Typography>:null},
    {label:'Credit', align:'right' as const, render:(r:any)=>r.type==='CREDIT'?<Typography sx={{color:F.green,fontSize:13,fontWeight:600}}>{INR(r.amount)}</Typography>:null},
    {label:'Reconciled',render:(r:any)=><Chip label={r.isReconciled?'Yes':'No'} size="small" sx={{fontSize:10,height:19,bgcolor:r.isReconciled?`${F.green}12`:`${F.amber}12`,color:r.isReconciled?F.green:F.amber}}/>},
  ];

  return (
    <Box>
      <PageHeader title="Bank Accounts" subtitle={`${bankAccounts.length} accounts · Balance: ${INR(totalBalance)}`}
        action={<Box display="flex" gap={1}>
          <Button variant="outlined" size="small" onClick={()=>setTxOpen(true)} sx={{color:F.cyan,borderColor:`${F.cyan}50`,textTransform:'none',fontSize:13,borderRadius:'8px'}}>Add Transaction</Button>
          <Button variant="contained" startIcon={<Add/>} size="small" onClick={()=>setOpen(true)} sx={{bgcolor:F.primary,textTransform:'none',fontWeight:600,borderRadius:'8px',fontSize:13}}>Add Bank Account</Button>
        </Box>}/>
      <Grid container spacing={2} mb={3}>
        {bankAccounts.map((b:any)=>(
          <Grid item xs={12} sm={6} md={4} key={b.id}>
            <Box onClick={()=>setSelBank(b.id)} sx={{bgcolor:selBank===b.id?`${F.primary}12`:F.surface,borderRadius:'14px',p:2.5,border:`1px solid ${selBank===b.id?`${F.primary}40`:F.border}`,cursor:'pointer','&:hover':{bgcolor:`${F.primary}08`}}}>
              <Box display="flex" justifyContent="space-between" mb={1.5}>
                <Box><Typography sx={{color:F.text,fontWeight:700,fontSize:14}}>{b.bankName}</Typography><Typography sx={{color:F.textSub,fontSize:12}}>{b.accountName}</Typography></Box>
                <Box display="flex" gap={0.5}>{b.isDefault&&<Chip label="Default" size="small" sx={{fontSize:9.5,height:19,bgcolor:`${F.primary}15`,color:F.primary}}/>}<Chip label={b.accountType} size="small" sx={{fontSize:9.5,height:19,bgcolor:'rgba(255,255,255,0.06)',color:F.textSub}}/></Box>
              </Box>
              <Typography sx={{color:F.gold,fontSize:24,fontWeight:800,letterSpacing:-0.5}}>{INR(b.balance)}</Typography>
              <Typography sx={{color:F.textSub,fontSize:11,mt:0.5,fontFamily:'monospace'}}>•••• {String(b.accountNumber).slice(-4)} · {b.ifscCode}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
      {selBank && <Card title="Transactions"><DataTable columns={txCols} rows={bankTransactions.data} loading={!!loading.bankTxs} emptyMsg="No transactions" compact/></Card>}

      {/* Add bank account dialog */}
      <Dialog open={open} onClose={()=>setOpen(false)} maxWidth="sm" fullWidth PaperProps={{sx:{bgcolor:F.surface,border:`1px solid ${F.border}`,borderRadius:'14px'}}}>
        <DialogTitle sx={{color:F.text,fontWeight:700,fontSize:15,pb:1}}>Add Bank Account</DialogTitle>
        <DialogContent><Grid container spacing={2} mt={0.25}>
          {[['bankName','Bank Name *'],['accountName','Account Name *'],['accountNumber','Account Number *'],['ifscCode','IFSC Code *'],['branch','Branch'],['accountType','Account Type']].map(([k,l])=>(<Grid item xs={6} key={k}><TextField fullWidth size="small" label={l} value={(form as any)[k]} onChange={e=>setBa(k,e.target.value)} sx={fieldSx} InputLabelProps={{sx:labelSx}}/></Grid>))}
        </Grid></DialogContent>
        <DialogActions sx={{px:3,pb:2.5,gap:1}}>
          <Button onClick={()=>setOpen(false)} sx={{color:F.textSub,textTransform:'none',fontSize:13}}>Cancel</Button>
          <Button variant="contained" disabled={!form.bankName||!form.accountNumber||!form.ifscCode} onClick={()=>{dispatch(doCreateBankAccount(form));setOpen(false);}} sx={{bgcolor:F.primary,textTransform:'none',fontWeight:600,borderRadius:'8px',fontSize:13}}>Add Account</Button>
        </DialogActions>
      </Dialog>

      {/* Add transaction dialog */}
      <Dialog open={txOpen} onClose={()=>setTxOpen(false)} maxWidth="sm" fullWidth PaperProps={{sx:{bgcolor:F.surface,border:`1px solid ${F.border}`,borderRadius:'14px'}}}>
        <DialogTitle sx={{color:F.text,fontWeight:700,fontSize:15,pb:1}}>Add Bank Transaction</DialogTitle>
        <DialogContent><Grid container spacing={2} mt={0.25}>
          <Grid item xs={12}><TextField fullWidth size="small" label="Bank Account ID *" value={txForm.bankAccountId} onChange={e=>setTx('bankAccountId',e.target.value)} sx={fieldSx} InputLabelProps={{sx:labelSx}}/></Grid>
          <Grid item xs={6}><TextField fullWidth size="small" label="Description *" value={txForm.description} onChange={e=>setTx('description',e.target.value)} sx={fieldSx} InputLabelProps={{sx:labelSx}}/></Grid>
          <Grid item xs={6}><TextField fullWidth size="small" label="Amount *" type="number" value={txForm.amount} onChange={e=>setTx('amount',e.target.value)} sx={fieldSx} InputLabelProps={{sx:labelSx}}/></Grid>
          <Grid item xs={4}>
            <Box component="select" value={txForm.type} onChange={(e:any)=>setTx('type',e.target.value)}
              sx={{width:'100%',bgcolor:F.surfaceHigh,color:F.text,border:`1px solid ${F.border}`,borderRadius:'8px',p:1,fontSize:13,cursor:'pointer'}}>
              <option value="CREDIT">CREDIT</option><option value="DEBIT">DEBIT</option>
            </Box>
          </Grid>
          <Grid item xs={4}><TextField fullWidth size="small" label="Date *" type="date" value={txForm.transactionDate} onChange={e=>setTx('transactionDate',e.target.value)} sx={fieldSx} InputLabelProps={{sx:{...labelSx,shrink:true}}}/></Grid>
          <Grid item xs={4}><TextField fullWidth size="small" label="Reference" value={txForm.referenceNumber} onChange={e=>setTx('referenceNumber',e.target.value)} sx={fieldSx} InputLabelProps={{sx:labelSx}}/></Grid>
        </Grid></DialogContent>
        <DialogActions sx={{px:3,pb:2.5,gap:1}}>
          <Button onClick={()=>setTxOpen(false)} sx={{color:F.textSub,textTransform:'none',fontSize:13}}>Cancel</Button>
          <Button variant="contained" disabled={!txForm.bankAccountId||!txForm.amount||!txForm.description}
            onClick={()=>{financeApi.post('/bank-transactions',{...txForm,amount:+txForm.amount}).then(()=>{dispatch(fetchBankTxs({bankAccountId:txForm.bankAccountId||undefined}));});setTxOpen(false);}}
            sx={{bgcolor:F.primary,textTransform:'none',fontWeight:600,borderRadius:'8px',fontSize:13}}>Add Transaction</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
