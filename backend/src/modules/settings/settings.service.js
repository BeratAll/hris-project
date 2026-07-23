'use strict';

const settingsRepository = require('./settings.repository');
const AppError = require('../../utils/appError.util');
const { createAuditEntry } = require('../../middlewares/auditLog.middleware');

/**
 * Settings Service
 */

/**
 * Sistem ayarlarını getirir.
 */
const getSettings = async () => {
  const settingsArray = await settingsRepository.findAll();
  
  // Array'i anahtar-değer nesnesine dönüştürerek frontend/backend kullanımını kolaylaştır
  const settingsMap = {};
  settingsArray.forEach((item) => {
    settingsMap[item.key] = {
      value: item.value,
      description: item.description,
      updatedAt: item.updatedAt,
    };
  });
  return settingsMap;
};

/**
 * Ayarı günceller ve Audit Log yazar.
 */
const updateSetting = async (key, value, creatorId, ipAddress = null) => {
  const currentSettings = await settingsRepository.findAll();
  const exists = currentSettings.some((item) => item.key === key);
  
  if (!exists) {
    throw new AppError(`Güncellenmek istenen '${key}' ayarı sistemde tanımlı değil.`, 400);
  }

  const updated = await settingsRepository.updateSetting(key, value);

  // Denetim İzi (Audit Log)
  createAuditEntry({
    userId: creatorId,
    action: 'UPDATE',
    resource: 'system_settings',
    resourceId: key,
    newData: updated,
    ipAddress,
  });

  return updated;
};

module.exports = { getSettings, updateSetting };
