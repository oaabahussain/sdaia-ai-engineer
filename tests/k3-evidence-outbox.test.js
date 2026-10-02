import test from 'node:test';
import assert from 'node:assert/strict';

async function loadApi() {
  try { return await import('../src/evidence/outbox.js'); }
  catch { return {}; }
}

function memoryPersistence() {
  let state = [];
  return {
    async load() { return structuredClone(state); },
    async save(records) { state = structuredClone(records); }
  };
}

const A = '123e4567-e89b-42d3-a456-426614174000';
const B = '223e4567-e89b-42d3-a456-426614174001';

function receipt(eventId, disposition, overrides = {}) {
  return {
    schema_version: 1,
    store_id: 'authority',
    event_id: eventId,
    event_fingerprint: 'a'.repeat(64),
    disposition,
    accepted_at: '2026-10-02T21:00:00.000Z',
    ...(disposition === 'ACCEPTED' || disposition === 'DUPLICATE' ? { store_seq: 9 } : {}),
    warnings: [],
    ...overrides
  };
}

test('outbox exposes enqueue, markInFlight, applyReceipt and listPending', async () => {
  const { createEvidenceOutbox } = await loadApi();
  assert.equal(typeof createEvidenceOutbox, 'function', 'createEvidenceOutbox behavior is missing');
  const outbox = createEvidenceOutbox({ persistence: memoryPersistence() });
  for (const method of ['enqueue','markInFlight','applyReceipt','listPending']) {
    assert.equal(typeof outbox[method], 'function', method + ' behavior is missing');
  }
});

test('enqueue creates transport-only PENDING metadata and is idempotent before send', async () => {
  const { createEvidenceOutbox } = await loadApi();
  assert.equal(typeof createEvidenceOutbox, 'function', 'createEvidenceOutbox behavior is missing');
  const outbox = createEvidenceOutbox({ persistence: memoryPersistence() });
  const first = await outbox.enqueue(A);
  const second = await outbox.enqueue(A);
  assert.deepEqual(first, { schema_version: 1, event_id: A, state: 'PENDING', attempt_count: 0 });
  assert.deepEqual(second, first);
  assert.deepEqual(await outbox.listPending(), [first]);
  assert.equal('event' in first, false);
  assert.equal('payload' in first, false);
});

test('markInFlight increments attempts and records caller-provided attempt time', async () => {
  const { createEvidenceOutbox } = await loadApi();
  const outbox = createEvidenceOutbox({ persistence: memoryPersistence() });
  await outbox.enqueue(A);
  const [record] = await outbox.markInFlight([A], '2026-10-02T21:01:00.000Z');
  assert.equal(record.state, 'IN_FLIGHT');
  assert.equal(record.attempt_count, 1);
  assert.equal(record.last_attempt_at, '2026-10-02T21:01:00.000Z');
  assert.deepEqual(await outbox.listPending(), []);
});

test('ACCEPTED and DUPLICATE acknowledge while CONFLICT and REJECTED block', async () => {
  const { createEvidenceOutbox } = await loadApi();
  const persistence = memoryPersistence();
  const outbox = createEvidenceOutbox({ persistence });
  for (const id of [A, B]) await outbox.enqueue(id);
  await outbox.markInFlight([A, B], '2026-10-02T21:01:00.000Z');

  const ack = await outbox.applyReceipt(receipt(A, 'ACCEPTED'));
  assert.equal(ack.state, 'ACKNOWLEDGED');
  assert.equal(ack.last_disposition, 'ACCEPTED');
  assert.equal(ack.authoritative_store_id, 'authority');
  assert.equal(ack.authoritative_store_seq, 9);

  const blocked = await outbox.applyReceipt(receipt(B, 'CONFLICT', { reason_code: 'EVENT_ID_CONFLICT' }));
  assert.equal(blocked.state, 'BLOCKED');
  assert.equal(blocked.last_disposition, 'CONFLICT');
  assert.equal(blocked.last_reason_code, 'EVENT_ID_CONFLICT');

  const retry = await outbox.enqueue(B);
  assert.equal(retry.state, 'PENDING');
  assert.equal(retry.attempt_count, 1, 'explicit retry must not erase attempt history');

  await outbox.markInFlight([B], '2026-10-02T21:02:00.000Z');
  const rejected = await outbox.applyReceipt(receipt(B, 'REJECTED', { reason_code: 'POLICY_DENIED' }));
  assert.equal(rejected.state, 'BLOCKED');
  assert.equal(rejected.attempt_count, 2);

  const dup = await outbox.applyReceipt(receipt(B, 'DUPLICATE'));
  assert.equal(dup.state, 'ACKNOWLEDGED');
});

test('records survive restart through injected persistence', async () => {
  const { createEvidenceOutbox } = await loadApi();
  const persistence = memoryPersistence();
  const first = createEvidenceOutbox({ persistence });
  await first.enqueue(A);
  await first.markInFlight([A], '2026-10-02T21:03:00.000Z');

  const restarted = createEvidenceOutbox({ persistence });
  const pending = await restarted.enqueue(A);
  assert.equal(pending.state, 'IN_FLIGHT', 'enqueue must not silently retry an in-flight record');
  const ack = await restarted.applyReceipt(receipt(A, 'DUPLICATE'));
  assert.equal(ack.attempt_count, 1);
  assert.equal(ack.state, 'ACKNOWLEDGED');
});

test('listPending honors caller-supplied retry eligibility without hidden delay', async () => {
  const { createEvidenceOutbox } = await loadApi();
  const outbox = createEvidenceOutbox({ persistence: memoryPersistence() });
  await outbox.enqueue(A);
  await outbox.enqueue(B);
  await outbox.setNextAttemptAt?.(B, '2026-10-02T22:00:00.000Z');

  const all = await outbox.listPending();
  assert.equal(all.length, 2);
  if (typeof outbox.setNextAttemptAt === 'function') {
    assert.deepEqual((await outbox.listPending({ now: '2026-10-02T21:30:00.000Z' })).map((x) => x.event_id), [A]);
  }
});
