import test from 'node:test';
import assert from 'node:assert/strict';

const canaryPolicy = {
  required_evidence_classes: ['runtime_compatibility','quality','review'],
  blocker_policy: { critical_alert: 'QUARANTINE', missing_required_metric: 'HOLD' }
};

function activationEvidence(overrides = {}) {
  return {
    schema_version: 1,
    activation_evidence_id: 'activation:r:1',
    release_id: 'r',
    tranche_id: 'tranche:1',
    content_hash: 'a'.repeat(64),
    policy_versions: {
      quality_policy_version: 'quality:v1',
      review_policy_version: 'review:v1',
      calibration_policy_versions: ['canary:v1']
    },
    provider_evaluation_refs: ['provider-eval:1'],
    coverage_delta: { closed_gap_ids: ['gap:1'], added_family_count: 1 },
    duplicate_findings: { status: 'PASS', finding_count: 0 },
    correctness_summary: { status: 'PASS' },
    bilingual_summary: { status: 'PASS' },
    accessibility_summary: { status: 'PASS' },
    review_summary: { status: 'PASS', unresolved_count: 0 },
    runtime_verification: { status: 'PASS' },
    canary_observation: {
      evidence_classes: ['runtime_compatibility','quality','review'],
      observation_ref: 'canary:obs:1'
    },
    blockers: [],
    evidence_sufficiency: 'SUFFICIENT',
    decision: 'PROMOTE',
    actor: 'release-controller',
    approver: 'release-policy',
    created_at: '2026-09-28T00:00:00Z',
    ...overrides
  };
}

test('content release constructor is immutable and hash-stable', async () => {
  const { createContentRelease } = await import('../src/platform-kernel/release/releases.js');
  const base = {
    release_id: 'rel1',
    track_id: 'sdaia-ai-engineer',
    status: 'DRAFT',
    item_version_ids: ['b', 'a'],
    source_policy_version: 's1',
    quality_policy_version: 'q1',
    review_policy_version: 'r1',
    exam_profile_id: 'p1',
    exam_profile_version: '1',
    created_at: '2026-09-27T00:00:00Z'
  };
  const a = createContentRelease(base);
  const b = createContentRelease({ ...base, item_version_ids: ['a', 'b'] });
  assert.deepEqual(a.item_version_ids, ['a', 'b']);
  assert.equal(a.content_hash, b.content_hash);
  const c = createContentRelease({ ...base, item_version_ids: ['a', 'c'] });
  assert.notEqual(a.content_hash, c.content_hash);
  assert.equal(Object.isFrozen(a), true);
});

test('release lifecycle requires CANARY before ACTIVE and evaluator-trusted K2 activation evidence', async () => {
  const { transitionContentRelease } = await import('../src/platform-kernel/release/releases.js');
  const { evaluateActivationEvidence } = await import('../src/platform-kernel/release/activationEvidence.js');
  const draft = { release_id: 'r', status: 'DRAFT' };
  assert.throws(() => transitionContentRelease(draft, 'activate'), /Invalid release transition/);

  let r = transitionContentRelease(draft, 'develop');
  r = transitionContentRelease(r, 'submit_review');
  r = transitionContentRelease(r, 'canary');
  assert.equal(r.status, 'CANARY');

  assert.throws(
    () => transitionContentRelease(r, 'activate', { activation_evidence: 'quality:pass' }),
    /structured|evaluat|ActivationEvidence/i
  );

  const evidence = activationEvidence();
  assert.throws(
    () => transitionContentRelease(r, 'activate', { activation_evidence: evidence }),
    /evaluat|trusted/i
  );

  const evaluation = evaluateActivationEvidence(evidence, canaryPolicy);
  assert.equal(evaluation.decision, 'PROMOTE');

  r = transitionContentRelease(r, 'activate', {
    activation_evidence: evidence,
    activation_evaluation: evaluation
  });
  assert.equal(r.status, 'ACTIVE');
});

test('release lifecycle rejects forged PROMOTE metadata when evaluated evidence says HOLD', async () => {
  const { transitionContentRelease } = await import('../src/platform-kernel/release/releases.js');
  const { evaluateActivationEvidence } = await import('../src/platform-kernel/release/activationEvidence.js');
  const r = { release_id: 'r', status: 'CANARY' };
  const evidence = activationEvidence({
    evidence_sufficiency: 'INSUFFICIENT',
    decision: 'PROMOTE'
  });
  const evaluation = evaluateActivationEvidence(evidence, canaryPolicy);
  assert.equal(evaluation.decision, 'HOLD');
  assert.throws(
    () => transitionContentRelease(r, 'activate', {
      activation_evidence: evidence,
      activation_evaluation: evaluation
    }),
    /PROMOTE/i
  );
});

test('grandfathered migrated release may use legacy string activation evidence only when explicitly identified', async () => {
  const { transitionContentRelease } = await import('../src/platform-kernel/release/releases.js');
  let r = { release_id: 'legacy-r', status: 'REVIEW', origin: 'migrated-grandfathered' };
  r = transitionContentRelease(r, 'canary');
  r = transitionContentRelease(r, 'activate', { activation_evidence: 'quality:pass' });
  assert.equal(r.status, 'ACTIVE');
});

test('content release constructor cannot bypass CANARY with an ACTIVE initial state', async () => {
  const { createContentRelease } = await import('../src/platform-kernel/release/releases.js');
  const base = {
    release_id: 'rel-active',
    track_id: 'sdaia-ai-engineer',
    status: 'ACTIVE',
    item_version_ids: ['i1'],
    source_policy_version: 's1',
    quality_policy_version: 'q1',
    review_policy_version: 'r1',
    exam_profile_id: 'p1',
    exam_profile_version: '1',
    created_at: '2026-09-27T00:00:00Z'
  };
  assert.throws(() => createContentRelease(base), /initial release status|CANARY|ACTIVE/i);
});
