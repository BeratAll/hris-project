'use strict';

const dashboardRepository = require('./dashboard.repository');

/**
 * Dashboard Servis Katmanı
 */

/**
 * Kullanıcı rolüne göre izole edilmiş dashboard istatistiklerini getirir.
 */
const getDashboardStats = async (user) => {
  if (user.role === 'employee') {
    return await dashboardRepository.getEmployeeStats(user.id);
  }
  return await dashboardRepository.getManagerStats();
};

module.exports = { getDashboardStats };
