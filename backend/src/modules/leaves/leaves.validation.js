'use strict';

const Joi = require('joi');

/**
 * İzin Modülü Joi Doğrulama Şemaları
 */

const createLeaveSchema = {
  body: Joi.object({
    leaveType: Joi.string()
      .trim()
      .valid('Yıllık İzin', 'Sağlık İzni', 'Mazeret İzni')
      .required()
      .messages({
        'any.only': 'Geçersiz izin türü.',
        'any.required': 'İzin türü zorunludur.',
      }),
    startDate: Joi.date()
      .iso()
      .required()
      .messages({
        'date.base': 'Geçerli bir başlangıç tarihi giriniz.',
        'any.required': 'Başlangıç tarihi zorunludur.',
      }),
    endDate: Joi.date()
      .iso()
      .min(Joi.ref('startDate'))
      .required()
      .messages({
        'date.base': 'Geçerli bir bitiş tarihi giriniz.',
        'date.min': 'Bitiş tarihi başlangıç tarihinden önce olamaz.',
        'any.required': 'Bitiş tarihi zorunludur.',
      }),
    description: Joi.string()
      .trim()
      .max(500)
      .allow('', null)
      .messages({
        'string.max': 'Açıklama en fazla 500 karakter olabilir.',
      }),
  }),
};

module.exports = { createLeaveSchema };
