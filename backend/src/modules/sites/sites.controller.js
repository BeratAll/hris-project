'use strict';

const sitesService = require('./sites.service');
const apiResponse = require('../../utils/apiResponse.util');

/**
 * Sites Controller
 */

const getSites = async (req, res) => {
  const sites = await sitesService.getSites();
  return apiResponse.success(res, {
    statusCode: 200,
    message: 'Şantiyeler başarıyla getirildi.',
    data: { sites },
  });
};

const createSite = async (req, res) => {
  const { name } = req.body;
  const site = await sitesService.createSite(name);
  return apiResponse.success(res, {
    statusCode: 201,
    message: 'Şantiye başarıyla oluşturuldu.',
    data: { site },
  });
};

const updateSite = async (req, res) => {
  const { id } = req.params;
  const { name, isActive } = req.body;
  const site = await sitesService.updateSite(id, { name, isActive });
  return apiResponse.success(res, {
    statusCode: 200,
    message: 'Şantiye başarıyla güncellendi.',
    data: { site },
  });
};

const deleteSite = async (req, res) => {
  const { id } = req.params;
  await sitesService.deleteSite(id);
  return apiResponse.success(res, {
    statusCode: 200,
    message: 'Şantiye başarıyla silindi.',
  });
};

module.exports = { getSites, createSite, updateSite, deleteSite };
