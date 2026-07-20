'use strict';

const authService = require('./auth.service');
const apiResponse = require('../../utils/apiResponse.util');
const config = require('../../config');

/**
 * Auth Controller — HTTP Katmanı
 *
 * Sadece HTTP request/response yönetimi yapar.
 * İş kurallarını service katmanına delege eder.
 * Her metot try/catch yerine asyncHandler ile sarılır (routes.js'de).
 */

/**
 * POST /api/v1/auth/login
 * Kullanıcı girişi yapar ve JWT token'ı httpOnly cookie olarak ayarlar.
 */
const login = async (req, res) => {
  const { email, password } = req.body;
  const ipAddress = req.ip;

  const { user, token } = await authService.login({ email, password }, ipAddress);

  // JWT token'ı httpOnly cookie olarak ayarla
  setCookieToken(res, token);

  return apiResponse.success(res, {
    statusCode: 200,
    message: 'Giriş başarılı.',
    data: { user },
  });
};

/**
 * POST /api/v1/auth/register
 * Yeni kullanıcı kaydı oluşturur.
 */
const register = async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;
  const ipAddress = req.ip;

  const { user, token } = await authService.register(
    { firstName, lastName, email, password, role },
    ipAddress
  );

  // JWT token'ı httpOnly cookie olarak ayarla
  setCookieToken(res, token);

  return apiResponse.success(res, {
    statusCode: 201,
    message: 'Kullanıcı kaydı başarıyla oluşturuldu.',
    data: { user },
  });
};

/**
 * POST /api/v1/auth/logout
 * Cookie'yi temizleyerek oturumu sonlandırır.
 */
const logout = async (_req, res) => {
  // Cookie'yi sıfırla
  res.cookie('access_token', '', {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
    expires: new Date(0),
  });

  return apiResponse.success(res, {
    statusCode: 200,
    message: 'Çıkış başarılı.',
  });
};

/**
 * GET /api/v1/auth/me
 * Oturum açmış kullanıcının profil bilgilerini döner.
 */
const getMe = async (req, res) => {
  const user = await authService.getProfile(req.user.id);

  return apiResponse.success(res, {
    statusCode: 200,
    message: 'Profil bilgileri getirildi.',
    data: { user },
  });
};

/**
 * PATCH /api/v1/auth/change-password
 * Kullanıcı şifresini değiştirir.
 */
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const ipAddress = req.ip;

  await authService.changePassword(req.user.id, currentPassword, newPassword, ipAddress);

  // Güvenlik: Şifre değiştikten sonra cookie'yi sıfırla
  res.cookie('access_token', '', {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
    expires: new Date(0),
  });

  return apiResponse.success(res, {
    statusCode: 200,
    message: 'Şifreniz başarıyla değiştirildi. Lütfen tekrar giriş yapın.',
  });
};

// --- Yardımcı Fonksiyonlar ---

/**
 * JWT token'ı httpOnly cookie olarak ayarlar.
 * @param {import('express').Response} res
 * @param {string} token - JWT token
 */
const setCookieToken = (res, token) => {
  const cookieOptions = {
    httpOnly: true,                            // JavaScript erişimini engelle (XSS koruması)
    secure: config.env === 'production',       // Production'da sadece HTTPS
    sameSite: 'strict',                        // CSRF koruması
    maxAge: config.jwt.cookieExpiresIn * 24 * 60 * 60 * 1000, // Gün → milisaniye
    path: '/',
  };

  res.cookie('access_token', token, cookieOptions);
};

module.exports = { login, register, logout, getMe, changePassword };
