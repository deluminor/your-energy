import { getState, subscribe } from '../../services/store.service.js';

/**
 * @typedef {import('../../services/store.service.js').AppState} AppState
 * @typedef {[type: string, handler: EventListener]} IslandListener
 */

/**
 * @param {(state: Readonly<AppState>) => void} sync  Store-driven render/update.
 * @param {{ root?: EventTarget | null, listeners?: IslandListener[] }} [options]
 * @returns {() => void} teardown
 * @example
 * return bindStoreIsland(sync, { root, listeners: [['click', onClick]] });
 */
export function bindStoreIsland(sync, { root, listeners = [] } = {}) {
  const stop = subscribe(sync);

  sync(getState());

  for (const [type, handler] of listeners) {
    root?.addEventListener(type, handler);
  }

  return () => {
    stop();

    for (const [type, handler] of listeners) {
      root?.removeEventListener(type, handler);
    }
  };
}
