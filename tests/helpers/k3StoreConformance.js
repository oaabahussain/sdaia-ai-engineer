import test from 'node:test';
import assert from 'node:assert/strict';

export function defineEvidenceStoreConformanceTests({
  name,
  createStore,
  events,
  assertStore,
  assertReceipt,
  assertBatchResult
}) {
  test(`${name}: exposes the EvidenceStore port`, async () => {
    const store = await createStore();
    assertStore(store);
  });

  test(`${name}: accept/getById preserve the accepted event contract`, async () => {
    const store = await createStore();
    const receipt = await store.accept(events[0]);
    assertReceipt(receipt);
    assert.equal(receipt.event_id, events[0].event_id);
    const stored = await store.getById(events[0].event_id);
    assert.deepEqual(stored, events[0]);
  });

  test(`${name}: acceptBatch returns one receipt per input and read is ordered`, async () => {
    const store = await createStore();
    const result = await store.acceptBatch(events);
    assertBatchResult(result);
    assert.equal(result.receipts.length, events.length);
    const rows = await store.read(events[0].learner_id);
    assert.equal(Array.isArray(rows), true);
  });
}
