'use strict';

const assetsService = require('./assets.service');
const apiResponse = require('../../utils/apiResponse.util');

/**
 * Assets Controller
 */

/**
 * GET /api/v1/assets
 * Zimmet listesini getirir.
 */
const getAssets = async (req, res) => {
  const assets = await assetsService.getAssets(req.user);
  return apiResponse.success(res, {
    statusCode: 200,
    message: 'Zimmetli demirbaş listesi başarıyla getirildi.',
    data: { assets },
  });
};

/**
 * POST /api/v1/assets
 * Yeni ekipman zimmetler.
 */
const createAsset = async (req, res) => {
  const { employeeId, assetName, assetType, serialNumber, issueDate } = req.body;
  const creatorId = req.user.id;
  const ipAddress = req.ip;

  const asset = await assetsService.createAsset(
    { employeeId, assetName, assetType, serialNumber, issueDate },
    creatorId,
    ipAddress
  );

  return apiResponse.success(res, {
    statusCode: 201,
    message: 'Demirbaş başarıyla çalışana zimmetlendi.',
    data: { asset },
  });
};

/**
 * PUT /api/v1/assets/:id
 * Zimmet kaydını günceller.
 */
const updateAsset = async (req, res) => {
  const { id } = req.params;
  const creatorId = req.user.id;
  const ipAddress = req.ip;

  const asset = await assetsService.updateAsset(id, req.body, creatorId, ipAddress);

  return apiResponse.success(res, {
    statusCode: 200,
    message: 'Zimmet kaydı başarıyla güncellendi.',
    data: { asset },
  });
};

/**
 * PUT /api/v1/assets/:id/return
 * Ekipmanı iade alır.
 */
const returnAsset = async (req, res) => {
  const { id } = req.params;
  const creatorId = req.user.id;
  const ipAddress = req.ip;

  const asset = await assetsService.returnAsset(id, creatorId, ipAddress);

  return apiResponse.success(res, {
    statusCode: 200,
    message: 'Ekipman başarıyla iade alındı.',
    data: { asset },
  });
};

module.exports = {
  getAssets,
  createAsset,
  updateAsset,
  returnAsset,
};
