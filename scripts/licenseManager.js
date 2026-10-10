/**
 * CleanTable - License Key Verification Engine
 * Pure synchronous client-side and server-side verification.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.LicenseManager = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const SECRET_SALT = 'CLEANTABLE_PAYPAL_2026_SALT_SEC';
  const MASTER_KEY = 'CTPRO-MASTER-2026-PAYPAL';

  function computeChecksum(str, salt = SECRET_SALT) {
    let h1 = 0xdeadbeef, h2 = 0x41c64e6d;
    const combined = str + salt;
    for (let i = 0; i < combined.length; i++) {
      const ch = combined.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    const num = 4294967296 * (2097151 & h2) + (h1 >>> 0);
    return num.toString(16).toUpperCase().padStart(8, '0').slice(-8);
  }

  function generateProKey(customerIdentifier = 'VIP') {
    const cleanId = String(customerIdentifier).trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'VIP';
    const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
    const payload = `${cleanId}-${timestamp}`;
    const hash = computeChecksum(payload);
    return `CTPRO-${payload}-${hash}`;
  }

  function verifyProKey(key) {
    if (!key || typeof key !== 'string') return false;
    const cleanKey = key.trim().toUpperCase();
    if (cleanKey === MASTER_KEY) return true;

    const parts = cleanKey.split('-');
    if (parts.length !== 4 || parts[0] !== 'CTPRO') {
      return false;
    }
    const payload = `${parts[1]}-${parts[2]}`;
    const expectedHash = computeChecksum(payload);
    return parts[3] === expectedHash;
  }

  /**
   * Validates standard PayPal Transaction ID format (16 to 20 uppercase alphanumeric characters).
   * PayPal displays this directly on screen upon payment completion (e.g. 8XY12345AB678901C).
   */
  function isValidPayPalTransactionId(str) {
    if (!str || typeof str !== 'string') return false;
    const clean = str.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    return clean.length >= 16 && clean.length <= 20;
  }

  const DEFAULT_GUMROAD_PERMALINK = 'cleantable';

  async function verifyGumroadLicense(key, permalink = DEFAULT_GUMROAD_PERMALINK) {
    if (!key || typeof key !== 'string') return false;
    const cleanKey = key.trim();
    if (!cleanKey) return false;

    try {
      const response = await fetch('https://api.gumroad.com/v2/licenses/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          product_permalink: permalink,
          license_key: cleanKey,
          increment_uses_count: 'false'
        })
      });

      if (!response.ok) return false;
      const data = await response.json();
      return Boolean(data && data.success);
    } catch {
      return false;
    }
  }

  async function verifyAnyKey(key, permalink = DEFAULT_GUMROAD_PERMALINK) {
    if (!key || typeof key !== 'string') return false;
    const clean = key.trim().toUpperCase();

    // 1. Master test key
    if (clean === MASTER_KEY) return true;

    // 2. Deterministic offline CTPRO key
    if (verifyProKey(clean)) return true;

    // 3. PayPal Transaction ID entered by buyer from payment confirmation
    if (isValidPayPalTransactionId(clean)) return true;

    // 4. Fallback Gumroad API check
    return await verifyGumroadLicense(key, permalink);
  }

  return {
    MASTER_KEY,
    DEFAULT_GUMROAD_PERMALINK,
    generateProKey,
    verifyProKey,
    isValidPayPalTransactionId,
    verifyGumroadLicense,
    verifyAnyKey
  };
});
