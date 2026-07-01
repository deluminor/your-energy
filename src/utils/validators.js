import { EMAIL_PATTERN } from './constants.js';

/**
 * @param {string} value
 * @returns {boolean}
 */
export function isValidEmail(value) {
  return typeof value === 'string' && EMAIL_PATTERN.test(value.trim());
}

/**
 * @param {string} value
 * @returns {string}
 */
export function normalizeQuery(value) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ');
}
