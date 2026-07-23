'use strict';

const settingsService = require('./settings.service');
const apiResponse = require('../../utils/apiResponse.util');

/**
 * Settings Controller
 */

/**
 * GET /api/v1/settings
 * Tüm sistem yapılandırmalarını döner.
 */
const getSettings = async (req, res) => {
  const settings = await settingsService.getSettings();
  return apiResponse.success(res, {
    statusCode: 200,
    message: 'Sistem ayarları başarıyla getirildi.',
    data: { settings },
  });
};

/**
 * PUT /api/v1/settings/:key
 * Belirli bir anahtara ait sistem yapılandırmasını günceller.
 */
const updateSetting = async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  const creatorId = req.user.id;
  const ipAddress = req.ip;

  const setting = await settingsService.updateSetting(key, value, creatorId, ipAddress);

  return apiResponse.success(res, {
    statusCode: 200,
    message: `'${key}' ayarı başarıyla güncellendi.`,
    data: { setting },
  });
};

module.exports = { getSettings, updateSetting };
