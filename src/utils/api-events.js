/**
 * @typedef {import('./constants.js').API_EVENT[keyof typeof import('./constants.js').API_EVENT]} ApiEventType
 */

/** @type {Map<ApiEventType, Set<(...args: unknown[]) => void>>} */
const listeners = new Map();

/**
 * @param {ApiEventType} type
 * @param {(...args: unknown[]) => void} handler
 * @returns {() => void}
 */
export function onApiEvent(type, handler) {
  let set = listeners.get(type);

  if (!set) {
    set = new Set();
    listeners.set(type, set);
  }

  set.add(handler);

  return () => listeners.get(type)?.delete(handler);
}

/**
 * @param {ApiEventType} type
 * @param {...unknown} args
 */
export function emitApiEvent(type, ...args) {
  listeners.get(type)?.forEach((handler) => handler(...args));
}
