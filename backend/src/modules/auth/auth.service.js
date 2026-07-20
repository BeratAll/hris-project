'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config');
const AppError = require('../../utils/appError.util');
const authRepository = require('./auth.repository');
const { createAuditEntry } = require('../../middlewares/auditLog.middleware');

/**
 * Auth Service — İş Kuralları Katmanı
 *
 * Tüm kimlik doğrulama iş mantığı burada yönetilir.
 * Repository'den veri alır, iş kurallarını uygular, sonucu döner.
 * HTTP (req/res) ile ilgilenmez — sadece data in, data out.
 */

const SALT_ROUNDS = 12;

/**
 * Kullanıcı girişi yapar.
 *
 * İş kuralları:
 * 1. E-posta ile kullanıcı bulunmalı
 * 2. Hesap aktif olmalı
 * 3. Şifre doğru olmalı
 * 4. Son giriş zamanı güncellenmeli
 * 5. JWT token üretilmeli
 *
 * @param {Object} credentials
 * @param {string} credentials.email - E-posta adresi
 * @param {string} credentials.password - Düz metin şifre
 * @param {string} [ipAddress] - İstemci IP adresi (audit log için)
 * @returns {Promise<{user: Object, token: string}>}
 * @throws {AppError} Kimlik doğrulama başarısızsa
 */
const login = async ({ email, password }, ipAddress = null) => {
  // 1. Kullanıcıyı bul
  const user = await authRepository.findByEmail(email);

  if (!user) {
    throw new AppError('E-posta veya şifre hatalı.', 401);
  }

  // 2. Hesap aktiflik kontrolü
  if (!user.is_active) {
    throw new AppError('Hesabınız devre dışı bırakılmıştır. İK departmanı ile iletişime geçin.', 403);
  }

  // 3. Şifre doğrulama
  const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordCorrect) {
    throw new AppError('E-posta veya şifre hatalı.', 401);
  }

  // 4. Son giriş zamanını güncelle
  await authRepository.updateLastLogin(user.id);

  // 5. JWT token üret
  const token = generateToken(user);

  // 6. Audit log
  createAuditEntry({
    userId: user.id,
    action: 'LOGIN_SUCCESS',
    resource: 'auth',
    ipAddress,
  });

  // Şifre hash'ini yanıttan çıkar
  const { password_hash: _, ...safeUser } = user;

  return { user: safeUser, token };
};

/**
 * Yeni kullanıcı kaydı oluşturur.
 *
 * İş kuralları:
 * 1. E-posta benzersiz olmalı
 * 2. Şifre hash'lenmeli
 * 3. Audit log kaydı oluşturulmalı
 *
 * @param {Object} userData
 * @param {string} userData.firstName - Ad
 * @param {string} userData.lastName - Soyad
 * @param {string} userData.email - E-posta
 * @param {string} userData.password - Düz metin şifre
 * @param {string} [userData.role='employee'] - Rol
 * @param {string} [ipAddress] - İstemci IP adresi
 * @returns {Promise<{user: Object, token: string}>}
 * @throws {AppError} E-posta zaten kullanılıyorsa
 */
const register = async ({ firstName, lastName, email, password, role }, ipAddress = null) => {
  // 1. E-posta benzersizlik kontrolü
  const existingUser = await authRepository.findByEmail(email);

  if (existingUser) {
    throw new AppError('Bu e-posta adresi zaten kullanılmaktadır.', 409);
  }

  // 2. Şifreyi hash'le
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // 3. Kullanıcıyı oluştur
  const user = await authRepository.create({
    firstName,
    lastName,
    email,
    passwordHash,
    role,
  });

  // 4. JWT token üret
  const token = generateToken(user);

  // 5. Audit log
  createAuditEntry({
    userId: user.id,
    action: 'USER_REGISTERED',
    resource: 'auth',
    newData: { email: user.email, role: user.role },
    ipAddress,
  });

  return { user, token };
};

/**
 * Mevcut kullanıcı profilini getirir.
 *
 * @param {string} userId - Kullanıcı UUID
 * @returns {Promise<Object>} Kullanıcı profil bilgileri
 * @throws {AppError} Kullanıcı bulunamazsa
 */
const getProfile = async (userId) => {
  const user = await authRepository.findById(userId);

  if (!user) {
    throw new AppError('Kullanıcı bulunamadı.', 404);
  }

  return user;
};

/**
 * Kullanıcı şifresini değiştirir.
 *
 * İş kuralları:
 * 1. Mevcut şifre doğru olmalı
 * 2. Yeni şifre hash'lenmeli
 *
 * @param {string} userId - Kullanıcı UUID
 * @param {string} currentPassword - Mevcut şifre
 * @param {string} newPassword - Yeni şifre
 * @param {string} [ipAddress] - İstemci IP adresi
 * @returns {Promise<void>}
 * @throws {AppError} Mevcut şifre yanlışsa
 */
const changePassword = async (userId, currentPassword, newPassword, ipAddress = null) => {
  const user = await authRepository.findByEmail(
    (await authRepository.findById(userId)).email
  );

  if (!user) {
    throw new AppError('Kullanıcı bulunamadı.', 404);
  }

  // Mevcut şifre kontrolü
  const isCorrect = await bcrypt.compare(currentPassword, user.password_hash);

  if (!isCorrect) {
    throw new AppError('Mevcut şifreniz hatalı.', 401);
  }

  // Yeni şifreyi hash'le ve güncelle
  const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await authRepository.updatePassword(userId, newHash);

  // Audit log
  createAuditEntry({
    userId,
    action: 'PASSWORD_CHANGED',
    resource: 'auth',
    ipAddress,
  });
};

// --- Yardımcı Fonksiyonlar ---

/**
 * Kullanıcı bilgilerini içeren JWT token üretir.
 *
 * @param {Object} user - Kullanıcı objesi
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      departmentId: user.department_id || null,
      siteId: user.site_id || null,
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

module.exports = { login, register, getProfile, changePassword };
