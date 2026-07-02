const OPEN_CLASS = 'mobile-menu--open';

/**
 * @param {HTMLElement | null} root
 * @returns {void}
 */
export function initHeader(root) {
  if (!root) return;

  const menu = root.querySelector('[data-menu]');
  const openBtn = root.querySelector('[data-menu-open]');
  const closeBtn = root.querySelector('[data-menu-close]');
  if (!menu || !openBtn) return;

  /**
   * @param {boolean} isLocked
   */
  const setScrollLock = (isLocked) => {
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    if (isLocked) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight =
        scrollbarWidth > 0 ? `${scrollbarWidth}px` : '';
      return;
    }

    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  };

  const open = () => {
    menu.classList.add(OPEN_CLASS);
    openBtn.setAttribute('aria-expanded', 'true');
    setScrollLock(true);
  };

  const close = () => {
    menu.classList.remove(OPEN_CLASS);
    openBtn.setAttribute('aria-expanded', 'false');
    setScrollLock(false);
  };

  openBtn.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);

  menu.addEventListener('click', (event) => {
    const target = event.target;

    if (target instanceof Element && target.closest('a')) close();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
}
