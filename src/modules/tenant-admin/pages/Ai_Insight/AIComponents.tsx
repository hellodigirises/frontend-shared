import React, { useState } from 'react';
import {
  Box, Typography, Stack, Button, Chip, Paper,
  Divider, Avatar, Tooltip, CircularProgress, LinearProgress
} from '@mui/material';
import {
  AutoAwesomeOutlined, TrendingUpOutlined, TrendingDownOutlined,
  ExpandMoreOutlined, ExpandLessOutlined, FlashOnOutlined,
  WarningAmberOutlined, EmojiEventsOutlined, TimerOutlined
} from '@mui/icons-material';
import {
  LeadScore, LeadTemperature, SmartRecommendation, AIInsight,
  TEMPERATURE_CFG, RECOMMENDATION_CFG, URGENCY_CFG,
  INSIGHT_TYPE_CFG, INSIGHT_PRIORITY_CFG,
  timeAgo, fmtINR
} from './aiTypes';

// ─── Score Radial Ring ────────────────────────────────────────────────────────
export const ScoreRing: React.FC<{
  score: number; size?: number; temperature: LeadTemperature; showLabel?: boolean;
}> = ({ score, size = 120, temperature, showLabel = true }) => {
  const cfg = TEMPERATURE_CFG[temperature];
  const R   = size / 2 - 8;
  const cx  = size / 2;
  const cy  = size / 2;
  const circ = 2 * Math.PI * R;
  const dash = (score / 100) * circ;

  return (
    <Box sx={{ textAlign: 'center', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ position: 'relative', display: 'inline-block' }}>
        <svg width={size} height={size}>
          <defs>
            <radialGradient id={`rg${score}`}>
              <stop offset="0%" stopColor={cfg.color} stopOpacity="0.15" />
              <stop offset="100%" stopColor={cfg.color} stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="#1e293b" strokeWidth={10} />
          <circle cx={cx} cy={cy} r={R} fill="none" stroke={cfg.color} strokeWidth={10}
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition: 'stroke-dasharray .8s ease', filter: `drop-shadow(0 0 6px ${cfg.glow})` }} />
          <circle cx={cx} cy={cy} r={R * 0.72} fill={`url(#rg${score})`} />
          <text x={cx} y={cy - 5} textAnchor="middle" fontSize={size > 100 ? 22 : 16} fontWeight="900"
            fill={cfg.color} fontFamily="'DM Serif Display', serif">
            {score}
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" fontSize={10} fill="#64748b" fontFamily="'DM Sans', sans-serif">
            /100
          </text>
        </svg>
        <Box sx={{
          position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)',
          px: 1.5, py: 0.25, borderRadius: 10, bgcolor: cfg.bg, border: `1px solid ${cfg.color}40`,
        }}>
          <Typography sx={{ fontSize: 12, fontWeight: 900, color: cfg.color, whiteSpace: 'nowrap' }}>
            {cfg.icon} {cfg.label}
          </Typography>
        </Box>
      </Box>
      {showLabel && (
        <Typography variant="caption" sx={{ mt: 2.5, color: '#64748b', fontWeight: 600 }}>AI Lead Score</Typography>
      )}
    </Box>
  );
};

