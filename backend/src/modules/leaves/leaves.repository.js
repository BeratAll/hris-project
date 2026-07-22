'use strict';

const db = require('../../config/database');

/**
 * Leaves Repository — İzin Talepleri Veritabanı Katmanı
 */

/**
 * Tüm izin taleplerini listeler (Yöneticiler için).
 */
const findAll = async () => {
  const { rows } = await db.query(
    `SELECT l.id, u.first_name || ' ' || u.last_name AS "employeeName", l.leave_type AS "leaveType",
            TO_CHAR(l.start_date, 'YYYY-MM-DD') AS "startDate", TO_CHAR(l.end_date, 'YYYY-MM-DD') AS "endDate",
            (l.end_date - l.start_date + 1) AS duration, l.reason, l.status
     FROM leaves l
     JOIN users u ON l.employee_id = u.id
     ORDER BY l.created_at DESC`
  );
  return rows;
};

/**
 * Sadece belirli bir çalışana ait izin taleplerini getirir.
 */
const findByEmployeeId = async (employeeId) => {
  const { rows } = await db.query(
    `SELECT l.id, u.first_name || ' ' || u.last_name AS "employeeName", l.leave_type AS "leaveType",
            TO_CHAR(l.start_date, 'YYYY-MM-DD') AS "startDate", TO_CHAR(l.end_date, 'YYYY-MM-DD') AS "endDate",
            (l.end_date - l.start_date + 1) AS duration, l.reason, l.status
     FROM leaves l
     JOIN users u ON l.employee_id = u.id
     WHERE l.employee_id = $1
     ORDER BY l.created_at DESC`,
    [employeeId]
  );
  return rows;
};

/**
 * Yeni izin talebi oluşturur ve eklenen satırı detaylarıyla döner.
 */
const create = async ({ employeeId, leaveType, startDate, endDate, reason }) => {
  const { rows } = await db.query(
    `WITH inserted AS (
       INSERT INTO leaves (employee_id, leave_type, start_date, end_date, reason, status)
       VALUES ($1, $2, $3, $4, $5, 'Bekliyor')
       RETURNING id, employee_id, leave_type, start_date, end_date, reason, status
     )
     SELECT i.id, u.first_name || ' ' || u.last_name AS "employeeName", i.leave_type AS "leaveType",
            TO_CHAR(i.start_date, 'YYYY-MM-DD') AS "startDate", TO_CHAR(i.end_date, 'YYYY-MM-DD') AS "endDate",
            (i.end_date - i.start_date + 1) AS duration, i.reason, i.status
     FROM inserted i
     JOIN users u ON i.employee_id = u.id`,
    [employeeId, leaveType, startDate, endDate, reason]
  );
  return rows[0];
};

module.exports = { findAll, findByEmployeeId, create };
