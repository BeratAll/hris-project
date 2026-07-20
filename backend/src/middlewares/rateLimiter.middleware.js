'use strict';

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const redisClient = require('../config/redis');
const config = require('../config');

/**
 * Redis Tabanlı Rate Limiter Middleware Factory
 *
 * express-rate-limit + rate-limit-redis entegrasyonu ile
 * dağıtık ortamlarda (multiple instance) tutarlı hız sınırlaması sağlar.
 *
 * Önceden tanımlı limiter'lar:
 * - globalLimiter:  Genel API koruması (100 req / 15 dk)
 * - loginLimiter:   Brute-force koruması (5 req / 15 dk)
 * - approvalLimiter: Onay endpoint koruması (10 req / 15 dk)
 *
 * Özel limiter oluşturmak için createLimiter() factory fonksiyonunu kullanın.
 */

/**
 * Konfigüre edilebilir rate limiter oluşturur.
 *
 * @param {Object} options
 * @param {number} options.windowMs - Pencere süresi (milisaniye)
 * @param {number} options.max - Pencere başına maksimum istek sayısı
 * @param {string} [options.message] - Limit aşıldığında dönen mesaj
 * @param {string} [options.prefix] - Redis key prefix'i
 * @param {boolean} [options.skipSuccessfulRequests=false] - Başarılı istekleri sayma
 * @param {boolean} [options.skipFailedRequests=false] - Başarısız istekleri sayma
 * @returns {import('express').RequestHandler}
 *
 * @example
 * const customLimiter = createLimiter({
 *   windowMs: 60 * 1000,  // 1 dakika
 *   max: 3,               // 3 istek
 *   prefix: 'rl:otp:',
 *   message: 'Çok fazla OTP denemesi. Lütfen 1 dakika bekleyin.',
 * });
 */
const createLimiter = ({
  windowMs,
  max,
  message = 'Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.',
  prefix = 'rl:general:',
  skipSuccessfulRequests = false,
  skipFailedRequests = false,
} = {}) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,  // RateLimit-* header'ları döner
    legacyHeaders: false,   // X-RateLimit-* header'larını kapat

    store: new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
      prefix,
    }),

    message: {
      success: false,
      statusCode: 429,
      message,
    },

    skipSuccessfulRequests,
    skipFailedRequests,

    // IP adresi tespiti — proxy arkasında doğru IP almak için
    keyGenerator: (req) => {
      return req.ip || req.connection.remoteAddress;
    },
  });
};

// --- Önceden Tanımlı Limiter'lar ---

/**
 * Genel API rate limiter.
 * Tüm endpoint'lere uygulanır.
 */
const globalLimiter = createLimiter({
  windowMs: config.rateLimit.windowMs, // 15 dakika
  max: config.rateLimit.maxRequests,   // 100 istek
  prefix: 'rl:global:',
  message: 'Çok fazla istek gönderdiniz. Lütfen 15 dakika sonra tekrar deneyin.',
});

/**
 * Login endpoint rate limiter.
 * Brute-force saldırılarını önler.
 * Sadece başarısız denemeleri sayar.
 */
const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,           // 15 dakika
  max: 5,                              // 5 deneme
  prefix: 'rl:login:',
  message: 'Çok fazla giriş denemesi. Hesabınızın güvenliği için lütfen 15 dakika bekleyin.',
  skipSuccessfulRequests: true,
});

/**
 * Onay endpoint rate limiter.
 * İzin, bordro gibi onay işlemlerini sınırlar.
 */
const approvalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,           // 15 dakika
  max: 10,                             // 10 istek
  prefix: 'rl:approval:',
  message: 'Çok fazla onay işlemi gönderdiniz. Lütfen 15 dakika sonra tekrar deneyin.',
});

module.exports = {
  createLimiter,
  globalLimiter,
  loginLimiter,
  approvalLimiter,
};
