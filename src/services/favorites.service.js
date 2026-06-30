import { STORAGE_KEYS } from '../utils/constants.js';
import { readJSON, writeJSON } from './storage.service.js';

/** @typedef {import('../types/exercise').Exercise} Exercise */

/** @returns {Exercise[]} */
export function getFavorites() {
  return readJSON(STORAGE_KEYS.FAVORITES, /** @type {Exercise[]} */ ([]));
}

/**
 * @param {string} id
 * @returns {boolean}
 */
export function isFavorite(id) {
  return getFavorites().some((item) => item._id === id);
}

/** @param {Exercise} exercise */
export function addFavorite(exercise) {
  const list = getFavorites();

  if (list.some((item) => item._id === exercise._id)) return;

  writeJSON(STORAGE_KEYS.FAVORITES, [...list, exercise]);
}

/** @param {string} id */
export function removeFavorite(id) {
  writeJSON(
    STORAGE_KEYS.FAVORITES,
    getFavorites().filter((item) => item._id !== id),
  );
}

/**
 * Toggles favorite state and returns the resulting state.
 * @param {Exercise} exercise
 * @returns {boolean} true if now favorite
 */
export function toggleFavorite(exercise) {
  if (isFavorite(exercise._id)) {
    removeFavorite(exercise._id);
    return false;
  }

  addFavorite(exercise);

  return true;
}
