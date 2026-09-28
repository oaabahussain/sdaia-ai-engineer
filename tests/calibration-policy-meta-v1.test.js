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
  policy_id: 'k2.tranche.calibration',
  version: '1',
  scope: {
    kind: 'track',
    ref: 'sdaia-ai-engineer'
  },
  evidence_basis: ['pilot:k2:001'],
  effective_from: '2026-09-28T00:00:00Z',
  observed_data_refs: ['metrics:k2:pilot:001'],
  owner: 'platform-governance',
  approver: 'human-reviewer',
  reconsideration_trigger: 'yield drops below calibrated guardrail'
};

test('CalibrationPolicy metadata requires immutable identity and evidence basis', () => {
  const validate = compile('calibration-policy-meta-v1.schema.json');
  assert.equal(validate(valid), true, JSON.stringify(validate.errors));

  const noVersion = structuredClone(valid);
  delete noVersion.version;
  assert.equal(validate(noVersion), false);

  const noEvidence = structuredClone(valid);
  noEvidence.evidence_basis = [];
  assert.equal(validate(noEvidence), false);
});

test('CalibrationPolicy metadata rejects empty scope references for scoped policies', () => {
  const validate = compile('calibration-policy-meta-v1.schema.json');
  const invalid = structuredClone(valid);
  invalid.scope.ref = '';
  assert.equal(validate(invalid), false);
});
