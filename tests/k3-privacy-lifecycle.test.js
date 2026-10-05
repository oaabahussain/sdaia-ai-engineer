import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createJsonlEvidenceStore } from '../scripts/platform-kernel/adapters/jsonlEvidenceStore.js';

// Test-only no-op baselines express the missing behavior without import/setup RED.
const privacyPath = new URL('../src/platform-kernel/evidence/privacyLifecycle.js', import.meta.url);
const ledgerPath = new URL('../src/platform-kernel/evidence/exportLedger.js', import.meta.url);
const privacy = existsSync(privacyPath) ? await import(privacyPath) : {
  createPrivacyLifecycle: () => ({ apply: async () => ({ status: 'NOT_IMPLEMENTED' }) })
};
const exportsModule = existsSync(ledgerPath) ? await import(ledgerPath) : {
  createExportLedger: () => ({ append: async () => ({ disposition: 'NOT_IMPLEMENTED' }), read: async () => [], propagateDeletion: async () => ({ action: 'NOT_IMPLEMENTED' }) })
};
const ID = n => `10000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const TIME = '2026-10-03T16:00:00Z';
function request(operation = 'DELETE') {
  return { learner_id: 'learner:a', operation, authority_ref: 'authority:test', reason_code: 'SUBJECT_REQUEST',
    policy: { policy_ref: 'policy:approved', linked_metadata: operation === 'DELETE' ? 'ERASE' : 'RETAIN',
      export_records: 'ERASE', projection_caches: 'INVALIDATE_ALL', ...(operation === 'DELINK' ? { retention_reason_code: 'EVIDENCE_RETENTION_APPROVED' } : {}) } };
}
function snapshot() {
  return { events: [{ event_id: ID(1), learner_id: 'learner:a' }, { event_id: ID(2), learner_id: 'learner:b' }],
    receipts: [{ event_id: ID(1), event_fingerprint: 'hash-a' }, { event_id: ID(2), event_fingerprint: 'hash-b' }],
    fingerprints: [{ event_id: ID(1), fingerprint: 'hash-a' }, { event_id: ID(2), fingerprint: 'hash-b' }],
    projections: [{ learner_id: 'learner:a', value: 'derived-a' }, { learner_id: 'learner:b', value: 'derived-linked' }],
    identity_links: [{ link_id: 'link-a', source_learner_id: 'learner:a', target_learner_id: 'learner:b' }],
    export_records: [{ event_id: ID(1), learner_id: 'learner:a', external_ref: 'external:a' }, { event_id: ID(2), learner_id: 'learner:b' }],
    replay_complete: true };
}
function lifecycle(authorize = async () => true) {
  let data = snapshot(), writes = 0;
  const api = privacy.createPrivacyLifecycle({ authorize, load: async () => structuredClone(data), commit: async value => { data = structuredClone(value); writes++; } });
  return { api, read: () => structuredClone(data), writes: () => writes };
}
function ledger(destinationPolicy = { deletion_support: 'SUPPORTED' }) {
  const records = [];
  const api = exportsModule.createExportLedger({ load: async () => structuredClone(records), append: async r => records.push(structuredClone(r)), destinationPolicy });
  return { api, records };
}
const record = (id = 10, extras = {}) => ({ schema_version: 1, export_record_id: ID(id), event_id: ID(1), adapter_id: 'adapter:test', adapter_version: '1', destination_class: 'TEST', mapping_version: '1', action: 'EXPORTED', occurred_at: TIME, privacy_disposition: 'ALLOW', external_ref: 'external:1', ...extras });

test('privileged DELETE erases learner-linked raw and derived metadata without changing other raw evidence', async () => {
  const f = lifecycle(), before = f.read();
  const result = await f.api.apply(request());
  assert.deepEqual(f.read().events, [before.events[1]]);
  assert.deepEqual(f.read().receipts, [before.receipts[1]]);
  assert.deepEqual(f.read().fingerprints, [before.fingerprints[1]]);
  assert.deepEqual(f.read().export_records, [before.export_records[1]]);
  assert.deepEqual(f.read().identity_links, []);
  assert.deepEqual(f.read().projections, []);
  assert.equal(result.status, 'APPLIED');
  assert.equal(result.replay_complete, false);
  assert.equal(result.external_deletion, 'NOT_PERFORMED');
  assert.equal(f.read().replay_complete, false);
});
test('ordinary EvidenceStore still has no generic update or delete capability', () => {
  const store = createJsonlEvidenceStore('/tmp/unused-k3-events', '/tmp/unused-k3-index', { storeId: 'test' });
  assert.equal(store.delete, undefined);
  assert.equal(store.update, undefined);
  assert.equal(store.applyPrivacyLifecycle, undefined);
});
test('a caller authority reference does not authorize deletion', async () => {
  const f = lifecycle(async () => false), before = f.read();
  await assert.rejects(() => f.api.apply(request()), /authoriz/i);
  assert.equal(f.writes(), 0);
  assert.deepEqual(f.read(), before);
});
test('incomplete policy and undocumented retention fail before mutation', async () => {
  for (const mutate of [r => { delete r.policy; }, r => { r.policy.export_records = 'RETAIN'; }, r => { r.policy.linked_metadata = 'RETAIN'; }]) {
    const f = lifecycle(), r = request(); mutate(r);
    await assert.rejects(() => f.api.apply(r), /policy|retention|metadata/i);
    assert.equal(f.writes(), 0);
  }
});
test('DELINK preserves policy-retained raw data but invalidates projections and complete-history claims', async () => {
  const f = lifecycle(), before = f.read();
  const result = await f.api.apply(request('DELINK'));
  assert.deepEqual(f.read().events, before.events);
  assert.deepEqual(f.read().receipts, before.receipts);
  assert.deepEqual(f.read().identity_links, []);
  assert.deepEqual(f.read().projections, []);
  assert.equal(result.replay_complete, false);
});
test('failed persistence cannot be reported as a completed privacy operation', async () => {
  const api = privacy.createPrivacyLifecycle({ authorize: () => true, load: async () => snapshot(), commit: async () => { throw Error('storage failure'); } });
  await assert.rejects(() => api.apply(request()), /storage failure/);
});
test('repeated local deletion remains idempotent and never restores erased evidence', async () => {
  const f = lifecycle();
  await f.api.apply(request()); const erased = f.read();
  await f.api.apply(request());
  assert.deepEqual(f.read(), erased);
  assert.equal(erased.events.length, 1);
});
test('export ledger is append-only, immutable to its callers and exact-retry idempotent', async () => {
  const f = ledger(), first = record();
  assert.equal((await f.api.append(first)).disposition, 'ACCEPTED');
  assert.equal((await f.api.append(first)).disposition, 'DUPLICATE');
  first.external_ref = 'caller-mutated';
  const values = await f.api.read(); values[0].external_ref = 'reader-mutated';
  assert.equal((await f.api.read())[0].external_ref, 'external:1');
  assert.equal(f.records.length, 1);
  await assert.rejects(() => f.api.append(first), /conflict/i);
});
test('export deletion lifecycle preserves predecessor identity and original export bytes', async () => {
  const f = ledger(); await f.api.append(record());
  await f.api.append(record(11, { action: 'DELETE_REQUESTED', predecessor_record_id: ID(10) }));
  await f.api.append(record(12, { action: 'DELETED', predecessor_record_id: ID(11) }));
  assert.deepEqual((await f.api.read()).map(r => r.action), ['EXPORTED', 'DELETE_REQUESTED', 'DELETED']);
  assert.deepEqual(f.records[0], record());
  await assert.rejects(() => f.api.append(record(13, { event_id: ID(2), action: 'DELETED', predecessor_record_id: ID(11) })), /predecessor|identity/i);
});
test('unknown destination deletion support or undocumented unsupported export is blocked', async () => {
  for (const policy of [{}, { deletion_support: 'UNSUPPORTED' }]) {
    const f = ledger(policy);
    await assert.rejects(() => f.api.append(record()), /destination|deletion|limitation/i);
    assert.deepEqual(f.records, []);
  }
});
test('unsupported deletion is recorded explicitly without invoking a destination', async () => {
  const f = ledger({ deletion_support: 'UNSUPPORTED', limitation_ref: 'policy:destination-limitation' });
  await f.api.append(record()); let called = false;
  const result = await f.api.propagateDeletion(ID(10), { occurred_at: TIME, deleteRemote: async () => { called = true; return true; } });
  assert.equal(called, false);
  assert.equal(result.action, 'DELETION_UNSUPPORTED');
  assert.deepEqual(f.records.map(r => r.action), ['EXPORTED', 'DELETE_REQUESTED', 'DELETION_UNSUPPORTED']);
});
test('destination success and failure are separate append-only deletion outcomes', async () => {
  for (const success of [true, false]) {
    const f = ledger(); await f.api.append(record());
    const result = await f.api.propagateDeletion(ID(10), { occurred_at: TIME, deleteRemote: async () => { if (success) return true; throw Error('remote unavailable'); } });
    assert.equal(result.action, success ? 'DELETED' : 'DELETION_FAILED');
    assert.equal(f.records.length, 3);
    assert.equal(f.records[0].action, 'EXPORTED');
  }
});
test('export schema rejects undeclared fields and invalid identifiers without persisting them', async () => {
  const f = ledger();
  await assert.rejects(() => f.api.append(record(10, { learner_email: 'not-collected@example.invalid' })), /export|schema/i);
  await assert.rejects(() => f.api.append(record(10, { export_record_id: 'invalid' })), /export|schema/i);
  assert.deepEqual(f.records, []);
});

test('interrupted export deletion resumes its persisted request instead of creating a conflicting sibling', async () => {
  const f = ledger();
  await f.api.append(record());
  await f.api.append(record(11, { action: 'DELETE_REQUESTED', predecessor_record_id: ID(10) }));
  let result;
  try { result = await f.api.propagateDeletion(ID(10), { occurred_at: TIME, deleteRemote: async () => true }); }
  catch { result = null; }
  assert.equal(result?.action, 'DELETED');
  assert.deepEqual(f.records.map(r => r.action), ['EXPORTED', 'DELETE_REQUESTED', 'DELETED']);
});
test('retry of confirmed export deletion returns its durable outcome without another remote call', async () => {
  const f = ledger(); await f.api.append(record()); let calls = 0;
  const options = { occurred_at: TIME, deleteRemote: async () => { calls++; return true; } };
  const first = await f.api.propagateDeletion(ID(10), options);
  let second;
  try { second = await f.api.propagateDeletion(ID(10), options); } catch { second = null; }
  assert.deepEqual(second, first);
  assert.equal(calls, 1);
  assert.equal(f.records.length, 3);
});
test('later privacy operations do not erase the documented basis for retained export records', async () => {
  const f = lifecycle();
  const retained = request();
  retained.policy.export_records = 'RETAIN';
  retained.policy.retention_reason_code = 'APPROVED_EXPORT_RETENTION';
  await f.api.apply(retained);
  const other = request(); other.learner_id = 'learner:b'; other.policy.policy_ref = 'policy:second';
  await f.api.apply(other);
  assert.ok(f.read().export_records.some(r => r.learner_id === 'learner:a'));
  assert.ok((f.read().privacy_policies ?? []).some(p => p.policy_ref === 'policy:approved' && p.retention_reason_code === 'APPROVED_EXPORT_RETENTION'));
});
test('retaining exports without a durable erasure-owner index is rejected before raw deletion', async () => {
  let data = snapshot(); delete data.export_records[0].learner_id;
  const before = structuredClone(data);
  const api = privacy.createPrivacyLifecycle({ authorize: () => true, load: async () => structuredClone(data), commit: async value => { data = value; } });
  const r = request(); r.policy.export_records = 'RETAIN'; r.policy.retention_reason_code = 'APPROVED_EXPORT_RETENTION';
  await assert.rejects(() => api.apply(r), /export.*owner|owner.*export/i);
  assert.deepEqual(data, before);
});
