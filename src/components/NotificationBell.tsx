import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  IconButton, Badge, Popover, MenuItem, Typography, Box, 
  Divider, List, ListItem, ListItemButton, ListItemText, ListItemAvatar, 
  Avatar, Button, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, Tooltip
} from '@mui/material';
import { NotificationsOutlined, NotificationsActiveOutlined, Circle, Close, PushPinOutlined, DeleteOutlineOutlined } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { fetchNotifications, markAsRead, deleteNotification, togglePin, Notification } from '../redux/slices/communicationSlice';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const loc = useLocation();
  const { notifications, unreadCount, loading } = useSelector((state: RootState) => state.communication);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);

  useEffect(() => {
    dispatch(fetchNotifications());
    // Auto-refresh every 2 minutes
    const interval = setInterval(() => {
      dispatch(fetchNotifications());
    }, 120000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAllRead = () => {
    dispatch(markAsRead({ all: true }));
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    dispatch(deleteNotification(id));
  };

  const handleTogglePin = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    dispatch(togglePin(id));
  };

  const handleViewAll = () => {
    const path = loc.pathname.startsWith('/agent') ? '/agent/notifications' : '/notifications';
    navigate(path);
    handleClose();
  };

  const handleNotificationClick = (n: Notification) => {
    if (!n.isRead) {
      dispatch(markAsRead({ ids: [n.id] }));
    }
    
    if (n.actionUrl) {
        navigate(n.actionUrl);
        handleClose();
    } else {
        setSelectedNotif(n);
    }
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton 
        onClick={handleOpen}
        sx={{ 
            bgcolor: open ? 'rgba(99, 102, 241, 0.1)' : '#f1f5f9',
            color: open ? 'primary.main' : 'inherit',
        }}
      >
        <Badge badgeContent={unreadCount} color="error" overlap="circular">
          {unreadCount > 0 ? <NotificationsActiveOutlined fontSize="small" /> : <NotificationsOutlined fontSize="small" />}
        </Badge>
      </IconButton>

      <Popover
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480, // Dynamic height up to 480px
            borderRadius: 3,
            mt: 1.5,
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            pointerEvents: 'auto'
          }
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ p: 2, pb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'background.paper', flexShrink: 0 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" variant="text" onClick={handleMarkAllRead} sx={{ textTransform: 'none', fontSize: 12 }}>
              Mark all as read
            </Button>
          )}
        </Box>
        <Divider />
        
        <Box sx={{ 
            flexGrow: 1, 
            overflowY: 'auto', // Back to auto but with forced scrollbar styles
            minHeight: 100,
            '&::-webkit-scrollbar': {
                width: '6px',
                display: 'block' // Ensure it's there
            },
            '&::-webkit-scrollbar-track': {
                background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
                background: 'rgba(0,0,0,0.1)',
                borderRadius: '10px',
            },
            '&:hover::-webkit-scrollbar-thumb': {
                background: 'rgba(0,0,0,0.3)', // Slightly darker for visibility
            }
        }}>
          {loading && notifications.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No notifications yet
              </Typography>
            </Box>
          ) : (
            <List disablePadding sx={{ width: '100%' }}>
              {notifications.map((n) => (
                <React.Fragment key={n.id}>
                  <ListItemButton 
                    onClick={() => handleNotificationClick(n)}
                    sx={{ 
                      px: 2, py: 1.5,
                      bgcolor: !n.isRead ? 'rgba(99, 102, 241, 0.04)' : 'transparent',
                      '&:hover': { 
                        bgcolor: 'rgba(0, 0, 0, 0.02)',
                        '& .actions': { display: 'flex' }
                      }
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: 48 }}>
                      <Avatar sx={{ 
                        width: 40, height: 40, 
                        bgcolor: n.priority === 'HIGH' ? 'error.light' : 'primary.light',
                        color: n.priority === 'HIGH' ? 'error.main' : 'primary.main',
                        fontSize: 16
                      }}>
                        {n.title.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography variant="body2" fontWeight={!n.isRead ? 700 : 500} sx={{ pr: 1 }}>
                            {n.title}
                          </Typography>
                          {!n.isRead && <Circle sx={{ fontSize: 8, color: 'primary.main', mt: 0.5 }} />}
                          <Box className="actions" sx={{ display: 'none', ml: 1 }}>
                             <Tooltip title={n.isPinned ? "Unpin" : "Pin"}>
                               <IconButton size="small" onClick={(e) => handleTogglePin(e, n.id)} sx={{ p: 0.5, color: n.isPinned ? 'primary.main' : 'inherit' }}>
                                 <PushPinOutlined sx={{ fontSize: 16 }} />
                               </IconButton>
                             </Tooltip>
                             <IconButton size="small" onClick={(e) => handleDelete(e, n.id)} sx={{ p: 0.5, color: 'error.main' }}>
                               <DeleteOutlineOutlined sx={{ fontSize: 16 }} />
                             </IconButton>
                          </Box>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            sx={{ 
                                display: '-webkit-box', 
                                WebkitLineClamp: 2, 
                                WebkitBoxOrient: 'vertical', 
                                overflow: 'hidden',
                                mb: 0.5, 
                                lineHeight: 1.2 
                            }}
                          >
                            {n.message}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
        
        <Divider />
        <Box sx={{ p: 1, textAlign: 'center', bgcolor: 'background.paper' }}>
          <Button fullWidth size="small" onClick={handleViewAll} sx={{ textTransform: 'none', color: 'text.secondary' }}>
            View all notifications
          </Button>
        </Box>
      </Popover>

      <Dialog 
        open={Boolean(selectedNotif)} 
        onClose={() => setSelectedNotif(null)}
        PaperProps={{ sx: { borderRadius: 3, maxWidth: 450 } }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={700}>Notification Detail</Typography>
          <IconButton onClick={() => setSelectedNotif(null)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom color="primary.main">
            {selectedNotif?.title}
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary', lineHeight: 1.6 }}>
            {selectedNotif?.message}
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 3 }}>
            Received: {selectedNotif && formatDistanceToNow(new Date(selectedNotif.createdAt), { addSuffix: true })}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSelectedNotif(null)} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>
            Close
          </Button>
          {selectedNotif?.actionUrl && (
            <Button 
                variant="contained" 
                onClick={() => {
                    if (selectedNotif.actionUrl) navigate(selectedNotif.actionUrl);
                    setSelectedNotif(null);
                    handleClose();
                }}
                sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Take Action
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NotificationBell;
