import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Stack, Button, Grid, Chip, IconButton, Card,
  Avatar, TextField, InputAdornment, FormControl, InputLabel,
  Select, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogActions, Divider, Tab, Tabs, LinearProgress, Tooltip,
  Badge, Paper
} from '@mui/material';
import {
  AddOutlined, SearchOutlined, FilterListOutlined, DownloadOutlined,
  EditOutlined, DeleteOutlineOutlined, VisibilityOutlined,
  PhoneOutlined, EmailOutlined, LocationOnOutlined, CloseOutlined,
  PeopleOutlined, PersonOutlined, WorkOutlined, TrendingUpOutlined,
  BadgeOutlined, CalendarMonthOutlined, MoreVertOutlined,
  CheckCircleOutlined, BlockOutlined, TimelapseOutlined,
  BusinessCenterOutlined, StarOutlined
} from '@mui/icons-material';

const FONT = "'Cormorant Garamond', 'Georgia', serif";
const BODY = "'Mulish', 'system-ui', sans-serif";

type EmpStatus = 'Active' | 'Inactive' | 'On Leave' | 'Terminated';
type EmpType   = 'Full-time' | 'Contract' | 'Intern' | 'Sales Agent';
type Dept      = 'Sales' | 'Marketing' | 'Finance' | 'HR' | 'Operations';

interface Employee {
  id: string; empId: string; name: string; email: string; phone: string;
  role: string; department: Dept; manager: string; joiningDate: string;
  type: EmpType; status: EmpStatus; avatar?: string;
  leads?: number; bookings?: number; revenue?: number;
}

const STATUS_CFG: Record<EmpStatus, { color: string; bg: string; dot: string }> = {
  'Active':     { color: '#16a34a', bg: '#f0fdf4', dot: '#22c55e' },
  'Inactive':   { color: '#6b7280', bg: '#f3f4f6', dot: '#9ca3af' },
  'On Leave':   { color: '#d97706', bg: '#fffbeb', dot: '#f59e0b' },
  'Terminated': { color: '#dc2626', bg: '#fef2f2', dot: '#ef4444' },
};
const TYPE_CFG: Record<EmpType, { color: string; bg: string }> = {
  'Full-time':   { color: '#2563eb', bg: '#eff6ff' },
  'Contract':    { color: '#7c3aed', bg: '#f5f3ff' },
  'Intern':      { color: '#0891b2', bg: '#ecfeff' },
  'Sales Agent': { color: '#be185d', bg: '#fdf2f8' },
};
const DEPT_COLORS: Record<Dept, string> = {
  Sales: '#be185d', Marketing: '#7c3aed', Finance: '#059669', HR: '#d97706', Operations: '#2563eb',
};

const avatarBg = (n: string) => ['#be185d','#7c3aed','#059669','#d97706','#2563eb','#0891b2'][n.charCodeAt(0)%6];
const initials  = (n: string) => n.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
const fmtCr     = (n: number) => n>=10000000?`₹${(n/10000000).toFixed(1)}Cr`:n>=100000?`₹${(n/100000).toFixed(1)}L`:`₹${(n/1000).toFixed(0)}K`;

