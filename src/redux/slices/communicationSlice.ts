import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/axios';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  status: 'UNREAD' | 'READ';
  createdAt: string;
  isRead: boolean;
  priority: 'HIGH' | 'NORMAL' | 'LOW';
  category?: string;
  actionUrl?: string;
  isPinned?: boolean;
}

interface CommunicationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: CommunicationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

// Async Thunks
export const fetchNotifications = createAsyncThunk(
  'communication/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/communications/notifications?limit=100');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch notifications');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'communication/markAsRead',
  async ({ ids, all }: { ids?: string[]; all?: boolean }, { rejectWithValue }) => {
    try {
      if (all) {
        await api.put('/communications/notifications/mark-all-read');
      } else if (ids && ids.length > 0) {
        await Promise.all(ids.map(id => api.put(`/communications/notifications/${id}/read`)));
      }
      return { ids, all };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to mark as read');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'communication/deleteNotification',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/communications/notifications/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete notification');
    }
  }
);

export const togglePin = createAsyncThunk(
  'communication/togglePin',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/communications/notifications/${id}/pin`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to toggle pin');
    }
  }
);

const communicationSlice = createSlice({
  name: 'communication',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.data || [];
        state.unreadCount = action.payload.meta?.unreadCount || 0;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        if (action.payload.all) {
          state.notifications = state.notifications.map(n => ({ ...n, isRead: true, status: 'READ' }));
          state.unreadCount = 0;
        } else if (action.payload.ids) {
          state.notifications = state.notifications.map(n => 
            action.payload.ids!.includes(n.id) ? { ...n, isRead: true, status: 'READ' } : n
          );
          state.unreadCount = Math.max(0, state.unreadCount - action.payload.ids.length);
        }
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter(n => n.id !== action.payload);
      })
      .addCase(togglePin.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => n.id === action.payload.id);
        if (index !== -1) {
          state.notifications[index].isPinned = action.payload.isPinned;
          // Re-sort notifications: Pinned first, then by date
          state.notifications.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
        }
      });
  },
});

export const { addNotification, clearError } = communicationSlice.actions;
export default communicationSlice.reducer;
