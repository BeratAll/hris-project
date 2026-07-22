'use strict';

const { Router } = require('express');
const employeesController = require('./employees.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/rbac.middleware');
const { createEmployeeSchema } = require('./employees.validation');

const router = Router();

// Express async hatalarını yakalayıcı
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Tüm rotalar kimlik doğrulaması gerektirir
router.use(authenticate);

/**
 * @route   GET /api/v1/employees
 * @desc    Çalışan listesini getirir
 * @access  Private (super_admin, hr_manager, hr_specialist, general_manager, site_chief)
 */
router.get(
  '/',
  authorize('super_admin', 'hr_manager', 'hr_specialist', 'general_manager', 'site_chief'),
  asyncHandler(employeesController.getEmployees)
);

/**
 * @route   POST /api/v1/employees
 * @desc    Yeni çalışan oluşturur
 * @access  Private (super_admin, hr_manager, hr_specialist)
 */
router.post(
  '/',
  authorize('super_admin', 'hr_manager', 'hr_specialist'),
  validate(createEmployeeSchema),
  asyncHandler(employeesController.createEmployee)
);

/**
 * @route   PUT /api/v1/employees/:id
 * @desc    Çalışan bilgilerini günceller
 * @access  Private (super_admin, hr_manager, hr_specialist)
 */
router.put(
  '/:id',
  authorize('super_admin', 'hr_manager', 'hr_specialist'),
  validate(createEmployeeSchema), // Güncelleme için de aynı şema geçerli
  asyncHandler(employeesController.updateEmployee)
);

/**
 * @route   DELETE /api/v1/employees/:id
 * @desc    Çalışanı siler (soft delete)
 * @access  Private (super_admin, hr_manager)
 */
router.delete(
  '/:id',
  authorize('super_admin', 'hr_manager'),
  asyncHandler(employeesController.deleteEmployee)
);

module.exports = router;
