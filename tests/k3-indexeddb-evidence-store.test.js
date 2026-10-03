import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';

async function loadAdapter() {
  try { return await import('../src/evidence/indexedDbStore.js'); }
  catch { return {}; }
}

let counter = 0;
function dbName(label) {
  counter += 1;
  return `k3-indexeddb-${label}-${counter}`;
}

function event(overrides = {}) {
  return {
    schema_version: 2,
    event_id: '123e4567-e89b-42d3-a456-426614174000',
    definition_id: 'learner.response.recorded@1',
    learner_id: 'learner:p1',
    origin_id: '223e4567-e89b-42d3-a456-426614174001',
    origin_seq: 1,
    activity_id: '323e4567-e89b-42d3-a456-426614174002',
    assessment_attempt_id: '423e4567-e89b-42d3-a456-426614174003',
    track_id: 'sdaia-ai-engineer',
    content_release_id: 'release-1',
    mode: 'practice',
    locale: 'en',
    occurred_at: '2026-10-02T19:00:00.000Z',
    item_interaction_id: '523e4567-e89b-42d3-a456-426614174004',
    item_version_id: 'item-v1',
    payload: { response_version: 1, response_kind: 'OPTION', response: { option_index: 0 } },
    ...overrides
  };
}

function openRaw(name) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

test('IndexedDB store exact retry preserves receipt and conflicts remain immutable', async () => {
  const { createIndexedDbEvidenceStore } = await loadAdapter();
  assert.equal(typeof createIndexedDbEvidenceStore, 'function', 'createIndexedDbEvidenceStore behavior is missing');
  const name = dbName('retry');
  const store = createIndexedDbEvidenceStore({ dbName: name, storeId: 'idb-test', indexedDB });

  const first = await store.accept(event());
  assert.equal(first.disposition, 'ACCEPTED');
  assert.equal(first.store_seq, 1);
  const retry = await store.accept(event());
  assert.equal(retry.disposition, 'DUPLICATE');
  assert.equal(retry.accepted_at, first.accepted_at);
  assert.equal(retry.event_fingerprint, first.event_fingerprint);
  assert.equal(retry.store_seq, 1);

  const conflict = await store.accept(event({ payload: { response_version: 1, response_kind: 'OPTION', response: { option_index: 1 } } }));
  assert.equal(conflict.disposition, 'CONFLICT');
  assert.equal(conflict.reason_code, 'EVENT_ID_CONFLICT');
  assert.deepEqual(await store.getById(event().event_id), event());
});

test('IndexedDB store detects origin sequence conflicts and allocates monotonic store_seq', async () => {
  const { createIndexedDbEvidenceStore } = await loadAdapter();
  assert.equal(typeof createIndexedDbEvidenceStore, 'function', 'createIndexedDbEvidenceStore behavior is missing');
  const name = dbName('origin');
  const store = createIndexedDbEvidenceStore({ dbName: name, storeId: 'idb-test', indexedDB });
  const one = event();
  const two = event({
    event_id: '623e4567-e89b-42d3-a456-426614174005',
    origin_seq: 2,
    item_interaction_id: '723e4567-e89b-42d3-a456-426614174006',
    item_version_id: 'item-v2'
  });
  const batch = await store.acceptBatch([one, two]);
  assert.deepEqual(batch.receipts.map((r) => r.store_seq), [1, 2]);

  const conflict = await store.accept(event({
    event_id: '823e4567-e89b-42d3-a456-426614174007',
    origin_seq: 2,
    payload: { response_version: 1, response_kind: 'OPTION', response: { option_index: 2 } }
  }));
  assert.equal(conflict.disposition, 'CONFLICT');
  assert.equal(conflict.reason_code, 'ORIGIN_SEQ_CONFLICT');
});

test('IndexedDB store exposes governed indexes and ordered filtered reads', async () => {
  const { createIndexedDbEvidenceStore } = await loadAdapter();
  assert.equal(typeof createIndexedDbEvidenceStore, 'function', 'createIndexedDbEvidenceStore behavior is missing');
  const name = dbName('indexes');
  const store = createIndexedDbEvidenceStore({ dbName: name, storeId: 'idb-test', indexedDB });
  const one = event();
  const two = event({
    event_id: '923e4567-e89b-42d3-a456-426614174008',
    origin_seq: 2,
    activity_id: 'a23e4567-e89b-42d3-a456-426614174009',
    assessment_attempt_id: 'b23e4567-e89b-42d3-a456-42661417400a',
    content_release_id: 'release-2',
    item_interaction_id: 'c23e4567-e89b-42d3-a456-42661417400b',
    item_version_id: 'item-v2',
    definition_id: 'learner.response.evaluated@1',
    payload: { response_event_id: one.event_id, scoring_policy_ref: 'policy:1', evaluation_status: 'GRADED', correct: true, score: 1 }
  });
  await store.acceptBatch([one, two]);

  assert.deepEqual(await store.read('learner:p1'), [one, two]);
  assert.deepEqual(await store.read('learner:p1', 1), [two]);
  assert.deepEqual(await store.read('learner:p1', undefined, { item_version_id: 'item-v2' }), [two]);
  assert.deepEqual(await store.read('learner:p1', undefined, { activity_id: two.activity_id }), [two]);

  const db = await openRaw(name);
  const tx = db.transaction('events', 'readonly');
  const indexes = [...tx.objectStore('events').indexNames];
  for (const expected of ['by_origin_seq','by_store_seq','by_learner_seq','by_activity_seq','by_attempt_seq','by_item_seq','by_release_seq','by_definition_seq']) {
    assert.equal(indexes.includes(expected), true, `missing index ${expected}`);
  }
  db.close();
});

test('IndexedDB store survives close/reopen and continues sequence allocation', async () => {
  const { createIndexedDbEvidenceStore } = await loadAdapter();
  assert.equal(typeof createIndexedDbEvidenceStore, 'function', 'createIndexedDbEvidenceStore behavior is missing');
  const name = dbName('reopen');
  const firstStore = createIndexedDbEvidenceStore({ dbName: name, storeId: 'idb-test', indexedDB });
  await firstStore.accept(event());

  const reopened = createIndexedDbEvidenceStore({ dbName: name, storeId: 'idb-test', indexedDB });
  const second = event({
    event_id: 'd23e4567-e89b-42d3-a456-42661417400c',
    origin_seq: 2,
    item_interaction_id: 'e23e4567-e89b-42d3-a456-42661417400d'
  });
  const receipt = await reopened.accept(second);
  assert.equal(receipt.store_seq, 2);
  assert.deepEqual(await reopened.getById(event().event_id), event());
  assert.deepEqual(await reopened.getById(second.event_id), second);
});
