'use strict';

const AppError = require('../utils/appError.util');

/**
 * Joi Şema Doğrulama Middleware Factory
 *
 * Joi şeması alır ve gelen isteğin body, params veya query değerlerini
 * doğrular. XSS ve injection saldırılarına karşı koruma sağlar.
 *
 * Hata durumunda standart AppError fırlatır ve Global Error Handler
 * tüm doğrulama hatalarını kullanıcı dostu formatta döner.
 *
 * @param {Object} schemas - Doğrulanacak alanlar ve Joi şemaları
 * @param {import('joi').Schema} [schemas.body] - Request body şeması
 * @param {import('joi').Schema} [schemas.params] - URL parametreleri şeması
 * @param {import('joi').Schema} [schemas.query] - Query string şeması
 * @returns {import('express').RequestHandler}
 *
 * @example
 * // auth.validation.js
 * const loginSchema = { body: Joi.object({ email: Joi.string().email().required() }) };
 *
 * // auth.routes.js
 * router.post('/login', validate(loginSchema), controller.login);
 */
const validate = (schemas) => {
  return (req, _res, next) => {
    const validationErrors = [];

    // Joi doğrulama seçenekleri
    const options = {
      abortEarly: false,         // Tüm hataları topla (ilk hatada durma)
      allowUnknown: false,       // Bilinmeyen alanları reddet
      stripUnknown: true,        // Bilinmeyen alanları sessizce kaldır
      errors: {
        wrap: { label: false },  // Hata mesajlarında alan adını tırnak içine alma
      },
    };

    // Her şema alanını (body, params, query) doğrula
    for (const [source, schema] of Object.entries(schemas)) {
      if (!schema) {
        continue;
      }

      const { error, value } = schema.validate(req[source], options);

      if (error) {
        const errors = error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
          type: detail.type,
        }));

        validationErrors.push(...errors);
      } else {
        // Doğrulanmış ve temizlenmiş veriyi request'e yaz
        req[source] = value;
      }
    }

    if (validationErrors.length > 0) {
      const err = new AppError('Doğrulama hatası. Lütfen girdi alanlarını kontrol edin.', 400);
      err.validationErrors = validationErrors;
      return next(err);
    }

    next();
  };
};

module.exports = { validate };
