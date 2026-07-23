-- =============================================================
-- HRIS — Veritabanı Başlangıç Scripti
-- =============================================================
-- Bu script Docker Compose ile PostgreSQL ilk başlatıldığında
-- otomatik olarak çalışır (/docker-entrypoint-initdb.d/).
--
-- İçerik:
-- 1. uuid-ossp extension (UUID üretimi)
-- 2. users tablosu (rol enum, constraint'ler)
-- 3. İndeksler (performans)
-- 4. Seed verileri (Süper Admin test kullanıcısı)
-- =============================================================

-- =============================================
-- 1. EXTENSION'LAR
-- =============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 2. ENUM TANIMLARI
-- =============================================

-- Rol enum tipi — uygulama rolleriyle senkron olmalı
CREATE TYPE user_role AS ENUM (
    'super_admin',
    'hr_manager',
    'hr_specialist',
    'general_manager',
    'site_chief',
    'dept_manager',
    'finance',
    'employee'
);

-- =============================================
-- 3. USERS TABLOSU
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    -- Birincil Anahtar
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Kişisel Bilgiler
    first_name      VARCHAR(50)     NOT NULL,
    last_name       VARCHAR(50)     NOT NULL,
    email           VARCHAR(255)    NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,

    -- Organizasyonel Bilgiler
    role            user_role       NOT NULL DEFAULT 'employee',
    department      VARCHAR(100)    DEFAULT NULL,
    location        VARCHAR(100)    DEFAULT NULL,

    -- Hesap Durumu
    is_active       BOOLEAN         NOT NULL DEFAULT true,

    -- Zaman Damgaları
    last_login_at   TIMESTAMPTZ     DEFAULT NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- Kısıtlamalar
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT chk_users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- =============================================
-- 4. İNDEKSLER
-- =============================================

-- E-posta ile hızlı arama (login sorgusu)
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Rol bazlı filtreleme
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

-- Aktif kullanıcı filtreleme
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users (is_active);

-- Departman bazlı filtreleme
CREATE INDEX IF NOT EXISTS idx_users_department ON users (department);

-- =============================================
-- 5. UPDATED_AT OTOMATİK GÜNCELLEME FONKSİYONU
-- =============================================

-- Her UPDATE'te updated_at sütununu otomatik günceller.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: users tablosu için
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 6. SEED VERİLERİ (Başlangıç Kullanıcıları)
-- =============================================

-- Süper Admin kullanıcısı
-- E-posta: admin@hris.com
-- Şifre:   123456
-- Bcrypt hash ($2a$12$...) — SALT_ROUNDS=12 ile üretilmiş
INSERT INTO users (first_name, last_name, email, password_hash, role, department)
VALUES (
    'Sistem',
    'Yöneticisi',
    'admin@hris.com',
    '$2a$12$QoEuggnW2ebGyosOS29ITe0HNpb5WTjXtPo31ZGWoLi6EYWIyvAYS',
    'super_admin',
    'Bilgi Teknolojileri'
)
ON CONFLICT (email) DO NOTHING;

-- İK Müdürü test kullanıcısı
-- E-posta: ik@hris.com
-- Şifre:   123456
INSERT INTO users (first_name, last_name, email, password_hash, role, department)
VALUES (
    'Ayşe',
    'Yılmaz',
    'ik@hris.com',
    '$2a$12$QoEuggnW2ebGyosOS29ITe0HNpb5WTjXtPo31ZGWoLi6EYWIyvAYS',
    'hr_manager',
    'İnsan Kaynakları'
)
ON CONFLICT (email) DO NOTHING;

-- Şantiye Şefi test kullanıcısı
-- E-posta: santiye@hris.com
-- Şifre:   123456
INSERT INTO users (first_name, last_name, email, password_hash, role, department)
VALUES (
    'Mehmet',
    'Demir',
    'santiye@hris.com',
    '$2a$12$QoEuggnW2ebGyosOS29ITe0HNpb5WTjXtPo31ZGWoLi6EYWIyvAYS',
    'site_chief',
    'Şantiye A'
)
ON CONFLICT (email) DO NOTHING;

-- Çalışan test kullanıcısı
-- E-posta: calisan@hris.com
-- Şifre:   123456
INSERT INTO users (first_name, last_name, email, password_hash, role, department)
VALUES (
    'Ali',
    'Kaya',
    'calisan@hris.com',
    '$2a$12$QoEuggnW2ebGyosOS29ITe0HNpb5WTjXtPo31ZGWoLi6EYWIyvAYS',
    'employee',
    'İnşaat'
)
ON CONFLICT (email) DO NOTHING;

-- =============================================
-- 7. LEAVES (İZİN TALEPLERİ) TABLOSU
-- =============================================

CREATE TYPE leave_status AS ENUM ('Bekliyor', 'Onaylandı', 'Reddedildi');

CREATE TABLE IF NOT EXISTS leaves (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id     UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    leave_type      VARCHAR(50)     NOT NULL, -- Yıllık İzin, Sağlık İzni, Mazeret İzni
    start_date      DATE            NOT NULL,
    end_date        DATE            NOT NULL,
    reason          TEXT            DEFAULT NULL,
    status          leave_status    NOT NULL DEFAULT 'Bekliyor',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_leaves_employee_id ON leaves(employee_id);
CREATE INDEX IF NOT EXISTS idx_leaves_status ON leaves(status);

-- Trigger for leaves updated_at
CREATE TRIGGER trg_leaves_updated_at
    BEFORE UPDATE ON leaves
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed Leaves
-- (Employee ID lookup queries inside sub-selects for consistency)
INSERT INTO leaves (employee_id, leave_type, start_date, end_date, reason, status)
VALUES (
    (SELECT id FROM users WHERE email = 'ik@hris.com' LIMIT 1),
    'Yıllık İzin',
    '2026-07-25',
    '2026-08-05',
    'Yaz tatili planı',
    'Onaylandı'
) ON CONFLICT DO NOTHING;

INSERT INTO leaves (employee_id, leave_type, start_date, end_date, reason, status)
VALUES (
    (SELECT id FROM users WHERE email = 'calisan@hris.com' LIMIT 1),
    'Sağlık İzni',
    '2026-08-01',
    '2026-08-03',
    'Göz ameliyatı sonrası dinlenme',
    'Bekliyor'
) ON CONFLICT DO NOTHING;

-- =============================================
-- 8. PAYROLLS (MAAŞ BORDROLARI) TABLOSU
-- =============================================

CREATE TYPE payroll_status AS ENUM ('Ödendi', 'Bekliyor');

CREATE TABLE IF NOT EXISTS payrolls (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id     UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period          VARCHAR(50)     NOT NULL, -- Temmuz 2026
    gross_salary    NUMERIC(12,2)   NOT NULL,
    net_salary      NUMERIC(12,2)   NOT NULL,
    status          payroll_status  NOT NULL DEFAULT 'Bekliyor',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_payrolls_employee_id ON payrolls(employee_id);
CREATE INDEX IF NOT EXISTS idx_payrolls_status ON payrolls(status);

-- Trigger for payrolls updated_at
CREATE TRIGGER trg_payrolls_updated_at
    BEFORE UPDATE ON payrolls
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed Payrolls
INSERT INTO payrolls (employee_id, period, gross_salary, net_salary, status)
VALUES (
    (SELECT id FROM users WHERE email = 'ik@hris.com' LIMIT 1),
    'Temmuz 2026',
    65000,
    48500,
    'Ödendi'
) ON CONFLICT DO NOTHING;

INSERT INTO payrolls (employee_id, period, gross_salary, net_salary, status)
VALUES (
    (SELECT id FROM users WHERE email = 'calisan@hris.com' LIMIT 1),
    'Temmuz 2026',
    45000,
    34200,
    'Bekliyor'
) ON CONFLICT DO NOTHING;

-- =============================================
-- 9. DEPARTMENTS & SITES TABLOLARI
-- =============================================

CREATE TABLE IF NOT EXISTS departments (
    id          UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100)    NOT NULL UNIQUE,
    is_active   BOOLEAN         NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sites (
    id          UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100)    NOT NULL UNIQUE,
    is_active   BOOLEAN         NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Seed Departments
INSERT INTO departments (name) VALUES
('Bilgi Teknolojileri'),
('İnsan Kaynakları'),
('Şantiye Yönetimi'),
('İnşaat'),
('Finans'),
('İş Güvenliği')
ON CONFLICT (name) DO NOTHING;

-- Seed Sites
INSERT INTO sites (name) VALUES
('Merkez Ofis'),
('Şantiye A'),
('Şantiye B')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- 10. EMPLOYEE LOCATION HISTORY TABLOSU
-- =============================================

CREATE TABLE IF NOT EXISTS employee_location_history (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id     UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    department      VARCHAR(100)    DEFAULT NULL,
    location        VARCHAR(100)    DEFAULT NULL,
    start_date      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    end_date        TIMESTAMPTZ     DEFAULT NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emp_loc_hist_emp_id ON employee_location_history(employee_id);

-- Seed initial history records from existing users
INSERT INTO employee_location_history (employee_id, department, location, start_date)
SELECT id, department, NULL, created_at FROM users
ON CONFLICT DO NOTHING;

-- =============================================
-- 11. SYSTEM SETTINGS (SİSTEM YAPILANDIRMA) TABLOSU
-- =============================================

CREATE TABLE IF NOT EXISTS system_settings (
    key             VARCHAR(100)    PRIMARY KEY,
    value           JSONB           NOT NULL,
    description     TEXT            DEFAULT NULL,
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Seed Settings
INSERT INTO system_settings (key, value, description) VALUES
('leave_policy', '{"types": ["Yıllık İzin", "Sağlık İzni", "Mazeret İzni"], "seniorityRates": [{"minYears": 0, "maxYears": 5, "days": 14}, {"minYears": 5, "maxYears": 15, "days": 20}, {"minYears": 15, "maxYears": 99, "days": 26}]}', 'İzin politikaları ve kıdem bazlı gün sayısı kuralları')
ON CONFLICT (key) DO NOTHING;

INSERT INTO system_settings (key, value, description) VALUES
('payroll_params', '{"taxRates": [{"rate": 15, "threshold": 110000}, {"rate": 20, "threshold": 230000}, {"rate": 27, "threshold": 870000}, {"rate": 35, "threshold": 3000000}, {"rate": 40, "threshold": 99999999}], "sgkEmployeeRate": 14, "sgkEmployerRate": 20.5, "unemploymentEmployeeRate": 1, "unemploymentEmployerRate": 2}', 'Vergi dilimleri, SGK ve işsizlik sigortası çalışan/işveren payı oranları')
ON CONFLICT (key) DO NOTHING;

INSERT INTO system_settings (key, value, description) VALUES
('approval_workflows', '{"leave": ["dept_manager", "hr_manager", "general_manager"], "advance": ["dept_manager", "hr_manager", "general_manager"]}', 'İzin, avans ve harcama onay akış sıraları')
ON CONFLICT (key) DO NOTHING;

INSERT INTO system_settings (key, value, description) VALUES
('deduction_rules', '{"allowMealDeductions": false, "defaultMealAllowance": 150, "allowAdvanceDeductions": true}', 'Maaş kesinti ve ek ödeme parametreleri')
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- TAMAMLANDI
-- =============================================
-- Test kullanıcıları:
-- ┌────────────────────┬──────────────┬───────────────┐
-- │ E-posta            │ Şifre        │ Rol           │
-- ├────────────────────┼──────────────┼───────────────┐
-- │ admin@hris.com     │ 123456       │ super_admin   │
-- │ ik@hris.com        │ 123456       │ hr_manager    │
-- │ santiye@hris.com   │ 123456       │ site_chief    │
-- │ calisan@hris.com   │ 123456       │ employee      │
-- └────────────────────┴──────────────┴───────────────┘
