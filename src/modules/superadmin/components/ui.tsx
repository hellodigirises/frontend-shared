// src/modules/superadmin/components/ui.tsx
import React from 'react';
import {
  Box, Typography, Chip, Skeleton,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress,
} from '@mui/material';
import { C, STATUS_META } from '../hooks';

// ── StatCard ──────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; accent: string; loading?: boolean;
}
export function StatCard({ label, value, sub, icon, accent, loading }: StatCardProps) {
  return (
    <Box sx={{
      bgcolor: C.surface, borderRadius: '14px', p: 2.5,
      border: `1px solid ${C.border}`, position: 'relative', overflow: 'hidden',
      '&::before': {
        content: '""', position: 'absolute',
        top: 0, left: 0, right: 0, height: 3,
        background: accent, borderRadius: '14px 14px 0 0',
      },
    }}>
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1.5}>
        <Typography sx={{ color: C.textSub, fontSize: 11, fontWeight: 500, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          {label}
        </Typography>
        <Box sx={{
          width: 32, height: 32, borderRadius: '8px',
          bgcolor: `${accent}1A`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: accent, '& svg': { fontSize: 16 },
        }}>
          {icon}
        </Box>
      </Box>
      {loading
        ? <Skeleton width={110} height={28} sx={{ bgcolor: 'rgba(255,255,255,0.07)', borderRadius: 1 }} />
        : <Typography sx={{ color: C.text, fontSize: 22, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1 }}>{value}</Typography>
      }
      {sub && <Typography sx={{ color: C.textSub, fontSize: 11, mt: 0.75 }}>{sub}</Typography>}
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
        <Typography sx={{ color: C.text, fontSize: 19, fontWeight: 700, letterSpacing: -0.4 }}>{title}</Typography>
        {subtitle && <Typography sx={{ color: C.textSub, fontSize: 12.5, mt: 0.4 }}>{subtitle}</Typography>}
      </Box>
      {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
    </Box>
  );
}

// ── StatusChip ────────────────────────────────────────────────────────────────
export function StatusChip({ status }: { status: string }) {
  const m = STATUS_META[status] ?? { bg: 'rgba(255,255,255,0.07)', color: C.muted, label: status };
  return (
    <Chip label={m.label} size="small"
      sx={{ bgcolor: m.bg, color: m.color, fontWeight: 600, fontSize: 10.5, height: 21, borderRadius: '6px' }} />
  );
}

// ── SectionCard ───────────────────────────────────────────────────────────────
export function SectionCard({ title, children, action, noPad }: {
  title?: string; children: React.ReactNode; action?: React.ReactNode; noPad?: boolean;
}) {
  return (
    <Box sx={{ bgcolor: C.surface, borderRadius: '14px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
      {title && (
        <Box sx={{
          px: 2.5, py: 1.75, borderBottom: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Typography sx={{ color: C.text, fontWeight: 600, fontSize: 13.5 }}>{title}</Typography>
          {action}
        </Box>
      )}
      <Box sx={noPad ? {} : {}}>{children}</Box>
    </Box>
  );
}

// ── DataTable ─────────────────────────────────────────────────────────────────
type Col<T> = {
  label: string;
  key?: keyof T;
  render?: (row: T, index: number, rows: T[]) => React.ReactNode;
  width?: string | number;
};
interface TableProps<T> {
  columns: Col<T>[]; rows: T[]; loading?: boolean;
  emptyMsg?: string; onRowClick?: (row: T) => void;
}
export function DataTable<T extends { id: string }>({ columns, rows, loading, emptyMsg, onRowClick }: TableProps<T>) {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map(c => (
              <TableCell key={c.label} width={c.width} sx={{
                color: C.textSub, fontSize: 10.5, fontWeight: 600, letterSpacing: 0.5,
                textTransform: 'uppercase', py: 1.5,
                borderBottom: `1px solid ${C.border}`, bgcolor: C.surface,
                whiteSpace: 'nowrap',
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
                  <TableCell key={c.label} sx={{ borderBottom: `1px solid ${C.border}`, py: 1.25 }}>
                    <Skeleton height={14} width="72%" sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
                  </TableCell>
                ))}
              </TableRow>
            ))
            : rows.length === 0
              ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center"
                    sx={{ py: 5, borderBottom: 'none', color: C.textSub, fontSize: 13 }}>
                    {emptyMsg ?? 'No records found'}
                  </TableCell>
                </TableRow>
              )
              : rows.map((row, rowIndex) => (
                <TableRow key={row.id} hover onClick={() => onRowClick?.(row)}
                  sx={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    '&:hover td': { bgcolor: 'rgba(79,127,255,0.03)' },
                    '& td': { borderBottom: `1px solid ${C.border}` },
                  }}>
                  {columns.map(c => (
                    <TableCell key={c.label} sx={{ color: C.textSub, fontSize: 12.5, py: 1.1 }}>
                      {c.render ? c.render(row, rowIndex, rows) : c.key ? String((row as any)[c.key] ?? '—') : '—'}
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

// ── CenteredLoader ────────────────────────────────────────────────────────────
export function CenteredLoader() {
  return (
    <Box display="flex" alignItems="center" justifyContent="center" minHeight={300}>
      <CircularProgress size={28} sx={{ color: C.primary }} />
    </Box>
  );
}

// ── KV row (key-value pair) ───────────────────────────────────────────────────
export function KVRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center"
      py={0.85} sx={{ borderBottom: `1px solid ${C.border}` }}>
      <Typography sx={{ color: C.textSub, fontSize: 12.5 }}>{label}</Typography>
      {typeof value === 'string' || typeof value === 'number'
        ? <Typography sx={{ color: C.text, fontSize: 12.5, fontWeight: 500, fontFamily: mono ? 'monospace' : undefined }}>
            {value === '' || value === null || value === undefined ? '—' : value}
          </Typography>
        : value
      }
    </Box>
  );
}