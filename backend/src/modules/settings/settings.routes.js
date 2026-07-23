'use strict';

const { Router } = require('express');
const settingsController = require('./settings.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/rbac.middleware');

const router = Router();

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Tüm rotalar kimlik doğrulaması gerektirir
router.use(authenticate);

/**
 * @route   GET /api/v1/settings
 * @desc    Tüm ayarları getirir
 * @access  Private
 */
router.get('/', asyncHandler(settingsController.getSettings));

/**
 * @route   PUT /api/v1/settings/:key
 * @desc    Belirtilen ayarı günceller
 * @access  Private (super_admin, hr_manager)
 */
router.put(
  '/:key',
  authorize('super_admin', 'hr_manager'),
  asyncHandler(settingsController.updateSetting)
);

module.exports = router;
