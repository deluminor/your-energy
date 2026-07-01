import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const FILTERS_PATH = '../../src/components/filters/filters.client.js';
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
  const { initFilters } = await import(FILTERS_PATH);

  root = document.createElement('div');
  document.body.append(root);
  teardown = initFilters(root);
}

/** @param {string} label @returns {HTMLElement} */
function tabByLabel(label) {
  const tab = [...root.querySelectorAll('[data-filter]')].find(
    (el) => el.getAttribute('data-filter') === label,
  );
  return /** @type {HTMLElement} */ (tab);
}

describe('filters island', () => {
  beforeEach(setup);

  afterEach(() => {
    teardown();
    root.remove();
  });

  it('renders the three filter tabs', () => {
    const labels = [...root.querySelectorAll('[data-filter]')].map((el) =>
      el.getAttribute('data-filter'),
    );

    expect(labels).toEqual(['Muscles', 'Body parts', 'Equipment']);
  });

  it('marks the active filter tab', () => {
    const active = root.querySelector('.filters__tab--active');

    expect(active?.getAttribute('data-filter')).toBe('Muscles');
    expect(active?.getAttribute('aria-pressed')).toBe('true');
  });

  it('selecting a tab updates the filter and resets navigation state', () => {
    store.setState({ page: 4, category: { name: 'abs', filter: 'bodypart' } });

    tabByLabel('Equipment').click();

    const state = store.getState();
    expect(state.activeFilter).toBe('Equipment');
    expect(state.page).toBe(1);
    expect(state.category).toBeNull();
    expect(state.keyword).toBe('');
  });

  it('re-renders the active tab after a change', () => {
    tabByLabel('Body parts').click();

    const active = root.querySelector('.filters__tab--active');
    expect(active?.getAttribute('data-filter')).toBe('Body parts');
  });

  it('clicking the already active tab is a no-op', () => {
    const listener = vi.fn();
    const stop = store.subscribe(listener);

    tabByLabel('Muscles').click();

    expect(listener).not.toHaveBeenCalled();
    stop();
  });
});
