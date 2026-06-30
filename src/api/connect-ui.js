import { hideLoader, showLoader } from '../components/ui/loader/loader.js';
import { onApiEvent } from '../utils/api-events.js';
import { API_EVENT } from '../utils/constants.js';
import { notifyError } from '../utils/notify.js';

let connected = false;

export function connectApiUi() {
  if (connected) return;
  connected = true;

  onApiEvent(API_EVENT.LOADER_SHOW, (mode) =>
    showLoader(/** @type {string | undefined} */ (mode)),
  );
  onApiEvent(API_EVENT.LOADER_HIDE, (mode) =>
    hideLoader(/** @type {string | undefined} */ (mode)),
  );
  onApiEvent(API_EVENT.NOTIFY_ERROR, (message) =>
    notifyError(/** @type {string} */ (message)),
  );
}
