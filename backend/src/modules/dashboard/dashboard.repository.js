'use strict';

const db = require('../../config/database');

/**
 * Dashboard Repository — Gösterge Paneli Veritabanı Katmanı
 */

/**
 * Genel yönetici istatistiklerini getirir.
 */
const getManagerStats = async () => {
  const { rows } = await db.query(
    `SELECT
       (SELECT COUNT(*)::int FROM users WHERE is_active = true) AS "totalEmployees",
       (SELECT COUNT(*)::int FROM leaves WHERE status = 'Bekliyor') AS "pendingLeaves",
       COALESCE((
         SELECT SUM(net_salary)::float
         FROM payrolls
         WHERE period = (SELECT period FROM payrolls ORDER BY created_at DESC LIMIT 1)
       ), 0.0) AS "totalPayrollExpense"`
  );
  return rows[0];
};

/**
 * Belirli bir çalışana ait izole edilmiş istatistikleri getirir.
 */
const getEmployeeStats = async (employeeId) => {
  const { rows } = await db.query(
    `SELECT
       1 AS "totalEmployees",
       (SELECT COUNT(*)::int FROM leaves WHERE employee_id = $1 AND status = 'Bekliyor') AS "pendingLeaves",
       COALESCE((
         SELECT SUM(net_salary)::float
         FROM payrolls
         WHERE employee_id = $1 AND period = (SELECT period FROM payrolls WHERE employee_id = $1 ORDER BY created_at DESC LIMIT 1)
       ), 0.0) AS "totalPayrollExpense"`,
    [employeeId]
  );
  return rows[0];
};

module.exports = { getManagerStats, getEmployeeStats };
