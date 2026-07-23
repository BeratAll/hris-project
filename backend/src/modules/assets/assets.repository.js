'use strict';

const db = require('../../config/database');

/**
 * Assets Repository — Zimmet ve Demirbaş Yönetimi Veritabanı Erişim Katmanı
 */

const findAll = async () => {
  const { rows } = await db.query(
    `SELECT a.id, a.employee_id AS "employeeId", u.first_name || ' ' || u.last_name AS "employeeName",
            a.asset_name AS "assetName", a.asset_type AS "assetType", a.serial_number AS "serialNumber",
            a.issue_date AS "issueDate", a.return_date AS "returnDate", a.status
     FROM assets a
     JOIN users u ON a.employee_id = u.id
     ORDER BY a.created_at DESC`
  );
  return rows;
};

const findByEmployeeId = async (employeeId) => {
  const { rows } = await db.query(
    `SELECT a.id, a.employee_id AS "employeeId", u.first_name || ' ' || u.last_name AS "employeeName",
            a.asset_name AS "assetName", a.asset_type AS "assetType", a.serial_number AS "serialNumber",
            a.issue_date AS "issueDate", a.return_date AS "returnDate", a.status
     FROM assets a
     JOIN users u ON a.employee_id = u.id
     WHERE a.employee_id = $1
     ORDER BY a.created_at DESC`,
    [employeeId]
  );
  return rows;
};

const countInUseByEmployeeId = async (employeeId) => {
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS count 
     FROM assets 
     WHERE employee_id = $1 AND status = 'IN_USE'`,
    [employeeId]
  );
  return rows[0]?.count || 0;
};

const findById = async (id) => {
  const { rows } = await db.query(
    `SELECT id, employee_id AS "employeeId", asset_name AS "assetName", asset_type AS "assetType",
            serial_number AS "serialNumber", issue_date AS "issueDate", return_date AS "returnDate", status
     FROM assets
     WHERE id = $1`,
    [id]
  );
  return rows[0];
};

const create = async ({ employeeId, assetName, assetType, serialNumber, issueDate }) => {
  const { rows } = await db.query(
    `INSERT INTO assets (employee_id, asset_name, asset_type, serial_number, issue_date, status)
     VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_DATE), 'IN_USE')
     RETURNING id, employee_id AS "employeeId", asset_name AS "assetName", asset_type AS "assetType",
               serial_number AS "serialNumber", issue_date AS "issueDate", return_date AS "returnDate", status`,
    [employeeId, assetName, assetType, serialNumber, issueDate]
  );
  return rows[0];
};

const update = async (id, { assetName, assetType, serialNumber, issueDate, returnDate, status }) => {
  const { rows } = await db.query(
    `UPDATE assets
     SET asset_name = $2,
         asset_type = $3,
         serial_number = $4,
         issue_date = $5,
         return_date = $6,
         status = $7,
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, employee_id AS "employeeId", asset_name AS "assetName", asset_type AS "assetType",
               serial_number AS "serialNumber", issue_date AS "issueDate", return_date AS "returnDate", status`,
    [id, assetName, assetType, serialNumber, issueDate, returnDate, status]
  );
  return rows[0];
};

module.exports = {
  findAll,
  findByEmployeeId,
  countInUseByEmployeeId,
  findById,
  create,
  update,
};
