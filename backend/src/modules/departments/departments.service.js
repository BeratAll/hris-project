'use strict';

const departmentsRepository = require('./departments.repository');
const AppError = require('../../utils/appError.util');

/**
 * Departments Service
 */

const getDepartments = async () => {
  return await departmentsRepository.findAll();
};

const createDepartment = async (name) => {
  if (!name || !name.trim()) {
    throw new AppError('Departman adı boş olamaz.', 400);
  }
  try {
    return await departmentsRepository.create(name.trim());
  } catch (error) {
    if (error.code === '23505') {
      throw new AppError('Bu isimde bir departman zaten mevcut.', 400);
    }
    throw error;
  }
};

const updateDepartment = async (id, data) => {
  const department = await departmentsRepository.findById(id);
  if (!department) {
    throw new AppError('Departman bulunamadı.', 404);
  }
  try {
    return await departmentsRepository.update(id, data);
  } catch (error) {
    if (error.code === '23505') {
      throw new AppError('Bu isimde bir departman zaten mevcut.', 400);
    }
    throw error;
  }
};

const deleteDepartment = async (id) => {
  const department = await departmentsRepository.findById(id);
  if (!department) {
    throw new AppError('Departman bulunamadı.', 404);
  }
  return await departmentsRepository.remove(id);
};

module.exports = { getDepartments, createDepartment, updateDepartment, deleteDepartment };
