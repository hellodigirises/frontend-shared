import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Stack, Button, Grid, Chip, Paper,
  Divider, Avatar, CircularProgress, Tab, Tabs,
  IconButton, Alert, LinearProgress, Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  AutoAwesomeOutlined, TrendingUpOutlined, RefreshOutlined,
  PeopleOutlined, AccountBalanceOutlined, WarningAmberOutlined,
  LightbulbOutlined, BarChartOutlined, PsychologyOutlined,
  EmojiEventsOutlined, GroupsOutlined
} from '@mui/icons-material';
import {
  LeadScore, AgentInsight, RevenueForecast, OpportunityMatch,
  PaymentRisk, BrokerInsight, InactiveLeadAlert, AIInsight,
  TEMPERATURE_CFG, INSIGHT_TYPE_CFG, INSIGHT_PRIORITY_CFG,
  fmtINR, avatarColor, initials, timeAgo
} from './aiTypes';
import {
  ScoreRing, ScoreBreakdownPanel, WinProbabilityBar,
  RecommendationCard, AIInsightCard, InactiveLeadRow
} from './AIComponents';
import api from '../../../../api/axios';

// ─── Forecast Section ─────────────────────────────────────────────────────────
const ForecastSection: React.FC<{ forecast: RevenueForecast }> = ({ forecast }) => {
  const W = 600, H = 180;
  const mx = Math.max(...forecast.monthlyBreakdown.map(m => Math.max(m.forecast, m.actual ?? 0)), 1);
  const bw = Math.floor((W / forecast.monthlyBreakdown.length) * 0.4);
  const gap = W / forecast.monthlyBreakdown.length;

  return (
    <Box>
      {/* Hero forecast card */}
      <Box sx={{
        p: 4, borderRadius: 4, mb: 4, position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, #0f172a 0%, #1a1a3e 50%, #0f172a 100%)',
      }}>
        {/* Animated bg */}
        <Box sx={{ position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'repeating-linear-gradient(45deg, #6366f1 0, #6366f1 1px, transparent 0, transparent 50%)',
          backgroundSize: '12px 12px' }} />
        {['#6366f1','#10b981','#f59e0b'].map((c, i) => (
          <Box key={i} sx={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%',
            bgcolor: c, opacity: 0.05, filter: 'blur(60px)',
            top: i * 40 - 60, right: i * 80 - 100 }} />
        ))}

        <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
          <AutoAwesomeOutlined sx={{ color: '#f59e0b', fontSize: 22 }} />
          <Typography sx={{ fontFamily: '"DM Serif Display", serif', fontWeight: 700, fontSize: '1.5rem', color: '#f1f5f9' }}>
            Revenue Forecast
          </Typography>
          <Chip label={`${forecast.confidence}% confidence`} size="small"
            sx={{ bgcolor: '#10b98120', color: '#10b981', fontWeight: 800, border: '1px solid #10b98140' }} />
        </Stack>

        <Grid container spacing={4}>
          {[
            { label: 'Pipeline Value',    value: fmtINR(forecast.pipelineValue),    color: '#e2e8f0',  icon: '📊' },
            { label: 'Weighted Forecast', value: fmtINR(forecast.weightedValue),    color: '#c084fc',  icon: '⚖️' },
            { label: 'Expected Revenue',  value: fmtINR(forecast.forecastRevenue),  color: '#fbbf24',  icon: '💰', hero: true },
            { label: 'Expected Bookings', value: forecast.forecastBookings,         color: '#34d399',  icon: '📝' },
            { label: 'Commissions',       value: fmtINR(forecast.forecastCommissions), color: '#38bdf8', icon: '🏅' },
          ].map(k => (
            <Grid item xs={6} sm key={k.label}>
              <Typography sx={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#64748b', mb: 0.5 }}>
                {k.icon} {k.label}
              </Typography>
              <Typography sx={{ fontFamily: '"DM Serif Display", serif', fontSize: k.hero ? '1.8rem' : '1.3rem', fontWeight: 700, color: k.color, lineHeight: 1.1 }}>
                {k.value}
              </Typography>
            </Grid>
          ))}
        </Grid>

        {/* Forecast range */}
        <Box mt={3} sx={{ p: 2, borderRadius: 3, bgcolor: '#ffffff08', border: '1px solid #ffffff10' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography sx={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>Forecast Range ({forecast.period})</Typography>
            <Stack direction="row" spacing={3}>
              {[
                { label: 'Conservative', value: fmtINR(forecast.range.low), color: '#ef4444' },
                { label: 'Base Case',    value: fmtINR(forecast.range.mid), color: '#f59e0b' },
                { label: 'Optimistic',   value: fmtINR(forecast.range.high), color: '#10b981' },
              ].map(r => (
                <Box key={r.label} sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>{r.label}</Typography>
                  <Typography sx={{ fontWeight: 900, color: r.color, fontSize: '0.95rem' }}>{r.value}</Typography>
                </Box>
              ))}
            </Stack>
          </Stack>
        </Box>
      </Box>

      {/* Monthly chart */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3.5, mb: 3 }}>
        <Typography variant="body1" fontWeight={800} mb={2.5}>Monthly Forecast vs Actual</Typography>
        <svg viewBox={`0 0 ${W} ${H + 28}`} style={{ width: '100%', height: H + 28 }}>
          {Array.from({ length: 5 }, (_, i) => {
            const y = Math.round((i / 4) * H);
            const v = Math.round(mx - (i / 4) * mx);
            return (
              <g key={i}>
                <line x1={0} y1={y} x2={W} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                <text x={0} y={y - 2} fontSize={9} fill="#94a3b8" fontFamily="'DM Sans',sans-serif">
                  {fmtINR(v)}
                </text>
              </g>
            );
          })}
          {forecast.monthlyBreakdown.map((m, i) => {
            const cx = gap * i + gap / 2;
            const forecastH = Math.round((m.forecast / mx) * H);
            const actualH = m.actual ? Math.round((m.actual / mx) * H) : 0;
            return (
              <g key={m.month}>
                {/* Forecast bar (lighter) */}
                <rect x={cx - bw / 2 - 2} y={H - forecastH} width={bw} height={forecastH} rx={4}
                  fill="#6366f1" opacity={0.4} />
                {/* Actual bar */}
                {m.actual !== undefined && (
                  <rect x={cx + 2} y={H - actualH} width={bw} height={actualH} rx={4}
                    fill="#10b981" opacity={0.9} />
                )}
                <text x={cx} y={H + 18} textAnchor="middle" fontSize={9} fill="#94a3b8"
                  fontFamily="'DM Sans',sans-serif">{m.month}</text>
              </g>
            );
          })}
        </svg>
        <Stack direction="row" spacing={3} mt={1} justifyContent="center">
          {[{ color: '#6366f1', label: 'Forecast', opacity: '0.4' }, { color: '#10b981', label: 'Actual' }].map(l => (
            <Stack key={l.label} direction="row" alignItems="center" spacing={0.75}>
              <Box sx={{ width: 14, height: 8, borderRadius: 1, bgcolor: l.color, opacity: parseFloat(l.opacity ?? '1') }} />
              <Typography variant="caption" fontWeight={700} color="text.secondary">{l.label}</Typography>
            </Stack>
          ))}
        </Stack>
      </Paper>

      {/* Assumptions */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3.5 }}>
        <Typography variant="body2" fontWeight={800} mb={1.5}>📋 Forecast Assumptions</Typography>
        <Stack spacing={0.75}>
          {forecast.assumptions.map((a, i) => (
            <Stack key={i} direction="row" alignItems="center" spacing={1}>
              <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#6366f1', flexShrink: 0 }} />
              <Typography variant="caption" color="text.secondary">{a}</Typography>
            </Stack>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
};

// ─── Agent AI Insights ────────────────────────────────────────────────────────
const AgentInsightsSection: React.FC<{ agents: AgentInsight[] }> = ({ agents }) => {
  const medals = ['🥇','🥈','🥉'];

  return (
    <Box>
      <Grid container spacing={2} mb={3}>
        {[
          { icon: '👥', label: 'Agents Tracked',  value: agents.length,                                     color: '#6366f1' },
          { icon: '⭐', label: 'Top Score',        value: Math.max(...agents.map(a => a.performanceScore)), color: '#f59e0b' },
          { icon: '⚠️', label: 'Needs Attention',  value: agents.filter(a => a.performanceScore < 40).length, color: '#ef4444' },
          { icon: '📈', label: 'Avg Score',        value: Math.round(agents.reduce((s, a) => s + a.performanceScore, 0) / agents.length), color: '#10b981' },
        ].map(k => (
          <Grid item xs={6} sm={3} key={k.label}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, textAlign: 'center' }}>
              <Typography fontSize={22} mb={0.5}>{k.icon}</Typography>
              <Typography variant="h5" fontWeight={900} sx={{ color: k.color }}>{k.value}</Typography>
              <Typography variant="caption" fontWeight={700} color="text.secondary">{k.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Stack spacing={2.5}>
        {agents.sort((a, b) => b.performanceScore - a.performanceScore).map((agent, idx) => {
          const trendColor = agent.performanceTrend === 'UP' ? '#10b981' : agent.performanceTrend === 'DOWN' ? '#ef4444' : '#9ca3af';
          const trendIcon = agent.performanceTrend === 'UP' ? '↑' : agent.performanceTrend === 'DOWN' ? '↓' : '→';
          const scoreColor = agent.performanceScore >= 70 ? '#10b981' : agent.performanceScore >= 45 ? '#f59e0b' : '#ef4444';

          return (
            <Paper key={agent.agentId} variant="outlined" sx={{ borderRadius: 3.5, overflow: 'hidden', transition: 'all .2s',
              '&:hover': { borderColor: scoreColor + '60', boxShadow: `0 8px 24px ${scoreColor}12` } }}>
              <Grid container>
                {/* Left: agent info */}
                <Grid item xs={12} sm={3} sx={{ p: 2.5, bgcolor: '#f8fafc', borderRight: { sm: '1px solid #f1f5f9' } }}>
                  <Stack spacing={1.5} alignItems="center" textAlign="center">
                    <Box sx={{ position: 'relative' }}>
                      <Avatar sx={{ width: 56, height: 56, bgcolor: avatarColor(agent.agentName), fontSize: 18, fontWeight: 900 }}>
                        {initials(agent.agentName)}
                      </Avatar>
                      <Box sx={{ position: 'absolute', top: -6, right: -8, fontSize: 20 }}>
                        {medals[idx] ?? ''}
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={800}>{agent.agentName}</Typography>
                      <Typography variant="caption" color="text.secondary">{agent.role}</Typography>
                    </Box>
                    {/* Score ring mini */}
                    <Box sx={{ width: 60, height: 60 }}>
                      <svg width="60" height="60">
                        <circle cx="30" cy="30" r="24" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                        <circle cx="30" cy="30" r="24" fill="none" stroke={scoreColor} strokeWidth="6"
                          strokeDasharray={`${(agent.performanceScore / 100) * 150} 150`}
                          strokeLinecap="round" transform="rotate(-90 30 30)" />
                        <text x="30" y="34" textAnchor="middle" fontSize="13" fontWeight="bold"
                          fill={scoreColor} fontFamily="'DM Sans',sans-serif">
                          {agent.performanceScore}
                        </text>
                      </svg>
                    </Box>
                    <Chip label={`${trendIcon} ${agent.performanceTrend}`} size="small"
                      sx={{ bgcolor: trendColor + '18', color: trendColor, fontWeight: 800, fontSize: 10 }} />
                  </Stack>
                </Grid>

                {/* Middle: metrics */}
                <Grid item xs={12} sm={5} sx={{ p: 2.5 }}>
                  <Typography sx={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af', mb: 1.5 }}>
                    Performance Metrics
                  </Typography>
                  <Grid container spacing={1.5} mb={2}>
                    {[
                      { label: 'Leads',      value: agent.leads,                       icon: '🎯' },
                      { label: 'Visits',     value: agent.visits,                      icon: '🏠' },
                      { label: 'Bookings',   value: agent.bookings,                    icon: '📝' },
                      { label: 'Revenue',    value: fmtINR(agent.revenue),             icon: '💰' },
                      { label: 'Conv. Rate', value: `${agent.conversionRate}%`,        icon: '📊' },
                      { label: 'Avg Response', value: `${agent.avgResponseTimeHrs}h`,  icon: '⚡' },
                    ].map(m => (
                      <Grid item xs={6} key={m.label}>
                        <Typography sx={{ fontSize: 10, color: '#9ca3af', fontWeight: 700 }}>{m.icon} {m.label}</Typography>
                        <Typography variant="body2" fontWeight={900}>{m.value}</Typography>
                      </Grid>
                    ))}
                  </Grid>
                  {/* V2B Rate */}
                  <Box>
                    <Stack direction="row" justifyContent="space-between" mb={0.5}>
                      <Typography sx={{ fontSize: 10, color: '#9ca3af', fontWeight: 700 }}>Visit→Booking Rate</Typography>
                      <Typography sx={{ fontSize: 10, fontWeight: 900, color: scoreColor }}>{agent.visitToBookingRate}%</Typography>
                    </Stack>
                    <Box sx={{ height: 5, bgcolor: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                      <Box sx={{ height: '100%', width: `${agent.visitToBookingRate}%`, bgcolor: scoreColor, borderRadius: 3, transition: 'width .6s ease' }} />
                    </Box>
                  </Box>
                </Grid>

                {/* Right: AI insights */}
                <Grid item xs={12} sm={4} sx={{ p: 2.5, bgcolor: '#0f172a' }}>
                  {agent.strengths.length > 0 && (
                    <Box mb={2}>
                      <Typography sx={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#10b981', mb: 1 }}>
                        💪 Strengths
                      </Typography>
                      <Stack spacing={0.5}>
                        {agent.strengths.slice(0, 2).map((s, i) => (
                          <Typography key={i} variant="caption" sx={{ color: '#94a3b8', fontSize: 11 }}>• {s}</Typography>
                        ))}
                      </Stack>
                    </Box>
                  )}
                  {agent.recommendations.length > 0 && (
                    <Box>
                      <Typography sx={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#f59e0b', mb: 1 }}>
                        💡 AI Suggests
                      </Typography>
                      <Stack spacing={0.5}>
                        {agent.recommendations.slice(0, 2).map((r, i) => (
                          <Typography key={i} variant="caption" sx={{ color: '#94a3b8', fontSize: 11 }}>• {r}</Typography>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
};

// ─── Opportunity Matches ──────────────────────────────────────────────────────
const OpportunitiesSection: React.FC<{ 
  opportunities: OpportunityMatch[];
  onRecommend: (unitId: string) => void;
}> = ({ opportunities, onRecommend }) => (
  <Box>
    <Stack spacing={1.75}>
      {opportunities.length === 0 ? (
        <Box sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
          <Typography fontSize={40} mb={1}>🔍</Typography>
          <Typography variant="body2">No opportunity matches found</Typography>
        </Box>
      ) : opportunities.map((opp, i) => {
        const isWithinBudget = opp.unitPrice <= opp.budget;
        const matchColor = opp.matchScore >= 80 ? '#10b981' : opp.matchScore >= 60 ? '#f59e0b' : '#ef4444';
        return (
          <Paper key={opp.leadId} variant="outlined" sx={{ p: 2.5, borderRadius: 3, overflow: 'hidden',
            border: `1.5px solid ${matchColor}30`, transition: 'all .2s',
            '&:hover': { borderColor: matchColor, boxShadow: `0 6px 20px ${matchColor}15` } }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
                  <Typography fontSize={20}>🎯</Typography>
                  <Box>
                    <Typography variant="body2" fontWeight={800}>{opp.leadName}</Typography>
                    <Typography variant="caption" color="text.secondary">Budget: {fmtINR(opp.budget)} · Interested in: {opp.preferredType}</Typography>
                  </Box>
                </Stack>
              </Box>
              <Box sx={{ width: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ color: '#10b981', fontWeight: 900 }}>→</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
                  <Typography fontSize={20}>🏠</Typography>
                  <Box>
                    <Typography variant="body2" fontWeight={800}>{opp.unitName}</Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="caption" fontWeight={900} sx={{ color: isWithinBudget ? '#10b981' : '#f59e0b' }}>
                        {fmtINR(opp.unitPrice)}
                      </Typography>
                      {!isWithinBudget && (
                        <Typography variant="caption" sx={{ color: '#f59e0b', fontSize: 10 }}>
                          (+{fmtINR(opp.unitPrice - opp.budget)} over budget)
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                </Stack>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color: matchColor, lineHeight: 1 }}>
                  {opp.matchScore}%
                </Typography>
                <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: 10 }}>match</Typography>
              </Box>
            </Stack>

            <Divider sx={{ my: 1.5 }} />
            <Stack direction="row" spacing={0.75} flexWrap="wrap" mb={1.5}>
              {opp.matchReasons.map((r, i) => (
                <Chip key={i} label={`✓ ${r}`} size="small"
                  sx={{ bgcolor: matchColor + '12', color: matchColor, fontWeight: 700, fontSize: 10, height: 20, my: 0.25 }} />
              ))}
            </Stack>
            <Button size="small" variant="contained" disableElevation
              onClick={() => onRecommend(opp.unitId)}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, fontSize: 11,
                bgcolor: matchColor, '&:hover': { filter: 'brightness(0.9)' } }}>
              💡 Recommend This Unit
            </Button>
          </Paper>
        );
      })}
    </Stack>
  </Box>
);

// ─── Payment Risk Section ─────────────────────────────────────────────────────
const PaymentRiskSection: React.FC<{ 
  risks: PaymentRisk[];
  onContact: (bookingId: string) => void;
}> = ({ risks, onContact }) => {
  const high   = risks.filter(r => r.riskLevel === 'HIGH');
  const medium = risks.filter(r => r.riskLevel === 'MEDIUM');

  return (
    <Box>
      {high.length > 0 && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          🚨 <strong>{high.length} booking{high.length > 1 ? 's' : ''}</strong> at HIGH cancellation risk — immediate action required
        </Alert>
      )}
      <Stack spacing={1.75}>
        {risks.sort((a, b) => b.riskScore - a.riskScore).map(risk => {
          const riskColor = risk.riskLevel === 'HIGH' ? '#ef4444' : risk.riskLevel === 'MEDIUM' ? '#f59e0b' : '#10b981';
          return (
            <Paper key={risk.bookingId} variant="outlined" sx={{ p: 2.5, borderRadius: 3,
              borderColor: risk.riskLevel === 'HIGH' ? '#fca5a5' : risk.riskLevel === 'MEDIUM' ? '#fde68a' : '#6ee7b7',
              bgcolor: risk.riskLevel === 'HIGH' ? '#fff8f8' : '#fff',
              transition: 'all .15s', '&:hover': { borderColor: riskColor, transform: 'translateX(2px)' } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1.25}>
                    <Typography variant="body2" fontWeight={800}>{risk.customerName}</Typography>
                    <Chip label={`${risk.riskLevel} RISK`} size="small"
                      sx={{ bgcolor: riskColor + '18', color: riskColor, fontWeight: 900, fontSize: 10, height: 20,
                        ...(risk.riskLevel === 'HIGH' ? { animation: 'pulse 2s ease infinite', '@keyframes pulse': {'0%,100%': { boxShadow: 'none' }, '50%': { boxShadow: `0 0 8px ${riskColor}60` } } } : {})
                      }} />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {risk.overdueInstallments} overdue installments · {risk.daysSinceLastPayment}d since last payment
                    {risk.totalOverdue > 0 ? ` · ${fmtINR(risk.totalOverdue)} overdue` : ''}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '1.4rem', fontWeight: 900, color: riskColor, lineHeight: 1 }}>{risk.riskScore}</Typography>
                  <Typography sx={{ fontSize: 9, color: '#9ca3af' }}>risk score</Typography>
                </Box>
              </Stack>

              <Box mb={1.5}>
                <Box sx={{ height: 5, bgcolor: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                  <Box sx={{ height: '100%', width: `${risk.riskScore}%`, bgcolor: riskColor, borderRadius: 3, transition: 'width .6s ease' }} />
                </Box>
              </Box>

              <Stack direction="row" spacing={0.75} flexWrap="wrap" mb={1.5}>
                {risk.riskFactors.map((f, i) => (
                  <Chip key={i} label={f} size="small"
                    sx={{ bgcolor: '#f3f4f6', color: '#6b7280', fontWeight: 700, fontSize: 9, height: 18, my: 0.25 }} />
                ))}
              </Stack>

              <Typography variant="caption" sx={{ color: '#64748b', fontStyle: 'italic', display: 'block', mb: 1.5 }}>
                💡 {risk.recommendation}
              </Typography>

              <Button size="small" variant="contained" disableElevation
                onClick={() => onContact(risk.bookingId)}
                sx={{ textTransform: 'none', fontWeight: 700, fontSize: 11, borderRadius: 2,
                  bgcolor: riskColor, '&:hover': { filter: 'brightness(0.9)' } }}>
                📞 Contact Now
              </Button>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
};

// ─── Broker Performance ───────────────────────────────────────────────────────
const BrokerInsightsSection: React.FC<{ brokers: BrokerInsight[] }> = ({ brokers }) => {
  const ratingColors = { EXCELLENT: '#10b981', GOOD: '#6366f1', AVERAGE: '#f59e0b', POOR: '#ef4444' };

  return (
    <Box>
      <Grid container spacing={2} mb={3}>
        {[
          { icon: '🤝', label: 'Total Partners', value: brokers.length,                                  color: '#6366f1' },
          { icon: '⭐', label: 'Excellent',       value: brokers.filter(b => b.rating === 'EXCELLENT').length, color: '#10b981' },
          { icon: '⚠️', label: 'Poor Performers', value: brokers.filter(b => b.rating === 'POOR').length, color: '#ef4444' },
          { icon: '💰', label: 'Total Revenue',   value: fmtINR(brokers.reduce((s, b) => s + b.revenue, 0)), color: '#f59e0b' },
        ].map(k => (
          <Grid item xs={6} sm={3} key={k.label}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, textAlign: 'center' }}>
              <Typography fontSize={22} mb={0.5}>{k.icon}</Typography>
              <Typography variant="h6" fontWeight={900} sx={{ color: k.color }}>{k.value}</Typography>
              <Typography variant="caption" fontWeight={700} color="text.secondary">{k.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Stack spacing={2}>
        {brokers.sort((a, b) => b.performanceScore - a.performanceScore).map((b, i) => {
          const rColor = ratingColors[b.rating];
          const medals = ['🥇','🥈','🥉'];
          return (
            <Paper key={b.partnerId} variant="outlined" sx={{ p: 2.5, borderRadius: 3.5, overflow: 'hidden',
              borderColor: rColor + '30', transition: 'all .2s', '&:hover': { borderColor: rColor, boxShadow: `0 6px 20px ${rColor}12` } }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
                <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 200 }}>
                  <Typography sx={{ fontSize: 22, width: 28 }}>{medals[i] ?? `${i+1}`}</Typography>
                  <Avatar sx={{ width: 44, height: 44, bgcolor: avatarColor(b.partnerName), fontWeight: 900 }}>
                    {initials(b.partnerName)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={800}>{b.partnerName}</Typography>
                    <Chip label={b.rating} size="small"
                      sx={{ bgcolor: rColor + '15', color: rColor, fontWeight: 800, fontSize: 9, height: 18 }} />
                  </Box>
                </Stack>

                <Grid container spacing={2} sx={{ flex: 1 }}>
                  {[
                    { label: 'Deals', value: b.deals },
                    { label: 'Conversions', value: b.conversions },
                    { label: 'Conv. Rate', value: `${b.conversionRate}%` },
                    { label: 'Revenue', value: fmtINR(b.revenue) },
                    { label: 'Avg Deal', value: fmtINR(b.avgDealValue) },
                    { label: 'Score', value: b.performanceScore },
                  ].map(m => (
                    <Grid item xs={4} sm={2} key={m.label}>
                      <Typography sx={{ fontSize: 9, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>{m.label}</Typography>
                      <Typography variant="body2" fontWeight={900}>{m.value}</Typography>
                    </Grid>
                  ))}
                </Grid>

                <Box sx={{ minWidth: 120 }}>
                  <Typography sx={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af', mb: 0.75 }}>
                    AI Insights
                  </Typography>
                  {b.insights.slice(0, 2).map((ins, j) => (
                    <Typography key={j} variant="caption" sx={{ color: rColor, fontSize: 10, display: 'block', mb: 0.25 }}>
                      • {ins}
                    </Typography>
                  ))}
                </Box>
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
};

// ─── Main AI Dashboard Page ───────────────────────────────────────────────────
const AIInsightsDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [hotLeads, setHotLeads] = useState<LeadScore[]>([]);
  const [inactiveLeads, setInactiveLeads] = useState<import('./aiTypes').InactiveLeadAlert[]>([]);
  const [agents, setAgents] = useState<AgentInsight[]>([]);
  const [forecast, setForecast] = useState<RevenueForecast | null>(null);
  const [opportunities, setOpportunities] = useState<OpportunityMatch[]>([]);
  const [paymentRisks, setPaymentRisks] = useState<PaymentRisk[]>([]);
  const [brokers, setBrokers] = useState<BrokerInsight[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [iRes, hlRes, ilRes, aRes, fRes, oRes, prRes, bRes] = await Promise.all([
        api.get('/ai/insights'),
        api.get('/ai/hot-leads'),
        api.get('/ai/inactive-leads'),
        api.get('/ai/agent-insights'),
        api.get('/ai/revenue-forecast'),
        api.get('/ai/opportunities'),
        api.get('/ai/payment-risks'),
        api.get('/ai/broker-insights'),
      ]);
      setInsights(iRes.data?.data ?? iRes.data ?? []);
      setHotLeads(hlRes.data?.data ?? hlRes.data ?? []);
      setInactiveLeads(ilRes.data?.data ?? ilRes.data ?? []);
      setAgents(aRes.data?.data ?? aRes.data ?? []);
      setForecast(fRes.data ?? null);
      setOpportunities(oRes.data?.data ?? oRes.data ?? []);
      setPaymentRisks(prRes.data?.data ?? prRes.data ?? []);
      setBrokers(bRes.data?.data ?? bRes.data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAcknowledge = async (id: string) => {
    try {
      await api.put(`/ai/insights/${id}/acknowledge`);
      setInsights(ins => ins.map(x => x.id === id ? { ...x, isAcknowledged: true } : x));
    } catch (e) { console.error(e); }
  };

  const handleAction = (type: string, payload?: any) => {
    console.log('AI Action:', type, payload);
    switch (type) {
      case 'CALL':
      case 'NEGOTIATE':
      case 'RE_ENGAGE':
        navigate('/admin/leads');
        break;
      case 'SEND_DOC':
      case 'BOOK_NOW':
        navigate('/admin/units');
        break;
      case 'VISIT':
        navigate('/admin/visits');
        break;
      default:
        navigate('/admin/dashboard');
    }
  };

  const handleRecommend = (unitId: string) => navigate(`/admin/units`);
  const handleContact = (bookingId: string) => navigate(`/admin/payments`);

  const criticalCount  = insights.filter(i => i.priority === 'CRITICAL' && !i.isAcknowledged).length;
  const highRiskCount  = paymentRisks.filter(r => r.riskLevel === 'HIGH').length;
  const hotLeadCount   = hotLeads.filter(h => h.temperature === 'VERY_HOT' || h.temperature === 'HOT').length;
  const inactiveCount  = inactiveLeads.length;

  const TABS = [
    { label: '🧠 Overview',      count: criticalCount },
    { label: '🔥 Hot Leads',     count: hotLeadCount  },
    { label: '💤 Inactive',      count: inactiveCount },
    { label: '💡 Opportunities', count: opportunities.length },
    { label: '💰 Payment Risk',  count: highRiskCount },
    { label: '📈 Forecast',      count: 0 },
    { label: '👥 Agents',        count: 0 },
    { label: '🤝 Brokers',       count: 0 },
  ];

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#fafafa', minHeight: '100vh' }}>
      {/* ── Header ── */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-start' }} mb={3.5} spacing={2}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={0.5}>
            <AutoAwesomeOutlined sx={{ color: '#f59e0b', fontSize: 28 }} />
            <Typography sx={{ fontFamily: '"DM Serif Display", serif', fontWeight: 700, fontSize: '2.25rem', letterSpacing: -1.5, lineHeight: 1, color: '#0f172a' }}>
              AI Insights
            </Typography>
          </Stack>
          <Typography variant="body1" color="text.secondary">
            Intelligent recommendations · Predictive analytics · Smart alerts
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} alignItems="center">
          {criticalCount > 0 && (
            <Chip icon={<WarningAmberOutlined sx={{ fontSize: '14px !important' }} />}
              label={`${criticalCount} critical alerts`}
              sx={{ bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 800, height: 30 }} />
          )}
          <IconButton onClick={fetchAll} size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <RefreshOutlined fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>

      {/* ── Tabs ── */}
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto"
        TabIndicatorProps={{ sx: { height: 3, borderRadius: 2 } }} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        {TABS.map((t, i) => (
          <Tab key={i}
            label={t.count > 0 ? (
              <Stack direction="row" spacing={0.75} alignItems="center">
                <span>{t.label}</span>
                <Box sx={{ px: 1, py: 0.125, borderRadius: 10, bgcolor: '#ef4444', display: 'flex', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: 9, fontWeight: 900, color: '#fff' }}>{t.count}</Typography>
                </Box>
              </Stack>
            ) : t.label}
            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.8rem', minHeight: 46 }} />
        ))}
      </Tabs>

      {/* ── Tab 0: Overview ── */}
      {activeTab === 0 && (
        <Box>
          {/* Quick summary cards */}
          <Grid container spacing={2} mb={4}>
            {[
              { icon: '🔥', label: 'Hot Leads Today',  value: hotLeadCount,   color: '#ef4444', action: () => setActiveTab(1) },
              { icon: '💤', label: 'Inactive Leads',   value: inactiveCount,  color: '#f59e0b', action: () => setActiveTab(2) },
              { icon: '💡', label: 'Opportunities',    value: opportunities.length, color: '#10b981', action: () => setActiveTab(3) },
              { icon: '⚠️', label: 'Payment Risks',    value: highRiskCount,  color: '#f97316', action: () => setActiveTab(4) },
              { icon: '🔮', label: 'Forecast Rev.',    value: forecast ? fmtINR(forecast.forecastRevenue) : '—', color: '#6366f1' },
              { icon: '⚡', label: 'Pending Actions',  value: insights.filter(i => i.type === 'ACTION' && !i.isAcknowledged).length, color: '#8b5cf6' },
            ].map(k => (
              <Grid item xs={6} sm={4} md={2} key={k.label}>
                <Paper variant="outlined" onClick={k.action} sx={{
                  p: 2.5, borderRadius: 3.5, textAlign: 'center',
                  cursor: k.action ? 'pointer' : 'default',
                  transition: 'all .2s',
                  '&:hover': k.action ? { borderColor: k.color, transform: 'translateY(-3px)', boxShadow: `0 12px 32px ${k.color}20` } : {},
                }}>
                  <Typography fontSize={24} mb={0.5}>{k.icon}</Typography>
                  <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color: k.color, lineHeight: 1 }}>{k.value}</Typography>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ fontSize: 10 }}>{k.label}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* AI Insights feed */}
          <Typography sx={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, color: '#9ca3af', mb: 2 }}>
            Live AI Insights ({insights.filter(i => !i.isAcknowledged).length} active)
          </Typography>
          <Stack spacing={1.5}>
            {insights.sort((a, b) => {
              const p = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
              return (p[b.priority] - p[a.priority]) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }).map(ins => (
              <AIInsightCard 
                key={ins.id} 
                insight={ins} 
                onAcknowledge={handleAcknowledge}
                onAction={(type) => handleAction(type, { id: ins.entityId })}
              />
            ))}
            {insights.length === 0 && (
              <Box sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
                <Typography fontSize={40} mb={1}>🧠</Typography>
                <Typography variant="h6" fontWeight={700}>No active insights</Typography>
                <Typography variant="body2">AI is analyzing your data. New insights will appear here.</Typography>
              </Box>
            )}
          </Stack>
        </Box>
      )}

      {/* ── Tab 1: Hot Leads ── */}
      {activeTab === 1 && (
        <Stack spacing={2}>
          {hotLeads.sort((a, b) => b.score - a.score).map(lead => (
            <Paper key={lead.leadId} variant="outlined" sx={{ p: 3, borderRadius: 3.5, overflow: 'hidden' }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} sm={2} sx={{ textAlign: 'center' }}>
                  <ScoreRing score={lead.score} temperature={lead.temperature} size={100} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <ScoreBreakdownPanel scoreData={lead} />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <WinProbabilityBar probability={lead.probability} stage="Negotiation" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <RecommendationCard 
                    recommendation={lead.recommendation} 
                    onAction={(type) => handleAction(type, { leadId: lead.leadId })}
                  />
                </Grid>
              </Grid>
            </Paper>
          ))}
          {hotLeads.length === 0 && (
            <Box sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
              <Typography fontSize={40} mb={1}>🔥</Typography>
              <Typography variant="h6" fontWeight={700}>No hot leads at the moment</Typography>
            </Box>
          )}
        </Stack>
      )}

      {/* ── Tab 2: Inactive Leads ── */}
      {activeTab === 2 && (
        <Box>
          {inactiveLeads.length > 0 && (
            <Alert severity="warning" sx={{ mb: 3, borderRadius: 3, fontWeight: 700 }}>
              🔄 {inactiveLeads.length} leads have gone inactive — re-engaging them could recover significant pipeline value
            </Alert>
          )}
          <Stack spacing={1.5}>
            {inactiveLeads.sort((a, b) => b.daysSinceLastActivity - a.daysSinceLastActivity).map(a => (
              <InactiveLeadRow key={a.leadId} alert={a} onReEngage={() => handleAction('RE_ENGAGE', { leadId: a.leadId })} />
            ))}
            {inactiveLeads.length === 0 && (
              <Box sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
                <Typography fontSize={40} mb={1}>✅</Typography>
                <Typography variant="h6" fontWeight={700}>No inactive leads detected</Typography>
                <Typography variant="body2">All your leads have recent activity</Typography>
              </Box>
            )}
          </Stack>
        </Box>
      )}

      {activeTab === 3 && (
        <OpportunitiesSection 
          opportunities={opportunities} 
          onRecommend={handleRecommend}
        />
      )}
      {activeTab === 4 && (
        <PaymentRiskSection 
          risks={paymentRisks} 
          onContact={handleContact}
        />
      )}
      {activeTab === 5 && forecast && <ForecastSection forecast={forecast} />}
      {activeTab === 6 && <AgentInsightsSection agents={agents} />}
      {activeTab === 7 && <BrokerInsightsSection brokers={brokers} />}
    </Box>
  );
};

export default AIInsightsDashboardPage;