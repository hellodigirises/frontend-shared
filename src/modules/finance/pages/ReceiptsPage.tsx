// src/modules/finance/pages/ReceiptsPage.tsx
import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector, F, INR, DATE } from '../hooks';
import { fetchReceipts } from '../store/financeSlice';
import { PageHeader, Card, DataTable, AmountCell } from '../components/ui';

export default function ReceiptsPage() {
  const dispatch = useAppDispatch();
  const { receipts, loading } = useAppSelector(s=>s.finance);
  useEffect(()=>{ dispatch(fetchReceipts({})); },[dispatch]);
  const cols=[
    {label:'Receipt #',  render:(r:any)=><Typography sx={{fontFamily:'monospace',color:F.cyan,fontSize:12}}>{r.receiptNumber}</Typography>},
    {label:'Customer',   render:(r:any)=><Typography sx={{color:F.text,fontSize:12.5}}>{r.customerAccount?.customerName??'—'}</Typography>},
    {label:'Amount',     align:'right' as const, render:(r:any)=><AmountCell value={r.amount} color={F.gold}/>},
    {label:'Method',     render:(r:any)=><Typography sx={{color:F.textSub,fontSize:12}}>{r.payment?.paymentMethod?.replace(/_/g,' ')??'—'}</Typography>},
    {label:'Ref',        render:(r:any)=><Typography sx={{color:F.textSub,fontSize:11,fontFamily:'monospace'}}>{r.payment?.referenceNumber??'—'}</Typography>},
    {label:'Date',       render:(r:any)=><Typography sx={{color:F.textSub,fontSize:12}}>{DATE(r.receiptDate)}</Typography>},
    {label:'Issued By',  render:(r:any)=><Typography sx={{color:F.textSub,fontSize:12}}>{r.issuedBy??'—'}</Typography>},
  ];
  return (
    <Box>
      <PageHeader title="Receipts" subtitle={`${receipts.total} receipt records — auto-generated on payment`}/>
      <Card><DataTable columns={cols} rows={receipts.data} loading={!!loading.receipts} emptyMsg="No receipts" compact/></Card>
    </Box>
  );
}
