import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const PAGINATION_PATH = '../../src/components/pagination/pagination.client.js';
const STORE_PATH = '../../src/services/store.service.js';

/** @type {HTMLElement} */
let root;
/** @type {() => void} */
let teardown = () => {};
/** @type {typeof import('../../src/services/store.service.js')} */
let store;

async function setup() {
  localStorage.clear();
  vi.resetModules();

  store = await import(STORE_PATH);
  const { initPagination } = await import(PAGINATION_PATH);

  root = document.createElement('nav');
  document.body.append(root);
  teardown = initPagination(root);
}

/** @returns {number[]} */
function renderedPages() {
  return [...root.querySelectorAll('[data-page]')].map((el) =>
    Number(el.getAttribute('data-page')),
  );
}

describe('pagination island', () => {
  beforeEach(setup);

  afterEach(() => {
    teardown();
    root.remove();
  });

  it('is hidden when there is a single page', () => {
    store.setState({ page: 1, totalPages: 1 });

    expect(root.hidden).toBe(true);
    expect(root.innerHTML).toBe('');
  });

  it('renders plain numbers without arrows for <= 3 pages', () => {
    store.setState({ page: 1, totalPages: 3 });

    expect(root.hidden).toBe(false);
    expect(renderedPages()).toEqual([1, 2, 3]);
    expect(root.querySelector('[data-action]')).toBeNull();
  });

  it('shows a leading window with trailing ellipsis near the start', () => {
    store.setState({ page: 1, totalPages: 5 });

    expect(renderedPages()).toEqual([1, 2, 3]);
    expect(root.querySelector('.pagination__ellipsis')).not.toBeNull();
    expect(root.querySelector('[data-action="next"]')).not.toBeNull();
  });

  it('shows a centered window in the middle', () => {
    store.setState({ page: 3, totalPages: 5 });

    expect(renderedPages()).toEqual([2, 3, 4]);
    expect(root.querySelectorAll('.pagination__ellipsis')).toHaveLength(2);
  });

  it('marks the active page with aria-current', () => {
    store.setState({ page: 2, totalPages: 3 });

    const active = root.querySelector('.pagination__page--active');
    expect(active?.getAttribute('data-page')).toBe('2');
    expect(active?.getAttribute('aria-current')).toBe('page');
  });

  it('sets the store page when a number button is clicked', () => {
    store.setState({ page: 1, totalPages: 5 });

    const target = [...root.querySelectorAll('[data-page]')].find(
      (el) => el.getAttribute('data-page') === '2',
    );
    /** @type {HTMLElement} */ (target).click();

    expect(store.getState().page).toBe(2);
  });

  it('advances the page when the next arrow is clicked', () => {
    store.setState({ page: 1, totalPages: 5 });

    /** @type {HTMLElement} */ (
      root.querySelector('[data-action="next"]')
    ).click();

    expect(store.getState().page).toBe(2);
  });

  it('does not change the page when clicking the current one', () => {
    store.setState({ page: 2, totalPages: 5 });

    const current = root.querySelector('.pagination__page--active');
    /** @type {HTMLElement} */ (current).click();

    expect(store.getState().page).toBe(2);
  });
});
