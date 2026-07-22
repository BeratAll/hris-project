'use strict';

const db = require('../../config/database');

/**
 * Employees Repository — Çalışan Yönetimi Veritabanı Erişim Katmanı
 */

/**
 * Tüm çalışanları oluşturulma tarihine göre tersten listeler.
 * Ad ve Soyad birleştirilerek "fullName" olarak isimlendirilir.
 */
const findAll = async () => {
  const { rows } = await db.query(
    `SELECT id, first_name || ' ' || last_name AS "fullName", email, role,
            department, location, is_active AS "isActive", 'Active' AS status, created_at AS "createdAt"
     FROM users
     WHERE is_active = true
     ORDER BY created_at DESC`
  );
  return rows;
};

/**
 * E-posta adresine göre kullanıcı kaydı arar.
 */
const findByEmail = async (email) => {
  const { rows } = await db.query(
    `SELECT id, email FROM users WHERE email = $1 LIMIT 1`,
    [email]
  );
  return rows[0] || null;
};

/**
 * Yeni çalışan/kullanıcı kaydı oluşturur.
 */
const create = async ({ firstName, lastName, email, passwordHash, role = 'employee', department, location }) => {
  const { rows } = await db.query(
    `INSERT INTO users (first_name, last_name, email, password_hash, role, department, location)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, first_name || ' ' || last_name AS "fullName", email, role, department, location, is_active AS "isActive", created_at AS "createdAt"`,
    [firstName, lastName, email, passwordHash, role, department, location]
  );
  return rows[0];
};

/**
 * Çalışan bilgilerini günceller.
 */
const update = async (id, { firstName, lastName, email, department, location }) => {
  const { rows } = await db.query(
    `UPDATE users
     SET first_name = $1, last_name = $2, email = $3, department = $4, location = $5, updated_at = NOW()
     WHERE id = $6
     RETURNING id, first_name || ' ' || last_name AS "fullName", email, role, department, location, is_active AS "isActive", created_at AS "createdAt"`,
    [firstName, lastName, email, department, location, id]
  );
  return rows[0];
};

/**
 * Çalışanı pasife çekerek (soft delete) siler.
 */
const deleteById = async (id) => {
  const { rows } = await db.query(
    `UPDATE users
     SET is_active = false, updated_at = NOW()
     WHERE id = $1
     RETURNING id, first_name || ' ' || last_name AS "fullName", email, role, department, location, is_active AS "isActive"`,
    [id]
  );
  return rows[0];
};

module.exports = { findAll, findByEmail, create, update, deleteById };
