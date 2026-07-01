import { beforeEach, describe, expect, it, vi } from 'vitest';
import { STORAGE_KEYS } from '../../src/utils/constants.js';

const STORE_PATH = '../../src/services/store.service.js';

/**
 * @param {Record<string, unknown> | null} persisted
 * @returns {Promise<typeof import('../../src/services/store.service.js')>}
 */
async function loadStore(persisted) {
  localStorage.clear();

  if (persisted) {
    localStorage.setItem(STORAGE_KEYS.UI_STATE, JSON.stringify(persisted));
  }

  vi.resetModules();
  return import(STORE_PATH);
}

describe('store.service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('exposes defaults when storage is empty', async () => {
    const { getState } = await loadStore(null);
    const state = getState();

    expect(state.activeFilter).toBe('Muscles');
    expect(state.page).toBe(1);
    expect(state.category).toBeNull();
    expect(state.totalPages).toBe(1);
    expect(state.keyword).toBe('');
  });

  it('hydrates persisted keys from localStorage', async () => {
    const { getState } = await loadStore({
      activeFilter: 'Body parts',
      page: 3,
      category: { name: 'abs', filter: 'bodypart' },
      keyword: 'plank',
    });
    const state = getState();

    expect(state.activeFilter).toBe('Body parts');
    expect(state.page).toBe(3);
    expect(state.category).toEqual({ name: 'abs', filter: 'bodypart' });
    expect(state.keyword).toBe('plank');
  });

  it('ignores malformed persisted fields', async () => {
    const { getState } = await loadStore({
      activeFilter: 42,
      page: 0,
      category: { name: 'abs' },
    });
    const state = getState();

    expect(state.activeFilter).toBe('Muscles');
    expect(state.page).toBe(1);
    expect(state.category).toBeNull();
  });

  it('returns a frozen snapshot', async () => {
    const { getState } = await loadStore(null);
    const state = getState();

    expect(Object.isFrozen(state)).toBe(true);
  });

  it('persists persisted keys through setState', async () => {
    const { setState } = await loadStore(null);

    setState({ activeFilter: 'Equipment', page: 2 });

    const raw = localStorage.getItem(STORAGE_KEYS.UI_STATE);
    expect(raw).not.toBeNull();
    expect(JSON.parse(/** @type {string} */ (raw))).toMatchObject({
      activeFilter: 'Equipment',
      page: 2,
    });
  });

  it('does NOT persist when only totalPages changes', async () => {
    const { setState } = await loadStore(null);

    setState({ totalPages: 9 });

    expect(localStorage.getItem(STORAGE_KEYS.UI_STATE)).toBeNull();
  });

  it('notifies subscribers with the new frozen state', async () => {
    const { setState, subscribe } = await loadStore(null);
    const listener = vi.fn();

    const stop = subscribe(listener);
    setState({ page: 5 });

    expect(listener).toHaveBeenCalledOnce();
    const received = listener.mock.calls[0][0];
    expect(received.page).toBe(5);
    expect(Object.isFrozen(received)).toBe(true);

    stop();
  });

  it('stops notifying after unsubscribe', async () => {
    const { setState, subscribe } = await loadStore(null);
    const listener = vi.fn();

    const stop = subscribe(listener);
    stop();
    setState({ page: 7 });

    expect(listener).not.toHaveBeenCalled();
  });
});
