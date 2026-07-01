import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/api/exercises.api.js', () => ({
  getExercises: vi.fn(),
}));

const EXERCISE_LIST_PATH =
  '../../src/components/exercise-list/exercise-list.client.js';
const EXERCISES_API_PATH = '../../src/api/exercises.api.js';
const STORE_PATH = '../../src/services/store.service.js';

/** @type {HTMLElement} */
let root;
/** @type {() => void} */
let teardown = () => {};
/** @type {typeof import('../../src/services/store.service.js')} */
let store;
/** @type {ReturnType<typeof vi.fn>} */
let getExercises;

const SAMPLE = {
  results: [
    {
      _id: '1',
      name: 'air bike',
      rating: 4,
      burnedCalories: 312,
      bodyPart: 'waist',
      target: 'abs',
    },
    {
      _id: '2',
      name: '3/4 sit-up',
      rating: 5,
      burnedCalories: 220,
      bodyPart: 'waist',
      target: 'abs',
    },
  ],
  page: 1,
  totalPages: 3,
};

const WAIST = { name: 'waist', filter: 'bodypart' };

/**
 * @param {{ resolve?: unknown, reject?: Error, category?: { name: string, filter: string } | null }} behaviour
 */
async function setup({ resolve = SAMPLE, reject, category = WAIST } = {}) {
  localStorage.clear();
  vi.resetModules();
  vi.spyOn(console, 'error').mockImplementation(() => {});

  const api = await import(EXERCISES_API_PATH);
  getExercises = vi.mocked(api.getExercises);

  if (reject) {
    getExercises.mockRejectedValue(reject);
  } else {
    getExercises.mockResolvedValue(resolve);
  }

  store = await import(STORE_PATH);

  if (category) {
    store.setState({ activeFilter: 'Body parts', category, page: 1 });
  }

  const { initExerciseList } = await import(EXERCISE_LIST_PATH);

  root = document.createElement('ul');
  root.setAttribute('data-component', 'exercise-list');
  document.body.append(root);
  teardown = initExerciseList(root);
}

describe('exercise-list island', () => {
  afterEach(() => {
    teardown();
    root.remove();
    vi.restoreAllMocks();
  });

  it('stays hidden while no category is selected', async () => {
    await setup({ category: null });

    expect(root.hidden).toBe(true);
    expect(getExercises).not.toHaveBeenCalled();
  });

  it('loads exercises for the active filter + category and renders a card each', async () => {
    await setup();

    await vi.waitFor(() => {
      expect(root.querySelectorAll('.exercise-card')).toHaveLength(2);
    });

    expect(root.hidden).toBe(false);
    expect(getExercises).toHaveBeenCalledWith(
      { bodypart: 'waist', keyword: '', page: 1 },
      { loader: 'silent' },
    );
    expect(root.textContent).toContain('air bike');
  });

  it('shows an empty message when nothing is found', async () => {
    await setup({ resolve: { results: [], page: 1, totalPages: 1 } });

    await vi.waitFor(() => {
      expect(root.textContent).toContain('No exercises found');
    });
    expect(root.querySelector('.exercise-card')).toBeNull();
  });

  it('shows a failure state and logs when the request rejects', async () => {
    await setup({ reject: new Error('network down') });

    await vi.waitFor(() => {
      expect(root.textContent).toContain('Failed to load exercises.');
    });
    expect(console.error).toHaveBeenCalled();
  });

  it('reloads when the keyword changes', async () => {
    await setup();

    await vi.waitFor(() => {
      expect(getExercises).toHaveBeenCalledTimes(1);
    });

    store.setState({ keyword: 'plank', page: 1 });

    await vi.waitFor(() => {
      expect(getExercises).toHaveBeenCalledTimes(2);
    });
    expect(getExercises).toHaveBeenLastCalledWith(
      { bodypart: 'waist', keyword: 'plank', page: 1 },
      { loader: 'silent' },
    );
  });
});
