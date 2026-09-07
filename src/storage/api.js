import { API_BASE } from '../config.js';

const VERSION = new Map();
const ANON_KEY = 'sdaia.anon_id.v1';
const base = () => (globalThis.__SDAIA_API_BASE__ || API_BASE).replace(/\/$/, '');

function anonId() {
  try {
    const existing = globalThis.localStorage?.getItem(ANON_KEY);
    if (existing) return existing;
    const created = globalThis.crypto?.randomUUID?.();
    if (!created) throw new Error('crypto.randomUUID is required for API storage');
    globalThis.localStorage?.setItem(ANON_KEY, created);
    return created;
  } catch (error) {
    if (!globalThis.__sdaiaAnonId) globalThis.__sdaiaAnonId = globalThis.crypto?.randomUUID?.();
    if (!globalThis.__sdaiaAnonId) throw error;
    return globalThis.__sdaiaAnonId;
  }
}

async function request(path, options = {}) {
  const id = anonId();
  const response = await fetch(`${base()}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', 'X-Anon-Id': id, ...(options.headers || {}) },
  });
  return { response, id };
}

export async function loadState() {
  const id = anonId();
  const { response } = await request(`/progress/${id}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Progress load failed: ${response.status}`);
  VERSION.set(id, Number(response.headers.get('etag') || 0));
  return response.json();
}

export async function saveState(state) {
  const id = state.anon_id || anonId();
  if (id !== anonId()) throw new Error('State anonymous ID does not match adapter ID');
  const expected = VERSION.get(id) ?? 0;
  const { response } = await request(`/progress/${id}`, { method: 'PUT', headers: { 'If-Match': String(expected) }, body: JSON.stringify(state) });
  if (response.status === 409) throw new Error('Progress version conflict');
  if (!response.ok) throw new Error(`Progress save failed: ${response.status}`);
  VERSION.set(id, Number(response.headers.get('etag') || expected + 1));
}

export async function loadBank() {
  const { response } = await request('/bank');
  if (!response.ok) throw new Error(`Bank load failed: ${response.status}`);
  return response.json();
}

export async function submitFeedback(item) {
  const { response } = await request('/feedback', { method: 'POST', body: JSON.stringify(item) });
  if (!response.ok) throw new Error(`Feedback submit failed: ${response.status}`);
  return response.json();
}

export async function logEvent(evt) {
  const item = { ...evt, created_at: evt.created_at || new Date().toISOString(), payload: evt.payload || {} };
  const { response } = await request('/events', { method: 'POST', body: JSON.stringify([item]) });
  if (!response.ok) throw new Error(`Event submit failed: ${response.status}`);
}
