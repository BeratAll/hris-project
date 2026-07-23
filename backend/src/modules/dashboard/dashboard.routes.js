'use strict';

const { Router } = require('express');
const dashboardController = require('./dashboard.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

const router = Router();

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Tüm rotalar kimlik doğrulaması gerektirir
router.use(authenticate);

/**
 * @route   GET /api/v1/dashboard/stats
 * @desc    Dashboard istatistiklerini getirir (Rol bazlı veri izolasyonu ile)
 * @access  Private
 */
router.get('/stats', asyncHandler(dashboardController.getDashboardStats));

module.exports = router;
