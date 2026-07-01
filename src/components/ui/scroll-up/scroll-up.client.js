const VISIBLE_CLASS = 'scroll-up--visible';
const SHOW_AFTER_PX = 320;

/**

 * @param {HTMLElement | null} root
 * @returns {void}
 */
export function initScrollUp(root) {
  if (!root) return;

  const toggleVisibility = () => {
    root.classList.toggle(VISIBLE_CLASS, window.scrollY > SHOW_AFTER_PX);
  };

  root.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', toggleVisibility, { passive: true });
  toggleVisibility();
}
