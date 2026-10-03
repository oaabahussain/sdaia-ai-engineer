import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { defineEvidenceStoreParityTests } from './helpers/k3StoreConformance.js';
import { createJsonlEvidenceStore } from '../scripts/platform-kernel/adapters/jsonlEvidenceStore.js';
import { createIndexedDbEvidenceStore } from '../src/evidence/indexedDbStore.js';

const fixture = JSON.parse(readFileSync(new URL('./fixtures/k3/store-conformance.json', import.meta.url), 'utf8')).parity;
let dbCounter = 0;

defineEvidenceStoreParityTests({
  name: 'JSONL',
  fixture,
  async createStore(label) {
    const dir = await mkdtemp(join(tmpdir(), 'k3-conformance-'));
    return createJsonlEvidenceStore(join(dir, 'events.jsonl'), join(dir, 'events.index.json'), { storeId: 'fixture-store' });
  }
});

defineEvidenceStoreParityTests({
  name: 'IndexedDB',
  fixture,
  async createStore(label) {
    dbCounter += 1;
    return createIndexedDbEvidenceStore({
      dbName: `k3-conformance-${label}-${dbCounter}`,
      storeId: 'fixture-store',
      indexedDB
    });
  }
});

test('shared parity fixture is explicit about all approved scenarios', () => {
  assert.equal(fixture.events.length, 3);
  assert.equal(fixture.expected.read_ids.length, 3);
  assert.ok(fixture.origin_seq_conflict);
  assert.ok(fixture.id_conflict);
});
