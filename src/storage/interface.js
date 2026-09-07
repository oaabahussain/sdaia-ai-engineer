import { STORAGE } from '../config.js';

const adapter = STORAGE === 'api'
  ? await import('./api.js')
  : await import('./browser.js');

/** @returns {Promise<State|null>} */
export function loadState() { return adapter.loadState(); }
/** @param {State} state @returns {Promise<void>} */
export function saveState(state) { return adapter.saveState(state); }
/** @returns {Promise<Bank>} */
export function loadBank() { return adapter.loadBank(); }
/** @param {Feedback} item @returns {Promise<{ok:boolean, ref?:string}>} */
export function submitFeedback(item) { return adapter.submitFeedback(item); }
/** @param {Event} evt @returns {Promise<void>} */
export function logEvent(evt) { return adapter.logEvent(evt); }
