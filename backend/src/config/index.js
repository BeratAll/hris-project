'use strict';

const path = require('path');
const dotenv = require('dotenv');

// --- Ortam Bazlı .env Dosyası Yükleme ---
// NODE_ENV değerine göre doğru .env dosyasını yükler.
// Öncelik: .env.{NODE_ENV} > .env (fallback)
const environment = process.env.NODE_ENV || 'development';
const envFilePath = path.resolve(__dirname, `../../.env.${environment}`);
const fallbackEnvPath = path.resolve(__dirname, '../../.env');

const result = dotenv.config({ path: envFilePath });

if (result.error) {
  dotenv.config({ path: fallbackEnvPath });
}

// --- Merkezi Konfigürasyon Objesi ---
// Tüm ortam değişkenlerini tek bir yerden yönetir.
// Yeni bir config eklendiğinde buraya eklenmeli.
const config = Object.freeze({
  env: environment,
  port: parseInt(process.env.PORT, 10) || 3000,
  apiPrefix: process.env.API_PREFIX || '/api/v1',

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'secretpassword',
    database: process.env.DB_NAME || 'hris_db',
    poolMin: parseInt(process.env.DB_POOL_MIN, 10) || 2,
    poolMax: parseInt(process.env.DB_POOL_MAX, 10) || 10,
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    cookieExpiresIn: parseInt(process.env.JWT_COOKIE_EXPIRES_IN, 10) || 1,
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },

  encryption: {
    key: process.env.ENCRYPTION_KEY,
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },

  log: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || 'logs',
  },
});

module.exports = config;
