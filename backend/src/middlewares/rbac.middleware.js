'use strict';

const AppError = require('../utils/appError.util');
const { ROLES, PERMISSIONS, ROLE_HIERARCHY } = require('../constants/roles.constant');

/**
 * Rol Bazlı Erişim Kontrolü (RBAC) Middleware
 *
 * İki farklı yetkilendirme stratejisi sunar:
 *
 * 1. authorize(...roles) — Basit rol kontrolü
 *    Belirtilen rollerden birine sahip olan kullanıcıları geçirir.
 *    Kullanım: router.get('/users', authorize(ROLES.HR_MANAGER, ROLES.SUPER_ADMIN), handler)
 *
 * 2. authorizeResource(resource, action) — Granüler kaynak bazlı kontrol
 *    Yetki matrisine (PERMISSIONS) bakarak karar verir.
 *    Kullanım: router.post('/employees', authorizeResource('employees', 'create'), handler)
 */

/**
 * Basit rol bazlı yetkilendirme.
 * Süper Admin her zaman geçer (bypass).
 *
 * @param {...string} allowedRoles - İzin verilen rol listesi
 * @returns {import('express').RequestHandler}
 *
 * @example
 * // Sadece İK Müdürü ve Süper Admin erişebilir
 * router.delete('/employee/:id', authorize(ROLES.HR_MANAGER), controller.delete);
 */
const authorize = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.user || !req.user.role) {
      return next(new AppError('Yetkilendirme için önce kimlik doğrulaması gerekli.', 401));
    }

    const userRole = req.user.role;

    // Süper Admin her zaman geçer
    if (userRole === ROLES.SUPER_ADMIN) {
      return next();
    }

    if (!allowedRoles.includes(userRole)) {
      return next(
        new AppError('Bu işlemi gerçekleştirmek için yetkiniz bulunmamaktadır.', 403)
      );
    }

    next();
  };
};

/**
 * Kaynak bazlı granüler yetkilendirme.
 * PERMISSIONS matrisine bakarak kontrol yapar.
 * Süper Admin her zaman geçer (bypass).
 *
 * @param {string} resource - Kaynak adı (employees, leaves, payroll vb.)
 * @param {string} action - Eylem (create, read, update, delete, approve, export)
 * @returns {import('express').RequestHandler}
 *
 * @example
 * // Bordro onaylama — sadece yetki matrisindeki roller
 * router.patch('/payroll/:id/approve', authorizeResource('payroll', 'approve'), controller.approve);
 */
const authorizeResource = (resource, action) => {
  return (req, _res, next) => {
    if (!req.user || !req.user.role) {
      return next(new AppError('Yetkilendirme için önce kimlik doğrulaması gerekli.', 401));
    }

    const userRole = req.user.role;

    // Süper Admin her zaman geçer
    if (userRole === ROLES.SUPER_ADMIN) {
      return next();
    }

    // Yetki matrisinde kaynak ve eylem kontrolü
    const resourcePermissions = PERMISSIONS[resource];
    if (!resourcePermissions) {
      return next(new AppError(`Bilinmeyen kaynak: ${resource}`, 500));
    }

    const allowedRoles = resourcePermissions[action];
    if (!allowedRoles) {
      return next(new AppError(`Bilinmeyen eylem: ${action} (kaynak: ${resource})`, 500));
    }

    if (!allowedRoles.includes(userRole)) {
      return next(
        new AppError(
          `'${resource}' kaynağı üzerinde '${action}' işlemi için yetkiniz bulunmamaktadır.`,
          403
        )
      );
    }

    next();
  };
};

/**
 * Hiyerarşi bazlı yetkilendirme.
 * Kullanıcının rol seviyesinin, hedef rol seviyesinden yüksek olmasını kontrol eder.
 * Örnek: Departman Müdürü, sadece çalışan rolündeki kişilerin verilerini değiştirebilir.
 *
 * @param {string} targetRole - Hedef kullanıcının rolü
 * @returns {boolean}
 */
const hasHigherAuthority = (userRole, targetRole) => {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const targetLevel = ROLE_HIERARCHY[targetRole] || 0;
  return userLevel > targetLevel;
};

module.exports = { authorize, authorizeResource, hasHigherAuthority };
