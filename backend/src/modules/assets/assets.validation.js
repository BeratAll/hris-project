'use strict';

const Joi = require('joi');

/**
 * Assets Validation Schema
 */

const createAssetSchema = {
  body: Joi.object({
    employeeId: Joi.string()
      .guid()
      .required()
      .messages({
        'string.guid': 'Geçerli bir çalışan ID giriniz.',
        'any.required': 'Zimmetlenecek çalışan zorunludur.',
      }),
    assetName: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Demirbaş adı en az 2 karakter olmalıdır.',
        'string.max': 'Demirbaş adı en fazla 100 karakter olabilir.',
        'any.required': 'Demirbaş adı zorunludur.',
      }),
    assetType: Joi.string()
      .trim()
      .min(2)
      .max(50)
      .required()
      .messages({
        'any.required': 'Ekipman türü zorunludur.',
      }),
    serialNumber: Joi.string()
      .trim()
      .max(100)
      .allow('', null),
    issueDate: Joi.date()
      .iso()
      .allow('', null),
  }),
};

const updateAssetSchema = {
  body: Joi.object({
    assetName: Joi.string().trim().min(2).max(100).optional(),
    assetType: Joi.string().trim().min(2).max(50).optional(),
    serialNumber: Joi.string().trim().max(100).allow('', null).optional(),
    issueDate: Joi.date().iso().allow('', null).optional(),
    returnDate: Joi.date().iso().allow('', null).optional(),
    status: Joi.string().valid('IN_USE', 'RETURNED', 'LOST').optional(),
  }),
};

module.exports = {
  createAssetSchema,
  updateAssetSchema,
};
