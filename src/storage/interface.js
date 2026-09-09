import { STORAGE } from '../config.js';

const adapter = STORAGE === 'api'
  ? await import('./api.js')
  : await import('./browser.js');

function uuidV4() {
  return globalThis.crypto?.randomUUID?.()
    ?? '00000000-0000-4000-8000-' + Math.random().toString(16).slice(2, 14).padEnd(12, '0').slice(0, 12);
}

function bootstrapState(value) {
  const state = value && typeof value === 'object' && !Array.isArray(value) ? { ...value } : {};
  const createdAt = state.created_at || new Date().toISOString();
  state.anon_id = state.anon_id || uuidV4();
  state.created_at = createdAt;
  state.updated_at = state.updated_at || createdAt;
  return state;
}

/** @returns {Promise<State>} */
export async function loadState() { return bootstrapState(await adapter.loadState()); }
/** @param {State} state @returns {Promise<void>} */
export function saveState(state) { return adapter.saveState(state); }
/** @returns {Promise<Bank>} */
export function loadBank() { return adapter.loadBank(); }
/** @param {Feedback} item @returns {Promise<{ok:boolean, ref?:string}>} */
export function submitFeedback(item) { return adapter.submitFeedback(item); }
/** @param {Event} evt @returns {Promise<void>} */
export function logEvent(evt) { return adapter.logEvent(evt); }
