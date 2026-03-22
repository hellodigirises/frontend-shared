import React, { useEffect, useState } from 'react';
import { Box, Typography, Stack, CircularProgress, Alert } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import api from '../../../api/axios';
import { AnnouncementsPage } from '../../tenant-admin/pages/Notification_Center/CommunicationPages';
import { Announcement } from '../../tenant-admin/pages/Notification_Center/notifTypes';

const NotificationsPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data);
      setError(null);
    } catch (e: any) {
      console.error(e);
      setError('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && announcements.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      <AnnouncementsPage 
        announcements={announcements} 
        currentRole={user?.role || ''} 
        onRefresh={fetchData} 
      />
    </Box>
  );
};

export default NotificationsPage;
