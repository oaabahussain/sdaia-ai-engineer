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
  policy_id: 'k2.review.calibration',
  version: '1',
  scope: {
    kind: 'track',
    ref: 'sdaia-ai-engineer'
  },
  evidence_basis: ['pilot:k2:review:001'],
  risk_rules: [
    {
      risk_class: 'high',
      decision: 'HUMAN_REQUIRED'
    },
    {
      risk_class: 'low',
      decision: 'SAMPLED',
      sampling_rate: 0.2
    }
  ],
  mandatory_human_conditions: [
    'new_provider',
    'evidence_ambiguity'
  ],
  escalation_triggers: [
    {
      metric: 'rejection_rate',
      operator: 'gte',
      threshold: 0.1,
      action: 'HUMAN_REQUIRED'
    }
  ],
  created_at: '2026-09-28T00:00:00Z'
};

test('ReviewCalibrationPolicyV1 requires scoped evidence-backed review rules', () => {
  const validate = compile('review-calibration-policy-v1.schema.json');
  assert.equal(validate(valid), true, JSON.stringify(validate.errors));

  const noEvidence = structuredClone(valid);
  noEvidence.evidence_basis = [];
  assert.equal(validate(noEvidence), false);

  const noEscalation = structuredClone(valid);
  noEscalation.escalation_triggers = [];
  assert.equal(validate(noEscalation), false);
});

test('ReviewCalibrationPolicyV1 rejects a bare sampling percentage', () => {
  const validate = compile('review-calibration-policy-v1.schema.json');
  assert.equal(validate({
    schema_version: 1,
    sampling_rate: 0.1
  }), false);
});
