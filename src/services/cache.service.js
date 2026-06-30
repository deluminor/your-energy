import { CACHE_TTL_MS } from '../utils/constants.js';

/** @type {Map<string, { value: unknown, expiresAt: number }>} */
const store = new Map();

/**
 * Returns the cached value for `key`, or runs `producer`, caches and returns it.
 * @template T
 * @param {string} key
 * @param {() => Promise<T>} producer
 * @param {number} [ttl]
 * @returns {Promise<T>}
 */
export async function withCache(key, producer, ttl = CACHE_TTL_MS) {
  const hit = store.get(key);

  if (hit && hit.expiresAt > Date.now()) {
    return /** @type {T} */ (hit.value);
  }

  const value = await producer();
  store.set(key, { value, expiresAt: Date.now() + ttl });

  return value;
}

export function clearCache() {
  store.clear();
}
