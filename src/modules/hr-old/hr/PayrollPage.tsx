import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Stack, Button, Grid, Card, Avatar,
  FormControl, InputLabel, Select, MenuItem, LinearProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider,
  IconButton, Tooltip, Chip
} from '@mui/material';
import {
  DownloadOutlined, VisibilityOutlined, CloseOutlined,
  PlayArrowOutlined, AttachMoneyOutlined, TrendingUpOutlined,
  PeopleOutlined, AccountBalanceOutlined
} from '@mui/icons-material';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const FONT = "'Cormorant Garamond', 'Georgia', serif";
const BODY = "'Mulish', 'system-ui', sans-serif";

// ─── Types ─────────────────────────────────────────────────────────────────────
type PayrollStatus = 'Paid' | 'Pending' | 'Processing';

interface PayrollEntry {
  id: string; empId: string; empName: string; dept: string; role: string;
  month: string; base: number; commission: number; bonus: number;
  deductions: number; tax: number; net: number; status: PayrollStatus;
}

// ─── Config ────────────────────────────────────────────────────────────────────
const PS_CFG: Record<PayrollStatus, { color: string; bg: string; dot: string }> = {
  Paid:       { color: '#16a34a', bg: '#f0fdf4', dot: '#22c55e' },
  Pending:    { color: '#d97706', bg: '#fffbeb', dot: '#f59e0b' },
  Processing: { color: '#2563eb', bg: '#eff6ff', dot: '#3b82f6' },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmtINR   = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const fmtCr    = (n: number) => n >= 10000000 ? `₹${(n/10000000).toFixed(1)}Cr` : n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : fmtINR(n);
const avatarBg = (n: string) => ['#be185d','#7c3aed','#059669','#d97706','#2563eb'][n.charCodeAt(0) % 5];
const initials  = (n: string) => n.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const PAYROLL_DATA: PayrollEntry[] = [
  { id:'P1', empId:'EMP-001', empName:'Rahul Sharma',  dept:'Sales',      role:'Sales Agent',      month:'Jun 2025', base:25000, commission:50000, bonus:10000, deductions:3500,  tax:4200,  net:77300,  status:'Pending' },
  { id:'P2', empId:'EMP-002', empName:'Priya Mehta',   dept:'Sales',      role:'Sales Manager',    month:'Jun 2025', base:45000, commission:95000, bonus:20000, deductions:8000,  tax:15200, net:136800, status:'Pending' },
  { id:'P3', empId:'EMP-003', empName:'Arjun Singh',   dept:'Sales',      role:'Sales Agent',      month:'Jun 2025', base:25000, commission:30000, bonus:5000,  deductions:3000,  tax:3600,  net:53400,  status:'Pending' },
  { id:'P4', empId:'EMP-004', empName:'Kavita Joshi',  dept:'HR',         role:'HR Executive',     month:'Jun 2025', base:35000, commission:0,     bonus:3000,  deductions:4000,  tax:3400,  net:30600,  status:'Paid' },
  { id:'P5', empId:'EMP-005', empName:'Rohan Gupta',   dept:'Marketing',  role:'Mktg Executive',   month:'Jun 2025', base:30000, commission:0,     bonus:2000,  deductions:3200,  tax:2880,  net:25920,  status:'Processing' },
  { id:'P6', empId:'EMP-006', empName:'Sneha Patel',   dept:'Finance',    role:'Finance Analyst',  month:'Jun 2025', base:40000, commission:0,     bonus:5000,  deductions:5000,  tax:4500,  net:35500,  status:'Paid' },
  { id:'P7', empId:'EMP-007', empName:'Vikram Das',    dept:'Sales',      role:'Sales Intern',     month:'Jun 2025', base:15000, commission:5000,  bonus:0,     deductions:1500,  tax:1000,  net:17500,  status:'Pending' },
  { id:'P8', empId:'EMP-008', empName:'Meera Shah',    dept:'Operations', role:'Ops Manager',      month:'Jun 2025', base:42000, commission:0,     bonus:4000,  deductions:5000,  tax:4100,  net:36900,  status:'Pending' },
];

// ─── Salary Breakdown Bar ──────────────────────────────────────────────────────
const SalaryBar: React.FC<{ base: number; commission: number; bonus: number; total: number }> = ({ base, commission, bonus, total }) => (
  <Box sx={{ height: 6, borderRadius: 3, overflow: 'hidden', display: 'flex', bgcolor: '#f3f4f6' }}>
    <Box sx={{ width: `${(base/total)*100}%`, bgcolor: '#2563eb', transition: 'width 0.4s' }} />
    <Box sx={{ width: `${(commission/total)*100}%`, bgcolor: '#be185d', transition: 'width 0.4s' }} />
    <Box sx={{ width: `${(bonus/total)*100}%`, bgcolor: '#059669', transition: 'width 0.4s' }} />
  </Box>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
const PayrollPage: React.FC = () => {
  const [payroll, setPayroll]           = useState<PayrollEntry[]>(PAYROLL_DATA);
  const [monthFilter, setMonthFilter]   = useState('Jun 2025');
  const [deptFilter, setDeptFilter]     = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selected, setSelected]         = useState<PayrollEntry | null>(null);

  const filtered = useMemo(() => payroll.filter(p =>
    (deptFilter === 'ALL' || p.dept === deptFilter) &&
    (statusFilter === 'ALL' || p.status === statusFilter)
  ), [payroll, deptFilter, statusFilter]);

  const totals = {
    net:        filtered.reduce((s, p) => s + p.net, 0),
    commission: filtered.reduce((s, p) => s + p.commission, 0),
    bonus:      filtered.reduce((s, p) => s + p.bonus, 0),
    base:       filtered.reduce((s, p) => s + p.base, 0),
  };

  const markPaid = (id: string) => setPayroll(p => p.map(x => x.id === id ? { ...x, status: 'Paid' as PayrollStatus } : x));

  return (
    <Box sx={{ bgcolor: '#fffdf7', minHeight: '100vh', pb: 8, fontFamily: BODY }}>

      {/* ── HEADER ── */}
      <Box sx={{
        px: { xs: 3, md: 5 }, pt: 5, pb: 4,
        background: 'linear-gradient(135deg, #1c1408 0%, #3d2a08 55%, #1a1406 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', top: -60, right: -60, width: 260, height: 260, borderRadius: '50%', bgcolor: '#fbbf2412', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -40, left: '35%', width: 200, height: 200, borderRadius: '50%', bgcolor: '#f59e0b08', pointerEvents: 'none' }} />
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'flex-end' }} spacing={3}>
          <Box>
            <Typography sx={{ fontFamily: FONT, fontSize: 42, fontWeight: 700, color: 'white', letterSpacing: -1.5, lineHeight: 0.9 }}>Payroll &</Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: 42, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1, color: '#fde68a' }}>Incentives</Typography>
            <Typography sx={{ fontFamily: BODY, fontSize: 13, color: '#fbbf2440', mt: 1.5 }}>
              Commission-linked · Auto-calculated from bookings · Payslip export
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button startIcon={<DownloadOutlined />}
              sx={{ textTransform: 'none', fontWeight: 700, fontFamily: BODY, borderRadius: 2.5, color: '#fde68a80', border: '1px solid #3d2a08', '&:hover': { bgcolor: '#3d2a08', color: '#fde68a' } }}>
              Export Payslips
            </Button>
            <Button variant="contained" startIcon={<PlayArrowOutlined />}
              sx={{ textTransform: 'none', fontWeight: 800, fontFamily: BODY, borderRadius: 2.5, bgcolor: '#d97706', '&:hover': { bgcolor: '#b45309' }, boxShadow: '0 4px 14px #d9770640' }}>
              Run Payroll
            </Button>
          </Stack>
        </Stack>

        {/* KPI tiles */}
        <Grid container spacing={2} mt={3}>
          {[
            { label: 'Total Net Payout',  value: fmtCr(totals.net),        color: '#fde68a', icon: <AccountBalanceOutlined sx={{ fontSize: 20 }} /> },
            { label: 'Commission Pool',   value: fmtCr(totals.commission),  color: '#fca5a5', icon: <TrendingUpOutlined sx={{ fontSize: 20 }} /> },
            { label: 'Bonus Pool',        value: fmtCr(totals.bonus),       color: '#86efac', icon: <AttachMoneyOutlined sx={{ fontSize: 20 }} /> },
            { label: 'Employees',         value: filtered.length,           color: '#c4b5fd', icon: <PeopleOutlined sx={{ fontSize: 20 }} /> },
          ].map(s => (
            <Grid item xs={6} sm={3} key={s.label}>
              <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography sx={{ fontSize: 9.5, fontWeight: 800, color: '#d9770640', textTransform: 'uppercase', letterSpacing: 1, fontFamily: BODY }}>{s.label}</Typography>
                    <Typography sx={{ fontFamily: FONT, fontSize: 24, fontWeight: 700, color: s.color, letterSpacing: -1, lineHeight: 1.1, mt: 0.3 }}>{s.value}</Typography>
                  </Box>
                  <Box sx={{ color: s.color, opacity: 0.4 }}>{s.icon}</Box>
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ── SALARY LEGEND ── */}
      <Box sx={{ px: { xs: 3, md: 5 }, pt: 2.5, pb: 0.5 }}>
        <Stack direction="row" spacing={3} flexWrap="wrap">
          {[{ label: 'Base Salary', color: '#2563eb' }, { label: 'Commission', color: '#be185d' }, { label: 'Bonus', color: '#059669' }].map(l => (
            <Stack key={l.label} direction="row" spacing={0.8} alignItems="center">
              <Box sx={{ width: 10, height: 10, borderRadius: 1.5, bgcolor: l.color }} />
              <Typography sx={{ fontSize: 11.5, fontFamily: BODY, fontWeight: 600, color: '#6b7280' }}>{l.label}</Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* ── FILTERS ── */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #fde68a30', px: { xs: 3, md: 5 }, py: 2, position: 'sticky', top: 0, zIndex: 10 }}>
        <Stack direction="row" spacing={1.5} flexWrap="wrap" alignItems="center">
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel sx={{ fontFamily: BODY }}>Month</InputLabel>
            <Select value={monthFilter} label="Month" onChange={e => setMonthFilter(e.target.value)} sx={{ borderRadius: 2.5, fontFamily: BODY }}>
              {['Jun 2025', 'May 2025', 'Apr 2025', 'Mar 2025'].map(m => (
                <MenuItem key={m} value={m} sx={{ fontFamily: BODY }}>{m}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel sx={{ fontFamily: BODY }}>Department</InputLabel>
            <Select value={deptFilter} label="Department" onChange={e => setDeptFilter(e.target.value)} sx={{ borderRadius: 2.5, fontFamily: BODY }}>
              <MenuItem value="ALL" sx={{ fontFamily: BODY }}>All Departments</MenuItem>
              {['Sales', 'Marketing', 'Finance', 'HR', 'Operations'].map(d => (
                <MenuItem key={d} value={d} sx={{ fontFamily: BODY }}>{d}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel sx={{ fontFamily: BODY }}>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)} sx={{ borderRadius: 2.5, fontFamily: BODY }}>
              <MenuItem value="ALL" sx={{ fontFamily: BODY }}>All Statuses</MenuItem>
              {(['Paid', 'Pending', 'Processing'] as PayrollStatus[]).map(s => (
                <MenuItem key={s} value={s} sx={{ fontFamily: BODY }}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box flex={1} />
          <Typography sx={{ fontSize: 12, color: '#9ca3af', fontFamily: BODY, fontWeight: 600 }}>
            {filtered.filter(p => p.status === 'Pending').length} pending · {filtered.filter(p => p.status === 'Paid').length} paid
          </Typography>
        </Stack>
      </Box>

      {/* ── TABLE ── */}
      <Box sx={{ px: { xs: 3, md: 5 }, pt: 3 }}>
        <Card sx={{ borderRadius: 4, border: '1px solid #fde68a30', boxShadow: 'none', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#fffbeb' }}>
                  {['Employee', 'Role', 'Base', 'Commission', 'Bonus', 'Tax', 'Net Salary', 'Breakdown', 'Status', ''].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 800, fontSize: 10.5, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: BODY, py: 1.8, borderBottom: '1px solid #fef9c3' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map(p => {
                  const sc = PS_CFG[p.status];
                  const gross = p.base + p.commission + p.bonus;
                  return (
                    <TableRow key={p.id} hover sx={{ '& td': { py: 1.5, borderBottom: '1px solid #fef9c3', fontFamily: BODY }, '&:hover': { bgcolor: '#fffde7' } }}>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar sx={{ width: 34, height: 34, bgcolor: avatarBg(p.empName), fontSize: 12, fontWeight: 800 }}>{initials(p.empName)}</Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 800, fontSize: 13, fontFamily: BODY, color: '#111827' }}>{p.empName}</Typography>
                            <Typography sx={{ fontSize: 10.5, color: '#9ca3af', fontFamily: BODY }}>{p.dept}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 11.5, color: '#6b7280', fontFamily: BODY }}>{p.role}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 12.5, fontFamily: BODY, color: '#2563eb', fontWeight: 700 }}>{fmtINR(p.base)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: '#be185d', fontFamily: BODY }}>
                          {p.commission > 0 ? fmtINR(p.commission) : <Box component="span" sx={{ color: '#e5e7eb' }}>—</Box>}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#059669', fontFamily: BODY }}>
                          {p.bonus > 0 ? fmtINR(p.bonus) : <Box component="span" sx={{ color: '#e5e7eb' }}>—</Box>}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 12, color: '#dc2626', fontFamily: BODY }}>-{fmtINR(p.tax)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 15, fontWeight: 900, color: '#d97706', fontFamily: FONT, letterSpacing: -0.5 }}>{fmtINR(p.net)}</Typography>
                      </TableCell>
                      <TableCell sx={{ minWidth: 100 }}>
                        <SalaryBar base={p.base} commission={p.commission} bonus={p.bonus} total={gross} />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.2, py: 0.4, borderRadius: 1.5, bgcolor: sc.bg }}>
                          <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: sc.dot }} />
                          <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: sc.color, fontFamily: BODY }}>{p.status}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="View Payslip">
                            <IconButton size="small" onClick={() => setSelected(p)} sx={{ color: '#9ca3af', '&:hover': { color: '#d97706', bgcolor: '#fffbeb' } }}>
                              <VisibilityOutlined sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                          {p.status === 'Pending' && (
                            <Button size="small" onClick={() => markPaid(p.id)}
                              sx={{ textTransform: 'none', fontWeight: 700, fontFamily: BODY, fontSize: 11, color: '#16a34a', border: '1px solid #86efac', borderRadius: 1.5, px: 1.2, '&:hover': { bgcolor: '#f0fdf4' } }}>
                              Pay Now
                            </Button>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ px: 3, py: 2, bgcolor: '#fffbeb', borderTop: '1px solid #fde68a40' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography sx={{ fontSize: 12, color: '#9ca3af', fontFamily: BODY }}>{filtered.length} employees · {monthFilter}</Typography>
              <Typography sx={{ fontFamily: FONT, fontSize: 17, fontWeight: 700, color: '#d97706' }}>
                Total Payout: {fmtINR(totals.net)}
              </Typography>
            </Stack>
          </Box>
        </Card>
      </Box>

      {/* ── PAYSLIP DIALOG ── */}
      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}>
        <Box sx={{ height: 5, background: 'linear-gradient(90deg, #d97706, #f59e0b)' }} />
        <DialogTitle sx={{ fontFamily: FONT, fontSize: 22, fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Payslip — {selected?.month}
          <IconButton onClick={() => setSelected(null)}><CloseOutlined /></IconButton>
        </DialogTitle>
        <DialogContent>
          {selected && (
            <Box>
              <Stack direction="row" spacing={2} alignItems="center" mb={2.5}>
                <Avatar sx={{ width: 50, height: 50, bgcolor: avatarBg(selected.empName), fontWeight: 800, fontSize: 17 }}>{initials(selected.empName)}</Avatar>
                <Box>
                  <Typography sx={{ fontFamily: BODY, fontWeight: 800, fontSize: 15, color: '#111827' }}>{selected.empName}</Typography>
                  <Typography sx={{ fontFamily: BODY, fontSize: 12, color: '#9ca3af' }}>{selected.dept} · {selected.empId}</Typography>
                </Box>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              {[
                { label: 'Basic Salary',    val: fmtINR(selected.base),       color: '#2563eb' },
                { label: 'Commission',      val: fmtINR(selected.commission),  color: '#be185d' },
                { label: 'Bonus',           val: fmtINR(selected.bonus),       color: '#059669' },
                { label: 'Gross Earnings',  val: fmtINR(selected.base + selected.commission + selected.bonus), color: '#111827', bold: true },
                { label: 'Deductions',      val: `-${fmtINR(selected.deductions)}`, color: '#dc2626' },
                { label: 'Tax (TDS)',       val: `-${fmtINR(selected.tax)}`,   color: '#dc2626' },
              ].map(r => (
                <Stack key={r.label} direction="row" justifyContent="space-between" py={0.9}
                  sx={{ borderBottom: '1px solid #f9fafb', bgcolor: r.bold ? '#fffbeb' : 'transparent', px: r.bold ? 1 : 0, borderRadius: r.bold ? 1 : 0 }}>
                  <Typography sx={{ fontSize: 13, fontFamily: BODY, color: '#6b7280', fontWeight: r.bold ? 800 : 500 }}>{r.label}</Typography>
                  <Typography sx={{ fontSize: 13, fontFamily: BODY, fontWeight: r.bold ? 900 : 700, color: r.color }}>{r.val}</Typography>
                </Stack>
              ))}
              <Stack direction="row" justifyContent="space-between" mt={2} pt={1.5} sx={{ borderTop: '2px solid #fde68a' }}>
                <Typography sx={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, color: '#1a1210' }}>Net Salary</Typography>
                <Typography sx={{ fontFamily: FONT, fontSize: 24, fontWeight: 700, color: '#d97706' }}>{fmtINR(selected.net)}</Typography>
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setSelected(null)} sx={{ textTransform: 'none', fontWeight: 700, fontFamily: BODY, color: '#6b7280' }}>Close</Button>
          <Button variant="contained" startIcon={<DownloadOutlined />}
            sx={{ textTransform: 'none', fontWeight: 800, fontFamily: BODY, borderRadius: 2.5, bgcolor: '#d97706', '&:hover': { bgcolor: '#b45309' }, boxShadow: 'none' }}>
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PayrollPage;