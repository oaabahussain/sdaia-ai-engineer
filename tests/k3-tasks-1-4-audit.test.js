import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import Ajv from 'ajv';
import { registerEventDefinition } from '../src/platform-kernel/observability/eventRegistry.js';

const readJson = p => JSON.parse(fs.readFileSync(new URL('../' + p, import.meta.url), 'utf8'));
const ajvFor = () => new Ajv({ strict:false, allErrors:true, formats:{'date-time':true} });
const uuid = '123e4567-e89b-42d3-a456-426614174000';
const uuid2 = '223e4567-e89b-42d3-a456-426614174001';

function baseEvent(locale='fr') {
  return {
    schema_version:2,
    event_id:uuid,
    definition_id:'learner.response.recorded@1',
    learner_id:'learner:a',
    origin_id:uuid2,
    origin_seq:1,
    activity_id:uuid,
    track_id:'future-track',
    content_release_id:'release-1',
    mode:'practice',
    locale,
    occurred_at:'2026-09-29T00:00:00Z',
    payload:{response_kind:'OPTION',response:{option_index:0}}
  };
}

test('LearnerEvidenceEventV2 core schema does not hard-code AR/EN locales', () => {
  const validate = ajvFor().compile(readJson('data/schema/learner-evidence-event-v2.schema.json'));
  assert.equal(validate(baseEvent('fr')), true, JSON.stringify(validate.errors));
});

test('EventDefinitionV2 registration rejects property names/types that disagree with payload_schema_ref', () => {
  const mismatch = {
    schema_version:2,
    event_name:'learner.audit.schemamismatch',
    event_version:1,
    plane:'LEARNER_EVIDENCE',
    purpose:'Audit payload governance',
    owner:'learning-platform',
    trigger_semantics:'audit',
    actor_kind:'SYSTEM',
    producer:'learning-platform',
    required_context_fields:['activity_id'],
    payload_schema_ref:'data/evidence/payload-schemas/response-recorded-v1.schema.json',
    properties:{
      response_kind:{type:'integer',required:true,privacy_class:'PSEUDONYMOUS',export:'ALLOW'}
    },
    privacy_class:'PSEUDONYMOUS',
    retention_class:'STANDARD',
    compatibility:{strategy:'NEW_EVENT',previous_versions:[]},
    created_at:'2026-09-29T00:00:00Z'
  };
  assert.throws(() => registerEventDefinition(mismatch), /payload|properties|schema/i);
});

test('authority payload schemas enforce APPLIED and SUPERSEDE conditional references', () => {
  const mutation = ajvFor().compile(readJson('data/evidence/payload-schemas/assessment-mutation-resolved-v1.schema.json'));
  const applied = {
    candidate_event_id:uuid,
    assessment_attempt_id:uuid2,
    base_attempt_revision:0,
    authoritative_revision_before:0,
    decision:'APPLIED',
    reason_code:'MATCH'
  };
  assert.equal(mutation(applied), false, 'APPLIED must require authoritative_revision_after');
  assert.equal(mutation({...applied, decision:'STALE'}), true, JSON.stringify(mutation.errors));

  const correction = ajvFor().compile(readJson('data/evidence/payload-schemas/evidence-correction-recorded-v1.schema.json'));
  const supersede = {target_event_id:uuid, action:'SUPERSEDE', reason_code:'CORRECTION'};
  assert.equal(correction(supersede), false, 'SUPERSEDE must require superseding_event_id');
  assert.equal(correction({...supersede, action:'VOID'}), true, JSON.stringify(correction.errors));
});

test('events with no spec-required payload do not invent required completion/presentation fields', () => {
  for (const path of [
    'data/evidence/payload-schemas/activity-completed-v1.schema.json',
    'data/evidence/payload-schemas/item-presented-v1.schema.json'
  ]) {
    const validate = ajvFor().compile(readJson(path));
    assert.equal(validate({}), true, path + ': ' + JSON.stringify(validate.errors));
  }
});

test('AttemptProjectionV1 retains applicable release, scoring and resolution metadata', () => {
  const schema = readJson('data/schema/attempt-projection-v1.schema.json');
  for (const field of [
    'content_release_id','scoring_policy_ref',
    'identity_resolution_version','unresolved_reference_count'
  ]) {
    assert.ok(schema.properties[field], 'missing property ' + field);
    assert.ok(schema.required.includes(field), 'field must be required: ' + field);
  }
});


test('runtime evidence context constrains question payload digest to lowercase SHA-256 hex', () => {
  const schema = readJson('data/schema/runtime-evidence-context-v1.schema.json');
  assert.equal(schema.properties.question_payload_sha256.pattern, '^[0-9a-f]{64}$');
});
