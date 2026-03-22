// src/modules/agent/pages/BookingsPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Grid, TextField, Typography, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { Add, Receipt } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, A, INR, DATE, fieldSx, labelSx } from '../hooks';
import { fetchBookings, doCreateBooking, type Booking } from '../store/agentSlice';
import { PageHeader, Card, StatCard } from '../components/ui';

const STATUS_COLOR:Record<string,string> = { PENDING:A.amber, CONFIRMED:A.green, CANCELLED:A.red, COMPLETED:A.green };

export default function BookingsPage() {
  const dispatch = useAppDispatch();
  const { bookings, loading } = useAppSelector(s=>s.agent);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ leadId:'', unitId:'', customerName:'', customerPhone:'', customerEmail:'', totalAmount:'', discountAmount:'0' });
  const set=(k:string,v:string)=>setForm(p=>({...p,[k]:v}));
  const busy = !!loading.bookings;

  useEffect(()=>{ dispatch(fetchBookings({})); },[dispatch]);

  const totalRev = bookings.data.filter(b=>b.status==='CONFIRMED').reduce((s,b)=>s+b.finalAmount,0);

  return (
    <Box>
      <PageHeader title="My Bookings" subtitle={`${bookings.total} total bookings`}
        action={
          <Button variant="contained" startIcon={<Add/>} size="small" onClick={()=>setOpen(true)}
            sx={{ bgcolor:A.primary, textTransform:'none', fontWeight:600, borderRadius:'8px', fontSize:13 }}>
            New Booking
          </Button>
        }
      />
      <Grid container spacing={1.5} mb={2.5}>
        {[
          { label:'Confirmed', value:bookings.data.filter(b=>b.status==='CONFIRMED').length, accent:A.green,   icon:<Receipt/> },
          { label:'Pending',   value:bookings.data.filter(b=>b.status==='PENDING').length,   accent:A.amber,   icon:<Receipt/> },
          { label:'Revenue',   value:INR(totalRev), accent:A.primary, icon:<Receipt/> },
        ].map(c=><Grid item xs={4} key={c.label}><StatCard {...c} loading={busy} compact sub={undefined}/></Grid>)}
      </Grid>

      {bookings.data.map((b:Booking)=>{
        const c = STATUS_COLOR[b.status]??A.textSub;
        const unitLabel = b.unit?.unitNumber ? `${b.unit.unitNumber} · ${b.unit?.floorRef?.tower?.project?.name??''}` : '—';
        return (
          <Box key={b.id} sx={{ bgcolor:A.surfaceHigh, borderRadius:'12px', p:1.75, mb:1.25, border:`1px solid ${A.border}` }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={0.75}>
              <Box>
                <Typography sx={{ color:A.text, fontSize:13.5, fontWeight:600 }}>{b.customerName}</Typography>
                <Typography sx={{ color:A.textSub, fontSize:12 }}>{b.customerPhone}</Typography>
              </Box>
              <Box textAlign="right">
                <Chip label={b.status} size="small" sx={{ fontSize:10, height:20, bgcolor:`${c}15`, color:c, fontWeight:600 }}/>
                <Typography sx={{ color:A.primary, fontSize:13, fontWeight:700, mt:0.25 }}>{INR(b.finalAmount)}</Typography>
              </Box>
            </Box>
            <Typography sx={{ color:A.textSub, fontSize:12 }}>📦 {unitLabel}</Typography>
            <Typography sx={{ color:A.muted, fontSize:11, mt:0.5 }}>Booked {DATE(b.createdAt)}</Typography>
          </Box>
        );
      })}

      {bookings.data.length===0 && !busy && (
        <Box py={6} textAlign="center"><Typography sx={{ color:A.textSub, fontSize:14 }}>No bookings yet</Typography></Box>
      )}

      <Dialog open={open} onClose={()=>setOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx:{ bgcolor:A.surface, border:`1px solid ${A.border}`, borderRadius:'14px' } }}>
        <DialogTitle sx={{ color:A.text, fontWeight:700, fontSize:15, pb:1 }}>Create Booking</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={0.25}>
            {[['leadId','Lead ID *'],['unitId','Unit ID *'],['customerName','Customer Name *'],['customerPhone','Customer Phone *'],['customerEmail','Customer Email']].map(([k,l])=>(
              <Grid item xs={k==='customerEmail'?12:6} key={k}>
                <TextField fullWidth size="small" label={l} value={(form as any)[k]} onChange={e=>set(k,e.target.value)} sx={fieldSx} InputLabelProps={{ sx:labelSx }}/>
              </Grid>
            ))}
            <Grid item xs={6}><TextField fullWidth size="small" label="Total Amount (₹) *" type="number" value={form.totalAmount} onChange={e=>set('totalAmount',e.target.value)} sx={fieldSx} InputLabelProps={{ sx:labelSx }}/></Grid>
            <Grid item xs={6}><TextField fullWidth size="small" label="Discount Amount (₹)" type="number" value={form.discountAmount} onChange={e=>set('discountAmount',e.target.value)} sx={fieldSx} InputLabelProps={{ sx:labelSx }}/></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px:3, pb:2.5, gap:1 }}>
          <Button onClick={()=>setOpen(false)} sx={{ color:A.textSub, textTransform:'none', fontSize:13 }}>Cancel</Button>
          <Button variant="contained" disabled={!form.leadId||!form.unitId||!form.customerName||!form.totalAmount}
            onClick={()=>{ dispatch(doCreateBooking({ ...form, totalAmount:+form.totalAmount, discountAmount:+form.discountAmount })); setOpen(false); }}
            sx={{ bgcolor:A.primary, textTransform:'none', fontWeight:600, borderRadius:'8px', fontSize:13 }}>
            Create Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
