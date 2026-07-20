'use strict';

const logger = require('../utils/logger.util');
const config = require('../config');

/**
 * Global Error Handler Middleware
 *
 * Uygulama genelinde fırlatılan TÜM hataları tek bir merkezde yakalar.
 * Hata tipine göre uygun HTTP durum kodu ve standart JSON formatında
 * yanıt döner.
 *
 * Dev ortamında stack trace dahil edilir, production'da gizlenir.
 *
 * Express'te 4 parametreli middleware otomatik olarak error handler
 * olarak tanınır. Bu fonksiyon app.js'de en son middleware olarak eklenir.
 */

/**
 * Bilinen hata tiplerini standart formata dönüştürür.
 * @param {Error} err - Hata objesi
 * @returns {Object} Standartlaştırılmış hata
 */
const normalizeError = (err) => {
  const normalized = {
    statusCode: err.statusCode || 500,
    status: err.status || 'error',
    message: err.message || 'Beklenmeyen bir sunucu hatası oluştu.',
    isOperational: err.isOperational || false,
  };

  // JWT Hataları
  if (err.name === 'JsonWebTokenError') {
    normalized.statusCode = 401;
    normalized.status = 'fail';
    normalized.message = 'Geçersiz token. Lütfen tekrar giriş yapın.';
    normalized.isOperational = true;
  }

  if (err.name === 'TokenExpiredError') {
    normalized.statusCode = 401;
    normalized.status = 'fail';
    normalized.message = 'Oturumunuz sona erdi. Lütfen tekrar giriş yapın.';
    normalized.isOperational = true;
  }

  // PostgreSQL Hataları
  if (err.code === '23505') {
    // Unique constraint violation
    normalized.statusCode = 409;
    normalized.status = 'fail';
    normalized.message = 'Bu kayıt zaten mevcut. Lütfen benzersiz bir değer girin.';
    normalized.isOperational = true;
  }

  if (err.code === '23503') {
    // Foreign key constraint violation
    normalized.statusCode = 400;
    normalized.status = 'fail';
    normalized.message = 'İlişkili kayıt bulunamadı. Lütfen verileri kontrol edin.';
    normalized.isOperational = true;
  }

  if (err.code === '23502') {
    // Not null violation
    normalized.statusCode = 400;
    normalized.status = 'fail';
    normalized.message = 'Zorunlu alanlar eksik. Lütfen tüm gerekli bilgileri doldurun.';
    normalized.isOperational = true;
  }

  // Doğrulama Hataları (Joi)
  if (err.validationErrors) {
    normalized.statusCode = 400;
    normalized.status = 'fail';
    normalized.isOperational = true;
  }

  return normalized;
};

/**
 * Express Global Error Handler
 * 4 parametreli middleware — Express bunu otomatik olarak error handler olarak tanır.
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
// eslint-disable-next-line no-unused-vars
const globalErrorHandler = (err, req, res, _next) => {
  const error = normalizeError(err);

  // Hata logla
  if (!error.isOperational) {
    // Beklenmeyen hatalar — tam detay logla
    logger.error('BEKLENMEDİK HATA', {
      message: err.message,
      stack: err.stack,
      method: req.method,
      path: req.originalUrl,
      ip: req.ip,
      userId: req.user ? req.user.id : 'anonymous',
    });
  } else {
    // Operasyonel hatalar — özet logla
    logger.warn('Operasyonel hata', {
      statusCode: error.statusCode,
      message: error.message,
      method: req.method,
      path: req.originalUrl,
    });
  }

  // Yanıt objesi
  const response = {
    success: false,
    statusCode: error.statusCode,
    status: error.status,
    message: error.message,
  };

  // Doğrulama hataları varsa ekle
  if (err.validationErrors) {
    response.errors = err.validationErrors;
  }

  // Dev ortamında stack trace ekle
  if (config.env === 'development') {
    response.stack = err.stack;
    response.originalError = err.message;
  }

  res.status(error.statusCode).json(response);
};

module.exports = globalErrorHandler;
