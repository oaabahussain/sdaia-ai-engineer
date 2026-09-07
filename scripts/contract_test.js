import assert from 'node:assert/strict';
import crypto from 'node:crypto';

const adapterName = process.argv[2];
if (!['browser', 'api'].includes(adapterName)) throw new Error('Usage: node scripts/contract_test.js browser|api');

class FakeLocalStorage {
  constructor() { this.map = new Map(); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
}

globalThis.localStorage = new FakeLocalStorage();
    const id = crypto.randomUUID();
globalThis.localStorage.setItem('sdaia.anon_id.v1', id);
globalThis.location = { protocol: 'https:' };

const now = new Date().toISOString();
const state = {
  version: 1, anon_id: id, created_at: now, updated_at: now,
  answers: [], review: [], bookmarks: [], notes: {},
  settings: { session_minutes: 20, exam_date: null, dark: false, focus: false },
  onboarded: false, profile: {}, answer_map: {}, attempts: {}, confidence: {}, mastered: {},
  review_map: {}, errors: {}, bookmark_map: {}, sessions: {}, activity: {}, diagnostic: {}, theme: 'auto', focus: false,
};

let adapter;
if (adapterName === 'browser') {
  const fs = await import('node:fs/promises');
  globalThis.fetch = async (url) => ({ ok: true, status: 200, json: async () => JSON.parse(await fs.readFile(new URL(`../${url.replace('./','')}`, import.meta.url), 'utf8')) });
  adapter = await import('../src/storage/browser.js');
} else {
  globalThis.__SDAIA_API_BASE__ = process.env.SDAIA_API_BASE || 'http://127.0.0.1:8000/v1';
  adapter = await import('../src/storage/api.js');
}

await adapter.saveState(state);
const loaded = await adapter.loadState();
assert.equal(loaded.anon_id, id);
const bank = await adapter.loadBank();
assert.equal(bank.questions.length, 121);
const feedback = await adapter.submitFeedback({ question_id: 'q1', issue_type: 'other', details: 'contract test' });
assert.equal(feedback.ok, true);
console.log(`${adapterName} adapter contract: PASS`);
