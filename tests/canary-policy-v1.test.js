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
  policy_id: 'k2.canary.default',
  version: '1',
  required_evidence_classes: [
    'runtime_compatibility',
    'quality',
    'review'
  ],
  hold_conditions: [
    'insufficient_evidence',
    'metric_not_mature'
  ],
  blocker_policy: {
    critical_alert: 'QUARANTINE',
    missing_required_metric: 'HOLD'
  },
  exposure_calibration_ref: 'k2.canary.exposure.v1',
  minimum_observation_count: 100,
  created_at: '2026-09-28T00:00:00Z'
};

test('CanaryPolicyV1 requires evidence classes and HOLD semantics', () => {
  const validate = compile('canary-policy-v1.schema.json');
  assert.equal(validate(valid), true, JSON.stringify(validate.errors));

  const noHold = structuredClone(valid);
  noHold.hold_conditions = [];
  assert.equal(validate(noHold), false);

  const noEvidence = structuredClone(valid);
  noEvidence.required_evidence_classes = [];
  assert.equal(validate(noEvidence), false);
});

test('CanaryPolicyV1 rejects fixed duration as sufficient promotion policy', () => {
  const validate = compile('canary-policy-v1.schema.json');
  assert.equal(validate({
    schema_version: 1,
    duration_hours: 24,
    exposure_percent: 10
  }), false);
});


test('CanaryPolicyV1 accepts a versioned minimum observation count', () => {
  const validate = compile('canary-policy-v1.schema.json');
  assert.equal(validate(valid), true, JSON.stringify(validate.errors));
  const invalid = structuredClone(valid);
  invalid.minimum_observation_count = 0;
  assert.equal(validate(invalid), false);
});
