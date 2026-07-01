import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/api/instance.js', () => ({
  http: { get: vi.fn(), patch: vi.fn() },
}));

import { getExerciseById, getExercises } from '../../src/api/exercises.api.js';
import { http } from '../../src/api/instance.js';

const getMock = vi.mocked(http.get);

describe('getExercises', () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it('sends all filter params with exercise page limit defaults', async () => {
    getMock.mockResolvedValue({
      data: { results: [], page: 1, totalPages: 1 },
    });

    await getExercises({ muscles: 'biceps' });

    expect(getMock).toHaveBeenCalledWith('/exercises', {
      params: {
        bodypart: '',
        muscles: 'biceps',
        equipment: '',
        keyword: '',
        page: 1,
        limit: 10,
      },
      meta: { loader: undefined },
    });
  });

  it('forwards keyword, page and loader', async () => {
    getMock.mockResolvedValue({
      data: { results: [], page: 2, totalPages: 3 },
    });

    await getExercises(
      { bodypart: 'waist', keyword: 'plank', page: 2 },
      { loader: 'silent' },
    );

    expect(getMock).toHaveBeenCalledWith('/exercises', {
      params: {
        bodypart: 'waist',
        muscles: '',
        equipment: '',
        keyword: 'plank',
        page: 2,
        limit: 10,
      },
      meta: { loader: 'silent' },
    });
  });

  it('returns normalized pagination payload', async () => {
    getMock.mockResolvedValue({
      data: { results: [{ _id: '1' }], page: '1', totalPages: '5' },
    });

    const result = await getExercises();

    expect(result).toEqual({
      results: [{ _id: '1' }],
      page: 1,
      totalPages: 5,
    });
  });
});

describe('getExerciseById', () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it('requests the entity endpoint and returns the object', async () => {
    getMock.mockResolvedValue({ data: { _id: 'abc', name: 'Pull up' } });

    const result = await getExerciseById('abc');

    expect(getMock).toHaveBeenCalledWith('/exercises/abc', {
      meta: { loader: undefined },
    });
    expect(result).toEqual({ _id: 'abc', name: 'Pull up' });
  });

  it('rejects for a non-object payload', async () => {
    getMock.mockResolvedValue({ data: null });

    await expect(getExerciseById('abc')).rejects.toThrow(
      /invalid entity response/,
    );
  });
});
