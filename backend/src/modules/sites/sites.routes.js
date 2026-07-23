'use strict';

const { Router } = require('express');
const sitesController = require('./sites.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/rbac.middleware');

const router = Router();

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Tüm rotalar kimlik doğrulaması gerektirir
router.use(authenticate);

/**
 * @route   GET /api/v1/sites
 * @desc    Tüm şantiyeleri listeler
 * @access  Private
 */
router.get('/', asyncHandler(sitesController.getSites));

/**
 * @route   POST /api/v1/sites
 * @desc    Yeni şantiye oluşturur
 * @access  Private (super_admin, hr_manager)
 */
router.post(
  '/',
  authorize('super_admin', 'hr_manager'),
  asyncHandler(sitesController.createSite)
);

/**
 * @route   PUT /api/v1/sites/:id
 * @desc    Şantiyeyi günceller
 * @access  Private (super_admin, hr_manager)
 */
router.put(
  '/:id',
  authorize('super_admin', 'hr_manager'),
  asyncHandler(sitesController.updateSite)
);

/**
 * @route   DELETE /api/v1/sites/:id
 * @desc    Şantiyeyi siler
 * @access  Private (super_admin, hr_manager)
 */
router.delete(
  '/:id',
  authorize('super_admin', 'hr_manager'),
  asyncHandler(sitesController.deleteSite)
);

module.exports = router;
