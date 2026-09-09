import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { customerApi } from '@/lib/api/customer';
import { adminAuthApi } from '@/lib/api/admin/auth';
import {
  clearCustomerSession,
  getStoredCustomerToken,
  signOutAdmin,
  getStoredAdmin,
  getStoredAdminToken,
} from '@/lib/auth/session';

// ─── Admin Thunks ────────────────────────────────────────────────────

export const hydrateAdminFromStorage = createAsyncThunk('auth/hydrateAdmin', async () => {
  const token = getStoredAdminToken();
  const profile = getStoredAdmin();
  if (!token || !profile) return null;
  return { token, profile };
});

export const loginAdminUser = createAsyncThunk(
  'auth/loginAdminUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await adminAuthApi.login(email, password);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to sign in');
    }
  }
);

export const logoutAdminUser = createAsyncThunk('auth/logoutAdminUser', async () => {
  await adminAuthApi.logout();
});

// ─── Customer Thunks ─────────────────────────────────────────────────

export const restoreCustomerSession = createAsyncThunk(
  'auth/restoreCustomerSession',
  async (_, { rejectWithValue }) => {
    const token = getStoredCustomerToken();
    if (!token) return null;
    try {
      const data = await customerApi.me({ silent: true });
      return { user: data.user, token };
    } catch (err) {
      clearCustomerSession();
      return rejectWithValue(err.message || 'Session expired');
    }
  }
);

export const fetchCustomerProfile = createAsyncThunk(
  'auth/fetchCustomerProfile',
  async (_, { rejectWithValue }) => {
    try {
      const token = getStoredCustomerToken();
      if (!token) return rejectWithValue('Not signed in');
      const data = await customerApi.me({ silent: true });
      return { user: data.user, token };
    } catch (err) {
      return rejectWithValue(err.message || 'Unable to load profile');
    }
  }
);

export const logoutCustomerUser = createAsyncThunk('auth/logoutCustomerUser', async () => {
  clearCustomerSession();
});

// ─── Slice ───────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    customer: {
      user: null,
      token: null,
      status: 'idle', // 'idle' | 'loading' | 'ready'
    },
    admin: {
      token: null,
      profile: null,
      status: 'idle', // 'idle' | 'loading' | 'ready'
    },
  },
  reducers: {
    setCustomer(state, action) {
      state.customer.user = action.payload?.user || action.payload || null;
      state.customer.token = action.payload?.token || state.customer.token;
      state.customer.status = state.customer.user ? 'ready' : 'idle';
    },
    setAdmin(state, action) {
      if (action.payload?.token) state.admin.token = action.payload.token;
      state.admin.profile = action.payload?.profile || null;
      state.admin.status = action.payload?.profile ? 'ready' : 'idle';
    },
    clearCustomer(state) {
      state.customer.user = null;
      state.customer.token = null;
      state.customer.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    const applyCustomerSession = (state, action) => {
      if (!action.payload) return;
      state.customer.user = action.payload.user;
      state.customer.token = action.payload.token;
      state.customer.status = 'ready';
    };

    builder
      // Admin
      .addCase(hydrateAdminFromStorage.fulfilled, (state, action) => {
        if (!action.payload) return;
        state.admin.token = action.payload.token;
        state.admin.profile = action.payload.profile;
        state.admin.status = 'ready';
      })
      .addCase(loginAdminUser.pending, (state) => {
        state.admin.status = 'loading';
      })
      .addCase(loginAdminUser.fulfilled, (state, action) => {
        state.admin.token = action.payload.token;
        state.admin.profile = action.payload.admin;
        state.admin.status = 'ready';
      })
      .addCase(loginAdminUser.rejected, (state) => {
        state.admin.token = null;
        state.admin.profile = null;
        state.admin.status = 'idle';
      })
      .addCase(logoutAdminUser.fulfilled, (state) => {
        state.admin.token = null;
        state.admin.profile = null;
        state.admin.status = 'idle';
      })
      // Customer
      .addCase(restoreCustomerSession.pending, (state) => {
        state.customer.status = 'loading';
      })
      .addCase(restoreCustomerSession.fulfilled, (state, action) => {
        if (!action.payload) {
          state.customer.user = null;
          state.customer.token = null;
          state.customer.status = 'idle';
          return;
        }
        applyCustomerSession(state, action);
      })
      .addCase(restoreCustomerSession.rejected, (state) => {
        state.customer.user = null;
        state.customer.token = null;
        state.customer.status = 'idle';
      })
      .addCase(fetchCustomerProfile.pending, (state) => {
        state.customer.status = 'loading';
      })
      .addCase(fetchCustomerProfile.fulfilled, applyCustomerSession)
      .addCase(fetchCustomerProfile.rejected, (state) => {
        state.customer.user = null;
        state.customer.status = 'idle';
      })
      .addCase(logoutCustomerUser.fulfilled, (state) => {
        state.customer.user = null;
        state.customer.token = null;
        state.customer.status = 'idle';
      });
  },
});

export const { setCustomer, setAdmin, clearCustomer } = authSlice.actions;
export default authSlice.reducer;