// ─── Score Breakdown ──────────────────────────────────────────────────────────
export const ScoreBreakdownPanel: React.FC<{ scoreData: LeadScore }> = ({ scoreData }) => {
  const [expanded, setExpanded] = useState(false);
  const { breakdown, signals, trend, trendDelta } = scoreData;

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" fontWeight={800}>Score Breakdown</Typography>
          <Chip
            label={trend === 'RISING' ? `↑ +${trendDelta}` : trend === 'FALLING' ? `↓ ${trendDelta}` : '→ Stable'}
            size="small"
            sx={{
              bgcolor: trend === 'RISING' ? '#d1fae5' : trend === 'FALLING' ? '#fee2e2' : '#f3f4f6',
              color: trend === 'RISING' ? '#065f46' : trend === 'FALLING' ? '#dc2626' : '#6b7280',
              fontWeight: 800, fontSize: 10, height: 20,
            }} />
        </Stack>
        <Button size="small" onClick={() => setExpanded(e => !e)}
          endIcon={expanded ? <ExpandLessOutlined sx={{ fontSize: 14 }} /> : <ExpandMoreOutlined sx={{ fontSize: 14 }} />}
          sx={{ textTransform: 'none', fontSize: 11, fontWeight: 700 }}>
          {expanded ? 'Less' : 'Details'}
        </Button>
      </Stack>

      <Stack spacing={1.25}>
        {Object.values(breakdown).map((factor, i) => {
          const pct = Math.round((factor.score / factor.max) * 100);
          const color = pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444';
          return (
            <Box key={i}>
              {expanded && (
                <Stack direction="row" justifyContent="space-between" mb={0.4}>
                  <Typography variant="caption" fontWeight={700} sx={{ color: '#374151' }}>{factor.label}</Typography>
                  <Typography variant="caption" fontWeight={900} sx={{ color }}>
                    {factor.score}/{factor.max}
                  </Typography>
                </Stack>
              )}
              <Box sx={{ height: expanded ? 6 : 4, bgcolor: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: color, borderRadius: 3,
                  transition: 'width .6s ease', boxShadow: pct >= 70 ? `0 0 6px ${color}80` : 'none' }} />
              </Box>
            </Box>
          );
        })}
      </Stack>

      {/* Signals */}
      {signals.length > 0 && expanded && (
        <Box mt={2}>
          <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af', display: 'block', mb: 1 }}>
            Detected Signals
          </Typography>
          <Stack spacing={0.75}>
            {signals.map((s, i) => (
              <Stack key={i} direction="row" alignItems="center" spacing={1}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  bgcolor: s.weight === 'POSITIVE' ? '#10b981' : s.weight === 'NEGATIVE' ? '#ef4444' : '#9ca3af' }} />
                <Typography variant="caption" sx={{ color: '#374151', fontWeight: 600 }}>{s.label}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

// ─── Win Probability Bar ──────────────────────────────────────────────────────
export const WinProbabilityBar: React.FC<{ probability: number; stage: string }> = ({ probability, stage }) => {
  const color = probability >= 70 ? '#10b981' : probability >= 40 ? '#f59e0b' : '#ef4444';
  const label = probability >= 70 ? 'High' : probability >= 40 ? 'Medium' : 'Low';

  return (
    <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: '#0f172a', position: 'relative', overflow: 'hidden' }}>
      {/* Background pulse */}
      <Box sx={{
        position: 'absolute', inset: 0, opacity: 0.06,
        background: `radial-gradient(circle at 80% 50%, ${color}, transparent 60%)`,
      }} />
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box>
          <Typography sx={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#64748b', mb: 0.5 }}>
            Win Probability
          </Typography>
          <Stack direction="row" alignItems="baseline" spacing={1}>
            <Typography sx={{ fontSize: '2rem', fontWeight: 900, color, fontFamily: '"DM Serif Display", serif', lineHeight: 1 }}>
              {probability}%
            </Typography>
            <Chip label={label} size="small"
              sx={{ bgcolor: color + '25', color, fontWeight: 800, border: `1px solid ${color}40`, fontSize: 11 }} />
          </Stack>
        </Box>
        <Box sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: color + '20',
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography fontSize={24}>🎯</Typography>
        </Box>
      </Stack>

      <Box sx={{ height: 8, bgcolor: '#1e293b', borderRadius: 4, overflow: 'hidden' }}>
        <Box sx={{
          height: '100%', width: `${probability}%`, borderRadius: 4,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          transition: 'width .8s ease',
          boxShadow: `0 0 12px ${color}60`,
        }} />
      </Box>
      <Typography sx={{ fontSize: 10, color: '#475569', mt: 0.75 }}>Stage: {stage}</Typography>
    </Box>
  );
};

// ─── Smart Recommendation Card ────────────────────────────────────────────────
export const RecommendationCard: React.FC<{
  recommendation: SmartRecommendation;
  onAction?: (actionType: string) => void;
}> = ({ recommendation, onAction }) => {
  const recCfg = RECOMMENDATION_CFG[recommendation.type];
  const urgCfg = URGENCY_CFG[recommendation.urgency];

  return (
    <Box sx={{
      p: 2.5, borderRadius: 3, position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      border: `1px solid ${recCfg.color}30`,
      boxShadow: `0 4px 24px ${recCfg.color}15`,
    }}>
      {/* Glow */}
      <Box sx={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%',
        bgcolor: recCfg.color, opacity: 0.06, filter: 'blur(30px)' }} />

      <Stack direction="row" alignItems="flex-start" spacing={1.5} mb={2}>
        <Box sx={{ width: 40, height: 40, borderRadius: 2.5, bgcolor: recCfg.color + '20',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
          border: `1px solid ${recCfg.color}40` }}>
          {recCfg.icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <AutoAwesomeOutlined sx={{ fontSize: 13, color: '#f59e0b' }} />
              <Typography sx={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#64748b' }}>
                AI Recommendation
              </Typography>
            </Stack>
            <Chip label={urgCfg.label} size="small"
              sx={{ bgcolor: urgCfg.bg, color: urgCfg.color, fontWeight: 800, fontSize: 9, height: 18,
                ...(urgCfg.pulse ? { animation: 'urge 1.5s ease infinite', '@keyframes urge': { '0%,100%': { boxShadow: 'none' }, '50%': { boxShadow: `0 0 8px ${urgCfg.color}60` } } } : {})
              }} />
          </Stack>
          <Typography variant="body2" fontWeight={800} sx={{ color: '#f1f5f9' }}>{recommendation.title}</Typography>
        </Box>
      </Stack>

      <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 2, lineHeight: 1.6 }}>
        {recommendation.description}
      </Typography>

      {/* Confidence */}
      <Box mb={2}>
        <Stack direction="row" justifyContent="space-between" mb={0.5}>
          <Typography sx={{ fontSize: 10, color: '#64748b', fontWeight: 700 }}>Confidence</Typography>
          <Typography sx={{ fontSize: 10, color: recCfg.color, fontWeight: 900 }}>{recommendation.confidence}%</Typography>
        </Stack>
        <Box sx={{ height: 3, bgcolor: '#1e293b', borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ height: '100%', width: `${recommendation.confidence}%`, bgcolor: recCfg.color, borderRadius: 2 }} />
        </Box>
      </Box>

      <Stack direction="row" spacing={1} flexWrap="wrap">
        {recommendation.actions.map((action, i) => (
          <Button key={i} size="small" variant="outlined"
            onClick={() => onAction?.(action.type)}
            sx={{
              textTransform: 'none', fontWeight: 700, fontSize: 11, borderRadius: 2, py: 0.5,
              borderColor: recCfg.color + '60', color: recCfg.color,
              bgcolor: recCfg.color + '10',
              '&:hover': { bgcolor: recCfg.color + '20', borderColor: recCfg.color }
            }}>
            {action.label}
          </Button>
        ))}
      </Stack>
    </Box>
  );
};

// ─── AI Insight Card ──────────────────────────────────────────────────────────
export const AIInsightCard: React.FC<{
  insight: AIInsight;
  onAcknowledge: (id: string) => void;
  onAction?: (actionType: string) => void;
  compact?: boolean;
}> = ({ insight, onAcknowledge, onAction, compact = false }) => {
  const typeCfg  = INSIGHT_TYPE_CFG[insight.type];
  const prioCfg  = INSIGHT_PRIORITY_CFG[insight.priority];

  return (
    <Box sx={{
      p: compact ? 2 : 2.5, borderRadius: 3,
      border: `1.5px solid ${typeCfg.color}30`,
      bgcolor: insight.isAcknowledged ? '#fafafa' : '#fff',
      transition: 'all .2s', opacity: insight.isAcknowledged ? 0.6 : 1,
      '&:hover': { borderColor: typeCfg.color, boxShadow: `0 4px 16px ${typeCfg.color}12` },
    }}>
      <Stack direction="row" alignItems="flex-start" spacing={1.5}>
        <Box sx={{ width: 36, height: 36, borderRadius: 2.5, bgcolor: typeCfg.bg, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          border: `1px solid ${typeCfg.color}30` }}>
          {typeCfg.icon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <Chip label={prioCfg.label} size="small"
                sx={{ bgcolor: prioCfg.bg, color: prioCfg.color, fontWeight: 800, fontSize: 9, height: 16 }} />
              <Chip label={typeCfg.label} size="small"
                sx={{ bgcolor: typeCfg.bg, color: typeCfg.color, fontWeight: 700, fontSize: 9, height: 16 }} />
            </Stack>
            <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: 10, flexShrink: 0 }}>
              {timeAgo(insight.createdAt)}
            </Typography>
          </Stack>
          <Typography variant="body2" fontWeight={800} sx={{ color: '#0f172a', mb: 0.4 }}>{insight.title}</Typography>
          {!compact && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, lineHeight: 1.5 }}>
              {insight.description}
            </Typography>
          )}
          {insight.metricValue && (
            <Typography variant="caption" sx={{ color: typeCfg.color, fontWeight: 800, display: 'block', mb: 1 }}>
              {insight.metric}: {insight.metricValue}
            </Typography>
          )}
          {insight.actions && insight.actions.length > 0 && !compact && (
            <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
              {insight.actions.map((a, i) => (
                <Button key={i} size="small" variant="outlined"
                  sx={{ textTransform: 'none', fontWeight: 700, fontSize: 10, py: 0.4, px: 1.5,
                    borderRadius: 2, borderColor: typeCfg.color + '60', color: typeCfg.color,
                    '&:hover': { bgcolor: typeCfg.bg } }}>
                  {a.label}
                </Button>
              ))}
              {!insight.isAcknowledged && (
                <Button size="small" onClick={() => onAcknowledge(insight.id)}
                  sx={{ textTransform: 'none', fontWeight: 700, fontSize: 10, py: 0.4, px: 1.5,
                    borderRadius: 2, color: '#9ca3af', '&:hover': { bgcolor: '#f3f4f6' } }}>
                  Dismiss
                </Button>
              )}
            </Stack>
          )}
        </Box>
      </Stack>
    </Box>
  );
};

