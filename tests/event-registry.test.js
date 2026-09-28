import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const moduleUrl = new URL('../src/platform-kernel/observability/eventRegistry.js', import.meta.url);
const moduleExists = () => fs.existsSync(moduleUrl);

const definition = {
  schema_version: 1,
  event_name: 'learning.practice.started',
  event_version: 1,
  purpose: 'Measure practice funnel entry',
  owner: 'learning-platform',
  trigger_semantics: 'Emit once when practice starts',
  properties: {
    track_id: {
      type: 'string',
      required: true,
      privacy_class: 'ANONYMOUS',
      export: 'ALLOW'
    },
    learner_ref: {
      type: 'string',
      required: false,
      privacy_class: 'PSEUDONYMOUS',
      export: 'ALLOW'
    }
  },
  privacy_class: 'PSEUDONYMOUS',
  retention_class: 'STANDARD',
  producer: 'web-client',
  compatibility: {
    strategy: 'BACKWARD_COMPATIBLE',
    previous_versions: []
  },
  created_at: '2026-09-28T00:00:00Z'
};

test('event registry module exists', () => {
  assert.equal(moduleExists(), true);
});

test('registerEventDefinition validates definition and returns exact version id', async () => {
  if (!moduleExists()) return;
  const { registerEventDefinition } = await import(moduleUrl);
  assert.equal(
    registerEventDefinition(definition),
    'learning.practice.started@1'
  );
});

test('validateEvent rejects unknown or unversioned definitions', async () => {
  if (!moduleExists()) return;
  const { validateEvent } = await import(moduleUrl);

  assert.throws(
    () => validateEvent('learning.practice.unknown@1', {
      occurred_at: '2026-09-28T00:00:00Z',
      properties: { track_id: 'sdaia-ai-engineer' }
    }),
    /unknown/i
  );

  assert.throws(
    () => validateEvent('learning.practice.started', {
      occurred_at: '2026-09-28T00:00:00Z',
      properties: { track_id: 'sdaia-ai-engineer' }
    }),
    /version|definition/i
  );
});

test('validateEvent returns canonical frozen envelope and enforces property contract', async () => {
  if (!moduleExists()) return;
  const { registerEventDefinition, validateEvent } = await import(moduleUrl);
  const definitionId = registerEventDefinition(definition);

  const event = validateEvent(definitionId, {
    occurred_at: '2026-09-28T00:00:00Z',
    properties: {
      track_id: 'sdaia-ai-engineer',
      learner_ref: 'anon:123'
    }
  });

  assert.equal(event.definition_id, definitionId);
  assert.equal(event.event_name, definition.event_name);
  assert.equal(event.event_version, 1);
  assert.equal(event.producer, 'web-client');
  assert.equal(Object.isFrozen(event), true);

  assert.throws(
    () => validateEvent(definitionId, {
      occurred_at: '2026-09-28T00:00:00Z',
      properties: {}
    }),
    /track_id|required/i
  );

  assert.throws(
    () => validateEvent(definitionId, {
      occurred_at: '2026-09-28T00:00:00Z',
      properties: {
        track_id: 'sdaia-ai-engineer',
        email: 'should-not-be-here@example.com'
      }
    }),
    /unknown|email/i
  );
});


test('event registry enforces REDACT and REJECT privacy actions before trust', async () => {
  const { registerEventDefinition, validateEvent } = await import('../src/platform-kernel/observability/eventRegistry.js');

  const redactId = registerEventDefinition({
    schema_version:1,event_name:'privacy.redact.test',event_version:1,
    purpose:'prove registry privacy enforcement',owner:'test',
    trigger_semantics:'test only',
    properties:{
      track_id:{type:'string',required:true,privacy_class:'ANONYMOUS',export:'ALLOW'},
      free_text:{type:'string',required:false,privacy_class:'SENSITIVE',export:'REDACT'}
    },
    privacy_class:'SENSITIVE',retention_class:'SHORT',producer:'test',
    compatibility:{strategy:'NEW_EVENT',previous_versions:[]},
    created_at:'2026-09-28T00:00:00Z'
  });
  const redacted = validateEvent(redactId,{
    occurred_at:'2026-09-28T00:00:01Z',
    properties:{track_id:'t1',free_text:'private'}
  });
  assert.deepEqual(redacted.properties,{track_id:'t1'});

  const rejectId = registerEventDefinition({
    schema_version:1,event_name:'privacy.reject.test',event_version:1,
    purpose:'prove registry privacy rejection',owner:'test',
    trigger_semantics:'test only',
    properties:{
      track_id:{type:'string',required:true,privacy_class:'ANONYMOUS',export:'ALLOW'},
      raw_secret:{type:'string',required:false,privacy_class:'SENSITIVE',export:'REJECT'}
    },
    privacy_class:'SENSITIVE',retention_class:'SHORT',producer:'test',
    compatibility:{strategy:'NEW_EVENT',previous_versions:[]},
    created_at:'2026-09-28T00:00:00Z'
  });
  assert.throws(()=>validateEvent(rejectId,{
    occurred_at:'2026-09-28T00:00:01Z',
    properties:{track_id:'t1',raw_secret:'secret'}
  }),/privacy|reject/i);
});
