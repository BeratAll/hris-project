'use strict';

/**
 * Standart API Yanıt Formatlayıcı
 *
 * Tüm API yanıtlarının tutarlı bir JSON formatında dönmesini sağlar.
 * Controller katmanı bu fonksiyonları kullanır.
 *
 * Başarılı yanıt formatı:
 * {
 *   success: true,
 *   statusCode: 200,
 *   message: "İşlem başarılı",
 *   data: { ... },
 *   meta: { page: 1, limit: 20, total: 150 }
 * }
 *
 * Hata yanıt formatı:
 * {
 *   success: false,
 *   statusCode: 400,
 *   message: "Doğrulama hatası",
 *   errors: [{ field: "email", message: "Geçerli bir e-posta girin" }]
 * }
 */

/**
 * Başarılı yanıt döner.
 * @param {import('express').Response} res
 * @param {Object} options
 * @param {number} [options.statusCode=200] - HTTP durum kodu
 * @param {string} [options.message='İşlem başarılı'] - Yanıt mesajı
 * @param {*} [options.data=null] - Yanıt verisi
 * @param {Object} [options.meta=null] - Sayfalama, toplam kayıt vb. meta bilgi
 */
const success = (res, { statusCode = 200, message = 'İşlem başarılı', data = null, meta = null } = {}) => {
  const response = {
    success: true,
    statusCode,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  if (meta !== null) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Hata yanıtı döner.
 * @param {import('express').Response} res
 * @param {Object} options
 * @param {number} [options.statusCode=500] - HTTP durum kodu
 * @param {string} [options.message='Sunucu hatası'] - Hata mesajı
 * @param {Array} [options.errors=null] - Detaylı hata listesi (validasyon hataları vb.)
 */
const error = (res, { statusCode = 500, message = 'Sunucu hatası', errors: errorDetails = null } = {}) => {
  const response = {
    success: false,
    statusCode,
    message,
  };

  if (errorDetails !== null) {
    response.errors = errorDetails;
  }

  return res.status(statusCode).json(response);
};

module.exports = { success, error };
