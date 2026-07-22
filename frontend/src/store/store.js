import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import employeeReducer from './slices/employeeSlice';
import leaveReducer from './slices/leaveSlice';

/**
 * Redux Store Konfigürasyonu
 *
 * Merkezi state yönetimi — tüm slice reducer'lar burada birleştirilir.
 * Yeni modüller eklendikçe reducer'lar buraya eklenir.
 *
 * Redux DevTools development ortamında otomatik aktiftir.
 */
const store = configureStore({
  reducer: {
    auth: authReducer,
    employees: employeeReducer,
    leaves: leaveReducer,
    // departments: departmentReducer,
  },

  // Middleware — serileştirilemez veri uyarılarını kontrol et
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Redux action'larında Date objesi gibi serileştirilemez veriler varsa
        // burada ignore edilebilir.
        ignoredActions: [],
        ignoredPaths: [],
      },
    }),

  // DevTools sadece development'ta aktif
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
