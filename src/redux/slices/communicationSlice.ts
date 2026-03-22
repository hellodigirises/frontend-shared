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
      const response = await api.get('/notifications');
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
      await api.post('/notifications/read', { ids, all });
      return { ids, all };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to mark as read');
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
        state.notifications = action.payload.data;
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
      });
  },
});

export const { addNotification, clearError } = communicationSlice.actions;
export default communicationSlice.reducer;
