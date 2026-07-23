'use strict';

const { Router } = require('express');
const payrollController = require('./payroll.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/rbac.middleware');
const { createPayrollSchema } = require('./payroll.validation');

const router = Router();

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Tüm rotalar kimlik doğrulaması gerektirir
router.use(authenticate);

/**
 * @route   GET /api/v1/payroll
 * @desc    Maaş bordrolarını listeler (Çalışan kendininkini, yönetici/finans tümünü görür)
 * @access  Private
 */
router.get('/', asyncHandler(payrollController.getPayrolls));

/**
 * @route   POST /api/v1/payroll
 * @desc    Yeni bordro oluşturur
 * @access  Private (super_admin, hr_manager, finance, general_manager)
 */
router.post(
  '/',
  authorize('super_admin', 'hr_manager', 'finance', 'general_manager'),
  validate(createPayrollSchema),
  asyncHandler(payrollController.createPayroll)
);

module.exports = router;
