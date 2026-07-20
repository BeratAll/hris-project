'use strict';

const { Router } = require('express');
const authController = require('./auth.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { loginLimiter } = require('../../middlewares/rateLimiter.middleware');
const { loginSchema, registerSchema, changePasswordSchema } = require('./auth.validation');

const router = Router();

/**
 * Auth Rotaları
 *
 * Middleware zinciri: Rate Limiter → Validation → Controller
 * Korumalı rotalar: Auth → Validation → Controller
 *
 * Route → Controller → Service → Repository akışının demonstrasyonu.
 */

/**
 * @route   POST /api/v1/auth/login
 * @desc    Kullanıcı girişi
 * @access  Public
 */
router.post(
  '/login',
  loginLimiter,
  validate(loginSchema),
  asyncHandler(authController.login)
);

/**
 * @route   POST /api/v1/auth/register
 * @desc    Yeni kullanıcı kaydı
 * @access  Public (Production'da kısıtlanabilir)
 */
router.post(
  '/register',
  validate(registerSchema),
  asyncHandler(authController.register)
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Oturumu sonlandır
 * @access  Private
 */
router.post(
  '/logout',
  authenticate,
  asyncHandler(authController.logout)
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Mevcut kullanıcı profili
 * @access  Private
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(authController.getMe)
);

/**
 * @route   PATCH /api/v1/auth/change-password
 * @desc    Şifre değiştirme
 * @access  Private
 */
router.patch(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  asyncHandler(authController.changePassword)
);

/**
 * Async controller fonksiyonlarını try/catch ile sarar.
 * Fırlatılan hatalar otomatik olarak Global Error Handler'a iletilir.
 *
 * @param {Function} fn - Async controller fonksiyonu
 * @returns {import('express').RequestHandler}
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = router;
