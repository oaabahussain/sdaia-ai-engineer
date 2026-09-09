import test from 'node:test';
import assert from 'node:assert/strict';

class FakeLocalStorage {
  constructor() { this.map = new Map(); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
}

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

test('browser adapter saves and loads state with localStorage', async () => {
  globalThis.localStorage = new FakeLocalStorage();
  globalThis.location = { protocol: 'https:' };
  const adapter = await import('../src/storage/browser.js');
  const state = { sample: true };
  await adapter.saveState(state);
  const loaded = await adapter.loadState();
  assert.equal(loaded.sample, true);
  assert.match(loaded.anon_id, UUID_V4);
  assert.ok(Number.isFinite(Date.parse(loaded.created_at)));
});

test('browser adapter bootstraps a fresh state before app startup', async () => {
  globalThis.localStorage = new FakeLocalStorage();
  globalThis.location = { protocol: 'https:' };
  const adapter = await import('../src/storage/browser.js');
  const loaded = await adapter.loadState();
  assert.match(loaded.anon_id, UUID_V4);
  assert.ok(Number.isFinite(Date.parse(loaded.created_at)));
  assert.equal(loaded.updated_at, loaded.created_at);
  assert.ok(globalThis.localStorage.getItem('sdaia.state.v1'));
});

test('browser adapter recovers from unreadable saved state', async () => {
  globalThis.localStorage = new FakeLocalStorage();
  globalThis.location = { protocol: 'https:' };
  globalThis.localStorage.setItem('sdaia.state.v1', '{broken-json');
  const adapter = await import('../src/storage/browser.js');
  const loaded = await adapter.loadState();
  assert.match(loaded.anon_id, UUID_V4);
  assert.doesNotThrow(() => JSON.parse(globalThis.localStorage.getItem('sdaia.state.v1')));
});

test('browser adapter loads the study bank over fetch', async () => {
  globalThis.localStorage = new FakeLocalStorage();
  globalThis.location = { protocol: 'https:' };
  globalThis.fetch = async (url) => ({ ok: true, json: async () => ({ url }) });
  const adapter = await import('../src/storage/browser.js');
  const bank = await adapter.loadBank();
  assert.equal(Object.keys(bank).length, 5);
  assert.equal(bank.questions.url, './data/questions.json');
});

test('browser adapter falls back to the inline bank when network loading fails', async () => {
  globalThis.localStorage = new FakeLocalStorage();
  globalThis.location = { protocol: 'https:' };
  globalThis.fetch = async () => { throw new Error('offline'); };
  const inline = {
    questions: [{ id: 'q1' }],
    sessions: [],
    learn: {},
    cases: [],
    weights: { sample: 100 },
  };
  globalThis.document = {
    getElementById(id) {
      return id === 'inline-bank' ? { textContent: JSON.stringify(inline) } : null;
    },
  };
  const adapter = await import('../src/storage/browser.js');
  assert.deepEqual(await adapter.loadBank(), inline);
});
