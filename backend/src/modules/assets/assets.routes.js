'use strict';

const { Router } = require('express');
const assetsController = require('./assets.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/rbac.middleware');
const { createAssetSchema, updateAssetSchema } = require('./assets.validation');

const router = Router();

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Tüm rotalar kimlik doğrulaması gerektirir
router.use(authenticate);

/**
 * @route   GET /api/v1/assets
 * @desc    Demirbaşları listeler (Çalışanlar sadece kendilerindekileri görür)
 * @access  Private
 */
router.get('/', asyncHandler(assetsController.getAssets));

/**
 * @route   POST /api/v1/assets
 * @desc    Yeni çalışana ekipman zimmetler
 * @access  Private (super_admin, hr_manager)
 */
router.post(
  '/',
  authorize('super_admin', 'hr_manager'),
  validate(createAssetSchema),
  asyncHandler(assetsController.createAsset)
);

/**
 * @route   PUT /api/v1/assets/:id
 * @desc    Zimmet kaydını günceller
 * @access  Private (super_admin, hr_manager)
 */
router.put(
  '/:id',
  authorize('super_admin', 'hr_manager'),
  validate(updateAssetSchema),
  asyncHandler(assetsController.updateAsset)
);

/**
 * @route   PUT /api/v1/assets/:id/return
 * @desc    Demirbaşı iade alır
 * @access  Private (super_admin, hr_manager)
 */
router.put(
  '/:id/return',
  authorize('super_admin', 'hr_manager'),
  asyncHandler(assetsController.returnAsset)
);

module.exports = router;
