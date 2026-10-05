import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture as nativeFixture, faultAdd, snapshot } from './helpers/k3AtomicCapture.js';

async function loadApi() {
  const [origin, capture] = await Promise.all([
    import('../src/evidence/origin.js').catch(() => ({})),
    import('../src/evidence/localCapture.js').catch(() => ({}))
  ]);
  return { ...origin, ...capture };
}

function memoryStorage({ blocked = false } = {}) {
  const values = new Map();
  return {
    getItem(key) {
      if (blocked) throw new Error('storage blocked');
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      if (blocked) throw new Error('storage blocked');
      values.set(key, String(value));
    },
    removeItem(key) {
      if (blocked) throw new Error('storage blocked');
      values.delete(key);
    }
  };
}

const definition = {
  event_name: 'learner.response.recorded',
  event_version: 1,
  required_context_fields: ['item_interaction_id'],
  payload_schema_ref: 'data/evidence/payload-schemas/response-recorded-v1.schema.json'
};

const runtimeBase = {
  track: { id: 'sdaia-ai-engineer', locales: ['en'] },
  evidence: { content_release_id: 'release-1' },
  eventDefinitions: [definition]
};

function input(overrides = {}) {
  return {
    learner_id: 'learner:p1',
    activity_id: '323e4567-e89b-42d3-a456-426614174002',
    track_id: 'sdaia-ai-engineer',
    content_release_id: 'release-1',
    mode: 'practice',
    locale: 'en',
    occurred_at: '2026-10-02T20:00:00+03:00',
    item_interaction_id: '423e4567-e89b-42d3-a456-426614174003',
    item_version_id: 'item-v1',
    payload: { response_version: 1, response_kind: 'OPTION', response: { option_index: 0 } },
    ...overrides
  };
}

test('evidence origin id is stable, random UUIDv4, and blocked storage falls back to stable memory', async () => {
  const { getOrCreateEvidenceOriginId } = await loadApi();
  assert.equal(typeof getOrCreateEvidenceOriginId, 'function', 'getOrCreateEvidenceOriginId behavior is missing');
  const storage = memoryStorage();
  const a = getOrCreateEvidenceOriginId(storage);
  const b = getOrCreateEvidenceOriginId(storage);
  assert.equal(a, b);
  assert.match(a, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

  const blocked = memoryStorage({ blocked: true });
  const c = getOrCreateEvidenceOriginId(blocked);
  const d = getOrCreateEvidenceOriginId(blocked);
  assert.equal(c, d);
});

test('local capture serializes origin_seq and commits outbox with durable local receipt', async () => {
  const { captureLocalEvidence } = await loadApi();
  const f = nativeFixture();
  assert.equal(typeof f.store.outbox?.listPending, 'function', 'native durable outbox is required');
  const runtimeContext = { ...runtimeBase, originStorage: memoryStorage() };
  const [one, two] = await Promise.all([
    captureLocalEvidence({ store: f.store, outbox: f.store.outbox, eventInput: input(), definition, runtimeContext }),
    captureLocalEvidence({ store: f.store, outbox: f.store.outbox, eventInput: input({ payload: { response_version: 1, response_kind: 'OPTION', response: { option_index: 1 } } }), definition, runtimeContext })
  ]);
  assert.deepEqual([one.event.origin_seq, two.event.origin_seq], [1, 2]);
  assert.equal(one.event.origin_id, two.event.origin_id);
  assert.deepEqual(new Set((await f.store.outbox.listPending()).map(r => r.event_id)), new Set([one.event.event_id, two.event.event_id]));
  assert.equal((await f.store.read('learner:p1')).length, 2);
});

test('failed local persistence is surfaced and does not consume origin_seq or enqueue', async t => {
  const { captureLocalEvidence } = await loadApi();
  const f = nativeFixture();
  assert.equal(typeof f.store.outbox?.listPending, 'function', 'native durable outbox is required');
  const runtimeContext = { ...runtimeBase, originStorage: memoryStorage() };
  const restore = faultAdd(t, 'events');
  await assert.rejects(() => captureLocalEvidence({ store: f.store, outbox: f.store.outbox, eventInput: input(), definition, runtimeContext }), /injected/);
  restore();
  assert.deepEqual(await f.store.outbox.listPending(), []);
  assert.deepEqual((await snapshot(f.name)).events, []);
  const retried = await captureLocalEvidence({ store: f.store, outbox: f.store.outbox, eventInput: input(), definition, runtimeContext });
  assert.equal(retried.event.origin_seq, 1);
});

test('non-atomic store cannot be reported as durably recorded or enqueue evidence', async () => {
  const { captureLocalEvidence } = await loadApi();
  let called = false;
  const store = { async accept() { called = true; return { disposition: 'CONFLICT' }; } };
  const outbox = { async enqueue() { throw new Error('must not enqueue'); } };
  await assert.rejects(() => captureLocalEvidence({ store, outbox, eventInput: input(), definition, runtimeContext: { ...runtimeBase, originStorage: memoryStorage() } }), /atomic|durably recorded/);
  assert.equal(called, false);
});

test('persistent storage request reports supported grant and denial without throwing', async () => {
  const { requestEvidenceStoragePersistence } = await loadApi();
  assert.equal(typeof requestEvidenceStoragePersistence, 'function', 'persistence request behavior is missing');
  assert.deepEqual(await requestEvidenceStoragePersistence({}), { supported: false, granted: false });
  assert.deepEqual(
    await requestEvidenceStoragePersistence({ storage: { persist: async () => true } }),
    { supported: true, granted: true }
  );
  assert.deepEqual(
    await requestEvidenceStoragePersistence({ storage: { persist: async () => false } }),
    { supported: true, granted: false }
  );
});
