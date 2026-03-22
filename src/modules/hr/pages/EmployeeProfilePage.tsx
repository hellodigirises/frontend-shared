// src/modules/hr/pages/EmployeeProfilePage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Grid, Typography, Tabs, Tab, Button, Chip,
  IconButton, Tooltip,
} from '@mui/material';
import { ArrowBack, Edit, PersonOff } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, H, INR, DATE, TIME } from '../hooks';
import { fetchEmployee, doDeactivate } from '../store/hrSlice';
import { StatusChip, Card, DataTable, Loader, KV, EmployeeAvatar } from '../components/ui';
import { hrApi } from '../api/hr.api';

function Panel({ v, i, children }: { v: number; i: number; children: React.ReactNode }) {
  return v === i ? <Box pt={2.5}>{children}</Box> : null;
}

function ProfileTab({ emp }: { emp: any }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={5}>
        <Card title="Personal Info"><Box p={2}>
          {[
            ['Employee Code', emp.employeeCode, true],
            ['Email',        emp.email],
            ['Phone',        emp.phone],
            ['Address',      emp.address],
            ['PAN Number',   emp.panNumber, true],
            ['Joining Date', DATE(emp.joiningDate)],
            ['Exit Date',    DATE(emp.exitDate)],
            ['Dept',         emp.department],
            ['Designation',  emp.designation],
            ['Type',         emp.employmentType],
            ['Manager',      emp.manager?.name],
          ].map(([l, v, m]) =>
            <KV key={l as string} label={l as string} value={String(v ?? '—')} mono={!!m} />
          )}
        </Box></Card>
      </Grid>
      <Grid item xs={12} md={7}>
        <Grid container spacing={2}>
          {[
            { l: 'Salary',    v: INR(emp.salary),          c: H.purple },
            { l: 'Attendance',v: emp._count?.attendance ?? 0, c: H.teal   },
            { l: 'Leaves',    v: emp._count?.leaves  ?? 0,    c: H.amber  },
            { l: 'Payrolls',  v: emp._count?.payrolls ?? 0,   c: H.primary},
          ].map(({ l, v, c }) => (
            <Grid item xs={6} key={l}>
              <Box sx={{ bgcolor: H.surfaceHigh, borderRadius: '12px', p: 2, border: `1px solid ${H.border}` }}>
                <Typography sx={{ color: H.textSub, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>{l}</Typography>
                <Typography sx={{ color: c, fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>{v}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
        <Box mt={2}>
          <Card title="Bank Details"><Box p={2}>
            {[['Account No', emp.bankAccount, true], ['IFSC Code', emp.bankIfsc, true]].map(([l, v, m]) =>
              <KV key={l as string} label={l as string} value={String(v ?? '—')} mono={!!m} />
            )}
          </Box></Card>
        </Box>
        {emp.reportees?.length > 0 && (
          <Box mt={2}>
            <Card title={`Reportees (${emp.reportees.length})`}><Box p={2}>
              {emp.reportees.map((r: any) => (
                <Box key={r.id} display="flex" gap={1.5} py={0.75} sx={{ borderBottom: `1px solid ${H.border}` }}>
                  <EmployeeAvatar name={r.name} avatarUrl={r.avatarUrl} size={26} />
                  <Box>
                    <Typography sx={{ color: H.text, fontSize: 12.5 }}>{r.name}</Typography>
                    <Typography sx={{ color: H.textSub, fontSize: 11 }}>{r.designation}</Typography>
                  </Box>
                </Box>
              ))}
            </Box></Card>
          </Box>
        )}
      </Grid>
    </Grid>
  );
}

function AttendanceTab({ employeeId }: { employeeId: string }) {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    hrApi.get('/attendance', { params: { employeeId, take: 31 } }).then(r => setRows(r.data.data?.data ?? []));
  }, [employeeId]);
  return (
    <Card title="Attendance Records"><DataTable
      columns={[
        { label:'Date',       render: r => <Typography sx={{ color:H.text, fontSize:12 }}>{DATE(r.date)}</Typography> },
        { label:'Check In',   render: r => <Typography sx={{ color:H.text, fontSize:12 }}>{TIME(r.checkIn)}</Typography> },
        { label:'Check Out',  render: r => <Typography sx={{ color:H.textSub, fontSize:12 }}>{TIME(r.checkOut)}</Typography> },
        { label:'Type',       render: r => <Chip label={r.checkInType} size="small" sx={{ fontSize:10, height:20, bgcolor:`rgba(59,130,246,0.1)`, color:H.primary }} /> },
        { label:'Hours',      render: r => <Typography sx={{ color:H.text, fontSize:12 }}>{r.hoursWorked ? `${r.hoursWorked}h` : '—'}</Typography> },
        { label:'Late',       render: r => r.isLate ? <Typography sx={{ color:H.amber, fontSize:12 }}>+{r.lateMinutes}min</Typography> : <Typography sx={{ color:H.teal, fontSize:12 }}>On time</Typography> },
        { label:'Status',     render: r => <StatusChip status={r.status} /> },
      ]}
      rows={rows} emptyMsg="No attendance records" />
    </Card>
  );
}

function LeavesTab({ employeeId }: { employeeId: string }) {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    hrApi.get('/leaves', { params: { employeeId, take: 20 } }).then(r => setRows(r.data.data?.data ?? []));
  }, [employeeId]);
  return (
    <Card title="Leave History"><DataTable
      columns={[
        { label:'Type',   render: r => <Chip label={r.leaveType} size="small" sx={{ fontSize:10, height:20, bgcolor:`rgba(139,92,246,0.1)`, color:H.purple }} /> },
        { label:'From',   render: r => <Typography sx={{ color:H.text, fontSize:12 }}>{DATE(r.startDate)}</Typography> },
        { label:'To',     render: r => <Typography sx={{ color:H.text, fontSize:12 }}>{DATE(r.endDate)}</Typography> },
        { label:'Days',   render: r => <Typography sx={{ color:H.text, fontSize:12 }}>{r.totalDays}</Typography> },
        { label:'Reason', render: r => <Typography sx={{ color:H.textSub, fontSize:12, maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.reason}</Typography> },
        { label:'Status', render: r => <StatusChip status={r.status} /> },
      ]}
      rows={rows} emptyMsg="No leave records" />
    </Card>
  );
}

function PayrollTab({ employeeId }: { employeeId: string }) {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    hrApi.get('/payroll', { params: { employeeId, take: 12 } }).then(r => setRows(r.data.data?.data ?? []));
  }, [employeeId]);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return (
    <Card title="Payroll History"><DataTable
      columns={[
        { label:'Period',    render: r => <Typography sx={{ color:H.text, fontSize:12 }}>{months[r.month-1]} {r.year}</Typography> },
        { label:'Basic',     render: r => <Typography sx={{ color:H.text, fontSize:12 }}>{INR(r.basicSalary)}</Typography> },
        { label:'Gross',     render: r => <Typography sx={{ color:H.text, fontSize:12 }}>{INR(r.grossSalary)}</Typography> },
        { label:'Deductions',render: r => <Typography sx={{ color:H.coral, fontSize:12 }}>-{INR(r.totalDeductions)}</Typography> },
        { label:'Net',       render: r => <Typography sx={{ color:H.teal, fontSize:12, fontWeight:700 }}>{INR(r.netSalary)}</Typography> },
        { label:'Days',      render: r => <Typography sx={{ color:H.textSub, fontSize:12 }}>{r.presentDays}/{r.workingDays}</Typography> },
        { label:'Status',    render: r => <StatusChip status={r.isPaid ? 'PAID' : 'PENDING'} /> },
      ]}
      rows={rows} emptyMsg="No payroll records" />
    </Card>
  );
}

function PerformanceTab({ employeeId }: { employeeId: string }) {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    hrApi.get('/performance', { params: { employeeId } }).then(r => setRows(r.data.data ?? []));
  }, [employeeId]);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return (
    <Card title="Performance Records"><DataTable
      columns={[
        { label:'Period',    render: r => <Typography sx={{ color:H.text, fontSize:12 }}>{months[r.month-1]} {r.year}</Typography> },
        { label:'Leads',     render: r => <Typography sx={{ color:H.text, fontSize:12 }}>{r.leadsHandled}</Typography> },
        { label:'Visits',    render: r => <Typography sx={{ color:H.text, fontSize:12 }}>{r.siteVisits}</Typography> },
        { label:'Bookings',  render: r => <Typography sx={{ color:H.text, fontSize:12, fontWeight:600 }}>{r.bookingsClosed}</Typography> },
        { label:'Revenue',   render: r => <Typography sx={{ color:H.teal, fontSize:12, fontWeight:700 }}>{INR(r.revenueGenerated)}</Typography> },
        { label:'Rating',    render: r => r.managerRating ? (
          <Box display="flex" gap={0.25}>
            {Array.from({length:5}).map((_,i) => (
              <Box key={i} sx={{ width:8, height:8, borderRadius:'50%', bgcolor: i < r.managerRating ? H.amber : H.border }} />
            ))}
          </Box>
        ) : <Typography sx={{ color:H.textSub, fontSize:12 }}>—</Typography> },
      ]}
      rows={rows} emptyMsg="No performance records" />
    </Card>
  );
}

