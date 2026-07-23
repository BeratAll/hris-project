import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import employeeReducer from './slices/employeeSlice';
import leaveReducer from './slices/leaveSlice';
import payrollReducer from './slices/payrollSlice';
import dashboardReducer from './slices/dashboardSlice';
import departmentReducer from './slices/departmentSlice';
import siteReducer from './slices/siteSlice';
import settingsReducer from './slices/settingsSlice';
import advanceReducer from './slices/advanceSlice';
import assetReducer from './slices/assetSlice';

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
    payroll: payrollReducer,
    dashboard: dashboardReducer,
    departments: departmentReducer,
    sites: siteReducer,
    settings: settingsReducer,
    advances: advanceReducer,
    assets: assetReducer,
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
