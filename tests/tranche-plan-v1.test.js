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
  tranche_id: 'tranche:k2:1',
  expansion_plan_id: 'expansion:sdaia:k2:1',
  track_id: 'sdaia-ai-engineer',
  requests: [
    {
      coverage_gap_id: 'gap:mlops:1',
      requested_families: 12
    }
  ],
  policy_refs: {
    source_policy_version: 'k1.source.grounded.v1',
    quality_policy_version: 'k1.quality.default.v1',
    review_policy_version: 'k1.review.default.v1',
    tranche_calibration_policy_version: 'k2.tranche.calibration.v1'
  },
  risk_distribution: {
    low: 8,
    medium: 4,
    high: 0
  },
  capacity_inputs: {
    review_capacity: 20,
    recent_yield_rate: 0.8
  },
  status: 'PLANNED',
  created_at: '2026-09-28T00:00:00Z'
};

test('TranchePlanV1 requires coverage-derived requests and calibration policy', () => {
  const validate = compile('tranche-plan-v1.schema.json');
  assert.equal(validate(valid), true, JSON.stringify(validate.errors));

  const noRequests = structuredClone(valid);
  noRequests.requests = [];
  assert.equal(validate(noRequests), false);

  const noCalibration = structuredClone(valid);
  delete noCalibration.policy_refs.tranche_calibration_policy_version;
  assert.equal(validate(noCalibration), false);
});

test('TranchePlanV1 constrains lifecycle status', () => {
  const validate = compile('tranche-plan-v1.schema.json');
  const invalid = structuredClone(valid);
  invalid.status = 'ACTIVE';
  assert.equal(validate(invalid), false);
});
