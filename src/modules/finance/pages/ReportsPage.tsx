// src/modules/finance/pages/ReportsPage.tsx
import React, { useState } from 'react';
import {
  Box, Grid, Button, TextField, Tabs, Tab, Typography,
  Select, MenuItem, FormControl, InputLabel, LinearProgress,
  CircularProgress,
} from '@mui/material';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Assessment, Download } from '@mui/icons-material';
import { F, INR, DATE, fieldSx, labelSx, selSx } from '../hooks';
import { PageHeader, Card, DataTable, StatCard, StatusBadge, AmountCell } from '../components/ui';
import { financeApi } from '../api/finance.api';

const GRID  = { stroke: 'rgba(79,127,255,0.06)', strokeDasharray: '4 3' };
const AXIS  = { fill: F.textSub, fontSize: 11 };
const TIP   = { background: F.surfaceHigh, border: `1px solid ${F.border}`, borderRadius: 8, fontSize: 12 };
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MFULL  = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const now    = new Date();
const defFrom = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`;
const defTo   = now.toISOString().split('T')[0];

export default function ReportsPage() {
  const [tab,  setTab]  = useState(0);
  const [from, setFrom] = useState(defFrom);
  const [to,   setTo]   = useState(defTo);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year,  setYear]  = useState(now.getFullYear());
  const [loading, setLoading] = useState(false);

  // Report data
  const [collections,  setCollections]  = useState<any[]>([]);
  const [pl,           setPl]           = useState<any>(null);
  const [gst,          setGst]          = useState<any>(null);
  const [payroll,      setPayroll]      = useState<any[]>([]);
  const [installments, setInstallments] = useState<any[]>([]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      if (tab === 0) {
        const [c, i] = await Promise.all([
          financeApi.get('/reports/collections',  { params: { from, to } }),
          financeApi.get('/reports/installments', { params: { from, to } }),
        ]);
        setCollections(c.data.data ?? []);
        setInstallments(i.data.data ?? []);
      } else if (tab === 1) {
        const r = await financeApi.get('/reports/profit-loss', { params: { from, to } });
        setPl(r.data.data);
      } else if (tab === 2) {
        const r = await financeApi.get('/reports/gst', { params: { month, year } });
        setGst(r.data.data);
      } else {
        const r = await financeApi.get('/reports/payroll-expenses', { params: { month, year } });
        setPayroll(r.data.data ?? []);
      }
    } finally { setLoading(false); }
  };

  // Aggregate collections by date for chart
  const collectionsByDate = collections.reduce((acc: any, r: any) => {
    const key = r.date;
    if (!acc[key]) acc[key] = { date: r.date, total: 0, txns: 0 };
    acc[key].total += r.amount;
    acc[key].txns  += r.transactions;
    return acc;
  }, {});
  const collectionChartData = Object.values(collectionsByDate)
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-30);

  // Collections by method
  const byMethod = collections.reduce((acc: any, r: any) => {
    if (!acc[r.method]) acc[r.method] = 0;
    acc[r.method] += r.amount;
    return acc;
  }, {});
  const methodData = Object.entries(byMethod).map(([method, amount]) => ({ method, amount }));
  const METHOD_COLORS = ['#4F7FFF','#10B981','#F59E0B','#8B5CF6','#06B6D4','#EF4444','#F97316','#EC4899'];

  const totalCollected = collections.reduce((s: number, r: any) => s + r.amount, 0);
  const totalTxns      = collections.reduce((s: number, r: any) => s + r.transactions, 0);

  const payrollTotals = {
    gross       : payroll.reduce((s: number, p: any) => s + p.grossSalary,  0),
    net         : payroll.reduce((s: number, p: any) => s + p.netSalary,    0),
    deductions  : payroll.reduce((s: number, p: any) => s + p.totalDeductions, 0),
    pf          : payroll.reduce((s: number, p: any) => s + p.pfEmployer,   0),
  };

  return (
    <Box>
      <PageHeader title="Financial Reports" subtitle="Collections, P&L, GST, and Payroll reports" />

      {/* Tabs */}
      <Box sx={{ borderBottom: `1px solid ${F.border}`, mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{
          '& .MuiTab-root'      : { color: F.textSub, fontSize: 13, textTransform: 'none', minHeight: 40, px: 2 },
          '& .Mui-selected'     : { color: `${F.primary} !important` },
          '& .MuiTabs-indicator': { bgcolor: F.primary },
        }}>
          <Tab label="Collections" />
          <Tab label="Profit & Loss" />
          <Tab label="GST Report" />
          <Tab label="Payroll Expenses" />
        </Tabs>
      </Box>

      {/* Date filters */}
      <Box display="flex" gap={1.5} mb={3} flexWrap="wrap" alignItems="center">
        {tab <= 1 ? (
          <>
            <TextField size="small" label="From" type="date" value={from} onChange={e => setFrom(e.target.value)}
              sx={{ width: 160, ...fieldSx }} InputLabelProps={{ sx: { ...labelSx, shrink: true } }} />
            <TextField size="small" label="To" type="date" value={to} onChange={e => setTo(e.target.value)}
              sx={{ width: 160, ...fieldSx }} InputLabelProps={{ sx: { ...labelSx, shrink: true } }} />
          </>
        ) : (
          <>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel sx={labelSx}>Month</InputLabel>
              <Select value={month} label="Month" onChange={e => setMonth(+e.target.value)} sx={selSx}>
                {MFULL.map((m, i) => <MenuItem key={i} value={i + 1} sx={{ fontSize: 13 }}>{m}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel sx={labelSx}>Year</InputLabel>
              <Select value={year} label="Year" onChange={e => setYear(+e.target.value)} sx={selSx}>
                {[2024, 2025, 2026].map(y => <MenuItem key={y} value={y} sx={{ fontSize: 13 }}>{y}</MenuItem>)}
              </Select>
            </FormControl>
          </>
        )}
        <Button variant="contained" onClick={fetchAll} disabled={loading}
          sx={{ bgcolor: F.primary, textTransform: 'none', fontWeight: 600, borderRadius: '8px', fontSize: 13 }}>
          {loading ? <CircularProgress size={16} sx={{ color: '#fff', mr: 0.75 }} /> : null}
          {loading ? 'Loading…' : 'Generate Report'}
        </Button>
      </Box>

      {/* ── Collections Tab ── */}
      {tab === 0 && (
        <>
          {collections.length > 0 && (
            <>
              <Grid container spacing={1.5} mb={3}>
                {[
                  { label: 'Total Collected', value: INR(totalCollected), accent: F.gold,    icon: <Assessment /> },
                  { label: 'Transactions',    value: totalTxns,           accent: F.primary, icon: <Assessment /> },
                  { label: 'Payment Methods', value: methodData.length,   accent: F.purple,  icon: <Assessment /> },
                  { label: 'Installments',    value: installments.length, accent: F.amber,   icon: <Assessment /> },
                ].map(c => <Grid item xs={6} sm={3} key={c.label}><StatCard {...c} loading={false} sub={undefined} /></Grid>)}
              </Grid>

              <Grid container spacing={2} mb={3}>
                <Grid item xs={12} md={8}>
                  <Card title="Daily Collections (Last 30 days)">
                    <Box p={2.5}>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={collectionChartData} margin={{ left: -16, right: 4 }}>
                          <CartesianGrid {...GRID} />
                          <XAxis dataKey="date" tick={{ ...AXIS, fontSize: 9 }} axisLine={false} tickLine={false}
                            tickFormatter={d => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} />
                          <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                          <Tooltip contentStyle={TIP} formatter={(v: number, n) => [INR(v), n]} />
                          <Bar dataKey="total" name="Amount" fill={F.gold} radius={[3, 3, 0, 0]} maxBarSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card title="By Payment Method">
                    <Box p={2.5}>
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie data={methodData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="amount">
                            {methodData.map((_, i) => <Cell key={i} fill={METHOD_COLORS[i % METHOD_COLORS.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={TIP} formatter={(v: number) => [INR(v), 'Amount']} />
                        </PieChart>
                      </ResponsiveContainer>
                      <Box mt={1}>
                        {methodData.map((m: any, i: number) => (
                          <Box key={m.method} display="flex" justifyContent="space-between" py={0.5}
                            sx={{ borderBottom: `1px solid ${F.border}` }}>
                            <Box display="flex" alignItems="center" gap={0.75}>
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: METHOD_COLORS[i % METHOD_COLORS.length] }} />
                              <Typography sx={{ color: F.textSub, fontSize: 11.5 }}>{m.method.replace(/_/g, ' ')}</Typography>
                            </Box>
                            <Typography sx={{ color: F.text, fontSize: 12, fontWeight: 600 }}>{INR(m.amount as number)}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              </Grid>

              {/* Installment tracker */}
              <Card title="Installment Status Report">
                <DataTable
                  columns={[
                    { label: 'Customer', render: (r: any) => <Box><Typography sx={{ color: F.text, fontSize: 12.5, fontWeight: 500 }}>{r.customerAccount?.customerName ?? '—'}</Typography><Typography sx={{ color: F.textSub, fontSize: 11 }}>{r.customerAccount?.customerPhone}</Typography></Box> },
                    { label: 'Milestone', render: (r: any) => <Typography sx={{ color: F.text, fontSize: 12 }}>{r.milestoneName}</Typography> },
                    { label: 'Amount', align: 'right' as const, render: (r: any) => <AmountCell value={r.totalAmount} /> },
                    { label: 'Paid',   align: 'right' as const, render: (r: any) => <AmountCell value={r.paidAmount} color={F.green} /> },
                    { label: 'Balance',align: 'right' as const, render: (r: any) => <AmountCell value={r.totalAmount - r.paidAmount} color={F.red} /> },
                    { label: 'Due',    render: (r: any) => <Typography sx={{ color: new Date(r.dueDate) < new Date() && r.status !== 'PAID' ? F.red : F.textSub, fontSize: 12 }}>{DATE(r.dueDate)}</Typography> },
                    { label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
                  ]}
                  rows={installments}
                  emptyMsg="No installments in period"
                  compact
                />
              </Card>
            </>
          )}
          {collections.length === 0 && !loading && (
            <Box py={6} textAlign="center">
              <Assessment sx={{ fontSize: 48, color: F.border, mb: 2 }} />
              <Typography sx={{ color: F.textSub, fontSize: 14 }}>Select date range and click "Generate Report"</Typography>
            </Box>
          )}
        </>
      )}

      {/* ── P&L Tab ── */}
      {tab === 1 && pl && (
        <>
          <Grid container spacing={2} mb={3}>
            {[
              { label: 'Total Revenue',  value: INR(pl.totalRevenue),  accent: F.gold,    sub: 'Customer collections' },
              { label: 'Total Expenses', value: INR(pl.totalExpenses), accent: F.purple,  sub: 'Approved expenses' },
              { label: 'Commissions',    value: INR(pl.totalComm),     accent: F.amber,   sub: 'Channel partner' },
              { label: 'Vendor Payments',value: INR(pl.totalVendor),   accent: F.primary, sub: 'Paid vendors' },
            ].map(c => (
              <Grid item xs={12} sm={6} md={3} key={c.label}>
                <Box sx={{ bgcolor: F.surfaceHigh, borderRadius: '12px', p: 2, border: `1px solid ${F.border}` }}>
                  <Typography sx={{ color: F.textSub, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.75 }}>{c.label}</Typography>
                  <Typography sx={{ color: c.accent, fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>{c.value}</Typography>
                  <Typography sx={{ color: F.textSub, fontSize: 11, mt: 0.5 }}>{c.sub}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* P&L Summary card */}
          <Card title="Profit & Loss Summary">
            <Box p={2.5}>
              {[
                { label: 'Gross Revenue',   value: pl.totalRevenue,  color: F.gold,    indent: 0 },
                { label: 'Less: Expenses',  value: -pl.totalExpenses,color: F.red,     indent: 1 },
                { label: 'Less: Commissions', value: -pl.totalComm,  color: F.red,     indent: 1 },
                { label: 'Less: Vendor Pay', value: -pl.totalVendor, color: F.red,     indent: 1 },
                { label: 'Total Costs',     value: -pl.totalCosts,   color: F.red,     indent: 0, bold: true },
                { label: 'Net Profit / Loss',value: pl.grossProfit,  color: pl.grossProfit >= 0 ? F.green : F.red, indent: 0, bold: true, large: true },
              ].map((row, i) => (
                <Box key={i} display="flex" justifyContent="space-between" alignItems="center"
                  py={0.9} pl={row.indent ? 3 : 0}
                  sx={{
                    borderBottom: `1px solid ${F.border}`,
                    ...(row.large && {
                      bgcolor: `${row.color}08`, mx: -2.5, px: 2.5,
                      borderTop: `2px solid ${row.color}30`,
                    }),
                  }}>
                  <Typography sx={{
                    color: row.bold ? F.text : F.textSub,
                    fontSize: row.large ? 15 : 13,
                    fontWeight: row.bold ? 700 : 400,
                  }}>{row.label}</Typography>
                  <Typography sx={{
                    color: row.color,
                    fontSize: row.large ? 18 : 13,
                    fontWeight: row.bold ? 800 : 500,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {INR(Math.abs(row.value))}
                    {row.label === 'Net Profit / Loss' && (
                      <span style={{ fontSize: 13, marginLeft: 8, opacity: 0.8 }}>
                        ({pl.profitMargin}% margin)
                      </span>
                    )}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Card>
        </>
      )}
      {tab === 1 && !pl && !loading && (
        <Box py={6} textAlign="center"><Typography sx={{ color: F.textSub, fontSize: 14 }}>Select date range and generate</Typography></Box>
      )}

      {/* ── GST Tab ── */}
      {tab === 2 && gst && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card title={`Output GST — ${MONTHS[month - 1]} ${year}`}>
              <Box p={2.5}>
                {[
                  { label: 'Taxable Amount', value: INR(gst.outputGst.taxable), color: F.text },
                  { label: 'GST Collected',  value: INR(gst.outputGst.gst),     color: F.red   },
                ].map(row => (
                  <Box key={row.label} display="flex" justifyContent="space-between" py={1}
                    sx={{ borderBottom: `1px solid ${F.border}` }}>
                    <Typography sx={{ color: F.textSub, fontSize: 13 }}>{row.label}</Typography>
                    <Typography sx={{ color: row.color, fontSize: 14, fontWeight: 700 }}>{row.value}</Typography>
                  </Box>
                ))}
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card title={`Input GST — ${MONTHS[month - 1]} ${year}`}>
              <Box p={2.5}>
                {[
                  { label: 'Taxable Amount', value: INR(gst.inputGst.taxable), color: F.text  },
                  { label: 'GST Paid',       value: INR(gst.inputGst.gst),     color: F.green },
                ].map(row => (
                  <Box key={row.label} display="flex" justifyContent="space-between" py={1}
                    sx={{ borderBottom: `1px solid ${F.border}` }}>
                    <Typography sx={{ color: F.textSub, fontSize: 13 }}>{row.label}</Typography>
                    <Typography sx={{ color: row.color, fontSize: 14, fontWeight: 700 }}>{row.value}</Typography>
                  </Box>
                ))}
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{
              bgcolor: gst.netGstLiability > 0 ? `${F.red}08` : `${F.green}08`,
              border: `1px solid ${gst.netGstLiability > 0 ? `${F.red}30` : `${F.green}30`}`,
              borderRadius: '14px', p: 2.5,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <Box>
                <Typography sx={{ color: F.textSub, fontSize: 12, mb: 0.5 }}>
                  Net GST {gst.netGstLiability >= 0 ? 'Payable' : 'Refundable'} — {MONTHS[month - 1]} {year}
                </Typography>
                <Typography sx={{ color: gst.netGstLiability >= 0 ? F.red : F.green, fontSize: 28, fontWeight: 800, letterSpacing: -1 }}>
                  {INR(Math.abs(gst.netGstLiability))}
                </Typography>
              </Box>
              <Box sx={{ bgcolor: gst.netGstLiability >= 0 ? `${F.red}15` : `${F.green}15`, borderRadius: '10px', px: 2, py: 1 }}>
                <Typography sx={{ color: gst.netGstLiability >= 0 ? F.red : F.green, fontSize: 13, fontWeight: 600 }}>
                  {gst.netGstLiability >= 0 ? 'Tax Payable' : 'Tax Refund'}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      )}
      {tab === 2 && !gst && !loading && (
        <Box py={6} textAlign="center"><Typography sx={{ color: F.textSub, fontSize: 14 }}>Select month/year and generate</Typography></Box>
      )}

      {/* ── Payroll Tab ── */}
      {tab === 3 && payroll.length > 0 && (
        <>
          <Grid container spacing={1.5} mb={3}>
            {[
              { label: 'Gross Payroll',  value: INR(payrollTotals.gross),      accent: F.gold,   icon: <Assessment /> },
              { label: 'Net Payroll',    value: INR(payrollTotals.net),        accent: F.green,  icon: <Assessment /> },
              { label: 'Total Deductions',value: INR(payrollTotals.deductions),accent: F.red,    icon: <Assessment /> },
              { label: 'Employer PF',   value: INR(payrollTotals.pf),         accent: F.purple, icon: <Assessment /> },
            ].map(c => <Grid item xs={6} sm={3} key={c.label}><StatCard {...c} loading={false} sub={undefined} /></Grid>)}
          </Grid>
          <Card title={`Payroll — ${MONTHS[month - 1]} ${year}`}>
            <DataTable
              columns={[
                { label: 'Employee',   render: (r: any) => <Box><Typography sx={{ color: F.text, fontSize: 12.5, fontWeight: 500 }}>{r.employee?.name ?? '—'}</Typography><Typography sx={{ color: F.textSub, fontSize: 11 }}>{r.employee?.employeeCode} · {r.employee?.department}</Typography></Box> },
                { label: 'Basic',      align: 'right' as const, render: (r: any) => <AmountCell value={r.basicSalary} /> },
                { label: 'Incentive',  align: 'right' as const, render: (r: any) => <AmountCell value={r.incentiveAmount ?? 0} color={F.gold} /> },
                { label: 'Gross',      align: 'right' as const, render: (r: any) => <AmountCell value={r.grossSalary} /> },
                { label: 'Deductions', align: 'right' as const, render: (r: any) => <Typography sx={{ color: F.red, fontSize: 13, fontWeight: 600 }}>-{INR(r.totalDeductions)}</Typography> },
                { label: 'Net',        align: 'right' as const, render: (r: any) => <AmountCell value={r.netSalary} color={F.green} /> },
                { label: 'Days',       render: (r: any) => <Typography sx={{ color: F.textSub, fontSize: 12 }}>{r.presentDays}/{r.workingDays}</Typography> },
                { label: 'LOP',        render: (r: any) => <Typography sx={{ color: r.lopDays > 0 ? F.red : F.textSub, fontSize: 12 }}>{r.lopDays}</Typography> },
                { label: 'Status',     render: (r: any) => <StatusBadge status={r.isPaid ? 'PAID' : 'PENDING'} /> },
              ]}
              rows={payroll}
              emptyMsg="No payroll data"
              compact
            />
          </Card>
        </>
      )}
      {tab === 3 && payroll.length === 0 && !loading && (
        <Box py={6} textAlign="center"><Typography sx={{ color: F.textSub, fontSize: 14 }}>Select month/year and generate</Typography></Box>
      )}
    </Box>
  );
}
