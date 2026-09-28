import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import Ajv from 'ajv';

const load = name => JSON.parse(
  fs.readFileSync(new URL('../data/schema/' + name, import.meta.url), 'utf8')
);
const compile = name => new Ajv({
  strict: false,
  allErrors: true,
  formats: { 'date-time': true }
}).compile(load(name));

const valid = {
  schema_version: 1,
  event_name: 'learning.practice.started',
  event_version: 1,
  purpose: 'Measure practice funnel entry without inferring learning outcome',
  owner: 'learning-platform',
  trigger_semantics: 'Emit once when a user explicitly starts a practice session',
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

test('EventDefinitionV1 requires purpose, versioned name and governance metadata', () => {
  const validate = compile('event-definition-v1.schema.json');
  assert.equal(validate(valid), true, JSON.stringify(validate.errors));

  const noPurpose = structuredClone(valid);
  delete noPurpose.purpose;
  assert.equal(validate(noPurpose), false);

  const noVersion = structuredClone(valid);
  delete noVersion.event_version;
  assert.equal(validate(noVersion), false);
});

test('EventDefinitionV1 rejects unknown privacy and retention classes', () => {
  const validate = compile('event-definition-v1.schema.json');

  const badPrivacy = structuredClone(valid);
  badPrivacy.privacy_class = 'SECRET';
  assert.equal(validate(badPrivacy), false);

  const badRetention = structuredClone(valid);
  badRetention.retention_class = 'FOREVER';
  assert.equal(validate(badRetention), false);
});

test('EventDefinitionV1 requires governed property definitions', () => {
  const validate = compile('event-definition-v1.schema.json');

  const badProperty = structuredClone(valid);
  badProperty.properties.email = {
    type: 'string',
    required: false
  };
  assert.equal(validate(badProperty), false);
});
