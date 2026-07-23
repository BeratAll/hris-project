'use strict';

const advancesService = require('./advances.service');
const apiResponse = require('../../utils/apiResponse.util');

/**
 * Advances Controller
 */

/**
 * GET /api/v1/advances
 * Avans taleplerini listeler.
 */
const getAdvances = async (req, res) => {
  const advances = await advancesService.getAdvances(req.user);
  return apiResponse.success(res, {
    statusCode: 200,
    message: 'Avans talepleri başarıyla getirildi.',
    data: { advances },
  });
};

/**
 * POST /api/v1/advances
 * Yeni avans talebi oluşturur.
 */
const createAdvance = async (req, res) => {
  const { amount, reason } = req.body;
  const employeeId = req.user.id;
  const ipAddress = req.ip;

  const advance = await advancesService.createAdvance({ amount, reason }, employeeId, ipAddress);

  return apiResponse.success(res, {
    statusCode: 201,
    message: 'Avans talebi başarıyla oluşturuldu.',
    data: { advance },
  });
};

/**
 * PUT /api/v1/advances/:id/approve
 * Avans talebini onaylar ve bir sonraki aşamaya geçirir.
 */
const approveAdvance = async (req, res) => {
  const { id } = req.params;
  const ipAddress = req.ip;

  const advance = await advancesService.approveAdvance(id, req.user, ipAddress);

  return apiResponse.success(res, {
    statusCode: 200,
    message: 'Avans talebi başarıyla onaylandı.',
    data: { advance },
  });
};

/**
 * PUT /api/v1/advances/:id/reject
 * Avans talebini reddeder.
 */
const rejectAdvance = async (req, res) => {
  const { id } = req.params;
  const { rejectionReason } = req.body;
  const ipAddress = req.ip;

  const advance = await advancesService.rejectAdvance(id, rejectionReason, req.user, ipAddress);

  return apiResponse.success(res, {
    statusCode: 200,
    message: 'Avans talebi reddedildi.',
    data: { advance },
  });
};

module.exports = {
  getAdvances,
  createAdvance,
  approveAdvance,
  rejectAdvance,
};
