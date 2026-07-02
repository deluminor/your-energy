import { STORAGE_KEYS } from '../utils/constants.js';
import { readUiStateFromUrl, writeUiStateToUrl } from './url-state.service.js';

/**
 * @param {string} key
 * @param {unknown} value
 */
function writeLocalJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/**
 * @template T
 * @param {string} key
 * @param {T} fallback
 * @returns {T}
 */
export function readJSON(key, fallback) {
  try {
    if (key === STORAGE_KEYS.UI_STATE) {
      const urlState = readUiStateFromUrl();

      if (urlState) {
        writeLocalJSON(key, urlState);
        return /** @type {T} */ (urlState);
      }
    }

    const raw = localStorage.getItem(key);

    if (raw === null) return fallback;

    const value = JSON.parse(raw);

    if (key === STORAGE_KEYS.UI_STATE) {
      writeUiStateToUrl(value);
    }

    return value;
  } catch (error) {
    console.error(`storage: failed to read "${key}"`, error);
    return fallback;
  }
}

/**
 * @param {string} key
 * @param {unknown} value
 */
export function writeJSON(key, value) {
  try {
    writeLocalJSON(key, value);

    if (key === STORAGE_KEYS.UI_STATE) {
      writeUiStateToUrl(value);
    }
  } catch (error) {
    console.error(`storage: failed to write "${key}"`, error);
  }
}
