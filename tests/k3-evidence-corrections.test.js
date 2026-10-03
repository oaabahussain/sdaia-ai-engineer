import test from 'node:test';
import assert from 'node:assert/strict';

async function loadResolver() {
  try { return await import('../src/evidence/corrections.js'); }
  catch { return {}; }
}

function evidence(id, overrides = {}) {
  return {
    schema_version: 2,
    event_id: id,
    definition_id: 'learner.response.recorded@1',
    learner_id: 'learner:p1',
    origin_id: '223e4567-e89b-42d3-a456-426614174001',
    origin_seq: 1,
    activity_id: '323e4567-e89b-42d3-a456-426614174002',
    track_id: 'sdaia-ai-engineer',
    content_release_id: 'release-1',
    mode: 'practice',
    locale: 'en',
    occurred_at: '2026-10-03T10:00:00Z',
    payload: { response_version: 1, response_kind: 'OPTION', response: { option_index: 0 } },
    ...overrides
  };
}

function correction(id, target, action, overrides = {}) {
  return evidence(id, {
    definition_id: 'learner.evidence.correction.recorded@1',
    authority_ref: 'authority:test',
    payload: {
      target_event_id: target,
      action,
      reason_code: 'ADMIN_CORRECTION',
      ...(action === 'SUPERSEDE' ? { superseding_event_id: overrides.superseding_event_id } : {})
    },
    ...overrides
  });
}

test('VOID excludes target from active evidence without mutating raw bytes', async () => {
  const { resolveCurrentEvidence } = await loadResolver();
  assert.equal(typeof resolveCurrentEvidence, 'function', 'resolveCurrentEvidence behavior is missing');
  const target = evidence('123e4567-e89b-42d3-a456-426614174000');
  const before = structuredClone(target);
  const result = resolveCurrentEvidence([
    target,
    correction('423e4567-e89b-42d3-a456-426614174003', target.event_id, 'VOID')
  ]);
  assert.deepEqual(result.activeEvents, []);
  assert.deepEqual(result.unresolved, []);
  assert.deepEqual(result.conflicts, []);
  assert.deepEqual(target, before);
});

test('SUPERSEDE makes referenced replacement current even when correction arrives before target', async () => {
  const { resolveCurrentEvidence } = await loadResolver();
  assert.equal(typeof resolveCurrentEvidence, 'function', 'resolveCurrentEvidence behavior is missing');
  const oldEvent = evidence('123e4567-e89b-42d3-a456-426614174000');
  const replacement = evidence('523e4567-e89b-42d3-a456-426614174004', { origin_seq: 2 });
  const fix = correction('423e4567-e89b-42d3-a456-426614174003', oldEvent.event_id, 'SUPERSEDE', {
    superseding_event_id: replacement.event_id
  });
  const result = resolveCurrentEvidence([fix, replacement, oldEvent]);
  assert.deepEqual(result.activeEvents.map((event) => event.event_id), [replacement.event_id]);
  assert.deepEqual(result.unresolved, []);
  assert.deepEqual(result.conflicts, []);
});

test('missing target or replacement stays unresolved rather than silently selecting evidence', async () => {
  const { resolveCurrentEvidence } = await loadResolver();
  assert.equal(typeof resolveCurrentEvidence, 'function', 'resolveCurrentEvidence behavior is missing');
  const replacement = evidence('523e4567-e89b-42d3-a456-426614174004', { origin_seq: 2 });
  const missingTarget = correction(
    '423e4567-e89b-42d3-a456-426614174003',
    '623e4567-e89b-42d3-a456-426614174005',
    'VOID'
  );
  const missingReplacement = correction(
    '723e4567-e89b-42d3-a456-426614174006',
    replacement.event_id,
    'SUPERSEDE',
    { superseding_event_id: '823e4567-e89b-42d3-a456-426614174007' }
  );
  const result = resolveCurrentEvidence([replacement, missingTarget, missingReplacement]);
  assert.equal(result.unresolved.length, 2);
  assert.deepEqual(new Set(result.unresolved.map((x) => x.code)), new Set(['MISSING_TARGET', 'MISSING_SUPERSEDING_EVENT']));
  assert.deepEqual(result.activeEvents.map((event) => event.event_id), [replacement.event_id]);
});

test('competing supersessions are conflicts and do not choose a winner', async () => {
  const { resolveCurrentEvidence } = await loadResolver();
  assert.equal(typeof resolveCurrentEvidence, 'function', 'resolveCurrentEvidence behavior is missing');
  const oldEvent = evidence('123e4567-e89b-42d3-a456-426614174000');
  const a = evidence('523e4567-e89b-42d3-a456-426614174004', { origin_seq: 2 });
  const b = evidence('623e4567-e89b-42d3-a456-426614174005', { origin_seq: 3 });
  const c1 = correction('723e4567-e89b-42d3-a456-426614174006', oldEvent.event_id, 'SUPERSEDE', { superseding_event_id: a.event_id });
  const c2 = correction('823e4567-e89b-42d3-a456-426614174007', oldEvent.event_id, 'SUPERSEDE', { superseding_event_id: b.event_id });
  const result = resolveCurrentEvidence([oldEvent, a, b, c1, c2]);
  assert.equal(result.conflicts.length, 1);
  assert.equal(result.conflicts[0].code, 'COMPETING_CORRECTIONS');
  assert.deepEqual(new Set(result.activeEvents.map((event) => event.event_id)), new Set([oldEvent.event_id, a.event_id, b.event_id]));
});

test('supersession cycles are conflicts and remain unresolved as current evidence', async () => {
  const { resolveCurrentEvidence } = await loadResolver();
  assert.equal(typeof resolveCurrentEvidence, 'function', 'resolveCurrentEvidence behavior is missing');
  const a = evidence('123e4567-e89b-42d3-a456-426614174000');
  const b = evidence('523e4567-e89b-42d3-a456-426614174004', { origin_seq: 2 });
  const c1 = correction('623e4567-e89b-42d3-a456-426614174005', a.event_id, 'SUPERSEDE', { superseding_event_id: b.event_id });
  const c2 = correction('723e4567-e89b-42d3-a456-426614174006', b.event_id, 'SUPERSEDE', { superseding_event_id: a.event_id });
  const result = resolveCurrentEvidence([a, b, c1, c2]);
  assert.equal(result.conflicts.length, 1);
  assert.equal(result.conflicts[0].code, 'SUPERSESSION_CYCLE');
  assert.deepEqual(new Set(result.activeEvents.map((event) => event.event_id)), new Set([a.event_id, b.event_id]));
});

test('correction without explicit authority is unresolved and cannot change current evidence', async () => {
  const { resolveCurrentEvidence } = await loadResolver();
  assert.equal(typeof resolveCurrentEvidence, 'function', 'resolveCurrentEvidence behavior is missing');
  const target = evidence('123e4567-e89b-42d3-a456-426614174000');
  const unauthorized = correction('423e4567-e89b-42d3-a456-426614174003', target.event_id, 'VOID', { authority_ref: '' });
  const result = resolveCurrentEvidence([target, unauthorized]);
  assert.deepEqual(result.activeEvents.map((event) => event.event_id), [target.event_id]);
  assert.deepEqual(result.unresolved, []);
  assert.equal(result.conflicts.length, 1);
  assert.equal(result.conflicts[0].code, 'UNAUTHORIZED_CORRECTION');
});
