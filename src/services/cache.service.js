import { CACHE_TTL_MS } from '../utils/constants.js';

/**
 * @typedef {object} CacheEntry
 * @property {unknown} [value]
 * @property {Promise<unknown>} [promise]
 * @property {number} expiresAt
 */

/** @type {Map<string, CacheEntry>} */
const cache = new Map();

/**
 * @template T
 * @param {string} key
 * @param {() => Promise<T>} producer
 * @param {number} [ttl]
 * @returns {Promise<T>}
 */
export async function withCache(key, producer, ttl = CACHE_TTL_MS) {
  const hit = cache.get(key);
  const now = Date.now();

  if (hit) {
    if (hit.promise) return /** @type {Promise<T>} */ (hit.promise);
    if (hit.expiresAt > now) return /** @type {T} */ (hit.value);
  }

  const promise = producer().then(
    (value) => {
      cache.set(key, { value, expiresAt: Date.now() + ttl });
      return value;
    },
    (error) => {
      if (cache.get(key)?.promise === promise) {
        cache.delete(key);
      }
      throw error;
    },
  );

  cache.set(key, { promise, expiresAt: now + ttl });

  return promise;
}

export function clearCache() {
  cache.clear();
}
