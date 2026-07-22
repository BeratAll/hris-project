'use strict';

const employeesService = require('./employees.service');
const apiResponse = require('../../utils/apiResponse.util');

/**
 * GET /api/v1/employees
 * Tüm çalışanları döner.
 */
const getEmployees = async (req, res) => {
  const employees = await employeesService.getEmployees();
  return apiResponse.success(res, {
    statusCode: 200,
    message: 'Çalışanlar başarıyla getirildi.',
    data: { employees },
  });
};

/**
 * POST /api/v1/employees
 * Yeni çalışan kaydı oluşturur.
 */
const createEmployee = async (req, res) => {
  const { fullName, email, department, location } = req.body;
  const creatorId = req.user.id;
  const ipAddress = req.ip;

  const employee = await employeesService.createEmployee(
    { fullName, email, department, location },
    creatorId,
    ipAddress
  );

  return apiResponse.success(res, {
    statusCode: 201,
    message: 'Yeni çalışan başarıyla kaydedildi.',
    data: { employee },
  });
};

/**
 * PUT /api/v1/employees/:id
 * Çalışan bilgilerini günceller.
 */
const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { fullName, email, department, location } = req.body;
  const creatorId = req.user.id;
  const ipAddress = req.ip;

  const employee = await employeesService.updateEmployee(
    id,
    { fullName, email, department, location },
    creatorId,
    ipAddress
  );

  return apiResponse.success(res, {
    statusCode: 200,
    message: 'Çalışan bilgileri başarıyla güncellendi.',
    data: { employee },
  });
};

/**
 * DELETE /api/v1/employees/:id
 * Çalışanı siler (soft delete).
 */
const deleteEmployee = async (req, res) => {
  const { id } = req.params;
  const creatorId = req.user.id;
  const ipAddress = req.ip;

  await employeesService.deleteEmployee(id, creatorId, ipAddress);

  return apiResponse.success(res, {
    statusCode: 200,
    message: 'Çalışan başarıyla silindi.',
  });
};

module.exports = { getEmployees, createEmployee, updateEmployee, deleteEmployee };
