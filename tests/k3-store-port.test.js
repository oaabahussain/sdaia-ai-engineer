import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { defineEvidenceStoreConformanceTests } from './helpers/k3StoreConformance.js';

const fixture = JSON.parse(readFileSync(new URL('./fixtures/k3/store-conformance.json', import.meta.url), 'utf8'));

async function loadPort() {
  try { return await import('../src/evidence/storePort.js'); }
  catch { return {}; }
}

test('EvidenceStore port assertion requires accept, acceptBatch, getById and read', async () => {
  const { assertEvidenceStore } = await loadPort();
  assert.equal(typeof assertEvidenceStore, 'function', 'assertEvidenceStore behavior is missing');
  const valid = {
    accept() {}, acceptBatch() {}, getById() {}, read() {}
  };
  assert.equal(assertEvidenceStore(valid), valid);
  for (const method of ['accept','acceptBatch','getById','read']) {
    const broken = { ...valid };
    delete broken[method];
    assert.throws(() => assertEvidenceStore(broken), new RegExp(method));
  }
});

test('EvidenceStorageReceiptV1 assertion enforces the governed receipt shape', async () => {
  const { assertEvidenceStorageReceipt } = await loadPort();
  assert.equal(typeof assertEvidenceStorageReceipt, 'function', 'receipt assertion behavior is missing');
  assert.equal(assertEvidenceStorageReceipt(fixture.accepted_receipt), fixture.accepted_receipt);
  assert.throws(() => assertEvidenceStorageReceipt({ ...fixture.accepted_receipt, disposition: 'MAYBE' }), /disposition/i);
  assert.throws(() => assertEvidenceStorageReceipt({ ...fixture.accepted_receipt, store_seq: 0 }), /store_seq/i);
  assert.throws(() => assertEvidenceStorageReceipt({ ...fixture.accepted_receipt, extra: true }), /additional|extra|field/i);
});

test('EvidenceBatchResultV1 assertion validates every receipt', async () => {
  const { assertEvidenceBatchResult } = await loadPort();
  assert.equal(typeof assertEvidenceBatchResult, 'function', 'batch assertion behavior is missing');
  const batch = { schema_version: 1, receipts: [fixture.accepted_receipt, fixture.duplicate_receipt] };
  assert.equal(assertEvidenceBatchResult(batch), batch);
  assert.throws(() => assertEvidenceBatchResult({ schema_version: 1, receipts: [{ ...fixture.accepted_receipt, warnings: 'bad' }] }), /warnings|receipt/i);
});

test('shared conformance harness is reusable', () => {
  assert.equal(typeof defineEvidenceStoreConformanceTests, 'function');
});
