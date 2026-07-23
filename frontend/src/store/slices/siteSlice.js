import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sitesAPI } from '@/services/api';

/**
 * Site Slice
 */

export const fetchSites = createAsyncThunk(
  'sites/fetchSites',
  async (_, { rejectWithValue }) => {
    try {
      const response = await sitesAPI.getAll();
      const data = response.data?.data;
      return data?.sites || data || [];
    } catch (error) {
      const message =
        error.response?.data?.message || 'Şantiyeler yüklenirken bir hata oluştu.';
      return rejectWithValue(message);
    }
  }
);

export const addSite = createAsyncThunk(
  'sites/addSite',
  async (name, { rejectWithValue }) => {
    try {
      const response = await sitesAPI.create({ name });
      const data = response.data?.data;
      return data?.site || data;
    } catch (error) {
      const message =
        error.response?.data?.message || 'Şantiye eklenirken bir hata oluştu.';
      return rejectWithValue(message);
    }
  }
);

export const updateSite = createAsyncThunk(
  'sites/updateSite',
  async ({ id, name, isActive }, { rejectWithValue }) => {
    try {
      const response = await sitesAPI.update(id, { name, isActive });
      const data = response.data?.data;
      return data?.site || data;
    } catch (error) {
      const message =
        error.response?.data?.message || 'Şantiye güncellenirken bir hata oluştu.';
      return rejectWithValue(message);
    }
  }
);

export const deleteSite = createAsyncThunk(
  'sites/deleteSite',
  async (id, { rejectWithValue }) => {
    try {
      await sitesAPI.delete(id);
      return id;
    } catch (error) {
      const message =
        error.response?.data?.message || 'Şantiye silinirken bir hata oluştu.';
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  sites: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const siteSlice = createSlice({
  name: 'sites',
  initialState,
  reducers: {
    clearSiteError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- FETCH ---
      .addCase(fetchSites.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSites.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.sites = action.payload;
        state.error = null;
      })
      .addCase(fetchSites.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // --- ADD ---
      .addCase(addSite.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(addSite.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.sites.push(action.payload);
        state.error = null;
      })
      .addCase(addSite.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // --- UPDATE ---
      .addCase(updateSite.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateSite.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.sites = state.sites.map((site) =>
          site.id === action.payload.id ? action.payload : site
        );
        state.error = null;
      })
      .addCase(updateSite.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // --- DELETE ---
      .addCase(deleteSite.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteSite.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.sites = state.sites.filter((site) => site.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteSite.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearSiteError } = siteSlice.actions;

export const selectAllSites = (state) => state.sites.sites;
export const selectSitesStatus = (state) => state.sites.status;
export const selectSitesError = (state) => state.sites.error;

export default siteSlice.reducer;
