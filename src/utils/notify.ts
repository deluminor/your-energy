import type { IziToastSettings } from 'izitoast';
import iziToast from 'izitoast';
import iziToastCssUrl from 'izitoast/dist/css/iziToast.min.css?url';

const BASE: IziToastSettings = { position: 'topRight', timeout: 4000 };

let toastCssLoaded = false;

function ensureToastCss(): void {
  if (toastCssLoaded || typeof document === 'undefined') return;

  toastCssLoaded = true;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = iziToastCssUrl;
  link.dataset.toastCss = 'true';
  document.head.appendChild(link);
}

export function notifySuccess(message: string): void {
  ensureToastCss();
  iziToast.success({ ...BASE, message });
}

export function notifyError(message: string): void {
  ensureToastCss();
  iziToast.error({ ...BASE, message });
}

export function notifyInfo(message: string): void {
  ensureToastCss();
  iziToast.info({ ...BASE, message });
}
