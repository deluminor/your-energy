import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const SEARCH_PATH = '../../src/components/search/search.client.js';
const STORE_PATH = '../../src/services/store.service.js';

/** @type {HTMLFormElement} */
let root;
/** @type {HTMLInputElement} */
let input;
/** @type {() => void} */
let teardown = () => {};
/** @type {typeof import('../../src/services/store.service.js')} */
let store;

async function setup() {
  localStorage.clear();
  vi.resetModules();

  store = await import(STORE_PATH);
  const { initSearch } = await import(SEARCH_PATH);

  root = document.createElement('form');
  root.setAttribute('data-component', 'search');
  input = document.createElement('input');
  input.className = 'search__input';
  root.append(input);
  document.body.append(root);

  teardown = initSearch(root);
}

describe('search island', () => {
  beforeEach(setup);

  afterEach(() => {
    teardown();
    root.remove();
  });

  it('is hidden in the categories view and visible once a category is set', () => {
    expect(root.hidden).toBe(true);

    store.setState({ category: { name: 'waist', filter: 'bodypart' } });

    expect(root.hidden).toBe(false);
  });

  it('submits a normalized keyword and resets to page 1', () => {
    store.setState({
      category: { name: 'waist', filter: 'bodypart' },
      page: 4,
    });

    input.value = '  push   up  ';
    root.dispatchEvent(new Event('submit', { cancelable: true }));

    const state = store.getState();
    expect(state.keyword).toBe('push up');
    expect(state.page).toBe(1);
    expect(input.value).toBe('push up');
  });

  it('does not dispatch when the keyword is unchanged', () => {
    store.setState({ category: { name: 'waist', filter: 'bodypart' } });
    input.value = '';

    const spy = vi.fn();
    const stop = store.subscribe(spy);
    root.dispatchEvent(new Event('submit', { cancelable: true }));
    stop();

    expect(spy).not.toHaveBeenCalled();
  });

  it('syncs the input value from the store keyword', () => {
    store.setState({
      category: { name: 'waist', filter: 'bodypart' },
      keyword: 'plank',
    });

    expect(input.value).toBe('plank');
  });
});
