import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AuthState } from '@/types';
import { signup, login, logout, isAuthenticated } from '@/utils/authManager';
import { getSession } from '@/utils/sessionManager';

const currentUsername = getSession();

const initialState: AuthState = {
  currentUser: currentUsername ? { username: currentUsername, passwordHash: '' } : null,
  isAuthenticated: isAuthenticated(),
  error: null,
  loading: false,
};

export const signupThunk = createAsyncThunk(
  'auth/signup',
  async ({ username, password }: { username: string; password: string }, { rejectWithValue }) => {
    const result = await signup(username, password);
    if (!result.success) {
      return rejectWithValue(result.error ?? 'Signup failed.');
    }
    return { username };
  }
);

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ username, password }: { username: string; password: string }, { rejectWithValue }) => {
    const result = await login(username, password);
    if (!result.success) {
      return rejectWithValue(result.error ?? 'Login failed.');
    }
    return { username };
  }
);

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async () => {
    logout();
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(signupThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.currentUser = { username: action.payload.username, passwordHash: '' };
        state.error = null;
      })
      .addCase(signupThunk.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.currentUser = null;
        state.error = (action.payload as string) ?? 'Signup failed.';
      })
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.currentUser = { username: action.payload.username, passwordHash: '' };
        state.error = null;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.currentUser = null;
        state.error = (action.payload as string) ?? 'Login failed.';
      })
      .addCase(logoutThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.currentUser = null;
        state.error = null;
      })
      .addCase(logoutThunk.rejected, (state) => {
        state.loading = false;
        state.error = 'Logout failed.';
      });
  },
});

export default authSlice.reducer;