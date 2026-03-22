import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Stack, Button, Grid, Chip, Card, Avatar,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress,
  Divider, IconButton, Tooltip, Tab, Tabs, Paper, Badge
} from '@mui/material';
import {
  LocationOnOutlined, AccessTimeOutlined, CheckCircleOutlined,
  CancelOutlined, CloseOutlined, WarningAmberOutlined, AddOutlined,
  CalendarMonthOutlined, PeopleOutlined, TrendingUpOutlined,
  ScheduleOutlined, GpsFixedOutlined, HomeOutlined, LaptopOutlined,
  FilterListOutlined, DownloadOutlined, RefreshOutlined,
  ArrowBackOutlined, ArrowForwardOutlined
} from '@mui/icons-material';

const FONT = "'Cormorant Garamond', 'Georgia', serif";
const BODY = "'Mulish', 'system-ui', sans-serif";

type AttStatus = 'Present' | 'Absent' | 'Late' | 'Half Day' | 'Leave';
type CheckType = 'Office' | 'Field' | 'Remote';

interface AttRecord {
  id: string; empId: string; empName: string; dept: string;
  date: string; checkIn?: string; checkOut?: string;
  location?: string; gps?: string; type: CheckType; status: AttStatus;
}

const STATUS_CFG: Record<AttStatus, { color:string; bg:string; dot:string }> = {
  Present:  { color:'#16a34a', bg:'#f0fdf4', dot:'#22c55e' },
  Absent:   { color:'#dc2626', bg:'#fef2f2', dot:'#ef4444' },
  Late:     { color:'#d97706', bg:'#fffbeb', dot:'#f59e0b' },
  'Half Day': { color:'#7c3aed', bg:'#f5f3ff', dot:'#8b5cf6' },
  Leave:    { color:'#0891b2', bg:'#ecfeff', dot:'#06b6d4' },
};
const TYPE_CFG: Record<CheckType, { color:string; icon:React.ReactNode }> = {
  Office: { color:'#2563eb', icon:<HomeOutlined sx={{ fontSize:13 }}/> },
  Field:  { color:'#059669', icon:<GpsFixedOutlined sx={{ fontSize:13 }}/> },
  Remote: { color:'#7c3aed', icon:<LaptopOutlined sx={{ fontSize:13 }}/> },
};

const avatarBg = (n:string) => ['#be185d','#7c3aed','#059669','#d97706','#2563eb'][n.charCodeAt(0)%5];
const initials  = (n:string) => n.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
const TODAY     = new Date().toISOString().split('T')[0];

const RECORDS: AttRecord[] = [
  { id:'A1', empId:'EMP-001', empName:'Rahul Sharma', dept:'Sales', date:TODAY, checkIn:'10:05 AM', checkOut:'07:12 PM', location:'Orchid Heights Site', gps:'18.5204, 73.8567', type:'Field', status:'Present' },
  { id:'A2', empId:'EMP-002', empName:'Priya Mehta', dept:'Sales', date:TODAY, checkIn:'09:55 AM', checkOut:'06:30 PM', location:'Head Office', type:'Office', status:'Present' },
  { id:'A3', empId:'EMP-003', empName:'Arjun Singh', dept:'Sales', date:TODAY, checkIn:'10:45 AM', location:'Green Valley Site', gps:'18.5060, 73.8144', type:'Field', status:'Late' },
  { id:'A4', empId:'EMP-004', empName:'Kavita Joshi', dept:'HR', date:TODAY, checkIn:'09:58 AM', checkOut:'05:45 PM', location:'Head Office', type:'Office', status:'Present' },
  { id:'A5', empId:'EMP-005', empName:'Rohan Gupta', dept:'Marketing', date:TODAY, type:'Office', status:'Leave' },
  { id:'A6', empId:'EMP-006', empName:'Sneha Patel', dept:'Finance', date:TODAY, checkIn:'09:30 AM', checkOut:'06:00 PM', location:'Remote', type:'Remote', status:'Present' },
  { id:'A7', empId:'EMP-007', empName:'Vikram Das', dept:'Sales', date:TODAY, checkIn:'09:00 AM', checkOut:'02:30 PM', location:'Orchid Heights Site', type:'Field', status:'Half Day' },
  { id:'A8', empId:'EMP-008', empName:'Meera Shah', dept:'Operations', date:TODAY, type:'Office', status:'Absent' },
  // Yesterday
  { id:'A9', empId:'EMP-001', empName:'Rahul Sharma', dept:'Sales', date:'2025-06-13', checkIn:'09:50 AM', checkOut:'06:45 PM', location:'Head Office', type:'Office', status:'Present' },
  { id:'A10', empId:'EMP-002', empName:'Priya Mehta', dept:'Sales', date:'2025-06-13', checkIn:'09:45 AM', checkOut:'07:00 PM', location:'Head Office', type:'Office', status:'Present' },
];

