'use strict';

const db = require('../../config/database');

/**
 * Payroll Repository — Maaş Bordroları Veritabanı Katmanı
 */

/**
 * Tüm bordroları çalışan adıyla birleştirerek listeler (Yöneticiler için).
 */
const findAll = async () => {
  const { rows } = await db.query(
    `SELECT p.id, u.first_name || ' ' || u.last_name AS "employeeName", p.period,
            p.gross_salary AS "grossSalary", p.net_salary AS "netSalary", p.status
     FROM payrolls p
     JOIN users u ON p.employee_id = u.id
     ORDER BY p.created_at DESC`
  );
  return rows;
};

/**
 * Sadece belirli bir çalışana ait bordroları getirir (Çalışanın kendisi için).
 */
const findByEmployeeId = async (employeeId) => {
  const { rows } = await db.query(
    `SELECT p.id, u.first_name || ' ' || u.last_name AS "employeeName", p.period,
            p.gross_salary AS "grossSalary", p.net_salary AS "netSalary", p.status
     FROM payrolls p
     JOIN users u ON p.employee_id = u.id
     WHERE p.employee_id = $1
     ORDER BY p.created_at DESC`,
    [employeeId]
  );
  return rows;
};

/**
 * Yeni bordro kaydı ekler.
 */
const create = async ({ employeeId, period, grossSalary, netSalary, status = 'Bekliyor' }) => {
  const { rows } = await db.query(
    `WITH inserted AS (
       INSERT INTO payrolls (employee_id, period, gross_salary, net_salary, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, employee_id, period, gross_salary, net_salary, status
     )
     SELECT i.id, u.first_name || ' ' || u.last_name AS "employeeName", i.period,
            i.gross_salary AS "grossSalary", i.net_salary AS "netSalary", i.status
     FROM inserted i
     JOIN users u ON i.employee_id = u.id`,
    [employeeId, period, grossSalary, netSalary, status]
  );
  return rows[0];
};

module.exports = { findAll, findByEmployeeId, create };
