import { describe, expect, it } from 'vitest';
import {
  normalizeEntity,
  normalizePaginated,
  normalizeQuote,
} from '../../src/api/normalizers.js';

describe('normalizePaginated', () => {
  it('returns results with numeric page metadata', () => {
    const result = normalizePaginated({
      results: [{ id: 1 }],
      page: 2,
      totalPages: 5,
    });

    expect(result).toEqual({
      results: [{ id: 1 }],
      page: 2,
      totalPages: 5,
    });
  });

  it('coerces string page metadata (real /filters contract)', () => {
    const result = normalizePaginated({
      results: [],
      page: '3',
      totalPages: '10',
    });

    expect(result.page).toBe(3);
    expect(result.totalPages).toBe(10);
    expect(typeof result.page).toBe('number');
  });

  it('throws when body is not an object', () => {
    expect(() => normalizePaginated(null)).toThrow(
      /invalid paginated response/,
    );
    expect(() => normalizePaginated([])).toThrow(/invalid paginated response/);
    expect(() => normalizePaginated('x')).toThrow(/invalid paginated response/);
  });

  it('throws when results is not an array', () => {
    expect(() =>
      normalizePaginated({ results: {}, page: 1, totalPages: 1 }),
    ).toThrow(/results must be an array/);
  });

  it('throws when page metadata is not numeric', () => {
    expect(() =>
      normalizePaginated({ results: [], page: 'abc', totalPages: 1 }),
    ).toThrow(/page metadata must be numeric/);
    expect(() =>
      normalizePaginated({ results: [], page: 1, totalPages: undefined }),
    ).toThrow(/page metadata must be numeric/);
  });
});

describe('normalizeQuote', () => {
  it('returns author and quote strings', () => {
    expect(normalizeQuote({ author: 'A', quote: 'Q' })).toEqual({
      author: 'A',
      quote: 'Q',
    });
  });

  it('ignores extra fields', () => {
    const result = normalizeQuote({ author: 'A', quote: 'Q', _id: 'x' });
    expect(result).toEqual({ author: 'A', quote: 'Q' });
  });

  it('throws when author or quote is missing', () => {
    expect(() => normalizeQuote({ author: 'A' })).toThrow(
      /must include author and quote/,
    );
    expect(() => normalizeQuote({ quote: 'Q' })).toThrow(
      /must include author and quote/,
    );
    expect(() => normalizeQuote({ author: 1, quote: 2 })).toThrow(
      /must include author and quote/,
    );
  });

  it('throws when body is not an object', () => {
    expect(() => normalizeQuote(null)).toThrow(/invalid quote response/);
  });
});

describe('normalizeEntity', () => {
  it('passes through a plain object', () => {
    const entity = { _id: '1', name: 'x' };
    expect(normalizeEntity(entity)).toBe(entity);
  });

  it('throws for non-object payloads', () => {
    expect(() => normalizeEntity(null)).toThrow(/invalid entity response/);
    expect(() => normalizeEntity([])).toThrow(/invalid entity response/);
  });
});
