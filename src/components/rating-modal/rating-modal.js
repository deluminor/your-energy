import { rateExercise } from '../../api/exercises.api.js';
import { EMAIL_PATTERN, LOADER } from '../../utils/constants.js';
import { notifySuccess } from '../../utils/notify.js';
import { SPRITE_ICON, renderSpriteIcon } from '../../utils/sprite-icon.js';
import { setButtonLoading } from '../ui/button/button.js';
import { openModal } from '../ui/modal/modal.js';

const MAX_RATING = 5;

// The HTML `pattern` attribute is implicitly anchored, so drop the ^ / $ from
// the shared EMAIL_PATTERN and reuse the exact same contract for native validation.
const EMAIL_HTML_PATTERN = EMAIL_PATTERN.source
  .replace(/^\^/, '')
  .replace(/\$$/, '');

/**
 * Renders the five star radios in reverse order (5 → 1) so a checked radio can
 * light itself and every lower star through the CSS sibling combinator, while
 * `flex-direction: row-reverse` restores the visual 1 → 5 order.
 * @returns {string}
 */
function renderStars() {
  let markup = '';

  for (let value = MAX_RATING; value >= 1; value -= 1) {
    const id = `rating-star-${value}`;
    const icon = renderSpriteIcon(SPRITE_ICON.STAR, {
      className: 'rating-modal__star-icon',
      width: 24,
      height: 24,
    });

    markup += `
      <input
        class="rating-modal__radio visually-hidden"
        type="radio"
        id="${id}"
        name="rate"
        value="${value}"
        required
      />
      <label class="rating-modal__star" for="${id}">
        ${icon}
        <span class="visually-hidden">${value} ${value === 1 ? 'star' : 'stars'}</span>
      </label>`;
  }

  return markup;
}

/**
 * @returns {string} the modal body markup (form + fields)
 */
function renderContent() {
  return `
    <form class="rating-modal" data-rating-form>
      <p class="rating-modal__label">Rating</p>

      <div class="rating-modal__rating">
        <span class="rating-modal__value" data-rating-value>0.0</span>
        <fieldset class="rating-modal__stars">
          <legend class="visually-hidden">Choose a rating from 1 to 5</legend>
          ${renderStars()}
        </fieldset>
      </div>

      <label class="visually-hidden" for="rating-email">Email</label>
      <input
        class="rating-modal__input"
        id="rating-email"
        type="email"
        name="email"
        placeholder="Email"
        autocomplete="email"
        pattern="${EMAIL_HTML_PATTERN}"
        title="Enter a valid email address"
        required
      />

      <label class="visually-hidden" for="rating-comment">Your comment</label>
      <textarea
        class="rating-modal__input rating-modal__textarea"
        id="rating-comment"
        name="review"
        placeholder="Your comment"
        rows="4"
        required
      ></textarea>

      <button class="button rating-modal__send" type="submit" data-rating-submit>
        Send
      </button>
    </form>`;
}

/**
 * Sends the rating to the backend. On success the modal closes; on failure the
 * axios interceptor already shows the error toast, so we only keep the modal
 * open and re-enable the button for a retry.
 * @param {HTMLFormElement} form
 * @param {string} exerciseId
 * @param {() => void} close
 * @returns {Promise<void>}
 */
async function submitRating(form, exerciseId, close) {
  const submitButton = /** @type {HTMLButtonElement} */ (
    form.querySelector('[data-rating-submit]')
  );
  const data = new FormData(form);
  const payload = {
    rate: Number(data.get('rate')),
    email: String(data.get('email') ?? '').trim(),
    review: String(data.get('review') ?? '').trim(),
  };

  setButtonLoading(submitButton, true);

  try {
    await rateExercise(exerciseId, payload, { loader: LOADER.SILENT });
    notifySuccess('Thank you for your feedback!');
    close();
  } catch {
    setButtonLoading(submitButton, false);
  }
}

/**
 * Opens the rating modal for a given exercise. The shared modal shell closes any
 * open modal first (so the exercise modal steps aside) and calls `onClose` after
 * this one closes (so the caller can re-open the exercise modal).
 *
 * @param {object} [options]
 * @param {string} [options.exerciseId] - id of the exercise being rated
 * @param {() => void} [options.onClose] - fired after the rating modal closes
 * @returns {() => void} close function
 */
export function openRatingModal({ exerciseId, onClose } = {}) {
  const close = openModal({
    name: 'rating',
    label: 'Rate this exercise',
    content: renderContent(),
    onClose,
  });

  const root = document.getElementById('modal-root');
  const form = /** @type {HTMLFormElement | null} */ (
    root?.querySelector('[data-rating-form]') ?? null
  );
  if (!form) return close;

  const valueEl = /** @type {HTMLElement | null} */ (
    form.querySelector('[data-rating-value]')
  );

  form.addEventListener('change', (event) => {
    const target = /** @type {HTMLInputElement} */ (event.target);
    if (valueEl && target.name === 'rate') {
      valueEl.textContent = Number(target.value).toFixed(1);
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    submitRating(form, /** @type {string} */ (exerciseId), close);
  });

  return close;
}
