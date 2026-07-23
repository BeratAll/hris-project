'use strict';

const payrollService = require('./payroll.service');
const apiResponse = require('../../utils/apiResponse.util');

/**
 * GET /api/v1/payroll
 * Maaş bordrolarını döner (Rol bazlı veri izolasyonu ile).
 */
const getPayrolls = async (req, res) => {
  const payrolls = await payrollService.getPayrolls(req.user);
  return apiResponse.success(res, {
    statusCode: 200,
    message: 'Maaş bordroları başarıyla getirildi.',
    data: { payrolls },
  });
};

/**
 * POST /api/v1/payroll
 * Yeni maaş bordrosu oluşturur.
 */
const createPayroll = async (req, res) => {
  const { employeeId, period, grossSalary, netSalary, status } = req.body;
  const creatorId = req.user.id;
  const ipAddress = req.ip;

  const payroll = await payrollService.createPayroll(
    { employeeId, period, grossSalary, netSalary, status },
    creatorId,
    ipAddress
  );

  return apiResponse.success(res, {
    statusCode: 201,
    message: 'Yeni maaş bordrosu başarıyla kaydedildi.',
    data: { payroll },
  });
};

module.exports = { getPayrolls, createPayroll };
