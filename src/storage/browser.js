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

export async function loadState() {
  const storage = storageAccess();
  const raw = storage
    ? (storage.getItem(STATE_KEY) ?? storage.getItem(LEGACY_STATE_KEY))
    : (memoryGet(STATE_KEY) ?? memoryGet(LEGACY_STATE_KEY));
  if (!raw) return null;
  return JSON.parse(raw);
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
  const entries = await Promise.all([
    ['questions', './data/questions.json'],
    ['sessions', './data/sessions.json'],
    ['learn', './data/learn.json'],
    ['cases', './data/cases.json'],
    ['weights', './data/weights.json'],
  ].map(async ([name, url]) => {
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`);
    return [name, await response.json()];
  }));
  return Object.fromEntries(entries);
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
