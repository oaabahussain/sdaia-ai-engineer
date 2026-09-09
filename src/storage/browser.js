import { CONCEPT_FILES } from '../logic/conceptFiles.js';
const STATE_KEY = 'sdaia.state.v1';
const LEGACY_STATE_KEY = 'sdaia_adaptive_v3';
const memory = new Map();

function storageAccess() {
  try {
    const key = '__sdaia_storage_probe__';
    globalThis.localStorage.setItem(key, '1');
    globalThis.localStorage.removeItem(key);
    return globalThis.localStorage;
  } catch (error) {
    return null;
  }
}

function memoryGet(key) { return memory.has(key) ? memory.get(key) : null; }
function memorySet(key, value) { memory.set(key, value); }
function memoryDelete(key) { memory.delete(key); }

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

function persistBootstrap(storage, state) {
  const raw = JSON.stringify(state);
  if (storage) storage.setItem(STATE_KEY, raw);
  else memorySet(STATE_KEY, raw);
}

export async function loadState() {
  const storage = storageAccess();
  const raw = storage
    ? (storage.getItem(STATE_KEY) ?? storage.getItem(LEGACY_STATE_KEY))
    : (memoryGet(STATE_KEY) ?? memoryGet(LEGACY_STATE_KEY));

  if (!raw) {
    const state = bootstrapState({});
    persistBootstrap(storage, state);
    return state;
  }

  try {
    const state = bootstrapState(JSON.parse(raw));
    persistBootstrap(storage, state);
    return state;
  } catch (error) {
    console.warn('Ignoring unreadable saved study state and starting clean.', error);
    if (storage) {
      storage.removeItem(STATE_KEY);
      storage.removeItem(LEGACY_STATE_KEY);
    } else {
      memoryDelete(STATE_KEY);
      memoryDelete(LEGACY_STATE_KEY);
    }
    const state = bootstrapState({});
    persistBootstrap(storage, state);
    return state;
  }
}

export async function saveState(state) {
  const raw = JSON.stringify(state);
  const storage = storageAccess();
  if (storage) storage.setItem(STATE_KEY, raw);
  else memorySet(STATE_KEY, raw);
}

function inlineBank() {
  const node = globalThis.document?.getElementById?.('inline-bank');
  if (!node?.textContent) throw new Error('Inline bank fallback is unavailable');
  return JSON.parse(node.textContent);
}

export async function loadBank() {
  const protocol = globalThis.location?.protocol ?? 'file:';
  if (protocol === 'file:') return inlineBank();

  try {
    const loadJson = async (url) => {
      const response = await fetch(url, { cache: 'no-cache' });
      if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`);
      return response.json();
    };
    const [conceptDocs, sessions, learn, cases, weights] = await Promise.all([
      Promise.all(CONCEPT_FILES.map(loadJson)),
      loadJson('./data/sessions.json'),
      loadJson('./data/learn.json'),
      loadJson('./data/cases.json'),
      loadJson('./data/weights.json'),
    ]);
    const concepts = Object.fromEntries(conceptDocs.map(doc => [doc.domain, doc.concepts]));
    return { concepts, sessions, learn, cases, weights };
  } catch (error) {
    console.warn('Network study bank unavailable; using the validated inline bank.', error);
    return inlineBank();
  }
}

export async function submitFeedback(item) {
  const questionId = String(item?.question_id ?? 'unknown');
  const issueType = String(item?.issue_type ?? 'other');
  const params = new URLSearchParams({
    template: 'question-report.yml',
    title: `Question report: ${questionId} [${issueType}]`,
    question_id: questionId,
    issue_type: issueType,
  });
  return { ok: true, ref: `https://github.com/oaabahussain/sdaia-ai-engineer/issues/new?${params.toString()}` };
}

export async function logEvent(_evt) {}
