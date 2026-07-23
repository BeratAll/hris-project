import axios from 'axios';

/**
 * Axios API İstemcisi — Merkezi HTTP Haberleşme Katmanı
 *
 * Sorumlulukları:
 * 1. Base URL ve varsayılan ayarları yönetir
 * 2. withCredentials: true — httpOnly cookie otomatik gönderimi
 * 3. Response interceptor — 401 yakalama, global hata standardizasyonu
 * 4. API endpoint method'ları — modüler kullanım
 *
 * Backend JWT'yi httpOnly cookie'de sakladığı için Authorization header
 * eklenmesine gerek yoktur. Cookie tarayıcı tarafından otomatik gönderilir.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// --- Axios Instance ---
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,   // httpOnly cookie otomatik gönderimi
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// =============================================
// REQUEST INTERCEPTOR
// =============================================

api.interceptors.request.use(
  (config) => {
    // httpOnly cookie otomatik gönderilir (withCredentials: true).
    // Manuel Authorization header gerekiyorsa buraya eklenebilir.
    // Örn: API key bazlı harici servis entegrasyonları için.
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// =============================================
// RESPONSE INTERCEPTOR
// =============================================

api.interceptors.response.use(
  // Başarılı yanıtlar — doğrudan geç
  (response) => response,

  // Hata yanıtları — global hata yönetimi
  (error) => {
    const { response } = error;

    // Ağ hatası veya sunucuya ulaşılamıyor
    if (!response) {
      console.error('[API] Ağ hatası — sunucuya ulaşılamıyor:', error.message);
      return Promise.reject({
        message: 'Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.',
        statusCode: 0,
      });
    }

    // 401 Unauthorized — oturum süresi dolmuş veya geçersiz
    if (response.status === 401) {
      // Login sayfasında 401 alırsak redirect yapma (login hatası gösterilmeli)
      const isLoginRequest = response.config?.url?.includes('/auth/login');

      if (!isLoginRequest && typeof window !== 'undefined') {
        // Redux store'u import etmeden resetAuth dispatch edemeyiz.
        // Bunun yerine sayfayı login'e yönlendiriyoruz.
        // Bu, circular dependency'yi önler.
        window.location.href = '/login';
      }
    }

    // 403 Forbidden — yetki hatası
    if (response.status === 403) {
      console.warn('[API] Yetki hatası:', response.data?.message);
    }

    // 429 Too Many Requests — rate limit
    if (response.status === 429) {
      console.warn('[API] Rate limit aşıldı:', response.data?.message);
    }

    // 500+ Server Error
    if (response.status >= 500) {
      console.error('[API] Sunucu hatası:', response.data?.message);
    }

    return Promise.reject(error);
  }
);

// =============================================
// API ENDPOINT METHOD'LARI
// =============================================

/**
 * Auth API — Kimlik doğrulama endpoint'leri
 */
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.patch('/auth/change-password', data),
};

/**
 * Employees API — Çalışan endpoint'leri (ileride)
 */
export const employeesAPI = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
};

/**
 * Leaves API — İzin talepleri endpoint'leri
 */
export const leavesAPI = {
  getAll: () => api.get('/leaves'),
  create: (data) => api.post('/leaves', data),
};

/**
 * Payroll API — Maaş bordroları endpoint'leri
 */
export const payrollAPI = {
  getAll: () => api.get('/payroll'),
  create: (data) => api.post('/payroll', data),
};

/**
 * Dashboard API — Gösterge paneli istatistikleri endpoint'leri
 */
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

/**
 * Departments API — Departman endpoint'leri
 */
export const departmentsAPI = {
  getAll: () => api.get('/departments'),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
};

/**
 * Sites API — Şantiye endpoint'leri
 */
export const sitesAPI = {
  getAll: () => api.get('/sites'),
  create: (data) => api.post('/sites', data),
  update: (id, data) => api.put(`/sites/${id}`, data),
  delete: (id) => api.delete(`/sites/${id}`),
};

/**
 * Settings API — Sistem Yapılandırma endpoint'leri
 */
export const settingsAPI = {
  getAll: () => api.get('/settings'),
  update: (key, value) => api.put(`/settings/${key}`, { value }),
};

export default api;
