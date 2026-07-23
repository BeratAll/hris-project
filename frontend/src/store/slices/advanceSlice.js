import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { advancesAPI } from '@/services/api';

/**
 * Advances Slice — Avans & Harcama Yönetimi State Katmanı
 */

export const fetchAdvances = createAsyncThunk(
  'advances/fetchAdvances',
  async (_, { rejectWithValue }) => {
    try {
      const response = await advancesAPI.getAll();
      return response.data?.data?.advances || [];
    } catch (error) {
      const message =
        error.response?.data?.message || 'Avans talepleri yüklenirken bir hata oluştu.';
      return rejectWithValue(message);
    }
  }
);

export const createAdvance = createAsyncThunk(
  'advances/createAdvance',
  async (data, { rejectWithValue }) => {
    try {
      const response = await advancesAPI.create(data);
      return response.data?.data?.advance;
    } catch (error) {
      const message =
        error.response?.data?.message || 'Avans talebi oluşturulurken bir hata oluştu.';
      return rejectWithValue(message);
    }
  }
);

export const approveAdvance = createAsyncThunk(
  'advances/approveAdvance',
  async (id, { rejectWithValue }) => {
    try {
      const response = await advancesAPI.approve(id);
      return response.data?.data?.advance;
    } catch (error) {
      const message =
        error.response?.data?.message || 'Avans talebi onaylanırken bir hata oluştu.';
      return rejectWithValue(message);
    }
  }
);

export const rejectAdvance = createAsyncThunk(
  'advances/rejectAdvance',
  async ({ id, rejectionReason }, { rejectWithValue }) => {
    try {
      const response = await advancesAPI.reject(id, rejectionReason);
      return response.data?.data?.advance;
    } catch (error) {
      const message =
        error.response?.data?.message || 'Avans talebi reddedilirken bir hata oluştu.';
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  advances: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const advanceSlice = createSlice({
  name: 'advances',
  initialState,
  reducers: {
    clearAdvancesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- FETCH ADVANCES ---
      .addCase(fetchAdvances.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAdvances.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.advances = action.payload;
        state.error = null;
      })
      .addCase(fetchAdvances.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // --- CREATE ADVANCE ---
      .addCase(createAdvance.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createAdvance.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.advances.unshift(action.payload);
        state.error = null;
      })
      .addCase(createAdvance.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // --- APPROVE ADVANCE ---
      .addCase(approveAdvance.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(approveAdvance.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.advances.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.advances[index] = {
            ...state.advances[index],
            status: action.payload.status,
            paymentDate: action.payload.paymentDate,
          };
        }
        state.error = null;
      })
      .addCase(approveAdvance.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // --- REJECT ADVANCE ---
      .addCase(rejectAdvance.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(rejectAdvance.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.advances.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.advances[index] = {
            ...state.advances[index],
            status: action.payload.status,
          };
        }
        state.error = null;
      })
      .addCase(rejectAdvance.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearAdvancesError } = advanceSlice.actions;

export const selectAllAdvances = (state) => state.advances?.advances || [];
export const selectAdvancesStatus = (state) => state.advances?.status || 'idle';
export const selectAdvancesError = (state) => state.advances?.error || null;

export default advanceSlice.reducer;
