import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/api/instance.js', () => ({
  http: { patch: vi.fn() },
}));

vi.mock('../../src/utils/notify.js', () => ({
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
  notifyInfo: vi.fn(),
}));

import { openRatingModal } from '../../src/components/rating-modal/rating-modal.js';
import { http } from '../../src/api/instance.js';
import { notifySuccess } from '../../src/utils/notify.js';

const patchMock = vi.mocked(http.patch);

/** @returns {HTMLFormElement} */
function getForm() {
  return /** @type {HTMLFormElement} */ (
    document.querySelector('[data-rating-form]')
  );
}

/**
 * Fills every required field so a submit passes validation.
 * @param {HTMLFormElement} form
 */
function fillForm(form) {
  const radio = /** @type {HTMLInputElement} */ (
    form.querySelector('input[name="rate"][value="4"]')
  );
  radio.checked = true;
  radio.dispatchEvent(new Event('change', { bubbles: true }));

  /** @type {HTMLInputElement} */ (
    form.querySelector('input[name="email"]')
  ).value = 'user@mail.com';
  /** @type {HTMLTextAreaElement} */ (
    form.querySelector('textarea[name="review"]')
  ).value = 'Great exercise!';
}

describe('rating modal', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="modal-root"></div>';
    patchMock.mockReset();
  });

  it('renders the form with the five star radios and required fields', () => {
    openRatingModal({ exerciseId: 'abc' });
    const form = getForm();

    expect(form).toBeTruthy();
    expect(form.querySelectorAll('input[name="rate"]')).toHaveLength(5);
    expect(
      form.querySelector('input[name="email"]')?.hasAttribute('required'),
    ).toBe(true);
    expect(
      form.querySelector('textarea[name="review"]')?.hasAttribute('required'),
    ).toBe(true);
  });

  it('updates the displayed value when a star is selected', () => {
    openRatingModal({ exerciseId: 'abc' });
    const form = getForm();

    const radio = /** @type {HTMLInputElement} */ (
      form.querySelector('input[name="rate"][value="3"]')
    );
    radio.checked = true;
    radio.dispatchEvent(new Event('change', { bubbles: true }));

    expect(form.querySelector('[data-rating-value]')?.textContent).toBe('3.0');
  });

  it('submits the rating and closes the modal on success', async () => {
    patchMock.mockResolvedValue({ data: { _id: 'abc' } });
    const onClose = vi.fn();

    openRatingModal({ exerciseId: 'abc', onClose });
    const form = getForm();
    fillForm(form);

    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await vi.waitFor(() => expect(notifySuccess).toHaveBeenCalled());

    expect(patchMock).toHaveBeenCalledWith(
      '/exercises/abc/rating',
      { rate: 4, email: 'user@mail.com', review: 'Great exercise!' },
      { meta: { loader: 'silent' } },
    );
    expect(document.getElementById('modal-root')?.innerHTML).toBe('');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('keeps the modal open and re-enables the button on a backend error', async () => {
    patchMock.mockRejectedValue(new Error('boom'));
    const onClose = vi.fn();

    openRatingModal({ exerciseId: 'abc', onClose });
    const form = getForm();
    fillForm(form);

    form.dispatchEvent(new Event('submit', { cancelable: true }));

    const button = /** @type {HTMLButtonElement} */ (
      form.querySelector('[data-rating-submit]')
    );
    await vi.waitFor(() => expect(button.disabled).toBe(false));

    expect(patchMock).toHaveBeenCalled();
    expect(getForm()).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();
  });
});