// ─── Inactive Lead Alert ──────────────────────────────────────────────────────
export const InactiveLeadRow: React.FC<{
  alert: import('./aiTypes').InactiveLeadAlert;
  onReEngage: () => void;
}> = ({ alert: a, onReEngage }) => {
  const danger = a.daysSinceLastActivity > 14;
  return (
    <Box sx={{ p: 2, borderRadius: 2.5, border: `1.5px solid ${danger ? '#fca5a5' : '#fde68a'}`,
      bgcolor: danger ? '#fff8f8' : '#fffbeb', transition: 'all .15s',
      '&:hover': { borderColor: danger ? '#ef4444' : '#f59e0b', transform: 'translateX(2px)' } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: danger ? '#ef4444' : '#f59e0b',
            flexShrink: 0, animation: 'ping 2s ease infinite',
            '@keyframes ping': { '0%,100%': { opacity: 1, transform: 'scale(1)' }, '50%': { opacity: 0.6, transform: 'scale(1.4)' } } }} />
          <Box>
            <Typography variant="body2" fontWeight={800}>{a.leadName}</Typography>
            <Typography variant="caption" color="text.secondary">
              {a.project ?? 'No project'} · Last: {a.lastActivityType}
            </Typography>
          </Box>
        </Stack>
        <Stack alignItems="flex-end" spacing={0.5}>
          <Chip label={`${a.daysSinceLastActivity}d inactive`} size="small"
            sx={{ bgcolor: danger ? '#fee2e2' : '#fef3c7', color: danger ? '#dc2626' : '#92400e', fontWeight: 800, fontSize: 10, height: 20 }} />
          {a.potentialValue > 0 && (
            <Typography sx={{ fontSize: 10, color: '#10b981', fontWeight: 700 }}>{fmtINR(a.potentialValue)} potential</Typography>
          )}
        </Stack>
      </Stack>
      <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 1, mb: 1.25, fontStyle: 'italic' }}>
        💡 {a.reEngageRecommendation}
      </Typography>
      <Button size="small" variant="contained" disableElevation onClick={onReEngage}
        sx={{ textTransform: 'none', fontWeight: 700, fontSize: 11, borderRadius: 2, py: 0.5,
          bgcolor: danger ? '#ef4444' : '#f59e0b', '&:hover': { bgcolor: danger ? '#dc2626' : '#d97706' } }}>
        🔄 Re-engage Now
      </Button>
    </Box>
  );
};