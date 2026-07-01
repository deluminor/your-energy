import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readJSON, writeJSON } from '../../src/services/storage.service.js';

const KEY = 'test:key';

describe('storage.service', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('writes and reads back a JSON value', () => {
    writeJSON(KEY, { a: 1, b: ['x'] });
    expect(readJSON(KEY, null)).toEqual({ a: 1, b: ['x'] });
  });

  it('returns fallback when the key is absent', () => {
    expect(readJSON('missing:key', 'fallback')).toBe('fallback');
  });

  it('returns fallback and logs when stored JSON is corrupt', () => {
    localStorage.setItem(KEY, '{not valid json');

    expect(readJSON(KEY, [])).toEqual([]);
    expect(console.error).toHaveBeenCalledOnce();
  });

  it('swallows write failures (e.g. quota exceeded) and logs', () => {
    const spy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

    expect(() => writeJSON(KEY, { big: 'payload' })).not.toThrow();
    expect(console.error).toHaveBeenCalledOnce();

    spy.mockRestore();
  });
});
