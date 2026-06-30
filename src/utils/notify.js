import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

/** @type {import('izitoast').IziToastSettings} */
const BASE = { position: 'topRight', timeout: 4000 };

/** @param {string} message */
export function notifySuccess(message) {
  iziToast.success({ ...BASE, message });
}

/** @param {string} message */
export function notifyError(message) {
  iziToast.error({ ...BASE, message });
}

/** @param {string} message */
export function notifyInfo(message) {
  iziToast.info({ ...BASE, message });
}
