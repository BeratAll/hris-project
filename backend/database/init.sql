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
-- TAMAMLANDI
-- =============================================
-- Test kullanıcıları:
-- ┌────────────────────┬──────────────┬───────────────┐
-- │ E-posta            │ Şifre        │ Rol           │
-- ├────────────────────┼──────────────┼───────────────┤
-- │ admin@hris.com     │ 123456       │ super_admin   │
-- │ ik@hris.com        │ 123456       │ hr_manager    │
-- │ santiye@hris.com   │ 123456       │ site_chief    │
-- │ calisan@hris.com   │ 123456       │ employee      │
-- └────────────────────┴──────────────┴───────────────┘
