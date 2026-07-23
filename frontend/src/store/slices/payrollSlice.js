import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { payrollAPI } from '@/services/api';

/**
 * Payroll Slice — Maaş Bordroları State Katmanı
 *
 * Async Thunk'lar:
 * - fetchPayrolls: Tüm bordroları getirir (GET /api/v1/payroll)
 */

export const fetchPayrolls = createAsyncThunk(
  'payroll/fetchPayrolls',
  async (_, { rejectWithValue }) => {
    try {
      const response = await payrollAPI.getAll();
      const data = response.data?.data;
      if (Array.isArray(data)) {
        return data;
      }
      return data?.payrolls || data || [];
    } catch (error) {
      const message =
        error.response?.data?.message || 'Maaş bordroları yüklenirken bir hata oluştu.';
      return rejectWithValue(message);
    }
  }
);

export const createPayroll = createAsyncThunk(
  'payroll/createPayroll',
  async (payrollData, { rejectWithValue }) => {
    try {
      const response = await payrollAPI.create(payrollData);
      const data = response.data?.data;
      return data?.payroll || data;
    } catch (error) {
      const message =
        error.response?.data?.message || 'Yeni bordro eklenirken bir hata oluştu.';
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  payrolls: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const payrollSlice = createSlice({
  name: 'payroll',
  initialState,
  reducers: {
    clearPayrollError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- FETCH PAYROLLS ---
      .addCase(fetchPayrolls.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPayrolls.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.payrolls = action.payload;
        state.error = null;
      })
      .addCase(fetchPayrolls.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // --- CREATE PAYROLL ---
      .addCase(createPayroll.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createPayroll.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.payrolls.push(action.payload);
        state.error = null;
      })
      .addCase(createPayroll.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearPayrollError } = payrollSlice.actions;

export const selectAllPayrolls = (state) => state.payroll.payrolls;
export const selectPayrollsStatus = (state) => state.payroll.status;
export const selectPayrollsError = (state) => state.payroll.error;

export default payrollSlice.reducer;
