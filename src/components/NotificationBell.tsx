import React, { useEffect, useState } from 'react';
import { 
  IconButton, Badge, Menu, MenuItem, Typography, Box, 
  Divider, List, ListItem, ListItemText, ListItemAvatar, 
  Avatar, Button, CircularProgress 
} from '@mui/material';
import { NotificationsOutlined, NotificationsActiveOutlined, Circle } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { fetchNotifications, markAsRead, Notification } from '../redux/slices/communicationSlice';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, unreadCount, loading } = useSelector((state: RootState) => state.communication);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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

  const handleNotificationClick = (n: Notification) => {
    if (!n.isRead) {
      dispatch(markAsRead({ ids: [n.id] }));
    }
    // Deep link if actionUrl exists
    if (n.actionUrl) {
        window.location.href = n.actionUrl;
    }
    handleClose();
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton 
        onClick={handleOpen}
        sx={{ 
            bgcolor: open ? 'rgba(99, 102, 241, 0.1)' : '#f1f5f9',
            color: open ? 'primary.main' : 'inherit'
        }}
      >
        <Badge badgeContent={unreadCount} color="error" overlap="circular">
          {unreadCount > 0 ? <NotificationsActiveOutlined fontSize="small" /> : <NotificationsOutlined fontSize="small" />}
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
            borderRadius: 3,
            mt: 1.5,
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, pb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
        
        <Box sx={{ flexGrow: 1, overflowY: 'auto', minHeight: 100 }}>
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
            <List disablePadding>
              {notifications.slice(0, 10).map((n) => (
                <React.Fragment key={n.id}>
                  <ListItem 
                    button 
                    onClick={() => handleNotificationClick(n)}
                    sx={{ 
                      px: 2, py: 1.5,
                      bgcolor: !n.isRead ? 'rgba(99, 102, 241, 0.04)' : 'transparent',
                      '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.02)' }
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
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, lineHeight: 1.2 }}>
                            {n.message}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
        
        <Divider />
        <Box sx={{ p: 1, textAlign: 'center' }}>
          <Button fullWidth size="small" sx={{ textTransform: 'none', color: 'text.secondary' }}>
            View all notifications
          </Button>
        </Box>
      </Menu>
    </>
  );
};

export default NotificationBell;
