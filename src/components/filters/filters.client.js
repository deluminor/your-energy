/**
 * Client entry for the filters island. Owns the filter tabs (Muscles / Body
 * parts / Equipment) — set the active filter in the store (services/store) and
 * subscribe to trigger a categories reload. See `quote/quote.client.js`.
 *
 * Teardown contract: capture the `subscribe()` unsubscribe fn and return a
 * teardown that calls it (see `services/store.service.js`) so store listeners
 * do not accumulate across re-init.
 *
 * @param {HTMLElement | null} root
 * @returns {() => void} teardown
 */
export function initFilters(root) {
  if (!root) return () => {};

  return () => {};
}
