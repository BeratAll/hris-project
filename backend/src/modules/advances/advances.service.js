'use strict';

const advancesRepository = require('./advances.repository');
const AppError = require('../../utils/appError.util');
const { createAuditEntry } = require('../../middlewares/auditLog.middleware');

/**
 * Advances Service
 */

/**
 * Avans taleplerini listeler (Rol bazlı veri izolasyonu ile).
 * - employee: Sadece kendi taleplerini görür.
 * - site_chief / dept_manager: Kendi şantiyesindeki/departmanındaki personellerin taleplerini görür.
 * - super_admin / hr_manager / general_manager / finance: Tüm talepleri görür.
 */
const getAdvances = async (user) => {
  if (user.role === 'employee') {
    return await advancesRepository.findByEmployeeId(user.id);
  }

  if (['site_chief', 'dept_manager'].includes(user.role)) {
    return await advancesRepository.findByManagerUnderlings({
      location: user.location,
      department: user.department,
      role: user.role,
    });
  }

  return await advancesRepository.findAll();
};

/**
 * Yeni avans talebi oluşturur (Sadece çalışanlar veya tüm kullanıcılar kendisi için).
 */
const createAdvance = async ({ amount, reason }, employeeId, ipAddress = null) => {
  if (!amount || amount <= 0) {
    throw new AppError('Avans tutarı sıfırdan büyük olmalıdır.', 400);
  }
  if (!reason || !reason.trim()) {
    throw new AppError('Avans gerekçesi belirtilmelidir.', 400);
  }

  const advance = await advancesRepository.create({
    employeeId,
    amount,
    reason: reason.trim(),
  });

  createAuditEntry({
    userId: employeeId,
    action: 'CREATE',
    resource: 'advances',
    resourceId: advance.id,
    newData: advance,
    ipAddress,
  });

  return advance;
};

/**
 * Avans talebini bir sonraki onay aşamasına geçirir (Onay Zinciri Mantığı).
 * Akış: PENDING_MANAGER_APPROVAL -> PENDING_HR_APPROVAL -> PENDING_GM_APPROVAL -> PENDING_FINANCE -> PAID
 */
const approveAdvance = async (id, user, ipAddress = null) => {
  const advance = await advancesRepository.findById(id);
  if (!advance) {
    throw new AppError('Avans talebi bulunamadı.', 404);
  }

  const updates = {};
  let nextStatus;

  switch (advance.status) {
    case 'PENDING_MANAGER_APPROVAL':
      // İlk onay: Şantiye Şefi veya Departman Müdürü
      if (!['site_chief', 'dept_manager', 'super_admin'].includes(user.role)) {
        throw new AppError('Bu onay aşaması için yetkiniz bulunmamaktadır (Birim Yöneticisi onayı gerekiyor).', 403);
      }
      nextStatus = 'PENDING_HR_APPROVAL';
      updates.managerApprovedBy = user.id;
      break;

    case 'PENDING_HR_APPROVAL':
      // İkinci onay: İK Müdürü
      if (!['hr_manager', 'super_admin'].includes(user.role)) {
        throw new AppError('Bu onay aşaması için yetkiniz bulunmamaktadır (İK onayı gerekiyor).', 403);
      }
      nextStatus = 'PENDING_GM_APPROVAL';
      updates.hrApprovedBy = user.id;
      break;

    case 'PENDING_GM_APPROVAL':
      // Üçüncü onay: Genel Müdür
      if (!['general_manager', 'super_admin'].includes(user.role)) {
        throw new AppError('Bu onay aşaması için yetkiniz bulunmamaktadır (Genel Müdür onayı gerekiyor).', 403);
      }
      nextStatus = 'PENDING_FINANCE';
      updates.gmApprovedBy = user.id;
      break;

    case 'PENDING_FINANCE':
      // Son aşama: Finans Ödemesi
      if (!['finance', 'super_admin'].includes(user.role)) {
        throw new AppError('Bu ödeme aşaması için yetkiniz bulunmamaktadır (Finans ödemesi gerekiyor).', 403);
      }
      nextStatus = 'PAID';
      updates.financePaidBy = user.id;
      updates.paymentDate = new Date();
      break;

    case 'PAID':
      throw new AppError('Bu avans talebi zaten ödenmiştir.', 400);

    case 'REJECTED':
      throw new AppError('Reddedilmiş talepler onaylanamaz.', 400);

    default:
      throw new AppError('Bilinmeyen avans statüsü.', 400);
  }

  updates.status = nextStatus;
  const updatedAdvance = await advancesRepository.updateStatus(id, updates);

  createAuditEntry({
    userId: user.id,
    action: 'UPDATE',
    resource: 'advances',
    resourceId: id,
    newData: updatedAdvance,
    ipAddress,
  });

  return updatedAdvance;
};

/**
 * Avans talebini reddeder.
 */
const rejectAdvance = async (id, rejectionReason, user, ipAddress = null) => {
  const advance = await advancesRepository.findById(id);
  if (!advance) {
    throw new AppError('Avans talebi bulunamadı.', 404);
  }

  if (['PAID', 'REJECTED'].includes(advance.status)) {
    throw new AppError('Tamamlanmış veya zaten reddedilmiş talepler reddedilemez.', 400);
  }

  // Reddeden yetki kontrolü (Onay yetkisi olan roller reddedebilir)
  if (!['site_chief', 'dept_manager', 'hr_manager', 'general_manager', 'finance', 'super_admin'].includes(user.role)) {
    throw new AppError('Bu talebi reddetme yetkiniz bulunmamaktadır.', 403);
  }

  const updatedAdvance = await advancesRepository.updateStatus(id, {
    status: 'REJECTED',
    rejectedBy: user.id,
    rejectionReason: rejectionReason || 'Gerekçe belirtilmedi.',
  });

  createAuditEntry({
    userId: user.id,
    action: 'UPDATE',
    resource: 'advances',
    resourceId: id,
    newData: updatedAdvance,
    ipAddress,
  });

  return updatedAdvance;
};

module.exports = {
  getAdvances,
  createAdvance,
  approveAdvance,
  rejectAdvance,
};
