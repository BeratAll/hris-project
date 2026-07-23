'use strict';

const { Router } = require('express');
const advancesController = require('./advances.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/rbac.middleware');
const { createAdvanceSchema, rejectAdvanceSchema } = require('./advances.validation');

const router = Router();

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Tüm rotalar kimlik doğrulaması gerektirir
router.use(authenticate);

/**
 * @route   GET /api/v1/advances
 * @desc    Avans taleplerini listeler (Rol bazlı veri izolasyonu ile)
 * @access  Private
 */
router.get('/', asyncHandler(advancesController.getAdvances));

/**
 * @route   POST /api/v1/advances
 * @desc    Yeni avans talebi oluşturur (Sadece çalışanlar ve admin)
 * @access  Private (employee, super_admin)
 */
router.post(
  '/',
  authorize('employee', 'super_admin'),
  validate(createAdvanceSchema),
  asyncHandler(advancesController.createAdvance)
);

/**
 * @route   PUT /api/v1/advances/:id/approve
 * @desc    Avans talebini onay zincirinde bir sonraki aşamaya taşır
 * @access  Private
 */
router.put('/:id/approve', asyncHandler(advancesController.approveAdvance));

/**
 * @route   PUT /api/v1/advances/:id/reject
 * @desc    Avans talebini reddeder
 * @access  Private
 */
router.put(
  '/:id/reject',
  validate(rejectAdvanceSchema),
  asyncHandler(advancesController.rejectAdvance)
);

module.exports = router;
