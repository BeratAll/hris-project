'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config');
const AppError = require('../utils/appError.util');

/**
 * JWT Kimlik Doğrulama Middleware
 *
 * httpOnly cookie'den JWT token'ı okur, doğrular ve çözülmüş
 * kullanıcı bilgisini req.user'a atar. Korumalı tüm rotaların
 * önüne eklenir.
 *
 * Token kaynağı önceliği:
 * 1. httpOnly cookie (access_token)
 * 2. Authorization header (Bearer token) — API client'lar için fallback
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const authenticate = (req, _res, next) => {
  try {
    // 1. Token'ı al: önce cookie, sonra Authorization header
    let token = null;

    if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Oturum açmanız gerekiyor. Lütfen giriş yapın.', 401);
    }

    // 2. Token'ı doğrula ve çöz
    const decoded = jwt.verify(token, config.jwt.secret);

    // 3. Kullanıcı bilgisini request'e ekle
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      departmentId: decoded.departmentId || null,
      siteId: decoded.siteId || null,
    };

    next();
  } catch (err) {
    if (err instanceof AppError) {
      return next(err);
    }

    if (err.name === 'JsonWebTokenError') {
      return next(new AppError('Geçersiz token. Lütfen tekrar giriş yapın.', 401));
    }

    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Oturumunuz sona erdi. Lütfen tekrar giriş yapın.', 401));
    }

    return next(new AppError('Kimlik doğrulama hatası.', 401));
  }
};

module.exports = { authenticate };
