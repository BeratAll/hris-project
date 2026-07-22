'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const config = require('./config');
const AppError = require('./utils/appError.util');
const globalErrorHandler = require('./middlewares/errorHandler.middleware');
const { globalLimiter } = require('./middlewares/rateLimiter.middleware');
const { auditLog } = require('./middlewares/auditLog.middleware');
const apiResponse = require('./utils/apiResponse.util');

// --- Rota Modülleri ---
const authRoutes = require('./modules/auth/auth.routes');
const employeeRoutes = require('./modules/employees/employees.routes');
const leaveRoutes = require('./modules/leaves/leaves.routes');

// --- Express Uygulaması ---
const app = express();

// =============================================
// 1. GÜVENLİK MIDDLEWARE'LERİ
// =============================================

// Helmet — HTTP güvenlik header'larını ayarlar
// X-Content-Type-Options, X-Frame-Options, HSTS vb.
app.use(helmet());

// CORS — Cross-Origin Resource Sharing konfigürasyonu
app.use(cors({
  origin: config.cors.origin,
  credentials: true,               // Cookie gönderimi için zorunlu
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,                    // Preflight cache: 24 saat
}));

// HPP — HTTP Parameter Pollution koruması
app.use(hpp());

// =============================================
// 2. PARSER MIDDLEWARE'LERİ
// =============================================

// JSON body parser — 10KB limit (büyük payload saldırıları için)
app.use(express.json({ limit: '10kb' }));

// URL-encoded form parser
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Cookie parser — httpOnly cookie'leri okumak için
app.use(cookieParser());

// =============================================
// 3. RATE LIMITING
// =============================================

// Global rate limiter — tüm endpoint'lere uygulanır
app.use(globalLimiter);

// =============================================
// 4. DENETİM İZİ (AUDIT LOG)
// =============================================

// Veri değiştiren istekleri otomatik loglar (POST/PUT/PATCH/DELETE)
app.use(auditLog);

// =============================================
// 5. PROXY GÜVENİ
// =============================================

// Reverse proxy (nginx) arkasında doğru IP adresi tespiti
app.set('trust proxy', 1);

// =============================================
// 6. SAĞLIK KONTROLÜ
// =============================================

/**
 * GET /health
 * Load balancer ve monitoring araçları için sağlık kontrolü.
 * Middleware zincirinden bağımsız, her zaman erişilebilir.
 */
app.get('/health', (_req, res) => {
  return apiResponse.success(res, {
    statusCode: 200,
    message: 'HRIS Backend çalışıyor.',
    data: {
      status: 'healthy',
      environment: config.env,
      uptime: `${Math.floor(process.uptime())}s`,
      timestamp: new Date().toISOString(),
    },
  });
});

// =============================================
// 7. API ROTALARI
// =============================================

// Tüm modül rotaları API prefix altında monte edilir
app.use(`${config.apiPrefix}/auth`, authRoutes);
app.use(`${config.apiPrefix}/employees`, employeeRoutes);
app.use(`${config.apiPrefix}/leaves`, leaveRoutes);
// app.use(`${config.apiPrefix}/leaves`, leaveRoutes);
// app.use(`${config.apiPrefix}/payroll`, payrollRoutes);
// app.use(`${config.apiPrefix}/departments`, departmentRoutes);
// app.use(`${config.apiPrefix}/sites`, siteRoutes);

// =============================================
// 8. 404 HANDLER
// =============================================

// Tanımsız rotalar için standart hata
app.all('*', (req, _res, next) => {
  next(new AppError(`${req.method} ${req.originalUrl} yolu bulunamadı.`, 404));
});

// =============================================
// 9. GLOBAL ERROR HANDLER
// =============================================

// Tüm hataları merkezi olarak yakalar — EN SON middleware olmalı
app.use(globalErrorHandler);

module.exports = app;