const EMPLOYEES: Employee[] = [
  { id:'E1', empId:'EMP-001', name:'Rahul Sharma', email:'rahul@example.com', phone:'9876543210', role:'Sales Agent', department:'Sales', manager:'Amit Singh', joiningDate:'2024-03-02', type:'Sales Agent', status:'Active', leads:120, bookings:8, revenue:42000000 },
  { id:'E2', empId:'EMP-002', name:'Priya Mehta', email:'priya@example.com', phone:'9876543211', role:'Sales Manager', department:'Sales', manager:'CEO', joiningDate:'2023-06-15', type:'Full-time', status:'Active', leads:340, bookings:22, revenue:88000000 },
  { id:'E3', empId:'EMP-003', name:'Arjun Singh', email:'arjun@example.com', phone:'9876543212', role:'Sales Agent', department:'Sales', manager:'Priya Mehta', joiningDate:'2024-01-10', type:'Sales Agent', status:'Active', leads:95, bookings:6, revenue:24000000 },
  { id:'E4', empId:'EMP-004', name:'Kavita Joshi', email:'kavita@example.com', phone:'9876543213', role:'HR Executive', department:'HR', manager:'HR Head', joiningDate:'2023-09-01', type:'Full-time', status:'Active' },
  { id:'E5', empId:'EMP-005', name:'Rohan Gupta', email:'rohan@example.com', phone:'9876543214', role:'Marketing Executive', department:'Marketing', manager:'Marketing Head', joiningDate:'2024-02-20', type:'Contract', status:'On Leave' },
  { id:'E6', empId:'EMP-006', name:'Sneha Patel', email:'sneha@example.com', phone:'9876543215', role:'Finance Analyst', department:'Finance', manager:'CFO', joiningDate:'2023-11-01', type:'Full-time', status:'Active' },
  { id:'E7', empId:'EMP-007', name:'Vikram Das', email:'vikram@example.com', phone:'9876543216', role:'Sales Intern', department:'Sales', manager:'Priya Mehta', joiningDate:'2024-05-01', type:'Intern', status:'Active', leads:30, bookings:1, revenue:4000000 },
  { id:'E8', empId:'EMP-008', name:'Meera Shah', email:'meera@example.com', phone:'9876543217', role:'Operations Manager', department:'Operations', manager:'COO', joiningDate:'2022-08-15', type:'Full-time', status:'Inactive' },
];

const StatTile: React.FC<{ label:string; value:string|number; color:string; icon:React.ReactNode; sub?:string }> = ({ label, value, color, icon, sub }) => (
  <Card sx={{ p:2.5, borderRadius:3.5, border:'1px solid', borderColor:`${color}20`, boxShadow:'none', bgcolor:`${color}06`, height:'100%' }}>
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
      <Box>
        <Typography sx={{ fontSize:10, fontWeight:800, color:'#9ca3af', textTransform:'uppercase', letterSpacing:1, fontFamily:BODY }}>{label}</Typography>
        <Typography sx={{ fontFamily:FONT, fontSize:32, fontWeight:700, color, letterSpacing:-1, lineHeight:1, mt:0.5 }}>{value}</Typography>
        {sub && <Typography sx={{ fontSize:11, color:'#9ca3af', fontFamily:BODY, mt:0.5 }}>{sub}</Typography>}
      </Box>
      <Box sx={{ width:42, height:42, borderRadius:3, bgcolor:`${color}14`, display:'flex', alignItems:'center', justifyContent:'center', color }}>{icon}</Box>
    </Stack>
  </Card>
);

