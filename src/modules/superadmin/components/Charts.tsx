// src/modules/superadmin/components/Charts.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell,
} from 'recharts';
import { C, INR } from '../hooks';

const GRID = { stroke: 'rgba(255,255,255,0.05)', strokeDasharray: '4 3' };
const AXIS = { fill: C.textSub, fontSize: 11 };
const TIP  = { background: C.surfaceHigh, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 };

const MOD_COLORS: Record<string, string> = {
  CRM: '#4F7FFF', INVENTORY: '#a855f7', BOOKINGS: '#22c55e', FINANCE: '#f59e0b',
  HR: '#06b6d4', PROCUREMENT: '#ef4444', CONSTRUCTION: '#f97316',
  ANALYTICS: '#ec4899', AI_INSIGHTS: '#8b5cf6', MARKETING: '#14b8a6', DOCUMENTS: '#6366f1',
};

// ── Revenue Area ──────────────────────────────────────────────────────────────
export function RevenueChart({ data }: {
  data: { month: string; plan: number; addon: number; ai: number; telephony: number }[];
}) {
  const series = [
    { key: 'plan',      name: 'Plan',      color: C.primary  },
    { key: 'addon',     name: 'Add-on',    color: C.purple   },
    { key: 'ai',        name: 'AI',        color: C.warning  },
    { key: 'telephony', name: 'Telephony', color: C.cyan     },
  ];
  return (
    <Box sx={{ bgcolor: C.surface, borderRadius: '14px', p: 2.5, border: `1px solid ${C.border}` }}>
      <Typography sx={{ color: C.text, fontWeight: 600, fontSize: 13, mb: 2 }}>Revenue Growth (12 months)</Typography>
      <ResponsiveContainer width="100%" height={230}>
        <AreaChart data={data} margin={{ right: 4, left: -16, bottom: 0 }}>
          <defs>
            {series.map(s => (
              <linearGradient key={s.key} id={`g_${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="8%"  stopColor={s.color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={s.color} stopOpacity={0}    />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid {...GRID} />
          <XAxis dataKey="month" tick={AXIS} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={TIP}
            labelStyle={{ color: C.text }}
            formatter={(v: number | string | undefined, n: string | number | undefined) => [INR(Number(v ?? 0)), String(n ?? '')]}
          />
          <Legend formatter={v => <span style={{ color: C.textSub, fontSize: 11 }}>{v}</span>} />
          {series.map(s => (
            <Area key={s.key} type="monotone" dataKey={s.key} name={s.name}
              stroke={s.color} fill={`url(#g_${s.key})`} strokeWidth={2} dot={false} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}

// ── Module Adoption Bar ───────────────────────────────────────────────────────
export function ModuleChart({ data }: { data: { module: string; count: number }[] }) {
  return (
    <Box sx={{ bgcolor: C.surface, borderRadius: '14px', p: 2.5, border: `1px solid ${C.border}` }}>
      <Typography sx={{ color: C.text, fontWeight: 600, fontSize: 13, mb: 2 }}>Module Adoption</Typography>
      <ResponsiveContainer width="100%" height={230}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 8 }}>
          <CartesianGrid {...GRID} horizontal={false} />
          <XAxis type="number" tick={AXIS} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="module" width={108} tick={{ ...AXIS, fontSize: 10.5 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={TIP} labelStyle={{ color: C.text }} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="count" name="Tenants" radius={[0, 6, 6, 0]} maxBarSize={16}>
            {data.map(d => <Cell key={d.module} fill={MOD_COLORS[d.module] ?? C.primary} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}

// ── Tenant Growth Line ────────────────────────────────────────────────────────
export function TenantGrowthChart({ data }: { data: { month: string; count: number }[] }) {
  return (
    <Box sx={{ bgcolor: C.surface, borderRadius: '14px', p: 2.5, border: `1px solid ${C.border}`, height: '100%' }}>
      <Typography sx={{ color: C.text, fontWeight: 600, fontSize: 13, mb: 2 }}>Tenant Growth</Typography>
      <ResponsiveContainer width="100%" height={190}>
        <LineChart data={data} margin={{ right: 4, left: -16 }}>
          <CartesianGrid {...GRID} />
          <XAxis dataKey="month" tick={AXIS} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={TIP} labelStyle={{ color: C.text }} />
          <Line type="monotone" dataKey="count" name="New Tenants"
            stroke={C.primary} strokeWidth={2.5} dot={{ fill: C.primary, r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}