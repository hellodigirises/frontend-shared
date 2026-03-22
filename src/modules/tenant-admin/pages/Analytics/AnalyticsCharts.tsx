import React from 'react';
import { Box, Typography, Stack, Paper } from '@mui/material';
import { CHART_PALETTE, toPolyline, toAreaPath, normalise } from './analyticsTypes';

// ─── Sparkline ────────────────────────────────────────────────────────────────
export const Sparkline: React.FC<{
  data: number[]; color?: string; width?: number; height?: number; filled?: boolean;
}> = ({ data, color = '#6366f1', width = 120, height = 40, filled = true }) => {
  if (!data || data.length < 2) return null;
  const id = `sg${color.replace(/[^a-z0-9]/gi, '')}`;
  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {filled && <path d={toAreaPath(data, width, height)} fill={`url(#${id})`} />}
      <polyline points={toPolyline(data, width, height)}
        fill="none" stroke={color} strokeWidth="2"
        strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

// ─── Area Chart ───────────────────────────────────────────────────────────────
export const AreaChart: React.FC<{
  data: { label: string; value: number; value2?: number }[];
  color?: string; color2?: string; height?: number;
  showLabels?: boolean; formatValue?: (v: number) => string;
}> = ({ data, color = '#6366f1', color2 = '#10b981', height = 220, showLabels = true, formatValue }) => {
  if (!data || data.length < 2) return (
    <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="caption" color="text.secondary">No data available</Typography>
    </Box>
  );
  const W = 600, H = height - (showLabels ? 32 : 8);
  const vals = data.map(d => d.value);
  const has2 = data.some(d => d.value2 !== undefined);
  const vals2 = data.map(d => d.value2 ?? 0);
  const mx = Math.max(...vals, ...(has2 ? vals2 : [0]), 1);
  const toX = (i: number) => Math.round((i / (data.length - 1)) * (W - 2)) + 1;
  const toY = (v: number) => Math.round(H - (v / mx) * (H - 8) + 4);
  const line1 = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(d.value)}`).join(' ');
  const area1 = `${line1} L${toX(data.length-1)},${H} L0,${H} Z`;
  const line2 = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(d.value2 ?? 0)}`).join(' ');
  const area2 = `${line2} L${toX(data.length-1)},${H} L0,${H} Z`;
  const gridVals = Array.from({ length: 5 }, (_, i) => Math.round(mx - (i / 4) * mx));

  return (
    <svg viewBox={`0 0 ${W} ${height}`} style={{ width: '100%', height, overflow: 'visible' }}>
      <defs>
        <linearGradient id="acg1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="acg2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color2} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color2} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {gridVals.map((v, i) => {
        const y = Math.round((i / 4) * (H - 8) + 4);
        return (
          <g key={i}>
            <line x1={0} y1={y} x2={W} y2={y} stroke="#f1f5f9" strokeWidth="1" />
            <text x={2} y={y - 3} fontSize={9} fill="#94a3b8" fontFamily="'DM Sans',sans-serif">
              {formatValue ? formatValue(v) : v >= 10000000 ? `₹${(v/10000000).toFixed(1)}Cr` : v >= 100000 ? `₹${(v/100000).toFixed(0)}L` : v.toLocaleString('en-IN')}
            </text>
          </g>
        );
      })}
      {has2 && <><path d={area2} fill="url(#acg2)" /><path d={line2} fill="none" stroke={color2} strokeWidth="2.5" strokeDasharray="6 3" strokeLinejoin="round" strokeLinecap="round" /></>}
      <path d={area1} fill="url(#acg1)" />
      <path d={line1} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={toX(i)} cy={toY(d.value)} r={3} fill={color} />
          {showLabels && <text x={toX(i)} y={height - 4} textAnchor="middle" fontSize={9} fill="#94a3b8" fontFamily="'DM Sans',sans-serif">{d.label}</text>}
        </g>
      ))}
    </svg>
  );
};

