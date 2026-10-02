import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

async function loadAdapter() {
  try { return await import('../scripts/platform-kernel/adapters/jsonlEvidenceStore.js'); }
  catch { return {}; }
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
    track_id: 'sdaia-ai-engineer',
    content_release_id: 'release-1',
    mode: 'practice',
    locale: 'en',
    occurred_at: '2026-10-02T19:00:00.000Z',
    item_interaction_id: '423e4567-e89b-42d3-a456-426614174003',
    item_version_id: 'item-v1',
    payload: { response_version: 1, response_kind: 'OPTION', response: { option_index: 0 } },
    ...overrides
  };
}

async function files() {
  const dir = await mkdtemp(join(tmpdir(), 'k3-jsonl-'));
  return { dir, eventFile: join(dir, 'events.jsonl'), indexFile: join(dir, 'events.index.json') };
}

test('JSONL EvidenceStore accepts, duplicates exact retry, and conflicts on same event id/body change', async () => {
  const { createJsonlEvidenceStore } = await loadAdapter();
  assert.equal(typeof createJsonlEvidenceStore, 'function', 'createJsonlEvidenceStore behavior is missing');
  const paths = await files();
  const store = createJsonlEvidenceStore(paths.eventFile, paths.indexFile, { storeId: 'jsonl-test' });

  const first = await store.accept(event());
  assert.equal(first.disposition, 'ACCEPTED');
  assert.equal(first.store_seq, 1);
  assert.equal(first.store_id, 'jsonl-test');
  assert.match(first.event_fingerprint, /^[0-9a-f]{64}$/);
  assert.equal(first.warnings.length, 0);

  const duplicate = await store.accept(event());
  assert.equal(duplicate.disposition, 'DUPLICATE');
  assert.equal(duplicate.store_seq, first.store_seq);
  assert.equal(duplicate.accepted_at, first.accepted_at);
  assert.equal(duplicate.event_fingerprint, first.event_fingerprint);

  const conflict = await store.accept(event({ payload: { response_version: 1, response_kind: 'OPTION', response: { option_index: 1 } } }));
  assert.equal(conflict.disposition, 'CONFLICT');
  assert.equal(conflict.reason_code, 'EVENT_ID_CONFLICT');

  const lines = (await readFile(paths.eventFile, 'utf8')).trim().split('\n');
  assert.equal(lines.length, 1, 'duplicate/conflict must not append immutable event bytes');
});

test('JSONL EvidenceStore rejects origin sequence reuse by a different event', async () => {
  const { createJsonlEvidenceStore } = await loadAdapter();
  assert.equal(typeof createJsonlEvidenceStore, 'function', 'createJsonlEvidenceStore behavior is missing');
  const paths = await files();
  const store = createJsonlEvidenceStore(paths.eventFile, paths.indexFile, { storeId: 'jsonl-test' });
  await store.accept(event());

  const receipt = await store.accept(event({
    event_id: '523e4567-e89b-42d3-a456-426614174004',
    payload: { response_version: 1, response_kind: 'OPTION', response: { option_index: 2 } }
  }));
  assert.equal(receipt.disposition, 'CONFLICT');
  assert.equal(receipt.reason_code, 'ORIGIN_SEQ_CONFLICT');
});

test('JSONL EvidenceStore allocates monotonic store_seq, reads by id, and filters ordered reads', async () => {
  const { createJsonlEvidenceStore } = await loadAdapter();
  assert.equal(typeof createJsonlEvidenceStore, 'function', 'createJsonlEvidenceStore behavior is missing');
  const paths = await files();
  const store = createJsonlEvidenceStore(paths.eventFile, paths.indexFile, { storeId: 'jsonl-test' });
  const one = event();
  const two = event({
    event_id: '623e4567-e89b-42d3-a456-426614174005',
    origin_seq: 2,
    activity_id: '723e4567-e89b-42d3-a456-426614174006',
    item_interaction_id: '823e4567-e89b-42d3-a456-426614174007',
    item_version_id: 'item-v2'
  });
  const batch = await store.acceptBatch([one, two]);
  assert.equal(batch.schema_version, 1);
  assert.deepEqual(batch.receipts.map((r) => r.store_seq), [1, 2]);

  assert.deepEqual(await store.getById(two.event_id), two);
  const all = await store.read('learner:p1');
  assert.deepEqual(all, [one, two]);
  const after = await store.read('learner:p1', 1);
  assert.deepEqual(after, [two]);
  const filtered = await store.read('learner:p1', undefined, { item_version_id: 'item-v2' });
  assert.deepEqual(filtered, [two]);
});

test('JSONL EvidenceStore fails closed on malformed event JSONL', async () => {
  const { createJsonlEvidenceStore } = await loadAdapter();
  assert.equal(typeof createJsonlEvidenceStore, 'function', 'createJsonlEvidenceStore behavior is missing');
  const paths = await files();
  await writeFile(paths.eventFile, '{"event_id":"ok"}\n{not-json}\n');
  const store = createJsonlEvidenceStore(paths.eventFile, paths.indexFile, { storeId: 'jsonl-test' });
  await assert.rejects(() => store.read('learner:p1'), /Malformed K3 evidence event at line 2/);
});
