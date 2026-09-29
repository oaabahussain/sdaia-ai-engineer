import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import Ajv from 'ajv';

const schemaUrl = new URL('../data/schema/event-definition-v2.schema.json', import.meta.url);

const valid = {
  schema_version: 2,
  event_name: 'learner.response.recorded',
  event_version: 1,
  plane: 'LEARNER_EVIDENCE',
  purpose: 'Preserve a learner response as canonical evidence',
  owner: 'learning-platform',
  trigger_semantics: 'Emit after a response is durably committed locally',
  actor_kind: 'LEARNER',
  producer: 'web-client',
  required_context_fields: ['track_id','content_release_id','activity_id','item_id'],
  payload_schema_ref: 'data/evidence/payload-schemas/learner-response-recorded-v1.schema.json',
  properties: {
    response_kind: {type:'string',required:true,privacy_class:'PSEUDONYMOUS',export:'ALLOW'},
    response: {type:'object',required:true,privacy_class:'PSEUDONYMOUS',export:'ALLOW'}
  },
  privacy_class: 'PSEUDONYMOUS',
  retention_class: 'STANDARD',
  compatibility: {strategy:'NEW_EVENT',previous_versions:[]},
  created_at: '2026-09-29T00:00:00Z'
};

test('EventDefinitionV2 schema accepts governed learner evidence definitions', () => {
  assert.equal(fs.existsSync(schemaUrl), true, 'EventDefinitionV2 schema must exist');
  const schema = JSON.parse(fs.readFileSync(schemaUrl, 'utf8'));
  const validate = new Ajv({strict:false,allErrors:true,formats:{'date-time':true}}).compile(schema);
  assert.equal(validate(valid), true, JSON.stringify(validate.errors));
});

test('EventDefinitionV2 constrains plane and actor kind', () => {
  if (!fs.existsSync(schemaUrl)) return;
  const schema = JSON.parse(fs.readFileSync(schemaUrl, 'utf8'));
  const validate = new Ajv({strict:false,allErrors:true,formats:{'date-time':true}}).compile(schema);
  for (const plane of ['PRODUCT_ANALYTICS','LEARNER_EVIDENCE']) {
    assert.equal(validate({...valid,plane}), true, JSON.stringify(validate.errors));
  }
  assert.equal(validate({...valid,plane:'SYSTEM_TELEMETRY'}), false);
  for (const actor_kind of ['LEARNER','SYSTEM','MIGRATION','ADMINISTRATIVE']) {
    assert.equal(validate({...valid,actor_kind}), true, JSON.stringify(validate.errors));
  }
  assert.equal(validate({...valid,actor_kind:'VENDOR'}), false);
});

test('EventDefinitionV2 requires context and payload schema governance', () => {
  if (!fs.existsSync(schemaUrl)) return;
  const schema = JSON.parse(fs.readFileSync(schemaUrl, 'utf8'));
  const validate = new Ajv({strict:false,allErrors:true,formats:{'date-time':true}}).compile(schema);
  for (const field of ['plane','actor_kind','required_context_fields','payload_schema_ref']) {
    const candidate=structuredClone(valid); delete candidate[field];
    assert.equal(validate(candidate), false, field);
  }
});