function DocumentsTab({ employeeId }: { employeeId: string }) {
  const [docs, setDocs] = useState<any[]>([]);
  useEffect(() => {
    hrApi.get(`/employees/${employeeId}/documents`).then(r => setDocs(r.data.data ?? []));
  }, [employeeId]);
  return (
    <Card title="Documents"><Box p={2}>
      {docs.length === 0
        ? <Typography sx={{ color:H.textSub, fontSize:13, py:2, textAlign:'center' }}>No documents uploaded</Typography>
        : docs.map(d => (
          <Box key={d.id} display="flex" justifyContent="space-between" alignItems="center"
            py={1} sx={{ borderBottom:`1px solid ${H.border}` }}>
            <Box>
              <Typography sx={{ color:H.text, fontSize:13 }}>{d.title}</Typography>
              <Typography sx={{ color:H.textSub, fontSize:11 }}>{d.documentType} · {DATE(d.createdAt)}</Typography>
            </Box>
            <Button size="small" href={d.fileUrl} target="_blank"
              sx={{ color:H.primary, textTransform:'none', fontSize:12 }}>View</Button>
          </Box>
        ))
      }
    </Box></Card>
  );
}

const TABS = ['Profile','Attendance','Leaves','Payroll','Performance','Documents'];

export default function EmployeeProfilePage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const { employee: emp } = useAppSelector(s => s.hr);
  const [tab, setTab] = useState(0);

  useEffect(() => { if (id) dispatch(fetchEmployee(id)); }, [id, dispatch]);

  if (!emp) return <Loader />;

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
        <IconButton size="small" onClick={() => nav('/hr/employees')}
          sx={{ color:H.muted, border:`1px solid ${H.border}`, borderRadius:'8px', p:0.6 }}>
          <ArrowBack sx={{ fontSize:15 }} />
        </IconButton>
        <EmployeeAvatar name={emp.name} avatarUrl={emp.avatarUrl} size={40} />
        <Box flex={1}>
          <Typography sx={{ color:H.text, fontSize:17, fontWeight:700, letterSpacing:-0.3 }}>{emp.name}</Typography>
          <Typography sx={{ color:H.textSub, fontSize:12 }}>{emp.employeeCode} · {emp.designation ?? emp.role}</Typography>
        </Box>
        <StatusChip status={emp.status} />
        {emp.status === 'ACTIVE' && (
          <Button size="small" startIcon={<PersonOff />}
            onClick={() => dispatch(doDeactivate({ id: emp.id }))}
            sx={{ color:H.coral, borderColor:`${H.coral}40`, textTransform:'none', fontSize:12, borderRadius:'8px', border:'1px solid' }}>
            Deactivate
          </Button>
        )}
      </Box>

      <Box sx={{ borderBottom:`1px solid ${H.border}` }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{
          '& .MuiTab-root'      : { color:H.textSub, fontSize:12.5, textTransform:'none', minHeight:40, px:2 },
          '& .Mui-selected'     : { color:`${H.primary} !important` },
          '& .MuiTabs-indicator': { bgcolor:H.primary },
        }}>
          {TABS.map(t => <Tab key={t} label={t} />)}
        </Tabs>
      </Box>

      <Panel v={tab} i={0}><ProfileTab emp={emp} /></Panel>
      <Panel v={tab} i={1}><AttendanceTab    employeeId={emp.id} /></Panel>
      <Panel v={tab} i={2}><LeavesTab        employeeId={emp.id} /></Panel>
      <Panel v={tab} i={3}><PayrollTab       employeeId={emp.id} /></Panel>
      <Panel v={tab} i={4}><PerformanceTab   employeeId={emp.id} /></Panel>
      <Panel v={tab} i={5}><DocumentsTab     employeeId={emp.id} /></Panel>
    </Box>
  );
}
