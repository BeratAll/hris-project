import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { assetsAPI } from '@/services/api';

/**
 * Assets Slice — Zimmet ve Demirbaş Yönetimi State Katmanı
 */

export const fetchAssets = createAsyncThunk(
  'assets/fetchAssets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await assetsAPI.getAll();
      return response.data?.data?.assets || [];
    } catch (error) {
      const message =
        error.response?.data?.message || 'Zimmet listesi yüklenirken bir hata oluştu.';
      return rejectWithValue(message);
    }
  }
);

export const createAsset = createAsyncThunk(
  'assets/createAsset',
  async (data, { rejectWithValue }) => {
    try {
      const response = await assetsAPI.create(data);
      return response.data?.data?.asset;
    } catch (error) {
      const message =
        error.response?.data?.message || 'Zimmet kaydı oluşturulurken bir hata oluştu.';
      return rejectWithValue(message);
    }
  }
);

export const returnAsset = createAsyncThunk(
  'assets/returnAsset',
  async (id, { rejectWithValue }) => {
    try {
      const response = await assetsAPI.return(id);
      return response.data?.data?.asset;
    } catch (error) {
      const message =
        error.response?.data?.message || 'Zimmet iade alınırken bir hata oluştu.';
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  assets: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const assetSlice = createSlice({
  name: 'assets',
  initialState,
  reducers: {
    clearAssetsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- FETCH ASSETS ---
      .addCase(fetchAssets.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAssets.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.assets = action.payload;
        state.error = null;
      })
      .addCase(fetchAssets.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // --- CREATE ASSET ---
      .addCase(createAsset.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createAsset.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.assets.unshift(action.payload);
        state.error = null;
      })
      .addCase(createAsset.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // --- RETURN ASSET ---
      .addCase(returnAsset.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(returnAsset.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.assets.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.assets[index] = {
            ...state.assets[index],
            status: action.payload.status,
            returnDate: action.payload.returnDate,
          };
        }
        state.error = null;
      })
      .addCase(returnAsset.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearAssetsError } = assetSlice.actions;

export const selectAllAssets = (state) => state.assets?.assets || [];
export const selectAssetsStatus = (state) => state.assets?.status || 'idle';
export const selectAssetsError = (state) => state.assets?.error || null;

export default assetSlice.reducer;
