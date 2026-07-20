'use strict';

/**
 * HRIS Backend — Sunucu Başlatma (Entry Point)
 *
 * Sorumlulukları:
 * 1. Config yükleme (env değişkenleri)
 * 2. Veritabanı ve Redis bağlantı kontrolü
 * 3. HTTP sunucusunu başlatma
 * 4. Graceful shutdown yönetimi (SIGTERM, SIGINT)
 * 5. Beklenmeyen hata yakalama (unhandled rejection, uncaught exception)
 */

// Config modülü ilk yüklenen olmalı — env değişkenleri okunur
const config = require('./src/config');
const logger = require('./src/utils/logger.util');
const app = require('./src/app');
const db = require('./src/config/database');
const redisClient = require('./src/config/redis');

// --- Sunucu Referansı ---
let server;

/**
 * Uygulamayı başlatır.
 * Veritabanı ve Redis bağlantılarını kontrol ettikten sonra
 * HTTP sunucusunu dinlemeye alır.
 */
const startServer = async () => {
  try {
    // 1. Veritabanı bağlantısını test et
    await db.testConnection();

    // 2. Redis bağlantısını kontrol et
    await redisClient.ping();
    logger.info('✅ Redis PING başarılı');

    // 3. HTTP sunucusunu başlat
    server = app.listen(config.port, () => {
      logger.info(`🚀 HRIS Backend başlatıldı`, {
        port: config.port,
        environment: config.env,
        apiPrefix: config.apiPrefix,
        url: `http://localhost:${config.port}`,
        healthCheck: `http://localhost:${config.port}/health`,
      });
    });

    // Sunucu hata event'i
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`Port ${config.port} zaten kullanımda. Farklı bir port deneyin.`);
      } else {
        logger.error('Sunucu hatası', { error: err.message });
      }
      process.exit(1);
    });

  } catch (err) {
    logger.error('Sunucu başlatılamadı', {
      error: err.message,
      stack: err.stack,
    });
    process.exit(1);
  }
};

// =============================================
// GRACEFUL SHUTDOWN
// =============================================

/**
 * Sunucuyu düzgün bir şekilde kapatır.
 * 1. Yeni bağlantıları kabul etmeyi durdurur
 * 2. Mevcut bağlantıların tamamlanmasını bekler
 * 3. Veritabanı ve Redis bağlantılarını kapatır
 * 4. Süreci sonlandırır
 *
 * @param {string} signal - Sinyalin adı (SIGTERM, SIGINT)
 */
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} sinyali alındı. Sunucu kapatılıyor...`);

  // HTTP sunucusunu kapat
  if (server) {
    server.close(async () => {
      logger.info('HTTP sunucusu kapatıldı — yeni bağlantı kabul edilmiyor');

      try {
        // PostgreSQL bağlantı havuzunu kapat
        await db.pool.end();
        logger.info('PostgreSQL bağlantı havuzu kapatıldı');

        // Redis bağlantısını kapat
        await redisClient.quit();
        logger.info('Redis bağlantısı kapatıldı');

        logger.info('Tüm kaynaklar serbest bırakıldı. Güle güle! 👋');
        process.exit(0);
      } catch (err) {
        logger.error('Shutdown sırasında hata', { error: err.message });
        process.exit(1);
      }
    });

    // 10 saniye içinde kapanamazsa zorla kapat
    setTimeout(() => {
      logger.error('Shutdown zaman aşımı — zorla kapatılıyor');
      process.exit(1);
    }, 10000);
  }
};

// Sinyal dinleyicileri
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// =============================================
// YAKALANMAMIŞ HATALAR
// =============================================

/**
 * Yakalanmamış Promise rejection — catch'lenmemiş async hatalar.
 * Loglayıp sunucuyu düzgün kapatır.
 */
process.on('unhandledRejection', (reason) => {
  logger.error('YAKALANMAMIŞ PROMISE REJECTİON', {
    error: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined,
  });

  gracefulShutdown('UNHANDLED_REJECTION');
});

/**
 * Yakalanmamış exception — try/catch dışı senkron hatalar.
 * Loglayıp süreci sonlandırır.
 */
process.on('uncaughtException', (err) => {
  logger.error('YAKALANMAMIŞ EXCEPTION', {
    error: err.message,
    stack: err.stack,
  });

  // Uncaught exception sonrası süreç güvenilmez — hemen kapat
  process.exit(1);
});

// --- Sunucuyu Başlat ---
startServer();
