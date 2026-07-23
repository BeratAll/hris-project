'use strict';

const db = require('../../config/database');

/**
 * Settings Repository — Sistem Yapılandırma Veritabanı Erişim Katmanı
 */

/**
 * Tüm ayarları listeler.
 */
const findAll = async () => {
  const { rows } = await db.query(
    `SELECT key, value, description, updated_at AS "updatedAt"
     FROM system_settings`
  );
  return rows;
};

/**
 * Belirli bir anahtara ait ayarı günceller.
 */
const updateSetting = async (key, value) => {
  const { rows } = await db.query(
    `UPDATE system_settings
     SET value = $2, updated_at = NOW()
     WHERE key = $1
     RETURNING key, value, description, updated_at AS "updatedAt"`,
    [key, JSON.stringify(value)]
  );
  return rows[0];
};

module.exports = { findAll, updateSetting };
