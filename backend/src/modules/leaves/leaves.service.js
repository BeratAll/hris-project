'use strict';

const AppError = require('../../utils/appError.util');
const leavesRepository = require('./leaves.repository');
const { createAuditEntry } = require('../../middlewares/auditLog.middleware');

/**
 * İzin taleplerini getirir (Rol bazlı veri izolasyonu - User Isolation).
 * - employee rolü sadece kendi izin taleplerini görür.
 * - Yöneticiler tüm izin taleplerini görür.
 */
const getLeaves = async (user) => {
  if (user.role === 'employee') {
    return await leavesRepository.findByEmployeeId(user.id);
  }
  return await leavesRepository.findAll();
};

/**
 * Yeni izin talebi oluşturur.
 * employeeId parametresi güvenlik nedeniyle req.user.id üzerinden doğrudan servis katmanına beslenir.
 */
const createLeave = async ({ leaveType, startDate, endDate, description }, employeeId, ipAddress = null) => {
  // Tarih mantık kontrolü
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new AppError('Geçersiz tarih formatı.', 400);
  }

  if (start > end) {
    throw new AppError('Başlangıç tarihi bitiş tarihinden sonra olamaz.', 400);
  }

  // İzin talebini kaydet
  const leave = await leavesRepository.create({
    employeeId,
    leaveType,
    startDate,
    endDate,
    reason: description || null,
  });

  // Denetim İzi (Audit Log)
  createAuditEntry({
    userId: employeeId,
    action: 'CREATE',
    resource: 'leaves',
    resourceId: leave.id,
    newData: leave,
    ipAddress,
  });

  return leave;
};

module.exports = { getLeaves, createLeave };
