import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { employeesAPI } from '@/services/api';

/**
 * Employees Slice — Çalışan Yönetimi State Katmanı
 *
 * Async Thunk'lar:
 * - fetchEmployees: Tüm çalışanları getirir (GET /api/v1/employees)
 * - addEmployee: Yeni çalışan ekler (POST /api/v1/employees)
 * - updateEmployee: Çalışan bilgilerini günceller (PUT /api/v1/employees/:id)
 * - deleteEmployee: Çalışanı siler (DELETE /api/v1/employees/:id)
 */

export const fetchEmployees = createAsyncThunk(
  'employees/fetchEmployees',
  async (_, { rejectWithValue }) => {
    try {
      const response = await employeesAPI.getAll();
      const data = response.data?.data;
      if (Array.isArray(data)) {
        return data;
      }
      return data?.employees || data || [];
    } catch (error) {
      const message =
        error.response?.data?.message || 'Çalışan listesi yüklenirken bir hata oluştu.';
      return rejectWithValue(message);
    }
  }
);

export const addEmployee = createAsyncThunk(
  'employees/addEmployee',
  async (employeeData, { rejectWithValue }) => {
    try {
      const response = await employeesAPI.create(employeeData);
      const data = response.data?.data;
      return data?.employee || data;
    } catch (error) {
      const message =
        error.response?.data?.message || 'Çalışan eklenirken bir hata oluştu.';
      return rejectWithValue(message);
    }
  }
);

export const updateEmployee = createAsyncThunk(
  'employees/updateEmployee',
  async ({ id, employeeData }, { rejectWithValue }) => {
    try {
      const response = await employeesAPI.update(id, employeeData);
      const data = response.data?.data;
      return data?.employee || data;
    } catch (error) {
      const message =
        error.response?.data?.message || 'Çalışan güncellenirken bir hata oluştu.';
      return rejectWithValue(message);
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  'employees/deleteEmployee',
  async (id, { rejectWithValue }) => {
    try {
      await employeesAPI.delete(id);
      return id;
    } catch (error) {
      const message =
        error.response?.data?.message || 'Çalışan silinirken bir hata oluştu.';
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  employees: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    clearEmployeeError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- FETCH EMPLOYEES ---
      .addCase(fetchEmployees.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.employees = action.payload;
        state.error = null;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // --- ADD EMPLOYEE ---
      .addCase(addEmployee.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(addEmployee.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.employees.push(action.payload);
        state.error = null;
      })
      .addCase(addEmployee.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // --- UPDATE EMPLOYEE ---
      .addCase(updateEmployee.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.employees.findIndex((emp) => emp.id === action.payload.id);
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // --- DELETE EMPLOYEE ---
      .addCase(deleteEmployee.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.employees = state.employees.filter((emp) => emp.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearEmployeeError } = employeeSlice.actions;

export const selectAllEmployees = (state) => state.employees.employees;
export const selectEmployeesStatus = (state) => state.employees.status;
export const selectEmployeesError = (state) => state.employees.error;

export default employeeSlice.reducer;
