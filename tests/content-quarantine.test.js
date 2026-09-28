import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const moduleUrl = new URL('../src/platform-kernel/release/quarantine.js', import.meta.url);
const moduleExists = () => fs.existsSync(moduleUrl);

test('quarantine module exists', () => {
  assert.equal(moduleExists(), true);
});

test('createQuarantineEvent records immutable evidence without mutating historical target', async () => {
  if (!moduleExists()) return;
  const { createQuarantineEvent } = await import(moduleUrl);

  const historical = Object.freeze({
    item_version_id: 'item:v1',
    state: 'RELEASED',
    content_hash: 'abc'
  });

  const event = createQuarantineEvent({
    scope: 'item-version',
    from_target_id: historical.item_version_id,
    to_target_id: null,
    reason: 'critical evidence mismatch',
    actor: 'release-controller',
    at: '2026-09-28T00:00:00Z',
    triggering_evidence_refs: ['activation:1'],
    follow_up_required: true
  });

  assert.equal(event.scope, 'item-version');
  assert.equal(event.from_target_id, 'item:v1');
  assert.equal(Object.isFrozen(event), true);
  assert.deepEqual(historical, {
    item_version_id: 'item:v1',
    state: 'RELEASED',
    content_hash: 'abc'
  });
});

test('selectAfterQuarantine removes only the selected scope target and preserves original selection', async () => {
  if (!moduleExists()) return;
  const { createQuarantineEvent, selectAfterQuarantine } = await import(moduleUrl);

  const selection = Object.freeze({
    release_ids: Object.freeze(['rel:1']),
    tranche_ids: Object.freeze(['tranche:1']),
    family_ids: Object.freeze(['family:1', 'family:2']),
    item_version_ids: Object.freeze(['item:1', 'item:2'])
  });

  const event = createQuarantineEvent({
    scope: 'family',
    from_target_id: 'family:1',
    to_target_id: null,
    reason: 'family-level quality defect',
    actor: 'release-controller',
    at: '2026-09-28T00:00:00Z',
    triggering_evidence_refs: ['finding:1'],
    follow_up_required: true
  });

  const next = selectAfterQuarantine(selection, event);

  assert.deepEqual(next.family_ids, ['family:2']);
  assert.deepEqual(next.item_version_ids, ['item:1', 'item:2']);
  assert.deepEqual(selection.family_ids, ['family:1', 'family:2']);
  assert.notEqual(next, selection);
});

test('quarantine event rejects unknown scope and missing evidence', async () => {
  if (!moduleExists()) return;
  const { createQuarantineEvent } = await import(moduleUrl);

  assert.throws(
    () => createQuarantineEvent({
      scope: 'question',
      from_target_id: 'q1',
      reason: 'bad',
      actor: 'system',
      at: '2026-09-28T00:00:00Z',
      triggering_evidence_refs: ['e1'],
      follow_up_required: true
    }),
    /scope/i
  );

  assert.throws(
    () => createQuarantineEvent({
      scope: 'family',
      from_target_id: 'family:1',
      reason: 'bad',
      actor: 'system',
      at: '2026-09-28T00:00:00Z',
      triggering_evidence_refs: [],
      follow_up_required: true
    }),
    /evidence/i
  );
});
