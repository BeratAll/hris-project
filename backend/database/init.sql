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
