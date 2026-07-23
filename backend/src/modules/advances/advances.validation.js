'use strict';

const Joi = require('joi');

/**
 * Advances Validation Schema
 */

const createAdvanceSchema = {
  body: Joi.object({
    amount: Joi.number()
      .positive()
      .required()
      .messages({
        'number.base': 'Avans tutarı sayısal bir değer olmalıdır.',
        'number.positive': 'Avans tutarı sıfırdan büyük olmalıdır.',
        'any.required': 'Avans tutarı zorunludur.',
      }),
    reason: Joi.string()
      .trim()
      .min(5)
      .max(1000)
      .required()
      .messages({
        'string.min': 'Avans gerekçesi en az 5 karakter olmalıdır.',
        'string.max': 'Avans gerekçesi en fazla 1000 karakter olabilir.',
        'any.required': 'Avans gerekçesi zorunludur.',
      }),
  }),
};

const rejectAdvanceSchema = {
  body: Joi.object({
    rejectionReason: Joi.string()
      .trim()
      .min(3)
      .max(500)
      .required()
      .messages({
        'string.min': 'Red gerekçesi en az 3 karakter olmalıdır.',
        'string.max': 'Red gerekçesi en fazla 500 karakter olabilir.',
        'any.required': 'Red gerekçesi zorunludur.',
      }),
  }),
};

module.exports = {
  createAdvanceSchema,
  rejectAdvanceSchema,
};
