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
  activation_evidence_id: 'activation:release-1:1',
  release_id: 'release-1',
  tranche_id: 'tranche-1',
  content_hash: 'a'.repeat(64),
  policy_versions: {
    quality_policy_version: 'quality:v1',
    review_policy_version: 'review:v2',
    calibration_policy_versions: [
      'tranche:v1',
      'dedup:v1',
      'canary:v1'
    ]
  },
  provider_evaluation_refs: ['provider-eval:1'],
  coverage_delta: {
    closed_gap_ids: ['gap:a'],
    added_family_count: 20
  },
  duplicate_findings: {
    status: 'PASS',
    finding_count: 0
  },
  correctness_summary: { status: 'PASS' },
  bilingual_summary: { status: 'PASS' },
  accessibility_summary: { status: 'PASS' },
  review_summary: {
    status: 'PASS',
    unresolved_count: 0
  },
  runtime_verification: { status: 'PASS' },
  canary_observation: {
    evidence_classes: ['runtime_compatibility', 'quality', 'review'],
    observation_ref: 'canary:obs:1',
    observation_count: 100
  },
  blockers: [],
  evidence_sufficiency: 'SUFFICIENT',
  decision: 'PROMOTE',
  actor: 'k2-release-controller',
  approver: 'release-policy',
  created_at: '2026-09-28T00:00:00Z'
};

test('ActivationEvidenceV1 requires structured release evidence', () => {
  const validate = compile('activation-evidence-v1.schema.json');
  assert.equal(validate(valid), true, JSON.stringify(validate.errors));

  assert.equal(validate('quality:pass'), false);

  const noRuntime = structuredClone(valid);
  delete noRuntime.runtime_verification;
  assert.equal(validate(noRuntime), false);

  const noPolicies = structuredClone(valid);
  delete noPolicies.policy_versions;
  assert.equal(validate(noPolicies), false);
});

test('ActivationEvidenceV1 constrains lifecycle decisions and content hash', () => {
  const validate = compile('activation-evidence-v1.schema.json');

  const invalidDecision = structuredClone(valid);
  invalidDecision.decision = 'PASS';
  assert.equal(validate(invalidDecision), false);

  const invalidHash = structuredClone(valid);
  invalidHash.content_hash = 'not-a-hash';
  assert.equal(validate(invalidHash), false);

  for (const decision of ['PROMOTE', 'HOLD', 'REVISE', 'QUARANTINE', 'ROLLBACK']) {
    const candidate = structuredClone(valid);
    candidate.decision = decision;
    assert.equal(validate(candidate), true, JSON.stringify(validate.errors));
  }
});


test('ActivationEvidenceV1 requires positive observation_count when provided', () => {
  const validate = compile('activation-evidence-v1.schema.json');
  assert.equal(validate(valid), true, JSON.stringify(validate.errors));
  const invalid = structuredClone(valid);
  invalid.canary_observation.observation_count = 0;
  assert.equal(validate(invalid), false);
});
