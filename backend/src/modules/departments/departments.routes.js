'use strict';

const { Router } = require('express');
const departmentsController = require('./departments.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/rbac.middleware');

const router = Router();

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Tüm rotalar kimlik doğrulaması gerektirir
router.use(authenticate);

/**
 * @route   GET /api/v1/departments
 * @desc    Tüm departmanları listeler
 * @access  Private
 */
router.get('/', asyncHandler(departmentsController.getDepartments));

/**
 * @route   POST /api/v1/departments
 * @desc    Yeni departman oluşturur
 * @access  Private (super_admin, hr_manager)
 */
router.post(
  '/',
  authorize('super_admin', 'hr_manager'),
  asyncHandler(departmentsController.createDepartment)
);

/**
 * @route   PUT /api/v1/departments/:id
 * @desc    Departmanı günceller
 * @access  Private (super_admin, hr_manager)
 */
router.put(
  '/:id',
  authorize('super_admin', 'hr_manager'),
  asyncHandler(departmentsController.updateDepartment)
);

/**
 * @route   DELETE /api/v1/departments/:id
 * @desc    Departmanı siler
 * @access  Private (super_admin, hr_manager)
 */
router.delete(
  '/:id',
  authorize('super_admin', 'hr_manager'),
  asyncHandler(departmentsController.deleteDepartment)
);

module.exports = router;
