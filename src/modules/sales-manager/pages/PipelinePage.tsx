// src/modules/sales-manager/pages/PipelinePage.tsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, Chip, Button, IconButton, Tooltip } from '@mui/material';
import { Refresh, ArrowForward } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, S, INR, DATE, STAGE_COLOR, STAGE_ORDER } from '../hooks';
import { fetchPipeline, doUpdatePipeline, type PipelineItem } from '../store/salesSlice';
import { PageHeader } from '../components/ui';

const STAGE_LABELS: Record<string,string> = {
  NEW_LEAD:'New Lead', CONTACTED:'Contacted', QUALIFIED:'Qualified',
  SITE_VISIT:'Site Visit', NEGOTIATION:'Negotiation',
  CLOSED_WON:'Won ✓', CLOSED_LOST:'Lost ✗',
};

function PipelineCard({ item, onMove }: { item: PipelineItem; onMove: (stage:string) => void }) {
  const stages = STAGE_ORDER;
  const idx = stages.indexOf(item.stage);
  const nextStage = idx < stages.length - 1 ? stages[idx + 1] : null;
  const color = STAGE_COLOR[item.stage] ?? S.primary;

  return (
    <Box sx={{
      bgcolor: S.surfaceHigh, borderRadius:'10px', p:1.75,
      border:`1px solid ${S.border}`, mb:1,
      borderLeft:`3px solid ${color}`,
      '&:hover':{ borderColor:`${color}60` },
    }}>
      <Typography sx={{ color:S.text, fontSize:12.5, fontWeight:500, mb:0.5, lineHeight:1.3 }}>
        {item.lead?.customerName ?? 'Unknown'}
      </Typography>
      {item.lead?.project && (
        <Typography sx={{ color:S.textSub, fontSize:11, mb:0.75 }}>
          {item.lead.project.name} · {item.lead.project.city}
        </Typography>
      )}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.75}>
        {item.dealValue
          ? <Typography sx={{ color:S.gold, fontSize:12, fontWeight:600 }}>{INR(item.dealValue)}</Typography>
          : <Typography sx={{ color:S.textSub, fontSize:11 }}>No value set</Typography>
        }
        {item.lead?.assignedTo && (
          <Chip label={item.lead.assignedTo.name.split(' ')[0]} size="small"
            sx={{ fontSize:9.5, height:18, bgcolor:'rgba(255,255,255,0.06)', color:S.textSub }}/>
        )}
      </Box>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography sx={{ color:S.muted, fontSize:10.5 }}>{DATE(item.lead?.createdAt)}</Typography>
        {nextStage && (
          <Tooltip title={`Move to ${STAGE_LABELS[nextStage]}`}>
            <IconButton size="small" onClick={()=>onMove(nextStage)}
              sx={{ color:color, p:0.4, '&:hover':{bgcolor:`${color}18`} }}>
              <ArrowForward sx={{ fontSize:13 }}/>
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
}

export default function PipelinePage() {
  const dispatch = useAppDispatch();
  const { pipeline, loading } = useAppSelector(s=>s.sales);
  const busy = !!loading.pipeline;

  useEffect(()=>{ dispatch(fetchPipeline({})); },[dispatch]);

  const grouped = STAGE_ORDER.reduce((acc,stage)=>{
    acc[stage] = pipeline.filter(p=>p.stage===stage);
    return acc;
  }, {} as Record<string,PipelineItem[]>);

  const stageValue = (stage:string) =>
    grouped[stage].reduce((s,p)=>s+(p.dealValue??0),0);

  const moveCard = (leadId:string, stage:string) => {
    dispatch(doUpdatePipeline({ leadId, stage }));
  };

  return (
    <Box>
      <PageHeader
        title="Sales Pipeline"
        subtitle={`${pipeline.length} total leads · Pipeline value: ${INR(pipeline.reduce((s,p)=>s+(p.dealValue??0),0))}`}
        action={
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={()=>dispatch(fetchPipeline({}))}
              sx={{ color:S.muted, border:`1px solid ${S.border}`, borderRadius:'8px', p:0.75 }}>
              <Refresh sx={{fontSize:15}}/>
            </IconButton>
          </Tooltip>
        }
      />

      {/* Kanban board */}
      <Box sx={{
        display:'flex', gap:1.5, overflowX:'auto', pb:2,
        '&::-webkit-scrollbar':{ height:6 },
        '&::-webkit-scrollbar-thumb':{ bgcolor:'rgba(255,255,255,0.08)', borderRadius:3 },
      }}>
        {STAGE_ORDER.map(stage=>{
          const items  = grouped[stage];
          const color  = STAGE_COLOR[stage] ?? S.primary;
          const totalV = stageValue(stage);
          return (
            <Box key={stage} sx={{
              minWidth:220, maxWidth:220, flexShrink:0,
              bgcolor:S.surface, borderRadius:'12px',
              border:`1px solid ${S.border}`, overflow:'hidden',
            }}>
              {/* Column header */}
              <Box sx={{
                px:2, py:1.5,
                borderBottom:`2px solid ${color}`,
                bgcolor:`${color}08`,
              }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ color:S.text, fontSize:12, fontWeight:600 }}>
                    {STAGE_LABELS[stage]}
                  </Typography>
                  <Chip label={items.length} size="small"
                    sx={{ fontSize:10, height:18, minWidth:22, bgcolor:`${color}20`, color }}/>
                </Box>
                {totalV > 0 && (
                  <Typography sx={{ color:S.gold, fontSize:11, mt:0.25 }}>{INR(totalV)}</Typography>
                )}
              </Box>

              {/* Cards */}
              <Box sx={{ p:1.25, maxHeight:520, overflowY:'auto',
                '&::-webkit-scrollbar':{ width:3 },
                '&::-webkit-scrollbar-thumb':{ bgcolor:'rgba(255,255,255,0.07)', borderRadius:2 } }}>
                {busy
                  ? Array.from({length:2}).map((_,i)=>(
                    <Box key={i} sx={{ bgcolor:S.surfaceHigh, borderRadius:'10px', height:80, mb:1,
                      animation:'pulse 1.5s ease-in-out infinite', '@keyframes pulse':{ '0%,100%':{opacity:0.5},'50%':{opacity:1} } }}/>
                  ))
                  : items.length===0
                    ? <Typography sx={{ color:S.muted, fontSize:11.5, textAlign:'center', py:3 }}>Empty</Typography>
                    : items.map(item=>(
                      <PipelineCard key={item.id} item={item} onMove={s=>moveCard(item.leadId,s)}/>
                    ))
                }
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
