import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const BREADCRUMB_PATH = '../../src/components/breadcrumb/breadcrumb.client.js';
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
  const { initBreadcrumb } = await import(BREADCRUMB_PATH);

  root = document.createElement('h2');
  root.setAttribute('data-component', 'breadcrumb');
  document.body.append(root);
  teardown = initBreadcrumb(root);
}

describe('breadcrumb island', () => {
  beforeEach(setup);

  afterEach(() => {
    teardown();
    root.remove();
  });

  it('renders only "Exercises" in the categories view', () => {
    expect(root.textContent?.trim()).toBe('Exercises');
    expect(root.querySelector('.breadcrumb__category')).toBeNull();
  });

  it('renders the selected category in the exercises view', () => {
    store.setState({ category: { name: 'waist', filter: 'bodypart' } });

    expect(root.querySelector('.breadcrumb__category')?.textContent).toBe(
      'waist',
    );
    expect(root.querySelector('.breadcrumb__root--link')).not.toBeNull();
  });

  it('returns to the categories view when "Exercises" is clicked', () => {
    store.setState({
      category: { name: 'waist', filter: 'bodypart' },
      page: 3,
      keyword: 'plank',
    });

    /** @type {HTMLElement} */ (
      root.querySelector('.breadcrumb__root--link')
    ).click();

    const state = store.getState();
    expect(state.category).toBeNull();
    expect(state.page).toBe(1);
    expect(state.keyword).toBe('');
  });
});
