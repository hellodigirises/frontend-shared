import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { usersApi, User, Role, CreateUserPayload, UpdateUserPayload } from '../api/usersApi';

interface UsersState {
  users: User[];
  roles: Role[];
  loading: boolean;
  error: string | null;
  total: number;
  selectedUser: User | null;
}

const initialState: UsersState = {
  users: [],
  roles: [],
  loading: false,
  error: null,
  total: 0,
  selectedUser: null,
};

// Async thunks
export const fetchUsers = createAsyncThunk(
  'tenantAdmin/users/fetchAll',
  async (params: { skip?: number; take?: number; search?: string; role?: string; status?: string } = {}) => {
    return await usersApi.getAll(params.skip, params.take, params.search, params.role, params.status);
  }
);

export const fetchRoles = createAsyncThunk(
  'tenantAdmin/users/fetchRoles',
  async () => {
    return await usersApi.getAvailableRoles();
  }
);

export const fetchUserById = createAsyncThunk(
  'tenantAdmin/users/fetchById',
  async (id: string) => {
    return await usersApi.getById(id);
  }
);

export const createUser = createAsyncThunk(
  'tenantAdmin/users/create',
  async (payload: CreateUserPayload) => {
    return await usersApi.create(payload);
  }
);

export const updateUser = createAsyncThunk(
  'tenantAdmin/users/update',
  async ({ id, payload }: { id: string; payload: UpdateUserPayload }) => {
    return await usersApi.update(id, payload);
  }
);

export const deleteUser = createAsyncThunk(
  'tenantAdmin/users/delete',
  async (id: string) => {
    await usersApi.delete(id);
    return id;
  }
);

export const resetUserPassword = createAsyncThunk(
  'tenantAdmin/users/resetPassword',
  async ({ id, password }: { id: string; password: string }) => {
    return await usersApi.resetPassword(id, password);
  }
);

const usersSlice = createSlice({
  name: 'tenantAdminUsers',
  initialState,
  reducers: {
    clearSelected: (state) => {
      state.selectedUser = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload || [];
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      });

    // Fetch roles
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload || [];
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch roles';
      });

    // Fetch single user
    builder
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.selectedUser = action.payload;
      });

    // Create user
    builder
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create user';
      });

    // Update user
    builder
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index > -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update user';
      });

    // Delete user
    builder
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(u => u.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete user';
      });

    // Reset password
    builder
      .addCase(resetUserPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetUserPassword.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index > -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(resetUserPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to reset password';
      });
  },
});

export const { clearSelected, clearError } = usersSlice.actions;
export default usersSlice.reducer;
