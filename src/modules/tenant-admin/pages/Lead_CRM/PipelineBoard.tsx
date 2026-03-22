import React, { useState, useRef } from 'react';
import {
  Box, Typography, Stack, Button, Paper, Chip, IconButton,
  Avatar, Tooltip, Divider
} from '@mui/material';
import {
  PhoneOutlined, AttachMoneyOutlined, ApartmentOutlined,
  CalendarTodayOutlined, PersonAddOutlined, AddOutlined,
  AccessTimeOutlined
} from '@mui/icons-material';
import {
  Lead, LeadStatus, PIPELINE_STAGES, STAGE_MAP, PRIORITY_CFG,
  SOURCE_CFG, avatarColor, initials, fmtBudget, timeAgo
} from './crmTypes';
import api from '../../../../api/axios';

// ─── Kanban Card ──────────────────────────────────────────────────────────────
const KanbanCard = ({
  lead, onView, onAssign, isDragging,
  onDragStart, onDragEnd,
}: {
  lead: Lead;
  onView: () => void;
  onAssign: () => void;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}) => {
  const stage = STAGE_MAP[lead.status] || { label: lead.status, icon: '❓', color: '#888', bg: '#f5f5f5', darkBg: '#444' };
  const priority = PRIORITY_CFG[lead.priority] || { label: 'Unknown', icon: '❓', color: '#888', bg: '#f5f5f5' };
  const srcCfg = SOURCE_CFG[lead.sourceChannel] || { label: lead.sourceChannel, icon: '📋' };
  const pendingFU = (lead.followUps ?? []).filter(f => f.status === 'PENDING').length;
  const overdueFU = (lead.followUps ?? []).filter(f =>
    f.status === 'PENDING' && new Date(f.scheduledAt) < new Date()
  ).length;

  return (
    <Paper
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onView}
      elevation={isDragging ? 8 : 0}
      sx={{
        p: 2, borderRadius: 3, cursor: 'grab',
        border: '1px solid', borderColor: isDragging ? stage.color : 'divider',
        boxShadow: isDragging ? `0 12px 32px ${stage.color}44` : 'none',
        opacity: isDragging ? 0.85 : 1,
        transform: isDragging ? 'rotate(2deg) scale(1.02)' : 'none',
        transition: 'box-shadow .15s, border-color .15s',
        '&:hover': { borderColor: stage.color, boxShadow: `0 4px 16px ${stage.color}28` },
        bgcolor: 'background.paper',
        userSelect: 'none',
      }}>
      {/* Top row */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Avatar sx={{ width: 30, height: 30, bgcolor: avatarColor(lead.customerName), fontSize: 11, fontWeight: 900 }}>
            {initials(lead.customerName)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={900} sx={{ lineHeight: 1.2 }}>{lead.customerName}</Typography>
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: 'text.secondary' }}>
              <PhoneOutlined sx={{ fontSize: 11 }} />
              <Typography variant="caption" sx={{ fontSize: 10 }}>{lead.customerPhone}</Typography>
            </Stack>
          </Box>
        </Stack>
        <Stack direction="row" spacing={0.5}>
          <Chip label={priority.icon} size="small"
            sx={{ width: 24, height: 20, fontSize: 12, bgcolor: priority.bg, '& .MuiChip-label': { px: 0.5 } }} />
          {overdueFU > 0 && (
            <Chip label="⚠" size="small"
              sx={{ width: 24, height: 20, bgcolor: '#fee2e2', '& .MuiChip-label': { px: 0.5 } }} />
          )}
        </Stack>
      </Stack>

      {/* Details */}
      <Stack spacing={0.6} mb={1.5}>
        {lead.budget && (
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ color: 'text.secondary' }}>
            <AttachMoneyOutlined sx={{ fontSize: 13 }} />
            <Typography variant="caption" fontWeight={700} sx={{ color: '#10b981' }}>
              {fmtBudget(lead.budget)}{lead.budgetMax ? ` – ${fmtBudget(lead.budgetMax)}` : ''}
            </Typography>
          </Stack>
        )}
        {lead.preferredProject && (
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ color: 'text.secondary' }}>
            <ApartmentOutlined sx={{ fontSize: 13 }} />
            <Typography variant="caption" noWrap>{lead.preferredProject}</Typography>
          </Stack>
        )}
        {lead.preferredUnitType && (
          <Chip label={lead.preferredUnitType} size="small"
            sx={{ fontSize: 9, height: 18, width: 'fit-content', fontWeight: 700 }} />
        )}
      </Stack>

      {/* Tags */}
      {(lead.tags ?? []).length > 0 && (
        <Stack direction="row" flexWrap="wrap" spacing={0.5} mb={1}>
          {lead.tags!.slice(0, 2).map(t => (
            <Chip key={t} label={t} size="small"
              sx={{ fontSize: 9, height: 16, fontWeight: 700, bgcolor: 'grey.100' }} />
          ))}
          {lead.tags!.length > 2 && (
            <Chip label={`+${lead.tags!.length - 2}`} size="small"
              sx={{ fontSize: 9, height: 16, fontWeight: 700, bgcolor: 'grey.100' }} />
          )}
        </Stack>
      )}

      <Divider sx={{ mb: 1 }} />

      {/* Footer */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" spacing={1} alignItems="center">
          {/* Source icon */}
          <Tooltip title={SOURCE_CFG[lead.sourceChannel]?.label}>
            <Typography fontSize={13}>{SOURCE_CFG[lead.sourceChannel]?.icon}</Typography>
          </Tooltip>
          {/* Agent */}
          {lead.ownerAgent ? (
            <Tooltip title={lead.ownerAgent.name}>
              <Avatar sx={{ width: 20, height: 20, bgcolor: avatarColor(lead.ownerAgent.name), fontSize: 8, fontWeight: 800 }}>
                {initials(lead.ownerAgent.name)}
              </Avatar>
            </Tooltip>
          ) : (
            <Tooltip title="Assign agent">
              <IconButton size="small" onClick={e => { e.stopPropagation(); onAssign(); }}
                sx={{ width: 20, height: 20, bgcolor: '#fef3c7', color: '#92400e' }}>
                <PersonAddOutlined sx={{ fontSize: 11 }} />
              </IconButton>
            </Tooltip>
          )}
          {pendingFU > 0 && (
            <Tooltip title={`${pendingFU} pending follow-up${pendingFU > 1 ? 's' : ''}`}>
              <Chip label={`📞 ${pendingFU}`} size="small"
                sx={{ fontSize: 9, height: 16, bgcolor: '#dbeafe', color: '#1d4ed8', fontWeight: 700 }} />
            </Tooltip>
          )}
        </Stack>
        <Typography variant="caption" sx={{ fontSize: 9, color: 'text.secondary' }}>
          {timeAgo(lead.createdAt)}
        </Typography>
      </Stack>
    </Paper>
  );
};

