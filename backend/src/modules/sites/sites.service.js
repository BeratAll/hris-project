'use strict';

const sitesRepository = require('./sites.repository');
const AppError = require('../../utils/appError.util');

/**
 * Sites Service
 */

const getSites = async () => {
  return await sitesRepository.findAll();
};

const createSite = async (name) => {
  if (!name || !name.trim()) {
    throw new AppError('Şantiye adı boş olamaz.', 400);
  }
  try {
    return await sitesRepository.create(name.trim());
  } catch (error) {
    if (error.code === '23505') {
      throw new AppError('Bu isimde bir şantiye zaten mevcut.', 400);
    }
    throw error;
  }
};

const updateSite = async (id, data) => {
  const site = await sitesRepository.findById(id);
  if (!site) {
    throw new AppError('Şantiye bulunamadı.', 404);
  }
  try {
    return await sitesRepository.update(id, data);
  } catch (error) {
    if (error.code === '23505') {
      throw new AppError('Bu isimde bir şantiye zaten mevcut.', 400);
    }
    throw error;
  }
};

const deleteSite = async (id) => {
  const site = await sitesRepository.findById(id);
  if (!site) {
    throw new AppError('Şantiye bulunamadı.', 404);
  }
  return await sitesRepository.remove(id);
};

module.exports = { getSites, createSite, updateSite, deleteSite };
