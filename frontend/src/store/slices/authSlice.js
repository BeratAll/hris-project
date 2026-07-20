import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';

/**
 * Auth Slice — Kimlik Doğrulama State Yönetimi
 *
 * Yönettiği state:
 * - user: Oturum açmış kullanıcı bilgileri (id, ad, email, rol)
 * - isAuthenticated: Oturum durumu
 * - isLoading: Async işlem yükleniyor mu
 * - error: Son hata mesajı
 *
 * Async Thunk'lar:
 * - loginUser: Giriş yapma
 * - logoutUser: Çıkış yapma
 * - fetchCurrentUser: Mevcut oturumu kontrol etme (/auth/me)
 */

// =============================================
// ASYNC THUNK'LAR
// =============================================

/**
 * Kullanıcı girişi yapar.
 * Backend httpOnly cookie ayarlar — token frontend'de saklanmaz.
 */
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data.data.user;
    } catch (error) {
      const message =
        error.response?.data?.message || 'Giriş başarısız. Lütfen tekrar deneyin.';
      return rejectWithValue(message);
    }
  }
);

/**
 * Oturumu sonlandırır.
 * Backend cookie'yi temizler.
 */
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout');
      return null;
    } catch (error) {
      const message = error.response?.data?.message || 'Çıkış işlemi başarısız.';
      return rejectWithValue(message);
    }
  }
);

/**
 * Mevcut oturumu kontrol eder.
 * Sayfa yenilendiğinde cookie üzerinden oturum durumunu doğrular.
 */
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/me');
      return response.data.data.user;
    } catch (error) {
      return rejectWithValue(null);
    }
  }
);

// =============================================
// SLICE TANIMI
// =============================================

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,  // İlk oturum kontrolü yapıldı mı
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,

  // Senkron reducer'lar
  reducers: {
    /**
     * Hata mesajını temizler.
     * Form tekrar doldurulurken önceki hatayı kaldırmak için.
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * Auth state'ini tamamen sıfırlar.
     * 401 interceptor'dan çağrılır.
     */
    resetAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
  },

  // Async thunk reducer'ları
  extraReducers: (builder) => {
    // --- LOGIN ---
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      });

    // --- LOGOUT ---
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        // Çıkış başarısız olsa bile state'i temizle
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      });

    // --- FETCH CURRENT USER ---
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

// --- Action Export'ları ---
export const { clearError, resetAuth } = authSlice.actions;

// --- Selector'lar ---
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectIsInitialized = (state) => state.auth.isInitialized;
export const selectAuthError = (state) => state.auth.error;
export const selectUserRole = (state) => state.auth.user?.role || null;

export default authSlice.reducer;
