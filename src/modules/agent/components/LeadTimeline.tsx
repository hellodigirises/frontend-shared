import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { 
  Timeline, TimelineItem, TimelineSeparator, TimelineConnector, 
  TimelineContent, TimelineDot 
} from '@mui/lab';
import { 
  HistoryOutlined, PhoneOutlined, LoopOutlined, 
  SwapHorizOutlined, AddCircleOutline, InfoOutlined, PlaceOutlined 
} from '@mui/icons-material';
import { RELATIVE, A } from '../hooks';

const TYPE_MAP: any = {
  SYSTEM: { icon: <AddCircleOutline sx={{fontSize:16}} />, color: '#7c554a' },
  STATUS_CHANGE: { icon: <LoopOutlined sx={{fontSize:16}} />, color: '#8d6e63' },
  TRANSFER: { icon: <SwapHorizOutlined sx={{fontSize:16}} />, color: '#a1887f' },
  FOLLOW_UP: { icon: <PhoneOutlined sx={{fontSize:16}} />, color: '#6d4c41' },
  SITE_VISIT: { icon: <PlaceOutlined sx={{fontSize:16}} />, color: '#4e342e' },
  NOTE: { icon: <InfoOutlined sx={{fontSize:16}} />, color: '#5d4037' },
};

export const LeadTimeline = ({ activities }: { activities: any[] }) => {
  if (!activities || activities.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', opacity: 0.5, color: A.textSub }}>
        <HistoryOutlined sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="body2">No activity history yet.</Typography>
      </Box>
    );
  }

  return (
    <Timeline sx={{ p: 0, m:0, '& .MuiTimelineItem-root:before': { display: 'none' } }}>
      {activities.map((act, idx) => {
        const config = TYPE_MAP[act.type] || TYPE_MAP.SYSTEM;
        return (
          <TimelineItem key={act.id} sx={{ minHeight: 60 }}>
            <TimelineSeparator>
              <TimelineDot sx={{ bgcolor: config.color, p: '6px', boxShadow: 0, margin: 0 }}>
                {config.icon}
              </TimelineDot>
              {idx < activities.length - 1 && <TimelineConnector sx={{ bgcolor: 'rgba(255,220,180,0.1)' }} />}
            </TimelineSeparator>
            <TimelineContent sx={{ py: 0, px: 2, pb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: A.text, fontSize: '0.85rem' }}>
                  {act.activity}
                </Typography>
                <Typography variant="caption" sx={{ color: A.textSub, fontSize: '0.7rem' }}>
                  {RELATIVE(act.performedAt)}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ 
                mt: 0.2, color: A.textSub, fontSize: '0.8rem', 
                lineHeight: 1.4, wordBreak: 'break-word' 
              }}>
                {act.content}
              </Typography>
              {act.user && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, gap: 0.8 }}>
                  <Avatar sx={{ width: 14, height: 14, fontSize: 8, bgcolor: A.primary }}>
                    {act.user.name?.[0] || 'U'}
                  </Avatar>
                  <Typography variant="caption" sx={{ fontWeight: 500, color: A.muted, fontSize: '0.7rem' }}>
                    {act.user.name}
                  </Typography>
                </Box>
              )}
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </Timeline>
  );
};
