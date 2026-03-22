// src/modules/hr/components/ui.tsx
import React from 'react';
import {
  Box, Typography, Chip, Skeleton,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Avatar, CircularProgress,
} from '@mui/material';
import { H, STATUS_MAP } from '../hooks';

// ── StatCard ──────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, icon, accent, loading }: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; accent: string; loading?: boolean;
}) {
  return (
    <Box sx={{
      bgcolor: H.surface, borderRadius: '14px', p: 2.5,
      border: `1px solid ${H.border}`, position: 'relative', overflow: 'hidden',
      '&::after': {
        content: '""', position: 'absolute', bottom: 0, right: 0,
        width: 80, height: 80, borderRadius: '50%',
        bgcolor: `${accent}08`, transform: 'translate(20px, 20px)',
      },
    }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
        <Typography sx={{ color: H.textSub, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 500 }}>
          {label}
        </Typography>
        <Box sx={{
          width: 34, height: 34, borderRadius: '9px',
          bgcolor: `${accent}18`, color: accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          '& svg': { fontSize: 17 },
        }}>
          {icon}
        </Box>
      </Box>
      {loading
        ? <Skeleton width={100} height={28} sx={{ bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 1 }} />
        : <Typography sx={{ color: H.text, fontSize: 24, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1 }}>
            {value}
          </Typography>
      }
      {sub && <Typography sx={{ color: H.textSub, fontSize: 11, mt: 0.75 }}>{sub}</Typography>}
    </Box>
  );
}

// ── PageHeader ────────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }: {
  title: string; subtitle?: string; action?: React.ReactNode;
}) {
  return (
    <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={3}>
      <Box>
        <Typography sx={{ color: H.text, fontSize: 19, fontWeight: 700, letterSpacing: -0.4 }}>{title}</Typography>
        {subtitle && <Typography sx={{ color: H.textSub, fontSize: 12.5, mt: 0.4 }}>{subtitle}</Typography>}
      </Box>
      {action && <Box flexShrink={0}>{action}</Box>}
    </Box>
  );
}

// ── StatusChip ────────────────────────────────────────────────────────────────
export function StatusChip({ status }: { status: string }) {
  const m = STATUS_MAP[status] ?? { bg: 'rgba(255,255,255,0.06)', color: H.muted, label: status };
  return (
    <Chip label={m.label} size="small"
      sx={{ bgcolor: m.bg, color: m.color, fontWeight: 600, fontSize: 10.5, height: 21, borderRadius: '6px' }} />
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ title, children, action, noBorder }: {
  title?: string; children: React.ReactNode; action?: React.ReactNode; noBorder?: boolean;
}) {
  return (
    <Box sx={{
      bgcolor: H.surface, borderRadius: '14px',
      border: noBorder ? 'none' : `1px solid ${H.border}`, overflow: 'hidden',
    }}>
      {title && (
        <Box sx={{
          px: 2.5, py: 1.75, borderBottom: `1px solid ${H.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Typography sx={{ color: H.text, fontWeight: 600, fontSize: 13.5 }}>{title}</Typography>
          {action}
        </Box>
      )}
      {children}
    </Box>
  );
}

// ── EmployeeAvatar ────────────────────────────────────────────────────────────
export function EmployeeAvatar({ name, avatarUrl, size = 32 }: { name: string; avatarUrl?: string; size?: number }) {
  const initials = name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
  const hue = name.charCodeAt(0) * 13 % 360;
  return avatarUrl
    ? <Avatar src={avatarUrl} sx={{ width: size, height: size }} />
    : <Avatar sx={{ width: size, height: size, bgcolor: `hsl(${hue},60%,35%)`, fontSize: size * 0.38, fontWeight: 700 }}>
        {initials}
      </Avatar>;
}

// ── DataTable ─────────────────────────────────────────────────────────────────
type Col<T> = {
  label: string; key?: keyof T; width?: string | number;
  render?: (row: T) => React.ReactNode;
};
interface TblProps<T> {
  columns: Col<T>[]; rows: T[]; loading?: boolean;
  emptyMsg?: string; onRowClick?: (row: T) => void;
}
export function DataTable<T extends { id: string }>({ columns, rows, loading, emptyMsg, onRowClick }: TblProps<T>) {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map(c => (
              <TableCell key={c.label} width={c.width} sx={{
                color: H.textSub, fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: 0.5, py: 1.5, borderBottom: `1px solid ${H.border}`,
                bgcolor: H.surface, whiteSpace: 'nowrap',
              }}>
                {c.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map(c => (
                  <TableCell key={c.label} sx={{ borderBottom: `1px solid ${H.border}`, py: 1.25 }}>
                    <Skeleton height={14} width="72%" sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                  </TableCell>
                ))}
              </TableRow>
            ))
            : rows.length === 0
              ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center"
                    sx={{ py: 5, borderBottom: 'none', color: H.textSub, fontSize: 13 }}>
                    {emptyMsg ?? 'No records found'}
                  </TableCell>
                </TableRow>
              )
              : rows.map(row => (
                <TableRow key={row.id} hover onClick={() => onRowClick?.(row)}
                  sx={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    '&:hover td': { bgcolor: 'rgba(59,130,246,0.03)' },
                    '& td': { borderBottom: `1px solid ${H.border}` },
                  }}>
                  {columns.map(c => (
                    <TableCell key={c.label} sx={{ color: H.textSub, fontSize: 12.5, py: 1.1 }}>
                      {c.render ? c.render(row) : c.key ? String((row as any)[c.key] ?? '—') : '—'}
                    </TableCell>
                  ))}
                </TableRow>
              ))
          }
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// ── Loader ────────────────────────────────────────────────────────────────────
export function Loader() {
  return (
    <Box display="flex" alignItems="center" justifyContent="center" minHeight={300}>
      <CircularProgress size={26} sx={{ color: H.primary }} />
    </Box>
  );
}

// ── KV ───────────────────────────────────────────────────────────────────────
export function KV({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <Box display="flex" justifyContent="space-between" py={0.85} sx={{ borderBottom: `1px solid ${H.border}` }}>
      <Typography sx={{ color: H.textSub, fontSize: 12.5 }}>{label}</Typography>
      {typeof value === 'string' || typeof value === 'number'
        ? <Typography sx={{ color: H.text, fontSize: 12.5, fontWeight: 500, fontFamily: mono ? 'monospace' : undefined }}>
            {value === '' ? '—' : value}
          </Typography>
        : value
      }
    </Box>
  );
}

// ── PrimaryButton ─────────────────────────────────────────────────────────────
export function PrimaryBtn({ children, onClick, startIcon, size = 'small', disabled }: {
  children: React.ReactNode; onClick?: () => void;
  startIcon?: React.ReactNode; size?: 'small' | 'medium'; disabled?: boolean;
}) {
  return (
    <Box
      component="button"
      onClick={disabled ? undefined : onClick}
      sx={{
        display: 'inline-flex', alignItems: 'center', gap: 0.75,
        bgcolor: disabled ? 'rgba(59,130,246,0.3)' : H.primary,
        color: '#fff', border: 'none', borderRadius: '8px',
        px: size === 'small' ? 2 : 2.5, py: size === 'small' ? 0.7 : 0.9,
        fontSize: 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background .15s',
        '&:hover': { bgcolor: disabled ? undefined : '#2563EB' },
      }}
    >
      {startIcon}
      {children}
    </Box>
  );
}
