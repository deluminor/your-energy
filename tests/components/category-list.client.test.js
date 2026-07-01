import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/api/filters.api.js', () => ({
  getFilters: vi.fn(),
}));

const CATEGORY_LIST_PATH =
  '../../src/components/category-list/category-list.client.js';
const FILTERS_API_PATH = '../../src/api/filters.api.js';
const STORE_PATH = '../../src/services/store.service.js';

/** @type {HTMLElement} */
let root;
/** @type {() => void} */
let teardown = () => {};
/** @type {typeof import('../../src/services/store.service.js')} */
let store;
/** @type {ReturnType<typeof vi.fn>} */
let getFilters;

const SAMPLE = {
  results: [
    { name: 'biceps', filter: 'muscles', imgURL: 'https://cdn.test/b.jpg' },
    { name: 'triceps', filter: 'muscles', imgURL: 'https://cdn.test/t.jpg' },
  ],
  page: 1,
  totalPages: 1,
};

/**
 * @param {{ resolve?: unknown, reject?: Error }} behaviour
 */
async function setup({ resolve = SAMPLE, reject } = {}) {
  localStorage.clear();
  vi.resetModules();
  vi.spyOn(console, 'error').mockImplementation(() => {});

  const api = await import(FILTERS_API_PATH);
  getFilters = vi.mocked(api.getFilters);

  if (reject) {
    getFilters.mockRejectedValue(reject);
  } else {
    getFilters.mockResolvedValue(resolve);
  }

  store = await import(STORE_PATH);
  const { initCategoryList } = await import(CATEGORY_LIST_PATH);

  root = document.createElement('ul');
  root.setAttribute('data-component', 'category-list');
  document.body.append(root);
  teardown = initCategoryList(root);
}

describe('category-list island', () => {
  afterEach(() => {
    teardown();
    root.remove();
    vi.restoreAllMocks();
  });

  it('loads categories on init and renders a card per result', async () => {
    await setup();

    await vi.waitFor(() => {
      expect(root.querySelectorAll('.category-card')).toHaveLength(2);
    });

    expect(getFilters).toHaveBeenCalledWith(
      { filter: 'Muscles', page: 1 },
      { loader: 'silent' },
    );
    expect(root.textContent).toContain('biceps');
    expect(root.textContent).toContain('triceps');
  });

  it('shows an empty state when no categories are returned', async () => {
    await setup({ resolve: { results: [], page: 1, totalPages: 1 } });

    await vi.waitFor(() => {
      expect(root.textContent).toContain('No categories found.');
    });
    expect(root.querySelector('.category-card')).toBeNull();
  });

  it('shows a failure state and logs when the request rejects', async () => {
    await setup({ reject: new Error('network down') });

    await vi.waitFor(() => {
      expect(root.textContent).toContain('Failed to load categories.');
    });
    expect(console.error).toHaveBeenCalled();
  });

  it('stores the selected category when a card is clicked', async () => {
    await setup();

    await vi.waitFor(() => {
      expect(root.querySelector('.category-card')).not.toBeNull();
    });

    /** @type {HTMLElement} */ (root.querySelector('.category-card')).click();

    expect(store.getState().category).toEqual({
      name: 'biceps',
      filter: 'muscles',
    });
  });

  it('reloads when the active filter changes', async () => {
    await setup();

    await vi.waitFor(() => {
      expect(getFilters).toHaveBeenCalledTimes(1);
    });

    store.setState({ activeFilter: 'Equipment', page: 1 });

    await vi.waitFor(() => {
      expect(getFilters).toHaveBeenCalledTimes(2);
    });
    expect(getFilters).toHaveBeenLastCalledWith(
      { filter: 'Equipment', page: 1 },
      { loader: 'silent' },
    );
  });
});
