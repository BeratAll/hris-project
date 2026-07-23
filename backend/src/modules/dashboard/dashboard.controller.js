'use strict';

const dashboardService = require('./dashboard.service');
const apiResponse = require('../../utils/apiResponse.util');

/**
 * GET /api/v1/dashboard/stats
 * Dashboard istatistiklerini döner.
 */
const getDashboardStats = async (req, res) => {
  const stats = await dashboardService.getDashboardStats(req.user);
  return apiResponse.success(res, {
    statusCode: 200,
    message: 'Dashboard istatistikleri başarıyla getirildi.',
    data: stats,
  });
};

module.exports = { getDashboardStats };