const TodaySummaryCard: React.FC<{ label:string; value:number; total:number; color:string; icon:React.ReactNode }> = ({ label, value, total, color, icon }) => (
  <Card sx={{ p:2.5, borderRadius:4, border:'1px solid', borderColor:`${color}20`, boxShadow:'none', bgcolor:`${color}06` }}>
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
      <Box>
        <Typography sx={{ fontSize:10, fontWeight:800, color:'#9ca3af', textTransform:'uppercase', letterSpacing:1, fontFamily:BODY }}>{label}</Typography>
        <Typography sx={{ fontFamily:FONT, fontSize:34, fontWeight:700, color, letterSpacing:-1.5, lineHeight:1, mt:0.3 }}>{value}</Typography>
      </Box>
      <Box sx={{ width:40, height:40, borderRadius:3, bgcolor:`${color}14`, display:'flex', alignItems:'center', justifyContent:'center', color }}>{icon}</Box>
    </Stack>
    <LinearProgress variant="determinate" value={(value/total)*100}
      sx={{ height:4, borderRadius:2, bgcolor:`${color}18`, '& .MuiLinearProgress-bar':{ bgcolor:color, borderRadius:2 } }} />
    <Typography sx={{ fontSize:10, color:'#9ca3af', fontFamily:BODY, mt:0.6 }}>{((value/total)*100).toFixed(0)}% of {total} employees</Typography>
  </Card>
);

