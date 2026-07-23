import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { departmentsAPI } from '@/services/api';

/**
 * Department Slice
 */

export const fetchDepartments = createAsyncThunk(
  'departments/fetchDepartments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await departmentsAPI.getAll();
      const data = response.data?.data;
      return data?.departments || data || [];
    } catch (error) {
      const message =
        error.response?.data?.message || 'Departmanlar yüklenirken bir hata oluştu.';
      return rejectWithValue(message);
    }
  }
);

export const addDepartment = createAsyncThunk(
  'departments/addDepartment',
  async (name, { rejectWithValue }) => {
    try {
      const response = await departmentsAPI.create({ name });
      const data = response.data?.data;
      return data?.department || data;
    } catch (error) {
      const message =
        error.response?.data?.message || 'Departman eklenirken bir hata oluştu.';
      return rejectWithValue(message);
    }
  }
);

export const updateDepartment = createAsyncThunk(
  'departments/updateDepartment',
  async ({ id, name, isActive }, { rejectWithValue }) => {
    try {
      const response = await departmentsAPI.update(id, { name, isActive });
      const data = response.data?.data;
      return data?.department || data;
    } catch (error) {
      const message =
        error.response?.data?.message || 'Departman güncellenirken bir hata oluştu.';
      return rejectWithValue(message);
    }
  }
);

export const deleteDepartment = createAsyncThunk(
  'departments/deleteDepartment',
  async (id, { rejectWithValue }) => {
    try {
      await departmentsAPI.delete(id);
      return id;
    } catch (error) {
      const message =
        error.response?.data?.message || 'Departman silinirken bir hata oluştu.';
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  departments: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const departmentSlice = createSlice({
  name: 'departments',
  initialState,
  reducers: {
    clearDepartmentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- FETCH ---
      .addCase(fetchDepartments.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.departments = action.payload;
        state.error = null;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // --- ADD ---
      .addCase(addDepartment.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(addDepartment.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.departments.push(action.payload);
        state.error = null;
      })
      .addCase(addDepartment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // --- UPDATE ---
      .addCase(updateDepartment.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.departments = state.departments.map((dept) =>
          dept.id === action.payload.id ? action.payload : dept
        );
        state.error = null;
      })
      .addCase(updateDepartment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // --- DELETE ---
      .addCase(deleteDepartment.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.departments = state.departments.filter((dept) => dept.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteDepartment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearDepartmentError } = departmentSlice.actions;

export const selectAllDepartments = (state) => state.departments.departments;
export const selectDepartmentsStatus = (state) => state.departments.status;
export const selectDepartmentsError = (state) => state.departments.error;

export default departmentSlice.reducer;