// ─── Horizontal Bar Chart ─────────────────────────────────────────────────────
export const HBarChart: React.FC<{
  data: { label: string; value: number; sub?: string; color?: string }[];
  formatValue?: (v: number) => string; showRank?: boolean;
}> = ({ data, formatValue, showRank = false }) => {
  const mx = Math.max(...data.map(d => d.value), 1);
  const medals = ['🥇','🥈','🥉'];
  return (
    <Stack spacing={1.5}>
      {data.map((d, i) => {
        const pct = Math.round((d.value / mx) * 100);
        const color = d.color ?? CHART_PALETTE[i % CHART_PALETTE.length];
        const fmtd = formatValue ? formatValue(d.value) : d.value.toLocaleString('en-IN');
        return (
          <Stack key={d.label} direction="row" alignItems="center" spacing={1.5}>
            {showRank && <Typography sx={{ width: 24, textAlign: 'center', fontSize: 16, flexShrink: 0 }}>{medals[i] ?? `${i+1}`}</Typography>}
            <Typography variant="caption" fontWeight={700} sx={{ width: 100, flexShrink: 0, color: '#374151' }} noWrap>{d.label}</Typography>
            <Box sx={{ flex: 1, height: 28, bgcolor: '#f3f4f6', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
              <Box sx={{ height: '100%', width: `${pct}%`, borderRadius: 2, transition: 'width .6s ease',
                background: `linear-gradient(90deg, ${color}cc, ${color})` }} />
            </Box>
            <Box sx={{ textAlign: 'right', minWidth: 72, flexShrink: 0 }}>
              <Typography variant="caption" fontWeight={900} sx={{ color }}>{fmtd}</Typography>
              {d.sub && <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: 9 }}>{d.sub}</Typography>}
            </Box>
          </Stack>
        );
      })}
    </Stack>
  );
};

