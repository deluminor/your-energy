import { beforeEach, describe, expect, it } from 'vitest';
import { STORAGE_KEYS } from '../../src/utils/constants.js';
import { readJSON, writeJSON } from '../../src/services/storage.service.js';

describe('url-state sync', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState(null, '', '/');
  });

  it('writes persisted UI state to URL when storage is updated', () => {
    writeJSON(STORAGE_KEYS.UI_STATE, {
      activeFilter: 'Body parts',
      page: 2,
      category: { name: 'abs', filter: 'bodypart' },
      keyword: 'plank',
    });

    const params = new URLSearchParams(window.location.search);

    expect(params.get('filter')).toBe('bodypart');
    expect(params.get('page')).toBe('2');
    expect(params.get('category')).toBe('abs');
    expect(params.get('keyword')).toBe('plank');
  });

  it('reads persisted UI state from URL and syncs it into localStorage', () => {
    window.history.replaceState(
      null,
      '',
      '/?filter=equipment&page=3&category=bench&keyword=press',
    );

    const state = readJSON(STORAGE_KEYS.UI_STATE, null);
    const raw = localStorage.getItem(STORAGE_KEYS.UI_STATE);

    expect(state).toEqual({
      activeFilter: 'Equipment',
      page: 3,
      category: { name: 'bench', filter: 'equipment' },
      keyword: 'press',
    });
    expect(JSON.parse(/** @type {string} */ (raw))).toEqual(state);
  });

  it('syncs existing localStorage UI state into URL when it is read', () => {
    localStorage.setItem(
      STORAGE_KEYS.UI_STATE,
      JSON.stringify({
        activeFilter: 'Equipment',
        page: 2,
        category: { name: 'rope', filter: 'equipment' },
        keyword: 'jump',
      }),
    );

    readJSON(STORAGE_KEYS.UI_STATE, null);

    const params = new URLSearchParams(window.location.search);

    expect(params.get('filter')).toBe('equipment');
    expect(params.get('page')).toBe('2');
    expect(params.get('category')).toBe('rope');
    expect(params.get('keyword')).toBe('jump');
  });

  it('omits empty UI state fields from URL', () => {
    window.history.replaceState(
      null,
      '',
      '/?filter=equipment&page=4&category=rope&keyword=jump',
    );

    writeJSON(STORAGE_KEYS.UI_STATE, {
      activeFilter: 'Muscles',
      page: 1,
      category: null,
      keyword: '',
    });

    const params = new URLSearchParams(window.location.search);

    expect(params.get('filter')).toBe('muscles');
    expect(params.get('page')).toBe('1');
    expect(params.has('category')).toBe(false);
    expect(params.has('keyword')).toBe(false);
  });

  it('uses empty URL values to clear nullable persisted UI fields', () => {
    localStorage.setItem(
      STORAGE_KEYS.UI_STATE,
      JSON.stringify({
        activeFilter: 'Muscles',
        page: 4,
        category: { name: 'abs', filter: 'muscles' },
        keyword: 'old',
      }),
    );
    window.history.replaceState(
      null,
      '',
      '/?filter=muscles&page=1&category=&keyword=',
    );

    expect(readJSON(STORAGE_KEYS.UI_STATE, null)).toEqual({
      activeFilter: 'Muscles',
      page: 1,
      category: null,
      keyword: '',
    });
  });
});
