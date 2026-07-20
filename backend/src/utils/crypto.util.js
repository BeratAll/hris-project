'use strict';

const crypto = require('crypto');
const config = require('../config');

/**
 * AES-256-GCM Şifreleme/Çözme Modülü
 *
 * Hassas verilerin veritabanında şifreli saklanması için kullanılır.
 * GCM modu "authenticated encryption" sağlar — hem gizlilik hem bütünlük.
 *
 * Şifrelenen veri formatı: iv:authTag:encryptedData (hex kodlu, ":" ile ayrılmış)
 *
 * Kullanım alanları:
 * - IBAN numaraları
 * - Sabıka kaydı bilgileri
 * - Sağlık bilgileri
 * - TC Kimlik numaraları
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;       // 128 bit
const AUTH_TAG_LENGTH = 16;  // 128 bit
const ENCODING = 'hex';

/**
 * Encryption key'i hex string'den Buffer'a dönüştürür.
 * Key uzunluğu 32 byte (256 bit) olmalıdır.
 * @returns {Buffer}
 */
const getEncryptionKey = () => {
  const key = config.encryption.key;

  if (!key) {
    throw new Error('ENCRYPTION_KEY ortam değişkeni tanımlı değil');
  }

  const keyBuffer = Buffer.from(key, 'hex');

  if (keyBuffer.length !== 32) {
    throw new Error('ENCRYPTION_KEY 32 byte (64 hex karakter) olmalıdır');
  }

  return keyBuffer;
};

/**
 * Düz metin veriyi AES-256-GCM ile şifreler.
 *
 * @param {string} plainText - Şifrelenecek düz metin
 * @returns {string} Şifreli veri (format: iv:authTag:encryptedData)
 * @throws {Error} Key tanımlı değilse veya şifreleme başarısızsa
 *
 * @example
 * const encrypted = encrypt('TR33 0006 1005 1978 6457 8413 26');
 * // "a1b2c3...:d4e5f6...:789abc..."
 */
const encrypt = (plainText) => {
  if (!plainText || typeof plainText !== 'string') {
    throw new Error('Şifrelenecek veri string tipinde olmalıdır');
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  let encrypted = cipher.update(plainText, 'utf8', ENCODING);
  encrypted += cipher.final(ENCODING);

  const authTag = cipher.getAuthTag().toString(ENCODING);

  // Format: iv:authTag:encryptedData
  return `${iv.toString(ENCODING)}:${authTag}:${encrypted}`;
};

/**
 * AES-256-GCM ile şifrelenmiş veriyi çözer.
 *
 * @param {string} encryptedText - Şifreli veri (format: iv:authTag:encryptedData)
 * @returns {string} Çözülmüş düz metin
 * @throws {Error} Format hatalıysa, key yanlışsa veya veri bozuksa
 *
 * @example
 * const decrypted = decrypt('a1b2c3...:d4e5f6...:789abc...');
 * // "TR33 0006 1005 1978 6457 8413 26"
 */
const decrypt = (encryptedText) => {
  if (!encryptedText || typeof encryptedText !== 'string') {
    throw new Error('Çözülecek veri string tipinde olmalıdır');
  }

  const parts = encryptedText.split(':');

  if (parts.length !== 3) {
    throw new Error('Şifreli veri formatı geçersiz (iv:authTag:data bekleniyor)');
  }

  const [ivHex, authTagHex, encryptedData] = parts;
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, ENCODING);
  const authTag = Buffer.from(authTagHex, ENCODING);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedData, ENCODING, 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

/**
 * Verinin şifreli formatta olup olmadığını kontrol eder.
 * iv:authTag:data formatına uygunluk kontrolü yapar.
 *
 * @param {string} text - Kontrol edilecek metin
 * @returns {boolean}
 */
const isEncrypted = (text) => {
  if (!text || typeof text !== 'string') {
    return false;
  }

  const parts = text.split(':');
  if (parts.length !== 3) {
    return false;
  }

  const [iv, authTag] = parts;
  return iv.length === IV_LENGTH * 2 && authTag.length === AUTH_TAG_LENGTH * 2;
};

module.exports = { encrypt, decrypt, isEncrypted };
