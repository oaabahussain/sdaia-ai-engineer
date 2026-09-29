import test from 'node:test';
import assert from 'node:assert/strict';
import {registerEventDefinition, getEventDefinition, validateEvent} from '../src/platform-kernel/observability/eventRegistry.js';

const v2 = {
  schema_version:2,event_name:'learner.response.recorded',event_version:1,
  plane:'LEARNER_EVIDENCE',purpose:'Preserve response evidence',owner:'learning-platform',
  trigger_semantics:'After local durable response commit',actor_kind:'LEARNER',producer:'web-client',
  required_context_fields:['track_id','content_release_id','activity_id','item_id'],
  payload_schema_ref:'data/evidence/payload-schemas/response-recorded-v1.schema.json',
  properties:{response_version:{type:'integer',required:true,privacy_class:'PSEUDONYMOUS',export:'ALLOW'},response_kind:{type:'string',required:true,privacy_class:'PSEUDONYMOUS',export:'ALLOW'},response:{type:'object',required:true,privacy_class:'PSEUDONYMOUS',export:'ALLOW'}},
  privacy_class:'PSEUDONYMOUS',retention_class:'STANDARD',
  compatibility:{strategy:'NEW_EVENT',previous_versions:[]},created_at:'2026-09-29T00:00:00Z'
};

test('registry accepts and freezes EventDefinitionV2', () => {
  const id=registerEventDefinition(v2);
  assert.equal(id,'learner.response.recorded@1');
  const stored=getEventDefinition(id);
  assert.equal(stored.plane,'LEARNER_EVIDENCE');
  assert.equal(Object.isFrozen(stored),true);
  assert.equal(Object.isFrozen(stored.required_context_fields),true);
});

test('registered name/version remains immutable across V2 registrations', () => {
  registerEventDefinition(v2);
  assert.throws(
    ()=>registerEventDefinition({...v2,purpose:'Changed semantics'}),
    /immutable/i
  );
});

test('analytics validateEvent refuses learner-evidence definitions', () => {
  const id=registerEventDefinition(v2);
  assert.throws(
    ()=>validateEvent(id,{occurred_at:'2026-09-29T00:00:01Z',properties:{response_kind:'OPTION'}}),
    /learner|analytics|plane/i
  );
});

test('EventDefinitionV1 remains registerable after V2 support', () => {
  const v1={
    schema_version:1,event_name:'product.k3.compatibility',event_version:1,
    purpose:'Protect V1 compatibility',owner:'product-platform',trigger_semantics:'test',
    properties:{track_id:{type:'string',required:true,privacy_class:'ANONYMOUS',export:'ALLOW'}},
    privacy_class:'ANONYMOUS',retention_class:'STANDARD',producer:'test',
    compatibility:{strategy:'NEW_EVENT',previous_versions:[]},created_at:'2026-09-29T00:00:00Z'
  };
  assert.equal(registerEventDefinition(v1),'product.k3.compatibility@1');
});
