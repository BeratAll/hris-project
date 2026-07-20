'use strict';

const Redis = require('ioredis');
const config = require('./index');
const logger = require('../utils/logger.util');

// --- Redis Client Oluşturma ---
// Rate limiting, oturum yönetimi ve cache için kullanılır.
const redisClient = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password || undefined,
  db: config.redis.db,
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 200, 5000);
    logger.warn(`Redis yeniden bağlanma denemesi #${times}, ${delay}ms sonra...`);
    return delay;
  },
  enableReadyCheck: true,
  lazyConnect: false,
});

// --- Bağlantı Event Yönetimi ---
redisClient.on('connect', () => {
  logger.info('✅ Redis bağlantısı başarılı');
});

redisClient.on('error', (err) => {
  logger.error('Redis bağlantı hatası', { error: err.message });
});

redisClient.on('close', () => {
  logger.warn('Redis bağlantısı kapandı');
});

module.exports = redisClient;
