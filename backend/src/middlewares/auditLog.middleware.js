'use strict';

const logger = require('../utils/logger.util');

/**
 * Denetim İzi (Audit Log) Middleware — KVKK Uyumlu
 *
 * Veri değiştiren (POST, PUT, PATCH, DELETE) tüm isteklerde otomatik olarak
 * "Kim, Ne zaman, Ne yaptı, Hangi kaynağı, Nereden?" bilgisini kaydeder.
 *
 * İki kullanım modu:
 * 1. Otomatik mod (middleware olarak): Route'a eklenir, tüm state-changing
 *    istekleri otomatik loglar.
 * 2. Manuel mod (fonksiyon olarak): Service katmanında, iş kuralına bağlı
 *    özel audit log kaydı oluşturmak için çağrılır.
 *
 * KVKK Madde 12: Kişisel verilerin hukuka aykırı olarak işlenmesini önlemek,
 * verilere hukuka aykırı olarak erişilmesini önlemek ve verilerin muhafazasını
 * sağlamak amacıyla her türlü teknik ve idari tedbirin alınması gerekir.
 */

// Audit log kaydedilmeyecek yollar (sağlık kontrol vb.)
const EXCLUDED_PATHS = ['/health', '/api/v1/health'];

// Audit log kaydedilecek HTTP metotları
const AUDITABLE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

/**
 * Otomatik audit log middleware.
 * Response tamamlandığında log kaydı oluşturur.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const auditLog = (req, res, next) => {
  // GET isteklerini ve dışlanan yolları atla
  if (!AUDITABLE_METHODS.includes(req.method) || EXCLUDED_PATHS.includes(req.path)) {
    return next();
  }

  // Response tamamlandığında logla
  const originalEnd = res.end;

  res.end = function auditEnd(...args) {
    // Başarılı istekleri logla (4xx ve 5xx hariç)
    if (res.statusCode < 400) {
      const auditData = {
        userId: req.user ? req.user.id : 'anonymous',
        action: mapMethodToAction(req.method),
        resource: extractResource(req.originalUrl),
        resourceId: req.params.id || null,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent') || 'unknown',
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
      };

      logger.audit(auditData);
    }

    originalEnd.apply(res, args);
  };

  next();
};

/**
 * Manuel audit log kaydı oluşturur.
 * Service katmanından çağrılır — detaylı veri değişikliği kaydı için.
 *
 * @param {Object} params
 * @param {string} params.userId - İşlemi yapan kullanıcı ID
 * @param {string} params.action - Yapılan eylem açıklaması
 * @param {string} params.resource - Etkilenen kaynak
 * @param {string} [params.resourceId] - Etkilenen kaydın ID'si
 * @param {Object} [params.previousData] - Değişiklik öncesi veri
 * @param {Object} [params.newData] - Değişiklik sonrası veri
 * @param {string} [params.ipAddress] - İstemci IP adresi
 *
 * @example
 * // auth.service.js içinde
 * createAuditEntry({
 *   userId: user.id,
 *   action: 'LOGIN_SUCCESS',
 *   resource: 'auth',
 *   ipAddress: req.ip,
 * });
 */
const createAuditEntry = (params) => {
  logger.audit({
    userId: params.userId,
    action: params.action,
    resource: params.resource,
    resourceId: params.resourceId || null,
    previousData: params.previousData || null,
    newData: params.newData || null,
    ipAddress: params.ipAddress || null,
    userAgent: params.userAgent || null,
  });
};

/**
 * HTTP metodunu insan okunabilir eylem adına çevirir.
 * @param {string} method - HTTP metodu
 * @returns {string} Eylem adı
 */
const mapMethodToAction = (method) => {
  const actionMap = {
    POST: 'CREATE',
    PUT: 'UPDATE',
    PATCH: 'UPDATE',
    DELETE: 'DELETE',
  };
  return actionMap[method] || 'UNKNOWN';
};

/**
 * URL yolundan kaynak adını çıkarır.
 * /api/v1/employees/123 -> employees
 * @param {string} url - Request URL
 * @returns {string} Kaynak adı
 */
const extractResource = (url) => {
  const segments = url.split('/').filter(Boolean);
  // /api/v1/resource/... formatını bekler
  return segments[2] || segments[0] || 'unknown';
};

module.exports = { auditLog, createAuditEntry };
