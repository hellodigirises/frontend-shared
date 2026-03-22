import React, { useState, useEffect } from 'react';
import { Grid, TextField, Typography, Switch, Alert, FormControlLabel, Box } from '@mui/material';
import { NotificationsActiveOutlined } from '@mui/icons-material';
import { PageShell, SaveBar, Section } from './SettingsLayout';
import api from '../../../../api/axios';

interface NotifConfig {
  emailNotifications   : boolean;
  smsNotifications     : boolean;
  whatsappNotifications: boolean;
  pushNotifications    : boolean;
  leadAssigned         : boolean;
  taskDue              : boolean;
  paymentReceived      : boolean;
  installmentOverdue   : boolean;
  visitReminder        : boolean;
  bookingCreated       : boolean;
  commissionApproved   : boolean;
}

const BLANK_NOTIF: NotifConfig = {
  emailNotifications:true, smsNotifications:false, whatsappNotifications:true, pushNotifications:true,
  leadAssigned:true, taskDue:true, paymentReceived:true, installmentOverdue:true,
  visitReminder:true, bookingCreated:true, commissionApproved:true,
};

export function NotificationsPage() {
  const [form, setForm] = useState<NotifConfig>(BLANK_NOTIF);
  const [orig, setOrig] = useState<NotifConfig>(BLANK_NOTIF);
  const [saving,setSaving]=useState(false); 
  const [saved,setSaved]=useState(false);

  useEffect(()=>{ 
    api.get('/settings/notifications')
      .then(r=>{ 
        setForm({...BLANK_NOTIF,...r.data}); 
        setOrig({...BLANK_NOTIF,...r.data}); 
      })
      .catch(()=>{}); 
  },[]);

  const set=<K extends keyof NotifConfig>(k:K,v:NotifConfig[K])=>{ 
    setSaved(false); 
    setForm(f=>({...f,[k]:v})); 
  };

  const dirty=JSON.stringify(form)!==JSON.stringify(orig);

  const handleSave=async()=>{ 
    setSaving(true); 
    try{ 
      await api.put('/settings/notifications',form); 
      setOrig(form); 
      setSaved(true); 
      setTimeout(()=>setSaved(false),3000); 
    } catch(e){
      console.error(e);
    } finally {
      setSaving(false);
    } 
  };

  return (
    <PageShell title="Notifications" subtitle="Control which events trigger notifications and via which channel" icon={<NotificationsActiveOutlined/>}>
      {saved && <Alert severity="success" sx={{ mb:3, borderRadius:'12px', fontSize:13 }}>Notification settings saved ✓</Alert>}
      <Section title="Delivery Channels">
        <Grid container spacing={2}>
          {[
            { k:'emailNotifications',    l:'Email Notifications',    d:'Notifications via email (requires SMTP config)' },
            { k:'smsNotifications',      l:'SMS Notifications',       d:'SMS via Twilio or MSG91' },
            { k:'whatsappNotifications', l:'WhatsApp Notifications',  d:'WhatsApp Business API' },
            { k:'pushNotifications',     l:'In-App Push',             d:'Browser and mobile push notifications' },
          ].map(item=>(
            <Grid item xs={12} sm={6} key={item.k}>
              <Box display="flex" justifyContent="space-between" alignItems="center" p={2} sx={{ borderRadius:'12px', border:'1px solid #E2E8F0', height:'100%' }}>
                <Box>
                    <Typography sx={{fontWeight:700,fontSize:14,color:'#0F172A'}}>{item.l}</Typography>
                    <Typography sx={{fontSize:12.5,color:'#64748B'}}>{item.d}</Typography>
                </Box>
                <Switch checked={(form as any)[item.k]} onChange={e=>set(item.k as any,e.target.checked)} sx={{'& .Mui-checked + .MuiSwitch-track':{bgcolor:'#2563EB !important'}}}/>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Section>
      <Section title="Event Triggers" last>
        {[
          { k:'leadAssigned',      l:'New Lead Assigned',           d:'Notify agent when a lead is assigned to them' },
          { k:'taskDue',           l:'Task Due Reminder',           d:'Remind 1 day before and on task due date' },
          { k:'paymentReceived',   l:'Payment Received',            d:'Notify finance team on any payment' },
          { k:'installmentOverdue',l:'Installment Overdue',         d:'Alert when an installment passes its due date' },
          { k:'visitReminder',     l:'Site Visit Reminder',         d:'Remind agent and customer 2 hours before visit' },
          { k:'bookingCreated',    l:'New Booking Created',         d:'Notify sales manager on new confirmed booking' },
          { k:'commissionApproved',l:'Commission Approved/Paid',    d:'Notify channel partner on commission status' },
        ].map(item=>(
          <Box key={item.k} display="flex" justifyContent="space-between" alignItems="center" py={1.5} sx={{ borderBottom:'1px solid #F1F5F9' }}>
            <Box>
                <Typography sx={{fontSize:13.5,fontWeight:600,color:'#0F172A'}}>{item.l}</Typography>
                <Typography sx={{fontSize:12.5,color:'#64748B'}}>{item.d}</Typography>
            </Box>
            <Switch checked={(form as any)[item.k]} onChange={e=>set(item.k as any,e.target.checked)} size="small" sx={{'& .Mui-checked + .MuiSwitch-track':{bgcolor:'#2563EB !important'}}}/>
          </Box>
        ))}
      </Section>
      <SaveBar dirty={dirty} saving={saving} saved={saved} onSave={handleSave} onDiscard={()=>{setForm(orig);setSaved(false);}}/>
    </PageShell>
  );
}

export default NotificationsPage;
