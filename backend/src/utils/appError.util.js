'use strict';

/**
 * Özel Uygulama Hata Sınıfı
 *
 * Operasyonel hatalar (beklenen) ile programlama hataları (beklenmeyen)
 * arasında ayrım yapar. Global Error Handler bu ayrıma göre davranır.
 *
 * @example
 * throw new AppError('Kullanıcı bulunamadı', 404);
 * throw new AppError('Bu işlem için yetkiniz yok', 403);
 */
class AppError extends Error {
  /**
   * @param {string} message - Kullanıcıya gösterilecek hata mesajı
   * @param {number} statusCode - HTTP durum kodu
   * @param {boolean} [isOperational=true] - Operasyonel hata mı? (true: beklenen, false: programlama hatası)
   */
  constructor(message, statusCode, isOperational = true) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;

    // Stack trace'den constructor çağrısını kaldır
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