const EmployeeCard: React.FC<{ emp:Employee; onClick:()=>void; onEdit:()=>void; onDelete:()=>void }> = ({ emp, onClick, onEdit, onDelete }) => {
  const sc = STATUS_CFG[emp.status];
  const tc = TYPE_CFG[emp.type];
  return (
    <Card sx={{ borderRadius:4, border:'1px solid #f3f0eb', boxShadow:'none', overflow:'hidden', cursor:'pointer', transition:'all 0.2s', '&:hover':{ boxShadow:'0 8px 32px rgba(0,0,0,0.08)', transform:'translateY(-2px)', borderColor:`${DEPT_COLORS[emp.department]}40` } }}>
      <Box sx={{ height:4, bgcolor:DEPT_COLORS[emp.department] }} />
      <Box sx={{ p:2.5 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Avatar sx={{ width:48, height:48, bgcolor:avatarBg(emp.name), fontWeight:800, fontFamily:BODY, fontSize:16, flexShrink:0 }}>
            {initials(emp.name)}
          </Avatar>
          <Box flex={1} minWidth={0} onClick={onClick}>
            <Typography sx={{ fontFamily:BODY, fontWeight:800, fontSize:14, color:'#1a1210', lineHeight:1.2 }}>{emp.name}</Typography>
            <Typography sx={{ fontFamily:BODY, fontSize:11.5, color:'#9ca3af', mt:0.2 }}>{emp.role}</Typography>
            <Stack direction="row" spacing={0.8} mt={1} flexWrap="wrap">
              <Box sx={{ display:'inline-flex', alignItems:'center', gap:0.5, px:1, py:0.25, borderRadius:1.5, bgcolor:sc.bg }}>
                <Box sx={{ width:5, height:5, borderRadius:'50%', bgcolor:sc.dot }} />
                <Typography sx={{ fontSize:10, fontWeight:800, color:sc.color, fontFamily:BODY }}>{emp.status}</Typography>
              </Box>
              <Box sx={{ px:1, py:0.25, borderRadius:1.5, bgcolor:tc.bg }}>
                <Typography sx={{ fontSize:10, fontWeight:800, color:tc.color, fontFamily:BODY }}>{emp.type}</Typography>
              </Box>
            </Stack>
          </Box>
          <Stack spacing={0.3}>
            <Tooltip title="View Profile"><IconButton size="small" onClick={onClick} sx={{ color:'#9ca3af','&:hover':{ color:'#be185d', bgcolor:'#fdf2f8' } }}><VisibilityOutlined sx={{ fontSize:15 }}/></IconButton></Tooltip>
            <Tooltip title="Edit"><IconButton size="small" onClick={onEdit} sx={{ color:'#9ca3af','&:hover':{ color:'#2563eb', bgcolor:'#eff6ff' } }}><EditOutlined sx={{ fontSize:15 }}/></IconButton></Tooltip>
            <Tooltip title="Delete"><IconButton size="small" onClick={onDelete} sx={{ color:'#9ca3af','&:hover':{ color:'#ef4444', bgcolor:'#fef2f2' } }}><DeleteOutlineOutlined sx={{ fontSize:15 }}/></IconButton></Tooltip>
          </Stack>
        </Stack>
        <Divider sx={{ my:1.5, borderColor:'#f3f0eb' }} />
        <Grid container spacing={1}>
          {[
            { icon:<EmailOutlined sx={{ fontSize:11 }}/>, val:emp.email },
            { icon:<PhoneOutlined sx={{ fontSize:11 }}/>, val:emp.phone },
            { icon:<WorkOutlined sx={{ fontSize:11 }}/>, val:emp.department },
            { icon:<CalendarMonthOutlined sx={{ fontSize:11 }}/>, val:new Date(emp.joiningDate).toLocaleDateString('en-IN',{ day:'numeric', month:'short', year:'numeric' }) },
          ].map((r,i) => (
            <Grid item xs={6} key={i}>
              <Stack direction="row" spacing={0.6} alignItems="center">
                <Box sx={{ color:'#c4b8a8' }}>{r.icon}</Box>
                <Typography sx={{ fontSize:10.5, color:'#6b7280', fontFamily:BODY }} noWrap>{r.val}</Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
        {emp.department === 'Sales' && emp.bookings !== undefined && (
          <>
            <Divider sx={{ my:1.5, borderColor:'#f3f0eb' }} />
            <Grid container spacing={1}>
              {[
                { label:'Leads', val:emp.leads, color:'#7c3aed' },
                { label:'Bookings', val:emp.bookings, color:'#059669' },
                { label:'Revenue', val:emp.revenue ? fmtCr(emp.revenue) : '—', color:'#be185d' },
              ].map(m => (
                <Grid item xs={4} key={m.label}>
                  <Box sx={{ textAlign:'center', p:0.8, borderRadius:2, bgcolor:'#faf8f6' }}>
                    <Typography sx={{ fontFamily:FONT, fontSize:18, fontWeight:700, color:m.color, letterSpacing:-0.5, lineHeight:1 }}>{m.val}</Typography>
                    <Typography sx={{ fontSize:9, fontWeight:800, color:'#9ca3af', fontFamily:BODY, textTransform:'uppercase', letterSpacing:0.5 }}>{m.label}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Box>
    </Card>
  );
};

const EmployeeDetailDialog: React.FC<{ emp:Employee|null; open:boolean; onClose:()=>void }> = ({ emp, open, onClose }) => {
  const [tab, setTab] = useState(0);
  if (!emp) return null;
  const sc = STATUS_CFG[emp.status];
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx:{ borderRadius:4, overflow:'hidden' } }}>
      <Box sx={{ height:5, bgcolor:DEPT_COLORS[emp.department] }} />
      <DialogTitle sx={{ pb:0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Stack direction="row" spacing={2.5} alignItems="center">
            <Avatar sx={{ width:56, height:56, bgcolor:avatarBg(emp.name), fontWeight:800, fontSize:20, fontFamily:BODY }}>{initials(emp.name)}</Avatar>
            <Box>
              <Typography sx={{ fontFamily:FONT, fontSize:24, fontWeight:700, color:'#1a1210', letterSpacing:-0.5 }}>{emp.name}</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography sx={{ fontFamily:BODY, fontSize:13, color:'#6b7280' }}>{emp.role} · {emp.department}</Typography>
                <Box sx={{ display:'inline-flex', alignItems:'center', gap:0.5, px:1, py:0.2, borderRadius:1.5, bgcolor:sc.bg }}>
                  <Box sx={{ width:5, height:5, borderRadius:'50%', bgcolor:sc.dot }} />
                  <Typography sx={{ fontSize:10, fontWeight:800, color:sc.color, fontFamily:BODY }}>{emp.status}</Typography>
                </Box>
              </Stack>
            </Box>
          </Stack>
          <IconButton onClick={onClose}><CloseOutlined /></IconButton>
        </Stack>
        <Tabs value={tab} onChange={(_,v)=>setTab(v)} sx={{ mt:2, '& .MuiTab-root':{ textTransform:'none', fontWeight:700, fontFamily:BODY, fontSize:13 }, '& .MuiTabs-indicator':{ bgcolor:'#be185d', height:2.5 }, '& .Mui-selected':{ color:'#be185d !important' } }}>
          {['Profile','Attendance','Leaves','Payroll','Performance','Documents'].map(t => <Tab key={t} label={t} />)}
        </Tabs>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ minHeight:300, pt:3 }}>
        {tab === 0 && (
          <Grid container spacing={3}>
            {[
              { label:'Employee ID', val:emp.empId },
              { label:'Department', val:emp.department },
              { label:'Manager', val:emp.manager },
              { label:'Employment Type', val:emp.type },
              { label:'Joining Date', val:new Date(emp.joiningDate).toLocaleDateString('en-IN',{ day:'numeric', month:'long', year:'numeric' }) },
              { label:'Phone', val:emp.phone },
              { label:'Email', val:emp.email },
            ].map(r => (
              <Grid item xs={6} key={r.label}>
                <Typography sx={{ fontSize:10, fontWeight:800, color:'#9ca3af', textTransform:'uppercase', letterSpacing:0.8, fontFamily:BODY, mb:0.3 }}>{r.label}</Typography>
                <Typography sx={{ fontWeight:700, fontSize:14, fontFamily:BODY, color:'#1a1210' }}>{r.val}</Typography>
              </Grid>
            ))}
          </Grid>
        )}
        {tab === 4 && emp.department === 'Sales' && (
          <Grid container spacing={2.5}>
            {[
              { label:'Total Leads', val:emp.leads??0, color:'#7c3aed', max:150 },
              { label:'Site Visits', val:Math.floor((emp.leads??0)*0.4), color:'#2563eb', max:80 },
              { label:'Bookings Closed', val:emp.bookings??0, color:'#059669', max:20 },
              { label:'Revenue Generated', val:emp.revenue?fmtCr(emp.revenue):'₹0', color:'#be185d' },
            ].map(m => (
              <Grid item xs={6} key={m.label}>
                <Box sx={{ p:2.5, borderRadius:3, bgcolor:'#faf8f6', border:'1px solid #f3f0eb' }}>
                  <Typography sx={{ fontSize:10, fontWeight:800, color:'#9ca3af', textTransform:'uppercase', letterSpacing:0.8, fontFamily:BODY }}>{m.label}</Typography>
                  <Typography sx={{ fontFamily:FONT, fontSize:28, fontWeight:700, color:m.color, letterSpacing:-1, mt:0.3 }}>{m.val}</Typography>
                  {m.max && typeof m.val === 'number' && (
                    <LinearProgress variant="determinate" value={(m.val/m.max)*100}
                      sx={{ mt:1, height:4, borderRadius:2, bgcolor:'#e5e0d9', '& .MuiLinearProgress-bar':{ bgcolor:m.color, borderRadius:2 } }} />
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
        {tab !== 0 && tab !== 4 && (
          <Box sx={{ textAlign:'center', py:6 }}>
            <Typography sx={{ color:'#9ca3af', fontFamily:BODY, fontWeight:600 }}>Navigate to dedicated {['','Attendance','Leave','Payroll','','Documents'][tab]} page for full details.</Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(EMPLOYEES);
  const [search, setSearch]       = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter]   = useState('ALL');
  const [viewMode, setViewMode]   = useState<'grid'|'list'>('grid');
  const [selected, setSelected]   = useState<Employee|null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [addOpen, setAddOpen]     = useState(false);
  const [newEmp, setNewEmp]       = useState<Partial<Employee>>({ type:'Full-time', status:'Active', department:'Sales' });

  const filtered = useMemo(() => employees.filter(e => {
    const q = search.toLowerCase();
    return (
      (!q || e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q) || e.empId.toLowerCase().includes(q)) &&
      (deptFilter === 'ALL' || e.department === deptFilter) &&
      (statusFilter === 'ALL' || e.status === statusFilter) &&
      (typeFilter === 'ALL' || e.type === typeFilter)
    );
  }), [employees, search, deptFilter, statusFilter, typeFilter]);

  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status==='Active').length,
    onLeave: employees.filter(e => e.status==='On Leave').length,
    salesAgents: employees.filter(e => e.department==='Sales').length,
  };

  const saveEmployee = () => {
    if (!newEmp.name) return;
    setEmployees(p => [...p, { ...newEmp as Employee, id:`E${Date.now()}`, empId:`EMP-${String(p.length+1).padStart(3,'0')}` }]);
    setAddOpen(false);
    setNewEmp({ type:'Full-time', status:'Active', department:'Sales' });
  };

  return (
    <Box sx={{ bgcolor:'#fdfaf7', minHeight:'100vh', pb:8, fontFamily:BODY }}>

      {/* ── HEADER ── */}
      <Box sx={{
        px:{ xs:3, md:5 }, pt:5, pb:4.5,
        background:'linear-gradient(135deg, #1a0e0a 0%, #3d1a0f 50%, #1a120a 100%)',
        position:'relative', overflow:'hidden'
      }}>
        <Box sx={{ position:'absolute', top:-80, right:-80, width:300, height:300, borderRadius:'50%', bgcolor:'#be185d14', pointerEvents:'none' }} />
        <Box sx={{ position:'absolute', bottom:-60, left:'30%', width:200, height:200, borderRadius:'50%', bgcolor:'#d9770610', pointerEvents:'none' }} />
        <Stack direction={{ xs:'column', md:'row' }} justifyContent="space-between" alignItems={{ md:'flex-end' }} spacing={3}>
          <Box>
            <Typography sx={{ fontFamily:FONT, fontSize:40, fontWeight:700, color:'white', letterSpacing:-1.5, lineHeight:0.9 }}>
              Employee
            </Typography>
            <Typography sx={{ fontFamily:FONT, fontSize:40, fontWeight:700, letterSpacing:-1.5, lineHeight:1, color:'#f9a8d4' }}>
              Management
            </Typography>
            <Typography sx={{ fontFamily:BODY, fontSize:13, color:'#78716c', mt:1.5 }}>
              {stats.active} active employees · Real estate sales team
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button startIcon={<DownloadOutlined />}
              sx={{ textTransform:'none', fontWeight:700, fontFamily:BODY, borderRadius:2.5, color:'#a8a29e', border:'1px solid #3a2a24', '&:hover':{ bgcolor:'#2a1a14', color:'white' } }}>
              Export
            </Button>
            <Button variant="contained" startIcon={<AddOutlined />} onClick={()=>setAddOpen(true)}
              sx={{ textTransform:'none', fontWeight:800, fontFamily:BODY, borderRadius:2.5, bgcolor:'#be185d', '&:hover':{ bgcolor:'#9d174d' }, boxShadow:'0 4px 14px #be185d40' }}>
              Add Employee
            </Button>
          </Stack>
        </Stack>
        <Grid container spacing={2} mt={3} sx={{ position:'relative' }}>
          {[
            { label:'Total Employees', value:stats.total, color:'#f9a8d4', icon:<PeopleOutlined/> },
            { label:'Active', value:stats.active, color:'#86efac', icon:<CheckCircleOutlined/> },
            { label:'On Leave', value:stats.onLeave, color:'#fde68a', icon:<TimelapseOutlined/> },
            { label:'Sales Team', value:stats.salesAgents, color:'#c4b5fd', icon:<BusinessCenterOutlined/> },
          ].map(s => (
            <Grid item xs={6} sm={3} key={s.label}>
              <Box sx={{ p:2, borderRadius:3, bgcolor:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography sx={{ fontSize:9.5, fontWeight:800, color:'#6b7280', textTransform:'uppercase', letterSpacing:1, fontFamily:BODY }}>{s.label}</Typography>
                    <Typography sx={{ fontFamily:FONT, fontSize:30, fontWeight:700, color:s.color, letterSpacing:-1, lineHeight:1.1, mt:0.3 }}>{s.value}</Typography>
                  </Box>
                  <Box sx={{ color:s.color, opacity:0.5 }}>{s.icon}</Box>
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ── FILTERS ── */}
      <Box sx={{ px:{ xs:3, md:5 }, py:2.5, bgcolor:'white', borderBottom:'1px solid #f3f0eb', position:'sticky', top:0, zIndex:10 }}>
        <Stack direction={{ xs:'column', sm:'row' }} spacing={1.5} alignItems={{ sm:'center' }}>
          <TextField placeholder="Search name, role, ID…" size="small" value={search} onChange={e=>setSearch(e.target.value)}
            InputProps={{ startAdornment:<InputAdornment position="start"><SearchOutlined sx={{ fontSize:16, color:'#9ca3af' }}/></InputAdornment>, sx:{ borderRadius:2.5, fontFamily:BODY } }}
            sx={{ flex:1, maxWidth:300 }} />
          {[
            { label:'Department', value:deptFilter, set:setDeptFilter, opts:['Sales','Marketing','Finance','HR','Operations'] },
            { label:'Status', value:statusFilter, set:setStatusFilter, opts:['Active','Inactive','On Leave','Terminated'] },
            { label:'Type', value:typeFilter, set:setTypeFilter, opts:['Full-time','Contract','Intern','Sales Agent'] },
          ].map(f => (
            <FormControl key={f.label} size="small" sx={{ minWidth:130 }}>
              <InputLabel sx={{ fontFamily:BODY }}>{f.label}</InputLabel>
              <Select value={f.value} label={f.label} onChange={e=>f.set(e.target.value)} sx={{ borderRadius:2.5, fontFamily:BODY }}>
                <MenuItem value="ALL" sx={{ fontFamily:BODY }}>All {f.label}s</MenuItem>
                {f.opts.map(o=><MenuItem key={o} value={o} sx={{ fontFamily:BODY }}>{o}</MenuItem>)}
              </Select>
            </FormControl>
          ))}
          <Typography sx={{ fontSize:12, color:'#9ca3af', fontFamily:BODY, fontWeight:600, ml:'auto', flexShrink:0 }}>{filtered.length} employees</Typography>
        </Stack>
      </Box>

      {/* ── GRID ── */}
      <Box sx={{ px:{ xs:3, md:5 }, pt:3.5 }}>
        {/* Department breakdown */}
        <Stack direction="row" spacing={1} mb={3} flexWrap="wrap">
          {Object.entries(DEPT_COLORS).map(([dept, color]) => {
            const count = employees.filter(e=>e.department===dept).length;
            return (
              <Box key={dept} onClick={()=>setDeptFilter(deptFilter===dept?'ALL':dept)} sx={{ display:'inline-flex', alignItems:'center', gap:0.8, px:1.8, py:0.8, borderRadius:10, border:'1px solid', borderColor:deptFilter===dept?color:'#e8e2da', bgcolor:deptFilter===dept?`${color}10`:'white', cursor:'pointer', transition:'all 0.15s', '&:hover':{ borderColor:color } }}>
                <Box sx={{ width:7, height:7, borderRadius:'50%', bgcolor:color }} />
                <Typography sx={{ fontSize:11.5, fontWeight:700, fontFamily:BODY, color:deptFilter===dept?color:'#6b7280' }}>{dept}</Typography>
                <Typography sx={{ fontSize:11, fontWeight:800, fontFamily:BODY, color:deptFilter===dept?color:'#9ca3af' }}>{count}</Typography>
              </Box>
            );
          })}
        </Stack>

        <Grid container spacing={2.5}>
          {filtered.map(emp => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={emp.id}>
              <EmployeeCard emp={emp} onClick={()=>{ setSelected(emp); setDetailOpen(true); }} onEdit={()=>{}} onDelete={()=>setEmployees(p=>p.filter(e=>e.id!==emp.id))} />
            </Grid>
          ))}
          {filtered.length === 0 && (
            <Grid item xs={12}>
              <Box sx={{ textAlign:'center', py:10 }}>
                <PeopleOutlined sx={{ fontSize:60, color:'#e8e2da' }} />
                <Typography sx={{ fontFamily:BODY, color:'#9ca3af', fontWeight:700, mt:1.5 }}>No employees match filters</Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Detail Dialog */}
      <EmployeeDetailDialog emp={selected} open={detailOpen} onClose={()=>setDetailOpen(false)} />

      {/* Add Dialog */}
      <Dialog open={addOpen} onClose={()=>setAddOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx:{ borderRadius:4 } }}>
        <Box sx={{ height:5, bgcolor:'#be185d' }} />
        <DialogTitle sx={{ fontFamily:FONT, fontSize:22, fontWeight:700, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          Add Employee <IconButton onClick={()=>setAddOpen(false)}><CloseOutlined /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={0.5}>
            {[
              { label:'Full Name', key:'name', xs:12 },
              { label:'Email', key:'email', xs:6 },
              { label:'Phone', key:'phone', xs:6 },
              { label:'Role / Designation', key:'role', xs:6 },
              { label:'Manager', key:'manager', xs:6 },
              { label:'Joining Date', key:'joiningDate', xs:6, type:'date' },
            ].map(f => (
              <Grid item xs={f.xs} key={f.key}>
                <TextField label={f.label} size="small" fullWidth type={f.type||'text'} InputLabelProps={f.type?{ shrink:true }:{}}
                  value={(newEmp as any)[f.key]||''} onChange={e=>setNewEmp(p=>({...p,[f.key]:e.target.value}))}
                  sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2.5, fontFamily:BODY } }} />
              </Grid>
            ))}
            {[
              { label:'Department', key:'department', opts:['Sales','Marketing','Finance','HR','Operations'] },
              { label:'Employment Type', key:'type', opts:['Full-time','Contract','Intern','Sales Agent'] },
              { label:'Status', key:'status', opts:['Active','Inactive'] },
            ].map(f => (
              <Grid item xs={4} key={f.key}>
                <FormControl size="small" fullWidth>
                  <InputLabel sx={{ fontFamily:BODY }}>{f.label}</InputLabel>
                  <Select value={(newEmp as any)[f.key]||''} label={f.label} onChange={e=>setNewEmp(p=>({...p,[f.key]:e.target.value}))} sx={{ borderRadius:2.5, fontFamily:BODY }}>
                    {f.opts.map(o=><MenuItem key={o} value={o} sx={{ fontFamily:BODY }}>{o}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px:3, pb:3 }}>
          <Button onClick={()=>setAddOpen(false)} sx={{ textTransform:'none', fontFamily:BODY, fontWeight:700, color:'#6b7280' }}>Cancel</Button>
          <Button variant="contained" onClick={saveEmployee} disabled={!newEmp.name}
            sx={{ textTransform:'none', fontWeight:800, fontFamily:BODY, borderRadius:2.5, bgcolor:'#be185d','&:hover':{ bgcolor:'#9d174d' }, boxShadow:'none' }}>
            Save Employee
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeesPage;