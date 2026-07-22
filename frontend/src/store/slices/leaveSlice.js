import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { leavesAPI } from '@/services/api';

/**
 * Leaves Slice — İzin Talepleri State Katmanı
 *
 * Async Thunk'lar:
 * - fetchLeaves: Tüm izinleri getirir (GET /api/v1/leaves)
 * - createLeave: Yeni izin talebi oluşturur (POST /api/v1/leaves)
 */

export const fetchLeaves = createAsyncThunk(
  'leaves/fetchLeaves',
  async (_, { rejectWithValue }) => {
    try {
      const response = await leavesAPI.getAll();
      const data = response.data?.data;
      if (Array.isArray(data)) {
        return data;
      }
      return data?.leaves || data || [];
    } catch (error) {
      const message =
        error.response?.data?.message || 'İzin talepleri yüklenirken bir hata oluştu.';
      return rejectWithValue(message);
    }
  }
);

export const createLeave = createAsyncThunk(
  'leaves/createLeave',
  async (leaveData, { rejectWithValue }) => {
    try {
      const response = await leavesAPI.create(leaveData);
      const data = response.data?.data;
      return data?.leave || data;
    } catch (error) {
      const message =
        error.response?.data?.message || 'İzin talebi oluşturulurken bir hata oluştu.';
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  leaves: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const leaveSlice = createSlice({
  name: 'leaves',
  initialState,
  reducers: {
    clearLeaveError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- FETCH LEAVES ---
      .addCase(fetchLeaves.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchLeaves.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.leaves = action.payload;
        state.error = null;
      })
      .addCase(fetchLeaves.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // --- CREATE LEAVE ---
      .addCase(createLeave.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createLeave.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.leaves.push(action.payload);
        state.error = null;
      })
      .addCase(createLeave.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearLeaveError } = leaveSlice.actions;

export const selectAllLeaves = (state) => state.leaves.leaves;
export const selectLeavesStatus = (state) => state.leaves.status;
export const selectLeavesError = (state) => state.leaves.error;

export default leaveSlice.reducer;
