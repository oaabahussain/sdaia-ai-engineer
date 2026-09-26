import { STORAGE } from '../config.js';import { getOrCreateAnonId } from './identity.js';import { migrateState } from '../state/migrate.js';
const adapter=STORAGE==='api'?await import('./api.js'):await import('./browser.js');
export async function loadState(context){const raw=await adapter.loadState();const state=migrateState(raw,{anonId:getOrCreateAnonId(),...context});await adapter.saveState(state);return state}
export function saveState(state){return adapter.saveState(state)}export function loadBank(){return adapter.loadBank()}export function submitFeedback(item){return adapter.submitFeedback(item)}export function logEvent(evt){return adapter.logEvent(evt)}
