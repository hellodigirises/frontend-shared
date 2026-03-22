import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Stack, Button, Paper, Chip, Grid,
  IconButton, Avatar, Tooltip, Divider
} from '@mui/material';
import {
  ChevronLeftOutlined, ChevronRightOutlined, TodayOutlined, AddOutlined
} from '@mui/icons-material';
import {
  SiteVisit, VISIT_TYPE_CFG, VISIT_STATUS_CFG,
  getDaysInMonth, getFirstDayOfMonth, MONTH_NAMES, DAY_NAMES_SHORT,
  isToday, isTomorrow, formatTime, avatarColor, initials
} from './visitTypes';

interface Props {
  visits: SiteVisit[];
  onAddVisit: (date?: string) => void;
  onViewVisit: (v: SiteVisit) => void;
}

const VisitCalendar: React.FC<Props> = ({ visits, onAddVisit, onViewVisit }) => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate());
  const [viewMode, setViewMode] = useState<'month' | 'day'>('month');

  const days = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const pad2 = (n: number) => String(n).padStart(2, '0');
  const dateStr = (d: number) => `${year}-${pad2(month + 1)}-${pad2(d)}`;
  const selectedDateStr = selectedDay ? dateStr(selectedDay) : '';

  const visitsByDate = useMemo(() => {
    const m: Record<string, SiteVisit[]> = {};
    visits.forEach(v => { (m[v.visitDate] ??= []).push(v); });
    Object.values(m).forEach(arr => arr.sort((a, b) => a.visitTime.localeCompare(b.visitTime)));
    return m;
  }, [visits]);

  const selectedVisits = selectedDateStr ? (visitsByDate[selectedDateStr] ?? []) : [];

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };
  const goToday = () => { setYear(now.getFullYear()); setMonth(now.getMonth()); setSelectedDay(now.getDate()); };

  // Month stats
  const monthVisits = useMemo(() => {
    const prefix = `${year}-${pad2(month + 1)}`;
    return visits.filter(v => v.visitDate.startsWith(prefix));
  }, [visits, year, month]);

  return (
    <Box>
      {/* Calendar Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" spacing={1.5}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconButton onClick={prev} size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <ChevronLeftOutlined />
          </IconButton>
          <Box sx={{ textAlign: 'center', minWidth: 180 }}>
            <Typography variant="h5" fontWeight={900} sx={{ fontFamily: '"Playfair Display", serif', lineHeight: 1 }}>
              {MONTH_NAMES[month]}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>{year}</Typography>
          </Box>
          <IconButton onClick={next} size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <ChevronRightOutlined />
          </IconButton>
          <Button size="small" startIcon={<TodayOutlined />} variant="outlined" onClick={goToday}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}>Today</Button>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={2}>
          {/* Month summary chips */}
          <Stack direction="row" spacing={1}>
            <Chip label={`${monthVisits.length} visits`} size="small" sx={{ fontWeight: 700, bgcolor: '#eef2ff', color: '#6366f1' }} />
            <Chip label={`${monthVisits.filter(v => v.status === 'COMPLETED').length} done`} size="small" sx={{ fontWeight: 700, bgcolor: '#d1fae5', color: '#059669' }} />
            <Chip label={`${monthVisits.filter(v => v.status === 'NO_SHOW').length} no-show`} size="small" sx={{ fontWeight: 700, bgcolor: '#fee2e2', color: '#dc2626' }} />
          </Stack>

          <Stack direction="row" spacing={1}>
            {(['month', 'day'] as const).map(m => (
              <Button key={m} size="small" variant={viewMode === m ? 'contained' : 'outlined'} disableElevation
                onClick={() => setViewMode(m)} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2.5, minWidth: 80 }}>
                {m === 'month' ? '📅 Month' : '📋 Day'}
              </Button>
            ))}
          </Stack>
          <Button variant="contained" disableElevation size="small" startIcon={<AddOutlined />}
            onClick={() => onAddVisit(selectedDateStr || undefined)}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2.5 }}>
            Schedule
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        {/* ── Month Grid ── */}
        <Grid item xs={12} md={viewMode === 'month' ? 8 : 12}>
          {viewMode === 'month' ? (
            <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
              {/* Day name headers */}
              <Grid container sx={{ bgcolor: '#1e293b' }}>
                {DAY_NAMES_SHORT.map(d => (
                  <Grid item xs key={d} sx={{ py: 1.25, textAlign: 'center' }}>
                    <Typography variant="caption" fontWeight={800} sx={{ color: '#94a3b8', letterSpacing: 1 }}>{d}</Typography>
                  </Grid>
                ))}
              </Grid>

              {/* Cells */}
              <Grid container sx={{ '& > .MuiGrid-item': { borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' } }}>
                {/* Empty cells before first day */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <Grid item xs key={`e${i}`} sx={{ minHeight: 100, bgcolor: '#fafafa' }} />
                ))}

                {Array.from({ length: days }, (_, i) => i + 1).map(day => {
                  const ds = dateStr(day);
                  const dayVisits = visitsByDate[ds] ?? [];
                  const isSel = selectedDay === day;
                  const isTod = isToday(ds);
                  const isTom = isTomorrow(ds);
                  const isWeekend = (new Date(ds).getDay() === 0 || new Date(ds).getDay() === 6);

                  return (
                    <Grid item xs key={day}
                      onClick={() => { setSelectedDay(day); }}
                      sx={{
                        minHeight: 100, cursor: 'pointer', transition: 'background .12s',
                        bgcolor: isSel ? '#eef2ff' : isTod ? '#f0fdf4' : isWeekend ? '#fafafa' : '#fff',
                        '&:hover': { bgcolor: isSel ? '#eef2ff' : '#f8faff' },
                        position: 'relative',
                      }}>
                      <Box sx={{ p: 0.75 }}>
                        {/* Day number */}
                        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
                          <Box sx={{
                            width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            bgcolor: isTod ? '#10b981' : isSel ? '#6366f1' : 'transparent',
                          }}>
                            <Typography variant="caption" fontWeight={800}
                              sx={{ color: (isTod || isSel) ? '#fff' : isWeekend ? '#9ca3af' : 'text.primary' }}>
                              {day}
                            </Typography>
                          </Box>
                          {isTom && <Typography sx={{ fontSize: 8, fontWeight: 800, color: '#f59e0b', bgcolor: '#fef3c7', px: 0.5, borderRadius: 1 }}>TMR</Typography>}
                        </Stack>

                        {/* Visit events */}
                        <Stack spacing={0.3}>
                          {dayVisits.slice(0, 3).map(v => {
                            const tyCfg = VISIT_TYPE_CFG[v.visitType];
                            const stCfg = VISIT_STATUS_CFG[v.status];
                            return (
                              <Box key={v.id}
                                onClick={e => { e.stopPropagation(); onViewVisit(v); }}
                                sx={{
                                  px: 0.75, py: 0.3, borderRadius: 1.5,
                                  bgcolor: tyCfg.bg, borderLeft: `3px solid ${tyCfg.color}`,
                                  cursor: 'pointer', '&:hover': { opacity: 0.8 },
                                  transition: 'opacity .12s',
                                }}>
                                <Typography sx={{ fontSize: 9, fontWeight: 700, color: tyCfg.color, lineHeight: 1.3 }} noWrap>
                                  {v.visitTime} {v.lead.customerName}
                                </Typography>
                              </Box>
                            );
                          })}
                          {dayVisits.length > 3 && (
                            <Typography sx={{ fontSize: 9, color: '#6366f1', fontWeight: 800, pl: 0.5 }}>
                              +{dayVisits.length - 3} more
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Paper>
          ) : (
            /* ── Day Timeline ── */
            <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
              <Box sx={{ px: 3, py: 2.5, bgcolor: '#1e293b' }}>
                <Typography variant="h6" fontWeight={800} color="#fff">
                  {selectedDay
                    ? new Date(selectedDateStr).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                    : 'Select a day from the calendar'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  {selectedVisits.length} visit{selectedVisits.length !== 1 ? 's' : ''} scheduled
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                {Array.from({ length: 14 }, (_, i) => {
                  const h = i + 8;
                  const slotH = `${String(h).padStart(2, '0')}:00`;
                  const slotVisits = selectedVisits.filter(v => v.visitTime === slotH);
                  const ampm = h < 12 ? 'AM' : 'PM';
                  const hDisplay = h <= 12 ? h : h - 12;

                  return (
                    <Stack key={h} direction="row" spacing={2}
                      sx={{ minHeight: 56, borderBottom: '1px solid #f1f5f9', py: 0.75,
                        '&:hover .slot-add': { opacity: 1 } }}>
                      <Typography variant="caption" fontWeight={700} color="text.secondary"
                        sx={{ width: 60, flexShrink: 0, pt: 0.75, textAlign: 'right', pr: 1 }}>
                        {hDisplay}:00<br /><span style={{ fontSize: 9 }}>{ampm}</span>
                      </Typography>
                      <Box sx={{ flex: 1, position: 'relative' }}>
                        <Stack spacing={0.75}>
                          {slotVisits.map(v => {
                            const tyCfg = VISIT_TYPE_CFG[v.visitType];
                            const stCfg = VISIT_STATUS_CFG[v.status];
                            return (
                              <Box key={v.id} onClick={() => onViewVisit(v)}
                                sx={{
                                  p: 1.75, borderRadius: 3, cursor: 'pointer',
                                  bgcolor: tyCfg.bg, borderLeft: `4px solid ${tyCfg.color}`,
                                  transition: 'all .15s', border: `1px solid ${tyCfg.color}40`,
                                  '&:hover': { transform: 'translateX(3px)', boxShadow: `4px 0 16px ${tyCfg.color}30` }
                                }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                  <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Typography fontSize={16}>{tyCfg.icon}</Typography>
                                    <Box>
                                      <Typography variant="body2" fontWeight={800}>{v.lead.customerName}</Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {v.project}{v.tower ? ` · ${v.tower}` : ''}
                                        {v.unitNumber ? ` · Unit ${v.unitNumber}` : ''}
                                        {' · '}{v.agent.name}
                                      </Typography>
                                    </Box>
                                  </Stack>
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <Chip label={`${stCfg.icon} ${stCfg.label}`} size="small"
                                      sx={{ bgcolor: stCfg.bg, color: stCfg.color, fontWeight: 800, fontSize: 10, height: 22 }} />
                                    {v.durationMinutes && (
                                      <Typography variant="caption" color="text.secondary">{v.durationMinutes}min</Typography>
                                    )}
                                    {(v.groupLeads?.length ?? 0) > 0 && (
                                      <Chip label={`👥 Group`} size="small" sx={{ fontSize: 9, height: 18, bgcolor: '#eef2ff', color: '#6366f1', fontWeight: 700 }} />
                                    )}
                                  </Stack>
                                </Stack>
                              </Box>
                            );
                          })}
                        </Stack>
                        {slotVisits.length === 0 && (
                          <Box className="slot-add" onClick={() => onAddVisit(selectedDateStr)}
                            sx={{
                              opacity: 0, transition: 'opacity .15s', height: 40, borderRadius: 2,
                              cursor: 'pointer', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', border: '1px dashed #d1d5db',
                              '&:hover': { bgcolor: '#f9fafb' }
                            }}>
                            <Typography variant="caption" color="text.secondary">+ Add {hDisplay}:00 {ampm}</Typography>
                          </Box>
                        )}
                      </Box>
                    </Stack>
                  );
                })}
              </Box>
            </Paper>
          )}
        </Grid>

        {/* ── Side Panel (month view) ── */}
        {viewMode === 'month' && (
          <Grid item xs={12} md={4}>
            <Stack spacing={2} sx={{ position: 'sticky', top: 16 }}>
              {/* Selected day panel */}
              <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
                <Box sx={{
                  px: 2.5, py: 2, bgcolor: selectedVisits.length > 0 ? '#1e293b' : '#f8fafc',
                  borderRadius: '16px 16px 0 0',
                }}>
                  <Typography variant="body1" fontWeight={800} color={selectedVisits.length > 0 ? '#fff' : 'text.primary'}>
                    {selectedDay
                      ? new Date(selectedDateStr).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })
                      : 'Select a day'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: selectedVisits.length > 0 ? '#94a3b8' : '#9ca3af' }}>
                    {selectedVisits.length} visit{selectedVisits.length !== 1 ? 's' : ''}
                  </Typography>
                </Box>

                <Box sx={{ p: 2 }}>
                  {selectedVisits.length === 0 ? (
                    <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                      <Typography fontSize={36} mb={1}>📅</Typography>
                      <Typography variant="body2" mb={2}>No visits scheduled</Typography>
                      <Button size="small" startIcon={<AddOutlined />} variant="outlined"
                        onClick={() => onAddVisit(selectedDateStr)}
                        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2.5 }}>
                        Add Visit
                      </Button>
                    </Box>
                  ) : (
                    <Stack spacing={1.25}>
                      {selectedVisits.map(v => {
                        const tyCfg = VISIT_TYPE_CFG[v.visitType];
                        const stCfg = VISIT_STATUS_CFG[v.status];
                        return (
                          <Box key={v.id} onClick={() => onViewVisit(v)}
                            sx={{
                              p: 2, borderRadius: 3, cursor: 'pointer',
                              border: `1.5px solid ${tyCfg.color}40`, bgcolor: tyCfg.bg,
                              transition: 'all .15s',
                              '&:hover': { borderColor: tyCfg.color, boxShadow: `0 4px 14px ${tyCfg.color}30` }
                            }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={0.75}>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography fontSize={16}>{tyCfg.icon}</Typography>
                                <Typography variant="body2" fontWeight={800}>{v.visitTime}</Typography>
                                {v.durationMinutes && (
                                  <Typography variant="caption" color="text.secondary">· {v.durationMinutes}min</Typography>
                                )}
                              </Stack>
                              <Chip label={stCfg.label} size="small"
                                sx={{ bgcolor: stCfg.bg, color: stCfg.color, fontWeight: 800, fontSize: 9, height: 18 }} />
                            </Stack>
                            <Typography variant="body2" fontWeight={800}>{v.lead.customerName}</Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {v.project}{v.tower ? ` · ${v.tower}` : ''}
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={0.75} mt={0.75}>
                              <Avatar sx={{ width: 18, height: 18, fontSize: 8, bgcolor: avatarColor(v.agent.name), fontWeight: 800 }}>
                                {initials(v.agent.name)}
                              </Avatar>
                              <Typography variant="caption" color="text.secondary">{v.agent.name}</Typography>
                            </Stack>
                          </Box>
                        );
                      })}
                    </Stack>
                  )}
                </Box>
              </Paper>

              {/* Legend */}
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 1.25 }}>
                  Visit Types
                </Typography>
                <Stack spacing={0.75}>
                  {Object.entries(VISIT_TYPE_CFG).map(([k, v]) => (
                    <Stack key={k} direction="row" alignItems="center" spacing={1.25}>
                      <Box sx={{ width: 14, height: 14, borderRadius: 1.5, bgcolor: v.color, flexShrink: 0 }} />
                      <Typography fontSize={14}>{v.icon}</Typography>
                      <Typography variant="caption" fontWeight={700}>{v.label}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default VisitCalendar;