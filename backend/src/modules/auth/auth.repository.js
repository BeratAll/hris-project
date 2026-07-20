'use strict';

const db = require('../../config/database');

/**
 * Auth Repository — Veritabanı Erişim Katmanı
 *
 * Sadece SQL sorgularını içerir. İş kuralı (business logic) YOKTUR.
 * Service katmanı bu fonksiyonları çağırır.
 *
 * Tüm sorgular parametrik ($1, $2...) yazılır — SQL Injection koruması.
 */

/**
 * E-posta adresine göre kullanıcı getirir.
 * Login ve benzersizlik kontrolü için kullanılır.
 *
 * @param {string} email - Kullanıcı e-posta adresi
 * @returns {Promise<Object|null>} Kullanıcı objesi veya null
 */
const findByEmail = async (email) => {
  const { rows } = await db.query(
    `SELECT id, first_name, last_name, email, password_hash, role,
            department_id, site_id, is_active, created_at
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [email]
  );
  return rows[0] || null;
};

/**
 * ID'ye göre kullanıcı getirir (şifre hariç).
 * Token doğrulama sonrası profil bilgisi için kullanılır.
 *
 * @param {string} id - Kullanıcı UUID
 * @returns {Promise<Object|null>} Kullanıcı objesi veya null
 */
const findById = async (id) => {
  const { rows } = await db.query(
    `SELECT id, first_name, last_name, email, role,
            department_id, site_id, is_active, created_at, updated_at
     FROM users
     WHERE id = $1
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

/**
 * Yeni kullanıcı oluşturur.
 *
 * @param {Object} userData
 * @param {string} userData.firstName - Ad
 * @param {string} userData.lastName - Soyad
 * @param {string} userData.email - E-posta
 * @param {string} userData.passwordHash - Hash'lenmiş şifre
 * @param {string} [userData.role='employee'] - Rol
 * @returns {Promise<Object>} Oluşturulan kullanıcı (şifre hariç)
 */
const create = async ({ firstName, lastName, email, passwordHash, role = 'employee' }) => {
  const { rows } = await db.query(
    `INSERT INTO users (first_name, last_name, email, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, first_name, last_name, email, role, is_active, created_at`,
    [firstName, lastName, email, passwordHash, role]
  );
  return rows[0];
};

/**
 * Kullanıcı şifresini günceller.
 *
 * @param {string} id - Kullanıcı UUID
 * @param {string} passwordHash - Yeni hash'lenmiş şifre
 * @returns {Promise<Object>} Güncellenen kullanıcı
 */
const updatePassword = async (id, passwordHash) => {
  const { rows } = await db.query(
    `UPDATE users
     SET password_hash = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, email, updated_at`,
    [passwordHash, id]
  );
  return rows[0];
};

/**
 * Kullanıcının son giriş zamanını günceller.
 *
 * @param {string} id - Kullanıcı UUID
 * @returns {Promise<void>}
 */
const updateLastLogin = async (id) => {
  await db.query(
    `UPDATE users SET last_login_at = NOW() WHERE id = $1`,
    [id]
  );
};

module.exports = {
  findByEmail,
  findById,
  create,
  updatePassword,
  updateLastLogin,
};