// ─── Vertical Bar Chart (SVG) ─────────────────────────────────────────────────
export const VBarChart: React.FC<{
  data: { label: string; value: number; color?: string }[];
  height?: number; formatValue?: (v: number) => string;
}> = ({ data, height = 200, formatValue }) => {
  if (!data || data.length === 0) return null;
  const mx = Math.max(...data.map(d => d.value), 1);
  const W = 600, H = height - 36;
  const bw = Math.max(10, Math.floor((W / data.length) * 0.55));
  const gap = W / data.length;
  return (
    <svg viewBox={`0 0 ${W} ${height}`} style={{ width: '100%', height }}>
      {Array.from({ length: 5 }, (_, i) => {
        const y = Math.round((i / 4) * H);
        const v = Math.round(mx - (i / 4) * mx);
        return (
          <g key={i}>
            <line x1={0} y1={y} x2={W} y2={y} stroke="#f1f5f9" strokeWidth="1" />
            <text x={0} y={y - 2} fontSize={9} fill="#94a3b8" fontFamily="'DM Sans',sans-serif">
              {formatValue ? formatValue(v) : v >= 100000 ? `₹${(v/100000).toFixed(0)}L` : v.toLocaleString()}
            </text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const x = gap * i + gap / 2 - bw / 2;
        const bh = Math.max(2, Math.round((d.value / mx) * H));
        const color = d.color ?? CHART_PALETTE[i % CHART_PALETTE.length];
        return (
          <g key={d.label}>
            <defs><linearGradient id={`vbg${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} /><stop offset="100%" stopColor={color} stopOpacity="0.7" /></linearGradient></defs>
            <rect x={x} y={H - bh} width={bw} height={bh} rx={4} fill={`url(#vbg${i})`} />
            <text x={x + bw / 2} y={height - 4} textAnchor="middle" fontSize={9} fill="#94a3b8" fontFamily="'DM Sans',sans-serif">{d.label.slice(0, 7)}</text>
          </g>
        );
      })}
    </svg>
  );
};

// ─── Donut Chart ──────────────────────────────────────────────────────────────
export const DonutChart: React.FC<{
  data: { label: string; value: number; color?: string }[];
  size?: number; showLegend?: boolean; centerLabel?: string; centerValue?: string;
}> = ({ data, size = 160, showLegend = true, centerLabel, centerValue }) => {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const R = size / 2 - 12, ri = R * 0.58, cx = size / 2, cy = size / 2;
  let sa = -Math.PI / 2;
  const segs = data.map((d, i) => {
    const ang = (d.value / total) * 2 * Math.PI;
    const [x1, y1] = [cx + R * Math.cos(sa), cy + R * Math.sin(sa)];
    const [x2, y2] = [cx + R * Math.cos(sa + ang), cy + R * Math.sin(sa + ang)];
    const [ix1, iy1] = [cx + ri * Math.cos(sa), cy + ri * Math.sin(sa)];
    const [ix2, iy2] = [cx + ri * Math.cos(sa + ang), cy + ri * Math.sin(sa + ang)];
    const la = ang > Math.PI ? 1 : 0;
    const path = `M${x1.toFixed(1)},${y1.toFixed(1)} A${R},${R} 0 ${la},1 ${x2.toFixed(1)},${y2.toFixed(1)} L${ix2.toFixed(1)},${iy2.toFixed(1)} A${ri},${ri} 0 ${la},0 ${ix1.toFixed(1)},${iy1.toFixed(1)} Z`;
    sa += ang;
    return { ...d, path, color: d.color ?? CHART_PALETTE[i % CHART_PALETTE.length], pct: Math.round(d.value / total * 100) };
  });

  return (
    <Stack direction={showLegend ? 'row' : 'column'} alignItems="center" spacing={2} flexWrap="wrap">
      <svg width={size} height={size} style={{ flexShrink: 0 }}>
        {segs.map((s, i) => <path key={i} d={s.path} fill={s.color} opacity={0.92}><title>{s.label}: {s.pct}%</title></path>)}
        {centerLabel && <text x={cx} y={cy - 4} textAnchor="middle" fontSize={10} fill="#6b7280" fontFamily="'DM Sans',sans-serif">{centerLabel}</text>}
        {centerValue && <text x={cx} y={cy + 12} textAnchor="middle" fontSize={15} fontWeight="bold" fill="#0f172a" fontFamily="'DM Sans',sans-serif">{centerValue}</text>}
      </svg>
      {showLegend && (
        <Stack spacing={1}>
          {segs.map(s => (
            <Stack key={s.label} direction="row" alignItems="center" spacing={1}>
              <Box sx={{ width: 10, height: 10, borderRadius: 1.5, bgcolor: s.color, flexShrink: 0 }} />
              <Typography variant="caption" fontWeight={700} color="text.primary">{s.label}</Typography>
              <Typography variant="caption" sx={{ color: s.color, fontWeight: 800 }}>{s.pct}%</Typography>
            </Stack>
          ))}
        </Stack>
      )}
    </Stack>
  );
};

// ─── Funnel Chart ─────────────────────────────────────────────────────────────
export const FunnelChart: React.FC<{
  stages: { label: string; count: number; value?: number; color: string; dropoff?: number }[];
}> = ({ stages }) => {
  const max = stages[0]?.count || 1;
  return (
    <Stack spacing={0.75}>
      {stages.map((s, i) => {
        const pct = Math.round((s.count / max) * 100);
        return (
          <Box key={s.label}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
              <Typography variant="caption" fontWeight={800} sx={{ color: '#374151', width: 130 }}>{s.label}</Typography>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Typography variant="caption" fontWeight={900} sx={{ color: s.color }}>{s.count.toLocaleString('en-IN')}</Typography>
                {i > 0 && s.dropoff !== undefined && (
                  <Typography variant="caption" sx={{ color: '#ef4444', fontSize: 10, bgcolor: '#fee2e2', px: 0.75, py: 0.25, borderRadius: 1 }}>↓{s.dropoff}%</Typography>
                )}
              </Stack>
            </Stack>
            <Box sx={{ mx: `${(100 - pct) / 2}%`, transition: 'margin .5s ease' }}>
              <Box sx={{ height: 32, bgcolor: '#f3f4f6', borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ height: '100%', width: '100%', borderRadius: 2, background: `linear-gradient(90deg, ${s.color}cc, ${s.color})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#fff' }}>{pct}%</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
};

// ─── Gauge Ring ───────────────────────────────────────────────────────────────
export const GaugeRing: React.FC<{
  value: number; max?: number; color?: string; size?: number;
  label?: string; subLabel?: string; formatValue?: (v: number) => string;
}> = ({ value, max = 100, color = '#6366f1', size = 120, label, subLabel, formatValue }) => {
  const pct = Math.min(100, max ? Math.round((value / max) * 100) : value);
  const R = size / 2 - 8, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * R;
  const dash = (pct / 100) * circ;
  return (
    <Box sx={{ textAlign: 'center', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#f3f4f6" strokeWidth={8} />
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`} style={{ transition: 'stroke-dasharray .6s ease' }} />
        <text x={cx} y={cy - (subLabel ? 5 : 0)} textAnchor="middle" fontSize={size > 100 ? 16 : 13}
          fontWeight="bold" fill="#0f172a" fontFamily="'DM Sans',sans-serif">
          {formatValue ? formatValue(value) : `${pct}%`}
        </text>
        {subLabel && <text x={cx} y={cy + 13} textAnchor="middle" fontSize={9} fill="#94a3b8" fontFamily="'DM Sans',sans-serif">{subLabel}</text>}
      </svg>
      {label && <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mt: -0.5 }}>{label}</Typography>}
    </Box>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
export const KpiCard: React.FC<{
  icon: string; label: string; value: string | number;
  sub?: string; color: string; trend?: { value: number; label?: string };
  sparkData?: number[]; onClick?: () => void; active?: boolean; dark?: boolean;
}> = ({ icon, label, value, sub, color, trend, sparkData, onClick, active, dark }) => {
  const growthColor = trend ? (trend.value >= 0 ? '#10b981' : '#ef4444') : null;

  return (
    <Paper variant="outlined" onClick={onClick}
      sx={{
        p: 2.5, borderRadius: 3.5, cursor: onClick ? 'pointer' : 'default',
        border: '1.5px solid', transition: 'all .2s',
        borderColor: active ? color : dark ? '#1e293b' : '#e5e7eb',
        bgcolor: dark ? '#0f172a' : active ? color + '0c' : '#fff',
        '&:hover': onClick ? { transform: 'translateY(-3px)', boxShadow: `0 12px 32px ${color}25`, borderColor: color } : {},
      }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
        <Box sx={{ width: 40, height: 40, borderRadius: 2.5, bgcolor: dark ? color + '25' : color + '15',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
          {icon}
        </Box>
        {trend && growthColor && (
          <Typography sx={{ fontSize: 11, fontWeight: 800, color: growthColor, bgcolor: growthColor + '18', px: 1, py: 0.25, borderRadius: 1.5 }}>
            {trend.value >= 0 ? '+' : ''}{trend.value.toFixed(1)}%
          </Typography>
        )}
      </Stack>
      <Typography sx={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, color: dark ? '#64748b' : '#9ca3af', mb: 0.5 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: '1.65rem', fontWeight: 900, color: dark ? '#f1f5f9' : '#0f172a', lineHeight: 1, mb: sub ? 0.5 : 0 }}>
        {value}
      </Typography>
      {sub && <Typography sx={{ fontSize: 11, color: dark ? '#475569' : '#9ca3af', fontWeight: 600 }}>{sub}</Typography>}
      {sparkData && sparkData.length > 2 && <Box sx={{ mt: 1.5 }}><Sparkline data={sparkData} color={color} width={100} height={28} /></Box>}
    </Paper>
  );
};

// ─── Chart Card wrapper ───────────────────────────────────────────────────────
export const ChartCard: React.FC<{
  title: string; sub?: string; action?: React.ReactNode; children: React.ReactNode;
  minHeight?: number;
}> = ({ title, sub, action, children, minHeight }) => (
  <Paper variant="outlined" sx={{ borderRadius: 3.5, overflow: 'hidden', height: '100%' }}>
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ px: 3, pt: 2.5, pb: 2 }}>
      <Box>
        <Typography variant="body1" fontWeight={800} sx={{ color: '#0f172a' }}>{title}</Typography>
        {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
      </Box>
      {action}
    </Stack>
    <Box sx={{ px: 3, pb: 3, minHeight }}>
      {children}
    </Box>
  </Paper>
);