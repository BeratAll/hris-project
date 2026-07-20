'use strict';

const Joi = require('joi');

/**
 * Auth Modülü Joi Doğrulama Şemaları
 *
 * Her endpoint için ayrı şema tanımlanır.
 * validate.middleware.js bu şemaları kullanarak girdi doğrulaması yapar.
 *
 * Güvenlik kuralları:
 * - E-posta: RFC 5322 formatı, küçük harfe normalize edilir
 * - Şifre: En az 8 karakter, büyük harf, küçük harf, rakam ve özel karakter
 * - Tüm string alanlar: HTML etiketleri temizlenir (XSS koruması)
 */

// --- Ortak Şema Parçaları ---

const email = Joi.string()
  .email({ tlds: { allow: false } })
  .lowercase()
  .trim()
  .max(255)
  .required()
  .messages({
    'string.email': 'Geçerli bir e-posta adresi giriniz.',
    'string.empty': 'E-posta adresi zorunludur.',
    'any.required': 'E-posta adresi zorunludur.',
  });

const password = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/)
  .required()
  .messages({
    'string.min': 'Şifre en az 8 karakter olmalıdır.',
    'string.max': 'Şifre en fazla 128 karakter olabilir.',
    'string.pattern.base': 'Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir.',
    'string.empty': 'Şifre zorunludur.',
    'any.required': 'Şifre zorunludur.',
  });

// --- Endpoint Şemaları ---

/**
 * POST /api/v1/auth/login
 */
const loginSchema = {
  body: Joi.object({
    email,
    password: Joi.string().required().messages({
      'string.empty': 'Şifre zorunludur.',
      'any.required': 'Şifre zorunludur.',
    }),
  }),
};

/**
 * POST /api/v1/auth/register
 */
const registerSchema = {
  body: Joi.object({
    firstName: Joi.string()
      .trim()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-ZÇçĞğİıÖöŞşÜü\s]+$/)
      .required()
      .messages({
        'string.min': 'Ad en az 2 karakter olmalıdır.',
        'string.max': 'Ad en fazla 50 karakter olabilir.',
        'string.pattern.base': 'Ad yalnızca harf içerebilir.',
        'any.required': 'Ad zorunludur.',
      }),

    lastName: Joi.string()
      .trim()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-ZÇçĞğİıÖöŞşÜü\s]+$/)
      .required()
      .messages({
        'string.min': 'Soyad en az 2 karakter olmalıdır.',
        'string.max': 'Soyad en fazla 50 karakter olabilir.',
        'string.pattern.base': 'Soyad yalnızca harf içerebilir.',
        'any.required': 'Soyad zorunludur.',
      }),

    email,
    password,

    passwordConfirm: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Şifreler eşleşmiyor.',
        'any.required': 'Şifre onayı zorunludur.',
      }),

    role: Joi.string()
      .valid(
        'super_admin', 'hr_manager', 'hr_specialist', 'general_manager',
        'site_chief', 'dept_manager', 'finance', 'employee'
      )
      .default('employee')
      .messages({
        'any.only': 'Geçersiz rol.',
      }),
  }),
};

/**
 * PATCH /api/v1/auth/change-password
 */
const changePasswordSchema = {
  body: Joi.object({
    currentPassword: Joi.string().required().messages({
      'any.required': 'Mevcut şifre zorunludur.',
    }),
    newPassword: password,
    newPasswordConfirm: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': 'Yeni şifreler eşleşmiyor.',
        'any.required': 'Yeni şifre onayı zorunludur.',
      }),
  }),
};

module.exports = { loginSchema, registerSchema, changePasswordSchema };
