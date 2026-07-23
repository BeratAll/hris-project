import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardAPI } from '@/services/api';

/**
 * Dashboard Slice — Gösterge Paneli İstatistikleri State Katmanı
 *
 * Async Thunk'lar:
 * - fetchDashboardStats: Gösterge paneli istatistiklerini getirir (GET /api/v1/dashboard/stats)
 */

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getStats();
      return response.data?.data;
    } catch (error) {
      const message =
        error.response?.data?.message || 'Dashboard istatistikleri yüklenirken bir hata oluştu.';
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  stats: {
    totalEmployees: 0,
    pendingLeaves: 0,
    totalPayrollExpense: 0,
  },
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- FETCH DASHBOARD STATS ---
      .addCase(fetchDashboardStats.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearDashboardError } = dashboardSlice.actions;

export const selectDashboardStats = (state) => state.dashboard.stats;
export const selectDashboardStatus = (state) => state.dashboard.status;
export const selectDashboardError = (state) => state.dashboard.error;

export default dashboardSlice.reducer;
