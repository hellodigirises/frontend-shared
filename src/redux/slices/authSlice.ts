import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

interface AuthState {
  user: any | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: localStorage.getItem("token"),
  user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null,
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }, thunkAPI) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const authData = response.data.data;
      localStorage.setItem("token", authData.accessToken);
      localStorage.setItem("user", JSON.stringify(authData.user));
      
      // Also set sa_token if user is SUPERADMIN to support superadmin module API
      if (authData.user?.role?.toUpperCase() === 'SUPERADMIN') {
        localStorage.setItem("sa_token", authData.accessToken);
      }
      
      return authData;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response.data.message || "Login failed");
    }
  }
);

export const getProfile = createAsyncThunk(
  "auth/getProfile",
  async (_, thunkAPI) => {
    try {
      const response = await api.get("/auth/profile");
      const user = response.data.data;
      localStorage.setItem("user", JSON.stringify(user));
      return user;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response.data.message || "Failed to fetch profile");
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("sa_token");
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      // Persist
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      if (action.payload.user?.role?.toUpperCase() === 'SUPERADMIN') {
        localStorage.setItem("sa_token", action.payload.token);
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("sa_token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
      })
      .addCase(loginUser.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      });
  },
});


export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;