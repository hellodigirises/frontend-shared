// src/modules/sales-manager/pages/SalesForecastPage.tsx
import React, { useEffect } from 'react';
import { Box, Grid, Button, Typography, LinearProgress } from '@mui/material';
import { AutoGraph, Refresh } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useAppDispatch, useAppSelector, S, INR } from '../hooks';
import { fetchForecast, doGenForecast } from '../store/salesSlice';
import { PageHeader, Card, StatCard } from '../components/ui';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const GRID = { stroke:'rgba(255,255,255,0.05)', strokeDasharray:'4 3' };
const AXIS = { fill:S.textSub, fontSize:11 };
const TIP  = { background:S.surfaceHigh, border:`1px solid ${S.border}`, borderRadius:8, fontSize:12 };

export default function SalesForecastPage() {
  const dispatch = useAppDispatch();
  const { forecast } = useAppSelector(s=>s.sales);
  useEffect(()=>{ dispatch(fetchForecast()); },[dispatch]);

  const latest = forecast[0];
  const chartData = [...forecast].reverse().map(f=>({
    label:`${MONTHS[f.month-1]} '${String(f.year).slice(2)}`,
    predicted : f.predictedRevenue,
    weighted  : f.weightedPipeline,
    historical: f.historicalAvg,
  }));

  return (
    <Box>
      <PageHeader title="Sales Forecast" subtitle="AI-powered revenue predictions based on pipeline and history"
        action={
          <Button variant="contained" startIcon={<Refresh/>} size="small"
            onClick={()=>dispatch(doGenForecast())}
            sx={{ bgcolor:S.primary, textTransform:'none', fontWeight:600, borderRadius:'8px', fontSize:13 }}>
            Regenerate Forecast
          </Button>
        }
      />

      {latest && (
        <Grid container spacing={2} mb={3}>
          {[
            { label:'Predicted Revenue',    value:INR(latest.predictedRevenue), accent:S.gold,   icon:<AutoGraph/> },
            { label:'Pipeline Value',       value:INR(latest.pipelineValue),    accent:S.blue,   icon:<AutoGraph/> },
            { label:'Weighted Pipeline',    value:INR(latest.weightedPipeline), accent:S.purple, icon:<AutoGraph/> },
            { label:'Conversion Rate',      value:`${latest.conversionRate.toFixed(1)}%`, accent:S.primary, icon:<AutoGraph/> },
          ].map(c=><Grid item xs={12} sm={6} md={3} key={c.label}><StatCard {...c} loading={false} sub={undefined}/></Grid>)}
        </Grid>
      )}

      {latest && (
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={8}>
            <Card title="Revenue Forecast Trend">
              <Box p={2.5}>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={chartData} margin={{ right:4, left:-16 }}>
                    <CartesianGrid {...GRID}/>
                    <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false}/>
                    <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={v=>`₹${(v/100000).toFixed(0)}L`}/>
                    <Tooltip contentStyle={TIP} labelStyle={{ color:S.text }} formatter={(v:number,n)=>[INR(v),n]}/>
                    <Line type="monotone" dataKey="predicted" name="Predicted" stroke={S.gold} strokeWidth={2.5} dot={{ r:3, fill:S.gold }}/>
                    <Line type="monotone" dataKey="weighted"  name="Weighted Pipeline" stroke={S.purple} strokeWidth={2} strokeDasharray="5 3" dot={false}/>
                    <Line type="monotone" dataKey="historical" name="Historical Avg" stroke={S.cyan} strokeWidth={1.5} strokeDasharray="3 3" dot={false}/>
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card title="Forecast Confidence">
              <Box p={2.5}>
                <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" py={2}>
                  <Typography sx={{ color:S.text, fontSize:52, fontWeight:800, letterSpacing:-2, lineHeight:1 }}>
                    {latest.confidence.toFixed(0)}
                    <Typography component="span" sx={{ fontSize:22, color:S.textSub, fontWeight:400 }}>%</Typography>
                  </Typography>
                  <Typography sx={{ color:S.textSub, fontSize:13, mt:0.5 }}>Confidence Score</Typography>
                </Box>
                <LinearProgress variant="determinate" value={latest.confidence}
                  sx={{ height:8, borderRadius:4, bgcolor:'rgba(255,255,255,0.06)',
                    '& .MuiLinearProgress-bar':{ bgcolor:latest.confidence>70?S.primary:latest.confidence>40?S.gold:S.coral, borderRadius:4 } }}/>
                <Box mt={2.5}>
                  {[
                    ['Pipeline Value',    INR(latest.pipelineValue)],
                    ['Weighted Pipeline', INR(latest.weightedPipeline)],
                    ['Historical Avg',   INR(latest.historicalAvg)],
                    ['Conversion Rate',  `${latest.conversionRate.toFixed(1)}%`],
                  ].map(([l,v])=>(
                    <Box key={l} display="flex" justifyContent="space-between" py={0.75} sx={{ borderBottom:`1px solid ${S.border}` }}>
                      <Typography sx={{ color:S.textSub, fontSize:12 }}>{l}</Typography>
                      <Typography sx={{ color:S.text, fontSize:12, fontWeight:500 }}>{v}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
