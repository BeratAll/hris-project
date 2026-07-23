'use strict';

const bcrypt = require('bcryptjs');
const AppError = require('../../utils/appError.util');
const employeesRepository = require('./employees.repository');
const assetsRepository = require('../assets/assets.repository');
const { createAuditEntry } = require('../../middlewares/auditLog.middleware');

const SALT_ROUNDS = 12;

/**
 * Tüm çalışanları listeler.
 */
const getEmployees = async () => {
  return await employeesRepository.findAll();
};

/**
 * Yeni çalışan ekler.
 * Ad ve Soyad ayrıştırılır, varsayılan şifre atanır ve şifrelenir.
 */
const createEmployee = async ({ fullName, email, department, location }, creatorId, ipAddress = null) => {
  // 1. E-posta benzersizlik kontrolü
  const existingUser = await employeesRepository.findByEmail(email);
  if (existingUser) {
    throw new AppError('Bu e-posta adresi zaten kullanılmaktadır.', 409);
  }

  // 2. Ad ve Soyadı ayır (Son kelime soyad, diğerleri ad)
  const parts = fullName.trim().split(' ');
  const lastName = parts.pop() || '';
  const firstName = parts.join(' ') || '';

  if (!firstName || !lastName) {
    throw new AppError('Lütfen ad ve soyad giriniz.', 400);
  }

  // 3. Varsayılan şifre ata (123456)
  const passwordHash = await bcrypt.hash('123456', SALT_ROUNDS);

  // 4. Veritabanına kaydet
  const employee = await employeesRepository.create({
    firstName,
    lastName,
    email,
    passwordHash,
    role: 'employee',
    department,
    location,
  });

  // 4.1 Şantiye/Departman Geçmişi (Location History) kaydı oluştur
  await employeesRepository.createHistoryRecord({
    employeeId: employee.id,
    department: employee.department,
    location: employee.location,
  });

  // 5. Denetim İzi (Audit Log) kaydı oluştur
  createAuditEntry({
    userId: creatorId,
    action: 'CREATE',
    resource: 'users',
    resourceId: employee.id,
    newData: employee,
    ipAddress,
  });

  return employee;
};

/**
 * Çalışan bilgilerini günceller.
 */
const updateEmployee = async (id, { fullName, email, department, location }, creatorId, ipAddress = null) => {
  // 1. E-posta benzersizlik kontrolü (Kendi e-postası hariç başkası kullanıyor mu)
  const existingUser = await employeesRepository.findByEmail(email);
  if (existingUser && existingUser.id !== id) {
    throw new AppError('Bu e-posta adresi başka bir çalışan tarafından kullanılmaktadır.', 409);
  }

  // 2. Ad ve Soyadı ayır
  const parts = fullName.trim().split(' ');
  const lastName = parts.pop() || '';
  const firstName = parts.join(' ') || '';

  if (!firstName || !lastName) {
    throw new AppError('Lütfen ad ve soyad giriniz.', 400);
  }

  // 3. Güncelle
  const activeHist = await employeesRepository.getActiveHistory(id);

  const employee = await employeesRepository.update(id, {
    firstName,
    lastName,
    email,
    department,
    location,
  });

  if (!employee) {
    throw new AppError('Çalışan bulunamadı.', 404);
  }

  // 3.1 Şantiye/Departman Geçmişi (Location History) güncelle
  const hasChanged = !activeHist || activeHist.department !== department || activeHist.location !== location;
  if (hasChanged) {
    if (activeHist) {
      await employeesRepository.closeHistoryRecord(activeHist.id);
    }
    await employeesRepository.createHistoryRecord({
      employeeId: id,
      department,
      location,
    });
  }

  // 4. Audit Log
  createAuditEntry({
    userId: creatorId,
    action: 'UPDATE',
    resource: 'users',
    resourceId: id,
    newData: employee,
    ipAddress,
  });

  return employee;
};

/**
 * Çalışanı veritabanında pasif duruma getirir (soft delete).
 */
const deleteEmployee = async (id, creatorId, ipAddress = null) => {
  // Offboarding zimmet kontrolü
  const activeAssetsCount = await assetsRepository.countInUseByEmployeeId(id);
  if (activeAssetsCount > 0) {
    throw new AppError('Çalışanın üzerinde iade edilmemiş zimmetli demirbaşlar bulunmaktadır. Önce zimmetleri iade almalısınız.', 400);
  }

  const employee = await employeesRepository.deleteById(id);

  if (!employee) {
    throw new AppError('Çalışan bulunamadı.', 404);
  }

  // Şantiye/Departman Geçmişi (Location History) aktif kaydını kapat
  const activeHist = await employeesRepository.getActiveHistory(id);
  if (activeHist) {
    await employeesRepository.closeHistoryRecord(activeHist.id);
  }

  // Audit Log
  createAuditEntry({
    userId: creatorId,
    action: 'DELETE',
    resource: 'users',
    resourceId: id,
    ipAddress,
  });

  return employee;
};

module.exports = { getEmployees, createEmployee, updateEmployee, deleteEmployee };
