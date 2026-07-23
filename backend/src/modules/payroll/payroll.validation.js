'use strict';

const Joi = require('joi');

/**
 * Bordro Modülü Joi Doğrulama Şemaları
 */

const createPayrollSchema = {
  body: Joi.object({
    employeeId: Joi.string()
      .guid({ version: 'uuidv4' })
      .required()
      .messages({
        'string.guid': 'Geçerli bir çalışan ID (UUID) belirtiniz.',
        'any.required': 'Çalışan ID zorunludur.',
      }),
    period: Joi.string()
      .trim()
      .required()
      .messages({
        'any.required': 'Bordro dönemi zorunludur.',
      }),
    grossSalary: Joi.number()
      .positive()
      .required()
      .messages({
        'number.base': 'Brüt maaş sayısal bir değer olmalıdır.',
        'number.positive': 'Brüt maaş pozitif bir değer olmalıdır.',
        'any.required': 'Brüt maaş zorunludur.',
      }),
    netSalary: Joi.number()
      .positive()
      .required()
      .messages({
        'number.base': 'Net maaş sayısal bir değer olmalıdır.',
        'number.positive': 'Net maaş pozitif bir değer olmalıdır.',
        'any.required': 'Net maaş zorunludur.',
      }),
    status: Joi.string()
      .valid('Ödendi', 'Bekliyor')
      .default('Bekliyor')
      .messages({
        'any.only': 'Geçersiz bordro durumu.',
      }),
  }),
};

module.exports = { createPayrollSchema };
