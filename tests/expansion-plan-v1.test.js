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
  plan_id: 'expansion:sdaia:k2:1',
  track_id: 'sdaia-ai-engineer',
  coverage_gap_ids: ['gap:mlops:1'],
  priorities: [
    {
      gap_id: 'gap:mlops:1',
      rank: 1,
      reason: 'coverage deficit',
      requested_count: 4
    }
  ],
  tranche_refs: [],
  policy_versions: {
    source_policy_version: 'k1.source.grounded.v1',
    quality_policy_version: 'k1.quality.default.v1',
    review_policy_version: 'k1.review.default.v1',
    tranche_calibration_policy_version: 'k2.tranche.calibration.v1'
  },
  status: 'PLANNED',
  created_at: '2026-09-28T00:00:00Z'
};

test('ExpansionPlanV1 requires coverage gaps, deficits and versioned policies', () => {
  const validate = compile('expansion-plan-v1.schema.json');
  assert.equal(validate(valid), true, JSON.stringify(validate.errors));

  const noGaps = structuredClone(valid);
  noGaps.coverage_gap_ids = [];
  assert.equal(validate(noGaps), false);

  const noDeficit = structuredClone(valid);
  delete noDeficit.priorities[0].requested_count;
  assert.equal(validate(noDeficit), false);

  const noPolicies = structuredClone(valid);
  delete noPolicies.policy_versions;
  assert.equal(validate(noPolicies), false);
});

test('ExpansionPlanV1 rejects raw count-only expansion plans', () => {
  const validate = compile('expansion-plan-v1.schema.json');
  assert.equal(validate({
    schema_version: 1,
    requested_count: 14000
  }), false);
});
