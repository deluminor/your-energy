/**
 * Client entry for the category-list island. Owns the categories grid — fetch
 * categories (api/filters), render cards via the `ui/` primitives, and on click
 * set the selected category in the store (services/store) to switch to the
 * exercises view. See `quote/quote.client.js` for the reference pattern.
 *
 * Teardown contract: capture the `subscribe()` unsubscribe fn and return a
 * teardown that calls it (see `services/store.service.js`) so store listeners
 * do not accumulate across re-init.
 *
 * @param {HTMLElement | null} root
 * @returns {() => void} teardown
 */
export function initCategoryList(root) {
  if (!root) return () => {};

  return () => {};
}
