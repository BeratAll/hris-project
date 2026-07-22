'use strict';

const { Router } = require('express');
const leavesController = require('./leaves.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { createLeaveSchema } = require('./leaves.validation');

const router = Router();

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Tüm rotalar kimlik doğrulaması gerektirir
router.use(authenticate);

/**
 * @route   GET /api/v1/leaves
 * @desc    İzin taleplerini listeler (Çalışan kendi izinlerini, yönetici tüm izinleri görür)
 * @access  Private
 */
router.get('/', asyncHandler(leavesController.getLeaves));

/**
 * @route   POST /api/v1/leaves
 * @desc    Yeni izin talebi oluşturur
 * @access  Private
 */
router.post('/', validate(createLeaveSchema), asyncHandler(leavesController.createLeave));

module.exports = router;
