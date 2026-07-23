'use strict';

const AppError = require('../../utils/appError.util');
const payrollRepository = require('./payroll.repository');
const { createAuditEntry } = require('../../middlewares/auditLog.middleware');

/**
 * Maaş bordrolarını getirir (Rol bazlı veri izolasyonu).
 * - employee sadece kendi bordrolarını görebilir.
 * - Yöneticiler ve Finans tüm bordroları görebilir.
 */
const getPayrolls = async (user) => {
  if (user.role === 'employee') {
    return await payrollRepository.findByEmployeeId(user.id);
  }
  return await payrollRepository.findAll();
};

/**
 * Yeni bordro kaydı ekler (Sadece yöneticiler ve finans).
 */
const createPayroll = async ({ employeeId, period, grossSalary, netSalary, status }, creatorId, ipAddress = null) => {
  const payroll = await payrollRepository.create({
    employeeId,
    period,
    grossSalary,
    netSalary,
    status: status || 'Bekliyor',
  });

  // Denetim İzi (Audit Log)
  createAuditEntry({
    userId: creatorId,
    action: 'CREATE',
    resource: 'payrolls',
    resourceId: payroll.id,
    newData: payroll,
    ipAddress,
  });

  return payroll;
};

module.exports = { getPayrolls, createPayroll };
