import { SPRITE_ICON, renderSpriteIcon } from '../../../utils/sprite-icon.js';

const ROOT_ID = 'modal-root';
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** @type {null | (() => void)} */
let activeClose = null;

/**
 * Centralized modal shell. Renders the backdrop + dialog + close button into
 * `#modal-root` and handles the full accessibility lifecycle:
 * - closes on the X button, backdrop click, and Escape;
 * - locks body scroll while open and restores it on close;
 * - moves focus into the dialog, traps Tab/Shift+Tab inside it, and returns
 *   focus to the element that was focused before opening;
 * - removes its listeners on close.
 *
 * Opening a modal while another is open closes the first (e.g. the rating modal
 * opening over the exercise modal). Feature modals only provide their inner
 * `content` — no shell duplication.
 *
 * @param {object} options
 * @param {string} options.name - modal id for the `data-modal` attribute
 * @param {string} [options.label] - accessible name for the dialog (`aria-label`)
 * @param {string} [options.content] - inner HTML of the dialog body (pre-escaped by the caller)
 * @param {() => void} [options.onClose] - callback fired after the modal closes
 * @returns {() => void} close function
 */
export function openModal({ name, label, content = '', onClose }) {
  const root = /** @type {HTMLElement} */ (document.getElementById(ROOT_ID));
  if (!root) return () => {};

  const previouslyFocused = document.activeElement;
  if (activeClose) activeClose();

  const closeIconHtml = renderSpriteIcon(SPRITE_ICON.CLOSE || 'close', {
    className: 'modal__close-icon',
    width: '100%',
    height: '100%',
    stroke: true,
  });

  root.innerHTML = `
    <div class="modal" data-modal="${name}">
      <div class="modal__backdrop" data-close></div>
      <div class="modal__dialog" role="dialog" aria-modal="true" tabindex="-1">
        <button class="modal__close" type="button" data-close aria-label="Close">
          ${closeIconHtml}
        </button>
        ${content}
      </div>
    </div>`;

  const dialog = /** @type {HTMLElement} */ (
    root.querySelector('.modal__dialog')
  );
  if (label) dialog.setAttribute('aria-label', label);

  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  /** @returns {HTMLElement[]} visible, tabbable elements inside the dialog */
  function getFocusable() {
    const nodes = /** @type {NodeListOf<HTMLElement>} */ (
      dialog.querySelectorAll(FOCUSABLE_SELECTOR)
    );
    return Array.from(nodes).filter((el) => el.offsetParent !== null);
  }

  /** @param {KeyboardEvent} event */
  function trapFocus(event) {
    const items = getFocusable();

    if (items.length === 0) {
      event.preventDefault();
      dialog.focus();
      return;
    }

    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || !dialog.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /** @param {KeyboardEvent} event */
  function onKeydown(event) {
    if (event.key === 'Escape') {
      close();
      return;
    }

    if (event.key === 'Tab') trapFocus(event);
  }

  function close() {
    document.removeEventListener('keydown', onKeydown);
    document.body.style.overflow = previousOverflow;
    root.innerHTML = '';
    activeClose = null;

    if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();

    onClose?.();
  }

  root
    .querySelectorAll('[data-close]')
    .forEach((el) => el.addEventListener('click', close));
  document.addEventListener('keydown', onKeydown);

  (getFocusable()[0] ?? dialog).focus();

  activeClose = close;
  return close;
}

export function closeModal() {
  if (activeClose) activeClose();
}
