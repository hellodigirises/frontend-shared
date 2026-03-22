// src/modules/hr/pages/PayrollPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Grid, TextField, Select, MenuItem, FormControl,
  InputLabel, Typography,
} from '@mui/material';
import { PlayArrow, Receipt } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, H, INR, fieldSx, labelSx, selectFieldSx } from '../hooks';
import { fetchPayrolls, doGeneratePayroll, type PayrollRecord } from '../store/hrSlice';
import { PageHeader, Card, DataTable, StatCard, StatusChip } from '../components/ui';

const now = new Date();
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function PayrollPage() {
  const dispatch = useAppDispatch();
  const { payrolls, loading } = useAppSelector(s => s.hr);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year,  setYear]  = useState(now.getFullYear());
  const [empId, setEmpId] = useState('');
  const busy = !!loading.payrolls;

  useEffect(() => {
    dispatch(fetchPayrolls({ month, year, take: 50 }));
  }, [dispatch, month, year]);

  const totalGross = payrolls.data.reduce((s, p) => s + p.grossSalary, 0);
  const totalNet   = payrolls.data.reduce((s, p) => s + p.netSalary,   0);
  const totalDed   = payrolls.data.reduce((s, p) => s + p.totalDeductions, 0);
  const paid       = payrolls.data.filter(p => p.isPaid).length;

  const cols = [
    { label:'Employee', render:(r:PayrollRecord) => (
      <Box>
        <Typography sx={{ color:H.text, fontSize:12.5, fontWeight:500 }}>{r.employee?.name ?? '—'}</Typography>
        <Typography sx={{ color:H.textSub, fontSize:11 }}>{r.employee?.department}</Typography>
      </Box>
    )},
    { label:'Basic',      render:(r:PayrollRecord) => <Typography sx={{ color:H.text,    fontSize:12 }}>{INR(r.basicSalary)}</Typography> },
    { label:'Incentive',  render:(r:PayrollRecord) => <Typography sx={{ color:H.amber,   fontSize:12 }}>{INR((r as any).incentiveAmount ?? 0)}</Typography> },
    { label:'Gross',      render:(r:PayrollRecord) => <Typography sx={{ color:H.text,    fontSize:12, fontWeight:600 }}>{INR(r.grossSalary)}</Typography> },
    { label:'Deductions', render:(r:PayrollRecord) => <Typography sx={{ color:H.coral,   fontSize:12 }}>-{INR(r.totalDeductions)}</Typography> },
    { label:'Net',        render:(r:PayrollRecord) => <Typography sx={{ color:H.teal,    fontSize:12, fontWeight:700 }}>{INR(r.netSalary)}</Typography> },
    { label:'Days',       render:(r:PayrollRecord) => <Typography sx={{ color:H.textSub, fontSize:12 }}>{r.presentDays}/{r.workingDays}</Typography> },
    { label:'LOP',        render:(r:PayrollRecord) => <Typography sx={{ color:r.lopDays>0?H.coral:H.textSub, fontSize:12 }}>{r.lopDays}</Typography> },
    { label:'Status',     render:(r:PayrollRecord) => <StatusChip status={r.isPaid ? 'PAID' : 'PENDING'} /> },
  ];

  return (
    <Box>
      <PageHeader
        title="Payroll"
        subtitle="Manage salary processing and payslips"
        action={
          <Button variant="contained" startIcon={<PlayArrow />} size="small"
            onClick={() => {
              if (empId) dispatch(doGeneratePayroll({ employeeId: empId, month, year }));
              else alert('Enter employee ID to generate payroll');
            }}
            sx={{ bgcolor:H.primary, textTransform:'none', fontWeight:600, borderRadius:'8px', fontSize:13 }}>
            Generate Payroll
          </Button>
        }
      />

      <Grid container spacing={2} mb={3}>
        {[
          { label:'Gross Payroll', value:INR(totalGross), accent:H.purple, icon:<Receipt /> },
          { label:'Net Payroll',   value:INR(totalNet),   accent:H.teal,   icon:<Receipt /> },
          { label:'Total Deductions', value:INR(totalDed), accent:H.coral, icon:<Receipt /> },
          { label:'Paid',          value:`${paid}/${payrolls.data.length}`, accent:H.primary, icon:<Receipt /> },
        ].map(c => <Grid item xs={12} sm={6} md={3} key={c.label}><StatCard {...c} loading={busy} sub={undefined} /></Grid>)}
      </Grid>

      <Box display="flex" gap={1.5} mb={2} flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth:150 }}>
          <InputLabel sx={labelSx}>Month</InputLabel>
          <Select value={month} label="Month" onChange={e => setMonth(+e.target.value)} sx={selectFieldSx}>
            {MONTHS.map((m, i) => <MenuItem key={i} value={i+1} sx={{ fontSize:13 }}>{m}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth:100 }}>
          <InputLabel sx={labelSx}>Year</InputLabel>
          <Select value={year} label="Year" onChange={e => setYear(+e.target.value)} sx={selectFieldSx}>
            {[2024,2025,2026].map(y => <MenuItem key={y} value={y} sx={{ fontSize:13 }}>{y}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField size="small" placeholder="Employee ID (for generate)" value={empId}
          onChange={e => setEmpId(e.target.value)}
          sx={{ width:260, '& .MuiOutlinedInput-root': { bgcolor:H.surface, color:H.text, borderRadius:'8px', '& fieldset':{borderColor:H.border}, fontSize:13 } }}
          inputProps={{ style:{ fontSize:13 } }} />
      </Box>

      <Card><DataTable columns={cols as any} rows={payrolls.data} loading={busy} emptyMsg="No payroll records for this period" /></Card>
    </Box>
  );
}
