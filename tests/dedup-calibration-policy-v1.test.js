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
  policy_id: 'k2.dedup.calibration',
  version: '1',
  scope: {
    kind: 'track',
    ref: 'sdaia-ai-engineer'
  },
  evidence_basis: ['pilot:k2:dedup:001'],
  labeled_set_ref: 'dataset:k2:dedup-gold:v1',
  embedding_profile: {
    provider: 'adapter',
    model: 'multilingual-embedding',
    version: '1'
  },
  same_language: {
    review_lower_bound: 0.86,
    duplicate_threshold: 0.95
  },
  cross_language: {
    review_lower_bound: 0.82,
    duplicate_threshold: 0.93
  },
  created_at: '2026-09-28T00:00:00Z'
};

test('DedupCalibrationPolicyV1 requires labeled calibration evidence', () => {
  const validate = compile('dedup-calibration-policy-v1.schema.json');
  assert.equal(validate(valid), true, JSON.stringify(validate.errors));

  const noLabeledSet = structuredClone(valid);
  delete noLabeledSet.labeled_set_ref;
  assert.equal(validate(noLabeledSet), false);
});

test('DedupCalibrationPolicyV1 scopes same and cross language thresholds', () => {
  const validate = compile('dedup-calibration-policy-v1.schema.json');

  const invalid = structuredClone(valid);
  invalid.cross_language.duplicate_threshold = 1.5;
  assert.equal(validate(invalid), false);
});
