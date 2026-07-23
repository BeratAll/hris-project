import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { settingsAPI } from '@/services/api';

/**
 * Settings Slice — Sistem Yapılandırma State Katmanı
 */

export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingsAPI.getAll();
      const data = response.data?.data;
      return data?.settings || data || {};
    } catch (error) {
      const message =
        error.response?.data?.message || 'Sistem ayarları yüklenirken bir hata oluştu.';
      return rejectWithValue(message);
    }
  }
);

export const updateSettingByKey = createAsyncThunk(
  'settings/updateSettingByKey',
  async ({ key, value }, { rejectWithValue }) => {
    try {
      const response = await settingsAPI.update(key, value);
      const data = response.data?.data;
      return { key, setting: data?.setting || data };
    } catch (error) {
      const message =
        error.response?.data?.message || `${key} ayarı güncellenirken bir hata oluştu.`;
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  settings: {},
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearSettingsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- FETCH SETTINGS ---
      .addCase(fetchSettings.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.settings = action.payload;
        state.error = null;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // --- UPDATE SETTING ---
      .addCase(updateSettingByKey.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateSettingByKey.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { key, setting } = action.payload;
        state.settings[key] = {
          ...state.settings[key],
          value: setting.value,
          updatedAt: setting.updatedAt,
        };
        state.error = null;
      })
      .addCase(updateSettingByKey.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearSettingsError } = settingsSlice.actions;

export const selectAllSettings = (state) => state.settings?.settings || {};
export const selectSettingsStatus = (state) => state.settings?.status || 'idle';
export const selectSettingsError = (state) => state.settings?.error || null;

export default settingsSlice.reducer;
