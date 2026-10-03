import test from 'node:test';
import assert from 'node:assert/strict';

async function loadLegacy() {
  try { return await import('../src/evidence/legacy.js'); }
  catch { return {}; }
}

function base(overrides = {}) {
  return {
    schema_version: 1,
    event_id: 'le:1',
    learner_id: 'anon:1',
    track_id: 'sdaia-ai-engineer',
    content_release_id: 'rel:1',
    form_id: 'form:1',
    question_family_id: 'fam:1',
    item_version_id: 'item:1',
    objective_id: 'obj:1',
    domain_id: 'mlops-llmops',
    mode: 'practice',
    locale: 'ar',
    shown_at: '2026-09-27T00:00:00Z',
    answered_at: '2026-09-27T00:00:05Z',
    answer: 1,
    correct: true,
    confidence: 'high',
    latency_ms: 5000,
    hint_used: false,
    explanation_opened: false,
    attempt_number: 1,
    ...overrides
  };
}

test('schema-complete LearnerEventV1 is VALID_V1 and remains coarse read-only evidence', async () => {
  const { classifyLegacyLearnerEvent, readLegacyLearnerEvidence } = await loadLegacy();
  assert.equal(typeof classifyLegacyLearnerEvent, 'function', 'classifyLegacyLearnerEvent behavior is missing');
  assert.equal(typeof readLegacyLearnerEvidence, 'function', 'readLegacyLearnerEvidence behavior is missing');
  const record = base();
  const before = structuredClone(record);
  assert.equal(classifyLegacyLearnerEvent(record), 'VALID_V1');
  const view = readLegacyLearnerEvidence(record);
  assert.equal(view.classification, 'VALID_V1');
  assert.equal(view.granularity, 'COARSE_AGGREGATE');
  assert.deepEqual(view.evidence, record);
  assert.deepEqual(record, before);
});

test('missing confidence is a KNOWN_V1_VARIANT and confidence stays missing', async () => {
  const { classifyLegacyLearnerEvent, readLegacyLearnerEvidence } = await loadLegacy();
  assert.equal(typeof classifyLegacyLearnerEvent, 'function', 'classifyLegacyLearnerEvent behavior is missing');
  const record = base();
  delete record.confidence;
  assert.equal(classifyLegacyLearnerEvent(record), 'KNOWN_V1_VARIANT');
  const view = readLegacyLearnerEvidence(record);
  assert.equal(view.classification, 'KNOWN_V1_VARIANT');
  assert.equal(Object.hasOwn(view.evidence, 'confidence'), false);
  assert.equal(view.evidence.answer, 1);
});

test('JS-runtime historical variant may omit answer and confidence without invented replacements', async () => {
  const { classifyLegacyLearnerEvent, readLegacyLearnerEvidence } = await loadLegacy();
  assert.equal(typeof classifyLegacyLearnerEvent, 'function', 'classifyLegacyLearnerEvent behavior is missing');
  const record = base();
  delete record.answer;
  delete record.confidence;
  assert.equal(classifyLegacyLearnerEvent(record), 'KNOWN_V1_VARIANT');
  const view = readLegacyLearnerEvidence(record);
  assert.equal(Object.hasOwn(view.evidence, 'answer'), false);
  assert.equal(Object.hasOwn(view.evidence, 'confidence'), false);
  assert.equal(Object.hasOwn(view.evidence, 'exposure_sequence'), false);
  assert.equal(Object.hasOwn(view.evidence, 'hint_order'), false);
});

test('record missing a non-drift required field is INVALID_LEGACY_RECORD', async () => {
  const { classifyLegacyLearnerEvent, readLegacyLearnerEvidence } = await loadLegacy();
  assert.equal(typeof classifyLegacyLearnerEvent, 'function', 'classifyLegacyLearnerEvent behavior is missing');
  const record = base();
  delete record.item_version_id;
  assert.equal(classifyLegacyLearnerEvent(record), 'INVALID_LEGACY_RECORD');
  assert.deepEqual(readLegacyLearnerEvidence(record), {
    classification: 'INVALID_LEGACY_RECORD',
    granularity: 'COARSE_AGGREGATE',
    evidence: null
  });
});

test('schema-invalid values are not mislabeled as known drift variants', async () => {
  const { classifyLegacyLearnerEvent } = await loadLegacy();
  assert.equal(typeof classifyLegacyLearnerEvent, 'function', 'classifyLegacyLearnerEvent behavior is missing');
  assert.equal(classifyLegacyLearnerEvent(base({ correct: 'yes' })), 'INVALID_LEGACY_RECORD');
  assert.equal(classifyLegacyLearnerEvent(base({ confidence: 'certain' })), 'INVALID_LEGACY_RECORD');
  assert.equal(classifyLegacyLearnerEvent(base({ mastery: 0.9 })), 'INVALID_LEGACY_RECORD');
});
