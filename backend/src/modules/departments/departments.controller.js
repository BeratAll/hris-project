'use strict';

const departmentsService = require('./departments.service');
const apiResponse = require('../../utils/apiResponse.util');

/**
 * Departments Controller
 */

const getDepartments = async (req, res) => {
  const departments = await departmentsService.getDepartments();
  return apiResponse.success(res, {
    statusCode: 200,
    message: 'Departmanlar başarıyla getirildi.',
    data: { departments },
  });
};

const createDepartment = async (req, res) => {
  const { name } = req.body;
  const department = await departmentsService.createDepartment(name);
  return apiResponse.success(res, {
    statusCode: 201,
    message: 'Departman başarıyla oluşturuldu.',
    data: { department },
  });
};

const updateDepartment = async (req, res) => {
  const { id } = req.params;
  const { name, isActive } = req.body;
  const department = await departmentsService.updateDepartment(id, { name, isActive });
  return apiResponse.success(res, {
    statusCode: 200,
    message: 'Departman başarıyla güncellendi.',
    data: { department },
  });
};

const deleteDepartment = async (req, res) => {
  const { id } = req.params;
  await departmentsService.deleteDepartment(id);
  return apiResponse.success(res, {
    statusCode: 200,
    message: 'Departman başarıyla silindi.',
  });
};

module.exports = { getDepartments, createDepartment, updateDepartment, deleteDepartment };
