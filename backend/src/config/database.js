'use strict';

const { Pool } = require('pg');
const config = require('./index');
const logger = require('../utils/logger.util');

// --- PostgreSQL Bağlantı Havuzu ---
// Uygulama genelinde tek bir Pool instance'ı kullanılır.
// Her sorgu havuzdan bir bağlantı alır ve işlem bitince geri bırakır.
const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  min: config.db.poolMin,
  max: config.db.poolMax,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Havuz hata event'i — bağlantı koptuğunda logla
pool.on('error', (err) => {
  logger.error('PostgreSQL havuz bağlantı hatası', { error: err.message });
});

/**
 * Veritabanı bağlantısını test eder.
 * Sunucu başlarken çağrılır — bağlantı sağlanamazsa uygulama başlamaz.
 * @returns {Promise<void>}
 */
const testConnection = async () => {
  const client = await pool.connect();
  try {
    await client.query('SELECT NOW()');
    logger.info('✅ PostgreSQL bağlantısı başarılı');
  } finally {
    client.release();
  }
};

/**
 * Parametrik SQL sorgusu çalıştırır.
 * Repository katmanı bu fonksiyonu kullanır.
 * @param {string} text - SQL sorgu metni ($1, $2... parametreleriyle)
 * @param {Array} params - Sorgu parametreleri
 * @returns {Promise<import('pg').QueryResult>}
 */
const query = async (text, params) => {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;

  logger.debug('SQL Sorgusu', {
    query: text,
    params,
    duration: `${duration}ms`,
    rows: result.rowCount,
  });

  return result;
};

/**
 * Transaction desteği sağlar.
 * Birden fazla sorguyu atomik olarak çalıştırır.
 * @param {Function} callback - (client) => Promise şeklinde callback
 * @returns {Promise<*>} - Callback'in dönüş değeri
 */
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  query,
  transaction,
  testConnection,
};
