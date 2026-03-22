// src/modules/settings/pages/PaymentConfigPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box, Grid, TextField, Typography, Alert, CircularProgress,
  Switch, InputAdornment,
} from '@mui/material';
import { PaymentOutlined } from '@mui/icons-material';
import { PageShell, SaveBar, SLabel, Section } from './SettingsLayout';
import api from '../../../../api/axios';

const F = { '& .MuiOutlinedInput-root':{ borderRadius:'10px', fontSize:13.5 } };

interface PaymentConfig {
  currency              : string;
  gstPercentage         : number;
  tdsPercentage         : number;
  latePaymentPenaltyPct : number;
  gracePeriodDays       : number;
  receiptPrefix         : string;
  invoicePrefix         : string;
  paymentPrefix         : string;
  enableAutoReceipts    : boolean;
  enableGstInvoice      : boolean;
  enableTdsDeduction    : boolean;
  enableLatePaymentAlert: boolean;
}

const BLANK: PaymentConfig = {
  currency:'INR', gstPercentage:5, tdsPercentage:1, latePaymentPenaltyPct:2,
  gracePeriodDays:7, receiptPrefix:'RCP', invoicePrefix:'INV', paymentPrefix:'PAY',
  enableAutoReceipts:true, enableGstInvoice:true, enableTdsDeduction:false, enableLatePaymentAlert:true,
};

export default function PaymentConfigPage() {
  const [form,    setForm]    = useState<PaymentConfig>(BLANK);
  const [orig,    setOrig]    = useState<PaymentConfig>(BLANK);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    api.get('/settings/payment').then(r=>{ 
      const d = r.data?.data ?? r.data;
      if (d) {
        setForm({...BLANK,...d}); 
        setOrig({...BLANK,...d}); 
      }
    }).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}><CircularProgress size={26}/></Box>;

  const set = <K extends keyof PaymentConfig>(k:K, v:PaymentConfig[K]) => { setSaved(false); setForm(f=>({...f,[k]:v})); };
  const dirty = JSON.stringify(form)!==JSON.stringify(orig);
  const handleSave = async () => {
    setSaving(true);
    try { await api.put('/settings/payment',form); setOrig(form); setSaved(true); setTimeout(()=>setSaved(false),3000); }
    catch(e){ console.error(e); } finally{ setSaving(false); }
  };

  const pct = (k: keyof PaymentConfig, label:string) => (
    <TextField fullWidth size="small" label={label} type="number" value={(form as any)[k]}
      onChange={e=>set(k,+e.target.value as any)} sx={F}
      InputProps={{ endAdornment:<InputAdornment position="end"><Typography sx={{color:'#94A3B8',fontSize:13}}>%</Typography></InputAdornment> }}/>
  );

  return (
    <PageShell title="Payment Config" subtitle="GST, TDS, late payment rules and document numbering" icon={<PaymentOutlined/>}>
      {saved && <Alert severity="success" sx={{ mb:3, borderRadius:'12px', fontSize:13 }}>Payment configuration saved ✓</Alert>}

      {/* Tax rates */}
      <Section title="Tax Configuration">
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={4}>{pct('gstPercentage','GST Percentage')}</Grid>
          <Grid item xs={12} sm={4}>{pct('tdsPercentage','TDS Percentage')}</Grid>
          <Grid item xs={12} sm={4}>{pct('latePaymentPenaltyPct','Late Penalty %/month')}</Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Grace Period (days)" type="number" value={form.gracePeriodDays}
              onChange={e=>set('gracePeriodDays',+e.target.value)} sx={F}
              helperText="Days after due date before penalty applies" FormHelperTextProps={{sx:{fontSize:11.5,mx:0}}}/>
          </Grid>
        </Grid>
      </Section>

      {/* Document numbering */}
      <Section title="Document Number Prefixes">
        <Typography sx={{ fontSize:13, color:'#64748B', mb:2 }}>
          Numbers are auto-generated as: <strong>PREFIX-YYYYMM-NNNNN</strong> (e.g. PAY-202503-00001)
        </Typography>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Payment Prefix" value={form.paymentPrefix} onChange={e=>set('paymentPrefix',e.target.value.toUpperCase())} sx={F}
              helperText={`e.g. ${form.paymentPrefix}-202503-00001`} FormHelperTextProps={{sx:{fontSize:11.5,mx:0,fontFamily:'monospace',color:'#94A3B8'}}}/>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Invoice Prefix" value={form.invoicePrefix} onChange={e=>set('invoicePrefix',e.target.value.toUpperCase())} sx={F}
              helperText={`e.g. ${form.invoicePrefix}-202503-00001`} FormHelperTextProps={{sx:{fontSize:11.5,mx:0,fontFamily:'monospace',color:'#94A3B8'}}}/>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Receipt Prefix" value={form.receiptPrefix} onChange={e=>set('receiptPrefix',e.target.value.toUpperCase())} sx={F}
              helperText={`e.g. ${form.receiptPrefix}-202503-00001`} FormHelperTextProps={{sx:{fontSize:11.5,mx:0,fontFamily:'monospace',color:'#94A3B8'}}}/>
          </Grid>
        </Grid>
      </Section>

      {/* Automations */}
      <Section title="Automations" last>
        {[
          { k:'enableAutoReceipts',    l:'Auto-generate PDF receipts on payment',    d:'Generates and stores a receipt immediately on payment creation' },
          { k:'enableGstInvoice',      l:'Include GST invoice with receipts',         d:'GST-compliant invoice attached to every receipt email' },
          { k:'enableTdsDeduction',    l:'Enable TDS deductions on commissions',      d:'Automatically deduct TDS when marking channel partner payments' },
          { k:'enableLatePaymentAlert',l:'Send late payment alerts',                  d:'Notify admin and customer when installments are overdue' },
        ].map(item=>(
          <Box key={item.k} display="flex" justifyContent="space-between" alignItems="center" py={1.5} sx={{ borderBottom:'1px solid #F1F5F9' }}>
            <Box>
              <Typography sx={{ fontSize:13.5, fontWeight:600, color:'#0F172A' }}>{item.l}</Typography>
              <Typography sx={{ fontSize:12.5, color:'#64748B' }}>{item.d}</Typography>
            </Box>
            <Switch checked={(form as any)[item.k]} onChange={e=>set(item.k as any,e.target.checked)} sx={{'& .Mui-checked + .MuiSwitch-track':{bgcolor:'#2563EB !important'}}}/>
          </Box>
        ))}
      </Section>

      <SaveBar dirty={dirty} saving={saving} saved={saved} onSave={handleSave} onDiscard={()=>{setForm(orig);setSaved(false);}}/>
    </PageShell>
  );
}
