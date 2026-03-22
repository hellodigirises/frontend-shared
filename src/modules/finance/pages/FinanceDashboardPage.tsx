// src/modules/finance/pages/FinanceDashboardPage.tsx
import React, { useEffect } from 'react';
import { Grid, Box, Typography, LinearProgress } from '@mui/material';
import {
  AccountBalance, Receipt, EventNote, ShoppingCart,
  TrendingUp, Warning, Handshake, Payments,
} from '@mui/icons-material';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useAppDispatch, useAppSelector, F, INR } from '../hooks';
import { fetchDashboard } from '../store/financeSlice';
import { StatCard, PageHeader, Card } from '../components/ui';

const GRID = { stroke:'rgba(79,127,255,0.06)', strokeDasharray:'4 3' };
const AXIS = { fill:F.textSub, fontSize:11 };
const TIP  = { background:F.surfaceHigh, border:`1px solid ${F.border}`, borderRadius:8, fontSize:12 };
const PIE_COLORS = ['#4F7FFF','#10B981','#F59E0B','#8B5CF6','#06B6D4','#EF4444','#F97316','#EC4899'];

export default function FinanceDashboardPage() {
  const dispatch = useAppDispatch();
  const { dashboard:d, loading } = useAppSelector(s => s.finance);
  const busy = !!loading.dashboard;

  useEffect(() => { dispatch(fetchDashboard()); }, [dispatch]);

  const stats = d?.stats;

  const cards = [
    { label:'Collections (Month)', value:INR(stats?.collectionsMonth??0), accent:F.gold,   icon:<Receipt/>,       sub:`${stats?.collectionsCount??0} transactions`, trend:+(stats?.collectionsGrowth??0) },
    { label:'Net Profit',          value:INR(stats?.netProfit??0),         accent:stats?.netProfit>=0?F.green:F.red, icon:<TrendingUp/>, sub:'Revenue minus costs' },
    { label:'Pending Installments',value:INR(stats?.pendingAmount??0),     accent:F.amber,  icon:<EventNote/>,     sub:`${stats?.pendingCount??0} installments` },
    { label:'Overdue',             value:INR(stats?.overdueAmount??0),     accent:F.red,    icon:<Warning/>,       sub:`${stats?.overdueCount??0} accounts` },
    { label:'Expenses (Month)',    value:INR(stats?.expensesMonth??0),     accent:F.purple, icon:<ShoppingCart/>,  sub:'Approved + paid' },
    { label:'Bank Balance',        value:INR(stats?.bankBalance??0),       accent:F.primary,icon:<AccountBalance/>,sub:`${stats?.bankAccounts??0} accounts` },
    { label:'Vendor Payables',     value:INR(stats?.vendorPayables??0),    accent:F.amber,  icon:<Payments/>,      sub:`${stats?.vendorCount??0} pending` },
    { label:'Commissions Due',     value:INR(stats?.commissionsPending??0),accent:F.purple, icon:<Handshake/>,     sub:'Pending approval' },
  ];

  return (
    <Box>
      <PageHeader title="Finance Dashboard" subtitle="Real-time financial overview" />

      {/* Stat grid */}
      <Grid container spacing={2} mb={3}>
        {cards.map(c => (
          <Grid item xs={12} sm={6} md={3} key={c.label}>
            <StatCard {...c} loading={busy} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} mb={2}>
        {/* Revenue vs Expenses trend */}
        <Grid item xs={12} md={8}>
          <Card title="Revenue vs Expenses (6 months)">
            <Box p={2.5}>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={d?.charts.revenueTrend??[]} margin={{ right:4, left:-16 }}>
                  <defs>
                    <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={F.gold}  stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={F.gold}  stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={F.red}   stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={F.red}   stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...GRID}/>
                  <XAxis dataKey="month" tick={AXIS} axisLine={false} tickLine={false}/>
                  <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={v=>`₹${(v/100000).toFixed(0)}L`}/>
                  <Tooltip contentStyle={TIP} labelStyle={{ color:F.text }} formatter={(v:number,n)=>[INR(v),n]}/>
                  <Legend wrapperStyle={{ fontSize:12, color:F.textSub }}/>
                  <Area type="monotone" dataKey="collections" name="Collections" stroke={F.gold}   fill="url(#gRev)" strokeWidth={2.5} dot={false}/>
                  <Area type="monotone" dataKey="expenses"    name="Expenses"    stroke={F.red}    fill="url(#gExp)" strokeWidth={2}   dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Expense breakdown */}
        <Grid item xs={12} md={4}>
          <Card title="Expense Breakdown">
            <Box p={2.5}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={d?.charts.expenseByCategory??[]} cx="50%" cy="50%"
                    innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="amount">
                    {(d?.charts.expenseByCategory??[]).map((_:any, i:number) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TIP} formatter={(v:number,n)=>[INR(v),n]}/>
                </PieChart>
              </ResponsiveContainer>
              <Box mt={1}>
                {(d?.charts.expenseByCategory??[]).slice(0,5).map((cat:any, i:number) => (
                  <Box key={cat.category} display="flex" justifyContent="space-between" py={0.5}
                    sx={{ borderBottom:`1px solid ${F.border}` }}>
                    <Box display="flex" alignItems="center" gap={0.75}>
                      <Box sx={{ width:8, height:8, borderRadius:'50%', bgcolor:PIE_COLORS[i%PIE_COLORS.length], flexShrink:0 }}/>
                      <Typography sx={{ color:F.textSub, fontSize:12 }}>{cat.category}</Typography>
                    </Box>
                    <Typography sx={{ color:F.text, fontSize:12, fontWeight:600 }}>{INR(cat.amount)}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* Project revenue */}
        <Grid item xs={12} md={7}>
          <Card title="Revenue by Project">
            <Box p={2.5}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={d?.charts.projectRevenue??[]} margin={{ left:-16, right:4 }}>
                  <CartesianGrid {...GRID}/>
                  <XAxis dataKey="project" tick={{...AXIS, fontSize:10}} axisLine={false} tickLine={false}/>
                  <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={v=>`₹${(v/100000).toFixed(0)}L`}/>
                  <Tooltip contentStyle={TIP} formatter={(v:number,n)=>[INR(v),n]}/>
                  <Legend wrapperStyle={{ fontSize:12, color:F.textSub }}/>
                  <Bar dataKey="revenue"     name="Booked Revenue"   fill={F.primary}   radius={[4,4,0,0]} maxBarSize={32}/>
                  <Bar dataKey="collections" name="Collected"         fill={F.gold}     radius={[4,4,0,0]} maxBarSize={32}/>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Top overdue accounts */}
        <Grid item xs={12} md={5}>
          <Card title="Overdue Accounts (Top 5)">
            <Box p={1.5}>
              {(d?.topOverdueAccounts??[]).length===0
                ? <Typography sx={{ color:F.textSub, fontSize:13, py:3, textAlign:'center' }}>No overdue accounts</Typography>
                : (d?.topOverdueAccounts??[]).map((acct:any)=>{
                  const overdueAmt = acct.installments.reduce((s:number,i:any)=>s+i.totalAmount-i.paidAmount,0);
                  return (
                    <Box key={acct.id} py={1} sx={{ borderBottom:`1px solid ${F.border}` }}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography sx={{ color:F.text, fontSize:13, fontWeight:500 }}>{acct.customerName}</Typography>
                        <Typography sx={{ color:F.red, fontSize:13, fontWeight:700 }}>{INR(overdueAmt)}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mt={0.25}>
                        <Typography sx={{ color:F.textSub, fontSize:11.5 }}>{acct.customerPhone}</Typography>
                        <Typography sx={{ color:F.amber, fontSize:11 }}>{acct.installments.length} overdue</Typography>
                      </Box>
                    </Box>
                  );
                })
              }
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