// ─── Kanban Column ────────────────────────────────────────────────────────────
const KanbanColumn = ({
  stageKey, leads, onView, onAssign, draggingId,
  onDragStart, onDragOver, onDrop, onDragEnd,
}: {
  stageKey: LeadStatus;
  leads: Lead[];
  onView: (l: Lead) => void;
  onAssign: (l: Lead) => void;
  draggingId: string | null;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent, stage: LeadStatus) => void;
  onDrop: (stage: LeadStatus) => void;
  onDragEnd: () => void;
}) => {
  const [isOver, setIsOver] = useState(false);
  const stage = STAGE_MAP[stageKey] || { label: stageKey, icon: '❓', color: '#888', bg: '#f5f5f5', darkBg: '#444' };
  const totalBudget = leads.reduce((s, l) => s + (l.budget ?? 0), 0);

  return (
    <Box
      sx={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100%' }}
      onDragOver={e => { e.preventDefault(); setIsOver(true); onDragOver(e, stageKey); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={() => { setIsOver(false); onDrop(stageKey); }}>
      {/* Column Header */}
      <Box sx={{
        px: 2, py: 1.5, borderRadius: '12px 12px 0 0',
        background: `linear-gradient(135deg, ${stage.darkBg}, ${stage.color})`,
        mb: 0,
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography fontSize={16}>{stage.icon}</Typography>
            <Typography variant="body2" fontWeight={900} color="#fff">{stage.label}</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Box sx={{ bgcolor: 'rgba(255,255,255,.25)', color: '#fff', px: 1, py: 0.2, borderRadius: 8, fontSize: 11, fontWeight: 900 }}>
              {leads.length}
            </Box>
          </Stack>
        </Stack>
        {totalBudget > 0 && (
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,.75)', fontSize: 10 }}>
            Pipeline: {fmtBudget(totalBudget)}
          </Typography>
        )}
      </Box>

      {/* Drop zone */}
      <Box sx={{
        flex: 1, borderRadius: '0 0 12px 12px', minHeight: 100,
        border: '1px solid', borderTop: 'none',
        borderColor: isOver ? stage.color : 'divider',
        bgcolor: isOver ? stage.bg : '#fafafa',
        transition: 'all .15s',
        overflowY: 'auto',
        p: 1.25,
      }}>
        {isOver && draggingId && (
          <Box sx={{ height: 6, borderRadius: 3, bgcolor: stage.color, mb: 1.5, opacity: 0.5 }} />
        )}
        <Stack spacing={1.25}>
          {leads.map(lead => (
            <KanbanCard
              key={lead.id}
              lead={lead}
              isDragging={draggingId === lead.id}
              onView={() => onView(lead)}
              onAssign={() => onAssign(lead)}
              onDragStart={() => onDragStart(lead.id)}
              onDragEnd={onDragEnd}
            />
          ))}
        </Stack>
        {leads.length === 0 && !isOver && (
          <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary', opacity: 0.5 }}>
            <Typography variant="caption">Drop leads here</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

// ─── Pipeline Board ───────────────────────────────────────────────────────────
interface Props {
  leads: Lead[];
  onViewLead: (l: Lead) => void;
  onAssignLead: (l: Lead) => void;
  onAddLead: () => void;
  onUpdate: () => void;
}

const PipelineBoard: React.FC<Props> = ({ leads, onViewLead, onAssignLead, onAddLead, onUpdate }) => {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<LeadStatus | null>(null);

  const handleDrop = async (targetStage: LeadStatus) => {
    if (!draggingId || !overStage) return;
    const lead = leads.find(l => l.id === draggingId);
    if (!lead || lead.status === targetStage) { setDraggingId(null); return; }
    try {
      await api.put(`/leads/${draggingId}`, { status: targetStage });
      onUpdate();
    } catch (e) { console.error(e); }
    finally { setDraggingId(null); setOverStage(null); }
  };

  const stageLeads = (key: LeadStatus) =>
    leads.filter(l => l.status === key).sort((a, b) => {
      const pOrder = { HOT: 0, WARM: 1, COLD: 2 };
      return pOrder[a.priority] - pOrder[b.priority];
    });

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body1" fontWeight={800}>
            {leads.length} leads in pipeline
          </Typography>
          {PIPELINE_STAGES.filter(s => s.key !== 'LOST').map(s => {
            const count = stageLeads(s.key as LeadStatus).length;
            if (!count) return null;
            return (
              <Chip key={s.key} label={`${s.icon} ${count}`} size="small"
                sx={{ fontSize: 10, fontWeight: 800, bgcolor: s.bg, color: s.color, height: 22 }} />
            );
          })}
        </Stack>
        <Button variant="contained" disableElevation startIcon={<AddOutlined />}
          onClick={onAddLead} size="small"
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 3 }}>
          Add Lead
        </Button>
      </Stack>

      {/* Board */}
      <Box sx={{ overflowX: 'auto', pb: 2 }}>
        <Stack
          direction="row" spacing={2}
          sx={{ minWidth: PIPELINE_STAGES.length * 296, alignItems: 'stretch', height: 'calc(100vh - 340px)', minHeight: 500 }}>
          {PIPELINE_STAGES.map(stage => (
            <KanbanColumn
              key={stage.key}
              stageKey={stage.key as LeadStatus}
              leads={stageLeads(stage.key as LeadStatus)}
              onView={onViewLead}
              onAssign={onAssignLead}
              draggingId={draggingId}
              onDragStart={id => { setDraggingId(id); }}
              onDragOver={(e, s) => setOverStage(s)}
              onDrop={handleDrop}
              onDragEnd={() => { setDraggingId(null); setOverStage(null); }}
            />
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

export default PipelineBoard;