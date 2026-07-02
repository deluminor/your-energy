const VISIBLE_CLASS = 'scroll-up--visible';
const SHOW_AFTER_PX = 320;

/**

 * @param {HTMLElement | null} root
 * @returns {void}
 */
export function initScrollUp(root) {
  if (!root) return;

  const toggleVisibility = () => {
    const isVisible = window.scrollY > SHOW_AFTER_PX;

    root.classList.toggle(VISIBLE_CLASS, isVisible);
    root.setAttribute('aria-hidden', String(!isVisible));
    root.tabIndex = isVisible ? 0 : -1;
  };

  root.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', toggleVisibility, { passive: true });
  toggleVisibility();
}
