import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const definitions = JSON.parse(readFileSync(new URL('../data/evidence/event-definitions-v1.json', import.meta.url), 'utf8'));
const track = JSON.parse(readFileSync(new URL('../tracks/sdaia-ai-engineer/manifest.json', import.meta.url), 'utf8'));
const evidence = JSON.parse(readFileSync(new URL('../data/evidence/sdaia-ai-engineer.runtime-v1.json', import.meta.url), 'utf8'));

async function loadRuntimeApi() {
  try {
    const ids = await import('../src/evidence/ids.js');
    const contract = await import('../src/evidence/contract.js');
    return { ...ids, ...contract };
  } catch {
    return {};
  }
}

const uuidA = '123e4567-e89b-42d3-a456-426614174000';
const uuidB = '223e4567-e89b-42d3-a456-426614174001';
const uuidC = '323e4567-e89b-42d3-a456-426614174002';
const runtimeContext = { track, evidence, eventDefinitions: definitions };

function responseInput(overrides = {}) {
  return {
    definition_id: 'learner.response.recorded@1',
    learner_id: 'learner:pseudonymous-1',
    origin_id: uuidA,
    origin_seq: 1,
    activity_id: uuidB,
    track_id: track.id,
    content_release_id: evidence.content_release_id,
    mode: 'practice',
    locale: 'en',
    occurred_at: '2026-10-02T18:00:00+03:00',
    item_interaction_id: uuidC,
    item_version_id: 'item-version-1',
    payload: { response_version: 1, response_kind: 'OPTION', response: { option_index: 0 } },
    ...overrides
  };
}

test('newUuid returns opaque UUIDv4 values', async () => {
  const { newUuid } = await loadRuntimeApi();
  assert.equal(typeof newUuid, 'function', 'newUuid behavior is missing');
  const a = newUuid();
  const b = newUuid();
  const v4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  assert.match(a, v4);
  assert.match(b, v4);
  assert.notEqual(a, b);
});

test('constructor normalizes source occurrence time to UTC and validates the event', async () => {
  const { createLearnerEvidenceEvent, validateLearnerEvidenceEvent } = await loadRuntimeApi();
  assert.equal(typeof createLearnerEvidenceEvent, 'function', 'event constructor behavior is missing');
  assert.equal(typeof validateLearnerEvidenceEvent, 'function', 'event validation behavior is missing');
  const event = createLearnerEvidenceEvent(responseInput(), runtimeContext);
  assert.equal(event.occurred_at, '2026-10-02T15:00:00.000Z');
  assert.match(event.event_id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  assert.deepEqual(validateLearnerEvidenceEvent(event, runtimeContext), { ok: true, errors: [] });
});

test('validation rejects locale outside the active track contract', async () => {
  const { createLearnerEvidenceEvent } = await loadRuntimeApi();
  assert.equal(typeof createLearnerEvidenceEvent, 'function', 'event constructor behavior is missing');
  assert.throws(() => createLearnerEvidenceEvent(responseInput({ locale: 'fr' }), runtimeContext), /locale/i);
});

test('validation enforces definition required context', async () => {
  const { createLearnerEvidenceEvent } = await loadRuntimeApi();
  assert.equal(typeof createLearnerEvidenceEvent, 'function', 'event constructor behavior is missing');
  const input = responseInput();
  delete input.item_interaction_id;
  assert.throws(() => createLearnerEvidenceEvent(input, runtimeContext), /item_interaction_id|required context/i);
});

test('authority-sensitive definitions require authority_ref', async () => {
  const { createLearnerEvidenceEvent } = await loadRuntimeApi();
  assert.equal(typeof createLearnerEvidenceEvent, 'function', 'event constructor behavior is missing');
  const evaluated = responseInput({
    definition_id: 'learner.response.evaluated@1',
    payload: {
      response_event_id: uuidC,
      scoring_policy_ref: evidence.scoring_policy_ref,
      evaluation_status: 'GRADED',
      correct: true,
      score: 1
    }
  });
  delete evaluated.item_interaction_id;
  assert.throws(() => createLearnerEvidenceEvent(evaluated, runtimeContext), /authority_ref|required context/i);
});

test('validation rejects direct PII learner principals and derived truth fields', async () => {
  const { createLearnerEvidenceEvent } = await loadRuntimeApi();
  assert.equal(typeof createLearnerEvidenceEvent, 'function', 'event constructor behavior is missing');
  assert.throws(() => createLearnerEvidenceEvent(responseInput({ learner_id: 'person@example.com' }), runtimeContext), /learner_id|PII|pseudonymous/i);
  assert.throws(() => createLearnerEvidenceEvent({ ...responseInput(), mastery: 0.9 }, runtimeContext), /mastery|additional|field/i);
});
