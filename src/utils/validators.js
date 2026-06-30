import { EMAIL_PATTERN } from './constants.js';

/**
 * Validates an email against the API contract pattern.
 * @param {string} value
 * @returns {boolean}
 */
export function isValidEmail(value) {
  return typeof value === 'string' && EMAIL_PATTERN.test(value.trim());
}

/**
 * Trims and collapses a search query; empty -> ''.
 * @param {string} value
 * @returns {string}
 */
export function normalizeQuery(value) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ');
}
