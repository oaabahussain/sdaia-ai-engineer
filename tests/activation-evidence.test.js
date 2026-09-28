import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const moduleUrl = new URL('../src/platform-kernel/release/activationEvidence.js', import.meta.url);
const moduleExists = () => fs.existsSync(moduleUrl);

const policy = {
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
  created_at: '2026-09-28T00:00:00Z'
};

function evidence(overrides = {}) {
  return {
    schema_version: 1,
    activation_evidence_id: 'activation:release-1:1',
    release_id: 'release-1',
    tranche_id: 'tranche-1',
    content_hash: 'a'.repeat(64),
    policy_versions: {
      quality_policy_version: 'quality:v1',
      review_policy_version: 'review:v2',
      calibration_policy_versions: ['canary:v1']
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
      evidence_classes: [
        'runtime_compatibility',
        'quality',
        'review'
      ],
      observation_ref: 'canary:obs:1'
    },
    blockers: [],
    evidence_sufficiency: 'SUFFICIENT',
    decision: 'PROMOTE',
    actor: 'k2-release-controller',
    approver: 'release-policy',
    created_at: '2026-09-28T00:00:00Z',
    ...overrides
  };
}

test('activation evidence evaluator module exists', () => {
  assert.equal(moduleExists(), true);
});

test('evaluateActivationEvidence promotes only when required evidence is sufficient and unblocked', async () => {
  if (!moduleExists()) return;
  const { evaluateActivationEvidence } = await import(moduleUrl);

  assert.deepEqual(
    evaluateActivationEvidence(evidence(), policy),
    {
      decision: 'PROMOTE',
      reason: 'activation_evidence_passed',
      missingEvidenceClasses: [],
      blockers: []
    }
  );
});

test('evaluateActivationEvidence holds when required evidence is missing or insufficient', async () => {
  if (!moduleExists()) return;
  const { evaluateActivationEvidence } = await import(moduleUrl);

  const missing = evidence({
    canary_observation: {
      evidence_classes: ['runtime_compatibility', 'quality'],
      observation_ref: 'canary:obs:missing-review'
    }
  });

  assert.deepEqual(
    evaluateActivationEvidence(missing, policy),
    {
      decision: 'HOLD',
      reason: 'missing_required_evidence',
      missingEvidenceClasses: ['review'],
      blockers: []
    }
  );

  const insufficient = evidence({
    evidence_sufficiency: 'INSUFFICIENT'
  });

  assert.deepEqual(
    evaluateActivationEvidence(insufficient, policy),
    {
      decision: 'HOLD',
      reason: 'insufficient_evidence',
      missingEvidenceClasses: [],
      blockers: []
    }
  );
});

test('evaluateActivationEvidence applies blocker policy instead of trusting PROMOTE metadata', async () => {
  if (!moduleExists()) return;
  const { evaluateActivationEvidence } = await import(moduleUrl);

  const blocked = evidence({
    blockers: ['critical:runtime-regression'],
    decision: 'PROMOTE'
  });

  assert.deepEqual(
    evaluateActivationEvidence(blocked, policy),
    {
      decision: 'QUARANTINE',
      reason: 'critical_blocker',
      missingEvidenceClasses: [],
      blockers: ['critical:runtime-regression']
    }
  );
});

test('evaluateActivationEvidence blocks failed critical summaries', async () => {
  if (!moduleExists()) return;
  const { evaluateActivationEvidence } = await import(moduleUrl);

  const badRuntime = evidence({
    runtime_verification: { status: 'FAIL' }
  });

  assert.equal(
    evaluateActivationEvidence(badRuntime, policy).decision,
    'QUARANTINE'
  );

  const unresolvedReview = evidence({
    review_summary: {
      status: 'REVIEW_REQUIRED',
      unresolved_count: 1
    }
  });

  assert.deepEqual(
    evaluateActivationEvidence(unresolvedReview, policy),
    {
      decision: 'HOLD',
      reason: 'review_incomplete',
      missingEvidenceClasses: [],
      blockers: []
    }
  );
});
