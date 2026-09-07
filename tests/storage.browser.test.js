import test from 'node:test';
import assert from 'node:assert/strict';

class FakeLocalStorage {
  constructor() { this.map = new Map(); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
}

test('browser adapter saves and loads state with localStorage', async () => {
  globalThis.localStorage = new FakeLocalStorage();
  globalThis.location = { protocol: 'https:' };
  const adapter = await import('../src/storage/browser.js');
  const state = { sample: true };
  await adapter.saveState(state);
  assert.deepEqual(await adapter.loadState(), state);
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
