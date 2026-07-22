'use strict';

const leavesService = require('./leaves.service');
const apiResponse = require('../../utils/apiResponse.util');

/**
 * GET /api/v1/leaves
 * İzin taleplerini döner (Kullanıcı rolüne göre izole edilmiş).
 */
const getLeaves = async (req, res) => {
  const leaves = await leavesService.getLeaves(req.user);
  return apiResponse.success(res, {
    statusCode: 200,
    message: 'İzin talepleri başarıyla getirildi.',
    data: { leaves },
  });
};

/**
 * POST /api/v1/leaves
 * Yeni izin talebi oluşturur.
 */
const createLeave = async (req, res) => {
  const { leaveType, startDate, endDate, description } = req.body;
  const employeeId = req.user.id; // Güvenlik: İstek gövdesinden değil, session/token'dan alınır
  const ipAddress = req.ip;

  const leave = await leavesService.createLeave(
    { leaveType, startDate, endDate, description },
    employeeId,
    ipAddress
  );

  return apiResponse.success(res, {
    statusCode: 201,
    message: 'İzin talebi başarıyla oluşturuldu.',
    data: { leave },
  });
};

module.exports = { getLeaves, createLeave };
