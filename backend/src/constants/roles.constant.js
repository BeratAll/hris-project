'use strict';

/**
 * HRIS Sistem Rolleri
 * İnşaat firmasının organizasyonel yapısına uygun rol tanımları.
 * Yeni roller eklendiğinde hem ROLES hem de PERMISSIONS güncellenmeli.
 */
const ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  HR_MANAGER: 'hr_manager',           // İK Müdürü
  HR_SPECIALIST: 'hr_specialist',     // İK Uzmanı
  GENERAL_MANAGER: 'general_manager', // Genel Müdür
  SITE_CHIEF: 'site_chief',           // Şantiye Şefi
  DEPT_MANAGER: 'dept_manager',       // Departman Müdürü
  FINANCE: 'finance',                 // Finans
  EMPLOYEE: 'employee',               // Çalışan
});

/**
 * Kaynak Bazlı Yetki Matrisi
 * Her kaynak (resource) için hangi rollerin hangi eylemleri (action)
 * yapabileceğini tanımlar. RBAC middleware bu matrisi kullanır.
 *
 * Eylem tipleri: create, read, update, delete, approve, export
 */
const PERMISSIONS = Object.freeze({
  employees: {
    create: [ROLES.SUPER_ADMIN, ROLES.HR_MANAGER, ROLES.HR_SPECIALIST],
    read: [
      ROLES.SUPER_ADMIN, ROLES.HR_MANAGER, ROLES.HR_SPECIALIST,
      ROLES.GENERAL_MANAGER, ROLES.SITE_CHIEF, ROLES.DEPT_MANAGER,
      ROLES.FINANCE,
    ],
    update: [ROLES.SUPER_ADMIN, ROLES.HR_MANAGER, ROLES.HR_SPECIALIST],
    delete: [ROLES.SUPER_ADMIN, ROLES.HR_MANAGER],
    export: [ROLES.SUPER_ADMIN, ROLES.HR_MANAGER, ROLES.GENERAL_MANAGER],
  },

  leaves: {
    create: [
      ROLES.SUPER_ADMIN, ROLES.HR_MANAGER, ROLES.HR_SPECIALIST,
      ROLES.SITE_CHIEF, ROLES.DEPT_MANAGER, ROLES.EMPLOYEE,
    ],
    read: [
      ROLES.SUPER_ADMIN, ROLES.HR_MANAGER, ROLES.HR_SPECIALIST,
      ROLES.GENERAL_MANAGER, ROLES.SITE_CHIEF, ROLES.DEPT_MANAGER,
    ],
    approve: [
      ROLES.SUPER_ADMIN, ROLES.HR_MANAGER, ROLES.SITE_CHIEF,
      ROLES.DEPT_MANAGER, ROLES.GENERAL_MANAGER,
    ],
    delete: [ROLES.SUPER_ADMIN, ROLES.HR_MANAGER],
  },

  payroll: {
    create: [ROLES.SUPER_ADMIN, ROLES.HR_MANAGER, ROLES.FINANCE],
    read: [ROLES.SUPER_ADMIN, ROLES.HR_MANAGER, ROLES.FINANCE, ROLES.GENERAL_MANAGER],
    approve: [ROLES.SUPER_ADMIN, ROLES.GENERAL_MANAGER, ROLES.FINANCE],
    export: [ROLES.SUPER_ADMIN, ROLES.FINANCE, ROLES.GENERAL_MANAGER],
  },

  reports: {
    read: [ROLES.SUPER_ADMIN, ROLES.HR_MANAGER, ROLES.GENERAL_MANAGER, ROLES.FINANCE],
    export: [ROLES.SUPER_ADMIN, ROLES.HR_MANAGER, ROLES.GENERAL_MANAGER],
  },

  settings: {
    read: [ROLES.SUPER_ADMIN],
    update: [ROLES.SUPER_ADMIN],
  },

  audit_logs: {
    read: [ROLES.SUPER_ADMIN, ROLES.GENERAL_MANAGER],
  },
});

/**
 * Rol hiyerarşi seviyesi — yüksek seviye daha yetkili.
 * Bazı iş kurallarında hiyerarşi kontrolü için kullanılır.
 */
const ROLE_HIERARCHY = Object.freeze({
  [ROLES.SUPER_ADMIN]: 100,
  [ROLES.GENERAL_MANAGER]: 90,
  [ROLES.HR_MANAGER]: 80,
  [ROLES.FINANCE]: 70,
  [ROLES.HR_SPECIALIST]: 60,
  [ROLES.SITE_CHIEF]: 50,
  [ROLES.DEPT_MANAGER]: 50,
  [ROLES.EMPLOYEE]: 10,
});

module.exports = { ROLES, PERMISSIONS, ROLE_HIERARCHY };
