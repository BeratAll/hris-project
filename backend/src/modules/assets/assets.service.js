'use strict';

const assetsRepository = require('./assets.repository');
const AppError = require('../../utils/appError.util');
const { createAuditEntry } = require('../../middlewares/auditLog.middleware');

/**
 * Assets Service — Zimmet ve Demirbaş Yönetimi İş Mantığı Katmanı
 */

/**
 * Demirbaşları listeler.
 * - employee: Sadece kendi zimmetli cihazlarını görür.
 * - Yöneticiler: Sistemdeki tüm demirbaşları ve zimmet geçmişini görür.
 */
const getAssets = async (user) => {
  if (user.role === 'employee') {
    return await assetsRepository.findByEmployeeId(user.id);
  }
  return await assetsRepository.findAll();
};

/**
 * Yeni ekipman zimmetler.
 */
const createAsset = async ({ employeeId, assetName, assetType, serialNumber, issueDate }, creatorId, ipAddress = null) => {
  const asset = await assetsRepository.create({
    employeeId,
    assetName,
    assetType,
    serialNumber,
    issueDate,
  });

  createAuditEntry({
    userId: creatorId,
    action: 'CREATE',
    resource: 'assets',
    resourceId: asset.id,
    newData: asset,
    ipAddress,
  });

  return asset;
};

/**
 * Zimmet bilgisini günceller.
 */
const updateAsset = async (id, { assetName, assetType, serialNumber, issueDate, returnDate, status }, creatorId, ipAddress = null) => {
  const existing = await assetsRepository.findById(id);
  if (!existing) {
    throw new AppError('Zimmet kaydı bulunamadı.', 404);
  }

  const updated = await assetsRepository.update(id, {
    assetName: assetName || existing.assetName,
    assetType: assetType || existing.assetType,
    serialNumber: serialNumber || existing.serialNumber,
    issueDate: issueDate || existing.issueDate,
    returnDate: returnDate || existing.returnDate,
    status: status || existing.status,
  });

  createAuditEntry({
    userId: creatorId,
    action: 'UPDATE',
    resource: 'assets',
    resourceId: id,
    newData: updated,
    ipAddress,
  });

  return updated;
};

/**
 * Zimmeti iade alır.
 */
const returnAsset = async (id, creatorId, ipAddress = null) => {
  const existing = await assetsRepository.findById(id);
  if (!existing) {
    throw new AppError('Zimmet kaydı bulunamadı.', 404);
  }

  if (existing.status !== 'IN_USE') {
    throw new AppError('Bu ekipman zaten iade edilmiş veya kayıp olarak işaretlenmiş.', 400);
  }

  const updated = await assetsRepository.update(id, {
    assetName: existing.assetName,
    assetType: existing.assetType,
    serialNumber: existing.serialNumber,
    issueDate: existing.issueDate,
    returnDate: new Date(),
    status: 'RETURNED',
  });

  createAuditEntry({
    userId: creatorId,
    action: 'UPDATE',
    resource: 'assets',
    resourceId: id,
    newData: updated,
    ipAddress,
  });

  return updated;
};

module.exports = {
  getAssets,
  createAsset,
  updateAsset,
  returnAsset,
};
