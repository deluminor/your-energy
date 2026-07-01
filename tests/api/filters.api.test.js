import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/api/instance.js', () => ({
  http: { get: vi.fn() },
}));

import { getFilters } from '../../src/api/filters.api.js';
import { http } from '../../src/api/instance.js';

const getMock = vi.mocked(http.get);

describe('getFilters', () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it('requests /filters with default page and category limit', async () => {
    getMock.mockResolvedValue({
      data: { results: [{ name: 'biceps' }], page: 1, totalPages: 4 },
    });

    const result = await getFilters({ filter: 'Muscles' });

    expect(getMock).toHaveBeenCalledWith('/filters', {
      params: { filter: 'Muscles', page: 1, limit: 12 },
      meta: { loader: undefined },
    });
    expect(result).toEqual({
      results: [{ name: 'biceps' }],
      page: 1,
      totalPages: 4,
    });
  });

  it('forwards page and loader target', async () => {
    getMock.mockResolvedValue({
      data: { results: [], page: 2, totalPages: 2 },
    });

    await getFilters(
      { filter: 'Equipment', page: 2 },
      { loader: '[data-component="category-list"]' },
    );

    expect(getMock).toHaveBeenCalledWith('/filters', {
      params: { filter: 'Equipment', page: 2, limit: 12 },
      meta: { loader: '[data-component="category-list"]' },
    });
  });

  it('normalizes string page metadata from the API', async () => {
    getMock.mockResolvedValue({
      data: { results: [], page: '3', totalPages: '7' },
    });

    const result = await getFilters({ filter: 'Body parts', page: 3 });

    expect(result.page).toBe(3);
    expect(result.totalPages).toBe(7);
  });

  it('rejects when the payload shape is invalid', async () => {
    getMock.mockResolvedValue({ data: { results: 'nope' } });

    await expect(getFilters({ filter: 'Muscles' })).rejects.toThrow(
      /results must be an array/,
    );
  });
});
