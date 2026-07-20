'use strict';

const path = require('path');
const winston = require('winston');
require('winston-daily-rotate-file');

const config = require('../config');

// --- Log Formatları ---
const { combine, timestamp, printf, colorize, errors, json } = winston.format;

/**
 * Konsol çıktısı için okunabilir format.
 * Sadece development ortamında kullanılır.
 */
const consoleFormat = printf(({ level, message, timestamp: ts, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length ? `\n  ${JSON.stringify(meta, null, 2)}` : '';
  return `[${ts}] ${level}: ${stack || message}${metaStr}`;
});

/**
 * Dosya çıktısı için yapılandırılmış JSON format.
 * Tüm ortamlarda kullanılır — makine tarafından parse edilebilir.
 */
const fileFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  errors({ stack: true }),
  json()
);

// --- Transport Tanımları ---
const transports = [];

// Konsol transport — sadece development'ta renkli çıktı
if (config.env === 'development') {
  transports.push(
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'HH:mm:ss' }),
        errors({ stack: true }),
        consoleFormat
      ),
    })
  );
}

// Birleşik log dosyası — tüm seviyeler (günlük rotasyon)
transports.push(
  new winston.transports.DailyRotateFile({
    filename: path.join(config.log.dir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    format: fileFormat,
    zippedArchive: true,
  })
);

// Hata log dosyası — sadece error ve üstü
transports.push(
  new winston.transports.DailyRotateFile({
    filename: path.join(config.log.dir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '90d',
    level: 'error',
    format: fileFormat,
    zippedArchive: true,
  })
);

// Audit log dosyası — KVKK denetim izi
transports.push(
  new winston.transports.DailyRotateFile({
    filename: path.join(config.log.dir, 'audit-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '50m',
    maxFiles: '365d', // KVKK: En az 1 yıl saklanmalı
    level: 'info',
    format: fileFormat,
    zippedArchive: true,
  })
);

// --- Logger Instance ---
const logger = winston.createLogger({
  level: config.log.level,
  defaultMeta: {
    service: 'hris-backend',
    environment: config.env,
  },
  transports,
  // Yakalanmamış exception ve rejection'ları logla
  exceptionHandlers: [
    new winston.transports.DailyRotateFile({
      filename: path.join(config.log.dir, 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '90d',
      format: fileFormat,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.DailyRotateFile({
      filename: path.join(config.log.dir, 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '90d',
      format: fileFormat,
    }),
  ],
});

/**
 * Audit log kaydı oluşturur.
 * KVKK uyumu için "Kim, Ne zaman, Ne yaptı?" bilgisini kaydeder.
 *
 * @param {Object} params
 * @param {string} params.userId - İşlemi yapan kullanıcı ID
 * @param {string} params.action - Yapılan eylem (CREATE, UPDATE, DELETE, APPROVE vb.)
 * @param {string} params.resource - Etkilenen kaynak (employees, leaves vb.)
 * @param {string} [params.resourceId] - Etkilenen kaydın ID'si
 * @param {Object} [params.previousData] - Değişiklik öncesi veri
 * @param {Object} [params.newData] - Değişiklik sonrası veri
 * @param {string} [params.ipAddress] - İstemci IP adresi
 * @param {string} [params.userAgent] - İstemci user agent bilgisi
 */
logger.audit = (params) => {
  const auditEntry = {
    type: 'AUDIT_LOG',
    userId: params.userId,
    action: params.action,
    resource: params.resource,
    resourceId: params.resourceId || null,
    previousData: params.previousData || null,
    newData: params.newData || null,
    ipAddress: params.ipAddress || null,
    userAgent: params.userAgent || null,
    timestamp: new Date().toISOString(),
  };

  logger.info('Denetim izi kaydı', auditEntry);
};

module.exports = logger;
