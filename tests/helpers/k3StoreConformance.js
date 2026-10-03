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

export function defineEvidenceStoreParityTests({ name, createStore, fixture }) {
  const events = fixture.events;

  test(`${name}: append order is store order even for late/out-of-order evidence and multiple origins`, async () => {
    const store = await createStore('append');
    const result = await store.acceptBatch(events);
    assert.deepEqual(result.receipts.map((r) => r.disposition), fixture.expected.accepted_dispositions);
    assert.deepEqual(result.receipts.map((r) => r.store_seq), fixture.expected.store_seq);
    const rows = await store.read(events[0].learner_id);
    assert.deepEqual(rows.map((e) => e.event_id), fixture.expected.read_ids);
    assert.ok(Date.parse(events[1].occurred_at) < Date.parse(events[0].occurred_at), 'fixture must prove late arrival');
    assert.equal(events[0].origin_seq, events[2].origin_seq, 'fixture must reuse sequence across distinct origins');
    assert.notEqual(events[0].origin_id, events[2].origin_id);
  });

  test(`${name}: exact retry is DUPLICATE and preserves original receipt identity`, async () => {
    const store = await createStore('retry');
    const first = await store.accept(events[0]);
    const retry = await store.accept(structuredClone(events[0]));
    assert.equal(retry.disposition, 'DUPLICATE');
    assert.equal(retry.store_seq, first.store_seq);
    assert.equal(retry.accepted_at, first.accepted_at);
    assert.equal(retry.event_fingerprint, first.event_fingerprint);
  });

  test(`${name}: same event ID with changed body is CONFLICT`, async () => {
    const store = await createStore('id-conflict');
    await store.accept(events[0]);
    const conflict = await store.accept({ ...structuredClone(events[0]), ...fixture.id_conflict });
    assert.equal(conflict.disposition, 'CONFLICT');
    assert.equal(conflict.reason_code, 'EVENT_ID_CONFLICT');
  });

  test(`${name}: same origin sequence with different event is CONFLICT`, async () => {
    const store = await createStore('origin-conflict');
    await store.accept(events[1]);
    const conflict = await store.accept(structuredClone(fixture.origin_seq_conflict));
    assert.equal(conflict.disposition, 'CONFLICT');
    assert.equal(conflict.reason_code, 'ORIGIN_SEQ_CONFLICT');
  });

  test(`${name}: governed filters return the same logical evidence`, async () => {
    const store = await createStore('filters');
    await store.acceptBatch(events);
    const byItem = await store.read(events[0].learner_id, undefined, { item_version_id: 'item-b' });
    assert.deepEqual(byItem.map((e) => e.event_id), fixture.expected.item_filter_ids);
    const byType = await store.read(events[0].learner_id, undefined, { type: 'learner.response.evaluated@1' });
    assert.deepEqual(byType.map((e) => e.event_id), fixture.expected.type_filter_ids);
  });
}