const CheckInDialog: React.FC<{ open:boolean; onClose:()=>void; onSave:(r:Partial<AttRecord>)=>void }> = ({ open, onClose, onSave }) => {
  const [form, setForm] = useState<Partial<AttRecord>>({ type:'Office', status:'Present' });
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx:{ borderRadius:4 } }}>
      <Box sx={{ height:4, background:'linear-gradient(90deg, #059669, #0891b2)' }} />
      <DialogTitle sx={{ fontFamily:FONT, fontSize:22, fontWeight:700, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        Mark Attendance <IconButton onClick={onClose}><CloseOutlined /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} mt={0.5}>
          <Grid item xs={12}>
            <TextField label="Employee Name / ID" size="small" fullWidth value={form.empName||''}
              onChange={e=>setForm(p=>({...p,empName:e.target.value}))}
              sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2.5 } }} />
          </Grid>
          <Grid item xs={6}>
            <TextField label="Date" size="small" fullWidth type="date" InputLabelProps={{ shrink:true }}
              value={form.date||TODAY} onChange={e=>setForm(p=>({...p,date:e.target.value}))}
              sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2.5 } }} />
          </Grid>
          <Grid item xs={6}>
            <FormControl size="small" fullWidth>
              <InputLabel>Check-in Type</InputLabel>
              <Select value={form.type} label="Check-in Type" onChange={e=>setForm(p=>({...p,type:e.target.value as CheckType}))} sx={{ borderRadius:2.5 }}>
                {['Office','Field','Remote'].map(t=><MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField label="Check-in Time" size="small" fullWidth type="time" InputLabelProps={{ shrink:true }}
              value={form.checkIn||''} onChange={e=>setForm(p=>({...p,checkIn:e.target.value}))}
              sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2.5 } }} />
          </Grid>
          <Grid item xs={6}>
            <TextField label="Check-out Time" size="small" fullWidth type="time" InputLabelProps={{ shrink:true }}
              value={form.checkOut||''} onChange={e=>setForm(p=>({...p,checkOut:e.target.value}))}
              sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2.5 } }} />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Location / Site Name" size="small" fullWidth value={form.location||''}
              onChange={e=>setForm(p=>({...p,location:e.target.value}))}
              InputProps={{ startAdornment:<LocationOnOutlined sx={{ fontSize:16, color:'#9ca3af', mr:0.5 }}/> }}
              sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2.5 } }} />
          </Grid>
          <Grid item xs={12}>
            <FormControl size="small" fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={form.status} label="Status" onChange={e=>setForm(p=>({...p,status:e.target.value as AttStatus}))} sx={{ borderRadius:2.5 }}>
                {['Present','Absent','Late','Half Day','Leave'].map(s=><MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px:3, pb:3 }}>
        <Button onClick={onClose} sx={{ textTransform:'none', fontWeight:700, color:'#6b7280' }}>Cancel</Button>
        <Button variant="contained" onClick={()=>{ onSave(form); onClose(); }}
          sx={{ textTransform:'none', fontWeight:800, borderRadius:2.5, bgcolor:'#059669','&:hover':{ bgcolor:'#047857' }, boxShadow:'none' }}>
          Save Record
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const AttendancePage: React.FC = () => {
  const [records, setRecords]     = useState<AttRecord[]>(RECORDS);
  const [dateView, setDateView]   = useState(TODAY);
  const [tab, setTab]             = useState(0);
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [checkInOpen, setCheckInOpen] = useState(false);

  const todayRecords  = useMemo(() => records.filter(r=>r.date===dateView && (deptFilter==='ALL'||r.dept===deptFilter) && (statusFilter==='ALL'||r.status===statusFilter)), [records, dateView, deptFilter, statusFilter]);
  const totalEmp = 8;

  const summary = useMemo(() => ({
    present:  todayRecords.filter(r=>r.status==='Present').length,
    absent:   todayRecords.filter(r=>r.status==='Absent').length,
    late:     todayRecords.filter(r=>r.status==='Late').length,
    halfDay:  todayRecords.filter(r=>r.status==='Half Day').length,
    onLeave:  todayRecords.filter(r=>r.status==='Leave').length,
    field:    todayRecords.filter(r=>r.type==='Field').length,
  }), [todayRecords]);

  const navigateDate = (dir:1|-1) => {
    const d = new Date(dateView); d.setDate(d.getDate()+dir);
    setDateView(d.toISOString().split('T')[0]);
  };

  const addRecord = (r: Partial<AttRecord>) => {
    setRecords(p => [...p, { ...r as AttRecord, id:`A${Date.now()}` }]);
  };

  // Weekly stats per employee
  const weeklyStats = useMemo(() => {
    const names = [...new Set(records.map(r=>r.empName))];
    return names.map(name => {
      const emp = records.filter(r=>r.empName===name);
      return {
        name,
        dept: emp[0]?.dept,
        present: emp.filter(r=>r.status==='Present').length,
        total: emp.length,
        lateCount: emp.filter(r=>r.status==='Late').length,
      };
    });
  }, [records]);

  return (
    <Box sx={{ bgcolor:'#f7faf9', minHeight:'100vh', pb:8, fontFamily:BODY }}>

      {/* ── HEADER ── */}
      <Box sx={{
        px:{ xs:3, md:5 }, pt:5, pb:4,
        background:'linear-gradient(135deg, #052e16 0%, #14532d 50%, #0a2218 100%)',
        position:'relative', overflow:'hidden'
      }}>
        <Box sx={{ position:'absolute', top:-80, right:-60, width:280, height:280, borderRadius:'50%', bgcolor:'#22c55e12', pointerEvents:'none' }} />
        <Stack direction={{ xs:'column', md:'row' }} justifyContent="space-between" alignItems={{ md:'flex-end' }} spacing={3}>
          <Box>
            <Typography sx={{ fontFamily:FONT, fontSize:40, fontWeight:700, color:'white', letterSpacing:-1.5, lineHeight:0.9 }}>Attendance</Typography>
            <Typography sx={{ fontFamily:FONT, fontSize:40, fontWeight:700, letterSpacing:-1.5, lineHeight:1, color:'#86efac' }}>& Check-in</Typography>
            <Typography sx={{ fontFamily:BODY, fontSize:13, color:'#4ade8060', mt:1.5 }}>
              GPS-verified field attendance · Real-time tracking
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button startIcon={<DownloadOutlined />}
              sx={{ textTransform:'none', fontWeight:700, fontFamily:BODY, borderRadius:2.5, color:'#86efac90', border:'1px solid #14532d','&:hover':{ bgcolor:'#14532d', color:'#86efac' } }}>
              Export
            </Button>
            <Button variant="contained" startIcon={<AddOutlined />} onClick={()=>setCheckInOpen(true)}
              sx={{ textTransform:'none', fontWeight:800, fontFamily:BODY, borderRadius:2.5, bgcolor:'#16a34a','&:hover':{ bgcolor:'#15803d' }, boxShadow:'0 4px 14px #16a34a40' }}>
              Mark Attendance
            </Button>
          </Stack>
        </Stack>
        <Grid container spacing={2} mt={3}>
          {[
            { label:'Present Today', value:summary.present, total:totalEmp, color:'#86efac', icon:<CheckCircleOutlined/> },
            { label:'Absent', value:summary.absent, total:totalEmp, color:'#fca5a5', icon:<CancelOutlined/> },
            { label:'Late Arrivals', value:summary.late, total:totalEmp, color:'#fde68a', icon:<ScheduleOutlined/> },
            { label:'Field Check-ins', value:summary.field, total:totalEmp, color:'#6ee7b7', icon:<GpsFixedOutlined/> },
          ].map(s => (
            <Grid item xs={6} sm={3} key={s.label}>
              <Box sx={{ p:2, borderRadius:3, bgcolor:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography sx={{ fontSize:9.5, fontWeight:800, color:'#4ade8060', textTransform:'uppercase', letterSpacing:1, fontFamily:BODY }}>{s.label}</Typography>
                    <Typography sx={{ fontFamily:FONT, fontSize:30, fontWeight:700, color:s.color, letterSpacing:-1, lineHeight:1.1, mt:0.3 }}>{s.value}</Typography>
                  </Box>
                  <Box sx={{ color:s.color, opacity:0.5 }}>{s.icon}</Box>
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ── TABS + DATE NAV ── */}
      <Box sx={{ bgcolor:'white', borderBottom:'1px solid #e5e7eb', px:{ xs:3, md:5 }, position:'sticky', top:0, zIndex:10 }}>
        <Stack direction={{ xs:'column', sm:'row' }} justifyContent="space-between" alignItems={{ sm:'center' }}>
          <Tabs value={tab} onChange={(_,v)=>setTab(v)}
            sx={{ '& .MuiTab-root':{ textTransform:'none', fontWeight:700, fontFamily:BODY, minHeight:48 }, '& .MuiTabs-indicator':{ bgcolor:'#16a34a', height:2.5 }, '& .Mui-selected':{ color:'#16a34a !important' } }}>
            <Tab label="Daily View" />
            <Tab label="Employee Summary" />
          </Tabs>
          <Stack direction="row" spacing={1} alignItems="center" py={1}>
            <IconButton size="small" onClick={()=>navigateDate(-1)} sx={{ border:'1px solid #e5e7eb', borderRadius:2 }}><ArrowBackOutlined fontSize="small"/></IconButton>
            <Typography sx={{ fontWeight:800, fontFamily:BODY, fontSize:13, minWidth:120, textAlign:'center', color:'#374151' }}>
              {new Date(dateView).toLocaleDateString('en-IN',{ weekday:'short', day:'numeric', month:'short' })}
              {dateView===TODAY && <Chip label="Today" size="small" sx={{ ml:1, fontSize:9, height:17, bgcolor:'#dcfce7', color:'#16a34a', fontWeight:800 }} />}
            </Typography>
            <IconButton size="small" onClick={()=>navigateDate(1)} sx={{ border:'1px solid #e5e7eb', borderRadius:2 }}><ArrowForwardOutlined fontSize="small"/></IconButton>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ px:{ xs:3, md:5 }, pt:3 }}>
        {/* Filters */}
        <Stack direction="row" spacing={1.5} mb={3} flexWrap="wrap" alignItems="center">
          {[
            { label:'Department', value:deptFilter, set:setDeptFilter, opts:['Sales','Marketing','Finance','HR','Operations'] },
            { label:'Status', value:statusFilter, set:setStatusFilter, opts:['Present','Absent','Late','Half Day','Leave'] },
          ].map(f=>(
            <FormControl key={f.label} size="small" sx={{ minWidth:130 }}>
              <InputLabel sx={{ fontFamily:BODY }}>{f.label}</InputLabel>
              <Select value={f.value} label={f.label} onChange={e=>f.set(e.target.value)} sx={{ borderRadius:2.5, fontFamily:BODY, bgcolor:'white' }}>
                <MenuItem value="ALL" sx={{ fontFamily:BODY }}>All</MenuItem>
                {f.opts.map(o=><MenuItem key={o} value={o} sx={{ fontFamily:BODY }}>{o}</MenuItem>)}
              </Select>
            </FormControl>
          ))}
          <Typography sx={{ fontSize:12, color:'#9ca3af', fontFamily:BODY, fontWeight:600 }}>{todayRecords.length} records</Typography>
        </Stack>

        {/* Daily Table */}
        {tab === 0 && (
          <Card sx={{ borderRadius:4, border:'1px solid #e5e7eb', boxShadow:'none', overflow:'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor:'#f9fafb' }}>
                    {['Employee','Check-in','Check-out','Location','Type','Hours','Status'].map(h=>(
                      <TableCell key={h} sx={{ fontWeight:800, fontSize:10.5, color:'#9ca3af', textTransform:'uppercase', letterSpacing:0.8, fontFamily:BODY, py:1.8, borderBottom:'1px solid #f3f4f6' }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {todayRecords.length===0
                    ? <TableRow><TableCell colSpan={7} align="center" sx={{ py:8, color:'#9ca3af', fontFamily:BODY }}>No records for this date</TableCell></TableRow>
                    : todayRecords.map(r=>{
                      const sc = STATUS_CFG[r.status];
                      const tc = TYPE_CFG[r.type];
                      const calcHours = (cin:string|undefined, cout:string|undefined) => {
                        if (!cin || !cout) return '—';
                        const parseT = (t:string) => { const [h,m] = t.replace(/ (AM|PM)/,'').split(':').map(Number); const isPM = t.includes('PM')&&h!==12; return h*60+m+(isPM?720:0); };
                        const diff = parseT(cout)-parseT(cin);
                        return `${Math.floor(diff/60)}h ${diff%60}m`;
                      };
                      return (
                        <TableRow key={r.id} hover sx={{ '& td':{ py:1.4, borderBottom:'1px solid #f9fafb', fontFamily:BODY }, '&:hover':{ bgcolor:'#f9fafb' } }}>
                          <TableCell>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Avatar sx={{ width:32, height:32, bgcolor:avatarBg(r.empName), fontSize:11, fontWeight:800 }}>{initials(r.empName)}</Avatar>
                              <Box>
                                <Typography sx={{ fontWeight:800, fontSize:13, fontFamily:BODY }}>{r.empName}</Typography>
                                <Typography sx={{ fontSize:10.5, color:'#9ca3af', fontFamily:BODY }}>{r.dept}</Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            {r.checkIn ? <Stack direction="row" spacing={0.5} alignItems="center"><AccessTimeOutlined sx={{ fontSize:12, color:'#22c55e' }}/><Typography sx={{ fontSize:12.5, fontFamily:BODY, fontWeight:700 }}>{r.checkIn}</Typography></Stack>
                            : <Typography sx={{ color:'#d1d5db', fontFamily:BODY }}>—</Typography>}
                          </TableCell>
                          <TableCell>
                            {r.checkOut ? <Stack direction="row" spacing={0.5} alignItems="center"><AccessTimeOutlined sx={{ fontSize:12, color:'#6b7280' }}/><Typography sx={{ fontSize:12.5, fontFamily:BODY }}>{r.checkOut}</Typography></Stack>
                            : <Typography sx={{ color:'#d1d5db', fontFamily:BODY }}>—</Typography>}
                          </TableCell>
                          <TableCell>
                            {r.location
                              ? <Stack direction="row" spacing={0.5} alignItems="center">
                                  <LocationOnOutlined sx={{ fontSize:12, color: r.gps ? '#059669':'#9ca3af' }} />
                                  <Typography sx={{ fontSize:11.5, fontFamily:BODY, color:'#374151' }}>{r.location}</Typography>
                                  {r.gps && <Chip label="GPS" size="small" sx={{ fontSize:8, height:14, bgcolor:'#dcfce7', color:'#16a34a', fontWeight:800 }}/>}
                                </Stack>
                              : <Typography sx={{ color:'#d1d5db', fontFamily:BODY }}>—</Typography>}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display:'inline-flex', alignItems:'center', gap:0.5, px:1, py:0.3, borderRadius:1.5, bgcolor:`${tc.color}12`, color:tc.color }}>
                              {tc.icon}
                              <Typography sx={{ fontSize:10.5, fontWeight:800, fontFamily:BODY }}>{r.type}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize:12.5, fontWeight:700, fontFamily:BODY, color:'#374151' }}>{calcHours(r.checkIn,r.checkOut)}</Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display:'inline-flex', alignItems:'center', gap:0.5, px:1.2, py:0.4, borderRadius:1.5, bgcolor:sc.bg }}>
                              <Box sx={{ width:6, height:6, borderRadius:'50%', bgcolor:sc.dot }}/>
                              <Typography sx={{ fontSize:10.5, fontWeight:800, color:sc.color, fontFamily:BODY }}>{r.status}</Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  }
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}

        {/* Employee Summary */}
        {tab === 1 && (
          <Grid container spacing={2.5}>
            {weeklyStats.map(emp => (
              <Grid item xs={12} sm={6} md={4} key={emp.name}>
                <Card sx={{ p:3, borderRadius:4, border:'1px solid #e5e7eb', boxShadow:'none' }}>
                  <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                    <Avatar sx={{ width:40, height:40, bgcolor:avatarBg(emp.name), fontWeight:800, fontSize:14 }}>{initials(emp.name)}</Avatar>
                    <Box flex={1}>
                      <Typography sx={{ fontFamily:BODY, fontWeight:800, fontSize:14 }}>{emp.name}</Typography>
                      <Typography sx={{ fontFamily:BODY, fontSize:11, color:'#9ca3af' }}>{emp.dept}</Typography>
                    </Box>
                    {emp.lateCount > 0 && <Chip label={`${emp.lateCount} late`} size="small" sx={{ fontSize:10, bgcolor:'#fffbeb', color:'#d97706', fontWeight:800 }} />}
                  </Stack>
                  <Stack direction="row" spacing={1} mb={1.5} justifyContent="space-between">
                    {[
                      { label:'Present', val:emp.present, color:'#16a34a' },
                      { label:'Total Days', val:emp.total, color:'#6b7280' },
                      { label:'Rate', val:`${emp.total>0?Math.round((emp.present/emp.total)*100):0}%`, color:'#2563eb' },
                    ].map(m=>(
                      <Box key={m.label} sx={{ textAlign:'center', flex:1, p:1, borderRadius:2, bgcolor:'#f9fafb' }}>
                        <Typography sx={{ fontFamily:FONT, fontSize:20, fontWeight:700, color:m.color, letterSpacing:-0.5 }}>{m.val}</Typography>
                        <Typography sx={{ fontSize:9.5, fontWeight:800, color:'#9ca3af', fontFamily:BODY, textTransform:'uppercase' }}>{m.label}</Typography>
                      </Box>
                    ))}
                  </Stack>
                  <LinearProgress variant="determinate" value={emp.total>0?(emp.present/emp.total)*100:0}
                    sx={{ height:5, borderRadius:3, bgcolor:'#f3f4f6', '& .MuiLinearProgress-bar':{ borderRadius:3, bgcolor: emp.total>0&&emp.present/emp.total>=0.9?'#16a34a':'#f59e0b' } }} />
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <CheckInDialog open={checkInOpen} onClose={()=>setCheckInOpen(false)} onSave={addRecord} />
    </Box>
  );
};

export default AttendancePage;