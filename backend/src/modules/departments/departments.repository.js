'use strict';

const db = require('../../config/database');

/**
 * Departments Repository
 */

const findAll = async () => {
  const { rows } = await db.query(
    `SELECT id, name, is_active AS "isActive", created_at AS "createdAt"
     FROM departments
     ORDER BY name ASC`
  );
  return rows;
};

const findById = async (id) => {
  const { rows } = await db.query(
    `SELECT id, name, is_active AS "isActive", created_at AS "createdAt"
     FROM departments
     WHERE id = $1`,
    [id]
  );
  return rows[0];
};

const create = async (name) => {
  const { rows } = await db.query(
    `INSERT INTO departments (name)
     VALUES ($1)
     RETURNING id, name, is_active AS "isActive", created_at AS "createdAt"`,
    [name]
  );
  return rows[0];
};

const update = async (id, { name, isActive }) => {
  const { rows } = await db.query(
    `UPDATE departments
     SET name = COALESCE($2, name),
         is_active = COALESCE($3, is_active),
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, name, is_active AS "isActive", created_at AS "createdAt"`,
    [id, name, isActive]
  );
  return rows[0];
};

const remove = async (id) => {
  await db.query(`DELETE FROM departments WHERE id = $1`, [id]);
  return true;
};

module.exports = { findAll, findById, create, update, remove };
