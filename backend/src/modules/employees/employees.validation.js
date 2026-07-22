'use strict';

const Joi = require('joi');

/**
 * Çalışan Modülü Joi Doğrulama Şemaları
 */

const createEmployeeSchema = {
  body: Joi.object({
    fullName: Joi.string()
      .trim()
      .min(3)
      .max(100)
      .pattern(/^[a-zA-ZÇçĞğİıÖöŞşÜü\s]+$/)
      .required()
      .messages({
        'string.min': 'Ad Soyad en az 3 karakter olmalıdır.',
        'string.max': 'Ad Soyad en fazla 100 karakter olabilir.',
        'string.pattern.base': 'Ad Soyad yalnızca harf içerebilir.',
        'any.required': 'Ad Soyad zorunludur.',
      }),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .lowercase()
      .trim()
      .max(255)
      .required()
      .messages({
        'string.email': 'Geçerli bir e-posta adresi giriniz.',
        'any.required': 'E-posta adresi zorunludur.',
      }),
    department: Joi.string()
      .trim()
      .valid('Bilgi Teknolojileri', 'İnsan Kaynakları', 'Şantiye Yönetimi', 'İnşaat', 'Finans', 'İş Güvenliği')
      .required()
      .messages({
        'any.only': 'Geçersiz departman.',
        'any.required': 'Departman zorunludur.',
      }),
    location: Joi.string()
      .trim()
      .valid('Merkez Ofis', 'Şantiye A', 'Şantiye B')
      .required()
      .messages({
        'any.only': 'Geçersiz lokasyon.',
        'any.required': 'Şantiye/Lokasyon zorunludur.',
      }),
  }),
};

module.exports = { createEmployeeSchema };
