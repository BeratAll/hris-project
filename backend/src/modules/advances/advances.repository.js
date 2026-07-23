'use strict';

const db = require('../../config/database');

/**
 * Advances Repository
 */

const findAll = async () => {
  const { rows } = await db.query(
    `SELECT a.id, a.employee_id AS "employeeId", u.first_name || ' ' || u.last_name AS "employeeName",
            a.amount, a.reason, a.status, a.request_date AS "requestDate", a.payment_date AS "paymentDate"
     FROM advances a
     JOIN users u ON a.employee_id = u.id
     ORDER BY a.created_at DESC`
  );
  return rows;
};

const findByEmployeeId = async (employeeId) => {
  const { rows } = await db.query(
    `SELECT a.id, a.employee_id AS "employeeId", u.first_name || ' ' || u.last_name AS "employeeName",
            a.amount, a.reason, a.status, a.request_date AS "requestDate", a.payment_date AS "paymentDate"
     FROM advances a
     JOIN users u ON a.employee_id = u.id
     WHERE a.employee_id = $1
     ORDER BY a.created_at DESC`,
    [employeeId]
  );
  return rows;
};

const findByManagerUnderlings = async ({ location, department, role }) => {
  let query = `
    SELECT a.id, a.employee_id AS "employeeId", u.first_name || ' ' || u.last_name AS "employeeName",
           a.amount, a.reason, a.status, a.request_date AS "requestDate", a.payment_date AS "paymentDate"
    FROM advances a
    JOIN users u ON a.employee_id = u.id
  `;
  const params = [];
  if (role === 'site_chief' && location) {
    query += ` WHERE u.location = $1`;
    params.push(location);
  } else if (role === 'dept_manager' && department) {
    query += ` WHERE u.department = $1`;
    params.push(department);
  } else {
    return [];
  }
  query += ` ORDER BY a.created_at DESC`;
  const { rows } = await db.query(query, params);
  return rows;
};

const findById = async (id) => {
  const { rows } = await db.query(
    `SELECT id, employee_id AS "employeeId", amount, reason, status,
            manager_approved_by AS "managerApprovedBy", hr_approved_by AS "hrApprovedBy",
            gm_approved_by AS "gmApprovedBy", finance_paid_by AS "financePaidBy"
     FROM advances
     WHERE id = $1`,
    [id]
  );
  return rows[0];
};

const create = async ({ employeeId, amount, reason }) => {
  const { rows } = await db.query(
    `INSERT INTO advances (employee_id, amount, reason, status)
     VALUES ($1, $2, $3, 'PENDING_MANAGER_APPROVAL')
     RETURNING id, employee_id AS "employeeId", amount, reason, status, request_date AS "requestDate"`,
    [employeeId, amount, reason]
  );
  return rows[0];
};

const updateStatus = async (id, { status, managerApprovedBy, hrApprovedBy, gmApprovedBy, financePaidBy, paymentDate, rejectedBy, rejectionReason }) => {
  const { rows } = await db.query(
    `UPDATE advances
     SET status = $2,
         manager_approved_by = COALESCE($3, manager_approved_by),
         hr_approved_by = COALESCE($4, hr_approved_by),
         gm_approved_by = COALESCE($5, gm_approved_by),
         finance_paid_by = COALESCE($6, finance_paid_by),
         payment_date = COALESCE($7, payment_date),
         rejected_by = COALESCE($8, rejected_by),
         rejection_reason = COALESCE($9, rejection_reason),
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, employee_id AS "employeeId", amount, reason, status, request_date AS "requestDate", payment_date AS "paymentDate"`,
    [id, status, managerApprovedBy, hrApprovedBy, gmApprovedBy, financePaidBy, paymentDate, rejectedBy, rejectionReason]
  );
  return rows[0];
};

module.exports = {
  findAll,
  findByEmployeeId,
  findByManagerUnderlings,
  findById,
  create,
  updateStatus,
};
